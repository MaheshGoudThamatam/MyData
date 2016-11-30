'use strict';

require('../../../holidays/server/controllers/holiday.js');

var mongoose = require('mongoose'),
    HolidayModel = mongoose.model('Holiday'),
	async = require('async'),
	_ = require('lodash');

function stringToTimeStamp(dateString) {
    var dateTime = dateString;
    var date = new Date(dateTime);
    return date.getTime();
}



function stringToBoolean(booleanString){
	if(booleanString === 'true'){
	    return true;
	} else if(booleanString === 'false'){
		return false;
	}  else if(booleanString === true){
        return true;
    } else if(booleanString === false){
        return false;
    } else {
	    return null;
	}
}

var month = new Array();
month[0] = "01"; month[1] = "02"; month[2] = "03"; month[3] = "04"; month[4] = "05"; month[5] = "06";
month[6] = "07"; month[7] = "08"; month[8] = "09"; month[9] = "10"; month[10] = "11"; month[11] = "12";

module.exports = {
    findSlot: function (currentAvail, bookingStart, bookingEnd, isAllDay) {
        for (var i = 0; i < currentAvail.length; i++) {
        	var currentAvailStartTime = currentAvail[i].startTime;
        	var currentAvailEndTime = currentAvail[i].endTime;
        	/*if(isAllDay){
        		currentAvailStartTime = new Date(currentAvailStartTime);
        		currentAvailEndTime = new Date(currentAvailEndTime);
        		currentAvailStartTime.setDate(currentAvailStartTime.getDate() - 1);
	    	}*/
            var currentStartTime = stringToTimeStamp(currentAvailStartTime);
            var currentEndTime = stringToTimeStamp(currentAvailEndTime);
            
            if (currentStartTime <= bookingStart && bookingEnd <= currentEndTime && !currentAvail[i].isBlocked) {
                return i;
            }
        }
        return -1;
    },
    findBlockedSlot: function (currentAvail, bookingStart, bookingEnd) {
        for (var i = 0; i < currentAvail.length; i++) {
            var currentStartTime = stringToTimeStamp(currentAvail[i].startTime);
            var currentEndTime = stringToTimeStamp(currentAvail[i].endTime);
            if (currentStartTime <= bookingStart && currentEndTime >= bookingEnd) {
                return i;
            }
        }
        return -1;
    },

    mergeAllSlot: function (currentAvail) {
        var i = 0;
        while (i < currentAvail.length) {
            var j = i;
            while (j < currentAvail.length) {
                if (j + 1 < currentAvail.length) {
                    if (stringToTimeStamp(currentAvail[j + 1].startTime) - stringToTimeStamp(currentAvail[j].endTime) < 5000 && currentAvail[j + 1].isBlocked == currentAvail[j].isBlocked) {
                        currentAvail[j].endTime = new Date(stringToTimeStamp(currentAvail[j + 1].endTime) + 1000);
                        currentAvail.splice(j + 1, 1);
                    } else {
                        j++;
                    }
                } else {
                    j++;
                }
            }
            i++;
        }
        return currentAvail;
    },

    splitSlot: function (currentSlot, bookingStart, bookingEnd) {
        var splittedSlot = [];
        if (currentSlot.startTime != bookingStart) {
            var firstSlot = {
                startTime: currentSlot.startTime,
                endTime: new Date(bookingStart - 1000),
                isBlocked: false
            };
            splittedSlot.push(firstSlot);
        }
        var bookingSlot = {
            startTime: bookingStart,
            endTime: bookingEnd,
            isBlocked: true
        };
        splittedSlot.push(bookingSlot);
        if (currentSlot.endTime != bookingEnd) {
            var secondSlot = {
                startTime: new Date(bookingEnd + 1000),
                endTime: currentSlot.endTime,
                isBlocked: false
            };
            splittedSlot.push(secondSlot);
        }
        return splittedSlot;
    },
    
    /**
     * Return date as 'YYYY-MM-DD' format
     */
    convertDate: function (conversionDate) {
    	var date = new Date(conversionDate);
    	var yyyy = date.getFullYear().toString();
    	var mm = (date.getMonth()+1).toString();
    	var dd  = date.getDate().toString();

    	var mmChars = mm.split('');
    	var ddChars = dd.split('');

    	return yyyy + '-' + (mmChars[1]?mm:"0"+mmChars[0]) + '-' + (ddChars[1]?dd:"0"+ddChars[0]);
    },
    
    /**
     * Customize date as per time
     */
    customizeTimeForDate : function(currentDate, bookingTime){
    	var date = currentDate;
		var parts = bookingTime.match(/(\d+)\:(\d+) (\w+)/),
			hours = /am/i.test(parts[3]) ? ( /12/.test(parts[1]) ? parseInt('00', 10) : parseInt(parts[1], 10) ) : ( /12/.test(parts[1]) ? parseInt('00', 10) + 12 : parseInt(parts[1], 10) + 12 ),
		    //hours = /am/i.test(parts[3]) ? parseInt(parts[1], 10) : parseInt(parts[1], 10) + 12,
		    minutes = parseInt(parts[2], 10);

	    date.setHours(hours);
	    date.setMinutes(minutes);
	    return date;
    },
    
    /**
     * Customize date with per time
     */
    customizeTimeAndDate : function(currentDate, bookingTime){
    	var date = currentDate;
		var splittedTime = bookingTime.split(':');

		var hr = parseInt(splittedTime[0]);
		var min = parseInt(splittedTime[1]);
		
		date.setHours(hr);
		date.setMinutes(min);

	    return date;
    },
    
    /**
     * Return array of dates ranging from 'FROM DATE' to 'TO DATE'
     */
    dateRangeWithTime : function(bookingFrom, bookingTo, bookingStartTime, bookingEndTime){
    	var date;
		var currentDate = new Date(bookingFrom);
		var endDate = new Date(bookingTo);
		var startEndDate;
		var betweenDates = [];
		while (currentDate <= endDate) {
			startEndDate = [];
			
			date = new Date(currentDate);
			var parts = bookingStartTime.match(/(\d+)\:(\d+) (\w+)/),
			    hours = /am/i.test(parts[3]) ? parseInt(parts[1], 10) : parseInt(parts[1], 10) + 12,
			    minutes = parseInt(parts[2], 10);

		    date.setHours(hours);
		    date.setMinutes(minutes);
		    startEndDate.push(date);
		    
		    date = new Date(currentDate);
			    parts = bookingEndTime.match(/(\d+)\:(\d+) (\w+)/),
			    hours = /am/i.test(parts[3]) ? parseInt(parts[1], 10) : parseInt(parts[1], 10) + 12,
			    minutes = parseInt(parts[2], 10);

		    date.setHours(hours);
		    date.setMinutes(minutes);
		    startEndDate.push(date);
		    
		    betweenDates.push(startEndDate);
	        currentDate.setDate(currentDate.getDate() + 1);
	    }
		return betweenDates;
    },
    
    loadHoliday : function() {
    	var holidaysList = [];
    	var unavailableDates = [];
    	var disabledDate = [];
    	var currentDate = new Date();
    	var selectedyear = currentDate.getFullYear();

    	var yearselected;
        if(selectedyear){
        	yearselected = selectedyear;
        } else {
            yearselected = 'undefined';
        }
        var query = {};
        query.has_admin_created = true;
        query.year = yearselected;
        HolidayModel.find(query).exec(function (err, holidays) {
            if (err) {
                return res.status(500).json({
                    error: 'Cannot list the holidays'
                });
            }
    		for (var i = 0; i < holidays.length; i++) {
    			var holidayDate = new Date(holidays[i].holiday_date).getDate();
    			var holidayMonth = month[new Date(holidays[i].holiday_date).getMonth()];
    			var holidayYear = new Date(holidays[i].holiday_date).getFullYear();
    			holidaysList.push({
    				title : holidays[i].name,
    				start : holidayDate + "-" + holidayMonth + "-" + holidayYear
    			});
    			unavailableDates.push(holidayDate + "-" + holidayMonth + "-" + holidayYear);
    			disabledDate.push(holidayMonth + "-" + holidayDate + "-" + holidayYear);
    		}
    		return disabledDate;
        });
    },
    
    calculateDateRange : function(reqBody, callback) {
    	
    	async.waterfall([ function(done) {
        	var holidaysList = [];
        	var unavailableDates = [];
        	var disabledDate = [];
        	var currentDate = new Date();
        	var selectedyear = currentDate.getFullYear();

        	var yearselected;
            if(selectedyear){
            	yearselected = selectedyear;
            } else {
                yearselected = 'undefined';
            }
            var query = {};
            query.has_admin_created = true;
            query.year = yearselected;
            HolidayModel.find(query).exec(function (err, holidays) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot list the holidays'
                    });
                }
        		for (var i = 0; i < holidays.length; i++) {
        			var holidayDate = new Date(holidays[i].holiday_date).getDate();
        			var holidayMonth = month[new Date(holidays[i].holiday_date).getMonth()];
        			var holidayYear = new Date(holidays[i].holiday_date).getFullYear();
        			holidaysList.push({
        				title : holidays[i].name,
        				start : holidayDate + "/" + holidayMonth + "/" + holidayYear
        			});
        			unavailableDates.push(holidayDate + "/" + holidayMonth + "/" + holidayYear);
        			disabledDate.push(holidayMonth + "/" + holidayDate + "/" + holidayYear);
        		}
				done(null, disabledDate);
            });
            
        }, function (disabledDate, done) {
        	var disabledDateList = disabledDate;
        	var validDate = true;
    		Date.prototype.addDays = function(days) {
    			var dat = new Date(this.valueOf());
    			dat.setDate(dat.getDate() + days);
    			return dat;
    		}

    		var dates = [];

    		var holidaystartDate = new Date(reqBody.fromDate);
    		var holidayendDate = new Date(reqBody.endDate);
    		
    		reqBody.excludeHoliday = stringToBoolean(reqBody.excludeHoliday);
    		reqBody.excludeSunday = stringToBoolean(reqBody.excludeSunday);

    		// create a loop between the interval
    		while (holidaystartDate <= holidayendDate) {
    			// add one day

    			var holidayDate = holidaystartDate.getDate();
    			var holidayMonth = month[holidaystartDate.getMonth()];
    			var holidayYear = holidaystartDate.getFullYear();
    			
    			if (reqBody.excludeHoliday && reqBody.excludeSunday) {
    				var temp = holidayMonth + "/" + holidayDate + "/" + holidayYear;
    				/*var isDateInRange = jQuery.inArray(temp, disabledDateList);*/
    				var isDateInRange = disabledDateList.indexOf(temp);
    				
    				/*if (isDateInRange == -1 && holidaystartDate.getDay() != 0) {
    					dates.push(holidayMonth + "/" + holidayDate + "/" + holidayYear);
    				} else if (isDateInRange != -1 && holidaystartDate.getDay() == 0) {
    					dates.push(holidayMonth + "/" + holidayDate + "/" + holidayYear);
    				}*/
    				
    				if (isDateInRange != -1){

    				} else if(holidaystartDate.getDay() == 0) {
    								
    				} else {
    					dates.push(holidayMonth + "/" + holidayDate + "/" + holidayYear);
    				}

    			}
    			if (reqBody.excludeHoliday && !reqBody.excludeSunday) {
    				var temp = holidayMonth + "/" + holidayDate + "/" + holidayYear;
    				var isDateInRange = disabledDateList.indexOf(temp);
    				if (isDateInRange == -1) {
    					dates.push(holidayMonth + "/" + holidayDate + "/" + holidayYear);
    				}
    			}
    			if (!reqBody.excludeHoliday && reqBody.excludeSunday) {
    				var temp = holidayMonth + "/" + holidayDate + "/" + holidayYear;
    				var isDateInRange = disabledDateList.indexOf(temp);
    				if (holidaystartDate.getDay() != 0) {
    					dates.push(holidayMonth + "/" + holidayDate + "/" + holidayYear);
    				}
    			}
    			if (!reqBody.excludeHoliday && !reqBody.excludeSunday) {
    				var temp = holidayMonth + "/" + holidayDate + "/" + holidayYear;
    				dates.push(holidayMonth + "/" + holidayDate + "/" + holidayYear);
    			}
    			holidaystartDate = holidaystartDate.addDays(1);

    		}
    		//var filteredDate = dates;
    		done(null, dates);
			
		} ], callback);
    	
    },

    dateArrayWithUTCTime : function(filteredDate, roomObj, callback){
    	var dateTimeList = [];
    	var dateTimeObj;
    	for(var i = 0; i < filteredDate.length; i++){
    		dateTimeObj = {};
    		
    		var offsetStartTime = new Date(filteredDate[i] + ' ' + roomObj.stime);
    		offsetStartTime = offsetStartTime.setMinutes(offsetStartTime.getMinutes() + roomObj.timeZoneOffset);
    		dateTimeObj.startDateTime = new Date(offsetStartTime);
    		
    		var offsetEndTime = new Date(filteredDate[i] + ' ' + roomObj.etime);
    		offsetEndTime = offsetEndTime.setMinutes(offsetEndTime.getMinutes() + roomObj.timeZoneOffset);
    		dateTimeObj.endDateTime = new Date(offsetEndTime);
    			
    		/*dateTimeObj.startDateTime = new Date(filteredDate[i] + ' ' + roomObj.stime).toUTCString();
    		dateTimeObj.endDateTime = new Date(filteredDate[i] + ' ' + roomObj.etime).toUTCString();*/
    		
    		dateTimeList.push(dateTimeObj);
    	}
    	
    	callback(null, dateTimeList);
    }

};