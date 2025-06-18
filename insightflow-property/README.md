# InsightFlow Property – UK Property Document Review Assistant

**2025-06 Update: Robust, Reliable, User-Friendly**

InsightFlow is an AI-powered decision support tool for UK property buyers. It reviews property documents, highlights risks, and helps users prepare questions for professionals. The system uses OpenAI/Groq function calling, strict schema validation, robust error handling, and integrates user survey data (risk tolerance, property type, etc.) for context-aware analysis. The UI is designed for clarity, progress tracking, and resilience to missing/incomplete data.

**Key Features:**
- Function calling for document analysis and question generation (no JSON parsing errors)
- Strict schema enforcement and fallback logic
- Survey data integration (risk tolerance, property type, professional team)
- Robust error handling and defensive UI coding
- Simplified, user-friendly workflow and progress tracking

**Workflow:**
1. Complete property questionnaire
2. Upload documents
3. Receive structured analysis (summary, findings, questions)
4. Prepare for professional consultation

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
