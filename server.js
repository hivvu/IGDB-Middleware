const express = require('express'),
      app = express(),
      initRoutes = require("./src/routes"),
      dotenv = require('dotenv');

dotenv.config();

app.use(express.urlencoded({ extended: true }));

initRoutes(app);

app.listen(process.env.PORT, () => {
  console.info(`[Info] Running at localhost: ${process.env.PORT}`);
});