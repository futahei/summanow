# 実装計画書（Implementation Plan）: [FEATURE]

**Branch**: `[###-feature-name]` | **日付**: [DATE] | **仕様リンク**: [link]  
**入力**: `/specs/[###-feature-name]/spec.md` の仕様書

**Note**: このテンプレートは `/speckit.plan` によって自動生成される。  
実行フローは `.specify/templates/commands/plan.md` を参照のこと。

## サマリー（Summary）

[仕様書から抽出した「主要要件」 + 調査に基づく技術アプローチの要点を記述]

## 技術コンテキスト（Technical Context）

<!--
  このセクションはプロジェクトごとの技術条件を明確化する場。
  言語・依存関係・ストレージ・テスト環境・ターゲット環境・性能要件・制約・規模を記述する。
  SpecKit はこの情報を基にデータモデル・実装タスクを導く。
-->

**使用言語 / バージョン**:  
例: TypeScript / Node.js 22 （Volta 管理）または NEEDS CLARIFICATION

**主要依存ライブラリ**:  
例: Next.js, React, Tailwind CSS, AWS SDK, Playwright または NEEDS CLARIFICATION

**ストレージ**:  
例: DynamoDB, S3, ファイル, 不要 など

**テスト環境**:  
例: Playwright, Vitest, Jest または NEEDS CLARIFICATION

**ターゲットプラットフォーム**:  
例: AWS Lambda + Next.js App Router（Static/SSR）など

**プロジェクトタイプ**:  
例: Web アプリケーション / 単一リポジトリ / フロント＋バックエンド構成

**性能目標（Performance Goals）**:  
例: p95 < 200ms, Lambda 実行時間 < 1s, 1,000 req/s など

**制約条件（Constraints）**:  
例: AWS 無料枠内で動作, API レート制限遵守, メモリ < 128MB など

**想定スケール / スコープ（Scale/Scope）**:  
例: 日次クロール件数 1,000 件, 月間 10k MAU など

## 憲法チェック（Constitution Check）

_この計画がプロジェクトの Constitution（憲法）に準拠しているかの事前チェック。  
設計フェーズ開始前（Phase 0）に必ず実施し、Phase 1 でも再チェックする。_

[Constitution 上の必須ゲートをここに表示し、満たしているか記述]

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
# Option 1: 単一プロジェクト（DEFAULT）
src/
├── models/
├── services/
├── api/
└── lib/

tests/
├── integration/
├── contract/
└── unit/

# Option 2: Webアプリ（frontend + backend）
backend/
└── src/
    ├── models/
    ├── services/
    └── api/

frontend/
└── src/
    ├── components/
    ├── app/ or pages/
    └── services/
```

**採用する構造（Structure Decision）**
[上記のうちこの機能で採用する構造を選択し、理由と実ディレクトリパスを記述]

## 複雑性トラッキング（Complexity Tracking）

> ※憲法チェックで違反がある場合のみ記載すること。

| 违反内容（Violation）      | 必要な理由（Why Needed）     | 却下した代替案（Simpler Alternative Rejected Because） |
| -------------------------- | ---------------------------- | ------------------------------------------------------ |
| 例: 追加のサービスレイヤ   | 現行構造では依存密度が高い   | 単純な関数配置では責務が分離できない                   |
| 例: 新規 DynamoDB テーブル | アクセスパターンに差異がある | 既存テーブルとの共有はホットスポットを生む             |
