const axios = require("axios");
const path = require("path");
const fs = require("fs");
const FormData = require('form-data');
require("dotenv").config();

class UploadManager {
  constructor() {
    this.token = null;
    this.config = null;
  }
  setConfig(config) {
    this.config = config;
    return this;
  }
  setToken(token) {
    this.token = token;
    return this;
  }
  getAuthHeader() {
    return {
      Authorization: `Bearer ${this.token}`,
    };
  }
  getUploadUrl() {
    return `${process.env.FOOTBALL_API_URL}/upload`;
  }
  async processArticle(article) {
    return new Promise((resolve, reject) => {
      if (article.media_upload) {
        this.getImageContent(article.media_upload)
          .then(({filePath, fileName}) => {
            this.uploadFile(filePath, fileName)
              .then((media) => {
                console.log(media);
                console.log(`completed`);
              })
              .catch((error) => {
                console.log(`Error uploadFile`)
                throw new EvalError(error);
              });
          })
          .catch((error) => {
            console.log(`Error getImageContent`)
            throw new EvalError(error);
          });
      } else {
        resolve(article);
      }
    });
  }
  async getImageContent(url) {
    return new Promise((resolve, reject) => {
      axios({
        method: "get",
        url: url,
        responseType: "stream",
      })
        .then((response) => {
          const fileName = path.basename(response.data.responseUrl);
          const localFilePath = path.resolve(__dirname, `/tmp`, fileName);
          const fileUpload = response.data.pipe(
            fs.createWriteStream(localFilePath)
          );
          resolve({filePath: localFilePath, name: fileName});
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
  async uploadFile(filePath, fileName) {
    return new Promise((resolve, reject) => {
      const form = new FormData();
      form.append('files', fs.createReadStream(filePath), fileName);
      form.append('fileInfo', JSON.stringify({
        alternativeText: '',
        name: fileName,
        caption: ''
      }))
      // form.append("ref", "collection");
      // form.append("refId", entity.id);
      // form.append("field", "pictures");

      axios({
        method: `post`,
        url: this.getUploadUrl(),
        headers: this.getAuthHeader(),
        multipart: true,
        data: form,
      })
        .then((res) => {
          resolve(res.data);
        })
        .catch((error) => {
          console.log(`error upload`, error);
          reject(error);
        });
    });
  }
}

module.exports = new UploadManager();
