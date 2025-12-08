// Email Generator Application

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('emailForm');
    const generateBtn = document.getElementById('generateBtn');
    const outputSection = document.getElementById('outputSection');
    const emailOutput = document.getElementById('emailOutput');
    const copyBtn = document.getElementById('copyBtn');
    const regenerateBtn = document.getElementById('regenerateBtn');

    // Store current form data for regeneration
    let currentFormData = null;

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
