angular.module('mean.notification').constant('NOTIFICATION', {
    URL_PATH: {
    	NOTIFICATION_LIST: '/notification',
        NOTIFICATION_SHOW: '/notification/:notificationId/show'
    },
    
    FILE_PATH: {
        NOTIFICATION_LIST: 'notification/views/notification_list.html',
        NOTIFICATION_SHOW: 'notification/views/notification_show.html'
    },

    STATE: {
        NOTIFICATION_LIST: 'notification',
        NOTIFICATION_SHOW: 'notification show'
    }
});