'use strict';

angular.module('mean.curriculum').factory('CourseTopicService', function ($resource) {
    return {
    	 courseTopic: $resource('/api/coursetopic/course/:courseId', {courseId: '@course'}, {
         	
         }),
         subtopics: $resource('/api/course/topic/:coursetopicId/list',{coursetopicId : '@_id'},{
        	 
         }),
        topic: $resource('/api/coursetopic/:coursetopicId', {coursetopicId: '@_id'}, {
        	 update: {method: 'PUT'},
             query: {method: 'GET', isArray: true}
        }),
        subtopiccreate :$resource('/api/:courseId/topic/subtopic', {courseId: '@course'}, {
         	
        }),
        curriculum: $resource('/api/:courseId/curriculum', {courseId: '@course'}, {
            query: {
                method: 'GET',
                isArray: true
            }
        }),
        subTopic: $resource('/api/:courseId/curriculum/subtopic', {courseId: '@course'}, {
            query: {
                method: 'GET',
                isArray: true
            }
        }),
       
    }
}).factory('CourseTestService', function ($resource) {
    return {
	    coursetest: $resource('/api/:courseId/coursetest', {courseId: '@course'}, {	    

	         }),
	   	 test: $resource('/api/coursetest/:coursetestId', {coursetestId: '@_id'}, {
	   		 update: {method: 'PUT'},
             query: {method: 'GET', isArray: true}
	        }),
	     page: $resource('/api/curriculum/pagination', {}, {
                update: {
                    method: 'PUT' // this method issues a PUT request
                },
                query: {
                    method: 'GET',
                    isArray: false
                }
            })
    }
});
