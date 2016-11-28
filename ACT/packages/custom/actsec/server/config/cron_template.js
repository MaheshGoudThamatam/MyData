'use strict';

var config = require('meanio').loadConfig();
var configuration = require('./config.js');
module.exports = {

    auditRemainder: function(obj) {
        var email = {
            body: {
                name: obj.firstname + ' ' + obj.lastname ,
                intro: 'Remainder for audit.Please login inorder to check ' ,
                outro: 'For any Support email us on link' + ' ' + configuration.supportMail,
                signature: 'Best'
            },
            subject: "Audit Remainder"
        }
        return email;
    },
    securityTaskRemainder : function(obj) {
        var email = {
                body: {
                    name: obj.firstname + ' ' + obj.lastname ,
                    intro: 'Remainder for security task.Please login inorder to check ' ,
                    outro: 'For any Support email us on link' + ' ' + configuration.supportMail,
                    signature: 'Best'
                },
                subject: "Security task Remainder"
            }
            return email;
        },
        contract_cancel :function(obj) {
            var email = {
                    body: {
                        name: obj.contact_person.name,
                        intro: 'Reminder for contract cancellation',
                        outro: 'For any Support email us on link' + ' ' + configuration.supportMail,
                        signature: 'Best'
                    },
                    subject: "Reminder for Contract Cancellation"
                }
                return email;
            },
            contract_overdue :function(obj) {
                var email = {
                        body: {
                            name: obj.contact_person.name,
                            intro: 'Your contract has been elapsed',
                            outro: 'For any Support email us on link' + ' ' + configuration.supportMail,
                            signature: 'Best'
                        },
                        subject: "Contract Cancelled"
                    }
                    return email;
                }
};