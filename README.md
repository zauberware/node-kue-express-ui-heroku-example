# Node Kue Express UI Example running on Heroku

You might use [kue](https://github.com/Automattic/kue) in your application to run jobs in the background. [kue-ui-express](https://github.com/stonecircle/kue-ui-express) provides a nice UI to monitor those jobs. This example is a ready to go monitoring app which can be deployed to Heroku easily. 

## Dependencies
It uses `kue-ui-express`, `basic-auth` and `redis`!


## Install App on localhost

Clone repository locally:
`$ git clone git@github.com:zauberware/node-kue-express-ui-heroku-example.git && cd node-kue-express-ui-heroku-example`.

Install dependencies:
`$ npm install`.

Setup environment variables:
Copy `.env.sample` to `.env`. Your `.env` should look like:

```
REDIS_URL=redis://localhost:6379
USERNAME=user
PASSWORD=password
PORT=5001
```

Open a terminal window and be sure that you run a redis server. Start server:
`$ redis-server`

Start server:

`$ npm start`

or

`$ babel-node start-server.js`

or with Procfile and `heroku-local` cli feature:

`$ heroku local`


## Installation on heroku

1. Create a new app on heroku.
2. Add Heroku Redis or RedisToGo. (If you use RedisToGo you have to change the ENV var in the script.)
3. Be sure all environment variables are set on heroku
4. Add heroku as a remote repository
5. Push to master and deploy the app
