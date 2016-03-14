'use strict';
/* jshint -W098 */
angular.module('mean.course').controller(
    'LessonController', function ($scope, Global, LessonService, $stateParams, PROFILE, flash, MESSAGES, $location, $rootScope, COURSE, $uibModal,$translate) {
        $scope.global = Global;
        // $scope.SERVICE = LessonService;
        $scope.PROFILE = PROFILE;
        $scope.COURSE = COURSE;
        $scope.package = {
            name: 'course',
            modelName: 'Lesson',
            // featureName : 'Lesson'
        };

        initializeDeletePopup($scope, $scope.package.modelName, MESSAGES, $uibModal);
        initializeBreadCrum($scope, $scope.package.modelName,COURSE.URL_PATH.COURSEMATERIALLESSONLIST,'Course Lesson','Course Management');

        // BreadCrumbs for Course lesson
        $scope.listLesson = function () {
            $scope.breadCrumAdd("List");
        };

        $scope.createLesson = function () {
            $scope.breadCrumAdd("Create");
        };

        $scope.EditLesson = function () {
            $scope.breadCrumAdd("Edit");
        };

        $scope.detailLesson = function () {
            $scope.breadCrumAdd("Details");
        };

        $scope.find = function () {
            $scope.chapterId = $stateParams.chapterId;
            $rootScope.chaterId = $scope.chapterId;
            LessonService.chapterLesson.query({
                chapterId: $stateParams.chapterId,
                courseId: $stateParams.courseId
            }, function (lessons) {
                $scope.lessons = lessons;
            });

            /*$scope.currentPage = 1;
             $scope.currentPageSize = 10;
             var query = {};
             query.page = $scope.currentPage;
             query.pageSize = $scope.currentPageSize;
             query.chapter = $stateParams.chaterId;
             $scope.loadPagination(query);*/
        };

        $scope.create = function (urlPath, isValid) {
            var chapterId = $scope.chapterId;
            if (isValid) {
                $scope.lesson.chapterId = $scope.chapterId;
                var lesson = new LessonService.chapterLesson($scope.lesson);
                lesson.$save(function (response) {
                    urlPath = urlPath.replace(":chapterId", chapterId);
                    $scope.lesson = {};
                }, function (error) {
                    $scope.error = error;
                });
            } else {
                $scope.submitted = true;
            }
        };

        $scope.remove = function (Lesson) {
            var chapterId = $scope.chapterId;
            if (Lesson) {
                Lesson = new LessonService.chapterLesson(Lesson);
                $scope.lesson.chapterId = $scope.chapterId;
                Lesson.$remove(function (response) {
                    for (var i in $scope.lessons) {
                        if ($scope.lessons[i] === Lesson) {
                            $scope.lessons.splice(i, 1);
                        }
                    }
                    $('#deletePopup').modal("hide");
                    flash.setMessage(MESSAGES.COURSEMATERIALCHAPTER_DELETE_SUCCESS,
                        MESSAGES.SUCCESS);
                });
            }
        };
        $scope.update = function (urlPath, isValid) {
            $scope.chapterId = $rootScope.chapterId;
            if (isValid) {
                var chapterId = $scope.chapterId;
                var lesson = new LessonService.lesson($scope.lesson);
                if (!lesson.updated) {
                    lesson.updated = [];
                }
                lesson.updated.push(new Date().getTime());
                lesson.$update({
                    lessonId: $stateParams.lessonId
                }, function () {
                    urlPath = urlPath.replace(":chapterId", chapterId);
                    $location.path(urlPath);
                }, function (error) {
                    $scope.error = error;
                });
            } else {
                $scope.submitted = true;
            }
        };
        $scope.findOne = function () {
            LessonService.lesson.get({
                lessonId: $stateParams.lessonId
            }, function (lesson) {
                $scope.lesson = lesson;
            });
        };

        // *********Cancel course lesson **********//
        $scope.cancelLesson = function (urlPath, chapterId) {
            urlPath = urlPath.replace(":chapterId", chapterId);
            $location.path(urlPath);
        };

        // *********Add new course lesson*********//
        $scope.newLesson = function () {
            // urlPath = urlPath.replace(":chapterId", $stateParams.chapterId);
            // $location.path(urlPath);
            $scope.editUrl(COURSE.URL_PATH.COURSEMATERIALLESSONCREATE, $stateParams.courseId, $stateParams.chapterId, null)
        };

        //**********cancel Edit***********//
        $scope.cancelEdit = function (urlPath, chapterId) {
            urlPath = urlPath.replace(":chapterId", chapterId._id);
            $location.path(urlPath);
        };

        $scope.redirectdashboard = function () {
            $location.path(PROFILE.URL_PATH.DASHBOARD);
        };
        /*$scope.lessonDetails = function(lesson) {
         $scope.lesson = lesson;
         $location.path('/admin/lesson/' + lesson._id
         + '/details');
         };*/

        $scope.editLesson = function (urlPath, id) {
            urlPath = urlPath.replace(":lessonId", id);
            $location.path(urlPath);
        };

        $scope.editUrl = function (urlPath, courseId, chapterId, lessonId) {
            if (courseId) {
                urlPath = urlPath.replace(':courseId', courseId);
            }
            if (chapterId) {
                urlPath = urlPath.replace(':chapterId', chapterId);
            }
            if (courseId) {
                urlPath = urlPath.replace(':lessonId', lessonId);
            }
            $location.path(urlPath);
        }

        $scope.topicList = function (urlPath, lesson) {
            $rootScope.lesson = lesson;
            urlPath = urlPath.replace(":lessonId", lesson._id);
            $location.path(urlPath);
        };
    });
