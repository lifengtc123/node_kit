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
            $state.server="http://node.vv-box.com";
            $state.serverpcb="80node.vv-box.com";

            $state.username=localStorage.getItem("username");
            $state.openid=localStorage.getItem("openid");
            $state.userid=localStorage.getItem("userid");
            $state.language=localStorage.getItem("language");
            if(localStorage.getItem("user")!=null&&localStorage.getItem("user")!="null"&&localStorage.getItem("user")!="undefined"){
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
            // device APIs are available
            //上次访问的提醒的时间

            //上次访问消息的时间
            $state.ViewTime=localStorage.getItem("ViewTime");
            var strs= new Array();
            function getQueryString(name) {
            	var r=	window.location.href.split(name)[1];
            	if(r!=null){
            		 r = r.split("&")[0];
            		 return r.substr(1);
            	}else{
            		return null;
            	}
            }
            $state.phoneuuid=getQueryString("phoneuuid");
           
            if($state.phoneuuid==null){
            	$state.phoneuuid=localStorage.getItem("phoneuuid");
            }else{
            	localStorage.setItem("phoneuuid",$state.phoneuuid);
            	if($state.user.phoneuuid!=$state.phoneuuid){
            		$state.user=null;
	                $state.userjson=null;
	                $state.messageTime=null;
            	}
            }
          //  $state.phoneuuid="C0A0E156-4613-422D-957C-83A76E3C612B";
            $state.density=4;
            $state.height=540;

            $.post('/weixin/wxconfig',function(data){
                wx.config({
                    debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
                    appId: 'wx31aeec0018c6c8ef', // 必填，公众号的唯一标识
                    timestamp:data.timestamp , // 必填，生成签名的时间戳
                    nonceStr: data.nonceStr, // 必填，生成签名的随机串
                    signature: data.signature,// 必填，签名，见附录1
                    jsApiList: ['scanQRCode'] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
                });
            })


            wx.ready(function(){
            })
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
                        new_left = '-3.6125em';
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
                /**
                *登陆-wx(ok)
                */
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
                /**
                *注册-wx(ok)
                */
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
                /**
                *忘记密码wx(ok)
                */
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
                /**
                *盒子列表页面wx(ok)
                */
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
                 /**
                *消息列表页面wx(ok)
                */
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
                 /**
                *提醒外框wx(ok)
                */
                .state("alert", {     //提醒外框
                    url: "/alert",
                    views: {
                        // 无名 view
                        '': {
                            templateUrl: 'template/ctrl/boxsetting.html',
                            controller: "AlertCtrl"
                        }

                    }

                })
                 /**
                *用药提醒列表wx(ok)
                */
                .state("alert.yy", {    //用药提醒列表

                    url: "/alert/yy",
                    views:{
                        '':{
                            templateUrl: 'template/ctrl/YYsetting.html'
                        }
                    }

                })

                /** 
                *添加用药提醒wx(ok)
                */
                .state("alertedit",{  //添加用药提醒
                    url: "/alertedit/:boxNumber",
                    views:{
                        '':{
                            templateUrl: 'template/ctrl/boxsetting3.html',
                            controller:"AlertAddYYCtrl"
                        },
                        'menu@':{
                            template:' '
                        },
                        'header@':{
                            templateUrl: 'template/ctrl/CtrlHeader.html'
                        }
                    }

                })
                /** 
                *查看用药提醒wx(ok)
                */
                .state("yydetail",{       //查看提醒
                    url: "/yydetail/:id",
                    views:{
                        '':{
                            templateUrl: 'template/ctrl/YYCtrlDetail.html',
                            controller:"CtrlDetail"
                        },
                        'menu@':{
                            template:' '
                        },
                        'header@':{
                            templateUrl: 'template/ctrl/YYCtrlHeader.html'
                        }
                    }

                })
                 /** 
                *编辑用药提醒wx(ok)
                */
                .state("edityydetail",{       //编辑提醒
                    url: "/edityydetail/:id",
                    views:{
                        '':{
                            templateUrl: 'template/ctrl/UpdateYYCtrl.html',
                            controller:"EditDetail"
                        },
                        'menu@':{
                            template:' '
                        },
                        'header@':{
                            templateUrl: 'template/ctrl/yyHeader.html'
                        }
                    }

                })
                /** 
                *生活提醒列表wx(ok)
                */
                .state("alert.sh", {    //生活提醒列表
                    url: "/alert/sh",
                    templateUrl: 'template/ctrl/SHsetting.html'

                })
                /** 
                *添加生活提醒wx(ok)
                */
                .state("alertshedit",{ 
                    url: "/alertshedit/:boxNumber",
                    views:{
                        '':{
                            templateUrl: 'template/ctrl/boxsetting4.html',
                            controller:"AlertAddSHCtrl"
                        },
                        'menu@':{
                            template:' '
                        },
                        'header@':{
                            templateUrl: 'template/ctrl/shHeader.html'
                        }
                    }

                })
                /** 
                *查看生活提醒wx(ok)
                */
                .state("shdetail",{       //查看提醒
                    url: "/shdetail/:id",
                    views:{
                        '':{
                            templateUrl: 'template/ctrl/SHCtrlDetail.html',
                            controller:"CtrlDetail"
                        },
                        'menu@':{
                            template:' '
                        },
                        'header@':{
                            templateUrl: 'template/ctrl/ShCtrlHeader.html'
                        }
                    }

                })
                /** 
                *编辑生活提醒wx(ok)
                */
                .state("editshdetail",{       //编辑提醒
                    url: "/editshdetail/:id",
                    views:{
                        '':{
                            templateUrl: 'template/ctrl/UpdateSHCtrl.html',
                            controller:"EditDetail"
                        },
                        'menu@':{
                            template:' '
                        },
                        'header@':{
                            templateUrl: 'template/ctrl/shHeader.html'
                        }
                    }

                })

               /**
                *添加盒子wx(ok)
                */
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
                /**
                *设置wifi1-wx(ok)
                */
                .state('wifi1', {
                    url: '/wifi1/:boximage',
                    views: {
                        // 无名 view
                        '': {
                            templateUrl: 'template/wifi/wifi1.html',
                            controller: "WIFI1Ctrl"
                        },
                        'menu@':{
                            template:' '
                        },
                        'header@':{
                            templateUrl: 'template/wifi/wifiHeader.html'
                        }
                    }
                })
                /**
                *设置wifi4-wx(ok)
                */
                .state('wifi4', {
                    url: '/wifi4',
                    views: {
                        '': {
                            templateUrl: 'template/wifi/wifi4.html',
                            controller: "WIFI4Ctrl"
                        },
                        'menu@':{
                            template:' '
                        },
                        'header@':{
                            templateUrl: 'template/wifi/wifiHeader.html'
                        }
                    }
                })
                /**
                *设置wifi5-wx(ok)
                */
                .state('wifi5', {
                    url: '/wifi5',
                    views: {
                        '': {
                            templateUrl: 'template/wifi/wifi5.html',
                            controller:"WIFI5Ctrl"
                        },
                        'menu@':{
                            template:' '
                        },
                        'header@':{
                            templateUrl: 'template/wifi/wifiHeader.html'
                        }
                    }
                })
                /**
                *查看盒子wx(ok)
                */
                .state('Info', {   //盒子详情页
                    url: '/Info/:number',
                    views: {
                        '': {
                            templateUrl: 'template/info/boxInfo.html',
                            controller: "WatchInfo"
                        },
                        'menu@': {
                            template: ' '
                        },
                        'header@': {
                            templateUrl: 'template/info/InfoHeader.html'
                        }
                    }
                })
                /**
                *修改盒子详细wx(ok)
                */
                .state('editbox', {       //修改盒子详细信息
                    url: '/editbox/:number',
                    views: {
                        '': {
                            templateUrl: 'template/info/editInfo.html',
                            controller: 'EditInfo'
                        },
                        'menu@': {
                            template: ' '
                        },
                        'header@': {
                            templateUrl: 'template/info/SaveInfoHeader.html'
                        }
                    }

                })
                /**
                *更多wx(ok)
                */
                .state("setting", {
                    url: "/setting",
                    views: {
                        // 无名 view
                        '': {
                            templateUrl: 'template/more/setting.html',
                            controller: "SetCtrl"
                        },
                        'header@': {
                            templateUrl: 'template/more/moreHeader.html'
                        }
                    }
                })
                /**
                *商城wx(ok)
                */
                 .state('boxMall', {  //商城
                    url: '/boxMall',
                    views: {
                        '': {
                            templateUrl: 'template/more/boxMall.html',
                            controller: 'BoxMallCtrl'
                        },
                        'menu@': {
                            template: ' '
                        },
                        'header@': {
                            templateUrl: 'template/more/setHeader.html'
                        }
                    }
                })
                /**
                *系统设置wx(ok)
                */
                .state('system', {   //用户详情页
                    url: '/system',
                    views: {
                        '': {
                            templateUrl: 'template/more/system.html',
                            controller: 'SystemCtrl'
                        },

                        'menu@': {
                            template: ' '
                        },
                        'header@': {
                            templateUrl: 'template/more/userHeader.html'
                        }
                    }
                })
                /**
                *关于我们wx(ok)
                */
                .state('aboutus', {   //关于我们
                    url: '/aboutus',
                    views: {
                        '': {
                            templateUrl: 'template/more/aboutus.html',
                            controller: 'AboutUsCtrl'
                        },

                        'menu@': {
                            template: ' '
                        },
                        'header@': {
                            templateUrl: 'template/more/setHeader.html'
                        }
                    }
                })
                /**
                *反馈页面wx(ok)
                */
               .state('feedback', {   //反馈
                    url: '/feedback',
                    views: {
                        '': {
                            templateUrl: 'template/more/feedback.html',
                            controller: 'FeedbackCtrl'
                        },
                        'menu@': {
                            template: ' '
                        },
                        'header@': {
                            templateUrl: 'template/more/setHeader.html'
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





