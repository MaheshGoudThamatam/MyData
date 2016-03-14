'use strict';

/* jshint -W098 */
/** Name : Student Course  Controller
 * Description : This controller for load admin list of courseRequest baesd on pagination,
 * 				
 * @ <author> Abha Singh
 * @ <date> 23-Feb-2016
 * @ METHODS: adminListCourseRequest(),
 */
angular.module('mean.course').controller('AdminListCourseRequest', function($scope, $stateParams, Global, CourseService, UserCourseService, $location, $rootScope, $timeout, COURSE, SkillService, flash, MESSAGES, AdminListCourseRequestService,MeanUser,BATCHService,CourseTopicService,CourseTestService,CourseprojectService,OnlinetestService,$cookies,PaymentscheduleService,$translate) {
     $scope.global = Global;
        $scope.package = {
        		name: 'course',
                modelName: 'CourseRequest',
                featureName: 'Course Request'
		        };
        $scope.COURSE = COURSE;
        $scope.MESSAGES = MESSAGES;
        $scope.SERVICE = AdminListCourseRequestService;
        
        initializePagination($scope, $rootScope, $scope.SERVICE);
        initializePermission($scope, $rootScope, $location, flash, $scope.package.featureName, MESSAGES);
        initializeBreadCrum($scope, $scope.package.modelName, COURSE.URL_PATH.ADMIN_COURSE_REQUEST,'Admin Course Request','Course Management');
         
        $scope.adminListCourseRequest = function() {
            $scope.currentPage = 1;
            $scope.currentPageSize = 10;
            var query = {};
            query.page = $scope.currentPage;
            query.pageSize = $scope.currentPageSize;
            query.obj = {course : $stateParams.courseId};
            $scope.loadPagination(query);
        };
        $scope.editCourse = function (urlPath, id) {
        urlPath = urlPath.replace(":courseRequestId", id);
        $location.path(urlPath);
    };
});