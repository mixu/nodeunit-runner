# A simple nodeunit test runner for invoking tests via node

Example code:

    // if this module is the script being run, then run the tests:
    if (module == require.main) {
      var nodeunit_runner = require('nodeunit-runner');
      nodeunit_runner.run(__filename);
    }

