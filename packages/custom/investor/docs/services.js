'use strict';

exports.load = function(swagger, parms) {

  var searchParms = parms.searchableOptions;
/**
 * Policy API
 */
var listPolicy = {
	'spec' : {
		description : 'Policy operations',
		path : '/policy',
		method : 'GET',
		summary : 'Get all Policies',
		notes : '',
		type : 'Policy',
		nickname : 'getPolicies',
		produces : [ 'application/json' ],
		params : searchParms
	}
};

var createPolicy = {
	'spec' : {
		description : 'Create Policy operation',
		path : '/policy',
		method : 'POST',
		summary : 'Create Policy',
		notes : '',
		type : 'Policy',
		nickname : 'createPolicy',
		produces : [ 'application/json' ],
		parameters : [ {
			name : 'body',
			description : 'Policy to create.  User will be inferred by the authenticated user.',
			required : true,
			type : 'Policy',
			paramType : 'body',
			allowMultiple : false
		} ]
	}
};
var getPolicy = {
	'spec' : {
		description : 'Policy show operation',
		path : '/policy/{policyId}',
		method : 'GET',
		summary : 'Get policy by Id',
		notes : '',
		type : 'PolicySchema',
		nickname : 'getPolicy',
		produces : [ 'application/json' ],
		parameters : [ {
			"name" : "policyId",
			"description" : "ID of config that needs to be fetched",
			"required" : true,
			"type" : "string",
			"paramType" : "path"
		} ]
	}
};
var updatePolicy = {
	'spec' : {
		description : 'Policy update operation',
		path : '/policy/{policyId}',
		method : 'PUT',
		summary : 'update Course by Id on key values',
		notes : 'Sample Request: {"name": "","description": "","mininvestment": "","maxinvestment": "","policyduration":""}',
		type : 'CourseSchema',
		nickname : 'updateCourse',
		produces : [ 'application/json' ],
		parameters : [ {
			"name" : "policyId",
			"description" : "ID of config that needs to be updated",
			"required" : true,
			"type" : "string",
			"paramType" : "path"
		}, {
			name : 'body',
			description : 'Policy to add.',
			required : true,
			type : 'PolicySchema',
			paramType : 'body',
			allowMultiple : false
		} ]
	}
};
var deletePolicy = {
		'spec' : {
			description : 'Policy delete operation',
			path : '/policy/{policyId}',
			method : 'DELETE',
			summary : 'update Policy by Id on key values',
			type : 'PolicySchema',
			nickname : 'deletePolicy',
			produces : [ 'application/json' ],
			parameters : [ {
				"name" : "policyId",
				"description" : "ID of config that needs to be deleted",
				"required" : true,
				"type" : "string",
				"paramType" : "path"
			}]
		}
	};

swagger.addGet(listPolicy).addPost(createPolicy).addPut(updatePolicy).addGet(getPolicy).addDelete(deletePolicy);

 /**
     * RiskFactor API
     *  */
		var listRiskFactors = {
				'spec' : {
					description : 'RiskFactor operations',
				path : '/riskfactor/policy',
				method : 'GET',
				summary : 'Get all RiskFactors',
				notes : '',
				type : 'RiskFactor',
				nickname : 'getRiskFactors',
				produces : [ 'application/json' ],
				params : searchParms
				}
			};
		var createRiskFactor = {
			'spec' : {
				description : 'Create RiskFactor operation',
				path : '/riskfactor/policy',
				method : 'POST',
				summary : 'Create RiskFactor',
				notes : '',
				type : 'RiskFactor',
				nickname : 'createRiskFactor',
				produces : [ 'application/json' ],
				parameters : [ {
					name : 'body',
					description : 'RiskFactor to create.  User will be inferred by the authenticated user.',
					required : true,
					type : 'RiskFactor',
					paramType : 'body',
					allowMultiple : false
				} ]
			}
		};
		var getRiskFactor = {
			'spec' : {
				description : 'RiskFactor show operation',
				path : '/riskfactor/policy/{riskfactorId}',
				method : 'GET',
				summary : 'Get RiskFactor by Id',
				notes : '',
				type : 'RiskFactorSchema',
				nickname : 'getRiskFactor',
				produces : [ 'application/json' ],
				parameters : [ {
					"name" : "riskfactorId",
					"description" : "ID of config that needs to be fetched",
					"required" : true,
					"type" : "string",
					"paramType" : "path"
				} ]
			}
		};
		var updateRiskFactor = {
			'spec' : {
				description : 'RiskFactor update operation',
				path : '/riskfactor/policy/{riskfactorId}',
				method : 'PUT',
				summary : 'update RiskFactor by Id on key values',
				notes : 'Sample Request: {"name": "","description": "","technology": ""}',
				type : 'RiskFactorSchema',
				nickname : 'updateRiskFactor',
				produces : [ 'application/json' ],
				parameters : [ {
					"name" : "riskfactorId",
					"description" : "ID of config that needs to be updated",
					"required" : true,
					"type" : "string",
					"paramType" : "path"
				}, {
					name : 'body',
					description : 'RiskFactor to add.',
					required : true,
					type : 'RiskFactorSchema',
					paramType : 'body',
					allowMultiple : false
				} ]
			}
		};
		var deleteRiskFactor= {
				'spec' : {
					description : 'RiskFactor delete operation',
					path : '/riskfactor/policy/{riskfactorId}',
					method : 'DELETE',
					summary : 'update RiskFactor by Id on key values',
					type : 'RiskFactorSchema',
					nickname : 'deleteRiskFactor',
					produces : [ 'application/json' ],
					parameters : [ {
						"name" : "RiskFactorId",
						"description" : "ID of config that needs to be deleted",
						"required" : true,
						"type" : "string",
						"paramType" : "path"
					}]
				}
		};
		swagger.addGet(listRiskFactors).addPost(createRiskFactor).addPut(updateRiskFactor).addGet(getRiskFactor).addDelete(deleteRiskFactor);
};
