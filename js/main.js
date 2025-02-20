document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("urlForm");
  const loading = document.getElementById("loading");

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const urlInput = document.getElementById("url");
    const url = urlInput.value;

    if (!url) {
      alert("URLを入力してください。");
      return;
    }

    // ローディング表示
    loading.classList.remove("hidden");

    try {
      console.log("リクエスト開始:", url); // デバッグログ

      const analyzer = new URLAnalyzer();
      const id = await analyzer.analyze(url);
      window.location.href = `result.html?id=${id}`;
    } catch (error) {
      console.error("Error:", error);
      alert(`エラーが発生しました：${error.message}`);
    } finally {
      loading.classList.add("hidden");
    }
  });
});
