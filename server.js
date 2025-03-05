const express = require("express");
const path = require("path");

const app = express();

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "https://pack-mas-5525b94af9e0.herokuapp.com");
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

app.use(express.static(__dirname + "/dist"));
app.get("/*", function (req, res) {
    res.sendFile(path.join(__dirname + "/dist/index.html"));
});

app.listen(process.env.PORT || 4200);
