'use strict';

var config = require('meanio').loadConfig(),
    nodemailer = require('nodemailer'),
    Mailgen = require('mailgen');

var logger = require('../controllers/logs.js');

var mailGenerator = new Mailgen({
    theme: 'salted',
    product: {
        name: 'Actsec Security Services',
        link: 'https://www.actsec.se/'
            // logo: 'https://mailgen.js/img/logo.png'
    }
});

function sendMail(mailOptions) {
    var transport = nodemailer.createTransport(config.mailer);
    transport.sendMail(mailOptions, function(err, response) {
        if (err) {
            var mockReq = {
                connection: {
                    remoteAddress: 'X.X.X.X'
                },
                method: 'EMAIL',
                url: '',
                headers: []
            };
            delete mailOptions.html;
            logger.error(mockReq, "SYSTEM", "sendMail", "Failed to send email", mailOptions, err);
        }
    });
}

/**
 * Function to send mail automatically.
 * @param {string} body Mail body
 * @param {string} sendTo Reciever mail id
 */
module.exports = {
    mailService: function(body, sendTo) {
        var emailBody = mailGenerator.generate(body);
        var mailOptions = {
            to: sendTo,
            from: config.emailFrom,
            subject: body.subject,
            html: emailBody,
            createTextFromHtml: true
        };
        sendMail(mailOptions);
    }
};