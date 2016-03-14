'use strict';
/**
 * Module dependencies.
 */
var utility = require('../../../../core/system/server/controllers/util.js');
require('../../../course/server/models/course.js');
require('../../../curriculum/server/models/coursecurriculum.js');
require('../../../curriculum/server/models/coursetopic.js');
var mongoose = require('mongoose'),
    CourseModel = mongoose.model('Course'),
    BatchModel = mongoose.model('Batch'),
    CourseCurriculumModel = mongoose.model('CourseCurriculum'),
    CourseTopicModel = mongoose.model('CourseTopic'),
    HolidayModel = mongoose.model('Holiday'),
    AttendanceModel = mongoose.model('Attendance'),
    async = require('async'),
    _ = require('lodash');

var getCurriculum = function(courseId, callbackgC) {
	CourseCurriculumModel.find({
            course: courseId
        })
        .populate('topic')
        .populate('test')
        .populate('project')     
        .exec(function(err, curriculum) {
            if (err) {
                return res.status(500).json({
                    error: 'Cannot load curriculum'
                });
            }
            curriculum = curriculum.map(function(item) {
                return item.toObject();
            });
            async.eachSeries(curriculum, function(item, callbackA) {
                if (item.topic) {
                	CourseTopicModel.find({
                            parent: item.topic._id
                        })
                        .exec(function(err, subTopics) {
                            if (err) {
                                console.log(err);
                                callbackA(err);
                            } else {
                                subTopics = subTopics.map(function(subTopic) {
                                    return subTopic.toObject();
                                });
                                item.topic.subTopics = subTopics;
                                callbackA();
                            }
                        });
                } else {
                    callbackA();
                }
            }, function(err) {
                if (err) {
                    console.log(err);
                    callbackgC(err);
                } else {
                    callbackgC(null, curriculum);
                }
            });
        });
};

var getHolidays = function(batchStartDate, callbackgH) {
    HolidayModel.find({
        start_date: {
            $gt: batchStartDate
        }
    }).exec(function(err, holidays) {
        if (err) {
            console.log(err);
            callbackgH(err);
        } else {
            callbackgH(null, holidays);
        }
    });
};

var formatHolidays = function(holidays, callbackfH) {
    var allHolidays = [];
    async.eachSeries(holidays, function(holiday, callbackH) {
        if (holiday.start_date === holiday.end_date) {
            var event = {
                date: utility.dateYMD(holiday.start_date),
                desc: holiday.name
            }
            allHolidays.push(event);
            callbackH();
        } else {
            while (holiday.end_date >= holiday.start_date) {
                var event = {
                    date: utility.dateYMD(holiday.start_date),
                    desc: holiday.name
                }
                allHolidays.push(event);
                holiday.start_date = utility.getNextDate(holiday.start_date);
            }
            callbackH();
        }
    }, function(err) {
        if (err) {
            console.log(err);
            callbackfH(err);
        } else {
            callbackfH(null, allHolidays);
        }
    });
}

var isHoliday = function(dateYMD, holidays) {
    var isHoliday = false;
    for (var i = 0; i < holidays.length; i++) {
        if (dateYMD === holidays[i].date) {
            isHoliday = true;
        }
    }
    return isHoliday;
};

var getValidDate = function(dateYMD, holidays) {
    //TODO: Function should be expanded to include the "excluded" dates
    if (!isHoliday(dateYMD, holidays)) {
        return dateYMD;
    }
    return getValidDate(utility.dateYMD(utility.getNextDate(new Date(dateYMD))), holidays);
}

var formatBatchTimings = function(batchTimings, callbackfBT) {
    var batchSlots = {};
    async.forEachOfSeries(batchTimings, function(value, key, callbackBT) {
        if (!Array.isArray(batchSlots[key])) {
            batchSlots[key] = [];
        }
        for (var i = 0; i < value.length; i++) {
            if (value[i].start_time) {
                var slot = {
                    startTime: value[i].start_time,
                    endTime: value[i].end_time
                }
                batchSlots[key].push(slot);
            }
        }
        callbackBT();
    }, function(err) {
        if (err) {
            console.log(err);
            callbackfBT(err);
        } else {
            callbackfBT(null, batchSlots);
        }
    });
};

