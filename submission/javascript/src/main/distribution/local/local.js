const http = require('http');

const util = require('../util/util');

const node = global.config;

/*

Service  Description                           Methods
status   statusrmation about the current node  get
routes   A mapping from names to functions     get, put
comm     A message communication interface     send

*/

// status
const status = {
  data: {
    get nid() {
      return util.id.getNID(node);
    },
    get sid() {
      return util.id.getSID(node);
    },
    get ip() {
      return node.ip;
    },
    get port() {
      return node.port;
    },
    counts: 0,
  },
  get: function(key, callback) {
    if (key in this.data) {
      callback(null, this.data[key]);
    } else {
      callback(new Error('Key not found'), null);
    }
  },
};

// routes
const routes = {
  services: {
    status: status,
  },
  get(name, callback) {
    const service = this.services[name];
    if (service) {
      callback(null, service);
    } else {
      callback(new Error('Service not found'), null);
    }
  },
  put(service, name, callback) {
    this.services[name] = service;
    callback(null, 'Service registered successfully');
  },
};

routes.services.routes = routes;

const comm = {
  send(message, remote, callback) {
    const postData = util.serialize({
      args: message,
    });

    const options = {
      hostname: remote.node.ip,
      port: remote.node.port,
      path: `/${remote.service}/${remote.method}`,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const parsedData = util.deserialize(data);
          callback(null, parsedData);
        } catch (e) {
          callback(e, null);
        }
      });
    });

    req.on('error', (e) => {
      callback(e, null);
    });

    req.write(postData);
    req.end();
  },
};

routes.services.comm = comm;

module.exports = {status, routes, comm};
