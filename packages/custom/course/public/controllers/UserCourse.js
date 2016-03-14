'use strict';
/* jshint -W098 */
angular.module('mean.course').controller('UserCourseController', function($scope, $stateParams, Global, UserCourseService, $location, $rootScope,$translate) {
    $scope.global = Global;
    $scope.package = {
        name: 'course'
    };
    $scope.hasAuthorization = function(usercourse) {
        if (!usercourse || !usercourse.user) {
            return false;
        }
        return MeanUser.isAdmin || usercourse.user._id === MeanUser.user._id;
    };
    $scope.coursePayment = function() {
        $location.path('/course/payment');
    };
    $scope.courseCheckout = function() {
        $location.path('/course/test/redirect');
    };
    $scope.courseOnline = function() {
        $location.path('/student/onlinetest');
    };

    $scope.checked = false;
    $scope.ShowLoan = function() {
        $scope.checked = $scope.usercourse.payment_method;
    };
    $scope.createCourse = function(isValid, courseId, user) {
        if (isValid) {
            $scope.usercourse.course = courseId;
            $scope.usercourse.user = user;
            var usercourse = new UserCourseService($scope.usercourse);
            usercourse.$save(function(response) {
                $location.path('/course/myCourses');
                $scope.usercourse = {};
            });
        } else {
            $scope.submitted = true;
        }
    };
    $scope.remove = function(Usercourse) {
        if (Usercourse) {
            Usercourse.$remove(function(response) {
                for (var i in $scope.usercourses) {
                    if ($scope.usercourses[i] === UserCourse) {
                        $scope.usercourses.splice(i, 1);
                    }
                }
                $location.path(COURSE.URL_PATH.ADMIN_COURSE_LIST);
            });
        } else {
            $scope.usercourse.$remove(function(response) {
                $location.path(COURSE.URL_PATH.ADMIN_COURSE_LIST);
            });
        }
    };
    $scope.update = function(isValid) {
        if (isValid) {
            var usercourse = $scope.usercourse;
            if (!usercourse.updated) {
                usercourse.updated = [];
            }
            usercourse.updated.push(new Date().getTime());
            usercourse.$update(function() {
                $location.path(COURSE.URL_PATH.ADMIN_COURSE_LIST);
            });
        } else {
            $scope.submitted = true;
        }
    };
    $scope.findOne = function() {
        UserCourseService.get({
            usercourseId: $stateParams.usercourseId
        }, function(usercourse) {
            $scope.usercourse = usercourse;
        });
    };

    $scope.find = function() {
        UserCourseService.query(function(userCourses) {
            console.log("in findusercourse");
            $scope.userCourses = userCourses;
        });
    };
    $scope.selectLoanType = false;
    $scope.ShowLoanDetails = function() {
        console.log("in ShowLoanDetails");
        $scope.selectLoanType = $scope.usercourse.counselling;
    };

    $scope.loanApply = function() {
        $scope.loan = "Applied for loan successfully";
        $timeout(function() {
            $scope.loan = "";
        }, 3000);
    };
})
