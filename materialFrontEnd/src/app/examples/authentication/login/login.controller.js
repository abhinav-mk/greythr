(function() {
    'use strict';

    angular
        .module('app.examples.authentication')
        .controller('LoginController', LoginController);

    /* @ngInject */
    function LoginController($scope, $http, $state, triSettings, Auth) {
        var vm = this;
        vm.loginClick = loginClick;
        vm.socialLogins = [{
            icon: 'fa fa-twitter',
            color: '#5bc0de',
            url: '#'
        },{
            icon: 'fa fa-facebook',
            color: '#337ab7',
            url: '#'
        },{
            icon: 'fa fa-google-plus',
            color: '#e05d6f',
            url: '#'
        },{
            icon: 'fa fa-linkedin',
            color: '#337ab7',
            url: '#'
        }];
        vm.triSettings = triSettings;
        // create blank user variable for login form
        vm.user = {
            email: '',
            password: ''
        };

        ////////////////

        function loginClick() {
            var data = vm.user;
            /*$http({
            url: 'http://192.168.20.187:3000/api/authenticate',
            method: "POST",
            data: $.param(data),
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).success(successCallback).error(errorCallback);*/
            $http({
            url: 'http://192.168.20.187:3000/api/authenticate',
            method: "POST",
            data: $.param(data),
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).success(successCallback).error(errorCallback);
            // $state.go('triangular.admin-default.introduction');
        };
        var successCallback = function (data, status, headers, config) {
                if(data.success){
                  Auth.authenticate(data.token, $scope.vm.user.rememberMe);
                  $state.transitionTo('triangular.admin-default.dashboard-analytics');
                } else{
                 $scope.authenticationFailure = true;
                 Auth.deAuthenticate();
                }
            };

        var errorCallback = function (data, status, headers, config) {
                alert(JSON.stringify(data) + "    error");
            };

    }
})();