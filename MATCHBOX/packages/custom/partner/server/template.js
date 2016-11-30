'use strict';
var config = require('meanio').loadConfig();

module.exports = {
  partner_email :function(user, req,token){
	  var email = {
	          body: {
	          	  greeting: 'Welcome, '+ user.first_name,
	              // name:	 ' ' + user.first_name,
	              intro: 'Thank you for partnering with mymatchbox!' + '<br>',
	              action: {
	                  instructions: 'Please click below to get started.',
	                  button: {
	                      color: 'green',
	                      text: 'Click Here To Get Started',
	                      link: 'http://' + req.headers.host + '/login'  
	                  }
	              },
					table: {
					    data: [
					        {
					             'Login Details': 'Username' ,
					             '' : user.email
					        },
					        {
					        	'Login Details': 'Password',
					            '': token
					        },
					    ],
					    columns: {
					        // Optionally, customize the column widths
					        customWidth: {
					        	item: '15%',
					        	description: '20%'
					        },
					        // Optionally, change column text alignment
					        customAlignment: {
					        	description: 'right'
					        }
					    }
					},
	              outro: 'Or copy and paste the link below on your internet browser<br/>'+'http://' + req.headers.host + '/login'+'<br/><b>Thank You,<br/>'+'Team mymatchbox<br/>PS: Need assistance? Contact us on : admin@mymatchbox.in or call us on '+config.support.phone+'</b>'
	          },
	          subject:'Invite to join mymatchbox'
	      }
	  return email;
	  }

};
