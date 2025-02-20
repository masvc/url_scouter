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
  displayScore("seo", data.results.seo);
  displayScore("content", data.results.content);
  displayScore("design", data.results.design);
}

// 他の必要な関数も移植
