// DOM Elements
const emailInput = document.getElementById('email-input');
const emailOutput = document.getElementById('email-output');
const clearBtn = document.getElementById('clear-btn');
const copyInputBtn = document.getElementById('copy-input-btn');
const copyOutputBtn = document.getElementById('copy-output-btn');
const actionButtons = document.querySelectorAll('.action-btn');
const loadingOverlay = document.getElementById('loading');

// Action handlers - these can be connected to Claude API later
const actions = {
    'proofread': {
        name: 'Proofread',
        prompt: 'Please proofread the following email for grammar, spelling, and punctuation errors. Correct any mistakes and improve clarity while maintaining the original tone and meaning:\n\n'
    },
    'translate': {
        name: 'Translate',
        prompt: 'Please translate the following email to English (if not in English) or to the target language specified. Maintain the professional tone:\n\n'
    },
    'table-format': {
        name: 'Table Format',
        prompt: 'Please format the information in the following email into a clear, organized table format where applicable:\n\n'
    },
    'proofread-pt': {
        name: 'Proofread (Portuguese)',
        prompt: 'Por favor, revise o seguinte e-mail em português, corrigindo erros de gramática, ortografia e pontuação. Melhore a clareza mantendo o tom original:\n\n'
    },
    'summarize': {
        name: 'Summarize',
        prompt: 'Please summarize the key points of the following email in a concise format:\n\n'
    }
};

// Show toast notification
function showToast(message) {
    // Remove existing toast if any
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 10);

    // Remove after 2 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}

// Copy text to clipboard
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        showToast('Copied to clipboard!');
    } catch (err) {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast('Copied to clipboard!');
    }
}

// Show loading state
function showLoading() {
    loadingOverlay.classList.add('show');
}

// Hide loading state
function hideLoading() {
    loadingOverlay.classList.remove('show');
}

// Process email with selected action
async function processEmail(action) {
    const inputText = emailInput.value.trim();

    if (!inputText) {
        showToast('Please paste an email first');
        return;
    }

    const actionConfig = actions[action];
    if (!actionConfig) {
        showToast('Unknown action');
        return;
    }

    // Update active button state
    actionButtons.forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.querySelector(`[data-action="${action}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }

    showLoading();

    try {
        // Here you can integrate with Claude API
        // For now, we'll simulate processing
        const result = await simulateProcessing(action, inputText);
        emailOutput.value = result;
        showToast(`${actionConfig.name} completed!`);
    } catch (error) {
        showToast('Error processing email');
        console.error(error);
    } finally {
        hideLoading();
    }
}

// Simulate processing (replace with actual API call)
async function simulateProcessing(action, text) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const actionConfig = actions[action];

    // For demo purposes, return formatted output
    // In production, this would call Claude API
    const timestamp = new Date().toLocaleTimeString();

    return `[${actionConfig.name} - ${timestamp}]\n\n${text}\n\n---\nNote: Connect to Claude API for actual processing.`;
}

// Event Listeners

// Clear button
clearBtn.addEventListener('click', () => {
    emailInput.value = '';
    emailOutput.value = '';
    actionButtons.forEach(btn => btn.classList.remove('active'));
    showToast('Cleared');
});

// Copy input button
copyInputBtn.addEventListener('click', () => {
    if (emailInput.value) {
        copyToClipboard(emailInput.value);
    } else {
        showToast('Nothing to copy');
    }
});

// Copy output button
copyOutputBtn.addEventListener('click', () => {
    if (emailOutput.value) {
        copyToClipboard(emailOutput.value);
    } else {
        showToast('Nothing to copy');
    }
});

// Action buttons
actionButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        processEmail(action);
    });
});

// Keyboard shortcuts (1-5)
document.addEventListener('keydown', (e) => {
    // Don't trigger if typing in textarea
    if (document.activeElement === emailInput) {
        return;
    }

    const key = e.key;
    if (key >= '1' && key <= '5') {
        const btn = document.querySelector(`[data-key="${key}"]`);
        if (btn) {
            btn.click();
        }
    }
});

// Allow paste with Ctrl+V even when focused elsewhere
document.addEventListener('paste', (e) => {
    if (document.activeElement !== emailInput && document.activeElement !== emailOutput) {
        e.preventDefault();
        const text = e.clipboardData.getData('text');
        emailInput.value = text;
        emailInput.focus();
        showToast('Email pasted');
    }
});
