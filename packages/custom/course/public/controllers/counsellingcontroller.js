/** StudentCounsellingController
 * Student can apply for counselling
 * @ Rajesh - Feb 17, 2016
 **/

'use strict';

var CounsellingApp = angular.module('mean.course');
CounsellingApp.controller('StudentCounsellingController', function ($scope, $stateParams, Global, CourseService, UserCourseService, $location, $rootScope, $timeout, COURSE, CounsellingService, flash, MESSAGES, $uibModal, MeanUser,$translate) {
    $scope.global = Global;
    $scope.package = {
        name: 'counselling',
        modelName: 'Counselling',
        featureName: 'Student Counselling Request',
    };
    $scope.COURSE = COURSE;
    initializeBreadCrum($scope, $scope.package.modelName, COURSE.URL_PATH.STUDENT_COUNSELLING_REQUEST,'Counselling','Course Management');
    initializePermission($scope, $rootScope, $location, flash, $scope.package.featureName, MESSAGES);
    initializeDeletePopup($scope, $scope.package.modelName, MESSAGES, $uibModal);
    $scope.reqBreadcrumb = function () {
        $scope.breadCrumAdd("Request");
    };
    $scope.reqStatusBreadcrumb = function () {
        $scope.breadCrumAdd("Request Status");
    };

    $scope.date = new Date();
    $scope.options = {
        autoSelect: true,
        boundaryLinks: false,
        largeEditDialog: false,
        pageSelector: false,
        rowSelection: true
    };
    $scope.query = {
        order: 'status',
        limit: 10,
        page: 1
    };

    $scope.loadCourseBranch = function () {
        $scope.courseData = $stateParams.courseData;
        $scope.branchData = $stateParams.branchData;
    };
    $scope.user = $rootScope.currentUser;
    /**
     * Fullcalendar initialzation
     */
    $scope.loadCalendar = function () {
        var date = new Date();
        var d = date.getDate(),
            m = date.getMonth(),
            y = date.getFullYear();
        $('#calendar').html("");
        $('#calendar').fullCalendar({
            header: {
                left: 'prev,next today',
                center: 'title',
                right: ''
            },
            selectable: true,
            events: $scope.events,
            viewRender: function (view, element) {
                $(".fc-day").click(function () {
                    $scope.userClickedDate = $(this).attr("data-date");
                    $scope.datee = $scope.userClickedDate;
                });
            },
            dayClick: function (date) {
                $scope.datee = new Date($(this).attr("data-date"));
                $scope.eventDate = new Date($(this).attr("data-date"));
                $scope.eventDate = $(this).attr("data-date");
                $scope.courseData = $stateParams.courseData;
                $scope.branchData = $stateParams.branchData;
                $scope.fetchDateData($scope.datee, $scope.courseData, $scope.branchData);
            }


        });
    };

    $scope.noSchedule = false;
    $scope.selecDate = true;
    /**
     * Query modal
     */
    $scope.modalQuery = function (value, schedule) {
        $scope.slotSelected = value;
        $scope.reqObject.counsellingSlot = $scope.slotSelected;
        $scope.reqObject.counsellingDate = $scope.datee;
        $scope.reqObject.course = $scope.courseData;
        $scope.reqObject.branch = $scope.branchData;
        $scope.reqObject.studentName = MeanUser.user._id;
        $scope.reqObject.mentorAssigned = schedule.mentorAssigned;
        $rootScope.modalInstance = $uibModal.open({
            templateUrl: '/course/views/student_counselling_request_popup.html',
            controller: 'StudentCounsellingController',
            size: 'lg',
            resolve: {}
        });
        $rootScope.counsellingObject = $scope.reqObject;
    };

    $scope.cancel = function (modal) {
            modal.dismiss('cancel');
    };

    $scope.reqObject = {};
    $scope.requestObj = [];

    /**
     * Get request by userId
     */
    $scope.loadRequest = function () {
        var query = {};
        query.userId = $scope.user._id;
        CounsellingService.counsellingRequestUser.query(query, function (value) {
            $scope.requestData = value;
            $scope.count = $scope.requestData.length;
            var slot;
            for (var i = 0; i < $scope.requestData.length; i++) {
                slot = {};
                /**
                 * Required if any date issue
                 */
                // slot.counsellingDate = $scope.requestData[i].counsellingDate.slice(0,10);
                var cutoff = new Date($scope.requestData[i].counsellingDate);
                var modifieddate = new Date(cutoff.setHours(cutoff.getHours() - 24));
                var modifieddate = cutoff.toISOString();
                slot.counsellingDate = modifieddate;
                slot.counsellingSlot = $scope.requestData[i].counsellingSlot;
                slot.status = $scope.requestData[i].status;
                $scope.requestObj.push(slot);
            }
            ;
        });
    };

    $scope.dateeError = false;
    /**
     * Get slots available for selected date and branchId
     */
    $scope.fetchDateData = function (data, courseId, branchId) {
        $scope.dateServerError = false;
        if ($scope.readPermission) {
            CounsellingService.counsellingSlotRequest.query({data: data, courseId: courseId, branchId: branchId}, function (dateValue) {
                $scope.schedule = dateValue;
                for (var i = 0; i < $scope.schedule.length; i++) {
                    for (var j = 0; j < $scope.schedule[i].slots.length; j++) {
                        for (var k = 0; k < $scope.requestObj.length; k++) {
                            if ($scope.schedule[i].slots[j].slotTime === $scope.requestObj[k].counsellingSlot && $scope.schedule[i].callDate.substr(0, 10) === $scope.requestObj[k].counsellingDate.substr(0, 10)) {
                                $scope.schedule[i].slots[j].userTaken = true;
                                $scope.schedule[i].slots[j].statusTaken = $scope.requestObj[k].status;
                            }
                        }
                    }
                }
                if ($scope.schedule.length <= 0) {
                    $scope.noSchedule = true;
                    $scope.selecDate = false;
                }
                else {
                    $scope.selecDate = false;
                    $scope.noSchedule = false;
                    $scope.dateeError = true;
                }
            }, function (error) {
                $scope.error = error;
                for (var i = 0; i < $scope.error.data.length; i++) {
                    if ($scope.error.data[i].param === 'dateError') {
                        $scope.dateServerError = true;
                    }
                }
            });
        }
        else {
            flash.setMessage(MESSAGES.PERMISSION_DENIED, MESSAGES.ERROR);
            $location.path(MESSAGES.DASHBOARD_URL);
        }
    },

    /**
     * Create counselling request by userId
     */
        $scope.create = function (query) {
            $rootScope.counsellingObject.counsellingQuery = query;
            $scope.cancel($rootScope.modalInstance);
            if ($scope.writePermission) {
                    var counsellingDateRequest = new CounsellingService.counsellingDateRequest($rootScope.counsellingObject);
                    counsellingDateRequest.$save(function (response) {
                        if (MESSAGES.COUNSELLING_NOT_CLOSED.errorStatus === response.statusData) {
                            flash.setMessage(MESSAGES.COUNSELLING_NOT_CLOSED.errObj, MESSAGES.ERROR);
                        }
                        else {
                            $location.path(COURSE.URL_PATH.STUDENT_COUNSELLING_REQUEST_STATUS);
                            flash.setMessage(MESSAGES.COUNSELLING_REQUEST_RAISED, MESSAGES.SUCCESS);

                        }
                        $rootScope.counsellingObject = {};
                    }, function (error) {
                        $scope.error = error;
                    });
            } else {
                flash.setMessage(MESSAGES.PERMISSION_DENIED, MESSAGES.ERROR);
                $location.path(MESSAGES.DASHBOARD_URL);
            }
        },

    /**
     * Delete counselling request by userId
     */
        $scope.remove = function (Counselling) {
            if ($scope.deletePermission) {
                if (Counselling) {
                    var counsellingRequestDelete = new CounsellingService.counsellingRequestDelete(Counselling);
                    counsellingRequestDelete.$remove(function (response) {
                        for (var i in $scope.counselling) {
                            if ($scope.counselling[i] === Counselling) {
                                $scope.counselling.splice(i, 1);
                            }
                        }
                        deleteObjectFromArray($scope.requestData, Counselling);
                        $('#deletePopup').modal("hide");
                        flash.setMessage(MESSAGES.COUNSELLING_REQUEST_DELETE, MESSAGES.SUCCESS);
                        $location.path(COURSE.URL_PATH.STUDENT_COUNSELLING_REQUEST_STATUS);
                    });
                }
            } else {
                flash.setMessage(MESSAGES.PERMISSION_DENIED, MESSAGES.ERROR);
                $location.path(MESSAGES.DASHBOARD_URL);
            }
        };

});
