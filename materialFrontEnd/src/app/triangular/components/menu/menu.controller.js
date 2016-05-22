(function() {
    'use strict';

    angular
        .module('triangular.components')
        .controller('MenuController', MenuController);

    /* @ngInject */
    function MenuController($http, Auth, triSettings, triLayout, triMenu, MenuLoadService) {
        var vm = this;
        var schoolname =  "";
        vm.layout = triLayout.layout;
        $http({
            url: 'http://localhost:3000/api/school/info',
            method: "POST",
            data: $.param({token:Auth.getToken()}),
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        }).success(function(data){
            if(data.success)
            {
                if(data.data)
                {
                    vm.sidebarInfo = {
                        appName: data.data.name,
                        appLogo: triSettings.logo
                    };  
                }
                else
                {
                    vm.sidebarInfo = {
                        appName: "The Project",
                        appLogo: triSettings.logo
                    };
                }
                // if(data.data)
                // {
                //     vm.sidebarInfo.appName = data.data.name;
                // }
                // else
                //     vm.sidebarInfo.appName = "The Project"
            }
        }).error(function(err){
            alert("Check Your Internet Connection");
        });
        
        vm.toggleIconMenu = toggleIconMenu;

        ////////////
        function toggleIconMenu() {
            var menu = vm.layout.sideMenuSize === 'icon' ? 'full' : 'icon';
            triLayout.setOption('sideMenuSize', menu);
        };
        function sendRequest () {
            $http({
            url: 'http://localhost:3000/api/aside/',
            method: "POST",
            data: $.param({token: Auth.getToken()}),
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).success(successCallback).error(errorCallback);
        };
        function successCallback (data, status, headers, config) {
            // alert(JSON.stringify(data));
            var sideNavObj = {};
            data.data.forEach(function (innerData) {
                triMenu.addMenu({type: "divider"});
                innerData.data.forEach(function (innerInnerData) {
                    var tempObj = {};
                    tempObj['state'] = innerInnerData.state;
                    tempObj['name'] = innerInnerData.name;
                    tempObj['icon'] = innerInnerData.material_icon_name;
                    if (innerInnerData.type == 'button') {
                        tempObj['type'] = 'link';
                        // alert(JSON.stringify(innerInnerData));
                    }
                    else if (innerInnerData.type == 'dropdown') {
                        
                    }
                    triMenu.addMenu(tempObj);
                    // alert(JSON.stringify(tempObj));
                });
            });
        /*obj =    {
            name: 'MENU.MENU.MENU',
            icon: 'zmdi zmdi-receipt',
            type: 'dropdown',
            priority: 6.1,
            children: [{
                name: 'MENU.MENU.DYNAMIC',
                type: 'link',
                state: 'triangular.admin-default.menu-dynamic'
            }]
        }*/
        };

        function errorCallback (data, status, headers, config) {
            console.log(JSON.stringify(data) + "    error " + Auth.getToken());
        };
        if(!MenuLoadService.getMenuLoaded()){
                MenuLoadService.setMenuLoaded(true);
                sendRequest();
            }
    }
})();
