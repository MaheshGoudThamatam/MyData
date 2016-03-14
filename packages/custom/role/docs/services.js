'use strict';

exports.load = function(swagger, parms) {

  var searchParms = parms.searchableOptions;
  /**
	 * Role API
	 */
	var listRole = {
		'spec' : {
			description : 'Role operations',
			path : '/role',
			method : 'GET',
			summary : 'Get all Roles',
			notes : '',
			type : 'Role',
			nickname : 'getRoles',
			produces : [ 'application/json' ],
			params : searchParms
		}
	};

	var createRole = {
		'spec' : {
			description : 'Create Role operation',
			path : '/role',
			method : 'POST',
			summary : 'Create role',
			notes : '',
			type : 'Role',
			nickname : 'createRole',
			produces : [ 'application/json' ],
			parameters : [ {
				name : 'body',
				description : 'Role to create.  User will be inferred by the authenticated user.',
				required : true,
				type : 'Role',
				paramType : 'body',
				allowMultiple : false
			} ]
		}
	};
	var getRole = {
		'spec' : {
			description : 'Role show operation',
			path : '/role/{roleId}',
			method : 'GET',
			summary : 'Get role by Id',
			notes : '',
			type : 'RoleSchema',
			nickname : 'getRole',
			produces : [ 'application/json' ],
			parameters : [ {
				"name" : "roleId",
				"description" : "ID of config that needs to be fetched",
				"required" : true,
				"type" : "string",
				"paramType" : "path"
			} ]
		}
	};
	var updateRole = {
		'spec' : {
			description : 'Role update operation',
			path : '/role/{roleId}',
			method : 'PUT',
			summary : 'update Role by Id on key values',
			notes : 'Sample Request: {"badgeName": "","description": "","qualifyPoints": "","qualifySkills": ""}',
			type : 'RoleSchema',
			nickname : 'updateRole',
			produces : [ 'application/json' ],
			parameters : [ {
				"name" : "roleId",
				"description" : "ID of config that needs to be updated",
				"required" : true,
				"type" : "string",
				"paramType" : "path"
			}, {
				name : 'body',
				description : 'Role to add.',
				required : true,
				type : 'RoleSchema',
				paramType : 'body',
				allowMultiple : false
			} ]
		}
	};
	var deleteRole = {
			'spec' : {
				description : 'Role delete operation',
				path : '/role/{roleId}',
				method : 'DELETE',
				summary : 'update Role by Id on key values',
				type : 'RoleSchema',
				nickname : 'deleteRole',
				produces : [ 'application/json' ],
				parameters : [ {
					"name" : "roleId",
					"description" : "ID of config that needs to be deleted",
					"required" : true,
					"type" : "string",
					"paramType" : "path"
				}]
			}
		};

	swagger.addGet(listRole).addPost(createRole).addPut(updateRole).addGet(getRole).addDelete(deleteRole);
	/**
	 * Feature API
	 */
	var listFeature = {
		'spec' : {
			description : 'Feature operations',
			path : '/feature',
			method : 'GET',
			summary : 'Get all Features',
			notes : '',
			type : 'Feature',
			nickname : 'getFeatures',
			produces : [ 'application/json' ],
			params : searchParms
		}
	};

	var createFeature = {
		'spec' : {
			description : 'Create Feature operation',
			path : '/feature',
			method : 'POST',
			summary : 'Create feature',
			notes : '',
			type : 'Feature',
			nickname : 'createFeature',
			produces : [ 'application/json' ],
			parameters : [ {
				name : 'body',
				description : 'Feature to create.  User will be inferred by the authenticated user.',
				required : true,
				type : 'Feature',
				paramType : 'body',
				allowMultiple : false
			} ]
		}
	};
	var getFeature = {
		'spec' : {
			description : 'Feature show operation',
			path : '/feature/{featureId}',
			method : 'GET',
			summary : 'Get feature by Id',
			notes : '',
			type : 'FeatureSchema',
			nickname : 'getFeature',
			produces : [ 'application/json' ],
			parameters : [ {
				"name" : "featureId",
				"description" : "ID of config that needs to be fetched",
				"required" : true,
				"type" : "string",
				"paramType" : "path"
			} ]
		}
	};
	var updateFeature = {
		'spec' : {
			description : 'Feature update operation',
			path : '/feature/{featureId}',
			method : 'PUT',
			summary : 'update Feature by Id on key values',
			notes : 'Sample Request: {"name": "","url": ""}',
			type : 'FeatureSchema',
			nickname : 'updateFeature',
			produces : [ 'application/json' ],
			parameters : [ {
				"name" : "featureId",
				"description" : "ID of config that needs to be updated",
				"required" : true,
				"type" : "string",
				"paramType" : "path"
			}, {
				name : 'body',
				description : 'Feature to add.',
				required : true,
				type : 'FeatureSchema',
				paramType : 'body',
				allowMultiple : false
			} ]
		}
	};
	var deleteFeature = {
			'spec' : {
				description : 'Feature delete operation',
				path : '/feature/{featureId}',
				method : 'DELETE',
				summary : 'update Feature by Id on key values',
				type : 'FeatureSchema',
				nickname : 'deleteFeature',
				produces : [ 'application/json' ],
				parameters : [ {
					"name" : "featureId",
					"description" : "ID of config that needs to be deleted",
					"required" : true,
					"type" : "string",
					"paramType" : "path"
				}]
			}
		};

	swagger.addGet(listFeature).addPost(createFeature).addPut(updateFeature).addGet(getFeature).addDelete(deleteFeature);
	/**
	 * FeatureCategory API
	 */
	var listFeatureCategory = {
		'spec' : {
			description : 'FeatureCategory operations',
			path : '/featureCategory',
			method : 'GET',
			summary : 'Get all FeatureCategories',
			notes : '',
			type : 'FeatureCategory',
			nickname : 'getFeatureCategories',
			produces : [ 'application/json' ],
			params : searchParms
		}
	};

	var createFeatureCategory = {
		'spec' : {
			description : 'Create FeatureCategory operation',
			path : '/featureCategory',
			method : 'POST',
			summary : 'Create FeatureCategory',
			notes : '',
			type : 'FeatureCategory',
			nickname : 'createFeatureCategory',
			produces : [ 'application/json' ],
			parameters : [ {
				name : 'body',
				description : 'FeatureCategory to create.  User will be inferred by the authenticated user.',
				required : true,
				type : 'FeatureCategory',
				paramType : 'body',
				allowMultiple : false
			} ]
		}
	};
	var getFeatureCategory = {
		'spec' : {
			description : 'FeatureCategory show operation',
			path : '/featureCategory/{featureCategoryId}',
			method : 'GET',
			summary : 'Get FeatureCategory by Id',
			notes : '',
			type : 'FeatureCategorySchema',
			nickname : 'getFeatureCategory',
			produces : [ 'application/json' ],
			parameters : [ {
				"name" : "featureCategoryId",
				"description" : "ID of config that needs to be fetched",
				"required" : true,
				"type" : "string",
				"paramType" : "path"
			} ]
		}
	};
	var updateFeatureCategory = {
		'spec' : {
			description : 'FeatureCategory update operation',
			path : '/featureCategory/{featureCategoryId}',
			method : 'PUT',
			summary : 'update FeatureCategory by Id on key values',
			notes : 'Sample Request: {"name": "","url": ""}',
			type : 'FeatureCategorySchema',
			nickname : 'updateFeatureCategory',
			produces : [ 'application/json' ],
			parameters : [ {
				"name" : "featureCategoryId",
				"description" : "ID of config that needs to be updated",
				"required" : true,
				"type" : "string",
				"paramType" : "path"
			}, {
				name : 'body',
				description : 'FeatureCategory to add.',
				required : true,
				type : 'FeatureCategorySchema',
				paramType : 'body',
				allowMultiple : false
			} ]
		}
	};
	var deleteFeatureCategory = {
			'spec' : {
				description : 'FeatureCategory delete operation',
				path : '/featureCategory/{featureCategoryId}',
				method : 'DELETE',
				summary : 'update FeatureCategory by Id on key values',
				type : 'FeatureCategorySchema',
				nickname : 'deleteFeatureCategory',
				produces : [ 'application/json' ],
				parameters : [ {
					"name" : "featureCategoryId",
					"description" : "ID of config that needs to be deleted",
					"required" : true,
					"type" : "string",
					"paramType" : "path"
				}]
			}
		};

	swagger.addGet(listFeatureCategory).addPost(createFeatureCategory).addPut(updateFeatureCategory).addGet(getFeatureCategory).addDelete(deleteFeatureCategory);


};
