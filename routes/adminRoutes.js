"use strict";
var jwt = require("jwt-simple");
var bodyParser = require("body-parser");
var generalConfig = require("../config/generalConfig");
var passport = require("../config/passport.js")();
const globalErrorHandler = require("../controllers/errorController");

module.exports = function (app) {
  app.use(passport.initialize());
  app.all("/admin/*", passport.authenticate(), function (req, res, next) {
    next();
  });

  app.all("/apis/*", passport.authenticate(), function (req, res, next) {
    next();
  });

  app.all("/api/*", function (req, res, next) {
    next();
  });
  /* Admin Other Routes */

  var postRoute = require("./postRoute.js");
  new postRoute(app);
  /* Admin Other Routes End*/

  // Global error handling
  app.use(globalErrorHandler);

  app.use(function (err, req, res, next) {
    var msg = {
      error_code: err.error,
      message: err.message ? err.message : err.error_description,
    };
    if (err.code === 401 || err.code === 503) {
      res.status(err.code).send(msg);
    } else {
      return res.json({
        code: err.code,
        status: "fail",
        error: true,
        message: err.message ? err.message : err.error_description,
      });
    }
  });
};
