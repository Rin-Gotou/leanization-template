# テンプレートの検証

- Lean v4.32.0: `lake build` 成功（外部依存なし）。
- `npm run check:paper`: 現行稿とlatexdiff PDFの生成成功。
- `npm run validate:links`: 2件のPDFリンクと2件の対応表、0 errors。
  2件のproposed警告は人間レビュー未実施を示す。
  PDF.jsのcanvas/Path2Dに関する警告は表示されたが、注釈抽出・検査は成功。
- 一時ディレクトリで版上げを実行し、原稿・固定基準・Viewer・README等の更新と
  新版のPDF・リンク検査の成功を確認。配布用テンプレートの版は変更していない。
- 一時コピーで注釈PDFを2回作り、別名で保存されることを確認。
- 版上げ先ファイルが既存の場合、原稿・版設定・基準を変更せず拒否することを確認。
- VS Code実機のPDF表示・SyncTeX・Lean Language Serverは未確認。
- ローカル利用を前提とし、CIは未有効。docs/ci/lean.ymlに任意の設定サンプルを保持。

利用者の論文の形式化・数学的対応のレビューを検証したものではない。
