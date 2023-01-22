const puppeteer = require("puppeteer");

class Scraper {
  constructor() {
    this.browser = null;
    this.page = null;
    this.method = null;
    this.contentType = null;
    this.postData = null;
  }
  async request(options){
    this.method = options.method ? options.method : 'GET';
    this.contentType = options.contentType ? options.contentType : 'text/html';
    this.postData = options.postData;
    await this.page.goto(options.url, { waitUntil: 'networkidle0' });
    return this.page.content();
  }
  async launch(){
    this.browser = await puppeteer.launch({
      headless: true,
      executablePath: '/usr/bin/google-chrome',
      args: [
        "--disable-gpu",
        "--disable-dev-shm-usage",
        "--disable-setuid-sandbox",
        "--no-sandbox",
      ]
    });
    this.page = await this.browser.newPage();
    await this.page.setRequestInterception(true);
    this.page.on('request', request => {
      request.continue({
        method: this.method,
        headers: {...request.headers(), 'content-type': this.contentType },
        ...(this.postData && { postData: this.postData }),
      })
    })
  }
  close(){
    this.browser.close();
  }
}

module.exports = new Scraper()
