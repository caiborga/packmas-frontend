const express = require("express");
const path = require("path");

const app = express();

var distDir = __dirname + "/dist/";

app.use((req, res, next) => {
    res.setHeader(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, OPTIONS"
    );
    res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization"
    );
    next();
});

app.use(express.static(__dirname + "/dist/browser"));
app.get("/*", function (req, res) {
    res.sendFile(path.join(__dirname + "/dist/browser/index.html"));
});

app.listen(process.env.PORT || 4200);
