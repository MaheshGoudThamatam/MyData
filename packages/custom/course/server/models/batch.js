'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var validateUniqueBatchName = function(value, callback) {
    var Batch = mongoose.model('Batch');
    Batch.find({
        $and: [{
            batch_name: {
                $regex: new RegExp(value, "i")
            }
        }, {
            _id: {
                $ne: this._id
            }
        }]
    }, function(err, batch) {
        callback(err || batch.length === 0);
    });
};

/**
 * Batch Schema.
 */
var BatchSchema = new Schema({
    batch_name: {
        type: String,
        trim: true,
        required: true,
        unique: true,
        validate: [validateUniqueBatchName, 'Batch already exists']
    },
    start_date: {
        type: Date,
        default: Date.now,
        required: true
    },
    course: {
        type: Schema.ObjectId,
        ref: 'Course'
    },
    branch: {
        type: Schema.ObjectId,
        ref: 'Branch'
    },
    mentor: [{
        type: Schema.ObjectId,
        ref: 'User'
    }],
    batchTimings: {
        mon: [{
            end_time: {
                type: String
            },
            start_time: {
                type: String
            },
            endMM: {
                type: String
            },
            endHH: {
                type: String
            },
            startMM: {
                type: String
            },
            startHH: {
                type: String
            }
        }],
        tue: [{
            end_time: {
                type: String
            },
            start_time: {
                type: String
            },
            endMM: {
                type: String
            },
            endHH: {
                type: String
            },
            startMM: {
                type: String
            },
            startHH: {
                type: String
            }
        }],
        wed: [{
            end_time: {
                type: String
            },
            start_time: {
                type: String
            },
            endMM: {
                type: String
            },
            endHH: {
                type: String
            },
            startMM: {
                type: String
            },
            startHH: {
                type: String
            }
        }],
        thu: [{
            end_time: {
                type: String
            },
            start_time: {
                type: String
            },
            endMM: {
                type: String
            },
            endHH: {
                type: String
            },
            startMM: {
                type: String
            },
            startHH: {
                type: String
            }
        }],
        fri: [{
            end_time: {
                type: String
            },
            start_time: {
                type: String
            },
            endMM: {
                type: String
            },
            endHH: {
                type: String
            },
            startMM: {
                type: String
            },
            startHH: {
                type: String
            }
        }],
        sat: [{
            end_time: {
                type: String
            },
            start_time: {
                type: String
            },
            endMM: {
                type: String
            },
            endHH: {
                type: String
            },
            startMM: {
                type: String
            },
            startHH: {
                type: String
            }
        }],
        sun: [{
            end_time: {
                type: String
            },
            start_time: {
                type: String
            },
            endMM: {
                type: String
            },
            endHH: {
                type: String
            },
            startMM: {
                type: String
            },
            startHH: {
                type: String
            }
        }]
    },
    schedule: [],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    students: [{
        type: Schema.ObjectId,
        ref: 'User'
    }]

});


/**
 * Statics
 */
BatchSchema.statics.load = function(id, callback) {
    this.findOne({
        _id: id
    }).populate('branch','').populate('course','').populate('students', 'name').populate('mentor','').exec(callback);
};

mongoose.model('Batch', BatchSchema);
