const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const saltRounds = 10;
const passport = require('passport');

// Loading User model and controller
const User = require('../models/User');
const {
    forwardAuthenticated
} = require('../controllers/userController');

// Login page
router.get('/login', forwardAuthenticated, (req, res) => res.render('login'));

// Register user page
router.get('/register', forwardAuthenticated, (req, res) => res.render('register'));

// Register user route
router.post('/register', (req, res) => {
    const {
        name,
        email,
        password,
        password2
    } = req.body;
    let errors = [];

    // If none of the required fields are entered
    if (!name || !email || !password || !password2) {
        errors.push({
            msg: 'Please fill all required fields.'
        });
    }

    // If both password fields doesn't match
    if (password != password2) {
        errors.push({
            msg: '<span><i>Create Password</i> and <i>Confirm Password</i> do not match.&nbsp;</span><br/><span>Please ensure that you have entered the same value.</span>'
        });
    }

    // If password length is less than 8 characters
    if (password.length < 8) {
        errors.push({
            msg: 'Password must be at least 8 characters long.'
        });
    }

    // If locals.errors exist show the error message in resigter template
    // else check if email is already registered
    // else create new user account and save hashed password in database
    if (errors.length > 0) {
        res.render('register', {
            errors,
            name,
            email,
            password,
            password2
        });
    } else {
        User.findOne({
                email: email
            })
            .then(user => {
                if (user) {
                    errors.push({
                        msg: '<span>Your email is already registered. Please <a href="/login">log in</a> to continue...</span>'
                    });
                    res.render('register', {
                        errors,
                        name,
                        email,
                        password,
                        password2
                    });
                } else {
                    const newUser = new User({
                        name,
                        email,
                        password
                    });

                    bcrypt.genSalt(saltRounds, (err, salt) => {
                        bcrypt.hash(newUser.password, salt, (err, hash) => {
                            if (err) throw err;
                            newUser.password = hash;
                            newUser.save()
                                .then(user => {
                                    login_message = 'Congrats '+ user.name +'! You have registered successfully. Please log in to continue...';
                                    req.flash('success', login_message);
                                    res.redirect('/login');
                                })
                                .catch(err => {
                                    req.flash('error', 'An error occured while saving your password. Please try again...');
                                    console.log("bcrypt error: " + err);
                                });
                        });
                    });
                }
            });
    }
});

// Login route
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/',
        successFlash: 'Welcome to SugarFixed!',
        failureRedirect: '/login',
        failureFlash: true
    })(req, res, next);
});

// Logout route
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success', 'You have logged out successfully');
    res.redirect('/');
});

module.exports = router;