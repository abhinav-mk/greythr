(function() {
  'use strict';

  angular
  .module('app.examples.elements')
  .config(moduleConfig);

  /* @ngInject */
  function moduleConfig($translatePartialLoaderProvider, $stateProvider, triMenuProvider) {
    $translatePartialLoaderProvider.addPart('app/examples/elements/');
    $stateProvider
    .state('triangular.admin-default.attendance', {
      url: '/elements/attendance',
      authenticate: true,
      templateUrl: 'app/examples/elements/attendanceTemplate.html',
      controller: 'AttendanceController',
      controllerAs: 'vm'
    })
    .state('triangular.admin-default.messaging', {
      url: '/elements/messaging',
      authenticate: true,
      templateUrl: 'app/examples/elements/messagingTemplate.html'
    })
    .state('triangular.admin-default.marks', {
      url: '/elements/marks',
      authenticate: true,
      templateUrl: 'app/examples/elements/marksTemplate.html',
      controller: 'marksController',
      controllerAs: 'marksAlias'
    })
    .state('triangular.admin-default.attendance.content', {
      url: '/class/:item',
      authenticate: true,
      templateUrl: 'app/examples/elements/attendance_content.html',
    })
    .state('triangular.admin-default.marks.content', {
      url: '/class/:class-:section/:exam',
      authenticate: true,
      templateUrl: 'app/examples/elements/marks_content.html',
      controller: 'MarksContentController',
    })
    .state('triangular.admin-default.marks.new', {
      url: '/class/new/:item',
      authenticate: true,
      templateUrl: 'app/examples/elements/marks_content_new.html',
      controller: 'MarksCreateController'
    })
    .state('triangular.admin-default.marks.edit', {
      url: '/class/edit/:item',
      authenticate: true,
      templateUrl: 'app/examples/elements/marks_content_edit.html',
      controller: 'MarksEditController'
    })
    .state('triangular.admin-default.marks.editinfo', {
      url: '/class/editinfo/:item',
      authenticate: true,
      templateUrl: 'app/examples/elements/marks_content_editinfo.html',
      controller: 'MarksEditInfoController'
    })
    .state('triangular.admin-default.attendance.view', {
      url: '/class/view/:item',
      authenticate: true,
      templateUrl: 'app/examples/elements/attendance_content_view.html',
      // controller: 'AttendanceContentController',
    })
    .state('triangular.admin-default.schoolinfo', {
      url: '/schoolinfo',
      authenticate: true,
      templateUrl: 'app/examples/elements/schoolinfo.html',
      controller: 'SchoolInfoController'
    });

    // triMenuProvider.addMenu({
    //   name: 'ATTENDANCE',
    //   icon: 'zmdi zmdi-graduation-cap',
    //   type: 'link',
    //   state: 'triangular.admin-default.attendance',
    //   priority: 3.1
    // });
    // triMenuProvider.addMenu({
    //   name: 'MARKS',
    //   icon: 'zmdi zmdi-graduation-cap',
    //   type: 'link',
    //   state: 'triangular.admin-default.marks',
    //   priority: 3.2
    // });
  }
})();
