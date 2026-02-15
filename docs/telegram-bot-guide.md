# Telegram Bot Developer Guide

This guide provides technical documentation for the **Mitlabtim Bot** (Study Buddy). For high-level architecture and user flows, please refer to [User Story & Data Collection Map](./user-story.md).

## 📂 Project Structure

The bot is implemented as a Vercel Serverless Function, serving as a webhook for Telegram updates.

```
bagrut-mvp/
├── api/
│   ├── telegram-webhook.ts       # 🚀 Entry point (Vercel Function)
│   └── lib/
│       └── telegram/
│           ├── client.ts         # Telegram API wrapper (sendMessage, etc.)
│           ├── middleware.ts     # Auth, User Resolution, Logging
│           ├── types.ts          # TypeScript interfaces (updates, users)
│           └── handlers/         # Command logic
│               ├── start.ts      # /start (onboarding, deep links)
│               ├── group-events.ts # New members, spam checks
│               ├── rooms.ts      # /rooms logic
│               ├── misc.ts       # /help, /status
│               └── callback-router.ts # Handle button clicks
├── simulate-telegram.sh          # 🛠 Local testing script
└── simulate-telegram-production.sh
```

## ⚙️ Setup & Configuration

The bot requires the following environment variables in `.env` (local) or Vercel Project Settings:

| Variable | Description |
|----------|-------------|
| `TELEGRAM_BOT_TOKEN` | The API token from @BotFather |
| `TELEGRAM_SECRET_TOKEN` | Secret string for validating webhook requests (security) |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_KEY` | **Service Role** key (needed for admin actions like finding users by ID) |

## 🛠 Local Development

You can simulate Telegram webhooks locally without exposing your machine to the internet.

### Using the Simulation Script

The project includes a `simulate-telegram.sh` script to send fake payloads to your local API.

1.  **Start the dev server:**
    ```bash
    npm run dev
    # OR if using Vercel CLI
    vercel dev
    ```

2.  **Run the simulation:**
    Open a new terminal and run:
    ```bash
    ./simulate-telegram.sh
    ```
    This sends a `/start` command payload to `http://localhost:5173/api/telegram-webhook`.

3.  **Modify the payload:**
    Edit `simulate-telegram.sh` to change the `text` field (e.g., to `/rooms` or `hello`) or the `chat_id` to test different scenarios.

## 🧩 Adding New Commands

To add a new command (e.g., `/courses`):

1.  **Create a Handler:**
    Create `api/lib/telegram/handlers/courses.ts`:
    ```typescript
    import { HandlerContext } from '../types';
    import { sendMessage } from '../client';

    export async function handleCourses(ctx: HandlerContext) {
        await sendMessage(ctx.chatId, 'Here are the available courses...');
    }
    ```

2.  **Register the Command:**
    In `api/telegram-webhook.ts`, add a case to the switch statement:
    ```typescript
    import { handleCourses } from './lib/telegram/handlers/courses.js';

    // ... inside the switch(command)
    case '/courses':
        await handleCourses(ctx);
        break;
    ```

## 🚀 Deployment

The bot is deployed automatically with the Vercel project.

-   **Endpoint:** `https://your-domain.com/api/telegram-webhook`
-   **Webhook Registration:** You must manually register the webhook with Telegram once:
    ```bash
    curl -F "url=https://your-domain.com/api/telegram-webhook" \
         -F "secret_token=YOUR_SECRET_TOKEN" \
         https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook
    ```

## 🛡 Security

-   **Secret Token:** The `x-telegram-bot-api-secret-token` header is checked in `middleware.ts` to ensure requests actually come from Telegram.
-   **Supabase RLS:** The bot uses the `SERVICE_KEY` to bypass RLS for administrative tasks but primarily interacts with `bot_users` and `bot_groups` tables.
