const http = require("http");
const https = require("https");
const url = require("url");
var StringDecoder = require("string_decoder").StringDecoder;
var config = require("./config");
var fs = require("fs");
var _data = require("./lib/data");

//testing
// @todo delete this
//create
// _data.create("test", "newFile", { foo: "bar" }, function (err) {
//   console.log("err", err);
// });

//read
// _data.read("test", "newFile", function (err, data) {
//   console.log("err", err, data);
// });

//update
// _data.update("test", "newFile", { fizz: "buzz" }, function (err, data) {
//   console.log("err", err);
// });

//delete
// _data.delete("test", "newFile", function (err) {
//   console.log("err", err);
// });

const httpServer = http.createServer(function (req, res) {
  unifiedServer(req, res);
});

httpServer.listen(config.httpPort, function () {
  console.log(
    "listeing " + config.httpPort + " in " + config.envName + " now "
  );
});

//https
var httpsServerOptions = {
  key: fs.readFileSync("./https/key.pem"),
  cert: fs.readFileSync("./https/cert.pem"),
};

const httpsServer = https.createServer(httpsServerOptions, function (req, res) {
  unifiedServer(req, res);
});

//https server
httpsServer.listen(config.httpsPort, function () {
  console.log(
    "listeing " + config.httpsPort + " in " + config.envName + " now "
  );
});

// unified server

var unifiedServer = function (req, res) {
  var parsedUrl = url.parse(req.url, true);

  var path = parsedUrl.pathname;

  var trimmedPath = path.replace(/^\/+|\/+$/g, "");

  var method = req.method.toLowerCase();

  var queryStringObject = parsedUrl.query;

  var headers = req.headers;

  var decoder = new StringDecoder("utf-8");
  var buffer = "";

  req.on("data", function (data) {
    buffer += decoder.write(data);
  });

  req.on("end", function () {
    buffer += decoder.end();

    var chosenHandler =
      typeof router[trimmedPath] !== "undefined"
        ? router[trimmedPath]
        : handlers.notFound;

    var data = {
      trimmedPath: trimmedPath,
      queryStringObject: queryStringObject,
      method: method,
      headers: headers,
      payload: buffer,
    };

    chosenHandler(data, function (statusCode, payload) {
      statusCode = typeof statusCode == "number" ? statusCode : 200;
      payload = typeof payload == "object" ? payload : {};

      var payloadString = JSON.stringify(payload);
      res.setHeader("Content-Type", "application/json");
      res.writeHead(statusCode);
      res.end(payloadString);

      console.log("res", statusCode, payloadString);
    });
  });
};

var handlers = {};

handlers.hello = function (data, callback) {
  callback(200, { welcome: "Welcome to Pirple" });
};

handlers.notFound = function (data, callback) {
  callback(404);
};

var router = {
  hello: handlers.hello,
};
