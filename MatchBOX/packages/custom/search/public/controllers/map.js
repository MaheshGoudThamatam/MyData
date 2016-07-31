'use strict';

/* jshint -W098 */

angular.module('mean.search', ['ngMap','ngFileUpload','datetimepicker']).controller('MapController',
		function($scope, $rootScope, Global, SearchService, URLFactory, SpaceService, $timeout, NgMap) {

			$scope.global = Global;
			$scope.SEARCH = URLFactory.SEARCH;
			$scope.package = {
				name : 'search'
			};
			flashmessageOn($rootScope, $scope,flash);
		    $scope.GoogleMapMarkers = [];

		    NgMap.getMap().then(function(map) {
		        $scope.map = map;
		    });
		    
		    $rootScope.$on('latLongForRoom', function() {
		    	$timeout(function(){
		    		$scope.loadLatLong();
		    	}, 1000);
		    });
		    
			$scope.loadLatLong = function() {
		    	if (!angular.isUndefined($rootScope.roomsDetail)) {
					$scope.roomPostions = $rootScope.roomsDetail;
					var myLatlng = {
							lat : $scope.roomPostions.loc[1],
							lng : $scope.roomPostions.loc[0]
						};
					$scope.bounds = new google.maps.LatLngBounds();
					
				    $scope.tempInfoWindows = new google.maps.InfoWindow();
				    /*$timeout(function(){*/
				    	$scope.initMap(myLatlng);
				    /*}, 1000);*/
					
				}
			};

			$scope.initMap = function(myLatlng) {
				
				var point = new google.maps.LatLng(myLatlng.lat, myLatlng.lng);
				
	            // extend the bounds to include the new point
	            $scope.bounds.extend(point);
	            $scope.map.fitBounds($scope.bounds);
	            
				var marker = new google.maps.Marker({
					position : point,
					map : $scope.map,
					title : $scope.roomPostions.name,
					icon : '../../../core/system/assets/img/custom/icon-maker.png'
				});
				$scope.map_center = [$scope.roomPostions.loc[1], $scope.roomPostions.loc[0]];

				var zoomChangeBoundsListener = google.maps.event.addListenerOnce($scope.map, 'bounds_changed', function(event) {
                    if ($scope.map.getZoom()){
                    	$scope.map.setZoom(17);
                    }
	            });
	            $timeout(function(){
	            	google.maps.event.removeListener(zoomChangeBoundsListener)
	            }, 2000);
				
				/*google.maps.event.addListener($scope.map, 'center_changed', function() {
	                // 3 seconds after the center of the map has changed, pan back to the
	                // marker.
	            	$timeout(function(){
	            		$scope.map.panTo($scope.map.getCenter());
	                }, 1000);
	            });
	            
	            google.maps.event.addListener(marker,'click',function(event) {			            	
	            	var latitude = event.latLng.lat();
	            	var longitude = event.latLng.lng();
	            	$timeout(function(){
	            		var point = new google.maps.LatLng(latitude, longitude);
	            		$scope.bounds = new google.maps.LatLngBounds();
	            		$scope.bounds.extend(point);
			            $scope.map.fitBounds($scope.bounds);
	            		$scope.map.setZoom(17);
	            		$scope.map.setCenter(point);
	            	}, 1000);
	            });*/
			};

});
