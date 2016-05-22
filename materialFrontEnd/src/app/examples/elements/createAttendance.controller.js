(function() {
    'use strict';

    angular
        .module('app.examples.dashboards')
        .controller('createAttendanceDialogController', createAttendanceDialogController)
        .controller('ViewAttendanceDialogController', ViewAttendanceDialogController);

    /* @ngInject */
    function createAttendanceDialogController($rootScope, $scope, $mdDialog, $stateParams, range, ClassListService) {
        var vm = this;
        vm.cancelClick = cancelClick;
        vm.okClick = okClick;
        $scope.classList = [];
        $scope.state_class = $stateParams.item;
        ClassListService.getClassList(classListCallSuccess);
        ////////////////

        function classListCallSuccess(json, status, headers, config) {
            $scope.classList = json.data;
        };
        function okClick() {
            range.start = new moment(vm.start);
            range.end = new moment(vm.end);
            $mdDialog.hide();
            // alert(range.start);
            $rootScope.$emit('takeAttendanceEvent', {date:range.start, classId:$scope.classId});
        }

        function cancelClick() {
            $mdDialog.cancel();
        }
        // init

        vm.start = range.start.toDate();
    }
    function ViewAttendanceDialogController($rootScope, $scope, $mdDialog, $stateParams, range, $http, Auth, ClassListService, $timeout, $q, $log) {
        var vm = this;
        var self = this;
        vm.cancelClick = cancelClick;
        vm.okClick = okClick;
        $scope.classList = [];
        $scope.state_class = $stateParams.item;
        ClassListService.getClassList(classListCallSuccess);
        ////////////////

        function classListCallSuccess(json, status, headers, config) {
            $scope.classList = json.data;
        };
        function okClick() {
            range.start = new moment(vm.start);
            range.end = new moment(vm.end);
            $mdDialog.hide();
            if($scope.specificStudentSwitch){
              // alert(JSON.stringify($scope.studentData));
                if($scope.selectedItem){
                  var studentName = $scope.selectedItem.display.split("[")[0];
                  var rollNumber = new Number($scope.selectedItem.display.split("[")[1].split("]")[0]);
                  var res;
                  // only checking for rollnumber
                  for (var i=0; i < $scope.studentData.length; i++) {
                    if ($scope.studentData[i].rollno == rollNumber) {
                      // alert(JSON.stringify($scope.studentData[i]));
                      res = $scope.studentData[i];
                      break;
                    }
                  }
                  if(res){
                    // alert(JSON.stringify(res));
                    $rootScope.$emit('viewSpecificAttendanceEvent', {startDate: range.start, endDate: range.end, classId:$scope.classId, uid: res.uid});
                  }
                }
            }
            else{
                if($scope.view_any_attendance){
                  $rootScope.$emit('viewAttendanceEvent', {startDate: range.start, endDate: range.end, classId:$scope.classId});
                }
                else{
                  if($scope.view_self_attendance){
                    $http({
                        url: 'http://localhost:3000/api/user/selfinfo',
                        method: "POST",
                        data: $.param({token: Auth.getToken()}),
                        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                      }).success(function(data){
                          if (data.success){
                              $rootScope.$emit('viewSpecificAttendanceEvent', {startDate: range.start, endDate: range.end, classId:$scope.classId, uid: data.info._id});
                          }
                      }).error(function(err){
                        console.log(err);
                      });
                  }
                }
            }
        }

        function cancelClick() {
            $mdDialog.cancel();
        }

        $scope.specificStudentSwitchChanged = function () {
            searchTextChange();
        }

        // init

        vm.start = range.start.toDate();
        vm.end = range.start.toDate();

        self.simulateQuery = false;
        self.isDisabled    = false;
        // list of `state` value/display objects
        self.states        = loadAll();
        $scope.querySearch   = querySearch;
        $scope.selectedItemChange = selectedItemChange;
        $scope.searchTextChange   = searchTextChange;
        $scope.newState = newState;
        $scope.searchTextChange = searchTextChange;

        function newState(state) {
          alert("Sorry! You'll need to create a Constituion for " + state + " first!");
        }
        // ******************************
        // Internal methods
        // ******************************
        /**
         * Search for states... use $timeout to simulate
         * remote dataservice call.
         */
        function querySearch (query) {
          var results = query ? self.states.filter( createFilterFor(query) ) : self.states,
              deferred;
          if (self.simulateQuery) {
            deferred = $q.defer();
            $timeout(function () { deferred.resolve( results ); }, Math.random() * 1000, false);
            return deferred.promise;
          } else {
            return results;
          }
        }

        function studentListRetrieved(data) {
            if(data.success){
                console.log(data.data);
                $scope.studentData = data.data;
                self.states = loadAll();
            }
        }

        function searchTextChange(text) {
          // alert();
          var userInfo = getUserInformation($scope.classId, studentListRetrieved);
          $log.info('Text changed to ' + text);

        }

        function selectedItemChange(item) {
          $log.info('Item changed to ' + JSON.stringify(item));
        }
        function getUserInformation(className, callback) {
          if(className) {
            if($scope.classSelected != className){
              $scope.classSelected = className;
              var classNumber = className.split("-")[0];
              var section = className.split("-")[1];
              $http({
                url: 'http://localhost:3000/api/attendance/getstudentlist/',
                method: "POST",
                data: $.param({token: Auth.getToken(), class: classNumber, section: section}),
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
              })
              .success(callback)
              .error(function (data) {
                console.log(data);
              });
            }
          }
        }
        /**
         * Build `states` list of key/value pairs
         */
        function loadAll() {
          var str = "";
          var rollNumber = "";
          if($scope.studentData){
            for(var i=0; i< $scope.studentData.length; i++){
                var student = $scope.studentData[i];
                str+= student.name+" [ "+student.rollno+" ]";
                if(i < $scope.studentData.length - 1){
                    str+=", ";
                }
            }
          }
          var allStates = 'Alabama, Alaska, Arizona, Arkansas, California, Colorado, Connecticut, Delaware,\
                  Florida, Georgia, Hawaii, Idaho, Illinois, Indiana, Iowa, Kansas, Kentucky, Louisiana,\
                  Maine, Maryland, Massachusetts, Michigan, Minnesota, Mississippi, Missouri, Montana,\
                  Nebraska, Nevada, New Hampshire, New Jersey, New Mexico, New York, North Carolina,\
                  North Dakota, Ohio, Oklahoma, Oregon, Pennsylvania, Rhode Island, South Carolina,\
                  South Dakota, Tennessee, Texas, Utah, Vermont, Virginia, Washington, West Virginia,\
                  Wisconsin, Wyoming';
          allStates = str;
          // alert(allStates);

          return allStates.split(/, +/g).map( function (state) {
            return {
              value: state.toLowerCase(),
              display: state
            };
          });
        }
        /**
         * Create filter function for a query string
         */
        function createFilterFor(query) {
          var lowercaseQuery = angular.lowercase(query);
          return function filterFn(state) {
            return (state.value.indexOf(lowercaseQuery) >= 0);
          };
        }
        function getPermissions() {
          $http({
            url: 'http://localhost:3000/api/haspermission',
            method: "POST",
            data: $.param({token: Auth.getToken(), permission: 'view_any_attendance'}),
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
          }).success(function(data){
              if (data.success){
                  $scope.view_any_attendance = true;
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
                $scope.view_self_attendance = true;
            }
        }).error(function(err){
          console.log(err);
        });
      }
      getPermissions();
    }
})();
