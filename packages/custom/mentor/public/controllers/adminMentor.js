'use strict';

/* jshint -W098 */
var adminMentorApp = angular.module('mean.mentor');
adminMentorApp.controller('AdminsMentorController',
    function ($scope, $rootScope, $stateParams, Global, AdminsMentorService, MentorprojectService, MentorService, SkillService, $location, MENTOR, MESSAGES, flash, $uibModal) {
        $scope.global = Global;
        $scope.package = {
            name: 'mentor',
            modelName: 'Mentor'
        };

        $scope.MENTOR = MENTOR;
        $scope.MESSAGES = MESSAGES;
        $scope.SERVICE = AdminsMentorService;

        initializeBreadCrum($scope, $scope.package.modelName,'Mentor','Mentor Management');

        initializePagination($scope, $rootScope, $scope.SERVICE);

        initializeDeletePopup($scope, $scope.package.modelName, MESSAGES, $uibModal);
        //Bread Crumbs
        $scope.requestBreadcrumb = function () {
            $scope.breadCrumAdd("Detail");
        };

        $scope.feedbackBreadcrumb = function () {
            $scope.breadCrumAdd("Feedback");
        };
        $scope.associatedBreadcrumb = function () {
            $scope.breadCrumAdd("Associated Object");
        };

        $scope.statusArray = [ 'Accepted', 'Declined', 'Pending' ];

        $scope.periodArray = [ 'Full Time', 'Part Time' ];

        /***************************************************************************
         **************Load Mentor Requested list page with pagination**************
         ***************************************************************************/
        $scope.find = function (userStatus) {
            $scope.currentPage = 1;
            $scope.currentPageSize = 10;
            var query = {};
            query.page = $scope.currentPage;
            query.pageSize = $scope.currentPageSize;
            if (userStatus !== 'All') {
                query.userStatus = userStatus;
            }
            $scope.loadPagination(query);
            //$scope.breadCrumAdd("Detail");
            /*AdminsMentorService.page.query({}, function(mentors) {
             $scope.collection = mentors.collection;
             });*/
        };

        /***************************************************************************
         *****************************URL redirection*******************************
         ***************************************************************************/
        $scope.requestlist = function () {
            $location.path(MENTOR.URL_PATH.MENTOR_REQUEST_LIST);
        };
        $scope.mentorlist = function () {
            $location.path(MENTOR.URL_PATH.MENTOR_LIST);
        };
        $scope.feedback = function () {
            $location.path(MENTOR.URL_PATH.MENTOR_FEEDBACK);
        };
        $scope.ascobject = function () {
            $location.path(MENTOR.URL_PATH.MENTOR_ASSOCIATED_OBJECT);
        };
        $scope.projectlist = function () {
            $location.path(MENTOR.URL_PATH.PROJECTLIST);
        };

        /***************************************************************************
         ******************Confirming User for the post of Mentor*******************
         ***************************************************************************/
        $scope.confirmUserAsMentor = function (mentorRequestObj, status) {

            if (!mentorRequestObj.project) {
                mentorRequestObj.user_status = status;
                mentorRequestObj = new AdminsMentorService.confirmMentor(mentorRequestObj);
                mentorRequestObj.$update(function () {
                    console.log('mentor confirmed');
                }, function (error) {
                    $scope.error = error;
                });
            } else {
                if (status === 'Accepted') {
                    mentorRequestObj.project_status = 'Close';
                    mentorRequestObj.user_status = status;
                    if (!mentorRequestObj.updated) {
                        mentorRequestObj.updated = [];
                    }
                    mentorRequestObj.updated.push(new Date().getTime());

                    mentorRequestObj = new MentorprojectService.projectRequest(mentorRequestObj);
                    mentorRequestObj.$update(function () {
                        console.log('mentor confirmed for project');
                    }, function (error) {
                        $scope.error = error;
                    });
                } else {
                    mentorRequestObj.project_status = 'Close';
                    mentorRequestObj.user_status = status;
                    if (!mentorRequestObj.updated) {
                        mentorRequestObj.updated = [];
                    }
                    mentorRequestObj.updated.push(new Date().getTime());

                    mentorRequestObj = new MentorprojectService.declineProjectRequest(mentorRequestObj);
                    mentorRequestObj.$update(function () {
                        console.log('mentor confirmed for project');
                    }, function (error) {
                        $scope.error = error;
                    });
                }
            }
        };

        /***************************************************************************
         *****************Assign Online Test to selected Mentor*********************
         ***************************************************************************/
        $scope.testAssignment = function () {
            var url = MENTOR.URL_PATH.ADMIN_MENTOR_ONLINETEST.replace(':mentorRequestId', $scope.mentorRequest._id);
            $location.path(url);
        };

        /*
         * Load Skills
         */
        $scope.skillOnlineTest = function () {
            SkillService.skill.query(function (skills) {
                $scope.skills = skills;
            });
        };

        /*
         * Fetching online test based on skill set selected
         */
        $scope.listskill = function (skillId) {
            SkillService.onlineTest.query({
                skillId: skillId
            }, function (onlineTests) {
                $scope.onlineTests = onlineTests;
                for (var i = 0; i < $scope.onlineTests.length; i++) {
                    $scope.onlineTests[i].isChecked = false;
                }
            });
        };

        /*
         * selecting online test from the available tests
         */
        $scope.selectOnlineTests = [];
        $scope.onlineTestSelect = function (onlineTest) {
            $scope.selectOnlineTests.push(onlineTest);
        };

        /*
         * remove online test from the selected tests
         */
        $scope.onlineTestRemove = function (selectOnlineTest) {
            for (var i = 0; i < $scope.onlineTests.length; i++) {
                if (JSON.stringify($scope.onlineTests[i]._id) === JSON.stringify(selectOnlineTest._id)) {
                    var index = $scope.selectOnlineTests.indexOf(selectOnlineTest);
                    $scope.selectOnlineTests.splice(index, 1);
                    $scope.onlineTests[i].isChecked = false;
                }
            }
        };

        /*
         * Assign test to mentor
         */
        $scope.assignTest = function () {
            for (var i = 0; i < $scope.selectOnlineTests.length; i++) {
                delete $scope.selectOnlineTests[i].isChecked;
            }
            $scope.mentorRequest.onlineTest = $scope.selectOnlineTests;
            var mentorRequest = new AdminsMentorService.mentor($scope.mentorRequest);

            mentorRequest.$update(function (response) {
                $location.path(MENTOR.URL_PATH.MENTOR_REQUEST_LIST);
                //$scope.mentorRequest = {};
            }, function (error) {
                $scope.error = error;
            });
        };

        /***************************************************************************
         **********************Get Calender Date Difference*************************
         ***************************************************************************/
        // $scope.getDuration = function(start, end) {
        // try {
        // 		return ((moment.duration(end - start)).humanize());
        // 	} catch (e) {
        // 		return "Cant evaluate"
        // 	}
        // };
        /***************************************************************************
         *************************Load registered Mentor****************************
         ***************************************************************************/
        $scope.loadMentor = function () {
            var query = {};
            query.mentorRequestId = $stateParams.mentorRequestId;
            MentorService.mentorRequest.get(query, function (mentorRequest) {
                $scope.mentorRequest = mentorRequest;
                $scope.mentor = $scope.mentorRequest.user;
            });

        };

        /***************************************************************************
         **********************Accept or Decline the Mentorship*********************
         ***************************************************************************/
        $scope.acceptOrDecline = function (isValid, comments, status) {
            if (isValid) {
                $scope.mentorRequest.comments = comments;
                $scope.confirmUserAsMentor($scope.mentorRequest, status);
            }
            $location.path(MENTOR.URL_PATH.MENTOR_REQUEST_LIST);
        };
        /***************************************************************************
         ***********************Cancel the Test Assignment**************************
         ***************************************************************************/
        $scope.cancel = function () {
            var mentorurl = MENTOR.URL_PATH.MENTOR_INFO.replace(':mentorRequestId', $scope.mentorRequest._id);
            $location.path(mentorurl);
        };
    }
);
