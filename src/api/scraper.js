const axios = require("axios");
require("dotenv").config();

class ScraperClass {
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
  getScrapersUrl() {
    return `${this.config.api_url}/scraper-articles`;
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
  async getScrapers() {
    return new Promise((resolve, reject) => {
      this.apiAuth()
        .then((res) => {
          axios
            .get(this.getScrapersUrl(), {
              headers: this.getAuthHeader(),
              params: {
                enabled: true
              }
            })
            .then((res) => {
              resolve(res.data);
            })
            .catch((err) => {
              reject(err);
            });
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
}

// const Scraper = new ScraperClass();

module.exports = new ScraperClass();
