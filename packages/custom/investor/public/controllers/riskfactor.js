'use strict';

angular.module('mean.investor').controller('RiskFactorController', function ($scope, Global, RiskFactorService, $stateParams, $location, $rootScope, flash, MESSAGES,$uibModal,INVESTOR) {
    $scope.global = Global;
    $scope.SERVICE = RiskFactorService;
    $scope.MESSAGES = MESSAGES;
    $scope.INVESTOR = INVESTOR;

    $scope.package = {
        name: 'skill',
        featureName: 'Risk Factors',
        modelName: 'RiskFactor'
    };

    initializePermission($scope, $rootScope, $location, flash, $scope.package.featureName, MESSAGES);
    initializeBreadCrum($scope, $scope.package.modelName, INVESTOR.URL_PATH.RISKFACTORLIST,'Risk Factor','Investment management');
    initializePagination($scope, $rootScope, $scope.SERVICE);
    initializeDeletePopup($scope, $scope.package.modelName, MESSAGES,$uibModal);


    $scope.findRiskFactor = function () {
        RiskFactorService.skill.query(function (riskfactors) {
            $scope.riskfactors = riskfactors;
        });
    };
   /** <Desc : Defined for redirection>
     * @ PARAMS: <>, ...
     * @ RETURNS: <>
     * @ <Mahesh> <25-feb-2016> <description of change>
     **/
    $scope.newRiskFactor = function () {
        $location.path(INVESTOR.URL_PATH.RISKFACTORCREATE);
    };
    /** <Desc : Defined for Breadcrumb>
     * @ PARAMS: <>, ...
     * @ RETURNS: <>
     * @ <Mahesh> <25-feb-2016> <description of change>
     **/
    $scope.createRiskFactor = function () {
        $scope.riskfactor = {};
        $scope.breadCrumAdd("Create");
    };
    /** <Desc : Defined for Breadcrumb>
     * @ PARAMS: <>, ...
     * @ RETURNS: <>
     * @ <Mahesh> <25-feb-2016> <description of change>
     **/
    $scope.viewBreadcrumb = function () {
        $scope.breadCrumAdd("View");
    };
    /** <Desc : Defined for Breadcrumb>
     * @ PARAMS: <>, ...
     * @ RETURNS: <>
     * @ <Mahesh> <25-feb-2016> <description of change>
     **/ 
    $scope.editBreadcrumb = function () {
        $scope.breadCrumAdd("Edit");
    };
    /** <Desc : Defined for creation of RiskFactor>
     * @ PARAMS: <riskfactor object>, ...
     * @ RETURNS: <>
     * @ <Mahesh> <25-feb-2016> <description of change>
     **/
    $scope.create = function (isValid) {
        if ($scope.writePermission) {
            if (isValid) {
                var riskfactor = new RiskFactorService.crud($scope.riskfactor);
                riskfactor.$save(function (response) {
                    flash.setMessage(MESSAGES.RISKFACTOR_ADD_SUCCESS, MESSAGES.SUCCESS);
                    $location.path(INVESTOR.URL_PATH.RISKFACTORLIST);
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
     /** <Desc : Defined for remove of RiskFactor>
     * @ PARAMS: <riskfactor object>, ...
     * @ RETURNS: <>
     * @ <Mahesh> <25-feb-2016> <description of change>
     **/
    $scope.remove = function (RiskFactor) {
        if (RiskFactor && $scope.deletePermission) {
            var riskfactor = new RiskFactorService.crud(RiskFactor);
            riskfactor.$remove(function (response) {
                deleteObjectFromArray($scope.collection, RiskFactor);
                $('#deletePopup').modal("hide");
                flash.setMessage(MESSAGES.RISKFACTOR_DELETE_SUCCESS, MESSAGES.SUCCESS);
                $location.path(INVESTOR.URL_PATH.RISKFACTORLIST);
            });
        } else {
            flash.setMessage(MESSAGES.PERMISSION_DENIED, MESSAGES.ERROR);
            $location.path(MESSAGES.DASHBOARD_URL);
        }
    };
     /** <Desc : Defined for updation of RiskFactor>
     * @ PARAMS: <riskfactor object>, ...
     * @ RETURNS: <>
     * @ <Mahesh> <25-feb-2016> <description of change>
     **/
    $scope.update = function (isValid) {
        if ($scope.updatePermission) {
            if (isValid) {
                var riskfactor = $scope.riskfactor;
                if (!riskfactor.updated) {
                    riskfactor.updated = [];
                }
                riskfactor.updated.push(new Date().getTime());

                riskfactor.$update(function () {
                    flash.setMessage(MESSAGES.RISKFACTOR_UPDATE_SUCCESS, MESSAGES.SUCCESS);
                    $location.path(INVESTOR.URL_PATH.RISKFACTORLIST);
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
     /** <Desc : Defined for finding of RiskFactor>
     * @ PARAMS: <riskfactor._id>, ...
     * @ RETURNS: <risk factor object>
     * @ <Mahesh> <25-feb-2016> <description of change>
     **/
    $scope.findOne = function () {
        if ($scope.updatePermission) {
            RiskFactorService.crud.get({
                riskfactorId: $stateParams.riskfactorId
            }, function (riskfactor) {
                $scope.riskfactor = riskfactor;
                $scope.breadCrumAdd("Edit");
            });
        } else {
            flash.setMessage(MESSAGES.PERMISSION_DENIED, MESSAGES.ERROR);
            $location.path(MESSAGES.DASHBOARD_URL);
        }
    };
     /** <Desc : Defined for cancel of RiskFactor>
     * @ PARAMS: <>, ...
     * @ RETURNS: <>
     * @ <Mahesh> <25-feb-2016> <description of change>
     **/
    $scope.cancelRiskFactor = function () {
        $location.path(INVESTOR.URL_PATH.RISKFACTORLIST);
    };
     /** <Desc : Defined for redirection edit of RiskFactor>
     * @ PARAMS: <urlpath, riskfactor id>, ...
     * @ RETURNS: <>
     * @ <Mahesh> <25-feb-2016> <description of change>
     **/
    $scope.editRiskFactor = function (urlPath, id) {
        urlPath = urlPath.replace(":riskfactorId", id);
        console.log(urlPath);
        $location.path(urlPath);
    };
});