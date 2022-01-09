const axios = require("axios");
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
          resolve(!!(res && res.data && res.data.length > 0));
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
          axios({
            method: "POST",
            url: this.getArticlesUrl(),
            headers: this.getAuthHeader(),
            data: article,
          })
            // .post(this.getArticlesUrl(), article)
            .then((res) => {
              resolve(res.data);
            })
            .catch((error) => {
              // console.log(error.request);
              console.log(error.response.data);
              // console.log(error.response.status);
              console.log(error.message);
              console.log(
                error.config.method,
                error.config.url,
                error.config.data
              );
              reject(error);
            });
        } else {
          resolve(article);
        }
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
