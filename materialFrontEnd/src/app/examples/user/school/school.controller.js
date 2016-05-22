(function() {
    'use strict';

    angular
        .module('app.examples.school')
        .controller('SchoolController', SchoolController)
        .controller('SchoolCreateController', SchoolCreateController);

    /* @ngInject */
    function SchoolController($rootScope, $state, $scope, $filter, Auth, ClassListService, $http) {
         $http({
            url: 'http://localhost:3000/api/school/list',
            method: "POST",
            data: $.param({token:Auth.getToken(),permission:'create_user'}),
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        }).success(function(data){
            if(data.success)
            {
                console.log(data)
                $scope.schoolList = data.data;
            }
        }).error(function(err){
            alert("Check Your Internet Connection");
        });
        $scope.createSchool = function()
        {
            $state.go('triangular.admin-default.newschool');
        }
    }

    function SchoolCreateController($rootScope, $state, $scope, $filter, Auth, ClassListService, $http) {
         $scope.school_name="";
         $scope.school_roles = ['Admin', 'Teacher', 'Student', 'Principal'];
         $scope.school_permissions = ["create_user", "delete_user", "edit_self_user","edit_any_user", "change_self_password", "change_any_password", "forgot_password", "change_admin", "add_role","edit_role", "edit_grant", "list_users", "info_any_user", "info_self_user", "list_permissions", "list_roles", "edit_school","has_attendance","create_attendance","edit_any_attendance","view_self_attendance","view_any_attendance","delete_attendance","view_any_marks","view_self_marks","edit_marks","create_marks"]
         $scope.school_cs = ['1-A', '1-B'];
         $scope.createSchool = function(){
            $http({
            url: 'http://localhost:3000/api/add/school',
            method: "POST",
            data: $.param({token:Auth.getToken(),name:$scope.school_name, roles: $scope.school_roles.join(';'), permissions: $scope.school_permissions.join(';'), class: '1;1', section: 'A;B', subjects:'Kannada,English,Hindi,Mathematics,Science,Social Science;Kannada,English,Hindi,Mathematics,Science,Social Science', role_grant: 'Admin;Principal;Teacher;Student', permissions_grant:'create_user,delete_user,edit_self_user,edit_any_user,change_self_password,change_any_password,forgot_password,change_admin,add_role,edit_role,edit_grant,list_users,info_any_user,info_self_user,list_permissions,list_roles,edit_school;create_user,delete_user,edit_self_user,edit_any_user,change_self_password,change_any_password,forgot_password,change_admin,add_role,edit_role,edit_grant,list_users,info_any_user,info_self_user,list_permissions,list_roles,edit_school,has_attendance,create_attendance,edit_any_attendance,view_self_attendance,view_any_attendance,delete_attendance,view_any_marks,edit_marks,create_marks;edit_self_user,edit_any_user,change_self_password,change_any_password,forgot_password,add_role,edit_role,edit_grant,list_users,info_any_user,info_self_user,list_permissions,list_roles,has_attendance,create_attendance,edit_any_attendance,view_self_attendance,view_any_attendance,delete_attendance,view_any_marks,edit_marks,create_marks;edit_self_user,change_self_password,list_users,info_any_user,info_self_user,has_attendance,view_self_attendance'}),
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        }).success(function(data){
            if(data.success)
            {
                $http({
                    url: 'http://localhost:3000/api/add/user',
                    method: "POST",
                    data: $.param({token:Auth.getToken(),schoolid: data.id, name:$scope.admin_name, email: $scope.admin_email, password: $scope.admin_password, role: 'Admin', class: '1;1', section: 'A;B', subject:'Kannada,English,Hindi,Mathematics,Science,Social Science;Kannada,English,Hindi,Mathematics,Science,Social Science'}),
                    headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                }).success(function(data1){
                    if(data.success)
                    {
                        alert('Successfully Created School');
                        $state.go('triangular.admin-default.school');
                    }
                }).error(function(err){
                    alert("Check Your Internet Connection");
                });
            }
        }).error(function(err){
            alert("Check Your Internet Connection");
        });
         }
    }
})();