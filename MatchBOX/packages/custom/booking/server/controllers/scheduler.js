'use strict';

function stringToTimeStamp(dateString) {
    var dateTime = dateString;
    var date = new Date(dateTime);
    return date.getTime();
}

module.exports = {
    findSlot: function (currentAvail, bookingStart, bookingEnd, isAllDay) {
        for (var i = 0; i < currentAvail.length; i++) {
        	var currentAvailStartTime = currentAvail[i].startTime;
        	var currentAvailEndTime = currentAvail[i].endTime;
        	if(isAllDay){
        		currentAvailStartTime = new Date(currentAvailStartTime);
        		currentAvailEndTime = new Date(currentAvailEndTime);
        		currentAvailStartTime.setDate(currentAvailStartTime.getDate() - 1);
        		//currentAvailEndTime.setDate(currentAvailEndTime.getDate());
	    	}
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
    	//var date = new Date(currentDate);
    	var date = currentDate;
		var parts = bookingTime.match(/(\d+)\:(\d+) (\w+)/),
		    hours = /am/i.test(parts[3]) ? parseInt(parts[1], 10) : parseInt(parts[1], 10) + 12,
		    minutes = parseInt(parts[2], 10);

	    date.setHours(hours);
	    date.setMinutes(minutes);
	    
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
    }
};