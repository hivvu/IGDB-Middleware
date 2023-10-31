const https = require('follow-redirects').https,
      fs = require('fs'),
      dotenv = require('dotenv');
      cron = require('node-cron');

function processRawReleases(){
    return new Promise((resolve, reject) => {
        fs.readFile('resources/raw-data.json', (err, data) => {
            if (err) throw err;


            // Create an object to store merged game data
            const mergedGameData = {};
            let gameData = JSON.parse(data);

            gameData.forEach((item) => {
                const gameName = item.game.name;

                // If the game name is not already in the merged data, add it
                if (!mergedGameData[gameName]) {
                    mergedGameData[gameName] = {
                        game: item.game,
                        platforms: [item.platform],
                    };
                } else {
                    // If the game name already exists, add the platform to the platforms array
                    mergedGameData[gameName].platforms.push(item.platform);
                }
            });

            // Convert the merged data back to an array
            const mergedGameArray = Object.values(mergedGameData);


            // var nextReleasesObj = {};

            // // Store every game in this array
            // var gamesObj = [];
            
            // let games = JSON.parse(data);
            // for (const i in games) {  

            //     //For this JSON, we only want games that are going to be release from now on.
            //     if (games[i].date > getYesterdayTimestamp()){
            //         var gameObj = {
            //             "igdbId": games[i].game.id,
            //             "title": games[i].game.name,
            //             "cover_url": getCover(games[i].game.cover?.url, 'cover_big'),
            //             "release_date": games[i].date,
            //             "release_month": games[i].m,
            //             "release_year": games[i].y,
            //             "platforms": getPlatforms(games[i].game.platforms)
            //         }
                
            //         // Add to object
            //         gamesObj.push(gameObj);
            //     }
            // }
            
            // if (gamesObj.length){
            //     gamesObj = removeDuplicates(gamesObj);
            // }
            
            // Store the array of games in the final object
            // nextReleasesObj.games = gamesObj;
            
            // var info = {
            //     "message": gamesObj.length ? 'Games added to the list' : 'No games added. Are there any releases?',
            //     "count": nextReleasesObj.length, 
            //     "updated_at": Math.floor(Date.now() / 1000)
            // }

            // nextReleasesObj.info = info

            // if (gamesObj.length){
            //     console.info('[info] Data processed, JSON with next releases created!');
            // } else {
            //     console.info('[error] No games added. Are there any releases?');
            // }

            resolve(JSON.stringify(mergedGameArray));
        });
    });
}

async function main() {
    try {
        // const result = await makeApiCall();
        // fs.writeFileSync('resources/raw-data.json', result);
        
        const processedData = await processRawReleases();
        fs.writeFileSync('resources/game-releases.json', processedData);
        
        // const processedMonthData = await processReleasesByMonth();
        // fs.writeFileSync('resources/month-releases.json', processedMonthData);
        // console.info('[info] Data processed, JSON with releases by month created!');
        
    } catch (err) {
        console.error(err);
    }
}


main();