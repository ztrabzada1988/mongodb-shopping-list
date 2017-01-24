global.DATABASE_URL = 'mongodb://localhost/shopping-list-test';

var chai = require('chai');
var chaiHttp = require('chai-http');

var server = require('../server.js');
var Item = require('../models/item');

var should = chai.should();
var app = server.app;

chai.use(chaiHttp);

describe('Shopping List', function () {

    // run this before each test
    before(function (done) {
        server.runServer(function () {
            var test = Item.create({
                name: 'Broad beans'
            }, {
                name: 'Tomatoes'
            }, {
                name: 'Peppers'
            }, function () {
                done();
                testID = test.emitted.fulfill[0]._id;
            });
        });
    });
    //list all shopping list items
    it('should list items on GET', function (done) {
        chai.request(app)
            .get('/items')
            .end(function (err, res) {
                should.equal(err, null);
                res.should.have.status(200);
                res.should.be.json;
                res.body.should.be.a('array');
                res.body.should.have.length(3);
                res.body[0].should.be.a('object');
                res.body[0].should.have.property('_id');
                res.body[0].should.have.property('name');
                res.body[0]._id.should.be.a('string');
                res.body[0].name.should.be.a('string');
                res.body[0].name.should.equal('Broad beans');
                res.body[1].name.should.equal('Tomatoes');
                res.body[2].name.should.equal('Peppers');
                done();
            });
    });

    //add an item to shopping list
    it('should add an item on POST', function (done) {
        chai.request(app)
            .post('/items/')
            .send({
                name: 'Kale'
            })
            .end(function (err, res) {
                should.equal(err, null);
                res.should.have.status(201);
                res.should.be.json;
                res.body.should.be.a('object');
                res.body.should.have.property('_id');
                res.body.should.have.property('name');
                res.body.should.have.property('__v');
                res.body._id.should.be.a('string');
                res.body.name.should.be.a('string');
                res.body.name.should.equal('Kale');
                done();
            });
    });

    it('should not POST without body data', function (done) {
        chai.request(app)
            .post('/items/')
            .send({})
            .end(function (err, res) {
                should.equal(err, err);
                done();
            });
    });

    it('should not POST with something other than valid JSON', function (done) {
        chai.request(app)
            .post('/items/')
            .send("Hello World! I'm an error.")
            .end(function (err, res) {
                should.equal(err, err);
                done();
            });
    });

    //edit single shopping list item
    it('should edit an item on PUT', function (done) {
        chai.request(app)
            .put('/items/' + testID)
            .send({
                name: 'Banana'
            })
            .end(function (err, res) {
                res.should.have.status(200);
                res.should.be.json;
                res.body.should.be.a('object');
                res.body.should.have.property('name');
                res.body.should.have.property('_id');
                res.body.name.should.be.a('string');
                res.body._id.should.be.a('string');
                res.body.name.should.equal('Broad beans');
                res.body._id.should.equal(testID.toString());
                done();
            });
    });

    it('should not PUT without an ID in the endpoint', function (done) {
        chai.request(app)
            .put('/items/')
            .send({
                name: 'Banana'
            })
            .end(function (err, res) {
                should.equal(err, err); //expecting "/items/:_id" to be under .put('/items/')
                res.should.have.status(404);
                done();
            });
    });

    it('should not PUT with different ID in the endpoint than the body', function (done) {
        chai.request(app)
            .put('/items/1')
            .send({
                name: 'Cake',
                _id: 500
            })
            .end(function (err, res) {
                should.equal(err, err); // should not have sent "_id"
                res.should.have.status(400);
                done();
            });
    });
    it('should not PUT to an ID that doesn\'t exist', function (done) {
        chai.request(app)
            .put('/items/5')
            .send({
                name: 'Cake'
            })
            .end(function (err, res) {
                should.equal(err, err);
                res.should.have.status(400);
                done();
            });
    });
    it('should not PUT without body data', function (done) {
        chai.request(app)
            .put('/items/1')
            .send()
            .end(function (err, res) {
                should.equal(err, err);
                res.should.have.status(400);
                done();
            });
    });

    it('should not PUT with something other than valid JSON', function (done) {
        chai.request(app)
            .put('/items/1')
            .send("HELLO WORLD! IM AN ERROR")
            .end(function (err, res) {
                should.equal(err, err);
                res.should.have.status(400);
                done();
            });
    });

    it('should delete an item on DELETE', function (done) {
        chai.request(app)
            .delete('/items/' + testID)
            .end(function (err, res) {
                should.equal(err, null);
                res.should.be.json;
                res.should.have.status(200);
                res.body.should.have.property('name');
                res.body.should.have.property('_id');
                res.body._id.should.be.a('string');
                res.body.name.should.be.a('string');
                done();
            });
    });
    it("should not DELETE an item that doesn't exist", function (done) {
        chai.request(app)
            .delete('/items/100000')
            .end(function (err, res) {
                should.equal(err, err);
                res.should.have.status(400);
                done();
            });
    });

    it('should not DELETE without an ID in the endpoint', function (done) {
        chai.request(app)
            .delete('/items/')
            .end(function (err, res) {
                should.equal(err, err);
                res.should.have.status(404);
                done();
            });
    });

    // run after tests
    after(function (done) {
        Item.remove(function () {
            done();
        });
    });
});
