<!--
Sync Impact Report
Version: 0.0.0 → 1.0.0
Modified Principles: Added I. Responsible Crawling / 責任あるクロール; Added II. Source-Faithful Summaries / 情報源に忠実な要約; Added III. Frontend Resilience / フロントエンドの堅牢性; Added IV. Engineering Discipline / 開発規律; Added V. Specification-Driven Validation / 仕様駆動の検証
Added Sections: Architecture Constraints / アーキテクチャ制約; Workflow & Documentation / ワークフローとドキュメント
Removed Sections: None
Templates requiring updates:
- ✅ .specify/templates/tasks-template.md
Follow-up TODOs: None
-->

# Summanow Constitution

## Core Principles

### I. Responsible Crawling / 責任あるクロール

- EN: Crawlers MUST honor each source's robots.txt, usage terms, rate limits, and requested crawl windows; morning/evening runs are scheduled per site-specific policy and every fetch is logged with timestamp and response status.
- JA: クローラーは各サイトの robots.txt、利用規約、レート制限、クロール可能時間帯を厳守し、朝夕の実行はサイトごとのポリシーに基づいてスケジュールし、取得ログ（時刻とレスポンス）を必ず記録する。
- Rationale / 理由: Protects partners, keeps legal exposure minimal, and preserves long-term access to news sources.

### II. Source-Faithful Summaries / 情報源に忠実な要約

- EN: AI-generated summaries MUST preserve original attribution (title, publisher, URL, timestamp), store model configuration alongside outputs, and expose disclaimers about automated content; any filtering or redaction requires documented justification.
- JA: AI 要約は元記事のタイトル・媒体名・URL・取得時刻を保持し、生成時のモデル設定を出力と同時に保存し、自動生成である旨のディスクレーマーを表示する；要約での情報削除や編集は理由を明文化すること。
- Rationale / 理由: Ensures readers can verify facts and lets the team audit model behavior as providers or prompts change.

### III. Frontend Resilience / フロントエンドの堅牢性

- EN: The web experience MUST be delivered with Next.js App Router, React, TypeScript, and Tailwind CSS, support responsive layouts, and degrade gracefully when summaries are delayed or missing; critical UI states require loading/error placeholders.
- JA: フロントエンドは Next.js App Router・React・TypeScript・Tailwind CSS を必須とし、レスポンシブ対応と遅延／欠落時のフォールバック UI（ローディングやエラー表示）を備える。
- Rationale / 理由: Keeps the client predictable, accessible, and maintainable across devices while respecting the chosen stack.

### IV. Engineering Discipline / 開発規律

- EN: Use Volta with Node.js 24.x and pnpm for all workflows; ESLint and Prettier MUST pass locally and in CI before merge, and CI pipelines MUST fail on lint violations; configuration drift requires immediate remediation in repo.
- JA: すべての開発フローで Volta（Node.js 24 系）と pnpm を使用し、ESLint と Prettier をローカルおよび CI で合格させた状態でのみマージする；CI で lint エラーが出た場合はビルドを失敗させ、設定差異は速やかにリポジトリで解消する。
- Rationale / 理由: Guarantees consistent environments, predictable builds, and shared code style.

### V. Specification-Driven Validation / 仕様駆動の検証

- EN: Maintain up-to-date specs, plans, and task lists before implementation; major user journeys MUST ship with automated E2E or integration tests (e.g., Playwright) and README/docs MUST summarize current architecture and data flow decisions.
- JA: 実装前に仕様・計画・タスクを常に最新化し、主要ユースケースには自動化された E2E または統合テスト（例：Playwright）を必ず用意し、README や docs には最新のアーキテクチャとデータフロー概要を記載する。
- Rationale / 理由: Keeps the team aligned, prevents regressions, and documents operational knowledge for future iteration.

## Architecture Constraints / アーキテクチャ制約

- EN: Prioritize AWS free-tier services (Lambda, EventBridge, DynamoDB, S3) for ingestion, scheduling, storage, and media handling; alternative platforms require cost and maintenance justification in specs.
- JA: 収集・スケジューリング・保存・メディア処理には AWS 無料枠（Lambda・EventBridge・DynamoDB・S3）を優先し、他プラットフォームを使う場合はコストと運用理由を仕様に明記する。
- EN: Select external LLM providers (OpenAI, Bedrock, etc.) during implementation, record prompt templates and model versions in project docs, and support switching providers without code rewrites by isolating summarization adapters.
- JA: 外部 LLM（OpenAI・Bedrock など）は実装フェーズで選定し、プロンプトとモデルバージョンをドキュメント化し、要約アダプターを分離してプロバイダー変更時にコード改修を最小化する。
- EN: Store crawled article metadata and summaries with clear partition keys that avoid hotspots; purge or archive content per source agreements.
- JA: 取得記事のメタデータと要約はホットパーティションを避けるパーティションキーで保存し、媒体との合意に基づき古いデータを適切に削除またはアーカイブする。

## Workflow & Documentation / ワークフローとドキュメント

- EN: Practice specification-driven development—generate or revise specs, plans, and task lists via `/speckit` commands before coding, and keep them synchronized with implementation changes.
- JA: 仕様駆動開発を徹底し、実装前に `/speckit` コマンドで仕様・計画・タスクを作成／更新し、変更内容と常に同期させる。
- EN: Code reviews MUST confirm compliance with principles, lint/test status, and documentation updates (README/docs) for architecture or infrastructure changes.
- JA: コードレビューでは各原則の順守、lint／テスト結果、アーキテクチャやインフラ変更に伴う README／docs 更新を必ず確認する。
- EN: Deployment plans MUST include rollbacks, monitoring hooks, and AWS cost checks when new workloads are introduced.
- JA: 新しいワークロードを導入する際のデプロイ計画にはロールバック手順、監視設定、AWS コスト確認を必ず含める。

## Language Policy / 言語ポリシー

- EN: All artifacts generated via `/speckit` commands—including specifications, plans, task lists, checklists, implementation proposals, and documentation updates—MUST be written in Japanese by default. Chat-based discussions MAY use Japanese as well. English output is allowed only when explicitly requested in a specific command prompt.

- JA: `/speckit` コマンドで生成されるすべての成果物（仕様・計画・タスク分解・チェックリスト・実装案・ドキュメント更新）は原則として日本語で記述すること。チャットでの議論も日本語でよい。英語出力が必要な場合は個別コマンドで明示する。

- Rationale / 理由: レビュー性とチーム共有を最適化するため、日本語を標準言語として採用する。仕様や計画のニュアンスを正確に伝えるためにも日本語が望ましい。

## Governance

- EN: This constitution overrides conflicting practices; amendments require consensus from the core maintainers and an updated Sync Impact Report.
- JA: 本憲法は他の運用ルールより優先され、改訂にはコアメンテナの合意と Sync Impact Report の更新が必要となる。
- EN: Semantic versioning applies—MAJOR for principle removals/redefinitions, MINOR for new principles or substantive policy changes, PATCH for clarifications; document rationale in commit messages.
- JA: バージョン管理はセマンティックバージョニングを採用し、原則の削除・再定義で MAJOR、原則追加や重大な方針変更で MINOR、表現の明確化で PATCH とし、理由をコミットメッセージに記録する。
- EN: Conduct quarterly compliance reviews to audit crawling logs, CI status, and documentation freshness; findings feed into specs and backlog tasks.
- JA: 四半期ごとにクロールログ・CI 状況・ドキュメントの鮮度を監査し、その結果を仕様やバックログに反映させる。

**Version**: 1.1.0 | **Ratified**: 2025-12-07 | **Last Amended**: 2025-12-07
