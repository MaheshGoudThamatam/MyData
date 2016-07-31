'use strict';

module.exports = {
  forgot_password_email: function(user, req, token, mailOptions) {
    mailOptions.html = [
      'Hi ' + user.name + ',',
      'We have received a request to reset the password for your account.',
      'If you made this request, please click on the link below or paste this into your browser to complete the process:',
      'http://' + req.headers.host + '/reset/' + token,
      'This link will work for 1 hour or until your password is reset.',
      'If you did not ask to change your password, please ignore this email and your account will remain unchanged.',
      'Thanks and Regards',
      'MyMatchbox'
    ].join('\n\n');
    mailOptions.subject = 'Resetting the password';
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
  }
};
