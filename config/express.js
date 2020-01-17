const express = require('express');
const path = require('path')
const handlebars = require('express-handlebars');
const bodyParser = require("body-parser");

module.exports = (app) => {
    app.engine(
      "hbs",
      handlebars({
        extname: "hbs",
        defaultLayout: "main",
        layoutsDir: "views",
        partialsDir: "views/partials"
      })
    );

    app.use(express.static(path.resolve(__basedir, 'static')));
}