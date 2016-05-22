(function() {
    'use strict';

    angular
        .module('app.examples.elements')
        .controller('AttendanceController', AttendanceController)
        .controller('AttendanceContentController', AttendanceContentController);

    /* @ngInject */
    function AttendanceController($rootScope, $window, $location, $stateParams, $http, $state, $scope, $interval, $mdSidenav, $mdToast, $filter, $mdDialog, $compile, Auth, ClassListService, AttendanceTableService) {
        var vm = this;
        vm.buttonClass = 'md-primary';
        vm.buttonHue = 'md-default';
        $scope.isOpen = true;
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
        $scope.openSidebar = function (id) {
            $mdSidenav(id).toggle();
        };
        function getClassList () {
            ClassListService.getClassList(classListCallSuccess);

        };
        function classListCallSuccess(json, status, headers, config) {
            $scope.classList = json.data;
            // ClassListService.setClassList($scope.classList);
            // getGeneralAnalyticsList();
        };
        function classListCallFailure(json, status, headers, config) {
            console.log("error receiving data");
        };
        var vm = this;

        ////////////////
        $scope.cardCounter = 0;
        $rootScope.$on('takeAttendanceEvent', function(event, args) {
            $scope.classId = args.classId;
            $scope.selectedDate = args.date;
            var className = args.classId.split("-")[0];
            var section = args.classId.split("-")[1];
            var printDate = new Date(args.date);
            AttendanceTableService.getUsers('http://localhost:3000/api/attendance/retrieve/bydate', className, section, printDate).then(function(data){
              var data = data.data;
              // alert(data);
              if (data == "") {
                AttendanceTableService.getUsers('http://localhost:3000/api/attendance/create', className, section, printDate).then(function(users){
                    vm.userData = users.data;
                    renderCreateCard(printDate, className, section);
                });
              }
              else {
                vm.userData = data;
                renderCreateCard(printDate, className, section);
              }
            });

        });

        $rootScope.$on('viewSpecificAttendanceEvent', function(event, args) {
            var st = document.getElementById('viewAttendanceCardsOuterDiv');
            st.innerHTML = "";
            $scope.classId = args.classId;
            if(args.classId) {
              var className = args.classId.split("-")[0];
              var section = args.classId.split("-")[1];
              var userid = args.uid;
              var startDate = new Date(args.startDate);
              var endDate = new Date(args.endDate);
              var daysOfYear = [];
              var dateIncluded = false;
              var dataToBeRendered = null;
              $http({
                url: "http://localhost:3000/api/attendance/class/totalnumberofclassestaken",
                method: "POST",
                data: $.param({token: Auth.getToken(), class: className, section: section}),
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                })
                .success(function(data) {
                    if(data.success){
                        for(var i=0; i<$scope.classList.length; i++){
                            var aClass = $scope.classList[i];
                            if(aClass.class == className && aClass.section == section){
                                aClass.totalnumberofclassestaken = data.data;

                                for (var d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
                                  AttendanceTableService.getUsers('http://localhost:3000/api/attendance/retrieve/bydate', className, section, new Date(d), userid).then(function(users){
                                    var allSums = {};
                                    var data = users.data;
                                    if(data){
                                      if (dataToBeRendered != null){
                                          // alert("here");
                                          dataToBeRendered[1].data.push(data[1].data[0]);
                                      }
                                      else {
                                        dataToBeRendered = data;
                                      }
                                      var printDate1 = new moment(data[1].data[0].date).toDate();
                                      var monthNames = ["January", "February", "March", "April", "May", "June",
                                        "July", "August", "September", "October", "November", "December"
                                      ];
                                      dataToBeRendered[1].data.forEach(function (val) {
                                          var tempDate = new Date(val.date);
                                          val.date = tempDate.getDate()+" "+monthNames[tempDate.getMonth()]+" "+tempDate.getFullYear();
                                      });

                                      var lastRowData = aClass.totalnumberofclassestaken;
                                      var studentName = dataToBeRendered[1].data[0].name;
                                      var rollNumber = dataToBeRendered[1].data[0].rollno;
                                      if(!dateIncluded ){
                                        dateIncluded = true;
                                        dataToBeRendered[0].data.shift();
                                        dataToBeRendered[0].data.shift();
                                        dataToBeRendered[0].data.unshift({type: "String", name: "Date", attribute: "date"});
                                      }

                                      var periodList = [];
                                      dataToBeRendered[0].data.forEach(function (data) {
                                          if(data.type == "checkbox"){
                                              periodList.push(data.attribute);
                                          }
                                      });
                                      // alert(JSON.stringify(dataToBeRendered));
                                      dataToBeRendered[1].data.forEach(function (data) {
                                          // alert(JSON.stringify(periodList));
                                          for(var j=0; j<periodList.length; j++){
                                              var period = periodList[j];
                                              if(allSums[period] != undefined){
                                                  if(data[period] == "true"){
                                                      allSums[period]++;
                                                  }
                                              }
                                              else{
                                                  allSums[period] = 0;
                                                  if(data[period] == "true"){
                                                      // alert(data[period]);
                                                      allSums[period]++;
                                                  }
                                              }
                                          }
                                      });
                                      // alert(JSON.stringify("allSums"));
                                      // alert(JSON.stringify(allSums));
                                      // for(var i = 0; i<lastRowData.length; i++){
                                      //     lastRowData[i].max = lastRowData[i].value;
                                      //     alert(lastRowData[i].id);
                                      //     lastRowData[i].value = allSums[lastRowData[i].id];
                                      // }
                                      // alert(JSON.stringify(lastRowData));
                                      renderSingleStudentViewCard(dataToBeRendered, studentName, className, section, lastRowData, rollNumber, allSums);
                                    }
                                  });
                                }
                                break;
                            }
                        }
                    }
                })
                .error(function (data) {
                    console.log();
                });
            }

        });

        $rootScope.$on('viewAttendanceEvent', function(event, args) {
            var st = document.getElementById('viewAttendanceCardsOuterDiv');
            st.innerHTML = "";
            $scope.classId = args.classId;
            if(args.classId) {
              var className = args.classId.split("-")[0];
              var section = args.classId.split("-")[1];
              var startDate = new Date(args.startDate);
              var endDate = new Date(args.endDate);
              var daysOfYear = [];
              var count = 1;
              for (var d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
                AttendanceTableService.getUsers('http://localhost:3000/api/attendance/retrieve/bydate', className, section, new Date(d)).then(function(users){
                  var data = users.data;
                  if(data){
                    var printDate1 = new moment(data[1].data[0].date).toDate();
                    console.log("inside For loop: "+printDate1);
                    renderViewCard(data, printDate1, className, section);
                  }
                });
              }
            }

        });
        $scope.saveTable = function () {
            var response = [];
            for (var key in $scope.resData) {
              if ($scope.resData.hasOwnProperty(key)) {
                var tempObj = {};
                tempObj["id"] = key;
                tempObj["details"] = {};
                for (var innerKey in $scope.resData[key]){
                  tempObj["details"][innerKey] = $scope.resData[key][innerKey]+"";
                }
              }
              response.push(tempObj);
          }

          $http({
                  url: 'http://localhost:3000/api/attendance/save',
                  method: "POST",
                  headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                  data: $.param({"token": Auth.getToken(), "class": $scope.classId.split("-")[0], "section": $scope.classId.split("-")[1], "date": new Date($scope.selectedDate), "data": response})
                  }).success(attendanceSaved).error(attendanceNotSaved);
            // $scope.disabled=true;
          }
          function attendanceSaved(data) {
            alert("Saved "+ JSON.stringify(data));
          };
          function attendanceNotSaved(data) {
            alert("not saved "+data);
          }
        function renderCreateCard(studentName, className, section) {
          if (vm.userData) {
            // $scope.resData = [];
            $scope.disabled = false;
            var attributeList = [];
            var tempObj = {};
            var typeList = {};
            var tableStr =  '<md-card flex="90" class="ng-scope md-cyan-theme flex-90">\
                                <div class="ng-scope">\
                                    <md-data-table-toolbar ng-hide="vm.selected.length || vm.filter.show">\
                                        <h2 class="md-title">TAKE ATTENDANCE</h2>\
                                        <div>&nbsp; class: '+ className+'-'+section +'</div>\
                                        <div>&nbsp; Student: '+ studentName +'</div>\
                                    </md-data-table-toolbar>\
                                    <table id="table'+$scope.cardCounter+'" class="display table table-bordered table-striped table-hover">';
              vm.userData.forEach(function (data) {
                  if (data.type == "header") {
                    tableStr += '<thead>\
                      <tr>';
                      data.data.forEach(function (titleElement) {
                          tableStr += '<th>'+ titleElement.name +'</th>';
                          attributeList.push(titleElement.attribute);
                          typeList[titleElement.attribute] = titleElement.type;
                      });
                      tableStr += '</tr>';
                      tableStr += '</thead>';
                  }
                  else if (data.type == "value") {
                      tableStr += '<tbody>';
                      data.data.forEach(function (dataRow) {
                          $scope.resData[dataRow.uid] = {};
                          tableStr += '<tr id="'+dataRow.uid+'">';
                          attributeList.forEach(function (attribute) {
                              if (typeList[attribute] == "checkbox") {
                                    $scope.resData[dataRow.uid][attribute] = dataRow[attribute];
                                    tableStr += '<td><input type="checkbox" aria-label="t" ng-checked="'+dataRow[attribute]+'" ng-model="'+attribute+"_"+dataRow.uid+'" ng-click="checkBoxChanged(\''+attribute+"_"+dataRow.uid+'\' , '+attribute+"_"+dataRow.uid+', \'' +dataRow.uid+'\',\''+attribute+'\')" ng-disabled="disabled"></td>';
                              }
                              else {
                                  tableStr += '<td><span>'+ dataRow[attribute] +'</span></td>';
                              }
                          });

                          tableStr += '</tr>';
                      });
                  }
              });
              tableStr+='<md-button class="md-primary" ng-click="saveTable()">Save</md-button>\
              <md-button ng-click="">Cancel</md-button>';
              tableStr += '</tbody>';
              tableStr += '</table>';
              tableStr += '</div>';
              tableStr += '</md-card>';
          }
          $scope.cardCounter+=1;
          var st = document.getElementById('attendanceCardsOuterDiv');
          st.innerHTML =  tableStr;
          $compile(st)($scope);
        }

        $scope.resData = {};
        $scope.checkBoxChanged = function (model, state, id, attr) {
            $scope.resData[id][attr] = state;
        };

        function renderViewCard(datas, printDate1, className, section) {
          // alert(printDate1);
          var heading = "View Attendance";
          var str = "";
          var attributeList = [];
          var tempObj = {};
          var typeList = {};
          $scope.viewDisabled = true;

          if (datas) {
            var tableStr =  '<md-card flex="90" class="ng-scope md-cyan-theme flex-90">\
                                <div class="ng-scope">\
                                    <md-data-table-toolbar ng-hide="vm.selected.length || vm.filter.show">\
                                        <h2 class="md-title">VIEW ATTENDANCE</h2>\
                                        <div> &nbsp; class: '+ className+'-'+section +' </div>\
                                        <div> &nbsp; date: '+ printDate1 +' </div>\
                                    </md-data-table-toolbar>\
                                    <table id="table'+$scope.cardCounter+'" class="display table table-bordered table-striped table-hover">';
              datas.forEach(function (data) {
                if (data.type == "header") {
                    tableStr += '<thead>\
                      <tr>';
                      data.data.forEach(function (titleElement) {
                          tableStr += '<th>'+ titleElement.name +'</th>';
                          attributeList.push(titleElement.attribute);
                          typeList[titleElement.attribute] = titleElement.type;
                      });
                      tableStr += '</tr>';
                      tableStr += '</thead>';
                  }
                  else if (data.type == "value") {
                      tableStr += '<tbody>';
                      data.data.forEach(function (dataRow) {
                          $scope.resData[dataRow.uid] = {};
                          tableStr += '<tr id="'+dataRow.uid+'">';
                          attributeList.forEach(function (attribute) {
                              if (typeList[attribute] == "checkbox") {
                                    $scope.resData[dataRow.uid][attribute] = dataRow[attribute];
                                    tableStr += '<td><input type="checkbox" aria-label="t" ng-checked="'+dataRow[attribute]+'" ng-model="'+attribute+"_"+dataRow.uid+'" ng-click="checkBoxChanged(\''+attribute+"_"+dataRow.uid+'\' , '+attribute+"_"+dataRow.uid+', \'' +dataRow.uid+'\',\''+attribute+'\')" ng-disabled="viewDisabled"></td>';
                              }
                              else {
                                  tableStr += '<td><span>'+ dataRow[attribute] +'</span></td>';
                              }
                          });

                          tableStr += '</tr>';
                      });
                  }
              });
              tableStr += '</tbody>';
              tableStr += '</table>';
              tableStr += '</div>';
              tableStr += '</md-card>';
          }

        var st = document.getElementById('viewAttendanceCardsOuterDiv');
        st.insertAdjacentHTML('afterbegin', tableStr);
        $compile(st)($scope);
        }

        function renderSingleStudentViewCard(datas, studentName, className, section, lastRowData, rollNumber, allSums) {
          // alert(printDate1);
          var heading = "View Attendance";
          var str = "";
          var attributeList = [];
          var tempObj = {};
          var typeList = {};
          $scope.viewDisabled = true;

          if (datas) {
            var tableStr =  '<md-card flex="90" class="ng-scope md-cyan-theme flex-90">\
                                <div class="ng-scope">\
                                    <md-data-table-toolbar ng-hide="vm.selected.length || vm.filter.show">\
                                        <h2 class="md-title">VIEW ATTENDANCE</h2>\
                                        <div> &nbsp; Class: '+ className+'-'+section +' </div>\
                                        <div> &nbsp; Student: '+ studentName +' </div>\
                                        <div> &nbsp; Roll Number: '+ rollNumber +' </div>\
                                    </md-data-table-toolbar>\
                                    <table id="table0" class="display table table-bordered table-striped table-hover">';
              datas.forEach(function (data) {
                if (data.type == "header") {
                    tableStr += '<thead>\
                      <tr>';
                      data.data.forEach(function (titleElement) {
                          tableStr += '<th>'+ titleElement.name +'</th>';
                          attributeList.push(titleElement.attribute);
                          typeList[titleElement.attribute] = titleElement.type;
                      });
                      tableStr += '</tr>';
                      tableStr += '</thead>';
                  }
                  else if (data.type == "value") {
                      tableStr += '<tbody>';
                      data.data.forEach(function (dataRow) {
                          $scope.resData[dataRow.uid] = {};
                          tableStr += '<tr id="'+dataRow.uid+'">';
                          attributeList.forEach(function (attribute) {
                              if (typeList[attribute] == "checkbox") {
                                    $scope.resData[dataRow.uid][attribute] = dataRow[attribute];
                                    tableStr += '<td><input type="checkbox" aria-label="t" ng-checked="'+dataRow[attribute]+'" ng-model="'+attribute+"_"+dataRow.uid+'" ng-click="checkBoxChanged(\''+attribute+"_"+dataRow.uid+'\' , '+attribute+"_"+dataRow.uid+', \'' +dataRow.uid+'\',\''+attribute+'\')" ng-disabled="viewDisabled"></td>';
                              }
                              else {
                                  tableStr += '<td><span>'+ dataRow[attribute] +'</span></td>';
                              }
                          });

                          tableStr += '</tr>';
                      });
                  }
              });
              // alert(JSON.stringify(lastRowData));

              tableStr+= "<tr>";
              // tableStr+= "<tr><td></td>";
              /*for(var i=0; i<lastRowData.length; i++){
                tableStr+="<td>";
                  tableStr+=allSums[lastRowData[i].id]+"/"+lastRowData[i].value;
                tableStr+="</td>";
              }*/
              tableStr+= "</tr>";
              tableStr += '</tbody>';
              tableStr += '</table>';
              tableStr += '</div>';
              tableStr += '</md-card>';
          }

        var st = document.getElementById('viewAttendanceCardsOuterDiv');
        st.innerHTML = tableStr;
        $compile(st)($scope);
        }


        $scope.callFABAction = function ($event, type, state, templateUrl, controller) {
            // just a hack
            var urlArr = $location.absUrl().split('/');
            var className = urlArr[urlArr.length -1];
            $state.go(state, {item:className});
            $mdDialog.show({
                controller: controller,
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
        $scope.fabButtonList = [/*{
            label: 'Create',
            name: 'create',
            state: 'triangular.admin-default.attendance.content',
            icon: 'zmdi zmdi-plus',
            class: 'md-fab md-raised md-mini md-primary',
            function: 'callFABAction',
            templateUrl: 'app/examples/elements/createAttendance.dialog.html',
            controller: 'createAttendanceDialogController'
        }*/
        ];

        function createAttendanceButtonList () {
            $http({
            url: 'http://localhost:3000/api/haspermission',
            method: "POST",
            data: $.param({token: Auth.getToken(), permission: 'create_attendance'}),
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
          }).success(function(data){
              if (data.success){
                var but = {
                  label: 'Create',
                  name: 'create',
                  state: 'triangular.admin-default.attendance.content',
                  icon: 'zmdi zmdi-plus',
                  class: 'md-fab md-raised md-mini md-primary',
                  function: 'callFABAction',
                  templateUrl: 'app/examples/elements/createAttendance.dialog.html',
                  controller: 'createAttendanceDialogController'
                };
                $scope.fabButtonList.push(but);
              }
          }).error(function(err){
            console.log(err);
          });

          $http({
            url: 'http://localhost:3000/api/haspermission',
            method: "POST",
            data: $.param({token: Auth.getToken(), permission: 'view_self_attendance'}),
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
          }).success(function(data){
              if (data.success){
                  var but = {
                    label: 'View',
                    name: 'view',
                    state: 'triangular.admin-default.attendance.view',
                    icon: 'zmdi zmdi-eye',
                    class: 'md-fab md-raised md-mini md-primary',
                    function: 'callFABAction',
                    templateUrl: 'app/examples/elements/viewAttendance.dialog.html',
                    controller: 'ViewAttendanceDialogController',
                    controllerAs: 'self'
                };
                $scope.fabButtonList.push(but);
              }
          }).error(function(err){
            console.log(err);
          });

          $http({
            url: 'http://localhost:3000/api/haspermission',
            method: "POST",
            data: $.param({token: Auth.getToken(), permission: 'create_attendance'}),
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
          }).success(function(data){
              if (data.success){
                var but = {
                  label: 'Edit',
                  name: 'edit',
                  state: 'triangular.admin-default.attendance.content',
                  icon: 'zmdi zmdi-edit',
                  class: 'md-fab md-raised md-mini md-primary',
                  function: 'callFABAction',
                  templateUrl: 'app/examples/elements/createAttendance.dialog.html',
                  controller: 'createAttendanceDialogController'
                };
                $scope.fabButtonList.push(but);
              }
          }).error(function(err){
            console.log(err);
          });
          }
        createAttendanceButtonList();

        $scope.callFunction = function (name, param, type, state, templateUrl, controller) {
            if(angular.isFunction($scope[name])) {
                $scope[name](param, type, state, templateUrl, controller);
            }
        }

        $scope.calculateAverage = function (arr) {
            var avg = 0;
            if(arr && arr.length>0){
              arr.forEach(function (data) {
                avg+=data.value;
              });
              avg = $window.Math.ceil(avg/arr.length);;
              return avg;
            }
            return 0;
        }

        function getGeneralAnalyticsList() {
            console.log($scope.classList);
            $scope.classList.forEach(function (aClass) {
                $http({
                url: "http://localhost:3000/api/attendance/class/totalnumberofclassestaken",
                method: "POST",
                data: $.param({token: Auth.getToken(), class: aClass.class, section: aClass.section}),
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                })
                .success(function(data) {
                    if(data.success){
                        aClass.totalnumberofclassestaken = data.data;
                    }
                })
                .error(function (data) {
                    console.log();
                });
            });
        }

        $scope.classSelected = function (className) {
          $scope.classList.forEach(function (item) {
            var urlArr = $location.absUrl().split('/');
            var className = urlArr[urlArr.length -1];
              /*if(item.name == className){
                  $scope.currentClass = item;
                  $http({
                      url: "http://localhost:3000/api/attendance/class/totalnumberofclassestaken",
                      method: "POST",
                      data: $.param({token: Auth.getToken(), class: className.split("-")[0], section: className.split("-")[1]}),
                      headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                      })
                      .success(function(data) {

                          if(data.success){
                              $scope.currentClass.totalnumberofclassestaken = data.data;
                              var str = '<md-card>\
                                  <md-card-title>\
                                    <md-card-title-text>\
                                        <md-card layout="column">\
                                            <h2 class="md-display-2 font-weight-100 margin-0" flex layout-padding>{{currentClass.name}}</h2>\
                                            <md-divider></md-divider>\
                                            <div flex="20" layout="row" layout-align="space-between center" layout-padding>\
                                                <span class="md-subhead">{{calculateAverage(currentClass.totalnumberofclassestaken)}} class(es) taken</span>\
                                                <md-button class="md-icon-button" aria-label="call">\
                                                </md-button>\
                                            </div>\
                                        </md-card>\
                                        <span class="md-subhead">Summary</span>\
                                      </md-card-title-text>\
                                  </md-card-title>\
                                  <md-card-content layout="row">\
                                    <div ng-repeat="period in currentClass.totalnumberofclassestaken">\
                                      <div flex="50" class="full-width" layout="row" layout-padding>\
                                        <h4 flex="20" class="opacity-80 margin-0 margin-right-20 center center" translate>{{period.id}}</h4>\
                                        <div flex>\
                                          <md-progress-linear class="md-primary margin-bottom-10" md-mode="determinate" value="1"></md-progress-linear>\
                                          <span class="md-caption">{{period.value}} <span translate> classes marked</span></span>\
                                        </div>\
                                      </div>\
                                      <md-divider flex></md-divider>\
                                    </div>\
                                    <md-divider flex></md-divider>\
                                  </md-card-content>\
                              </md-card>';
                              var st = document.getElementById('attendanceCardsOuterDiv');
                              st.innerHTML =  str;
                              $compile(st)($scope);
                          }
                      })
                      .error(function (data) {
                          console.log();
                      });
              }*/
          });


        }

    }
    function AttendanceContentController($scope, $stateParams, ClassListService, $http, Auth) {
        $scope.currentClass = {};
        ClassListService.getClassList(classListCallSuccess);
        function classListCallSuccess(data) {
            if(data.success && $stateParams.item){
                $scope.classList = data.data;
                // alert(JSON.stringify($scope.classList));
                $scope.classList.forEach(function (item) {
                    if(item.name == $stateParams.item){
                        $scope.currentClass = item;
                        $http({
                            url: "http://localhost:3000/api/attendance/class/totalnumberofclassestaken",
                            method: "POST",
                            data: $.param({token: Auth.getToken(), class: $stateParams.item.split("-")[0], section: $stateParams.item.split("-")[1]}),
                            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                            })
                            .success(function(data) {
                                if(data.success){
                                    $scope.currentClass.totalnumberofclassestaken = data.data;
                                }
                            })
                            .error(function (data) {
                                console.log();
                            });
                    }
                });
            }
        }
    }
})();
