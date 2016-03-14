'use strict';

/* jshint -W098 */
angular.module('mean.course').controller('CourseInstallmentController', 
		 function ($scope, $stateParams, Global,CourseInstallmentService,$location,$rootScope, COURSE,$translate) {
            $scope.global = Global;
	        $scope.package = {
	            name: 'course'
	        };
	        
	        $scope.COURSE = COURSE;
	        $scope.hasAuthorization = function (course) {
	            if (!course || !course.user) {
	                return false;
	            }
	            return MeanUser.isAdmin || course.user._id === MeanUser.user._id;
	        };
	       
	        
	        $scope.createUserCourse = function (isValid,courseId) {
	            if (isValid) {
	            	$scope.usercourse.course=courseId;
	            	console.log($scope.usercourse.course);
	            	var usercourse = new UserCourseService($scope.usercourse);
	            	console.log("in create");
	                usercourse.$save(function (response) {
	                    $location.path('/course/myCourses');
	                    $scope.usercourse = {};
	                });
	            }
	            else {
	                $scope.submitted = true;
	            }

	        };
              $scope.find = function () {
            	  
            	  CourseService.query(function (courses) {
	                $scope.courses = courses;
	                $scope.finduserCourse();
	                });
	        };
	        
	       
            $scope.finduserCourse = function () {
            	UserCourseService.query(function (userCourses) {
            		console.log("in findusercourse");
	                $scope.userCourses = userCourses;
	                console.log($scope.userCourses);

	            });
	        };
              

	        $scope.create = function (isValid) {
	            if (isValid) {
	                var course = new CourseInstallmentService($scope.course);
	                course.$save(function (response) {
	                    $location.path(COURSE.URL_PATH.ADMIN_COURSE_LIST);
	                    $scope.course = {};
	                });
	            }
	            else {
	                $scope.submitted = true;
	            }

	        };


	        $scope.remove = function (Course) {
	            if (Course) {
	            	Course.$remove(function (response) {
	                    for (var i in $scope.courses) {
	                        if ($scope.courses[i] === Course) {
	                            $scope.courses.splice(i, 1);
	                        }
	                    }
	                    $location.path(COURSE.URL_PATH.ADMIN_COURSE_LIST);
	                });
	            } else {
	                $scope.course.$remove(function (response) {
	                    $location.path(COURSE.URL_PATH.ADMIN_COURSE_LIST);
	                });
	            }
	        };

	        $scope.update = function (isValid) {
	            if (isValid) {
	                var course = $scope.course;
	                if (!course.updated) {
	                	course.updated = [];
	                }
	                course.updated.push(new Date().getTime());

	                course.$update(function () {
						$location.path(COURSE.URL_PATH.ADMIN_COURSE_LIST);
	                });
	            } else {
	                $scope.submitted = true;
	            }
	        };
	        $scope.findOne = function () {
	        	CourseService.get({
	        		courseId: $stateParams.courseId
	            }, function (course) {
	                $scope.course = course;
	            });
	        };
	       
	    });
	    