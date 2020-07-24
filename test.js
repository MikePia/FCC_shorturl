var mongo = require('mongodb');
var mongoose = require('mongoose');
const Short = require('./models/shorturl')
const async = require('async')

require('dotenv').config()



mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then((result) => {
        console.log(result)

    })
    .catch((err) => { console.log(err) })




function saveone(theurl) {
    async.parallel({
        shortener: (callback) => {
            Short.findOne({ orig_url: theurl }).exec(callback);
        },
        maxshort: (callback) => {
            Short.find().sort({ "rel_url": -1 }).limit(1).exec(callback);
        },
    }, (err, results) => {
        if (err) console.log(err);
        if (results.shortener) {
            console.log('fooundone')
            console.log(results.shortener)
        }
        else {
            let newurl = 1
            if (results.maxshort.length == 1) {
                console.log('found a max')
                console.log(results.maxshort);
                newurl = results.maxshort[0].rel_url + 1;
            }
            let ashort = new Short({
                orig_url: theurl,
                rel_url: newurl
            })
            ashort.save((err) => {
                if (err) {
                    console.log(err);
                    return;
                }
                console.log('Evident success.')
            })
        }

    });
}
// })
let input_url = 'https://fred.com/a/b/c/d/e';
saveone(input_url)
