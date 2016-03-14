'use strict';


angular.module('mean.course').controller('FranchiseController', function ($scope, $stateParams, Global, FranchiseService, $location, $rootScope, MESSAGES, flash, COURSE, MeanUser, CountryService, BranchService, $uibModal,$translate) {
    $scope.global = Global;
    $scope.MESSAGES = MESSAGES;
    $scope.COURSE = COURSE;
    $scope.SERVICE = FranchiseService;
    $scope.package = {
        name: 'course',
        modelName: 'Franchise',
        featureName: 'Franchises'

    };
    initializeDeletePopup($scope, $scope.package.modelName, MESSAGES, $uibModal);
    initializeBreadCrum($scope, $scope.package.modelName, COURSE.URL_PATH.ADMIN_FRANCHISE_LIST,'Franchise','Course Management');
    initializePagination($scope, $rootScope, $scope.SERVICE);
    initializePermission($scope, $rootScope, $location, flash, $scope.package.featureName, MESSAGES);

    //Bread crumbs
    $scope.createBreadcrumb = function () {
        $scope.breadCrumAdd("Create");
    };

    $scope.editBreadcrumb = function () {
        $scope.breadCrumAdd("Edit");
    };

    //For Radio buttons
    $scope.courseType = false;

    $scope.courseTypes = [
        {

            _id: '1',
            name: 'Franchise'
        },
        {
            _id: '2',
            name: 'Third Party Provider'
        }
    ];

    $scope.selectedCourseType = function (id) {
        $scope.courseTypeId = id;
        if ($scope.courseTypeId == 1 || $scope.courseTypeId == 2) {
            $scope.courseType = true;
            $scope.thirdPartyCourseType = true;
        }
        else {
            $scope.courseType = false;
            $scope.thirdPartyCourseType = false;
        }
    };

    $scope.findCourseType = function () {
        $scope.courseTypeId = 1;
        $scope.courseType = true;
    };

    // Loads multiple contact details
    $scope.franchise = {};

    $scope.franchise.contactDetails = [
        {}
    ];

    $scope.addContactDetails = function () {
        $scope.franchise.contactDetails.push({});
    };

    $scope.removeContactDetails = function (contactDetails) {
        var index = $scope.franchise.contactDetails.indexOf(contactDetails);
        $scope.franchise.contactDetails.splice(index, 1);
    };


    //Create
    $scope.create = function (isvalid) {
        if ($scope.writePermission) {
            if (isvalid) {
                var franchise = new FranchiseService.franchise($scope.franchise);

                franchise.$save(function (response) {
                    flash.setMessage(MESSAGES.FRANCHISE_ADD_SUCCESS,
                        MESSAGES.SUCCESS);
                    $location.path(COURSE.URL_PATH.ADMIN_FRANCHISE_LIST);
                    $scope.franchise = {};
                }, function (error) {
                    $scope.error = error;
                });
            }
            else {
                $scope.submitted = true;
            }
        } else {
            flash.setMessage(MESSAGES.PERMISSION_DENIED, MESSAGES.ERROR);
            $location.path(MESSAGES.DASHBOARD_URL);
        }
    };

    //Update
    $scope.update = function (isValid) {
        if ($scope.updatePermission) {
            if (isValid) {
                var franchise = $scope.franchise;
                if (!franchise.updated) {
                    franchise.updated = [];
                }
                franchise.updated.push(new Date().getTime());
                franchise.$update(function () {
                    flash.setMessage(MESSAGES.FRANCHISE_UPDATE_SUCCESS,
                        MESSAGES.SUCCESS);
                    $location.path(COURSE.URL_PATH.ADMIN_FRANCHISE_LIST);
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


    //Delete
    $scope.remove = function (Franchise) {
        if (Franchise && $scope.deletePermission) {
            var franchise = new FranchiseService.franchise(Franchise);
            franchise.$remove(function (response) {
                for (var i in $scope.collection) {
                    if ($scope.collection[i] === Franchise) {
                        $scope.collection.splice(i, 1);
                    }
                    $('#deletePopup').modal("hide");
                    flash.setMessage(MESSAGES.FRANCHISE_DELETE_SUCCESS,
                        MESSAGES.SUCCESS);
                    $location.path(COURSE.URL_PATH.ADMIN_FRANCHISE_LIST);
                }


            });
        } else {
            flash.setMessage(MESSAGES.PERMISSION_DENIED, MESSAGES.ERROR);
            $location.path(MESSAGES.DASHBOARD_URL);
        }
    };

    //Show
    $scope.findOne = function () {

        if ($scope.updatePermission) {
            FranchiseService.franchise.get({
                franchiseId: $stateParams.franchiseId
            }, function (franchise) {
                $scope.franchise = franchise;
            });
        }
        else {
            flash.setMessage(MESSAGES.PERMISSION_DENIED, MESSAGES.ERROR);
            $location.path(MESSAGES.DASHBOARD_URL);
        }
    };


    /*
     * Cancel
     */
    $scope.cancelFranchise = function () {
        $location.path(COURSE.URL_PATH.ADMIN_FRANCHISE_LIST);
    };

    $scope.newFranchise = function () {
        $location.path(COURSE.URL_PATH.ADMIN_FRANCHISE_CREATE);
    };

    $scope.editFranchise = function (urlPath, id) {
        urlPath = urlPath.replace(":franchiseId", id);
        $location.path(urlPath);
    };

    $scope.viewFranchise = function (urlPath, id) {
        urlPath = urlPath.replace(":franchiseId", id);
        $location.path(urlPath);
    };
    /*
     * Show page
     */
    $scope.findShow = function () {
        FranchiseService.franchise.get({
            franchiseId: $stateParams.franchiseId
        }, function (franchise) {
            $scope.franchise = franchise;
            $scope.breadCrumAdd("Detail");
        });
    };
});