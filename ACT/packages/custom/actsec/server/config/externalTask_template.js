'use strict';

var config = require('meanio').loadConfig();
var configuration = require('./config.js');
module.exports = {

    external_user: function(obj) {
        var email = {
            body: {
                name: obj.name,
                intro: 'Please log your hours and cost required for a particular task ' ,
                action: {
                    button: {
                        color: 'green',
                        text: 'Click Here',
                        link: config.hostname + '/externalsecuritytask/'+obj.company + '/'+ obj._id +'/estimate'
                    }
                },
                outro: 'For any Support email us on link' + ' ' + configuration.supportMail,
                signature: 'Best'
            },
            subject: "External task assigned"
        }
        return email;
    },
    external_user_approved: function(obj) {
        var email = {
            body: {
                name: obj.name,
                intro: 'Please put the actual  hours and cost required for the given task. ' ,
                action: {
                    button: {
                        color: 'green',
                        text: 'Click Here',
                       link: config.hostname + '/externalsecuritytask/'+ obj.company + '/'+ obj._id +'/estimate'
                    }
                },
                outro: 'For any Support email us on link' + ' ' + configuration.supportMail,
                signature: 'Best'
            },
            subject: "External task approved"
        }
        return email;
    },
    managers: function(manager,externalSecurityTask) {
        var email = {
            body: {
                name: manager.firstname + ' ' + manager.lastname,
                intro: 'Please approve the hours estimated for the task assigned. ' ,
                action: {
                    button: {
                        color: 'green',
                        text: 'Click Here',
                        link: config.hostname + '/externalsecuritytask/'+ externalSecurityTask.company + '/'+ externalSecurityTask._id +'/view'
                    }
                },
                outro: 'For any Support email us on link' + ' ' + configuration.supportMail,
                signature: 'Best'
            },
            subject: "External task for approval"
        }
        return email;
    },
    external_user_declined: function(obj) {
        var email = {
             body: {
                name: obj.name,
                intro: 'Task has been declined, please go through the comments and estimate.' ,
                action: {
                    button: {
                        color: 'green',
                        text: 'Click Here',
                        link: config.hostname + '/externalsecuritytask/'+obj.company + '/'+ obj._id +'/estimate'
                    }
                },
                outro: 'For any Support email us on link' + ' ' + configuration.supportMail,
                signature: 'Best'
            },
            subject: "External task declined"
        }
        return email;
    },
    manager_notify : function(obj,finalObject){
    	var email = {
            body: {
                name: obj.firstname + ' ' + obj.lastname,
                intro: 'The actual hours and cost filled by the external user is:'+'<br>' + 'Actual Hours:'+ finalObject.actual_hours + '<br>' + 'Actual Cost:' + finalObject.actual_cost,
                action: {
                    button: {
                        color: 'green',
                        text: 'Click Here',
                        link: config.hostname + '/externalsecuritytask/'+ finalObject.company + '/'+ finalObject._id +'/view'
                    }
                },
                outro: 'For any Support email us on link' + ' ' + configuration.supportMail,
                signature: 'Best'
            },
            subject: "External task details"
        }
        return email;
    },
    external_task_closed: function(obj) {
        var email = {
             body: {
                name: obj.name,
                intro: 'External security task has been closed.' ,
                action: {
                    button: {
                        color: 'green',
                        text: 'Click Here',
                        link: config.hostname + '/externalsecuritytask/'+ obj.company + '/'+ obj._id +'/view'
                    }
                },
                outro: 'For any Support email us on link' + ' ' + configuration.supportMail,
                signature: 'Best'
            },
            subject: "External task has been closed"
        }
        return email;
    },
    
};