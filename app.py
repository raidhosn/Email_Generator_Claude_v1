from flask import Flask, render_template, request, jsonify
import os

app = Flask(__name__)

# Sample email templates
EMAIL_TEMPLATES = {
    "professional": {
        "greeting": "Dear {recipient},",
        "closing": "Best regards,\n{sender}"
    },
    "casual": {
        "greeting": "Hi {recipient},",
        "closing": "Cheers,\n{sender}"
    },
    "formal": {
        "greeting": "Dear Mr./Ms. {recipient},",
        "closing": "Sincerely yours,\n{sender}"
    }
}

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/generate', methods=['POST'])
def generate_email():
    data = request.json

    recipient = data.get('recipient', 'Recipient')
    sender = data.get('sender', 'Sender')
    subject = data.get('subject', '')
    tone = data.get('tone', 'professional')
    purpose = data.get('purpose', '')
    key_points = data.get('key_points', '')

    template = EMAIL_TEMPLATES.get(tone, EMAIL_TEMPLATES['professional'])

    # Generate email content
    greeting = template['greeting'].format(recipient=recipient)
    closing = template['closing'].format(sender=sender)

    # Build the email body based on purpose and key points
    body_parts = []

    if purpose:
        purpose_intros = {
            "introduction": "I am writing to introduce myself and",
            "follow-up": "I am following up on our previous conversation regarding",
            "request": "I am reaching out to request",
            "thank-you": "I wanted to express my sincere gratitude for",
            "inquiry": "I am writing to inquire about",
            "proposal": "I would like to propose",
            "complaint": "I am writing to bring to your attention",
            "invitation": "I would like to cordially invite you to"
        }
        intro = purpose_intros.get(purpose, "I am writing regarding")
        body_parts.append(f"{intro} {subject.lower() if subject else 'this matter'}.")

    if key_points:
        points = [p.strip() for p in key_points.split('\n') if p.strip()]
        if points:
            body_parts.append("\nKey points I'd like to address:")
            for point in points:
                body_parts.append(f"  • {point}")

    body_parts.append("\nI look forward to hearing from you at your earliest convenience.")

    body = '\n'.join(body_parts)

    email = f"""Subject: {subject}

{greeting}

{body}

{closing}"""

    return jsonify({
        'success': True,
        'email': email
    })

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
