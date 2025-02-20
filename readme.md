# URL スカウター

URL を入力するだけで、Web サイトの実力を分析・評価するツールです。

## デモ

[https://masvc.github.io/url_scouter/](https://masvc.github.io/url_scouter/)

## 機能

- SEO 評価
- コンテンツ評価
- デザイン評価
- 分析結果の Twitter シェア
- レスポンシブデザイン対応

## 技術スタック

- HTML5
- CSS3
- JavaScript (ES6+)
- [allorigins.win](https://allorigins.win/) - CORS プロキシサービス

## 評価項目

### SEO 評価

- メタタグの設定状況
- 見出し構造の適切性
- モバイル対応状況
- 画像の alt 属性

### コンテンツ評価

- 情報量
- テキストの可読性
- コンテンツの更新状況
- リンク構造

### デザイン評価

- レスポンシブ対応
- スタイルシートの使用
- ページ構造の適切性
- インタラクティブ要素

## 使い方

1. 分析したい Web サイトの URL を入力
2. 「評価する」ボタンをクリック
3. 自動で 3 項目の分析が開始
4. 各項目の評価（1〜5★）が表示
5. 改善点や評価コメントを確認
6. 必要に応じて結果を Twitter でシェア

## 注意事項

- セキュリティ制限により、一部のサイトは分析できない場合があります
- 分析結果はブラウザの LocalStorage に保存されます
- 評価結果は参考値としてお使いください

## 開発者向け情報

### プロジェクト構造

```
urlscouter/
├── css/
│ └── style.css
├── js/
│ ├── analyze.js
│ ├── main.js
│ └── result.js
├── index.html
└── result.html
```
