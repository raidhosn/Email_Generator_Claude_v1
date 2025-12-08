// Email Generator AI Application

document.addEventListener('DOMContentLoaded', () => {
    const emailDraft = document.getElementById('emailDraft');
    const outputPreview = document.getElementById('outputPreview');
    const copyHtmlBtn = document.getElementById('copyHtmlBtn');
    const navButtons = document.querySelectorAll('.nav-btn');

    // Store current active button
    let activeButton = null;

    // Add click handlers to all navigation buttons
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const action = btn.dataset.action;
            handleAction(action, btn);
        });
    });

    // Copy as HTML handler
    copyHtmlBtn.addEventListener('click', () => {
        const content = outputPreview.innerHTML;
        if (content) {
            navigator.clipboard.writeText(content).then(() => {
                showToast('HTML copied to clipboard!');
            }).catch(() => {
                // Fallback: copy as text
                navigator.clipboard.writeText(outputPreview.innerText).then(() => {
                    showToast('Content copied to clipboard!');
                }).catch(() => {
                    showToast('Failed to copy. Please select and copy manually.');
                });
            });
        } else {
            showToast('No content to copy.');
        }
    });

    function handleAction(action, btn) {
        const text = emailDraft.value.trim();

        if (!text) {
            showToast('Please paste your email draft first.');
            return;
        }

        // Update active state
        navButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeButton = btn;

        // Show loading state
        btn.classList.add('loading');

        // Process based on action
        setTimeout(() => {
            let result;

            switch (action) {
                case 'table-format':
                    result = formatAsTable(text);
                    break;
                case 'en-proofread':
                    result = proofreadEnglish(text);
                    break;
                case 'pt-proofread':
                    result = proofreadPortuguese(text);
                    break;
                case 'translate':
                    result = translateText(text);
                    break;
                case 'case-title':
                    result = generateCaseTitle(text);
                    break;
                case 'case-notes':
                    result = generateCaseNotes(text);
                    break;
                case 'troubleshooting':
                    result = generateTroubleshooting(text);
                    break;
                default:
                    result = text;
            }

            outputPreview.innerHTML = result;
            btn.classList.remove('loading');
        }, 500);
    }

    // Table Format function - formats text into a structured table
    function formatAsTable(text) {
        const lines = text.split('\n').filter(line => line.trim());

        if (lines.length === 0) {
            return '<p>No content to format.</p>';
        }

        // Try to detect if content has key-value pairs or structured data
        const hasKeyValue = lines.some(line => line.includes(':') || line.includes('-'));

        if (hasKeyValue) {
            let tableHtml = '<table style="width: 100%; border-collapse: collapse; margin: 10px 0;">';
            tableHtml += '<thead><tr style="background: rgba(77, 166, 255, 0.1);">';
            tableHtml += '<th style="border: 1px solid rgba(100, 140, 180, 0.3); padding: 10px; text-align: left;">Field</th>';
            tableHtml += '<th style="border: 1px solid rgba(100, 140, 180, 0.3); padding: 10px; text-align: left;">Value</th>';
            tableHtml += '</tr></thead><tbody>';

            lines.forEach(line => {
                let [key, ...valueParts] = line.split(/[:|-]/);
                let value = valueParts.join(':').trim() || '-';
                key = key.trim();

                if (key) {
                    tableHtml += '<tr>';
                    tableHtml += `<td style="border: 1px solid rgba(100, 140, 180, 0.3); padding: 10px; font-weight: 500;">${escapeHtml(key)}</td>`;
                    tableHtml += `<td style="border: 1px solid rgba(100, 140, 180, 0.3); padding: 10px;">${escapeHtml(value)}</td>`;
                    tableHtml += '</tr>';
                }
            });

            tableHtml += '</tbody></table>';
            return tableHtml;
        } else {
            // Format as a simple list table
            let tableHtml = '<table style="width: 100%; border-collapse: collapse; margin: 10px 0;">';
            tableHtml += '<thead><tr style="background: rgba(77, 166, 255, 0.1);">';
            tableHtml += '<th style="border: 1px solid rgba(100, 140, 180, 0.3); padding: 10px; text-align: left;">#</th>';
            tableHtml += '<th style="border: 1px solid rgba(100, 140, 180, 0.3); padding: 10px; text-align: left;">Content</th>';
            tableHtml += '</tr></thead><tbody>';

            lines.forEach((line, index) => {
                tableHtml += '<tr>';
                tableHtml += `<td style="border: 1px solid rgba(100, 140, 180, 0.3); padding: 10px; font-weight: 500;">${index + 1}</td>`;
                tableHtml += `<td style="border: 1px solid rgba(100, 140, 180, 0.3); padding: 10px;">${escapeHtml(line.trim())}</td>`;
                tableHtml += '</tr>';
            });

            tableHtml += '</tbody></table>';
            return tableHtml;
        }
    }

    // English proofreading function
    function proofreadEnglish(text) {
        // Basic proofreading improvements
        let proofread = text
            // Capitalize first letter of sentences
            .replace(/(^|[.!?]\s+)([a-z])/g, (match, p1, p2) => p1 + p2.toUpperCase())
            // Fix common typos
            .replace(/\bi\b/g, 'I')
            .replace(/\bdont\b/gi, "don't")
            .replace(/\bcant\b/gi, "can't")
            .replace(/\bwont\b/gi, "won't")
            .replace(/\bim\b/gi, "I'm")
            .replace(/\byoure\b/gi, "you're")
            .replace(/\btheyre\b/gi, "they're")
            .replace(/\bwere\b/gi, "we're")
            // Fix double spaces
            .replace(/\s{2,}/g, ' ')
            // Trim lines
            .split('\n').map(line => line.trim()).join('\n');

        return `<div style="white-space: pre-wrap;">${escapeHtml(proofread)}</div>`;
    }

    // Portuguese proofreading function
    function proofreadPortuguese(text) {
        // Basic Portuguese proofreading improvements
        let proofread = text
            // Capitalize first letter of sentences
            .replace(/(^|[.!?]\s+)([a-z])/g, (match, p1, p2) => p1 + p2.toUpperCase())
            // Fix double spaces
            .replace(/\s{2,}/g, ' ')
            // Trim lines
            .split('\n').map(line => line.trim()).join('\n');

        return `<div style="white-space: pre-wrap;">${escapeHtml(proofread)}</div>`;
    }

    // Translation function (placeholder - would need actual translation API)
    function translateText(text) {
        // This is a placeholder - in production, this would call a translation API
        return `<div style="white-space: pre-wrap;">
<strong>Translation Preview:</strong>

<em>Note: For accurate translation, please use a professional translation service.</em>

<strong>Original Text:</strong>
${escapeHtml(text)}

<strong>To translate:</strong>
- Copy the text above
- Use Google Translate, DeepL, or similar service
- Paste the translated result back here
</div>`;
    }

    // Generate case title function
    function generateCaseTitle(text) {
        // Extract key information for a case title
        const firstLine = text.split('\n')[0].trim();
        const words = firstLine.split(' ').slice(0, 10).join(' ');

        // Create a concise title
        let title = words.length > 50 ? words.substring(0, 50) + '...' : words;

        return `<div>
<strong>Suggested Case Title:</strong>
<div style="margin-top: 10px; padding: 15px; background: rgba(77, 166, 255, 0.1); border-radius: 8px; font-weight: 500;">
${escapeHtml(title)}
</div>
</div>`;
    }

    // Generate case notes function
    function generateCaseNotes(text) {
        const lines = text.split('\n').filter(line => line.trim());

        let notes = '<div><strong>Case Notes:</strong><ul style="margin-top: 10px; padding-left: 20px;">';

        lines.forEach(line => {
            notes += `<li style="margin: 5px 0;">${escapeHtml(line.trim())}</li>`;
        });

        notes += '</ul></div>';

        return notes;
    }

    // Generate troubleshooting steps function
    function generateTroubleshooting(text) {
        const lines = text.split('\n').filter(line => line.trim());

        let steps = '<div><strong>Troubleshooting Steps:</strong><ol style="margin-top: 10px; padding-left: 20px;">';

        lines.forEach(line => {
            steps += `<li style="margin: 8px 0;">${escapeHtml(line.trim())}</li>`;
        });

        steps += '</ol></div>';

        return steps;
    }

    // Utility function to escape HTML
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Toast notification function
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
