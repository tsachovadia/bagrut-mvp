#!/bin/bash
curl -X POST http://localhost:5173/api/telegram-webhook \
  -H "Content-Type: application/json" \
  -H "x-telegram-bot-api-secret-token: wh_sec_9d8f7e6a5b4c3d2e1f0a9b8c7d6e5f4" \
  -d '{
  "update_id": 10000,
  "message": {
    "message_id": 1365,
    "from": {
      "id": 123456789,
      "is_bot": false,
      "first_name": "TestUser",
      "username": "testuser",
      "language_code": "en"
    },
    "chat": {
      "id": 123456789,
      "first_name": "TestUser",
      "username": "testuser",
      "type": "private"
    },
    "date": 1441645532,
    "text": "/start"
  }
}'
echo ""
