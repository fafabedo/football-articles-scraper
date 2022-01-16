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
    .then((scrapers) => {
      Scraper.openBrowser(browserInstance)
        .then((browser) => {
          const authToken = ApiScrapers.getToken();
          const articleManager = ArticleManager.setConfig(config);
          articleManager.setToken(authToken);
          Scraper.execute(scrapers, browser, articleManager)
            .then((res) => {
              console.log(`Scraper completed successfully`);
              setInterval(() => {
                process.exit(0);
              }, 2000)
            })
            .catch((error) => {
              console.log(`Scraper throw an error`);
              throw new Error(error.message, { cause: error} );
            });
        })
        .catch((error) => {
          console.log(`Open Browser throw an error`)
          throw new Error(error.message, { cause: error} );
        });
    })
    .catch((error) => {
      throw new Error(error.message, { cause: error} );
    });
} catch (error) {
  console.error(error);
  process.exit(1);
}
