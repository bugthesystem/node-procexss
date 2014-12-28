process.env.NODE_ENV = 'test';

var assert = require('assert')
    , connect = require('connect')
    , bodyParser = require('body-parser')
    , http = require('http')

    , request = require('supertest')
    , url = require('url')
    , should = require('should')

    , procexss = require('..');

describe('procexss', function () {
    it('should work in req.body', function (done) {
        var server = createServer()

        request(server)
            .post('/')
            .type('form')
            .send({name: 'john'})
            .send({vuln: '<script>alert(1);</script>'})
            .end(function (err, res) {
                should.not.exist(err)
                should.exist(res)
                res.text.should.equal(JSON.stringify({name: 'john', vuln: ''}))

                done();
            });
    });

    it('should work in req.query', function (done) {
        var server = createServer()

        request(server)
            .get('/')
            .query({query: 'Manny', range: '1..5', order: 'desc', vuln: '<script>alert(1);</script>'})
            .end(function (err, res) {
                should.not.exist(err)
                should.exist(res)
                res.text.should.equal(JSON.stringify({query: 'Manny', range: '1..5', order: 'desc', vuln: ''}))

                done();
            });
    });
});

function createServer(opts) {
    var app = connect()

    app.use(function (req, res, next) {
        req.query = url.parse(req.url, true).query
        next()
    })

    // parse application/x-www-form-urlencoded
    app.use(bodyParser.urlencoded({extended: false}))

    // parse application/json
    app.use(bodyParser.json())

    app.use(procexss(opts))

    app.use(function (req, res) {
        if (req._body) {
            res.end(JSON.stringify(req.body));
        }
        else {
            res.end(JSON.stringify(req.query));
        }

    })

    return http.createServer(app)
}