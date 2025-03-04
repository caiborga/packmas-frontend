const express = require("express");
const path = require("path");
const helmet = require("helmet");

const app = express();

app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:", "https://pack-mas-5525b94af9e0.herokuapp.com"],
          connectSrc: ["'self'", "https://packmas-c545d34ac462.herokuapp.com"],
          frameAncestors: ["'self'"],
        },
      },
    })
);

app.use(express.static(__dirname + "/dist/packmas"));

app.get("/*", function (req, res) {
    res.sendFile(path.join(__dirname + "/dist/packmas/index.html"));
});
app.listen(process.env.PORT || 8080);
