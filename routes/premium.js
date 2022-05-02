var express         = require("express"),
    router          = express.Router(),
    middleware      = require("../middleware"),
    User            = require("../models/user");

router.get("/", function(req, res){
    res.render("premium/premium.ejs");
});

router.get("/get", middleware.isLoggedIn, function(req, res){
    if(req.user){
        if(req.user.rank === "Member"){
            var rankupdate = {$set: {rank:"Premium"}};
            User.updateOne({_id: req.user._id}, rankupdate, function(err, rankUpdated){
                if(err){
                    console.log(err);
                }else{
                    req.flash("success", "Successfully upgraded to premium");
                    res.redirect("/home");
                }
            })
        }else if(req.user.rank === "Premium"){
            req.flash("error", "You are already a membership");
            res.redirect("/home");
        }else if(req.user.rank === "Admin"){
            req.flash("error", "You are admin");
            res.redirect("/home");
        }
    }else{
        res.redirect("/premium");
    }
});

module.exports = router;