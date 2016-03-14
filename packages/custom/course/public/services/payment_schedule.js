'use strict';

angular.module('mean.course').factory('PaymentscheduleService',
		function($resource) {
			return  {
				paymentSchedule : $resource('/api/course/:courseId/paymentschedule/student/:studentId', { 
						courseId : '@courseId',
						studentId: '@studentId'
					}, {
					update : { method : 'PUT'},
					query : {
						method : 'GET',
						isArray : false
					}
				}),
				
				loadPaymentSchedule : $resource('/api/student/:studentId/paymentschedule/course/:courseId', { 
					courseId : '@courseId',
					studentId: '@studentId'
				}, {
				update : { method : 'PUT'},
				query : {
					method : 'GET',
					isArray : false
				}
			}),
			payNow : $resource('/api/paymentSchedule/:paymentScheduleId/installment', { 
				paymentScheduleId : '@paymentScheduleId'
			}, {
			update : { method : 'PUT'},
			query : {
				method : 'GET',
				isArray : false
			}
		}),
			}
		});