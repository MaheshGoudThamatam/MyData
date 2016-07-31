'use strict';

module.exports = {
  booking_email: function(actor,room,space,booking,mailOptions) {
    mailOptions.html = [
      'Hi ' + actor.first_name + ',<br>',
      'Your booking is confirmed for the room<br>',
      'The details are as follows:',
      'Room Name: ' + room.name + '<br>',
      'Room Address: ' + space.address1  +space.address2 + space.city+ '<br>',
      'Booking Details'+ booking.bookingDate + booking.bookingStartTime + booking.bookingEndTime + '<br>',
      //start time ,end time and date need to be added
     // 'This link will take you to a secure page.',
      'Thanks and Regards',
      'MyMatchbox'
    ].join('<br><br>');
    mailOptions.subject = 'Room Booking Details';
    mailOptions.createTextFromHtml= true;
    return mailOptions;
  },

  attendee_email: function(attendee,req,room,space,booking,mailOptions) {
    mailOptions.html = [
      'Hi ' + attendee.name + ',<br>',
      'Your are invited to attend the meeting<br>',
      'The details are as follows:',
      'Room Name: ' + room.name + '<br>',
     'Room Address: ' + room.spaceId.address1  +room.spaceId.address2 + room.spaceId.city+ '<br>',
     'Need to attend on'+ booking.bookingDate + booking.bookingStartTime + booking.bookingEndTime + '<br>',
     // 'This link will take you to a secure page.',
      'Thanks and Regards',
      'MyMatchbox'
    ].join('<br><br>');
    mailOptions.subject = 'Room Booking Details';
    mailOptions.createTextFromHtml= true;
    return mailOptions;
  }

};
