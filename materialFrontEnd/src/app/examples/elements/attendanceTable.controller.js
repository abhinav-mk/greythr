(function() {
    'use strict';

    angular
        .module('app.examples.elements')
        .controller('AttendanceTableController', AttendanceTableController)
        .service('AttendanceTableService', AttendanceTableService);

    AttendanceTableService.$inject = ['$http', 'Auth'];
    function AttendanceTableService($http, Auth) {
        this.getUsers = getUsers;

        ////////////////

        function getUsers(query, classNumber, section, date, userid) {
            var order = query.order === 'id' ? 'desc':'asc';
            return $http({
            url: query,
            method: "POST",
            data: $.param({token: Auth.getToken(), class: classNumber, section: section, date: date, userid: userid}),
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
    function AttendanceTableController($scope, $timeout, $q, AttendanceTableService) {

      }
})();
