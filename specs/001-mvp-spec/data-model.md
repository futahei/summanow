# Data Model Draft – Summanow MVP

## Overview

The MVP persists crawl configuration, article metadata, AI summaries, crawl execution history, and retry state. Metadata lives in DynamoDB tables (single-table design with composite keys), while raw payloads (HTML snapshots, LLM prompt/response pairs) are archived in S3. All timestamps are stored in ISO 8601 UTC.

## DynamoDB Entities

### Site

- **Partition Key**: `PK = SITE#{siteId}`
- **Sort Key**: `SK = METADATA`
- **Attributes**:
  - `siteId` (UUID / short slug)
  - `name` (string)
  - `category` (enum: `press_release` | `news`)
  - `baseUrl` (URL)
  - `crawlWindows` (array of cron-like ranges; e.g., `[{"start":"06:30","end":"07:15"}, {"start":"18:30","end":"19:15"}]`)
  - `allowedPaths` (string[]; robots.txt–compliant path prefixes)
  - `requestIntervalMs` (number; minimum delay between requests)
  - `timezone` (IANA zone for publication parsing e.g., `Asia/Tokyo`)
  - `createdAt` / `updatedAt`
- **Indexes**: Projection via GSI `GSI1` with `GSI1PK = CATEGORY#{category}`, `GSI1SK = name`
- **Relationships**: `Site` 1:n `Article`, `Site` 1:n `CrawlRun`

### Article

- **Partition Key**: `PK = SITE#{siteId}`
- **Sort Key**: `SK = ARTICLE#{publishedAtISO}#{articleId}` (newest first)
- **Attributes**:
  - `articleId` (ULID / UUID)
  - `siteId`
  - `title`
  - `url`
  - `canonicalHash` (sha256 of URL + title for dedupe)
  - `publishedAt` (ISO timestamp)
  - `fetchedAt`
  - `author` (optional)
  - `bodyPlain` (string; truncated plain text ≤ 10k chars)
  - `wordCount` (number)
  - `topics` (string[]; optional manual tags)
  - `status` (enum: `summarized` | `pending_summary` | `summary_failed`)
  - `summaryId` (FK)
  - `lastSummaryAttemptAt`
- **Indexes**:
  - `GSI2`: `GSI2PK = ARTICLE#{articleId}`, `GSI2SK = METADATA` (direct lookup)
  - `GSI3`: `GSI3PK = STATUS#{status}`, `GSI3SK = publishedAtISO` (monitor backlog)
- **S3 Links**: `s3SnapshotKey` (pointer to raw HTML gz file)
- **Relationships**: `Article` 1:1 `Summary`, n:m `CrawlRun`

### Summary

- **Partition Key**: `PK = ARTICLE#{articleId}`
- **Sort Key**: `SK = SUMMARY#v1`
- **Attributes**:
  - `summaryId` (UUID)
  - `articleId`
  - `modelProvider` (enum: `openai` | `azure_openai`)
  - `modelId` (e.g., `gpt-4o-mini`)
  - `promptTemplateId`
  - `summaryText` (1–2 paragraphs, markdown-safe)
  - `confidence` (0–1 float based on heuristics)
  - `generatedAt`
  - `tokenUsage` (input/output)
  - `disclaimer` (localized string id)
- **Indexes**: None (access via Article PK)
- **S3 Links**: `s3PromptKey`, `s3ResponseKey`

### CrawlRun

- **Partition Key**: `PK = SITE#{siteId}`
- **Sort Key**: `SK = CRAWL#{startedAtISO}`
- **Attributes**:
  - `runId` (UUID)
  - `siteId`
  - `triggerType` (enum: `schedule` | `manual`)
  - `startedAt`
  - `completedAt`
  - `status` (enum: `success` | `partial` | `failed`)
  - `processedCount`
  - `newArticles`
  - `failedArticles`
  - `errorSummary` (string)
  - `lambdaRequestId` (if invoked through Lambda)
- **Indexes**:
  - `GSI4`: `GSI4PK = RUN#{runId}`, `GSI4SK = METADATA`
  - `GSI5`: `GSI5PK = STATUS#{status}`, `GSI5SK = startedAt`
- **S3 Links**: `s3LogKey`

### RetryQueue

- **Partition Key**: `PK = RETRY#{failureType}`
- **Sort Key**: `SK = ARTICLE#{articleId}`
- **Attributes**:
  - `articleId`
  - `failureType` (enum: `fetch`, `summary`)
  - `nextRetryAt`
  - `attemptCount`
  - `lastError`
  - `createdAt`
- **Indexes**: TTL attribute `ttl` to auto-expire after resolution

## S3 Objects

- `raw-html/{siteId}/{yyyymmdd}/{articleId}.html.gz`
- `prompts/{articleId}/{timestamp}-prompt.json`
- `responses/{articleId}/{timestamp}-response.json`
- `logs/{runId}.ndjson`

All objects tagged with `project=summanow` and include metadata for source URL and checksum.

## Access Patterns

- Fetch latest articles per site: Query `PK = SITE#{siteId}` with limit 20, `ScanIndexForward=false`.
- Fetch global feed: Use DynamoDB SDK `Query` with `IndexName=GSI2` combined with time filter (or maintain materialized view via Lambda writing “recent articles” list to S3/Redis; not required MVP).
- Fetch Article details: `Query` GSI2 by `articleId`.
- Fetch Summary: same PK as article.
- List crawl runs: Query `PK = SITE#{siteId}` with `begins_with(SK, "CRAWL#")`.
- Retry backlog: Query `PK = RETRY#{failureType}` ordered by `nextRetryAt`.

## Data Retention

- Article & Summary records retained indefinitely; consider archival after 90 days.
- Raw HTML snapshots stored 30 days, lifecycle rule to transition to S3 Glacier thereafter.
- Crawl run logs retained 90 days in DynamoDB, historical logs exported to S3 monthly.
- RetryQueue items TTL removed once resolved or after 7 days.