var getDateSlots = function(date, batchTimings) {
    var days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    var batchSlots = [];
    for (var i = 0; i < batchTimings[days[date.getDay()]].length; i++) {
        batchSlots.push(batchTimings[days[date.getDay()]][i]);
    }
    return batchSlots;
};


var getTimeSlotDuration = function(timeSlot) {
    var start = new Date('2016-01-01T' + timeSlot.startTime);
    var end = new Date('2016-01-01T' + timeSlot.endTime);

    var diff = end - start;
    return diff / (1000 * 60);
};

var getDateDuration = function(date, batchTimings) {
    var dateSlots = getDateSlots(date, batchTimings);

    if (dateSlots.length === 0) {
        var dateDuration = {};
        dateDuration.date = utility.dateYMD(date);
        dateDuration.slots = [];
    } else {
        var dateDuration = {};
        dateDuration.date = utility.dateYMD(date);
        for (var i = 0; i < dateSlots.length; i++) {
            dateSlots[i].duration = getTimeSlotDuration(dateSlots[i]);
        }
        dateDuration.slots = dateSlots;
    }
    return dateDuration;
};

var formatCurriculum = function(curriculum, callbackfC) {
    async.eachSeries(curriculum, function(item, callbackC) {
        if (item.topic) {
            for (var i = 0; i < item.topic.subTopics.length; i++) {
                item.topic.subTopics[i].duration = (item.topic.subTopics[i].AssignmentHrs * 60) + (item.topic.subTopics[i].labHrs * 60) + (item.topic.subTopics[i].sessionHrs * 60);
            }
        } else if (item.test) {
            item.test.duration = item.test.duration * 60;
        } else if (item.project) {
            //TODO: Remove hardcoding (add hours when creating project)
            item.project.duration = 60;
        }
        callbackC();
    }, function(err) {
        if (err) {
            console.log(err);
            callbackfC(err);
        } else {
            callbackfC(null, curriculum);
        }
    })
}

