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
							
							$scope.isPhNoInvalid = false;
							$scope.initPhone = function() {
								$("#contactPhoneNo").intlTelInput("destroy");
								$("#contactPhoneNo").intlTelInput({
									  initialCountry: "auto",
									  geoIpLookup: function(callback) {
									    $.get('http://ipinfo.io', function() {}, "jsonp").always(function(resp) {
									      var countryCode = (resp && resp.country) ? resp.country : "";
									      callback(countryCode);
									    });
									  },
									  utilsScript: "../../../../../bower_components/intl-tel-input/build/js/utils.js" // just for formatting/placeholders etc
								});
								
								$("#contactPhoneNo").on("keyup change", function() {
									$scope.contact_details_contactNo_1 = $("#contactPhoneNo").intlTelInput("getNumber");
								});

								$( "#contactPhoneNo" ).blur(function() {
									// $("#contactPhoneNo").val($("#contactPhoneNo").intlTelInput("getNumber", intlTelInputUtils.numberFormat.NATIONAL));
									// $scope.checkPhoneNumber($("#contactPhoneNo").val());
									$scope.phNumberVal = $("#contactPhoneNo").val();
								});

								$("#contactPhoneNoEdit").intlTelInput({
									  initialCountry: "auto",
									  geoIpLookup: function(callback) {
									    $.get('http://ipinfo.io', function() {}, "jsonp").always(function(resp) {
									      var countryCode = (resp && resp.country) ? resp.country : "";
									      callback(countryCode);
									    });
									  },
									  utilsScript: "../../../../../bower_components/intl-tel-input/build/js/utils.js" // just for formatting/placeholders etc
								});
								
								$("#contactPhoneNoEdit").on("keyup change", function() {
									$scope.contact_details_contactNo_1 = $("#contactPhoneNoEdit").intlTelInput("getNumber");
								});

								$( "#contactPhoneNoEdit" ).blur(function() {
									// $("#contactPhoneNoEdit").val($("#contactPhoneNoEdit").intlTelInput("getNumber", intlTelInputUtils.numberFormat.NATIONAL));
									// $scope.checkPhoneNumber($("#contactPhoneNoEdit").val());
									$scope.phNumberVal = $("#contactPhoneNoEdit").val();
								});
							};

							$scope.flagTrue = function() {
								$scope.isPhNoInvalid = false;
							};
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
										if(!$scope.phNumberVal || $scope.phNumberVal.length < 10){
											// $scope.submitted = true;
											$scope.isPhNoInvalid = true;
										}
										else {
											var temp = $("#contactPhoneNo").intlTelInput("getNumber");
        									temp.replace(" ","");
        									partnerObj.contactPhoneNo = temp;
											$scope.isPhNoInvalid = false;
											partnerObj.commissionPercentage=$scope.roomTypes;
		                                  	var partner = new SuperAdmin.crud(partnerObj);
											partner.$save(function(response) {
												$("#partnerModal").modal('hide');
												flash.setMessage(MESSAGES.PARTNER_CREATE_SUCCESS,MESSAGES.SUCCESS);
												window.location.reload();
												$location.path(URLFactory.SUPERADMIN.URL_PATH.LIST_PARTNERS);
												
												 
											}, function(error) {
												$scope.error=error;
											});
										}
												
								}

								else {
                                        $scope.submitted = true;
								    }
							};
							
							$scope.update = function(partnerObj, isvalid) {
								console.log(isvalid);
								// if ($scope.updatePermission) {
								if (isvalid) {
									if(!$scope.phNumberVal || $scope.phNumberVal.length < 10){
											// $scope.submitted = true;
											$scope.isPhNoInvalid = true;
										}
										else {
											var temp = $("#contactPhoneNoEdit").intlTelInput("getNumber");
        									temp.replace(" ","");
        									partnerObj.contactPhoneNo = temp;
											$scope.isPhNoInvalid = false;

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
										}
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
								if(partner.contactPhoneNo){
									var phIntl = '+'+partner.contactPhoneNo
									$("#contactPhoneNoEdit").intlTelInput("setNumber", phIntl);
								}
								/*$location.path($scope.SUPERADMIN.URL_PATH.UPDATE_PARTNER .replace(':partnerId', partner._id));*/
							};

							$scope.remove = function(partnerObj, index) {
								var retVal = confirm("Are you sure you want to delete this partner?");
								if(retVal){
									if (partnerObj) {
										var partner = new SuperAdmin.crud(partnerObj);
										partner.$remove({
											partnerId : partnerObj._id
										}, function(response) {
											$scope.partners.splice(index, 1);
											flash.setMessage(MESSAGES.PARTNER_DELETE_SUCCESS,MESSAGES.SUCCESS);
										}, function(err){
											console.log(err);
											flash.setMessage(MESSAGES.PARTNER_DELETE_FAILURE,MESSAGES.ERROR);
										});
									}
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
								$scope.isPhNoInvalid = false;
								SuperAdmin.loadroomtypeCommssionPercentage.query(function (roomTypes) {
							     $scope.roomTypes = roomTypes;
							   });    
							};
							$scope.modal = function(){
								$scope.error = [];
								document.getElementById("partnerDetailForm").reset();
								 $("#partnerModal").modal('show');
								 
							};
							$scope.cancelEdit = function(){
				            	$("#partnerModalEdit").modal('hide');
								$location.path(URLFactory.SUPERADMIN.URL_PATH.LIST_PARTNERS);
							};
							
							$scope.cancelClose = function(){
								$modalInstance.dismiss('cancel');
							};
							

						} ]);
