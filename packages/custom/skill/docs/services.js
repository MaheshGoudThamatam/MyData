'use strict';

exports.load = function(swagger, parms) {

	var searchParms = parms.searchableOptions;

	/**
	 * Skill API
	 */
	var listSkill = {
		'spec' : {
			description : 'Skill operations',
			path : '/skill',
			method : 'GET',
			summary : 'Get all Skills',
			notes : '',
			type : 'Skill',
			nickname : 'getSkills',
			produces : [ 'application/json' ],
			params : searchParms
		}
	};

	var createSkill = {
		'spec' : {
			description : 'Create Skill operation',
			path : '/skill',
			method : 'POST',
			summary : 'Create skill',
			notes : '',
			type : 'Skill',
			nickname : 'createSkill',
			produces : [ 'application/json' ],
			parameters : [ {
				name : 'body',
				description : 'Skill to create.  User will be inferred by the authenticated user.',
				required : true,
				type : 'Skill',
				paramType : 'body',
				allowMultiple : false
			} ]
		}
	};
	var getSkill = {
		'spec' : {
			description : 'Badge show operation',
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
	var updateSkill = {
		'spec' : {
			description : 'Skill update operation',
			path : '/skill/{skillId}',
			method : 'PUT',
			summary : 'update Skill by Id on key values',
			notes : 'Sample Request: {"name": "","description": "","keywords": [null],"permissions": [null]}',
			type : 'SkillSchema',
			nickname : 'updateSkill',
			produces : [ 'application/json' ],
			parameters : [ {
				"name" : "skillId",
				"description" : "ID of config that needs to be updated",
				"required" : true,
				"type" : "string",
				"paramType" : "path"
			}, {
				name : 'body',
				description : 'Skill to add.',
				required : true,
				type : 'SkillSchema',
				paramType : 'body',
				allowMultiple : false
			} ]
		}
	};
	var deleteSkill = {
			'spec' : {
				description : 'Skill delete operation',
				path : '/skill/{skillId}',
				method : 'DELETE',
				summary : 'update Skill by Id on key values',
				type : 'SkillSchema',
				nickname : 'deleteSkill',
				produces : [ 'application/json' ],
				parameters : [ {
					"name" : "skillId",
					"description" : "ID of config that needs to be deleted",
					"required" : true,
					"type" : "string",
					"paramType" : "path"
				}]
			}
		};

	swagger.addGet(listSkill).addPost(createSkill).addPut(updateSkill).addGet(getSkill).addDelete(deleteSkill);
	/**
	 * Badge API
	 */
	var listBadge = {
		'spec' : {
			description : 'Badge operations',
			path : '/badge',
			method : 'GET',
			summary : 'Get all badges',
			notes : '',
			type : 'Badge',
			nickname : 'getBadges',
			produces : [ 'application/json' ],
			params : searchParms
		}
	};

	var createBadge = {
		'spec' : {
			description : 'Create Badge operation',
			path : '/badge',
			method : 'POST',
			summary : 'Create badge',
			notes : '',
			type : 'Badge',
			nickname : 'createBadge',
			produces : [ 'application/json' ],
			parameters : [ {
				name : 'body',
				description : 'Badge to create.  User will be inferred by the authenticated user.',
				required : true,
				type : 'Badge',
				paramType : 'body',
				allowMultiple : false
			} ]
		}
	};
	var getBadge = {
		'spec' : {
			description : 'Badge show operation',
			path : '/badge/{badgeId}',
			method : 'GET',
			summary : 'Get badge by Id',
			notes : '',
			type : 'BadgeSchema',
			nickname : 'getBadge',
			produces : [ 'application/json' ],
			parameters : [ {
				"name" : "badgeId",
				"description" : "ID of config that needs to be fetched",
				"required" : true,
				"type" : "string",
				"paramType" : "path"
			} ]
		}
	};
	var updateBadge = {
		'spec' : {
			description : 'Badge update operation',
			path : '/badge/{badgeId}',
			method : 'PUT',
			summary : 'update badge by Id on key values',
			notes : 'Sample Request: {"badgeName": "","description": "","qualifyPoints": "","qualifySkills": ""}',
			type : 'BadgeSchema',
			nickname : 'updateBadge',
			produces : [ 'application/json' ],
			parameters : [ {
				"name" : "badgeId",
				"description" : "ID of config that needs to be updated",
				"required" : true,
				"type" : "string",
				"paramType" : "path"
			}, {
				name : 'body',
				description : 'Badge to add.',
				required : true,
				type : 'BadgeSchema',
				paramType : 'body',
				allowMultiple : false
			} ]
		}
	};
	var deleteBadge = {
			'spec' : {
				description : 'Badge delete operation',
				path : '/badge/{badgeId}',
				method : 'DELETE',
				summary : 'update badge by Id on key values',
				type : 'BadgeSchema',
				nickname : 'deleteBadge',
				produces : [ 'application/json' ],
				parameters : [ {
					"name" : "badgeId",
					"description" : "ID of config that needs to be deleted",
					"required" : true,
					"type" : "string",
					"paramType" : "path"
				}]
			}
		};

	swagger.addGet(listBadge).addPost(createBadge).addPut(updateBadge).addGet(getBadge).addDelete(deleteBadge);
};
