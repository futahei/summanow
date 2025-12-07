# Quickstart – Summanow MVP

## 1. Prerequisites

- Install [Volta](https://volta.sh) (manages Node 24 and pnpm).
- Ensure AWS CLI v2 is configured with an IAM user limited to DynamoDB/S3/Lambda/EventBridge (read/write) within free tier.
- Obtain an OpenAI (or Azure OpenAI) API key with access to `gpt-4o-mini`.
- Install project dependencies: `pnpm install` (Volta pins Node/pnpm automatically).

## 2. Environment Setup

Create `.env.local` with:

```bash
NEXT_PUBLIC_APP_BASE_URL=http://localhost:3000
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
AWS_REGION=ap-northeast-1
AWS_DYNAMODB_TABLE=summanow-mvp
AWS_S3_BUCKET=summanow-mvp-artifacts
AWS_EVENTBUS_NAME=summanow-schedule
```

For Lambda/CLI runs, also export credentials:

```bash
export AWS_PROFILE=summanow-dev
export AWS_REGION=ap-northeast-1
```

## 3. Local Development Workflow

1. **Bootstrap data**: `pnpm run seeds:sites` (writes the three target sites to DynamoDB).
2. **Start UI**: `pnpm dev` → open <http://localhost:3000> for the Next.js app.
3. **Manual crawl**: `pnpm crawl:run --once` (invokes `src/jobs/crawl.ts`, shares logic with Lambda handler).
4. **View results**: refresh the UI; new articles and summaries appear in descending order.
5. **Manual retry** (if summary failed): `pnpm crawl:retry --article <id>` to push item back to queue.

## 4. Testing & Linting

- Lint: `pnpm lint` (ESLint + Prettier check).
- Type check: `pnpm typecheck` (Next.js + TypeScript).
- Unit/integration: `pnpm test` (Vitest + MSW).
- E2E: `pnpm test:e2e` (Playwright). Requires `pnpm dev` running in another terminal; scenarios cover list/empty/detail flows.

## 5. Scheduled Execution (AWS)

1. `pnpm infra:deploy` (provisions DynamoDB table, S3 bucket, Lambda, EventBridge cron using CDK/TF).
2. Confirm EventBridge rules `cron(0 22 * * ? *)` and `cron(0 10 * * ? *)` (UTC) match 07:00/19:00 JST.
3. Verify Lambda environment variables mirror `.env.local` secrets (stored via AWS Secrets Manager or SSM Parameter Store).
4. Check CloudWatch Logs after first run; ensure processed count matches CLI run. Update alarms if failure rate >5%.

## 6. Operational Notes

- Respect robots.txt by keeping `allowedPaths` up to date; adjust crawl window when sites change policy.
- Monitor DynamoDB RCUs/ WCUs weekly to stay within free tier (present workload < 1 RCU average).
- Archive S3 raw HTML objects older than 30 days using lifecycle rules (configured via IaC).
- Update README/docs whenever architecture or data flow changes, per project constitution.
