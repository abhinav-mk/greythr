(function() {
    'use strict';

    angular
        .module('app', [
            'triangular',
            'ngAnimate', 'ngCookies', 'ngSanitize', 'ngMessages', 'ngMaterial',
            'ui.router', 'pascalprecht.translate', 'LocalStorageModule', 'googlechart', 'chart.js', 'linkify', 'ui.calendar', 'angularMoment', 'textAngular', 'uiGmapgoogle-maps', 'hljs', 'md.data.table', angularDragula(angular), 'ngFileUpload',
            // 'seed-module'
            // uncomment above to activate the example seed module
            'ngMaterialDatePicker', 'app.examples',
        ])
        // create a constant for languages so they can be added to both triangular & translate
        .constant('APP_LANGUAGES', [{
            name: 'LANGUAGES.CHINESE',
            key: 'zh'
        },{
            name: 'LANGUAGES.ENGLISH',
            key: 'en'
        },{
            name: 'LANGUAGES.FRENCH',
            key: 'fr'
        },{
            name: 'LANGUAGES.PORTUGUESE',
            key: 'pt'
        }])
        // set a constant for the API we are connecting to
        .constant('API_CONFIG', {
            'url':  'http://triangular-api.oxygenna.com/'
        })
        .factory('Auth', function($window, $state, $http) {
            var factory = {};
            var tok="";
            factory.authenticate = function(token, keep) {
              tok = token;
              if (keep){
                $window.localStorage.auth_token = token;
                alert(token);
                $window.localStorage.authenticated = true;
              }
              else {
                $window.sessionStorage.auth_token = token;
                $window.sessionStorage.authenticated = true;
              }
            }

            factory.authenticated = function () {
              return $window.localStorage.authenticated || $window.sessionStorage.authenticated;
            }

            factory.getToken = function () {
             if ($window.localStorage.authenticated) {
              return tok;
             }
             else if ($window.sessionStorage.authenticated){
              return tok;
             }
             else return tok;
            }

            factory.deAuthenticate = function () {
              $http({
                    url: 'http://192.168.20.187:3000/api/logout',
                    method: "POST",
                    data: $.param({token: this.getToken()}),
                    headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                    }).then(function () {
                      if ($window.localStorage.authenticated) {
                        $window.localStorage.auth_token = null;
                        $window.localStorage.authenticated = false;
                        $state.transitionTo("authentication.login");
                        return true;
                      }
                      else if ($window.sessionStorage.authenticated){
                        $window.sessionStorage.auth_token = null;
                        $window.sessionStorage.authenticated = false;
                        $state.transitionTo("authentication.login");
                        return true;
                      }
                      else return false;
                    });

              };
           return factory;
        })
        .factory('ClassListService', function($http, Auth) { // the service needs to be upgraded to be called only once.
            var classList = [];
            return {
              getClassList: function(callback) {
                $http({
                url: 'http://192.168.20.187:3000/api/attendance/section/list/',
                method: "POST",
                data: $.param({token: Auth.getToken()}),
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                }).success(callback).error(function (data) {
                  console.log(data);
                });
              },
              setClassList: function (classListDetails) {
                  classList = classListDetails;
              },
              getAvailableClassList: function () {
                  return classList;
              }
            }
        })
        .factory('MenuLoadService', function($http, Auth) { // the service needs to be upgraded to be called only once.
            var menuLoaded = false;
            return {
              setMenuLoaded: function(bool) {
                  menuLoaded = bool;
              },
              getMenuLoaded: function () {
                  return menuLoaded;
              }
            }
        })
        .factory('CalendarEventService', function($http, $httpParamSerializerJQLike, Auth) { // the service needs to be upgraded to be called only once.
            return {
              createSelfCalendarEvent: function (event, success, error) {
                // alert("called");
                $http({
                url: 'http://192.168.20.187:3000/api/calendar/createSelfEvent',
                method: "POST",
                data: $httpParamSerializerJQLike({token: Auth.getToken(), data: event}),
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
              }).success(success).error(error);
            },
            createGlobalCalendarEvent: function (event, success, error) {
              // alert("called");
              $http({
              url: 'http://192.168.20.187:3000/api/calendar/createGlobalEvent',
              method: "POST",
              data: $httpParamSerializerJQLike({token: Auth.getToken(), data: event}),
              headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).success(success).error(error);
          },
              getSelfCalendarEvent: function(success, error) {
                $http({
                url: 'http://192.168.20.187:3000/api/calendar/getSelfEvent',
                data: $httpParamSerializerJQLike({token: Auth.getToken()}),
                method: "POST",
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
              }).success(success).error(error);
            },
            getGlobalCalendarEvent: function(success, error) {
              $http({
              url: 'http://192.168.20.187:3000/api/calendar/getGlobalEvent',
              data: $httpParamSerializerJQLike({token: Auth.getToken()}),
              method: "POST",
              headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).success(success).error(error);
          },

            deleteSelfCalendarEvent: function(id, success, error) {
              $http({
              url: 'http://192.168.20.187:3000/api/calendar/deleteSelfEvent',
              data: $httpParamSerializerJQLike({token: Auth.getToken(), id: id}),
              method: "POST",
              headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).success(success).error(error);
          },
          deleteGlobalCalendarEvent: function(id, success, error) {
            $http({
            url: 'http://192.168.20.187:3000/api/calendar/deleteGlobalEvent',
            data: $httpParamSerializerJQLike({token: Auth.getToken(), id: id}),
            method: "POST",
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
          }).success(success).error(error);
        },
          editSelfCalendarEvent: function(event, success, error) {
            $http({
            url: 'http://192.168.20.187:3000/api/calendar/editSelfEvent',
            data: $httpParamSerializerJQLike({token: Auth.getToken(), data: event}),
            method: "POST",
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
          }).success(success).error(error);
        },
          editGlobalCalendarEvent: function(event, success, error) {
            $http({
            url: 'http://192.168.20.187:3000/api/calendar/editGlobalEvent',
            data: $httpParamSerializerJQLike({token: Auth.getToken(), data: event}),
            method: "POST",
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
          }).success(success).error(error);
          }
            }
        })
        .run(function ($rootScope, $state, Auth) {
            $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
            if (toState.authenticate && !Auth.authenticated()) {
                // alert("timtim");
                $rootScope.returnToState = toState.url;
                $rootScope.returnToStateParams = toParams.Id;
                $state.transitionTo('authentication.login');
                event.preventDefault();
              }
        });
        });
})();
