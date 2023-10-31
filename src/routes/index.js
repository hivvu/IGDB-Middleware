const express     = require("express"),
      router      = express.Router(),
      bodyParser  = require("body-parser"),
      fs          = require('fs');

let routes = (app) => {
  app.use(bodyParser.json());

  router.get("/next-releases", function(req, res){
    var readable = fs.createReadStream('resources/next-releases.json');
    readable.pipe(res);
  });

  router.get("/year-releases", function(req, res){
    var readable = fs.createReadStream('resources/month-releases.json');
    readable.pipe(res);
  });
  
  router.get("/games-releases", function(req, res){
    var readable = fs.createReadStream('resources/game-releases.json');
    readable.pipe(res);
  });

  // Any other route will deliver a 404
  router.get('*', (req, res) => res.send({
    "error": 404
  }));

  app.use(router);
};

module.exports = routes;