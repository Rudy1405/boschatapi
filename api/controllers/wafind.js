const User = require("../models/user")
const sendJSONresponse = require('./shared').sendJSONresponse
const request = require('request')

let partnerId = "beta_bosch"
let partnerKey = "4700fc1c26dd4e54ab26a0bc1c9dd40d"

let userId = "hackteam_13"
let pass = "hack2019"
let email = "hack2019+13@partstech.com"
let shopname = "Hackathon Team 13"
let key = "93c78077d4174a0abec9c6c900c65e0b"



async function createWaUser(req, res) {
    let resbody
    let newUser = new User(req.body);
    let createdUser = await newUser.save()
    if (createdUser) {
        resbody = {
                messages: [{
                    text: "Ya te has registrado, ahora podre saber un poco de tus preferencias :D"
                }],
                set_attributes: {}
            } ///resbody

    } else {
        resbody = {
                messages: [{
                    text: "Oops creo que algo ha pasado no te he podito registrar, intentalo de nuevo."
                }],
                set_attributes: {
                    path: "reg"
                }
            } ///resbody

    }
    res.json(resbody)
}

async function getItemFromImage(req, res) {

    /* req.image
        Send this variable to a get with request function or call the trained model
        this model or call gona return a string or array with the PART TYPE, YEAR, BRAND MODEL
        this data is going to be sended to validate data
    */


    request({
        url: ' URI',
        qs: { access_token: key },
        method: 'GET',
        json: {
            recipient: { image: req.image },
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        } else if (response.body.arr) {
            validateItem(res, response.body.arr[0], response.body.arr[1], response.body.arr[2], response.body.arr[3])
        }
    })



}


async function validateItem(req, res, partType, year, brand, model) {

    if (partType == null || year == null || brand == null || model == null) {
        resbody = {
                messages: [{
                    text: "La imagen no esta legible o no cuento con este articulo, intenta ingresarlo con texto"
                }],
                set_attributes: {
                    path: "findByText",
                }
            } ///resbody  

        res.json(resbody)
    } //if
    else {
        req.partType = partType
        req.carYear = year
        req.brand = brand
        req.model = model
    }

}


async function getItemFromText(req, res) {
    /// req.partType
    /// req.carYear
    /// req.brand
    // req.model

    /**
     * This is an example, we must test how a request JSON looks on postman,
     * it gonna be a series of functions that find on diferent request from another
     * so we can have the final result or ID
     */

    request({
        url: 'BOSCH URI',
        qs: { access_token: key },
        method: 'POST',
        json: {
            recipient: { id: userId },
            message: messageData,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    })
}



function sendRequest(sender, messageData) { /// Metodo que envia los msj
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: { access_token: token },
        method: 'POST',
        json: {
            recipient: { id: sender },
            message: messageData,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    })
}

function tst(req, res) {
    res.json("Si sirvo we")
}

module.exports = {

    createWaUser,
    getItemFromImage,
    getItemFromText,
    tst

}