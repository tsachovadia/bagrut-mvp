#!/bin/bash
# Simulate a Telegram Webhook event to the PRODUCTION Vercel endpoint

# Load env to get token? No, we don't need token for the request itself, just the endpoint.
# But we might need SUPABASE info if we were running locally. Here we test the REMOTE server.

ENDPOINT="https://bagrut-mvp.vercel.app/api/telegram-webhook"

echo "Sending POST request to $ENDPOINT..."

curl -v -X POST "$ENDPOINT" \
  -H "Content-Type: application/json" \
  -H "x-telegram-bot-api-secret-token: wh_sec_9d8f7e6a5b4c3d2e1f0a9b8c7d6e5f4" -d '{
    "update_id": 10000,
    "message": {
        "message_id": 1337,
        "from": {
            "id": 123456789,
            "is_bot": false,
            "first_name": "Test",
            "username": "testuser",
            "language_code": "en"
        },
        "chat": {
            "id": 123456789,
            "first_name": "Test",
            "username": "testuser",
            "type": "private"
        },
        "date": 1677660000,
        "text": "/start"
    }
}'
