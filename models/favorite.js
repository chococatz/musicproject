var mongoose = require("mongoose");

var FavoriteSchema = new mongoose.Schema
(
    {
        user_id: String,
        song_id:
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Song"
        },
        name: String,
        artist: String,
        album: String
    }
);

module.exports = mongoose.model("Favorite", FavoriteSchema);