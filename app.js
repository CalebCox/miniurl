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

var urlSchema = new mongoose.Schema({
    original: String,
    minified: String
});

// // setup schema
// var urlSchema = new mongoose.Schema({
//     original: String,
//     minified: String
// });

// var Entry = mongoose.model("Entry", urlSchema);

// Test create
// Entry.create({
//     original: "http://google.com",
//     minified: "http://g.com"
// });

app.get("/", function(req, res) {
    res.render("index");
});

app.get("/new/:url(*)", function(req, res) {
    var userInput = req.params.url;

    // connect to mLab DB
    mongoose.connect(process.env.MONGOLAB_URI, {useMongoClient: true}, function(err, db) {
        if (err) {
            console.log("There was an error connecting to the database..");
        } else {
            console.log("Connected to database!");
        }
    });

    // setup schema
    // var urlSchema = new mongoose.Schema({
    //     original: String,
    //     minified: String
    // });
    var schema = urlSchema;

    var Entry = mongoose.model("Entry", schema);

    if (validUrl.isUri(userInput)) {
        var minified = shortId.generate();

        Entry.create({
            original: userInput,
            minified: "localhost:3001/" + minified
        });

        console.log("localhost:3001/" + minified);
        res.json({
            original: userInput,
            minified: "localhost:3001/" + minified
        });
        
        mongoose.connection.close( function() {
            console.log("DB Connection closed!");
        });
    } else {
        res.json({
            error: "Invalid URL was entered"
        });
    };
});

app.get("/:minified", function(req, res) {
    mongoose.connect(process.env.MONGOLAB_URI, {useMongoClient: true}, function(err, db) {
        if (err) {
            console.log("There was an error connecting to the database");
        } else {
            console.log("Connected to database!");
        }
    });

    // This local variable declaration is broke, outputs as undefined [object Object].
    var schema = urlSchema;

    console.log("Schema: " + schema);

    var Entry = mongoose.model("Entry", schema);

    Entry.findOne({ "minified": "localhost:3001/" + req.params.minified }, function(err, doc) {

        console.log(req.params.minified);

        if (doc != null) {
            res.redirect(doc.url);
            console.log("Link: " + doc);
        } else {
            res.json({ error: "No such link found" });
        }
    });    

    mongoose.connection.close( function() {
        console.log("DB Connection closed!");
    });
});

app.listen(3001, function() {
    console.log("Server listening on port 3001...");
});