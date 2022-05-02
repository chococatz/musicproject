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
    Song            = require("../models/song");

router.get("/", middleware.isLoggedIn, function(req, res){
    if(req.user.rank === "Member" || req.user.rank === "Premium"){
        req.flash("error", "You do not have permission to access the page");
        res.redirect("/home");
    }else{
        res.render("admin/addsong.ejs");
    }
});

router.post("/", upload.any([{name: "song[cover]"}, {name: "song[file]"}]), function(req, res){
    req.body.song.file = "/uploads/" + req.files[0].filename;
    req.body.song.cover = "/uploads/" + req.files[1].filename;
    Song.create(req.body.song, function(err, newlyCreated){
        if(err){
            console.log(err);
            req.flash("error", "Failed to add new song");
            res.redirect("/addsong");
        }else{
            req.flash("success", "Successfully added new song");
            res.redirect("/home");
        }
    });
});

module.exports = router;