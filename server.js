'use strict';
// https://glitch.com/~ash-first-cockatoo

var express = require('express');
// import express from 'express'
var bodyParser = require('body-parser');
var mongo = require('mongodb');
var mongoose = require('mongoose');
const async = require('async')
require('dotenv').config()
const { render } = require('ejs');
const dns = require('dns')
let Short = require('./models/shorturl')

var cors = require('cors');

var app = express();

/** this project needs a db !! **/
var port = process.env.PORT || 3000;
console.log(port)
console.log(process.env.MONGO_URI)
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then((result) => {
        app.listen(port, function () {
            console.log('Node.js listening ...');
        });
    })
    .catch((err) => { console.log(err) })

app.set('view engine', 'ejs');

app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here
app.use(bodyParser.urlencoded({ extended: false }));
// app.use(bodyParser.json());

app.use('/public', express.static(process.cwd() + '/public'));


app.get('/', function (req, res) {
    res.render('shorturl')
});

app.get("/api/shorturl/new", (req, res) => {
    console.log('in the right place')
    res.render("shorturl")
})


app.post("/api/shorturl/new", (req, res, next) => {

    console.log(req.body.url_input);
    let pathArray = req.body.url_input.split('/');
    if ((pathArray.length < 3) || (!(['http:', 'https:'].includes(pathArray[0])))) {
        res.json({ error: "invalid URL" });
    }
    dns.lookup(pathArray[2], (err, addresses, family) => {
        if (err) return next(err)
        if (!addresses) {
            res.send({ error: "invalid URL" })
        }

        async.parallel({

            shortener: (callback) => {
                Short.findOne({ 'orig_url': req.body.url_input }).exec(callback);
            },
            maxshort: (callback) => {
                Short.find().sort({ "rel_url": -1 }).limit(1).exec(callback);
            }
        }, (err, results) => {
            if (err) return next(err);
            if (results.shortener) {
                res.json({
                    original_url: results.shortener.orig_url,
                    short_url: results.shortener.rel_url
                });
                return;
            }
            let newurl = 1;
            if (results.maxshort.length == 1) {
                console.log('found a max')
                console.log(results.maxshort);
                newurl = results.maxshort[0].rel_url + 1;
            }
            let shorty = new Short({
                orig_url: req.body.url_input,
                rel_url: newurl
            })
            shorty.save((err, newshort) => {
                if (err) {
                    next(err);
                }
                console.log('Evident success.')
                res.json({
                    original_url: newshort.orig_url,
                    short_url: newshort.rel_url
                });
                return;
            });
        });
    });
});

app.get("/api/shorturl/:uid", (req, res, next) => {
    Short.findOne({ rel_url: req.params.uid }).exec((err, theshort) => {
        if (err) return next(err);
        if (theshort != null)
            console.log(theshort.orig_url)
        res.redirect(theshort.orig_url)
    });
});

// your first API endpoint... 
app.get("/api/hello", function (req, res) {
    res.json({ greeting: 'hello API' });
});


