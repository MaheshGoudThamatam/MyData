'use strict';
/* jshint -W098 */
angular.module('mean.course').controller(
    'TopicController', function ($scope, Global, TopicService, $stateParams, PROFILE, flash, MESSAGES, $location, $rootScope, COURSE, $uibModal,$translate) {
        $scope.global = Global;
        // $scope.SERVICE = TopicService;
        $scope.PROFILE = PROFILE;
        $scope.COURSE = COURSE;
        $scope.package = {
            name: 'course',
            modelName: 'Topic',
            // featureName : 'Topic'
        };

        initializeDeletePopup($scope, $scope.package.modelName, MESSAGES, $uibModal);
        initializeBreadCrum($scope, $scope.package.modelName,COURSE.URL_PATH.COURSEMATERIALTOPICLIST,'Course Topic','Course Management');

        // BreadCrumbs for Course topic
        $scope.listTopic = function () {
            $scope.breadCrumAdd("List");
        };

        $scope.createTopic = function () {
            $scope.breadCrumAdd("Create");
        };

        $scope.EditTopic = function () {
            $scope.breadCrumAdd("Edit");
        };

        $scope.detailTopic = function () {
            $scope.breadCrumAdd("Details");
        };

        $scope.find = function () {
            $scope.chapterId = $stateParams.chapterId;
            console.log($scope.chapterId);
            $rootScope.chaterId = $scope.chapterId;
            LessonService.chapterLesson.query({chapterId: $scope.chapterId}, function (lessons) {
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
        $scope.cancelTopic = function (urlPath, lessonId) {
            urlPath = urlPath.replace(":lessonId", lessonId);
            $location.path(urlPath);
        };

        // *********Add new course lesson*********//
        $scope.newTopic = function (urlPath, lessonId) {
            $scope.lessonId = $rootScope.lessonId;
            urlPath = urlPath.replace(":lessonId", lessonId);
            $location.path(urlPath);
        };

        //**********cancel Edit***********//
        $scope.cancelEdit = function (urlPath, chapterId) {
            urlPath = urlPath.replace(":lessonId", lessonId._id);
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

        $scope.editTopic = function (urlPath, id) {
            urlPath = urlPath.replace(":topicId", id);
            $location.path(urlPath);
        };

        $scope.subtopicList = function (urlPath, lesson) {
            $rootScope.lesson = lesson;
            urlPath = urlPath.replace(":lessonId", lesson._id);
            $location.path(urlPath);
        };
    });