module.exports = {
  "extends": "google",
  "env": {
    "browser": true,
    "node": true,
    "es6": true,
    "mocha": true,
  },

  "globals": {
    "define": true,
    "API_URL": true,
    "BROWSER": true,
  },
  "rules": {
    "no-unused-vars": "warn",
  },
}