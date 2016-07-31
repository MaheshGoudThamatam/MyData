'use strict';

module.exports = {
  partner_email: function(user, req,token,mailOptions) {
    mailOptions.html = [
      'Hi ' + user.first_name + ',<br>',
      'Admin has created a new account for you in mymatchbox please login to mymatchbox for updating your profile using following credential <br>',
      'username: ' + user.email + '<br>',
      'password: ' + token + '<br>',
      'To login click on the below link:',
      //'<a href="http://' + req.headers.host + '/reset/' + tokenReset+'" >Click here</a>',
      '<a href="http://' + req.headers.host +'/login" >Click here</a>',
      'This link will take you to a secure page.',
      'Thanks and Regards',
      'MyMatchbox'
    ].join('<br><br>');
    mailOptions.subject = 'Partner account details';
    mailOptions.createTextFromHtml= true;
    return mailOptions;
  }

};
