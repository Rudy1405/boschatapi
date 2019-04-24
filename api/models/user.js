const mongoose = require('mongoose')
const Schema = mongoose.Schema



const userSchema = new Schema({
    email: {
        type: String,
        lowercase: true,
        unique: true,
        required: true
    },
    fbID: { type: Number, required: true },
    Name: { type: String, required: true },
    pendiente: {
        type: Boolean
    },
    pendItem: { type: String },

})

///https://stackoverflow.com/questions/46302053/mongoose-express-create-schema-with-array-of-objects



module.exports = mongoose.model('User', userSchema)