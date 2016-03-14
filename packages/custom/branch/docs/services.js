'use strict';

exports.load = function(swagger, parms) {

  var searchParms = parms.searchableOptions;

  var listCountry = {
			'spec' : {
				description : 'Country operations',
				path : '/country',
				method : 'GET',
				summary : 'Get all Countries',
				notes : '',
				type : 'Country',
				nickname : 'getCountries',
				produces : [ 'application/json' ],
				params : searchParms
			}
		};

		var createCountry = {
			'spec' : {
				description : 'Create Country operation',
				path : '/country',
				method : 'POST',
				summary : 'Create Country',
				notes : '',
				type : 'Country',
				nickname : 'createCountry',
				produces : [ 'application/json' ],
				parameters : [ {
					name : 'body',
					description : 'Country to create.  User will be inferred by the authenticated user.',
					required : true,
					type : 'Country',
					paramType : 'body',
					allowMultiple : false
				} ]
			}
		};
		var getCountry = {
			'spec' : {
				description : 'Country show operation',
				path : '/country/{countryId}',
				method : 'GET',
				summary : 'Get Country by Id',
				notes : '',
				type : 'CountrySchema',
				nickname : 'getCountry',
				produces : [ 'application/json' ],
				parameters : [ {
					"name" : "countryId",
					"description" : "ID of config that needs to be fetched",
					"required" : true,
					"type" : "string",
					"paramType" : "path"
				} ]
			}
		};
		var updateCountry = {
			'spec' : {
				description : 'Country update operation',
				path : '/country/{countryId}',
				method : 'PUT',
				summary : 'update Country by Id on key values',
				notes : 'Sample Request: {"countryName": "","countryCode": "","currency": "","languageName": "","languageCode": ""}',
				type : 'CountrySchema',
				nickname : 'updateCountry',
				produces : [ 'application/json' ],
				parameters : [ {
					"name" : "countryId",
					"description" : "ID of config that needs to be updated",
					"required" : true,
					"type" : "string",
					"paramType" : "path"
				}, {
					name : 'body',
					description : 'Badge to add.',
					required : true,
					type : 'CountrySchema',
					paramType : 'body',
					allowMultiple : false
				} ]
			}
		};
		var deleteCountry = {
				'spec' : {
					description : 'Country delete operation',
					path : '/country/{countryId}',
					method : 'DELETE',
					summary : 'update country by Id on key values',
					type : 'CountrySchema',
					nickname : 'deleteCountry',
					produces : [ 'application/json' ],
					parameters : [ {
						"name" : "countryId",
						"description" : "ID of config that needs to be deleted",
						"required" : true,
						"type" : "string",
						"paramType" : "path"
					}]
				}
		};
		swagger.addGet(listCountry).addPost(createCountry).addPut(updateCountry).addGet(getCountry).addDelete(deleteCountry);
    /**
     * Zone API
     *  */
		var listZone = {
				'spec' : {
					description : 'Zone operations',
					path : '/country/{countryId}/zone',
					method : 'GET',
					summary : 'Get all Zones',
					notes : '',
					type : 'Zones',
					nickname : 'getZones',
					produces : [ 'application/json' ],
					parameters : [{
						"name" : "countryId",
						"description" : "ID of config that needs to be updated",
						"required" : true,
						"type" : "string",
						"paramType" : "path"
					}]
				}
			};
		var getCountryZone = {
				'spec' : {
					description : 'Country show operation',
					path : '/country/{countryId}',
					method : 'GET',
					summary : 'Get Country by Id',
					notes : '',
					type : 'CountrySchema',
					nickname : 'getCountry',
					produces : [ 'application/json' ],
					parameters : [ {
						"name" : "countryId",
						"description" : "ID of config that needs to be fetched",
						"required" : true,
						"type" : "string",
						"paramType" : "path"
					} ]
				}
			};

			var createZone = {
				'spec' : {
					description : 'Create Zone operation',
					path : '/country/{countryId}/zone',
					method : 'POST',
					summary : 'Create Zone',
					notes : '',
					type : 'Zone',
					nickname : 'createZone',
					produces : [ 'application/json' ],
					parameters : [{
						"name" : "countryId",
						"description" : "ID of config that needs to be updated",
						"required" : true,
						"type" : "string",
						"paramType" : "path"
					}, {
						name : 'body',
						description : 'Zone to create.  User will be inferred by the authenticated user.',
						required : true,
						type : 'Zone',
						paramType : 'body',
						allowMultiple : false
					} ]
				}
			};
			var getZone = {
				'spec' : {
					description : 'Zone show operation',
					path : '/zone/{zoneId}',
					method : 'GET',
					summary : 'Get Zone by Id',
					notes : '',
					type : 'ZoneSchema',
					nickname : 'getZone',
					produces : [ 'application/json' ],
					parameters : [ {
						"name" : "zoneId",
						"description" : "ID of config that needs to be fetched",
						"required" : true,
						"type" : "string",
						"paramType" : "path"
					} ]
				}
			};
			var updateZone = {
				'spec' : {
					description : 'Zone update operation',
					path : '/zone/{zoneId}',
					method : 'PUT',
					summary : 'update Zone by Id on key values',
					notes : 'Sample Request: {"countryName": "","countryCode": "","currency": "","languageName": "","languageCode": ""}',
					type : 'ZoneSchema',
					nickname : 'updateZone',
					produces : [ 'application/json' ],
					parameters : [ {
						"name" : "zoneId",
						"description" : "ID of config that needs to be updated",
						"required" : true,
						"type" : "string",
						"paramType" : "path"
					}, {
						name : 'body',
						description : 'Zone to add.',
						required : true,
						type : 'ZoneSchema',
						paramType : 'body',
						allowMultiple : false
					} ]
				}
			};
			var deleteZone = {
					'spec' : {
						description : 'Zone delete operation',
						path : '/zone/{zoneId}',
						method : 'DELETE',
						summary : 'update zone by Id on key values',
						type : 'ZoneSchema',
						nickname : 'deleteZone',
						produces : [ 'application/json' ],
						parameters : [ {
							"name" : "zoneId",
							"description" : "ID of config that needs to be deleted",
							"required" : true,
							"type" : "string",
							"paramType" : "path"
						}]
					}
			};
			swagger.addGet(listZone).addPost(createZone).addPut(updateZone).addGet(getZone).addDelete(deleteZone).addGet(getCountryZone);
			 /**
		     *City API
		     *  */
				var listCity = {
						'spec' : {
							description : 'City operations',
							path : '/zone/{zoneId}/city',
							method : 'GET',
							summary : 'Get all Cities',
							notes : '',
							type : 'Cities',
							nickname : 'getCities',
							produces : [ 'application/json' ],
							parameters : [{
								"name" : "zoneId",
								"description" : "ID of config that needs to be updated",
								"required" : true,
								"type" : "string",
								"paramType" : "path"
							}]
						}
					};
				var getZoneCity = {
						'spec' : {
							description : 'Zone show operation',
							path : '/zone/{zoneId}',
							method : 'GET',
							summary : 'Get Zone by Id',
							notes : '',
							type : 'ZoneSchema',
							nickname : 'getZone',
							produces : [ 'application/json' ],
							parameters : [ {
								"name" : "zoneId",
								"description" : "ID of config that needs to be fetched",
								"required" : true,
								"type" : "string",
								"paramType" : "path"
							} ]
						}
					};
					var createCity = {
						'spec' : {
							description : 'Create City operation',
							path : '/zone/{zoneId}/city',
							method : 'POST',
							summary : 'Create Zone',
							notes : '',
							type : 'City',
							nickname : 'createCity',
							produces : [ 'application/json' ],
							parameters : [{
								"name" : "zoneId",
								"description" : "ID of config that needs to be updated",
								"required" : true,
								"type" : "string",
								"paramType" : "path"
							}, {
								name : 'body',
								description : 'Zone to create.  User will be inferred by the authenticated user.',
								required : true,
								type : 'Zone',
								paramType : 'body',
								allowMultiple : false
							} ]
						}
					};
					var getCity = {
						'spec' : {
							description : 'Zone show operation',
							path : '/city/{cityId}',
							method : 'GET',
							summary : 'Get City by Id',
							notes : '',
							type : 'CitySchema',
							nickname : 'getCity',
							produces : [ 'application/json' ],
							parameters : [ {
								"name" : "cityId",
								"description" : "ID of config that needs to be fetched",
								"required" : true,
								"type" : "string",
								"paramType" : "path"
							} ]
						}
					};
					var updateCity = {
						'spec' : {
							description : 'City update operation',
							path : '/city/{cityId}',
							method : 'PUT',
							summary : 'update City by Id on key values',
							notes : 'Sample Request: {"countryName": "","countryCode": "","currency": "","languageName": "","languageCode": ""}',
							type : 'CitySchema',
							nickname : 'updateCity',
							produces : [ 'application/json' ],
							parameters : [ {
								"name" : "cityId",
								"description" : "ID of config that needs to be updated",
								"required" : true,
								"type" : "string",
								"paramType" : "path"
							}, {
								name : 'body',
								description : 'City to add.',
								required : true,
								type : 'CitySchema',
								paramType : 'body',
								allowMultiple : false
							} ]
						}
					};
					var deleteCity = {
							'spec' : {
								description : 'City delete operation',
								path : '/city/{cityId}',
								method : 'DELETE',
								summary : 'update City by Id on key values',
								type : 'CitySchema',
								nickname : 'deleteCity',
								produces : [ 'application/json' ],
								parameters : [ {
									"name" : "cityId",
									"description" : "ID of config that needs to be deleted",
									"required" : true,
									"type" : "string",
									"paramType" : "path"
								}]
							}
					};
					swagger.addGet(listCity).addPost(createCity).addPut(updateCity).addGet(getCity).addDelete(deleteCity).addGet(getZoneCity);
					
							 /**
						     *Branch API
						     *  */
								var listBranch = {
										'spec' : {
											description : 'Branch operations',
											path : '/city/{cityId}/branch',
											method : 'GET',
											summary : 'Get all Branches',
											notes : '',
											type : 'Branches',
											nickname : 'getBranches',
											produces : [ 'application/json' ],
											parameters : [{
												"name" : "cityId",
												"description" : "ID of config that needs to be updated",
												"required" : true,
												"type" : "string",
												"paramType" : "path"
											}]
										}
									};
								var getCityBranch = {
										'spec' : {
											description : 'Zone show operation',
											path : '/city/{cityId}',
											method : 'GET',
											summary : 'Get City by Id',
											notes : '',
											type : 'CitySchema',
											nickname : 'getCity',
											produces : [ 'application/json' ],
											parameters : [ {
												"name" : "cityId",
												"description" : "ID of config that needs to be fetched",
												"required" : true,
												"type" : "string",
												"paramType" : "path"
											} ]
										}
									};
									var createBranch = {
										'spec' : {
											description : 'Create Branch operation',
											path : '/city/{cityId}/branch',
											method : 'POST',
											summary : 'Create Branch',
											notes : '',
											type : 'Branch',
											nickname : 'createBranch',
											produces : [ 'application/json' ],
											parameters : [{
												"name" : "cityId",
												"description" : "ID of config that needs to be updated",
												"required" : true,
												"type" : "string",
												"paramType" : "path"
											}, {
												name : 'body',
												description : 'Zone to create.  User will be inferred by the authenticated user.',
												required : true,
												type : 'Zone',
												paramType : 'body',
												allowMultiple : false
											} ]
										}
									};
									var getBranch = {
										'spec' : {
											description : 'Branch show operation',
											path : '/branch/{branchId}',
											method : 'GET',
											summary : 'Get Branch by Id',
											notes : '',
											type : 'BranchSchema',
											nickname : 'getBranch',
											produces : [ 'application/json' ],
											parameters : [ {
												"name" : "branchId",
												"description" : "ID of config that needs to be fetched",
												"required" : true,
												"type" : "string",
												"paramType" : "path"
											} ]
										}
									};
									var updateBranch = {
										'spec' : {
											description : 'Branch update operation',
											path : '/branch/{branchId}',
											method : 'PUT',
											summary : 'update Branch by Id on key values',
											notes : 'Sample Request: {"countryName": "","countryCode": "","currency": "","languageName": "","languageCode": ""}',
											type : 'BranchSchema',
											nickname : 'updateBranch',
											produces : [ 'application/json' ],
											parameters : [ {
												"name" : "branchId",
												"description" : "ID of config that needs to be updated",
												"required" : true,
												"type" : "string",
												"paramType" : "path"
											}, {
												name : 'body',
												description : 'City to add.',
												required : true,
												type : 'BranchSchema',
												paramType : 'body',
												allowMultiple : false
											} ]
										}
									};
									var deleteBranch = {
											'spec' : {
												description : 'Branch delete operation',
												path : '/branch/{branchId}',
												method : 'DELETE',
												summary : 'update Branch by Id on key values',
												type : 'BranchSchema',
												nickname : 'deleteBranch',
												produces : [ 'application/json' ],
												parameters : [ {
													"name" : "branchId",
													"description" : "ID of config that needs to be deleted",
													"required" : true,
													"type" : "string",
													"paramType" : "path"
												}]
											}
									};
									var listAllBranches = {
											'spec' : {
												description : 'All branches operations',
												path : '/all/branch',
												method : 'GET',
												summary : 'Get all branches with course',
												notes : '',
												type : 'Branches',
												nickname : 'getAllBranches',
												produces : [ 'application/json' ],
												params : searchParms
											}
										};
									
									var listBranchCourses = {
											'spec' : {
												description : 'All listBranchCourses operations',
												path : '/branchCourses',
												method : 'GET',
												summary : 'Get all BranchCourses',
												notes : '',
												type : 'BranchCourses',
												nickname : 'getBranchCourses',
												produces : [ 'application/json' ],
												params : searchParms
											}
										};
									swagger.addGet(listBranch).addPost(createBranch).addPut(updateBranch)
									.addGet(getBranch).addDelete(deleteBranch).addGet(getCityBranch)
									.addGet(listAllBranches).addGet(listBranchCourses);
		
};
