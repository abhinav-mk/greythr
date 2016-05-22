(function() {
    'use strict';

    angular
        .module('app.examples.authentication')
        .config(moduleConfig);

    /* @ngInject */
    function moduleConfig($translatePartialLoaderProvider, $stateProvider, triMenuProvider) {
        $translatePartialLoaderProvider.addPart('app/examples/authentication');

        $stateProvider
        .state('authentication', {
            abstract: true,
            templateUrl: 'app/examples/authentication/layouts/authentication.tmpl.html',
            authenticate : true
        })
        .state('authentication.login', {
            url: '/login',
            templateUrl: 'app/examples/authentication/login/login.tmpl.html',
            controller: 'LoginController',
            controllerAs: 'vm',
            authenticate : false
        })
        .state('authentication.signup', {
            url: '/signup',
            templateUrl: 'app/examples/authentication/signup/signup.tmpl.html',
            controller: 'SignupController',
            controllerAs: 'vm',
            authenticate : true
        })
        .state('authentication.lock', {
            url: '/lock',
            templateUrl: 'app/examples/authentication/lock/lock.tmpl.html',
            controller: 'LockController',
            controllerAs: 'vm', 
            authenticate: true
        })
        .state('authentication.forgot', {
            url: '/forgot',
            templateUrl: 'app/examples/authentication/forgot/forgot.tmpl.html',
            controller: 'ForgotController',
            controllerAs: 'vm', 
            authenticate: true
        })
        .state('triangular.admin-default.profile', {
            url: '/profile',
            templateUrl: 'app/examples/authentication/profile/profile.tmpl.html',
            controller: 'ProfileController',
            controllerAs: 'vm',
            authenticate : true
        });

        /*triMenuProvider.addMenu({
            name: 'Authentication',
            icon: 'zmdi zmdi-account',
            type: 'dropdown',
            priority: 4.1,
            children: [{
                name: 'LOGIN',
                state: 'authentication.login',
                type: 'link'
            },{
                name: 'MENU.AUTH.SIGN_UP',
                state: 'authentication.signup',
                type: 'link'
            },{
                name: 'MENU.AUTH.FORGOT',
                state: 'authentication.forgot',
                type: 'link'
            },{
                name: 'MENU.AUTH.LOCK',
                state: 'authentication.lock',
                type: 'link'
            },{
                name: 'MENU.AUTH.PROFILE',
                state: 'triangular.admin-default.profile',
                type: 'link'
            }]
        });*/
    }
})();