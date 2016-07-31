'use strict';

module.exports = {
  send_schedulemail: function(mailOptions) {
    mailOptions.html = [
      'Hi<br>',
      'Your cron schedule for rooms has been failed today<br>',
      'Thanks and Regards',
      'MyMatchbox'
    ].join('<br><br>');
    mailOptions.subject = 'Cron failur mail for creating room schedule.';
    mailOptions.createTextFromHtml= true;
    return mailOptions;
  }
};
