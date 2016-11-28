'use strict';
/**
 * Name : CRON  : In this controller CRON'S are created
 * @ <author>
 * Sanjana @ <date> 01-Sep-2016 @ METHODS: overdueAuditCRON,Audit7dayCRON,overdueTaskCRON,task7dayCRON,socketCRON
 */
/**
 * Module dependencies.
 */
require('../../../socket/server/models/socket');
var mongoose = require('mongoose'),
    mail = require('../../../../contrib/meanio-system/server/services/mailService.js'),
    nodemailer = require('nodemailer'),
    templates = require('../../../../custom/actsec/server/config/cron_template.js'),
    CompanyModel = mongoose.model('Company'),
    SocketModel = mongoose.model('Socket'),
    logger = require('../../../../contrib/meanio-system/server/controllers/logs.js'),
    _ = require('lodash');
var async = require('async');
var UserModel = mongoose.model('User');
var config = require('../../../../custom/actsec/server/config/config.js');
var mockReq =  {
        connection: {
            remoteAddress: 'X.X.X.X'
        },
        method: 'CRON',
        url: '',
        headers: []
    };

module.exports = function() {
    return {

        overdueAuditCRON: function() {
            CompanyModel.find({}, function(err, companies) {
                if (err) {
                    logger.error(mockReq, "SYSTEM", "company", "Failed to fetch company", company, err);
                } else {
                    var today = new Date();
                    async.each(companies, function(company, companyCallback) {
                        if (err) {
                            logger.error(mockReq, "SYSTEM", "company", "Failed to fetch company", company, err);
                            companyCallback();
                        } else {
                            var companyDb = mongoose.createConnection('mongodb://localhost:27017/' + company.database);
                            require('../../../audit/server/models/audit')(companyDb);
                            var AuditModel = companyDb.model('Audit');
                            AuditModel.find({ date: { $lt: today } }, function(err, audits) {
                                if (err) {
                                    logger.error(mockReq, "SYSTEM", "audit", "Failed to fetch audit", audit, err);
                                    companyCallback();
                                } else {
                                    if (audits.length > 0) {
                                        UserModel.find({
                                            company: company._id,
                                            role: config.roles.SECURITY_MANAGER
                                        }, function(err, securitymanagers) {
                                            async.each(securitymanagers, function(manager, callbackManager) {
                                                var email = templates.auditRemainder(manager);
                                                mail.mailService(email, manager.email);
                                                callbackManager();
                                            }, function(err) {
                                                companyCallback();
                                            })
                                        })
                                    } else {
                                        companyCallback();
                                    }
                                }
                            })
                        }
                    }, function(err) {
                        logger.log(mockReq, "SYSTEM", "cron", "over due cron running successfull", {});
                    })
                }
            })

        },

        Audit7dayCRON: function() {
            CompanyModel.find({}, function(err, companies) {
                if (err) {
                    logger.error(mockReq, "SYSTEM", "company", "Failed to fetch company", company, err);
                } else {
                    var today = new Date();
                    var t = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
                    async.each(companies, function(company, companyCallback) {
                        if (err) {
                            logger.error(mockReq, "SYSTEM", "company", "Failed to fetch company", company, err);
                            companyCallback();
                        } else {
                            var companyDb = mongoose.createConnection('mongodb://localhost:27017/' + company.database);
                            require('../../../audit/server/models/audit')(companyDb);
                            var AuditModel = companyDb.model('Audit');
                            UserModel.find({
                                company: company._id,
                                role: config.roles.SECURITY_MANAGER
                            }, function(err, users) {
                                async.each(users, function(user, userCallback) {
                                    if (err) {
                                        logger.error(mockReq, "SYSTEM", "user", "Failed to fetch user", user, err);
                                        userCallback();
                                    } else {
                                        AuditModel.find({ date: { $gt: today, $lte: t }, security_manager: user._id }, function(err, audits) {
                                            if (err) {
                                                logger.error(mockReq, "SYSTEM", "audit", "Failed to fetch audit", audit, err);
                                                userCallback();
                                            } else {
                                                var email = templates.auditRemainder(user);
                                                mail.mailService(email, user.email);
                                                userCallback();
                                            }
                                        })
                                    }
                                }, function(err) {
                                    companyCallback();
                                })
                            })
                        }
                    }, function(err) {
                        logger.log(mockReq, "SYSTEM", "cron", "audit cron running successfull", {});
                    })
                }
            })

        },

        overdueTaskCRON: function() {
            CompanyModel.find({}, function(err, companies) {
                if (err) {
                    logger.error(mockReq, "SYSTEM", "company", "Failed to fetch company", company, err);
                } else {
                    var today = new Date();
                    async.each(companies, function(company, companyCallback) {
                        var proceed = false;
                        if (err) {
                            logger.error(mockReq, "SYSTEM", "company", "Failed to fetch company", company, err);
                            companyCallback();
                        } else {
                            var companyDb = mongoose.createConnection('mongodb://localhost:27017/' + company.database);
                            require('../../../securitytasks/server/models/securityTask')(companyDb);
                            var SecurityTaskModel = companyDb.model('SecurityTask');
                            SecurityTaskModel.find({ deadline: { $lt: today } }, function(err, securitytasks) {
                                if (err) {
                                    logger.error(mockReq, "SYSTEM", "security task", "Failed to fetch security task", securitytask, err);
                                    companyCallback();
                                } else {
                                    if (securitytasks.length > 0) {
                                        proceed = true;
                                    } else {
                                        companyCallback();
                                    }
                                }
                                if (proceed) {
                                    async.each(securitytasks, function(securitytask, taskCallback) {
                                        var resp = false;
                                        var follow = false;
                                        if (err) {
                                            logger.error(mockReq, "SYSTEM", "security task", "Failed to fetch security task", securitytask, err);
                                            taskCallback();
                                        } else {
                                            if (securitytask.responsible_action) {
                                                UserModel.findOne({ _id: securitytask.responsible_action }, function(err, user) {
                                                    if (err) {
                                                        logger.error(mockReq, "SYSTEM", "user", "Failed to fetch user", user, err);
                                                        taskCallback();
                                                    } else {
                                                        var resp_action = user;
                                                        resp = true;
                                                        if (securitytask.responsible_followUp) {
                                                            UserModel.findOne({ _id: securitytask.responsible_followUp }, function(err, userObj) {
                                                                if (err) {
                                                                    logger.error(mockReq, "SYSTEM", "user", "Failed to fetch user", user, err)
                                                                    taskCallback();
                                                                } else {
                                                                    var follow_up = userObj;
                                                                    follow = true;
                                                                }
                                                                if (resp && follow) {
                                                                    var email = templates.securityTaskRemainder(resp_action);
                                                                    mail.mailService(email, resp_action.email);
                                                                    var email = templates.securityTaskRemainder(userObj);
                                                                    mail.mailService(email, userObj.email);
                                                                    taskCallback();
                                                                } else
                                                                if (follow) {
                                                                    var email = templates.securityTaskRemainder(userObj);
                                                                    mail.mailService(email, userObj.email);
                                                                    taskCallback();
                                                                } else
                                                                if (resp) {
                                                                    var email = templates.securityTaskRemainder(resp_action);
                                                                    mail.mailService(email, resp_action.email);
                                                                    taskCallback();
                                                                }
                                                            })
                                                        }
                                                    }
                                                })
                                            }
                                        }
                                    }, function(err) {
                                        companyCallback();
                                    })
                                }
                            })
                        }
                    }, function(err) {
                        logger.log(mockReq, "SYSTEM", "cron", "over due security task cron running successfull", {})
                    })
                }
            })

        },

        task7dayCRON: function() {
            CompanyModel.find({}, function(err, companies) {
                if (err) {
                    logger.error(mockReq, "SYSTEM", "company", "Failed to fetch company", company, err);
                } else {
                    var today = new Date();
                    var t = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
                    async.each(companies, function(company, companyCallback) {
                        var proceed = false;
                        if (err) {
                            logger.error(mockReq, "SYSTEM", "company", "Failed to fetch company", company, err);
                            companyCallback();
                        } else {
                            var companyDb = mongoose.createConnection('mongodb://localhost:27017/' + company.database);
                            require('../../../securitytasks/server/models/securityTask')(companyDb);
                            var SecurityTaskModel = companyDb.model('SecurityTask');
                            SecurityTaskModel.find({ deadline: { $gt: today, $lte: t } }, function(err, securitytasks) {
                                if (err) {
                                    logger.error(mockReq, "SYSTEM", "security task", "Failed to fetch security task", securitytask, err);
                                    companyCallback();
                                } else {
                                    if (securitytasks.length > 0) {
                                        proceed = true;
                                    } else {
                                        companyCallback();
                                    }
                                }
                                if (proceed) {
                                    async.each(securitytasks, function(securitytask, taskCallback) {
                                        var resp = false;
                                        var follow = false;
                                        if (err) {
                                            logger.error(mockReq, "SYSTEM", "security task", "Failed to fetch security task", securitytask, err);
                                            taskCallback();
                                        } else {
                                            if (securitytask.responsible_action) {
                                                UserModel.findOne({ _id: securitytask.responsible_action }, function(err, user) {
                                                    if (err) {
                                                        logger.error(mockReq, "SYSTEM", "user", "Failed to fetch user", user, err);
                                                        taskCallback();
                                                    } else {
                                                        var resp_action = user;
                                                        resp = true;
                                                        if (securitytask.responsible_followUp) {
                                                            UserModel.findOne({ _id: securitytask.responsible_followUp }, function(err, userObj) {
                                                                if (err) {
                                                                    logger.error(mockReq, "SYSTEM", "user", "Failed to fetch user", user, err);
                                                                    taskCallback();
                                                                } else {
                                                                    var follow_up = userObj;
                                                                    follow = true;
                                                                }
                                                                if (resp && follow) {
                                                                    var email = templates.securityTaskRemainder(resp_action);
                                                                    mail.mailService(email, resp_action.email);
                                                                    var email = templates.securityTaskRemainder(userObj);
                                                                    mail.mailService(email, userObj.email);
                                                                    taskCallback();
                                                                } else
                                                                if (follow) {
                                                                    var email = templates.securityTaskRemainder(userObj);
                                                                    mail.mailService(email, userObj.email);
                                                                    taskCallback();
                                                                } else
                                                                if (resp) {
                                                                    var email = templates.securityTaskRemainder(resp_action);
                                                                    mail.mailService(email, resp_action.email);
                                                                    taskCallback();
                                                                }
                                                            })
                                                        }
                                                    }
                                                })
                                            }
                                        }
                                    }, function(err) {
                                        companyCallback();
                                    })
                                }
                            })
                        }
                    }, function(err) {
                        logger.log(mockReq, "SYSTEM", "cron", "security task cron running successfull", {});
                    })
                }
            })

        },

        socketCRON: function() {
            var today = new Date();
            var t = new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000);
            SocketModel.find({ createdAt: { $lt: t } }, function(err, sockets) {
                if (err) {
                    logger.error(mockReq, "SYSTEM", "socket", "Failed to fetch socket", socket, err);
                } else {
                    async.each(sockets, function(socket, socketCallback) {
                        if (err) {
                            logger.error(mockReq, "SYSTEM", "socket", "Failed to fetch socket", socket, err);
                            socketCallback();
                        } else {
                            if (sockets.length > 0) {
                                socket.remove(function(err) {
                                    if (err) {
                                        logger.error(mockReq, "SYSTEM", "socket", "Failed to delete socket", socket, err);
                                        socketCallback();
                                    }
                                    socketCallback();
                                })
                            }
                        }
                    }, function(err) {
                        logger.log(mockReq, "SYSTEM", "socket", "socket cron running successfully", {});
                    })
                }
            })
        },


        cameraSystem7dayCRON: function() {
            CompanyModel.find({}, function(err, companies) {
                if (err) {
                    logger.error(mockReq, "SYSTEM", "company", "Failed to fetch company", company, err);
                } else {
                    var today = new Date();
                    var t = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
                    async.each(companies, function(company, companyCallback) {
                        if (err) {
                            logger.error(mockReq, "SYSTEM", "company", "Failed to fetch company", company, err);
                            companyCallback();
                        } else {
                            var companyDb = mongoose.createConnection('mongodb://localhost:27017/' + company.database);
                            require('../../../assets/server/models/cameraSystem')(companyDb);
                            var CameraSystemModel = companyDb.model('CameraSystem');
                            CameraSystemModel.find({ contract_validity: { $gt: today, $lt: t } }, function(err, cameraSystems) {
                                if (err) {
                                    logger.error(mockReq, "SYSTEM", "company", "Failed to fetch camera", company, err);
                                    companyCallback();
                                } else {
                                    async.each(cameraSystems, function(cameraSystem, callback) {
                                        if (err) {
                                            logger.error(mockReq, "SYSTEM", "company", "Failed to fetch cameraSystem", company, err);
                                            callback();
                                        } else {
                                            var email = templates.contract_cancel(cameraSystem);
                                            var contractperson = cameraSystem.contractPersonEmail;
                                            mail.mailService(email, contractperson.email);
                                            callback();
                                        }
                                    }, function(err) {
                                        companyCallback();
                                    })
                                }

                            })
                        }
                    }, function(err) {
                        logger.log(mockReq, "SYSTEM", "cron", "camera system 7 day cron running successfull", {});
                    })
                }
            })

        },
        cameraSystem3dayCRON: function() {
            CompanyModel.find({}, function(err, companies) {
                if (err) {
                    logger.error(mockReq, "SYSTEM", "company", "Failed to fetch company", company, err);
                } else {
                    var today = new Date();
                    var t = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000)
                    async.each(companies, function(company, companyCallback) {
                        if (err) {
                            logger.error(mockReq, "SYSTEM", "company", "Failed to fetch company", company, err);
                            companyCallback();
                        } else {
                            var companyDb = mongoose.createConnection('mongodb://localhost:27017/' + company.database);
                            require('../../../assets/server/models/cameraSystem')(companyDb);
                            var CameraSystemModel = companyDb.model('CameraSystem');
                            CameraSystemModel.find({ contract_validity: { $gt: today, $lt: t } }, function(err, cameraSystems) {
                                if (err) {
                                    logger.error(mockReq, "SYSTEM", "company", "Failed to fetch camera", company, err);
                                    companyCallback();
                                } else {
                                    async.each(cameraSystems, function(cameraSystem, callback) {
                                        if (err) {
                                            logger.error(mockReq, "SYSTEM", "company", "Failed to fetch cameraSystem", company, err);
                                            callback();
                                        } else {
                                            var email = templates.contract_cancel(cameraSystem);
                                            var contractperson = cameraSystem.contractPersonEmail;
                                            mail.mailService(email, contractperson.email);
                                            callback();
                                        }
                                    }, function(err) {
                                        companyCallback();
                                    })
                                }

                            })
                        }
                    }, function(err) {
                        logger.log(mockReq, "SYSTEM", "cron", "camera system 3 day cron running successfull", {});
                    })
                }
            })

        },

        cameraSystemOndayCRON: function() {
            CompanyModel.find({}, function(err, companies) {
                if (err) {
                    logger.error(mockReq, "SYSTEM", "company", "Failed to fetch company", company, err);
                } else {
                    var today = new Date();
                    today.setHours(0, 0, 0, 0);
                    async.each(companies, function(company, companyCallback) {
                        if (err) {
                            logger.error(mockReq, "SYSTEM", "company", "Failed to fetch company", company, err);
                            companyCallback();
                        } else {
                            var companyDb = mongoose.createConnection('mongodb://localhost:27017/' + company.database);
                            require('../../../assets/server/models/cameraSystem')(companyDb);
                            var CameraSystemModel = companyDb.model('CameraSystem');
                            CameraSystemModel.find({}, function(err, cameraSystems) {
                                if (err) {
                                    logger.error(mockReq, "SYSTEM", "company", "Failed to fetch camera", company, err);
                                    companyCallback();
                                } else {
                                    async.each(cameraSystems, function(cameraSystem, callback) {
                                        if (err) {
                                            logger.error(mockReq, "SYSTEM", "company", "Failed to fetch cameraSystem", company, err);
                                            callback();
                                        } else {
                                            cameraSystem.contract_validity.setHours(0, 0, 0, 0);
                                            if (cameraSystem.contract_validity = today) {
                                                var email = templates.contract_cancel(cameraSystem);
                                                var contractperson = cameraSystem.contractPersonEmail;
                                                mail.mailService(email, contractperson.email);
                                                callback();
                                            } else {
                                                callback();
                                            }
                                        }
                                    }, function(err) {
                                        companyCallback();
                                    })
                                }

                            })
                        }
                    }, function(err) {
                        logger.log(mockReq, "SYSTEM", "cron", "camera system  cron running successfull", {});
                    })
                }
            })

        },

        cameraSystemOverdueCRON: function() {
            CompanyModel.find({}, function(err, companies) {
                if (err) {
                    logger.error(mockReq, "SYSTEM", "company", "Failed to fetch company", company, err);
                } else {
                    var today = new Date();
                    async.each(companies, function(company, companyCallback) {
                        if (err) {
                            logger.error(mockReq, "SYSTEM", "company", "Failed to fetch company", company, err);
                            companyCallback();
                        } else {
                            var companyDb = mongoose.createConnection('mongodb://localhost:27017/' + company.database);
                            require('../../../assets/server/models/cameraSystem')(companyDb);
                            var CameraSystemModel = companyDb.model('CameraSystem');
                            CameraSystemModel.find({ contract_validity: { $lt: today } }, function(err, cameraSystems) {
                                if (err) {
                                    logger.error(mockReq, "SYSTEM", "company", "Failed to fetch camera", company, err);
                                    companyCallback();
                                } else {
                                    async.each(cameraSystems, function(cameraSystem, callback) {
                                        if (err) {
                                            logger.error(mockReq, "SYSTEM", "company", "Failed to fetch cameraSystem", company, err);
                                            callback();
                                        } else {
                                            var email = templates.contract_overdue(cameraSystem);
                                            var contractperson = cameraSystem.contractPersonEmail;
                                            mail.mailService(email, contractperson.email);
                                            callback();
                                        }
                                    }, function(err) {
                                        companyCallback();
                                    })
                                }

                            })
                        }
                    }, function(err) {
                        logger.log(mockReq, "SYSTEM", "cron", "camera system  overdue cron running successfull", {});
                    })
                }
            })

        },
        accessControl7dayCRON: function() {
            CompanyModel.find({}, function(err, companies) {
                if (err) {
                    logger.error(mockReq, "SYSTEM", "company", "Failed to fetch company", company, err);
                } else {
                    var today = new Date();
                    var t = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
                    async.each(companies, function(company, companyCallback) {
                        if (err) {
                            logger.error(mockReq, "SYSTEM", "company", "Failed to fetch company", company, err);
                            companyCallback();
                        } else {
                            var companyDb = mongoose.createConnection('mongodb://localhost:27017/' + company.database);
                            require('../../../assets/server/models/accessControl')(companyDb);
                            var AccessControlModel = companyDb.model('AccessControl');
                            AccessControlModel.find({ contract_validity: { $gt: today, $lt: t } }, function(err, accessControls) {
                                if (err) {
                                    logger.error(mockReq, "SYSTEM", "company", "Failed to fetch accessControls", company, err);
                                    companyCallback();
                                } else {
                                    async.each(accessControls, function(accessControl, callback) {
                                        if (err) {
                                            logger.error(mockReq, "SYSTEM", "company", "Failed to fetch accessControl", company, err);
                                            callback();
                                        } else {
                                            var email = templates.contract_cancel(accessControl);
                                            var contractperson = accessControl.contractPersonEmail;
                                            mail.mailService(email, contractperson.email);
                                            callback();
                                        }
                                    }, function(err) {
                                        companyCallback();
                                    })
                                }

                            })
                        }
                    }, function(err) {
                        logger.log(mockReq, "SYSTEM", "cron", "access control 7 day cron running successfull", {});
                    })
                }
            })

        },
        accessControl3dayCRON: function() {
            CompanyModel.find({}, function(err, companies) {
                if (err) {
                    logger.error(mockReq, "SYSTEM", "company", "Failed to fetch company", company, err);
                } else {
                    var today = new Date();
                    var t = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000)
                    async.each(companies, function(company, companyCallback) {
                        if (err) {
                            logger.error(mockReq, "SYSTEM", "company", "Failed to fetch company", company, err);
                            companyCallback();
                        } else {
                            var companyDb = mongoose.createConnection('mongodb://localhost:27017/' + company.database);
                            require('../../../assets/server/models/accessControl')(companyDb);
                            var AccessControlModel = companyDb.model('AccessControl');
                            AccessControlModel.find({ contract_validity: { $gt: today, $lt: t } }, function(err, accessControls) {
                                if (err) {
                                    logger.error(mockReq, "SYSTEM", "company", "Failed to fetch accessControls", company, err);
                                    companyCallback();
                                } else {
                                    async.each(accessControls, function(accessControl, callback) {
                                        if (err) {
                                            logger.error(mockReq, "SYSTEM", "company", "Failed to fetch accessControl", company, err);
                                            callback();
                                        } else {
                                            var email = templates.contract_cancel(accessControl);
                                            var contractperson = accessControl.contractPersonEmail;
                                            mail.mailService(email, contractperson.email);
                                            callback();
                                        }
                                    }, function(err) {
                                        companyCallback();
                                    })
                                }

                            })
                        }
                    }, function(err) {
                        logger.log(mockReq, "SYSTEM", "cron", "access control 3 day cron running successfull", {});
                    })
                }
            })

        },
        accessControlOndayCRON: function() {
            CompanyModel.find({}, function(err, companies) {
                if (err) {
                    logger.error(mockReq, "SYSTEM", "company", "Failed to fetch company", company, err);
                } else {
                    var today = new Date();
                    today.setHours(0, 0, 0, 0);
                    async.each(companies, function(company, companyCallback) {
                        if (err) {
                            logger.error(mockReq, "SYSTEM", "company", "Failed to fetch company", company, err);
                            companyCallback();
                        } else {
                            var companyDb = mongoose.createConnection('mongodb://localhost:27017/' + company.database);
                            require('../../../assets/server/models/accessControl')(companyDb);
                            var AccessControlModel = companyDb.model('AccessControl');
                            AccessControlModel.find({}, function(err, accessControls) {
                                if (err) {
                                    logger.error(mockReq, "SYSTEM", "company", "Failed to fetch accessControls", company, err);
                                    companyCallback();
                                } else {
                                    async.each(accessControls, function(accessControl, callback) {
                                        if (err) {
                                            logger.error(mockReq, "SYSTEM", "company", "Failed to fetch accessControl", company, err);
                                            callback();
                                        } else {
                                            accessControl.contract_validity.setHours(0, 0, 0, 0);
                                            if (accessControl.contract_validity = today) {
                                                var email = templates.contract_cancel(accessControl);
                                                var contractperson = accessControl.contractPersonEmail;
                                                mail.mailService(email, contractperson.email);
                                                callback();
                                            } else {
                                                callback();
                                            }
                                        }
                                    }, function(err) {
                                        companyCallback();
                                    })
                                }

                            })
                        }
                    }, function(err) {
                        logger.log(mockReq, "SYSTEM", "cron", "access control  cron running successfull", {});
                    })
                }
            })

        },
        accessControlOverdueCRON: function() {
            CompanyModel.find({}, function(err, companies) {
                if (err) {
                    logger.error(mockReq, "SYSTEM", "company", "Failed to fetch company", company, err);
                } else {
                    var today = new Date();
                    async.each(companies, function(company, companyCallback) {
                        if (err) {
                            logger.error(mockReq, "SYSTEM", "company", "Failed to fetch company", company, err);
                            companyCallback();
                        } else {
                            var companyDb = mongoose.createConnection('mongodb://localhost:27017/' + company.database);
                            require('../../../assets/server/models/accessControl')(companyDb);
                            var AccessControlModel = companyDb.model('AccessControl');
                            AccessControlModel.find({ contract_validity: { $lt: today } }, function(err, accessControls) {
                                if (err) {
                                    logger.error(mockReq, "SYSTEM", "company", "Failed to fetch accessControls", company, err);
                                    companyCallback();
                                } else {
                                    async.each(accessControls, function(accessControl, callback) {
                                        if (err) {
                                            logger.error(mockReq, "SYSTEM", "company", "Failed to fetch accessControl", company, err);
                                            callback();
                                        } else {
                                            var email = templates.contract_overdue(accessControl);
                                            var contractperson = accessControl.contractPersonEmail;
                                            mail.mailService(email, contractperson.email);
                                            callback();
                                        }
                                    }, function(err) {
                                        companyCallback();
                                    })
                                }

                            })
                        }
                    }, function(err) {
                        logger.log(mockReq, "SYSTEM", "cron", "access control  overdue cron running successfull", {});
                    })
                }
            })

        },

        burglarAlarm7dayCRON: function() {
            CompanyModel.find({}, function(err, companies) {
                if (err) {
                    logger.error(mockReq, "SYSTEM", "company", "Failed to fetch company", company, err);
                } else {
                    var today = new Date();
                    var t = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
                    async.each(companies, function(company, companyCallback) {
                        if (err) {
                            logger.error(mockReq, "SYSTEM", "company", "Failed to fetch company", company, err);
                            companyCallback();
                        } else {
                            var companyDb = mongoose.createConnection('mongodb://localhost:27017/' + company.database);
                            require('../../../assets/server/models/burglarAlarm')(companyDb);
                            var BurglarAlarmModel = companyDb.model('BurglarAlarm');
                            BurglarAlarmModel.find({ contract_validity: { $gt: today, $lt: t } }, function(err, burglarAlarms) {
                                if (err) {
                                    logger.error(mockReq, "SYSTEM", "company", "Failed to fetch burglarAlarms", company, err);
                                    companyCallback();
                                } else {
                                    async.each(burglarAlarms, function(burglarAlarm, callback) {
                                        if (err) {
                                            logger.error(mockReq, "SYSTEM", "company", "Failed to fetch burglarAlarm", company, err);
                                            callback();
                                        } else {
                                            var email = templates.contract_cancel(burglarAlarm);
                                            var contractperson = burglarAlarm.contractPersonEmail;
                                            mail.mailService(email, contractperson.email);
                                            callback();
                                        }
                                    }, function(err) {
                                        companyCallback();
                                    })
                                }

                            })
                        }
                    }, function(err) {
                        logger.log(mockReq, "SYSTEM", "cron", "burglar alarm 7 day cron running successfull", {});
                    })
                }
            })

        },
        burglarAlarm3dayCRON: function() {
            CompanyModel.find({}, function(err, companies) {
                if (err) {
                    logger.error(mockReq, "SYSTEM", "company", "Failed to fetch company", company, err);
                } else {
                    var today = new Date();
                    var t = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000)
                    async.each(companies, function(company, companyCallback) {
                        if (err) {
                            logger.error(mockReq, "SYSTEM", "company", "Failed to fetch company", company, err);
                            companyCallback();
                        } else {
                            var companyDb = mongoose.createConnection('mongodb://localhost:27017/' + company.database);
                            require('../../../assets/server/models/burglarAlarm')(companyDb);
                            var BurglarAlarmModel = companyDb.model('BurglarAlarm');
                            BurglarAlarmModel.find({ contract_validity: { $gt: today, $lt: t } }, function(err, burglarAlarms) {
                                if (err) {
                                    logger.error(mockReq, "SYSTEM", "company", "Failed to fetch burglarAlarms", company, err);
                                    companyCallback();
                                } else {
                                    async.each(burglarAlarms, function(burglarAlarm, callback) {
                                        if (err) {
                                            logger.error(mockReq, "SYSTEM", "company", "Failed to fetch burglarAlarm", company, err);
                                            callback();
                                        } else {
                                            var email = templates.contract_cancel(burglarAlarm);
                                            var contractperson = burglarAlarm.contractPersonEmail;
                                            mail.mailService(email, contractperson.email);
                                            callback();
                                        }
                                    }, function(err) {
                                        companyCallback();
                                    })
                                }

                            })
                        }
                    }, function(err) {
                        logger.log(mockReq, "SYSTEM", "cron", "burglar alarm 3 day cron running successfull", {});
                    })
                }
            })

        },
        burglarAlarmOndayCRON: function() {
            CompanyModel.find({}, function(err, companies) {
                if (err) {
                    logger.error(mockReq, "SYSTEM", "company", "Failed to fetch company", company, err);
                } else {
                    var today = new Date();
                    today.setHours(0, 0, 0, 0);
                    async.each(companies, function(company, companyCallback) {
                        if (err) {
                            logger.error(mockReq, "SYSTEM", "company", "Failed to fetch company", company, err);
                            companyCallback();
                        } else {
                            var companyDb = mongoose.createConnection('mongodb://localhost:27017/' + company.database);
                            require('../../../assets/server/models/burglarAlarm')(companyDb);
                            var BurglarAlarmModel = companyDb.model('BurglarAlarm');
                            BurglarAlarmModel.find({}, function(err, burglarAlarms) {
                                if (err) {
                                    logger.error(mockReq, "SYSTEM", "company", "Failed to fetch burglarAlarms", company, err);
                                    companyCallback();
                                } else {
                                    async.each(burglarAlarms, function(burglarAlarm, callback) {
                                        if (err) {
                                            logger.error(mockReq, "SYSTEM", "company", "Failed to fetch burglarAlarm", company, err);
                                            callback();
                                        } else {
                                            burglarAlarm.contract_validity.setHours(0, 0, 0, 0);
                                            if (burglarAlarm.contract_validity = today) {
                                                var email = templates.contract_cancel(burglarAlarm);
                                                var contractperson = burglarAlarm.contractPersonEmail;
                                                mail.mailService(email, contractperson.email);
                                                callback();
                                            } else {
                                                callback();
                                            }
                                        }
                                    }, function(err) {
                                        companyCallback();
                                    })
                                }

                            })
                        }
                    }, function(err) {
                        logger.log(mockReq, "SYSTEM", "cron", "burglar alarm  cron running successfull", {});
                    })
                }
            })

        },
        burglarAlarmOverdueCRON: function() {
            CompanyModel.find({}, function(err, companies) {
                if (err) {
                    logger.error(mockReq, "SYSTEM", "company", "Failed to fetch company", company, err);
                } else {
                    var today = new Date();
                    async.each(companies, function(company, companyCallback) {
                        if (err) {
                            logger.error(mockReq, "SYSTEM", "company", "Failed to fetch company", company, err);
                            companyCallback();
                        } else {
                            var companyDb = mongoose.createConnection('mongodb://localhost:27017/' + company.database);
                            require('../../../assets/server/models/burglarAlarm')(companyDb);
                            var BurglarAlarmModel = companyDb.model('BurglarAlarm');
                            BurglarAlarmModel.find({ contract_validity: { $lt: today } }, function(err, burglarAlarms) {
                                if (err) {
                                    logger.error(mockReq, "SYSTEM", "company", "Failed to fetch burglarAlarms", company, err);
                                    companyCallback();
                                } else {
                                    async.each(burglarAlarms, function(burglarAlarm, callback) {
                                        if (err) {
                                            logger.error(mockReq, "SYSTEM", "company", "Failed to fetch burglarAlarm", company, err);
                                            callback();
                                        } else {
                                            var email = templates.contract_overdue(burglarAlarm);
                                            var contractperson = burglarAlarm.contractPersonEmail;
                                            mail.mailService(email, contractperson.email);
                                            callback();
                                        }
                                    }, function(err) {
                                        companyCallback();
                                    })
                                }

                            })
                        }
                    }, function(err) {
                        logger.log(mockReq, "SYSTEM", "cron", "burglar alarm overdue cron running successfull", {});
                    })
                }
            })

        },
        guard7dayCRON: function() {
            CompanyModel.find({}, function(err, companies) {
                if (err) {
                    logger.error(mockReq, "SYSTEM", "company", "Failed to fetch company", company, err);
                } else {
                    var today = new Date();
                    var t = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
                    async.each(companies, function(company, companyCallback) {
                        if (err) {
                            logger.error(mockReq, "SYSTEM", "company", "Failed to fetch company", company, err);
                            companyCallback();
                        } else {
                            var companyDb = mongoose.createConnection('mongodb://localhost:27017/' + company.database);
                            require('../../../assets/server/models/guarding')(companyDb);
                            var GuardingModel = companyDb.model('Guarding');
                            GuardingModel.find({ contract_validity: { $gt: today, $lt: t } }, function(err, guardings) {
                                if (err) {
                                    logger.error(mockReq, "SYSTEM", "company", "Failed to fetch guardings", company, err);
                                    companyCallback();
                                } else {
                                    async.each(guardings, function(guarding, callback) {
                                        if (err) {
                                            logger.error(mockReq, "SYSTEM", "company", "Failed to fetch guarding", company, err);
                                            callback();
                                        } else {
                                            var email = templates.contract_cancel(guarding);
                                            var contractperson = guarding.contractPersonEmail;
                                            mail.mailService(email, contractperson.email);
                                            callback();
                                        }
                                    }, function(err) {
                                        companyCallback();
                                    })
                                }

                            })
                        }
                    }, function(err) {
                        logger.log(mockReq, "SYSTEM", "cron", "guard 7 day cron running successfull", {});
                    })
                }
            })

        },
        guard3dayCRON: function() {
            CompanyModel.find({}, function(err, companies) {
                if (err) {
                    logger.error(mockReq, "SYSTEM", "company", "Failed to fetch company", company, err);
                } else {
                    var today = new Date();
                    var t = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000)
                    async.each(companies, function(company, companyCallback) {
                        if (err) {
                            logger.error(mockReq, "SYSTEM", "company", "Failed to fetch company", company, err);
                            companyCallback();
                        } else {
                            var companyDb = mongoose.createConnection('mongodb://localhost:27017/' + company.database);
                            require('../../../assets/server/models/guarding')(companyDb);
                            var GuardingModel = companyDb.model('Guarding');
                            GuardingModel.find({ contract_validity: { $gt: today, $lt: t } }, function(err, guardings) {
                                if (err) {
                                    logger.error(mockReq, "SYSTEM", "company", "Failed to fetch guardings", company, err);
                                    companyCallback();
                                } else {
                                    async.each(guardings, function(guarding, callback) {
                                        if (err) {
                                            logger.error(mockReq, "SYSTEM", "company", "Failed to fetch guarding", company, err);
                                            callback();
                                        } else {
                                            var email = templates.contract_cancel(guarding);
                                            var contractperson = guarding.contractPersonEmail;
                                            mail.mailService(email, contractperson.email);
                                            callback();
                                        }
                                    }, function(err) {
                                        companyCallback();
                                    })
                                }

                            })
                        }
                    }, function(err) {
                        logger.log(mockReq, "SYSTEM", "cron", "guard 3 day cron running successfull", {});
                    })
                }
            })

        },
        guardOndayCRON: function() {
            CompanyModel.find({}, function(err, companies) {
                if (err) {
                    logger.error(mockReq, "SYSTEM", "company", "Failed to fetch company", company, err);
                } else {
                    var today = new Date();
                    today.setHours(0, 0, 0, 0);
                    async.each(companies, function(company, companyCallback) {
                        if (err) {
                            logger.error(mockReq, "SYSTEM", "company", "Failed to fetch company", company, err);
                            companyCallback();
                        } else {
                            var companyDb = mongoose.createConnection('mongodb://localhost:27017/' + company.database);
                            require('../../../assets/server/models/guarding')(companyDb);
                            var GuardingModel = companyDb.model('Guarding');
                            GuardingModel.find({}, function(err, guardings) {
                                if (err) {
                                    logger.error(mockReq, "SYSTEM", "company", "Failed to fetch guardings", company, err);
                                    companyCallback();
                                } else {
                                    async.each(guardings, function(guarding, callback) {
                                        if (err) {
                                            logger.error(mockReq, "SYSTEM", "company", "Failed to fetch guarding", company, err);
                                            callback();
                                        } else {
                                            guarding.contract_validity.setHours(0, 0, 0, 0);
                                            if (guarding.contract_validity = today) {
                                                var email = templates.contract_cancel(guarding);
                                                var contractperson = guarding.contractPersonEmail;
                                                mail.mailService(email, contractperson.email);
                                                callback();
                                            } else {
                                                callback();
                                            }
                                        }
                                    }, function(err) {
                                        companyCallback();
                                    })
                                }

                            })
                        }
                    }, function(err) {
                        logger.log(mockReq, "SYSTEM", "cron", "guard  cron running successfull", {});
                    })
                }
            })

        },
        guardOverdueCRON: function() {
            CompanyModel.find({}, function(err, companies) {
                if (err) {
                    logger.error(mockReq, "SYSTEM", "company", "Failed to fetch company", company, err);
                } else {
                    var today = new Date();
                    async.each(companies, function(company, companyCallback) {
                        if (err) {
                            logger.error(mockReq, "SYSTEM", "company", "Failed to fetch company", company, err);
                            companyCallback();
                        } else {
                            var companyDb = mongoose.createConnection('mongodb://localhost:27017/' + company.database);
                            require('../../../assets/server/models/guarding')(companyDb);
                            var GuardingModel = companyDb.model('Guarding');
                            GuardingModel.find({ contract_validity: { $lt: today } }, function(err, guardings) {
                                if (err) {
                                    logger.error(mockReq, "SYSTEM", "company", "Failed to fetch guardings", company, err);
                                    companyCallback();
                                } else {
                                    async.each(guardings, function(guarding, callback) {
                                        if (err) {
                                            logger.error(mockReq, "SYSTEM", "company", "Failed to fetch guarding", company, err);
                                            callback();
                                        } else {
                                            var email = templates.contract_overdue(guarding);
                                            var contractperson = guarding.contractPersonEmail;
                                            mail.mailService(email, contractperson.email);
                                            callback();
                                        }
                                    }, function(err) {
                                        companyCallback();
                                    })
                                }

                            })
                        }
                    }, function(err) {
                        logger.log(mockReq, "SYSTEM", "cron", "guard overdue cron running successfull", {});
                    })
                }
            })

        }
    }
};
