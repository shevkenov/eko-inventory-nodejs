const app = require('express')();

const env = "development";
const port = require('./config/config')[env].port;
global.__basedir = __dirname;

require('./config/express')(app);
require('./config/routes')(app);

app.listen(port, console.log('(eko-inventory) app is listening on port ' + port));