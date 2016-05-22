(function() {
    'use strict';

    angular
        .module('app.examples.elements')
        .controller('marksController', marksController)
        .controller('MarksContentController', MarksContentController)
        .controller('MarksCreateController', MarksCreateController)
        .controller('MarksEditController', MarksEditController)
        .controller('MarksEditInfoController', MarksEditInfoController)
        .factory('ExamListService', function($http, Auth) { // the service needs to be upgraded to be called only once.
            return {
              getExamList: function(callback, id) {
                console.log("ExamListService.getExamList:"+id);
                $http({
                  url: 'http://localhost:3000/api/marks/examlist',
                  method: "POST",
                  data: $.param({token: Auth.getToken(), class:id.split("-")[0], section: id.split("-")[1]}),
                  headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                }).success(callback).error(function (data) {
                  console.log(data);
                });
              }
            }
        });

    /* @ngInject */
    function marksController($rootScope, $stateParams, $http, $state, $scope, $interval, $mdSidenav, $mdToast, $filter, $mdDialog, $compile, Auth, ExamListService, ClassListService, AttendanceTableService) {
        var classSection = "";
        var vm = this;
        vm.buttonClass = 'md-primary';
        vm.buttonHue = 'md-default';
        $scope.isOpen = true;
        vm.buttonDisabled = false;
        vm.determinateValue = 30;
        vm.determinateValue2 = 30;
        $interval(intervalTriggered, 100, 0, true);

        var newButton = "<md-button ng-click='createMarks()' class='md-primary'>NEW</md-button>";
        $http({
          url: 'http://localhost:3000/api/haspermission',
          method: "POST",
          data: $.param({token: Auth.getToken(), permission:'create_marks'}),
          headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        }).success(function(data){
          if(data.success)
          {
            $('#div5').html(newButton);
            $compile(document.getElementById('div5'))($scope)
          }
        }).error(function(err){
          console.log(err);
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
        $scope.getRightSidebar = function (id, id1) {
            console.log("getrightsidebar:"+id);
            classSection = id;
            getExamList(id);
            $mdSidenav(id1).toggle();

        };
        $scope.openSidebar = function (id) {
            $mdSidenav(id).toggle();

        };
        function getClassList () {
            ClassListService.getClassList(classListCallSuccess);
        };
        function getExamList (id) {
          console.log("getExamList:"+id);
            ExamListService.getExamList(examListCallSuccess, id);
        };

        $scope.createMarks = function () {
          // alert($stateParams.item);
          $mdSidenav('example-right1').toggle();
          $mdSidenav('example-left1').toggle();
          $state.go('triangular.admin-default.marks.new', {item: classSection});
        };
        $scope.closeSideBars = function(){
          $mdSidenav('example-right1').toggle();
          $mdSidenav('example-left1').toggle();
        }
        function examListCallSuccess(data, status, headers, config) {
          console.log("data class:"+JSON.stringify(data.data))
          $scope.examList = data.data;
        }
        function classListCallSuccess(json, status, headers, config) {
            $scope.classList = json.data;
        };
        function classListCallFailure(json, status, headers, config) {
            console.log("error receiving data");
        };
        var vm = this;

        ////////////////
       getClassList();

       $http({
          url: 'http://localhost:3000/api/user/selfinfo',
          method: "POST",
          data: $.param({token: Auth.getToken()}),
          headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        }).success(function(data10){
          if(data10.success)
          {
            var str = "";
            $scope.show = [];
            for(var j=0;j<data10.info.scope.length;j++)
            {
              $scope.show[j] = false;
              str += '<div id="'+data10.info.scope[j].class+'-'+data10.info.scope[j].section+'" ng-if="show['+j+']" style="width: 900px; height: 500px"></div>'
            }
            $("#chartgroup").html(str);
            $compile(document.getElementById('chartgroup'))($scope);
            displayGraphs(data10.info);
          }
          else
            alert("Check your internet connection");
        }).error(function(err){
          console.log(err);
        });

        function displayGraphs(info)
        {
          console.log(info);
          var mainData = [];
          for(var i=0;i<info.scope.length;i++)
          {
            var xhttp = new XMLHttpRequest();
            xhttp.open("POST", "http://localhost:3000/api/marks/analytics", false);
            xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            xhttp.send("token="+Auth.getToken()+"&cs="+info.scope[i].class+"-"+info.scope[i].section);
            var data = JSON.parse(xhttp.responseText)
            console.log(data)
            // $http({
            //   url: 'http://localhost:3000/api/marks/analytics',
            //   method: "POST",
            //   data: $.param({token: Auth.getToken(), cs:info.scope[i].class+"-"+info.scope[i].section}),
            //   headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            // }).success(function(data){
              
              var subject_list = info.scope[i].subjects;
              console.log(subject_list)
              var user_class = info.scope[i].class;
              var user_section = info.scope[i].section;
              if(data=="")
              {

              }
              else
              {
                $scope.show[i] = true;
                console.log("coming data");
                console.log(subject_list)
                console.log(data)
                var exams_length = data.length;
                var subjects_length = subject_list.length;
                var chartdata = []
                for(var j=0;j<exams_length+1;j++)
                {
                  chartdata.push([]);
                }
                console.log(chartdata);
                if(exams_length>0 && subjects_length>0)
                {
                  console.log("coming");
                  chartdata[0][0] = 'exams';
                  for(var j=0;j<subjects_length;j++)
                  {
                    console.log(subject_list)
                    chartdata[0].push(subject_list[j]);
                  }
                  for(var j=0;j<exams_length;j++)
                  {
                    chartdata[j+1][0] = data[j].name;
                  }
                  console.log(chartdata);
                  for(var l=0;l<exams_length;l++)
                  {
                    for(var j=0;j<subjects_length;j++)
                    {
                      var temp = -1;
                      for(var k=0;k<data[l].subjects.length;k++)
                      {
                        if(subject_list[j]==data[l].subjects[k])
                        {
                          temp = k;
                          break;
                        }
                      }
                      if(data[l].marks.length>0)
                      {
                        var tot_marks=0;
                        for(var m=0;m<data[l].marks.length;m++)
                        {
                          if(parseInt(data[l].marks[m].score[temp]))
                          tot_marks += parseInt(data[l].marks[m].score[temp]);
                        }
                        var avg_marks = tot_marks/data[l].marks.length;
                        avg_marks = avg_marks*100/data[l].total_marks[temp];
                        chartdata[l+1][j+1] = avg_marks;
                      }
                    }
                  }
                  mainData.push(chartdata);
                  /////
                  
                  /////
                }
              }
            // }).error(function(err){
            //   alert("Check your Internet connection");
            // });
          }
                  google.charts.load('current', {'packages':['corechart']});
                  google.charts.setOnLoadCallback(drawChart);

                  function drawChart() {
                    for(var i=0;i<info.scope.length;i++)
                    {
                      var data = google.visualization.arrayToDataTable(mainData[i]);
                      var options = {
                        title: info.scope[i].class+'-'+info.scope[i].section+' average performance',
                        curveType: 'function',
                        legend: { position: 'bottom' }
                      };
                      var chart = new google.visualization.LineChart(document.getElementById(info.scope[i].class+'-'+info.scope[i].section));
                      chart.draw(data, options);
                    }
                  }
        }
        // google.charts.load('current', {'packages':['corechart']});
        //       google.charts.setOnLoadCallback(drawChart);

        //       function drawChart() {
        //         var data = google.visualization.arrayToDataTable([
        //           ['Year', 'Sales', 'Expenses'],
        //           ['2004',  1000,      400],
        //           ['2005',  1170,      460],
        //           ['2006',  660,       1120],
        //           ['2007',  1030,      540]
        //         ]);

        //         var options = {
        //           title: 'Company Performance',
        //           curveType: 'function',
        //           legend: { position: 'bottom' }
        //         };

        //         var chart = new google.visualization.LineChart(document.getElementById('curve_chart'));

        //         chart.draw(data, options);
        //       }


    }

    function MarksContentController($http, $scope, $stateParams, Auth, $compile, $state){
      var exam_id = $stateParams.exam;
      $scope.exam_class = $stateParams.class;
      $scope.exam_section = $stateParams.section;
      $http({
                  url: 'http://localhost:3000/api/marks/view',
                  method: "POST",
                  data: $.param({token: Auth.getToken(), id:exam_id}),
                  headers: {'Content-Type': 'application/x-www-form-urlencoded'}
      }).success(function(data){


        $http({
          url: 'http://localhost:3000/api/user/selfinfo',
          method: "POST",
          data: $.param({token: Auth.getToken()}),
          headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        }).success(function(data10){
          if(data10.success)
          {
            if(data.data)
              displayTable(data, data10.info);
          }
          else
            alert("Check your internet connection");
        }).error(function(err){
          console.log(err);
        });
      }).error(function (err) {
        console.log(err);
        alert("Check your internet connection");
      });    
      function displayTable(data, info){
        console.log("data:")
        console.log(data);
        console.log(info);
        var c = data.data.class;
        var s = data.data.section;
        var subs = [];
        for(var i=0;i<info.scope.length;i++)
        {
          if(c == info.scope[i].class && s == info.scope[i].section)
          {
            subs = info.scope[i].subjects;
          }
        }
        function contains(a, obj) {
            for (var i = 0; i < a.length; i++) {
                if (a[i] === obj) {
                    return true;
                }
            }
            return false;
        }
        console.log(subs);
        $scope.exam_name = data.data.name;
        // $scope.exam_date = data.data.date.split('T')[0];
        var length1 = data.data.subjects.length;
        var a = '<thead><tr><th>Name</th><th>Roll Number</th>';
        for(var i=0;i<length1;i++)
        {
          if(contains(subs,data.data.subjects[i]))
          {
            a += '<th>'+data.data.subjects[i]+'';
            if(data.data.total_marks[i]!=null)
              a += '('+data.data.total_marks[i]+')';
            a += '</th>';
          }
        }
        a += '</tr></thead>';
        a += '<tbody>';
        var length2 = data.marks.length;
        for(var i=0;i<length2;i++)
        {
          a += '<tr><td>'+data.marks[i].name+'</td><td>'+data.marks[i].rollno+'</td>';
          for(var j=0;j<length1;j++)
          {
            if(contains(subs,data.data.subjects[j]))
            {
              a += '<td>'+data.marks[i].score[j]+'</td>';
            } 
          }
          a += '</tr>';
        }
        a += '</tbody>';
        $('#table4').html(a);
        $compile(document.getElementById('table4'))($scope)
      }             
      var newButton = "<md-button ng-click='editMarks()' class='md-primary'>Update Marks</md-button><md-button ng-click='editExam()' class='md-primary'>Edit Exam Information</md-button>";
        $http({
          url: 'http://localhost:3000/api/haspermission',
          method: "POST",
          data: $.param({token: Auth.getToken(), permission:'edit_marks'}),
          headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        }).success(function(data){
          if(data.success)
          {
            $('#editmarksbutton').html(newButton);
            $compile(document.getElementById('editmarksbutton'))($scope)
          }
        }).error(function(err){
          console.log(err);
        });
        $scope.editMarks = function()
        {
          console.log('coming here;');
          $state.go('triangular.admin-default.marks.edit',{item:exam_id})
        } 
        $scope.editExam = function()
        {
          console.log('coming here;');
          $state.go('triangular.admin-default.marks.editinfo',{item:exam_id})
        } 
    }
    function MarksCreateController($scope, $http, $stateParams, Auth, $compile, $state)
    {
      $scope.marks_classSection = $stateParams.item;
      $scope.marks_name = "";
      var user_class = $stateParams.item.split('-')[0];
      var user_section = $stateParams.item.split('-')[1];
      var user_list;
      var userids = "";
      var subject_list;
      $http({
        url: 'http://localhost:3000/api/users/specific',
        method: "POST",
        data: $.param({token: Auth.getToken(), class:user_class, section: user_section, role: 'Student'}),
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
      }).success(function(data){
        user_list = data.users;
        $http({
          url: 'http://localhost:3000/api/attendance/subject/list',
          method: "POST",
          data: $.param({token: Auth.getToken(), class:user_class, section: user_section}),
          headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        }).success(function(data){
          subject_list = data.data;
          createMarks(subject_list, user_list);
        }).error(function(err){
          console.log(err);
        });
      }).error(function(err){
        console.log(err);
      });

      function createMarks(subjects, users)
      {
        $scope.subjects = subjects;
        $scope.total_marks = [];
        $scope.dates = [];
        var a = "";
        for(var i=0;i<subjects.length;i++)
        {
          a += '<h4>'+subjects[i]+'</h4><md-input-container class="md-block">\
                      <label>Total marks for '+subjects[i]+'</label>\
                      <input type="number" ng-model="total_marks['+i+']">\
                  </md-input-container>\
                  <md-datepicker ng-model="dates['+i+']" md-placeholder="Date of '+subjects[i]+'"></md-datepicker>'
        }
        $('#div3').html(a);
        $compile(document.getElementById('div3'))($scope)
        $scope.student_marks = new Array(user_list.length);
        for(var j=0;j<user_list.length;j++)
        {
          $scope.student_marks[j] = new Array(subject_list.length);
        }
        var b = "<thead><tr><th>Name</th><th>Roll Number</th>";
        for(var j=0;j<subjects.length;j++)
        {
          b += "<th>"+subjects[j]+"</th>"
        }
        b += "</tr></thead><tbody>";
        for(var k=0;k<users.length;k++)
        {
          b += "<tr><td>"+users[k].name+"</td><td>"+users[k].rollno+"</td>"
          for(var l=0;l<subjects.length;l++)
          {
            b += "<td><input type='text'style='width:50px;' ng-model='student_marks["+k+"]["+l+"]'></td>"
          }
          b += "</tr>"
        }
        b += "</thead>"
        // $('#table6').html(b);
        // $compile(document.getElementById('table6'))($scope)
        for(i=0;i<users.length;i++)
        {
          userids += users[i]._id+";"
        }
        userids = userids.substring(0, userids.length - 1);
      } 
      $scope.cancelCreate = function()
      {
        // var cncl = confirm("Are you sure you want to cancel??");
        $state.go('triangular.admin-default.marks');
      }
      $scope.createMarks = function()
      {
        var c = "";
        for(var i=0;i<user_list.length;i++)
        {
          for(var j=0;j<subject_list.length;j++)
          {
            if($scope.student_marks[i][j]==undefined || $scope.student_marks[i][j]==null || $scope.student_marks[i][j]=="")
              c += ",";
            else
              c += $scope.student_marks[i][j]+",";
          }
          c = c.substring(0, c.length - 1);
          c += ";"
        }
        c = c.substring(0, c.length - 1);
        console.log(c)
        console.log(userids)
        $http({
          url: 'http://localhost:3000/api/marks/create',
          method: "POST",
          data: $.param({token: Auth.getToken(), class:user_class, section: user_section, name: $scope.marks_name, subjects: $scope.subjects.join(';'), total_marks: $scope.total_marks.join(';'), dates: $scope.dates.join(';'),userlist: userids, markslist:c }),
          headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        }).success(function(data){
          if(data.success)
          {
            alert(data.message);
            $state.go('triangular.admin-default.marks');
          }
        }).error(function(err){
          alert(err);
        });
      }
    }

    function MarksEditController($scope, $stateParams, $state, $compile, $http, Auth)
    {
      var marks_id = $stateParams.item;
      var userids = "";
      $http({
        url: 'http://localhost:3000/api/marks/view',
        method: "POST",
        data: $.param({token: Auth.getToken(), id:marks_id}),
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
      }).success(function(data){
        $http({
          url: 'http://localhost:3000/api/user/selfinfo',
          method: "POST",
          data: $.param({token: Auth.getToken()}),
          headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        }).success(function(data10){
          if(data10.success)
          {
            if(data.data)
              editTable(data, data10.info);
          }
          else
            alert("Check your internet connection");
        }).error(function(err){
          console.log(err);
        });
      }).error(function (err) {
        console.log(err);
      });    
      function editTable(data1, info){
        var c = data1.data.class;
        var s = data1.data.section;
        var subs = [];
        for(var i=0;i<info.scope.length;i++)
        {
          if(c == info.scope[i].class && s == info.scope[i].section)
          {
            subs = info.scope[i].subjects;
          }
        }
        function contains(a, obj) {
            for (var i = 0; i < a.length; i++) {
                if (a[i] === obj) {
                    return true;
                }
            }
            return false;
        }
        var data = data1.data;
        console.log(data);
        $scope.marks = data1.marks;
        $scope.name = data.name;
        $scope.class = data.class;
        $scope.section = data.section;
        $scope.dates = [];
        for (var i = 0;i<data.dates.length; i++) {
          $scope.dates[i] = new Date(data.dates[i]);
        }
        for(var i=0;i<$scope.marks.length;i++)
        {
          userids += $scope.marks[i].user+";"
        }
        userids = userids.substring(0, userids.length - 1);
        $scope.total_marks = data.total_marks;
        $scope.subjects = data.subjects;
        $scope.student_marks = new Array($scope.marks.length);
        for(var j=0;j<$scope.marks.length;j++)
        {
          $scope.student_marks[j] = new Array($scope.subjects.length);
        }
        for(var i=0;i<$scope.marks.length;i++)
        {
          for(var j=0;j<$scope.marks[i].score.length;j++)
          {
            $scope.student_marks[i][j] = $scope.marks[i].score[j];
          }
        }
        var a = "";
        for(var i=0;i<$scope.subjects.length;i++)
        {
          a += '<h4>'+$scope.subjects[i]+'</h4><md-input-container class="md-block">\
                      <label>Total marks for '+$scope.subjects[i]+'</label>\
                      <input type="text" ng-model="total_marks['+i+']">\
                  </md-input-container>\
                  <md-datepicker ng-model="dates['+i+']" md-placeholder="Date of '+$scope.subjects[i]+'"></md-datepicker>'
        }
        // $('#div7').html(a);
        // $compile(document.getElementById('div7'))($scope)
        var b = "<thead><tr><th>Name</th><th>Roll Number</th>";
        for(var j=0;j<$scope.subjects.length;j++)
        {
          if(contains(subs, $scope.subjects[j]))
          {
            b += "<th>"+$scope.subjects[j]+"</th>"
          }
        }
        b += "</tr></thead><tbody>";
        for(var k=0;k<$scope.marks.length;k++)
        {
          b += "<tr><td>"+$scope.marks[k].name+"</td><td>"+$scope.marks[k].rollno+"</td>"
          for(var l=0;l<$scope.subjects.length;l++)
          {
            if(contains(subs, $scope.subjects[l])){
              b += "<td><input type='text'style='width:50px;' ng-model='student_marks["+k+"]["+l+"]'></td>"
            }
          }
          b += "</tr>"
        }
        b += "</thead>"
        $('#table7').html(b);
        $compile(document.getElementById('table7'))($scope)
        
      }
      $scope.editMarks = function()
      {
        var c = "";
        for(var i=0;i<$scope.marks.length;i++)
        {
          for(var j=0;j<$scope.subjects.length;j++)
          {
            if($scope.student_marks[i][j]==undefined || $scope.student_marks[i][j]==null || $scope.student_marks[i][j]=="")
              c += "-"+",";
            else
              c += $scope.student_marks[i][j]+",";
          }
          c = c.substring(0, c.length - 1);
          c += ";"
        }
        c = c.substring(0, c.length - 1);
        $http({
          url: 'http://localhost:3000/api/marks/edit',
          method: "POST",
          data: $.param({token: Auth.getToken(), class:$scope.class, section: $scope.section,marksid: marks_id,name: $scope.name, subjects: $scope.subjects.join(';'), total_marks: $scope.total_marks.join(';'), dates: $scope.dates.join(';'),userlist: userids, markslist:c }),
          headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        }).success(function(data){
          if(data.success)
          {
            alert(data.message);
            $state.go('triangular.admin-default.marks');
          }
        }).error(function(err){
          alert(err);
        });
      }
      $scope.cancelEdit = function()
      {
        $state.go('triangular.admin-default.marks');
      }
    }

    function MarksEditInfoController($scope, $stateParams, $state, $compile, $http, Auth)
    {
      var marks_id = $stateParams.item;
      var userids = "";
      $http({
        url: 'http://localhost:3000/api/marks/view',
        method: "POST",
        data: $.param({token: Auth.getToken(), id:marks_id}),
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
      }).success(function(data){
        if(data.data)
          editTable(data);
      }).error(function (err) {
        console.log(err);
      });    
      function editTable(data1){
        var data = data1.data;
        console.log(data);
        $scope.marks = data1.marks;
        $scope.name = data.name;
        $scope.class = data.class;
        $scope.section = data.section;
        $scope.dates = [];
        for (var i = 0;i<data.dates.length; i++) {
          $scope.dates[i] = new Date(data.dates[i]);
        }
        for(var i=0;i<$scope.marks.length;i++)
        {
          userids += $scope.marks[i].user+";"
        }
        userids = userids.substring(0, userids.length - 1);
        $scope.total_marks = data.total_marks;
        $scope.subjects = data.subjects;
        $scope.student_marks = new Array($scope.marks.length);
        for(var j=0;j<$scope.marks.length;j++)
        {
          $scope.student_marks[j] = new Array($scope.subjects.length);
        }
        for(var i=0;i<$scope.marks.length;i++)
        {
          for(var j=0;j<$scope.marks[i].score.length;j++)
          {
            $scope.student_marks[i][j] = $scope.marks[i].score[j];
          }
        }
        var a = "";
        for(var i=0;i<$scope.subjects.length;i++)
        {
          a += '<h4>'+$scope.subjects[i]+'</h4><md-input-container class="md-block">\
                      <label>Total marks for '+$scope.subjects[i]+'</label>\
                      <input type="text" ng-model="total_marks['+i+']">\
                  </md-input-container>\
                  <md-datepicker ng-model="dates['+i+']" md-placeholder="Date of '+$scope.subjects[i]+'"></md-datepicker>'
        }
        $('#div20').html(a);
        $compile(document.getElementById('div20'))($scope)
        var b = "<thead><tr><th>Name</th><th>Roll Number</th>";
        for(var j=0;j<$scope.subjects.length;j++)
        {
          b += "<th>"+$scope.subjects[j]+"</th>"
        }
        b += "</tr></thead><tbody>";
        for(var k=0;k<$scope.marks.length;k++)
        {
          b += "<tr><td>"+$scope.marks[k].name+"</td><td>"+$scope.marks[k].rollno+"</td>"
          for(var l=0;l<$scope.subjects.length;l++)
          {
            b += "<td><input type='text'style='width:50px;' ng-model='student_marks["+k+"]["+l+"]'></td>"
          }
          b += "</tr>"
        }
        b += "</thead>"
        // $('#table20').html(b);
        // $compile(document.getElementById('table20'))($scope)
        
      }
      $scope.editMarks = function()
      {
        var c = "";
        for(var i=0;i<$scope.marks.length;i++)
        {
          for(var j=0;j<$scope.subjects.length;j++)
          {
            if($scope.student_marks[i][j]==undefined || $scope.student_marks[i][j]==null || $scope.student_marks[i][j]=="")
              c += "-"+",";
            else
              c += $scope.student_marks[i][j]+",";
          }
          c = c.substring(0, c.length - 1);
          c += ";"
        }
        c = c.substring(0, c.length - 1);
        $http({
          url: 'http://localhost:3000/api/marks/edit',
          method: "POST",
          data: $.param({token: Auth.getToken(), class:$scope.class, section: $scope.section,marksid: marks_id,name: $scope.name, subjects: $scope.subjects.join(';'), total_marks: $scope.total_marks.join(';'), dates: $scope.dates.join(';'),userlist: userids, markslist:c }),
          headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        }).success(function(data){
          if(data.success)
          {
            alert(data.message);
            $state.go('triangular.admin-default.marks');
          }
        }).error(function(err){
          alert(err);
        });
      }
      $scope.cancelEdit = function()
      {
        $state.go('triangular.admin-default.marks');
      }
    }
})();
