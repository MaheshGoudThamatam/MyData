'use strict';

angular.module('mean.actsec').factory('utilityService', function(CONFIG) {
    return {
        /**
         * Function to dynamically set the page title according to the content of the page.
         * @param {string} title Page title
         */
        setPageTitle: function(title) {
            if (!angular.isUndefined(title)) {
                document.title = CONFIG.appName + ' - ' + title;
            } else {
                document.title = CONFIG.appName;
            }
        },

        /**
         * remove duplicates from array of objects
         * @param  {array} array of objects to remove duplicates
         * @param  {string} key based on which duplicates have to be removed
         * @return {array}  de-duplicated array
         */
        uniq: function uniq(a, key) {
            return a.filter(function(item, pos, array) {
                return array.map(function(mapItem) {
                    return mapItem[key];
                }).indexOf(item[key]) === pos;
            });
        },

        /**
         * [delConfirm] Function to show the confirmation dialog before delete operation
         * @param  {Function} callback to be executed in the controller
         */
        delConfirm: function(callback) {
            bootbox.confirm("Are you sure?", callback);
        },

        /**
         * [flash] Functions to display various flash messages
         * @param {String} message
         */
        flash: {
            success: function(message) {
                toastr.options = {
                    "closeButton": true,
                    "debug": false,
                    "newestOnTop": true,
                    "progressBar": false,
                    "positionClass": "toast-top-right",
                    "preventDuplicates": true,
                    "onclick": null,
                    "showDuration": "300",
                    "hideDuration": "1000",
                    "timeOut": "7000",
                    "extendedTimeOut": "1000",
                    "showEasing": "swing",
                    "hideEasing": "linear",
                    "showMethod": "fadeIn",
                    "hideMethod": "fadeOut"
                }
                toastr.success(message, "Success");
            },
            warning: function(message) {
                toastr.options = {
                    "closeButton": true,
                    "debug": false,
                    "newestOnTop": true,
                    "progressBar": false,
                    "positionClass": "toast-top-right",
                    "preventDuplicates": true,
                    "onclick": null,
                    "showDuration": "300",
                    "hideDuration": "1000",
                    "timeOut": "7000",
                    "extendedTimeOut": "1000",
                    "showEasing": "swing",
                    "hideEasing": "linear",
                    "showMethod": "fadeIn",
                    "hideMethod": "fadeOut"
                }
                toastr.warning(message, "Warning");
            },
            error: function(message) {
                toastr.options = {
                    "closeButton": true,
                    "debug": false,
                    "newestOnTop": true,
                    "progressBar": false,
                    "positionClass": "toast-top-right",
                    "preventDuplicates": true,
                    "onclick": null,
                    "showDuration": "300",
                    "hideDuration": "1000",
                    "timeOut": "7000",
                    "extendedTimeOut": "1000",
                    "showEasing": "swing",
                    "hideEasing": "linear",
                    "showMethod": "fadeIn",
                    "hideMethod": "fadeOut"
                }
                toastr.error(message, "Error");
            },
            info: function(message) {
                toastr.options = {
                    "closeButton": true,
                    "debug": false,
                    "newestOnTop": true,
                    "progressBar": false,
                    "positionClass": "toast-top-right",
                    "preventDuplicates": true,
                    "onclick": null,
                    "showDuration": "300",
                    "hideDuration": "1000",
                    "timeOut": "7000",
                    "extendedTimeOut": "1000",
                    "showEasing": "swing",
                    "hideEasing": "linear",
                    "showMethod": "fadeIn",
                    "hideMethod": "fadeOut"
                }
                toastr.info(message, "Info");
            },
            clear: function() {
                toastr.clear();
            }
        },

        /**
         * [ngTableOptions] Global settings for ng-tables.
         * @return {object}
         */
        ngTableOptions: function() {
            //Currently using default settings
            return {
                count: 10
            }
        },

        /**
         * [ngTableCounts] For displaying the page counts for the tables based on the total data count
         */
        ngTableCounts: function(array) {
            switch(true) {
                case array.length > 50:
                    return {counts: [10, 25, 50, 100]};
                case array.length > 25:
                    return {counts: [10, 25, 50]};
                case array.length > 10:
                    return {counts: [10, 25]};
                default:
                    return {counts: []};
            };
        },

        /**
         * [escapeRegExp] To escape the string before use in a regular expression.
         * @param  {[string]} [input string]
         * @return {[string]} [escaped string]
         */
        escapeRegExp: function(string) {
            return string.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
        },

        /**
         * delete confirmation for company delete
         * @param  {Function} callback to be executed in the controller
         */
        delCompanyConfirm: function(callback) {
            bootbox.dialog({
                title: "Are you sure?",
                message: "<div class='text-danger'>All the locations, sites, users, security manager & assets will be permanently deleted</div>.",
                buttons: {
                    main: {
                        label: "Cancel",
                        className: "btn-default",
                        callback: function() {

                        }
                    },
                    danger: {
                        label: "Yes",
                        className: "btn-danger",
                        callback: callback
                    }
                },
            });
        },

        /**
         * generic information dialog
         * @return {[type]} [description]
         */
        dialog: function(title, message) {
            bootbox.dialog({
                title: title,
                message: message,
                buttons: {
                    main: {
                        label: "Ok",
                        className: "btn-default",
                        callback: function() {

                        }
                    }
                },
            });
        },

        /*
         * generic function for confirmation
         * @param  {title} title of confirmation dialog
         * @param  {message} message for conformation dialog
         * @param  {Function} callback to be executed in the controller
         */
        genericConfirm: function(title, message, callbackYes, callbackCancel) {
            bootbox.dialog({
                title: title,
                message: message,
                buttons: {
                    main: {
                        label: "No",
                        className: "btn-default",
                        callback: callbackCancel
                    },
                    danger: {
                        label: "Yes",
                        className: "btn-blue",
                        callback: callbackYes
                    }
                },
            });
        },
         /**
         * Function to check if the user role id matches security manager
         */
        isSecurityManager: function(id) {
            return id + '' == CONFIG.roles.SECURITY_MANAGER;
        },
         /**
         * Function to check if the user role id matches super admin
         */
        isSuperAdmin: function(id) {
            return id + '' == CONFIG.roles.SUPER_ADMIN;
        },
        /**
         * Function to display the page loader when performing API calls
         */
        showPreloader: function() {
            $('#preloader').show();
        },
        /**
         * Function to hide page loader after performing API calls
         */
        hidePreloader: function() {
            $('#preloader').hide();
        },


        /**
        * Function to generate PDF file from html content given
        */
        generatePdf : function(htmlContent, fileName){

            $('body').append('<div id="canvasContainer" >' + htmlContent + '</div>');
            html2canvas($('#canvasContainer'), {
                //callback when <canvas> element is generated and rendered
                onrendered: function(canvas) {
                    // canvas is the final rendered <canvas> element
                    $('#canvasContainer').remove();
                    var data = canvas.toDataURL();
                    var docDefinition = {
                        content: [{
                            image: data,
                            width: 500
                        }]
                    };
                    pdfMake.createPdf(docDefinition).download(fileName+".pdf");
                }
            });

        }


    }
});