const async = require("async");
const { TimeoutSettings } = require("puppeteer");

class ScraperClass {
  constructor() {
    this.base_url = null;
    this.browser = null;
    this.scraper = null;
  }
  setBrowser(browser) {
    this.browser = browser;
    return this;
  }
  getLinkSelector() {
    return this.scraper.selectors.find((selector) => selector.id === `link`);
  }
  limitResults(items) {
    const limit = this.scraper.limit || 20;
    return items.slice(0, limit);
  }
  getSelector(name, scraper) {
    return scraper.selectors.find((item) => item.id === name);
  }
  sanitizeResults(results) {
    let articles = [];
    results.forEach((elements) => {
      elements.forEach((item) => {
        articles.push(item);
      });
    });
    return articles;
  }
  async mapContent(selector, page) {
    return await page.$$eval(selector.selector, (items) => {
      items = items.map((item) => item[selector.extractAttribute]);
      return items;
    });
  }

  async scrapeArticlePage(url, scraper) {
    try {
      console.log(`Scraper Detail URL: ${url}`);
      let page = await this.browser.newPage();
      await page.goto(url);
      await page.waitForTimeout(900);
      let article = {
        uuid: url,
        locale: scraper.locale,
      };
      const titleSelector = this.getSelector(`title`, scraper);
      if (titleSelector) {
        article.title = await page.$eval(
          titleSelector.selector,
          (element) => element.content
        );
      }
      const bodySelector = this.getSelector(`body`, scraper);
      if (bodySelector) {
        article.body = await page.$eval(
          bodySelector.selector,
          (element) => element.content
        );
        article.summary = article.body;
      }
      const imageSelector = this.getSelector(`image`, scraper);
      if (imageSelector) {
        article.media_upload = await page.$eval(
          imageSelector.selector,
          (element) => element.content
        );
      }
      const dateSelector = this.getSelector(`date`, scraper);
      if (dateSelector) {
        article.date = await page.$eval(
          dateSelector.selector,
          (element) => element.content
        );
      }
      const sourceSelector = this.getSelector(`source`, scraper);
      if (sourceSelector) {
        article.source = this.getSelector(`source`, scraper).selector;
      }
      page.close();
      return article;
    } catch (err) {
      console.error("scrape Article Page", err);
      throw new EvalError(err);
    }
  }
  async scrapeAllArticlePages(urls, scraper) {
    return Promise.all(urls.map((url) => this.scrapeArticlePage(url, scraper)));
  }
  async getLinks(page) {
    return new Promise(async (resolve, reject) => {
      try {
        const linkSelector = this.getLinkSelector();
        let urls = await page.$$eval(linkSelector.selector, (links) => {
          links = links.map((el) => el.href);
          return links;
        });
        resolve(urls);
      } catch (err) {
        console.log("GetLinks error");
        reject(err);
      }
    });
  }
  async scrapeLinks(url, scraper) {
    return new Promise(async (resolve, reject) => {
      try {
        console.log(`Scraper Root URL: ${url}`);
        let page = await this.browser.newPage();
        await page.goto(url);
        await page.waitForTimeout(800);
        this.getLinks(page)
          .then((links) => {
            let linksToProcess = this.limitResults(links);
            this.scrapeAllArticlePages(linksToProcess, scraper)
              .then((res) => {
                page.close();
                let articles = [];
                res.forEach((item) => {
                  articles.push(item);
                });
                // this.closeBrowser();
                resolve(articles);
              })
              .catch((err) => {
                reject(err);
              });
          })
          .catch((err) => {
            console.log("Scrape URL error");
            reject(err);
          });
      } catch (err) {
        reject(err);
      }
    });
  }
  async scrapeAllPaths(scraper) {
    return new Promise((resolve, reject) => {
      this.scraper = scraper;
      Promise.all(scraper.paths.map((url) => this.scrapeLinks(url, scraper)))
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
  async executeScraper(scraper, browser, articleManager) {
    return new Promise((resolve, reject) => {
      this.setBrowser(browser)
      .scrapeAllPaths(scraper)
      .then((res) => {
        const articles = this.sanitizeResults(res);
        if (articles) {
          articleManager
            .processAllArticles(articles)
            .then((res) => {
              resolve(res);
            })
            .catch((err) => {
              throw new EvalError(err);
            });
        } else {
          console.log(`Nothing imported`);
          resolve(res)
        }
      })
      .catch((err) => {
        reject(err)
      });
    })    
  }
  async execute(scrapers, browser, articleManager) {
    return new Promise((resolve, reject) => {
      Promise.all(scrapers.map((scraper) => this.executeScraper(scraper, browser, articleManager)))
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
  async openBrowser(browserInstance) {
    return new Promise(async (resolve, reject) => {
      let browser;
      try {
        browser = await browserInstance;
        resolve(browser);
      } catch (err) {
        console.log("Open browser error");
        reject(err);
      }
    });
  }
  async closeBrowser() {
    await this.browser.close();
  }
}

module.exports = new ScraperClass();
