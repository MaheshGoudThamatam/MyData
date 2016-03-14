/** AdminCounsellingScheduleListController
  * Admin create counselling schedule
  * @ Pradeep - Feb 17, 2016
**/
'use strict';

var CounsellingApp = angular.module('mean.course');
CounsellingApp.controller('AdminCounsellingScheduleListController', 
	function($scope, $stateParams, Global, CourseService, UserCourseService, $location, $rootScope, $timeout, COURSE, CounsellingService, flash, MESSAGES, AdminCounsellingService,AdminCounsellingScheduleListService,$translate) {
		$scope.global = Global;
	    $scope.package = {
	        name: 'admin counselling list',
	        modelName: 'Counselling list',
	        featureName: 'Admin Counselling',
	    };
	    $scope.SERVICE = AdminCounsellingScheduleListService;
	    $scope.COURSE = COURSE;
		initializeBreadCrum($scope,$scope.package.modelName, COURSE.URL_PATH.ADMIN_USERCOUNSELLING_SCHEDULE_CREATE_COMPLETE_LIST,'Counselling Schedule','Course Management');
		initializePermission($scope, $rootScope, $location, flash, $scope.package.featureName, MESSAGES);
		initializePagination($scope, $rootScope, $scope.SERVICE);

		$scope.createNewSchedule=function(){
			  $location.path(COURSE.URL_PATH.ADMIN_COUNSELLING_CREATE_SCHEDULE);
		};
		$scope.scheduleEdit = function(){
			$scope.breadCrumAdd("Edit Schedule");
		}
		$scope.openDeletePopupModel=function(scheduledetails){
			     $scope.deleteObj = scheduledetails;
			     var adddetails={};
			     var schedule={};
			         schedule.scheduleslots=scheduledetails.slots;
			         adddetails.slots=schedule;
			         adddetails.branch=scheduledetails.branch._id; 
			         adddetails.mentorAssigned=scheduledetails.mentorAssigned._id;
			         adddetails.callDate=scheduledetails.callDate;
             if ($scope.readPermission) {
			  AdminCounsellingScheduleListService.scheduledelete.query(adddetails,function(response){
			  	    $scope.scheduleidarray = response;
                   if(response.length > 0)
                   {
                   	   $scope.popupMessage = response.length + "  Students taken this Schedule. Do you really want to delete this schedule ? This action cannot be undone."
                   }
                   else
                   {  	   
                   	   $scope.popupMessage = "No users taken this Schedule. Do you really want to delete this schedule ? This action cannot be undone."                 
                   }
                   $('#deletePopup').modal("show");

			  },function(error){
                 console.log(error);

			  });
			}
			else {
	            flash.setMessage(MESSAGES.PERMISSION_DENIED, MESSAGES.ERROR);
	            $location.path(MESSAGES.DASHBOARD_URL);
           }
		};

		$scope.cancelDelete=function(){
	      $('#deletePopup').modal("hide");	
          $location.path(COURSE.URL_PATH.ADMIN_USERCOUNSELLING_SCHEDULE_CREATE_COMPLETE_LIST);
	     };	

	     $scope.remove=function(scheduledetails){
	     	 var adddetails={};
	     	 var useremail={"schedulearray":$scope.scheduleidarray};
	     	     adddetails.scheduleId=scheduledetails._id;
	     	     adddetails.useremailarray=useremail;
	            if (scheduledetails && $scope.deletePermission) {
		     	AdminCounsellingScheduleListService.scheduledelete.remove(adddetails,function(response){
		     		  flash.setMessage(MESSAGES.COUNSELLING_SCHEDULE_DELETE, MESSAGES.SUCCESS);
		     		  deleteObjectFromArray($scope.collection, scheduledetails);
		     		  $('#deletePopup').modal("hide");	
				  },function(error){
	                 console.log(error);

				  });
		        }
		       else {
	            flash.setMessage(MESSAGES.PERMISSION_DENIED, MESSAGES.ERROR);
	            $location.path(MESSAGES.DASHBOARD_URL);
	          }
	     };	

	      $scope.admineditcounsellingschedule=function(urlPath,scheduledetails){
	      	$rootScope.scheduledetails=scheduledetails;
	     	urlPath = urlPath.replace(":branchId", scheduledetails.branch._id);
            $location.path(urlPath);
	     };	

	     $scope.loadUser = function(){
			var query = {};
            query.branchIdUser = $stateParams.branchId;
           if ($scope.readPermission) {
				AdminCounsellingService.user.query(query, function (value) {
					 $scope.branchUser = value;
					 $scope.loadAvailableMentor();
	           });
		   }
		   else {
	            flash.setMessage(MESSAGES.PERMISSION_DENIED, MESSAGES.ERROR);
	            $location.path(MESSAGES.DASHBOARD_URL);
           }
		};
		$scope.loadAvailableMentor=function()
		{
            $scope.scheduledetails=$rootScope.scheduledetails;
            $scope.mentorarray=[];
            var adddetails={};
                adddetails.branchId=$scope.scheduledetails.branch._id;
                adddetails.scheduledate=$scope.scheduledetails.callDate;
                adddetails.starttotal=$scope.scheduledetails.start_total;
                adddetails.endtotal=$scope.scheduledetails.end_total;
              if ($scope.readPermission) {
		            AdminCounsellingScheduleListService.fetchAvailableMentor.query(adddetails, function (response) {
		                   for(var i=0;i<response.length;i++){
		                         $scope.mentorarray.push(response[i].mentorAssigned);
		                   }

		                   $scope.filtermentorarray();         
		           });
		         }
		         else {
	            flash.setMessage(MESSAGES.PERMISSION_DENIED, MESSAGES.ERROR);
	            $location.path(MESSAGES.DASHBOARD_URL);
           }   
		};

		$scope.filtermentorarray=function()
		{
           $scope.branchUser1=$scope.branchUser;

           for(var i=0;i<$scope.mentorarray.length;i++)
           {
           	 for(var j=0;j<$scope.branchUser1.length;j++)
           	 {
           	 	if($scope.branchUser1[j]._id === $scope.mentorarray[i])
           	 	{
                  $scope.branchUser.splice(j,1);
           	 	}
           	 }
           }
		};

		$scope.cancelScheduleEdit=function(){
			  $location.path(COURSE.URL_PATH.ADMIN_USERCOUNSELLING_SCHEDULE_CREATE_COMPLETE_LIST);
		};
		$scope.mentorErrorSelection = false;
		$scope.update = function(scheduledetails){
			if(scheduledetails.mentor === undefined){
				$scope.mentorErrorSelection = true;
	            $timeout(function() {
	            	$scope.mentorErrorSelection = false;
				}, 6000);
	            return;
			}
			else
			{
				 var adddetails={};
			     var schedule={};
			         schedule.scheduleslots=scheduledetails.slots;
			         adddetails.slots=schedule;
			         adddetails.branch=scheduledetails.branch._id; 
			         adddetails.mentorAssigned=scheduledetails.mentorAssigned._id;
			         adddetails.callDate=scheduledetails.callDate;
			         adddetails.newmentor=scheduledetails.mentor;
			         adddetails.scheduleId=scheduledetails._id;

                if (scheduledetails && $scope.updatePermission) {
			      AdminCounsellingScheduleListService.updatescheduledetail.update(adddetails,function(response){
			  	          $location.path(COURSE.URL_PATH.ADMIN_USERCOUNSELLING_SCHEDULE_CREATE_COMPLETE_LIST);
					  },function(error){
		                 console.log(error);
					  });
                   }
                 else {
		                flash.setMessage(MESSAGES.PERMISSION_DENIED, MESSAGES.ERROR);
		                $location.path(MESSAGES.DASHBOARD_URL);
                      }


			}
		};
	
});