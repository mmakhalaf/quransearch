// Karma configuration file, see link for more information
// https://karma-runner.github.io/latest/config/configuration-file.html
//
// The Angular `@angular/build:karma` builder injects the framework, plugin and
// entry point automatically. This file only customizes the browser launcher so
// the suite can run headless inside a container (no sandbox).

module.exports = function (config) {
  config.set({
    customLaunchers: {
      ChromeHeadlessNoSandbox: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage']
      }
    },
    browsers: ['ChromeHeadlessNoSandbox'],
    restartOnFileChange: true
  });
};
