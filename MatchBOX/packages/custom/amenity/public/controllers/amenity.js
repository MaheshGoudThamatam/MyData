'use strict';

/* jshint -W098 */
angular.module('mean.amenity', [ 'ngFileUpload','datatables' ]).controller('AmenityController',
				function($scope, Global, AmenityService, $location, $stateParams, MeanUser, Upload, SpaceTypeService, URLFactory, $rootScope, flash, $timeout,MESSAGES,DTOptionsBuilder,DTColumnDefBuilder) {

					$scope.package = {
						name : 'amenity',
						modelName : 'Amenity',
						featureName : 'Amenities'
					};

					initializePermission($scope, $rootScope, $location, $scope.package.featureName, flash, URLFactory.MESSAGES);
					hideBgImageAndFooter($rootScope);
					flashmessageOn($rootScope, $scope,flash);
					$scope.SERVICE = AmenityService;
					$scope.AMENITY = URLFactory.AMENITY;
					$scope.space = {};
					$scope.amenity = {};
					$scope.MESSAGES=MESSAGES;
					$scope.create = function(isvalid) {
						if ($scope.writePermission) {
							if (isvalid) {
								if($scope.amenity.icon == null){
										if($scope.amenity.icon.tempUrl){
											delete $scope.amenity.icon.tempUrl;
										}
									}
								var amenity = new AmenityService.amenity($scope.amenity);
								amenity.$save(function(response) {
									if(amenity.icon == null){
											if($scope.amenity.icon.url){
												$scope.amenity.icon.tempUrl = $scope.generateTempUrl($scope.amenity.icon.url);
											}
										}
									
									flash.setMessage(URLFactory.MESSAGES.AMENITY_CREATE_SUCCESS,MESSAGES.SUCCESS);
									$location.path($scope.AMENITY.URL_PATH.AMENITY_LIST);
									$scope.amenity = {};
								}, function(error) {
									$scope.error = error;
								});
							} else {
								$scope.submitted = true;
							}
						} else {
				            flash.setMessage(URLFactory.MESSAGES.PERMISSION_DENIED, URLFactory.MESSAGES.ERROR);
				            $location.path(URLFactory.MESSAGES.DASHBOARD_URL);
				        }
					};

					$scope.remove = function(Amenity) {
						if (Amenity && $scope.deletePermission) {
							var amenity = new AmenityService.amenity(Amenity);
							amenity.$remove(function(response) {
								for ( var i in $scope.amenities) {
									if ($scope.amenities[i] === Amenity) {
										$scope.amenities.splice(i, 1);
									}
								}
								flash.setMessage(URLFactory.MESSAGES.AMENITY_DELETE_SUCCESS,MESSAGES.SUCCESS);
								$location.path($scope.AMENITY.URL_PATH.AMENITY_LIST);
							});
						} else {
				            flash.setMessage(URLFactory.MESSAGES.PERMISSION_DENIED,MESSAGES.ERROR);
				            $location.path(URLFactory.MESSAGES.DASHBOARD_URL);
				        }
					};
					$scope.update = function(isvalid) {
						if ($scope.updatePermission) {
							if (isvalid) {
								if($scope.amenity.icon == null){
									if($scope.amenity.icon.tempUrl){
										delete $scope.amenity.icon.tempUrl;
									}
								}
								var amenity = $scope.amenity;
								if (!amenity.updated) {
									amenity.updated = [];
								}
								amenity.updated.push(new Date().getTime());
	
								amenity.$update(function() {
									if(amenity.icon == null){
										if($scope.amenity.icon.url){
											$scope.amenity.icon.tempUrl = $scope.generateTempUrl($scope.amenity.icon.url);
										}
									}
									flash.setMessage(URLFactory.MESSAGES.AMENITY_UPDATE_SUCCESS,MESSAGES.SUCCESS);
									$location.path($scope.AMENITY.URL_PATH.AMENITY_LIST);
								}, function(error) {
									$scope.error = error;
								});
							} else {
								$scope.submitted = true;
							}
						} else {
				            flash.setMessage(URLFactory.MESSAGES.PERMISSION_DENIED,MESSAGES.ERROR);
				            $location.path(URLFactory.MESSAGES.DASHBOARD_URL);
				        }
					};

					$scope.findOne = function() {
						AmenityService.amenity.get({
							amenityId : $stateParams.amenityId
						}, function(amenity) {
							if(amenity.icon == null){
								if($scope.amenity.icon.url){
									$scope.amenity.icon.tempUrl = $scope.generateTempUrl($scope.amenity.icon.url);
								}
							}
							$scope.amenity = amenity;
						});
					};

					$scope.list = function() {
						$scope.dtOptions = DTOptionsBuilder.newOptions().withPaginationType('full_numbers').withDisplayLength(10);
						$scope.dtColumnDefs = [
						                   DTColumnDefBuilder.newColumnDef(0).notVisible(),
						                   DTColumnDefBuilder.newColumnDef(1),
						                   DTColumnDefBuilder.newColumnDef(2),
						                   DTColumnDefBuilder.newColumnDef(3).notSortable()
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
						AmenityService.amenity.query({

						}, function(response) {
							$scope.amenities = response;
						})
					};
					$scope.newAmenity = function() {
						$location.path($scope.AMENITY.URL_PATH.AMENITY_CREATE);
					}


					$scope.cancel = function() {
						$location.path($scope.AMENITY.URL_PATH.AMENITY_LIST);
					};

					$scope.iconUpload = function() {
						if (window.File && window.FileReader && window.FileList && window.Blob) {
							document.getElementById('upload').addEventListener( 'change', handleFileSelect, false);
						} else {
							alert('The File APIs are not fully supported in this browser.');
						}
					}

					$scope.loaderEnabled = false;
					$scope.onFileSelect = function(image) {
						if (angular.isArray(image)) {
							image = image[0];
						}

						// This is how I handle file types in client side
						if (image.type !== 'image/png' && image.type !== 'image/jpeg') {
							alert('Only PNG and JPEG are accepted.');
							return;
						}
						if (image.size > (1024 * 1024)) {
				            alert('file size exceeded.');
				            return;
				        }
						var user = MeanUser.user;
						var userId = user._id;
						$scope.isImageUploaded = false;
						$scope.loaderEnabled = true;
						$scope.upload = Upload.upload({
									url : '/api/config/' + userId + '/cupload',
									method : 'POST',
									file : image
								})
								.success(function(response) {
									$scope.loaderEnabled = false;
									$timeout(function () {
							        	var resp = $scope.generateTempUrl(response.url)
						     	   		$scope.amenity.tempUrl = resp;
							        	$scope.amenity.icon =$scope.amenity.tempUrl;
						            }, 1000);
								})
								.error(function(err) {
							if (err) {}
						});
					};
					
					$scope.generateTempUrl = function(response) {
						var image = response;
			     	   	 var res = image.split("upload");
			        	 var resp = res[0] + "upload/w_25,h_25,c_thumb" + res[1];
			        	 return resp;
			        	 console.log(resp);
			        }

					// fetching the list of space type
					$scope.listSpaceType = function() {
						SpaceTypeService.page.query(function(spaceTypes) {
							$scope.spaceTypes = spaceTypes;
						});
					};

					$scope.listPartOf = function() {
						AmenityService.partOf.query(function(partofs) {
							$scope.partofs = partofs;
						});
					};

					$scope.edit = function(amenity) {
						if(amenity.icon == null){
							if($scope.amenity.icon.url){
								$scope.amenity.icon.tempUrl = $scope.generateTempUrl($scope.amenity.icon.url);
							}
						}
						$rootScope.amenity = amenity;
						$location.path($scope.AMENITY.URL_PATH.AMENITY_UPDATE.replace(':amenityId', amenity._id));
					};

					/*var handleFileSelect = function(evt) {
						console.log(evt.target.files);
						var files = evt.target.files;
						$scope.files = files;
					};*/

				});
