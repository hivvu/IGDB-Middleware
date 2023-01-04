# IDGB -> WASD Middleware

This a simple middleware with the main objective to retrieve all videogames that are going to be released in the current year, using IDGB API. The API call is made once a day, always at midnight, and save the data to a local JSON file. The middleware will process this data to create two different JSON files: 

- month-releases.json 
- next-releases.json

The first one will have an object for each month with the games that are going to be releases in the current year. 
The second file, will have all games from yesterday until end of the current year. 

## Main objective of the middleware

The main objective is controling the number of call for the IGDB API. The processed JSON files will be used in the WASD.pt website. Next releases on the homepage and the month releases in a specific page with all releases for the current year. 

## Install

Use `npm install` to install every dependency

## How to run

Use `npm start` to run the script that have a cron inside that only runs at midnight of every day.
Use `npm server` to run the server that is going to use the port specified in the `.env` file
