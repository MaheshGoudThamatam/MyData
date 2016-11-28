'use strict';
var config = require('meanio').loadConfig();
module.exports = {
			  plugNplayUsers_email : function(plugNplayUsers,req){
				  var email = {
				          body: {
				              name:	 'Hi '+plugNplayUsers.first_name,
				              intro: 'We have received your enquiry for Plug N Play Serviced Offices. Kindly take a moment to review the summary given below:<br/>',


								table: {
								    data: [
								        {
								        	'Your Details': '<b>Name</b>',
								            '':plugNplayUsers.first_name
								        },
								        {
								        	'Your Details': '<b>Email</b>',
								            '': plugNplayUsers.email
								        },
								        {
								        	'Your Details': '<b>Phone No.</b>',
								            '': plugNplayUsers.phonenumber
								        },
								        {
								             'Details': '<b>City</b>',
								             '' : plugNplayUsers.city
								        },
								        {
								        	'Details': '<b>Location</b>',
								            '': plugNplayUsers.area
								        },
								        {
								        	'Details': '<b>Space Type</b>',
								            '': plugNplayUsers.spaceType.desks
								        },
								        {
								        	'Details': '<b>Number of seats</b>',
								            '': plugNplayUsers.noOfDesks.desks
								        },
								        {
								        	'Details': '<b>Start Date</b>',
								            '': plugNplayUsers.startDate
								        },
								        {
								        	'Details': '<b>Term (In months)</b>',
								            '': plugNplayUsers.duration.duration
								        },
								        {
								        	'Details': '<b>Budget</b>',
								            '': plugNplayUsers.budget.budget
								        },
								        {
								        	'Your Details': '<b>Company Name</b>',
								            '': plugNplayUsers.companyName
								        },
								        {
								        	'Details': '<b>Comments</b>',
								            '': plugNplayUsers.comments
								        }
								    ],
								    columns: {
								        // Optionally, customize the column widths
								        customWidth: {
								        	item: '20%',
								        	description: '20%'
								        },
								        // Optionally, change column text alignment
								        customAlignment: {
								        	description: 'right'
								        }
								    }
								},
				              outro: '<b>Thank you for using mymatchbox<br/>Need assistance? Contact us on : admin@mymatchbox.in or call us on '+config.support.phone+'</b>',
				              signature: 'Thank you for using mymatchbox'
				          },
				          subject:'Enquiry Submission'
				      }
				  return email;
				  },
				  
				  plugNplayUsers_admin_email : function(userAdminRole,plugNplayUsers,req){
					  var email = {
					          body: {
					              name:	'Hi',
					              intro: 'An Enquiry for Plug-N-Play room has been raised.'+'<br>',
							      
							      table: {
									    data: [
									        {
									        	'Details': '<b>Name</b>',
									            '':plugNplayUsers.first_name
									        },
									        {
									        	'Details': '<b>Email</b>',
									            '': plugNplayUsers.email
									        },
									        {
									        	'Details': '<b>Phone No.</b>',
									            '': plugNplayUsers.phonenumber
									        },
									        {
									             'Details': '<b>City</b>',
									             '' : plugNplayUsers.city
									        },
									        {
									        	'Details': '<b>Location</b>',
									            '': plugNplayUsers.area
									        },
									        {
									        	'Details': '<b>Space Type</b>',
									            '': plugNplayUsers.spaceType.desks
									        },
									        {
									        	'Details': '<b>Number of seats</b>',
									            '': plugNplayUsers.noOfDesks.desks
									        },
									        {
									        	'Details': '<b>Start Date</b>',
									            '': plugNplayUsers.startDate
									        },
									        {
									        	'Details': '<b>Term (In months)</b>',
									            '': plugNplayUsers.duration.duration
									        },
									        {
									        	'Details': '<b>Budget</b>',
									            '': plugNplayUsers.budget.budget
									        },
									        {
									        	'Details': '<b>Company Name</b>',
									            '': plugNplayUsers.companyName
									        },
									        {
									        	'Details': '<b>Comments</b>',
									            '': plugNplayUsers.comments
									        }
									    ],
									    columns: {
									        // Optionally, customize the column widths
									        customWidth: {
									        	item: '20%',
									        	description: '20%'
									        },
									        // Optionally, change column text alignment
									        customAlignment: {
									        	description: 'right'
									        }
									    }
									},
					          },
					          subject:'Enquiry Submission'
					      };
					  
					  // email.body.name = email.body.name.replace('Hi', '');
					  return email;
				  }


};
