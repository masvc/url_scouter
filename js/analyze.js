class URLAnalyzer {
  async analyze(url) {
    try {
      const doc = await this.fetchAndParse(url);
      const results = this.evaluateAll(doc);
      return this.saveResults(url, results);
    } catch (error) {
      console.error("分析エラー:", error);
      throw new Error("URLの分析に失敗しました");
    }
  }

  async fetchAndParse(url) {
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(
      url
    )}`;
    const response = await fetch(proxyUrl);
    const data = await response.json();

    if (!data.contents) {
      throw new Error("コンテンツの取得に失敗しました");
    }

    return new DOMParser().parseFromString(data.contents, "text/html");
  }

  evaluateAll(doc) {
    return {
      seo: this.evaluateSEO(doc),
      content: this.evaluateContent(doc),
      design: this.evaluateDesign(doc),
    };
  }

  saveResults(url, results) {
    const id = this.generateId();
    const resultData = {
      url,
      timestamp: Date.now(),
      results,
    };

    localStorage.setItem(`urlscouter_${id}`, JSON.stringify(resultData));
    return id;
  }

  evaluateSEO(doc) {
    const checks = {
      meta: () => {
        const title = doc.querySelector("title");
        const description = doc.querySelector('meta[name="description"]');
        return title && description;
      },
      headings: () => {
        const h1 = doc.querySelector("h1");
        const headings = doc.querySelectorAll("h2, h3, h4");
        return h1 && headings.length > 0;
      },
      viewport: () => doc.querySelector('meta[name="viewport"]'),
      images: () => {
        const images = doc.querySelectorAll("img");
        const validAltCount = [...images].filter((img) =>
          img.hasAttribute("alt")
        ).length;
        return images.length > 0 && validAltCount / images.length > 0.8;
      },
    };

    return 1 + Object.values(checks).filter((check) => check()).length;
  }

  evaluateContent(doc) {
    const checks = {
      info: () => {
        const text = doc.body?.textContent.toLowerCase() || "";
        return text.includes("contact") || text.includes("about");
      },
      articles: () => doc.querySelectorAll("p, article").length > 10,
      richContent: () => doc.querySelectorAll("p, article").length > 20,
      links: () => doc.querySelectorAll("a[href]").length > 10,
    };

    return 1 + Object.values(checks).filter((check) => check()).length;
  }

  evaluateDesign(doc) {
    const checks = {
      responsive: () => doc.querySelector('meta[name="viewport"]'),
      styles: () =>
        doc.querySelectorAll('link[rel="stylesheet"], style').length > 0,
      structure: () => {
        const hasHeader = doc.querySelector("header");
        const hasFooter = doc.querySelector("footer");
        const hasNav = doc.querySelector("nav");
        return (hasHeader && hasFooter) || hasNav;
      },
      interactive: () => {
        return doc.querySelector("button") || doc.querySelector("form");
      },
    };

    return 1 + Object.values(checks).filter((check) => check()).length;
  }

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}
