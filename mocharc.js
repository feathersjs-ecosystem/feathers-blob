'use strict';
const path = require("path");

module.exports = {
  package: path.join(__dirname, "./package.json"),
  ui: "bdd",
  spec: [
    "./test/**/*.test.js",
  ],
  timeout: 20000
};
