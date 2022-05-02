var mongoose = require("mongoose");

var SongSchema = new mongoose.Schema
(
    {
        name: String,
        lyrics: String,
        artist: String,
        album: String,
        genre: String,
        cover: String,
        file: String,
        fav_counter:
        {
            type: Number,
            default: 0
        }
    }
);

module.exports = mongoose.model("Song", SongSchema);