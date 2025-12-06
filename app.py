import os
from flask import Flask, render_template, request, jsonify
from anthropic import Anthropic
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))


def generate_email(email_type, tone, recipient, subject, key_points, additional_context=""):
    """Generate an email using Claude API."""

    prompt = f"""Generate a professional email with the following parameters:

Email Type: {email_type}
Tone: {tone}
Recipient: {recipient}
Subject: {subject}
Key Points to Include:
{key_points}

Additional Context: {additional_context if additional_context else "None"}

Please write a complete, ready-to-send email. Include an appropriate greeting and sign-off.
The email should be clear, concise, and match the requested tone.
Only output the email content, no additional explanations."""

    message = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=1024,
        messages=[
            {"role": "user", "content": prompt}
        ]
    )

    return message.content[0].text


@app.route("/")
def index():
    """Render the main page."""
    return render_template("index.html")


@app.route("/generate", methods=["POST"])
def generate():
    """Handle email generation requests."""
    try:
        data = request.json

        email_type = data.get("email_type", "General")
        tone = data.get("tone", "Professional")
        recipient = data.get("recipient", "")
        subject = data.get("subject", "")
        key_points = data.get("key_points", "")
        additional_context = data.get("additional_context", "")

        if not recipient or not subject or not key_points:
            return jsonify({"error": "Please fill in all required fields"}), 400

        generated_email = generate_email(
            email_type, tone, recipient, subject, key_points, additional_context
        )

        return jsonify({"email": generated_email})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
