# Leanization Template

数学論文のLaTeX原稿・Lean 4形式化・対応表・レビューを一緒に管理する、
ChowCycleSum2を基にした汎用テンプレートです。
分野固有の数学・レビュー履歴は含めず、自然数の小さな例を収録しています。

## 最初に使う

このディレクトリ自体をコピーするか、GitHubへ登録後「Use this template」で新しい
リポジトリを作ります。コピーには `.git/`、`.lake/`、`build/` を含めないでください。
フォルダ名は自由です。Leanの名前空間 `PaperProject` はそのままでも使用できます。
VS Codeではコピーしたフォルダ自体を開きます。

必要な環境はLean/elan、Node.js 22.13以降、pdfLaTeX、BibTeX、latexdiffです。
Leanの版は `lean-toolchain` に固定しています。npm install は不要です。
VS CodeにはLean 4・LaTeX Workshop・Lean Paper Viewerをインストールします。
Viewer本体のVSIXは同梱していません。

```sh
lake build
npm run check:paper
npm run validate:links
```

リンク検査はインストール済みViewerのPDF.jsを利用します。
見つからない場合は `LEAN_PAPER_PDFJS_DIR` に `pdf.legacy.min.mjs` と
`pdf.legacy.worker.min.mjs` を含むディレクトリを指定します。
`media/pdfjs/` に配置しても利用できます。その場合は第三者ライセンスも保持してください。
CLI検査はPDFリンク・対応表・宣言の記述を確認します。
Viewerの検証コマンドでLean Language Serverによる名前解決も確認してください。
数学的対応の正しさは人間がレビューします。サンプル対応も `proposed` です。

## 自分の論文にする

1. `paper/new/main_2.tex` を原稿へ置き換えます。比較したい固定版を
   `paper/oldfile/main_1.tex` に置きます。最初は同じ原稿でも構いません。
2. 共有マクロは `paper/preamble.tex`、`paper/filewise_preamble.tex`、
   文献は `paper/refs.bib`、図は `paper/figures/` に置きます。
   このテンプレートのビルドエンジンはpdfLaTeXです。LuaLaTeXなどが必要な原稿は
   `tools/build-paper.mjs` のコンパイル処理を適合させてください。
3. `paper/SUBJECT_RULES.md` に分野固有の規約を書きます。
4. `PaperProject/` のサンプルを削除・置換し、`PaperProject.lean` のimportを更新します。
   サンプルのTeXリンクと `lean-paper-viewer.json` の2件の対応も削除・置換します。
   原稿の取込段階では空の `links` 配列で構いません。
5. `notes/LEAN_PLAN.md` に依存関係、`notes/FORMALIZATION_STATUS.md` に原稿の版と
   SHA-256、主張ごとの実装範囲・差異・未解決事項を記録します。
6. Lean・PDF・リンクを再検証します。

名前空間を変更する場合は、`lakefile.toml` のライブラリ名とdefaultTargets、
`PaperProject.lean`、`PaperProject/`、namespace/import、対応表の宣言名とパス、
AGENTS・プロンプトも合わせて変更してください。

mathlibは未追加です。必要な場合は、使用するmathlibの `lean-toolchain` と本プロジェクトを
一致させ、`lakefile.toml` に次の依存を追加し、実在する互換コミットへ置き換えます。

```toml
[[require]]
name = "mathlib"
git = "https://github.com/leanprover-community/mathlib4.git"
rev = "<互換性を確認した完全なコミットSHA>"
```

その後 `lake update`、`lake exe cache get`、`lake build` を実行し、
`lean-toolchain`・`lakefile.toml`・`lake-manifest.json` を一緒に管理します。
サンプルは外部ライブラリを必要としません。

## 普段の操作

| 操作 | コマンド |
| --- | --- |
| Lean検証 | `lake build` |
| 現行稿PDF | `npm run build:pdf` |
| 固定基準PDF | `node tools/build-paper.mjs baseline` |
| 現行稿と差分 | `npm run check:paper` |
| PDFと対応表の検査 | `npm run validate:links` |
| 上の一括検証 | `npm run check` |
| 版上げ | `npm run revision:advance` |
| 注釈用コピー | `npm run annotations:create` |
| TeX形式レビューのPDF | `npm run build:reviews` |

初期の現行稿は `paper/new/main_2.tex`、固定基準は `paper/oldfile/main_1.tex`。
PDFは `build/paper/main_2.pdf` と `build/diff/main_2_diff.pdf` です。
版番号は `paper/revision.json` を参照します。版上げコマンドが原稿・固定基準・
Viewer参照先・案内文を更新します。過去の基準稿は残します。
版上げ後にビルドが失敗した場合は、修正して `npm run check:paper` を実行し、
版上げを繰り返さないでください。
注釈コピーは `reviews/annotations/` に日本時間の日時付きで保存します。

## Codexへの依頼

「Lean化を進める」で `prompts/lean-formalization.md` に従って小さな一単位を進めます。
「Lean相談」は設計の相談、「版上げ」は版の更新、「注釈コピー」は保存用PDFの作成です。
「原稿反映」では保存した指摘を読み、対応を記録して原稿・差分を再生成します。
独立レビューの指示例は `prompts/mathematical-paper-review.md` を参照してください。
自動コミット・pushや専用ボタン拡張は含めません。Git操作は明示的に依頼します。

対応を追加するときは `\leanlink{thm:stable-name}{短い見出し}` と同じIDを対応表に登録し、
完全修飾Lean名とファイルを指定します。詳しくは `docs/linking-conventions.md` を参照。
抽象的な前提補題の「作業目的」と論文の主張の形式化完了を区別します。

## 構成

- `paper/`: 現行稿・固定基準・共有マクロ・分野固有規約
- `PaperProject.lean`, `PaperProject/`: 公開ライブラリと実装
- `lean-paper-viewer.json`: PDFとLeanの対応候補
- `notes/`: 計画・進捗・引き継ぎ
- `reviews/`: 指摘・対応記録・保持する注釈PDF
- `prompts/`, `AGENTS.md`: Codexの作業手順
- `tools/`, `.vscode/`: ビルド・検証・エディタ設定
- `docs/ci/lean.yml`: LeanビルドCIの導入用サンプル
- `build/`, `.lake/`: Git管理外の生成物

派生元と変更範囲は `docs/PROVENANCE.md` に記載しています。

## GitHubテンプレートとして使う

公開先: https://github.com/Rin-Gotou/leanization-template

現在は通常の公開リポジトリです。cloneまたはZIPのダウンロードで利用できます。
所有者がSettingsの「Template repository」を有効にすると、
GitHubの「Use this template」からも新しいリポジトリを作成できます。
CIを有効にするには `docs/ci/lean.yml` を `.github/workflows/lean.yml` へ
コピーしてコミットしてください。Webエディタ、またはワークフローを書き込める
認証を使用します。配布時点ではGitHub ActionsのCIは未有効です。
