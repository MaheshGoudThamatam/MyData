'use strict';

module.exports = {
    exportErrorResponse: function (res, err, customError) {
        switch (err.code) {
            case 11000:
            case 11001:
                res.status(400).json([customError]);
                break;
            default:
                var modelErrors = [];
                if (err.errors) {
                    for (var x in err.errors) {
                        modelErrors.push({
                            param: x,
                            msg: err.errors[x].message,
                            value: err.errors[x].value
                        });
                    }
                    res.status(400).json(modelErrors);
                }
        }
        res.status(400);
    },
    hasPermission: function (req, feature) {
        for (var i = 0; i < req.user.role.length; i++) {
            if (req.user.role[i].features) {
                for (var j = 0; j < req.user.role[i].features.length; j++) {
                    if (req.user.role[i].features[j].name === feature) {
                        return true;
                    }
                }
            }
        }
        return false;
    },
    modifyQuery: function (SchemaModel, req, query) {
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
    },
    insertInArray: function(arrayObj,obj){
        var index = arrayObj.indexOf(obj._id);
        if (index == -1) {
            arrayObj.push(obj._id);
        } else {
            arrayObj.splice(index, 1);
        }
        return arrayObj;
    }
};