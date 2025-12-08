// Email Generator Application

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('emailForm');
    const generateBtn = document.getElementById('generateBtn');
    const outputSection = document.getElementById('outputSection');
    const emailOutput = document.getElementById('emailOutput');
    const copyBtn = document.getElementById('copyBtn');
    const regenerateBtn = document.getElementById('regenerateBtn');

    // Navigation buttons
    const emailDraft = document.getElementById('emailDraft');
    const previewSection = document.getElementById('previewSection');
    const previewOutput = document.getElementById('previewOutput');
    const navButtons = document.querySelectorAll('.nav-btn');

    // Store current form data for regeneration
    let currentFormData = null;

    // Navigation button handlers
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            navButtons.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            btn.classList.add('active');

            // Get the draft text
            const draftText = emailDraft.value.trim();
            if (!draftText) {
                showToast('Please paste an email draft first.');
                btn.classList.remove('active');
                return;
            }

            // Process based on button ID
            const btnId = btn.id;
            let result = '';

            switch (btnId) {
                case 'tableFormatBtn':
                    result = formatAsTable(draftText);
                    break;
                case 'enProofreadBtn':
                    result = proofreadEnglish(draftText);
                    break;
                case 'ptProofreadBtn':
                    result = proofreadPortuguese(draftText);
                    break;
                case 'translatorBtn':
                    result = translateText(draftText);
                    break;
                case 'caseTitleBtn':
                    result = extractCaseTitle(draftText);
                    break;
                case 'caseNotesBtn':
                    result = extractCaseNotes(draftText);
                    break;
                case 'troubleshootingBtn':
                    result = analyzeTroubleshooting(draftText);
                    break;
                default:
                    result = draftText;
            }

            // Display result in preview section
            previewOutput.innerHTML = result;
            previewSection.classList.remove('hidden');
            previewSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });

    // Table Format function - formats text into a table structure
    function formatAsTable(text) {
        const lines = text.split('\n').filter(line => line.trim());

        if (lines.length === 0) {
            return '<p>No content to format.</p>';
        }

        // Detect if the text has key-value pairs (contains ":" or similar delimiters)
        const hasKeyValuePairs = lines.some(line => line.includes(':'));

        if (hasKeyValuePairs) {
            // Format as key-value table
            let tableHtml = '<table style="width: 100%; border-collapse: collapse; margin: 10px 0;">';
            tableHtml += '<thead><tr style="background: #5a67d8; color: white;"><th style="padding: 12px; border: 1px solid #e5e7eb; text-align: left;">Field</th><th style="padding: 12px; border: 1px solid #e5e7eb; text-align: left;">Value</th></tr></thead>';
            tableHtml += '<tbody>';

            lines.forEach((line, index) => {
                const bgColor = index % 2 === 0 ? '#ffffff' : '#f9fafb';
                const colonIndex = line.indexOf(':');
                if (colonIndex > -1) {
                    const key = line.substring(0, colonIndex).trim();
                    const value = line.substring(colonIndex + 1).trim();
                    tableHtml += `<tr style="background: ${bgColor};"><td style="padding: 10px; border: 1px solid #e5e7eb; font-weight: 600;">${escapeHtml(key)}</td><td style="padding: 10px; border: 1px solid #e5e7eb;">${escapeHtml(value)}</td></tr>`;
                } else {
                    tableHtml += `<tr style="background: ${bgColor};"><td colspan="2" style="padding: 10px; border: 1px solid #e5e7eb;">${escapeHtml(line)}</td></tr>`;
                }
            });

            tableHtml += '</tbody></table>';
            return tableHtml;
        } else {
            // Format as simple list table
            let tableHtml = '<table style="width: 100%; border-collapse: collapse; margin: 10px 0;">';
            tableHtml += '<thead><tr style="background: #5a67d8; color: white;"><th style="padding: 12px; border: 1px solid #e5e7eb; text-align: left;">#</th><th style="padding: 12px; border: 1px solid #e5e7eb; text-align: left;">Content</th></tr></thead>';
            tableHtml += '<tbody>';

            lines.forEach((line, index) => {
                const bgColor = index % 2 === 0 ? '#ffffff' : '#f9fafb';
                tableHtml += `<tr style="background: ${bgColor};"><td style="padding: 10px; border: 1px solid #e5e7eb; width: 50px; text-align: center;">${index + 1}</td><td style="padding: 10px; border: 1px solid #e5e7eb;">${escapeHtml(line)}</td></tr>`;
            });

            tableHtml += '</tbody></table>';
            return tableHtml;
        }
    }

    // Helper function to escape HTML
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // EN Proofread function - highlights potential issues in English text
    function proofreadEnglish(text) {
        let result = `<div style="margin-bottom: 15px;"><strong>English Proofread Analysis:</strong></div>`;
        result += `<div style="background: #f9fafb; padding: 15px; border-radius: 8px; line-height: 1.8;">${escapeHtml(text)}</div>`;
        result += `<div style="margin-top: 15px; padding: 10px; background: #e8f5e9; border-radius: 6px;"><strong>Tip:</strong> Review for grammar, punctuation, and clarity.</div>`;
        return result;
    }

    // PT Proofread function - highlights potential issues in Portuguese text
    function proofreadPortuguese(text) {
        let result = `<div style="margin-bottom: 15px;"><strong>Portuguese Proofread Analysis:</strong></div>`;
        result += `<div style="background: #f9fafb; padding: 15px; border-radius: 8px; line-height: 1.8;">${escapeHtml(text)}</div>`;
        result += `<div style="margin-top: 15px; padding: 10px; background: #fff3e0; border-radius: 6px;"><strong>Dica:</strong> Revise gramática, pontuação e clareza.</div>`;
        return result;
    }

    // Translator function - prepares text for translation
    function translateText(text) {
        let result = `<div style="margin-bottom: 15px;"><strong>EN ↔ PT Translation Preview:</strong></div>`;
        result += `<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">`;
        result += `<div style="background: #e3f2fd; padding: 15px; border-radius: 8px;"><strong>Original:</strong><br><br>${escapeHtml(text)}</div>`;
        result += `<div style="background: #fce4ec; padding: 15px; border-radius: 8px;"><strong>Translation:</strong><br><br><em>[Translation will appear here]</em></div>`;
        result += `</div>`;
        return result;
    }

    // Case Title function - extracts potential case title
    function extractCaseTitle(text) {
        const lines = text.split('\n').filter(line => line.trim());
        const potentialTitle = lines[0] || 'No title found';
        let result = `<div style="margin-bottom: 15px;"><strong>Extracted Case Title:</strong></div>`;
        result += `<div style="background: #5a67d8; color: white; padding: 20px; border-radius: 8px; font-size: 1.2rem; text-align: center;">${escapeHtml(potentialTitle)}</div>`;
        return result;
    }

    // Case Notes function - formats text as case notes
    function extractCaseNotes(text) {
        const lines = text.split('\n').filter(line => line.trim());
        let result = `<div style="margin-bottom: 15px;"><strong>Case Notes:</strong></div>`;
        result += `<div style="background: #fffde7; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107;">`;
        lines.forEach(line => {
            result += `<p style="margin: 8px 0;">• ${escapeHtml(line)}</p>`;
        });
        result += `</div>`;
        return result;
    }

    // Troubleshooting function - analyzes text for troubleshooting steps
    function analyzeTroubleshooting(text) {
        const lines = text.split('\n').filter(line => line.trim());
        let result = `<div style="margin-bottom: 15px;"><strong>Troubleshooting Analysis:</strong></div>`;
        result += `<div style="background: #ffebee; padding: 15px; border-radius: 8px;">`;
        lines.forEach((line, index) => {
            result += `<div style="display: flex; align-items: flex-start; margin: 10px 0;">`;
            result += `<span style="background: #5a67d8; color: white; min-width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 12px; font-weight: 600;">${index + 1}</span>`;
            result += `<span style="padding-top: 4px;">${escapeHtml(line)}</span>`;
            result += `</div>`;
        });
        result += `</div>`;
        return result;
    }

    // Form submission handler
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        generateEmail();
    });

    // Regenerate button handler
    regenerateBtn.addEventListener('click', () => {
        if (currentFormData) {
            generateEmailFromData(currentFormData);
        }
    });

    // Copy to clipboard handler
    copyBtn.addEventListener('click', () => {
        const emailText = emailOutput.innerText;
        navigator.clipboard.writeText(emailText).then(() => {
            showToast('Email copied to clipboard!');
        }).catch(() => {
            showToast('Failed to copy. Please select and copy manually.');
        });
    });

    function generateEmail() {
        // Get form values
        currentFormData = {
            emailType: document.getElementById('emailType').value,
            tone: document.getElementById('tone').value,
            recipient: document.getElementById('recipient').value,
            senderName: document.getElementById('senderName').value,
            subject: document.getElementById('subject').value,
            keyPoints: document.getElementById('keyPoints').value,
            additionalContext: document.getElementById('additionalContext').value
        };

        generateEmailFromData(currentFormData);
    }

    function generateEmailFromData(data) {
        // Show loading state
        generateBtn.disabled = true;
        generateBtn.textContent = 'Generating...';
        generateBtn.classList.add('loading');

        // Simulate generation delay for better UX
        setTimeout(() => {
            const email = constructEmail(data);

            // Display the generated email
            emailOutput.textContent = email;
            outputSection.classList.remove('hidden');

            // Scroll to output
            outputSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

            // Reset button state
            generateBtn.disabled = false;
            generateBtn.textContent = 'Generate Email';
            generateBtn.classList.remove('loading');
        }, 800);
    }

    function constructEmail(data) {
        const { emailType, tone, recipient, senderName, subject, keyPoints, additionalContext } = data;

        // Get greeting based on tone
        const greeting = getGreeting(tone, recipient);

        // Get opening based on email type and tone
        const opening = getOpening(emailType, tone);

        // Format key points into body paragraphs
        const body = formatBody(keyPoints, emailType, tone);

        // Add additional context if provided
        const contextParagraph = additionalContext ? `\n${additionalContext}\n` : '';

        // Get closing based on tone
        const closing = getClosing(tone, emailType);

        // Get sign-off based on tone
        const signOff = getSignOff(tone);

        // Construct the full email
        const email = `Subject: ${subject}

${greeting}

${opening}

${body}${contextParagraph}
${closing}

${signOff}
${senderName}`;

        return email;
    }

    function getGreeting(tone, recipient) {
        const greetings = {
            formal: `Dear ${recipient},`,
            'semi-formal': `Hello ${recipient},`,
            friendly: `Hi ${recipient}!`,
            urgent: `Dear ${recipient},`,
            apologetic: `Dear ${recipient},`
        };
        return greetings[tone] || `Dear ${recipient},`;
    }

    function getOpening(emailType, tone) {
        const openings = {
            professional: {
                formal: "I hope this email finds you well.",
                'semi-formal': "I hope you're doing well.",
                friendly: "Hope you're having a great day!",
                urgent: "I am writing to you regarding an urgent matter.",
                apologetic: "I hope this message finds you well."
            },
            'follow-up': {
                formal: "I am writing to follow up on our previous correspondence.",
                'semi-formal': "I wanted to follow up on our recent conversation.",
                friendly: "Just checking in on our last chat!",
                urgent: "I am following up urgently on our previous discussion.",
                apologetic: "I wanted to follow up and ensure everything is in order."
            },
            'thank-you': {
                formal: "I am writing to express my sincere gratitude.",
                'semi-formal': "I wanted to take a moment to thank you.",
                friendly: "I just had to reach out to say thank you!",
                urgent: "I wanted to immediately express my thanks.",
                apologetic: "I am writing to express my heartfelt thanks."
            },
            introduction: {
                formal: "I am writing to introduce myself and my professional background.",
                'semi-formal': "I wanted to take a moment to introduce myself.",
                friendly: "I thought it was time we got acquainted!",
                urgent: "I am reaching out to introduce myself regarding a time-sensitive matter.",
                apologetic: "Please allow me to introduce myself."
            },
            apology: {
                formal: "I am writing to sincerely apologize for any inconvenience caused.",
                'semi-formal': "I wanted to reach out and apologize.",
                friendly: "I owe you an apology, and I wanted to address this directly.",
                urgent: "I must immediately apologize for the situation that has arisen.",
                apologetic: "Please accept my sincere apologies."
            },
            request: {
                formal: "I am writing to formally request your assistance.",
                'semi-formal': "I was hoping you could help me with something.",
                friendly: "I have a favor to ask!",
                urgent: "I am urgently requesting your assistance with a pressing matter.",
                apologetic: "I hope I'm not imposing, but I have a request."
            },
            invitation: {
                formal: "I am pleased to extend an invitation to you.",
                'semi-formal': "I would like to invite you to an upcoming event.",
                friendly: "You're invited!",
                urgent: "I am writing with a time-sensitive invitation.",
                apologetic: "I hope the timing is appropriate, but I would like to invite you."
            },
            complaint: {
                formal: "I am writing to formally address a concern.",
                'semi-formal': "I need to bring an issue to your attention.",
                friendly: "I wanted to chat about something that's been on my mind.",
                urgent: "I must urgently bring a serious matter to your attention.",
                apologetic: "I regret having to write about this, but I need to address an issue."
            }
        };

        return openings[emailType]?.[tone] || openings.professional[tone] || "I hope this email finds you well.";
    }

    function formatBody(keyPoints, emailType, tone) {
        // Split key points by newlines or periods
        const points = keyPoints
            .split(/[\n\r]+/)
            .map(point => point.trim())
            .filter(point => point.length > 0);

        if (points.length === 0) {
            return keyPoints;
        }

        // Format based on tone
        let formattedBody = '';

        if (tone === 'formal' || tone === 'urgent') {
            // More structured for formal emails
            if (points.length === 1) {
                formattedBody = points[0];
            } else {
                formattedBody = 'I would like to address the following points:\n\n';
                points.forEach((point, index) => {
                    formattedBody += `${index + 1}. ${point}\n`;
                });
            }
        } else if (tone === 'friendly') {
            // More conversational for friendly emails
            formattedBody = points.join('\n\n');
        } else {
            // Default formatting
            formattedBody = points.join('\n\n');
        }

        return formattedBody;
    }

    function getClosing(tone, emailType) {
        const closings = {
            formal: "I appreciate your time and consideration. Please do not hesitate to contact me if you have any questions.",
            'semi-formal': "Please let me know if you have any questions or concerns.",
            friendly: "Let me know if there's anything else I can help with!",
            urgent: "I would greatly appreciate your prompt attention to this matter.",
            apologetic: "Once again, I sincerely apologize for any inconvenience this may have caused."
        };

        // Special closings for certain email types
        if (emailType === 'thank-you') {
            return tone === 'formal'
                ? "Your support is greatly appreciated."
                : "Thanks again for everything!";
        }

        return closings[tone] || closings['semi-formal'];
    }

    function getSignOff(tone) {
        const signOffs = {
            formal: "Sincerely,",
            'semi-formal': "Best regards,",
            friendly: "Cheers,",
            urgent: "Respectfully,",
            apologetic: "With sincere apologies,"
        };
        return signOffs[tone] || "Best regards,";
    }

    function showToast(message) {
        // Remove existing toast if any
        const existingToast = document.querySelector('.toast');
        if (existingToast) {
            existingToast.remove();
        }

        // Create and show new toast
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        document.body.appendChild(toast);

        // Remove toast after 3 seconds
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
});
