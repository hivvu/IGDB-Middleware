const https = require('follow-redirects').https,
      fs = require('fs'),
      dotenv = require('dotenv');
      cron = require('node-cron');

dotenv.config();

function makeApiCall(){ 
    return new Promise((resolve, reject) => {
        var options = {
            'method': 'POST',
            'hostname': 'api.igdb.com',
            'path': '/v4/release_dates',
            'headers': {
                'Client-ID': process.env.IGDB_ID,
                'Authorization': 'Bearer ' + process.env.API_TOKEN,
                'Content-Type': 'text/plain',
                'Cookie': '__cf_bm=FrD5pxVoMaq9SZ6eoME1WnracpBXZInsjC8FscN6hZI-1672657498-0-AUDLCFlNwREhqfHyVkBrGgt2u2j/dzZIvC2OMQq4kF+EvGFySsEKnFUe982URn6soNialhwtEqLXtqocHgIunbI='
            },
            'maxRedirects': 20
        };

        var req = https.request(options, function (res) {
            var chunks = [];
        
            res.on("data", function (chunk) {
                chunks.push(chunk);
            });
        
            res.on("end", function (chunk) {
                var body = Buffer.concat(chunks);
                resolve(body.toString());
            });
            
            res.on("error", function (error) {
                console.error(error);
            });
        });
        
        var postData = "fields game.id,game.name,date,human,game.platforms,y,m,game.cover.url; \nwhere game.platforms = (6, 48, 130, 167, 169, 49, 390) & game.hypes > 10 & y = " + new Date().getFullYear() + "; sort date asc; limit 150;";
        
        req.write(postData);
        req.end();
    });
}

// Unique by multiple properties ( id and title )
function removeDuplicates(arr) {
    return arr.filter((v,i,a)=>a.findIndex(v2=>['igdbId','title'].every(k=>v2[k] ===v[k]))===i)
}

function getCover(url, size){
    if (url == undefined) return null;

    var finalUrl = 'https:'+url;
    return finalUrl.replace('t_thumb', 't_'+size); 
}

function getPlatforms(ids){
    var platforms = [];

    for (const i in ids) {
        switch(ids[i]){
            case 6:
                platforms.push('PC');
                break;
            case 48:
                platforms.push('PS4');
                break;
            case 130:
                platforms.push('Switch');
                break;
            case 167:
                platforms.push('PS5');
                break;
            case 169:
                platforms.push('Xbox Series S|X');
                break;
            case 49:
                platforms.push('Xbox One');
                break;
            case 390:
                platforms.push('PSVR 2');
                break;
        }
    }

    return platforms;
}

function getYesterdayTimestamp(){
    var d = new Date();
    d.setDate(d.getDate() - 1 );
    d.setHours(0,0,0,0);

    return Math.floor(d / 1000); 
}

function processRawReleases(){
    return new Promise((resolve, reject) => {
        fs.readFile('resources/raw-data.json', (err, data) => {
            if (err) throw err;

            var nextReleasesObj = {};

            // Store every game in this array
            var gamesObj = [];
            
            let games = JSON.parse(data);
            for (const i in games) {  

                //For this JSON, we only want games that are going to be release from now on.
                if (games[i].date > getYesterdayTimestamp()){
                    var gameObj = {
                        "igdbId": games[i].game.id,
                        "title": games[i].game.name,
                        "cover_url": getCover(games[i].game.cover?.url, 'cover_big'),
                        "release_date": games[i].date,
                        "release_month": games[i].m,
                        "release_year": games[i].y,
                        "platforms": getPlatforms(games[i].game.platforms)
                    }
                
                    // Add to object
                    gamesObj.push(gameObj);
                }
            }

            gamesObj = removeDuplicates(gamesObj);
            
            // Store the array of games in the final object
            nextReleasesObj.games = gamesObj;
            

            var info = {
                "count": nextReleasesObj.length, 
                "updated_at": Math.floor(Date.now() / 1000)
            }

            nextReleasesObj.info = info

            resolve(JSON.stringify(nextReleasesObj));
        });
    });
}

function processReleasesByMonth(){
    return new Promise((resolve, reject) => {
        fs.readFile('resources/next-releases.json', (err, data) => {
            let jsonFile = JSON.parse(data);
            
            if (err) throw err;

            let releasesObj = [];
            let games = jsonFile.games;
            // Cycle trough the 12 months
            for (var i = 1; i <= 12; i++){
                var gamesObj = games.filter(a => a.release_month == i);
                releasesObj[i-1] = gamesObj;
            }

            var info = {
                "updated_at": Math.floor(Date.now() / 1000)
            }

            releasesObj.info = info;

            resolve(JSON.stringify(releasesObj));
        });
    });
}

async function main() {
    try {
        // const result = await makeApiCall();
        // fs.writeFileSync('resources/raw-data.json', result);
        // console.info('[info] API call and file write successful!');
        
        // const processedData = await processRawReleases();
        // fs.writeFileSync('resources/next-releases.json', processedData);
        // console.info('[info] Data processed, JSON with next releases created!');
        
        const processedMonthData = await processReleasesByMonth();
        fs.writeFileSync('resources/month-releases.json', processedMonthData);
        console.info('[info] Data processed, JSON with releases by month created!');
        
    } catch (err) {
        console.error(err);
    }
}

if (process.argv[2] && process.argv[2] === '-now') { 
        console.log('[info] Running process now.'); 
        main();
    } else { 
        console.log('[info] Process will run every day at 23h59.'); 
        cron.schedule('0 0 * * *', function() {
            main();
    });
} 


/*

Platforms:
Linux - 3
PS1 - 7
PS2 - 8
iOS - 39
PSVR - 165
MSDOS - 13
Xbox OG - 11
N64 - 4
NES - 18
PSP - 38
PS3 - 9
MacOS - 14
Saturn - 32
Android - 34
Vita - 46
Gameboy - 33
Wii - 5
MegaDrive - 29


PC - 6
PS4 - 48
Switch - 130
PS5 - 167
Series X - 169
XONE - 49
PSVR2 - 390


*/