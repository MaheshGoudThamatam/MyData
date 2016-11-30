'use strict';
/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    async = require('async'),
    config = require('meanio').loadConfig(),
    crypto = require('crypto'),
    nodemailer = require('nodemailer'),
    templates = require('../template'),
    _ = require('lodash'),
    randtoken = require('rand-token'),
    Mailgen = require('mailgen'),
    mail = require('../../../../core/system/server/services/mailService.js'),
    jwt = require('jsonwebtoken'); //https://npmjs.org/package/node-jsonwebtoken
var uuid = require('uuid'); // https://github.com/defunctzombie/node-uuid
var multiparty = require('multiparty'); // https://github.com/andrewrk/node-multiparty
var s3 = require('s3'); // https://github.com/andrewrk/node-s3-client
var s3Client = s3.createClient({
    key: '<your_key>',
    secret: '<your_secret>',
    bucket: '<your_bucket>'
});
var logger = require('../../../../core/system/server/controllers/logs.js');
var passport = require('../../passport.js');
var sms = require('../../../../core/system/server/controllers/sms.js');
    /**
     * Send reset password email
     */
function sendMail(mailOptions) {
    var transport = nodemailer.createTransport(config.mailer);
    transport.sendMail(mailOptions, function(err, response) {
        if (err) return err;
        return response;
    });
}
module.exports = function(MeanUser) {
    return {
        /**
         * Auth callback
         */
        authCallback: function(req, res) {
        	console.log("++++++++++++++++++++++++++");
        	console.log("in auth callbakkk");
        	console.log("request++++++++++++++++");
        	console.log(req);
        	console.log("request++++++++++++++++");
        	
            var payload = req.user;
            var escaped = JSON.stringify(payload);
            escaped = encodeURI(escaped);
            // We are sending the payload inside the token
            var token = jwt.sign(escaped, config.secret, {
                expiresInMinutes: 60 * 5
            });
            res.cookie('token', token);
            console.log("token+++++++++++");
            console.log(token);
            console.log("token+++++++++++");
            var destination = config.strategies.landingPage;
            console.log("destination++++++++++++++++");
            console.log(destination);
            console.log("destination++++++++++++++++");
            if (!req.cookies.redirect) res.cookie('redirect', destination);
            res.redirect(destination);
        },
        /**
         * Show login form
         */
        signin: function(req, res) {
        	console.log("in ++++++++++signin+++++++++++++");
        	console.log(req.isAuthenticated());
            if (req.isAuthenticated()) {
            	console.log("inside iffff");
            	console.log(req.isAuthenticated());
                return res.redirect('/');
            }
            console.log("ouside iffffffffff");
            res.redirect('/login');
        },
        /**
         * Logout
         */
        signout: function(req, res) {
            MeanUser.events.publish({
                action: 'logged_out',
                user: {
                    name: req.user.name
                }
            });
            req.logout();
            res.redirect('/');
        },
        /**
         * Session
         */
        session: function(req, res) {
            res.redirect('/');
        },
        /**
         * Create user
         */
        create: function(req, res, next) {
            var user = new User(req.body);
            user.provider = 'local';
            // because we set our user.provider to local our models/user.js validation will always be true
            req.assert('first_name', 'You must enter a name').notEmpty();
            req.assert('email', 'You must enter a valid email address').isEmail();
            req.assert('password', 'Password must be between 8-20 characters long').len(8, 20);
            req.assert('phone', 'Phone number must be 10 characters').len(10, 10);
            //req.assert('username', 'Username cannot be more than 20 characters').len(1, 20);
            req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password);
            var errors = req.validationErrors();
            if (errors) {
                return res.status(400).send(errors);
            }
            // for confirmation email varification
            // Hard coded for now. Will address this with the user permissions system in v0.3.5
            user.roles = ['authenticated'];
            //  user.isUserConfirmed = true;
            user.profileUpdated = true;
            user.isPasswordUpdate = true;
            var token = randtoken.generate(40);
            user.confirmationToken = token;
            user.confirmationExpires = Date.now() + 24 * 3600000; // 24 hour;
            user.save(function(err) {
                if (err) {
                    switch (err.code) {
                        case 11000:
                            res.status(400).json([{
                                msg: 'Email already taken',
                                param: 'email'
                            }]);
                            break;
                        case 11001:
                            res.status(400).json([{
                                msg: 'Username already taken',
                                param: 'username'
                            }]);
                            break;
                        default:
                            var modelErrors = [];
                            if (err.errors) {
                                for (var x in err.errors) {
                                    modelErrors.push({
                                        param: x,
                                        msg: err.errors[x].message,
                                        value: err.errors[x].value
                                    });
                                }
                                res.status(400).json(modelErrors);
                            }
                    }
                    return res.status(400);
                }
                /* var mailOptions = {
                     to: user.email,
                     from: config.emailFrom
                 };
                 mailOptions = templates.confirmation_email(user, req, user.confirmationToken, mailOptions);
                 sendMail(mailOptions);
                 res.json({
                     "code": "1001",
                     "msg": "Your registration is successfull and confirmation email has been sent to your registered email. Please confirm to login"
                 });*/
                console.log("**********");
                var email = templates.confirmation_email(req, user, token);
                mail.mailService(email, user.email);
                sms.send(user.phone, 'Welcome to mymatchbox! Your account has been successfully created. An email has been forwarded to your registered email id.', function(status) {
                    logger.log('info', 'POST ' + req._parsedUrl.pathname + ' User registration SMS sent [' + user.phone + ']: ' + status);
                });
                res.json({
                    "code": "1001",
                    "msg": "Your registration is successfull and confirmation email has been sent to your registered email. Please confirm to login"
                });
            });
        },
        /**
         * for uploading an image to s3 server and returning the path.
         */
        upload_image: function(req, res, next) {
            var form = new multiparty.Form();
            form.parse(req, function(err, fields, files) {
                var file = files.file[0];
                var contentType = file.headers['content-type'];
                var extension = file.path.substring(file.path.lastIndexOf('.'));
                var destPath = '/profile' + '/' + uuid.v4() + extension;
                var headers = {
                    'x-amz-acl': 'public-read',
                    'Content-Length': file.size,
                    'Content-Type': contentType
                };
                var uploader = s3Client.upload(file.path, destPath, headers);
                uploader.on('error', function(err) {
                    //TODO handle this
                });
                uploader.on('end', function(url) {
                    //TODO do something with the url
                });
            });
        },
        confirmUser: function(req, res, next) {
            if (next) {}
            User.loadUserByToken(req.params.token, function(err, user) {
                if (err) {
                    res.redirect('/login?confirmation=1');
                }
                if (!user) {
                    res.redirect('/login?confirmation=3');
                } else {
                    if (Date.now() > user.confirmationExpires) {
                        res.redirect('/login?confirmation=2');
                    } else {
                        user.confirmationToken = undefined;
                        user.confirmationExpires = undefined;
                        user.isUserConfirmed = true;
                        user.confirmedAt = Date.now();
                        user.save(function(err) {
                            if (err) {
                                res.redirect('/login?confirmation=1');
                            } else {
                                res.redirect('/user/confirmation?confirmation=0');
                            }
                        });
                    }
                }
            });
        },
        /*        */
        /**
         * For confirming a user email
         */
        /*
                confirmEmail: function(req, res, next) {
                    User.findOne({
                        resetPasswordToken: req.params.token
                    }, function(err, user) {
                        if (err) {
                            res.json({'code': '0001', 'msg': err});
                        }
                        if (!user) {
                            res.json({
                                'code': '0004',
                                'msg': 'Confirmation token is invalid'
                            });
                        } else {
                            user.resetPasswordToken = undefined;
                            user.isUserConfirmed = true;
                            user.active = 1;
                            user.save(function(err) {
                                if (err) {
                                    res.json({'code': '0001', 'msg': err});
                                } else {
                                    res.json({'code': '1002', 'msg': "Your email has been successfully confirmed."});
                                }    
                                if (err) {
                                    res.redirect('/user/login?confirmation=1');
                                } else {
                                    res.redirect('/user/login?confirmation=0');
                                }
                            });
                        }
                    });
                },*/
        /**
         * Send User
         */
        me: function(req, res) {
            if (!req.user || !req.user.hasOwnProperty('_id')) return res.send(null);
            User.findOne({
                _id: req.user._id
            }).populate('role').exec(function(err, user) {
                if (err || !user) return res.send(null);
                var dbUser = user.toJSON();
                var id = req.user._id;
                delete dbUser._id;
                delete req.user._id;
                var eq = _.isEqual(dbUser, req.user);
                if (eq) {
                    req.user._id = id;
                    return res.json(req.user);
                }
                var payload = user;
                var escaped = JSON.stringify(payload);
                escaped = encodeURI(escaped);
                var token = jwt.sign(escaped, config.secret, {
                    expiresInMinutes: 60 * 5
                });
                res.json({
                    token: token
                });
            });
        },
        /**
         * Find user by id
         */
        user: function(req, res, next, id) {
            User.findOne({
                _id: id
            }).populate("role").exec(function(err, user) {
                if (err) return next(err);
                if (!user) return next(new Error('Failed to load User ' + id));
                req.profile = user;
                next();
            });
        },

        /**
         * Fetch user by id
         */
        fetchUser: function(req, res) {
            res.json(req.profile);
        },

        /**
         * Resets the password
         */
        /*resetpassword: function(req, res, next) {
            if (next) {}
            User.findOne({
                resetPasswordToken: req.params.token
            }, function(err, user) {
                if (err) {
                    return res.status(400).json({
                    	error: 'ERROR',
                        msg: err
                    });
                }
                if (!user) {
                    return res.status(400).json({
                        error: 'ERROR',
                        param: 'Token',
                        msg: 'Token invalid or expired'
                    });
                }
                req.assert('password', 'Password length should be between 8-20 charecters.').len(8, 20);
                req.assert('confirmPassword', 'Passwords does not match').equals(req.body.password);
                var errors = req.validationErrors();
                if (errors) {
                    return res.status(400).send(errors);
                }
                user.password = req.body.password;
                console.log(user.password);
                user.resetPasswordToken = undefined;
                user.resetPasswordExpires = undefined;
                user.save(function(err) {
                    MeanUser.events.publish('resetpassword', {
                        description: user.name + ' reset his password.'
                    });
                    res.status(200).json({
                        error: 'success',
                        param: 'password',
                        msg: 'Password Changed successfully.'
                    });
                });
            });
        },*/

        resetpassword: function(req, res, next) {
            User.findOne({
                resetPasswordToken: req.params.token,
                resetPasswordExpires: {
                    $gt: Date.now()
                }
            }, function(err, user) {
                if (err) {
                    return res.status(400).json({
                        msg: err
                    });
                }
                if (!user) {
                    return res.status(400).json({
                        error: 'error',
                        param: 'Token',
                        msg: 'Token invalid or expired'
                    });
                }
                req.assert('password', 'Password must be between 8-20 characters long').len(8, 20);
                req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password);
                var errors = req.validationErrors();
                if (errors) {
                    return res.status(400).send(errors);
                }
                user.password = req.body.password;
                user.resetPasswordToken = undefined;
                user.resetPasswordExpires = undefined;
                user.save(function(err) {

                    MeanUser.events.publish({
                        action: 'reset_password',
                        user: {
                            name: user.name
                        }
                    });

                    req.logIn(user, function(err) {
                        if (err) return next(err);
                        /*                        return res.send({
                                                   // user: user
                                                });*/
                        return res.status(200).json({
                            error: 'success',
                            param: 'password',
                            msg: 'Password Changed successfully.'
                        });
                    });
                });
            });
        },
        /**
         * Callback for change password link
         */
        changePassword: function(req, res, next) {
            var user = req.user
            if (user.hashPassword(req.body.currentPassword) !== user.hashed_password) {
                return res.status(400).json({
                    code: '0020',
                    param: 'currentpassword',
                    msg: 'Your password does not match'
                });
            }
            req.assert('password', 'Password must be between 8-20 characters long').len(8, 20);
            req.assert('confirmPassword', 'Passwords does not match').equals(req.body.password);
            var errors = req.validationErrors();
            if (errors) {
                return res.status(400).json(errors);
            }
            if (user.isPasswordUpdate) {
                user.isPasswordUpdate = false;
            }
            user.password = req.body.password;
            user.save(function(err) {
                return res.json({
                    code: '1007',
                    param: 'passwordSuccess',
                    msg: 'Your password changed successfully.'
                });
            });
        },
        /**
         * Callback for forgot password link
         */
        forgotpassword: function(req, res, next) {
            async.waterfall([
                function(done) {
                    crypto.randomBytes(20, function(err, buf) {
                        var token = buf.toString('hex');
                        done(err, token);
                    });
                },
                function(token, done) {
                    User.findOne({
                        $or: [{
                            email: req.body.text
                        }, {
                            username: req.body.text
                        }]
                    }, function(err, user) {
                        if (err || !user) return done(true);
                        done(err, user, token);
                    });
                },
                function(user, token, done) {
                    user.resetPasswordToken = token;
                    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
                    user.save(function(err) {
                        done(err, token, user);
                    });
                },
                function(token, user, done) {
                    /* var mailOptions = {
                         to: user.email,
                         from: config.emailFrom
                     };
                     mailOptions = templates.forgot_password_email(user, req, token, mailOptions);
                     sendMail(mailOptions);*/

                    var email = templates.forgot_password_email(req, user, token)
                    mail.mailService(email, user.email)
                    done(null, user);
                }
            ], function(err, user) {
                var response = {
                    message: 'Mail successfully sent to the given address. Please reset your password by clicking on it.',
                    status: 'success'
                };
                if (err) {
                    response.message = 'Username does not exists. Please try again';
                    response.status = 'danger';
                }
                MeanUser.events.publish({
                    action: 'forgot_password',
                    user: {
                        name: req.body.text
                    }
                });
                res.json(response);
            });
        },
        /**
         * update a user 
         */
        update: function(req, res, next) {
            var user = req.profile;
            user = _.extend(user, req.body);
            user.save(function(err) {
                res.jsonp(user);
            });
        },
        /* SOCIAL LOGIN */
        createSocial: function(req, res) {
            var users = new User(req.body);
            User.findOne({
                'email': users.email
            }, function(err, user) {
                if (user) {
                    var isFound = user.socialAccounts.filter(function(sAcc) {
                        return (sAcc.provider == users.provider);
                    });
                    if (isFound.length > 0) {
                        var payload = user;
                        var escaped = JSON.stringify(payload);
                        escaped = encodeURI(escaped);
                        // We are sending the payload inside the token
                        var token = jwt.sign(escaped, config.secret, {
                            expiresInMinutes: 60 * 5
                        });
                        MeanUser.events.publish({
                            action: 'logged_in',
                            user: {
                                name: user.name
                            }
                        });
                        res.json({
                            token: token,
                            redirect: req.body.redirect || config.strategies.landingPage
                        });
                    } else {
                        var social_obj = users;
                        user.username = users.username;
                         var name = users.username.split(' ');
                         var full_name = name.split(',');
                        user.first_name = full_name[0];
                        user.last_name = full_name[1];
                        user.phone = users.phone;
                        // user.socialAccounts.push(social_obj);
                        if (user.socialAccounts.push(social_obj)) {
                            user.save(function(err, user) {
                                if (err) {
                                    res.send(400);
                                    logger.log('error', 'PUT ' + req._parsedUrl.pathname + ' Failed to save Social login ' + err + '');
                                }
                                logger.log('info', 'PUT ' + req._parsedUrl.pathname + ' User saved successfully from Social login');
                                var payload = user;
                                var escaped = JSON.stringify(payload);
                                escaped = encodeURI(escaped);
                                // We are sending the payload inside the token
                                var token = jwt.sign(escaped, config.secret, {
                                    expiresInMinutes: 60 * 5
                                });
                                MeanUser.events.publish({
                                    action: 'logged_in',
                                    user: {
                                        name: user.name
                                    }
                                });
                                res.json({
                                    token: token,
                                    redirect: req.body.redirect || config.strategies.landingPage
                                });
                            })
                        }
                    }
                } else {
                    user = new User({
                        first_name: users.first_name,
                        email: users.email || " ",
                        username: users.username || " ",
                        socialAccounts: users,
                        password: "matchbox@123",
                        isUserConfirmed: "True",
                        roles: ['authenticated']
                    });
                    // user.socialAccounts.push(user);
                    user.save(function(err) {
                        if (err) {
                            res.send(400);
                            logger.log('error', 'PUT ' + req._parsedUrl.pathname + ' Failed to save Social login ' + err + '');
                        } else {
                            logger.log('info', 'PUT ' + req._parsedUrl.pathname + ' User saved successfully from Social login');
                            var payload = user;
                            var escaped = JSON.stringify(payload);
                            escaped = encodeURI(escaped);
                            // We are sending the payload inside the token
                            var token = jwt.sign(escaped, config.secret, {
                                expiresInMinutes: 60 * 5
                            });
                            MeanUser.events.publish({
                                action: 'logged_in',
                                user: {
                                    name: user.name
                                }
                            });
                            res.json({
                                token: token,
                                redirect: req.body.redirect || config.strategies.landingPage
                            });
                        }
                    });
                }
            });
        },
        
        updateProfile: function(req, res) {
        	User.findOne({
                _id: req.body._id
            }).populate("role").exec(function(err, userObj) {
                if (err) return next(err);
                if (!userObj) return next(new Error('Failed to load User ' + id));
                var user = userObj;
                req.body.first_name = req.body.username;
                user = _.extend(user, req.body);
                user.save(function(err) {
                	if (err) return next(err);
                    res.jsonp(user);
                });
            });
        }
        
    };
}