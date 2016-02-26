// Make sure to include the `ui.router` module as a dependency]

var open=false;
var shopen=false;
angular.module('uiRouterBox', [
    'ui.router',
    'boxControllers',
    'ngTouch',
    'ngAnimate',
    'pascalprecht.translate',
    'ui.bootstrap',
])

    .run(
    [ '$rootScope', '$state', '$stateParams','$http','socket',
        function ($rootScope,   $state,   $stateParams, $http,socket) {
            // It's very handy to add references to $state and $stateParams to the $rootScope
            // so that you can access them from any scope within your applications.For example,
            // <li ng-class="{ active: $state.includes('contacts.list') }"> will set the <li>
            // to active whenever 'contacts.list' or one of its decendents is active.
            $rootScope.$state = $state;
            $rootScope.$stateParams = $stateParams;
            $state.server="http://192.168.1.50:8081";
            $state.serverpcb="8081192.168.1.50";

            $state.username=localStorage.getItem("username");
            $state.openid=localStorage.getItem("openid");
            $state.userid=localStorage.getItem("userid");
            $state.language=localStorage.getItem("language");

            if(localStorage.getItem("user")!=null&&localStorage.getItem("user")!="undefined"){
                $state.user=JSON.parse(localStorage.getItem("user"));
                $state.userjson=JSON.parse(localStorage.getItem("user"));
                $state.messageTime=localStorage.getItem($state.user._id);
            }else{
                $state.user="";
                $state.userjson="";
                $state.messageTime=new Date();
            }

            //判断语言版本
            if($state.language=="undefined"){
                $state.language="";
            }
            $state.homeboxs=[];

            $state.addlist="false";
            $state.facelist="false";
            /*
             *遮罩层状态，
             * $state.infolist||$state.openInfos true显示
             */
            $state.infolist="false";
            $state.openInfos="false";
            //最近访问的一个盒子id
            $state.lastboxid="";
            $state.boximage="images/box_01.png";
            $state.bimage="images/initialization.png";
            $state.opentype="true";
            $state.fristLoading="true";
            document.addEventListener("deviceready", onDeviceReady, false);
            // device APIs are available
            //上次访问的提醒的时间

            //上次访问消息的时间
            $state.ViewTime=localStorage.getItem("ViewTime");
            var strs= new Array();
            function getQueryString(name) {
                var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
                var r = window.location.search.substr(1).match(reg);
                if (r != null) return unescape(r[2]); return null;
            }
            $state.phoneuuid=getQueryString("uuid");
            $state.phoneuuid="C0A0E156-4613-422D-957C-83A76E3C612B";
            $state.density=getQueryString("density");
            $state.height=getQueryString("screenHeight");
            function onDeviceReady() {
                $state.phoneuuid=device.uuid;   //设备的uuid
                alert($state.server);
            }
            socket.emit("newdevice",{boxNumbers:"",name:$state.phoneuuid});

            $state.showone=false;
            $state.showwifi1=false;
        }
    ]
)

    .directive('swiperSlide', ['$timeout', function ($timeout) {
        return {
            restrict: 'A',
            link: function (scope, element, attr) {
                if (scope.$last === true) {
                    $timeout(function () {
                        var info=attr.swiperSlide+"";
                        scope.$emit('swiperDirective',info);
                    });
                }
            }
        }
    }])



    //.directive('mobiscroll', ['$timeout', function ($timeout) {
    //    return {
    //        restrict: 'A',
    //        link: function (scope, element, attr) {
    //            var opt = {};
    //            opt.date = {preset: 'date'};
    //            opt.time = {preset: 'time'};
    //            opt.default = {
    //                theme: 'android-ics light', //皮肤样式
    //                display: 'bottom', //显示方式
    //                mode: 'scroller', //日期选择模式
    //                lang: 'zh',
    //                showNow: true
    //            };
    //            var optTime = $.extend(opt['time'], opt['default']);
    //            for(var i=0;i<scope.data.times.length;i++){
    //                var val = scope.data.times[i].id;
    //                $("#" + val).mobiscroll(optTime).time(optTime);
    //            }
    //        }
    //    }
    //}])

    .directive('swipeOver', function($timeout) {
        return {
            restrict: "AE",
            scope: true,
            link: function(scope, element, attrs) {
                var x;
                element.bind("touchstart",function(e){
                    e.stopPropagation();
                    $('.swipe-delete div.open').css('left', '0px').removeClass('open');
                    $('#'+attrs.swipeOver).css('left', '0px').removeClass('open');
                    $('#'+attrs.swipeOver).addClass('open');
                    $(e.currentTarget).addClass('open');
                    x = e.originalEvent.targetTouches[0].pageX;
                })
                element.bind("touchmove", function(e) {
                    var change = e.originalEvent.targetTouches[0].pageX-x;
                    change = Math.min(Math.max(-200, change), 0);
                    e.currentTarget.style.left = change + 'px';
                    $('#'+attrs.swipeOver).css('left',change+'px');
                    if (change < -10)e.preventDefault();
                    shopen=true;
                    scope.$state.left = parseInt(e.currentTarget.style.left);
                    scope.$state.startleft=0;
                });
                element.bind('touchend', function(e) {
                    e.stopPropagation();
                    scope.$state.left2 = parseInt(e.currentTarget.style.left);
                    var new_left;
                    if (scope.$state.left2 < -35) {
                        new_left = '-6.625em';
                    } else if(scope.$state.left2<0){
                        new_left = '0';
                    }else{
                        new_left = '0';
                    }
                    $('#'+attrs.swipeOver).animate({left: new_left}, 200);
                    $(e.currentTarget).animate({left: new_left}, 200,function(){
                        if(new_left=='0'){
                            var  openmediv=$("#openmediv").val();;
                            if(shopen==true||openmediv=='1'){
                                shopen=false;
                            }else{
                                $timeout(function () {
                                    var info=attrs.swipeOver+"";
                                    scope.$emit('mousemove',info);
                                });
                            }
                        }
                    })
                });
            }
        }
    })


    .directive('swipeOver2', function($timeout) {
        return {
            restrict: "AE",
            scope: true,
            link: function(scope, element, attrs) {
                var x;
                element.bind("touchstart",function(e){
                    e.stopPropagation();
                    $('.swipe-delete div.open').css('left', '0px').removeClass('open');
                    $('#'+attrs.swipeOver2).css('left', '0px').removeClass('open');
                    $('#'+attrs.swipeOver2).addClass('open');
                    $(e.currentTarget).addClass('open');
                    x = e.originalEvent.targetTouches[0].pageX;
                })
                element.bind("touchmove", function(e) {
                    var change = e.originalEvent.targetTouches[0].pageX-x;
                    change = Math.min(Math.max(-200, change), 0);
                    e.currentTarget.style.left = change + 'px';
                    $('#'+attrs.swipeOver2).css('left',change+'px');
                    if (change < -10){
                        e.preventDefault();
                    }
                    open=true;
                    scope.$state.left = parseInt(e.currentTarget.style.left);
                    scope.$state.startleft=0;
                });
                element.bind('touchend', function(e) {
                    e.stopPropagation();
                    scope.$state.left2 = parseInt(e.currentTarget.style.left);
                    var new_left;
                    if (scope.$state.left2 < -35) {
                        new_left = '-3.3125em';
                    } else if(scope.$state.left2<=0){
                        new_left = '0';
                    }else{
                        new_left = '0';
                    }
                    $('#'+attrs.swipeOver2).animate({left: new_left}, 200);
                    $(e.currentTarget).animate({left: new_left}, 200, function () {
                        if(new_left=='0'){
                            var  showCapture=$("#showCapture").val();;
                            if(open==true||showCapture=='1'){
                                open=false;
                            }else{
                                $timeout(function () {
                                    var info=attrs.swipeOver2+"";
                                    scope.$emit('showinfo',info);
                                });
                            }
                        }
                    })
                })
            }
        }
    })

    .directive('exampleDirective', ['$timeout', function ($timeout) {
        return {
            restrict: 'E',
            template: '<ul><li ng-repeat="event in $state.events" example-directive2>' +
            '<div class="info_time" id="{{event._id}}"><span style="width:auto">{{event.dateTime}}</span></div>'+
            '<div class="info_box" ng-show="event.type==0">' +
            '<div class="iconfont icon news">&#xe61b;</div>'+
            '<div class="tit"><strong>{{"noEatTitle"|translate}}</strong><strong style="margin-left:2.6em">' +
            '{{"formTitle"|translate}}</strong><a href="">{{event.boxName}}</a></div>'+
            '<div class="tit"><span>{{event.content}}</span></div>' +
            '</div>' +
            '<div class="info_box" ng-show="event.type==1">' +
            '<div class="iconfont icon talk">&#xe61d;</div>'+
            '<div class="tit"><strong>{{"Recording"|translate}}</strong><strong style="margin-left:2.6em">' +
            '{{"formTitle"|translate}}</strong><a href="">{{event.boxName}}</a></div>'+
            '<div class="tit"><div class="voice" ng-click="openfile($event,event.boxNumber,event.filepath,event.time,$index)"><i></i><img id="name_{{$index}}" src="{{$state[\'image_\'+$index]}}"/>' +
            '</div><div class="time">{{event.time}}'+''+'</div>' +
            '</div>' +
            '<div class="info_box" ng-show="event.type==2">' +
            '<div class="iconfont icon news">&#xe61c;</div>'+
            '<div class="tit"><strong>{{"noEatTitle"|translate}}</strong><strong style="margin-left:2.6em">' +
            '{{"formTitle"|translate}}</strong><a href="">{{event.boxName}}</a></div>'+
            '<div class="tit"><span>{{event.content}}</span></div>' +
            '<div class="pic" ng-show="event.image"><a href="#"><img src="{{event.image}}"/></a></div></div></div>'+
            '</div>'+
            '<div class="info_box" ng-show="event.type==3">' +
            '<div class="iconfont icon talk">&#xe61b;</div>'+
            '<div class="tit"><strong>{{"Recording"|translate}}</strong></div>'+
            '<div class="tit"><span>{{event.content}}</span></div>' +
            '</div>' +
            '</li></ul>'
        }
    }])

    .directive('exampleDirective2', ['$timeout', function ($timeout) {
        return {
            restrict: 'A',
            link: function (scope, element, attr) {
                if (scope.$last === true) {
                    $timeout(function(){
                        scope.$emit('exampleDirective');
                    },100);
                }
            }
        }
    }])


    .config(
    ['$stateProvider', '$urlRouterProvider',
        function ($stateProvider, $urlRouterProvider) {


            $urlRouterProvider
                .when('/user/:id', '/contacts/:id')
                .otherwise('/home');


            //////////////////////////
            // State Configurations //
            //////////////////////////


            // Use $stateProvider to configure your states.
            $stateProvider
                //////////
                // Home //
                //////////
                .state("login",{
                    url: "/login",
                    views: {
                        // 无名 view
                        '': {
                            templateUrl: 'template/login.html',
                            controller: "LoginCtrl"
                        },
                        'menu@':{
                            template:' '
                        },
                        'header@':{
                            templateUrl: 'template/loginHeader.html'
                        }
                    }
                })
                .state("reg",{
                    url: "/reg",
                    views: {
                        // 无名 view
                        '': {
                            templateUrl: 'template/reg.html',
                            controller: "RegCtrl"
                        },
                        'menu@':{
                            template:' '
                        },
                        'header@':{
                            templateUrl: 'template/loginHeader.html'
                        }
                    }

                })
                .state("forget",{
                    url: "/forget",
                    views: {
                        // 无名 view
                        '': {
                            templateUrl: 'template/forget.html',
                            controller: "ForgetCtrl"
                        },
                        'menu@':{
                            template:' '
                        },
                        'header@':{
                            templateUrl: 'template/loginHeader.html'
                        }
                    }

                })
                .state("home", {
                    url: "/home",
                    views: {
                        // 无名 view
                        '': {
                            templateUrl: 'template/boxInfo1.html',
                            controller: "HomeCtrl"
                        }
                    }

                })
                .state("message", {
                    url: "/message",
                    views: {
                        // 无名 view
                        '': {
                            templateUrl: 'template/message.html',
                            controller: "MesCtrl"
                        }
                    }
                })
                .state("alert", {     //提醒外框
                    url: "/alert",
                    views: {
                        // 无名 view
                        '': {
                            templateUrl: 'template/boxsetting.html',
                            controller: "AlertCtrl"
                        }

                    }

                })
                .state("alert.yy", {    //用药提醒列表

                    url: "/alert/yy",
                    views:{
                        '':{
                            templateUrl: 'template/YYsetting.html'
                        }
                    }

                })

                .state("alertedit",{       //提醒列表
                    url: "/alertedit/:boxNumber",
                    views:{
                        '':{
                            templateUrl: 'template/boxsetting3.html',
                            controller:"AlertAddYYCtrl"
                        },
                        'menu@':{
                            template:' '
                        },
                        'header@':{
                            templateUrl: 'template/addHeader2.html'
                        }
                    }

                })

                .state("yydetail",{       //查看提醒
                    url: "/yydetail/:id",
                    views:{
                        '':{
                            templateUrl: 'template/YYCtrlDetail.html',
                            controller:"CtrlDetail"
                        },
                        'menu@':{
                            template:' '
                        },
                        'header@':{
                            templateUrl: 'template/CtrlHeader.html'
                        }
                    }

                })

                .state("edityydetail",{       //编辑提醒
                    url: "/edityydetail/:id",
                    views:{
                        '':{
                            templateUrl: 'template/UpdateYYCtrl.html',
                            controller:"EditDetail"
                        },
                        'menu@':{
                            template:' '
                        },
                        'header@':{
                            templateUrl: 'template/addHeader2.html'
                        }
                    }

                })

                .state("alert.sh", {    //生活提醒列表
                    url: "/alert/sh",
                    templateUrl: 'template/SHsetting.html'

                })
                .state("alertshedit",{       //生活提醒列表
                    url: "/alertshedit/:boxNumber",
                    views:{
                        '':{
                            templateUrl: 'template/boxsetting4.html',
                            controller:"AlertAddSHCtrl"
                        },
                        'menu@':{
                            template:' '
                        },
                        'header@':{
                            templateUrl: 'template/addHeader2.html'
                        }
                    }

                })
                .state("shdetail",{       //查看提醒
                    url: "/shdetail/:id",
                    views:{
                        '':{
                            templateUrl: 'template/SHCtrlDetail.html',
                            controller:"CtrlDetail"
                        },
                        'menu@':{
                            template:' '
                        },
                        'header@':{
                            templateUrl: 'template/ShCtrlHeader.html'
                        }
                    }

                })

                .state("editshdetail",{       //编辑提醒
                    url: "/editshdetail/:id",
                    views:{
                        '':{
                            templateUrl: 'template/UpdateSHCtrl.html',
                            controller:"EditDetail"
                        },
                        'menu@':{
                            template:' '
                        },
                        'header@':{
                            templateUrl: 'template/addHeader2.html'
                        }
                    }

                })

                .state("setting", {
                    url: "/setting",
                    views: {
                        // 无名 view
                        '': {
                            templateUrl: 'template/setting.html',
                            controller:"SetCtrl"
                        },
                        'header@':{
                            templateUrl: 'template/addHeader.html'
                        }
                    }
                })

                .state('addbox', {
                    url: '/addbox',
                    views: {
                        // 无名 view
                        '': {
                            templateUrl: 'template/boxes-0.html',
                            controller: "BoxCheck"
                        }
                    }
                })
                .state('wifi1', {
                    url: '/wifi1/:boximage',
                    views: {
                        // 无名 view
                        '': {
                            templateUrl: 'template/wifi1.html',
                            controller: ['$scope', '$state','$http', '$stateParams','$translate',
                                function ($scope,$state,$http, $stateParams,$translate) {
                                    $state.showone=false;
                                    $scope.image=$state.bimage;
                                    //$scope.img="images/boxcheck.png";
                                    if($state.user){
                                        if($state.user.boxtime==0){
                                            $state.showwifi1=true;
                                            //$state.openInfos=true;
                                        }
                                        $scope.yq={}
                                        $scope.yq.tit="";
                                        $scope.linktit=function(){
                                            if($scope.yq.tit!=null&&$scope.yq.tit.length==12){
                                                var Invitation=$scope.yq.tit.toLowerCase();
                                                $http.post($state.server+"/appapi/boxes/getOneAndBind",{userid:$state.user._id,number:Invitation}).success(function(udata) {
                                                    if(udata.type==0){
                                                        $scope.error=$translate.instant('Successful');
                                                        setTimeout(function () {
                                                            $state.go("home");
                                                        }, 500)
                                                    }else if(udata.type==1){
                                                        $scope.error=$translate.instant('havelink');
                                                    }else  if(udata.type==2){
                                                        $scope.error=$translate.instant('Invitationwrong');
                                                    }
                                                })
                                            }else{
                                                $scope.error=$translate.instant('Invitationwrong');
                                            }
                                        }
                                    }else{
                                        $state.go("login");
                                    }
                                    //
                                    //if(cacheEngine!=null){
                                    //    $scope.image=$stateParams.image;
                                    //}else{
                                    //    $scope.image="images/initialization.png";
                                    //}
                                }
                            ]
                        },
                        'menu@':{
                            template:''
                        },
                        'header@':{
                            templateUrl: 'template/addHeader.html'
                        }
                    }
                })
                .state('wifi2', {
                    url: '/wifi2',
                    views: {
                        // 无名 view
                        '': {
                            templateUrl: 'template/wifi2.html',
                            controller:"WIFI2Ctrl"
                        },
                        'menu@':{
                            template:' '
                        },
                        'header@':{
                            templateUrl: 'template/addHeader.html'
                        }
                    }
                })
                .state('wifi3', {
                    url: '/wifi3',
                    views: {
                        // 无名 view
                        '': {
                            templateUrl: 'template/wifi3.html',
                            controller:"WIFI3Ctrl"
                        },
                        'menu@':{
                            template:' '
                        },
                        'header@':{
                            templateUrl: 'template/addHeader.html'
                        }
                    }
                })
                .state('wifi4', {
                    url: '/wifi4',
                    views: {
                        '': {
                            templateUrl: 'template/wifi4.html',
                            controller: ['$scope', '$state', '$stateParams',
                                function ($scope,$state, $stateParams) {
                                    if($state.user){
                                        if($state.user.boxtime==0){
                                            $state.showwifi4=true;
                                            //$state.openInfos=true;
                                        }
                                    }else{
                                        $state.go("login");
                                    }
                                    //
                                    //if(cacheEngine!=null){
                                    //    $scope.image=$stateParams.image;
                                    //}else{
                                    //    $scope.image="images/initialization.png";
                                    //}
                                }
                            ]
                        },
                        'menu@':{
                            template:' '
                        },
                        'header@':{
                            templateUrl: 'template/addHeader.html'
                        }
                    }
                })
                .state('wifi5', {
                    url: '/wifi5',
                    views: {
                        '': {
                            templateUrl: 'template/wifi5.html',
                            controller:"WIFI5Ctrl"
                        },
                        'menu@':{
                            template:' '
                        },
                        'header@':{
                            templateUrl: 'template/addHeader.html'
                        }
                    }
                })
                .state('Info', {   //盒子详情页
                    url: '/Info/:number',
                    views: {
                        '': {
                            templateUrl: 'template/boxInfo.html',
                            controller:"WatchInfo"
                       },
                       'menu@':{
                       template:' '
                       },
                       'header@':{
                            templateUrl: 'template/addHeader3.html'
                        }
                    }
                })
                .state('editbox',{       //提醒列表
                    url: '/editbox/:number',
                    views:{
                        '':{
                            templateUrl: 'template/editInfo.html',
                            controller:'EditInfo'
                        },
                        'header@':{
                            templateUrl: 'template/InfoHeader.html'
                        }
                    }

                })
                .state('user', {   //用户详情页
                    url: '/user',
                    views: {
                        '': {
                            templateUrl: 'template/user.html',
                            controller:'UserCtrl'
                        },
                        'header@':{
                            templateUrl: 'template/userHeader.html'
                        }
                    }
                })
                .state('boxMall', {  //商城
                    url: '/boxMall',
                    views: {
                        '': {
                            templateUrl: 'template/boxMall.html',
                            controller:'BoxMallCtrl'
                        },
                        'header@':{
                            templateUrl: 'template/addHeader3.html'
                        }
                    }
                })
                .state('system', {   //用户详情页
                    url: '/system',
                    views: {
                        '': {
                            templateUrl: 'template/system.html',
                            controller:'SystemCtrl'
                        },
                        'header@':{
                            templateUrl: 'template/userHeader.html'
                        }
                    }
                })
                .state('aboutus', {   //关于我们
                    url: '/aboutus',
                    views: {
                        '': {
                            templateUrl: 'template/aboutus.html',
                            controller:'AboutUsCtrl'
                        },
                        'header@':{
                            templateUrl: 'template/addHeader3.html'
                        }
                    }
                })
                .state('feedback', {   //反馈
                    url: '/feedback',
                    views: {
                        '': {
                            templateUrl: 'template/feedback.html',
                            controller:'FeedbackCtrl'
                        },
                        'header@':{
                            templateUrl: 'template/addHeader3.html'
                        }
                    }
                });

        }
    ]
)


    //自动获取国际化
    .config(function($translateProvider) {
        //自动获取国际化语言
        $translateProvider.registerAvailableLanguageKeys(['en','zh'], {
            'en_US': 'en',
            'en_UK': 'en',
            'zh_CN': 'zh'
        });
        $translateProvider.determinePreferredLanguage();
        $translateProvider.useStaticFilesLoader({
            prefix: 'js/languages/local-',
            suffix: '.json'
        });
        $translateProvider.fallbackLanguage('zh');

    });





