const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");
const {
  renderSignUp,
  signup,
  renderLogin,
  login,
  logout,
} = require("../controllers/user.js");

// readable format of route
router.route("/signup")
    .get(wrapAsync(renderSignUp))
    .post(wrapAsync(signup));


// login route
router.get("/login", wrapAsync(renderLogin));


// passsport authenticate as middleware to check apssword and password and local for localStrategy
router.post("/login", saveRedirectUrl, passport.authenticate("local", { failureRedirect: "/login", failureFlash: true }), wrapAsync(login));

// we used passport to logout req.logout() use 

router.get("/logout", logout);

module.exports = router;