'use strict';

angular.module('mean.course').factory('CoursesService', function($resource) {
	return {
		page : $resource('api/course/:courseId', { courseId : '@_id' }, {
			update : { method : 'PUT' },
			query: {method: 'GET', isArray:true}
		})
	}
});

angular.module('mean.course').factory('CourseBranchService', function($resource) {
	return {
		courseBranch : $resource('/api/course/:courseId/payment-scheme/branch/:branchId', {  branchId : '@branchId', courseId : '@courseId' }, {
			update : { method : 'PUT' },
			query: {method: 'GET', isArray:true}
		}),
		courseCountry : $resource('/api/country/:countryId/payment-scheme/course/:courseId', {  countryId : '@countryId', courseId : '@courseId' }, {
			update : { method : 'PUT' },
			query: {method: 'GET', isArray:true}
		}),
		paymentScheme : $resource('/api/payment-scheme/course/:courseId', {  courseId : '@courseId' }, {
			update : { method : 'PUT' },
			query: {method: 'GET', isArray:true}
		}),
		countryCourse: $resource('/api/course/country/:countryId', {countryId: '@countryId'}, {
            update: {method: 'PUT'},
            query: {method: 'GET', isArray: true}
        }),
		branchCourses : $resource('/api/course/branch/:branchId', {  branchId : '@branchId' }, {
			update : { method : 'PUT' },
			query: {method: 'GET', isArray:true}
		}),
		payment : $resource('/api/:courseId/payment-scheme', {  courseId : '@courseId' }, {
			update : { method : 'PUT' },
			query: {method: 'GET', isArray:true}
		}),
		viewPayment : $resource('/api/branch/:branchId/course/:courseId/payment-scheme', {  branchId : '@branchId', courseId : '@courseId' }, {
			update : { method : 'PUT' },
			query: {method: 'GET', isArray:true}
		}),
	}
});