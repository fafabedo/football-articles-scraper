const axios = require("axios");
const uploadManager = require("./upload");
require("dotenv").config();

class ArticleManager {
  constructor() {
    this.config = {
      api_url: ``,
      user: ``,
      password: ``,
    };
    this.token = null;
  }
  setConfig(config) {
    this.config = config;
    return this;
  }
  getToken() {
    return this.token;
  }
  setToken(token) {
    this.token = token;
    return this;
  }
  getAuthUrl() {
    return `${this.config.api_url}/auth/local`;
  }
  getArticlesUrl() {
    return `${this.config.api_url}/articles`;
  }
  getAuthHeader() {
    return {
      Authorization: `Bearer ${this.token}`,
    };
  }
  async apiAuth() {
    return new Promise((resolve, reject) => {
      var credentials = {
        identifier: this.config.user,
        password: this.config.password,
      };
      axios
        .post(this.getAuthUrl(), credentials)
        .then((res) => {
          this.token = res.data.jwt;
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
  async findArticle(article) {
    return new Promise((resolve, reject) => {
      axios
        .get(this.getArticlesUrl(), { params: { uuid: article.uuid } })
        .then((res) => {
          const result = !!(res && res.data && res.data.length > 0) 
          resolve(result);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }
  async postArticle(article) {
    return new Promise((resolve, reject) => {
      this.findArticle(article).then((exists) => {
        if (!exists) {
          console.log({status: `Processing ${article.uuid}`})
          axios({
            method: "POST",
            url: this.getArticlesUrl(),
            headers: this.getAuthHeader(),
            data: article,
          })
            .then((res) => {
              resolve(res.data);
            })
            .catch((error) => {
              console.log(error.response.data);
              console.log(error.message);
              console.log(
                error.config.method,
                error.config.url,
                error.config.data
              );
              reject(error);
            });
        } else {
          console.log({status: `Article already scraped ${article.uuid}`})
          resolve(article);
        }
        resolve(article);
      });

    });
  }
  async processAllArticles(articles) {
    return new Promise((resolve, reject) => {
      Promise.all(articles.map((article) => this.postArticle(article)))
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
}

// const Scraper = new ScraperClass();

module.exports = new ArticleManager();
