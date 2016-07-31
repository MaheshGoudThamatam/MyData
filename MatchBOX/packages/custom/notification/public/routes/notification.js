'use strict';

angular.module('mean.notification').config(function ($stateProvider,NOTIFICATION) {
    $stateProvider.state(NOTIFICATION.STATE.NOTIFICATION_LIST, {
        url: NOTIFICATION.URL_PATH.NOTIFICATION_LIST,
        templateUrl: NOTIFICATION.FILE_PATH.NOTIFICATION_LIST
    })
    .state(NOTIFICATION.STATE.NOTIFICATION_SHOW, {
        url: NOTIFICATION.URL_PATH.NOTIFICATION_SHOW,
        templateUrl: NOTIFICATION.FILE_PATH.NOTIFICATION_SHOW
    });
});
