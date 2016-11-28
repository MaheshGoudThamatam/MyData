'use strict';

module.exports = {
  staff_email: function(user, req, mailOptions) {
    mailOptions.html = [
      'Hi ' + user.name + ',',
      'Admin has created a new account for you in mymatchbox please login to mymatchbox for updating your profile.'
    ].join('\n\n');
    mailOptions.subject = 'Partner account details';
    return mailOptions;
  }
};
