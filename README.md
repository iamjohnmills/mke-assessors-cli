# Milwaukee Real Estate Values CLI

A command line tool that searches and scrapes real estate values from Milwaukee Assessors Office website and normalizes the results into a JSON object.

Action | Command
:--- | :---
Docker Image | `docker build -t puppeteer-image .`
Docker Container | `docker run -d -it -v $(pwd):/src --name mke-assessors-cli puppeteer-image`
SSH into Docker Container | `docker exec -it mke-assessors-cli bash`
Install | `npm install`
Run | `npm run start`

![Milwaukee Real Estate Values CLI](https://raw.githubusercontent.com/iamjohnmills/mke-assessors-cli/master/screenshot.gif)
