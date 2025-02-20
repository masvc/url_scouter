document.addEventListener("DOMContentLoaded", function () {
  // URLからIDを取得
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get("id");

  if (!id) {
    window.location.href = "index.html";
    return;
  }

  // LocalStorageから結果を取得
  const resultData = localStorage.getItem(`urlscouter_${id}`);
  if (!resultData) {
    window.location.href = "index.html";
    return;
  }

  const data = JSON.parse(resultData);
  displayResults(data);
});

function displayResults(data) {
  // 結果表示のロジック
  document.querySelector(".analyzed-url a").href = data.url;
  document.querySelector(".analyzed-url a").textContent = data.url;

  // 各評価項目の表示
  displayScore("集客（SEO）評価", data.results.seo);
  displayScore("コンテンツ評価", data.results.content);
  displayScore("デザイン評価", data.results.design);
}

// 星評価とコメントを表示する関数
function displayScore(title, score) {
  // h3のテキストで該当する.score-itemを見つける
  const scoreItems = document.querySelectorAll(".score-item");
  const container = Array.from(scoreItems).find(
    (item) => item.querySelector("h3").textContent === title
  );

  if (!container) return;

  // 星評価の表示
  const starsDiv = container.querySelector(".stars");
  let stars = "";
  for (let i = 1; i <= 5; i++) {
    stars += i <= score ? "★" : "☆";
  }
  starsDiv.textContent = stars;

  // コメントの表示
  const commentP = container.querySelector(".comment");
  const comments = {
    "集客（SEO）評価": [
      "基本的なSEO対策が必要です。メタタグの設定から始めましょう。",
      "SEO対策の基礎はできています。さらなる改善の余地があります。",
      "標準的なSEO対策ができています。構造化データの追加を検討しましょう。",
      "優れたSEO対策が実施されています。さらなる最適化で上位表示を目指せます。",
      "非常に優れたSEO対策が実施されています。定期的な監視と維持を続けましょう。",
    ],
    コンテンツ評価: [
      "基本的なコンテンツの充実が必要です。情報量を増やしましょう。",
      "コンテンツの基礎はできています。より詳細な情報の追加を検討しましょう。",
      "標準的なコンテンツ量があります。更新頻度を上げることで改善が期待できます。",
      "充実したコンテンツが提供されています。さらなるコンテンツの拡充を検討しましょう。",
      "非常に充実したコンテンツ構成です。この質の高さを維持していきましょう。",
    ],
    デザイン評価: [
      "基本的なデザイン改善が必要です。レスポンシブ対応を検討しましょう。",
      "デザインの基礎はできています。ユーザビリティの向上が課題です。",
      "標準的なデザインが実装されています。アクセシビリティの改善を検討しましょう。",
      "優れたデザインが実装されています。さらなるUX向上を目指せます。",
      "非常に優れたデザインです。最新のトレンドを取り入れ続けましょう。",
    ],
  };

  commentP.textContent = comments[title][score - 1] || "評価できませんでした";

  // チェックポイントの追加
  const checkPointsUl = container.querySelector(".check-points");
  const checkPoints = getCheckPoints(title, score);
  checkPoints.forEach((point) => {
    const li = document.createElement("li");
    li.textContent = point;
    checkPointsUl.appendChild(li);
  });
}

function getCheckPoints(title, score) {
  const points = {
    "集客（SEO）評価": {
      good: [
        "メタタグが適切に設定されています",
        "見出し構造が整理されています",
        "モバイル対応が実施されています",
      ],
      improve: [
        "構造化データの追加を検討",
        "画像のalt属性の見直し",
        "サイトマップの作成",
      ],
    },
    コンテンツ評価: {
      good: [
        "基本的な情報が充実しています",
        "テキストの可読性が高いです",
        "コンテンツの更新が定期的です",
      ],
      improve: [
        "より詳細なコンテンツの追加",
        "メディアコンテンツの活用",
        "ユーザー参加型コンテンツの検討",
      ],
    },
    デザイン評価: {
      good: [
        "レスポンシブデザインが実装されています",
        "一貫性のあるデザインです",
        "操作性が良好です",
      ],
      improve: [
        "アクセシビリティの向上",
        "インタラクションの追加",
        "パフォーマンスの最適化",
      ],
    },
  };

  // スコアに応じてチェックポイントを返す
  return score > 3 ? points[title].good : points[title].improve;
}

// シェア機能の実装を追加
function shareResults() {
  const url = document.querySelector(".analyzed-url a").href;
  const text = generateShareText();

  // シェアURLの作成
  const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    text
  )}&url=${encodeURIComponent(url)}`;

  // 新しいウィンドウでTwitterシェア画面を開く
  window.open(shareUrl, "_blank", "width=550,height=420");
}

function generateShareText() {
  const scores = {
    seo:
      document
        .querySelector(".score-item:nth-child(1) .stars")
        .textContent.split("★").length - 1,
    content:
      document
        .querySelector(".score-item:nth-child(2) .stars")
        .textContent.split("★").length - 1,
    design:
      document
        .querySelector(".score-item:nth-child(3) .stars")
        .textContent.split("★").length - 1,
  };

  return (
    `URLスカウターで分析しました！\n\n` +
    `SEO評価: ${"★".repeat(scores.seo)}${"☆".repeat(5 - scores.seo)}\n` +
    `コンテンツ評価: ${"★".repeat(scores.content)}${"☆".repeat(
      5 - scores.content
    )}\n` +
    `デザイン評価: ${"★".repeat(scores.design)}${"☆".repeat(
      5 - scores.design
    )}\n\n` +
    `#URLスカウター`
  );
}

// 他の必要な関数も移植
