/**
 * <Author:Akash Gupta>
 * <Date:30-06-2016>
 * <constants: for company list,edit, add page>
 */

angular.module('mean.securitytasks').constant('SECURITYTASKS', {
    URL_PATH: {
        SECURITYTASKS_ADD: '/securitytasks/create',
        //SECURITYTASKS_LIST: '/securitytasks',
        EXTERNAL_SECURITY_TASK:'/externalsecuritytask/:companyId/create',
        ESTIMATE_EXTERNAL_TASK:'/externalsecuritytask/:companyId/:externalsecuritytaskId/estimate',
        EXTERNAL_TASK_VIEW:'/externalsecuritytask/:companyId/:externalsecuritytaskId/view',
        SECURITYTASK_BUDGET:'/budget',
        MYTASK_LIST :'/securitytask/mytasks',
        ALLTASK_LIST:'/securitytasks',
        EXTERNALTASK_LIST:'/securitytask/externaltasks'
    },
    FILE_PATH: {
        SECURITYTASKS_ADD: 'securitytasks/views/securitytask-add.html',
        SECURITYTASKS_LIST: 'securitytasks/views/securitytask-list.html',
        EXTERNAL_SECURITY_TASK:'securitytasks/views/external_security_task_create.html',
        ESTIMATE_EXTERNAL_TASK:'securitytasks/views/estimate_externaltask.html',
        EXTERNAL_TASK_VIEW:'securitytasks/views/externaltask_view.html',
        SECURITYTASK_BUDGET:'securitytasks/views/security_task_budget.html',
        MYTASK_LIST:'securitytasks/views/myTask-list.html',
        ALLTASK_LIST:'securitytasks/views/allTask-list.html',
        EXTERNALTASK_LIST:'securitytasks/views/externalTask-list.html'
    },
    STATE: {
        SECURITYTASKS_ADD: 'SecurityTask_create security task',
        SECURITYTASKS_LIST: 'SecurityTask_all security task',
        EXTERNAL_SECURITY_TASK:'External Security Task',
        ESTIMATE_EXTERNAL_TASK:'Estimate external security task',
        EXTERNAL_TASK_VIEW:'External task view',
        SECURITYTASK_BUDGET:'Security task budget',
        MYTASK_LIST:'Mytask_all mytask',
        ALLTASK_LIST:'Alltask_all tasks',
        EXTERNALTASK_LIST:'Externaltask_all externaltasks'
    }
});