'use strict';

exports.load = function(swagger, parms) {

  var searchParms = parms.searchableOptions;
  /**
	 * Batch API
	 */
	var listBatch = {
		'spec' : {
			description : 'Batch operations',
			path : '/batch',
			method : 'GET',
			summary : 'Get all batches',
			notes : '',
			type : 'Batch',
			nickname : 'getBatches',
			produces : [ 'application/json' ],
			params : searchParms
		}
	};
	var createBatch = {
			'spec' : {
				description : 'Create Batch operation',
				path : '/batch',
				method : 'POST',
				summary : 'Create batch',
				notes : '',
				type : 'Batch',
				nickname : 'createBatch',
				produces : [ 'application/json' ],
				parameters : [ {
					name : 'body',
					description : 'Batch to create.  User will be inferred by the authenticated user.',
					required : true,
					type : 'Batch',
					paramType : 'body',
					allowMultiple : false
				} ]
			}
		};
	var getBatch = {
			'spec' : {
				description : 'Batch show operation',
				path : '/batch/{batchId}',
				method : 'GET',
				summary : 'Get Batch by Id',
				notes : '',
				type : 'BatchSchema',
				nickname : 'getBatch',
				produces : [ 'application/json' ],
				parameters : [ {
					"name" : "batchId",
					"description" : "ID of config that needs to be fetched",
					"required" : true,
					"type" : "string",
					"paramType" : "path"
				} ]
			}
		};
		var updateBatch = {
			'spec' : {
				description : 'Batch update operation',
				path : '/batch/{batchId}',
				method : 'PUT',
				summary : 'update Batch by Id on key values',
				notes : 'Sample Request: { "batch_name": "","start_date": "Date","course": "Object"}',
				type : 'BatchSchema',
				nickname : 'updateBatch',
				produces : [ 'application/json' ],
				parameters : [ {
					"name" : "batchId",
					"description" : "ID of config that needs to be updated",
					"required" : true,
					"type" : "string",
					"paramType" : "path"
				}, {
					name : 'body',
					description : 'Batch to add.',
					required : true,
					type : 'BatchSchema',
					paramType : 'body',
					allowMultiple : false
				} ]
			}
		};
		var deleteBatch = {
				'spec' : {
					description : 'Batch delete operation',
					path : '/batch/{batchId}',
					method : 'DELETE',
					summary : 'Delete batch by Id on key values',
					type : 'BatchSchema',
					nickname : 'deleteBatch',
					produces : [ 'application/json' ],
					parameters : [ {
						"name" : "batchId",
						"description" : "ID of config that needs to be deleted",
						"required" : true,
						"type" : "string",
						"paramType" : "path"
					}]
				}
			};
		
		
  swagger.addGet(listBatch).addPost(createBatch).addGet(getBatch).addPut(updateBatch).addDelete(deleteBatch);
  /**
	 * Course Franchise API
	 */
	var listFranchise = {
		'spec' : {
			description : 'Franchise operations',
			path : '/franchise',
			method : 'GET',
			summary : 'Get all Franchises',
			notes : '',
			type : 'Franchise',
			nickname : 'getFranchises',
			produces : [ 'application/json' ],
			params : searchParms
		}
	};
	var createFranchise = {
			'spec' : {
				description : 'Create Franchise operation',
				path : '/franchise',
				method : 'POST',
				summary : 'Create Franchise',
				notes : '',
				type : 'Franchise',
				nickname : 'createFranchise',
				produces : [ 'application/json' ],
				parameters : [ {
					name : 'body',
					description : 'Franchise to create.  User will be inferred by the authenticated user.',
					required : true,
					type : 'Franchise',
					paramType : 'body',
					allowMultiple : false
				} ]
			}
		};
	var getFranchise = {
			'spec' : {
				description : 'Franchise show operation',
				path : '/franchise/{franchiseId}',
				method : 'GET',
				summary : 'Get Franchise by Id',
				notes : '',
				type : 'FranchiseSchema',
				nickname : 'getFranchise',
				produces : [ 'application/json' ],
				parameters : [ {
					"name" : "franchiseId",
					"description" : "ID of config that needs to be fetched",
					"required" : true,
					"type" : "string",
					"paramType" : "path"
				} ]
			}
		};
		var updateFranchise = {
			'spec' : {
				description : 'Franchise update operation',
				path : '/franchise/{franchiseId}',
				method : 'PUT',
				summary : 'update Franchise by Id on key values',
				notes : 'Sample Request: { "name": "","url": "","email": "","contactDetails": [null]}',
				type : 'FranchiseSchema',
				nickname : 'updateFranchise',
				produces : [ 'application/json' ],
				parameters : [ {
					"name" : "franchiseId",
					"description" : "ID of config that needs to be updated",
					"required" : true,
					"type" : "string",
					"paramType" : "path"
				}, {
					name : 'body',
					description : 'Franchise to add.',
					required : true,
					type : 'FranchiseSchema',
					paramType : 'body',
					allowMultiple : false
				} ]
			}
		};
		var deleteFranchise = {
				'spec' : {
					description : 'Franchise delete operation',
					path : '/franchise/{franchiseId}',
					method : 'DELETE',
					summary : 'Delete Franchise by Id on key values',
					type : 'FranchiseSchema',
					nickname : 'deleteFranchise',
					produces : [ 'application/json' ],
					parameters : [ {
						"name" : "franchiseId",
						"description" : "ID of config that needs to be deleted",
						"required" : true,
						"type" : "string",
						"paramType" : "path"
					}]
				}
			};
		
		
swagger.addGet(listFranchise).addPost(createFranchise).addGet(getFranchise).addPut(updateFranchise).addDelete(deleteFranchise);
/**
 * Course API
 */
var listCourse = {
	'spec' : {
		description : 'Course operations',
		path : '/course',
		method : 'GET',
		summary : 'Get all Courses',
		notes : '',
		type : 'Course',
		nickname : 'getCourses',
		produces : [ 'application/json' ],
		params : searchParms
	}
};

var createCourse = {
	'spec' : {
		description : 'Create Course operation',
		path : '/course',
		method : 'POST',
		summary : 'Create Course',
		notes : '',
		type : 'Course',
		nickname : 'createCourse',
		produces : [ 'application/json' ],
		parameters : [ {
			name : 'body',
			description : 'Course to create.  User will be inferred by the authenticated user.',
			required : true,
			type : 'Course',
			paramType : 'body',
			allowMultiple : false
		} ]
	}
};
var getCourse = {
	'spec' : {
		description : 'Course show operation',
		path : '/course/{courseId}',
		method : 'GET',
		summary : 'Get course by Id',
		notes : '',
		type : 'CourseSchema',
		nickname : 'getCourse',
		produces : [ 'application/json' ],
		parameters : [ {
			"name" : "courseId",
			"description" : "ID of config that needs to be fetched",
			"required" : true,
			"type" : "string",
			"paramType" : "path"
		} ]
	}
};
var updateCourse = {
	'spec' : {
		description : 'Course update operation',
		path : '/course/{courseId}',
		method : 'PUT',
		summary : 'update Course by Id on key values',
		notes : 'Sample Request: {"badgeName": "","description": "","qualifyPoints": "","qualifySkills": ""}',
		type : 'CourseSchema',
		nickname : 'updateCourse',
		produces : [ 'application/json' ],
		parameters : [ {
			"name" : "courseId",
			"description" : "ID of config that needs to be updated",
			"required" : true,
			"type" : "string",
			"paramType" : "path"
		}, {
			name : 'body',
			description : 'Badge to add.',
			required : true,
			type : 'CourseSchema',
			paramType : 'body',
			allowMultiple : false
		} ]
	}
};
var deleteCourse = {
		'spec' : {
			description : 'Course delete operation',
			path : '/course/{courseId}',
			method : 'DELETE',
			summary : 'update Course by Id on key values',
			type : 'CourseSchema',
			nickname : 'deleteCourse',
			produces : [ 'application/json' ],
			parameters : [ {
				"name" : "courseId",
				"description" : "ID of config that needs to be deleted",
				"required" : true,
				"type" : "string",
				"paramType" : "path"
			}]
		}
	};

swagger.addGet(listCourse).addPost(createCourse).addPut(updateCourse).addGet(getCourse).addDelete(deleteCourse);


};
