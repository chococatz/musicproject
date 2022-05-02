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
    User            = require("../models/user"),
    Song            = require("../models/song"),
    Favorite        = require("../models/favorite");

router.get("/", function(req, res){
    Song.find({}, function(err, allSong){
        if(err){
            console.log(err);
        }else{
            Song.aggregate([{$sample: {size: 12}}], function(err, allpopSong){
                if(err){
                    console.log(err);
                }else{
                    Song.find({}, function(err, counterfavSong){
                        if(err){
                            console.log(err);
                        }else{
                            res.render("home/home.ejs", {Song: allSong, popSong: allpopSong, mostfavSong: counterfavSong});
                        }
                    }).limit(12).sort({"fav_counter": -1});
                }
            })
        }
    }).limit(6).sort({"_id": -1});
});

router.get("/song/:id", function(req, res){
    if(req.user){
        var favList = new Array(req.user.favorite.length);
        for(let i=0; i<req.user.favorite.length; i++){
            favList[i] = req.user.favorite[i].toString();
        }
        Song.findById(req.params.id, function(err, foundSong){
            if(err){
                console.log(err);
            }else{
                Favorite.findOne({song_id: req.params.id, user_id: req.user.id}, function(err, findFavid){
                    if(err){
                        console.log(err);
                    }else if(findFavid){
                        res.render("home/songdesc.ejs", {Song: foundSong, favList: favList, favID: findFavid});
                    }else{
                        var FavID = "";
                        res.render("home/songdesc.ejs", {Song: foundSong, favList: favList, favID: FavID});
                    }
                })
            }
        });
    }else{
        Song.findById(req.params.id, function(err, foundSong){
            if(err){
                console.log(err);
            }else{
                res.render("home/songdesc.ejs", {Song: foundSong})
            }
        });
    }
});

router.get("/song/:id/edit", middleware.isLoggedIn, function(req, res){
    if(req.user.rank === "Member" || req.user.rank === "Premium"){
        req.flash("error", "You do not have permission to access the page");
        res.redirect("/home");
    }else{
        Song.findById(req.params.id, function(err, foundSong){
            if(err){
                console.log(err);
            }else{
                res.render("admin/editsong.ejs", {Song: foundSong});
            }
        });
    }
});

router.put("/song/:id", upload.single("song[cover]"), function(req, res){
    if(req.file){
        req.body.song.cover = "/uploads/" + req.file.filename;
    }
    Song.findByIdAndUpdate(req.params.id, req.body.song, function(err, updatedSong){
        if(err){
            req.flash("error", "Failed to edit the song");
            res.redirect("/home/");
        }else{
            req.flash("success", "Successfully edited the song");
            res.redirect("/home/song/" + req.params.id);
        }
    });
});

router.delete("/song/:id", function(req, res){
    Song.findByIdAndRemove(req.params.id, function(err){
        if(err){
            req.flash("error", "Failed to delete song");
            res.redirect("/home/");
        }else{
            Favorite.deleteMany({song_id: req.params.id}, function(err){
                if(err){
                    console.log(err);
                }else{
                    req.flash("success", "The song has been deleted successfully");
                    res.redirect("/home/");
                }
            })
        }
    });
});

router.post("/addfavorite/:id", function(req, res){
    User.findById(req.user._id, function(err, foundUser){
        if(err){
            console.log(err);
        }else{
            Favorite.create({user_id: req.user.id, song_id: req.params.id, name: req.query.title, artist: req.query.artist, album: req.query.album}, function(err, allfavorite){
                if(err){
                    console.log(err);
                    req.flash("error", "Failed to add to favorite");
                }else{
                    Song.findByIdAndUpdate(req.params.id, {$inc: {"fav_counter": 1}}, function(err, favCounter){
                        if(err){
                            console.log(err);
                        }else{
                            foundUser.favorite.push(allfavorite);
                            foundUser.save();
                            req.flash("success", "Successfully added to favorite");
                            res.redirect("back");
                        }
                    })
                }
            })
        }
    });
});

router.delete("/removefavorite/:id", function(req, res){
    Favorite.findByIdAndRemove(req.params.id, function(err, foundFav){
        if(err){
            req.flash("error", "Failed to remove song from favorite");
            res.redirect("back");
        }else{
            Song.findByIdAndUpdate(foundFav.song_id, {$inc: {"fav_counter": -1}}, function(err, favCounter){
                if(err){
                    console.log(err);
                }else{
                    req.flash("success", "Successfully removed song from favorite");
                    res.redirect("back");
                }
            })
        }
    });
});

router.get("/search/:key", function(req,res){
    var key = req.params.key;
    var capitalkey = key.charAt(0).toUpperCase() + key.slice(1).toLowerCase();
    Song.find(
        {$or:[
            {name:{$regex:'.*' + key + '.*'}},
            {name:{$regex:'.*' + key.toUpperCase() + '.*'}},
            {name:{$regex:'.*' + key.toLowerCase()}},
            {name:{$regex:'.*' + capitalkey + '.*'}}
        ]}, function(err, foundSong){
                if(err){
                    console.log(err);
                }else if(foundSong){
                    Song.find(
                        {$or:[
                            {artist:{$regex:'.*' + key + '.*'}},
                            {artist:{$regex:'.*' + key.toUpperCase() + '.*'}},
                            {artist:{$regex:'.*' + key.toLowerCase()}},
                            {artist:{$regex:'.*' + capitalkey + '.*'}}
                        ]}, function(err, foundArtist){
                                if(err){
                                    console.log(err);
                                }else if(foundArtist){
                                    Song.find(
                                        {$or:[
                                            {name:{$regex:'.*' + key + '.*'}},
                                            {name:{$regex:'.*' + key.toUpperCase() + '.*'}},
                                            {name:{$regex:'.*' + key.toLowerCase()}},
                                            {name:{$regex:'.*' + capitalkey + '.*'}}
                                        ]}, function(err, sortTitle){
                                            if(err){
                                                console.log(err);
                                            }else if(sortTitle){
                                                Song.find(
                                                    {$or:[
                                                        {artist:{$regex:'.*' + key + '.*'}},
                                                        {artist:{$regex:'.*' + key.toUpperCase() + '.*'}},
                                                        {artist:{$regex:'.*' + key.toLowerCase()}},
                                                        {artist:{$regex:'.*' + capitalkey + '.*'}}
                                                    ]}, function(err, sortArtist){
                                                        if(err){
                                                            console.log(err);
                                                        }else{
                                                            res.render("home/searchhome.ejs", {songSearch: foundSong, artistSearch: foundArtist, sortbyTitle: sortTitle, sortbyArtist: sortArtist});
                                                        }
                                                    }
                                                ).sort({"artist": -1});
                                            }
                                        }
                                    ).sort({"name": -1});
                                }
                            }
                    ).sort({"artist": 1});
                }    
            }
    ).sort({"name": 1});
});

router.post("/search", function(req,res){
    var searchkey = req.body.key;
    res.redirect("/home/search/" + searchkey);
});

module.exports = router;