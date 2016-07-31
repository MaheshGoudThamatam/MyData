	
angular.module('mean.space').service('ShareHolidaysService', function () {
	var holidays = [];
        
	return {		
		setHolidays: function(adminHolidays){
			holidays = angular.copy(adminHolidays);
		},
		
        getHolidays: function() {
        	return holidays;
        }, 
        
        addHoliday: function (holidayObj) {
        	var found = false;
        	for(var i = 0; i < holidays.length; i++){
        		if(JSON.stringify(holidays[i]._id) === JSON.stringify(holidayObj._id)){
        			found = true;
        			break;
        		}
        	}
        	if(!found){
            	holidays.push(holidayObj);	
        	}
        },
        
        addHolidays: function(holidayList) {
    		for(var j = 0; j < holidayList.length; j++){
    			holidays.push(holidayList[j]);
        	}
        },
        
        deleteHoliday: function (holidayObj) {
        	for(var i = 0; i < holidays.length; i++){
        		if(JSON.stringify(holidays[i]._id) === JSON.stringify(holidayObj._id)){
        			holidays[i].splice(holidayObj, 1);
        			break;
        		}
        	}
        },
        
        deleteHolidays: function (holidayList) {
        	for(var i = 0; i < holidays.length; i++){
            	for(var j = 0; j < holidayList.length; j++){
	        		if(JSON.stringify(holidays[i]._id) === JSON.stringify(holidayList[j]._id)){
	        			holidays[i].splice(holidayList[j], 1);
	        			break;
	        		}
            	}
        	}
        }
        
    };
});