// setup app and requires
var express = require('express'),
    ejs = require('ejs'),
    app = express(),
    mongoose = require('mongoose'),
    url = process.env.MONGOLAB_URI;

// set views to render html
app.set("view engine", "ejs");

// connect to mLab DB
mongoose.connect(process.env.MONGOLAB_URI, {useMongoClient: true}, function(err, db) {
    if (err) {
        console.log("There was an error connecting to the database..");
    } else {
        console.log("Connected to database!");
    }
});

// setup schema
var urlSchema = new mongoose.Schema({
    original: String,
    minified: String
});

var Entry = mongoose.model("Entry", urlSchema);

// Test create
// Entry.create({
//     original: "http://google.com",
//     minified: "http://g.com"
// });

app.get("/", function(req, res) {
    res.render("index");
});



app.listen(3000, function() {
    console.log("Server listening on port 3000...");
});