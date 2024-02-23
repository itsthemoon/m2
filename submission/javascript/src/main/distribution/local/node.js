/*
    The start function will be called to start your node.
    It will take a callback as an argument.
    After your node has booted, you should call the callback.
*/
const http = require('http');
const util = require('../util/util');
const local = require('./local.js');
const routes = local.routes;

const start = function(started) {
  const server = http.createServer((req, res) => {
    if (req.method === 'PUT') {
      let body = '';
      req.on('data', (chunk) => {
        body += chunk.toString();
      });
      req.on('end', () => {
        try {
          const {args} = util.deserialize(body);
          const [servicePath, method] = req.url.slice(1).split('/');
          const serviceCallback = (e, v) => {
            res.setHeader('Content-Type', 'application/json');
            if (e) {
              res.end(util.serialize([e.message]));
            } else {
              res.end(util.serialize(v));
            }
          };

          if (
            routes.services[servicePath] &&
            typeof routes.services[servicePath][method] === 'function'
          ) {
            routes.services[servicePath][method](...args, serviceCallback);
          } else {
            throw new Error('Service or method not found');
          }
        } catch (e) {
          res.statusCode = 400;
          res.end(`Error processing request: ${e.message}`);
        }
      });
    } else {
      res.statusCode = 405;
      res.end('Only PUT method is supported');
    }
  });

  server.listen(global.config.port, global.config.ip, () => {
    started(server);
  });
};

module.exports = {
  start: start,
};
