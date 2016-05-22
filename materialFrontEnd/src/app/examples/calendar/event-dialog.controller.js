(function() {
    'use strict';

    angular
        .module('app.examples.calendar')
        .controller('EventDialogController1', EventDialogController1);

    /* @ngInject */
    function EventDialogController1($scope, $mdDialog, $filter, triTheming, $http, dialogData, event, edit, Auth, $timeout, $q, $httpParamSerializerJQLike, $log) {
        $scope.selectedVegetables =[];
        var vm = this;
        vm.cancelClick = cancelClick;
        vm.colors = [];
        vm.colorChanged = colorChanged;
        vm.deleteClick = deleteClick;
        vm.allDayChanged = allDayChanged;
        vm.sharedEventChanged = sharedEventChanged;
        vm.dialogData = dialogData;
        vm.edit = edit;
        vm.event = event;
        vm.okClick = okClick;
        vm.selectedColor = null;
        $scope.showGlobalToggle = false;
        // create start and end date of event
        vm.start = event.start.toDate();
        vm.startTime = convertMomentToTime(event.start);

        if(event.end !== null) {
            vm.end = event.end.toDate();
            vm.endTime = convertMomentToTime(event.end);
        }

        ////////////////
        function sharedEventChanged() {
            if(vm.event.sharedEvent){
              vm.event.palette = "yellow";
              vm.event.backgroundColor = "rgb(255, 235, 59);";
              vm.event.borderColor = "rgb(255, 235, 59);";
            }
        }
        function colorChanged() {
            vm.event.backgroundColor = vm.selectedColor.backgroundColor;
            vm.event.borderColor = vm.selectedColor.backgroundColor;
            vm.event.textColor = vm.selectedColor.textColor;
            vm.event.palette = vm.selectedColor.palette;
        }

        function okClick() {
            vm.event.start = updateEventDateTime(vm.start, vm.startTime);
            if(vm.event.end !== null) {
                vm.event.end = updateEventDateTime(vm.end, vm.endTime);
            }
            vm.event.roles = $scope.selectedVegetables1;
            var classAndSubject = [];
            for(var i=0; i<$scope.classList.length; i++) {
                classAndSubject.push({
                  class: $scope.classList[i].value.split("-")[0],
                  section: $scope.classList[i].value.split("-")[1],
                  subjects: $scope.selectedVegetables[i]
                });
            }
            vm.event.classAndSubject = classAndSubject;
            // alert(JSON.stringify(vm.event.classAndSubject));
            $mdDialog.hide(vm.event);
        }

        function cancelClick() {
            $mdDialog.cancel();
        }

        function deleteClick() {
            vm.event.deleteMe = true;
            $mdDialog.hide(vm.event);
        }

        function allDayChanged() {
            // if all day turned on and event already saved we need to create a new date
            if(vm.event.allDay === false && vm.event.end === null) {
                vm.event.end = moment(vm.event.start);
                vm.event.end.endOf('day');
                vm.end = vm.event.end.toDate();
                vm.endTime = convertMomentToTime(vm.event.end);
            }
        }

        function convertMomentToTime(moment) {
            return {
                hour: moment.hour(),
                minute: moment.minute()
            };
        }

        function updateEventDateTime(date, time) {
            var newDate = moment(date);
            newDate.hour(time.hour);
            newDate.minute(time.minute);
            return newDate;
        }

        function createDateSelectOptions() {
            // create options for time select boxes (this will be removed in favor of mdDatetime picker when it becomes available)
            vm.dateSelectOptions = {
                hours: [],
                minutes: []
            };
            // hours
            for(var hour = 0; hour <= 23; hour++) {
                vm.dateSelectOptions.hours.push(hour);
            }
            // minutes
            for(var minute = 0; minute <= 59; minute++) {
                vm.dateSelectOptions.minutes.push(minute);
            }
        }

        // init
        createDateSelectOptions();

        // create colors
        angular.forEach(triTheming.palettes, function(palette, index) {
            var color = {
                name: index.replace(/-/g, ' '),
                palette: index,
                backgroundColor: triTheming.rgba(palette['500'].value),
                textColor: triTheming.rgba(palette['500'].contrast)
            };

            vm.colors.push(color);

            if(index === vm.event.palette) {
                vm.selectedColor = color;
                vm.colorChanged();
            }
        });

        function displayGlobalToggle() {
            $http({
              url: 'http://localhost:3000/api/haspermission',
              method: "POST",
              data: $.param({token: Auth.getToken(), permission: 'create_attendance'}),
              headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).success(function(data){
              if(data.success){
                $scope.showGlobalToggle = true;
              }
            })
            .error(function (data) {

            });
        }
        displayGlobalToggle();



        // Codepen Code
        var self = $scope;
        $scope.rolesList = [];
        $scope.subjectList = [];
        $scope.classList = [];
        $scope.readonly = false;
        $scope.selectedItem = null;
        $scope.scopeObject = [];
        $scope.searchText = null;
        $scope.querySearch = querySearch;
        $scope.querySearch1 = querySearch1;
        $scope.querySearch2 = querySearch2;
        $scope.vegetables = $scope.rolesList;
        $scope.vegetables1 = $scope.rolesList;
        $scope.selectedVegetables1 = [];
        $scope.autocompleteDemoRequireMatch = true;
        $scope.transformChip = transformChip;


        function transformChip(chip) {
          return chip;
        }

        function querySearch (query) {
          // alert(query);
          var results = query ? $scope.vegetables.filter(createFilterFor(query)) : [];
          return results;
        }

        function querySearch2 (item, val, query) {
          // alert(JSON.stringify($scope.selectedVegetables));
          var index = $scope.classList.indexOf(item);
          var className = val.split("-");
          var class1 = className[0];
          var section = className[1];
          var arr = $scope.scopeObject;
          var subjects = [];
          for(var i=0; i<arr.length; i++){
            if(arr[i].class == class1 && arr[i].section == section){
                subjects = arr[i].subjects;
                break;
            }
          }
          // alert(index);
          var results = query ? subjects.filter(createFilterFor(query)) : [];
          return results;
        }

        function createFilterFor(query) {
          var lowercaseQuery = angular.lowercase(query);
          return function filterFn(vegetable) {
            var x = vegetable.toLowerCase();
            return (x.indexOf(lowercaseQuery) === 0)
          };
        }


        function loadRolesList() {
            var rolesList = [];
            $http({
            url: 'http://localhost:3000/api/school/roles',
            method: "POST",
            data: $httpParamSerializerJQLike({token: Auth.getToken()}),
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
          }).success(
            function (data) {
                $scope.vegetables = data.roles;
            }
          ).error(
            function (data) {
              console.log("error:" + JSON.stringify(data));
            }
          );
        }
        loadRolesList();
        // End Codepen code

        // autocomplete code
        var self = this;
        self.simulateQuery = false;
        self.isDisabled    = false;
        // list of `state` value/display objects
        self.selectedItem1 = null;
        self.querySearch1   = querySearch1;
        self.selectedItemChange = selectedItemChange;
        self.searchTextChange   = searchTextChange;
        self.newState = newState;
        $scope.classList = [];

        function newState(state) {
          // alert("Sorry! You'll need to create a Constituion for " + state + " first!");
        }
        // ******************************
        // Internal methods
        // ******************************
        /**
         * Search for states... use $timeout to simulate
         * remote dataservice call.
         */

        function querySearch1 (query) {
          var results = query ? self.states.filter( createFilterFor1(query) ) : self.states,
              deferred;
          if (self.simulateQuery) {
            deferred = $q.defer();
            $timeout(function () { deferred.resolve( results ); }, Math.random() * 1000, false);
            return deferred.promise;
          } else {
            return results;
          }
        }
        function searchTextChange(text) {
          $log.info('Text changed to ' + text);
          // $scope.classList.push(text);
        }
        function selectedItemChange(item) {
          $log.info('Item changed to ' + JSON.stringify(item));
          if (item){
            if (typeof(item) == 'object'){
              var className = item.value.split("-");
              var class1 = className[0];
              var section = className[1];
              var arr = $scope.scopeObject;
              for(var i=0; i<arr.length; i++){
                if(arr[i].class == class1 && arr[i].section == section){
                    item.subjects = arr[i].subjects;
                    break;
                }
              }
              $scope.classList.push(item);
              // alert(JSON.stringify(item));
            }
          }
        }
        /**
         * Build `states` list of key/value pairs
         */
         $scope.deleteClassFromList = function (data) {
           var arr = $scope.classList;
           for(var i=0; i<arr.length; i++){
             if(arr[i].value == data){
                 arr.splice(i, 1);  //removes 1 element at position i
                  // alert(JSON.stringify($scope.selectedVegetables));
                 $scope.selectedVegetables.splice(i, 1);
                 break;
             }
           }
         }
        function loadAll() {

          var str = "";
          self.subjectArr = [];
          if ($scope.scopeObject) {
            // alert(JSON.stringify($scope.scopeObject));
            $scope.scopeObject.forEach(function (obj) {
                str+=obj.class+"-"+obj.section+", ";
                self.subjectArr.push({class: obj.class+"-"+obj.section, subjects: obj.subjects});
            });
          }
          var allStates = 'Alabama, Alaska, Arizona, Arkansas, California, Colorado, Connecticut, Delaware,\
                  Florida, Georgia, Hawaii, Idaho, Illinois, Indiana, Iowa, Kansas, Kentucky, Louisiana,\
                  Maine, Maryland, Massachusetts, Michigan, Minnesota, Mississippi, Missouri, Montana,\
                  Nebraska, Nevada, New Hampshire, New Jersey, New Mexico, New York, North Carolina,\
                  North Dakota, Ohio, Oklahoma, Oregon, Pennsylvania, Rhode Island, South Carolina,\
                  South Dakota, Tennessee, Texas, Utah, Vermont, Virginia, Washington, West Virginia,\
                  Wisconsin, Wyoming';
            allStates = str;
          return allStates.split(/, +/g).map( function (state) {
            var arr = self.subjectArr;
            var subjects = [];
            for(var i=0; i<arr.length; i++){
              if(arr[i].class == state){
                  subjects = arr[i].subjects;  //removes 1 element at position i
                  break;
              }
            }
            return {
              value: state,
              display: state,
              subjects: subjects
            };
          });
        }
        /**
         * Create filter function for a query string
         */
        function createFilterFor1(query) {
          var lowercaseQuery = angular.lowercase(query);
          return function filterFn(state) {
            return (state.value.indexOf(lowercaseQuery) === 0);
          };
        }

        function loadScopeList() {
          var rolesList = [];
          $http({
          url: 'http://localhost:3000/api/user/selfscope',
          method: "POST",
          data: $httpParamSerializerJQLike({token: Auth.getToken()}),
          headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        }).success(
          function (data) {

              $scope.scopeObject = data.scope;
              $scope.selectedVegetables = new Array(data.scope.length);
              for(var j=0;j<data.scope.length;j++)
              {
                  $scope.selectedVegetables[j] = [];
              }
              self.states = loadAll();
              if(vm.event.classAndSubject){
                  for(var i=0; i<vm.event.classAndSubject.length; i++){
                    var data = vm.event.classAndSubject[i];
                    var className = data.class+"-"+data.section;
                    $scope.classList.push({value: className, display: className});
                    // $scope.selectedVegetables.push(new Array());
                    $scope.selectedVegetables.unshift(data.subjects);
                  }
              }
          }
        ).error(
          function (data) {
            console.log("error:" + JSON.stringify(data));
          }
        );
        }
        loadScopeList();
        if(vm.event.roles){
            $scope.selectedVegetables1 = vm.event.roles;
        }
        // end autocomplete code
    }
})();
