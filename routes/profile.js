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
    res.render("profile/profile.ejs");
});

router.get("/edit", middleware.isLoggedIn, function(req, res){
    User.findById(req.params.id, function(err, foundUser){ 
        if(err){
            console.log(err);
        }else{
            res.render("profile/editprofile.ejs", {User: foundUser});
        }
    });
});

router.put("/edit/:id", upload.single("profile[profileimage]"), function(req, res){
    if(req.file){
        req.body.profile.profileimage = "/uploads/" + req.file.filename;
    }
    User.findByIdAndUpdate(req.params.id, req.body.profile, function(err, updatedProfile){
        if(err){
            req.flash("error", "Failed to edit profile");
            res.redirect("/profile/");
        }else{
            req.flash("success", "Successfully edited profile");
            res.redirect("/profile/");
        }
    });
});

router.get("/changepassword", middleware.isLoggedIn, function(req, res){
    res.render("profile/changepassword.ejs");
});

router.post("/changepassword", function(req, res){
    var currentpassword = req.body.currentpassword;
    var newpassword = req.body.newpassword;
    var renewpassword = req.body.renewpassword;
    if(newpassword === renewpassword){
        User.findOne({_id:req.user._id},function(err,User){
            if(err){
                console.log(err);
            }
            else if(User){
               User.changePassword(currentpassword, newpassword, function(err, changepassword){
            if(err){
                console.log(err);
                req.flash("error", err.message);
                res.redirect("/profile");
            }
            else if(changepassword){
                req.flash("success", "Password change successfully");
                res.redirect("/profile");
            }
        }); 
            }
        })
    }
    else if(newpassword !== renewpassword){
        req.flash("error", "New password and repeat new password do not match");
        res.redirect("/profile/changepassword");
    }
});

router.delete("/delete/:id", function(req, res){
    User.findByIdAndRemove(req.params.id, function(err){
        if(err){
            req.flash("error", "Failed to delete user profile");
            res.redirect("/home/");
        }else{
            req.flash("success", "Successfully deleted profile, please log in again");
            res.redirect("/home/");
        }
    });
});

module.exports = router;