// auth.js
var passport = require("passport");
var passportJWT = require("passport-jwt");
var generalConfig = require('./generalConfig');
var ExtractJwt = passportJWT.ExtractJwt;
var Strategy = passportJWT.Strategy;
var _ = require('lodash');

module.exports = function () {
  var params = {
    secretOrKey: generalConfig.secretKey,
    jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme("jwt")
  };
  var strategy = new Strategy(params, function (payload, done) {
    var currentDate = Date.now();
    if (payload.expDate <= currentDate) {
      var difference = currentDate - payload.expDate;
      var minutesDifference = Math.floor(difference / 1000 / 60);
      if (minutesDifference >= 1440) {
        // 1440 min = 1 day
        // return done(new Error("Token is expired. Please login again."), null);
        return done(null, { id: payload.id, token_expired: false });
      } else {
        // Send new token if expire
        // generalConfig.generateJwtToken(payload.id, function (res) {
        //   return done(null, { id: payload.id, token_expired: true, newToken: res.newToken });
        // });
        return done(null, { id: payload.id, token_expired: false });
      }
    } else {
      return done(null, { id: payload.id, token_expired: false });
    }
  });

  passport.use(strategy);
  return {
    initialize: function () {
      return passport.initialize();
    },
    authenticate: function () {
      return passport.authenticate("jwt", generalConfig.jwtSession);
    },
    validateEmailPassword(email, password, res) {
      user.findOne({ email: email, status: true })
        .then(function (user) { 
          if (user) {
            if (user.password == generalConfig.encryptPassword(password)) {
              res({ message: 'Login successful.', error: false, data: user });
            } else {
              res({ message: 'Oops! User credentials are invalid.', error: true, data: null });
            }
          } else {
            res({ message: 'Oops! User is inactive.', error: true, data: null });
          }
        }).catch(function (err) {
          res({ message: 'Oops! Something went wrong.', error: true, data: null });
        });
    },
  };
};
