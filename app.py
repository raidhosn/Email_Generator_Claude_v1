from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

# Email templates
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
        "closing": "Sincerely,\n{sender}"
    }
}

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/generate', methods=['POST'])
def generate_email():
    data = request.json

    tone = data.get('tone', 'professional')
    recipient = data.get('recipient', 'Recipient')
    sender = data.get('sender', 'Sender')
    subject = data.get('subject', '')
    body = data.get('body', '')

    template = EMAIL_TEMPLATES.get(tone, EMAIL_TEMPLATES['professional'])

    greeting = template['greeting'].format(recipient=recipient)
    closing = template['closing'].format(sender=sender)

    generated_email = f"""Subject: {subject}

{greeting}

{body}

{closing}"""

    return jsonify({
        'success': True,
        'email': generated_email
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080, debug=True)
