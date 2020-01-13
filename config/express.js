const express = require('express');
const path = require('path')
const handlebars = require('express-handlebars');

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
    //app.set("view engine", "hbs");
    app.use(express.static(path.resolve(__basedir, 'static')));
}