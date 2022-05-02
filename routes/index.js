var express         = require("express"),
    router          = express.Router(),
    passport        = require("passport"),
    User            = require("../models/user");

router.get("/", function(req, res){
    res.render("index/index.ejs");
});

router.get("/login", function(req, res){
    res.render("index/login.ejs");
});

router.post("/login", passport .authenticate("local",
    {
        failureRedirect: "/login",
        successFlash: true,
        failureFlash: true,
        successFlash: "Log in successfully"
    }), function(req, res){
            if(req.body.remember){
                req.session.cookie.maxAge = 86400000;
                res.redirect("/home");
            }else{
                req.session.cookie.expires = false;
                res.redirect("/home");
            }
});

router.get("/signup", function(req, res){
    res.render("index/signup.ejs");
});

router.post("/signup", function(req, res){
    var newUser = new User({username: req.body.username, email: req.body.email, profilename: req.body.profilename, profileimage: req.body.profileimage});
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            req.flash("error", err.message);
            return res.redirect("/signup");
        }
        passport.authenticate("local")(req, res, function(){
            req.flash("success", "Sign up successfully");
            res.redirect("/home");
        });
    });
});

router.get("/logout", function(req, res){
    req.logout();
    req.flash("success", "Successfully logged out.");
    res.redirect("/home");
});

module.exports = router;