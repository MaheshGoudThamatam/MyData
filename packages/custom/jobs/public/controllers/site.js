'use strict';
/* jshint -W098 */
angular.module('mean.jobs').controller('SiteController', function ($scope, Global, SiteService, $stateParams, PROFILE, flash, MESSAGES, $location, $rootScope, JOBS, $uibModal,$translate) {
    $scope.global = Global;
    $scope.SERVICE = SiteService;
    $scope.PROFILE = PROFILE;
    $scope.MESSAGES = MESSAGES;
    $scope.JOBS = JOBS;

    $scope.package = {
        name: 'jobs',
        modelName: 'Site',
        featureName: 'Sites'
    };
    initializePermission($scope, $rootScope, $location, flash, $scope.package.featureName, MESSAGES);
    initializePagination($scope, $rootScope, $scope.SERVICE);
    initializeDeletePopup($scope, $scope.package.modelName, MESSAGES, $uibModal);
    initializeBreadCrum($scope, $scope.package.modelName, JOBS.URL_PATH.SITELIST,'Sites', 'Job Management');
    $scope.find = function () {
        /*SiteService.query(function (sites) {
         $scope.sites =sites;
         });*/
        $scope.currentPage = 1;
        $scope.currentPageSize = 10;
        var query = {};
        query.page = $scope.currentPage;
        query.pageSize = $scope.currentPageSize;
        $scope.loadPagination(query);
    };

    // BreadCrumbs for Site
    $scope.loadNewSiteForm = function () {
        $scope.breadCrumAdd("List");
    };

    $scope.createSite = function () {
        $scope.breadCrumAdd("Create");
    };

    $scope.EditSite = function () {
        $scope.breadCrumAdd("Edit");
    };

    $scope.detailSite = function () {
        $scope.breadCrumAdd("Details");
    };

    $scope.create = function (isValid) {
        if ($scope.writePermission) {
            if (isValid) {
                var site = new SiteService.site($scope.site)
                site.$save(function (response) {
                    flash.setMessage(MESSAGES.SITE_ADD_SUCCESS, MESSAGES.SUCCESS);
                    $location.path(JOBS.URL_PATH.SITELIST);
                    $scope.site = {};
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

    $scope.remove = function (Site) {
        if (Site && $scope.deletePermission) {
            var site = new SiteService.site(Site);
            site.$remove(function (response) {
                for (var i in $scope.collection) {
                    if ($scope.collection[i] === Site) {
                        $scope.collection.splice(i, 1);
                    }
                }
                $('#deletePopup').modal("hide");
                flash.setMessage(MESSAGES.SITE_DELETE_SUCCESS, MESSAGES.SUCCESS);
                $location.path(JOBS.URL_PATH.SITELIST);
            });

        } else {
            flash.setMessage(MESSAGES.PERMISSION_DENIED, MESSAGES.ERROR);
            $location.path(MESSAGES.DASHBOARD_URL);
        }
    };
    $scope.update = function (isValid) {
        if ($scope.updatePermission) {
            if (isValid) {
                var site = $scope.site;
                if (!site.updated) {
                    site.updated = [];
                }
                site.updated.push(new Date().getTime());

                site.$update(function () {
                    flash.setMessage(MESSAGES.SITE_UPDATE_SUCCESS, MESSAGES.SUCCESS);
                    $location.path(JOBS.URL_PATH.SITELIST);
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
            SiteService.site.get({
                siteId: $stateParams.siteId
            }, function (site) {
                $scope.site = site;
                /* $scope.breadCrumAdd("Edit");*/
            });
        } else {
            flash.setMessage(MESSAGES.PERMISSION_DENIED, MESSAGES.ERROR);
            $location.path(MESSAGES.DASHBOARD_URL);
        }
    };
    $scope.cancelSite = function () {
        $location.path(JOBS.URL_PATH.SITELIST);
    };
    $scope.newSite = function () {
        $location.path(JOBS.URL_PATH.SITECREATE);
    };
    /*$scope.modalDeleteSite = function(site) {
     $scope.site = site;
     $('#deleteSite').modal("show");
     };
     $scope.cancelDelete = function() {
     $('#deleteSite').modal("hide");
     };*/
    $scope.redirectdashboard = function () {
        $location.path(PROFILE.URL_PATH.DASHBOARD);
    };
    $scope.siteDetails = function (site) {
        $scope.site = site;
        $location.path('/admin/site/' + site._id + '/details');
    };
    $scope.editSite = function (urlPath, id) {
        urlPath = urlPath.replace(":siteId", id);
        $location.path(urlPath);
    };

});