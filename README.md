# BagrutCalc

University admission calculator for Israeli students. Computes Bagrut grade averages with institution-specific bonuses, matches students to university programs, and simulates admission chances in real time.

**Live:** https://bagrut-mvp.vercel.app

## Features

- **Bagrut Grade Calculator** -- computes weighted averages with per-university bonus rules (5-unit bonuses, English bonuses, math bonuses, etc.)
- **University Program Matching** -- searchable database of degree programs across 10 Israeli universities
- **Admission Cockpit** -- real-time simulator that shows acceptance probability per program and lets students experiment with grade changes
- **OCR Grade Extraction** -- upload a Bagrut certificate image and extract grades automatically (Google Gemini API)
- **Built-in CRM** -- admin panel for managing users and leads with a real-time signal feed
- **WhatsApp Integration** -- group management and outreach tools
- **Telegram Bot** -- automated notifications and admin commands
- **Email Campaigns** -- transactional email via Resend with webhook tracking

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Vite |
| Styling | Tailwind CSS, Framer Motion |
| Backend | Supabase (PostgreSQL + Row-Level Security) |
| API | Vercel Serverless Functions (TypeScript) |
| OCR | Google Gemini AI |
| Email | Resend |
| Deployment | Vercel |

## Project Structure

```
├── api/                  # Vercel serverless functions
│   ├── cron/             # Scheduled jobs
│   ├── ocr/              # Grade extraction endpoints
│   ├── telegram-*.ts     # Telegram bot handlers
│   ├── extract-grades.ts # OCR pipeline
│   └── ...
├── src/
│   ├── components/       # React components
│   ├── pages/            # Route pages
│   ├── data/             # Static university & program data
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Shared utilities (Supabase client, etc.)
│   ├── services/         # API service layer
│   ├── types/            # TypeScript type definitions
│   └── utils/            # Helper functions (grade calc, env, etc.)
├── supabase/
│   └── migrations/       # Database schema migrations
├── data/                 # University admission rules (JSON)
├── scripts/              # Data import & maintenance scripts
└── public/               # Static assets
```

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project
- (Optional) Vercel CLI for deployment

### Setup

```bash
# Clone
git clone https://github.com/tsachovadia/bagrut-mvp.git
cd bagrut-mvp

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Fill in VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, and any API keys

# Run locally
npm run dev
```

### Build

```bash
npm run build
npm run preview
```

## License

[MIT](LICENSE)
