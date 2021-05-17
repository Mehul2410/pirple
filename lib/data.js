//library for storing and editing data

var fs = require("fs");
var path = require("path");

// container
var lib = {};

// path to base dir for data
lib.baseDir = path.join(__dirname, "/../.data/");

//write data to file
lib.create = function (dir, file, data, callback) {
  //open file for writing
  fs.open(
    lib.baseDir + dir + "/" + file + ".json",
    "wx",
    function (err, fileDescriptor) {
      if (!err && fileDescriptor) {
        var stringData = JSON.stringify(data);

        fs.writeFile(fileDescriptor, stringData, function (err) {
          if (!err) {
            fs.close(fileDescriptor, function (err) {
              if (!err) {
                callback(false);
              } else {
                callback("error closing");
              }
            });
          } else {
            callback("error writing to new file");
          }
        });
      } else {
        callback("error", err);
      }
    }
  );
};

//
module.exports = lib;
