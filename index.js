
var nodeunit = require('nodeunit'),
    utils = nodeunit.utils,
    fs = require('fs'),
    track = require('./track.js'),
    path = require('path');
    AssertionError = nodeunit.assert.AssertionError;

var nodeunit = require('nodeunit');

exports.info = "Nodeunit console tests reporter";


exports.run = function (files, options) {
    options || (options = {});
    var defaults = {
      "error_prefix": "\u001B[31m",
      "error_suffix": "\u001B[39m",
      "ok_prefix": "\u001B[32m",
      "ok_suffix": "\u001B[39m",
      "bold_prefix": "\u001B[1m",
      "bold_suffix": "\u001B[22m",
      "assertion_prefix": "\u001B[35m",
      "assertion_suffix": "\u001B[39m",
    };

    Object.keys(defaults).forEach(function(key){
      var value = defaults[key];
      options[key] = value;
    });

    var error = function (str) {
        return options.error_prefix + str + options.error_suffix;
    };
    var ok    = function (str) {
        return options.ok_prefix + str + options.ok_suffix;
    };
    var bold  = function (str) {
        return options.bold_prefix + str + options.bold_suffix;
    };
    var assertion_message = function (str) {
        return options.assertion_prefix + str + options.assertion_suffix;
    };

    var start = new Date().getTime();

    var paths;
    if(!Array.isArray(files)) {
      paths = [ files ];
    } else {
      paths = files.map(function (p) {
        return path.join(process.cwd(), p);
      });
    }

    var tracker = track.createTracker(function (tracker) {
        if (tracker.unfinished()) {
            console.log('');
            console.log(error(bold(
                'FAILURES: Undone tests (or their setups/teardowns): '
            )));
            var names = tracker.names();
            for (var i = 0; i < names.length; i += 1) {
                console.log('- ' + names[i]);
            }
            console.log('');
            console.log('To fix this, make sure all tests call test.done()');
            process.reallyExit(tracker.unfinished());
        }
    });

    process.nextTick(function() {

      nodeunit.runFiles(paths, {
          testspec: options.testspec,
          moduleStart: function (name) {
              console.log('\n' + bold(name));
          },
          testDone: function (name, assertions) {
              tracker.remove(name);

              if (!assertions.failures()) {
                  console.log('✔ ' + name);
              }
              else {
                  console.log(error('✖ ' + name) + '\n');
                  assertions.forEach(function (a) {
                      if (a.failed()) {
                          a = utils.betterErrors(a);
                          if (a.error instanceof AssertionError && a.message) {
                              console.log(
                                  'Assertion Message: ' +
                                  assertion_message(a.message)
                              );
                          }
                          console.log(a.error.stack + '\n');
                      }
                  });
              }
          },
          done: function (assertions, end) {
              var end = end || new Date().getTime();
              var duration = end - start;
              if (assertions.failures()) {
                  console.log(
                      '\n' + bold(error('FAILURES: ')) + assertions.failures() +
                      '/' + assertions.length + ' assertions failed (' +
                      assertions.duration + 'ms)'
                  );
              }
              else {
                  console.log(
                     '\n' + bold(ok('OK: ')) + assertions.length +
                     ' assertions (' + assertions.duration + 'ms)'
                  );
              }
              process.reallyExit();
          },
          testStart: function(name) {
              tracker.put(name);
          }
      });
    });
};

