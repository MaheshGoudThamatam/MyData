'use strict';
/**
 * Online Test Service
 */
angular.module('mean.course').factory('HolidayService', function($resource) {
	return {
		holiday : $resource('api/holiday/:holidayId', {
			holidayId : '@_id'
		}, {
			update : {
				method : 'PUT'
			},
			query : {
				method : 'GET',
				isArray : true
			}
		}),
		page : $resource('/api/holiday/pagination', {}, {
			update : {
				method : 'PUT'
			},
			query : {
				method : 'GET',
				isArray : false
			}
		}),

	};
});
