// setup app and requires
var express = require('express'),
    ejs = require('ejs'),
    app = express(),
    validUrl = require('valid-url'),
    shortId = require('shortid'),
    mongoose = require('mongoose'),
    url = process.env.MONGOLAB_URI;

// set views to render html
app.set("view engine", "ejs");

// // connect to mLab DB
// mongoose.connect(process.env.MONGOLAB_URI, {useMongoClient: true}, function(err, db) {
//     if (err) {
//         console.log("There was an error connecting to the database..");
//     } else {
//         console.log("Connected to database!");
//     }
// });

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

app.get("/new/:url(*)", function(req, res, next) {
    var userInput = req.params.url;

    // connect to mLab DB
    mongoose.connect(process.env.MONGOLAB_URI, {useMongoClient: true}, function(err, db) {
        if (err) {
            console.log("There was an error connecting to the database..");
        } else {
            console.log("Connected to database!");

            var  newEntry = function (db, callback) {
                if (validUrl.isUri(userInput)) {
                    var minified = shortId.generate();
                    // Entry.create({
                    //     original: userInput,
                    //     minified: process.env.APP_URL + "/" + minified
                    // });

                    // APP_URL doesn't work within local host.
                    console.log(process.env.APP_URL + "/" + minified);
                    res.json({
                        original: userInput,
                        minified: process.env.APP_URL + "/" + minified
                    });
                } else {
                    res.json({
                        error: "Invalid URL was entered"
                    });
                };
            };
            newEntry(db, function() {
                db.close();
            });
        }
    });
});

app.listen(3000, function() {
    console.log("Server listening on port 3000...");
});