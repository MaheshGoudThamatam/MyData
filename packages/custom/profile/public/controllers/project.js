'use strict';
angular.module('mean.profile').controller('ProjectController', function ($scope, $stateParams, Global, ProjectService, $location, $rootScope, Upload, $timeout, SkillService, PROFILE, MESSAGES,$translate) {

    $scope.global = Global;
            $scope.project = {};
            $scope.project.links =[{}];
            $scope.package = {
                name : 'profile',
                modelName: 'Profile',
                modelName_two: 'Portfolio'
            };
            $scope.MESSAGES = MESSAGES;
            $scope.PROFILE = PROFILE;
            initializeBreadCrum($scope,$scope.package.modelName,PROFILE.URL_PATH.PROFILEABOUTME);
            $scope.editPortfolioBreadcrumb = function () {
                $scope.breadCrumAdd("Portfolio List");
            };
            $scope.projectCreateBreadcrumb = function () {
                $scope.breadCrumAddUrl($scope.package.modelName_two,PROFILE.URL_PATH.PROFILEPORTFOLIOCONTENT);
                $scope.breadCrumAppend("Create Project");
            };
            $scope.projectEditBreadcrumb = function () {
                $scope.breadCrumAddUrl($scope.package.modelName_two,PROFILE.URL_PATH.PROFILEPORTFOLIOEDIT);
                $scope.breadCrumAppend("Update Portfolio");
            };
    $scope.hasAuthorization = function (project) {
        if (!project || !project.user) {
            return false;
        }
        return MeanUser.isAdmin || project.user._id === MeanUser.user._id;
    };


    $scope.loadTags = function ($query) {

        return $scope.skillList.filter(function (skill) {
            return skill.name.toLowerCase().indexOf($query.toLowerCase()) != -1;
        });
    };


    $scope.loadSkills = function () {
        $scope.skillNames = [];
        SkillService.skill.query(function (skillList) {
            $scope.skillList = skillList;
            for (var i = 0; i < $scope.skillList.length; i++) {
                $scope.skillNames.push($scope.skillList[i].name);
            }
        });
    };


    $scope.find = function () {
        ProjectService.query(function (projects) {
            $scope.projects = projects;
        });
    };

    $scope.create = function (isValid) {
        if (isValid && $scope.filePath != null) {
            $scope.project.projectPicture = $scope.filePath;
            var project = new ProjectService($scope.project);
            project.$save(function (response) {
                $location.path(PROFILE.URL_PATH.PROFILEPORTFOLIOCONTENT);
                $scope.project = {};
            }, function (error) {
                $scope.error = error;
            });
        } else {
            $scope.submitted = true;
        }

    };

    $scope.remove = function (Project) {
        if (Project) {
            Project.$remove(function (response) {
                for (var i in $scope.projects) {
                    if ($scope.projects[i] === Project) {
                        $scope.projects.splice(i, 1);
                    }
                }
                $('#deleteProject').modal("hide");
                // $location.path(PROFILE.URL_PATH.PROFILELIST);
            });
        } else {
            $scope.project.$remove(function (response) {
                $('#deleteProject').modal("hide");
                // $location.path(PROFILE.URL_PATH.PROFILELIST);
            });
        }
    };

    $scope.update = function (isValid) {
        if (isValid) {
            var project = $scope.project;
            if (!project.updated) {
                project.updated = [];
            }
            project.updated.push(new Date().getTime());

            project.$update(function () {

                $location.path(PROFILE.URL_PATH.PROFILEPORTFOLIOCONTENT);
            }, function (error) {
                $scope.error = error;

            });
        } else {
            $scope.submitted = true;
        }
    };
    $scope.findOne = function () {
        ProjectService.get({
            projectId: $stateParams.projectId
        }, function (project) {
            $scope.project = project;
        });
    };
    $scope.cancelProject = function () {
        $location.path(PROFILE.URL_PATH.PROFILEPORTFOLIOEDIT);
    };
    $scope.newProject = function () {
        $location.path(PROFILE.URL_PATH.PROJECTCREATE);
    };

    $scope.addUrl = function () {
        $scope.project.links.push({});
    };

    $scope.removeUrl = function (url) {
        var index = $scope.project.links.indexOf(url);
        $scope.project.links.splice(index, 1);
    };
    $scope.modalDeleteProject = function (project) {
        $scope.project = project;
        $('#deleteProject').modal("show");
    };

    $scope.cancelDelete = function () {
        $('#deleteProject').modal("hide");
    };


    /*$rootScope.$on('loggedin', function () {
     $scope.user = angular.copy(MeanUser.user);
     });*/
    $scope.onFileSelectProject = function (image) {
        if (angular.isArray(image)) {
            image = image[0];
        }
        // This is how I handle file types in client side
        if (image.type !== 'image/png' && image.type !== 'image/jpeg') {
            alert('Only PNG and JPEG are accepted.');
            return;
        }
        $scope.upload = Upload.upload({
            url: '/api/project/projectPicture',
            method: 'POST',
            file: image
        }).progress(function (event) {

            // $scope.uploadProgress = Math.floor(event.loaded /
            // event.total);

            // $scope.$apply();
        }).success(function (data, status, headers, config) {
            if (config) {
            }
            $scope.filePath = data;
            $scope.uploadInProgress = false;
            // If you need uploaded file immediately
            $timeout(function () {
                $scope.project.projectPicture = data;
            }, 3000);
        }).error(function (err) {
            $scope.uploadInProgress = false;
        });
    }

    $scope.projectDetails = function (index, project) {
        $rootScope.project = project;
        $location.path(PROFILE.URL_PATH.PROFILEPORTFOLIODETAILS);
    };
    $scope.badge = function () {
        $location.path(PROFILE.URL_PATH.PROFILEBADGES);
    };
    $scope.Portfolio = function () {
        $location.path(PROFILE.URL_PATH.PROFILEPORTFOLIOCONTENT);
    };
    $scope.review = function () {
        $location.path(PROFILE.URL_PATH.PROFILEREVIEWS);
    };
    $scope.resume = function () {
        $location.path(PROFILE.URL_PATH.PROFILERESUME);
    };
    $scope.performance = function () {
        $location.path(PROFILE.URL_PATH.PROFILEPERFORMANCE);
    };
    $scope.aboutme = function () {
        $location.path(PROFILE.URL_PATH.PROFILEABOUTME);
    };
    $scope.portfolioEdit = function () {
        $location.path(PROFILE.URL_PATH.PROFILEPORTFOLIOEDIT);
    };
    $scope.editProject = function (urlPath, id) {
        urlPath = urlPath.replace(":projectId", id);
        $location.path(urlPath);
    };
    $scope.redirectdashboard = function () {
        $location.path(PROFILE.URL_PATH.DASHBOARD);
    };
    $scope.redirectEdit = function (user) {
        $location.path(PROFILE.URL_PATH.EDITPROFILE);
    };
    $scope.redirectResume = function () {
        $location.path(PROFILE.URL_PATH.UPLOADRESUME);
    };
    $scope.addProject = function () {
        $location.path(PROFILE.URL_PATH.PROJECTCREATE);
    };

});