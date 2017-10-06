/* 
   Attempted to get this working with Mongoose and it failed originally..
   After using Michael Lefkowitz tutorial for reference and assistance
   I have this working locally but it appears to have an issue when on
   Glitch.me @ four-runner.glitch.me.

   Thanks to Michale Lefkowitz for this tutorial here: 
   http://lefkowitz.me/thoughts/2016/05/05/men-stack-building-a-url-shortener-with-mongodb-express-and-node-js/
*/

// setup app and requires
const express = require('express'),
    ejs = require('ejs'),
    app = express(),
    validUrl = require('valid-url'),
    shortId = require('shortid'),
    mongodb = require('mongodb'),
    MongoClient = mongodb.MongoClient,
    url = process.env.MONGOLAB_URI;

// set views to render html
app.set("view engine", "ejs");


app.get("/", function(req, res) {
    res.render("index");
});

app.get("/new/:url(*)", function(req, res, next) {
    var host = req.get('host') + "/";
    var userInput = req.params.url;

    // connect to mLab DB
    MongoClient.connect(process.env.MONGOLAB_URI, function(err, db) {
        if (err) {
            console.log("There was an error connecting to the database..");
        } else {
            console.log("Connected to database!");

            var collection = db.collection('entries');

            var newEntry = function(db, callback) {
                collection.findOne({ "original": userInput }, { minified: 1, _id: 0 }, function(err, doc) {
                    if (doc != null) {
                        res.json({
                            original: userInput,
                            minified: host + doc.minified
                        });
                    } else {
                        if (validUrl.isUri(userInput)) {
                            var minified =  shortId.generate();
                            var entry = { original: userInput, minified: minified };
                            collection.insert([entry]);
                            console.log("added new entry!");
                            res.json({
                                original: userInput,
                                minified: host + minified
                            });
                        } else {
                            res.json({ error: "Incorrect URL Format"});
                        };
                    };
                });
            };

            newEntry(db, function() {
                db.close();
            });
        };
    });
});

app.get("/:minified", function(req, res) {

    var userInput = req.params.minified;

    MongoClient.connect(process.env.MONGOLAB_URI, function (err, db) {
        if (err) {
            console.log("There was an error connecting to the database...");
        } else {
            console.log("Connected to database!");

            var collection = db.collection('entries');

            var findEntry = function (db, callback) {
                collection.findOne({ "minified": userInput}, {original: 1, _id: 0}, function (err, doc) {
                    if (doc != null) {
                        res.redirect(doc.original);
                    } else {
                        res.json({ err: "No such link found!" });
                    };
                });
            };

            findEntry(db, function() {
                db.close();
            });
        };
    });
});

app.listen(process.env.PORT, function() {
    console.log("Server listening on port " + process.env.PORT + "...");
});