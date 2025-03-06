import core from './sites.json' with { type: "json" };
import fs from 'node:fs';
import https from 'node:https';

let intervalId;
process.on('SIGINT', () => {
  clearInterval(intervalId);
  process.exit();
});

processSites(core.DOMAINS);

function processSites(sites) {
  const datePattern = getFormattedDate();
  fs.writeFile(`results--${datePattern}.csv`, 'site,time,status\n', () => {});

  intervalId = setInterval(() => {

    console.log('- Triggering Check');
    for (let i = 0, len = sites.length; i < len; i++) {
      const site = sites[i];
      if (site.active === true) {

        console.log('-- Checking: ', site.url)
        checkWebsite(site.url, (status) => {
          const time = new Date();
          const data = site.url + ',' + getTime(time) + ',' + status + '\n';
          fs.appendFile('results.csv', data, () => {});
        });  

      }
    }
  }, core.INTERVAL);
}

function getFormattedDate() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const formattedDate = `${year}-${month}-${day}`;
  return formattedDate;
}

function checkWebsite(url, callback) {
  https
    .get(url, (res) => callback(res.statusCode))
    .on('error', (error) => callback(500));
}

function getTime(time) {
  const hours = (time.getHours() + '').padStart(2, '0');
  const minutes = (time.getMinutes() + '').padStart(2, '0');
  const seconds = (time.getSeconds() + '').padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`
}
