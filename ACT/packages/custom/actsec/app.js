'use strict';

/*
 * Defining the Package
 */
var mean = require('meanio');
var Module = mean.Module;

var actsec = new Module('actsec');
var cron = require('node-cron');
var CRON = require('./server/controllers/cron.js')(actsec);
var logger = require('../../contrib/meanio-system/server/controllers/logs.js');
var mockReq =  {
        connection: {
            remoteAddress: 'X.X.X.X'
        },
        method: 'CRON',
        url: '',
        headers: []
    };

/*
 * All MEAN packages require registration
 * Dependency injection is used to define required modules
 */
actsec.register(function(app, users, system, io, auth, database) {

    // Set views path, template engine and default layout
    app.set('views', __dirname + '/server/views');

    actsec.angularDependencies(['mean.system', 'mean.users', 'angularMoment', 'ngTable', 'amChartsDirective', 'easypiechart']);

    //We enable routing. By default the Package Object is passed to the routes
    actsec.routes(app, auth, database);


    //running CRON for audit , security task and socket
    cron.schedule('0 0 1 * * 0-6', function() {
        logger.log(mockReq, "SYSTEM", "cron", "running for over due audit every day of the week", {});
        CRON.overdueAuditCRON();
    });

    cron.schedule('0 0 1 * * 0', function() {
        logger.log(mockReq, "SYSTEM", "cron", "running for audit that are within 7 days from the date to be performed on every sunday of the week", {});
        CRON.Audit7dayCRON();
    });

    cron.schedule('0 0 1 * * 0-6', function() {
        logger.log(mockReq, "SYSTEM", "cron", "running for over due security task every day of the week", {});
        CRON.overdueTaskCRON();
    });

    cron.schedule('0 0 1 * * 0', function() {
        logger.log(mockReq, "SYSTEM", "cron", "running for security tasks that are within 7 days from the deadline to be performed on every sunday of the week", {});
        CRON.task7dayCRON();
    });

    cron.schedule('0 0 1 * * 0-6', function() {
        logger.log(mockReq, "SYSTEM", "cron", "running for removing sockets", {});
        CRON.socketCRON();
    });
    
    cron.schedule('0 0 1 * * 0-6', function() {
        logger.log(mockReq, "SYSTEM", "cron", "running for reminding of camera system contract cancellation within 7 days of contract validity", {});
        CRON.cameraSystem7dayCRON();
    });
    
    cron.schedule('0 0 1 * * 0-6', function() {
        logger.log(mockReq, "SYSTEM", "cron", "running for reminding of camera system contract cancellation before 3 days of contract validity", {});
        CRON.cameraSystem3dayCRON();
    });
    
    
    cron.schedule('0 0 1 * * 0-6', function() {
        logger.log(mockReq, "SYSTEM", "cron", "running for reminding of camera system contract cancellation on the day of contract validity", {});
        CRON.cameraSystemOndayCRON();
    });
    
    cron.schedule('0 0 1 * * 0-6', function() {
        logger.log(mockReq, "SYSTEM", "cron", "running for reminding of camera system contract cancellation of overdue contract validity date", {});
        CRON.cameraSystemOverdueCRON();
    });
    
    cron.schedule('0 0 1 * * 0-6', function() {
        logger.log(mockReq, "SYSTEM", "cron", "running for reminding of access control contract cancellation within 7 days of contract validity", {});
        CRON.accessControl7dayCRON();
    });
    
    cron.schedule('0 0 1 * * 0-6', function() {
        logger.log(mockReq, "SYSTEM", "cron", "running for reminding of access control contract cancellation before 3 days of contract validity", {});
        CRON.accessControl3dayCRON();
    });
    
    cron.schedule('0 0 1 * * 0-6', function() {
        logger.log(mockReq, "SYSTEM", "cron", "running for reminding of access control contract cancellation on the day of contract validity", {});
        CRON.accessControlOndayCRON();
    });
    
    cron.schedule('0 0 1 * * 0-6', function() {
        logger.log(mockReq, "SYSTEM", "cron", "running for reminding of access control contract cancellation of overdue contract validity date", {});
        CRON.accessControlOverdueCRON();
    });
    
    
    cron.schedule('0 0 1 * * 0-6', function() {
        logger.log(mockReq, "SYSTEM", "cron", "running for reminding of burglar alarm contract cancellation within 7 days of contract validity", {});
        CRON.burglarAlarm7dayCRON();
    });
    
    cron.schedule('0 0 1 * * 0-6', function() {
        logger.log(mockReq, "SYSTEM", "cron", "running for reminding of burglar alarm contract cancellation before 3 days of contract validity", {});
        CRON.burglarAlarm3dayCRON();
    });
    
    cron.schedule('0 0 1 * * 0-6', function() {
        logger.log(mockReq, "SYSTEM", "cron", "running for reminding of burglar alarm contract cancellation on the day of contract validity", {});
        CRON.burglarAlarmOndayCRON();
    });
    
    cron.schedule('0 0 1 * * 0-6', function() {
        logger.log(mockReq, "SYSTEM", "cron", "running for reminding of burglar alarm contract cancellation of overdue contract validity date", {});
        CRON.burglarAlarmOverdueCRON();
    });
    
    cron.schedule('0 0 1 * * 0-6', function() {
        logger.log(mockReq, "SYSTEM", "cron", "running for reminding of guard contract cancellation within 7 days of contract validity", {});
        CRON.guard7dayCRON();
    });
    
    cron.schedule('0 0 1 * * 0-6', function() {
        logger.log(mockReq, "SYSTEM", "cron", "running for reminding of guard contract cancellation before 3 days of contract validity", {});
        CRON.guard3dayCRON();
    });
    
    cron.schedule('0 0 1 * * 0-6', function() {
        logger.log(mockReq, "SYSTEM", "cron", "running for reminding of guard contract cancellation on the day of contract validity", {});
        CRON.guardOndayCRON();
    });
    
    cron.schedule('0 0 1 * * 0-6', function() {
        logger.log(mockReq, "SYSTEM", "cron", "running for reminding of guard contract cancellation of overdue contract validity date", {});
        CRON.guardOverdueCRON();
    });

    return actsec;
});
