var child_process = require('child_process');
var series = require('./lib/series.js');
var path = require('path');

var tests = {
//  'api': [ './api/api.test.js' ],
  'core': [
    './core/auth.test.js',
    './core/channel.altport.test.js',
    './core/channel.apiv1.test.js',
    './core/channel.death.test.js',
    './core/channel.test.js',
  ],
  'chatman': [
    './chatman/chat_manager.test.js'
  ]
};

var start = new Date();

var tasks = [];
var failures = 0;
var total_files = 0;
Object.keys(tests).forEach(function(name) {
  var suite = tests[name];
  suite.forEach(function(filename) {
    tasks.push(function(done) {
      filename = path.resolve(__dirname, filename);
      total_files++;
      console.log('MODULE START ' + name);
      var chan = child_process.spawn('node', [filename]);
      chan.stdout.on('data', function (data) {
        console.log(data.toString().trim());
      });
      chan.stderr.on('data', function (data) {
        console.log('stderr: ' + data);
      });
      chan.on('exit', function(code, signal) {
        console.log('Child process exited', code, signal);
        if (code == 0) {
          console.log('✔ ' + name);
        } else {
          console.log('✖ ' + name);
          failures++;
        }
        done();
      });
    });
  });
});

series(tasks, function() {
  var total_duration = Math.floor( new Date() - start );
  console.log('ALL DONE, duration ', total_duration, 'ms, tests', total_files);
  console.log('Exit code:', failures);
  process.exit(failures);
});
