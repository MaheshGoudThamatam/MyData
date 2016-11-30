'use strict';

var config = require('meanio').loadConfig();

String.prototype.capitalize = function() {
	 return this.substr(0, 1).toUpperCase() + this.substr(1).toLowerCase();
}

module.exports = {
	 team_email : function(user, req, token, partner) {
		var partnerContactName = null;
		if(partner && partner != ''){
			partnerContactName = partner.contactName.capitalize();
		}
		var email = {
			body : {
				greeting: 'Welcome',
				name : ' ' + user.first_name,
				intro : partnerContactName + '	'+' has created your account.'+'<br>',
				action : {
					 instructions: 'Please click below to get started.',
					button : {
						color : 'green',
						text: 'Click Here To Get Started',
						link : 'http://' + req.headers.host + '/login'
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
			subject : partner.contactName.capitalize() + ' ' + 'has invited you to mymatchbox'
		}
		return email;
	},
	

	space_rate_and_timing_change_email : function(admin, spaceObj, officeHourScheduleBefore, officeHourScheduleAfter) {
		var tableDataList = [];
	    for(var i = 0; i < officeHourScheduleBefore.length; i++){
		    var tableDataObj = {
		    	'Day' : 'Mon'
		    };
		    if(officeHourScheduleBefore[i].isClosed){
		    	tableDataObj = {
		    		'Old Timing' : 'Closed'
		    	}
		    } else {
		    	tableDataObj = {
		    		'Old Timing' : officeHourScheduleBefore[i].startTime + '-' + officeHourScheduleBefore[i].endTime
		    	}
		    }
		    if(officeHourScheduleAfter[i].isClosed){
		    	tableDataObj = {
		    		'Old Timing' : 'Closed'
		    	}
		    } else {
		    	tableDataObj = {
		    		'New Timing' : officeHourScheduleAfter[i].startTime + '-' + officeHourScheduleAfter[i].endTime
		    	}
		    }
		    tableDataList.push(tableDataObj);
	    }
		
		var email = {
			body : {
				name : 'Hi',
				intro : 'Please take a moment to view the ' + spaceObj.name + ' space timing update.',
				action : {
					button : {
						color : 'green',
						text : 'Click Here',
						link : config.hostname + '/admin/space/' + spaceObj._id + '/edit'      
					}
				},
				table : {
					data : [
							{
								'Day' : 'Mon',
								'Old Timing' : officeHourScheduleBefore[0].startTime + ' - ' + officeHourScheduleBefore[0].endTime,
								'New Timing' : officeHourScheduleAfter[0].startTime + ' - ' + officeHourScheduleAfter[0].endTime
							},
							{
								'Day' : 'Tue',
								'Old Timing' : officeHourScheduleBefore[1].startTime + ' - ' + officeHourScheduleBefore[1].endTime,
								'New Timing' : officeHourScheduleAfter[1].startTime + ' - ' + officeHourScheduleAfter[1].endTime
							},
							{
								'Day' : 'Wed',
								'Old Timing' : officeHourScheduleBefore[2].startTime + ' - ' + officeHourScheduleBefore[2].endTime,
								'New Timing' : officeHourScheduleAfter[2].startTime + ' - ' + officeHourScheduleAfter[2].endTime
							},
							{
								'Day' : 'Thu',
								'Old Timing' : officeHourScheduleBefore[3].startTime + ' - ' + officeHourScheduleBefore[3].endTime,
								'New Timing' : officeHourScheduleAfter[3].startTime + ' - ' + officeHourScheduleAfter[3].endTime
							},
							{
								'Day' : 'Fri',
								'Old Timing' : officeHourScheduleBefore[4].startTime + ' - ' + officeHourScheduleBefore[4].endTime,
								'New Timing' : officeHourScheduleAfter[4].startTime + ' - ' + officeHourScheduleAfter[4].endTime
							},
							{
								'Day' : 'Sat',
								'Old Timing' : officeHourScheduleBefore[5].startTime + ' - ' + officeHourScheduleBefore[5].endTime,
								'New Timing' : officeHourScheduleAfter[5].startTime + ' - ' + officeHourScheduleAfter[5].endTime
							},
							{
								'Day' : 'Sun',
								'Old Timing' : officeHourScheduleBefore[6].startTime + ' - ' + officeHourScheduleBefore[6].endTime,
								'New Timing' : officeHourScheduleAfter[6].startTime + ' - ' + officeHourScheduleAfter[6].endTime
							} ],
					columns : {
						// Optionally, customize the column widths
						customWidth : {
							item : '15%',
							description : '20%'
						},
						// Optionally, change column text alignment
						customAlignment : {
							Day : 'center',
							'Old Timing' : 'center',
							'New Timing' : 'center'
						}
					}
				}
			},
			subject : spaceObj.name + ' ' + 'timing has been changed.'
		}
		return email;
	}

};
