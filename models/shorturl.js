const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const ShortSchema = new Schema({
    orig_url: { type: String, required: true, unique: true },
    rel_url: { type: Number, required: true, unique: true },
});

ShortSchema.virtual('url').get(function () {
    return '/sh/' + this.rel_url
})




const Short = mongoose.model('Short', ShortSchema)
module.exports = Short;