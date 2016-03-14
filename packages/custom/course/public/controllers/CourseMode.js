'use strict';
/* jshint -W098 */
angular.module('mean.course').controller('CourseModeController', function($scope, $stateParams, Global, CourseModeService, $location, $rootScope,$translate) {
    $scope.global = Global;
    $scope.package = {
        name: 'course'
    };
    $scope.hasAuthorization = function(coursemode) {
        if (!coursemode || !coursemode.user) {
            return false;
        }
        return MeanUser.isAdmin || coursemode.user._id === MeanUser.user._id;
    };
    $scope.find = function() {
        CourseModeService.query(function(coursemodes) {
            $scope.coursemodes = coursemodes;
        });
    };
    $scope.create = function(isValid) {
        if (isValid) {
            var coursemode = new CourseModeService($scope.coursemode);
            coursemode.$save(function(response) {
                //$location.path('/course/myCourses');
                $scope.coursemode = {};
            });
        } else {
            $scope.submitted = true;
        }
    };
    $scope.remove = function(Course) {
        if (Course) {
            Course.$remove(function(response) {
                for (var i in $scope.courses) {
                    if ($scope.courses[i] === Course) {
                        $scope.courses.splice(i, 1);
                    }
                }
                $location.path(COURSE.URL_PATH.ADMIN_COURSE_LIST);
            });
        } else {
            $scope.course.$remove(function(response) {
                $location.path(COURSE.URL_PATH.ADMIN_COURSE_LIST);
            });
        }
    };
    $scope.update = function(isValid) {
        if (isValid) {
            var course = $scope.course;
            if (!course.updated) {
                course.updated = [];
            }
            course.updated.push(new Date().getTime());
            course.$update(function() {
                $location.path(COURSE.URL_PATH.ADMIN_COURSE_LIST);
            });
        } else {
            $scope.submitted = true;
        }
    };
    $scope.findOne = function() {
        CourseService.get({
            courseId: $stateParams.courseId
        }, function(course) {
            $scope.course = course;
        });
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
        $location.path('/admin/course/loans');
    };
    $scope.newCourse = function() {
        $location.path("/admin/course/course_create");
    };
    $scope.addSkillSet = function() {
        $scope.course.skillSets.push({});
    };
    $scope.removeSkillSet = function(skillSet) {
        var index = $scope.course.skillSets.indexOf(skillSet);
        $scope.course.skillSets.splice(index, 1);
    };
    $scope.createDiscount = function(discount) {
        $location.path('/admin/course/discount');
    };
    $scope.discountInit = function() {
        $scope.discounts = [];
        var discount = {};
        discount.studentPercentMarks = 95;
        discount.studentPercentDiscount = 10;
        $scope.discounts.push(discount);
        console.log($scope.discounts);
    };
    $scope.addNewDiscount = function() {
        var discount = {};
        discount.studentPercentMarks = $scope.discount.studentPercentMarks;
        discount.studentPercentDiscount = $scope.discount.studentPercentDiscount;
        if (discount.studentPercentMarks.length <= 0 || discount.studentPercentDiscount <= 0) return;
        $scope.discount.studentPercentMarks = undefined;
        $scope.discount.studentPercentDiscount = undefined;
        for (var i = 0; i < $scope.discounts.length; i++) {
            if ($scope.discounts[i].studentPercentMarks == discount.studentPercentMarks) return;
        }
        $scope.discounts.push(discount);
    };
    $scope.removeDiscount = function(marks) {
        for (var i = 0; i < $scope.discounts.length; i++) {
            if ($scope.discounts[i].studentPercentMarks == marks) {
                $scope.discounts.splice(i, 1);
            }
        }
    };
    $scope.emptyDiscounts = function() {
        if ($scope.discounts.length <= 0) return true;
        return false;
    };
})