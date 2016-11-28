'use strict';

angular.module('mean.booking').factory('CalendarSchedulerService', 
  function($resource) {
    return {
         
         loadRoomsBasedOnRoomType:$resource('/api/room/loadroomsBasedOnRoomType', {}, {
            update: {
                method: 'PUT' // this method issues a PUT request
            },
            query: {
                method: 'GET',
                isArray: true
            }
         }),
        loadClosedSchedule:$resource('/api/schedule/isclosed', {}, {
            update: {
                method: 'PUT' // this method issues a PUT request
            },
            query: {
                method: 'GET',
                isArray: true
            }
        }),
            };
  });
