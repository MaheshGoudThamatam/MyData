/** AdminCounsellingController 
  * Admin will have ability to create, edit and delete counselling schedule, assign mentor to the request,
  * change the status of the request.
  * @ Rajesh - Feb 17, 2016
  * @ Pradeep - Feb 17, 2016 
  * @ METHODS: scheduleBreadcrumb, editRequestBreadcrumb, loadBranch, loadUser, create, timeRange,
  * 		   changeCounsellingStatus, changeCounsellingStatusReject, getMentorDetails, scheduleeditdetail,
  * 		   scheduleviewdetail, updateSchedule, viewScheduleDetails, cancelscheduleRequest, checkError, cancelSchedule, serverError
**/

'use strict';
var CounsellingApp = angular.module('mean.course');
CounsellingApp.controller('AdminCounsellingController', 
	function($scope, $stateParams, Global, CourseService, UserCourseService, $location, $rootScope, $timeout, COURSE, CounsellingService, flash, MESSAGES, AdminCounsellingService,$translate) {
		$scope.global = Global;
	    $scope.package = {
	        name: 'admin counselling',
	        modelName: 'Counselling Request',
	        featureName: 'Admin Counselling Request',
	    };
	    $scope.SERVICE = AdminCounsellingService;
	    $scope.COURSE = COURSE;
		initializeBreadCrum($scope,$scope.package.modelName, COURSE.URL_PATH.ADMIN_USERCOUNSELLING_SCHEDULE_CREATE_COMPLETE_LIST,'Admin Counselling','Course Management');
		initializePermission($scope, $rootScope, $location, flash, $scope.package.featureName, MESSAGES);
		initializePagination($scope, $rootScope, $scope.SERVICE);

		/** Breadcrumb for creating counselling schedule 
		* @ Rajesh Feb 17, 2016
		**/
	    $scope.scheduleBreadcrumb = function(){
	    	$scope.breadCrumAdd("Create Schedule");
	    };
		/** Breadcrumb for editing counselling request 
		* @ Rajesh Feb 17, 2016
		**/
	    $scope.editRequestBreadcrumb = function(){
	    	$scope.breadCrumAdd("Edit Request");
	    };

	    $scope.scheduleHour = ['00','01','02','03','04','05','06','07','08','09','10','11','12','13','14','15','16','17','18','19','20','21','22','23'];
	    $scope.scheduleMin = ['00','15','30','45'];
	    $scope.intervalArray = ['15','30','45'];
		$scope.user = $rootScope.currentUser;
               
		/** On page load all the branches pertaining to the logged in user is loaded
		* @ Rajesh Feb 17, 2016
		**/
		$scope.loadBranch = function(){
		$scope.user = $rootScope.currentUser;
		$scope.userBranch = [];
			for (var i = 0; i < $scope.user.branch.length; i++) {
				$scope.userBranch.push($scope.user.branch[i]);
			}
		};


		/** Load course
		* @ Rajesh Feb 17, 2016
		**/
		$scope.loadCourse = function(branchId){
			var query = {};
            query.branchId = branchId;
			AdminCounsellingService.course.get(query, function (value) {
                $scope.branchCourse = value.course;
           });
		};
		
		/** On selecting branch all the mentor associated to that branch is loaded.
		* @ Rajesh Feb 17, 2016
		**/
		$scope.loadUser = function(branchIdUser){
			var query = {};
            query.branchIdUser = branchIdUser;
			AdminCounsellingService.user.query(query, function (value) {
				 $scope.branchUser = value;
           });
		};

		$scope.hourError = false;
		$scope.hourEqualError = false;
		$scope.intervalError = false;

		/** Create a counselling schedule
		* @ PARAMS: branchId, mentorId, counsellingDate, start and end time, interval, capacity and description
		* @ RETURNS: If successful, created schedule and success message else error message.
		* @ Rajesh Feb 17, 2016
		**/
		$scope.create = function(isValid){
			var start_total = ($scope.batchForm.start_hr * 60) + Number($scope.batchForm.start_min);
			var end_total = ($scope.batchForm.end_hr * 60) + Number($scope.batchForm.end_min);
			$scope.batchForm.start_total = start_total;
			$scope.batchForm.end_total = end_total;
	        $scope.startTime = $scope.batchForm.start_hr+":"+$scope.batchForm.start_min;
	        $scope.startSlot = '2015/01/01 ' + $scope.startTime;
	        $scope.endTime = $scope.batchForm.end_hr+":"+$scope.batchForm.end_min;
	        $scope.endSlot = '2015/01/01 ' + $scope.endTime;
	       	$scope.startSlot = new Date($scope.startSlot); 
	        $scope.endSlot = new Date($scope.endSlot);
	        $scope.intervalDifference = ((($scope.endSlot - $scope.startSlot)% 86400000) / 3600000)* 60;
		        if($scope.batchForm.interval > $scope.intervalDifference){
		        	$scope.intervalError = true;
					$timeout(function() {
			            $scope.intervalError = false;
			        	}, 4000);
					return;
		        }
		        if($scope.endSlot < $scope.startSlot){
	        		$scope.hourError = true;
					$timeout(function() {
		                $scope.hourError = false;
		            	}, 4000);
					return;
		        }
		        if($scope.endSlot.getTime() === $scope.startSlot.getTime()){
	        		$scope.hourEqualError = true;
					$timeout(function() {
		                $scope.hourEqualError = false;
		            	}, 4000);
					return;
		        }
	        $scope.difference = $scope.endSlot.getTime() - $scope.startSlot.getTime();
	        $scope.resultInMinutes = Math.round($scope.difference / 60000);
	        $scope.batchForm.individualInterval = $scope.batchForm.interval;
	        $scope.batchForm.initialIntervalAssigned = $scope.batchForm.interval;
	        $scope.batchForm.interval = $scope.resultInMinutes / $scope.batchForm.interval;
	        $scope.temp = [];
	        $scope.timeArray = [];
	        $scope.initialInterval = $scope.startTime;
	        $scope.temp.push($scope.startTime);
	        for (var j = 0; j < Math.round($scope.batchForm.interval); j++) {
	        	$scope.temp.push($scope.timeRange($scope.temp[j], $scope.batchForm.individualInterval));
	        }
	        for (var j = 0; j < Math.round($scope.batchForm.interval); j++) {
	        	$scope.timeArray.push({"slotTime":$scope.temp[j] + '-' + $scope.temp[j+1],"counter":0});
	        }
	        $scope.batchForm.interval = $scope.batchForm.initialIntervalAssigned;
			$scope.batchForm.slots = $scope.timeArray;
			if ($scope.writePermission) {
			if (isValid) {
		    		var scheduleCreate = new AdminCounsellingService.scheduleCreate($scope.batchForm);
	                scheduleCreate.$save(function (response) {
						flash.setMessage(MESSAGES.COUNSELLING_SCHEDULE_CREATE, MESSAGES.SUCCESS);
	                    $location.path(COURSE.URL_PATH.ADMIN_USERCOUNSELLING_SCHEDULE_CREATE_COMPLETE_LIST);
	                    $scope.batchForm = {};
	                }, function (error) {
	                    $scope.error = error;
	                    // console.log(error);
	                    for (var i = 0; i < $scope.error.data.length; i++) {
	                    	if($scope.error.data[i].param === 'mentorAssignedError'){
	                    		$scope.mentorServerError = true;
	                    	}
	                    }
	                });
	            } else{
	            	$scope.submitted = true;
	            }
	        } else {
	            flash.setMessage(MESSAGES.PERMISSION_DENIED, MESSAGES.ERROR);
	            $location.path(MESSAGES.DASHBOARD_URL);
	        }
		};

		/** Create HH and MM
		* @ PARAMS: time, miunutes to add
		* @ RETURNS: HH:MM
		* @ Rajesh Feb 17, 2016
		**/
		$scope.timeRange = function (time, minsToAdd) {
			function dateData(n){
				return (n<10? '0':'') + n;
			}
			var bits = time.split(':');
			var mins = bits[0]*60 + (+bits[1]) + (+minsToAdd);
			return dateData(mins%(24*60)/60 | 0) + ':' + dateData(mins%60);  
		};

		/** Change counselling status (Approved)
		* @ PARAMS: statusMessage, counsellingId
		* @ RETURNS: If success, status updated else error
		* @ Pradeep Feb 15, 2016 
		**/
		$scope.changeCounsellingStatus=function(changingstatus,counsellingid,counsellingrequest){
			var counselling={};
			if(counsellingrequest.mentorAssigned === undefined){
				$scope.mentorError = true;
	            $timeout(function() {
                	$scope.mentorError = false;
    			}, 6000);
	            return;
			}
			    counselling.status=changingstatus; 
			    counselling.counsellingid=counsellingid; 
                counselling.mentorAssigned=counsellingrequest.mentorAssigned;
                if ($scope.updatePermission) {
				  AdminCounsellingService.acceptcounselling.update(counselling,function(response){
		              counsellingrequest.status=changingstatus;
		               $location.path(COURSE.URL_PATH.ADMIN_USERCOUNSELLING_REQUEST_LIST);
		               flash.setMessage(MESSAGES.COUNSELLING_MENTOR_ASSIGNED, MESSAGES.SUCCESS);
				  }, function(error) {
		                console.log(error);
		            });  
			  	} else {
			        flash.setMessage(MESSAGES.PERMISSION_DENIED, MESSAGES.ERROR);
			        $location.path(MESSAGES.DASHBOARD_URL);
		        }
			
		};

		/** Change counselling status (Reject)
		* @ PARAMS: statusMessage, counsellingId
		* @ RETURNS: If success, status updated else error
		* @ Pradeep Feb 15, 2016 
		**/
		$scope.changeCounsellingStatusReject=function(changingstatus,counsellingid,counsellingrequest){
			var counselling={};
			    counselling.status=changingstatus; 
			    counselling.counsellingid=counsellingid; 
			    if ($scope.updatePermission) {
				  AdminCounsellingService.rejectcounselling.update(counselling,function(response){
	                  counsellingrequest.status=changingstatus;
					  flash.setMessage(MESSAGES.COUNSELLING_REQUEST_REJECTED, MESSAGES.SUCCESS);
				  }, function(error) {
	                    console.log(error);
	                });
				  } else {
			        flash.setMessage(MESSAGES.PERMISSION_DENIED, MESSAGES.ERROR);
			        $location.path(MESSAGES.DASHBOARD_URL);
		        }
			
		};

		/** Get mentor list
		* @ PARAMS: statusMessage, counsellingId
		* @ RETURNS: If success, status updated else error
		* @ Pradeep Feb 15, 2016 
		**/
		$scope.getMentorDetails=function(){
              $scope.counsellingDate = $scope.counsellingrequest.counsellingDate;
              $scope.counsellingSlot = $scope.counsellingrequest.counsellingSlot;
              $scope.branchId = $scope.counsellingrequest.branch._id;
              var mentordetails={};
                   mentordetails.counsellingDate=$scope.counsellingDate;
                   mentordetails.counsellingSlot=$scope.counsellingSlot
                   mentordetails.branchId=$scope.branchId;

                   AdminCounsellingService.fetchmentorcounsellingschedule.query(mentordetails,function(response){
                    $scope.mentordetails=response;
                   },function(error){
                      console.log(array);
                   });


		};

		$scope.scheduleeditdetail=function(){
            $scope.counsellingrequest = $rootScope.counsellingrequest;
            $scope.loadUser($scope.counsellingrequest.branch._id);
		};

		$scope.scheduleviewdetail=function(){
            $scope.counsellingrequestview = $rootScope.counsellingrequestview; 
		};

		$scope.updateSchedule=function(data){
              $rootScope.counsellingrequest = data; 
			  $location.path(COURSE.URL_PATH.ADMIN_USERCOUNSELLING_REQUEST_SCHEDULE_EDIT_DETAIL);

		};

		$scope.viewScheduleDetails=function(data){
              $rootScope.counsellingrequestview = data; 
			  $location.path(COURSE.URL_PATH.ADMIN_USERCOUNSELLING_REQUEST_SCHEDULE_VIEW_DETAIL);

		};

		$scope.cancelscheduleRequest=function(){
			  $location.path(COURSE.URL_PATH.ADMIN_USERCOUNSELLING_REQUEST_LIST);
		};

		/** Date validation
		* @ PARAMS: date
		* @ RETURNS: Error message if date is less than current date
		* @ Rajesh Feb 17, 2016
		**/
		$scope.checkError = function(start_date) {
			$scope.Lesserstartvalue = false;
			var curDate = new Date();
			$scope.callDate = start_date;
			if ($scope.callDate < curDate) {
			    $scope.Lesserstartvalue = true;
			    $timeout(function() {
			        $scope.Lesserstartvalue = false;
			    }, 6000);
			} else {
			    $scope.Lesserstartvalue = false;
			}
		};
		$scope.cancelSchedule=function(){
			  $location.path(COURSE.URL_PATH.ADMIN_USERCOUNSELLING_SCHEDULE_CREATE_COMPLETE_LIST);
		};
		$scope.serverError = function(){
			$scope.mentorServerError = false;
		};

});