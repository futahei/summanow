# Summanow Constitution

## Core Principles

- **Mission / 目的**: RSS未提供の企業PRサイトやネット新聞を朝夕にクロールし、新着記事をAI要約して閲覧可能にする。
- **Spec-Driven / 仕様駆動**: SDDを徹底し、Specとタスクを常に更新しながら開発する。
- **Stack Discipline / 技術スタック厳守**: FrontendはNext.js(App Router)+React+TypeScript+Tailwind CSS、パッケージはpnpm、VoltaでNode 22を固定。
- **Quality Gates / 品質ゲート**: ESLint+Prettierを必須とし、CIでlintを通すまでマージしない。
- **Infra Pragmatism / 無料枠優先のインフラ**: AWS無料枠を優先（例: Lambda+EventBridge+DynamoDB+S3）、構成は後から見直して良い。
- **Responsible Crawling / 倫理的クロール**: robots.txtと利用規約を尊重し、過度なクロール・スクレイピングは行わない。
- **AI Summaries / AI要約**: 外部LLM（OpenAI/Bedrock等）で要約し、採用サービスは実装フェーズで決定する。
- **Testing / テスト**: 主要ユースケースをカバーするE2E/統合テストを用意し、将来はPlaywright等を導入する。
- **Docs & Architecture / ドキュメントとアーキ**: READMEやdocsにアーキテクチャ概要を残し、変更時は更新する。
- **Communication / コミュニケーション**: ユーザーとのやりとりは日本語で行う。

## Governance / ガバナンス

- **Supremacy / 最優先**: 本憲法は開発プロセスの最上位規範とし、逸脱は理由と修正計画を明示する。
- **Amendment / 改定**: 重大変更はPRやSpecで明文化し、Ratified/Last Amendedを更新する。

**Version**: 1.0.0 | **Ratified**: 2025-12-09 | **Last Amended**: 2025-12-09
