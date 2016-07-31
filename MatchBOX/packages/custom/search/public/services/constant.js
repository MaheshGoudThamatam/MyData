angular.module('mean.search').constant('SEARCH', {
    URL_PATH: {
    	SEARCH_LIST: '/search',
    	SEARCH_DETAILS: '/search/details/:roomId/room',
    	MAP_VIEW:'/search/map-view',
        
    },
    
    FILE_PATH: {
    	SEARCH_LIST: 'search/views/list.html',
    	SEARCH_DETAILS: 'search/views/details.html',
    	MAP_VIEW:'search/views/map_view.html'
    },

    STATE: {
    	SEARCH_LIST: 'search list',
    	SEARCH_DETAILS: 'search details',
    	MAP_VIEW:'map view'
    },
    
    CONSTANT: {
    	HOT_DESK: 'Hot Desk',
    	MEETING_ROOM: 'Meeting Room',
    	BOARD_ROOM: 'Board Room',
    	TRAINING_ROOM: 'Training Room',
    },
});