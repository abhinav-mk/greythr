(function() {
    'use strict';

    angular
        .module('app.examples.elements')
        .controller('SchoolInfoController', SchoolInfoController);

    /* @ngInject */
    function SchoolInfoController($rootScope, $window, $location, $stateParams, $http, $state, $scope, $interval, $mdSidenav, $mdToast, $filter, $mdDialog, $compile, Auth, ClassListService, AttendanceTableService) {
    	$scope.newpermissions = [];
    	var schoolInfo;
    	$http({
        	url: "http://localhost:3000/api/school/info",
            method: "POST",
            data: $.param({token: Auth.getToken()}),
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        }).success(function(data) {
        	displayInfo(data.data);
        }).error(function(err){
        	alert("check your Internet Connection!");
        });
        function displayInfo(schoolinfo){
        	console.log(schoolinfo);
        	schoolInfo = schoolinfo;
        	$scope.school_name = schoolinfo.name;
        	$scope.school_scope = schoolinfo.scope;
        	$scope.school_grants = schoolinfo.grants;
        	$scope.school_permissions = schoolinfo.permissions;
        }
        $scope.deleteclass = function(i)
        {
        	$scope.school_scope.splice(i, 1);
        }
        $scope.deletegrant = function(i)
        {
        	$scope.school_grants.splice(i, 1);
        }
        $scope.updatesubjects = function(i)
        {
        	$scope.school_scope[i].subjects = $scope.school_scope[i].subjects.split(',');
        	console.log($scope.school_scope[i].subjects)
        }
        $scope.addclass = function()
        {
        	var temp = {};
        	temp.class = $scope.newclass;
        	temp.section = $scope.newsection;
        	temp.subjects = $scope.newsubjects.split(',');
        	$scope.school_scope.push(temp);
        	$scope.newsubjects = $scope.newsection = $scope.newclass = "";
        	console.log($scope.school_scope);
        }
        $scope.addgrant = function()
        {
        	var temp = {};
        	temp.role = $scope.newrole;
        	temp.permissions = $scope.newpermissions;
        	$scope.school_grants.push(temp);
        	$scope.newrole = "";
        	$scope.newpermissions = [];
        	console.log($scope.school_grants);
        }
        $scope.toggle = function (item, list) {
            var idx = list.indexOf(item);
            if (idx > -1) list.splice(idx, 1);
            else list.push(item);
            console.log($scope.school_grants)
        };
        $scope.exists = function (item, list) {
            return list.indexOf(item) > -1;
        };
        $scope.editSchoolData = function()
        {
        	var roles = "";
        	for(var i=0;i<$scope.school_grants.length;i++)
        	{
        		roles += $scope.school_grants[i].role+";";
        	}
        	roles = roles.substring(0, roles.length - 1);
        	var classes = "";var sections = "";var subjects = "";
        	for(var i=0;i<$scope.school_scope.length;i++)
        	{
        		classes += $scope.school_scope[i].class+";";
        		sections += $scope.school_scope[i].section+";"; 
        		subjects += $scope.school_scope[i].subjects.join(',')+";"; 
        	}
        	classes = classes.substring(0, classes.length - 1);
        	sections = sections.substring(0, sections.length - 1);
        	subjects = subjects.substring(0, subjects.length - 1);
        	var role_grant = "";
        	var permissions_grant = "";
        	for(var i=0;i<$scope.school_grants.length;i++)
        	{
        		role_grant += $scope.school_grants[i].role+";";
        		permissions_grant += $scope.school_grants[i].permissions.join(',')+";";
        	}
        	role_grant = role_grant.substring(0, role_grant.length - 1);
        	permissions_grant = permissions_grant.substring(0, permissions_grant.length - 1);
        	$http({
	        	url: "http://localhost:3000/api/edit/school",
	            method: "POST",
	            data: $.param({token: Auth.getToken(),adminid:schoolInfo.adminid,name:$scope.school_name,roles:roles,permissions:schoolInfo.permissions.join(';'),subscriptions:schoolInfo.subscriptions.join(';'),class:classes,section:sections,subjects:subjects,role_grant:role_grant,permissions_grant:permissions_grant}),
	            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
	        }).success(function(data) {
	        	console.log(data)
	        	alert("Successfully updated school information");
	        }).error(function(err){
	        	alert("check your Internet Connection!");
	        });
        }
        $scope.cancelEdit = function()
        {
        	$state.go('triangular.admin-default.dashboard');
        }
    }

})();