
/**
 * Initialize permission
 */
function initializePermission($scope, $rootScope, $location, featureName, flash, MESSAGES) {
	$scope.readPermission = false;
	$scope.writePermission = false;
	$scope.deletePermission = false;
	$scope.updatePermission = false;
	$scope.updatePermissions = function() {
		if (!angular.isUndefined($rootScope.userFeaturesList)) {
			$scope.userFeaturesList = $rootScope.userFeaturesList;
			for (var i = 0; i < $scope.userFeaturesList.length; i++) {
				if (featureName === $scope.userFeaturesList[i].feature.name) {
					$scope.readPermission = $scope.readPermission || $scope.userFeaturesList[i].isRead;
					$scope.writePermission = $scope.writePermission || $scope.userFeaturesList[i].isWrite;
					$scope.deletePermission = $scope.deletePermission || $scope.userFeaturesList[i].isDelete;
					$scope.updatePermission = $scope.updatePermission || $scope.userFeaturesList[i].isUpdate;
				}
			}
		}

		if (!$scope.readPermission) {
			flash.setMessage(MESSAGES.PERMISSION_DENIED, MESSAGES.ERROR);
			$location.path(MESSAGES.DASHBOARD_URL);
		}
	};
	$scope.updatePermissions();
	$rootScope.$on('permission', function() {
		$scope.updatePermissions();
	});
	
	$rootScope.$on('messageChanged', function () {
        $rootScope.currentMessage = flash.getMessage();
        $rootScope.currentMessageCode = flash.getMessageCode();
        $rootScope.currentMessageClass = flash.getMessageClass();
        
    });
}

/**
 * Convert local time to IST time
 */
function ISTtime(dateObj){
	var currentTime = new Date(dateObj);
	var currentOffset = currentTime.getTimezoneOffset();
	var ISTOffset = 330;   // IST offset UTC +5:30 
	var ISTTime = new Date(currentTime.getTime() + (ISTOffset + currentOffset)*60000);

	return ISTTime;
	// ISTTime now represents the time in IST coordinates
	/*var hoursIST = ISTTime.getHours();
	var minutesIST = ISTTime.getMinutes();*/
}

/**
 * Format time as AM/PM and return time as String
 */
function formatAMPM(dateObj) {
	var date = ISTtime(dateObj);
	var hours = date.getHours();
	var minutes = date.getMinutes();
	var ampm = hours >= 12 ? 'PM' : 'AM';
	hours = hours % 12;
	hours = hours ? hours : 12; // the hour '0' should be '12'
	minutes = minutes < 10 ? '0' + minutes : minutes;
	var strTime = hours + ':' + minutes + ' ' + ampm;
	return strTime;
}

/**
 * Delete Object from Array
 */
function deleteObjectFromArray(objList, obj) {
	for (var i = 0; i < objList.length; i++) {
		if (objList[i] === obj || objList[i]._id === obj._id) {
			objList.splice(i, 1);
		}
	}
}

/**
 * Search Object in Array
 */
function objectPresentInArray(objList, obj) {
	for (var i = 0; i < objList.length; i++) {
		if (objList[i] === obj || objList[i]._id === obj._id) {
			return i;
		}
	}
	return -1;
}

/**
 * Add Non-duplicate object in Array
 */
function addNonDuplicateObjectArray(objList, obj) {
	if (objectPresentInArray(objList, obj) == -1) {
		objList.push(obj);
	}
}

/**
 * Hide footer & background image
 */
function hideBgImageAndFooter($rootScope){
	$rootScope.hideFooter= true;
    $rootScope.hideBgImage= true;
    $rootScope.isRedBg= true;
}

/****  Tables Responsive  ****/
function tableResponsive(){
    setTimeout(function () {
       $('.table').each(function () {
            window_width = $(window).width();
            table_width = $(this).width();
            content_width = $(this).parent().width();
            if(table_width > content_width) {
                $(this).parent().addClass('force-table-responsive');
            }
            else{
                $(this).parent().removeClass('force-table-responsive');
            }
        });
    }, 200);
}

/****  Tables Dynamic  ****/
function tableDynamic(){
    if ($('.table-dynamic').length && $.fn.dataTable) {
        $('.table-dynamic').each(function () {
            var opt = {};
            // Tools: export to Excel, CSV, PDF & Print
            if ($(this).hasClass('table-tools')) {
                opt.sDom = "<'row'<'col-md-6'f><'col-md-6'T>r>t<'row'<'col-md-6'i><'spcol-md-6an6'p>>",
                opt.oTableTools = {
                    "sSwfPath": "../assets/global/plugins/datatables/swf/copy_csv_xls_pdf.swf",
                    "aButtons": ["csv", "xls", "pdf", "print"]
                };
            }
            if ($(this).hasClass('no-header')) {
                opt.bFilter = false;
                opt.bLengthChange = false;
            }
            if ($(this).hasClass('no-footer')) {
                opt.bInfo = false;
                opt.bPaginate = false;
            }
            if ($(this).hasClass('filter-head')) {
                $('.filter-head thead th').each( function () {
                    var title = $('.filter-head thead th').eq($(this).index()).text();
                    $(this).append( '<input type="text" onclick="stopPropagation(event);" class="form-control" placeholder="Filter '+title+'" />' );
                });
                var table = $('.filter-head').DataTable();
                $(".filter-head thead input").on( 'keyup change', function () {
                    table.column( $(this).parent().index()+':visible').search( this.value ).draw();
                });
            } 
            if ($(this).hasClass('filter-footer')) {
                $('.filter-footer tfoot th').each( function () {
                    var title = $('.filter-footer thead th').eq($(this).index()).text();
                    $(this).html( '<input type="text" class="form-control" placeholder="Filter '+title+'" />' );
                });
                var table = $('.filter-footer').DataTable();
                $(".filter-footer tfoot input").on( 'keyup change', function () {
                    table.column( $(this).parent().index()+':visible').search( this.value ).draw();
                });
            } 
            if ($(this).hasClass('filter-select')) {
                $(this).DataTable( {
                    initComplete: function () {
                        var api = this.api();
             
                        api.columns().indexes().flatten().each( function ( i ) {
                            var column = api.column( i );
                            var select = $('<select class="form-control" data-placeholder="Select to filter"><option value=""></option></select>')
                                .appendTo( $(column.footer()).empty() )
                                .on( 'change', function () {
                                    var val = $(this).val();
             
                                    column
                                        .search( val ? '^'+val+'$' : '', true, false )
                                        .draw();
                                } );
             
                            column.data().unique().sort().each( function ( d, j ) {
                                select.append( '<option value="'+d+'">'+d+'</option>' )
                            } );
                        } );
                    }
                } );
            } 
            if (!$(this).hasClass('filter-head') && !$(this).hasClass('filter-footer') && !$(this).hasClass('filter-select'))  {
                var oTable = $(this).dataTable(opt);
                oTable.fnDraw();
            }
           
        });
    }
}

function initializeDataTable(){
	tableResponsive();
	tableDynamic();
}

function flashmessageOn($rootScope, $scope,flash){
    $rootScope.$on('messageChanged', function () {
        $rootScope.currentMessage = flash.getMessage();
        $rootScope.currentMessageCode = flash.getMessageCode();
        $rootScope.currentMessageClass = flash.getMessageClass();   
        $scope.currentMessage = flash.getMessage();
        $scope.currentMessageCode = flash.getMessageCode();
        $scope.currentMessageClass = flash.getMessageClass();
        
    });
}