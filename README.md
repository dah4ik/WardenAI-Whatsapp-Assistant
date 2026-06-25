# WardenAI WhatsApp Assistant

WardenAI WhatsApp Assistant is an AI-powered automation platform for WhatsApp Business communication.

The system is designed to receive incoming WhatsApp messages, check whether the sender is allowed to receive automated responses, generate an AI-based reply, and send or prepare the response according to configurable safety rules.

The project includes a backend API, an admin dashboard, contact management, conversation history, approval mode, and future integration with the official WhatsApp Business Cloud API.

## Main Idea

Many businesses and professionals receive repetitive WhatsApp messages every day.
WardenAI helps automate part of this communication while keeping control, security, and visibility in one dashboard.

The assistant does not reply to everyone automatically.
Each phone number can be managed separately, allowing the user to decide who can receive automatic AI replies and who should remain in manual mode.

## Key Features

* AI-powered WhatsApp auto-replies
* Contact whitelist and blacklist
* Per-contact auto-reply control
* Manual approval mode before sending messages
* Conversation history
* Admin dashboard
* Message logs and audit trail
* Safe reply rules
* Suspicious message detection
* Custom response style per contact
* Docker-based local development
* MongoDB database
* Redis queue support
* Future support for WhatsApp Business Cloud API

## Planned Architecture

```text
WhatsApp User
    ↓
WhatsApp Business Cloud API Webhook
    ↓
Backend API
    ↓
Contact Policy Engine
    ↓
AI Reply Engine
    ↓
Approval / Auto-Send Decision
    ↓
WhatsApp Message Sender
    ↓
Dashboard + Logs
```

## Tech Stack

### Backend

* Node.js
* TypeScript
* Express.js
* MongoDB
* Redis
* BullMQ

### Frontend

* React
* Vite
* TypeScript
* Admin dashboard UI

### DevOps

* Docker
* Docker Compose
* GitHub Actions
* Environment-based configuration

### AI Layer

* AI reply generation
* Prompt templates
* Contact-based memory
* Response style configuration

## Security Principles

This project is designed with security and control in mind.

The system should not blindly answer every incoming message.
Instead, it uses contact rules, approval mode, logging, and safety checks before sending responses.

Main security concepts:

* Only approved numbers can receive automatic replies
* Blocked contacts are ignored
* Sensitive messages can require manual approval
* All actions are logged
* API keys and secrets are stored in environment variables
* The dashboard will be protected by authentication

## Project Status

This project is currently in the initial development stage.

Planned development steps:

1. Project structure and documentation
2. Backend API setup
3. MongoDB connection
4. Contact management
5. WhatsApp webhook simulation
6. AI reply engine
7. WhatsApp sender service
8. Dashboard UI
9. Approval workflow
10. Docker production setup

## Disclaimer

This project is intended to use the official WhatsApp Business Cloud API.

It is not designed for unofficial WhatsApp Web automation, browser scraping, or actions that violate WhatsApp platform rules.
