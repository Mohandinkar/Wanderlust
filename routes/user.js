const express = require("express");
const router = express.Router();
exports.router = router;
const User = require("../models/user");
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware");
const userController = require("../controllers/user")

router.route("/signup")
.get(userController.renderSignupForm)
.post(
  wrapAsync(userController.signup)
);

// router.get("/signup", (req, res) => {
//   res.render("./users/signup.ejs");
// });

// router.post(
//   "/signup",
//   wrapAsync(userController.signup)
// );

//login
router.route("/login")
.get( userController.renderLoginForm)
.post(
  saveRedirectUrl,
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  userController.login
);

// router.get("/login", userController.renderLoginForm);

// router.post(
//   "/login",
//   saveRedirectUrl,
//   passport.authenticate("local", {
//     failureRedirect: "/login",
//     failureFlash: true,
//   }),
//   userController.login
// );

//logout
router.get("/logout",userController.logout)

module.exports = router;
