var fs = require('fs');
var path = require('path');
var sha1 = require('sha1');
var express = require('express');
var router = express.Router();

var UserModel = require('../models/users');
var checkNotLogin = require('../middlewares/check').checkNotLogin;


router.get('/', checkNotLogin, function(req, res, next) {
  res.render('signup2');
});


router.post('/', checkNotLogin, function(req, res, next) {
  var name = req.fields.name;
  var gender = req.fields.gender;
  var bio = req.fields.bio;
  var avatar = req.files.avatar.path.split(path.sep).pop();
  var password = req.fields.password;
  var repassword = req.fields.repassword;


  try {
    if (!(name.length >= 1 && name.length <= 10)) {
      throw new Error('Name should be between 1 and 10');
    }
    if (['m', 'f', 'x'].indexOf(gender) === -1) {
      throw new Error('Sex can only be m, f');
    }
    if (!(bio.length >= 1 && bio.length <= 30)) {
      throw new Error('Personal profile should be limited to 1-30 characters');
    }
    if (!req.files.avatar.name) {
      throw new Error('Missing avatar');
    }
    if (password.length < 6) {
      throw new Error('Password is less than 6 caracters');
    }
    if (password !== repassword) {
      throw new Error('Passwords does not match');
    }
  } catch (e) {

    fs.unlink(req.files.avatar.path);
    req.flash('error', e.message);
    return res.redirect('/signup');
  }


  password = sha1(password);


  var user = {
    name: name,
    password: password,
    gender: gender,
    bio: bio,
    avatar: avatar
  };

  UserModel.create(user)
    .then(function (result) {

      user = result.ops[0];

      delete user.password;
      req.session.user = user;

      req.flash('success', 'Success');

      res.redirect('/posts');
    })
    .catch(function (e) {

      fs.unlink(req.files.avatar.path);

      if (e.message.match('E11000 duplicate key')) {
        req.flash('error', 'The user name is already occupied');
        return res.redirect('/signup');
      }
      next(e);
    });
});

module.exports = router;
