'use strict';

var config = require('meanio').loadConfig();

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
  },
  send_editroomscheduleemail: function(mailOptions) {
    mailOptions.html = [
      'Hi<br>',
      'schedule has been updated<br>',
      'RoomId:'+mailOptions.roomId+'<br>',
      'RoomName:'+mailOptions.editedRoomName+'<br>',
      'Thanks and Regards',
      'MyMatchbox'
    ].join('<br><br>');
    mailOptions.subject = 'Schedule Updated mail';
    mailOptions.createTextFromHtml= true;
    return mailOptions;
  },
  
  room_rate_and_timing_change_email : function(admin, newRates, roomObj, officeHourScheduleBefore, officeHourScheduleAfter) {
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
				name : '    ' + admin.first_name + '!',
				intro : 'Please take a moment to view the ' + roomObj.name + ' room rate and timing updates.<br>'
						+ '	' + '<br>' 
						+ ' Rate Changes.<br>'
						+ '<pre>price / full day   :    Rs.' + newRates.oldpricePerfullday + '  &rarr;  Rs.' + newRates.newpricePerfullday + '</pre>' 
						+ '<pre>price / half day   :    Rs.' + newRates.oldpricePerhalfday + '  &rarr;  Rs.' + newRates.newpricePerhalfday + '</pre>' 
						+ '<pre>price / hours      :    Rs.' + newRates.oldpricePerhour + '  &rarr;  Rs.' + newRates.newpricePerhour + '</pre>',
						
				action : {
					button : {
						color : 'green',
						text : 'Click Here',
						link : config.hostname + '/space/' + roomObj._id + '/edit'      
					}
				},
				table : {
					data : [
							{
								'Day' : 'Mon',
								'Old Timing' : officeHourScheduleBefore[0].startTime + '-' + officeHourScheduleBefore[0].endTime,
								'New Timing' : officeHourScheduleAfter[0].startTime + '-' + officeHourScheduleAfter[0].endTime
							},
							{
								'Day' : 'Tue',
								'Old Timing' : officeHourScheduleBefore[1].startTime + '-' + officeHourScheduleBefore[1].endTime,
								'New Timing' : officeHourScheduleAfter[1].startTime + '-' + officeHourScheduleAfter[1].endTime
							},
							{
								'Day' : 'Wed',
								'Old Timing' : officeHourScheduleBefore[2].startTime + '-' + officeHourScheduleBefore[2].endTime,
								'New Timing' : officeHourScheduleAfter[2].startTime + '-' + officeHourScheduleAfter[2].endTime
							},
							{
								'Day' : 'Thu',
								'Old Timing' : officeHourScheduleBefore[3].startTime + '-' + officeHourScheduleBefore[3].endTime,
								'New Timing' : officeHourScheduleAfter[3].startTime + '-' + officeHourScheduleAfter[3].endTime
							},
							{
								'Day' : 'Fri',
								'Old Timing' : officeHourScheduleBefore[4].startTime + '-' + officeHourScheduleBefore[4].endTime,
								'New Timing' : officeHourScheduleAfter[4].startTime + '-' + officeHourScheduleAfter[4].endTime
							},
							{
								'Day' : 'Sat',
								'Old Timing' : officeHourScheduleBefore[5].startTime + '-' + officeHourScheduleBefore[5].endTime,
								'New Timing' : officeHourScheduleAfter[5].startTime + '-' + officeHourScheduleAfter[5].endTime
							},
							{
								'Day' : 'Sun',
								'Old Timing' : officeHourScheduleBefore[6].startTime + '-' + officeHourScheduleBefore[6].endTime,
								'New Timing' : officeHourScheduleAfter[6].startTime + '-' + officeHourScheduleAfter[6].endTime
							} ],
					columns : {
						// Optionally, customize the column widths
						customWidth : {
							item : '15%',
							description : '20%'
						},
						// Optionally, change column text alignment
						customAlignment : {
							Day : 'left',
							'Old Timing' : 'center',
							'New Timing' : 'center'
						}
					}
				}
			},
			subject : roomObj.name + ' ' + 'timing has been changed.'
		}
		return email;
	}
  
};
