var express         = require("express"),
    app             = express(),
    bodyParser      = require("body-parser"),
    methodOverride  = require("method-override"),
    flash           = require("connect-flash"),
    mongoose        = require("mongoose"),
    passport        = require("passport"),
    LocalStrategy   = require("passport-local"),
    multer          = require("multer"),
    path            = require("path"),
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
                        }else if(file.fieldname === "song[file]"){
                            if(!file.originalname.match(/.(mp3)$/i)){
                                return callback(new Error("Only MP3 files are allowed!"), false);
                            } 
                        }
                        callback(null, true);
                    },
    upload          = multer({storage: storage, fileFilter: imageFilter}),
    User            = require("./models/user"),
    Song            = require("./models/song"),
    Favorite        = require("./models/favorite");

var indexRoutes                 = require("./routes/index"),
    homeRoutes                  = require("./routes/home"),
    favoriteRoutes              = require("./routes/favorite"),
    profileRoutes               = require("./routes/profile"),
    addsongRoutes               = require("./routes/addsong"),
    usermanagementRoutes        = require("./routes/usermanagement"),
    premiumRoutes               = require("./routes/premium");

mongoose.connect("mongodb://localhost/project");
// mongoose.set("useFindAndModify", false);
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.use(methodOverride("_method"));
app.use(flash());
app.set("view engine", "ejs");

app.use(require("express-session")({
    secret: "secret is always secret",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

app.use("/", indexRoutes);
app.use("/home", homeRoutes);
app.use("/favorite", favoriteRoutes);
app.use("/profile", profileRoutes);
app.use("/addsong", addsongRoutes);
app.use("/usermanagement", usermanagementRoutes);
app.use("/premium", premiumRoutes);

app.get("*", function(req, res){
    req.flash("error", "Sorry, page not found");
    res.redirect("/home");
});

app.listen(1999, function(){
    console.log("Server is running!");
    console.log("---------------------------");
});