//library for storing and editing data

var fs = require("fs");
var path = require("path");
const helpers = require("./helpers");

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

//read data from file

lib.read = function (dir, file, callback) {
  fs.readFile(
    lib.baseDir + dir + "/" + file + ".json",
    "utf8",
    function (err, data) {
      if (!err && data) {
        var parsedData = helpers.parseJsonToObject(data);
        callback(false, parsedData);
      } else {
        callback(err, data);
      }
    }
  );
};

//update inside the file
lib.update = function (dir, file, data, callback) {
  //open the file for writing
  fs.open(
    lib.baseDir + dir + "/" + file + ".json",
    "r+",
    function (err, fileDescriptor) {
      if (!err && fileDescriptor) {
        var stringData = JSON.stringify(data);
        fs.truncate(fileDescriptor, function (err) {
          if (!err) {
            // write to the file and close it
            fs.writeFile(fileDescriptor, stringData, function (err) {
              if (!err) {
                fs.close(fileDescriptor, function (err) {
                  if (!err) {
                    callback(false);
                  } else {
                    callback("error closing the file");
                  }
                });
              } else {
                callback("error writing ");
              }
            });
          } else {
            callback("error truncating file");
          }
        });
      } else {
        callback("file does not exist");
      }
    }
  );
};

//deleting the file

lib.delete = function (dir, file, callback) {
  // unlink the file
  fs.unlink(lib.baseDir + dir + "/" + file + ".json", function (err) {
    if (!err) {
      callback(false);
    } else {
      callback(err);
    }
  });
};

//
module.exports = lib;
