require("dotenv").config();
const express = require("express");
const cors = require("cors");
const dns = require("dns");
const app = express();
const url = require("url");

// Basic Configuration
const port = process.env.PORT || 3000;
let urlcounter = 0;
const short_urls = [];

const urlChecker = (req, res, next) => {
  const originalUrl = req.body.url;
  const parsedUrl = url.parse(originalUrl);
  const hostname = parsedUrl.hostname;
  dns.lookup(hostname, (err, address) => {
    if (err) {
      return res.json({ error: "invalid url" });
    } else {
      next();
    }
  });
};

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});

app.post("/api/shorturl", urlChecker, function (req, res) {
  urlcounter++;
  const url = { original_url: req.body.url, short_url: urlcounter };
  short_urls.push(url);
  res.json({
    original_url: req.body.url,
    short_url: urlcounter,
  });
});

app.get("/api/shorturl/:id", function (req, res) {
  const urlId = Number(req.params.id);
  console.log(urlId, short_urls);
  const urlFound = short_urls.find((url) => url.short_url === urlId);
  if (urlFound) {
    res.redirect(urlFound.original_url);
  } else {
    res.status(404).json({ error: "invalid url" });
  }
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