var scheduleBatch = function(courseCurriculum, startDate, batchTimings, allHolidays, callbackSB) {
    var workDate = new Date(getValidDate(startDate, allHolidays));
    workDate.setHours(0, 0, 0, 0);
    var workDateDuration = getDateDuration(workDate, batchTimings);

    async.eachSeries(courseCurriculum, function(curriculum, callbackA) {
        curriculum.slots = [];
        curriculum.startDate = utility.dateYMD(workDate);

        if (curriculum.test) {
            curriculum.test.slots = [];
            while (curriculum.test.duration > 0) {
                if (workDateDuration.slots.length <= 0) {
                    workDate.setDate(workDate.getDate() + 1);
                    workDate = new Date(getValidDate(utility.dateYMD(workDate), allHolidays));
                    workDate.setHours(0, 0, 0, 0);
                    workDateDuration = getDateDuration(workDate, batchTimings);
                } else {
                    while (curriculum.test.duration > 0 && workDateDuration.slots.length > 0) {
                        if (curriculum.test.duration == workDateDuration.slots[0].duration) {
                            curriculum.test.duration = 0;
                            var slot = {
                                date: utility.dateYMD(workDate),
                                slot: workDateDuration.slots[0]
                            };
                            workDateDuration.slots.splice(0, 1);
                            curriculum.test.slots.push(slot);
                        } else if (curriculum.test.duration < workDateDuration.slots[0].duration) {
                            workDateDuration.slots[0].duration = workDateDuration.slots[0].duration - curriculum.test.duration;
                            curriculum.test.duration = 0;
                            var slot = {
                                date: utility.dateYMD(workDate),
                                slot: workDateDuration.slots[0]
                            };
                            curriculum.test.slots.push(slot);
                        } else if (curriculum.test.duration > workDateDuration.slots[0].duration) {
                            curriculum.test.duration = curriculum.test.duration - workDateDuration.slots[0].duration;
                            var slot = {
                                date: utility.dateYMD(workDate),
                                slot: workDateDuration.slots[0]
                            };
                            curriculum.test.slots.push(slot);
                            workDateDuration.slots.splice(0, 1);
                        } else {
                            console.log('unknown processing condition');
                            break;
                        }
                    }
                }
            }
            callbackA();
        } else if (curriculum.project) {
            curriculum.project.slots = [];
            while (curriculum.project.duration > 0) {
                if (workDateDuration.slots.length <= 0) {
                    workDate.setDate(workDate.getDate() + 1);
                    workDate = new Date(getValidDate(utility.dateYMD(workDate), allHolidays));
                    workDate.setHours(0, 0, 0, 0);
                    workDateDuration = getDateDuration(workDate, batchTimings);
                } else {
                    while (curriculum.project.duration > 0 && workDateDuration.slots.length > 0) {
                        if (curriculum.project.duration == workDateDuration.slots[0].duration) {
                            curriculum.project.duration = 0;
                            var slot = {
                                date: utility.dateYMD(workDate),
                                slot: workDateDuration.slots[0]
                            };
                            workDateDuration.slots.splice(0, 1);
                            curriculum.project.slots.push(slot);
                        } else if (curriculum.project.duration < workDateDuration.slots[0].duration) {
                            workDateDuration.slots[0].duration = workDateDuration.slots[0].duration - curriculum.project.duration;
                            curriculum.project.duration = 0;
                            var slot = {
                                date: utility.dateYMD(workDate),
                                slot: workDateDuration.slots[0]
                            };
                            curriculum.project.slots.push(slot);
                        } else if (curriculum.project.duration > workDateDuration.slots[0].duration) {
                            curriculum.project.duration = curriculum.project.duration - workDateDuration.slots[0].duration;
                            var slot = {
                                date: utility.dateYMD(workDate),
                                slot: workDateDuration.slots[0]
                            };
                            curriculum.project.slots.push(slot);
                            workDateDuration.slots.splice(0, 1);
                        } else {
                            console.log('unknown processing condition');
                            break;
                        }
                    }
                }
            }
            callbackA();
        } else if (curriculum.topic) {
            async.eachSeries(curriculum.topic.subTopics, function(subTopic, callbackB) {
                subTopic.slots = [];
                while (subTopic.duration > 0) {
                    if (workDateDuration.slots.length <= 0) {
                        workDate.setDate(workDate.getDate() + 1);
                        workDate = new Date(getValidDate(utility.dateYMD(workDate), allHolidays));
                        workDate.setHours(0, 0, 0, 0);
                        workDateDuration = getDateDuration(workDate, batchTimings);
                    } else {
                        while (subTopic.duration > 0 && workDateDuration.slots.length > 0) {
                            if (subTopic.duration == workDateDuration.slots[0].duration) {
                                subTopic.duration = 0;
                                var slot = {
                                    date: utility.dateYMD(workDate),
                                    slot: workDateDuration.slots[0]
                                };
                                workDateDuration.slots.splice(0, 1);
                                subTopic.slots.push(slot);
                            } else if (subTopic.duration < workDateDuration.slots[0].duration) {
                                workDateDuration.slots[0].duration = workDateDuration.slots[0].duration - subTopic.duration;
                                subTopic.duration = 0;
                                var slot = {
                                    date: utility.dateYMD(workDate),
                                    slot: workDateDuration.slots[0]
                                };
                                subTopic.slots.push(slot);
                            } else if (subTopic.duration > workDateDuration.slots[0].duration) {
                                subTopic.duration = subTopic.duration - workDateDuration.slots[0].duration;
                                var slot = {
                                    date: utility.dateYMD(workDate),
                                    slot: workDateDuration.slots[0]
                                };
                                subTopic.slots.push(slot);
                                workDateDuration.slots.splice(0, 1);
                            } else {
                                console.log('unknown processing condition');
                                callbackA();
                            }
                        }
                    }
                }
                callbackB();
            }, function(err) {
                if (err) {
                    console.log(err);
                }
                curriculum.endDate = utility.dateYMD(workDate);
                callbackA();
            });
        } else {
            console.log('unknown curriculum object')
            callbackA();
        }

    }, function(err) {
        if (err) {
            console.log(err);
        }
        callbackSB(null, courseCurriculum);
    });
};

