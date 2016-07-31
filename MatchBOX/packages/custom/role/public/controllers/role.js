'use strict';
/* jshint -W098 */

angular.module('mean.role',['datatables']).controller('RoleController', function ($scope, $rootScope, $stateParams, $location, RoleService, FeatureService, FeatureRoleService, $timeout, URLFactory, flash,MESSAGES,DTOptionsBuilder,DTColumnDefBuilder) {
    $scope.URLFactory = URLFactory;
    $scope.package = {
        name: 'Role',
        modelName: 'Role',
        featureName: 'Role'
    };
    initializePermission($scope, $rootScope, $location, $scope.package.featureName, flash, URLFactory.MESSAGES);
    hideBgImageAndFooter($rootScope);    
    $scope.MESSAGES=MESSAGES;
    flashmessageOn($rootScope, $scope,flash);
    $scope.newRole = function () {
        $location.path(URLFactory.ROLE.URL_PATH.CREATE_ROLE);
    };
     
    $scope.addFeature = function (featureRole) {
        var found = false;
        var foundIndex = -1;
        for (var i = 0; i < $scope.role.features.length; i++) {
            if ($scope.role.features[i].feature._id == featureRole.feature._id) {
                found = true;
                foundIndex = i;
            }
        }
        if (found) {
            $scope.role.features.splice(foundIndex, 1);
            featureRole.isRead=false;
            featureRole.isWrite=false;
            featureRole.isUpdate=false;
            featureRole.isDelete= false;
        } else {
            $scope.role.features.push(featureRole);
            featureRole.isRead=true;
            featureRole.isWrite=true;
            featureRole.isUpdate=true;
            featureRole.isDelete= true;
        }
    };

    $scope.list = function(){
    	$scope.dtOptions = DTOptionsBuilder.newOptions().withPaginationType('full_numbers').withDisplayLength(10);
		$scope.dtColumnDefs = [
		                   DTColumnDefBuilder.newColumnDef(0).notVisible(),
		                   DTColumnDefBuilder.newColumnDef(1),
		                   DTColumnDefBuilder.newColumnDef(2),
		                   DTColumnDefBuilder.newColumnDef(3),
		                   DTColumnDefBuilder.newColumnDef(4).notSortable()    
		                   ];
		window.alert = (function() {
		    var nativeAlert = window.alert;
		    return function(message) {
		        //window.alert = nativeAlert;
		        message.indexOf("DataTables warning") >= 0 ?
		        		  console.warn(message) :
		        	            nativeAlert(message);
		    }
		})();
		var query = {};
		RoleService.role.query(query, function(result){
			$scope.collection = result;
		})
	};
    
    $scope.create = function (isValid) {
        if ($scope.writePermission) {
            var role = new RoleService.role($scope.role);
            role.$save(function (response) {
                flash.setMessage(MESSAGES.ROLE_CREATE_SUCCESS,MESSAGES.SUCCESS);
                $location.path(URLFactory.ROLE.URL_PATH.LIST_ROLE);
            }, function (error) {
                $scope.error = error;
            });
        } else {
            flash.setMessage(MESSAGES.PERMISSION_DENIED, URLFactory.MESSAGES.ERROR);
            $location.path(MESSAGES.DASHBOARD_URL);
        }
    };
    
    $scope.remove = function (Role) {
        if (Role && $scope.deletePermission) {
            var role = new RoleService.role(Role);
            role.$remove(function (response) {
                deleteObjectFromArray($scope.collection, Role);
                flash.setMessage(MESSAGES.ROLE_DELETE_SUCCESS, MESSAGES.SUCCESS);
                $location.path(URLFactory.ROLE.URL_PATH.LIST_ROLE);
            });
        } else {
            flash.setMessage(MESSAGES.PERMISSION_DENIED, URLFactory.MESSAGES.ERROR);
            $location.path(MESSAGES.DASHBOARD_URL);
        }
    };

    //Update Role
    $scope.update = function (isValid) {
        if ($scope.updatePermission) {
            if (isValid) {
                var role = new RoleService.role($scope.role);
                if (!role.updated) {
                    role.updated = [];
                }
                role.updated.push(new Date().getTime());
                role.$update({
                    roleId: $stateParams.roleId
                }, function () {
                    flash.setMessage(MESSAGES.ROLE_UPDATE_SUCCESS,MESSAGES.SUCCESS);
                    $location.path(URLFactory.ROLE.URL_PATH.LIST_ROLE);
                }, function (error) {
                    $scope.error = error;
                });
            } else {
                alert("Some field is missing.");
                $scope.submitted = true;
            }
        } else {
            flash.setMessage(MESSAGES.PERMISSION_DENIED, URLFactory.MESSAGES.ERROR);
            $location.path(MESSAGES.DASHBOARD_URL);
        }
    };

    $scope.show = function (role) {
        $rootScope.role = role;
        $location.path('/admin/role/' + role._id + '/show');
    };

    $scope.createRole = function () {
        $scope.role = {};
        $scope.role.features = [];
    };

    $scope.findOne = function () {
        if ($scope.updatePermission) {
            $scope.featureList();
            RoleService.role.get({
                roleId: $stateParams.roleId
            }, function (role) {
                $scope.role = role;
                $scope.rolefeatureList();
            });
        } else {
            flash.setMessage(MESSAGES.PERMISSION_DENIED, URLFactory.MESSAGES.ERROR);
            $location.path(URLFactory.MESSAGES.DASHBOARD_URL);
        }
    };

    $scope.cancel = function () {
        $location.path(URLFactory.ROLE.URL_PATH.LIST_ROLE);
    };

    $scope.featureList = function () {
        if ($scope.writePermission) {
            $scope.features = [];
            if (angular.isUndefined($rootScope.featureList)) {
                FeatureService.feature.query(function (features) {
                    $scope.features = features;
                    $rootScope.featureList = features;
                    $scope.createRoleFeatures();
                });
            } else {
                $scope.features = $rootScope.featureList;
                $scope.createRoleFeatures();
            }
        } else {
            flash.setMessage(MESSAGES.PERMISSION_DENIED,MESSAGES.ERROR);
            $location.path(URLFactory.MESSAGES.DASHBOARD_URL);
        }
    };

    $scope.createRoleFeatures = function () {
        $scope.roleFeatures = [];
        for (var i = 0; i < $scope.features.length; i++) {
            var featureRole = {};
            featureRole.feature = $scope.features[i];
            featureRole.isRead = false;
            featureRole.isUpdate = false;
            featureRole.isWrite = false;
            featureRole.isDelete = false;
            $scope.roleFeatures.push(featureRole);
        }
    };

    $scope.rolefeatureList = function () {
        $scope.role.features = [];
        FeatureRoleService.role.query({roleId: $scope.role._id}, function (roleFeatures) {
            for (var a = 0; a < roleFeatures.length; a++) {
                for (var i = 0; i < $scope.roleFeatures.length; i++) {
                    if ($scope.roleFeatures[i].feature._id === roleFeatures[a].feature._id) {
                        $scope.roleFeatures[i].selected = true;
                        $scope.roleFeatures[i].isWrite = roleFeatures[a].isWrite;
                        $scope.roleFeatures[i].isRead = roleFeatures[a].isRead;
                        $scope.roleFeatures[i].isUpdate = roleFeatures[a].isUpdate;
                        $scope.roleFeatures[i].isDelete = roleFeatures[a].isDelete;
                        $scope.role.features.push($scope.roleFeatures[i]);
                    }
                }
            }
        });
    };
    
    $scope.edit = function(role){
		$location.path(URLFactory.ROLE.URL_PATH.EDIT_ROLE.replace(':roleId', role._id));
	};
});