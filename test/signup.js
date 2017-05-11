var path = require('path');
var assert = require('assert');
var request = require('supertest');
var app = require('../index');
var User = require('../lib/mongo').User;

var testName1 = 'testName1';
var testName2 = 'nswbmw';
describe('signup', function() {
  describe('POST /signup', function() {
    var agent = request.agent(app);
    beforeEach(function (done) {

      User.create({
        name: testName1,
        password: '123456',
        avatar: '',
        gender: 'x',
        bio: ''
      })
      .exec()
      .then(function () {
        done();
      })
      .catch(done);
    });

    afterEach(function (done) {

      User.remove({ name: { $in: [testName1, testName2] } })
        .exec()
        .then(function () {
          done();
        })
        .catch(done);
    });


    it('wrong name', function(done) {
      agent
        .post('/signup')
        .type('form')
        .attach('avatar', path.join(__dirname, 'avatar.png'))
        .field({ name: '' })
        .redirects()
        .end(function(err, res) {
          if (err) return done(err);
          assert(res.text.match(/Please limit the name to 1-10 characters/));
          done();
        });
    });


    it('wrong gender', function(done) {
      agent
        .post('/signup')
        .type('form')
        .attach('avatar', path.join(__dirname, 'avatar.png'))
        .field({ name: testName2, gender: 'a' })
        .redirects()
        .end(function(err, res) {
          if (err) return done(err);
          assert(res.text.match(/M or F/));
          done();
        });
    });


    it('duplicate name', function(done) {
      agent
        .post('/signup')
        .type('form')
        .attach('avatar', path.join(__dirname, 'avatar.png'))
        .field({ name: testName1, gender: 'm', bio: 'noder', password: '123456', repassword: '123456' })
        .redirects()
        .end(function(err, res) {
          if (err) return done(err);
          assert(res.text.match(/The user name is already occupied/));
          done();
        });
    });


    it('success', function(done) {
      agent
        .post('/signup')
        .type('form')
        .attach('avatar', path.join(__dirname, 'avatar.png'))
        .field({ name: testName2, gender: 'm', bio: 'noder', password: '123456', repassword: '123456' })
        .redirects()
        .end(function(err, res) {
          if (err) return done(err);
          assert(res.text.match(/registration success/));
          done();
        });
    });
  });
});
