'use strict';

function initializePagination($scope, $rootScope, SERVICE) {
    $scope.SERVICE = SERVICE;
    $scope.first = false;
    $scope.previousMore = false;
    $scope.nextMore = false;
    $scope.last = false;
    $scope.start = 1;
    $scope.end = 10;
    $scope.current = 1;
    $scope.pages = 5;

    $scope.loadPageSizeFilter = function () {
        $scope.pageSizeFilterList = [];
        var gap = 0;
        for (var i = 0; i < $scope.pages; i++) {
            gap = gap + 5;
            $scope.pageSizeFilterList.push(gap);
        }
        $scope.currentPageSize = 10;
    };

    $scope.paginationFilter = function (showPageSize) {
        $scope.currentPage = 1;
        $scope.currentPageSize = showPageSize;
        $scope.totalPageList = [];
        for (var i = 1; i <= 10; i++) {
            $scope.totalPageList.push(i);
        }
        $scope.paginate($scope.currentPage);
    };

    $scope.getPageClass = function (pageNo) {
        return pageNo == $scope.current ? "active" : "";
    }

    $scope.$watch(
        "current",
        function handleFooChange(newValue, oldValue) {
            if (newValue != oldValue) {
                $scope.paginate(newValue);
            }
        }
    );

    //Pagination for Users
    $scope.paginate = function (pageNo) {
        $scope.current = pageNo;
        $scope.currentPage = pageNo;
        $scope.query.page = $scope.currentPage;
        $scope.query.pageSize = $scope.currentPageSize;
        $scope.loadPagination($scope.query);
    };

    $scope.loadPagination = function (query) {
        $scope.currentPage = query.page;
        $scope.currentPageSize = query.pageSize;
        $scope.query = query;
        $rootScope.$emit('processingContinue');
        SERVICE.page.query(query, function (result) {
            $scope.collection = result.collection;
            $scope.totalPage = result.totalPage;
            $scope.currentPage = result.currentPage;
            if ($scope.totalPage < 10) {
                $scope.end = $scope.totalPage;
            }
            $scope.setPaginationPage();    // Set page for pagination 
            $rootScope.$emit('processingDone');
        });
    };

    $scope.setPaginationPage = function () {
        $scope.totalPageList = [];
        if ($scope.totalPage > $scope.end) {
            for (var i = $scope.start; i <= $scope.end; i++) {
                $scope.totalPageList.push(i);
            }
            $scope.nextMore = true;
        } else {
            for (var i = $scope.start; i <= $scope.totalPage; i++) {
                $scope.totalPageList.push(i);
            }
            $scope.nextMore = false;
        }
    };

    $scope.setFirstPaginationPage = function () {
        $scope.start = 1;
        $scope.end = $scope.start + 10;
        $scope.current = 1;
        if ($scope.totalPage < $scope.end) {
            $scope.end = $scope.totalPage;
        }
        if ($scope.start == 1) {
            $scope.previousMore = false;
        }
        if ($scope.totalPage == $scope.end) {
            $scope.current = $scope.start;
        }
        $scope.first = true;
        $scope.last = false;
        $scope.setPaginationPage();
    };

    $scope.setPreviousPaginationPage = function () {
        $scope.current = $scope.current - 1;
        if ($scope.current >= $scope.start) {
            $scope.start = $scope.current - 10;
            if ($scope.start <= 1) {
                $scope.start = 1;
            }
            if ($scope.start == 1) {
                $scope.previousMore = false;
            }
            $scope.end = $scope.start + 10;
            if ($scope.totalPage < $scope.end) {
                $scope.end = $scope.totalPage;
            }
        }
        $scope.setPaginationPage();
    };

    $scope.setNextPaginationPage = function () {
        $scope.current = $scope.current + 1;
        if ($scope.current > $scope.end) {
            $scope.end = $scope.current;
            $scope.start = $scope.end - 10;
            if ($scope.start < 1) {
                $scope.start = 1;
            }
        }
        if ($scope.current >= $scope.totalPage - 10) {
            $scope.nextMore = true;
        } else {
            $scope.nextMore = false;
        }
        if ($scope.start > 1) {
            $scope.previousMore = true;
        }
        $scope.setPaginationPage();
    };

    $scope.setLastPaginationPage = function () {
        $scope.start = $scope.totalPage - 10;
        $scope.end = $scope.totalPage;
        if ($scope.totalPage == $scope.end) {
            $scope.current = $scope.totalPage;
            $scope.last = true;
            $scope.first = false;
        } else {
            //$scope.last = false;
        }
        if ($scope.end > (10 + 1)) {
            $scope.previousMore = true;
        }
        if ($scope.start < 1) {
            $scope.start = 1;
        }
        $scope.setPaginationPage();
    };

    $scope.list = function (query) {
        $scope.breadcrumLinks = angular.copy($scope.baseLinks);
        $scope.breadcrumLinks.push({'name': 'List', 'url': '', 'isLink': false});
        $scope.currentPage = 1;
        $scope.currentPageSize = 10;
        if (angular.isUndefined(query)) {
            query = {};
        }
        query.page = $scope.currentPage;
        query.pageSize = $scope.currentPageSize;
        $scope.loadPagination(query);
    };
}
