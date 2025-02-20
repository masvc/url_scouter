class URLAnalyzer {
  async analyze(url) {
    try {
      const response = await fetch(url);
      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");

      const results = {
        seo: this.evaluateSEO(doc),
        content: this.evaluateContent(doc),
        design: this.evaluateDesign(doc),
      };

      // 結果を保存
      const id = this.generateId();
      const resultData = {
        url: url,
        timestamp: Date.now(),
        results: results,
      };

      // LocalStorageに保存
      localStorage.setItem(`urlscouter_${id}`, JSON.stringify(resultData));
      return id;
    } catch (error) {
      throw new Error("URLの分析に失敗しました");
    }
  }

  evaluateSEO(doc) {
    let score = 1;

    // メタタグのチェック
    const title = doc.querySelector("title");
    const description = doc.querySelector('meta[name="description"]');
    if (title && description) score++;

    // 見出し構造のチェック
    const h1 = doc.querySelector("h1");
    const headings = doc.querySelectorAll("h2, h3, h4");
    if (h1 && headings.length > 0) score++;

    // モバイルビューポートのチェック
    if (doc.querySelector('meta[name="viewport"]')) score++;

    // 画像のalt属性チェック
    const images = doc.querySelectorAll("img");
    let validAltCount = 0;
    images.forEach((img) => {
      if (img.hasAttribute("alt")) validAltCount++;
    });
    if (images.length > 0 && validAltCount / images.length > 0.8) score++;

    return score;
  }

  evaluateContent(doc) {
    let score = 1;

    // 基本的な情報の存在チェック
    const hasContact = doc.querySelector('*:contains("contact")');
    const hasAbout = doc.querySelector('*:contains("about")');
    if (hasContact || hasAbout) score++;

    // コンテンツの量をチェック
    const textContent = doc.querySelectorAll("p, article");
    if (textContent.length > 10) score++;
    if (textContent.length > 20) score++;

    // リンクの存在チェック
    const links = doc.querySelectorAll("a[href]");
    if (links.length > 10) score++;

    return score;
  }

  evaluateDesign(doc) {
    let score = 1;

    // レスポンシブデザインチェック
    if (doc.querySelector('meta[name="viewport"]')) score++;

    // CSSの使用チェック
    const hasStyles = doc.querySelectorAll('link[rel="stylesheet"], style');
    if (hasStyles.length > 0) score++;

    // 適切なマークアップ構造
    const hasHeader = doc.querySelector("header");
    const hasFooter = doc.querySelector("footer");
    const hasNav = doc.querySelector("nav");
    if ((hasHeader && hasFooter) || hasNav) score++;

    // インタラクティブ要素
    const hasButtons = doc.querySelector("button");
    const hasForms = doc.querySelector("form");
    if (hasButtons || hasForms) score++;

    return score;
  }

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}
