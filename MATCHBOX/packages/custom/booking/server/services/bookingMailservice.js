'use strict';

var config = require('meanio').loadConfig(),
    nodemailer = require('nodemailer'),
    Mailgen = require('mailgen'),
    path = require('path');


// Configure mailgen by providing the path to your custom theme
var mailGenerator = new Mailgen({
    theme: {
        // Build an absolute path to the theme file within your project
        path: path.resolve('packages/custom/booking/server/views/bookingtheme-new.html'),
        // theme: 'default',
    },
    // Configure your product as usual (see examples above)
    product: {
        name: 'mymatchbox',
        link: 'https://www.mymatchbox.in/',
         logo: 'http://res.cloudinary.com/tarento/image/upload/c_scale,h_100,w_300/v1466667239/mymatchbox_logo_cq8etp.png'
    }
});


function sendMail(mailOptions) {
   	var transport = nodemailer.createTransport(config.mailer);
   	transport.sendMail(mailOptions, function(err, response) {
       	if (err) return err;
       	return response;
   	});
};

/**
 * Function to send mail automatically.
 * @param {string} body Mail body
 * @param {string} sendTo Reciever mail id
 */
module.exports = {
    mailService: function(body, sendTo) {
            var hostnameURL = config.hostname;
            if((hostnameURL.indexOf('mymatchbox.v1.idc.tarento.com') > -1)) {
                body.subject = 'MMB_V1 - ' + body.subject;
            }
            if((hostnameURL.indexOf('mymatchboxtest.idc.tarento.com') > -1)) {
                body.subject = 'MMB_TEST - ' + body.subject;
            }
            if((hostnameURL.indexOf('localhost:3000') > -1)) {
                body.subject = 'MMB_LOCALHOST - ' + body.subject;
            }
        var emailBody = mailGenerator.generate(body);
        var mailOptions = {
            to: sendTo,
            subject:body.subject,
            from: config.emailFrom,
            html: emailBody,
            createTextFromHtml: true
        };
        sendMail(mailOptions);
    }
};