'use strict';

var config = require('meanio').loadConfig();
var configuration = require('./config.js');
module.exports = {
    forgot_password_email: function(user, token) {
        var email = {
            body: {
                name: user.firstname + ' ' + user.lastname,
                intro: 'We have received a request to reset the password for your account. If you made this request, please click on the link below to complete the process. This link will work for 1 hour or until your password is reset.',
                action: {
                    button: {
                        color: 'orange',
                        text: 'Reset Password',
                        link: config.hostname + '/reset/' + token
                    }
                },
                outro: 'If you did not ask to change your password, please ignore this email and your account will remain unchanged. For any support email us on link ' + ' ' + configuration.supportMail,
                signature: 'Best'
            },
            subject: "Resetting the password"
        }
        return email;
    },
    password_reset_email: function(user) {
        var email = {
            body: {
                name: user.firstname + ' ' + user.lastname,
                intro: 'The password for you account has been changed. You can login to Actsec using your new password.',
                action: {
                    button: {
                        color: 'green',
                        text: 'Login',
                        link: config.hostname + '/login'
                    }
                },
                outro: 'If you did not initiate the change of password immediately contact support at' + ' ' + configuration.supportMail,
                signature: 'Best'
            },
            subject: "Password Changed"
        }
        return email;
    },
    loginMailTemplate: function(obj) {
        var email = {
            body: {
                name: obj.firstname + ' ' + obj.lastname,
                intro: 'Welcome to ActSec Security Services! We are very excited to have you on board. ' + 'Your login credentials are ' + '</br>' + '<b>' + ' Email: ' + obj.email + '</br>' + 'Password: ' + obj.confirmationToken + '</b>' + '</br>' + 'To get started, please login with credentials send to you',
                action: {
                    button: {
                        color: 'green',
                        text: 'To login Click Here',
                        link: 'http://www.google.com'
                    }
                },
                outro: 'For any support email us on link' + ' ' + configuration.supportMail,
                signature: 'Best'
            },
            subject: "Login Confirmation"
        }
        return email;
    },
    userCredentialtemplate: function(obj, token) {
        var email = {
            body: {
                name: obj.firstname + ' ' + obj.lastname,
                intro: 'Welcome to ActSec Security Services! We are very excited to have you on board. ' + 'Your login credential are ' + '</br>' + '<b>' + ' Email: ' + obj.email + '</br>' + 'Password: ' + token + '</b>' + '</br>' +  'To get started, please login with credential send to you',
                action: {
                    button: {
                        color: 'green',
                        text: 'To login Click Here',
                        link: config.hostname + '/login'
                    }
                },
                outro: 'For any Support email us on link' + ' ' + configuration.supportMail,
                signature: 'Best'
            },
            subject: "Login Confirmation"
        }
        return email;
    },
    userNotify: function(obj) {
        var email = {
            body: {
                name: obj.firstname + ' ' + obj.lastname,
                intro: 'Change in your profile details.',
                outro: 'For any Support email us on link' + ' ' + configuration.supportMail,
                signature: 'Best'
            },
            subject: "Change Details"
        }
        return email;
    },
    securityManager_create : function(obj, token,userCredentialToken) {
        var email = {
                body: {
                    name: obj.firstname + ' ' + obj.lastname,
                    intro: 'Welcome to ActSec Security Services! We are very excited to have you on board. ' + 'Your login credential are ' + '</br>' + '<b>' + ' Email: ' + obj.email + '</br>' + 'Password: ' + token + '</b>' + '</br>' + 'Incident Management Link:' + config.hostname + '/report-incident/' + userCredentialToken + ' ' +  '</br>' + 'To get started, please login with credential send to you',
                    action: {
                        button: {
                            color: 'green',
                            text: 'To login Click Here',
                            link: config.hostname + '/login'
                        }
                    },
                    outro: 'For any Support email us on link' + ' ' + configuration.supportMail,
                    signature: 'Best'
                },
                subject: "Login Confirmation"
            }
            return email;
        }
        
};