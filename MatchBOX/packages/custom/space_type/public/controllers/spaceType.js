
'use strict';

/* jshint -W098 */
angular.module('mean.space_type').controller('SpaceTypeController', [ '$scope', '$rootScope', '$location', '$stateParams', 'Global', 'URLFactory', 'SpaceTypeService', 'flash','MESSAGES','DTOptionsBuilder','DTColumnDefBuilder',
    function ($scope, $rootScope, $location, $stateParams, Global, URLFactory, SpaceTypeService, flash,MESSAGES,DTOptionsBuilder,DTColumnDefBuilder) {
		$scope.global = Global;
		$scope.package = {
			name : 'space_type',
	        modelName: 'Space Type',
	        featureName: 'Partner Types'
	    };

	    initializePermission($scope, $rootScope, $location, $scope.package.featureName, flash, URLFactory.MESSAGES);
	    hideBgImageAndFooter($rootScope);
	    flashmessageOn($rootScope, $scope,flash);
	    // initializeDataTable();
		$scope.SERVICE = SpaceTypeService;
		$scope.SPACETYPE = URLFactory.SPACE_TYPE;
		$scope.type = {};
		$scope.MESSAGES=MESSAGES;
		
		$scope.find = function(){
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
			SpaceTypeService.page.query(query, function(result){
				$scope.spaceTypes = result;
			})
		};
		
		$scope.create = function(isvalid){
			if (isvalid) {
			var spaceType = new SpaceTypeService.crud($scope.type);
			spaceType.$save(function(spaceType){
				$scope.type = spaceType;
				flash.setMessage(MESSAGES.SPACE_TYPE_CREATE_SUCCESS,MESSAGES.SUCCESS);
				console.log("after flash MESSAGES");
				$location.path($scope.SPACETYPE.URL_PATH.SPACE_TYPE_LIST);
			},
            function (error) {
                $scope.error = error;
            });
		} else {
        $scope.submitted = true;
    }
		};
		
		$scope.findSpaceType = function(){
			SpaceTypeService.crud.get({
								spaceTypeId : $stateParams.spaceTypeId
							}, function(spaceType) {
								$scope.type = spaceType;
							});
		}
		
		$scope.update = function(isValid){
			console.log($scope.type);
			if (isValid) {
				console.log("Insiode update");
				var spaceType = new SpaceTypeService.crud($scope.type);
				spaceType.$update({
					_id : $scope.type.id
				}, function(spaceType){
					$scope.type = spaceType;
					console.log("Success");
					flash.setMessage(MESSAGES.SPACE_TYPE_UPDATE_SUCCESS,MESSAGES.SUCCESS);
					$location.path($scope.SPACETYPE.URL_PATH.SPACE_TYPE_LIST);
				},function (error) {
                    $scope.error = error;
                });
			} else {
            $scope.submitted = true;
        }
		
		};
		
		$scope.edit = function(spaceType){
			$location.path($scope.SPACETYPE.URL_PATH.SPACE_TYPE_UPDATE.replace(':spaceTypeId', spaceType._id));
		};
		
		$scope.delete = function(spaceType){
			var spaceTypeObj = new SpaceTypeService.crud(spaceType);
			spaceTypeObj.$remove(function(response){
				$scope.spaceTypes.splice(spaceType, 1);
				flash.setMessage(MESSAGES.SPACE_TYPE_DELETE_SUCCESS,MESSAGES.SUCCESS);
			});
		};
		
		$scope.cancel = function(){
			$location.path(URLFactory.SPACE_TYPE.URL_PATH.SPACE_TYPE_LIST);
		};
		
	}
]);
