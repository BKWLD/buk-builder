/* TODO decide where this configuration should go.. and test against r.js optimizer. */
require.config({
  "baseUrl": "../../js/",
  "paths": {
    "jquery": "empty:",
    "underscore": "libs/underscore",
    "backbone": "libs/backbone"
  },
  "deps": [
    "main"
  ]
});