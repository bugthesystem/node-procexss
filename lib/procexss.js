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
        pattern: "(javascript[^*(%3a)]*(%3a|:))|(%3C*|<)[^*]?script|(document*(%2e|.))|(setInterval[^*(%28)]*(%28|\\())|(setTimeout[^*(%28)]*(%28|\\())|(alert[^*(%28)]*(%28|\\())|(((\\%3C) <)[^\n]+((\\%3E) >))",
        whiteList: []
    }

    defaults = extend(defaults, options || {})
    defaults.regex = new RegExp(defaults.pattern)

    return function pxss(req, res, next) {
        var url = req.url;
        if (!isInWhiteList(url, defaults)) {
            if (req._body && req._body === true) {
                processReq(req, 'body', defaults)
            }
            else {
                processReq(req, 'query', defaults)
            }
        }

        next()
    }
}

/**
 * Process request
 */
function processReq(req, part, options) {
    for (var prop in req[part]) {
        if (req[part].hasOwnProperty(prop)) {
            var v = req[part][prop]
            if (options.regex.test(v)) {
                req[part][prop] = sanitizer.sanitize(v)
            }
        }
    }

    req.dirty = true
}

/**
 * Check given url exist in whiteList
 */
function isInWhiteList(url, options) {
    if (options.whiteList && options.whiteList.length > 0) {
        return options.whiteList.some(function (u) {
            return url.indexOf(u) >= 0;
        })
    }
    return false
}