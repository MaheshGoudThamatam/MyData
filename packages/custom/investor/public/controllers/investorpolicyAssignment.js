'use strict';
angular.module('mean.investor').controller('InvestorPolicyAssignmentController', function($scope, Global, $stateParams, $location, $rootScope, flash, MESSAGES, $uibModal, INVESTOR, PolicyService, MeanUser, $http, UserService, InvestorPolicyAssignmentService) {
    $scope.global = Global;
    $scope.SERVICE = InvestorPolicyAssignmentService;
    $scope.MESSAGES = MESSAGES;
    $scope.INVESTOR = INVESTOR;
    $scope.package = {
        name: 'Investor Policy',
        featureName: 'Policy Assignment',
        modelName: 'InvestorPolicy'
    };
    initializePermission($scope, $rootScope, $location, flash, $scope.package.featureName, MESSAGES);
    initializeBreadCrum($scope, $scope.package.modelName, INVESTOR.URL_PATH.POLICYLIST, 'Policies', 'Investor Management');
    initializePagination($scope, $rootScope, $scope.SERVICE);
    $scope.investorpolicy = {};
    $scope.investorpolicy.assignedPolicies = [{}];
    /** <Desc : Finding policies>
     * @ PARAMS: <>, ...
     * @ RETURNS: <Array of policies>
     * @ <Mahesh> <02-mar-2016> <description of change>
     **/
    $scope.findPolicies = function() {
        PolicyService.crud.query(function(policies) {
            $scope.policies = policies;
        });
    };
    /** <Desc : Assigning Investor policy>
     * @ PARAMS: <Form>, ...
     * @ RETURNS: <>
     * @ <Mahesh> <02-mar-2016> <description of change>
     **/
    $scope.assignInvestorpolicy = function(isValid) {
        if ($scope.writePermission) {
            for (var i = 0; i < $scope.investorpolicy.assignedPolicies.length; i++) {
                $scope.investorpolicy.assignedPolicies[i].user = $stateParams.userId;
                $scope.investorpolicy.assignedPolicies[i].assigned_by = MeanUser.user._id;
            }
            if (isValid) {
                var investorpolicy = new InvestorPolicyAssignmentService.crud($scope.investorpolicy);
                investorpolicy.$save(function(response) {
                    flash.setMessage(MESSAGES.POLICY_ASSIGN_SUCCESS, MESSAGES.SUCCESS);
                    $location.path(INVESTOR.URL_PATH.INVESTORDETAILS);
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
    $scope.policyDetail = function(policy) {
        $scope.investorpolicy.assignedPolicies.policyDetails = policy;
    };
    //Find user by id
    $scope.findInvestor = function() {
        if ($scope.writePermission) {
            UserService.users.get({
                userId: $stateParams.userId
            }, function(user) {
                $scope.investorSelected = user;
            });
        } else {
            flash.setMessage(MESSAGES.PERMISSION_DENIED, MESSAGES.ERROR);
            $location.path(MESSAGES.DASHBOARD_URL);
        }
    };
    /** <Desc : Defined for Breadcrumb>
     * @ PARAMS: <>, ...
     * @ RETURNS: <>
     * @ <Mahesh> <25-feb-2016> <description of change>
     **/
    $scope.assignPolicy = function(urlPath, investor) {
        urlPath = urlPath.replace(":userId", investor._id);
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
    /** <Desc : To get all the Pre-defined Technology Risks>
     * @  PARAMS: <>, ...
     * @ RETURNS: <Array of predefined objects>
     * @ <Mahesh> <01-Mar-2016> <description of change>
     **/
    $scope.investorsList = function() {
        $scope.breadCrumAdd("List");
        $http.get('/api/users/investors').then(function(response) {
            if (response) {
                console.log(response);
                $scope.investorslist = response.data;
            }
        }, function(error) {
            if (error.data instanceof Array) {
                $scope.err = error.data;
            } else {
                $scope.err = [];
                $scope.err.push(error.data);
            }
        });
    }
});