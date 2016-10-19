(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("fast-sha256"), require("base64url"), require("supercop.js"), require("json-stable-stringify"), require("axios"), require("es6-promise"));
	else if(typeof define === 'function' && define.amd)
		define("token-io.node", ["fast-sha256", "base64url", "supercop.js", "json-stable-stringify", "axios", "es6-promise"], factory);
	else if(typeof exports === 'object')
		exports["token-io.node"] = factory(require("fast-sha256"), require("base64url"), require("supercop.js"), require("json-stable-stringify"), require("axios"), require("es6-promise"));
	else
		root["token-io.node"] = factory(root["fast-sha256"], root["base64url"], root["supercop.js"], root["json-stable-stringify"], root["axios"], root["es6-promise"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_2__, __WEBPACK_EXTERNAL_MODULE_3__, __WEBPACK_EXTERNAL_MODULE_4__, __WEBPACK_EXTERNAL_MODULE_5__, __WEBPACK_EXTERNAL_MODULE_18__, __WEBPACK_EXTERNAL_MODULE_24__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _Crypto = __webpack_require__(1);

	var _Crypto2 = _interopRequireDefault(_Crypto);

	var _Util = __webpack_require__(6);

	var _Util2 = _interopRequireDefault(_Util);

	var _Member = __webpack_require__(7);

	var _Member2 = _interopRequireDefault(_Member);

	var _KeyLevel = __webpack_require__(13);

	var _KeyLevel2 = _interopRequireDefault(_KeyLevel);

	var _LocalStorage = __webpack_require__(8);

	var _LocalStorage2 = _interopRequireDefault(_LocalStorage);

	var _HttpClient = __webpack_require__(22);

	var _HttpClient2 = _interopRequireDefault(_HttpClient);

	var _AuthHttpClientAlias = __webpack_require__(23);

	var _AuthHttpClientAlias2 = _interopRequireDefault(_AuthHttpClientAlias);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	// Promise polyfill for IE and older browsers
	__webpack_require__(24).polyfill();

	// Main entry object

	var Token = function () {
	    function Token() {
	        var env = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'prd';

	        _classCallCheck(this, Token);

	        this._env = env;
	        this._unauthenticatedClient = new _HttpClient2.default(env);
	        this.Crypto = _Crypto2.default;
	        this.Util = _Util2.default;
	        this.KeyLevel = _KeyLevel2.default;
	    }

	    /**
	     * Checks if a given alias already exists
	     * @param {string} alias - alias to check
	     * @return {Promise} result - true if alias exists, false otherwise
	     */


	    _createClass(Token, [{
	        key: "aliasExists",
	        value: function aliasExists(alias) {
	            var _this = this;

	            return this._unauthenticatedClient.aliasExists(alias)
	            // Workaround for a default value case when protobuf does not serialize it.
	            .then(function (res) {
	                return res.data.exists ? res.data.exists : false;
	            }).catch(function (err) {
	                return _this._reject(_this.aliasExists, err);
	            });
	        }

	        /**
	         * Creates a member with an alias and a keypair
	         * @param  {string} alias - alias to set for member
	         * @return {Promise} member - Promise of created Member
	         */

	    }, {
	        key: "createMember",
	        value: function createMember(alias) {
	            var _this2 = this;

	            var keys = _Crypto2.default.generateKeys();
	            return this._unauthenticatedClient.createMemberId().then(function (response) {
	                return _this2._unauthenticatedClient.addFirstKey(keys, response.data.memberId).then(function () {
	                    var member = new _Member2.default(_this2._env, response.data.memberId, keys);
	                    return member.addAlias(alias).then(function () {
	                        return member;
	                    });
	                });
	            }).catch(function (err) {
	                return _this2._reject(_this2.createMember, err);
	            });
	        }

	        /**
	         * Log in a member (Instantiate a member object from keys and Id)
	         * @param  {string} memberId - id of the member
	         * @param  {object} keys - member's keys
	         * @return {Promise} member - Promise of instantiated Member
	         */

	    }, {
	        key: "login",
	        value: function login(memberId, keys) {
	            var _this3 = this;

	            return Promise.resolve(new _Member2.default(this._env, memberId, keys)).catch(function (err) {
	                return _this3._reject(_this3.login, err);
	            });
	        }

	        /**
	         * Log in a member by keys and alias. This is useful for checking whether we are
	         * authenticated, after requesting to add a key (by notification). Can call this
	         * every n seconds until it succeeds
	         * @param  {object} keys - Member keys
	         * @param  {string} alias - alias to authenticate with
	         * @return {Promise} member - instantiated Member, if successful
	         */

	    }, {
	        key: "loginWithAlias",
	        value: function loginWithAlias(keys, alias) {
	            var _this4 = this;

	            return new _AuthHttpClientAlias2.default(this._env, alias, keys).getMemberByAlias().then(function (res) {
	                return new _Member2.default(_this4._env, res.data.member.id, keys);
	            }).catch(function (err) {
	                return _this4._reject(_this4.loginWithAlias, err);
	            });
	        }

	        /**
	         * Logs a member in from keys stored in localStorage
	         * @return {Promise} member - instantiated member
	         */

	    }, {
	        key: "loginFromLocalStorage",
	        value: function loginFromLocalStorage() {
	            var _this5 = this;

	            return Promise.resolve(_LocalStorage2.default.loadMember()).catch(function (err) {
	                return _this5._reject(_this5.loginFromLocalStorage, err);
	            });
	        }

	        /**
	         * Notifies subscribers that accounts should be linked, and passes the bank id and
	         * payload
	         * @param {string} alias - alias to notify
	         * @param {string} bankId - If of the bank owning the accounts
	         * @param {string} accountsLinkPayload - accountsLinkPayload retrieved from the bank
	         * @return {Promise} empty - empty
	         */

	    }, {
	        key: "notifyLinkAccounts",
	        value: function notifyLinkAccounts(alias, bankId, accountsLinkPayload) {
	            var _this6 = this;

	            var notification = {
	                linkAccounts: {
	                    bankId: bankId,
	                    accountsLinkPayload: accountsLinkPayload
	                }
	            };
	            return this._unauthenticatedClient.notify(alias, notification).catch(function (err) {
	                return _this6._reject(_this6.notifyLinkAccounts, err);
	            });
	        }

	        /**
	         * Notifies subscribers that a key should be added and passes the public Key and
	         * optional name
	         * @param {string} alias - alias to notify
	         * @param {string} publicKey - public
	         * @param {string} name - name for the new key, (e.g Chrome 53.0)
	         * @return {Promise} empty - empty
	         */

	    }, {
	        key: "notifyAddKey",
	        value: function notifyAddKey(alias, publicKey) {
	            var _this7 = this;

	            var name = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';

	            var notification = {
	                addKey: {
	                    publicKey: _Crypto2.default.strKey(publicKey),
	                    name: name
	                }
	            };
	            return this._unauthenticatedClient.notify(alias, notification).catch(function (err) {
	                return _this7._reject(_this7.notifyAddKey, err);
	            });
	        }

	        /**
	         * Notifies subscribed devices that accounts should be linked, and passes the bank id and
	         * payload
	         * @param {string} alias - alias to notify
	         * @param {string} bankId - If of the bank owning the accounts
	         * @param {string} accountsLinkPayload - accountsLinkPayload retrieved from the bank
	         * @param {string} publicKey - public
	         * @param {array} name - name for the new key, (e.g Chrome 53.0)
	         * @return {Promise} empty - empty
	         */

	    }, {
	        key: "notifyLinkAccountsAndAddKey",
	        value: function notifyLinkAccountsAndAddKey(alias, bankId, accountsLinkPayload, publicKey) {
	            var _this8 = this;

	            var name = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : "";

	            var notification = {
	                linkAccountsAndAddKey: {
	                    linkAccounts: {
	                        bankId: bankId,
	                        accountsLinkPayload: accountsLinkPayload
	                    },
	                    addKey: {
	                        publicKey: _Crypto2.default.strKey(publicKey),
	                        name: name
	                    }
	                }
	            };
	            return this._unauthenticatedClient.notify(alias, notification).catch(function (err) {
	                return _this8._reject(_this8.notifyLinkAccountsAndAddKey, err);
	            });
	            ;
	        }
	    }, {
	        key: "_reject",
	        value: function _reject(method, err) {
	            return Promise.reject({
	                type: method.name,
	                error: err,
	                reason: err.response.data !== undefined ? err.response.data : "UNKNOWN"
	            });
	        }
	    }]);

	    return Token;
	}();

	;

	module.exports = Token;

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _fastSha = __webpack_require__(2);

	var _fastSha2 = _interopRequireDefault(_fastSha);

	var _base64url = __webpack_require__(3);

	var _base64url2 = _interopRequireDefault(_base64url);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var lib = __webpack_require__(4);

	var stringify = __webpack_require__(5);

	var Crypto = function () {
	    function Crypto() {
	        _classCallCheck(this, Crypto);
	    }

	    _createClass(Crypto, null, [{
	        key: "generateKeys",


	        /**
	         * Generates a keypair to use with the token System
	         * @return {object} keyPair - keyPair
	         */
	        value: function generateKeys() {
	            var seed = lib.createSeed();
	            var keyPair = lib.createKeyPair(seed);
	            keyPair.keyId = (0, _base64url2.default)((0, _fastSha2.default)(keyPair.publicKey)).substring(0, 16);
	            return keyPair;
	        }

	        /**
	         * Signs a json object and returns the signature
	         * @param {object} json - object to sign
	         * @param {object} keys - keys to sign with
	         * @return {string} signature - signature
	         */

	    }, {
	        key: "signJson",
	        value: function signJson(json, keys) {
	            return Crypto.sign(stringify(json), keys);
	        }

	        /**
	         * Signs a string and returns the signature
	         * @param {string} message - message to sign
	         * @param {object} keys - keys to sign with
	         * @return {string} signature - signature
	         */

	    }, {
	        key: "sign",
	        value: function sign(message, keys) {
	            var msg = new Buffer(message);
	            return (0, _base64url2.default)(lib.sign(msg, keys.publicKey, keys.secretKey));
	        }

	        /**
	         * Converts a key to string
	         * @param {Buffer} key - key to encode
	         * @return {string} string - encoded key
	         */

	    }, {
	        key: "strKey",
	        value: function strKey(key) {
	            return (0, _base64url2.default)(key);
	        }

	        /**
	         * Converts a key from a string to buffer.
	         * @param {string} key - base64Url encoded key
	         * @return {Buffer} key - key in Buffer form
	         */

	    }, {
	        key: "bufferKey",
	        value: function bufferKey(key) {
	            return _base64url2.default.toBuffer(key);
	        }
	    }]);

	    return Crypto;
	}();

	exports.default = Crypto;

/***/ },
/* 2 */
/***/ function(module, exports) {

	module.exports = require("fast-sha256");

/***/ },
/* 3 */
/***/ function(module, exports) {

	module.exports = require("base64url");

/***/ },
/* 4 */
/***/ function(module, exports) {

	module.exports = require("supercop.js");

/***/ },
/* 5 */
/***/ function(module, exports) {

	module.exports = require("json-stable-stringify");

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var lib = __webpack_require__(4);

	var Util = function () {
	    function Util() {
	        _classCallCheck(this, Util);
	    }

	    _createClass(Util, null, [{
	        key: 'generateNonce',
	        value: function generateNonce() {
	            return lib.createSeed().toString('base64');
	        }
	    }]);

	    return Util;
	}();

	exports.default = Util;

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _Crypto = __webpack_require__(1);

	var _Crypto2 = _interopRequireDefault(_Crypto);

	var _LocalStorage = __webpack_require__(8);

	var _LocalStorage2 = _interopRequireDefault(_LocalStorage);

	var _Account = __webpack_require__(9);

	var _Account2 = _interopRequireDefault(_Account);

	var _Subscriber = __webpack_require__(11);

	var _Subscriber2 = _interopRequireDefault(_Subscriber);

	var _Address = __webpack_require__(12);

	var _Address2 = _interopRequireDefault(_Address);

	var _KeyLevel = __webpack_require__(13);

	var _KeyLevel2 = _interopRequireDefault(_KeyLevel);

	var _AuthHttpClient = __webpack_require__(14);

	var _AuthHttpClient2 = _interopRequireDefault(_AuthHttpClient);

	var _TransferToken = __webpack_require__(19);

	var _TransferToken2 = _interopRequireDefault(_TransferToken);

	var _AccessToken = __webpack_require__(20);

	var _AccessToken2 = _interopRequireDefault(_AccessToken);

	var _Transfer = __webpack_require__(21);

	var _Transfer2 = _interopRequireDefault(_Transfer);

	var _constants = __webpack_require__(16);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	/**
	 * Member object. Allows member-wide actions. Some calls return a promise, and some return
	 * objects
	 */
	var Member = function () {

	    /**
	     * Represents a Member
	     * @constructor
	     * @param {string} memberId - The id of this memberId
	     * @param {object} keys - An object representing the keypair of the user
	     */
	    function Member(env, memberId, keys) {
	        _classCallCheck(this, Member);

	        this._id = memberId;
	        this._keys = keys;
	        this._client = new _AuthHttpClient2.default(env, memberId, keys);
	    }

	    /**
	     * Gets the memberId
	     * @return {string} memberId
	     */


	    _createClass(Member, [{
	        key: "saveToLocalStorage",


	        /**
	         * Save the member to localStorage, to be loaded in the future. Only works on browsers
	         */
	        value: function saveToLocalStorage() {
	            _LocalStorage2.default.saveMember(this);
	        }

	        /**
	         * Sets the access token id to be used with this client.
	         *
	         * @param {string} accessTokenId - the access token id
	         */

	    }, {
	        key: "useAccessToken",
	        value: function useAccessToken(accessTokenId) {
	            this._client.useAccessToken(accessTokenId);
	        }

	        /**
	         * Clears the access token id used with this client.
	         */

	    }, {
	        key: "clearAccessToken",
	        value: function clearAccessToken() {
	            this._client.clearAccessToken();
	        }

	        /**
	         * Approves a new key for this member
	         * @param {Buffer} publicKey - key to add
	         * @param {string} keyLevel - Security level of this new key. PRIVILEGED is root security
	         * @return {Promise} empty empty promise
	         */

	    }, {
	        key: "approveKey",
	        value: function approveKey(publicKey) {
	            var _this = this;

	            var keyLevel = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _KeyLevel2.default.PRIVILEGED;

	            return this._getPreviousHash().then(function (prevHash) {
	                return _this._client.addKey(prevHash, _Crypto2.default.bufferKey(publicKey), keyLevel).then(function (res) {
	                    return undefined;
	                });
	            }).catch(function (err) {
	                return _this._reject(_this.approveKey, err);
	            });
	        }

	        /**
	         * Removes a key from this member
	         * @param {string} keyId - keyId to remove. Note, keyId is the hash of the pk
	         * @return {Promise} empty empty promise
	         */

	    }, {
	        key: "removeKey",
	        value: function removeKey(keyId) {
	            var _this2 = this;

	            return this._getPreviousHash().then(function (prevHash) {
	                return _this2._client.removeKey(prevHash, keyId).then(function (res) {
	                    return undefined;
	                });
	            }).catch(function (err) {
	                return _this2._reject(_this2.removeKey, err);
	            });
	        }

	        /**
	         * Adds an alias to this member
	         * @param {string} alias - alias to add
	         * @return {Promise} empty empty promise
	         */

	    }, {
	        key: "addAlias",
	        value: function addAlias(alias) {
	            var _this3 = this;

	            return this._getPreviousHash().then(function (prevHash) {
	                return _this3._client.addAlias(prevHash, alias).then(function (res) {
	                    return undefined;
	                });
	            }).catch(function (err) {
	                return _this3._reject(_this3.addAlias, err);
	            });
	        }

	        /**
	         * Removes an alias from the memberId
	         * @param {string} alias - alias to remove
	         * @return {Promise} empty - empty promise
	         */

	    }, {
	        key: "removeAlias",
	        value: function removeAlias(alias) {
	            var _this4 = this;

	            return this._getPreviousHash().then(function (prevHash) {
	                return _this4._client.removeAlias(prevHash, alias).then(function (res) {
	                    return undefined;
	                });
	            }).catch(function (err) {
	                return _this4._reject(_this4.removeAlias, err);
	            });
	        }

	        /**
	         * Links bank accounts to the member
	         * @param {string} bankId - bank to link
	         * @param {string} accountsLinkPayload - accountLinkPayload obtained from bank
	         * @return {Promise} accounts - Promise resolving the the Accounts linked
	         */

	    }, {
	        key: "linkAccounts",
	        value: function linkAccounts(bankId, accountsLinkPayload) {
	            var _this5 = this;

	            return this._client.linkAccounts(bankId, accountsLinkPayload).then(function (res) {
	                return res.data.accounts.map(function (acc) {
	                    return new _Account2.default(_this5, acc);
	                });
	            }).catch(function (err) {
	                return _this5._reject(_this5.linkAccounts, err);
	            });
	        }

	        /**
	         * Looks up the member's accounts
	         * @return {Promise} accounts - Promise resolving to the accounts
	         */

	    }, {
	        key: "getAccounts",
	        value: function getAccounts() {
	            var _this6 = this;

	            return this._client.getAccounts().then(function (res) {
	                return res.data.accounts.map(function (acc) {
	                    return new _Account2.default(_this6, acc);
	                });
	            }).catch(function (err) {
	                return _this6._reject(_this6.getAccounts, err);
	            });
	        }

	        /**
	         * Creates a subscriber to receive notifications of member events, such as step up auth,
	         * new device requests, linking account requests, or transfer notifications
	         * @param {string} target - the notification target for this device. (e.g iOS push token)
	         * @param {string} provider - provider to send the notification (default Token)
	         * @param {string} platform - platform of the devices (IOS, ANDROID, WEB, etc)
	         * @return {Promise} subscriber - Subscriber object
	         */

	    }, {
	        key: "subscribeToNotifications",
	        value: function subscribeToNotifications(target) {
	            var _this7 = this;

	            var provider = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _constants.defaultNotificationProvider;
	            var platform = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "IOS";

	            return this._client.subscribeToNotifications(target, provider, platform).then(function (res) {
	                return new _Subscriber2.default(res.data.subscriber);
	            }).catch(function (err) {
	                return _this7._reject(_this7.subscribeToNotifications, err);
	            });
	        }

	        /**
	         * Gets all subscribers for this member
	         *
	         * @return {Promise} - subscribers
	         */

	    }, {
	        key: "getSubscribers",
	        value: function getSubscribers() {
	            var _this8 = this;

	            return this._client.getSubscribers().then(function (res) {
	                return res.data.subscribers.map(function (s) {
	                    return new _Subscriber2.default(s);
	                });
	            }).catch(function (err) {
	                return _this8._reject(_this8.getSubscribers, err);
	            });
	        }

	        /**
	         * Gets a specific subscriber by Id
	         *
	         * @param {string} subscriberId - id of the subscriber
	         * @return {Promise} - subscriber
	         */

	    }, {
	        key: "getSubscriber",
	        value: function getSubscriber(subscriberId) {
	            var _this9 = this;

	            return this._client.getSubscriber(subscriberId).then(function (res) {
	                return new _Subscriber2.default(res.data.subscriber);
	            }).catch(function (err) {
	                return _this9._reject(_this9.getSubscriber, err);
	            });
	        }

	        /**
	         * Unsubscribes from notifications (removes a subscriber)
	         * @param {string} subscriberId - subscriber to remove
	         * @return {Promise} empty - empty promise
	         */

	    }, {
	        key: "unsubscribeFromNotifications",
	        value: function unsubscribeFromNotifications(subscriberId) {
	            var _this10 = this;

	            return this._client.unsubscribeFromNotifications(subscriberId).catch(function (err) {
	                return _this10._reject(_this10.unsubscribeFromNotifications, err);
	            });
	        }

	        /**
	         * Creates an address for this member, and saves it
	         * @param {string} name - name of the address (e.g 'Home')
	         * @param {string} data - data of the address (e.g '123 Broadway rd, San Francisco, CA 94158')
	         * @return {Promise} empty - empty promise
	         */

	    }, {
	        key: "addAddress",
	        value: function addAddress(name, data) {
	            var _this11 = this;

	            return this._client.addAddress(name, data).then(function (res) {
	                return new _Address2.default(res.data.address);
	            }).catch(function (err) {
	                return _this11._reject(_this11.addAddress, err);
	            });
	        }

	        /**
	         * Gets the member's addresse
	         *
	         * @param {string} addressId - the address id
	         * @return {Promise} address - the address
	         */

	    }, {
	        key: "getAddress",
	        value: function getAddress(addressId) {
	            var _this12 = this;

	            return this._client.getAddress(addressId).then(function (res) {
	                return new _Address2.default(res.data.address);
	            }).catch(function (err) {
	                return _this12._reject(_this12.getAddress, err);
	            });
	        }

	        /**
	         * Gets the member's addresses
	         * @return {Promise} addresses - Addresses
	         */

	    }, {
	        key: "getAddresses",
	        value: function getAddresses() {
	            var _this13 = this;

	            return this._client.getAddresses().then(function (res) {
	                return res.data.addresses.map(function (address) {
	                    return new _Address2.default(address);
	                });
	            }).catch(function (err) {
	                return _this13._reject(_this13.getAddresses, err);
	            });
	        }

	        /**
	         * Gets all of the member's aliases
	         * @return {Promise} aliases - member's aliases
	         */

	    }, {
	        key: "getAllAliases",
	        value: function getAllAliases() {
	            var _this14 = this;

	            return this._getMember().then(function (member) {
	                return member.aliases;
	            }).catch(function (err) {
	                return _this14._reject(_this14.getAllAliases, err);
	            });
	        }

	        /**
	         * Creates a new unendorsed Access Token
	         *
	         * @param {string} grantee - the alias of the grantee
	         * @param {object} resources - an array of resources
	         * @return {Promise} token - promise of a created AccessToken
	         */

	    }, {
	        key: "createAccessToken",
	        value: function createAccessToken(grantee, resources) {
	            var _this15 = this;

	            var token = new _AccessToken2.default(undefined, this, grantee, resources);
	            return this._client.createToken(token.json).then(function (res) {
	                return _AccessToken2.default.createFromToken(res.data.token);
	            }).catch(function (err) {
	                return _this15._reject(_this15.createAccessToken, err);
	            });
	        }

	        /**
	         * Creates a new Address Access Token
	         *
	         * @param {string} grantee - the alias of the grantee
	         * @param {string} addressId - an optional addressId
	         * @return {Promise} token - promise of a created AccessToken
	         */

	    }, {
	        key: "createAddressAccessToken",
	        value: function createAddressAccessToken(grantee, addressId) {
	            var _this16 = this;

	            var token = _AccessToken2.default.addressAccessToken(this, grantee, addressId);
	            return this._client.createToken(token.json).then(function (res) {
	                return _AccessToken2.default.createFromToken(res.data.token);
	            }).catch(function (err) {
	                return _this16._reject(_this16.createAddressAccessToken, err);
	            });
	        }

	        /**
	         * Creates a new Account Access Token
	         *
	         * @param {string} grantee - the alias of the grantee
	         * @param {string} accountId - an optional accountId
	         * @return {Promise} token - promise of a created AccessToken
	         */

	    }, {
	        key: "createAccountAccessToken",
	        value: function createAccountAccessToken(grantee, accountId) {
	            var _this17 = this;

	            var token = _AccessToken2.default.accountAccessToken(this, grantee, accountId);
	            return this._client.createToken(token.json).then(function (res) {
	                return _AccessToken2.default.createFromToken(res.data.token);
	            }).catch(function (err) {
	                return _this17._reject(_this17.createAccountAccessToken, err);
	            });
	        }

	        /**
	         * Creates a new Transaction Access Token
	         *
	         * @param {string} grantee - the alias of the grantee
	         * @param {string} accountId - an optional accountId
	         * @return {Promise} token - promise of a created AccessToken
	         */

	    }, {
	        key: "createTransactionAccessToken",
	        value: function createTransactionAccessToken(grantee, accountId) {
	            var _this18 = this;

	            var token = _AccessToken2.default.transactionAccessToken(this, grantee, accountId);
	            return this._client.createToken(token.json).then(function (res) {
	                return _AccessToken2.default.createFromToken(res.data.token);
	            }).catch(function (err) {
	                return _this18._reject(_this18.createTransactionAccessToken, err);
	            });
	        }

	        /**
	         * Creates an unendorsed Transfer Token
	         *
	         * @param {string} accountId - id of the source account
	         * @param {double} amount - amount limit on the token
	         * @param {string} currency - 3 letter currency code ('EUR', 'USD', etc)
	         * @param {string} alias - alias of the redeemer of this token
	         * @param {string} description - optional description for the token
	         * @return {Promise} token - promise of a created TransferToken
	         */

	    }, {
	        key: "createToken",
	        value: function createToken(accountId, amount, currency, alias) {
	            var _this19 = this;

	            var description = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : undefined;

	            var token = _TransferToken2.default.create(this, accountId, amount, currency, alias, description);
	            return this._client.createToken(token.json).then(function (res) {
	                return _TransferToken2.default.createFromToken(res.data.token);
	            }).catch(function (err) {
	                return _this19._reject(_this19.createToken, err);
	            });
	        }

	        /**
	         * Looks up a token by its Id
	         * @param {string} tokenId - id of the token
	         * @return {Promise} token - TransferToken
	         */

	    }, {
	        key: "getToken",
	        value: function getToken(tokenId) {
	            var _this20 = this;

	            return this._client.getToken(tokenId).then(function (res) {
	                return _TransferToken2.default.createFromToken(res.data.token);
	            }).catch(function (err) {
	                return _this20._reject(_this20.getToken, err);
	            });
	        }

	        /**
	         * Looks up all transfer tokens (not just for this account)
	         * @param {int} offset - where to start looking
	         * @param {int} limit - how many to look for
	         * @return {TransferToken} tokens - returns a list of Transfer Tokens
	         */

	    }, {
	        key: "getTransferTokens",
	        value: function getTransferTokens() {
	            var _this21 = this;

	            var offset = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
	            var limit = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 100;

	            return this._client.getTokens('TRANSFER', offset, limit).then(function (res) {
	                if (res.data.tokens === undefined) return [];
	                return res.data.tokens.map(function (tk) {
	                    return _TransferToken2.default.createFromToken(tk);
	                });
	            }).catch(function (err) {
	                return _this21._reject(_this21.getTransferTokens, err);
	            });
	        }

	        /**
	         * Looks up all access tokens (not just for this account)
	         * @param {int} offset - where to start looking
	         * @param {int} limit - how many to look for
	         * @return {TransferToken} tokens - returns a list of Transfer Tokens
	         */

	    }, {
	        key: "getAccessTokens",
	        value: function getAccessTokens() {
	            var _this22 = this;

	            var offset = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
	            var limit = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 100;

	            return this._client.getTokens('ACCESS', offset, limit).then(function (res) {
	                if (res.data.tokens === undefined) return [];
	                return res.data.tokens.map(function (tk) {
	                    return _TransferToken2.default.createFromToken(tk);
	                });
	            }).catch(function (err) {
	                return _this22._reject(_this22.getAccessTokens, err);
	            });
	        }

	        /**
	         * Endorses a token
	         * @param {BankTransferToken} token - Transfer token to endorse. Can also be a {string} tokenId
	         * @return {Promise} token - Promise of endorsed transfer token
	         */

	    }, {
	        key: "endorseToken",
	        value: function endorseToken(token) {
	            var _this23 = this;

	            return this._resolveToken(token).then(function (finalToken) {
	                return _this23._client.endorseToken(finalToken).then(function (res) {
	                    if (typeof token !== 'string' && !(token instanceof String)) {
	                        token.payloadSignatures = res.data.token.payloadSignatures;
	                    }
	                });
	            }).catch(function (err) {
	                return _this23._reject(_this23.endorseToken, err);
	            });
	        }

	        /**
	         * Cancels a token. (Called by the payer or the redeemer)
	         * @param {BankTransferToken} token - token to cancel. Can also be a {string} tokenId
	         * @return {BankTransferToken} token - cancelled token
	         */

	    }, {
	        key: "cancelToken",
	        value: function cancelToken(token) {
	            var _this24 = this;

	            return this._resolveToken(token).then(function (finalToken) {
	                return _this24._client.cancelToken(finalToken).then(function (res) {
	                    if (typeof token !== 'string' && !(token instanceof String)) {
	                        token.payloadSignatures = res.data.token.payloadSignatures;
	                    }
	                });
	            }).catch(function (err) {
	                return _this24._reject(_this24.cancelToken, err);
	            });
	        }

	        /**
	         * Redeems a token. (Called by the payee or redeemer)
	         * @param {BankTransferToken} token - token to redeem. Can also be a {string} tokenId
	         * @param {int} amount - amount to redeemer
	         * @param {string} currency - currency to redeem
	         * @return {Promise} transfer - Transfer created as a result of this redeem call
	         */

	    }, {
	        key: "createTransfer",
	        value: function createTransfer(token, amount, currency) {
	            var _this25 = this;

	            return this._resolveToken(token).then(function (finalToken) {
	                if (amount === undefined) {
	                    amount = finalToken.payload.transfer.amount;
	                }
	                if (currency === undefined) {
	                    currency = finalToken.payload.transfer.currency;
	                }
	                return _this25._client.createTransfer(finalToken, amount, currency).then(function (res) {
	                    return new _Transfer2.default(res.data.transfer);
	                });
	            }).catch(function (err) {
	                return _this25._reject(_this25.createTransfer, err);
	            });
	        }

	        /**
	         * Looks up a transfer
	         * @param {string} transferId - id to look up
	         * @return {Transfer} transfer - transfer if found
	         */

	    }, {
	        key: "getTransfer",
	        value: function getTransfer(transferId) {
	            var _this26 = this;

	            return this._client.getTransfer(transferId).then(function (res) {
	                return new _Transfer2.default(res.data.transfer);
	            }).catch(function (err) {
	                return _this26._reject(_this26.getTransfer, err);
	            });
	        }

	        /**
	         * Looks up all of the member's transfers
	         * @param {string} tokenId - token to use for lookup
	         * @param {int} offset - where to start looking
	         * @param {int} limit - how many to retrieve
	         * @return {Promise} transfers - Transfers
	         */

	    }, {
	        key: "getTransfers",
	        value: function getTransfers(tokenId) {
	            var _this27 = this;

	            var offset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
	            var limit = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 100;

	            return this._client.getTransfers(tokenId, offset, limit).then(function (res) {
	                return res.data.transfers.map(function (pt) {
	                    return new _Transfer2.default(pt);
	                });
	            }).catch(function (err) {
	                return _this27._reject(_this27.getTransfers, err);
	            });
	        }

	        /**
	         * Gets the member's public keys
	         * @return {Promise} keys - keys objects
	         */

	    }, {
	        key: "getPublicKeys",
	        value: function getPublicKeys() {
	            var _this28 = this;

	            return this._getMember().then(function (member) {
	                return member.keys;
	            }).catch(function (err) {
	                return _this28._reject(_this28.getPublicKeys, err);
	            });
	        }
	    }, {
	        key: "_getPreviousHash",
	        value: function _getPreviousHash() {
	            var _this29 = this;

	            return this._getMember().then(function (member) {
	                return member.lastHash;
	            }).catch(function (err) {
	                return _this29._reject(_this29._getPreviousHash, err);
	            });
	        }
	    }, {
	        key: "_getMember",
	        value: function _getMember() {
	            var _this30 = this;

	            return this._client.getMember().then(function (res) {
	                return res.data.member;
	            }).catch(function (err) {
	                return _this30._reject(_this30._getMember, err);
	            });
	        }
	    }, {
	        key: "_resolveToken",
	        value: function _resolveToken(token) {
	            var _this31 = this;

	            return new Promise(function (resolve, reject) {
	                if (typeof token === 'string' || token instanceof String) {
	                    _this31.getToken(token).then(function (lookedUp) {
	                        return resolve(lookedUp);
	                    });
	                } else {
	                    resolve(token);
	                }
	            });
	        }
	    }, {
	        key: "_reject",
	        value: function _reject(method, err) {
	            return Promise.reject({
	                type: method.name,
	                error: err,
	                reason: err.response.data !== undefined ? err.response.data : "UNKNOWN"
	            });
	        }
	    }, {
	        key: "id",
	        get: function get() {
	            return this._id;
	        }

	        /**
	         * Returns the member's key pair
	         * @return {object} keyPair
	         */

	    }, {
	        key: "keys",
	        get: function get() {
	            return this._keys;
	        }
	    }]);

	    return Member;
	}();

	exports.default = Member;

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _Member = __webpack_require__(7);

	var _Member2 = _interopRequireDefault(_Member);

	var _Crypto = __webpack_require__(1);

	var _Crypto2 = _interopRequireDefault(_Crypto);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var LocalStorage = function () {
	    function LocalStorage() {
	        _classCallCheck(this, LocalStorage);
	    }

	    _createClass(LocalStorage, null, [{
	        key: "saveMember",
	        value: function saveMember(member) {
	            if (true) {
	                throw new Error("Browser Only");
	            }
	            var payload = {
	                memberId: member.id,
	                keys: {
	                    publicKey: _Crypto2.default.strKey(member.keys.publicKey),
	                    secretKey: _Crypto2.default.strKey(member.keys.secretKey),
	                    keyId: member.keys.keyId
	                }
	            };
	            window.localStorage.member = JSON.stringify(payload);
	        }
	    }, {
	        key: "loadMember",
	        value: function loadMember() {
	            if (true) {
	                throw new Error("Browser Only");
	            }
	            var loaded = JSON.parse(window.localStorage.member);
	            var correctKeys = {
	                publicKey: _Crypto2.default.bufferKey(loaded.keys.publicKey),
	                secretKey: _Crypto2.default.bufferKey(loaded.keys.secretKey),
	                keyId: loaded.keys.keyId
	            };
	            return new _Member2.default(loaded.memberId, correctKeys);
	        }
	    }]);

	    return LocalStorage;
	}();

	exports.default = LocalStorage;

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _Transaction = __webpack_require__(10);

	var _Transaction2 = _interopRequireDefault(_Transaction);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	/**
	 * Account class. Allows the member to make account specific operations, move money, etc
	 */
	var Account = function () {
	    /**
	     * Represents the account
	     * @constructor
	     * @param {Member} member - member that owns this account
	     * @param {object} acc - account json object retrieved from server
	     */
	    function Account(member, acc) {
	        _classCallCheck(this, Account);

	        this._member = member;
	        this._id = acc.id;
	        this._name = acc.name;
	    }

	    /**
	     * return the member
	     * @return {Member} member - member
	     */


	    _createClass(Account, [{
	        key: "setName",


	        /**
	         * Sets the account name
	         * @param {string} name - accountName
	         * @return {Promise} empty - empty promise
	         */
	        value: function setName(name) {
	            var _this = this;

	            return this._member._client.setAccountName(this._id, name).then(function () {
	                _this._name = name;
	            }).catch(function (err) {
	                return _this._reject(_this.setName, err);
	            });
	        }

	        /**
	         * Looks up the balance of the account
	         * @return {Promise} balance - Promise of balance object
	         */

	    }, {
	        key: "getBalance",
	        value: function getBalance() {
	            var _this2 = this;

	            return this._member._client.getBalance(this._id).then(function (res) {
	                return res.data;
	            }).catch(function (err) {
	                return _this2._reject(_this2.getBalance, err);
	            });
	        }

	        /**
	         * Looks up a transaction for the account
	         * @param {string} transactionId - which transaction to look up
	         * @return {Promise} transaction - the Transaction
	         */

	    }, {
	        key: "getTransaction",
	        value: function getTransaction(transactionId) {
	            var _this3 = this;

	            return this._member._client.getTransaction(this._id, transactionId).then(function (res) {
	                return new _Transaction2.default(res.data.transaction);
	            }).catch(function (err) {
	                return _this3._reject(_this3.getTransaction, err);
	            });
	        }

	        /**
	         * Looks up all of the member's transactions
	         * @param {int} offset - where to start looking
	         * @param {int} limit - how many to retrieve
	         * @return {Promise} transactions - Transactions
	         */

	    }, {
	        key: "getTransactions",
	        value: function getTransactions() {
	            var _this4 = this;

	            var offset = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
	            var limit = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 100;

	            return this._member._client.getTransactions(this._id, offset, limit).then(function (res) {
	                return res.data.transactions.map(function (tr) {
	                    return new _Transaction2.default(tr);
	                });
	            }).catch(function (err) {
	                return _this4._reject(_this4.getTransactions, err);
	            });
	        }
	    }, {
	        key: "_reject",
	        value: function _reject(method, err) {
	            return Promise.reject({
	                type: method.name,
	                error: err,
	                reason: err.response.data !== undefined ? err.response.data : "UNKNOWN"
	            });
	        }
	    }, {
	        key: "member",
	        get: function get() {
	            return this._member;
	        }

	        /**
	         * return the account Id
	         * @return {string} accountId - accountId
	         */

	    }, {
	        key: "id",
	        get: function get() {
	            return this._id;
	        }

	        /**
	         * return the name of the account
	         * @return {string} accountName - name
	         */

	    }, {
	        key: "name",
	        get: function get() {
	            return this._name;
	        }
	    }]);

	    return Account;
	}();

	exports.default = Account;

/***/ },
/* 10 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var Transaction = function () {
	    function Transaction(transactionObj) {
	        _classCallCheck(this, Transaction);

	        this._id = transactionObj.id;
	        this._type = transactionObj.type;
	        this._currency = transactionObj.amount.currency;
	        this._amount = parseFloat(transactionObj.amount.value);
	        this._description = transactionObj.description;
	        this._tokenId = transactionObj.tokenId;
	        this._tokenTransferId = transactionObj.tokenTransferId;
	    }

	    _createClass(Transaction, [{
	        key: "id",
	        get: function get() {
	            return this._id;
	        }
	    }, {
	        key: "type",
	        get: function get() {
	            return this._type;
	        }
	    }, {
	        key: "amount",
	        get: function get() {
	            return this._amount;
	        }
	    }, {
	        key: "currency",
	        get: function get() {
	            return this._currency;
	        }
	    }, {
	        key: "description",
	        get: function get() {
	            return this._description;
	        }
	    }, {
	        key: "tokenId",
	        get: function get() {
	            return this._tokenId;
	        }
	    }, {
	        key: "tokenTransferId",
	        get: function get() {
	            return this._tokenTransferId;
	        }
	    }]);

	    return Transaction;
	}();

	exports.default = Transaction;

/***/ },
/* 11 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var Subscriber = function () {
	    function Subscriber(subscriberObj) {
	        _classCallCheck(this, Subscriber);

	        this._id = subscriberObj.id;
	        this._target = subscriberObj.target;
	        this._platform = subscriberObj.platform;
	    }

	    _createClass(Subscriber, [{
	        key: "id",
	        get: function get() {
	            return this._id;
	        }
	    }, {
	        key: "target",
	        get: function get() {
	            return this._target;
	        }
	    }, {
	        key: "platform",
	        get: function get() {
	            return this._platform;
	        }
	    }]);

	    return Subscriber;
	}();

	exports.default = Subscriber;

/***/ },
/* 12 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var Address = function () {
	    function Address(addressObj) {
	        _classCallCheck(this, Address);

	        this._id = addressObj.id;
	        this._name = addressObj.name;
	        this._data = addressObj.payload;
	        this._dataSignature = addressObj.payloadSignature;
	    }

	    _createClass(Address, [{
	        key: "id",
	        get: function get() {
	            return this._id;
	        }
	    }, {
	        key: "name",
	        get: function get() {
	            return this._name;
	        }
	    }, {
	        key: "data",
	        get: function get() {
	            return this._data;
	        }
	    }, {
	        key: "dataSignature",
	        get: function get() {
	            return this._dataSignature;
	        }
	    }]);

	    return Address;
	}();

	exports.default = Address;

/***/ },
/* 13 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.default = {
	    PRIVILEGED: 'PRIVILEGED',
	    STANDARD: 'STANDARD',
	    LOW: 'LOW'
	};

/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _Crypto = __webpack_require__(1);

	var _Crypto2 = _interopRequireDefault(_Crypto);

	var _Util = __webpack_require__(6);

	var _Util2 = _interopRequireDefault(_Util);

	var _AuthHeader = __webpack_require__(15);

	var _AuthHeader2 = _interopRequireDefault(_AuthHeader);

	var _AuthContext = __webpack_require__(17);

	var _AuthContext2 = _interopRequireDefault(_AuthContext);

	var _constants = __webpack_require__(16);

	var _KeyLevel = __webpack_require__(13);

	var _KeyLevel2 = _interopRequireDefault(_KeyLevel);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var stringify = __webpack_require__(5);
	var axios = __webpack_require__(18);

	/**
	 * Authenticated client for making requests to the Token gateway
	 */

	var AuthHttpClient = function () {
	    function AuthHttpClient(env, memberId, keys) {
	        _classCallCheck(this, AuthHttpClient);

	        this._instance = axios.create({
	            baseURL: _constants.urls[env]
	        });
	        this._memberId = memberId;
	        this._keys = keys;
	        this._context = new _AuthContext2.default();
	        this._authHeader = new _AuthHeader2.default(_constants.urls[env], keys);
	        this._resetInterceptor();
	    }

	    _createClass(AuthHttpClient, [{
	        key: "_resetInterceptor",
	        value: function _resetInterceptor() {
	            var _this = this;

	            this._instance.interceptors.request.eject(this._interceptor);

	            this._interceptor = this._instance.interceptors.request.use(function (config) {
	                _this._authHeader.addAuthorizationHeaderMemberId(_this._memberId, config, _this._context);
	                return config;
	            });
	        }
	    }, {
	        key: "useAccessToken",
	        value: function useAccessToken(accessTokenId) {
	            this._context.onBehalfOf = accessTokenId;
	            this._resetInterceptor();
	        }
	    }, {
	        key: "clearAccessToken",
	        value: function clearAccessToken() {
	            this._context.onBehalfOf = undefined;
	            this._resetInterceptor();
	        }
	    }, {
	        key: "subscribeToNotifications",
	        value: function subscribeToNotifications(target, provider, platform) {
	            var req = {
	                provider: provider,
	                target: target,
	                platform: platform
	            };
	            var config = {
	                method: 'post',
	                url: "/subscribers",
	                data: req
	            };
	            return this._instance(config);
	        }
	    }, {
	        key: "getSubscribers",
	        value: function getSubscribers() {
	            var config = {
	                method: 'get',
	                url: "/subscribers"
	            };
	            return this._instance(config);
	        }
	    }, {
	        key: "getSubscriber",
	        value: function getSubscriber(subscriberId) {
	            var config = {
	                method: 'get',
	                url: "/subscribers/" + subscriberId
	            };
	            return this._instance(config);
	        }
	    }, {
	        key: "unsubscribeFromNotifications",
	        value: function unsubscribeFromNotifications(subscriberId) {
	            var config = {
	                method: 'delete',
	                url: "/subscribers/" + subscriberId
	            };
	            return this._instance(config);
	        }

	        //
	        // ADDRESSES
	        //

	    }, {
	        key: "addAddress",
	        value: function addAddress(name, data) {
	            var req = {
	                name: name,
	                data: data,
	                dataSignature: {
	                    keyId: this._keys.keyId,
	                    signature: _Crypto2.default.sign(data, this._keys),
	                    timestampMs: new Date().getTime()
	                }
	            };
	            var config = {
	                method: 'post',
	                url: "/addresses",
	                data: req
	            };
	            return this._instance(config);
	        }
	    }, {
	        key: "getAddress",
	        value: function getAddress(addressId) {
	            var config = {
	                method: 'get',
	                url: "/addresses/" + addressId
	            };
	            return this._instance(config);
	        }
	    }, {
	        key: "getAddresses",
	        value: function getAddresses() {
	            var config = {
	                method: 'get',
	                url: "/addresses"
	            };
	            return this._instance(config);
	        }

	        //
	        // ACCOUNTS
	        //

	    }, {
	        key: "linkAccounts",
	        value: function linkAccounts(bankId, accountsLinkPayload) {
	            var req = {
	                bankId: bankId,
	                accountsLinkPayload: accountsLinkPayload
	            };
	            var config = {
	                method: 'post',
	                url: "/accounts",
	                data: req
	            };
	            return this._instance(config);
	        }
	    }, {
	        key: "getAccounts",
	        value: function getAccounts() {
	            var config = {
	                method: 'get',
	                url: "/accounts"
	            };
	            return this._instance(config);
	        }
	    }, {
	        key: "setAccountName",
	        value: function setAccountName(accountId, name) {
	            var config = {
	                method: 'patch',
	                url: "/accounts/" + accountId + "?name=" + name
	            };
	            return this._instance(config);
	        }
	    }, {
	        key: "getBalance",
	        value: function getBalance(accountId) {
	            var config = {
	                method: 'get',
	                url: "/accounts/" + accountId + "/balance"
	            };
	            return this._instance(config);
	        }
	    }, {
	        key: "getTransaction",
	        value: function getTransaction(accountId, transactionId) {
	            var config = {
	                method: 'get',
	                url: "/accounts/" + accountId + "/transactions/" + transactionId
	            };
	            return this._instance(config);
	        }
	    }, {
	        key: "getTransactions",
	        value: function getTransactions(accountId, offset, limit) {
	            var config = {
	                method: 'get',
	                url: "/accounts/" + accountId + "/transactions?offset=" + offset + "&limit=" + limit
	            };
	            return this._instance(config);
	        }

	        //
	        // Tokens
	        //

	    }, {
	        key: "createToken",
	        value: function createToken(payload) {
	            var config = {
	                method: 'post',
	                url: "/tokens",
	                data: {
	                    payload: payload
	                }
	            };
	            return this._instance(config);
	        }
	    }, {
	        key: "endorseToken",
	        value: function endorseToken(token) {
	            return this._tokenOperation(token, 'endorse', 'endorsed');
	        }
	    }, {
	        key: "cancelToken",
	        value: function cancelToken(transferToken) {
	            return this._tokenOperation(transferToken, 'cancel', 'cancelled');
	        }
	    }, {
	        key: "_tokenOperation",
	        value: function _tokenOperation(transferToken, operation, suffix) {
	            var payload = stringify(transferToken.json) + ("." + suffix);
	            var req = {
	                tokenId: transferToken.id,
	                signature: {
	                    keyId: this._keys.keyId,
	                    signature: _Crypto2.default.sign(payload, this._keys),
	                    timestampMs: new Date().getTime()
	                }
	            };
	            var tokenId = transferToken.id;
	            var config = {
	                method: 'put',
	                url: "/tokens/" + tokenId + "/" + operation,
	                data: req
	            };
	            return this._instance(config);
	        }
	    }, {
	        key: "createTransfer",
	        value: function createTransfer(transferToken, amount, currency) {
	            var payload = {
	                nonce: _Util2.default.generateNonce(),
	                tokenId: transferToken.id,
	                amount: {
	                    value: amount.toString(),
	                    currency: currency
	                },
	                transfer: transferToken.transfer
	            };

	            var req = {
	                payload: payload,
	                payloadSignature: {
	                    keyId: this._keys.keyId,
	                    signature: _Crypto2.default.signJson(payload, this._keys),
	                    timestampMs: new Date().getTime()
	                }
	            };
	            var config = {
	                method: 'post',
	                url: "/transfers",
	                data: req
	            };
	            return this._instance(config);
	        }
	    }, {
	        key: "getToken",
	        value: function getToken(tokenId) {
	            var config = {
	                method: 'get',
	                url: "/tokens/" + tokenId
	            };
	            return this._instance(config);
	        }
	    }, {
	        key: "getTokens",
	        value: function getTokens(type, offset, limit) {
	            var config = {
	                method: 'get',
	                url: "/tokens?type=" + type + "&offset=" + offset + "&limit=" + limit
	            };
	            return this._instance(config);
	        }

	        //
	        // Transfers
	        //

	    }, {
	        key: "getTransfer",
	        value: function getTransfer(transferId) {
	            var config = {
	                method: 'get',
	                url: "/transfers/" + transferId
	            };
	            return this._instance(config);
	        }
	    }, {
	        key: "getTransfers",
	        value: function getTransfers(tokenId, offset, limit) {
	            var config = {
	                method: 'get',
	                url: "/transfers?tokenId=" + tokenId + "&offset=" + offset + "&limit=" + limit
	            };
	            return this._instance(config);
	        }

	        //
	        // Directory
	        //

	    }, {
	        key: "getMember",
	        value: function getMember() {
	            var config = {
	                method: 'get',
	                url: "/members"
	            };
	            return this._instance(config);
	        }
	    }, {
	        key: "addKey",
	        value: function addKey(prevHash, publicKey, keyLevel) {
	            var update = {
	                memberId: this._memberId,
	                addKey: {
	                    publicKey: _Crypto2.default.strKey(publicKey)
	                }
	            };

	            // Do this because default this._keys are invisible in protos
	            if (keyLevel !== _KeyLevel2.default.PRIVILEGED) {
	                update.addKey.level = keyLevel;
	            }

	            return this._memberUpdate(update, prevHash);
	        }
	    }, {
	        key: "removeKey",
	        value: function removeKey(prevHash, keyId) {
	            var update = {
	                memberId: this._memberId,
	                removeKey: {
	                    keyId: keyId
	                }
	            };
	            return this._memberUpdate(update, prevHash);
	        }
	    }, {
	        key: "addAlias",
	        value: function addAlias(prevHash, alias) {
	            var update = {
	                memberId: this._memberId,
	                addAlias: {
	                    alias: alias
	                }
	            };
	            return this._memberUpdate(update, prevHash);
	        }
	    }, {
	        key: "removeAlias",
	        value: function removeAlias(prevHash, alias) {
	            var update = {
	                memberId: this._memberId,
	                removeAlias: {
	                    alias: alias
	                }
	            };
	            return this._memberUpdate(update, prevHash);
	        }
	    }, {
	        key: "_memberUpdate",
	        value: function _memberUpdate(update, prevHash) {
	            if (prevHash !== '') {
	                update.prevHash = prevHash;
	            }

	            var req = {
	                update: update,
	                updateSignature: {
	                    keyId: this._keys.keyId,
	                    signature: _Crypto2.default.signJson(update, this._keys),
	                    timestampMs: new Date().getTime()
	                }
	            };
	            var config = {
	                method: 'post',
	                url: "/members/" + this._memberId,
	                data: req
	            };
	            return this._instance(config);
	        }
	    }]);

	    return AuthHttpClient;
	}();

	exports.default = AuthHttpClient;

