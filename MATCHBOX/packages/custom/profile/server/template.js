'use strict';

module.exports = {
			  contact_page : function(data, user_name){

			  	if(data.enquiryType == 'ListSpace')
			  		{
					  var email = {
					          body: {
					              name:	user_name,
					              intro: 'An Enquiry has been raised. The details are as follows:' + '<br>' +
							      'Enquiry Type:' + data.enquiryType + '<br>' +
							      'Name: ' + data.name + '<br>' +
							      'E-mail:'+ data.email + '<br>' +
							      'Phone:'+ data.phone + '<br>' +
							      'Space Type:'+ data.spaceType + '<br>' +
							      'Description:'+ data.description + '<br>',
					          },
					          subject:'Enquiry Submission'
					      }
					 }
				else
				{
					if(data.bookingId == undefined)
						data.bookingId = "N/A";
					 var email = {
					          body: {
					              name:	user_name,
					              intro: 'An Enquiry has been raised. The details are as follows:' + '<br>' +
							      'Enquiry Type:' + data.enquiryType + '<br>' +
							      'Name: ' + data.name + '<br>' +
							      'E-mail:'+ data.email + '<br>' +
							      'Phone:'+ data.phone + '<br>' +
							      'Booking ID:'+ data.bookingId + '<br>' +
							      'Description:'+ data.description + '<br>',
					          },
					          subject:'Enquiry Submission'
					      }
				}





					  return email;
					  }


};
