const express = require("express");
const rss = require("../controllers/rss");
exports.rssRoutes = express.Router();
exports.rssRoutes.get("/", rss.getRssNewsController);
