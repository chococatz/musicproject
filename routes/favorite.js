var express         = require("express"),
    router          = express.Router(),
    middleware      = require("../middleware"),
    User            = require("../models/user"),
    Song            = require("../models/song"),
    Favorite        = require("../models/favorite");

router.get("/", middleware.isLoggedIn, function(req, res){
    User.findById(req.user._id).populate("favorite").exec(function(err, foundUser){
        if(err){
            console.log(err);
        }else{
            res.render("favorite/favorite.ejs", {User: foundUser});
        }
    });
});

router.delete("/remove/:id", function(req, res){
    Favorite.findByIdAndRemove(req.params.id, function(err, foundFav){
        if(err){
            req.flash("error", "Failed to remove song from favorite");
            res.redirect("/favorite/");
        }else{
            Song.findByIdAndUpdate(foundFav.song_id, {$inc: {"fav_counter": -1}}, function(err, favCounter){
                if(err){
                    console.log(err);
                }else{
                    req.flash("success", "Successfully removed song from favorite");
                    res.redirect("/favorite/");
                }
            })
        }
    });
});

router.get("/search/:key", middleware.isLoggedIn, function(req,res){
    var key = req.params.key;
    var capitalkey = key.charAt(0).toUpperCase() + key.slice(1).toLowerCase();
    Favorite.find(
        {$or:[
            {name:{$regex:'.*' + key + '.*'}, user_id: req.user.id},
            {name:{$regex:'.*' + key.toUpperCase() + '.*'}, user_id: req.user.id},
            {name:{$regex:'.*' + key.toLowerCase()}, user_id: req.user.id},
            {name:{$regex:'.*' + capitalkey + '.*'}, user_id: req.user.id}
        ]}, function(err, foundSong){
            if(err){
                console.log(err);
            }else if(foundSong){
                res.render("favorite/searchfavorite.ejs", {favSearch: foundSong});
            }
    })
});

router.post("/search", function(req,res){
    var searchkey = req.body.key;
    res.redirect("/favorite/search/" + searchkey);
});

module.exports = router;