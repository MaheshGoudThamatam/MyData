'use strict';
/* jshint -W098 */
var studentApp = angular.module('mean.course')
studentApp.controller('CourseRequestController', ['$scope', '$rootScope', 'Global', 'SkillService', 'CourseRequestService', 'BRANCH', 'Upload', '$timeout', '$stateParams', '$location', 'MESSAGES', 'flash', 'COURSE', '$cookies', 'CourseService', 'MeanUser', 'BATCHService','CourseTopicService','CourseTestService','CourseprojectService','OnlinetestService','AdminCourseRequestService','$translate',
    function($scope, $rootScope, Global, SkillService, CourseRequestService, BRANCH, Upload, $timeout, $stateParams, $location, MESSAGES, flash, COURSE, $cookies, CourseService, MeanUser, BATCHService,CourseTopicService,CourseTestService,CourseprojectService,OnlinetestService, AdminCourseRequestService,$translate) {
        $scope.global = Global;
        $scope.package = {
        		name: 'course',
                modelName: 'Courses',
                featureName: 'Courses'
        };
        $scope.addressTypes = ['Permanent Address', 'Temporary Address', 'Office Address'];
        $scope.USER = MeanUser.user.name;
        $scope.MESSAGES = MESSAGES;
        $scope.COURSE = COURSE;
        $scope.SERVICE = CourseRequestService;
        initializePagination($scope, $rootScope, $scope.SERVICE);
        initializeBreadCrum($scope, $scope.package.modelName, COURSE.URL_PATH.COURSE_LIST,'Course Request','Course Management');
        $scope.find = function() {
            var query = {};
            query.page = 1;
            query.pageSize = 10;
            $scope.loadPagination(query);
        };
        $scope.setStudent = function() {
                if ($scope.student.address.length == 0) {
                    $scope.student.address = [{}];
                }
                if ($scope.student.qualification_details.length == 0) {
                    $scope.student.qualification_details = [{}];
                }
                if ($scope.student.experience_details.length == 0) {
                    $scope.student.experience_details = [{}];
                }
                if ($scope.student.additional_documents.length == 0) {
                    $scope.student.additional_documents = [{}];
                }
                if ($scope.student.references.length == 0) {
                    $scope.student.references = [{}];
                }
            }
            //***************Load registered Student***************//
        $scope.loadStudent = function() {
            var query = {};
            query.userId = $scope.student._id;
            CourseRequestService.user.get(query, function(student) {
                $scope.student = student;
                $scope.setStudent();
                /*for(var i = 0; i < $scope.mentor.address.length; i++){
                 Object.defineProperty($scope.mentor.address[i], 'addressType', {
                 writeable: true
                 });
                 }
                 for(var i = 0; i < $scope.mentor.qualification_details.length; i++){
                 Object.defineProperty($scope.mentor.qualification_details[i], 'grade_obtained', {
                 writeable: true
                 });
                 }*/
            });
        }
        $scope.documentDropdown = 'NA';
        $scope.loadTags = function($query) {
            return $scope.skillList.filter(function(skill) {
                return skill.name.toLowerCase().indexOf($query.toLowerCase()) != -1;
            });
        };
        $scope.loadSkills = function() {
            $scope.student = $rootScope.currentUser;
            $scope.loadStudent();
            $scope.skillNames = [];
            SkillService.skill.query(function(skillList) {
                $scope.skillList = skillList;
                for (var i = 0; i < $scope.skillList.length; i++) {
                    $scope.skillNames.push($scope.skillList[i].name);
                }
                $scope.breadCrumAdd("Detail");
            });
        };
        $scope.date = new Date();
        $scope.myDate = new Date();
        $scope.dates = [];
        var initDates = function() {
            var i;
            var d = new Date();
            var n = d.getFullYear();
            for (i = 1900; i <= n; i++) {
                $scope.dates.push(i);
            }
        };
        initDates();
        //***************Student Address***************//
        $scope.addAddress = function() {
            $scope.student.address.push({});
        };
        $scope.removeAddress = function(address) {
            var index = $scope.student.address.indexOf(address);
            $scope.student.address.splice(index, 1);
        };
        //***************Student Qualification***************//
        $scope.addQualification = function() {
            $scope.student.qualification_details.push({});
        };
        $scope.removeQualification = function(qualification) {
            var index = $scope.student.qualification_details.indexOf(qualification);
            $scope.student.qualification_details.splice(index, 1);
        };
        //***************Student Experience***************//
        $scope.addExperience = function() {
            $scope.student.experience_details.push({});
        };
        $scope.removeExperience = function(experience) {
            var index = $scope.student.experience_details.indexOf(experience);
            $scope.student.experience_details.splice(index, 1);
        };
        //***************Student Additional Doc***************//
        $scope.addDocument = function() {
            $scope.student.additional_documents.push({});
        };
        $scope.removeDocument = function(document) {
            var index = $scope.student.additional_documents.indexOf(document);
            $scope.student.additional_documents.splice(index, 1);
        };
        //***************Student Reference***************//
        $scope.addReference = function() {
            $scope.student.references.push({});
        };
        $scope.removeReference = function(reference) {
            var index = $scope.student.references.indexOf(reference);
            $scope.student.references.splice(index, 1);
        };
        //***************Document Dropdown***************//
        $scope.documentOtherSelected = [];
        $scope.selectPredefineDocument = function(index, value) {
            if (value == 'Others') {
                $scope.documentOtherSelected[index] = true;
            } else {
                $scope.documentOtherSelected[index] = false;
            }
        };
        $scope.documentOthers = [];
        $scope.selectOtherDocument = function(index, value) {
            //$scope.documentOthers[0] = value;
        };
        //***************Assign address type***************//
        $scope.assignAddressType = function(address, selectedAddressType) {
                student.addressType = selectedAddressType;
            }
            //***************Assign grade type***************//
        $scope.assignGradeType = function(qualification, selectedGradeType) {
                qualification.grade_obtained = selectedGradeType;
            }
            //***************Student Creation***************//
            //***************Document Upload***************//
        $scope.onFileSelectResume = function(file, index) {
                if (angular.isArray(file)) {
                    file = file[0];
                }
                if (file.type !== 'application/pdf' && file.type !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
                    flash.setMessage(MESSAGES.MENTOR_FILE_UPLOAD_ERROR, MESSAGES.ERROR);
                    return;
                }
                $rootScope.$emit('processingContinue');
                $scope.upload = Upload.upload({
                    url: '/api/mentorApply/Resume',
                    method: 'POST',
                    file: file
                }).progress(function(event) {
                    //$scope.uploadProgress = Math.floor(event.loaded / event.total);
                    // $scope.$apply();
                }).success(function(data, status, headers, config) {
                    if (config) {}
                    $scope.filePath = data;
                    $scope.uploadInProgress = false;
                    flash.setMessage(MESSAGES.MENTOR_FILE_UPLOAD_SUCCESS, MESSAGES.SUCCESS);
                    $scope.student.additional_documents[index].doc_file = $scope.filePath;
                }).error(function(err) {
                    console.log(err);
                    $scope.uploadInProgress = false;
                });
            },
            //***************Initialize Student***************//
            /* $scope.mentorProject = function () {

                                $scope.student = $rootScope.currentUser;
                                $scope.breadCrumAdd("Request Status");
                                // var mentorRequest = new MentorService.mentorRequestStatus();
                                MentorService.mentorRequestStatus.get({}, function (mentorRequestStatus) {
                                    $scope.mentorRequest = mentorRequestStatus;
                                });
                            };
                            $scope.check = function () {
                                flash.setMessage(MESSAGES.MENTOR_REQUEST_NO_DATA, MESSAGES.ERROR);
                            };
                        },*/
            $scope.loadPaymentScheme = function() {
                var userId = $scope.student._id;
                var courseId = $scope.course._id;
                CourseRequestService.courserequest.query({
                    userId: userId,
                    courseId: courseId
                }, function(paymentSchemes) {
                    $scope.paymentSchemes = paymentSchemes;
                });
            },
            $scope.courseRequest = function(paymentSchemeId) {
                var courseRequest = {};
                courseRequest.paymentscheme = paymentSchemeId;
                var courserequest = new CourseRequestService.courserequest(courseRequest);
                courserequest.$save(function(courseRequest) {
                    $scope.courseRequest = courseRequest;
                }, function(error) {
                    $scope.error = error;
                });
            },
            $scope.findOne = function() {
                $rootScope.courserequest = {};
                $scope.courseRequestsBasedonUsers($stateParams.courseId);
                CourseService.course.get({
                    courseId: $stateParams.courseId
                }, function(course) {
                    $scope.course = course;
                    $scope.branchesBasedOnCourse();
                });
            },
            $scope.showDetails = function(urlPath, course) {
                $cookies.put('enrollCourseId', course._id);
                $rootScope.enrollCourseId = course._id;
                $rootScope.courseobj = course;
                urlPath = urlPath.replace(":courseId", course._id);
                $location.path(urlPath);
            };
        $scope.branchesBasedOnCourse = function() {
            $scope.courseId = $stateParams.courseId;
            BATCHService.branchCourses.query({
                courseId: $scope.courseId
            }, function(branches) {
                $scope.branches = branches;
            });
        };
        $scope.courseDetailBreadcrumb = function() {
            $scope.breadCrumAdd("View");
        };
        $scope.createRequest = function(isValid) {
            $scope.addressError = false;
            var jj = 0;
            for (var j = 0; j < $scope.student.address.length; j++) {
                if ($scope.student.address[j].addressType === 'Permanent Address') {
                    jj = jj + 1;
                }
            }
            if (jj > 1) {
                $scope.addressError = true;
                flash.setMessage(MESSAGES.MENTOR_ADDRESS_ERROR, MESSAGES.ERROR);
            } else {
                $scope.addressError = false;
            }
            // if (isValid && $scope.filePath != null && !$scope.addressError) {
            if (isValid && !$scope.addressError) {
                $scope.student.form_submitted = "true";
                var student = new CourseRequestService.student($scope.student);
                student.$update(function(response) {
                    $scope.createCourseReq();
                    flash.setMessage(MESSAGES.MENTOR_REQUEST_SUCCESS, MESSAGES.SUCCESS);
                    $location.path('/profile/dashboard');
                    $scope.student = {};
                }, function(error) {
                    $scope.error = error;
                });
            } else {
                $scope.submitted = true;
            }
        };
        $scope.branchSelectedCourse = function(branchId){
        	$rootScope.courserequest.branch = branchId;
        	$scope.loadBatchesSpecificToBranch(branchId);
        };
        
        $scope.loadBatchesSpecificToBranch = function(branchId){
        	CourseRequestService.batch.query({
        		courseId: $scope.course._id,
        		branchId: branchId
        	}, function(batches){
        		$scope.batches = batches;
        	});
        };
        
        $scope.batchSelectedCourse = function(batch){
        	$rootScope.courserequest.batch = batch._id;
        	if(batch){
        	$scope.selectedbatch = batch;
        	}else{
        		$scope.selectedbatch = false;
        	}
        };
        
        $scope.loguser = function(urlPath, courseId) {
            $rootScope.courserequest.user_status = 'Pending';
            $rootScope.courserequest.course = courseId;
            $rootScope.courserequest.user = MeanUser.user._id;
            $rootScope.courserequest.branch = $scope.courserequest.branch;
            $rootScope.courserequest.batch = $rootScope.courserequest.batch;
            if (MeanUser.user._id && $scope.course.costType == 'Free') {
                if ($rootScope.courserequest.user_status = 'Pending') {
                    urlPath = urlPath.replace(":courseId", courseId);
                    $location.path(urlPath);
                }
            } else if (MeanUser.user._id && $scope.course.costType != 'Free') {
                urlPath = urlPath.replace(":courseId", courseId);
                $location.path(urlPath);
            } else {
                $location.path('/auth/login');
            }
        };
        $scope.createCourseReq = function() {
            var courserequests = $rootScope.courserequest;
            var courserequest = new CourseRequestService.courserequest(courserequests);
            courserequest.$save({
                courseId: $rootScope.courserequest.course
            }, function(response) {
                flash.setMessage(MESSAGES.COURSE_REQ_SUCCESS, MESSAGES.SUCCESS);
                $location.path(COURSE.URL_PATH.COURSE_LIST);
                $scope.courserequest = {};
            });
        };
        //**********Course Payment Redirection***************//
        $scope.findCoursePaymentSchema = function() {
        	$scope.branchObjId = $rootScope.courserequest.branch;
            CourseRequestService.coursePayment.query({
                courseId: $stateParams.courseId,
                branchId: $scope.branchObjId
            }, function(paymentSchemes) {
                $scope.paymentSchemes = paymentSchemes;
              });
        };
        $scope.createCoursepayment = function() {
            $scope.breadCrumAdd("Course Details");
        };
        $scope.coursePaymentScheme = function(paymentScheme) {
            $rootScope.courserequest.paymentscheme = paymentScheme._id;
        };
        $scope.coursePaymentRedirect = function() {
            if (MeanUser.user.form_submitted != true) {
                $location.path(COURSE.URL_PATH.STUDENTDETAILS);
            } else {
                $scope.createCourseReq();
            }
        };
      
       $scope.availablecourse = function () {
        	$scope.breadCrumAdd('List');
        };
        //*************Course Curriculum****************************//
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
		  
         $scope.courseRequestsBasedonUsers = function(courseID) {
            $scope.found = true;
            $scope.requestStatus = 'Pending';
        $scope.userId = MeanUser.user._id;
        CourseRequestService.courseRequests.query({
            userId: $scope.userId
        }, function(courseRequests) {
            $scope.courseRequests = courseRequests;
            for(var i=0; i<courseRequests.length;i++){
                if(courseRequests[i].course._id == courseID){
                    $scope.requestStatus = courseRequests[i].user_status;
                    if(($scope.requestStatus == 'Pending')||($scope.requestStatus == 'Accepted')){
                    $scope.found = false;
                    }
                }
            }
        });
    };

    $scope.showCourseRequestDetails = function (urlPath,id) 
    {
    	 urlPath = urlPath.replace(":courseRequestId", id);
         $location.path(urlPath);
     };
     
    $scope.counselling = function(urlPath){
        $scope.courseData = $stateParams.courseId;
        $scope.branchData = $rootScope.courserequest.branch;
        urlPath = urlPath.replace(":courseData", $scope.courseData);
        urlPath = urlPath.replace(":branchData", $scope.branchData);
        $location.path(urlPath);
    };

    
    $scope.courseCurriculumTest=function(){
    	CourseRequestService.courseTest.query({
    		courseId: $stateParams.courseId
        }, function(onlintests) {
            $scope.onlintests = onlintests;
            $scope.courseonline = [];
            for(var i=0;i<=$scope.onlintests.length;i++){
            	if($scope.onlintests[i].test){
            		$scope.courseonline.push($scope.onlintests[i]);
            	}
            	
            }          
        });
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
    
   //*****************check discount length of payment Scheme*********************// 
    $scope.checkLength = function(disLength) {
		$scope.disLength = disLength + 2;
		return $scope.disLength;
	}
    }

]);
//***************Phone Number Validation***************//
studentApp.directive('input', function() {
    return {
        restrict: 'E',
        require: '?ngModel',
        link: function(scope, elm, attr, ctrl) {
            if (!ctrl) {
                return;
            }
            if (attr.type == 'text' && attr.ngPattern === '/[0-9]/') {
                elm.bind('keyup', function() {
                    var text = this.value;
                    this.value = text.replace(/[a-zA-Z]/g, '');
                });
            }
        }
    }
});
studentApp.directive('input', function() {
    return {
        restrict: 'E',
        require: '?ngModel',
        link: function(scope, elm, attr, ctrl) {
            if (!ctrl) {
                return;
            }
            if (attr.type == 'text' && attr.ngPattern === '/[a-zA-Z]+/g') {
                elm.bind('keyup', function() {
                    var text = this.value;
                    this.value = text.replace(/[^a-zA-Z\s]/g, '');
                });
            }
        }
    }
});
studentApp.directive("formatDate", function() {
    return {
        require: 'ngModel',
        link: function(scope, elem, attr, dateCtrl) {
            dateCtrl.$formatters.push(function(dateValue) {
                return new Date(dateValue);
            })
        }
    }
});
