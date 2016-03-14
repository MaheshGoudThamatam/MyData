'use strict';
/* JSHint -W098 */
angular.module('mean.course').controller('ListCourseUserController', function($scope, $stateParams, Global, CourseService, UserCourseService, $location, $rootScope, $timeout, COURSE, SkillService, flash, MESSAGES, AdminCourseRequestService,MeanUser,ListService,BATCHService,CourseTopicService,CourseTestService,CourseprojectService,OnlinetestService,PaymentscheduleService,$cookies,$translate) {
    $scope.global = Global;
    $scope.package = {
        name: 'course',
        modelName: 'Courses',
        featureName:'Student Course'	
    };
    $scope.user = $rootScope.currentUser;
    $scope.COURSE = COURSE;
    $scope.MESSAGES = MESSAGES;
    $scope.SERVICE = ListService;
    $scope.USER = MeanUser.user.name;
    initializeBreadCrum($scope, $scope.package.modelName, COURSE.URL_PATH.COURSE_LIST,'Courses','Course Management');
    initializePermission($scope, $rootScope, $location, flash,'Courses', MESSAGES);
    initializePagination($scope, $rootScope, $scope.SERVICE);
    $scope.statusArray = ['Accepted', 'Declined', 'Pending'];
    
    /**
     * Bread Crumbs
     */
    $scope.viewBreadcrumb = function() {
        $scope.breadCrumAdd("Details");
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
    $scope.availablecourse = function () {
    	$scope.breadCrumAdd('List');
    };
    /** Pgination API function to be called.
    @parameters <None>
    @ Owner Mahesh Date : 18-2-2016
    **/

    $scope.listonUsers = function() {
    	$scope.currentPage = 1;
        $scope.currentPageSize = 10;
        var query = {};
        query.page = $scope.currentPage;
        query.pageSize = $scope.currentPageSize;
        query.obj = {user : MeanUser.user._id};
        $scope.loadPagination(query);
        
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
    $scope.curriculum = function(){
        var courseCurriculums = [];
        var subTopics = [];
        $scope.subTopics = subTopics;
        $scope.courseId = $stateParams.courseId;
        CourseTopicService.curriculum.query({courseId: $scope.courseId},function (curriculum){
            $scope.curriculums = curriculum;
            courseCurriculums.push($scope.curriculums);
            CourseTopicService.subTopic.query({courseId: $scope.courseId},function (subtopics){
                $scope.subtopics = subtopics;
                for (var i = 0; i <$scope.curriculums.length; i++) {
                    if ($scope.curriculums[i].topic){
                        for (var j = 0; j <$scope.subtopics.length; j++) {
                            if ($scope.curriculums[i].topic._id == $scope.subtopics[j].parent){
                                subTopics.push($scope.subtopics[j]);
                            }
                        }
                    }
                }
            });
        });
    };
    
    /**
     * loadpaymentSchedule*/
    $scope.loadPaymentSchedule = function() {
		PaymentscheduleService.loadPaymentSchedule.get({
			courseId : $stateParams.courseId,
			studentId : $scope.user._id
		}, function(paymentschedule) {
			$scope.paymentschedule = paymentschedule;
		});
	};

	
	/**
	 *  Admin payNow for each array object*/
	$scope.adminPayNow=function(valid, paymentscheduleId,installmentId){
		var paymentSchedule = new PaymentscheduleService.payNow($scope.paymentschedule);
		paymentSchedule.$update({
			paymentScheduleId : paymentscheduleId,
			installmentId: installmentId
		},function(paymentSchedule){
			$scope.paymentschedule = paymentSchedule;
		});
	};
});