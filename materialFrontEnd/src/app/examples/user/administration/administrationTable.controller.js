(function() {
    'use strict';

    angular
        .module('app.examples.administration')
        .controller('AdministrationTableController', AdministrationTableController)
        .service('AdministrationTableService', AdministrationTableService);

    AdministrationTableService.$inject = ['$http', 'Auth'];
    function AdministrationTableService($http, Auth) {
        this.getUsers = getUsers;

        ////////////////

        function getUsers(query, classNumber, section, date) {
            var order = query.order === 'id' ? 'desc':'asc';
            return $http({
            url: 'http://localhost:3000/api/attendance/create',
            method: "POST",
            data: $.param({token: Auth.getToken(), class: classNumber, section: section, date: date}),
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            })
            .success(function(data) {
                return data;
            })
            .error(function (data) {
                console.log();
            });
        }
    }

    /* @ngInject */
    function AdministrationTableController($scope, $timeout, $q, AttendanceTableService) {
        var vm = this;
        vm.query = {
            filter: '',
            limit: '10',
            order: '-id',
            page: 1
        };
        vm.selected = [];
        vm.filter = {
            options: {
                debounce: 500
            }
        };
        vm.getUsers = getUsers;
        vm.removeFilter = removeFilter;

        activate();

        ////////////////

        function activate() {
            var bookmark;
            $scope.$watch('vm.query.filter', function (newValue, oldValue) {
                if(!oldValue) {
                    bookmark = vm.query.page;
                }

                if(newValue !== oldValue) {
                    vm.query.page = 1;
                }

                if(!newValue) {
                    vm.query.page = bookmark;
                }

                vm.getUsers();
            });
        }

        function getUsers() {
            AdministrationTableService.getUsers(vm.query, '2', 'B', new Date()).then(function(users){
                vm.users = users.data;
                alert(JSON.stringify(users.data));
            });
        }

        function removeFilter() {
            vm.filter.show = false;
            vm.query.filter = '';

            if(vm.filter.form.$dirty) {
                vm.filter.form.$setPristine();
            }
        }
    }
})();