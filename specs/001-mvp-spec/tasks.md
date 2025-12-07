---
description: 'Task list for Summanow MVP implementation'
---

# Tasks: Summanow MVP

**Input**: `/specs/001-mvp-spec/` design documents (spec.md, plan.md, research.md, data-model.md, contracts/, quickstart.md)  
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/openapi.yaml ✅, quickstart.md ✅

**Tests**: Automated E2E or integration coverage is REQUIRED for every primary user story. Add additional unit tests as needed to protect edge cases.

**Organization**: Tasks are grouped by phase and user story. Complete Setup → Foundational before tackling user stories. Within each story, write tests first, then implement features.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Align tooling, dependencies, and environment scaffolding.

- [X] T001 Update `package.json` to include a `volta` block pinning Node.js 24.x and pnpm 9.x for consistent tooling.
- [X] T002 Add runtime dependencies (OpenAI SDK, `@aws-sdk` clients, Cheerio, Zod, date helpers) to `package.json` and regenerate `pnpm-lock.yaml`.
- [X] T003 Add dev/test dependencies (Vitest, Testing Library, MSW, Playwright, tsx) and extend `package.json` scripts for `typecheck`, `test`, `test:e2e`.
- [X] T004 Create `.env.example` capturing required variables from quickstart (OpenAI, AWS, app URLs) to guide local setup.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core shared pieces required by all user stories.

