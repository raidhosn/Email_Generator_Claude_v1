import { useMemo, useState } from "react";

/**
 * Email Generator AI (Front-end MVP)
 * - Paste rough email
 * - Click action buttons to build a processing pipeline
 * - Generate a final email preview
 * - Copy output as HTML
 *
 * Notes:
 * - This is a UI+workflow skeleton. Replace `callYourLLM()` with your backend/API.
 * - Buttons are configurable. Add/remove actions in ACTIONS.
 */

type ActionId =
  | "table_format"
  | "en_proofread"
  | "pt_proofread"
  | "en_pt_translate"
  | "case_title"
  | "case_notes"
  | "troubleshooting";

type Action = {
  id: ActionId;
  labelTop: string;
  labelBottom: string;
  emoji?: string;
  description: string;
  // systemPrompt is sent as the system message (not shown to user in output)
  systemPrompt: string;
  // userPromptTemplate generates the user message from input
  userPromptTemplate: (input: string, ctx: GeneratorContext) => string;
};

type GeneratorContext = {
  tone: "professional" | "friendly" | "concise";
  languageOutput: "EN" | "PT" | "Bilingual";
  includeReferences: boolean;
  customerName?: string;
  caseNumber?: string;
};

const ACTIONS: Action[] = [
  {
    id: "table_format",
    labelTop: "Table",
    labelBottom: "Format",
    description: "Convert pasted data into a clean, readable table format.",
    systemPrompt: `You are a formatting assistant.
Task: Convert any tabular data in the email into a clean table.
Rules:
- Preserve meaning and values.
- Use a simple markdown table with clear headers.
- If no table-like content exists, return the original text unchanged.
- Return ONLY the formatted result, no explanations or commentary.`,
    userPromptTemplate: (input) => `<input>\n${input}\n</input>`,
  },
  {
    id: "en_proofread",
    labelTop: "EN",
    labelBottom: "Proofread",
    description: "Improve English grammar, clarity, and professional tone.",
    systemPrompt: `Act as a perfectionist, meticulous proofreader and senior editor with mastery of English. Clarify complex ideas without changing the author's intended meaning, facts, or voice.

Non-negotiable rules:
1. Preserve meaning, intent, and voice. Do not add new claims, facts, examples, or opinions.
2. Default to American English unless the draft consistently uses another variety.
3. Keep all placeholders unchanged: [TK], [TBD], {{variable}}, <PLACEHOLDER>.
4. Keep all quotations and citations exactly as written.
5. If the draft contains code, commands, or configurations, do not change their semantics.
6. Maintain existing structure and formatting (headings, bullets, tables).
7. Improve clarity, flow, grammar, punctuation, consistency, and concision. Remove redundancy and filler.
8. Standardize style consistently (capitalization, hyphenation, numbering, list punctuation).

Output requirement (critical):
Return ONLY the fully revised, publication-ready text.
Do NOT include commentary, explanations, labels, or preambles.
If no edits are needed, return the original unchanged.`,
    userPromptTemplate: (input) => `<input>\n${input}\n</input>`,
  },
  {
    id: "pt_proofread",
    labelTop: "PT",
    labelBottom: "Proofread",
    description: "Improve Brazilian Portuguese grammar, clarity, and professional tone.",
    systemPrompt: `Você é um Engenheiro de Suporte da Microsoft redigindo e-mails prontos para o cliente.
Tarefa: Revisar e reescrever o e-mail em português do Brasil.
Requisitos:
- Manter a intenção original.
- Usar parágrafos curtos.
- Não inventar fatos. Se algo for desconhecido, manter como placeholder entre colchetes.
- Retorne APENAS o texto revisado, sem comentários ou explicações.`,
    userPromptTemplate: (input, ctx) => `Tom: ${ctx.tone}\n\n<input>\n${input}\n</input>`,
  },
  {
    id: "en_pt_translate",
    labelTop: "EN ↔ PT",
    labelBottom: "Translator",
    description: "Translate to or from Portuguese, keeping formatting and tone.",
    systemPrompt: `You are a bilingual (English + Portuguese Brazil) support communications assistant.
Task: Translate the email as requested.
Rules:
- Preserve meaning and technical terms.
- Keep paragraph structure.
- If the input is English, output Portuguese (pt-BR). If the input is Portuguese, output English.
- Return ONLY the translated text, no explanations or commentary.`,
    userPromptTemplate: (input, ctx) => `Target tone: ${ctx.tone}\n\n<input>\n${input}\n</input>`,
  },
  {
    id: "case_title",
    labelTop: "Case",
    labelBottom: "Title",
    description: "Generate an Azure support case title from the email content.",
    systemPrompt: `You are an Azure Support Engineer.
Task: Create a concise case title based on the email content.
Rules:
- Use the pattern: Request to increase <SKUs> vCPU quotas to <number> cores in the <Region> region | <Region>
- If key details are missing (SKU, number, region), use placeholders like <SKU>.
- Return ONLY the case title, no explanations or commentary.`,
    userPromptTemplate: (input) => `<input>\n${input}\n</input>`,
  },
  {
    id: "case_notes",
    labelTop: "Case",
    labelBottom: "Notes",
    description: "Generate CRM-safe case notes in a consistent template.",
    systemPrompt: `You are an Azure Support Engineer.
Task: Produce CRM-safe case notes from the email content.
Format (plain text only):
Case Update
Case Notes: <brief case title or topic>

Actions Taken:
✅ <one-line action 1>
✅ <one-line action 2>

Next Steps:
🔹 <one-line next step 1>
🔸 Information needed: <specific item> (if applicable)

Rules:
- Each bullet is a single sentence, 12–24 words.
- No Markdown.
- Use English only.
- Return ONLY the case notes in the format above, no explanations.`,
    userPromptTemplate: (input) => `<input>\n${input}\n</input>`,
  },
  {
    id: "troubleshooting",
    labelTop: "Trouble",
    labelBottom: "shooting",
    description: "Turn the request into a structured troubleshooting plan.",
    systemPrompt: `You are an Azure Support Engineer.
Task: Convert the email into a structured troubleshooting plan.
Include:
- Pre-action checklist
- Initial assessment
- Data to collect
- Portal validation steps
- CLI/PowerShell commands
- Decision points and next steps
Constraints:
- Do not invent customer data.
- Use placeholders for missing details.
- Return ONLY the troubleshooting plan, no explanations or commentary.`,
    userPromptTemplate: (input) => `<input>\n${input}\n</input>`,
  },
];

