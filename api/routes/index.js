module.exports = (app) => {

        const express = require('express')
        const msn_controller = require('../controllers/msnfind')
        const wa_controller = require('../controllers/wafind')


        const api_routes = express.Router()
        const msn_routes = express.Router()
        const wa_routes = express.Router()

        ///rputes
        api_routes.use('/msn', msn_routes)
        msn_routes.get('/txt', msn_controller.getItemFromText)
        msn_routes.get('/img', msn_controller.getItemFromImage)
        msn_routes.post('/createuser', msn_controller.createFbUser)


        api_routes.use('/wa', wa_routes)
        wa_routes.get('/txt', wa_controller.getItemFromText)
        wa_routes.get('/img', wa_controller.getItemFromImage)
        wa_routes.post('/createuser', wa_controller.createWaUser)
        wa_routes.get('/', wa_controller.tst)




        app.use('/api', api_routes)
    } // exports app