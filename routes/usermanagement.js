var express         = require("express"),
    router          = express.Router(),
    multer          = require("multer"),
    path            = require("path"),
    middleware      = require("../middleware"),
    storage         = multer.diskStorage({
                        destination: function(req, file, callback){
                            callback(null, "./public/uploads/");
                        },
                        filename: function(req, file, callback){
                            callback(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
                        }
                    }),
    imageFilter     = function(req, file, callback){
                        if(file.fieldname === "song[cover]"){
                            if(!file.originalname.match(/.(jpg|jpeg|png|gif)$/i)){
                                return callback(new Error("Only JPG, JPEG, PNG and GIF image files are allowed only!"), false);
                            }
                        }else if(file.fieldname === 'song[file]'){
                            if(!file.originalname.match(/.(mp3)$/i)){
                                return callback(new Error("Only MP3 files are allowed!"), false);
                            } 
                        }
                        callback(null, true);
                    },
    upload          = multer({storage: storage, fileFilter: imageFilter}),
    User            = require("../models/user");

router.get("/", middleware.isLoggedIn, function(req, res){
    if(req.user.rank === "Member" || req.user.rank === "Premium"){
        req.flash("error", "You do not have permission to access the page");
        res.redirect("/home");
    }else{
        User.find({}, function(err, allUser){
            if(err){
                console.log(err);
            }else{
                res.render("admin/usermanagement.ejs", {User: allUser});
            }
        });
    }
});

router.get("/:id/edit", middleware.isLoggedIn, function(req, res){
    User.findById(req.params.id, function(err, foundUser){
        if(err){
            console.log(err);
        }else{
            res.render("admin/edituser.ejs", {User: foundUser});
        }
    });
});

router.put("/:id", upload.single("profile[profileimage]"), function(req, res){
    if(req.file){
        req.body.info.profileimage = "/uploads/" + req.file.filename;
    }
    User.findByIdAndUpdate(req.params.id, req.body.info, function(err, updatedUser){
        if(err){
            req.flash("error", "Failed to edit user profile");
            res.redirect("/usermanagement/");
        }else{
            req.flash("success", "Successfully edited user profile");
            res.redirect("/usermanagement/");
        }
    });
});

router.delete("/delete/:id", function(req, res){
    User.findByIdAndRemove(req.params.id, function(err){
        if(err){
            req.flash("error", "Failed to delete user profile");
            res.redirect("/usermanagement/");
        }else{
            req.flash("success", "Successfully deleted user profile");
            res.redirect("/usermanagement/");
        }
    });
});

router.get("/search/:key", middleware.isLoggedIn, function(req,res){
    var key = req.params.key;
    var capitalkey = key.charAt(0).toUpperCase() + key.slice(1).toLowerCase();
    User.find(
        {$or:[
            {username:{$regex:'.*' + key + '.*'}},
            {username:{$regex:'.*' + key.toUpperCase() + '.*'}},
            {username:{$regex:'.*' + key.toLowerCase()}},
            {username:{$regex:'.*' + capitalkey + '.*'}}
        ]}, function(err, foundUser){
            if(err){
                console.log(err);
            }else if(foundUser){
                res.render("admin/searchuser.ejs", {userSearch: foundUser});
            }
    })
});

router.post("/search", function(req,res){
    var searchkey = req.body.key;
    res.redirect("/usermanagement/search/" + searchkey);
});

module.exports = router;