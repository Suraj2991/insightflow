# InsightFlow Core - Modular Document Review Platform

## Quick Setup

1. **Install Dependencies**
   ```bash
   cd insightflow-core
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Open Browser**
   - Go to http://localhost:3001
   - You should see the basic homepage

## Project Structure
```
insightflow-core/
├── src/
│   ├── app/            # Next.js app router
│   ├── types/          # TypeScript definitions
│   └── modules/        # 8 Core modules (will be built incrementally)
└── package.json
```

## Development Notes
- Uses Next.js 14 with App Router
- TypeScript for type safety
- Port 3001 to avoid conflicts with insightflow-property
- Incremental development approach

## Next Steps
1. Test basic setup with `npm run dev`
2. Implement Module 1: Landing Configurator
3. Test each module before proceeding to the next 