const https = require('follow-redirects').https,
      fs = require('fs'),
      dotenv = require('dotenv');
      cron = require('node-cron');

async function readBlacklist() {
return new Promise((resolve, reject) => {
    fs.readFile('resources/blacklist.json', (err, data) => {
    if (err) {
        reject(err);
        return;
    }
    const blacklist = JSON.parse(data);
    resolve(new Set(blacklist));
    });
});
}

function processRawReleases() {
    return new Promise(async (resolve, reject) => {
      try {
        const blacklist = await readBlacklist();
  
        fs.readFile('resources/raw-data.json', (err, data) => {
          if (err) {
            reject(err);
            return;
          }
  
          // Create an object to store merged game data
          const mergedGameData = {};
          let gameData = JSON.parse(data);
  
          gameData.forEach((item) => {
            const gameId = item.game.id;
  
            if (!blacklist.has(gameId)) {
              const gameName = item.game.name;
  
              // If the game name is not already in the merged data, add it
              if (!mergedGameData[gameName]) {
                mergedGameData[gameName] = {
                  date: item.date,
                  game: item.game,
                  platforms: [item.platform],
                };
              } else {
                // If the game name already exists, add the platform to the platforms array
                mergedGameData[gameName].platforms.push(item.platform);
              }
            }
          });
  
          // Convert the merged data back to an array
          const mergedGameArray = Object.values(mergedGameData);
  
          resolve(JSON.stringify(mergedGameArray));
        });
      } catch (err) {
        reject(err);
      }
    });
  }

async function main() {
    try {
        const processedData = await processRawReleases();
        fs.writeFileSync('resources/game-releases.json', processedData);
    } catch (err) {
        console.error(err);
    }
}


main();