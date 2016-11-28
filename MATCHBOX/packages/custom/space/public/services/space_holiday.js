'use strict';

angular.module('mean.space').factory('SpaceHolidayService', function($resource) {
	return {
		spaceHoliday : $resource('/api/space/holiday/:holidayId', {  holidayId : '@_id' }, {
			update : { method : 'PUT' },
			query : { method : 'GET', isArray : true }
		}),
		yearHolidays:  $resource('/api/space/holiday/year',{}, {
			update : { method : 'PUT' },
			query : { method : 'GET', isArray : true }
		})
	};
});
