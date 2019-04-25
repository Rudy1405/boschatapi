const User = require("../models/user")
const sendJSONresponse = require('./shared').sendJSONresponse
const request = require('request')
const spawn = require("child_process").spawn;

let partnerId = "beta_bosch"
let partnerKey = "4700fc1c26dd4e54ab26a0bc1c9dd40d"

let userId = "hackteam_13"
let pass = "hack2019"
let email = "hack2019+13@partstech.com"
let shopname = "Hackathon Team 13"
let key = "93c78077d4174a0abec9c6c900c65e0b"

let accesToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJiZXRhLnBhcnRzdGVjaC5jb20iLCJleHAiOjE1NTYzNDYzOTcsInBhcnRuZXIiOiJ0ZXN0X3BhcnRuZXIiLCJ1c2VyIjoiZGVtb19oZWxlbiJ9.TvKSsMSGwgw32bdHnZCrR3p4yl-7TZVnhX8D3J3YBhY'

//Data from vehicle to speed up request
let yearID = 2010;
let make = "Kia";
let makeID
let model = "Rio";
let modelID = 0;
let submodelID = 0;
let engineID = 0;
let engineVinID = 0;
let engineDesignationID = 0;
let fuelTypeID = 0;
let cylinderHeadTypeId = 0;

function getVehicleData(req, res) {
    request({
        url: 'https://api.beta.partstech.com/taxonomy/vehicles/makes?' + yearID + '=2017&model=',
        method: 'GET',
        auth: {
            bearer: accesToken
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        } else {
            if (response.body) {
                let aux = response.body
                for (const iterator of aux) {
                    if (iterator.makeName == req.body.brand) {
                        makeID = iterator.makeId
                    }
                }
                request({
                    url: 'https://api.beta.partstech.com//taxonomy/vehicles/models?year=' + yearID + '&make=' + makeID + '&submodel',
                    method: 'GET',
                    auth: {
                        bearer: accesToken
                    }
                }, function(error, response, body) {
                    if (error) {
                        console.log('Error sending messages: ', error)
                    } else if (response.body.error) {
                        console.log('Error: ', response.body.error)
                    } else {
                        if (response.body) {
                            let aux2 = response.body
                            for (const iterator of aux2) {
                                if (iterator.modelName == req.body.model) {
                                    modelID = modelId
                                }
                            }
                            request({
                                url: 'https://api.beta.partstech.com/taxonomy/vehicles/submodels?year=' + yearID + '&make=' + makeID + '&model=' + modelID + '&engine=',
                                method: 'GET',
                                auth: {
                                    bearer: accesToken
                                }
                            }, function(error, response, body) {
                                if (error) {
                                    console.log('Error sending messages: ', error)
                                } else if (response.body.error) {
                                    console.log('Error: ', response.body.error)
                                } else {
                                    submodelID = response.body.submodelID
                                    request({
                                        url: 'https://api.beta.partstech.com/taxonomy/vehicles/engines?year=' + yearID + '&make=' + makeID + '&model=' + modelID + '&submodel=' + submodelID + '',
                                        method: 'GET',
                                        auth: {
                                            bearer: accesToken
                                        }
                                    }, function(error, response, body) {
                                        if (error) {
                                            console.log('Error sending messages: ', error)
                                        } else if (response.body.error) {
                                            console.log('Error: ', response.body.error)
                                        } else {
                                            engineID = response.body.engineId,
                                                engineVinID = response.body.engineVinId,
                                                engineDesignationID = response.body.engineDesignationId,
                                                fuelTypeID = response.body.fuelTypeId,
                                                cylinderHeadTypeId = response.body.cylinderHeadTypeId,
                                                //get submodelID engineID engineVinID  engineDesignationID fuelTypeID  cylinderHeadTypeId by comparation
                                                getItemFromText(req, res, engineID, engineVinID, engineDesignationID, fuelTypeID, cylinderHeadTypeId)
                                        }
                                    })
                                }
                            })
                        }
                    }
                })
            }
        }
    })
}



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

    /// based on https://www.pyimagesearch.com/2018/04/16/keras-and-convolutional-neural-networks-cnns/

    const pythonProcess = spawn('python', ["./clasifier/script.py", req.body.photourl])
    pythonProcess.stdout.on('data', (data) => {
        // Do something with the data returned from python script
        getItemFromText(req, res, data.engineID, data.engineVinID, data.engineDesignationID, data.fuelTypeID, data.cylinderHeadTypeId)
    });

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

function autorizacion(req, res) {
    let json = {
        accessType: "partner",
        credentials: {
            partner: {
                id: "test_partner",
                key: "97687715735f4b7da49d39bc19d0e532"
            }
        }
    }
}



/*function getVehicleNameFromText(req,res){
    request({
        url: 'https://api.beta.partstech.com/catalog/parts/BBSC-18042',
        method: 'GET',
        auth:{
            bearer: accesToken
        }
        
    }, function (error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        } else {
            res.json(body)
            //console.log(response)
        }
    })
 
 
}*/

function getItemFromText(req, res, engineID, engineVinID, engineDesignationID, fuelTypeID, cylinderHeadTypeId) {

    request({
        url: 'https://api.beta.partstech.com/catalog/parts/BBSC-18042',
        method: 'POST',
        auth: {
            bearer: accesToken
        },
        json: {
            searchParams: {
                vehicleParams: {
                    yearId: yearID,
                    makeId: makeID,
                    modelId: modelID,
                    subModelId: submodelID,
                    engineId: engineID,
                    engineParams: {
                        engineVinId: engineVinID,
                        engineDesignationId: engineDesignationID,
                        fuelTypeId: fuelTypeID,
                        cylinderHeadTypeId: cylinderHeadTypeId
                    }
                },
                keyword: req.body.partType
            }
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        } else {

            let gallery = {
                messages: [{
                    attachment: {
                        type: "template",
                        payload: {
                            template_type: "generic",
                            image_aspect_ratio: "square",
                            elements: [{
                                    title: response.body[1].partName,
                                    image_url: "https://img1.partstech.com/d2/images/9e/67/fd/w110_9e67fd3844c7e250eb5bf5de4c98d1857db676f0.png",
                                    subtitle: response.body[1].partTypeName + " " + response.body[1].vehicleName,
                                    buttons: [{
                                        type: "web_url",
                                        url: "https://bcs.beta.partstech.com/Bosch-Disc-Brake-Rotor/details/BBHK-50011256?part_term=1896",
                                        title: "View Item"
                                    }]
                                },
                                {
                                    title: response.body[2].partName,
                                    image_url: "https://img1.partstech.com/d2/images/9e/67/fd/w110_9e67fd3844c7e250eb5bf5de4c98d1857db676f0.png",
                                    subtitle: response.body[2].partTypeName + " " + response.body[2].vehicleName,
                                    default_action: {
                                        type: "web_url",
                                        url: "https://bcs.beta.partstech.com/Bosch-Disc-Brake-Rotor/details/BBHK-50011256?part_term=1896",
                                        messenger_extensions: true
                                    },
                                    buttons: [{
                                        type: "web_url",
                                        url: "https://bcs.beta.partstech.com/Bosch-Disc-Brake-Rotor/details/BBHK-50011256?part_term=1896",
                                        title: "View Item"
                                    }]
                                }
                            ]
                        }
                    }
                }]
            }
            res.json(body)
                //console.log(response)
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
    getVehicleData,
    createWaUser,
    getItemFromImage,
    getItemFromText,
    tst

}