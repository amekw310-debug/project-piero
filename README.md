# Project PIERO

Interactive Web Experience の制作リポジトリ。

現段階は **Chapter 1 の土台（scaffold）** のみ。演出の本実装は未着手。

## 技術構成

| レイヤー | 技術 |
| --- | --- |
| ビルド | Vite |
| 言語 | TypeScript |
| アニメーション | GSAP |
| 配信 | GitHub Pages (GitHub Actions 自動デプロイ) |

> Three.js は将来の 3D 化フェーズで導入予定（現段階では未導入）。

## 開発

```bash
npm install       # 依存関係のインストール
npm run dev       # ローカル開発サーバ（HMR）
npm run build     # 型チェック + 本番ビルド（dist/ を生成）
npm run preview   # ビルド結果をローカルプレビュー
npm run typecheck # 型チェックのみ
```

## ディレクトリ構成

```
project-piero/
├─ index.html
├─ vite.config.ts            # base: '/project-piero/'
├─ tsconfig.json
├─ src/
│  ├─ main.ts                # エントリポイント
│  ├─ scenes/
│  │  ├─ types.ts            # Scene 共通インターフェース
│  │  └─ chapter1/index.ts   # Chapter 1（空シーン）
│  └─ styles/main.css
├─ public/assets/chapter1/   # Chapter 1 の静止画置き場
└─ .github/workflows/deploy.yml
```

新しい章は `src/scenes/chapterN/` を追加し、`Scene` インターフェースを実装する。

## アセット配置

静止画は `public/assets/chapterN/` に置く。コードからは絶対パスで参照する:

```ts
background-image: url("/assets/chapter1/top.jpg")
```

## プレビュー (GitHub Pages)

`main` またはこの開発ブランチへの push で自動ビルド・公開される。

- URL: `https://amekw310-debug.github.io/project-piero/`
- リポジトリの **Settings → Pages → Source** を **GitHub Actions** に設定する必要がある。