/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _constants = __webpack_require__(16);

	var _Crypto = __webpack_require__(1);

	var _Crypto2 = _interopRequireDefault(_Crypto);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var stringify = __webpack_require__(5);

	var AuthHeader = function () {
	    function AuthHeader(baseUrl, keys) {
	        _classCallCheck(this, AuthHeader);

	        this._baseUrl = baseUrl;
	        this._keys = keys;
	    }
	    /*
	     * Adds an authorization header with the identity set as the memberId. This is preferrable
	     * to alias identity, because it reduces trust required (no alias lookup)
	     */


	    _createClass(AuthHeader, [{
	        key: "addAuthorizationHeaderMemberId",
	        value: function addAuthorizationHeaderMemberId(memberId, config, context) {
	            var identity = 'member-id=' + memberId;
	            this.addAuthorizationHeader(identity, config, context);
	        }

	        /*
	         * Adds an authorization header with identity set as the alias. Useful when
	         * on a browser that doesn't yet have a memberId
	         */

	    }, {
	        key: "addAuthorizationHeaderAlias",
	        value: function addAuthorizationHeaderAlias(alias, config, context) {
	            var identity = 'alias=' + alias;
	            this.addAuthorizationHeader(identity, config, context);
	        }

	        /*
	         * Adds an authorization header to an HTTP request. The header is built
	         * using the request info and the keys. The config is the axios request configuration,
	         * right before it is sent to the server
	         */

	    }, {
	        key: "addAuthorizationHeader",
	        value: function addAuthorizationHeader(identity, config, context) {
	            // Parses out the base uri
	            var uriPath = config.url.replace(this._baseUrl, '');

	            // Makes sure the uri is formatted correctly
	            uriPath = uriPath.substring(0, 1) === '/' ? uriPath : uriPath + '/';
	            uriPath = uriPath.substring(uriPath.length - 1) === '/' ? uriPath.substring(0, uriPath.length - 1) : uriPath;

	            // Path should not include query parameters
	            if (uriPath.includes("?")) {
	                uriPath = uriPath.substring(0, uriPath.indexOf("?"));
	            }

	            // Creates the payload from the config info
	            var payload = {
	                method: config.method.toUpperCase(),
	                uriHost: this._baseUrl.replace('http://', '').replace('https://', ''),
	                uriPath: uriPath
	            };

	            if (config.data !== undefined && config.data !== '') {
	                payload.requestBody = stringify(config.data);
	            }

	            // Signs the query string as well, if it exists
	            if (config.url.indexOf("?") !== -1) {
	                payload.queryString = config.url.substring(config.url.indexOf("?") + 1);
	            }

	            // Signs the Json string
	            var signature = _Crypto2.default.signJson(payload, this._keys);

	            // Creates the authorization header, ands adds it to the request
	            var header = _constants.signatureScheme + ' ' + identity + ',' + 'key-id=' + this._keys.keyId + ',' + 'signature=' + signature + AuthHeader._onBehalfOfHeader(context);

	            config.headers = {
	                Authorization: header
	            };
	        }
	    }], [{
	        key: "_onBehalfOfHeader",
	        value: function _onBehalfOfHeader(context) {
	            if (context !== undefined && context.onBehalfOf !== undefined && context.onBehalfOf !== '') {
	                return ',on-behalf-of=' + context.onBehalfOf;
	            }
	            return '';
	        }
	    }]);

	    return AuthHeader;
	}();

	exports.default = AuthHeader;

