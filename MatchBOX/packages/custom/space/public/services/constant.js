angular.module('mean.space').constant('SPACE', {
    URL_PATH: {
    	SPACE_LIST: '/admin/space',
    	SPACE_CREATE: '/admin/space/create',
    	SPACE_UPDATE: '/admin/space/:spaceId/edit',
    	SPACE_DELETE: '/admin/space/:spaceId/delete',
    	SPACE_HOLIDAY_LIST: '/admin/space/holiday',
    	SPACE_HOLIDAY_CREATE: '/admin/space/holiday/create',
    	SPACE_HOLIDAY_EDIT: '/admin/space/holiday/:holidayId/edit',
        SPACE_ADDROOM: '/space/:spaceId/addroom'
    },
    
    FILE_PATH: {
    	SPACE_LIST: 'space/views/space_list.html',
    	SPACE_CREATE: 'space/views/space_create.html',
    	SPACE_UPDATE: 'space/views/space_edit.html',
    	SPACE_DELETE: 'space/views/space_delete.html',
    	SPACE_HOLIDAY_LIST: 'space/views/space_holiday_list.html',
    	SPACE_HOLIDAY_CREATE: 'space/views/space_holiday_create.html',
    	SPACE_HOLIDAY_EDIT: 'space/views/space_holiday_edit.html',
        SPACE_ADDROOM: 'space/views/spaceaddroom.html'
    },

    STATE: {
    	SPACE_LIST: 'space',
    	SPACE_CREATE: 'space create',
    	SPACE_UPDATE: 'space update',
    	SPACE_DELETE: 'space delete',
    	SPACE_HOLIDAY_LIST: 'space holiday list',
    	SPACE_HOLIDAY_CREATE: 'space holiday create',
    	SPACE_HOLIDAY_EDIT: 'space holiday edit',
        SPACE_ADDROOM: 'space addroom'
    }
});