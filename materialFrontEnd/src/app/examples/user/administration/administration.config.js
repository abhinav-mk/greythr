(function() {
    'use strict';

    angular
        .module('app.examples.administration')
        .config(moduleConfig)
        .factory('userData', userData);

    /* @ngInject */
    function moduleConfig($translatePartialLoaderProvider, $stateProvider, triMenuProvider) {
        $translatePartialLoaderProvider.addPart('app/examples/user/administration');
        $stateProvider
        .state('triangular.admin-default.administration', {
            url: '/administration',
            authenticate: true,
            templateUrl: 'app/examples/user/administration/administrationTemplate.html',
            controller: 'AdministrationController',
            controllerAs: 'vm'
        })
        .state('triangular.admin-default.administration.content', {
            url: '/class/{item}',
            authenticate: true,
            templateUrl: 'app/examples/user/administration/administration_content.html',
            controller: 'AdministrationContentController'
        })
        .state('triangular.admin-default.administration.display', {
            url: '/class/:item1/user/:item0',
            authenticate: true,
            templateUrl: 'app/examples/user/administration/administration_user.html',
            controller: 'AdministrationUserController',
            controllerAs: 'vm'
        })
        .state('triangular.admin-default.administration.edit', {
            url: '/class/:item1/user/:item0/edit',
            authenticate: true,
            templateUrl: 'app/examples/user/administration/administration_user_edit.html',
            controller: 'AdministrationUserEditController',
            controllerAs: 'vm'
        });

        // triMenuProvider.addMenu({
        //     name: 'users',
        //     icon: 'zmdi zmdi-graduation-cap',
        //     type: 'link',
        //     state: 'triangular.admin-default.administration',
        //     priority: 3.2
        // });
    }
})();

function userData(){
    var userdata = [];
    return {
        setData: function(data){
            userdata = data;
        },
        getData: function(){
            return userdata;
        }  
    }               
}