/***/ },
/* 16 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	// Signature scheme to use
	var signatureScheme = 'Token-Ed25519-SHA512';

	// Hosts of the gateway
	var urls = {
	    local: 'http://localhost:8000',
	    dev: 'http://dev.api.token.io',
	    stg: 'http://stg.api.token.io',
	    prd: 'http://prd.api.token.io'
	};

	// Scheme for transfer tokens
	var transferTokenVersion = '1.0';

	// Scheme for transfer tokens
	var accessTokenVersion = '1.0';

	// Default currency to use
	var defaultCurrency = 'EUR';

	// Default notification provider to use
	var defaultNotificationProvider = 'Token';

	exports.signatureScheme = signatureScheme;
	exports.urls = urls;
	exports.transferTokenVersion = transferTokenVersion;
	exports.accessTokenVersion = accessTokenVersion;
	exports.defaultCurrency = defaultCurrency;
	exports.defaultNotificationProvider = defaultNotificationProvider;

/***/ },
/* 17 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var AuthContext = function () {
	    function AuthContext() {
	        _classCallCheck(this, AuthContext);

	        this._onBehalfOf = undefined;
	    }

	    _createClass(AuthContext, [{
	        key: "onBehalfOf",
	        set: function set(onBehalfOf) {
	            this._onBehalfOf = onBehalfOf;
	        },
	        get: function get() {
	            return this._onBehalfOf;
	        }
	    }]);

	    return AuthContext;
	}();

	exports.default = AuthContext;

/***/ },
/* 18 */
/***/ function(module, exports) {

	module.exports = require("axios");

/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _Util = __webpack_require__(6);

	var _Util2 = _interopRequireDefault(_Util);

	var _constants = __webpack_require__(16);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var BankTransferToken = function () {
	    _createClass(BankTransferToken, null, [{
	        key: "createFromToken",
	        value: function createFromToken(token) {
	            var id = token.id;
	            var from = token.payload.from;
	            var instructions = token.payload.transfer.instructions;
	            var amount = parseFloat(token.payload.transfer.amount);
	            var currency = token.payload.transfer.currency;
	            var redeemer = token.payload.transfer.redeemer;
	            var description = token.payload.description;
	            var version = token.payload.version;
	            var issuer = token.payload.issuer;
	            var nonce = token.payload.nonce;
	            var payloadSignatures = token.payloadSignatures;
	            return new BankTransferToken(id, from, instructions, amount, currency, redeemer, description, version, issuer, nonce, payloadSignatures);
	        }
	    }, {
	        key: "create",
	        value: function create(member, accountId, amount, currency, alias, description) {
	            var from = {
	                id: member.id
	            };
	            var redeemer = {
	                alias: alias
	            };
	            var instructions = {
	                source: {
	                    accountId: accountId
	                }
	            };
	            return new BankTransferToken(undefined, from, instructions, amount, currency, redeemer, description);
	        }
	    }]);

	    function BankTransferToken(id, from, instructions, amount, currency, redeemer, description) {
	        var version = arguments.length > 7 && arguments[7] !== undefined ? arguments[7] : _constants.transferTokenVersion;
	        var issuer = arguments.length > 8 && arguments[8] !== undefined ? arguments[8] : undefined;
	        var nonce = arguments.length > 9 && arguments[9] !== undefined ? arguments[9] : undefined;
	        var payloadSignatures = arguments.length > 10 && arguments[10] !== undefined ? arguments[10] : [];

	        _classCallCheck(this, BankTransferToken);

	        this._id = id;
	        this._from = from;
	        this._instructions = instructions;
	        this._amount = amount;
	        this._currency = currency;
	        this._redeemer = redeemer;
	        this._description = description;
	        this._version = version;
	        this._issuer = issuer;
	        this._nonce = nonce;
	        this._payloadSignatures = payloadSignatures;
	        if (nonce === undefined) {
	            this._nonce = _Util2.default.generateNonce();
	        }
	    }

	    _createClass(BankTransferToken, [{
	        key: "payloadSignatures",
	        set: function set(sigs) {
	            this._payloadSignatures = [];
	            var _iteratorNormalCompletion = true;
	            var _didIteratorError = false;
	            var _iteratorError = undefined;

	            try {
	                for (var _iterator = sigs[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
	                    var sig = _step.value;

	                    this._payloadSignatures.push(sig);
	                }
	            } catch (err) {
	                _didIteratorError = true;
	                _iteratorError = err;
	            } finally {
	                try {
	                    if (!_iteratorNormalCompletion && _iterator.return) {
	                        _iterator.return();
	                    }
	                } finally {
	                    if (_didIteratorError) {
	                        throw _iteratorError;
	                    }
	                }
	            }
	        },
	        get: function get() {
	            return this._payloadSignatures;
	        }

	        // Creates a standardized json object for the TransferToken, to be used for signing

	    }, {
	        key: "id",
	        get: function get() {
	            return this._id;
	        }
	    }, {
	        key: "from",
	        get: function get() {
	            return this._from;
	        }
	    }, {
	        key: "amount",
	        get: function get() {
	            return this._amount;
	        }
	    }, {
	        key: "currency",
	        get: function get() {
	            return this._currency;
	        }
	    }, {
	        key: "redeemer",
	        get: function get() {
	            return this._redeemer;
	        }
	    }, {
	        key: "description",
	        get: function get() {
	            return this._description;
	        }
	    }, {
	        key: "version",
	        get: function get() {
	            return this._version;
	        }
	    }, {
	        key: "issuer",
	        get: function get() {
	            return this._issuer;
	        }
	    }, {
	        key: "nonce",
	        get: function get() {
	            return this._nonce;
	        }
	    }, {
	        key: "json",
	        get: function get() {
	            var json = {
	                version: this._version,
	                nonce: this._nonce,
	                from: this._from,
	                transfer: {
	                    currency: this._currency,
	                    amount: this._amount.toString(),
	                    instructions: this._instructions
	                }
	            };
	            if (this._redeemer !== undefined) {
	                json.transfer.redeemer = this._redeemer;
	            }
	            if (this._description !== '') {
	                json.description = this._description;
	            }
	            if (this._issuer !== undefined) {
	                json.issuer = this._issuer;
	            }
	            return json;
	        }
	    }]);

	    return BankTransferToken;
	}();

	exports.default = BankTransferToken;

/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _Util = __webpack_require__(6);

	var _Util2 = _interopRequireDefault(_Util);

	var _constants = __webpack_require__(16);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var AccessToken = function () {
	    _createClass(AccessToken, null, [{
	        key: "addressAccessToken",

	        /**
	         * Creates an Address AccessToken
	         *
	         * @param {Member} member - the member granting resource access
	         * @param {string} toAlias - the alias of the grantee
	         * @param {string} addressId - an optional address id
	         * @returns {AccessToken} - the access token created
	         */
	        value: function addressAccessToken(member, toAlias, addressId) {
	            var from = { id: member.id };
	            var to = { alias: toAlias };
	            var resource = {
	                address: {
	                    addressId: addressId
	                }
	            };

	            return new AccessToken(undefined, from, to, [resource]);
	        }

	        /**
	         * Creates an Account AccessToken
	         *
	         * @param {Member} member - the member granting resource access
	         * @param {string} toAlias - the alias of the grantee
	         * @param {string} accountId - an optional account id
	         * @returns {AccessToken} - the access token created
	         */

	    }, {
	        key: "accountAccessToken",
	        value: function accountAccessToken(member, toAlias, accountId) {
	            var from = { id: member.id };
	            var to = { alias: toAlias };
	            var resource = {
	                account: {
	                    accountId: accountId
	                }
	            };

	            return new AccessToken(undefined, from, to, [resource]);
	        }

	        /**
	         * Creates a Transaction AccessToken
	         *
	         * @param {Member} member - the member granting resource access
	         * @param {string} toAlias - the alias of the grantee
	         * @param {string} accountId - an optional account id
	         * @returns {AccessToken} - the access token created
	         */

	    }, {
	        key: "transactionAccessToken",
	        value: function transactionAccessToken(member, toAlias, accountId) {
	            var from = { id: member.id };
	            var to = { alias: toAlias };
	            var resource = {
	                transaction: {
	                    accountId: accountId
	                }
	            };

	            return new AccessToken(undefined, from, to, [resource]);
	        }
	    }, {
	        key: "createFromToken",
	        value: function createFromToken(token) {
	            var id = token.id;
	            var from = token.payload.from;
	            var to = token.payload.to;
	            var resources = token.payload.access.resources;
	            var version = token.payload.version;
	            var nonce = token.payload.nonce;
	            var payloadSignatures = token.payloadSignatures;

	            return new AccessToken(id, version, nonce, from, to, resources, payloadSignatures);
	        }
	    }]);

	    function AccessToken(id, from, to, resources) {
	        var version = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : _constants.accessTokenVersion;
	        var nonce = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : undefined;
	        var payloadSignatures = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : [];

	        _classCallCheck(this, AccessToken);

	        this._id = id;
	        this._from = from;
	        this._to = to;
	        this._resources = resources;
	        this._version = version;
	        this._nonce = nonce;
	        this._payloadSignatures = payloadSignatures;

	        if (nonce === undefined) {
	            this._nonce = _Util2.default.generateNonce();
	        }
	    }

	    _createClass(AccessToken, [{
	        key: "payloadSignatures",
	        set: function set(sigs) {
	            this._payloadSignatures = [];
	            var _iteratorNormalCompletion = true;
	            var _didIteratorError = false;
	            var _iteratorError = undefined;

	            try {
	                for (var _iterator = sigs[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
	                    var sig = _step.value;

	                    this._payloadSignatures.push(sig);
	                }
	            } catch (err) {
	                _didIteratorError = true;
	                _iteratorError = err;
	            } finally {
	                try {
	                    if (!_iteratorNormalCompletion && _iterator.return) {
	                        _iterator.return();
	                    }
	                } finally {
	                    if (_didIteratorError) {
	                        throw _iteratorError;
	                    }
	                }
	            }
	        },
	        get: function get() {
	            return this._payloadSignatures;
	        }

	        // Creates a standardized json object for the AccessToken, to be used for signing

	    }, {
	        key: "id",
	        get: function get() {
	            return this._id;
	        }
	    }, {
	        key: "version",
	        get: function get() {
	            return this._version;
	        }
	    }, {
	        key: "nonce",
	        get: function get() {
	            return this._nonce;
	        }
	    }, {
	        key: "from",
	        get: function get() {
	            return this._from;
	        }
	    }, {
	        key: "to",
	        get: function get() {
	            return this._to;
	        }
	    }, {
	        key: "resources",
	        get: function get() {
	            return this._resources;
	        }
	    }, {
	        key: "json",
	        get: function get() {
	            return {
	                version: this._version,
	                nonce: this._nonce,
	                from: this._from,
	                to: this._to,
	                access: {
	                    resources: this._resources
	                }
	            };
	        }
	    }]);

	    return AccessToken;
	}();

	exports.default = AccessToken;

/***/ },
/* 21 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var Transfer = function () {
	    function Transfer(transferObj) {
	        _classCallCheck(this, Transfer);

	        this._id = transferObj.id;
	        this._referenceId = transferObj.referenceId;
	        this._payload = JSON.parse(JSON.stringify(transferObj.payload));
	        this._payloadSignatures = JSON.parse(JSON.stringify(transferObj.payloadSignatures));
	    }

	    _createClass(Transfer, [{
	        key: "id",
	        get: function get() {
	            return this._id;
	        }
	    }, {
	        key: "referenceId",
	        get: function get() {
	            return this._referenceId;
	        }
	    }, {
	        key: "payload",
	        get: function get() {
	            return this._payload;
	        }
	    }, {
	        key: "amount",
	        get: function get() {
	            return this._payload.amount.value;
	        }
	    }, {
	        key: "currency",
	        get: function get() {
	            return this._payload.amount.currency;
	        }
	    }, {
	        key: "instructions",
	        get: function get() {
	            return this._payload.instructions;
	        }
	    }, {
	        key: "payloadSignatures",
	        get: function get() {
	            return this._payloadSignatures;
	        }
	    }]);

	    return Transfer;
	}();

	exports.default = Transfer;

/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _Crypto = __webpack_require__(1);

	var _Crypto2 = _interopRequireDefault(_Crypto);

	var _KeyLevel = __webpack_require__(13);

	var _KeyLevel2 = _interopRequireDefault(_KeyLevel);

	var _constants = __webpack_require__(16);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var axios = __webpack_require__(18);

	var HttpClient = function () {
	    function HttpClient(env) {
	        _classCallCheck(this, HttpClient);

	        this._instance = axios.create({
	            baseURL: _constants.urls[env]
	        });
	    }

	    _createClass(HttpClient, [{
	        key: "createMemberId",
	        value: function createMemberId() {
	            var config = {
	                method: 'post',
	                url: '/members'
	            };
	            return this._instance(config);
	        }
	    }, {
	        key: "notifyLinkAccounts",
	        value: function notifyLinkAccounts(alias, bankId, accountsLinkPayload) {
	            var req = {
	                alias: alias,
	                bankId: bankId,
	                accountsLinkPayload: accountsLinkPayload
	            };
	            var config = {
	                method: 'put',
	                url: "/devices/notifyLinkAccounts",
	                data: req
	            };
	            return this._instance(config);
	        }
	    }, {
	        key: "notifyAddKey",
	        value: function notifyAddKey(alias, publicKey, name) {
	            var req = {
	                alias: alias,
	                publicKey: _Crypto2.default.strKey(publicKey),
	                name: name
	            };
	            var config = {
	                method: 'put',
	                url: "/devices/notifyAddKey",
	                data: req
	            };
	            return this._instance(config);
	        }
	    }, {
	        key: "aliasExists",
	        value: function aliasExists(alias) {
	            var config = {
	                method: 'get',
	                url: "/alias-exists?alias=" + alias
	            };
	            return this._instance(config);
	        }
	    }, {
	        key: "notifyLinkAccountsAndAddKey",
	        value: function notifyLinkAccountsAndAddKey(alias, bankId, accountsLinkPayload, publicKey, name) {
	            var req = {
	                alias: alias,
	                bankId: bankId,
	                accountsLinkPayload: accountsLinkPayload,
	                publicKey: _Crypto2.default.strKey(publicKey),
	                name: name
	            };
	            var config = {
	                method: 'put',
	                url: "/devices/notifyLinkAccountsAndAddKey",
	                data: req
	            };
	            return this._instance(config);
	        }
	    }, {
	        key: "notify",
	        value: function notify(alias, notification) {
	            var req = {
	                alias: alias,
	                notification: notification
	            };
	            var config = {
	                method: 'post',
	                url: "/notify",
	                data: req
	            };
	            return this._instance(config);
	        }
	    }, {
	        key: "addFirstKey",
	        value: function addFirstKey(keys, memberId) {
	            var keyLevel = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : _KeyLevel2.default.PRIVILEGED;

	            var update = {
	                memberId: memberId,
	                addKey: {
	                    publicKey: _Crypto2.default.strKey(keys.publicKey)
	                }
	            };

	            if (keyLevel !== _KeyLevel2.default.PRIVILEGED) {
	                update.addKey.level = keyLevel;
	            }

	            var req = {
	                update: update,
	                updateSignature: {
	                    keyId: keys.keyId,
	                    signature: _Crypto2.default.signJson(update, keys),
	                    timestampMs: new Date().getTime()
	                }
	            };
	            var config = {
	                method: 'post',
	                url: "/members/" + memberId,
	                data: req
	            };
	            return this._instance(config);
	        }
	    }]);

	    return HttpClient;
	}();

	exports.default = HttpClient;

/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _AuthHeader = __webpack_require__(15);

	var _AuthHeader2 = _interopRequireDefault(_AuthHeader);

	var _constants = __webpack_require__(16);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var stringify = __webpack_require__(5);
	var axios = __webpack_require__(18);

	/**
	 * Authenticated client for making requests to the Token gateway
	 */

	var AuthHttpClientAlias = function () {
	    function AuthHttpClientAlias(env, alias, keys) {
	        _classCallCheck(this, AuthHttpClientAlias);

	        this._instance = axios.create({
	            baseURL: _constants.urls[env]
	        });

	        var authHeader = new _AuthHeader2.default(_constants.urls[env], keys);

	        this._instance.interceptors.request.use(function (config) {
	            authHeader.addAuthorizationHeaderAlias(alias, config, undefined);
	            return config;
	        });
	    }

	    _createClass(AuthHttpClientAlias, [{
	        key: "getMemberByAlias",
	        value: function getMemberByAlias() {
	            var config = {
	                method: 'get',
	                url: "/members"
	            };
	            return this._instance(config);
	        }
	    }]);

	    return AuthHttpClientAlias;
	}();

	exports.default = AuthHttpClientAlias;

/***/ },
/* 24 */
/***/ function(module, exports) {

	module.exports = require("es6-promise");

/***/ }
/******/ ])
});
;