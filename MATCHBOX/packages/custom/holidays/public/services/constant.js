
angular.module('mean.holidays').constant('HOLIDAY', {
    URL_PATH: {
        HOLIDAYLIST:'/admin/holiday',
        HOLIDAYCREATE:'/admin/holiday/create', 
        HOLIDAYEDIT:'/admin/holiday/:holidayId/edit',
    },
    FILE_PATH: {
    	HOLIDAYLIST:'holidays/views/holiday_list.html',
        HOLIDAYCREATE:'holidays/views/holiday_create.html', 
        HOLIDAYEDIT:'holidays/views/holiday_edit.html',
        
    },

    STATE: {
        HOLIDAYLIST:'holiday list',
        HOLIDAYCREATE:'holiday create', 
        HOLIDAYEDIT:'holiday edit',
    }
});