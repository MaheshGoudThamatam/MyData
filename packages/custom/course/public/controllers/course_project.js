'use strict';
/* jshint -W098 */
angular.module('mean.course').controller('CourseprojectController', function ($scope, Global, CourseprojectService, SkillService, $stateParams, PROFILE, flash, MESSAGES, $location, $rootScope, COURSE, $uibModal,$translate) {
    $scope.global = Global;
    $scope.SERVICE = CourseprojectService;
    $scope.courseproject = {};
    $scope.courseproject.requiredSkill = [
        {}
    ];
    $scope.courseproject.questionsfields = [
        {}
    ];
    $scope.PROFILE = PROFILE;
    $scope.COURSE = COURSE;
    $scope.MESSAGES = MESSAGES;

    $scope.package = {
        name: 'course',
        modelName: 'Courseproject',
        featureName: 'Course Projects'
    };

    initializeDeletePopup($scope, $scope.package.modelName, MESSAGES, $uibModal);
    initializeBreadCrum($scope, $scope.package.modelName, COURSE.URL_PATH.COURSEPROJECTLIST,'Course Project','Course Management');
    initializePagination($scope, $rootScope, $scope.SERVICE);
    initializePermission($scope, $rootScope, $location, flash,
        $scope.package.featureName, MESSAGES);

    $scope.componentLevel = [
        {
            option: "1",
            value: "1"
        },
        {
            option: "2",
            value: "2"
        },
        {
            option: "3",
            value: "3"
        },
        {
            option: "4",
            value: "4"
        }
    ];

    $scope.componentRewardPoint = [
        {
            option: "1",
            value: "1"
        },
        {
            option: "2",
            value: "2"
        },
        {
            option: "3",
            value: "3"
        },
        {
            option: "4",
            value: "4"
        }
    ];

    // BreadCrumbs for Course project
    $scope.createCourseproject = function () {
        $scope.breadCrumAdd("Create");
    };

    $scope.EditCourseproject = function () {
        $scope.breadCrumAdd("Edit");
    };

    $scope.detailCourseproject = function () {
        $scope.breadCrumAdd("Details");
    };

    $scope.create = function (isValid) {
        if ($scope.writePermission) {
            if (isValid) {
                var courseproject = new CourseprojectService.courseproject(
                    $scope.courseproject);
                courseproject
                    .$save(
                    function (response) {
                        flash.setMessage(
                            MESSAGES.COURSEPROJECT_ADD_SUCCESS,
                            MESSAGES.SUCCESS);
                        $location
                            .path(COURSE.URL_PATH.COURSEPROJECTLIST);
                        $scope.courseproject = {};
                    }, function (error) {
                        $scope.error = error;
                    });
            } else {
                $scope.submitted = true;
            }
        } else {
            flash.setMessage(MESSAGES.PERMISSION_DENIED,
                MESSAGES.ERROR);
            $location.path(MESSAGES.DASHBOARD_URL);
        }
    };

    $scope.remove = function (Courseproject) {
        if (Courseproject && $scope.deletePermission) {
            var courseproject = new CourseprojectService.courseproject(
                Courseproject);
            courseproject
                .$remove(function (response) {
                    for (var i in $scope.collection) {
                        if ($scope.collection[i] === Courseproject) {
                            $scope.collection.splice(i, 1);
                        }
                    }
                    $('#deletePopup').modal("hide");
                    flash.setMessage(
                        MESSAGES.COURSEPROJECT_DELETE_SUCCESS,
                        MESSAGES.SUCCESS);
                    $location
                        .path(COURSE.URL_PATH.COURSEPROJECTLIST);
                });
        } else {
            flash.setMessage(MESSAGES.PERMISSION_DENIED,
                MESSAGES.ERROR);
            $location.path(MESSAGES.DASHBOARD_URL);
        }
    };
    $scope.update = function (isValid) {
        if ($scope.updatePermission) {
            if (isValid) {
                var courseproject = $scope.courseproject;
                if (!courseproject.updated) {
                    courseproject.updated = [];
                }
                courseproject.updated
                    .push(new Date().getTime());

                courseproject
                    .$update(
                    function () {
                        flash.setMessage(
                            MESSAGES.COURSEPROJECT_UPDATE_SUCCESS,
                            MESSAGES.SUCCESS);
                        $location
                            .path(COURSE.URL_PATH.COURSEPROJECTLIST);
                    }, function (error) {
                        $scope.error = error;
                    });
            } else {
                $scope.submitted = true;
            }
        } else {
            flash.setMessage(MESSAGES.PERMISSION_DENIED,
                MESSAGES.ERROR);
            $location.path(MESSAGES.DASHBOARD_URL);
        }
    };
    $scope.findOne = function () {
        if ($scope.updatePermission) {
            CourseprojectService.courseproject.get({
                courseprojectId: $stateParams.courseprojectId
            }, function (courseproject) {
                $scope.courseproject = courseproject;
            });
        } else {
            flash.setMessage(MESSAGES.PERMISSION_DENIED,
                MESSAGES.ERROR);
            $location.path(MESSAGES.DASHBOARD_URL);
        }
    };

    // *********Cancel course project **********//
    $scope.cancelCourseproject = function () {
        $location.path(COURSE.URL_PATH.COURSEPROJECTLIST);
    };

    // *********Add new course project*********//
    $scope.newCourseproject = function () {
        $location.path(COURSE.URL_PATH.COURSEPROJECTCREATE);
    };

    // ************Required Skill**************//

    $scope.addRequiredSkill = function () {
        $scope.courseproject.requiredSkill.push({});
    };

    $scope.removeRequiredSkill = function (requiredSkill) {
        var index = $scope.courseproject.requiredSkill
            .indexOf(requiredSkill);
        $scope.courseproject.requiredSkill.splice(index, 1);
    };

    $scope.loadSkillList = function () {
        $scope.skillNames = [];
        SkillService.skill.query(function (skillList) {
            $scope.skillList = skillList;
        });
    };

    // ************Question**************//

    $scope.addQuestion = function () {
        $scope.courseproject.questionsfields.push({});
    };

    $scope.removeQuestion = function (question) {
        var index = $scope.courseproject.questionsfields
            .indexOf(question);
        $scope.courseproject.questionsfields.splice(index, 1);
    };

    $scope.redirectdashboard = function () {
        $location.path(PROFILE.URL_PATH.DASHBOARD);
    };
    $scope.courseprojectDetails = function (courseproject) {
        $scope.courseproject = courseproject;
        $location.path('/admin/courseproject/'
            + courseproject._id + '/details');
    };

    $scope.editCourseproject = function (urlPath, id) {
        urlPath = urlPath.replace(":courseprojectId", id);
        $location.path(urlPath);
    };

});