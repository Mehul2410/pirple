// Environment
var environments = {};

//staging environment
environments.staging = {
  httpPort: 3000,
  httpsPort: 3001,
  envName: "stading",
  hashsingSecet: "thisIsASecret",
};

environments.production = {
  httpPort: 5000,
  httpsPort: 5001,
  envName: "production",
  hashsingSecet: "thisIsASecret",
};

// determine which env was passed as a commandline arugument
var currentEnvironment =
  typeof process.env.NODE_ENV == "string"
    ? process.env.NODE_ENV.toLowerCase()
    : "";

var environmentToExport =
  typeof environments[currentEnvironment] == "object"
    ? environments[currentEnvironment]
    : environments.staging;

module.exports = environmentToExport;
