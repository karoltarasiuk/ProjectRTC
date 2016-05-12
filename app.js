/**
 * Module dependencies.
 */
var http = require('http')
,   https = require('https')
,   express = require('express')
,	path = require('path')
,	streams = require('./app/streams.js')()
,   fs = require('fs');

var favicon = require('serve-favicon')
,	logger = require('morgan')
,	methodOverride = require('method-override')
,	bodyParser = require('body-parser');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('sslport', process.env.PORT || 3333);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(favicon(__dirname + '/public/images/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride());
app.use(express.static(path.join(__dirname, 'public')));

// routing
require('./app/routes.js')(app, streams);

// pasphrase RoboAlan
var privateKey  = fs.readFileSync('sslcert/server.key-no-pass', 'utf8');
var certificate = fs.readFileSync('sslcert/server.crt', 'utf8');
var credentials = {
    key: privateKey,
    cert: certificate
};

var server = http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});
var sslserver = https.createServer(credentials, app).listen(app.get('sslport'), function(){
    console.log('Express server listening on port ' + app.get('sslport'));
});

var io = require('socket.io').listen(server);
var sslio = require('socket.io').listen(sslserver);
/**
 * Socket.io event handling
 */
var handler = require('./app/socketHandler.js');
handler(io, streams);
handler(sslio, streams);
