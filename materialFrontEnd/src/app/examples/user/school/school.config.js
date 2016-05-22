(function() {
    'use strict';

    angular
        .module('app.examples.school')
        .config(moduleConfig)

    /* @ngInject */
    function moduleConfig($translatePartialLoaderProvider, $stateProvider, triMenuProvider) {
        $translatePartialLoaderProvider.addPart('app/examples/user/school');
        $stateProvider
        .state('triangular.admin-default.school', {
            url: '/school',
            authenticate: true,
            templateUrl: 'app/examples/user/school/schoolTemplate.html',
            controller: 'SchoolController',
            controllerAs: 'vm'
        })
        .state('triangular.admin-default.newschool', {
            url: '/school/new',
            authenticate: true,
            templateUrl: 'app/examples/user/school/schoolTemplateCreate.html',
            controller: 'SchoolCreateController',
            controllerAs: 'vm'
        });
    }
})();