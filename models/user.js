var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var UserSchema = new mongoose.Schema 
(
    {
        username: String,
        password: String,
        email: String,
        profilename: String,
        profileimage: String,
        rank:
        {
            type: String,
            default: "Member"
        },
        favorite:[
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Favorite"
            }
        ]
    }
);

UserSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("User", UserSchema);