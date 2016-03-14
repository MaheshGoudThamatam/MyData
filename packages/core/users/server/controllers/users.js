'use strict';
require('../../../../custom/role/server/models/role.js');
require('../../../../custom/mentor/server/models/mentor_request.js');
require('../../../../custom/mentor/server/models/project_request.js');
require('../../../../custom/branch/server/models/country.js');
var async = require('async');
var utility = require('../../../system/server/controllers/util.js');
var MESSAGE = require('../../../system/server/controllers/message.js');
var validation = require('../../../system/server/controllers/validationUtil.js');
var ERRORS = MESSAGE.ERRORS;
var SUCCESS = MESSAGE.SUCCESS;
/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    RoleModel = mongoose.model('Role'),
    MentorRequestModel = mongoose.model('MentorRequest'),
    QualificationDetailModel = mongoose.model('QualificationDetail'),
    AddressModel = mongoose.model('Address'),
    AdditionalDocumentModel = mongoose.model('AdditionalDocument'),
    ExperienceDetailModel = mongoose.model('ExperienceDetail'),
    ProjectRequestModel = mongoose.model('ProjectRequest'),
    ReferenceModel = mongoose.model('Reference'),
    async = require('async'),
    config = require('meanio').loadConfig(),
    crypto = require('crypto'),
    nodemailer = require('nodemailer'),
    templates = require('../template'),
    randtoken = require('rand-token'),
    _ = require('lodash'),
    jwt = require('jsonwebtoken'), //https://npmjs.org/package/node-jsonwebtoken
    CountryModel = mongoose.model('Country');

function loadUsers(req, res, query) {
    var users = [];
    User.find(query, {}).populate('role', 'name').populate('qualification_details', 'examination').populate('country', 'countryName').exec(function(err, users) {
        if (err) {
            return res.status(500).json([]);
        }
        res.json(users);
    });
}

