import express      from 'express';
import bodyParser   from 'body-parser';
import cors from 'cors';
import url from 'url';

let kue = require('kue');
let auth = require('basic-auth');
let kueUiExpress = require('kue-ui-express');

// load dotenv config
require('dotenv').config();

// Parse REDIS connection URL
var redisUrl = url.parse(process.env.REDIS_URL);
var redisOptions = {
    port: redisUrl.port,
    host: redisUrl.hostname,
    options: {
      disableSearch: false
    }
};
if (redisUrl.auth) {
  redisOptions['auth'] = redisUrl.auth.split(":")[1];
}

// create Kue Queue with redis options
kue.createQueue({ 
  redis: redisOptions
});

// include logger
var expressLogging = require('express-logging'),
    logger = require('logops');

var sslRedirect = require('heroku-ssl-redirect');

// init express App
const app = express();
app.use(expressLogging(logger));
app.use('*', cors({ credentials: true }));


// Use SSL in production environments
if(process.env.NODE_ENV == 'production'){
  app.use(sslRedirect());
}


// wrap all request with baseic-auth
app.use((req, res, next) => {
  // check if it was access to kue UIs
  let user = auth(req)
  if (user === undefined || user['name'] !== process.env.USERNAME || user['pass'] !== process.env.PASSWORD) {
    res.statusCode = 401
    res.setHeader('WWW-Authenticate', 'Basic realm="Node"')
    res.end('Unauthorized')
  } else {
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


// any kue related settings can go here
kue.app.set('title', 'Lenzio Jobs');
app.use(kue.app);
kueUiExpress(app, '/kue/', '/kue-api');
// // Mount kue JSON api
app.use('/kue-api/', kue.app);


// launch server
var server = app.listen(app.get('port'), () => {
  console.log(`Find the server at port:${app.get('port')}/`); // eslint-disable-line no-console
});
