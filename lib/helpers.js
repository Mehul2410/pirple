// helpers for various tasks

//dependencies
var crypto = require("crypto");
const config = require("./config");

// Container for all the helpers
var helpers = {};

// create a SHA256 hash
helpers.hash = function (str) {
  if (typeof str == "string" && str.length > 0) {
    var hash = crypto
      .createHmac("sha256", config.hashingSecret)
      .update(str)
      .digest("hex ");
  } else {
    return false;
  }
};

// parse a json string to a object in all cases without throwing
helpers.parseJsonToObject = function (str) {
  try {
    var obj = JSON.parse(str);
    return obj;
  } catch (e) {
    return {};
  }
};

//export

module.exports = helpers;
