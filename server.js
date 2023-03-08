const express = require('express'),
      app = express(),
      initRoutes = require("./src/routes"),
      dotenv = require('dotenv'),
      cors = require('cors');

dotenv.config();

app.use(cors({
  origin: '*'
}));
app.use(express.urlencoded({ extended: true }));

initRoutes(app);

app.listen(process.env.PORT, () => {
  console.info(`[Info] Running at localhost: ${process.env.PORT}`);
});