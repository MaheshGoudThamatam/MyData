'use strict';

exports.load = function(swagger, parms) {

  var searchParms = parms.searchableOptions;

  /**
	 * Onlinetest API
	 */
	var listOnlinetest = {
		'spec' : {
			description : 'Onlinetest operations',
			path : '/onlinetest',
			method : 'GET',
			summary : 'Get all Onlinetests',
			notes : '',
			type : 'Onlinetest',
			nickname : 'getOnlinetests',
			produces : [ 'application/json' ],
			params : searchParms
		}
	};

	var createOnlinetest = {
		'spec' : {
			description : 'Create Onlinetest operation',
			path : '/onlinetest',
			method : 'POST',
			summary : 'Create Onlinetest',
			notes : '',
			type : 'Onlinetest',
			nickname : 'createOnlinetest',
			produces : [ 'application/json' ],
			parameters : [ {
				name : 'body',
				description : 'Onlinetest to create.  User will be inferred by the authenticated user.',
				required : true,
				type : 'Onlinetest',
				paramType : 'body',
				allowMultiple : false
			} ]
		}
	};
	var getOnlinetest = {
		'spec' : {
			description : 'Onlinetest show operation',
			path : '/onlinetest/{onlinetestId}',
			method : 'GET',
			summary : 'Get Onlinetest by Id',
			notes : '',
			type : 'OnlinetestSchema',
			nickname : 'getOnlinetest',
			produces : [ 'application/json' ],
			parameters : [ {
				"name" : "onlinetestId",
				"description" : "ID of config that needs to be fetched",
				"required" : true,
				"type" : "string",
				"paramType" : "path"
			} ]
		}
	};
	var updateOnlinetest = {
		'spec' : {
			description : 'Onlinetest update operation',
			path : '/onlinetest/{onlinetestId}',
			method : 'PUT',
			summary : 'update Onlinetest by Id on key values',
			notes : 'Sample Request: {"badgeName": "","description": "","qualifyPoints": "","qualifySkills": ""}',
			type : 'OnlinetestSchema',
			nickname : 'updateOnlinetest',
			produces : [ 'application/json' ],
			parameters : [ {
				"name" : "onlinetestId",
				"description" : "ID of config that needs to be updated",
				"required" : true,
				"type" : "string",
				"paramType" : "path"
			}, {
				name : 'body',
				description : 'Badge to add.',
				required : true,
				type : 'OnlinetestSchema',
				paramType : 'body',
				allowMultiple : false
			} ]
		}
	};
	var deleteOnlinetest = {
			'spec' : {
				description : 'Onlinetest delete operation',
				path : '/onlinetest/{onlinetestId}',
				method : 'DELETE',
				summary : 'update badge by Id on key values',
				type : 'OnlinetestSchema',
				nickname : 'deleteOnlinetest',
				produces : [ 'application/json' ],
				parameters : [ {
					"name" : "onlinetestId",
					"description" : "ID of config that needs to be deleted",
					"required" : true,
					"type" : "string",
					"paramType" : "path"
				}]
			}
		};
	var getSkill = {
			'spec' : {
				description : 'Skill get operation',
				path : '/skill/{skillId}',
				method : 'GET',
				summary : 'Get Skill by Id',
				notes : '',
				type : 'SkillSchema',
				nickname : 'getSkill',
				produces : [ 'application/json' ],
				parameters : [ {
					"name" : "skillId",
					"description" : "ID of config that needs to be fetched",
					"required" : true,
					"type" : "string",
					"paramType" : "path"
				} ]
			}
		};
	var loadOnlineTest={
			'spec' : {
				description : 'skill onlinetest operations',
				path : '/skill/{skillId}/onlinetest',
				method : 'GET',
				summary : 'Get all Onlinetests based on skill',
				notes : '',
				type : 'OnlinetestSchema',
				nickname : 'getSkillOnlinetests',
				produces : [ 'application/json' ],
				params : searchParms,
				parameters : [ {
					"name" : "skillId",
					"description" : "ID of config that needs to be fetched",
					"required" : true,
					"type" : "string",
					"paramType" : "path"
				} ]
			}
			
	};

	swagger.addGet(listOnlinetest).addPost(createOnlinetest).addPut(updateOnlinetest).addGet(getOnlinetest).addDelete(deleteOnlinetest)
	.addGet(getSkill).addGet(loadOnlineTest);

};
