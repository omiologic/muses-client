// server.js
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const _ = require('lodash');

const source = 'json-server/db.json';
const jsonServer = require('json-server');
const jwt = require('jsonwebtoken');
const config = require('../package.json').config;
const port = config.apiPort;
const host = config.defaultTarget;
const routes = require('../routes.json');
const data = require('./db.json');

const secret = new Buffer('secret', 'base64');

const defaultsOpts = {
  static: 'json-server/public',
};

const server = jsonServer.create();
const router = jsonServer.router(source);
const middlewares = jsonServer.defaults(defaultsOpts);

function prettyPrint(object, rules) {
  const root = `${host}:${port}`;

  console.log();
  /** @namespace chalk.bold  **/
  console.log(chalk.bold('  Resources'));
  for (let prop in object) {
    console.log('  ' + root + '/' + prop);
  }

  if (rules) {
    console.log();
    console.log(chalk.bold('  Other routes'));
    for (const rule in rules) {
      if (rules.hasOwnProperty(rule)) {
        console.log('  ' + rule + ' -> ' + rules[rule]);
      }
    }
  }

  console.log();
  console.log(chalk.bold('  Home'));
  console.log('  ' + root);
  console.log();
}

const walkSync = (dir, filelist = []) => fs.readdirSync(dir)
  .map(file => fs.statSync(path.join(dir, file)).isDirectory()
  ? walkSync(path.join(dir, file), filelist)
  : filelist.concat(path.join(dir, file))[0]);

server.use(middlewares);

// To handle POST, PUT and PATCH you need to use a body-parser
// You can use the one used by JSON Server
server.use(jsonServer.bodyParser);

server.use(function(req, res, next){
  if (req.headers.authorization && !req.url.includes('user_token') && !req.url.includes('api/info')) {
    const auth = req.headers.authorization.split(' ');
    const token = auth[auth.length - 1];
    if (token) {
      jwt.verify(token, secret, function(err, decoded) {
        if (err) {
          req.headers.authorization = null;
          res.status(401).jsonp({});
        } else {
          next();
        }
      });
    } else {
      next();
    }
  } else {
    next();
  }
});

server.post('/api/user_token', function(req, res, next){
  console.log('Requesting token', req.body);
  if (req.body.auth.email === 'fail') {
    res.status(404).jsonp({});
  } else {
    // req.body.jwt = data.user_token.jwt;
    // // req.body.auth.email = undefined;
    // // req.body.auth.password = undefined;
    // req.body.auth = undefined;
    console.log('Set token', req.body);
    res.jsonp({
      jwt: jwt.sign({foo: 'bar'}, secret, {expiresIn: '12h'})
      // jwt: jwt.sign({exp: 15076634}, 'secret')
    });
  }

});

// Add this before server.use(router)
server.use(jsonServer.rewriter(routes));

server.use(router);

server.listen(port, function () {
  console.log();
  /** @namespace chalk.cyan  **/
  console.log(chalk.cyan('  \\{^_^}/ hi! Reporting development server is running on port', port));

  // Display server information
  prettyPrint(data, routes);

  console.log(chalk.bold('  Static Resources'));
  _.flattenDeep(walkSync(defaultsOpts.static, [])).map(function (resource) {
    console.log('  ' + resource);
  });
  console.log();
});

// "concurrently" sends SIGTERM; see feature tests
// We need Jenkins to return 0 exit code so the build does not fail.
process.on('SIGTERM', () => {
  console.log('Received kill signal, shutting down gracefully');
process.exit();
});
