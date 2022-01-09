require("dotenv").config();

class ConfigClass {
  constructor() {
    this.api_url = null;
    this.user = null;
    this.password = null;
  }
  getConfig() {
    this.api_url = process.env.FOOTBALL_API_URL || `https://api.footballcenter.live`;
    this.user = process.env.FOOTBALL_API_USER || `user`;
    this.password = process.env.FOOTBALL_API_PASSWORD || ``;
    return {
      api_url: this.api_url,
      user: this.user,
      password: this.password,
    }
  }
}
const Config = (new ConfigClass()).getConfig();
module.exports = Config;