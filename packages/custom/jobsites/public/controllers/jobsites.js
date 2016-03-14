'use strict';

/* jshint -W098 */
angular.module('mean.jobsites').controller('JobsitesController',
    function ($scope, Global, JobsiteService, $location, $stateParams,$rootScope,PROFILE,MESSAGES,flash,JOBSSITES,$translate,$uibModal
) {
        $scope.global = Global;
        $scope.PROFILE = PROFILE;
        $scope.JOBSSITES=JOBSSITES;
        $scope.package = {
            name: 'jobsites',
            modelName: 'JobSite',
            featureName: 'Jobsites'
        };
        initializePermission($scope, $rootScope, $location, flash, $scope.package.featureName, MESSAGES);
        initializeDeletePopup($scope, $scope.package.modelName, MESSAGES,$uibModal);

        $scope.hasAuthorization = function (jobsites) {
            if (!jobsites || !jobsites.user) {
                return false;
            }
            return MeanUser.isAdmin
                || course.user._id === MeanUser.user._id;
        };

        $scope.find = function () {
            if ($scope.readPermission) {
                JobsiteService.query(function (jobsites) {
                    $scope.jobsites = jobsites;

                });
            } else {
                flash.setMessage(MESSAGES.PERMISSION_DENIED, MESSAGES.ERROR);
                $location.path(MESSAGES.DASHBOARD_URL);
            }
        };

        $scope.create = function (isValid) {
          if($scope.writePermission){
            if (isValid) {

                var jobsite = new JobsiteService($scope.jobsite);
                jobsite.$save(function (response) {

                    $location.path(JOBSSITES.URL_PATH.JOBSITESLIST);
                    $scope.jobsite = {};
                });
            } else {

                $scope.submitted = true;
            }
          }else {
                flash.setMessage(MESSAGES.PERMISSION_DENIED, MESSAGES.ERROR);
                $location.path(MESSAGES.DASHBOARD_URL);
            }
        };

        $scope.remove = function (Jobsite) {
            if($scope.deletePermission){
            if (Jobsite) {
                Jobsite.$remove(function (response) {
                    for (var i in $scope.jobsites) {
                        if ($scope.jobsites[i] === Jobsite) {
                            $scope.jobsites.splice(i, 1);
                        }
                    }
                    $location.path(JOBSSITES.URL_PATH.JOBSITESLIST);
                });
            } else {
                $scope.jobsite.$remove(function (response) {
                    $location.path(JOBSSITES.URL_PATH.JOBSITESLIST);
                });
            }
        }else {
                flash.setMessage(MESSAGES.PERMISSION_DENIED, MESSAGES.ERROR);
                $location.path(MESSAGES.DASHBOARD_URL);
            }
        };

        $scope.update = function (isValid) {
             if ($scope.updatePermission) {
            if (isValid) {
                var jobsite = $scope.jobsite;
                if (!jobsite.updated) {
                    jobsite.updated = [];
                }
                jobsite.updated.push(new Date().getTime());
                jobsite.$update(function () {
                    $location.path(JOBSSITES.URL_PATH.JOBSITESLIST);
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
            JobsiteService.get({
                jobSitesId: $stateParams.jobSitesId
            }, function (jobsite) {
                $scope.jobsite = jobsite;
            });
            } else {
                flash.setMessage(MESSAGES.PERMISSION_DENIED, MESSAGES.ERROR);
                $location.path(MESSAGES.DASHBOARD_URL);
            }
        };
        $scope.cancelJobsite = function () {
            $location.path(JOBSSITES.URL_PATH.JOBSITESLIST);
        };

        $scope.newJobSites = function () {
            $location.path(JOBSSITES.URL_PATH.JOBSITESCREATE);
        };
        $scope.cancelCourse = function () {
            $location.path(JOBSSITES.URL_PATH.JOBSITESLIST);
        };
    }
);
