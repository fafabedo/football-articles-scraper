#!/usr/bin/env node
"use strict";
const browserObject = require("./browser");

const config = require("./config/config");
const ApiScrapers = require("./api/scraper");
const ArticleManager = require("./api/article");
const Scraper = require("./web/scraper");

try {
  let browserInstance = browserObject.startBrowser();
  ApiScrapers.setConfig(config)
    .getScrapers()
    .then((entries) => {
      console.log(`Pulled Scrapers successfully`);

      Scraper.openBrowser(browserInstance)
        .then((browser) => {
          const authToken = ApiScrapers.getToken();
          const articleManager = ArticleManager.setConfig(config);
          articleManager.setToken(authToken);
          Scraper.execute(entries, browser, articleManager)
            .then((res) => {
              console.log(`Scraper completed successfully`);
            })
            .catch((err) => {
              throw new EvalError(err);
            });
          // Scraper.setBrowser(browser)
          //   .scrapeAllPaths(entries[0])
          //   .then((res) => {
          //     console.log(`Sanitizing articles`)
          //     const articles = sanitizeResults(res);
          //     console.log(`articles:`, articles.length)
          //     if (articles) {
          //       const authToken = ApiScrapers.getToken();
          //       const articleManager = ArticleManager.setConfig(config);
          //       articleManager
          //         .setToken(authToken)
          //         .processAllArticles(articles)
          //         .then(res => {
          //           console.log(`Scraper completed successfully`);
          //           process.exit(0);
          //         })
          //         .catch((err) => {
          //           throw new EvalError(err);
          //         });
          //     } else {
          //       console.log(`Nothing imported`);
          //       process.exit(0);
          //     }
          //   })
          //   .catch((err) => {
          //     throw new EvalError(err);
          //   });
        })
        .catch((err) => {
          throw new EvalError(err);
        });
    })
    .catch((err) => {
      throw new EvalError(err);
    });
} catch (err) {
  console.error(err);
  process.exit(1);
}

const sanitizeResults = (results) => {
  let articles = [];
  results.forEach((elements) => {
    elements.forEach((item) => {
      articles.push(item);
    });
  });
  return articles;
};
