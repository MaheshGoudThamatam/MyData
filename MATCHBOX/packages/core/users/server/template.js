'use strict';
var config = require('meanio').loadConfig();
module.exports = {
  /*forgot_password_email: function(user, req, token, mailOptions) {
  mailOptions.html = [
            
            'Forgot your password ?',
            'We have received a request to reset the password for this e-mail address.',
            'To reset your password please click on the below link:',
            '<a href="http://' + req.headers.host + '/reset/' + token+'" >Click here</a>',
            'This link will take you to a secure page where you can change your password.',
            'This link will work for 1 hour or if your password is reset before 1hr.',
            'If you don’t want to reset the password, please ignore this message. Your password  will not be reset.',
            'Thanks and Regards',
            'MyMatchbox'
        ].join('<br><br>');
        mailOptions.subject = 'Resetting the password';
        mailOptions.createTextFromHtml= true;
        return mailOptions;
  },

  confirmation_email: function(user, req, token, mailOptions) {
    mailOptions.html = [
      'Hi ' + user.first_name + ' ' + user.last_name + ',',
      'You can confirm your account email through the link below:',
      '<a href= "http://' + req.headers.host + '/api/confirm/' + token + '">Click here</a>',
      'This link will take you to a secure page.',
      'Thanks and Regards',
      'MyMatchbox'
    ].join('<br><br>');
    mailOptions.subject = 'Confirmation email';
    return mailOptions;
  },
  matchbox_email: function(user, req, mailOptions) {
    mailOptions.html = [
      'Hi ' + user.first_name + ' ' + user.last_name + ',',
      'Your registration successfully done on matchbox. Please wait for the admin approve. You should get the email once admin approved.',
      'This link will take you to a secure page.',
      'Thanks and Regards',
      'MyMatchbox'
    ].join('\n\n');
    mailOptions.subject = 'Notification email';
    return mailOptions;
  },
  approved_email: function(user, tempass, mailOptions) {
    mailOptions.html = [
      'Hi ' + user.first_name + ' ' + user.last_name + ',',
      'Your profile has been approved successfully by the matchbox admin. Please check your temporary password = <b>' + tempass + '</b>. Please login using temporary password and set your new password.' 
    ].join('\n\n');
    mailOptions.subject = 'Approved email';
    return mailOptions;
  },
  rejected_email: function(user, mailOptions) {
    mailOptions.html = [
      'Hi ' + user.first_name + ' ' + user.last_name + ',',
      'Your profile has been rejected due to some reasons. Please try registration after few days again.'
    ].join('\n\n');
    mailOptions.subject = 'Rejected email';
    return mailOptions;
  },
  addUser_email: function(user, req, password, mailOptions) {
    mailOptions.html = [
      'Hi ' + user.first_name + ' ' + user.last_name + ',',
      req.user.first_name +' has created an account in mymatchbox.',
      'Please login using the password : '+ password + ' and update your account'
    ].join('\n\n');
    mailOptions.subject = 'New account email';
    return mailOptions;
  },*/
  confirmation_email : function(req,user,token){
    var promoApplicable = true;
    if(promoApplicable){
      var promoCodeMessage = 'Please use our promotion code <b>PROMO200</b> to avail a discount of &#8377;&nbsp;200 on your first booking. Terms and Conditions apply.'+
        '<ul><li style="font-size:12px !important;">Cannot be combined with any other offer/promotion.</li></ul>'+
        '<ul><li style="font-size:12px !important;">In the want of cancellation/no-show, the promo code shall be considered as lapsed.</li></ul>'+
        '<ul><li style="font-size:12px !important;">Valid for single use only till 31<sup>st</sup> December 2016.</li></ul>';
    }
    else{
      var promoCodeMessage = '';
    }
  var email = {
          body: {
              name:	'Dear '+user.first_name,
              intro: 'Thank you for registering with mymatchbox - your permanent solution for temporary offices!'+'<br/><br/>'+promoCodeMessage,
              action: {
                  // instructions: 'Please click below to get started.',
                  button: {
                      color: 'green',
                      text: 'Click Here To Get Started',
                      link: 'http://' + req.headers.host + '/api/confirm/' + token 
                  }
              },
              outro: '<b>Need assistance? Contact us on : admin@mymatchbox.in or call us on '+config.support.phone+'</b>',
              signature: 'Thank you'
          },
          subject:'Confirmation mail'
      }
  return email;
  },
  errMail : function(logData, logErrTitle, logErrDate ,mailName, hostnameURL){

    var txt = logData.toString();
    var newTxt = txt.split('(');
    var pathArr = [];
    for (var i = 1; i < newTxt.length; i++) {
    var pathLine = newTxt[i].split(')')[0].fontcolor("red");
    if(pathLine.indexOf('packages') > 0 )
      pathArr.push(pathLine);
    }
    var txtLine = '';
    for (var i = 0; i < pathArr.length; i++) {
        txtLine = '<br/>' + pathArr[i] + '<br/>' + txtLine;
    }
    if (txtLine.length <= 0)
      txtLine = 'N/A';
  var email = {
          body: {
              name: ' '+mailName,
              intro: 'LOG REPORT'+'<br/>'
              + '<p style="text-align:center !important"><b>Reason</p>'+logErrTitle+'</b>'
              + '<br/><br/><p style="text-align:center !important"><b>File(s)</p>'+'<br/>'
              + txtLine
              + '<b><p style="text-align:center !important">at</p>'+logErrDate+'</b>'
              +'<p><br/>'+logData+'</p>',
              action: {
                  instructions: '',
                  button: {
                      color: 'green',
                      text: 'Redirect to site',
                      link: hostnameURL
                  }
              },
              outro: '<b>Need assistance? Contact us on : admin@mymatchbox.in or call us on '+config.support.phone+'</b>',
              signature: 'Thank you for using mymatchbox'
          },
          subject:'******* MMB alerts *******'
      }
  return email;
  },
  forgot_password_email : function(req,user,token){
	  var email = {
	          body: {
	              name:	user.first_name,
	              intro: 'We have received a request to reset the password for your account.',
	              action: {
	                  instructions: 'If this request was made by you, then please click the button below',
	                  button: {
	                      color: 'green',
	                      text: 'Reset Password',
	                      link: 'http://' + req.headers.host + '/reset/' + token
	                  }
	              },
	              outro: '<b>NOTE: If you did not make this request, please ignore this email and your account will remain unchanged.</b><b><br/>Need assistance? Contact us on : admin@mymatchbox.in or call us on '+config.support.phone+'</b>',
	              signature: 'Thank you for using mymatchbox'
	          },
	          subject:'Request for password change'
	      }
	  return email;
	  }
};