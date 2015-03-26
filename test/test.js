process.env.NODE_ENV = 'test';

var connect = require('connect');
var bodyParser = require('body-parser');
var http = require('http');
var request = require('supertest');
var url = require('url');
var should = require('should');
var sanitizer = require('sanitizer');
var procexss = require('..');

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


    describe('mode sanitize', function() {
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

        it('should not sanitize req.body if !options.sanitizeBody', function(done) {
            var server = createServer({
                sanitizeBody: false
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


        it('should not sanitize req.query if !options.sanitizeQuery', function(done) {
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
    })

    describe('mode header', function() {
        it('header (enabled, mode block)', function(done) {
            var server = createServer({
                mode: 'header'
            })

            request(server)
                .get('/')
                .expect('X-XSS-Protection', '1; mode=block')
                .expect(200, done);
        })

        it('header (!enabled, mode block)', function(done) {
            var server = createServer({
                mode: 'header',
                header: {
                    enabled: 0
                }
            })

            request(server)
                .get('/')
                .expect('X-XSS-Protection', '0; mode=block')
                .expect(200, done);
        })

        it('header (enabled is boolean, mode block)', function(done) {
            var server = createServer({
                mode: 'header',
                header: {
                    enabled: true
                }
            })

            request(server)
                .get('/')
                .expect('X-XSS-Protection', '1; mode=block')
                .expect(200, done);
        })

        it('header (enabled; custom mode)', function(done) {
            var server = createServer({
                mode: 'header',
                header: {
                    enabled: 1,
                    mode: 'foo'
                }
            })

            request(server)
                .get('/')
                .expect('X-XSS-Protection', '1; mode=foo')
                .expect(200, done);
        })
    })

})

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
