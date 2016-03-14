/** AdminCounsellingScheduleListController
  * Admin create counselling schedule
  * @ Pradeep - Feb 17, 2016
  * @ <Sanjana> <01-mar-2016> <added create,editChecklist,listCounsellingChecklistBreadcrumb and cancelChecklist functions>
**/
'use strict';

var CounsellingApp = angular.module('mean.course');
 CounsellingApp.controller('MentorCounsellingController', 
	function($scope, $stateParams, Global, CourseService, UserCourseService, $location, $rootScope, $timeout, COURSE, CounsellingService, flash, MESSAGES, AdminCounsellingService,AdminCounsellingScheduleListService,MentorCounsellingScheduleListService,StudentCounsellingChecklistService,CourseCounsellingChecklistService,$translate,MeanUser) {
		$scope.global = Global;
	    $scope.package = {
	        name: 'Mentor counselling list',
	        modelName: 'Counselling list',
	        featureName: 'Counselling Schedule',
	    };
	    $scope.SERVICE = MentorCounsellingScheduleListService;
	    $scope.COURSE = COURSE;
		initializeBreadCrum($scope,$scope.package.modelName, COURSE.URL_PATH.ADMIN_USERCOUNSELLING_MENTOR_LIST_VIEW,'Mentor Counselling','Course Management');
		initializePermission($scope, $rootScope, $location, flash, $scope.package.featureName, MESSAGES);
		initializePagination($scope, $rootScope, $scope.SERVICE);
	
		/** <Desc : Defined for fetching the logged in user who is a mentor having the counselling slots assigned to him>
	     * @ PARAMS: <user._id>, ...
	     * @ RETURNS: <>
	     * @ <Pradeep> <Feb 17, 2016> <description of change>
	     **/
		$scope.loadmentorschedule = function(){
            $scope.user=$rootScope.currentUser;
			$scope.currentPage = 1;
            $scope.currentPageSize = 10;
            var query = {};
            query.page = $scope.currentPage;
            query.pageSize = $scope.currentPageSize;
            query.mentorId = $scope.user._id;
            $scope.loadPagination(query);

       };
 
       /** <Desc : Defined for redirecting to mentor counselling view page>
	     * @ PARAMS: <counsellingreq object>, ...
	     * @ RETURNS: <>
	     * @ <Pradeep> <Feb 17, 2016> <description of change>
	     **/
       $scope.viewreqScheduleDetails = function(counsellingreq){
           $rootScope.counsellingreq=counsellingreq;
           $location.path(COURSE.URL_PATH.ADMIN_USERCOUNSELLING_MENTOR_DETAIL_VIEW);
       };

       $scope.viewMentorScheduleDetail = function(){
           $scope.counsellingreq=$rootScope.counsellingreq;
       };

       /** <Desc : Defined for redirecting to mentor counselling list page on clicking the cancel button>
	     * @ PARAMS: <counsellingreq object>, ...
	     * @ RETURNS: <>
	     * @ <Pradeep> <Feb 17, 2016> <description of change>
	     **/
        $scope.cancelCounsellingreq = function(){
           $location.path(COURSE.URL_PATH.ADMIN_USERCOUNSELLING_MENTOR_LIST_VIEW);
       };

       /** <Desc : Defined for adding breadcrums in mentor counselling view and list page>
	     * @ PARAMS: <>, ...
	     * @ RETURNS: <>
	     * @ <Pradeep> <Feb 17, 2016> <description of change>
	     **/
        $scope.viewreqBreadcrumb = function(){
          $scope.breadCrumAdd("View detail");
       };
	      $scope.listCounsellingreqBreadcrumb = function(){
          $scope.breadCrumAdd("Request List");
        };
        
        /** <Desc : Defined for adding remarks for the checklist created by the mentor and saving the object in studentcounsellingchecklist schema>
		     * @ PARAMS: <user._id and counsellingreq._id>, ...
		     * @ RETURNS: <studentcounsellingchecklist object>
		     * @ <Sanjana> <01-mar-2016> <description of change>
		     **/
        $scope.create = function (isValid) {
        	  	if (isValid) {
            $scope.studentcounsellingchecklist = {};
            $scope.studentcounsellingchecklist.questions = [];
            for(var i=0; i<$rootScope.counsellingchecklistQuestions.questions.length; i++)
            	{
            	
            	var obj = {};
            	obj.title = $rootScope.counsellingchecklistQuestions.questions[i].title;
            	obj.description = $rootScope.counsellingchecklistQuestions.questions[i].description;
            	obj.remarks = $rootScope.counsellingchecklistQuestions.questions[i].remarks;
               	$scope.studentcounsellingchecklist.questions.push(obj);
             	$scope.studentcounsellingchecklist.user = MeanUser.user._id;
             	$scope.studentcounsellingchecklist.counselling = $scope.counsellingId;
             	$scope.studentcounsellingchecklist.notes = $rootScope.counsellingchecklistQuestions.notes;
            	}
            var studentcounsellingchecklist = new StudentCounsellingChecklistService.studentCounsellingChecklist(
                    $scope.studentcounsellingchecklist);
                        studentcounsellingchecklist.$save(
                        function (response) {
                        	flash.setMessage(MESSAGES.COUNSELLINGCHECKLIST_UPDATE_SUCESS,MESSAGES.SUCCESS);
                        	$location.path(COURSE.URL_PATH.ADMIN_USERCOUNSELLING_MENTOR_LIST_VIEW);
                            $scope.studentcounsellingchecklist = {};
                        }, function (error) {
                            $scope.error = error;
                        });
                } else {
                    $scope.submitted = true;
                }
        };
        
        /** <Desc : Defined for loading all the questions created by the admin on the student_counselling_checklist page>
	     * @ PARAMS: <course._id and counsellingchecklist._id>, ...
	     * @ RETURNS: <counsellingchecklistQuestions object>
	     * @ <Sanjana> <01-mar-2016> <description of change>
	     **/
           $scope.editChecklist = function(urlPath,counsellingreq) {
        		$rootScope.counsellingId = counsellingreq._id;
        		CourseCounsellingChecklistService.courseCounsellingChecklistEdit.query({
				courseCounsellingChecklistId : counsellingreq.course.checklist[0],
				courseId: counsellingreq.course._id
			}, function(counsellingchecklistQuestions) {
				$rootScope.counsellingchecklistQuestions = counsellingchecklistQuestions;
				$rootScope.counsellingchecklistQuestions.remarks = null;
				$rootScope.counsellingchecklistQuestions.notes = null;
				});
			urlPath = urlPath.replace(":checklistId",counsellingreq.course.checklist[0]);
			$location.path(urlPath);
		};

		 /** <Desc : Defined for redirecting to the mentor list page on clicking the cancel button>
	     * @ PARAMS: <>, ...
	     * @ RETURNS: <>
	     * @ <Sanjana> <01-mar-2016> <description of change>
	     **/
		$scope.cancelChecklist = function()
		{
			$location.path(COURSE.URL_PATH.ADMIN_USERCOUNSELLING_MENTOR_LIST_VIEW);			
		}
		
		/** <Desc : Defined for adding breadcrums in mentor checklist page>
		     * @ PARAMS: <>, ...
		     * @ RETURNS: <>
		     * @ <Sanjana> <01-mar-2016> <description of change>
		     **/
		$scope.listCounsellingChecklistBreadcrumb = function(){
            $scope.breadCrumAdd("Mentor Checklist");
          };
        
});