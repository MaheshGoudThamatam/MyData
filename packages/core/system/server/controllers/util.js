'use strict';
function getPaginationDetails(req) {
    var paginationDetails = {};
    paginationDetails.currentPage = parseInt((req.query.page) ? req.query.page : 0);
    paginationDetails.currentPageSize = parseInt((req.query.pageSize) ? req.query.pageSize : 0);
    return paginationDetails;
}


function modifyPaginationDetails(paginationDetails, CollectionCount) {
    if (CollectionCount) {
        paginationDetails.pageSize = parseInt(paginationDetails.currentPageSize);
        if (CollectionCount % paginationDetails.pageSize === 0) {
            paginationDetails.totalPage = parseInt(CollectionCount / paginationDetails.pageSize);
        }
        else {
            paginationDetails.totalPage = parseInt(CollectionCount / paginationDetails.pageSize) + 1;
        }
        paginationDetails.totalCount = CollectionCount;
    }
    return paginationDetails;
}

function modifyQuery(SchemaModel, req, query) {
    delete req.query.page;
    delete req.query.pageSize;
    
    var queryParams = Object.keys(req.query);
    if (queryParams.length > 0 && Object.keys(query).length == 0) {
        query = { $and: [] };
    }
    
    for (var i = 0; i < queryParams.length; i++) {
        var subQuery = {};
        var data = req.query[queryParams[i]];
        if (SchemaModel.schema.paths[queryParams[i]] && SchemaModel.schema.paths[queryParams[i]].instance === 'Array') {
            if (!(data instanceof Array)) {
                data = [data];
            }
            subQuery[queryParams[i]] = {$elemMatch: {$in: data}};
        } else {
            subQuery[queryParams[i]] = data;
        }
        query.$and.push(subQuery);
    }
    return query;
}

function addPopulateScheme(queryPanel, populateObj) {
    var populateKey = Object.keys(populateObj);
    for (var key = 0; key < populateKey.length; key++) {
        if (populateObj[populateKey[key]] === '') {
            queryPanel.populate(populateKey[key]);
        } else {
            queryPanel.populate(populateKey[key], populateObj[populateKey[key]]);
        }
    }
    return queryPanel;
}

function executePagination(CollectionCount, paginationDetails, SchemaModel, query, field, populateObj, sortCriteria, callback) {
    var skipCount = paginationDetails.currentPageSize * (paginationDetails.currentPage - 1);
    paginationDetails = modifyPaginationDetails(paginationDetails, CollectionCount);
    if (paginationDetails.totalPage < paginationDetails.currentPage) {
        paginationDetails.collection = [];
        callback(paginationDetails);
    } else {
        var queryPanel = SchemaModel.find(query, field, { skip: skipCount, limit: paginationDetails.currentPageSize });
        queryPanel = addPopulateScheme(queryPanel, populateObj);
        if (Object.keys(sortCriteria).length > 0) {
            queryPanel.sort(sortCriteria);
        }
        queryPanel.exec(function (err, collection) {
            if (err) {
                return 'Cannot list the ' + SchemaModel + 's';
            }
            paginationDetails.collection = collection;

            callback(paginationDetails);
        });
    }
}

module.exports = {

    /**
     *    To find the object based on a property and remove it from List(array).
     */
    findAndRemove: function (array, property, value) {
        array.forEach(function (result, index) {
            if (result[property] === value) {
                //Remove from array
                array.splice(index, 1);
            }
        });
    },
    //Checks countries.result for an object with a property of 'id' whose value is 'AF'
    //Then removes it ;p
    //findAndRemove(countries.results, 'id', 'AF');

    /**
     *    To check whether the object is empty or not
     */
    isEmpty: function (obj) {
        // null and undefined are "empty"
        if (obj === null) return true;

        // Assume if it has a length property with a non-zero value
        // that that property is correct.
        if (obj && obj.length && obj.length > 0)    return false;
        if (obj && obj.length && obj.length === 0)  return true;

        // Otherwise, does it have any properties of its own?
        // Note that this doesn't handle
        // toString and toValue enumeration bugs in IE < 9
        for (var key in obj) {
            if (hasOwnProperty.call(obj, key)) return false;
        }
        return true;
    },


    /**
     * List of user as by pagination
     */
    pagination: function (req, res, SchemaModel, query, field, populateObj, callback) {
        var paginationDetails = getPaginationDetails(req);
        query = modifyQuery(SchemaModel, req, query);
        SchemaModel.count(query).exec(function (err, CollectionCount) {
            if (err) {
                return 'Cannot list the ' + SchemaModel + 's';
            }
            executePagination(CollectionCount,paginationDetails,SchemaModel,query,field,populateObj,{},callback);

        });
    },

    paginationSort: function (req, res, SchemaModel, query, field, populateObj, sortCriteria, callback) {
        var paginationDetails = getPaginationDetails(req);
        query = modifyQuery(SchemaModel, req, query);
        SchemaModel.count(query).exec(function (err, CollectionCount) {
            if (err) {
                return 'Cannot list the ' + SchemaModel + 's';
            }
            executePagination(CollectionCount, paginationDetails, SchemaModel, query, field, populateObj, sortCriteria, callback);
        });
    },

    dateYMD: function(date) {
    	return date.getFullYear() + '-' + ('00' + (date.getMonth() + 1)).slice(-2) + '-' + ('00' + date.getDate()).slice(-2);
    },

    getNextDate: function(dateObj) {
    	dateObj.setDate(dateObj.getDate() + 1);
    	return dateObj;
    }
};
