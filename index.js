const express = require('express');
const app = express();
const port = process.env.PORT || 5002; // put de app on any avaliable port in that momento or the 3000
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

mongoose.Promise = global.Promise; // declarando promise
mongoose.connect("mongodb://localhost:27017/metsbot"); // mongodb conection 


let routes = require("./api/routes/index"); // se crea el objeto routes que tendra las routas declaradas en routes/index,js
routes(app); // como ese obj tiene codigo node lo usamos como la app para registrar lasrutas

// put the server running
app.listen(port, () => {
    console.log("Listening on port: " + port + "...");
});