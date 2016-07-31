'use strict';

angular.module('mean.holidays').config(['$stateProvider','HOLIDAY',
  function($stateProvider,HOLIDAY) {
    $stateProvider
       .state(HOLIDAY.STATE.HOLIDAYLIST, {
                url: HOLIDAY.URL_PATH.HOLIDAYLIST,
                templateUrl: HOLIDAY.FILE_PATH.HOLIDAYLIST,
                
            })
       .state(HOLIDAY.STATE.HOLIDAYCREATE, {
                url: HOLIDAY.URL_PATH.HOLIDAYCREATE,
                templateUrl: HOLIDAY.FILE_PATH.HOLIDAYCREATE,
                
            })
       .state(HOLIDAY.STATE.HOLIDAYEDIT, {
                url: HOLIDAY.URL_PATH.HOLIDAYEDIT,
                templateUrl: HOLIDAY.FILE_PATH.HOLIDAYEDIT,
            });
  }
]);
