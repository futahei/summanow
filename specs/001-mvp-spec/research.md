# Research Summary

## Decision: Use OpenAI GPT-4o mini for Japanese news summarization (API via Azure OpenAI or OpenAI)

- **Rationale**: GPT-4o mini offers strong Japanese summarization quality, low latency, and competitive pricing that fits AWS-free-tier-sized workloads (≤120 summaries/日). The SDK is straightforward to use from TypeScript, and streaming support enables progressive UI updates if needed. Rate limits at launch (≥5 RPM / 50,000 TPM) easily cover twice-daily batches.
- **Alternatives considered**:
  - **Amazon Bedrock (Claude 3 Haiku)**: Integrated with AWS IAM, but current public pricing (input $0.00025/1K tokens) combined with slower warm-up latency in some regions and extra setup overhead (IAM permissions, region availability) makes it heavier for MVP. Revisit once workloads move fully onto AWS.
  - **Anthropic Claude Instant via API**: Excellent quality but requires separate account management and higher cost; not yet integrated with project tooling.

## Decision: Store article metadata & summaries in DynamoDB, raw HTML snapshots in S3

- **Rationale**: DynamoDB’s partition key flexibility handles small-but-growing datasets while enabling fast query by publication timestamp and site. Keeping raw HTML in S3 avoids exceeding 400KB item limits and provides audit history for compliance. Both services remain within AWS free tier given expected daily volume (<60 articles, ≈5 MB/day).
- **Alternatives considered**:
  - **Single DynamoDB table with full HTML inline**: Simpler initially but risks item size growth and costly read/write usage; loses version history.
  - **RDS (PostgreSQL)**: Overkill for MVP; higher management overhead and costs beyond free tier.

## Decision: Schedule Lambda ingestion via EventBridge with manual pnpm fallback

- **Rationale**: EventBridge schedules two cron triggers (07:00 / 19:00 JST) without dedicated servers and stays in free tier (64 invocations/month). Sharing handler logic between Lambda and a pnpm CLI ensures operational continuity before infrastructure is finalized.
- **Alternatives considered**:
  - **AWS Step Functions**: Provides orchestration but adds cost/complexity not needed for sequential crawl → summarize flow.
  - **GitHub Actions cron**: Easy to set up but introduces dependency on GitHub runners and outbound networking; less control over IAM and retry policies compared with EventBridge.
