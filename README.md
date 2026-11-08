# AI 搭載 売上分析ダッシュボード

Shopify からエクスポートした CSV をアップロードするだけで、売上データを自動集計・グラフ表示し、**Claude AI** が分析コメントを生成するダッシュボードです。  
ポートフォリオ用途の自主制作です。デモ版では架空ストアのサンプルデータで動作を確認できます。

## 主な機能

| 機能 | 詳細 |
|------|------|
| CSV アップロード | Shopify エクスポート形式の CSV をドラッグ＆ドロップで読み込み |
| バリデーション | 必須列・データ形式・数値を自動チェック |
| KPI 集計 | 総売上・純利益・注文数・平均注文額（AOV）を自動計算 |
| グラフ表示 | 月別売上推移・カテゴリ別売上・商品別トップ 10 ランキング |
| AI 分析コメント | Claude AI（`claude-sonnet-4-6`）が売上傾向と推奨アクションを生成 |
| デモモード | API キー不要でサンプルデータの集計・グラフを確認可能（AI 分析は無効） |

## 使用技術

| カテゴリ | 技術 |
|----------|------|
| フレームワーク | Next.js / React / TypeScript |
| AI | Anthropic Claude API（`claude-sonnet-4-6`） |
| グラフ | Recharts |
| CSV 解析 | PapaParse |
| デプロイ | Vercel |

## デモ

**[デモを見る →](https://sales-dashboard-ochre-kappa.vercel.app)**

デモ版では架空ストア「COSMO STYLE」の 2025 年 8〜10 月データ（76 件・¥830,500）が表示されます。CSV アップロード・AI 分析機能は無効化されています。

## セットアップ

### 1. 依存パッケージのインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.local.example` をコピーして `.env.local` を作成します。

```bash
cp .env.local.example .env.local
```

| 変数名 | 説明 |
|--------|------|
| `ANTHROPIC_API_KEY` | Anthropic API キー（[console.anthropic.com](https://console.anthropic.com/) で取得） |
| `DEMO_MODE` | `true` にすると AI 分析を無効化したデモ表示になります |

### 3. 開発サーバーの起動

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) でアクセスできます。

## 注意事項

- 掲載内容はポートフォリオ用途の自主制作です。実際の顧客への導入実績ではありません。
- 実際の Shopify データをアップロードする場合、個人情報・顧客データの取り扱いに注意してください。
