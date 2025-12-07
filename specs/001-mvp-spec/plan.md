# 実装計画書（Implementation Plan）: Summanow MVP

**Branch**: `001-mvp-spec` | **日付**: 2025-12-07 | **仕様リンク**: [spec.md](./spec.md)  
**入力**: `/specs/001-mvp-spec/spec.md` の仕様書

**Note**: このテンプレートは `/speckit.plan` によって自動生成される。  
実行フローは `.specify/templates/commands/plan.md` を参照のこと。

## サマリー（Summary）

Summanow の MVP では、企業プレスリリース 2 件とネット新聞 1 件を対象に朝夕 2 回クロールし、新着記事のタイトル・URL・公開日・本文を取得して外部 LLM で 1〜2 段落の日本語要約を生成、Next.js App Router（React + Tailwind）で一覧/詳細表示する。クロールは当面ローカル CLI から手動実行を許容しつつ、最終的に AWS EventBridge → Lambda のスケジュール実行へ移行し、成果は DynamoDB（メタデータ・要約）と S3（生 HTML/ログ）へ保存、Playwright E2E テストで主要シナリオを検証する。

## 技術コンテキスト（Technical Context）

**使用言語 / バージョン**:  
TypeScript 5.x / Node.js 24.x（Volta 管理）

**主要依存ライブラリ**:  
Next.js 14 App Router, React 18, Tailwind CSS, pnpm, AWS SDK v3（Lambda・DynamoDB・S3・EventBridge）, Cheerio（HTML 解析）, Playwright, Zod（入力バリデーション）, OpenAI SDK（GPT-4o mini; Azure OpenAI 互換）

**ストレージ**:  
DynamoDB（Site・Article・Summary・CrawlRun メタデータ）, S3（取得した本文/HTML スナップショットとジョブログエクスポート）, CloudWatch Logs（Lambda 実行ログ）

**テスト環境**:  
Playwright（E2E/UI フロー）, Vitest + Testing Library（API・フロント統合）, Mock Service Worker／Nock（外部 API 疑似化）

**ターゲットプラットフォーム**:  
Next.js App Router（SSR/ISR）を Vercel もしくは AWS Amplify へデプロイ、クロール & 要約処理は AWS Lambda（Node.js 24）＋ EventBridge スケジュール、手動運用向けに pnpm script/CLI を提供

**プロジェクトタイプ**:  
単一リポジトリ内に Next.js フロントエンドとサーバレスジョブ（ingestion・summarization）を共存させる Web アプリケーション

**性能目標（Performance Goals）**:  
クロール完了から 5 分以内に要約反映（SC-001）、要約詳細ページの初回描画 95% p95 ≤ 3s（SC-003）、Lambda 実行時間 ≤ 120 秒／メモリ 128MB 以内、スケジュール実行成功率 30 日平均 ≥ 95%（SC-002）

**制約条件（Constraints）**:  
AWS 無料枠内での運用（DynamoDB キャパシティ計画、Lambda 月間実行数制限）、robots.txt・利用規約遵守、外部 LLM のコスト上限管理、2 回/日の実行頻度、ESLint + Prettier + CI 必須、ログ保全 30 日以上

**想定スケール / スコープ（Scale/Scope）**:  
対象サイト固定 3 件、1 実行あたり最大 30 記事、1 日最大 60 記事処理、保存データ 48 時間表示 + アーカイブ保管、同時閲覧ユーザー < 100

## 憲法チェック（Constitution Check）

_この計画がプロジェクトの Constitution（憲法）に準拠しているかの事前チェック。  
設計フェーズ開始前（Phase 0）に必ず実施し、Phase 1 でも再チェックする._

- **I. Responsible Crawling / 責任あるクロール** → ✅ 予定しているクロール基盤で robots.txt / 利用規約のチェック、サイトごとのレート制御、CloudWatch へのフェッチログ保存を実施計画済み。具体的なクローラ実装詳細は Phase 0 調査で補強。
- **II. Source-Faithful Summaries / 情報源に忠実な要約** → ✅ Article レコードにタイトル・媒体名・URL・公開日時を保持し、Summary にモデル ID と生成時刻を保存、UI には自動生成ディスクレーマーを表示する方針。
- **III. Frontend Resilience / フロントエンドの堅牢性** → ✅ Next.js App Router + Tailwind で一覧/詳細画面を作成し、Skeleton/Empty/Retry 状態を提供、要約遅延時はローディング/未生成表示を行う。
- **IV. Engineering Discipline / 開発規律** → ✅ Volta + Node 24 + pnpm を強制し、ESLint/Prettier/TypeScript チェックを CI でゲート化、共通設定を `package.json` と GitHub Actions に定義予定。
- **V. Specification-Driven Validation / 仕様駆動の検証** → ✅ 本仕様に基づく Playwright E2E（一覧/詳細/失敗メッセージ）と Vitest 統合テストを Phase 1 で計画、README/docs にアーキ概要とデータフロー追記予定。

## プロジェクト構造（Project Structure）

### ドキュメント構成（この機能に関するもの）

```text
specs/[###-feature]/
├── plan.md              # このファイル（/speckit.plan の出力）
├── research.md          # Phase 0 調査結果
├── data-model.md        # Phase 1 データモデル
├── quickstart.md        # Phase 1 簡易導入ガイド
├── contracts/           # Phase 1 API / インターフェース契約
└── tasks.md             # Phase 2 タスク一覧（/speckit.tasks が生成）
```

### ソースコード構成（リポジトリルート）

<!--
  下記の構成案から、この機能に適したものを選択し、不要なものは削除。
  選択した構成には必ず「実際のディレクトリ」を記述すること。
-->

```text
src/
├── app/                  # Next.js App Router 画面（一覧/詳細/状態表示）
├── components/           # 再利用 UI（カード、空状態、ローディング）
├── lib/
│   ├── crawling/         # フェッチ/パーサ/robots ルールユーティリティ
│   ├── summaries/        # LLM アダプターとプロンプト定義
│   └── datastore/        # DynamoDB/S3 アクセスラッパー
├── jobs/
│   ├── crawl.ts          # 手動・Lambda 共通のクロールエントリポイント
│   └── summarize.ts      # 要約処理キューイング/再試行
└── types/                # Zod スキーマ・共有型定義

tests/
├── e2e/                  # Playwright シナリオ（一覧/詳細/未生成）
├── integration/          # Vitest + MSW で API/ジョブ連携検証
└── contract/             # DynamoDB/S3 への入出力契約テスト（必要時）

infra/
├── cdktf/ or cdk/        # IaC（AWS EventBridge, Lambda, DynamoDB, S3）
└── manifests/            # 環境設定・シークレットテンプレート
```

**採用する構造（Structure Decision）**
既存の Next.js プロジェクトをベースに単一リポジトリ構成（Option 1 拡張）を採用する。フロントエンドとサーバレスジョブを `src/` 直下の `app/`・`jobs/`・`lib/` で共有し、共通ロジックをユーティリティとして切り出すことで Next.js の App Router ディレクトリ構造と整合しつつ、将来の AWS Lambda デプロイでも同一コードを再利用できる。テストは Playwright（`tests/e2e`）と Vitest（`tests/integration`）で仕様の非機能要件（SC-001〜004）に対応させる。

## 複雑性トラッキング（Complexity Tracking）

> ※憲法チェックで違反がある場合のみ記載すること。

該当なし（Constitution 違反は検出されていない）。
