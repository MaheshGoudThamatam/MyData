'use strict';
/* jshint -W098 */
angular.module('mean.mentor').controller('MentorProjectController',
    function ($scope, Global, MentorprojectService, $stateParams, $location, $rootScope, SkillService, Upload, $timeout, MENTOR, PROFILE, MESSAGES, flash, AdminsMentorService, $uibModal) {
        $scope.global = Global;
        $scope.PROFILE = PROFILE;
        $scope.mentorproject = {};
        $scope.MESSAGES = MESSAGES;
        $scope.package = {
            name: 'mentorproject',
            modelName: 'Mentor Project',
            featureName: 'Mentor Projects'
        };
        $scope.SERVICE = MentorprojectService;
        $scope.MENTOR = MENTOR;
        initializeBreadCrum($scope, $scope.package.modelName, MENTOR.URL_PATH.PROJECTLIST,'Mentor Project','Mentor Management');
        initializeDeletePopup($scope, $scope.package.modelName, MESSAGES, $uibModal);

        initializePermission($scope, $rootScope, $location, flash, $scope.package.featureName, MESSAGES);

        initializePagination($scope, $rootScope, $scope.SERVICE);
        $scope.createBreadcrumb = function () {
            $scope.breadCrumAdd("Create");
        };

        $scope.editBreadcrumb = function () {
            $scope.breadCrumAdd("Edit");
        };


        $scope.requestBreadcrumb = function () {
            $scope.breadCrumAdd("Detail");
        };

        $scope.detailBreadcrumb = function () {
            $scope.breadCrumAdd("Project Detail");
        };


        $scope.hasAuthorization = function (mentorproject) {
            if (!mentorproject || !mentorproject.user) {
                return false;
            }
            return MeanUser.isAdmin || mentorproject.user._id === MeanUser.user._id;
        };

        $scope.onFileSelect = function (image) {
            if (angular.isArray(image)) {
                image = image[0];
            }
            // This is how I handle file types in client side
            if (image.type !== 'image/png' && image.type !== 'image/jpeg') {
                alert('Only PNG and JPEG are accepted.');
                return;
            }
            $scope.upload = Upload.upload({
                url: '/api/mentorproject/taskImage',
                method: 'POST',
                file: image
            }).progress(function (event) {
            }).success(function (data, status, headers, config) {
                // flash.setMessage(MESSAGES.PROJECT_IMAGE_ADD, MESSAGES.SUCCESS);
                if (config) {
                }
                $scope.filePath = data;
                $scope.uploadInProgress = false;
                // console.log(mentorproject.taskImage);
                // console.log(mentorproject.taskImage);
                $timeout(function () {
                    $scope.mentorproject.taskImage = data;
                    flash.setMessage(MESSAGES.PROJECT_IMAGE_ADD, MESSAGES.SUCCESS);
                }, 3000);
            }).error(function (err) {
                $scope.uploadInProgress = false;
            });
        };
        $scope.loadTags = function ($query) {
            return $scope.skillList.filter(function (skill) {
                return skill.name.toLowerCase().indexOf($query.toLowerCase()) != -1;
            });
        };
        $scope.loadSkills = function () {
            if ($scope.writePermission) {
                $scope.skillNames = [];
                SkillService.skill.query(function (skillList) {
                    $scope.skillList = skillList;
                    for (var i = 0; i < $scope.skillList.length; i++) {
                        $scope.skillNames.push($scope.skillList[i].name);
                    }
                    //$scope.breadCrumAdd("Create");
                });
            } else {
                flash.setMessage(MESSAGES.PERMISSION_DENIED, MESSAGES.ERROR);
                $location.path(MESSAGES.DASHBOARD_URL);
            }
        };


        // Find task
        $scope.find = function () {
            var query = {};
            query.page = 1;
            query.pageSize = 10;
            $scope.loadPagination(query);
            $scope.breadCrumAdd("List");
        };

// Create task
        $scope.create = function (isValid) {
            if ($scope.writePermission) {
                if (isValid && $scope.filePath != null) {
                    $scope.mentorproject.taskImage = $scope.filePath;
                    var mentorproject = new MentorprojectService.task($scope.mentorproject);
                    mentorproject.$save(function (response) {
                        flash.setMessage(MESSAGES.MENTOR_PROJECT_ADD_SUCCESS, MESSAGES.SUCCESS);
                        $location.path(MENTOR.URL_PATH.PROJECTLIST);
                        $scope.mentorproject = {};
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

// Remove task
        $scope.remove = function (Mentorproject) {
            if ($scope.deletePermission) {
                if (Mentorproject) {
                    var mentorproject = new MentorprojectService.task(Mentorproject);
                    mentorproject.$remove(function (response) {
                        for (var i in $scope.mentorprojects) {
                            if ($scope.mentorprojects[i] === Mentorproject) {
                                $scope.mentorprojects.splice(i, 1);
                            }
                        }
                        $('#deletePopup').modal("hide");
                        deleteObjectFromArray($scope.collection, Mentorproject);
                        flash.setMessage(MESSAGES.MENTOR_PROJECT_DELETE_SUCCESS, MESSAGES.SUCCESS);
                    })
                }
                ;
            } else {
                flash.setMessage(MESSAGES.PERMISSION_DENIED, MESSAGES.ERROR);
                $location.path(MESSAGES.DASHBOARD_URL);
            }
        };

        // Update task
        $scope.update = function (isValid) {
            if ($scope.updatePermission) {
                if (isValid) {
                    var mentorproject = $scope.mentorproject;
                    if (!mentorproject.updated) {
                        mentorproject.updated = [];
                    }
                    mentorproject.updated.push(new Date().getTime());
                    mentorproject.$update(function () {
                        flash.setMessage(MESSAGES.MENTOR_PROJECT_UPDATE_SUCCESS, MESSAGES.SUCCESS);
                        $location.path(MENTOR.URL_PATH.PROJECTLIST);
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
        $scope.findOne = function () {
            if ($scope.updatePermission) {
                MentorprojectService.task.get({
                    mentorprojectId: $stateParams.mentorprojectId
                }, function (mentorproject) {
                    $scope.mentorproject = mentorproject;
                });
            } else {
                flash.setMessage(MESSAGES.PERMISSION_DENIED, MESSAGES.ERROR);
                $location.path(MESSAGES.DASHBOARD_URL);
            }
        };
        $scope.cancelTask = function () {
            $location.path(MENTOR.URL_PATH.PROJECTLIST);
        };
        $scope.newTask = function () {
            $location.path(MENTOR.URL_PATH.CREATEPROJECT);
        };
        $scope.cancelDelete = function () {
            $('#deletePopup').modal("hide");
        };
        $scope.redirectdashboard = function () {
            $location.path(PROFILE.URL_PATH.DASHBOARD);
        };
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
        $scope.cancelProject = function () {
            $location.path('/mentorship');
        };
        /***************************************************************************
         ***********Load Mentor to a specific Project based on its status***********
         ***************************************************************************/
        $scope.loadMentorsBasedOnMentorStatus = function (mentorStatus) {
            $scope.breadCrumAdd("Detail");
            $scope.currentPage = 1;
            $scope.currentPageSize = 10;
            var query = {};
            query.mentorProjectId = $stateParams.mentorprojectId;
            if (mentorStatus !== 'All') {
                query.status = mentorStatus
            }
            query.page = $scope.currentPage;
            query.pageSize = $scope.currentPageSize;
            $scope.loadPagination(query);
        };
        /***************************************************************************
         ********************Confirm Mentor for particular project******************
         ***************************************************************************/
        $scope.confirmMentorProject = function (projectRequestObj) {
            projectRequestObj.project_status = 'Close';
            projectRequestObj.user_status = 'Accepted';
            if (!projectRequestObj.updated) {
                projectRequestObj.updated = [];
            }
            projectRequestObj.updated.push(new Date().getTime());
            projectRequestObj.projectRequest.$update(function () {
                console.log('mentor confirmed for project');
            }, function (error) {
                $scope.error = error;
            });
        };
        $scope.confirmUserAsMentor = function (mentorRequestObj, status) {
            if (!mentorRequestObj.project) {
                mentorRequestObj.user_status = status;
                mentorRequestObj = new AdminsMentorService.confirmMentor(mentorRequestObj);
                mentorRequestObj.$update(function () {
                    console.log('mentor confirmed');
                    flash.setMessage(MESSAGES.MENTOR_PROJECT_SUCCESS, MESSAGES.SUCCESS);
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
                        flash.setMessage(MESSAGES.MENTOR_PROJECT_SUCCESS, MESSAGES.SUCCESS);
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
                        flash.setMessage(MESSAGES.MENTOR_PROJECT_SUCCESS, MESSAGES.SUCCESS);
                    }, function (error) {
                        $scope.error = error;
                    });
                }
            }
        };

        // ***************Update Mentor Project******************
        $scope.editMentorProject = function (urlPath, id) {
            urlPath = urlPath.replace(":mentorprojectId", id);
            $location.path(urlPath);
        };
    });
