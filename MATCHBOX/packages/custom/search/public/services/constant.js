angular.module('mean.search').constant('SEARCH', {
    URL_PATH: {
    	SEARCH_LIST: '/search',
    	SEARCH_DETAILS: '/search/details/:roomId/room',
    	MAP_VIEW:'/search/map-view',
    	VIRTUAL_OFFICE_LIST : '/search/virtualOffice'
        
    },
    
    FILE_PATH: {
    	SEARCH_LIST: 'search/views/list.html',
    	SEARCH_DETAILS: 'search/views/details.html',
    	MAP_VIEW:'search/views/map_view.html',
    	VIRTUAL_OFFICE_LIST : 'search/views/virtualOfficeList.html'
    },

    STATE: {
    	SEARCH_LIST: 'search list',
    	SEARCH_DETAILS: 'search details',
    	MAP_VIEW:'map view',
    	VIRTUAL_OFFICE_LIST : 'virtual office list'
    },
    
    CONSTANT: {
    	HOT_DESK: 'Hot Desk',
    	MEETING_ROOM: 'Meeting Room',
    	BOARD_ROOM: 'Board Room',
    	TRAINING_ROOM: 'Training Room',
    	VIRTUAL_OFFICE: 'Virtual Office',
    	PLUGNPLAY:'PlugNplay Room'
    },
});