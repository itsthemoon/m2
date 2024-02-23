const {performance} = require('perf_hooks');

let distribution;
let local;

let routes;
let status;

let lastPort = 8080;

beforeEach(() => {
  jest.resetModules();

  global.config = {
    ip: '127.0.0.1',
    port: lastPort++, // Avoid port conflicts
  };

  distribution = require('../distribution');
  local = distribution.local;

  status = local.status;
  routes = local.routes;
  comm = local.comm;

  id = distribution.util.id;
  wire = distribution.util.wire;

  node = global.config;
});

test('(1 pt) status: get(ip) returns correct IP', (done) => {
  status.get('ip', (e, v) => {
    expect(e).toBeFalsy();
    expect(v).toBe(global.config.ip);
    done();
  });
});

test('(1 pt) routes.get(status) retrieves status object', (done) => {
  routes.get('status', (e, v) => {
    expect(e).toBeFalsy();
    expect(v).toBe(status);
    done();
  });
});

test('(1 pt) routes: put() -> get() works for new service', (done) => {
  const testService = {testMethod: () => 'test'};

  routes.put(testService, 'testService', (e) => {
    expect(e).toBeFalsy();
    routes.get('testService', (e, v) => {
      expect(e).toBeFalsy();
      expect(v.testMethod()).toBe('test');
      done();
    });
  });
});

test('(1 pts) routes: put() -> get() works for custom service', (done) => {
  // Define a test service with an echo method
  const testService = {
    echo: (arg, callback) => {
      callback(null, arg); // Simply return the same value received
    },
  };

  // Start the node
  distribution.node.start((server) => {
    routes.put(testService, 'testService', (e) => {
      expect(e).toBeFalsy();

      routes.get('testService', (e, service) => {
        expect(e).toBeFalsy();
        expect(service).toBeDefined();

        service.echo('testValue', (e, v) => {
          server.close();
          expect(e).toBeFalsy();
          expect(v).toBe('testValue');
          done();
        });
      });
    });
  });
});

test('(1 pt) RPC: Simple increment function works via RPC', (done) => {
  let count = 0;
  const increment = () => ++count;
  const incrementRPC = distribution.util.wire.createRPC(
      distribution.util.wire.toAsync(increment),
  );

  const rpcService = {incrementRPC: incrementRPC};

  distribution.node.start((server) => {
    routes.put(rpcService, 'incrementService', (e) => {
      expect(e).toBeFalsy();
      routes.get('incrementService', (e, s) => {
        expect(e).toBeFalsy();
        s.incrementRPC((e, v) => {
          expect(e).toBeFalsy();
          expect(v).toBe(1);
          s.incrementRPC((e, v) => {
            server.close();
            expect(e).toBeFalsy();
            expect(v).toBe(2);
            done();
          });
        });
      });
    });
  });
});

test('RPC Performance: Measure throughput and latency of 1000 requests',
    (done) => {
      let count = 0;
      const increment = () => ++count;
      const incrementRPC = distribution.util.wire.createRPC(
          distribution.util.wire.toAsync(increment),
      );

      const rpcService = {incrementRPC: incrementRPC};
      routes.put(rpcService, 'incrementService', (e) => {
        expect(e).toBeFalsy();

        // Start measuring time
        const startTime = performance.now();

        const totalRequests = 1000;
        let completedRequests = 0;
        let errorCount = 0;

        for (let i = 0; i < totalRequests; i++) {
          incrementRPC((e) => {
            if (e) {
              errorCount++;
            }
            completedRequests++;
            if (completedRequests === totalRequests) {
              // All requests are completed, measure end time
              const endTime = performance.now();
              const totalTimeMs = endTime - startTime;
              const averageLatency = totalTimeMs / totalRequests;
              const requestsPerSecond = 1000 / (totalTimeMs / totalRequests);

              console.log(`Total Time: ${totalTimeMs} ms`);
              console.log(`Average Latency: ${averageLatency} ms`);
              console.log(`Requests per Second: ${requestsPerSecond}`);

              // Ensure no errors occurred
              expect(errorCount).toBe(0);
              done();
            }
          });
        }
      });
    });
