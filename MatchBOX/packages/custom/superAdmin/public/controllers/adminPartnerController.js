'use strict';

/* jshint -W098 */
angular.module('mean.superAdmin',['datatables']).controller( 'adminPartnerCtrl',
				[ '$scope', 'Global', 'SuperAdmin', 'MeanUser', 'Upload', 'SUPERADMIN', '$rootScope', '$location', 'flash', 'URLFactory','MESSAGES','DTOptionsBuilder','DTColumnDefBuilder',
						function($scope, Global, SuperAdmin, MeanUser, Upload,SUPERADMIN, $rootScope, $location, flash, URLFactory,MESSAGES,DTOptionsBuilder,DTColumnDefBuilder) {
							$scope.global = Global;
							$scope.package = {
								name : 'superAdmin'
							};
							hideBgImageAndFooter($rootScope);
							$scope.SUPERADMIN = SUPERADMIN;
							$scope.partners = [];
							var userId = MeanUser.user._id;
							$scope.MESSAGES=MESSAGES;
							flashmessageOn($rootScope, $scope,flash);
							$scope.find = function() {
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
								var query = {};
								SuperAdmin.crud.query(query, function(result) {
									$scope.partners = result;
								})
							};

							if ($rootScope.partnerObj && $rootScope.isPartnerEdit) {
								$scope.partnerObj = $rootScope.partnerObj;
								delete $rootScope.partnerObj;
								delete $rootScope.isPartnerEdit;
							}

							$scope.savePartner = function(partnerObj,isvalid) {
								if (isvalid) {	
									partnerObj.commissionPercentage=$scope.roomTypes;
                                   var partner = new SuperAdmin.crud(partnerObj);
									partner.$save(function(response) {
										$("#partnerModal").modal('hide');
										flash.setMessage(MESSAGES.PARTNER_CREATE_SUCCESS,MESSAGES.SUCCESS);
										window.location.reload();
										$location.path(URLFactory.SUPERADMIN.URL_PATH.LIST_PARTNERS);
										
										 
									}, function(error) {
										$scope.error=error;
										console.log($scope.error);
									});
								} else {
                                         $scope.submitted = true;
									    }
							};
							$scope.update = function(partnerObj, isvalid) {
								// if ($scope.updatePermission) {
								if (isvalid) {
									var partner = new SuperAdmin.crud( partnerObj);
									partner.$update({
										partnerId : partnerObj._id
									},
									function(partnerObj) {
										$scope.partnerObj = partnerObj;
										$("#partnerModalEdit").modal('hide');
										flash.setMessage(MESSAGES.PARTNER_UPDATE_SUCCESS,MESSAGES.SUCCESS);
										$location.path($scope.SUPERADMIN.URL_PATH.LIST_PARTNERS);
									}, function(error) {
										$scope.error = error;
									});
								} else {
									$scope.submitted = true;
								}
								/*
								 * } else {
								 * flash.setMessage(URLFactory.MESSAGES.PERMISSION_DENIED,
								 * URLFactory.MESSAGES.ERROR);
								 * $location.path($scope.SUPERADMIN.URL_PATH.LIST_PARTNERS); }
								 */
							};
							//$scope.showCommission=false;
							$scope.edit = function(partner) {
								if(partner.commissionPercentage.length == 0){
									$scope.loadRoomTypeCommission();
									$scope.showCommission=true;
								}
								else{
									$scope.showCommission=false;
								}
								$rootScope.isPartnerEdit = true;
								$rootScope.partnerObj = partner;
								$("#partnerModalEdit").modal('show');
								/*$location.path($scope.SUPERADMIN.URL_PATH.UPDATE_PARTNER .replace(':partnerId', partner._id));*/
							};

							$scope.remove = function(partnerObj, index) {
								if (partnerObj) {
									var partner = new SuperAdmin.crud(partnerObj);
									partner.$remove({
										partnerId : partnerObj._id
									}, function(response) {
										$scope.partners.splice(index, 1);
										flash.setMessage(MESSAGES.PARTNER_DELETE_SUCCESS,MESSAGES.SUCCESS);
									});

								}
							};
							
							$scope.detail = function(partner) {
								$rootScope.partnerObj = partner;
								$location.path($scope.SUPERADMIN.URL_PATH.PARTNER_DETAIL .replace(':partnerId', partner._id));
							};
							
							$scope.findOne= function() {
								$scope.partnerDetail = $rootScope.partnerObj;
							};

							$scope.onFileSelect = function(image) {
								if (angular.isArray(image)) {
									image = image[0];
								}
								// This is how I handle file types in client
								// side
								if (image.type !== 'image/png'
										&& image.type !== 'image/jpeg') {
									alert('Only PNG and JPEG are accepted.');
									return;
								}
								
								$scope.isImageUploaded = false;
								$scope.upload = Upload.upload({
									url : '/api/config/' + userId + '/cupload',
									method : 'POST',
									file : image
								}).success(function(response) {
									$scope.partnerObj.avatar = response;
								}).error(function(err) {
									if (err) {
									}
								});
							};
				            $scope.cancel = function(){
				            	$("#partnerModal").modal('hide');
				            	document.getElementById("partnerDetailForm").reset();
								$location.path(URLFactory.SUPERADMIN.URL_PATH.LIST_PARTNERS);
							};
							
							$scope.loadRoomTypeCommission=function(){
								SuperAdmin.loadroomtypeCommssionPercentage.query(function (roomTypes) {
							     $scope.roomTypes = roomTypes;
							     console.log($scope.roomTypes);
							   });    
							};
							$scope.modal = function(){
								document.getElementById("partnerDetailForm").reset();
								 $("#partnerModal").modal('show');
								 
							};
							$scope.cancelEdit = function(){
				            	$("#partnerModalEdit").modal('hide');
								$location.path(URLFactory.SUPERADMIN.URL_PATH.LIST_PARTNERS);
							};
							
							$scope.cancelClose = function(){
								console.log("++++++++++++++");
								$modalInstance.dismiss('cancel');
							};
							

						} ]);
