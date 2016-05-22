(function() {
    'use strict';

    angular
        .module('app.examples.administration')
        .controller('AdministrationController', AdministrationController)
        .controller('AdministrationContentController', AdministrationContentController)
        .controller('AdministrationUserController', AdministrationUserController)
        .controller('AdministrationUserEditController', AdministrationUserEditController)
        .controller('AdministrationCreateController', AdministrationCreateController);

    /* @ngInject */
    function AdministrationController($rootScope, $state, $scope, $interval, $mdSidenav, $mdToast, $filter, $mdDialog, Auth, ClassListService, $http) {
        var vm = this;
        vm.buttonClass = 'md-primary';
        vm.buttonHue = 'md-default';
        $scope.isOpen = true;
        vm.buttonDisabled = false;
        vm.determinateValue = 30;
        vm.determinateValue2 = 30;
        $interval(intervalTriggered, 100, 0, true);
        $scope.hasPrivilege = false;

        $http({
            url: 'http://localhost:3000/api/haspermission',
            method: "POST",
            data: $.param({token:Auth.getToken(),permission:'create_user'}),
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        }).success(function(data){
            if(data.success)
            {
                $scope.hasPrivilege = true;
            }
        })
        ////////////////

        function intervalTriggered() {
            vm.determinateValue += 1;
            vm.determinateValue2 += 1.5;
            if(vm.determinateValue > 100) {
                vm.determinateValue = 30;
                vm.determinateValue2 = 30;
            }
        }
        $scope.openSidebar = function (id) {
            $mdSidenav(id).toggle();
        };
        function getClassList () {
            ClassListService.getClassList(classListCallSuccess);
        };
        function classListCallSuccess(json, status, headers, config) {
            $scope.classList = json.data;
        };
        function classListCallFailure(json, status, headers, config) {
            console.log("error receiving data");
        };
        var vm = this;

        ////////////////
        // $rootScope.$on('takeAttendanceEvent1', function(event, args) {
        //     alert(JSON.stringify(args));
        // });

        $scope.callFABAction = function ($event, type, templateUrl) {
            $mdDialog.show({
                controller: 'AdministrationCreateController',
                controllerAs: 'vm',
                templateUrl: templateUrl,
                locals: {
                    range: vm.dateRange
                },
                targetEvent: $event
            })
            .then(function() {
                $mdToast.show(
                    $mdToast.simple()
                    .content($filter('translate')('Action Selected'))
                    .position('bottom right')
                    .hideDelay(2000)
                );
            });
        }

        getClassList();

        var vm = this;
        vm.buttonClass = 'md-primary';
        vm.buttonHue = 'md-default';

        vm.buttonDisabled = false;
        vm.determinateValue = 30;
        vm.determinateValue2 = 30;
        $interval(intervalTriggered, 100, 0, true);

        ////////////////

        function intervalTriggered() {
            vm.determinateValue += 1;
            vm.determinateValue2 += 1.5;
            if(vm.determinateValue > 100) {
                vm.determinateValue = 30;
                vm.determinateValue2 = 30;
            }
        }
        var vm = this;
        vm.dateRange = {
            start: moment().startOf('week'),
            end: moment().endOf('week')
        };

        vm.query = {
            order: 'date',
            limit: 5,
            page: 1
        };
        $scope.fabButtonList = [{
            label: 'Create',
            name: 'create',
            icon: 'zmdi zmdi-plus',
            class: 'md-fab md-raised md-mini md-primary',
            function: 'callFABAction',
            templateUrl: 'app/examples/user/administration/createAdministration.dialog.html'
        }];

        $scope.callFunction = function (name, param, type, templateUrl) {
            if(angular.isFunction($scope[name])) {
                $scope[name](param, type, templateUrl);
            }
        }
        // $state.go('triangular.admin-default.attendance.content');
    }
    function AdministrationContentController($http, $scope, Auth,$stateParams,$compile, userData, $state) {
        var user_class = $stateParams.item;
        user_class = user_class.toString().split('-');
        var user_section = user_class[1].toString();
        user_class = user_class[0].toString();
        console.log(user_class+"-"+user_section);

        $http({
            url: 'http://localhost:3000/api/users/specific',
            method: "POST",
            data: $.param({token:Auth.getToken(),class:user_class,section:user_section}),
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        })
        .success(function(data) {
            userData.setData(data.users);
            var a = '<thead>\
                <tr>\
                  <th>Name</th>\
                  <th>Roll Number</th>\
                  <th>Role</th>\
                </tr>\
              </thead>\
              <tbody>'
              for(var i=0;i<data.users.length;i++)
              {
                a +=  '<tr ng-click="fun('+i+')">\
                  <td>'+data.users[i].name+'</td>\
                  <td>'+data.users[i].rollno+'</td>\
                  <td>'+data.users[i].role+'</td>\
                </tr>'
              }
              a += '</tbody>'
              $('#table1').html(a);
              // $('#table1').DataTable({
              //   "bLengthChange": false,
              //   "iDisplayLength": 5,
              //   "filter": false
              // });
              $compile(document.getElementById('table1'))($scope)
        })
        .error(function (data) {
            console.log(data);
        });
        $scope.fun=function (i)
        {
            $state.go('triangular.admin-default.administration.display',{item0:i, item1: $stateParams.item});
        }
    }
    function AdministrationUserController($http, $scope, userData, $stateParams, Auth, $compile, $mdDialog, $state){
        var edit_info = false, delete_info = false;
        var self = false;
        var i = $stateParams.item0;
        var data = userData.getData();
        data = data[i];
        $http({
            url: 'http://localhost:3000/api/user/selfinfo',
            method: "POST",
            data: $.param({token:Auth.getToken()}),
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        }).success(function(data1){
            if(data1.success){
                if(data1.info._id==data._id)
                {
                    edit_info = true;
                    self = true;
                }
            }
            $http({
                url: 'http://localhost:3000/api/haspermission',
                method: 'POST',
                data: $.param({token: Auth.getToken(),permission:'edit_any_user'}),
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).success(function(data2){
                if(data2.success==true)
                {
                    edit_info = true;
                    if(self==false)
                    {
                        delete_info = true;
                    }
                }

                var a = '<tbody>'
                a +=  '<tr>\
                <td>Name</td>\
                  <td>'+data.name+'</td></tr>\
                  <tr><td>Roll Number</td>\
                  <td>'+data.rollno+'</td></tr>\
                  <tr><td>Role</td>\
                  <td>'+data.role+'</td></tr>\
                  <tr><td>Email</td>\
                  <td>'+data.email+'</td></tr>\
                  <tr><td>Phone Number</td>\
                  <td>'+data.phno+'</td></tr>\
                  '
                  var temp = "";
                  for(var i=0;i<data.scope.length;i++)
                  {
                    temp += data.scope[i].class+"-"+data.scope[i].section+",";
                  }
                  temp = temp.substring(0, temp.length - 1);
                  a += '<tr><td>Scope</td><td>'+temp+'</td>';
                a += '</tr>'
              a += '</tbody>'
              $('#table2').html(a);
              $compile(document.getElementById('table2'))($scope)
              var b = "";
              if(edit_info)
              {
                b += "<md-button class='md-raised' ng-click='editUser()' ng-class='[vm.buttonClass, vm.buttonHue]' aria-label='raised button'>Edit User</md-button>"
              }
              if(delete_info)
              {
                b += "<md-button class='md-raised' ng-click='deleteUser()'ng-class='[vm.buttonClass, vm.buttonHue]' aria-label='raised button'>Delete User</md-button>"
              }
              $('#div2').html(b);
              $compile(document.getElementById('div2'))($scope)


            }).error(function(err){
                console.log(err);
            });
        }).error(function(err){
            console.log(err)
        });
        $scope.deleteUser = function()
        {
            var a = confirm("Are you sure?");
            if(a)
            {
                $http({
                    url: 'http://localhost:3000/api/delete/user',
                    method: 'POST',
                    data: $.param({token: Auth.getToken(),id:data._id}),
                    headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                }).success(function(data3){
                    alert("successfully deleted user");
                    $state.go('triangular.admin-default.administration.content',{item:$stateParams.item1});
                }).error(function(err){
                    alert("could not delete user.")
                });
            }
        }
        $scope.editUser = function()
        {
            $state.go('triangular.admin-default.administration.edit',{item1:$stateParams.item1, item0: $stateParams.item0});
        }
    }
    function AdministrationUserEditController($scope, $stateParams, $http, userData, Auth, $state)
    {
        var data1 = userData.getData();
        var data = data1[parseInt($stateParams.item0)];
        console.log(data);
        $scope.user_cs = [];
        for(var i=0;i<data.scope.length;i++)
        {
            $scope.user_cs.push(data.scope[i].class+"-"+data.scope[i].section);
        }
        $scope.toggle = function (item, list) {
            var idx = list.indexOf(item);
            if (idx > -1) list.splice(idx, 1);
            else list.push(item);
        };
          $scope.exists = function (item, list) {
            return list.indexOf(item) > -1;
          };
        $http({
            url: 'http://localhost:3000/api/roles',
            method: 'POST',
            data: $.param({token: Auth.getToken()}),
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        }).success(function(data3){
            if(data3.success)
            {
                $scope.roles_list = data3.roles;
            }
        }).error(function(err){
            alert("Network Error");
        });
        $scope.user_name = data.name;
        $scope.user_email = data.email;
        $scope.user_rollno = data.rollno;
        $scope.user_role = data.role;
        $scope.user_phno = data.phno;
        $scope.privilege = true;
         $http({
                url: 'http://localhost:3000/api/haspermission',
                method: 'POST',
                data: $.param({token: Auth.getToken(),permission:'edit_any_user'}),
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).success(function(data5){
                if(data5.success)
                {
                    $scope.privilege = false;
                }
            }).error(function(err){
                alert(err);
            });
        $http({
            url: 'http://localhost:3000/api/school/info',
            method: 'POST',
            data: $.param({token: Auth.getToken()}),
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        }).success(function(data3){
            if(data3.success)
            {
                    var info = data3.data;
                    var list = []
                    $scope.subjectlist = [];
                    for(var i=0;i<info.scope.length;i++)
                    {
                        list.push(info.scope[i].class+"-"+info.scope[i].section);
                        if(info.scope[i].subjects == undefined)
                        {
                            $scope.subjectlist[i] = [];
                        }
                        else
                        {
                            $scope.subjectlist[i] = info.scope[i].subjects;
                        }
                    }    
                    $scope.classlist = list;
                    ////////////////////

                    var self = $scope;
                    self.selectedItem = [];
                    self.searchText = [];
                    self.querySearch = querySearch;
                    self.vegetables = loadVegetables();
                    self.selectedVegetables = new Array(info.scope.length);
                    for(var j=0;j<info.scope.length;j++)
                    {
                        var bool = false;
                        for(var i=0;i<data.scope.length;i++)
                        {
                            if(data.scope[i].class == info.scope[j].class && data.scope[i].section == info.scope[j].section)
                            {
                                self.selectedVegetables[j] = data.scope[i].subjects;
                                bool = true;
                                break;
                            }
                        }
                        if(bool == false){
                            self.selectedVegetables[j] = [];    
                        }
                    }
                    console.log(self.selectedVegetables)
                    self.autocompleteDemoRequireMatch = true;
                    self.transformChip = transformChip;

                    function transformChip(chip) {
                      return chip;
                    }

                    function querySearch(query, i) {
                        var x = $scope.classlist.indexOf(i);
                      var results = query ? self.vegetables[x].filter(createFilterFor(query)) : [];
                      return results;
                    }
                    
                    function createFilterFor(query) {
                      var lowercaseQuery = angular.lowercase(query);
                      return function filterFn(vegetable) {
                        var x = vegetable.toLowerCase();
                        return (x.indexOf(lowercaseQuery) === 0) 
                      };
                    }

                    function loadVegetables() {
                      var veggies = $scope.subjectlist;
                        return veggies;
                    }
                  }

                    ////////////////////
        }).error(function(err){
            alert("Network Error");
        });
        var id = data._id;

        $scope.cancelEdit = function()
        {
            $state.go('triangular.admin-default.administration');
        }
        $scope.editUserData = function(){
            var scope_class = "";
            var scope_section = "";
            var scope_subjects = "";
            var cs = $scope.user_cs;
                var scope = [];
                for(var i=0;i<cs.length;i++)
                {
                    var temp = {};
                    temp.class = cs[i].split('-')[0];
                    temp.section = cs[i].split('-')[1];
                    if($scope.selectedVegetables[$scope.classlist.indexOf(cs[i])]!=undefined)
                    {
                        temp.subjects = $scope.selectedVegetables[$scope.classlist.indexOf(cs[i])];
                        scope_subjects += $scope.selectedVegetables[$scope.classlist.indexOf(cs[i])].join(',')+";";
                        
                    }
                    else
                    {
                        temp.subjects = [];
                        scope_subjects += ";";
                    }
                    scope_class += temp.class+";";
                    scope_section += temp.section+";";
                    scope.push(temp);
                }
                scope_class = scope_class.substring(0, scope_class.length-1);
                scope_section = scope_section.substring(0, scope_section.length-1);
                scope_subjects = scope_subjects.substring(0, scope_subjects.length-1);
                console.log(scope_subjects);
            $http({
                url: 'http://localhost:3000/api/edit/user/any',
                method: 'POST',
                data: $.param({token: Auth.getToken(),userid:id,name:$scope.user_name,email:$scope.user_email,rollno:$scope.user_rollno,role:$scope.user_role,phno:$scope.user_phno,class:scope_class,section:scope_section,subject:scope_subjects}),
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).success(function(data5){
                data.name = $scope.user_name;
                data.email = $scope.user_email;
                data.rollno = $scope.user_rollno;
                data.role = $scope.user_role;
                data.phno = $scope.user_phno;
                data.scope = scope;
                data1[parseInt($stateParams.item0)] = data;
                userData.setData(data1);
                alert('Successfully updated user');
                $state.go('triangular.admin-default.administration');
            }).error(function(err){
                console.log(err)
            });
        }
    }
    function AdministrationCreateController($rootScope, $scope, $mdDialog, $stateParams, range, ClassListService, $http, Auth, $state) {

        $scope.user_name = "";
        $scope.user_email = "";
        $scope.user_rollno = "";
        $scope.user_role = "";
        $scope.user_phno = "";
        $scope.user_password = "";
        // $scope.user_classSection = "";
        $scope.user_cs = [];
        $scope.toggle = function (item, list) {
            var idx = list.indexOf(item);
            if (idx > -1) list.splice(idx, 1);
            else list.push(item);
        };
          $scope.exists = function (item, list) {
            return list.indexOf(item) > -1;
          };
        $http({
            url: 'http://localhost:3000/api/roles',
            method: 'POST',
            data: $.param({token: Auth.getToken()}),
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        }).success(function(data3){
            if(data3.success)
            {
                $scope.roles_list = data3.roles;
            }
        }).error(function(err){
            alert("Network Error");
        });
///////////

        $http({
            url: 'http://localhost:3000/api/school/info',
            method: 'POST',
            data: $.param({token: Auth.getToken()}),
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        }).success(function(data3){
            if(data3.success)
            {
                    var info = data3.data;
                    var list = []
                    $scope.subjectlist = [];
                    for(var i=0;i<info.scope.length;i++)
                    {
                        list.push(info.scope[i].class+"-"+info.scope[i].section);
                        if(info.scope[i].subjects == undefined)
                        {
                            $scope.subjectlist[i] = [];
                        }
                        else
                        {
                            $scope.subjectlist[i] = info.scope[i].subjects;
                        }
                    }    
                    $scope.classlist = list;
                    ////////////////////

                    var self = $scope;
                    self.selectedItem = [];
                    self.searchText = [];
                    self.querySearch = querySearch;
                    self.vegetables = loadVegetables();
                    self.selectedVegetables = new Array(info.scope.length);
                    for(var j=0;j<info.scope.length;j++)
                    {
                        self.selectedVegetables[j] = []
                    }
                    self.autocompleteDemoRequireMatch = true;
                    self.transformChip = transformChip;

                    function transformChip(chip) {
                      return chip;
                    }

                    function querySearch(query, i) {
                        var x = $scope.classlist.indexOf(i);
                      var results = query ? self.vegetables[x].filter(createFilterFor(query)) : [];
                      return results;
                    }
                    
                    function createFilterFor(query) {
                      var lowercaseQuery = angular.lowercase(query);
                      return function filterFn(vegetable) {
                        var x = vegetable.toLowerCase();
                        return (x.indexOf(lowercaseQuery) === 0) 
                      };
                    }

                    function loadVegetables() {
                      var veggies = $scope.subjectlist;
                        return veggies;
                    }
                  }
        }).error(function(err){
            alert("Network Error");
        });

        var vm = this;
        vm.cancelClick = cancelClick;
        vm.okClick = okClick;

        function okClick() {
            // var scope_class = "";
            // var scope_section = "";
            // var cs = $scope.user_classSection.split(',');
            //     var scope = [];
            //     for(var i=0;i<cs.length;i++)
            //     {
            //         var temp = {};
            //         temp.class = cs[i].split('-')[0];
            //         temp.section = cs[i].split('-')[1];
            //         scope_class += temp.class+";";
            //         scope_section += temp.section+";";
            //         scope.push(temp);
            //     }
            //     scope_class = scope_class.substring(0, scope_class.length-1);
            //     scope_section = scope_section.substring(0, scope_section.length-1);
            // $http({
            //     url: 'http://localhost:3000/api/add/user',
            //     method: 'POST',
            //     data: $.param({token: Auth.getToken(),name:$scope.user_name,email:$scope.user_email,rollno:$scope.user_rollno,role:$scope.user_role,phno:$scope.user_phno,class:scope_class,section:scope_section,password:$scope.user_password}),
            //     headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            // }).success(function(data5){
            //     console.log(data5.message);
            //     alert("Successfully created user");
            //     $state.go('triangular.admin-default.administration');

            // }).error(function(err){
            //     console.log(err)
            // });
            // $mdDialog.hide();
            var scope_class = "";
            var scope_section = "";
            var scope_subjects = "";
            var cs = $scope.user_cs;
                var scope = [];
                for(var i=0;i<cs.length;i++)
                {
                    var temp = {};
                    temp.class = cs[i].split('-')[0];
                    temp.section = cs[i].split('-')[1];
                    if($scope.selectedVegetables[$scope.classlist.indexOf(cs[i])]!=undefined)
                    {
                        temp.subjects = $scope.selectedVegetables[$scope.classlist.indexOf(cs[i])];
                        scope_subjects += $scope.selectedVegetables[$scope.classlist.indexOf(cs[i])].join(',')+";";
                        
                    }
                    else
                    {
                        temp.subjects = [];
                        scope_subjects += ";";
                    }
                    scope_class += temp.class+";";
                    scope_section += temp.section+";";
                    scope.push(temp);
                }
                scope_class = scope_class.substring(0, scope_class.length-1);
                scope_section = scope_section.substring(0, scope_section.length-1);
                scope_subjects = scope_subjects.substring(0, scope_subjects.length-1);
                console.log(scope_subjects);
            $http({
                url: 'http://localhost:3000/api/add/user',
                method: 'POST',
                data: $.param({token: Auth.getToken(),name:$scope.user_name,email:$scope.user_email,rollno:$scope.user_rollno,role:$scope.user_role,phno:$scope.user_phno,class:scope_class,section:scope_section,subject:scope_subjects,password:$scope.user_password}),
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).success(function(data5){
                // data.name = $scope.user_name;
                // data.email = $scope.user_email;
                // data.rollno = $scope.user_rollno;
                // data.role = $scope.user_role;
                // data.phno = $scope.user_phno;
                // data.scope = scope;
                // data1[parseInt($stateParams.item0)] = data;
                // userData.setData(data1);
                alert('Successfully updated user');
                $mdDialog.cancel();
                $state.go('triangular.admin-default.administration');
            }).error(function(err){
                console.log(err)
            });
        }

        function cancelClick() {
            $mdDialog.cancel();
        }

        // init

        vm.start = range.start.toDate();
        vm.end = range.end.toDate();
    }
})();
