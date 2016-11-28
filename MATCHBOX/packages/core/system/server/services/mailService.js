'use strict';

var config = require('meanio').loadConfig(),
    nodemailer = require('nodemailer'),
    Mailgen = require('mailgen');

var mailGenerator = new Mailgen({
  	theme: 'default',
  	product: {
        name: 'mymatchbox',
        link: 'https://www.mymatchbox.in/',
         logo: 'http://res.cloudinary.com/tarento/image/upload/c_scale,h_90,w_280/v1466667239/mymatchbox_logo_cq8etp.png'
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
        emailBody = emailBody.replace('Hi', '');
        // var emailText = mailGenerator.generatePlaintext(body);
        // console.log(emailText);
        var mailOptions = {
            to: sendTo,
            subject:body.subject,
            from: config.emailFrom,
            html: emailBody,
            createTextFromHtml: true
            // text: emailText
        };
        sendMail(mailOptions);
    },
    
    mailServiceCustomized: function(body, sendTo, removeString) {
    	console.log(sendTo);
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
        if(removeString && removeString.hi === 'Hi'){
            emailBody = emailBody.replace('Hi', '');
        }
        // var emailText = mailGenerator.generatePlaintext(body);
        // console.log(emailText);
        var mailOptions = {
            to: sendTo,
            subject:body.subject,
            from: config.emailFrom,
            html: emailBody,
            createTextFromHtml: true
            // text: emailText
        };
        sendMail(mailOptions);
    }
};