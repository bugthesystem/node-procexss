procexss-node [![Build Status](https://travis-ci.org/ziyasal/node-procexss.svg?branch=master)](https://travis-ci.org/ziyasal/node-procexss) [![Coverage Status](https://img.shields.io/coveralls/ziyasal/node-procexss.svg)](https://coveralls.io/r/ziyasal/node-procexss?branch=master)
=============

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

- `pattern` A regex to check xss. (default:embedded)
- `whiteList` List of ignored urls. (default:[])
- `sanitizeBody` A flag to enable req.body sanitization. (default:true)
- `sanitizeQuery` A flag to enable req.body sanitization. (default:true)

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

## License

[MIT](https://github.com/ziyasal/node-procexss/blob/master/LICENSE)