var processBatchSchedule = function(batchCourse, batchStartDate, batchSlotTimings, callbackpBS) {
    var courseCurriculum = [];
    var allHolidays = [];
    var batchTimings = [];
    var startDate = utility.dateYMD(batchStartDate);
    var batchSlots = [];
    async.waterfall([
        async.apply(formatBatchTimings, batchSlotTimings),
        function(batchTimingSlots, callbackPass) {
            batchTimings = batchTimingSlots;
            callbackPass(null, batchCourse);
        },
        getCurriculum,
        formatCurriculum,
        function(curriculum, callbackPass) {
            courseCurriculum = curriculum;
            callbackPass(null, batchStartDate);
        },
        getHolidays,
        formatHolidays,
        function(holidays, callbackPass) {
            allHolidays = holidays;
            callbackPass(null, courseCurriculum, startDate, batchTimings, allHolidays);
        },
        scheduleBatch,
        function(courseCurriculum, callbackPass) {
            callbackPass(null, courseCurriculum);
        }
    ], function(err, courseCurriculum) {
        callbackpBS(null, courseCurriculum);
    });
};

module.exports = function(Batch) {
    return {
        batchSchedules: function(req, res) {
            processBatchSchedule(req.batch.course, req.batch.start_date, req.batch.batchTimings.toObject(), function(err, schedule) {
                res.json(schedule);
            });
        },
        /**
         * Find course by id
         */
        course: function(req, res, next, id) {
            CourseModel.load(id, function(err, course) {
                if (err) return next(err);
                if (!course) return next(new Error('Failed to load course ' + id));
                req.course = course;
                next();
            });
        },
        batch: function(req, res, next, id) {
            BatchModel.load(id, function(err, batch) {
                if (err) return next(err);
                if (!batch) return next(new Error('Failed to load batch ' + id));
                req.batch = batch;
                next();
            });
        },
        /**
         * Create an batch
         */
        create: function(req, res) {
            var batch = new BatchModel(req.body);
            req.assert('batch_name', 'Please enter  Name').notEmpty();
            req.assert('start_date', 'start_date should not be empty').notEmpty();
            req.assert('course', 'Please create a batch for list of available courses.').notEmpty();
            //req.assert('class_hour', 'You must enter class hour').notEmpty();
            var errors = req.validationErrors();
            if (errors) {
                return res.status(400).send(errors);
            }
            var errors = [];
            errors.concat(req.validationErrors());
            var d = new Date();
            var d1 = new Date(req.body.start_date);
            if (d1 < d) {
                var dateError = {
                    msg: "Start date should be greater than current date",
                    param: "start_date"
                };
                errors.push(dateError);
            }
            if (errors.length > 0) {
                return res.status(400).send(errors);
            }
            batch.save(function(err) {
                if (err) {
                    switch (err.code) {
                        case 11000:
                        case 11001:
                            res.status(400).json([{
                                msg: ' Name already exists',
                                param: 'name'
                            }]);
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
                                console.log('mod' + modelErrors);
                                res.status(400).json(modelErrors);
                            }
                    }
                    return res.status(400);
                }
                processBatchSchedule(batch.course, batch.start_date, batch.batchTimings.toObject(), function(err, schedule) {
                    batch.schedule = schedule;
                    batch.save(function(err) {
                        if (err) {
                            var modelErrors = [];
                            if (err.errors) {
                                for (var x in err.errors) {
                                    modelErrors.push({
                                        param: x,
                                        msg: err.errors[x].message,
                                        value: err.errors[x].value
                                    });
                                }
                                console.log('Unable to create batch schedule' + modelErrors);
                                res.status(500).json(modelErrors);
                            }
                        }
                        res.json(batch);
                    });
                });
            });
        },
        /**
         * Update an batch
         */
        update: function(req, res) {
            var batch = req.batch;
            batch = _.extend(batch, req.body);
            req.assert('batch_name', 'Please enter  Name').notEmpty();
            req.assert('start_date', 'start_date should not be empty').notEmpty();
            req.assert('course', 'courseId is not available').notEmpty();
            var errors = req.validationErrors();
            if (errors) {
                return res.status(400).send(errors);
            }
            batch.save(function(err) {
                if (err) {
                    switch (err.code) {
                        case 11000:
                        case 11001:
                            res.status(400).json([{
                                msg: 'Name already exists',
                                param: 'name'
                            }]);
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
                                console.log('mod' + modelErrors);
                                res.status(400).json(modelErrors);
                            }
                    }
                    return res.status(400);
                }
                processBatchSchedule(batch.course, batch.start_date, batch.batchTimings.toObject(), function(err, schedule) {
                    batch.schedule = schedule;
                    batch.save(function(err) {
                        if (err) {
                            var modelErrors = [];
                            if (err.errors) {
                                for (var x in err.errors) {
                                    modelErrors.push({
                                        param: x,
                                        msg: err.errors[x].message,
                                        value: err.errors[x].value
                                    });
                                }
                                console.log('Unable to create batch schedule' + modelErrors);
                                res.status(500).json(modelErrors);
                            }
                        }
                        res.json(batch);
                    });
                });
            });
        },
        /**
         * Delete a batch
         */
        destroy: function(req, res) {
            var batch = req.batch;
            batch.remove(function(err) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot delete the batch'
                    });
                }
                res.json(batch);
            });
        },
        /**
         * Show an batch
         */
        show: function(req, res) {
            res.json(req.batch);
        },
        /**
         * List of batch
         */
        all: function(req, res) {
            BatchModel.find().exec(function(err, batches) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot list the batch'
                    });
                }
                res.json(batches);
            });
        },
        /**
         * List of batch as by pagination
         */
        batchListByPagination: function(req, res) {
            var populateObj = {
                'branch': '',
                'course': '',
                'mentor':''
            };
            utility.pagination(req, res, BatchModel, {}, {}, populateObj, function(result) {
                if (utility.isEmpty(result.collection)) {
                    //res.json(result);
                }
                return res.json(result);
            });
        },
        saveattendance: function(req, res) {
            async.each(req.body.students, function(studentdetails) {
                var attendancdetaails = {};
                attendancdetaails.batch_id = req.body._id;
                attendancdetaails.date = req.body.date;
                attendancdetaails.student_id = studentdetails._id;
                attendancdetaails.attended = studentdetails.attended;
                var attendance = new AttendanceModel(attendancdetaails);
                attendance.save(function(err) {
                    if (err) {
                        console.log(err);
                    }
                });
            });
            res.send(200);
        },
        checkattendance: function(req, res) {
            var date = new Date(req.query.date);
            var batch_id = req.query.batch_id;
            AttendanceModel.find({
                batch_id: batch_id,
                date: new Date(date)
            }, function(err, items) {
                if (err) {
                    console.log(err);
                } else {
                    res.send(items);
                }
            }).populate('student_id', 'name').populate('batch_id', 'batch_name').populate('mentor');
        },
        updateattendace: function(req, res) {
            async.waterfall([
                function(done) {
                    async.each(req.body.attendance, function(studentdetails,callback) {
                        var date = new Date(req.body.date);
                        AttendanceModel.findOne({date:new Date(date),student_id:studentdetails.student_id._id},function(err,attendanceupdatingobject){
                                  attendanceupdatingobject.attended=studentdetails.attended;
                                  attendanceupdatingobject.comment=studentdetails.comment;
                                  attendanceupdatingobject.save(function(err){
                                       if (err){
                                               console.log(err);
                                              }
                                  });   
                        });
                      callback();
                    });
                    done();
                },
                function(done) {
                    done();
                }
            ], function(err) {
                res.send(200);
            });
        }
    };
}
