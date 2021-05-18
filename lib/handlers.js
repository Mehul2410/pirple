var _data = require("./data");
var helpers = require("./helpers");

var handlers = {};

handlers.users = function (data, callback) {
  var acceptableMethods = ["post", "get", "put", "delete"];
  if (acceptableMethods.indexOf(data.method) > -1) {
    handlers._users[data.method](data, callback);
  } else {
    callback(405);
  }
};

//container for users submethods
handlers._users = {};

// user post
handlers._users.post = function (data, callback) {
  var firstName =
    typeof data.payload.firstName == "string" &&
    data.payload.firstName.trim().length > 0
      ? data.payload.firstName
      : false;
  var lastName =
    typeof data.payload.lastName == "string" &&
    data.payload.lastName.trim().length > 0
      ? data.payload.lastName
      : false;
  var phone =
    typeof data.payload.phone == "string" &&
    data.payload.phone.trim().length == 10
      ? data.payload.phone
      : false;
  var password =
    typeof data.payload.password == "string" &&
    data.payload.password.trim().length > 10
      ? data.payload.password
      : false;
  var tosAgreement =
    typeof data.payload.tosAgreement == "boolean" &&
    data.payload.tosAgreement == true
      ? true
      : false;
  console.log(
    typeof data.payload.tosAgreement == "boolean" &&
      data.payload.tosAgreement == true
      ? true
      : false
  );

  if (firstName && lastName && phone && password && tosAgreement) {
    // make sure that the user dosent already exist
    _data.read("users", phone, function (err, data) {
      if (err) {
        // hash the password
        var hashedPassword = helpers.hash(password);

        if (hashedPassword) {
          var userObject = {
            firstName: firstName,
            lastName: lastName,
            phone: phone,
            hashedPassword: hashedPassword,
            tosAgreement: true,
          };

          //store the user
          _data.create("users", phone, userObject, function (err) {
            if (!err) {
              callback(200);
            } else {
              console.log(err);
              callback(500, { error: "could not create the user" });
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
// required data phone
// optional data none
// @TODO only let an authenticated user access their object
handlers._users.get = function (data, callback) {
  // check the phone no provided is valid
  var phone =
    typeof data.queryStringObject.phone == "string" &&
    data.queryStringObject.phone.trim().length == 10
      ? data.queryStringObject.phone.trim()
      : false;
  if (phone) {
    //get the token from the headers
    var token =
      typeof data.headers.token == "string" ? data.headers.token : false;

    //verify that the give token is valid for the phone number
    handlers.tokens.verifyToken(token, phone, function (tokenIsValid) {
      if (tokenIsValid) {
        _data.read("users", phone, function (err, data) {
          if (!err && data) {
            // remove the hashed password form the user object before returning it to the user
            delete data.hashedPassword;
            callback(200, data);
          } else {
            callback(404);
          }
        });
      } else {
        callback(403, { err: "missing token or token is invalid" });
      }
    });
  } else {
    callback(400, { err: "missiing req field" });
  }
};
// user put
//required data: phone
// optional data : everything

handlers._users.put = function (data, callback) {
  // check for the required filed
  var phone =
    typeof data.payload.phone == "string" &&
    data.payload.phone.trim().length == 10
      ? data.payload.phone
      : false;
  var firstName =
    typeof data.payload.firstName == "string" &&
    data.payload.firstName.trim().length > 0
      ? data.payload.firstName
      : false;
  var lastName =
    typeof data.payload.lastName == "string" &&
    data.payload.lastName.trim().length > 0
      ? data.payload.lastName
      : false;
  var password =
    typeof data.payload.password == "string" &&
    data.payload.password.trim().length > 10
      ? data.payload.password
      : false;

  console.log(data);
  // error if the phone is invalid
  if (phone) {
    if (firstName || lastName || password) {
      var token =
        typeof data.headers.token == "string" ? data.headers.token : false;

      //verify that the give token is valid for the phone number
      handlers.tokens.verifyToken(token, phone, function (tokenIsValid) {
        if (tokenIsValid) {
          _data.read("users", phone, function (err, userData) {
            if (!err && userData) {
              if (firstName) {
                userData.firstName = firstName;
              }
              if (lastName) {
                userData.lastName = lastName;
              }
              if (password) {
                userData.hashedPassword = helpers.hash(password);
              }
              // store the new updates
              _data.update("users", phone, userData, function (err) {
                if (!err) {
                  callback(200);
                } else {
                  console.log(err);
                  callback(500, { Err: "could not update the user" });
                }
              });
            } else {
              callback(400, { err: "the specified user does not exist" });
            }
          });
        } else {
          callback(403, { err: "missing token or token is invalid" });
        }
      });
    } else {
      callback(400, { err: "missing field to update" });
    }
  } else {
    callback(400, { err: "missing required field" });
  }
};
// user delete
// required field phone
// @todo only let authenticated user to delete his data

handlers._users.delete = function (data, callback) {
  var phone =
    typeof data.queryStringObject.phone == "string" &&
    data.queryStringObject.phone.trim().length == 10
      ? data.queryStringObject.phone.trim()
      : false;
  if (phone) {
    var token =
      typeof data.headers.token == "string" ? data.headers.token : false;

    //verify that the give token is valid for the phone number
    handlers.tokens.verifyToken(token, phone, function (tokenIsValid) {
      if (tokenIsValid) {
        _data.read("users", phone, function (err, data) {
          if (!err) {
            _data.delete("users", phone, function (err) {
              if (!err) {
                callback(false);
              } else {
                console.log(err);
                callback(400);
              }
            });
          } else {
            callback(403, { err: "missing token or token is invalid" });
          }
        });
      } else {
        callback(400, { err: "user doesnot exist" });
      }
    });
  } else {
    callback(400, { err: "missing required fiels" });
  }
};

// tokens
handlers.tokens = function (data, callback) {
  var acceptableMethods = ["post", "get", "put", "delete"];
  if (acceptableMethods.indexOf(data.method) > -1) {
    handlers._tokens[data.method](data, callback);
  } else {
    callback(405);
  }
};

// container
handlers._tokens = {};

//required data : phone and password
handlers._tokens.post = function (data, callback) {
  var phone =
    typeof data.payload.phone == "string" &&
    data.payload.phone.trim().length == 10
      ? data.payload.phone
      : false;
  var password =
    typeof data.payload.password == "string" &&
    data.payload.password.trim().length > 10
      ? data.payload.password
      : false;

  if (phone && password) {
    // look for user who matches that phone numbera
    _data.read("users", phone, function (err, userData) {
      if (!err && userData) {
        // hash the sent password and compare it in the data
        var hashedPassword = helpers.hash(password);
        if (hashedPassword == userData.hashedPassword) {
          // if Valid create a new token with a random name , set expiration date 1 hours in he fuuture
          var tokenId = helpers.createRandomString(20);
          var expires = Date.now() + 1000 * 60 * 60;
          var tokenObject = {
            phone: phone,
            id: tokenId,
            expires: expires,
          };

          // store the token
          _data.create("tokens", tokenId, tokenObject, function (err) {
            if (!err) {
              callback(200, tokenObject);
            } else {
              callback(500, { err: "could not create the new token" });
            }
          });
        } else {
          callback(400, {
            err: "password did not match the specified users stored password",
          });
        }
      } else {
        callback(400, { err: "could not find the specified user" });
      }
    });
  } else {
    callback(400, { err: "missing required fields" });
  }
};

// tokens -get
// required data : id
// optional data : none
handlers._tokens.get = function (data, callback) {
  // check the phone no provided is valid
  var id =
    typeof data.queryStringObject.id == "string" &&
    data.queryStringObject.id.trim().length == 20
      ? data.queryStringObject.id.trim()
      : false;
  if (id) {
    _data.read("tokens", id, function (err, tokenData) {
      if (!err && tokenData) {
        // remove the hashed password form the user object before returning it to the user
        callback(200, tokenData);
      } else {
        callback(404);
      }
    });
  } else {
    callback(400, { err: "missiing req field" });
  }
};

//token - put
// required data: id , extend
// optional data : none
handlers._tokens.put = function (data, callback) {
  var id =
    typeof data.payload.id == "string" && data.payload.id.trim().length == 20
      ? data.payload.id.trim()
      : false;
  var extend =
    typeof data.payload.extend == "boolean" && data.payload.extend == true
      ? true
      : false;
  if (id && extend) {
    // look up the token
    _data.read("tokens", id, function (err, tokenData) {
      if (!err && tokenData) {
        // checl the token isnt already expired
        if (tokenData.expires > Date.now()) {
          tokenData.expires = Date.now() * 1000 * 60 * 60;
          _data.update("tokens", id, tokenData, function (err) {
            if (!err) {
              callback(200);
            } else {
              callback(500, { err: "could not udpate the token expiration" });
            }
          });
        } else {
          callback(400, {
            err: "token has already expired and cannot be extended",
          });
        }
      } else {
        callback(400, { err: "specified token does not exist" });
      }
    });
  } else {
    callback(400, { err: "missing required fields or the fields are invalid" });
  }
};
handlers._tokens.delete = function (data, callback) {
  var id =
    typeof data.queryStringObject.id == "string" &&
    data.queryStringObject.id.trim().length == 20
      ? data.queryStringObject.id.trim()
      : false;
  if (id) {
    _data.read("tokens", id, function (err, tokenData) {
      if (!err && tokenData) {
        _data.delete("tokens", id, function (err) {
          if (!err) {
            callback(false);
          } else {
            console.log(err);
            callback(400);
          }
        });
      } else {
        callback(400, { err: "user doesnot exist" });
      }
    });
  } else {
    callback(400, { err: "missing required fiels" });
  }
};

// verify if the given token id is currently valid for a given user
handlers.tokens.verifyToken = function (id, phone, callback) {
  // look up the token
  _data.read("tokens", id, function (err, tokenData) {
    if (!err && tokenData) {
      //check that the token is for the give user and has not expired
      if (tokenData.phone == phone && tokenData.expires > Date.now()) {
        callback(true);
      } else {
        callback(false);
      }
    } else {
      callback(false);
    }
  });
};

handlers.hello = function (data, callback) {
  callback(200, { welcome: "Welcome to Pirple", data });
};

handlers.notFound = function (data, callback) {
  callback(404);
};

// export
module.exports = handlers;
