import express      from 'express';
import bodyParser   from 'body-parser';
import cors from 'cors';

let kue = require('kue');
let auth = require('basic-auth');
let kueUiExpress = require('kue-ui-express');

kue.redis.createClient = function() {
  var redisUrl = url.parse(process.env.REDISTOGO_URL)
    , client = redis.createClient(redisUrl.port, redisUrl.hostname);
  if (redisUrl.auth) {
      client.auth(redisUrl.auth.split(":")[1]);
  }
  return client;
};

let queue = kue.createQueue({ disableSearch: false });

// Moun kue background tasks UI
// var auth = express.basicAuth(function(user, pass, callback) {
//   var result = (user === 'username' && pass === 'password');
//   callback(null /* error */, result);
// });

// var auth = require('basic-auth');


// var kueConfig = prod ? require('./server/kue/prod_config.json') : require('./server/kue/config.json');

// create a wrapper to add auth on since without it we can't globally wrap kue's paths
// var kueApp = express();
// // add authentication
// kueApp.use(auth);
// // re-add kue.app (but dont put it in its own folder)


// include logger
var expressLogging = require('express-logging'),
    logger = require('logops');

// load dotenv config
require('dotenv').config();
var sslRedirect = require('heroku-ssl-redirect');

// init express App
const app = express();
app.use(expressLogging(logger));
app.use('*', cors({ credentials: true }));

// Use SSL in production environments
if(process.env.NODE_ENV == 'production'){
  app.use(sslRedirect());
}


app.use((req, res, next) => {
  // check if it was access to kue UIs
  console.log(req.url);
  let user = auth(req)
  if (user === undefined || user['name'] !== process.env.USERNAME || user['pass'] !== process.env.PASSWORD) {
    res.statusCode = 401
    res.setHeader('WWW-Authenticate', 'Basic realm="Node"')
    res.end('Unauthorized')
  } else {
    console.log('next');
    next()
  }
});

//--- redirect to app ---
app.get('/', function(req, res) {
  res.redirect('/kue/');
});

// Set Port
app.set('port', (process.env.PORT || 5001));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }) );


app.use(kue.app);
kueUiExpress(app, '/kue/', '/kue-api');
// // Mount kue JSON api
app.use('/kue-api/', kue.app);




// launch server
var server = app.listen(app.get('port'), () => {
  console.log(`Find the server at port:${app.get('port')}/`); // eslint-disable-line no-console
});
