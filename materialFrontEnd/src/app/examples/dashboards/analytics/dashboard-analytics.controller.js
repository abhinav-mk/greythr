(function() {
    'use strict';

    angular
        .module('app.examples.dashboards')
        .controller('DashboardAnalyticsController', DashboardAnalyticsController)
        .controller('GeneralController', GeneralController)
        .controller('EventDialogController', EventDialogController)
        .controller('TimeSuggestController', TimeSuggestController);

    /* @ngInject */
    function GeneralController($scope, $timeout, $mdToast, $rootScope, $state) {
        // $state.go('triangular.admin-calendar.calendar');
        $scope.allRules = [{
            description: "Role",
            rule_weightage: "0.6"
          },
          {
            description: "Role",
            rule_weightage: "0.6"
        }
          ];
    }

    function DashboardAnalyticsController($scope, $httpParamSerializerJQLike,$http, $timeout, $mdToast, $rootScope, $state, Auth) {
       /* $timeout(function() {
            $rootScope.$broadcast('newMailNotification');
            $mdToast.show({
                template: '<md-toast><span flex>You have new email messages! View them <a href="" ng-click=vm.viewUnread()>here</a></span></md-toast>',
                controller: newMailNotificationController,
                controllerAs: 'vm',
                position: 'bottom right',
                hideDelay: 5000
            });
        }, 10000);*/

        //////////////
        $scope.title = 1;
        $scope.ifCreateRoomPermitted = true;
        // $scope.allDivs = [];
        // console.log(Auth.getToken())
        $http({
            url: 'http://192.168.20.187:3000/api/authenticate',
            method: "POST",
            data: $.param({email: "raghav@gmail.com", password: "password"}),
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).success(
            function (data) {
              console.log(data);
              $http({
              method: 'POST',
              headers: {'Content-Type': 'application/x-www-form-urlencoded'},
              url: 'http://192.168.20.187:3000/api/getallrooms',
              data: $httpParamSerializerJQLike({token: data.token}),
            }).then(function successCallback(response) {

              // $scope.allDivs = response.data.data;
              // console.log(JSON.stringify($scope.allDivs))
              }, function errorCallback(response) {
                // called asynchronously if an error occurs
                // or server returns response with an error status.
              });


            }
            )
            .error(function (data) {
              // body...
            });

            $http({
            url: 'http://192.168.20.187:3000/api/authenticate',
            method: "POST",
            data: $.param({email: "raghav@gmail.com", password: "password"}),
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).success(
            function (data) {
              console.log(data);
              $http({
              method: 'POST',
              headers: {'Content-Type': 'application/x-www-form-urlencoded'},
              url: 'http://192.168.20.187:3000/api/getallrooms',
              data: $httpParamSerializerJQLike({token: data.token}),
            }).then(function successCallback(response) {

              // $scope.allDivs = response.data.data;
              // console.log(JSON.stringify($scope.allDivs))
              }, function errorCallback(response) {
                // called asynchronously if an error occurs
                // or server returns response with an error status.
              });


            }
            )
            .error(function (data) {
              // body...
            });


        // $(function(){
        // external js: isotope.pkgd.js

        // init Isotope
        var $grid = $('.grid').isotope({
          itemSelector: '.room', 
          masonry: {
            columnWidth: 10
          }
        });


        
        // $grid.isotope({filter:filterValue});
        function filterOptions(message) {
            $grid.isotope();
            console.log(JSON.stringify(message));
            var selectors = [];
            message.mustHave.forEach(function (val) {
                selectors.push(val._lowername.replace(" ", ""));
            });
            // selectors = ['room','WiFi'];
            // alert(JSON.stringify(message));
            var reqCapacity = Number(message.capacity);
            $grid.isotope({
            filter: function() {
                var hasClasses = true;
                for(var i=0;i<selectors.length;i++){
                    if(!$(this).hasClass(selectors[i])){
                        console.log(selectors[i]);
                        hasClasses = false;
                        console.log("here2");
                        break;
                    }
                }
                console.log("here1");
                var number = $(this).find('.capacity').text();
                console.log(Number(number) +" "+ reqCapacity +" "+hasClasses);
                return (Number(number) >= reqCapacity)&&hasClasses;
            }, 
            animationOptions: {
                        duration: 750,
                        easing: 'linear',
                        queue: false
                    }
            });            
        }
        $scope.$on("datareceived", function(event, message){
            filterOptions(message);
            // addRoom(['room','small','videoconference']);
            // addRoom(['room','small','wifi','Intercom']);
            // addRoom(['room','small','wifi','Intercom']);
            // addRoom(['room','small','wifi','Intercom']);
        });
        // });
        /*var addRoom= function(params){
        var temp = document.createElement("div");
        var temp2 = document.createElement("div");
        temp2.style="position: relative;bottom: 0;left: 40px;";
        var tempSpan = document.createElement("span");
        tempSpan.className = "capacity";
        var value = 45;
        tempSpan.innerHTML = value; // capacity
        // <span class="capacity">30</span>
        $(temp).append(tempSpan);
        $(temp).append("<br>");
        for(var i =0;i<params.length;i++){
        $(temp).addClass(params[i]);
        var iconTemp = document.createElement("i");
        iconTemp.className = "fa fa-wifi";
        $(temp2).append(iconTemp);
        }
        $(temp).append(temp2);
        $(temp).css('height',(value*3)+'px');
        $(temp).css('width',(value*3)+'px');
        $('.grid').append(temp);
        };*/
        // init Isotope
        
        
        
        
        function newMailNotificationController() {
            var vm = this;
            vm.viewUnread = function() {
                $state.go('admin-panel-email-no-scroll.email.inbox');
            };
        }
        function concatValues( obj ) {
            var value = '';
            for ( var prop in obj ) {
            value += obj[ prop ];
            }
            return value;
        }
    }

    function EventDialogController($scope, CalendarEventService, $mdDialog, $filter, triTheming, $http, Auth, $timeout, $q, $httpParamSerializerJQLike, $log) {
        
        $scope.myDate = new Date();
        $scope.minDate = new Date(
              $scope.myDate.getFullYear(),
              $scope.myDate.getMonth() - 2,
              $scope.myDate.getDate());
        $scope.maxDate = new Date(
              $scope.myDate.getFullYear(),
              $scope.myDate.getMonth() + 2,
              $scope.myDate.getDate());
        $scope.onlyWeekendsPredicate = function(date) {
            var day = date.getDay();
            return day === 0 || day === 6;
        }
        var self = this;
        $scope.dataChanged = function () {
            var data = {};
            data.capacity = $scope.title;
            data.mustHave = self.selectedVegetables;
            data.anyTime = $scope.anyTime;
            data.date = $scope.date;
            data.start = $scope.time1;
            data.end = $scope.time2;
            data.description = $scope.description;
            // alert(JSON.stringify(self.selectedVegetables));
            $scope.$emit('datareceived',data);
        }
        self.readonly = false;
        self.selectedItem = null;
        self.searchText = null;
        self.querySearch = querySearch;
        self.vegetables = loadVegetables();
        self.selectedVegetables = [];
        self.numberChips = [];
        self.numberChips2 = [];
        self.numberBuffer = '';
        self.autocompleteDemoRequireMatch = true;
        self.transformChip = transformChip;
        /**
         * Return the proper object when the append is called.
         */
        function transformChip(chip) {
          // If it is an object, it's already a known chip
          if (angular.isObject(chip)) {
            return chip;
          }
          // Otherwise, create a new one
          return { name: chip, type: 'new' }
        }
        /**
         * Search for vegetables.
         */
        function querySearch (query) {
          var results = query ? self.vegetables.filter(createFilterFor(query)) : [];
          return results;
        }
        /**
         * Create filter function for a query string
         */
        function createFilterFor(query) {
          var lowercaseQuery = angular.lowercase(query);
          return function filterFn(vegetable) {
            return (vegetable._lowername.indexOf(lowercaseQuery) === 0)
                // (vegetable._lowertype.indexOf(lowercaseQuery) === 0);
          };
        }
        function loadVegetables() {
          var veggies = [
            {
              'name': 'Internet',
              'type': 'Brassica'
            },
            {
              'name': 'Projector',
              'type': 'Brassica'
            },
            {
              'name': 'White Board',
              'type': 'Umbelliferous'
            },
            {
              'name': 'Telephone Communication',
              'type': 'Composite'
            },
            {
              'name': 'Video Conference',
              'type': 'Goosefoot'
            }
          ];
          
          return veggies.map(function (veg) {
            veg._lowername = veg.name.toLowerCase();
            veg._lowertype = veg.type.toLowerCase();
            return veg;
          });
        }
        function loadVegetables1(veg) {
          var veggies = veg;[
            {
              'name': 'Internet',
              'type': 'Brassica'
            },
            {
              'name': 'Projector',
              'type': 'Brassica'
            },
            {
              'name': 'White Board',
              'type': 'Umbelliferous'
            },
            {
              'name': 'Telephone Communication',
              'type': 'Composite'
            },
            {
              'name': 'Video Conference',
              'type': 'Goosefoot'
            }
          ];
          
          return veggies.map(function (veg) {
            veg._lowername = veg.name.toLowerCase();
            // veg._lowertype = veg.type.toLowerCase();
            return veg;
          });
        }

        $http({
            url: 'http://192.168.20.187:3000/api/authenticate',
            method: "POST",
            data: $.param({email: "raghav@gmail.com", password: "password"}),
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).success(
            function (data) {
              console.log(data);
              $http({
              method: 'POST',
              headers: {'Content-Type': 'application/x-www-form-urlencoded'},
              url: 'http://192.168.20.187:3000/api/getallitems',
              data: $httpParamSerializerJQLike({token: data.token}),
            }).then(function successCallback(response) {
              // alert(JSON.stringify(response.data.data));
              self.vegetables = loadVegetables1(response.data.data);
              // console.log(JSON.stringify($scope.allDivs))
              }, function errorCallback(response) {
                // called asynchronously if an error occurs
                // or server returns response with an error status.
              });


            }
            )
            .error(function (data) {
              // body...
            });

    }


    function TimeSuggestController($scope, CalendarEventService, $mdDialog, $filter, triTheming, $http, Auth, $timeout, $q, $httpParamSerializerJQLike, $log) {
        
        $scope.time1 = new Date();
        $scope.time2 = new Date();
        
        $scope.suggestedTimeSelected = function (selectedTime) {
            // alert(selectedTime);
            var hours = selectedTime[0]+""+selectedTime[1];
            var mins = selectedTime[2]+""+selectedTime[3];
            $scope.time1.setHours(hours);
            $scope.time1.setMinutes(mins);
        }
        $scope.timeSuggestButtonClicked = false;
        $scope.suggestTime = function () {
            var times = [];
            $scope.suggestedTimes = ["11:20 ", "12:30 ", "16:30"];
            $scope.timeSuggestButtonClicked = true;
        }
        $scope.myDate = new Date();
        $scope.minDate = new Date(
              $scope.myDate.getFullYear(),
              $scope.myDate.getMonth() - 2,
              $scope.myDate.getDate());
        $scope.maxDate = new Date(
              $scope.myDate.getFullYear(),
              $scope.myDate.getMonth() + 2,
              $scope.myDate.getDate());
        $scope.onlyWeekendsPredicate = function(date) {
            var day = date.getDay();
            return day === 0 || day === 6;
        }
        var self = this;

        $scope.$watch('time1', function(newvalue,oldvalue) {
          $scope.dataChanged();
        });

        $scope.$watch('time2', function(newvalue,oldvalue) {
          $scope.dataChanged();
        });
        $scope.dataChanged = function () {
            var data = {};
            data.capacity = $scope.title;
            data.mustHave = self.selectedVegetables;
            data.anyTime = $scope.anyTime;
            data.date = $scope.date;
            data.start = $scope.time1;
            data.end = $scope.time2;
            data.description = $scope.description;
            // alert(JSON.stringify(self.selectedVegetables));
            $scope.$emit('datareceived',data);
        }
        self.readonly = false;
        self.selectedItem = null;
        self.searchText = null;
        self.querySearch = querySearch;
        self.vegetables = loadVegetables();
        self.selectedVegetables = [];
        self.numberChips = [];
        self.numberChips2 = [];
        self.numberBuffer = '';
        self.autocompleteDemoRequireMatch = true;
        self.transformChip = transformChip;
        /**
         * Return the proper object when the append is called.
         */
        function transformChip(chip) {
          // If it is an object, it's already a known chip
          if (angular.isObject(chip)) {
            return chip;
          }
          // Otherwise, create a new one
          return { name: chip, type: 'new' }
        }
        /**
         * Search for vegetables.
         */
        function querySearch (query) {
          var results = query ? self.vegetables.filter(createFilterFor(query)) : [];
          return results;
        }
        /**
         * Create filter function for a query string
         */
        function createFilterFor(query) {
          var lowercaseQuery = angular.lowercase(query);
          return function filterFn(vegetable) {
            return (vegetable._lowername.indexOf(lowercaseQuery) === 0) ||
                (vegetable._lowertype.indexOf(lowercaseQuery) === 0);
          };
        }
        function loadVegetables() {
          $http({
          method: 'POST',
          url: 'http://192.168.20.187:7474/db/data/cypher',
          query : "MATCH (a:User)-[*1..]-(x: Company) RETURN a;",
          headers: {
            'Content-Type': " application/json; charset=UTF-8"
          },
        }).then(function successCallback(response) {
          alert(response);
            // this callback will be called asynchronously
            // when the response is available
          }, function errorCallback(response) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
          });
          var veggies = [
            {
              'name': 'Ramesh Arvind',
              'type': 'Senior Developer'
            },
            {
              'name': 'Arun M',
              'type': 'Team Lead'
            },
            {
              'name': 'Sujan Adiga',
              'type': 'Manager'
            },
            {
              'name': 'Bhavana K',
              'type': 'Vice President'
            },
            {
              'name': 'Poonam Saini',
              'type': 'CTO'
            }
          ];
          return veggies.map(function (veg) {
            veg._lowername = veg.name.toLowerCase();
            veg._lowertype = veg.type.toLowerCase();
            return veg;
          });
        }

    }
})();
