/** <Desc : Defined for the admin to create counselling checklist for a particular course>
     * @ PARAMS: <counsellingchecklist._id>, ...
     * @ RETURNS: <counsellingchecklist object>
     * @ <Sanjana> <01-mar-2016> <description of change>
     **/

'use strict';
/* jshint -W098 */
   angular.module('mean.course').controller('CourseCounsellingChecklistController',function($scope, Global, CourseCounsellingChecklistService, SkillService,$stateParams, PROFILE, flash, MESSAGES, $location,$rootScope, COURSE,$uibModal) {
					$scope.global = Global;
					$scope.SERVICE = CourseCounsellingChecklistService;
					$scope.COURSE = COURSE;
					$scope.MESSAGES = MESSAGES;

					$scope.package = {
						name : 'course',
						modelName : 'checklist',
						featureName : 'Counselling checklists'
					};

					initializeDeletePopup($scope, $scope.package.modelName,
							MESSAGES,$uibModal);
					initializeBreadCrum($scope, $scope.package.modelName,
							COURSE.URL_PATH.COUNSELLINGCHECKLIST.replace(':courseId', $stateParams.courseId));
					initializePagination($scope, $rootScope, $scope.SERVICE);
     				initializePermission($scope, $rootScope, $location, flash,
							$scope.package.featureName, MESSAGES);

     				/** <Desc : Defined for adding breadcrums in checklist create,edit,view and list pages>
     			     * @ PARAMS: <>, ...
     			     * @ RETURNS: <>
     			     * @ <Sanjana> <01-mar-2016> <description of change>
     			     **/
				    $scope.createCounsellingChecklist = function() {
						$scope.breadCrumAdd("Create");
					};

					$scope.EditCounsellingChecklist = function() {
						$scope.breadCrumAdd("Edit");
					};
					$scope.DetailChecklist = function() {
						$scope.breadCrumAdd("Detail");
					};

					/** <Desc : Defined for creating counselling checklist object and saving in coursecounsellingchecklist schema>
     			     * @ PARAMS: <course._id and counsellingchecklist._id>, ...
     			     * @ RETURNS: <counsellingchecklist object>
     			     * @ <Sanjana> <01-mar-2016> <description of change>
     			     **/
					$scope.create = function(isvalid) {
						if ($scope.writePermission) {
							if (isvalid) {
								$scope.counsellingchecklist.course = $stateParams.courseId;
								var counsellingchecklist = new CourseCounsellingChecklistService.courseCounsellingChecklist($scope.counsellingchecklist);
												    counsellingchecklist.$save({
													courseId :  $stateParams.courseId
													},function(response) {
												    flash.setMessage(MESSAGES.COUNSELLINGCHECKLIST_ADD_SUCESS,MESSAGES.SUCCESS);
													$location.path(COURSE.URL_PATH.COUNSELLINGCHECKLIST.replace(':courseId', $stateParams.courseId));
													$scope.counsellingchecklist = {};
												},
												function(error) {
													$scope.error = error;
												});
																							
							} else {
								$scope.submitted = true;
							}
						} else {
							flash.setMessage(MESSAGES.PERMISSION_DENIED,MESSAGES.ERROR);
							$location.path(MESSAGES.DASHBOARD_URL);
						};
						};


						/** <Desc : Defined for removing counselling checklist object from the coursecounsellingchecklist schema>
	     			     * @ PARAMS: <course._id and counsellingchecklist._id>, ...
	     			     * @ RETURNS: <counsellingchecklist object>
	     			     * @ <Sanjana> <01-mar-2016> <description of change>
	     			     **/

					    $scope.remove = function(CourseCounsellingChecklist) {
						     if (CourseCounsellingChecklist && $scope.deletePermission) {
							    if (CourseCounsellingChecklist) {
								var counsellingchecklist = new CourseCounsellingChecklistService.courseCounsellingChecklistEdit(CourseCounsellingChecklist);
								counsellingchecklist.$remove({
									courseId :$stateParams.courseId,
									courseCounsellingChecklistId : CourseCounsellingChecklist._id
								},function(response) {
											for ( var i in $scope.collection) {
												if ($scope.collection[i] === CourseCounsellingChecklist) {
													$scope.collection.splice(i,1);
												}
												$('#deletePopup').modal("hide");
												flash.setMessage(MESSAGES.COUNSELLINGCHECKLIST_DELETED_SUCESS,MESSAGES.SUCCESS);
												$location.path(COURSE.URL_PATH.COUNSELLINGCHECKLIST.replace(':courseId', $stateParams.courseId));
											}
										});
							}
						} else {
							flash.setMessage(MESSAGES.PERMISSION_DENIED,MESSAGES.ERROR);
							$location.path(MESSAGES.DASHBOARD_URL);
						}
					};


					/** <Desc : Defined for updating the counselling checklist object and saving the updated counsellingchecklist object in coursecounsellingchecklist schema>
     			     * @ PARAMS: <course._id and counsellingchecklist._id>, ...
     			     * @ RETURNS: < updated counsellingchecklist object>
     			     * @ <Sanjana> <01-mar-2016> <description of change>
     			     **/
					   $scope.update = function(isvalid,courseId) {
						 if ($scope.updatePermission) {
							    if (isvalid) {
								$scope.counsellingchecklist.course = $stateParams.courseId;
								var counsellingchecklist = $scope.counsellingchecklist;
								if (!counsellingchecklist.updated) {
									counsellingchecklist.updated = [];
								}
								counsellingchecklist.updated.push(new Date()
										.getTime());
								counsellingchecklist.$update({
												courseCounsellingChecklistId : $stateParams.checklistId,
												courseId :  $stateParams.courseId
										},function(){
				 	                             flash.setMessage(MESSAGES.COUNSELLINGCHECKLIST_UPDATE_SUCESS,MESSAGES.SUCCESS);
					 	                         $location.path(COURSE.URL_PATH.COUNSELLINGCHECKLIST.replace(':courseId', $stateParams.courseId));
				        },function(error) {
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

					/** <Desc : Defined for fetching a particular counselling checklist object from coursecounsellingchecklist schema>
     			     * @ PARAMS: <course._id and counsellingchecklist._id>, ...
     			     * @ RETURNS: <counsellingchecklist object>
     			     * @ <Sanjana> <01-mar-2016> <description of change>
     			     **/
					        $scope.findOne = function() {
							if ($scope.updatePermission) {
								CourseCounsellingChecklistService.courseCounsellingChecklistEdit.query({
								courseCounsellingChecklistId : $stateParams.checklistId,
								courseId :  $stateParams.courseId
							},  function(counsellingchecklist) {
								$scope.counsellingchecklist = counsellingchecklist;
							});
						    }   else {
                		        flash.setMessage(MESSAGES.PERMISSION_DENIED,MESSAGES.ERROR);
			                    $location.path(MESSAGES.DASHBOARD_URL);
						   }
					  };
					
					 /** <Desc : Adding multiple questions in create checklist html page>
				     * @ PARAMS: <questions>, ...
				     * @ RETURNS: <>
				     * @ <Sanjana> <01-mar-2016> <description of change>
				     **/
					 $scope.counsellingchecklist = {};
					 $scope.counsellingchecklist.questions = [{}];
					
	                 $scope.addChecklist = function() {
				     $scope.counsellingchecklist.questions.push({});
				    };
				    
				    /** <Desc : Removing particular question from the questions array >
				     * @ PARAMS: <questions>, ...
				     * @ RETURNS: <>
				     * @ <Sanjana> <01-mar-2016> <description of change>
				     **/
				    $scope.removeChecklist = function(counsellingchecklist,index) {
				    $scope.counsellingchecklist.questions.splice(index, 1);
				    };
				    
				    /** <Desc : Defined for redirecting to the list page on clicking the cancel button>
				     * @ PARAMS: <>, ...
				     * @ RETURNS: <>
				     * @ <Sanjana> <01-mar-2016> <description of change>
				     **/
				    $scope.cancelChecklist = function(){
				    $location.path(COURSE.URL_PATH.COUNSELLINGCHECKLIST.replace(':courseId', $stateParams.courseId));
				    };
				    
				    /** <Desc : Defined for redirecting to the create checklist page on clicking the new checklist button>
				     * @ PARAMS: <>, ...
				     * @ RETURNS: <>
				     * @ <Sanjana> <01-mar-2016> <description of change>
				     **/
				    $scope.newChecklist= function() {
				    $location.path(COURSE.URL_PATH.COUNSELLINGCHECKLISTCREATE.replace(':courseId', $stateParams.courseId));
				    };
				    
				    /** <Desc : Defined for redirecting to the edit checklist page on clicking the edit checklist button>
				     * @ PARAMS: <>, ...
				     * @ RETURNS: <>
				     * @ <Sanjana> <01-mar-2016> <description of change>
				     **/
				    	$scope.editChecklist = function(urlPath,obj) {
						urlPath = urlPath.replace(":checklistId",obj._id);
						urlPath = urlPath.replace(":questionsId", obj.questions._id);
						urlPath = urlPath.replace(":courseId", obj.course._id);
						$location.path(urlPath);
					};
					  /** <Desc : Defined for pagination i.e loading all the checklist based on the course id>
				     * @ PARAMS: <course._id>, ...
				     * @ RETURNS: <>
				     * @ <Sanjana> <01-mar-2016> <description of change>
				     **/
                	    $scope.find = function() {
		                var query = {};
		                query.page = 1;
		                query.pageSize = 10;
		                query.course = $stateParams.courseId;
		                $scope.loadPagination(query);
	                };
			 			     
                       /** <Desc : Defined for redirecting to the view checklist page on clicking the view checklist button>
						* @ PARAMS: <>, ...
					    * @ RETURNS: <>
						* @ <Sanjana> <01-mar-2016> <description of change>
						**/
                		$scope.viewChecklist = function(urlPath, obj) {
		                urlPath = urlPath.replace(":checklistId", obj._id);
		                urlPath = urlPath.replace(":questionsId",obj.questions._id);
		                urlPath = urlPath.replace(":courseId", obj.course._id);
		                $location.path(urlPath);
	                };
    
				});