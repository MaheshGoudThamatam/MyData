'use strict';

angular.module('mean.holidays').factory('HolidaysService', function($resource) {
	return {
		holiday : $resource('/api/holiday/:holidayId', {  holidayId : '@_id' }, {
			update : { method : 'PUT' },
			query : { method : 'GET', isArray : true }
		}),
		getHolidaysbyyear:  $resource('/api/holiday/basedonyear',{}, {
			update : { method : 'PUT' },
			query : { method : 'GET', isArray : true }
		})
	};
});
