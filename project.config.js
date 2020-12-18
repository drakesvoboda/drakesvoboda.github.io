var path = require("path");
var config = module.exports = {};

config.root = __dirname;

config.src = "./Source";
config.dest = "./Build";

config.srcFullPath = path.join(config.root, config.src);
config.destFullPath = path.join(config.root, config.dest);

config.js = "js";
config.assets = "assets";
config.styles = "styles";
