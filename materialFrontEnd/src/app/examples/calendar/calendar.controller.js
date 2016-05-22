(function() {
    'use strict';

    angular
        .module('app.examples.calendar')
        .controller('CalendarController', CalendarController);

    /* @ngInject */
    function CalendarController($scope, $rootScope, $mdDialog, $mdToast, $filter, $element, triTheming, triLayout, uiCalendarConfig, Auth, CalendarEventService) {
        var vm = this;
        vm.addEvent = addEvent;
        vm.calendarOptions = {
            contentHeight: 'auto',
            selectable: true,
            editable: true,
            header: false,
            viewRender: function(view) {
                // change day
                vm.currentDay = view.calendar.getDate();
                vm.currentView = view.name;
                // update toolbar with new day for month name
                $rootScope.$broadcast('calendar-changeday', vm.currentDay);
                // update background image for month
                triLayout.layout.contentClass = 'calendar-background-image background-overlay-static overlay-gradient-10 calendar-background-month-' + vm.currentDay.month();
            },
            dayClick: function(date, jsEvent, view) { //eslint-disable-line
                vm.currentDay = date;
            },
            eventDrop: function(event, delta, revertFunc) {
                if(event.sharedEvent){
                    editGlobalCalendarEvent(event);
                }
                else{
                    editSelfCalendarEvent(event);
                }
            },

            eventClick: function(calEvent, jsEvent, view) { //eslint-disable-line
                $mdDialog.show({
                    controller: 'EventDialogController1',
                    controllerAs: 'vm',
                    templateUrl: 'app/examples/calendar/event-dialog.tmpl.html',
                    targetEvent: jsEvent,
                    focusOnOpen: false,
                    locals: {
                        dialogData: {
                            title: 'Edit Event',
                            confirmButtonText: 'SAVE'
                        },
                        event: calEvent,
                        edit: true
                    }
                })
                .then(function(event) {
                    var toastMessage = 'Event Deleted';
                    if(angular.isDefined(event.deleteMe) && event.deleteMe === true) {
                        // remove the event from the calendar
                        if(event.sharedEvent) {
                            deleteGlobalCalendarEvent(event, event.createdOn);
                        }
                        else{
                            deleteSelfCalendarEvent(event, event.createdOn);
                        }
                        // console.log(event);
                    }
                    else {
                        // update event
                        if(event.sharedEvent){
                            editGlobalCalendarEvent(event);
                        }
                        else{
                            editSelfCalendarEvent(event);
                        }


                    }

                    // pop a toast
                    // $mdToast.show(
                    //     $mdToast.simple()
                    //     .content($filter('translate')(toastMessage))
                    //     .position('bottom right')
                    //     .hideDelay(2000)
                    // );
                });
            }
        };

        vm.viewFormats = {
            'month': 'MMMM YYYY',
            'agendaWeek': 'w',
            'agendaDay': 'Do MMMM YYYY'
        };

        vm.eventSources = [{
            events: []
        }];

        function editSelfCalendarEvent(event) {
          event.start = event.start.toDate();
          if (event.end){
              event.end = event.end.toDate();
          }
          else{
            event.end = event.start;
          }
            event.source = undefined; // !!!!!!!! DO NOT REMOVE THIS CODE !!!!!!!!!!!!!!!!!!!
            CalendarEventService.editSelfCalendarEvent(event, function (data) {
                if (data.success) {
                  // alert(event.start.format());
                  uiCalendarConfig.calendars['triangular-calendar'].fullCalendar('updateEvent', event);
                  $mdToast.show(
                      $mdToast.simple()
                      .content($filter('translate')('Event Edited Successfully'))
                      .position('bottom right')
                      .hideDelay(2000)
                  );
                }
                else{
                  $mdToast.show(
                      $mdToast.simple()
                      .content($filter('translate')('Event Edit Unsuccessful'))
                      .position('bottom right')
                      .hideDelay(2000)
                  );
                }
            },
            function (data) {
              alert("fail");
              $mdToast.show(
                  $mdToast.simple()
                  .content($filter('translate')('Event Edit Unsuccessful'))
                  .position('bottom right')
                  .hideDelay(2000)
              );
            }
          );
        }

        function editGlobalCalendarEvent(event) {
          event.start = event.start.toDate();
          if (event.end){
              event.end = event.end.toDate();
          }
          else{
            event.end = event.start;
          }
            event.source = undefined; // !!!!!!!! DO NOT REMOVE THIS CODE !!!!!!!!!!!!!!!!!!!
            event.palette = "yellow"
            event.backgroundColor = "rgb(255, 235, 59)"
            event.borderColor = "rgb(255, 235, 59)"
            // alert(JSON.stringify(event));
            CalendarEventService.editGlobalCalendarEvent(event, function (data) {
                if (data.success) {
                  // alert(event.start.format());
                  uiCalendarConfig.calendars['triangular-calendar'].fullCalendar('updateEvent', event);
                  $mdToast.show(
                      $mdToast.simple()
                      .content($filter('translate')('Event Edited Successfully'))
                      .position('bottom right')
                      .hideDelay(2000)
                  );
                }
                else{
                  $mdToast.show(
                      $mdToast.simple()
                      .content($filter('translate')('Event Edit Unsuccessful'))
                      .position('bottom right')
                      .hideDelay(2000)
                  );
                }
            },
            function (data) {
              alert("fail");
              $mdToast.show(
                  $mdToast.simple()
                  .content($filter('translate')('Event Edit Unsuccessful'))
                  .position('bottom right')
                  .hideDelay(2000)
              );
            }
          );
        }

        function addEvent(event, $event) {
            var inAnHour = moment(vm.currentDay).add(1, 'h');
            $mdDialog.show({
                controller: 'EventDialogController1',
                controllerAs: 'vm',
                templateUrl: 'app/examples/calendar/event-dialog.tmpl.html',
                targetEvent: $event,
                focusOnOpen: false,
                locals: {
                    dialogData: {
                        title: 'Add Event',
                        confirmButtonText: 'ADD'
                    },
                    event: {
                        title: $filter('translate')('Event'),
                        sharedEvent: false,
                        allDay: false,
                        start: vm.currentDay,
                        end: inAnHour,
                        palette: 'cyan',
                        stick: true
                    },
                    edit: false
                }
            })
            .then(function(event) {
                var tempDate = event.start.toDate();
                event.start = tempDate;
                tempDate = event.end.toDate();
                event.end = tempDate;
                if (event.sharedEvent){
                    createNewGlobalCalendarEvent(event);
                }
                else{
                    createNewCalendarEvent(event);
                }
            });
        }

        function createNewCalendarEvent(event) {
          // alert(JSON.stringify(event));
          CalendarEventService.createSelfCalendarEvent(event, function (data) {
              if (data.success) {
                  event['createdOn'] = data.createdOn;
                  vm.eventSources[0].events.push(event);
                  // console.log(event);
                  $mdToast.show(
                      $mdToast.simple()
                      .content($filter('translate')('Event Created'))
                      .position('bottom right')
                      .hideDelay(2000)
                  );
              }
              else{
                $mdToast.show(
                    $mdToast.simple()
                    .content($filter('translate')('Event Creation Unsuccessful'))
                    .position('bottom right')
                    .hideDelay(2000)
                );
              }
          },
          function (data) {
            $mdToast.show(
                $mdToast.simple()
                .content($filter('translate')('Failed to create event'))
                .position('bottom right')
                .hideDelay(2000)
            );
          });
        }

        function createNewGlobalCalendarEvent(event) {
          // alert(JSON.stringify(event));
          CalendarEventService.createGlobalCalendarEvent(event, function (data) {
              if (data.success) {
                  event['createdOn'] = data.createdOn;
                  event['owner'] = data.owner;
                  event.palette = "yellow"
                  event.backgroundColor = "rgb(255, 235, 59)"
                  event.borderColor = "rgb(255, 235, 59)"
                  vm.eventSources[0].events.push(event);
                  // console.log(event);
                  $mdToast.show(
                      $mdToast.simple()
                      .content($filter('translate')('Event Created'))
                      .position('bottom right')
                      .hideDelay(2000)
                  );
              }
              else{
                $mdToast.show(
                    $mdToast.simple()
                    .content($filter('translate')('Event Creation Unsuccessful'))
                    .position('bottom right')
                    .hideDelay(2000)
                );
              }
          },
          function (data) {
            $mdToast.show(
                $mdToast.simple()
                .content($filter('translate')('Failed to create event'))
                .position('bottom right')
                .hideDelay(2000)
            );
          });
        }

        function deleteSelfCalendarEvent(event, eventid) {
          CalendarEventService.deleteSelfCalendarEvent(eventid, function (data) {
              if (data.success){
                uiCalendarConfig.calendars['triangular-calendar'].fullCalendar('removeEvents', event._id);
                $mdToast.show(
                    $mdToast.simple()
                    .content($filter('translate')('Event Deleted'))
                    .position('bottom right')
                    .hideDelay(2000)
                );
              }
              else{
                $mdToast.show(
                    $mdToast.simple()
                    .content($filter('translate')('Failed to delete event'))
                    .position('bottom right')
                    .hideDelay(2000)
                );
              }
          },
            function (data) {
              $mdToast.show(
                  $mdToast.simple()
                  .content($filter('translate')('Failed to delete event'))
                  .position('bottom right')
                  .hideDelay(2000)
              );
            }
          );
        }
        function deleteGlobalCalendarEvent(event, eventid) {
          // alert("eventid: "+ eventid);
          // alert(event.sharedEvent);
          CalendarEventService.deleteGlobalCalendarEvent(eventid, function (data) {
              if (data.success){
                uiCalendarConfig.calendars['triangular-calendar'].fullCalendar('removeEvents', event._id);
                $mdToast.show(
                    $mdToast.simple()
                    .content($filter('translate')('Event Deleted'))
                    .position('bottom right')
                    .hideDelay(2000)
                );
              }
              else{
                $mdToast.show(
                    $mdToast.simple()
                    .content($filter('translate')('Failed to delete event'))
                    .position('bottom right')
                    .hideDelay(2000)
                );
              }
          },
            function (data) {
              $mdToast.show(
                  $mdToast.simple()
                  .content($filter('translate')('Failed to delete event'))
                  .position('bottom right')
                  .hideDelay(2000)
              );
            }
          );
        }
        function getAllUserEvents() {
          CalendarEventService.getSelfCalendarEvent(function (data) {
            // alert(JSON.stringify(data));
            if (data.success){
              if(data.result){
                  data.result.eventList.forEach(function (event) {
                    var tempDate = moment(event.start);
                    event.start = tempDate;
                    tempDate = moment(event.end);
                    event.end = tempDate;
                    vm.eventSources[0].events.push(event);
                  });
              }
            }
          },
        function (data) {
          alert("failure: "+data);
        });
        }
        function getAllGlobalEvents() {
          CalendarEventService.getGlobalCalendarEvent(function (data) {
            // alert(JSON.stringify(data));
            if (data.success){
              if(data.result){
                  data.result.eventList.forEach(function (event) {
                    var tempDate = moment(event.start);
                    event.start = tempDate;
                    tempDate = moment(event.end);
                    event.end = tempDate;
                    vm.eventSources[0].events.push(event);
                  });
              }
            }
          },
        function (data) {
          alert("failure: "+data);
        });
        }
        getAllUserEvents();
        getAllGlobalEvents();



        // listeners

        $scope.$on('addEvent', addEvent);

        // create 10 random events for the month
        // createRandomEvents(100, moment().startOf('year'), moment().endOf('year'));

        function randomDate(start, end) {
            var startNumber = start.toDate().getTime();
            var endNumber = end.toDate().getTime();
            var randomTime = Math.random() * (endNumber - startNumber) + startNumber;
            return moment(randomTime);
        }

        function pickRandomProperty(obj) {
            var result;
            var count = 0;
            for (var prop in obj) {
                if (Math.random() < 1/++count) {
                    result = prop;
                }
            }
            return result;
        }
    }
})();
