'use strict';

/* jshint -W098 */

var searchApp = angular.module('mean.search', ['ngMap','ngFileUpload','datetimepicker','angucomplete-alt', 'ngScrollbars']);

searchApp.config(function (ScrollBarsProvider) {
    // the following settings are defined for all scrollbars unless the
    // scrollbar has local scope configuration
    ScrollBarsProvider.defaults = {
        scrollButtons: {
            scrollAmount: 'auto', // scroll amount when button pressed
            enable: true // enable scrolling buttons by default
        },
        scrollInertia: 400, // adjust however you want
        axis: 'yx', // enable 2 axis scrollbars by default,
        theme: 'dark',
        autoHideScrollbar: false
    };
});

searchApp.controller('MapController',
		function($scope, $rootScope, Global, SearchService, URLFactory, SpaceService, $timeout, NgMap,flash) {

			$scope.global = Global;
			$scope.SEARCH = URLFactory.SEARCH;
			$scope.package = {
				name : 'search'
			};
			flashmessageOn($rootScope, $scope,flash);
		    $scope.GoogleMapMarkers = [];

			console.log('MapController');
			
		    $scope.loadMap = function(){
				console.log('NgMap');
			    NgMap.getMap().then(function(map) {
			        $scope.map = map;
			    });
		    };
		    
		    $scope.loadMap();
		    
		    $rootScope.$on('latLongForRoom', function() {
				console.log('latLongForRoom');
		    	$timeout(function(){
		    		$scope.loadLatLong();
		    	}, 1000);
		    });
		    
			$scope.loadLatLong = function() {
				console.log($rootScope.roomsDetail);
		    	if (!angular.isUndefined($rootScope.roomsDetail)) {
					$scope.roomPostions = $rootScope.roomsDetail;
					
					if (!angular.isUndefined($rootScope.GoogleMapMarkers) && $rootScope.GoogleMapMarkers.length > 0) {
						for(var i = 0; i < $rootScope.GoogleMapMarkers.length; i++) {
							if(JSON.stringify($rootScope.GoogleMapMarkers[i]._id) !== JSON.stringify($scope.roomPostions._id)){
								$rootScope.GoogleMapMarkers[i].setMap(null);
							}
					    }
					}
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
					icon : '/system/assets/img/custom/icon-maker.png'
				});
				
				console.log(marker);
				
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
	            
	            /*NgMap.getMap().then(function(map) {
					$scope.map = map;
					
				    var lat = space.loc[1];
				    var lng = space.loc[0];
				    var latlng = new google.maps.LatLng(lat, lng);
				    
				    //$scope.marker = new google.maps.Marker({});
				    //$scope.marker.setPosition(latlng);
				    //$scope.marker.setMap($scope.map);
				    
				    $scope.marker = new google.maps.Marker({
						position : latlng,
						map : $scope.map
					});
				});*/
	            
			};

});