function generateAuthToken(payload) {
    var escaped = JSON.stringify(payload);
    escaped = encodeURI(escaped);
    // We are sending the payload inside the token
    var token = jwt.sign(escaped, config.secret, {
        expiresInMinutes: 60 * 5
    });
    return token;
}
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
            var token = generateAuthToken(req.user);
            res.cookie('token', token);
            var destination = config.strategies.landingPage;
            if (!req.cookies.redirect) {
                res.cookie('redirect', destination);
            }
            res.redirect(destination);
        },
        /**
         * Show login form
         */
        signin: function(req, res) {
            if (req.isAuthenticated()) {
                return res.redirect('/');
            }
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
         * Validate User
         */
        validateUser: function(req, res, next) {
            if (next) {}
            var registerUser = new User(req.body);
            registerUser.provider = 'local';
            // because we set our user.provider to local our models/user.js validation will always be true
            req.assert(ERRORS.ERROR_1002.param, ERRORS.ERROR_1002.msg).notEmpty();
            req.assert(ERRORS.ERROR_1003.param, ERRORS.ERROR_1003.msg).isEmail();
            req.assert(ERRORS.ERROR_1004.param, ERRORS.ERROR_1004.msg).len(8, 20);
            req.assert(ERRORS.ERROR_1005.param, ERRORS.ERROR_1005.msg).len(1, 50);
            req.assert(ERRORS.ERROR_1006.param, ERRORS.ERROR_1006.msg).equals(req.body.password);
            var errors = req.validationErrors();
            if (errors) {
                return res.status(400).send(errors);
            }
            User.findOne({
                "$or": [{
                    "email": registerUser.email.toLowerCase()
                }, {
                    "username": registerUser.username
                }]
            }).populate('qualification_details', 'examination').populate('role', 'name').populate('country', 'countryName').exec(function(err, user) {
                if (user) {
                    res.status(400).json([
                        ERRORS.ERROR_1001
                    ]);
                } else {
                    res.json(registerUser);
                    res.status(200);
                }
            });
        },
        /**Load user based on Skills*/
        useronSkills: function(req, res) {
            RoleModel.findOne({'name': 'Mentor'}, function(err, role) {
                console.log(role);
                var courseId = JSON.parse(req.query.courseIdArray);
                var roleId = [];
                roleId.push(role._id);
                console.log(courseId);
                User.find({
                    'skills': {
                        $in: courseId.courseIdlist
                    },
                    role: {
                        $in: roleId
                    }
                }, function(err, users) {
                    res.json(users);
                });
            });
        },
        /**
         * Create user
         */
        create: function(req, res, next) {
            var user = new User(req.body);
            RoleModel.findOne({
                'name': 'Student'
            }, function(err, roleId) {
                user.role.push(roleId._id);
            });
            user.provider = 'local';
            // because we set our user.provider to local our models/user.js validation will always be true
            req.assert('name', 'You must enter a name').notEmpty();
            req.assert('email', 'You must enter a valid email address').isEmail();
            req.assert('password', 'Password must be between 8-20 characters long').len(8, 20);
            req.assert('username', 'Username cannot be more than 20 characters').len(1, 20);
            req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password);
            var errors = req.validationErrors();
            if (errors) {
                return res.status(400).send(errors);
            }
            // Hard coded for now. Will address this with the user permissions system in v0.3.5
            user.roles = ['authenticated'];
            user.save(function(err) {
                if (err) {
                    return validation.exportErrorResponse(res, err, ERRORS.ERROR_1001);
                }
                var payload = user;
                payload.redirect = req.body.redirect;
                req.logIn(user, function(err) {
                    if (err) {
                        return next(err);
                    }
                    MeanUser.events.publish({
                        action: 'created',
                        user: {
                            name: req.user.name,
                            username: user.username,
                            email: user.email.toLowerCase()
                        }
                    });
                    // We are sending the payload inside the token
                    var token = generateAuthToken(payload);
                    res.json({
                        token: token
                    });
                });
                var token = randtoken.generate(40);
                user.confirmationToken = token;
                user.confirmationExpires = Date.now() + 24 * 3600000; // 24 hour
                user.save(function(err) {
                    if (err) {}
                    var mailOptions = {
                        to: user.email,
                        from: config.emailFrom
                    };
                    mailOptions = templates.verification_email(user, req, token, mailOptions);
                    sendMail(mailOptions);
                    res.json(user);
                    res.status(200);
                });
            });
        },
        createUser: function(req, res, next) {
            var user = new User(req.body);
            if ((user.userType === 'Student' || user.userType === 'student' || user.userType === null || !user.userType) && !user.isMentor) {
                RoleModel.findOne({
                    'name': 'Student'
                }, function(err, roleId) {
                    user.role.push(roleId._id);
                });
            }
            user.provider = 'local';
            // because we set our user.provider to local our models/user.js validation will always be true
            req.assert(ERRORS.ERROR_1002.param, ERRORS.ERROR_1002.msg).notEmpty();
            req.assert(ERRORS.ERROR_1003.param, ERRORS.ERROR_1003.msg).isEmail();
            req.assert(ERRORS.ERROR_1004.param, ERRORS.ERROR_1004.msg).len(8, 20);
            req.assert(ERRORS.ERROR_1005.param, ERRORS.ERROR_1005.msg).len(1, 50);
            req.assert(ERRORS.ERROR_1006.param, ERRORS.ERROR_1006.msg).equals(req.body.password);
            var errors = req.validationErrors();
            if (errors) {
                return res.status(400).send(errors);
            }
            // Hard coded for now. Will address this with the user permissions system in v0.3.5
            user.roles = ['authenticated'];
            user.save(function(err) {
                if (err) {
                    return validation.exportErrorResponse(res, err, ERRORS.ERROR_1001);
                }
                var token = randtoken.generate(40);
                user.confirmationToken = token;
                user.confirmationExpires = Date.now() + 24 * 3600000; // 24 hour
                user.save(function(err) {
                    if (err) {}
                    var mailOptions = {
                        to: user.email,
                        from: config.emailFrom
                    };
                    mailOptions = templates.verification_email(user, req, token, mailOptions);
                    sendMail(mailOptions);
                    res.json(user);
                    res.status(200);
                });
            });
        },
        /**
         *Confirm User Password
         */
        confirmUser: function(req, res, next) {
            User.loadUserByToken(req.params.token, function(err, user) {
                if (err) {
                    res.redirect('/auth/login?confirmation=1');
                }
                if (!user) {
                    res.redirect('/auth/login?confirmation=3');
                } else {
                    if (Date.now() > user.confirmationExpires) {
                        res.redirect('/auth/login?confirmation=2');
                    } else {
                        user.confirmationToken = undefined;
                        user.confirmationExpires = undefined;
                        user.confirmed = true;
                        user.confirmedAt = Date.now();
                        user.save(function(err) {
                            if (err) {
                                res.redirect('/auth/login?confirmation=1');
                            } else {
                                res.redirect('/auth/login?confirmation=0');
                            }
                        });
                    }
                }
            });
        },
        confirmToken: function(req, res, next) {
            User.loadUserByToken(req.params.token, function(err, user) {
                if (err) {
                    res.send(400);
                }
                if (!user) {
                    res.send(400);
                } else {
                    res.send(200);
                }
            });
        },
        /**
         * Send User
         */
        me: function(req, res) {
            if (!req.user || !req.user.hasOwnProperty('_id')) return res.send(null);
            User.findOne({
                _id: req.user._id
            }).populate('qualification_details').populate('experience_details').populate('address').populate('skills').populate('role', 'name').populate('branch').populate('city').populate('country').exec(function(err, user) {
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
                var token = generateAuthToken(user);
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
            }).populate('role', 'name isAdmin').populate('country').populate('zone').populate('city').populate('branch').populate('address').populate('qualification_details', 'examination').populate('experience_details').populate('references').populate('additional_documents').populate('skills').populate('project').exec(function(err, user) {
                if (err) return next(err);
                if (!user) return next(new Error('Failed to load User ' + id));
                req.profile = user;
                next();
            });
        },
        country: function(req, res, next, id) {
            CountryModel.load(id, function(err, country) {
                if (err) return next(err);
                if (!country) return next(new Error('Failed to load country ' + id));
                req.country = country;
                next();
            });
        },
        //reset password
        resetpassword: function(req, res, next) {
            if (next) {}
            User.findOne({
                resetPasswordToken: req.params.token
            }, function(err, user) {
                if (err) {
                    return res.status(400).json({
                        msg: err
                    });
                }
                if (!user) {
                    return res.status(400).json(ERRORS.ERROR_1009);
                }
                req.assert(ERRORS.ERROR_1004.param, ERRORS.ERROR_1004.msg).len(8, 20);
                req.assert(ERRORS.ERROR_1006.param, ERRORS.ERROR_1006.msg).equals(req.body.password);
                var errors = req.validationErrors();
                if (errors) {
                    return res.status(400).send(errors);
                }
                user.password = req.body.password;
                user.resetPasswordToken = undefined;
                user.resetPasswordExpires = undefined;
                user.save(function(err) {
                    MeanUser.events.publish('resetpassword', {
                        description: user.name + ' reset his password.'
                    });
                    res.status(200).json([
                        SUCCESS.SUCCESS_003
                    ]);
                });
            });
        },
        //changePassword
        changePassword: function(req, res, next) {
            var registerUser = req.profile;
            if (registerUser.hashPassword(req.body.currentPassword) !== registerUser.hashed_password) {
                return res.status(400).json(ERRORS.ERROR_010);
            }
            registerUser = _.extend(registerUser, req.body);
            req.assert(ERRORS.ERROR_1004.param, ERRORS.ERROR_1004.msg).len(8, 20);
            req.assert(ERRORS.ERROR_1006.param, ERRORS.ERROR_1006.msg).equals(req.body.password);
            var errors = req.validationErrors();
            if (errors) {
                return res.status(400).send(errors);
            }
            registerUser.save(function(err) {
                if (err) {
                    return validation.exportErrorResponse(res, err, ERRORS.ERROR_1001);
                }
                User.findOne({
                    _id: registerUser.id
                }).exec(function(err, registerUser) {
                    if (err) {
                        return next(err);
                    }
                    if (!registerUser) {
                        return next(new Error('Failed to load User ' + id));
                    }
                    res.json(registerUser);
                    res.status(200);
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
                    var mailOptions = {
                        to: user.email,
                        from: config.emailFrom
                    };
                    mailOptions = templates.forgot_password_email(user, req, token, mailOptions);
                    sendMail(mailOptions);
                    done(null, user);
                }
            ], function(err, user) {
                var response = {
                    message: 'Mail successfully sent',
                    status: 'success'
                };
                if (err) {
                    response.message = 'User does not exist';
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
        /*Admin create User*/
        adminCreateUser: function(req, res, next) {
            //Generating a password for the user.
            //req.body.password = randtoken.generate(8);
            var user = new User(req.body);
            RoleModel.findOne({
                'name': 'Student'
            }, function(err, roleId) {
                user.role.push(roleId._id);
            });
            user.provider = 'local';
            // because we set our user.provider to local our models/user.js validation will always be true
            req.assert(ERRORS.ERROR_1002.param, ERRORS.ERROR_1002.msg).notEmpty();
            req.assert(ERRORS.ERROR_1003.param, ERRORS.ERROR_1003.msg).isEmail();
            req.assert(ERRORS.ERROR_1005.param, ERRORS.ERROR_1005.msg).len(1, 50);
            var errors = req.validationErrors();
            if (errors) {
                return res.status(400).send(errors);
            }
            // Hard coded for now. Will address this with the user permissions system in v0.3.5
            user.roles = ['authenticated'];
            user.save(function(err) {
                if (err) {
                    return validation.exportErrorResponse(res, err, ERRORS.ERROR_1001);
                }
                var token = randtoken.generate(40);
                user.resetPasswordToken = token;
                user.resetPasswordExpires = Date.now() + 24 * 3600000; // 24 hour
                // Since admin has added the user, assuming the user is confirmed
                // user.confirmed = true;
                //user.confirmedAt = Date.now();
                user.save(function(err) {
                    if (err) {}
                    RoleModel.findOne({
                        'name': 'Admin'
                    }, function(err, roleId) {
                        for (var i = 0; i < user.role.length; i++) {
                            if (JSON.stringify(roleId._id) == JSON.stringify(user.role[i])) {
                                async.each(user.country, function(country, callback) {
                                    var countryadminData = {
                                        country: country,
                                        user: user._id
                                    };
                                    var countryadmin = new CountryAdminModel(countryadminData);
                                    // featurerole.role = role._id;
                                    countryadmin.save(function(err) {
                                        if (err) {
                                            console.log("Inside country admin save:Error " + err);
                                        }
                                    });
                                });
                                //adding city in cityadmin table
                                async.each(user.city, function(city, callback) {
                                    var cityadminData = {
                                        city: city,
                                        user: user._id
                                    };
                                    var cityadminData = new CityAdminModel(cityadminData);
                                    // featurerole.role = role._id;
                                    cityadminData.save(function(err) {
                                        if (err) {
                                            console.log("Inside country admin save:Error " + err);
                                        }
                                    });
                                });
                                //adding zone in zoneadmin table
                                async.each(user.zone, function(zone, callback) {
                                    var zoneadminData = {
                                        zone: zone,
                                        /*country : country._id,*/
                                        user: user._id
                                    };
                                    var zoneadmin = new ZoneAdminModel(zoneadminData);
                                    // featurerole.role = role._id;
                                    zoneadmin.save(function(err) {
                                        if (err) {
                                            console.log("Inside zone admin save:Error " + err);
                                        }
                                    });
                                });
                                async.each(user.branch, function(branch, callback) {
                                    var branchadminData = {
                                        branch: branch,
                                        user: user._id
                                    };
                                    var branchadmin = new BranchAdminModel(branchadminData);
                                    // featurerole.role = role._id;
                                    branchadmin.save(function(err) {
                                        if (err) {
                                            console.log("Inside branch admin save:Error " + err);
                                        }
                                    });
                                });
                            }
                        }
                    });
                    var mailOptions = {
                        to: user.email,
                        from: config.emailFrom
                    };
                    mailOptions = templates.admin_create_user_email(user, req, token, mailOptions);
                    sendMail(mailOptions);
                    res.json(user);
                    res.status(200);
                });
            });
        },
        //Delete user
        destroy: function(req, res) {
            var user = req.profile;
            user.remove(function(err) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot delete user'
                    });
                }
                res.json(user);
            });
        },
        //Fetch all users
        all: function(req, res) {
            var query = {};
            query = validation.modifyQuery(User, req, query);
            User.find(query).populate('role', 'name').exec(function(err, user) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot list users'
                    });
                }
                res.json(user)
            });
        },
        /* Admin updation of user */
        adminUpdate: function(req, res) {
            var user = req.profile;
            if (user.email != req.body.email) {
                var emailChg = true;
                delete req.body.confirmedAt;
                delete req.body.confirmed;
                delete req.body.confirmationToken;
                delete req.body.confirmationExpires;
                token = randtoken.generate(40);
                delete user.confirmedAt;
                delete user.confirmed;
                delete user.confirmationToken;
                delete user.confirmationExpires;
                user.confirmationToken = token;
                user.confirmationExpires = Date.now() + 24 * 3600000; // 24 hour
            }
            if (emailChg) {
                delete user.confirmed;
                user.confirmed = undefined;
            }
            user = _.extend(user, req.body);
            var emailChg = false;
            var token = "";
            req.assert(ERRORS.ERROR_1002.param, ERRORS.ERROR_1002.msg).notEmpty();
            req.assert(ERRORS.ERROR_1003.param, ERRORS.ERROR_1003.msg).isEmail();
            req.assert(ERRORS.ERROR_1005.param, ERRORS.ERROR_1005.msg).len(1, 50);
            var errors = req.validationErrors();
            if (errors) {
                return res.status(400).send(errors);
            }
            //save the updated user
            user.save(function(err) {
                if (err) {
                    return validation.exportErrorResponse(res, err, ERRORS.ERROR_1001);
                }
                if (emailChg) {
                    var mailOptions = {
                        to: user.email,
                        from: config.emailFrom
                    };
                    mailOptions = templates.verification_email_change(user, req, token, mailOptions);
                    sendMail(mailOptions);
                }
                user.save(function(err) {
                    if (err) {
                        console.log("ERROR : " + err);
                    }
                    res.json(user);
                    res.status(200);
                });
            });
        },
        show: function(req, res) {
            res.json(req.profile);
        },
        // edit profile
        update: function(req, res, next) {
            var user = req.profile;
            var userDetails = {};
            userDetails.qualification_details = req.body.qualification_details;
            delete req.body.qualification_details;
            userDetails.address = req.body.address;
            delete req.body.address;
            userDetails.additional_documents = req.body.additional_documents;
            delete req.body.additional_documents;
            userDetails.experience_details = req.body.experience_details;
            delete req.body.experience_details;
            userDetails.references = req.body.references;
            delete req.body.references;
            //deleting project Id from User table
            var projectId = user.project;
            delete user.project;
            user = _.extend(user, req.body);
            // because we set our user.provider to local our models/user.js validation will always be true
            req.assert(ERRORS.ERROR_1002.param, ERRORS.ERROR_1002.msg).notEmpty();
            req.assert(ERRORS.ERROR_1003.param, ERRORS.ERROR_1003.msg).isEmail();
            req.assert(ERRORS.ERROR_1005.param, ERRORS.ERROR_1005.msg).len(1, 50);
            var errors = req.validationErrors();
            if (errors) {
                return res.status(400).send(errors);
            }
            user.save(function(err) {
                if (err) {
                    return validation.exportErrorResponse(res, err, ERRORS.ERROR_1001);
                }
                User.findOne({
                    _id: user.id
                }).populate('role', 'name').populate('qualification_details', 'examination').populate('country', 'countryName').exec(function(err, user) {
                    if (err) {
                        return next(err);
                    }
                    if (!user) {
                        return next(new Error('Failed to load User ' + id));
                    }
                    console.log("userDetails:" + userDetails);
                    async.each(userDetails.qualification_details, function(qualification_detail, callback) {
                        /*var qualificationDetail = qualification_detail;
                         if(qualification_detail._id === null){*/
                        var qualificationDetailData = {
                            user: user._id,
                            examination: qualification_detail.examination,
                            institution: qualification_detail.institution,
                            university: qualification_detail.university,
                            year_of_passing: qualification_detail.year_of_passing,
                            no_of_attempts: qualification_detail.no_of_attempts,
                            percentage_of_marks: qualification_detail.percentage_of_marks,
                            grade_obtained: qualification_detail.grade_obtained,
                            specialisation: qualification_detail.specialisation
                        };
                        var qualificationDetail = new QualificationDetailModel(qualificationDetailData);
                        /*}*/
                        qualificationDetail.save(function(err) {
                            if (err) {
                                console.log("ERROR : " + err);
                            }
                            user.qualification_details.push(qualificationDetail._id);
                        });
                    });
                    async.each(userDetails.address, function(address, callback) {
                        var addressData = {
                            user: user._id,
                            addressType: address.addressType,
                            addressLine1: address.addressLine1,
                            addressLine2: address.addressLine2,
                            city: address.city,
                            state: address.state,
                            country: address.country,
                            pincode: address.pincode
                        };
                        var address = new AddressModel(addressData);
                        address.save(function(err) {
                            if (err) {
                                console.log("ERROR : " + err);
                            }
                            user.address.push(address._id);
                        });
                    });
                    async.each(userDetails.additional_documents, function(additional_document, callback) {
                        var additionalDocumentData = {
                            user: user._id,
                            doc_name: additional_document.doc_name,
                            doc_file: additional_document.doc_file
                        };
                        var additionalDocument = new AdditionalDocumentModel(additionalDocumentData);
                        additionalDocument.save(function(err) {
                            if (err) {
                                console.log("ERROR : " + err);
                            }
                            user.additional_documents.push(additionalDocument._id);
                        });
                    });
                    async.each(userDetails.experience_details, function(experience_detail, callback) {
                        var experienceDetailData = {
                            user: user._id,
                            employer: experience_detail.employer,
                            designation: experience_detail.designation,
                            start_date: experience_detail.start_date,
                            end_date: experience_detail.end_date
                        };
                        var experienceDetail = new ExperienceDetailModel(experienceDetailData);
                        experienceDetail.save(function(err) {
                            if (err) {
                                console.log("ERROR : " + err);
                            }
                            user.experience_details.push(experienceDetail._id);
                        });
                    });
                    async.each(userDetails.references, function(reference, callback) {
                        var referenceData = {
                            user: user._id,
                            ref_name: reference.ref_name,
                            ref_phno: reference.ref_phno,
                            comments: reference.comments
                        };
                        var reference = new ReferenceModel(referenceData);
                        reference.save(function(err) {
                            if (err) {
                                console.log("ERROR : " + err);
                            }
                            user.references.push(reference._id);
                        });
                    });
                    // console.log(user);
                    //*************Updating Mentor Request table, if user is applying as Mentor*************//
                    if (user.isMentor && !projectId) {
                        var mentorRequest = new MentorRequestModel({
                            user: user._id
                        });
                        mentorRequest.save(function(err) {
                            if (err) {}
                        });
                    }
                    //*************Updating Project Request table, if user is applying as Mentor for specific project*************//
                    if (user.isMentor && projectId) {
                        var mentorRequest = new MentorRequestModel({
                            user: user._id,
                            project: projectId,
                            project_status: 'Open'
                        });
                        mentorRequest.save(function(err) {
                            if (err) {}
                        });
                    }
                    user.save(function(err) {
                        if (err) {
                            console.log("ERROR : " + err);
                        }
                        res.json(user);
                        res.status(200);
                    });
                    /*res.json(user);
                     res.status(200);*/
                });
            });
        },
        //role
        role: function(req, res, next, id) {
            RoleModel.load(id, function(err, role) {
                if (err) {
                    return next(err);
                }
                if (!role) {
                    return next(new Error('Failed to load role ' + id));
                }
                req.role = role;
                next();
            });
        },
        /**
         * List of user as by pagination
         */
        userListByPagination: function(req, res) {
            var populateObj = {
                'role': ''
            };
            var mongoQuery = {};
            utility.pagination(req, res, User, mongoQuery, {}, populateObj, function(result) {
                if (utility.isEmpty(result.collection)) {
                    //res.json(result);
                }
                return res.json(result);
            });
        },
        useronRoles: function(req, res) {
            FeatureroleModel.loadfeatureRoleByRoles(req.user.role, function(err, featureroles) {
                if (err) {
                    return next(err);
                }
                if (!featureroles) {
                    return next(new Error('Failed to load featurerole ' + id));
                }
                res.json(featureroles);
            });
        },
         /**
         * List of Investors
         */
        allInvestors: function (req, res) {
            RoleModel.findOne({'name': 'Investor'}, function(err, role) {
                var roleId = [];
                roleId.push(role._id);
                User.find({
                    role: {
                        $in: roleId
                    }
                }, function(err, users) {
                    res.json(users);
                });
            });
        },

        
    };
}