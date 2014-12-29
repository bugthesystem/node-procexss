process.env.NODE_ENV = 'test';

var
    assert = require('assert'),
    connect = require('connect'),
    bodyParser = require('body-parser'),
    http = require('http')

, request = require('supertest'), url = require('url'), should = require('should'), sanitizer = require('sanitizer'), procexss = require('..');

describe('procexss', function() {
    var formJson, sanitizedFormJson, queryJson, sanitizedQueryJson

    before(function() {
        formJson = {
            name: 'john',
            vuln: '<script>alert(1);</script>'
        }

        queryJson = {
            query: 'Manny',
            range: '1..5',
            order: 'desc',
            vuln: '<script>alert(1);</script>'
        }

        sanitizedFormJson = formJson
        sanitizedFormJson.vuln = sanitizer.sanitize(formJson.vuln)

        sanitizedQueryJson = queryJson
        sanitizedQueryJson.vuln = sanitizer.sanitize(queryJson.vuln)
    })


    it('should sanitize req.body', function(done) {
        var server = createServer()

        request(server)
            .post('/')
            .type('form')
            .send(formJson)

        .end(function(err, res) {
            should.not.exist(err)
            should.exist(res)
            res.text.should.equal(JSON.stringify(sanitizedFormJson))

            done()
        })
    })

    it('should sanitize req.query', function(done) {
        var server = createServer()

        request(server)
            .get('/')
            .query(queryJson)
            .end(function(err, res) {
                should.not.exist(err)
                should.exist(res)
                res.text.should.equal(JSON.stringify(sanitizedQueryJson))

                done()
            })
    })

    it('should not sanitize if req.url is exist in whiteList', function(done) {
        var server = createServer({
            whiteList: ['/']
        })

        request(server)
            .get('/')
            .query(queryJson)
            .end(function(err, res) {
                should.not.exist(err)
                should.exist(res)
                res.text.should.equal(JSON.stringify(queryJson))

                done()
            })
    })

    it('should not sanitize req.body if options.sanitizeBody equals false', function(done) {
        var server = createServer({
            sanitizeQuery: false
        })

        request(server)
            .post('/')
            .type('form')
            .send(formJson)
            .end(function(err, res) {
                should.not.exist(err)
                should.exist(res)
                res.text.should.equal(JSON.stringify(formJson))

                done()
            })
    })


    it('should not sanitize req.query if options.sanitizeQuery equals false', function(done) {
        var server = createServer({
            sanitizeQuery: false
        })

        request(server)
            .get('/')
            .query(queryJson)
            .end(function(err, res) {
                should.not.exist(err)
                should.exist(res)
                res.text.should.equal(JSON.stringify(queryJson))

                done()
            })
    })
});

function createServer(opts) {
    var app = connect()

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

    app.use(function(req, res) {
        if (req._body) {
            res.end(JSON.stringify(req.body));
        }
        else {
            res.end(JSON.stringify(req.query));
        }

    })

    return http.createServer(app)
}