'use strict';
/* jshint -W098 */

angular.module('mean.course').controller('CourseController', function ($scope, $stateParams, Global, CourseService, UserCourseService, $location, $rootScope, $timeout, COURSE, SkillService, flash, MESSAGES, Upload, FranchiseService, BranchService,$cookies,MeanUser, CountryService, CourseBranchService, BATCHService, CourseTopicService,$uibModal,$translate){
    $scope.global = Global;
    $scope.package = {
        name: 'course',
        modelName: 'Course',
        featureName: 'Courses'
    };
    $scope.COURSE = COURSE;
    $scope.MESSAGES = MESSAGES;
    $scope.SERVICE = CourseService;
    $scope.courseTypeId = 0;
    $scope.costTypeId = 0;
    $scope.costType = false;
    $scope.courseType = false;
    $scope.thirdPartyCourseType = false;
    $scope.course = {};
    $scope.course.courseSkill = [];
    $scope.SERVICE = CourseService;
    
    initializeBreadCrum($scope, $scope.package.modelName, COURSE.URL_PATH.ADMIN_COURSE_LIST,"Course", "Course Management");
    initializePermission($scope, $rootScope, $location, flash, $scope.package.featureName, MESSAGES);
    initializePagination($scope, $rootScope, $scope.SERVICE);
    initializeDeletePopup($scope, $scope.package.modelName, MESSAGES,$uibModal);
    $scope.courseTypes = [{
        _id: '1',
        name: 'CodersTrust Course'
    }, {
        _id: '2',
        name: 'Franchise Course'
    }, {
        _id: '3',
        name: '3rd Party Course'
    }];   
  
  
// **************Upload Banner function************************

    $scope.onCourseBannerSelect = function (image) {
        if (angular.isArray(image)) {
            image = image[0];
        }
        // This is how I handle file types in client side
        if (image.type !== 'image/png' && image.type !== 'image/jpeg') {
            return;
        }
        
        $rootScope.$emit('processingContinue');
        $scope.upload = Upload.upload({
            url: '/api/courseimage/banner',
            method: 'POST',
            file: image
        }).progress(function (event) {
            $scope.uploadProgress = Math.floor(event.loaded /
                event.total);
            $scope.$apply();
        }).success(function (data, status, headers, config) {
            if (config) {
            }
            $scope.uploadInProgress = false;
            $timeout(function () {
                $scope.course.course_picture = data;
                $scope.course.thumbcourse_picture = data.thumbcourse_picture;
                $scope.course.thumb150course_picture = data.thumb150course_picture;
                flash.setMessage(MESSAGES.PROJECT_IMAGE_ADD, MESSAGES.SUCCESS);
            }, 3000);
        }).error(function (err) {
            $scope.uploadInProgress = false;
        });
    };

// ***************Upload Icon Function******************

    $scope.onCourseIconSelect = function (image) {
        if (angular.isArray(image)) {
            image = image[0];
        }
        // This is how I handle file types in client side
        if (image.type !== 'image/png' && image.type !== 'image/jpeg') {
            return;
        }
        $rootScope.$emit('processingContinue');
        $scope.upload = Upload.upload({
            url: '/api/courseimage/icon',
            method: 'POST',
            file: image
        }).progress(function (event) {
            $scope.uploadProgress = Math.floor(event.loaded /
                event.total);
            $scope.$apply();
        }).success(function (data, status, headers, config) {
            if (config) {
            }
            $scope.uploadInProgress = false;
            $timeout(function () {
                $scope.course.course_icon = data;
                $scope.course.thumbcourse_icon = data.thumbcourse_icon;
                $scope.course.thumb150course_icon = data.thumb150course_icon;
                flash.setMessage(MESSAGES.PROJECT_IMAGE_ADD, MESSAGES.SUCCESS);
            }, 3000);
        }).error(function (err) {
            $scope.uploadInProgress = false;
        });
    };

// **************BreadCrum Function***********        
        $scope.addCourseBreadcrumb = function(){
            $scope.breadCrumAdd("Create");
        };
        $scope.editCourseBreadcrumb = function(){
            $scope.breadCrumAdd("Edit");
        };
            $scope.courseDetailBreadcrumb = function(){
        $scope.breadCrumAdd("Details");
    };

// **************BreadCrum Function***********
    $scope.newCourseMaterialCancel = function() {
        $location.path(COURSE.ADMIN_COURSE_CREATE);
    };
    $scope.newCourseMaterial = function() {
        $location.path(COURSE.URL_PATH.ADMIN_COURSE_MATERIAL_CREATE);
    };
    $scope.newSession = function() {
        $location.path(COURSE.URL_PATH.ADMIN_COURSE_CURRICULUM_SESSION_CREATE);
    };
    $scope.newSessionCancel = function() {
        $location.path(COURSE.URL_PATH.ADMIN_COURSE_CURRICULUM_SESSION);
    };
    $scope.newTopic = function() {
        $location.path(COURSE.URL_PATH.ADMIN_COURSE_CURRICULUM_SESSION_TOPIC_CREATE);
    };
    $scope.newTopicCancel = function() {
        $location.path(COURSE.URL_PATH.ADMIN_COURSE_CURRICULUM_SESSION_TOPIC);
    };
    $scope.newCurriculum = function() {
        $location.path(COURSE.URL_PATH.ADMIN_COURSE_CURRICULUM_CREATE);
    };
  
    $scope.showDropDown = false;
    $rootScope.course = {};
    $rootScope.course.skill = [];
    $scope.selectedSkill = {};
    $scope.courseSelect = [true, false];
    $scope.hasAuthorization = function(course) {
        if (!course || !course.user) {
            return false;
        }
        return MeanUser.isAdmin || course.user._id === MeanUser.user._id;
    };
    $scope.highlight = function(index) {
        return $scope.courseSelect[index] ? 'select' : '';
    };
    $scope.myCourse = function() {
        $scope.courseSelect = [false, true];
    };
    $scope.selectedCourseType = function(id) {
        $scope.courseTypeId = id;
        if ($scope.courseTypeId == 1 || $scope.courseTypeId == 2) {
            $scope.courseType = true;
            $scope.thirdPartyCourseType = true;
        } else if ($scope.courseTypeId == 3) {
            $scope.courseType = true;
            $scope.thirdPartyCourseType = false;
        } else {
            $scope.courseType = false;
            $scope.thirdPartyCourseType = false;
        }
    };
    $scope.defaultCourseForm = function() {
        $scope.courseTypeId = 1;
        $scope.courseType = true;
    };
    $scope.selectedCostType = function() {
        $scope.costTypeId = 1;
        $scope.costType = true;
    };
    $scope.clicked = function() {
        $location.path(COURSE.URL_PATH.ADMIN_STUDENT_MANAGE);
    };
    $scope.showCourseDetails = function(course) {
        $rootScope.course = course;
        $location.path(COURSE.URL_PATH.COURSE_LIST_DETAILS);
    };
    $scope.courseEnrollment = function() {
        $location.path(COURSE.URL_PATH.COURSE_SELECTED);
    };
    $scope.curriculumDetails = function() {
        $location.path(COURSE.URL_PATH.COURSE_CURRICULUM);
    };
    $scope.Counselling = function() {
        $scope.counsellingmessage = "Request raised for counselling";
        $timeout(function() {
            $scope.counsellingmessage = "";
        }, 3000);
    };
    $scope.Counselling = function() {
        $scope.counsellingmessage = "Request raised for counselling";
        $timeout(function() {
            $scope.counsellingmessage = "";
        }, 3000);
    };
/*    $scope.find = function() {
       var query = {};
            query.page = 1;
            query.pageSize = 10;
            $scope.loadPagination(query);
    };*/

    $scope.showCourses = function() {
        $scope.find();
        $scope.finduserCourse();
    };
    $scope.finduserCourse = function() {
        UserCourseService.course.query(function(userCourses) {
            $scope.userCourses = userCourses;
        });
    };
    $scope.create = function(isValid) {
        if ($scope.writePermission) {
            if (isValid) {
                var course = new CourseService.course($scope.course);
                    course.$save(function (response) {
                        flash.setMessage(MESSAGES.COURSE_ADD_SUCCESS, MESSAGES.SUCCESS);
                        $location.path(COURSE.URL_PATH.ADMIN_COURSE_LIST);
                        $scope.course = {};
                    }, function (error) {
                        $scope.error = error;
                    });
            } else {
                $scope.submitted = true;
            }
        } else {
            flash.setMessage(MESSAGES.PERMISSION_DENIED, MESSAGES.ERROR);
            $location.path(MESSAGES.DASHBOARD_URL);
        }
    };

    $scope.remove = function (Course) {
        if($scope.deletePermission){
        if (Course) {
            var course = new CourseService.course(Course);
            course.$remove(function (response) {
                for (var i in $scope.courses) {
                    if ($scope.courses[i] === Course) {
                        $scope.courses.splice(i, 1);
                    }
                }
                deleteObjectFromArray($scope.collection, Course);
                $('#deletePopup').modal("hide");
                    flash.setMessage(MESSAGES.COURSE_DELETE_SUCCESS, MESSAGES.SUCCESS);
                    $location.path(COURSE.URL_PATH.ADMIN_COURSE_LIST);
                })
            };
        }else {
            flash.setMessage(MESSAGES.PERMISSION_DENIED, MESSAGES.ERROR);
            $location.path(MESSAGES.DASHBOARD_URL);
        }
    };

    $scope.update = function(isValid) {
        if ($scope.updatePermission) {
            if (isValid) {
                var course = new CourseService.course($scope.course);
                if (!course.updated) {
                    course.updated = [];
                }
                course.updated.push(new Date().getTime());
                course.$update({
                        courseId: $stateParams.courseId
                    }, function () {
                        flash.setMessage(MESSAGES.COURSE_UPDATE_SUCCESS, MESSAGES.SUCCESS);
                            $location.path(COURSE.URL_PATH.ADMIN_COURSE_LIST);
                    }, function (error) {
                        $scope.error = error;
                    });
            } else {
                $scope.submitted = true;
            }
        } else {
            flash.setMessage(MESSAGES.PERMISSION_DENIED, MESSAGES.ERROR);
            $location.path(MESSAGES.DASHBOARD_URL);
        }
    };

    $scope.findOne = function() {
        if ($scope.updatePermission || readPermission) {
            CourseService.course.get({
                courseId: $stateParams.courseId
            }, function(course) {
                $scope.course = course;
                if ($scope.course.publish == 'True'){
                    $scope.courseDisabled = "true";
                    $scope.Publish = "Published";
                }
                else{
                    $scope.Publish = "Publish";   
                }
            });
        } else {
            flash.setMessage(MESSAGES.PERMISSION_DENIED, MESSAGES.ERROR);
            $location.path(MESSAGES.DASHBOARD_URL);
        }
    };
    $scope.cancelCourse = function() {
        $location.path(COURSE.URL_PATH.ADMIN_COURSE_LIST);
    };
    $scope.addSkill = function() {
        $scope.showDropDown = true;
    };
    $scope.onSkillSetSelect = function() {
        $scope.showDropDown = false;
        $rootScope.course.skill.push($scope.selectedSkill);
        $scope.course.skill = $rootScope.course.skill;
    };
    $scope.cancelCreateLoan = function() {
        $location.path(COURSE.URL_PATH.ADMIN_COURSELOAN);
    };
    $scope.newCourse = function() {
        $location.path(COURSE.URL_PATH.ADMIN_COURSE_CREATE);
    };
    $scope.addSkillSets = function() {
        $scope.course.skillSets.push({});
    };
    $scope.removeSkillSet = function(skillSet) {
        var index = $scope.course.skillSets.indexOf(skillSet);
        $scope.course.skillSets.splice(index, 1);
    };
    $scope.newCourseLoan = function() {
        $location.path(COURSE.URL_PATH.ADMIN_COURSELOAN_CREATE);
    };
    $scope.course.onlineTests = [{}];
    $scope.addTetsSets = function(index) {
        var choice1 = {};
        $scope.course.onlineTests.push(choice1);
    };
    $scope.removeTetsSets = function(testIndex, index) {
        $scope.course.onlineTests.splice(index, 1);
    };

    $scope.loadcourse = function(){
        $scope.course.course_type = "CodersTrust Course";
    };

    // Add Skillset

     $scope.addSkillSet = function () {
        $scope.course.courseSkill.push({});
    };

    $scope.removeSkillsSet = function (skill) {
        var index = $scope.course.courseSkill.indexOf(skill);
        $scope.course.courseSkill.splice(index, 1);
    };

    $scope.setSkill = function(){
        if ($scope.course.courseSkill.length == 0){
            $scope.course.courseSkill = [
            {}
            ];
        }
    };
    $scope.loadSkill = function () {
        SkillService.skill.query(function (skills) {
            $scope.skills = skills;
        });
    };

    // ****************Delete popup function****************


    $scope.cancelDelete = function() {
        $('#deletePopup').modal("hide");
    };
     //****************** Edit Course ************************
    //******************Course constant function ************************
     $scope.editCourse = function (urlPath, id) {
        urlPath = urlPath.replace(":courseId", id);
        $location.path(urlPath);
    };

    //********************Load franchise or third party*******************
    $scope.loadFranchise = function () {
       FranchiseService.franchise.query(function (franchises) {
           $scope.franchises = [];
           if ($scope.course.course_type == "Franchise Course") {
               for (var i = 0; i < franchises.length; i++) {
                   if (franchises[i].franchise_type == "Franchise") {
                       $scope.franchises.push(franchises[i]);
                   }
               }
           } 
           else if($scope.course.course_type == "Third Party Course") {
               for (var i = 0; i < franchises.length; i++) {
                   if (franchises[i].franchise_type == "Third Party Provider") {
                       $scope.franchises.push(franchises[i]);
                   }

               }
           }


       });
   };
     $scope.batchList = function(urlPath, course) {
        if($rootScope.branchobj){
            delete $rootScope.branchobj;
        }
        $rootScope.courseobj = course;
        urlPath = urlPath.replace(":courseId", course._id);
        $location.path(urlPath);
    };
      

// ***************Branch & Country fetch list***************
    $scope.listBranches = function () {
        $scope.user = MeanUser.user;
            $scope.branches = $scope.user.branch;
    };

    $scope.listCountry = function () {
        $scope.user = MeanUser.user;
        $scope.countries = $scope.user.city;
    };


// ***************Branch & Country filter***************
    $scope.branchFilter = function (branchId, courseId) {
        $scope.branchId = branchId;
        $scope.courseId = courseId;
        $scope.paymentSchemes = [];
        var payments=[];
        var courseBatchList = [];
        $scope.courseBatchList = courseBatchList;
        $scope.payments = payments;
        $scope.branchObj = {};
        CourseBranchService.payment.query({courseId: $scope.courseId}, function (paymentSchemes) {
            $scope.paymentSchemes = paymentSchemes;
            BranchService.branch.get({branchId: branchId}, function (branch) {
                $scope.branchObj = branch;
                for (var i = 0; i <$scope.paymentSchemes.length; i++) {
                    if ($scope.paymentSchemes[i].branch == $scope.branchObj._id){
                        payments.push($scope.paymentSchemes[i]);
                    }
                }
            });
        });
        BATCHService.all.query(function (batch){
            $scope.batch = batch;
            for (var i = 0; i <$scope.batch.length; i++) {
                if ($scope.batch[i].branch == $scope.branchId && $scope.batch[i].course == $scope.courseId){
                    courseBatchList.push($scope.batch[i]);
                }
            }
        });
    };   

     $scope.countryFilter = function (countryId, courseId) {
        $scope.countryId = countryId;
        $scope.courseId = courseId;
        $scope.paymentSchemes = [];
        var payments=[];
        $scope.payments = payments;
        $scope.countryObj = {};
        CourseBranchService.payment.query({courseId: $scope.courseId}, function (paymentSchemes) {
            $scope.paymentSchemes = paymentSchemes;
            CountryService.country.get({countryId: countryId}, function (country) {
                $scope.countryObj = country;
                for (var i = 0; i <$scope.paymentSchemes.length; i++) {
                    if ($scope.paymentSchemes[i].country == $scope.countryObj._id){
                        payments.push($scope.paymentSchemes[i]);
                    }
                }
            });
        });
    };


    // **************Publish course globally function***************

    $scope.publish = function (){
            $scope.course.publish = 'True';
            var course = new CourseService.course($scope.course);
                if (!course.updated) {
                    course.updated = [];
                }
                course.$update({
                        courseId: $stateParams.courseId
                    }, function () {
                        flash.setMessage(MESSAGES.COURSE_PUBLISH_SUCCESS, MESSAGES.SUCCESS);
                            $location.path(COURSE.URL_PATH.ADMIN_COURSE_LIST);
                    }, function (error) {
                        $scope.error = error;
                    });
            };


// **************Load filter based on admin type***************

     $scope.loadFilter = function (){
                $scope.user = MeanUser.user;
                if($scope.user.branch.length > 0 && $scope.user.country.length == 0){
                    $scope.listBranches();
                    $scope.isBranchDropDown = true;
                    $scope.isCountryDropDown = false;
                }
                if($scope.user.country.length > 0){
                    $scope.listCountry();
                    $scope.isBranchDropDown = false;
                    $scope.isCountryDropDown = true;
                }
            }; 

    $scope.branch = function(){
        var courseBranch = [];
        $scope.courseBranch = courseBranch;
        $scope.courseId = $stateParams.courseId;
        BranchService.all.query(function (branch) {
            $scope.branchList = branch;
            for (var i = 0; i <$scope.branchList.length; i++) {
                for (var j = 0; j <$scope.branchList[i].course.length; j++) {
                        if ($scope.branchList[i].course[j]._id == $scope.courseId){
                            courseBranch.push($scope.branchList[i]);
                    }
                }
            }
        });
    };

// **************Fetch curriculum of course***************
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
   
    //*******curriculum of course*******
    
    $scope.redirectCurriculum = function(urlPath, course) {
        $rootScope.courseobj = course;
        urlPath = urlPath.replace(":courseId", course._id);
        $location.path(urlPath);
    };

    $scope. redirectCounsellingChecklist = function(urlPath, course) {
        $rootScope.courseobj = course;
        urlPath = urlPath.replace(":courseId", course._id);
        $location.path(urlPath);
    };
    /***
     * Load student list by course
     * */
    $scope.studentList = function(urlPath,course){
		 urlPath = urlPath.replace(":courseId", course._id);
		 $location.path(urlPath);
	};
     $scope.showDetails = function(urlPath, course) {
        $cookies.put('enrollCourseId', course._id);
        $rootScope.enrollCourseId = course._id;
        $rootScope.courseobj = course;
        urlPath = urlPath.replace(":courseId", course._id);
         $location.path(urlPath);
            };
});
