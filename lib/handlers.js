var _data = require("./data");
var helpers = require("./helpers");

var handlers = {};

handlers.hello = function (data, callback) {
  callback(200, { welcome: "Welcome to Pirple" });
};

handlers.notFound = function (data, callback) {
  callback(404);
};

handlers.user = function (data, callback) {
  var acceptableMethods = ["post", "get", "put", "delete"];
  if (acceptableMethods.indexOf(data.method) > -1) {
    handlers._users[data.method](data, callback);
  } else {
    callback(405);
  }
};

//container for users submethods
handlers._user = {};

// user post
handlers._user.post = function (data, callback) {
  var firstName =
    typeof data.payload.firstName == "string " &&
    data.payload.firstName.trim().length > 0
      ? data.payload.firstName.trim()
      : false;
  var lastName =
    typeof data.payload.lastName == "string " &&
    data.payload.lastName.trim().length > 0
      ? data.payload.lastName.trim()
      : false;
  var phone =
    typeof data.payload.phone == "string " &&
    data.payload.phone.trim().length == 10
      ? data.payload.phone.trim()
      : false;
  var password =
    typeof data.payload.password == "string " &&
    data.payload.password.trim().length > 0
      ? data.payload.password.trim()
      : false;
  var tosAgreement =
    typeof data.payload.tosAgreement == "boolean " &&
    data.payload.tosAgreement == true
      ? true
      : false;

  if (firstName && lastName && phone && password && tosAgreement) {
    // make sure that the user dosent already exist
    _data.read("users", phone, function (err, data) {
      if (err) {
        // hash the password
        var hashedPassword = helpers.hash(password);

        if (hashedPassword) {
          var userObject = {
            firstName,
            lastName,
            phone,
            hashedPassword,
            tosAgreement,
          };

          //store the user
          _data.create("users", phone, userObject, function (err) {
            if (!err) {
              callback(200);
            } else {
              console.log(err);
              callback(500, { err: "could not create the user" });
            }
          });
        } else {
          callback(500, { error: "could not hash the password" });
        }
      } else {
        callback(400, { error: "A user with that phone no already exist" });
      }
    });
  } else {
    callback(400, { Error: "missing required fields" });
  }
};

// user get
handlers._user.get = function (data, callback) {};
// user put
handlers._user.put = function (data, callback) {};
// user delete
handlers._user.delete = function (data, callback) {};

// export
module.exports = handlers;
