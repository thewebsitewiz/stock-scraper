// const fs = require("fs");
// const path = require("path");


// import { ApiEndpoint } from 'src/assets/json/api-endpoints';

const locations: any = {
   work: "/Users/dluken/Documents/Learning/stock-scraper/config",
   home: "/Users/dennisluken/Documents/Projects/code/stock-scraper/config",
};

const configDirPath = path.join(__dirname);

let env: string | null = null;

module.exports.getEnv = () => {
   env = getEnv();
   return env;
};

module.exports.env = () => {
   if (env === null) {
      env = getEnv();
   }

   return env;
};

function getEnv() {
   for (let location in locations) {
      if (locations.hasOwnProperty(location)) {
         if (!fs.existsSync(locations[location])) {
            env = location;
            break;
         }
      }
   }

   return env;
}