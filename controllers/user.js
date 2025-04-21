const ExpressError = require("../utils/ExpressError.js");
const User = require("../models/user");

module.exports.renderSignUp = async (req, res) => {
  res.render("users/signup.ejs");
};

module.exports.signup = async (req, res) => {
  try {
    let { username, email, password } = req.body;
    const newUser = await new User({ username, email });
    const registereduser = await User.register(newUser, password);
    //   console.log(registereduser);
    req.login(registereduser, (err) => {
      if (err) return next(err);
      req.flash("success", "user is registered");
      res.redirect("/listing");
    });
  } catch (error) {
    req.flash("error", error.message);
    res.redirect("/signup");
  }
};

module.exports.renderLogin = async (req, res) => {
  res.render("users/login.ejs");
};

module.exports.login = async (req, res) => {
  req.flash("success", "Welcome back to Wanderlust!");
  const redirecturl = res.locals.redirectUrl || "/listing";
  res.redirect(redirecturl);
};

module.exports.logout = (req, res) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "you are logged out!");
    res.redirect("/listing");
  });
};
