'use strict';
/* JSHint -W098 */
angular.module('mean.course').controller('AdminCourseRequestController', function($scope, $stateParams, Global, CourseService, UserCourseService, $location, $rootScope, $timeout, COURSE, SkillService, flash, MESSAGES, AdminCourseRequestService,MeanUser,BATCHService,CourseTopicService,CourseTestService,CourseprojectService,OnlinetestService,$cookies,PaymentscheduleService,$translate) {
    $scope.global = Global;
    $scope.package = {
        name: 'course',
        modelName: 'Courses',
        modelName1: 'Course Student',
        featureName: 'Course Request'
    };
    $scope.COURSE = COURSE;
    $scope.MESSAGES = MESSAGES;
    $scope.SERVICE = AdminCourseRequestService;
    $scope.USER = MeanUser.user.name;
    if ($stateParams.courseId){
    	initializeBreadCrum($scope, $scope.package.modelName1, COURSE.URL_PATH.ADMIN_COURSE_LIST,'Course Request','Course Management');}
    else{
    	initializeBreadCrum($scope, $scope.package.modelName, COURSE.URL_PATH.ADMIN_COURSE_REQUEST,'Course Request','Course Management');}
    
    
    initializePagination($scope, $rootScope, $scope.SERVICE);
    initializePermission($scope, $rootScope, $location, flash, $scope.package.featureName, MESSAGES);
    $scope.statusArray = ['Accepted', 'Declined', 'Pending'];
    /**
     * Bread Crumbs
     */
    $scope.viewBreadcrumb = function() {
        $scope.breadCrumAdd("Details");
    };
    /**
     * Load Course Request
     */
    $scope.loadCourseRequest = function() {
    	 if ($scope.updatePermission) {
        var query = {};
        query.courseId = $stateParams.courseId;
        AdminCourseRequestService.courseRequest.get(query, function(courseRequests) {
            $scope.course_request = courseRequests;
            $scope.course = $scope.course_request.user;
        });
    	 }
    	 else{
    		 flash.setMessage(MESSAGES.PERMISSION_DENIED, MESSAGES.ERROR);
             $location.path(MESSAGES.DASHBOARD_URL);
    	 }
    };
    /**
     * Loading courses based on users
     */
 $scope.coursesBasedonUsers = function() {
        $scope.userId = MeanUser.user._id;
        AdminCourseRequestService.courseUsers.query({
            userId: $scope.userId
        }, function(courses) {
            $scope.courses = courses;
         });
    };
    /**
     * Show page for Admin Course Request
     */
    $scope.showDetail = function() {
    	$scope.courseStudents = {};
        var query = {};
        query.courseRequestId = $stateParams.courseRequestId;
        AdminCourseRequestService.courseRequestDetail.get(query, function(courseRequest) {
            $scope.courseRequestObj = courseRequest;
            $rootScope.courseRequestObj = courseRequest;
             });
         };
    
    /**
     * Accepting student for a particular Course 
     */
    
    $scope.confirmUserAsCourseRequest = function(courseRequest, status) {
    	$scope.courseStudent = {};
    	$rootScope.courseRequest = {};
    	$scope.courseStudent.branch = $rootScope.courseRequestObj.branch;
    	$scope.courseStudent.batch = $rootScope.courseRequestObj.batch;
    	$scope.courseStudent.user = $rootScope.courseRequestObj.user._id;
    	$scope.courseStudent.course = $rootScope.courseRequestObj.course._id;
    	$scope.courseStudent.paymentschedule = $rootScope.courseRequestObj.paymentscheme._id;
    	$scope.courseStudent.remarks = $scope.courseStudents.remarks;
    	$scope.courseStudent.user_status = status;
    	$rootScope.courseRequest.user_status = status;
         var courseStudent = $scope.courseStudent;
                    var coursestudent = new AdminCourseRequestService.courseStudent(courseStudent);
                          coursestudent.$save(function(response) {
                          	var courseRequest = $rootScope.courseRequest;
        var courseRequest = new AdminCourseRequestService.confirmCourseRequest(courseRequest)
        if (!courseRequest.updated) {
            courseRequest.updated = [];
        }
        courseRequest.updated.push(new Date().getTime());
        courseRequest.$update({
            courseRequestId: $stateParams.courseRequestId
        }, function() {
            $location.path(COURSE.URL_PATH.ADMIN_COURSE_REQUEST);
        }, function(error) {
            $scope.error = error;
        });
                            
        });
          PaymentscheduleService.paymentSchedule.get({
        	  courseId: $scope.courseStudent.course,
        	  studentId: $scope.courseStudent.user,
        	  paymentSchemeId: $scope.courseStudent.paymentschedule
          }, function (response) {
        	  $scope.courseStudent.paymentschedule = {};
        	  
          });
    };
    
    /**
     * Reject Course Request
     */
    $scope.reject = function() {
        $rootScope.courseRequest = {};
        $rootScope.courseRequest.user_status = "Rejected";
        var courseRequest = $rootScope.courseRequest;
        var courseRequest = new AdminCourseRequestService.confirmCourseRequest(courseRequest)
        courseRequest.$update({
            courseRequestId: $stateParams.courseRequestId
        }, function() {
            $location.path(COURSE.URL_PATH.ADMIN_COURSE_REQUEST);
        }, function(error) {
            $scope.error = error;
        });
        $location.path(COURSE.URL_PATH.ADMIN_COURSE_REQUEST);
    };
    
    $scope.myCourseDetails = function(urlPath, course) {
        urlPath = urlPath.replace(":courseId", course._id);
        $location.path(urlPath);
    };
    $scope.findTopics=function(){
        CourseTestService.coursetest.query({
         courseId: $stateParams.courseId
           }, function(collection) {
               $scope.collection = collection;
           });
       };
       $scope.findSubTopics = function(topic,topicId, index) {
			$scope.topicId = topicId;
			$rootScope.courseId = $scope.courseId;
			CourseTopicService.subtopics.query({
				coursetopicId : topicId._id
			}, function(subtopics) {
				topic.subtopics = subtopics;
			});
		};
		$scope.findCourseProject=function(){
			CourseprojectService.page.query(function (projects) {
	                $scope.projects = projects;
	                });
		};
		  $scope.findOnlineTest=function(){
			  OnlinetestService.onlinetest.query(function (onlinetests) {
	                $scope.onlinetests = onlinetests;
	                });
		};
		$scope.findCourse = function(course) {
            CourseService.course.get({
                courseId: $stateParams.courseId
            }, function(course) {
                $scope.course = course;
            });
        };
        $scope.showSchedule=function(urlPath,course){
        	 urlPath = urlPath.replace(":courseId", course._id);
             $location.path(urlPath);
        	
        };
        $scope.myCoursetab=function(urlPath,course){
        	 urlPath = urlPath.replace(":courseId", course._id);
             $location.path(urlPath);
        };
    
    $scope.availablecourse = function () {
    	$scope.breadCrumAdd('List');
    };

    $scope.listofStudentsonCourse = function() {
        $scope.currentPage = 1;
        $scope.currentPageSize = 10;
        var query = {};
        query.page = $scope.currentPage;
        query.pageSize = $scope.currentPageSize;
        query.obj = {course : $stateParams.courseId};
        $scope.loadPagination(query);
    };
    
    /***
     * Load student list page based on batch
     * */
    $scope.batchList = function(course, batch){
    	 var urlPath = COURSE.URL_PATH.BATCH_LIST_STUDENT;
		 urlPath = urlPath.replace(":courseId", course._id).replace(":batchId", batch._id);
		 $location.path(urlPath);
	};
});

