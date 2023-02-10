const fs = require("fs");
const path = require("path");

const locations = {
   work: "/Users/dluken/Documents/Learning/stock-scraper/config",
   home: "",
};
let env = null;

const configDirPath = path.join(__dirname);

module.exports.getEnv = () => {
   for (let location of locations) {
      locations.hasOwnProperty(location);

      if (locations.hasOwnProperty(location)) {
         if (!fs.existsSync(locations[location])) {
            env = location;
         }
      }
   }

   return env;
};

module.exports.env = () => {
   if (env === null) {
      env = this.getEnv();
   }

   return env;
};
