const minimist = require('minimist');

function getCLIArgs() {
  return minimist(process.argv.slice(2));
}

module.exports = getCLIArgs;
