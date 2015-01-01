node-procexss [![Build Status](https://travis-ci.org/ziyasal/node-procexss.svg?branch=master)](https://travis-ci.org/ziyasal/node-procexss) [![Coverage Status](https://img.shields.io/coveralls/ziyasal/node-procexss.svg)](https://coveralls.io/r/ziyasal/node-procexss?branch=master)
=============
[![NPM](https://nodei.co/npm/node-procexss.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/node-procexss/)

Middleware to help to prevent [XSS](https://www.owasp.org/index.php/Cross-site_Scripting_%28XSS%29) attacks in your Express/Connect apps

### Install

```sh
$ npm install node-procexss
```

## API

```js
var procexss = require('node-procexss')
```
### procexss(options)

This middleware sanitize req.body or req.query and adds a `req.dirty` flasg to identify.

#### Options

- `pattern`  String - Optional. A regex to check xss. Defaults to `embedded!!`
- `whiteList`  Array[String] - Optional. List of ignored urls. Defaults to `[]`
- `sanitizeBody`  Boolean - Optional. If the req.body sanitize is enabled or not. Defaults to `true`
- `sanitizeQuery`  Boolean - Optional. If the req.query sanitize is enabled or not. Defaults to `true`
- `mode` String -Optional. A flag to choose mode (sanitize | header) 
 * `sanitize`: Works on request body or query and sanitize it if xss exist.
 * `header`: Adds `X-XSS-Protection` header to response.
- `header` Options for `header` mode (enabled, mode)
 * `enabled` Boolean - Optional. If the header is enabled or not (see header docs). Defaults to `1`.
 * `mode`  String - Optional. Mode to set on the header (see header docs). Defaults to block. Defaults to `sanitize`

## Example

### Simple express example

The following is an example of some server-side code that shows basic setup.

```js
var express = require('express')
var procexss    = require('node-procexss')

var app = express()

 app.use(function(req, res, next) {
        req.query = url.parse(req.url, true).query
        next()
})

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
       extended: false
}))

// parse application/json
app.use(bodyParser.json())

app.use(procexss(opts))

```

```js
//Whitelist
app.use(procexss({
            whiteList: ['/dashboard'] 
            }))
```

```js
//Mode `header` default settings
app.use(procexss({
                mode: 'header'
            }))
```

```js
//Mode `header` with custom mode
app.use(procexss({
                mode: 'header',
                header: {
                    enabled: 1,
                    mode: 'foo'
                }
            }))
```

## License

[MIT](https://github.com/ziyasal/node-procexss/blob/master/LICENSE)
