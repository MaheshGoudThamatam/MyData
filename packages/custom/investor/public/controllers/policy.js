'use strict';
angular.module('mean.investor').controller('PolicyController', function($scope, Global, $stateParams, $location, $rootScope, flash, MESSAGES, $uibModal, INVESTOR, PolicyService, RiskFactorService,MeanUser) {
    $scope.global = Global;
    $scope.SERVICE = PolicyService;
    $scope.MESSAGES = MESSAGES;
    $scope.INVESTOR = INVESTOR;
    $scope.package = {
        name: 'policy',
        featureName: 'Policies',
        modelName: 'POLICY'
    };
    initializePermission($scope, $rootScope, $location, flash, $scope.package.featureName, MESSAGES);
    initializeBreadCrum($scope, $scope.package.modelName, INVESTOR.URL_PATH.POLICYLIST, 'Policies', 'Investor Management');
    initializePagination($scope, $rootScope, $scope.SERVICE);
    initializeDeletePopup($scope, $scope.package.modelName, MESSAGES, $uibModal);
     $scope.policy = {};
     $scope.policy.preclosureconditions = [{}];
     $scope.policy.riskfactors = [{}];
     $scope.policy.technologyriskfactors = [{}];
     $scope.policy.coustomdefinedrisks = [{}];
    $scope.policyTypes = [{
            option: "Risk",
            value: "Risk"
        }, {
            option: "Fixed",
            value: "Fixed"
        }];
    $scope.findPolicies = function() {
        PolicyService.crud.query(function(policies) {
            $scope.policies = policies;
        });
    };
    /** <Desc : Defined for redirection>
     * @ PARAMS: <>, ...
     * @ RETURNS: <>
     * @ <Mahesh> <25-feb-2016> <description of change>
     **/
    $scope.newPolicy = function() {
        $location.path(INVESTOR.URL_PATH.POLICYCREATE);
    };
    /** <Desc : Defined for Breadcrumb>
     * @ PARAMS: <>, ...
     * @ RETURNS: <>
     * @ <Mahesh> <25-feb-2016> <description of change>
     **/
    $scope.createPolicy = function() {
       
        $scope.findRiskfactors();
        $scope.findTechRiskfactors();
        $scope.breadCrumAdd("Create");
    };
    /** <Desc : Defined for Breadcrumb>
     * @ PARAMS: <>, ...
     * @ RETURNS: <>
     * @ <Mahesh> <25-feb-2016> <description of change>
     **/
    $scope.viewBreadcrumb = function() {
        $scope.breadCrumAdd("View");
    };
    /** <Desc : Defined for Breadcrumb>
     * @ PARAMS: <>, ...
     * @ RETURNS: <>
     * @ <Mahesh> <25-feb-2016> <description of change>
     **/
    $scope.editBreadcrumb = function() {
        $scope.breadCrumAdd("Edit");
    };
    /** <Desc : Defined for creation of Policy>
     * @ PARAMS: <policy object>, ...
     * @ RETURNS: <>
     * @ <Mahesh> <25-feb-2016> <description of change>
     **/
    $scope.create = function(isValid) {
        if ($scope.writePermission) {
            if (isValid) {
                var policy = new PolicyService.crud($scope.policy);
                policy.$save(function(response) {
                    flash.setMessage(MESSAGES.POLICY_ADD_SUCCESS, MESSAGES.SUCCESS);
                    $location.path(INVESTOR.URL_PATH.POLICYLIST);
                }, function(error) {
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
    /** <Desc : Defined for remove of POLICY>
     * @ PARAMS: <policy object>, ...
     * @ RETURNS: <>
     * @ <Mahesh> <25-feb-2016> <description of change>
     **/
    $scope.remove = function(Policy) {
        if (Policy && $scope.deletePermission) {
            var policy = new PolicyService.crud(Policy);
            policy.$remove(function(response) {
                deleteObjectFromArray($scope.collection, Policy);
                $('#deletePopup').modal("hide");
                flash.setMessage(MESSAGES.POLICY_DELETE_SUCCESS, MESSAGES.SUCCESS);
                $location.path(INVESTOR.URL_PATH.POLICYLIST);
            });
        } else {
            flash.setMessage(MESSAGES.PERMISSION_DENIED, MESSAGES.ERROR);
            $location.path(MESSAGES.DASHBOARD_URL);
        }
    };
    /** <Desc : Defined for updation of POLICY>
     * @ PARAMS: <policy object>, ...
     * @ RETURNS: <>
     * @ <Mahesh> <25-feb-2016> <description of change>
     **/
    $scope.update = function(isValid) {
        if ($scope.updatePermission) {
            if (isValid) {
                var policy = $scope.policy;
                if (!policy.updated) {
                    policy.updated = [];
                }
                policy.updated.push(new Date().getTime());
                policy.$update(function() {
                    flash.setMessage(MESSAGES.POLICY_UPDATE_SUCCESS, MESSAGES.SUCCESS);
                    $location.path(INVESTOR.URL_PATH.POLICYLIST);
                }, function(error) {
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
    /** <Desc : Defined for finding of POLICY>
     * @ PARAMS: <policy._id>, ...
     * @ RETURNS: <policy object>
     * @ <Mahesh> <25-feb-2016> <description of change>
     **/
    $scope.findOne = function() {
        if ($scope.updatePermission) {
            PolicyService.crud.get({
                policyId: $stateParams.policyId
            }, function(policy) {
                $scope.policy = policy;
                $scope.breadCrumAdd("Edit");
            });
        } else {
            flash.setMessage(MESSAGES.PERMISSION_DENIED, MESSAGES.ERROR);
            $location.path(MESSAGES.DASHBOARD_URL);
        }
    };
    /** <Desc : Defined for cancel of POLICY>
     * @ PARAMS: <>, ...
     * @ RETURNS: <>
     * @ <Mahesh> <25-feb-2016> <description of change>
     **/
    $scope.cancelPolicy = function() {
        $location.path(INVESTOR.URL_PATH.POLICYLIST);
    };
    /** <Desc : Defined for redirection edit of Policy>
     * @ PARAMS: <urlpath, policy id>, ...
     * @ RETURNS: <>
     * @ <Mahesh> <25-feb-2016> <description of change>
     **/
    $scope.editPolicy = function(urlPath, id) {
        console.log(urlPath);
        urlPath = urlPath.replace(":policyId", id);
        console.log(urlPath);
        $location.path(urlPath);
    };
    /** <Desc : Adding Pre closure/ risk factors/ coustom defined risk factors conditions>
     * @ PARAMS: <Array name>, ...
     * @ RETURNS: <>
     * @ <Mahesh> <16-feb-2016> <description of change>
     **/
    $scope.addrow = function(array) {
        array.push({});
    };
    /** <Desc : Removing Pre closure/ risk factors/ coustom defined risk factors conditions>
     * @  PARAMS: <Array name>, ...
     * @ RETURNS: <>
     * @ <Mahesh> <29-feb-2016> <description of change>
     **/
    $scope.removerow = function(index, array) {
        array.splice(index, 1);
    };
    /** <Desc : To get all the Pre-defined Risks>
     * @  PARAMS: <>, ...
     * @ RETURNS: <Array of predefined objects>
     * @ <Mahesh> <01-Mar-2016> <description of change>
     **/
    $scope.findRiskfactors = function() {
        RiskFactorService.crud.query(function(riskfactorslist) {
            $scope.riskfactorslist = riskfactorslist;
            console.log(riskfactorslist);
        });
    };

    /** <Desc : To get all the Pre-defined Technology Risks>
     * @  PARAMS: <>, ...
     * @ RETURNS: <Array of predefined objects>
     * @ <Mahesh> <01-Mar-2016> <description of change>
     **/
    $scope.findTechRiskfactors = function() {
        RiskFactorService.technologyriskfactor.query(function(technologyriskfactorslist) {
            $scope.technologyriskfactorslist = technologyriskfactorslist;
            console.log(technologyriskfactorslist);
        });
    };

});