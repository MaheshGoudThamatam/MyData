'use strict';

/* jshint -W098 */
/** Name : Student Course  Controller
 * Description : This controller for load student list based on course, load student list based on batch			
 * @ <author> Abha Singh
 * @ <date> 17-Feb-2016
 * @ METHODS: batchBreadCrumAdd(),batchBreadCrumEdit(),listOfStudentsOnBatch(),studentBatchDetails(),editStudentBatch(),branchStudentCourse(),
 * loadStudentCourse(),selectedBranchStudent(),selectBranch(),selectBatch(),cancelStudentCourse(),updateStudentCourse(),redirectdashboard(),
 */
angular.module('mean.course').controller('StudentCourseController',
	function($scope, $rootScope, $stateParams, $location, Global, MeanUser, MESSAGES, flash, COURSE,CourseStudentService,AdminCourseRequestService,$translate) {
			$scope.global = Global;
			$scope.MESSAGES = MESSAGES;
			$scope.COURSE = COURSE;
			 $scope.SERVICE = CourseStudentService;
			$scope.package = {
				name : 'course',
	            modelName: 'Student Batch',
	           featureName: 'Student Batch '
			};
				
			$scope.user = MeanUser.user;
			$scope.batchSelectionCheck = true;
            initializeBreadCrum($scope, $scope.package.modelName,COURSE.URL_PATH.COURSE_LIST_STUDENT.replace(":courseId",$stateParams.courseId),'Course','Course Management');	
            initializePagination($scope, $rootScope, $scope.SERVICE);
            initializePermission($scope, $rootScope, $location, flash, 'Courses' ,MESSAGES);
            
            /**
             * List BreadCrum 
             * */
            $scope.batchBreadCrumAdd = function() {
				$scope.breadCrumAdd("list");
			};
			
			/**
             * Edit BreadCrum 
             * */
            $scope.batchBreadCrumEdit = function() {
				$scope.breadCrumAdd("Edit");
			};
			
			/**
			 * Laod Student list by batch
			 * */
			$scope.listOfStudentsOnBatch = function() {
		        $scope.currentPage = 1;
		        $scope.currentPageSize = 10;
		        var query = {};
		        query.page = $scope.currentPage;
		        query.pageSize = $scope.currentPageSize;
		        query.obj = {
		        		course : $stateParams.courseId,
		        		batch : $stateParams.batchId
		        	};
		        $scope.loadPagination(query);
		    };
		    
		    /**
		     * Redirect to student batch list page
		     * */
		    $scope.studentBatchDetails= function(course){
		    	 var urlPath = COURSE.URL_PATH.MYCOURSEDETAILS;
				 urlPath = urlPath.replace(":courseId", course._id);
				 $location.path(urlPath);
		    	
		    };
		    
		    /**
		     * Redirect to Edit page  
		     * */
		    $scope.editStudentBatch = function(batchstudntobj,course,batch,student){
		    	var urlPath = COURSE.URL_PATH.BATCH_EDIT_STUDENT;
		    	urlPath = urlPath.replace(":batchstudentId",batchstudntobj).replace(":courseId",course._id).replace(":batchId",batch._id).replace(":studentId",student._id);
		    	$location.path(urlPath);
		    };
		    	
		    /**
		     * Based on branch loading Batch
		     * */
		    $scope.branchStudentCourse = function(branchId){
		    	$scope.studentCourse.branch = branchId;
		        CourseStudentService.studentCourseBatch.query({
		    	courseId : $stateParams.courseId,
		    	branchId :branchId, 
	    	   }, function(batches){
	    		$scope.batches = batches;
	    	    });
		    };
		    
		    /**
		     * Loading Student Course and Admin branch
		     * */
		    $scope.loadStudentCourse = function(){
		    	CourseStudentService.studentCourse.query({
		    		courseId : $stateParams.courseId,
		    		batchId: $stateParams.batchId, 
		    		studentId : $stateParams.studentId
		    	 },function(studentCourse){
		    		$scope.studentCourse = studentCourse;
		    		$scope.branches = $scope.user.branch;
			    	$scope.selectedBranchStudent();
		    	});
		    };
		    
		    /**
		     * Checking student branch and Admin branch matching 
		     * */
		    $scope.selectedBranchStudent = function(){
		    	for(var i = 0; i <$scope.branches.length; i++){
	    			if(JSON.stringify($scope.studentCourse.branch._id) === JSON.stringify($scope.branches[i]._id)){
			    		$scope.branchStudentCourse($scope.branches[i]._id);
			    		$scope.branches[i].isBranchSelected = true;
			    		break;
			    	} else{
			    		$scope.branches[i].isBranchSelected = false;
			    	}
	    		}
		    };
 
		    /**
		     * Passing Selected Branch Id & calling branchStudentCourse() 
		     *
		     * */
			$scope.selectBranch = function(branchId){
		    	$scope.batchSelectionCheck = false;
		    	$scope.errorCheck = false;
		    	$scope.branchStudentCourse(branchId);
		    	$scope.studentCourse.branch = branchId;
		    	$scope.studentCourse.batch = ''; 
		    };
		    
		    /**
		     * Passing Selected Batch Id
		     * */
		    $scope.selectBatch = function(batchId){
		    	$scope.batchSelectionCheck = true;
		    	$scope.errorCheck = false;
		    	$scope.studentCourse.batch = batchId;
		    };
				
		    
           /**
		    * Cancel Student batch Edit function
		    * */
		       $scope.cancelStudentCourse = function(){
		    	   var urlPath =  COURSE.URL_PATH.BATCH_LIST_STUDENT;
		        	urlPath = urlPath.replace(":courseId",$stateParams.courseId).replace(":batchId",$stateParams.batchId);
		        	$location.path(urlPath);
		    	  
		       };
		    
		   /**
		    * Updating selected Branch and Batch
		    * */    
		    $scope.updateStudentCourse = function(isValid) {
		    	if($scope.batchSelectionCheck){
		    		$scope.errorCheck = false;
		    	} else {
		    		$scope.errorCheck = true;
		    	}
		    	if ($scope.updatePermission) {
		            if(isValid){
		 		    	$scope.courseStudent = {};
		 		    	$rootScope.courseRequest = {};
		 		    	$scope.courseStudent = $scope.studentCourse;
		 		    	var courseStudent = $scope.studentCourse;
		            	 var coursestudent = new AdminCourseRequestService.courseStudent(courseStudent);
		                 if (!coursestudent.updated) {
		                	 coursestudent.updated = [];
		                 }
		                 coursestudent.updated.push(new Date().getTime());
		                 coursestudent.$update({
		                	 studentCourseId: $stateParams.batchstudentId
		                     }, function (response) {
		                         flash.setMessage(MESSAGES.STUDENT_BATCH_UPDATE_SUCCESS, MESSAGES.SUCCESS);
		                      	var urlPath =  COURSE.URL_PATH.BATCH_LIST_STUDENT;
		    		        	urlPath = urlPath.replace(":courseId",$stateParams.courseId).replace(":batchId",response.batch);
		    		            $location.path(urlPath);
		                      }, function (error) {
		                         $scope.error = error;
				                  });
				    	  } else {
			                $scope.submitted = true;
			            }
					 } else {
					   flash.setMessage(MESSAGES.PERMISSION_DENIED,MESSAGES.ERROR);
					         $location.path(MESSAGES.DASHBOARD_URL);
					        }
		             };
                
		  /**
		   * Redirect to dashboard page
		   * */           
		  $scope.redirectdashboard = function() { 
				$location.path(PROFILE.URL_PATH.DASHBOARD);
			 };
	});