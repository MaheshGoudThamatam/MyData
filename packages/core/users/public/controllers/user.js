'use strict';

angular.module('mean.users').controller('UserController', function ($scope, $stateParams, UserService, $location, MeanUser, $rootScope, RoleService, ZoneService, CountryService, CityService, BranchService, USERS, ProfileService, PROFILE, MESSAGES, flash, AdminRoleService,$uibModal,$translate,PolicyService) {
    $scope.package = {
        name: 'User',
        modelName: 'User',
        featureName: 'Users'
    };
    $scope.USERS = USERS;
    $scope.SERVICE = UserService;
    $scope.MESSAGES = MESSAGES;

    initializePermission($scope, $rootScope, $location, flash, $scope.package.featureName, MESSAGES);
    initializeBreadCrum($scope, $scope.package.modelName, USERS.URL_PATH.USERLIST,'Users','User Management');
    initializePagination($scope, $rootScope, $scope.SERVICE);
    initializeDeletePopup($scope, $scope.package.modelName, MESSAGES,$uibModal);
    initializeCountryFilter($scope, $rootScope, CountryService, ZoneService, CityService, BranchService);
    initializeRoleFilter($scope, $rootScope, RoleService);


    $rootScope.$on('userFilterChanged', function () {
        $scope.userquery = angular.copy($rootScope.userFilter);
        if ($scope.userquery.branch) {
            delete $scope.userquery.country;
            delete $scope.userquery.zone;
            delete $scope.userquery.city;
        } else if ($scope.userquery.city) {
            delete $scope.userquery.country;
            delete $scope.userquery.zone;
        } else if ($scope.userquery.zone) {
            delete $scope.userquery.country;
        }
        $scope.userquery.page = 1;
        $scope.userquery.pageSize = 10;
        $scope.loadPagination($scope.userquery);
    });

    $scope.loadRoleAndCountryList = function () {
        if ($scope.writePermission) {
            $scope.user = {};
            $scope.user.role = [];
            $scope.countryList();
            $scope.loadRoles();
            $scope.breadCrumAdd("Create");
        }
        else {
            flash.setMessage(MESSAGES.PERMISSION_DENIED, MESSAGES.ERROR);
            $location.path(MESSAGES.DASHBOARD_URL);
        }
    }

    //Find user by id
    $scope.findOne = function () {
        if ($scope.updatePermission) {
            UserService.users.get({
                userId: $stateParams.userId
            }, function (user) {
                $scope.user = user;
                $rootScope.branch = $scope.user.branch;
                $rootScope.city = $scope.user.city;
                $rootScope.zone = $scope.user.zone;
                $rootScope.country = $scope.user.country;
                $scope.countryList();
            });
        } else {
            flash.setMessage(MESSAGES.PERMISSION_DENIED, MESSAGES.ERROR);
            $location.path(MESSAGES.DASHBOARD_URL);
        }
    };

    $scope.searchUser = function () {
        var query = {};
        query.page = $scope.currentPage;
        query.pageSize = $scope.currentPageSize;
        $scope.loadPagination(query);
    };

    $scope.countryList = function () {
        //$scope.country = {};
        if (angular.isUndefined($rootScope.branch)) {
            $rootScope.branch = [];
        }
        if (angular.isUndefined($rootScope.city)) {
            $rootScope.city = [];
        }
        if (angular.isUndefined($rootScope.zone)) {
            $rootScope.zone = [];
        }
        if (angular.isUndefined($rootScope.country)) {
            $rootScope.country = [];
        }
        CountryService.location.query(function (countries) {
            $scope.countries = countries;
            $scope.treeviewJSONConversion();
            $('#tree').treeview({
                data: $scope.locations,
                multiSelect: true,
                nodeIcon: 'glyphicons',
                selectedBackColor: '#FFFFFF',
                selectedColor: '#000000',
                showBorder: false,
                showCheckbox: true,
                onNodeChecked: function (event, data) {
                    $('#tree').treeview('toggleNodeSelected', [ data.nodeId, { silent: false } ]);
                    $scope.activateChildNode(data, 'checkNode',false);
                },
                onNodeUnchecked: function (event, data) {
                    $('#tree').treeview('toggleNodeSelected', [ data.nodeId, { silent: true } ]);
                    while(data.parentId >= 0){
                        var parent=$('#tree').treeview('getParent',data.nodeId);
                        data=parent;
                    }
                    $scope.activateChildNode(data, 'uncheckNode',true);
                }
            });
        });
    };

    $scope.activateChildNode = function (data, action, isDelete) {
        if(data){
            $('#tree').treeview(action, [ data.nodeId, { silent: true } ]);
            $scope.$apply(function () {
                $scope.levelBasedArray(data,isDelete);
            });
            if (data.nodes != null && data.nodes.length > 0) {
                for (var i = 0; i < data.nodes.length; i++) {
                    $scope.activateChildNode(data.nodes[i], action,isDelete);
                }
            }
        }
    };

    $scope.levelBasedArray = function (data,isDelete) {
        if (data.level === 'branch') {
            $rootScope.branch = $scope.pushToLevelArray(data, $rootScope.branch,isDelete);
        } else if (data.level === 'city') {
            $rootScope.city = $scope.pushToLevelArray(data, $rootScope.city,isDelete);
        } else if (data.level === 'zone') {
            $rootScope.zone = $scope.pushToLevelArray(data, $rootScope.zone,isDelete);
        } else if (data.level === 'country') {
            $rootScope.country = $scope.pushToLevelArray(data, $rootScope.country,isDelete);
        }
    };

    $scope.pushToLevelArray = function (data, levelArray, isDelete) {
        var found = false;
        var index = 0;
        for (var i = 0; i < levelArray.length; i++) {
            if (angular.isDefined(levelArray[i]._id) && JSON.stringify(levelArray[i]._id) === JSON.stringify(data._id)) {
                found = true;
                index = i;
            } else if (JSON.stringify(levelArray[i]) === JSON.stringify(data._id)) {
                found = true;
                index = i;
            }
        }
        if (found && isDelete) {
            levelArray.splice(index, 1);
        } else if (!found && !isDelete){
            levelArray.push(data._id);
        }
        return levelArray;
    };

    $scope.branchTreeviewJSONConversion = function (branch) {
        var branchList = [];
        for (var i = 0; i < branch.length; i++) {
            var branchTV = {};
            branchTV._id = branch[i]._id;
            branchTV.level = 'branch';
            branchTV.text = branch[i].branchName;
            branchTV.state = $scope.definingLocationState(branch[i], $rootScope.branch);
            branchList.push(branchTV);
        }
        return branchList;
    };

    $scope.cityTreeviewJSONConversion = function (city) {
        var cityList = [];
        for (var i = 0; i < city.length; i++) {
            var cityTV = {};
            cityTV._id = city[i]._id;
            cityTV.level = 'city';
            cityTV.text = city[i].cityName;
            cityTV.state = $scope.definingLocationState(city[i], $rootScope.city);
            cityTV.nodes = $scope.branchTreeviewJSONConversion(city[i].branch);
            cityList.push(cityTV);
        }
        return cityList;
    };

    $scope.zoneTreeviewJSONConversion = function (zone) {
        var zoneList = [];
        for (var i = 0; i < zone.length; i++) {
            var zoneTV = {};
            zoneTV._id = zone[i]._id;
            zoneTV.level = 'zone';
            zoneTV.text = zone[i].zoneName;
            zoneTV.state = $scope.definingLocationState(zone[i], $rootScope.zone);
            zoneTV.nodes = $scope.cityTreeviewJSONConversion(zone[i].cities);
            zoneList.push(zoneTV);
        }
        return zoneList;
    };

    //Converting the Countries JSON into Bootstrap tree-view JSON Object
    //TV : Tree View of Bootstrap
    $scope.treeviewJSONConversion = function () {
        $scope.locations = [];
        for (var i = 0; i < $scope.countries.length; i++) {
            var countryTV = {};
            countryTV._id = $scope.countries[i]._id;
            countryTV.level = 'country';
            countryTV.text = $scope.countries[i].countryName;
            countryTV.state = $scope.definingLocationState($scope.countries[i], $rootScope.country);
            countryTV.nodes = $scope.zoneTreeviewJSONConversion($scope.countries[i].zone);
            if (i == 0) {
                countryTV.state.expanded = false;
            }
            $scope.locations.push(countryTV);
        }
    };

    //Defining State for Location
    $scope.definingLocationState = function (levelObj, userLevelArray) {
        var state = {};
        state.checked = false;
        state.selected = false;
        for (var i = 0; i < userLevelArray.length; i++) {
            if (levelObj._id === userLevelArray[i]._id) {
                state.checked = true;
                state.selected = true;
            }
        }
        return state;
    };

    $scope.addRole = function (role) {
        var index = objectPresntInArray($scope.user.role, role);
        if (index > -1) {
            $scope.user.role.splice(index, 1);
        } else {
            $scope.user.role.push(role);
        }
    };

    //To check existing role
    $scope.checkedRole = function (role) {
        if ($scope.user) {
            for (var i = 0; i < $scope.user.role.length; i++) {
                if ((role.name === $scope.user.role[i].name)) {
                    return true;
                }
            }
            if(role.name === 'Student') {
                $scope.user.role.push(role);
                return true;
            }
            return false;
        }
    };

    $scope.markAdmin=function(){
        var isAdmin =false;
        if($scope.user && $scope.user.role){
            for (var i = 0; i < $scope.user.role.length; i++) {
                if (($scope.user.role[i].isAdmin)) {
                    isAdmin= true;
                }
            }
        }
        if($scope.user.roles.indexOf(MESSAGES.ADMIN) == -1 && isAdmin){
            $scope.user.roles.push(MESSAGES.ADMIN);
        }else{
            var index = $scope.user.roles.indexOf(MESSAGES.ADMIN);
            if(index > -1){
                $scope.user.roles.splice(index,1);
            }
        }
    };
    //Create user
    $scope.createUser = function (isValid) {
        if ($scope.writePermission) {
            $scope.user.confirmed = true;
            $scope.updateRootScopeUserDetails();
            if (isValid) {
                $scope.markAdmin();
                var user = new UserService.users($scope.user);
                user.$save(function (response) {
                    flash.setMessage(MESSAGES.USER_ADD_SUCCESS, MESSAGES.SUCCESS);
                    $scope.user = {};
                    $scope.deleteRootScopeUserDetails();
                    $location.path(USERS.URL_PATH.USERLIST);
                }, function (error) {
                    console.log(error);
                    $scope.error = error;
                });

            } else {
                $scope.submitted = true;
            }
        }
        else {
            flash.setMessage(MESSAGES.PERMISSION_DENIED, MESSAGES.ERROR);
            $location.path(MESSAGES.DASHBOARD_URL);
        }
    };

    //Update user
    $scope.updateUser = function (isValid) {
        if ($scope.updatePermission) {
            $scope.updateRootScopeUserDetails();
            if (isValid) {
                $scope.markAdmin();
                var user = $scope.user;
                if (!user.updated) {
                    user.updated = [];
                }
                user.$update(function () {
                    flash.setMessage(MESSAGES.USER_UPDATE_SUCCESS, MESSAGES.SUCCESS);
                    $scope.deleteRootScopeUserDetails();
                    $location.path(USERS.URL_PATH.USERLIST);
                }, function (error) {
                    $scope.error = error;
                });
            } else {
                $scope.submitted = true;
            }
        }
        else {
            flash.setMessage(MESSAGES.PERMISSION_DENIED, MESSAGES.ERROR);
            $location.path(MESSAGES.DASHBOARD_URL);
        }
    };
    //Remove user
    $scope.remove = function (user) {
        if ($scope.deletePermission) {
            if (user) {
                user = new UserService.users(user);
                user.$remove(function (response) {
                    var index =objectPresntInArray($scope.collection,user);
                    $scope.collection.splice(index, 1);
                    $('#deletePopup').modal("hide");   // delete pop up
                    flash.setMessage(MESSAGES.USER_DELETE_SUCCESS,MESSAGES.SUCCESS);
                    $location.path(USERS.URL_PATH.USERLIST);
                });
            } else {
                $scope.user.$remove(function (response) {
                    $('#deletePopup').modal("hide");   // delete pop up
                    flash.setMessage(MESSAGES.USER_DELETE_SUCCESS,MESSAGES.SUCCESS);
                    $location.path(USERS.URL_PATH.USERLIST);
                });
            }
        }
        else {
            flash.setMessage(MESSAGES.PERMISSION_DENIED, MESSAGES.ERROR);
            $location.path(MESSAGES.DASHBOARD_URL);
        }
    };

    $scope.deleteRootScopeUserDetails = function () {
        delete $rootScope.branch;
        delete $rootScope.city;
        delete $rootScope.zone;
        delete $rootScope.country;
    };

    $scope.updateRootScopeUserDetails = function () {
        $scope.user.branch = $rootScope.branch;
        $scope.user.city = $rootScope.city;
        $scope.user.zone = $rootScope.zone;
        $scope.user.country = $rootScope.country;
    };

    $scope.cancelUsers = function () {
        $scope.deleteRootScopeUserDetails();
        $location.path(USERS.URL_PATH.USERLIST);
    };

    $scope.toCreateUser = function () {
        $location.path(USERS.URL_PATH.USERCREATE);
    };

    $scope.toCreateUser = function () {
        $location.path(USERS.URL_PATH.USERCREATE);
    };

    $scope.editUser = function () {
        $scope.breadCrumAdd("Edit");
    };

    $scope.showUser = function () {
        $scope.breadCrumAdd("Show");
    };

  
});