function clampText(text: string, max = 50000) {
  if (!text) return "";
  if (text.length <= max) return text;
  return text.slice(0, max) + "\n\n[Truncated for safety. Reduce input length.]";
}

// API configuration - set your API key here or via environment variable
const ANTHROPIC_API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY || "";

async function callClaudeAPI(systemPrompt: string, userMessage: string): Promise<string> {
  if (!ANTHROPIC_API_KEY) {
    throw new Error(
      "API key not configured. Set VITE_ANTHROPIC_API_KEY in your .env file."
    );
  }

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: userMessage,
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message || `API request failed: ${response.status}`
    );
  }

  const data = await response.json();

  // Extract only the assistant's text response
  const textContent = data.content?.find(
    (block: { type: string }) => block.type === "text"
  );

  if (!textContent?.text) {
    throw new Error("No text response received from API");
  }

  return textContent.text;
}

function toSimpleHtml(text: string) {
  // Minimal safe HTML for email previews.
  // If you want richer output, generate HTML from the LLM instead.
  const escaped = text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");

  return escaped
    .split(/\n{2,}/)
    .map((p: string) => `<p style="margin:0 0 12px 0;">${p.replaceAll("\n", "<br/>")}</p>`)
    .join("");
}

export default function EmailGeneratorAI() {
  const [draft, setDraft] = useState<string>("");
  const [output, setOutput] = useState<string>("");
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string>("");

  const [ctx, setCtx] = useState<GeneratorContext>({
    tone: "professional",
    languageOutput: "EN",
    includeReferences: true,
    customerName: "",
    caseNumber: "",
  });

  const [selected, setSelected] = useState<ActionId[]>([]);

  const selectedActions = useMemo(
    () => selected.map((id) => ACTIONS.find((a) => a.id === id)!).filter(Boolean),
    [selected]
  );

  function toggleAction(id: ActionId) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function clearAll() {
    setSelected([]);
    setOutput("");
    setError("");
  }

  async function runPipeline() {
    setIsRunning(true);
    setError("");

    try {
      let current = clampText(draft);
      if (!current.trim()) {
        setOutput("Please paste an email draft first.");
        return;
      }

      if (selectedActions.length === 0) {
        setOutput("Select at least one action button, then click Generate.");
        return;
      }

      for (const action of selectedActions) {
        // System prompt contains instructions (not shown in output)
        // User message contains only the draft text wrapped in XML tags
        const userMessage = action.userPromptTemplate(current, ctx);
        const next = await callClaudeAPI(action.systemPrompt, userMessage);
        current = next;
      }

      setOutput(current);
    } catch (e: unknown) {
      const err = e as Error;
      setError(err?.message ?? "Unexpected error.");
    } finally {
      setIsRunning(false);
    }
  }

  async function copyAsHtml() {
    const html = toSimpleHtml(output || "");
    await navigator.clipboard.writeText(html);
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <h1 className="text-center text-4xl font-semibold tracking-tight">Email Generator AI</h1>

        <div className="mt-8 rounded-3xl border border-slate-800/70 bg-slate-950/40 p-6 shadow-xl">
          <div className="flex flex-col gap-6">
            <div>
              <div className="text-sm font-semibold tracking-wide text-slate-300">PASTE EMAIL DRAFT</div>
              <textarea
                className="mt-3 h-44 w-full resize-none rounded-2xl border border-slate-800/70 bg-slate-950/40 p-4 text-sm leading-6 outline-none focus:border-slate-600"
                placeholder="Paste your rough email text here.."
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-slate-800/70 bg-slate-950/40 p-4">
                <div className="text-xs font-semibold text-slate-300">Tone</div>
                <div className="mt-2 flex gap-2">
                  {(["professional", "friendly", "concise"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setCtx((p) => ({ ...p, tone: t }))}
                      className={`rounded-xl px-3 py-2 text-xs font-semibold transition ${
                        ctx.tone === t ? "bg-slate-200 text-slate-950" : "bg-slate-900/60 text-slate-200 hover:bg-slate-800"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800/70 bg-slate-950/40 p-4">
                <div className="text-xs font-semibold text-slate-300">Output language</div>
                <div className="mt-2 flex gap-2">
                  {(["EN", "PT", "Bilingual"] as const).map((l) => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => setCtx((p) => ({ ...p, languageOutput: l }))}
                      className={`rounded-xl px-3 py-2 text-xs font-semibold transition ${
                        ctx.languageOutput === l
                          ? "bg-slate-200 text-slate-950"
                          : "bg-slate-900/60 text-slate-200 hover:bg-slate-800"
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800/70 bg-slate-950/40 p-4">
                <div className="text-xs font-semibold text-slate-300">Optional identifiers</div>
                <div className="mt-2 grid grid-cols-1 gap-2">
                  <input
                    className="w-full rounded-xl border border-slate-800/70 bg-slate-950/30 px-3 py-2 text-sm outline-none focus:border-slate-600"
                    placeholder="Customer name (optional)"
                    value={ctx.customerName ?? ""}
                    onChange={(e) => setCtx((p) => ({ ...p, customerName: e.target.value }))}
                  />
                  <input
                    className="w-full rounded-xl border border-slate-800/70 bg-slate-950/30 px-3 py-2 text-sm outline-none focus:border-slate-600"
                    placeholder="Case number (optional)"
                    value={ctx.caseNumber ?? ""}
                    onChange={(e) => setCtx((p) => ({ ...p, caseNumber: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            <div className="mt-2">
              <div className="text-sm font-semibold tracking-wide text-slate-300">ACTIONS</div>
              <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-7">
                {ACTIONS.map((a) => {
                  const active = selected.includes(a.id);
                  return (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => toggleAction(a.id)}
                      title={a.description}
                      className={`group flex h-20 flex-col items-center justify-center rounded-2xl border px-3 py-2 text-center transition ${
                        active
                          ? "border-slate-200 bg-slate-200 text-slate-950"
                          : "border-slate-800/70 bg-slate-950/30 text-slate-200 hover:bg-slate-900/60"
                      }`}
                    >
                      <div className="text-xs font-semibold tracking-wide">{a.labelTop}</div>
                      <div className="mt-1 text-xs font-semibold tracking-wide opacity-90">{a.labelBottom}</div>
                      <div className={`mt-2 h-1 w-10 rounded-full ${active ? "bg-slate-950/40" : "bg-slate-700/60"}`} />
                    </button>
                  );
                })}
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-300">
                <span className="font-semibold">Pipeline:</span>
                {selectedActions.length === 0 ? (
                  <span className="opacity-80">No actions selected.</span>
                ) : (
                  selectedActions.map((a, idx) => (
                    <span key={a.id} className="rounded-full border border-slate-800/70 bg-slate-950/30 px-3 py-1">
                      {idx + 1}. {a.labelTop} {a.labelBottom}
                    </span>
                  ))
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={runPipeline}
                  disabled={isRunning}
                  className="rounded-2xl bg-slate-200 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:opacity-90 disabled:opacity-50"
                >
                  {isRunning ? "Generating.." : "Generate"}
                </button>
                <button
                  type="button"
                  onClick={clearAll}
                  className="rounded-2xl border border-slate-800/70 bg-slate-950/30 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-slate-900/60"
                >
                  Clear
                </button>
              </div>

              <label className="flex select-none items-center gap-2 text-sm text-slate-200">
                <input
                  type="checkbox"
                  checked={ctx.includeReferences}
                  onChange={(e) => setCtx((p) => ({ ...p, includeReferences: e.target.checked }))}
                />
                Include references (if applicable)
              </label>
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-semibold tracking-wide text-slate-300">GENERATED RESULT (PREVIEW)</div>
                <button
                  type="button"
                  onClick={copyAsHtml}
                  className="rounded-xl bg-slate-200 px-4 py-2 text-xs font-semibold text-slate-950 transition hover:opacity-90"
                >
                  Copy as HTML
                </button>
              </div>

              {error ? (
                <div className="mt-3 rounded-2xl border border-red-500/30 bg-red-950/30 p-3 text-sm text-red-200">
                  {error}
                </div>
              ) : null}

              <textarea
                className="mt-3 h-56 w-full resize-none rounded-2xl border border-slate-800/70 bg-slate-950/40 p-4 text-sm leading-6 outline-none focus:border-slate-600"
                placeholder="Your final email will appear here.."
                value={output}
                onChange={(e) => setOutput(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="mt-6 text-xs text-slate-400">
          MVP guidance. For production, add an API route, store prompts server-side, add per-button parameters, and audit outputs.
        </div>
      </div>
    </div>
  );
}