- [X] T005 [P] Define domain models and Zod schemas for Site/Article/Summary/CrawlRun/RetryQueue in `src/types/domain.ts`.
- [ ] T006 [P] Implement environment validation helper in `src/lib/config/env.ts` using Zod and typed accessors.
- [ ] T007 [P] Create AWS client factory in `src/lib/datastore/clients.ts` configuring DynamoDBDocumentClient, S3Client, and EventBridgeClient with retries and user-agent metadata.
- [ ] T008 [P] Configure Vitest in `vitest.config.ts` with `tests/setup/vitest.ts` bootstrap (aliasing `src/`, polyfills, MSW hooks).
- [ ] T009 [P] Configure Playwright in `playwright.config.ts` with shared fixtures under `tests/e2e/fixtures.ts` (seed data helper, env wiring).
- [ ] T010 Establish CI workflow `.github/workflows/ci.yml` running `pnpm install --frozen-lockfile`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm test:e2e`.

**Checkpoint**: All shared tooling/config ready; user stories can proceed.

---

## Phase 3: User Story 1 – 朝夕の要約ダイジェストを確認する (Priority: P1)

**Goal**: Readers see twice-daily summarized articles in publication order with clear metadata.  
**Independent Test**: Playwright scenario loads the feed with seeded articles, displays summaries, and shows an empty state when no data exists.

### Tests

- [ ] T011 [P] [US1] Add list API integration test in `tests/integration/articles/listArticlesRoute.test.ts` covering happy path & empty response.
- [ ] T012 [P] [US1] Add Playwright spec `tests/e2e/articles-list.spec.ts` verifying feed rendering, loading skeleton, and empty state messaging.

### Implementation

- [ ] T013 [P] [US1] Implement `listArticles` query with pagination and summary join in `src/lib/datastore/articleRepository.ts` using DynamoDB client.
- [ ] T014 [US1] Build `/api/articles/route.ts` (App Router) honoring query params from `contracts/openapi.yaml` and returning typed responses.
- [ ] T015 [P] [US1] Create reusable UI components in `src/components/ArticleCard.tsx` and `src/components/EmptyFeedState.tsx` with Tailwind styles.
- [ ] T016 [US1] Rewrite `src/app/page.tsx` to stream article listings (loading skeleton, empty state, error boundary) via the new API.
- [ ] T017 [US1] Add formatting utilities in `src/lib/utils/formatters.ts` for relative timestamps, provider badges, and summary disclaimers.

**Checkpoint**: Feed page shows summarized articles with accurate metadata and handles empty states.

---

## Phase 4: User Story 2 – 要約から元記事へ移動する (Priority: P2)

**Goal**: Readers open a detail view, inspect full summary/body, and follow source links.  
**Independent Test**: Playwright scenario drills into a list item, renders detail content, and opens the source URL in a new tab.

### Tests

- [ ] T018 [P] [US2] Add detail API integration test in `tests/integration/articles/getArticleByIdRoute.test.ts` covering found/404 cases.
- [ ] T019 [P] [US2] Add Playwright spec `tests/e2e/article-detail.spec.ts` validating navigation from feed to detail and presence of source link.

### Implementation

- [ ] T020 [P] [US2] Extend `src/lib/datastore/articleRepository.ts` with `getArticleById` joining summary and retry metadata.
- [ ] T021 [US2] Implement `/api/articles/[articleId]/route.ts` returning `ArticleDetailResponse` contract with proper error handling.
- [ ] T022 [P] [US2] Create `src/components/ArticleDetail.tsx` rendering summary, body excerpt, metadata, and original article CTA.
- [ ] T023 [US2] Add `src/app/articles/[articleId]/page.tsx` and update `src/components/ArticleCard.tsx` to link into detail view while preserving source link behavior.

**Checkpoint**: Detail route functions independently; users can read summaries and access original articles.

---

## Phase 5: User Story 3 – クロール & 要約ジョブを管理する (Priority: P3)

**Goal**: Operations reliably run twice-daily crawls, generate summaries, and inspect execution logs or failures.  
**Independent Test**: Integration test triggers the crawl pipeline against mocked sites and asserts Dynamo/S3 records plus retry behavior.

### Tests

- [ ] T024 [P] [US3] Add crawl pipeline integration test `tests/integration/jobs/crawlPipeline.test.ts` using MSW to mock site HTML and OpenAI responses.
- [ ] T025 [P] [US3] Add retry queue test `tests/integration/jobs/retryQueue.test.ts` ensuring failed items reschedule correctly.

### Implementation

- [ ] T026 [P] [US3] Define static site catalogue with crawl windows and robots metadata in `src/lib/crawling/sites.ts`.
- [ ] T027 [P] [US3] Implement HTTP fetcher + robots guard in `src/lib/crawling/httpClient.ts` and `src/lib/crawling/robots.ts` with rate limiting & logging hooks.
- [ ] T028 [P] [US3] Implement HTML parsing & normalization utilities in `src/lib/crawling/parsers.ts` producing Article DTOs.
- [ ] T029 [US3] Implement OpenAI summarizer adapter in `src/lib/summaries/openaiSummarizer.ts` (prompt templates, retry/backoff, disclaimer text).
- [ ] T030 [US3] Implement write repositories in `src/lib/datastore/articleWriter.ts` handling dedupe, summary persistence, S3 snapshot uploads, and CrawlRun logs.
- [ ] T031 [US3] Implement crawl orchestrator in `src/jobs/crawl.ts` orchestrating fetch → write → enqueue summary and recording CrawlRun status.
- [ ] T032 [US3] Implement summarization worker in `src/jobs/summarize.ts` processing retry queue, updating statuses, and logging outcomes.
- [ ] T033 [US3] Add CLI entrypoints (`pnpm crawl:run`, `pnpm crawl:retry`) and optional Lambda handler wrappers in `src/jobs/handlers/` aligning with quickstart.
- [ ] T034 [US3] Implement manual trigger API `src/app/api/admin/jobs/crawl/route.ts` with throttle guard and auth stub per OpenAPI spec.
- [ ] T035 [US3] Implement crawl run listing API `src/app/api/crawl-runs/route.ts` exposing execution history for operations UI/CLI.
- [ ] T036 [US3] Create infrastructure IaC skeleton in `infra/cdk/main.ts` (or equivalent) provisioning DynamoDB table, S3 bucket, Lambda functions, EventBridge schedules, and necessary IAM roles.

**Checkpoint**: Crawl pipeline runs via CLI/EventBridge, summaries persist, and ops APIs expose run history.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Documentation, observability, and finishing touches.

- [ ] T037 Update `README.md` with architecture overview, CLI commands, and env setup aligned with final implementation.
- [ ] T038 Refresh `specs/001-mvp-spec/quickstart.md` to reflect actual scripts, cron schedule IDs, and troubleshooting steps.
- [ ] T039 Publish `docs/architecture.md` summarizing crawl flow, data storage, and deployment topology (linking to OpenAPI + IaC).

---

## Dependencies & Execution Order

- **Setup → Foundational → User Stories → Polish**. Do not start story work until T001–T010 are complete.
- **User Story Priority**: US1 (feed) → US2 (detail) → US3 (operations). Each is independently deployable once its checklist finishes.
- Within US1–US3, execute test tasks (e.g., T011, T018, T024) before corresponding implementation tasks to honor spec-driven development.
- Infrastructure (T036) depends on core job implementations (T031–T033).

## Parallel Opportunities

- **Foundational**: T005–T009 create disjoint assets and can run concurrently; T010 (CI) can follow immediately after.
- **US1**: T011 and T012 can be written in parallel. After T013 completes, T015 and T017 can proceed while T014/T016 integrate.
- **US2**: T018 and T019 run independently; T020 can start after T013, enabling T022 parallel to T021 once repository support exists.
- **US3**: T024 and T025 can execute together; T026–T029 are modular and parallel-friendly before orchestration tasks T031–T033; API endpoints T034–T035 can follow once repositories are ready.

## Implementation Strategy

1. Deliver the MVP by finishing US1 tasks (T011–T017) after foundational work—this constitutes the user-facing minimum viable product.
2. Layer in US2 to deepen engagement while keeping regressions guarded by new tests.
3. Implement US3 to automate ingestion and operations visibility, then provision infrastructure (T036).
4. Close with documentation updates (T037–T039) ensuring maintenance teams have clear runbooks.
