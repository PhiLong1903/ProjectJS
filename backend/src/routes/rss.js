const express_1 = require("express");
const rss_1 = require("../controllers/rss");
exports.rssRoutes = express_1.Router();
exports.rssRoutes.get("/", rss_1.getRssNewsController);
