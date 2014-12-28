/*!
 * node-procexss
 * Copyright(c) 2014 Ziya SARIKAYA @ziyasal
 * MIT Licensed
 */

/**
 * Module dependencies.
 */
var sanitizer = require('sanitizer')
    , extend = require('util')._extend
    ;


module.exports = function procexss(options) {
    var defaults = {
        regex: new RegExp("(javascript[^*(%3a)]*(%3a|:))|(%3C*|<)[^*]?script|(document*(%2e|.))|(setInterval[^*(%28)]*(%28|\\())|(setTimeout[^*(%28)]*(%28|\\())|(alert[^*(%28)]*(%28|\\())|(((\\%3C) <)[^\n]+((\\%3E) >))")
    };

    defaults = extend(defaults, options || {});

    return function pxss(req, res, next) {

        if (req._body) {
            processReq(req, 'body', defaults);
        }
        else {
            processReq(req, 'query', defaults);
        }

        next()
    }
};

function processReq(req, part, options) {
    for (var prop in req[part]) {
        if (req[part].hasOwnProperty(prop)) {
            var v = req[part][prop];
            if (options.regex.test(v)) {
                req[part][prop] = sanitizer.sanitize(v)
            }
        }

    }

    req.__hasXss = true;
}