/**
 * Created by lifeng on 15/4/17.
 */
/* Controllers */
var boxControllers = angular.module('boxControllers', [
    'ui.router',
    'ngTouch'
]);


//websocket连接
boxControllers.factory('socket', function ($rootScope) {
    var socket = io.connect("http://192.168.1.198:8080");
    return {
        on: function (eventName, callback) {
            socket.on(eventName, function () {
                var args = arguments;
                $rootScope.$apply(function () {
                    callback.apply(socket, args);
                })
            })
        },
        emit: function (eventName, data, callback) {
            socket.emit(eventName, data, function () {
                var args = arguments;
                $rootScope.$apply(function () {
                    if (callback) {
                        callback.apply(socket, args)
                    }
                })
            })
        }
    }
});

//页面最外层的方法 可指定头部 和菜单里的事件
boxControllers.controller('IndexCtrl', ['$scope', '$state', '$http', 'socket', '$translate',
    function ($scope, $state, $http, socket, $translate) {
        $state.title = $translate.instant('boxTitle');
        $state.infolist = false;
        $state.openInfos = false;
        if($state.language!=""&&$state.language!=null) {
            $translate.use($state.language);
        }else{
           $state.language=$translate.preferredLanguage();
           localStorage.setItem("language",$state.language);
           $translate.use($state.language);
        }

        if(!$state.messageTime) {
            $state.messageTime = new Date();
        }
        if (!$state.ViewTime) {
            $state.ViewTime = new Date();
        }
        $scope.math = Math;

        //添加盒子
        $scope.addBox = function () {
            event.stopPropagation();
            $state.go('addbox');
            $state.addlist = false;
            $state.facelist = false;
            //$(".header_add_list").hide();
        };
        //关闭遮罩层
        $scope.closeDetail = function () {
            $state.infolist = false;
            $scope.useincod = false;
            $state.openInfos = false;
        };
        //扫一扫触发
        $scope.showAddMenu = function () {
            event.stopPropagation();//阻止事件向上冒泡
            if ($state.addlist == true) {
                $state.addlist = false;
            } else {
                $state.addlist = true;
            }
            $state.facelist = false;
            //$(".header_add_list").show();
        };
        //扫描二维码
        $scope.openScan = function () {
            cordova.plugins.barcodeScanner.scan(function (result) {
                if (result.text != null && result.text.length == 12) {
                    $http.post($state.server + "/appapi/boxes/getOneAndBind", {
                        userid: $state.user._id,
                        number: result.text
                    }).success(function (udata) {
                        if (udata.type == 0) {
                            if($state.current.name=="home"){
                                $http.post($state.server + "/appapi/boxes/getOne", {boxid: result.text}).success(function (data) {
                                    //获取年月日
                                    var slidenum = "0";
                                    var date = new Date();
                                    var month = date.getMonth() + 1 + "";
                                    var day = date.getDate() + "";
                                    if (month.length < 2)month = "0" + month;
                                    if (day.length < 2)day = "0" + day;
                                    var date2 = date.getFullYear() + "-" + month + "-" + day;
                                    var upboxs=[];
                                    $http.post($state.server + "/appapi/messages/getMessageByBoxNumber", {
                                        'boxNumbers': data.number,
                                        'warntime': date2
                                    }).success(function (mesb) {
                                        var boxm =data;
                                        var online=boxm.online;
                                        if(online==0){
                                            if(boxm.lastUpdate==null||boxm.lastUpdate==""){
                                                online=1;
                                                boxm.online=1;
                                                upboxs.push(boxm);
                                            }else{
                                                var newDate=new Date();
                                                var lastDate=new Date(boxm.lastUpdate);
                                                if((newDate.getTime()-lastDate.getTime())>10*60*1000){
                                                    online=1;
                                                    boxm.online=1;
                                                    upboxs.push(boxm);
                                                }
                                            }
                                        }
                                        localStorage.setItem(boxm.number,JSON.stringify(boxm));
                                        var messagelist = [];
                                        for (var j = 0; j < mesb.length; j++) {
                                            if (boxm.number == mesb[j].boxNumber) {
                                                for (var s = 0; s < mesb[j].messageTime.length; s++) {
                                                    var obj = mesb[j];
                                                    var time = mesb[j].messageTime[s];
                                                    var isEat = "0";
                                                    var message = {
                                                        _id: obj._id,
                                                        boxNumber: obj.boxNumber,
                                                        type: obj.type,
                                                        style: obj.style,
                                                        color: obj.color,
                                                        time: time,
                                                        isEat: isEat
                                                    };
                                                    messagelist.push(message);

                                                }
                                            }
                                        }
                                        function getSortFun(order, sortBy) {
                                            var ordAlpah = (order == 'asc') ? '>' : '<';
                                            var sortFun = new Function('a', 'b', 'return a.' + sortBy + ordAlpah + 'b.' + sortBy + '?1:-1');
                                            return sortFun;
                                        }
                                        var messagesort = messagelist.sort(getSortFun('asc', 'time'));
                                        for(var s=0;s<messagesort.length;s++){
                                            if(new Date()>new Date(date2 + " " + messagesort[s].time)) {

                                                find(messagesort[s]);

                                            }
                                        }
                                        function find(ms){
                                            $http.post($state.server + "/appapi/medications/getMessageIdAndTime", {
                                                'messageid':ms._id,
                                                'time':ms.time
                                            }).success(function (medications) {
                                                if (medications != "null") {
                                                    ms.isEat = medications.isEat;
                                                }
                                            })
                                        }
                                        var sum = messagesort.length;
                                        var messagebox = [];
                                        //线的长度
                                        var linesize = "0";
                                        var lastTime = "";
                                        var firstTime = "";
                                        var nowTime = new Date();
                                        var linewidth = "0";
                                        if (sum > 0) {
                                            var sumwidth = 100 / (sum - 1);
                                            if (sum == 1) {
                                                linesize = "0";
                                                linewidth = "0";
                                            } else {
                                                ////每一个之间宽度
                                                //var size=100/(sum-1);
                                                //lastTime是指最后一个时间段的毫秒数， //firstTime是指第一个时间的毫秒数
                                                lastTime = new Date(date2 + " " + messagesort[sum - 1].time);
                                                firstTime = new Date(date2 + " " + messagesort[0].time);
                                                linesize = (sum - 1) * 20;
                                                if (nowTime >= lastTime) {
                                                    linewidth = 100;
                                                    slidenum = sum - 1;
                                                } else {
                                                    for (var st = 0; st < sum; st++) {
                                                        var ctime = new Date(date2 + " " + messagesort[st].time);
                                                        if (nowTime > ctime) {
                                                            linewidth = (st * 20 * (100 / linesize)) < 100 ? (st * 20 * (100 / linesize)) : 100;
                                                            slidenum = st;
                                                        }
                                                    }
                                                }
                                            }
                                            messagebox = {
                                                name: boxm.name,
                                                number: boxm.number,
                                                image: boxm.image,
                                                _id: boxm._id,
                                                percent: boxm.percent,
                                                message: messagesort,
                                                linewidth: linewidth,
                                                linesize: linesize,
                                                slidenum: slidenum,
                                                sumwidth: sumwidth,
                                                online: online,
                                                temp:boxm.temp,
                                                hwxNo:boxm.hwxNo
                                            };
                                        } else {
                                            messagebox = {
                                                name: boxm.name,
                                                number: boxm.number,
                                                image: boxm.image,
                                                _id: boxm._id,
                                                percent: boxm.percent,
                                                message: messagesort,
                                                online:online,
                                                temp:boxm.temp,
                                                hwxNo:boxm.hwxNo
                                            };
                                        }
                                        $scope.open = 1;
                                        $state.homeboxs.unshift(messagebox);
                                        localStorage.setItem('homeboxs', JSON.stringify($state.homeboxs));
                                        if(upboxs.length>0){
                                            $http.post($state.server + "/appapi/boxes/updatebox",{upboxs:upboxs}).success(function (box) {

                                            });
                                        }
                                        alert($translate.instant('Successful'));


                                    })

                                })
                            }else{
                                alert($translate.instant('Successful'));
                                $state.go("home");
                            }


                        } else if (udata.type == 1) {
                            alert($translate.instant('havelink'));
                        } else if (udata.type == 2) {
                            alert($translate.instant('Invitationwrong'));
                        }
                    })
                } else {
                    alert($translate.instant('Invitationwrong'));
                }
            }, function (error) {

            });
        };
        //个人中心
        $scope.showFaceMenu = function () {
            event.stopPropagation();//阻止事件向上冒泡
            if ($state.facelist == true) {
                $state.facelist = false;
            } else {
                $state.facelist = true;
            }
            $state.addlist = false;
            //$(".header_face_list").show();
        };
        //关闭个人中心和扫一扫出现的样式
        $scope.closelist = function () {
            event.stopPropagation();//阻止事件向上冒泡
            $state.facelist = false;
            $state.addlist = false;
            $state.infolist = false;
            $scope.useincod = false
        };
        //WiFi1 使用邀请码 触发页面
        $scope.useincode = function () {
            $scope.useincod = true;
            $state.infolist = true;
        };

        //头部更新控制方法
        var CtrlName;
        $scope.$on('CtrlName', function (e, d) {
            CtrlName = d;
        });
        $scope.updateUser = function (userid) {
            if (CtrlName == "user") {
                $scope.$broadcast('userUpdate', userid);
            } else if (CtrlName == "system") {
                $scope.$broadcast('systemUpdate', userid);
            }

        }
        $scope.saveinfo = function () {
            if ($state.boxid) {
                if ($state.boxname == "") {
                    alert($translate.instant("namenone"));
                } else {
                    var box = {
                        _id: $state.boxid,
                        name: $state.boxname
                    }
                    $http.post($state.server + "/appapi/boxes/saveInfo", box).success(function (data) {
                        if (data.type == 1) {
                            $state.go('Info', {number: $state.number});
                        } else {
                            alert($translate.instant("namenone"));
                        }
                    })
                }
            } else {
                $state.go('Info', {number: $state.number});
            }

        }


    }]);
//登录页面
boxControllers.controller('LoginCtrl', ['$scope', '$state', '$http', 'socket', '$translate',
    function ($scope, $state, $http, socket, $translate) {
        if($state.language!=""&&$state.language!=null) {
            $translate.use($state.language);
            $state.title = $translate.instant('loginTitle');
        }
        //定义用户名和密码
        $scope.data = {};
        $scope.data.username = "";
        $scope.data.password = "";
        var telReg;
        var emailReg;
        var filter = /[\w!#$%&'*+/=?^_`{|}~-]+(?:\.[\w!#$%&'*+/=?^_`{|}~-]+)*@(?:[\w](?:[\w-]*[\w])?\.)+[\w](?:[\w-]*[\w])?/;
        //验证用户名是否为手机号或者邮箱
        $scope.$watch('data.username', function () {
            if ($scope.data.username == "" && $scope.data.username.length <= 0) {
                $scope.errorPhone = "";
            } else {
                telReg = !!$scope.data.username.match(/^(0|86|17951)?(13[0-9]|15[0-9]|17[678]|18[0-9]|14[57])[0-9]{8}$/);
                emailReg = filter.test($scope.data.username);
                if (telReg == false && emailReg == false) {
                    $scope.errorLogin = "";
                    $scope.errorPhone = $translate.instant('errorPhone');
                } else {
                    $scope.errorLogin = "";
                    $scope.errorPhone = "";
                }
            }
        });
        $scope.$watch('data.password', function () {
            if ($scope.data.username != "" && telReg != false && $scope.data.password == "") {
                $scope.errorPassword = $translate.instant('errorpwd');
            } else {
                $scope.errorPassword = "";
            }
        });

        $scope.userlogin = function () {
            if ($scope.data.username == "") {
                $scope.errorLogin = "";
                $scope.errorPhone = $translate.instant('nonePhone');
            } else {
                telReg = !!$scope.data.username.match(/^(0|86|17951)?(13[0-9]|15[0-9]|17[678]|18[0-9]|14[57])[0-9]{8}$/);
                emailReg = filter.test($scope.data.username);
                if (telReg == false && emailReg == false) {
                    $scope.errorLogin = "";
                    $scope.errorPhone = $translate.instant('errorPhone');
                } else {
                    if ($scope.data.password == "") {
                        $scope.errorPassword = $translate.instant('nonepwd');
                    } else {
                        $state.loading = true;
                        $http.post($state.server + "/appapi/nobilitys/checkNobility", {
                            'username': $scope.data.username,
                            'password': $scope.data.password
                        }).success(function (data) {
                            if (data == "null") {
                                $state.loading = false;
                                $scope.errorLogin = $translate.instant('worryphone');
                                $scope.data.password = "";
                            } else {
                                $state.loading = false;
                                //$state.username=data.username;
                                //$state.userid=data._id;
                                $state.user = data;
                                //localStorage.setItem('username', data.username);
                                localStorage.setItem('user', JSON.stringify(data));
                                //localStorage.setItem('userid', data._id);
                                socket.emit('userlogin', data._id);
                                $state.go('home');
                            }
                        })
                    }
                }
            }
        };
        $state.title = $translate.instant('loginTitle');
        //微信登录
        $scope.wxlogin = function () {
            navigator.plugin_wxlogin.plugin_wxlogin({code: ""}, function (data) {
                $scope.data = {};
                $scope.data.phoneuuid = $state.phoneuuid;
                $scope.data.username = "";
                $scope.data.weixin = data.nickname;
                $scope.data.openid = data.openid;
                $scope.data.name = data.nickname;
                $scope.data.area = data.country + " " + data.city;
                $scope.data.language = data.language;
                $scope.data.sex = data.sex;
                $scope.data.image = data.headimgurl;
                $scope.data.unionid = data.unionid;
                $http.post($state.server + "/appapi/nobilitys/FindOpenid", $scope.data).success(function (data) {
                    //用户表示存在用户，并且更新成功,
                    if (data != null && data != "") {
                        $state.openid = data.openid;
                        $state.user = data;
                        //$state.userid = data._id;
                        //localStorage.setItem('user',data);
                        localStorage.setItem('openid', data.openid);
                        //localStorage.setItem('userid', data._id);
                        localStorage.setItem('user', JSON.stringify(data));
                        $state.userjson = data;
                        socket.emit('userlogin', data._id);
                        $state.go('home');
                    } else {
                        $state.go('login');
                    }

                }).error(function (err) {
                    $state.go('login');
                })

            })
        }
    }]);

//忘记密码页面
boxControllers.controller('ForgetCtrl', ['$scope', '$state', '$http', '$stateParams', 'socket', '$translate',
    function ($scope, $state, $http, $stateParams, socket, $translate) {
        $scope.data = {};
        $scope.data.username = $stateParams.username ? $stateParams.username : "";
        $scope.data.password = "";
        var telReg;
        var emailReg;
        var filter = /[\w!#$%&'*+/=?^_`{|}~-]+(?:\.[\w!#$%&'*+/=?^_`{|}~-]+)*@(?:[\w](?:[\w-]*[\w])?\.)+[\w](?:[\w-]*[\w])?/;
        $scope.$watch('data.username', function () {
                if ($scope.data.username == "" && $scope.data.username.length <= 0) {
                    $scope.errorPhone = "";
                } else {
                    telReg = !!$scope.data.username.match(/^(0|86|17951)?(13[0-9]|15[0-9]|17[678]|18[0-9]|14[57])[0-9]{8}$/);
                    emailReg = filter.test($scope.data.username);
                    if (telReg == false && emailReg == false) {
                        $scope.errorLogin = "";
                        $scope.errorPhone = $translate.instant('errorPhone');
                    } else {
                        $scope.errorLogin = "";
                        $scope.errorPhone = "";
                    }
                }
            }
        );
        $scope.$watch('data.password', function () {
                if ($scope.data.username != "" && telReg != false && $scope.data.password == "") {
                    $scope.errorPassword = $translate.instant('errorpwd');
                } else {
                    $scope.errorPassword = "";
                }
            }
        );

        $scope.userforget = function () {
            if ($scope.data.username == "") {
                $scope.errorPhone = $translate.instant('nonePhone');
            } else {
                telReg = !!$scope.data.username.match(/^(0|86|17951)?(13[0-9]|15[0-9]|17[678]|18[0-9]|14[57])[0-9]{8}$/);
                emailReg = filter.test($scope.data.username);
                if (telReg == false && emailReg == false) {
                    $scope.errorPhone = $translate.instant('errorPhone');
                } else {
                    if ($scope.data.password == "") {
                        $scope.errorPassword = $translate.instant('nonepwd');
                    } else {
                        $http.post($state.server + "/appapi/nobilitys/checkNobility", {
                            'username': $scope.data.username,
                            'password': $scope.data.password
                        }).success(function (data) {
                            if (data == "null") {
                                $scope.errorLogin = $translate.instant('noneAccount');
                                $scope.data.username = "";
                                $scope.data.password = "";
                            } else {
                                $http.post($state.server + "/appapi/nobilitys/updateNobility", {
                                    'username': $scope.data.username,
                                    'password': $scope.data.password
                                }).success(function (updata) {
                                    if (updata == null) {
                                        $state.go("login");
                                    }
                                })
                            }
                        })
                    }
                }
            }

        };
        $state.title = "忘记密码";
    }]);

//注册页面
boxControllers.controller('RegCtrl', ['$scope', '$state', '$http', 'socket', '$translate',
    function ($scope, $state, $http, socket, $translate) {
        $scope.data = {};
        $scope.data.username = "";
        $scope.data.password = "";
        $scope.data.resetpwd = "";
        $scope.check = true;
        if ($state.language!=""&&$state.language!=null) {
            $translate.use($state.language);
        }
        var telReg;
        var emailReg;
        var filter = /[\w!#$%&'*+/=?^_`{|}~-]+(?:\.[\w!#$%&'*+/=?^_`{|}~-]+)*@(?:[\w](?:[\w-]*[\w])?\.)+[\w](?:[\w-]*[\w])?/;
        $scope.$watch('data.username', function () {
            if ($scope.data.username == "" && $scope.data.username.length <= 0) {
                $scope.errorPhone = "";
            } else {
                telReg = !!$scope.data.username.match(/^(0|86|17951)?(13[0-9]|15[0-9]|17[678]|18[0-9]|14[57])[0-9]{8}$/);
                emailReg = filter.test($scope.data.username);
                //console.log(emailReg);
                if (telReg == false && emailReg == false) {
                    $scope.errorLogin = "";
                    $scope.errorPhone = $translate.instant('errorPhone');
                } else {
                    $scope.errorLogin = "";
                    $scope.errorPhone = "";
                }
            }
        });
        //监听注册页面是否选择checkbox
        $scope.$watch('check', function () {
                if ($scope.check == true) {
                    $scope.checked = "checked";
                    $scope.regsub = "regsub";
                    $scope.regdis = false;
                } else {
                    $scope.checked = "";
                    $scope.regsub = "disabled";
                    $scope.regdis = true;
                }
            }
        );
        //监听注册页面密码是否为空
        $scope.$watch('data.password', function () {
            if ($scope.data.username != "" && telReg != false && $scope.data.password == "") {
                $scope.errorPassword = $translate.instant('errorpwd');
            } else {
                $scope.errorPassword = "";
            }
        });
        //监听注册页面确认密码是否为空
        $scope.$watch('data.resetpwd', function () {
            if ($scope.data.password != "" && $scope.data.resetpwd != $scope.data.password) {
                $scope.errorresetPwd = $translate.instant('twicepwd');
            } else {
                $scope.errorresetPwd = "";
            }
        });
        //点击注册按钮方法
        $scope.regUser = function () {
            //console.log($scope.data.username);
            if ($scope.data.username == "") {
                $scope.errorPhone = $translate.instant('nonePhone');
            } else {
                telReg = !!$scope.data.username.match(/^(0|86|17951)?(13[0-9]|15[0-9]|17[678]|18[0-9]|14[57])[0-9]{8}$/);
                emailReg = filter.test($scope.data.username);
                if (telReg == false && emailReg == false) {
                    $scope.errorPhone = $translate.instant('errorPhone');
                } else {
                    if ($scope.data.password == "") {
                        $scope.errorPassword = $translate.instant('nonepwd');
                    } else {
                        var obj = {
                            username: $scope.data.username,
                            openid: $state.openid
                        };
                        $http.post($state.server + "/appapi/nobilitys/getUsername", obj).success(function (data) {
                            if (data == "null") {
                                //调用保存方法
                                saveMes($scope.data.username, $scope.data.password);
                            } else {
                                $scope.errorLogin = $translate.instant('registered');
                            }
                        })
                    }
                }
            }
        };
        //保存用户名和密码的方法
        function saveMes(username, password) {
            $http.post($state.server + "/appapi/nobilitys/saveMes", {
                'username': $scope.data.username,
                'password': $scope.data.password
            }).success(function (nodata) {
                if (nodata) {
                    $state.user = nodata;
                    localStorage.setItem('user', JSON.stringify(nodata));
                    localStorage.setItem('username', nodata.username);
                    $state.username = nodata.username;
                    //$state.userid = data._id;
                    socket.emit('userlogin', nodata._id);
                    localStorage.setItem('username', nodata.username);
                    //localStorage.setItem('userid', nodata._id);
                    $state.go('home');
                }
            })
        }

        $state.title = $translate.instant('registerTitle');
    }]);

//Home页面
boxControllers.controller('HomeCtrl', ['$scope', '$state', '$http', '$translate', 'socket',
    function ($scope, $state, $http, $translate, socket) {
        $translate.use($state.language);
        $state.openInfos = false;
        $scope.type = true;
        $state.loading = false;
        //设置翻译
        $state.title = $translate.instant('boxTitle');
        //判断是否有用户
        if (!$state.user){
            //当没有用户userid的时候,通过手机id查询
            var phoneobj = {
                phoneuuid: $state.phoneuuid,
                language: $state.language
            }
            /*
             *判断手机id是否为空
             * 非空,查询数据
             * 空,登陆页面
             */
            if($state.phoneuuid!=""&&$state.phoneuuid!=null){
                $http.post($state.server + "/appapi/nobilitys/getPhoneuuid", phoneobj).success(function (data) {
                    if ($state.language != data.language) {
                        $state.language = data.language;
                        $translate.use($state.language);
                        localStorage.setItem("language", data.language);
                    }
                    $state.user = data;
                    $state.userjson = data;
                    localStorage.setItem('user', JSON.stringify(data));
                    homeindex();
                })
            }else {
                $state.go("login");
            }
        } else {
            homeindex();
        }
        /*
         *首页面
         */
        function homeindex() {
            $state.infolist = false;
            $state.openInfos = false;
            //显示各个提醒的样式
            var slidenum = "0";
            $scope.$on('swiperDirective', function (e, number) {
                var swiper = $(".homeswiper_"+number).swiper({
                    scrollbar: '.swiper-scrollbar_'+number,
                    scrollbarHide: true,
                    slidesPerView: 5,
                    shortSwipes: false,
                    initialSlide: slidenum,
                    calculateHeight: true,
                    cssWidthAndHeight: true
                });
            });

            var messageboxs = [];
            var obj = {
                userid: $state.user._id
            };
            if(localStorage.getItem("homeboxs")!=null&&localStorage.getItem("homeboxs")!="undefined"){
                $state.homeboxs=JSON.parse(localStorage.getItem("homeboxs"));
            }
            //根据用户的账号,查询用户的盒子列表
            $http.post($state.server + "/appapi/boxes/getlist", obj).success(function (data) {
                var boxnumbers = [];
                if (data != "null" && data.length > 0) {
                    //遍历获取所有的盒子number
                    var boxs = data;
                    for (var i = 0; i < data.length; i++) {
                        boxnumbers.push(data[i].number);
                    }
                    //获取年月日
                    var date = new Date();
                    var month = date.getMonth() + 1 + "";
                    var day = date.getDate() + "";
                    if (month.length < 2)month = "0" + month;
                    if (day.length < 2)day = "0" + day;
                    var date2 = date.getFullYear() + "-" + month + "-" + day;
                    //console.log(date2);
                    function a(x, y) {
                        var datex = new Date(date2 + " " + x.time);
                        var datey = new Date(date2 + " " + y.time);
                        return datex - datey;
                    }

                    obj.boxIds = boxnumbers;
                    obj.ViewTime = $state.ViewTime;//消息访问时间

                    $http.post($state.server + "/appapi/messages/getCount", {
                        lastboxid: data.lastboxid,
                        alertTime: $state.messageTime
                    }).success(function (mdata) {
                        $state.count = mdata;
                    });
                    //event消息获取count
                    $http.post($state.server + "/appapi/events/getCountByUser", obj).success(function (mdata) {
                        $state.hotcount = mdata;
                    });

                    var upboxs=[];
                    //根据盒子的列表和当前时间查询对应的提醒
                    $http.post($state.server + "/appapi/messages/getMessages", {
                        'boxNumbers': boxnumbers,
                        'warntime': date2
                    }).success(function (mesb) {
                        for (var m = 0; m < boxs.length; m++) {
                            var boxm = boxs[m];
                            var online=boxm.online;
                            if(online==0){
                                if(boxm.lastUpdate==null||boxm.lastUpdate==""){
                                    online=1;
                                    boxm.online=1;
                                    upboxs.push(boxm);
                                }else{
                                    var newDate=new Date();
                                    var lastDate=new Date(boxm.lastUpdate);
                                    if((newDate.getTime()-lastDate.getTime())>10*60*1000){
                                        online=1;
                                        boxm.online=1;
                                        upboxs.push(boxm);
                                    }
                                }
                            }
                            localStorage.setItem(boxs[m].number,JSON.stringify(boxs[m]));
                            var messagelist = [];
                            for (var j = 0; j < mesb.length; j++) {
                                if (boxm.number == mesb[j].boxNumber) {
                                    for (var s = 0; s < mesb[j].messageTime.length; s++) {
                                        var obj = mesb[j];
                                        var time = mesb[j].messageTime[s];
                                        var isEat = "0";
                                        var message = {
                                            _id: obj._id,
                                            boxNumber: obj.boxNumber,
                                            type: obj.type,
                                            style: obj.style,
                                            color: obj.color,
                                            time: time,
                                            isEat: isEat
                                        };
                                        messagelist.push(message);

                                    }
                                }
                            }
                            function getSortFun(order, sortBy) {
                                var ordAlpah = (order == 'asc') ? '>' : '<';
                                var sortFun = new Function('a', 'b', 'return a.' + sortBy + ordAlpah + 'b.' + sortBy + '?1:-1');
                                return sortFun;
                            }
                            var messagesort = messagelist.sort(getSortFun('asc', 'time'));
                            for(var s=0;s<messagesort.length;s++){
                                if(new Date()>new Date(date2 + " " + messagesort[s].time)) {
                                    find(messagesort[s]);
                                }
                            }
                            function find(ms){
                                $http.post($state.server + "/appapi/medications/getMessageIdAndTime", {
                                    'messageid':ms._id,
                                    'time':ms.time
                                }).success(function (medications) {
                                    if (medications != "null") {
                                        ms.isEat = medications.isEat;
                                    }
                                })
                            }
                            var sum = messagesort.length;
                            var messagebox = [];
                            //线的长度
                            var linesize = "0";
                            var lastTime = "";
                            var firstTime = "";
                            var nowTime = new Date();
                            var linewidth = "0";
                            if (sum > 0) {
                                var sumwidth = 100 / (sum - 1);
                                if (sum == 1) {
                                    linesize = "0";
                                    linewidth = "0";
                                } else {
                                    ////每一个之间宽度
                                    //var size=100/(sum-1);
                                    //lastTime是指最后一个时间段的毫秒数， //firstTime是指第一个时间的毫秒数
                                    lastTime = new Date(date2 + " " + messagesort[sum - 1].time);
                                    firstTime = new Date(date2 + " " + messagesort[0].time);
                                    linesize = (sum - 1) * 20;
                                    if (nowTime >= lastTime) {
                                        linewidth = 100;
                                        slidenum = sum - 1;
                                    } else {
                                        for (var st = 0; st < sum; st++) {
                                            var ctime = new Date(date2 + " " + messagesort[st].time);
                                            if (nowTime > ctime) {
                                                linewidth = (st * 20 * (100 / linesize)) < 100 ? (st * 20 * (100 / linesize)) : 100;
                                                slidenum = st;
                                            }
                                        }
                                    }
                                }

                                messagebox = {
                                    name: boxm.name,
                                    number: boxm.number,
                                    image: boxm.image,
                                    _id: boxm._id,
                                    percent: boxm.percent,
                                    message: messagesort,
                                    linewidth: linewidth,
                                    linesize: linesize,
                                    slidenum: slidenum,
                                    sumwidth: sumwidth,
                                    online: online,
                                    temp:boxm.temp,
                                    hwxNo:boxm.hwxNo
                                };
                                messageboxs.push(messagebox);
                            } else {
                                messagebox = {
                                    name: boxm.name,
                                    number: boxm.number,
                                    image: boxm.image,
                                    _id: boxm._id,
                                    percent: boxm.percent,
                                    message: messagesort,
                                    online:online,
                                    temp:boxm.temp,
                                    hwxNo:boxm.hwxNo
                                };
                                messageboxs.push(messagebox);
                            }
                        }
                        $scope.open = 1;
                        $state.homeboxs = messageboxs;

                        $http.post($state.server + "/appapi/boxes/updatebox",{upboxs:upboxs}).success(function (box) {

                        })
                        localStorage.setItem('homeboxs', JSON.stringify(messageboxs));
                    });
                } else {
                    $state.go("addbox");
                }
                socket.emit("updatedevice", {boxNumbers: boxnumbers, name: $state.phoneuuid});
            });
        }

        //删除盒子和用户的联系
        $scope.deleteBox = function (number) {
            var obj = {
                userid: $state.user._id,
                number: number
            };
            $http.post($state.server + "/appapi/nobilitys/ChangeNobilitys", obj).success(function (err) {
                for (var hm = 0; hm < $state.homeboxs.length; hm++) {
                    if ($state.homeboxs[hm].number == number) {
                        $state.homeboxs.splice(hm);
                        localStorage.setItem(number,"");
                    }
                }
            });
            socket.emit("updatedevice", {boxNumbers: $state.homeboxs, name: $state.phoneuuid});
            $scope.open = 1;
            $state.infolist = false;
        };
        //定义颜色class
        $scope.ycolor = ['yw_red', 'yw_yellow', 'yw_blue', 'yw_green', 'yw_brown', 'yw_grey'];
        //打开单个Message查看信息
        $scope.openDetail = function (id, time) {
            $state.drugTime = time;
            $http.post($state.server + "/appapi/messages/getMessageById", {id: id}).success(function (message) {
                $scope.open = 0;
                $state.type = message.type;
                $state.drugstyle = message.style;
                $state.color = message.color;
                $state.drugName = message.name;
                $state.ywNo = message.ywNo;
                $state.isf = message.isf;
                if (message.content == null || message.content == "") {
                    message.content = $translate.instant('notContent');
                }
                $state.content = message.content;
                findIsEat(id, time);

            });
            $state.infolist = true;
        };
        function findIsEat(id, time) {
            $http.post($state.server + "/appapi/medications/getMessageIdAndTime", {
                'messageid': id,
                'time': time
            }).success(function (medications) {
                if (medications != "null") {
                    $state.isEat = medications.isEat;
                } else {
                    $state.isEat = '0';
                }
            })
        }

        //点击关闭单个Message
        $scope.closeDetail = function () {
            $scope.open = 1;
            $state.infolist = false;
        };
        //查看盒子详细
        //$scope.showinfo = function ($event, number) {
        //    $event.stopPropagation();
        //    $state.go('Info', {number: number});
        //};
        $scope.$on('showinfo', function (e, number) {
            $state.go('Info', {number: number});
        });
        //发送即时录音消息
        $scope.data = {};
        $scope.showCapture = function ($event, boxNumber) {
            $("#showCapture").val(1);
            $scope.data.boxNumber = boxNumber;
            $event.stopPropagation();
            //captureAudio方法成功执行后回调函数
            function captureSuccess(mediaFiles) {
                var i, len;
                for (i = 0, len = mediaFiles.length; i < len; i += 1) {
                    //业务逻辑
                    //alert(mediaFiles[i].fullPath + " " +mediaFiles[i].name);
                    var fileURL = mediaFiles[i].fullPath;
                    var options = new FileUploadOptions();
                    options.fileKey = "file";
                    options.fileName = fileURL.substr(fileURL.lastIndexOf('/') + 1);
                    options.mimeType = "text/plain";
                    var params = {};
                    params.value1 = boxNumber;
                    params.value2 = 1;
                    options.params = params;
                    var ft = new FileTransfer();
                    var win = function (r) {
                        var data = JSON.parse(r.response);
                        $scope.data.filepath = data.path;
                        $scope.data.time = data.time;
                        $scope.data.type = 1;
                        $http.post($state.server + "/appapi/events/saveEvent", $scope.data).success(function (edata) {
                            $("#showCapture").val(0);
                            socket.emit("createmessage", {boxNumber: edata.boxNumber, content: edata});
                        });
                    };
                    var fail = function (error) {
                        $("#showCapture").val(0);
                        alert("An error has occurred: Code = " + error.code);
                        alert("upload error source " + error.source);
                        alert("upload error target " + error.target);
                    }
                    ft.upload(fileURL, encodeURI($state.server + "/audioupload"), win, fail, options);
                }
            }

            //captureAudio方法执行失败后回调函数
            function captureError(error) {
                $("#showCapture").val(0);
                //var msg = 'capture 发生错误: ' + error.code;
                //navigator.notification.alert(msg, null, 'Uh oh!');
            }

            //录制音频开始
            navigator.device.capture.captureAudio(captureSuccess, captureError, {limit: 1});
        };
    }
]);

//消息
boxControllers.controller('MesCtrl', ['$scope', '$state', '$timeout', '$http', '$translate', 'socket',
    function ($scope, $state, $timeout, $http, $translate, socket) {
        localStorage.setItem("ViewTime", new Date());
        $translate.use($state.language);
        $state.infolist = false;
        $state.addlist = false;
        $state.facelist = false;
        $state.openInfos = false;
        $state.loading = false;
        $scope.data = {};
        $("#server").val($state.server);
        var my_media;
        $state.events = [];
        var liheight = $state.height / $state.density - $(".header").height() - $(".nav").height() - 20;
        $scope.mheight = {height: liheight + "px"};
        if ($state.user) {
            if(localStorage.getItem("events")!=null&&localStorage.getItem("events")!="undefined"){
                $state.events=JSON.parse(localStorage.getItem("events"));
            }
            $state.hotcount = 0;
            var obj = {
                userid: $state.user._id
            }
            var page = 1;
            var pageSize = 5;
            var type = 0;
            var firstsize = 0;
            $http.post($state.server + "/appapi/events/getHistoryList", {
                'pageSize': pageSize,
                "page": page,
                "firstsize": firstsize,
                "userid": $state.user._id,
                "nowpage": $scope.data.nowpage
            }).success(function (data) {
                $scope.data.firstsize = data.length;
                $scope.nullR = "亲，暂无任何信息";
                addHtml(data, 0);
                $state.events = $state.newevents;
                localStorage.setItem("events",JSON.stringify($state.newevents));
            })
            //下拉条
            var dropload = $('.inner').dropload({
                domUp: {
                    domClass: 'dropload-up',
                    domRefresh: '<div class="dropload-refresh" style="padding-left: 25%;height:2em;padding-top: 5px;">↓下拉刷新</div>',
                    domUpdate: '<div class="dropload-update" style="padding-left: 25%;height: 2em;padding-top: 5px;">↑释放更新</div>',
                    domLoad: '<div class="dropload-load" style="padding-left: 25%;height: 2em;padding-top: 5px;"><span class="loading2"></span>加载中...</div>'
                },
                domDown: {
                    domClass: 'dropload-down',
                    domRefresh: '<div class="dropload-refresh" style="padding-left: 25%;height: 2em;padding-top:2em;">↑上拉加载更多</div>',
                    domUpdate: '<div class="dropload-update" style="padding-left: 25%;height:2em;padding-top: 2em;">↓释放加载</div>',
                    domLoad: '<div class="dropload-load" style="padding-left: 25%;height:2em;padding-top:2em;"><span class="loading2"></span>加载中...</div>'
                },
                loadUpFn: function (me) {
                    var keyword = $scope.data.keyword;// 关键字
                    //获取跳转的类型
                    page = 1;
                    firstsize = 0;
                    //console.log("" + keyword + "==" + type + "==" + page + "==" + pageSize);
                    $.ajax({
                        url: $state.server + "/appapi/events/getHistoryList",
                        dataType: "json",
                        data: {
                            "page": page,
                            "keyword": keyword,
                            "pageSize": pageSize,
                            "firstsize": firstsize,
                            "userid": $state.user._id
                        },
                        success: function (udata) {
                            if (my_media) {
                                my_media.stop();
                            }
                            var html = "";
                            var length = 0;
                            addHtml(udata, 0);
                            var data = $state.newevents;
                            $state.events = $state.newevents;
                            if (data != null && data != "") {
                                for (var i = 0; i < data.length; i++) {
                                    var title = "";
                                    var fromtitle = ""
                                    html = html + "<li >";
                                    html = html + '<div class="info_time" id="' + data[i]._id + '"><span style="width:auto">' + data[i].dateTime + '</span></div>';
                                    if (data[i].type == 0) {
                                        title = $translate.instant('noEatTitle');
                                        fromtitle = $translate.instant('formTitle');
                                        html = html + '<div class="info_box">';
                                        html = html + '<div class="iconfont icon news">&#xe61b;</div>';
                                        html = html + '<div class="tit"><strong>' + title + '</strong><strong style="float: right;">' + fromtitle + '<a href="#/Info/' + data[i].boxNumber + '">' + data[i].boxName + '</a></strong></div>';
                                        html = html + '<div class="tit"><span>{{event.content}}</span></div></div>';
                                    } else if (data[i].type == 1) {
                                        title = $translate.instant('Recording');
                                        fromtitle = $translate.instant('formTitle');
                                        html = html + '<div class="info_box">';
                                        html = html + '<div class="iconfont icon talk">&#xe61d;</div>';
                                        html = html + '<div class="tit"><strong>' + title + '</strong><strong style="float: right;">' + fromtitle + '<a href="#/Info/' + data[i].boxNumber + '">' + data[i].boxName + '</a></strong></div>';
                                        html = html + '<div class="tit"><div class="voice openfile" onclick=openfile2(\"' + data[i].boxNumber + '\",\"' + data[i].filepath + '\",\"' + data[i].time + '\",\"' + data[i]._id + '\")><i></i>';
                                        html = html + '<img id="name_' + data[i]._id + '" src="images/info_voice.png"/></div>';
                                        if (data[i].time != "undefined" && data[i].time != "" && data[i].time != null) {
                                            html = html + '<div class="time">' + data[i].time + '' + '</div>';
                                        }
                                        html = html + '</div>';
                                    } else if (data[i].type == 2) {
                                        title = $translate.instant('noEatTitle');
                                        fromtitle = $translate.instant('formTitle');
                                        html = html + '<div class="info_box">';
                                        html = html + '<div class="iconfont icon news">&#xe61c;</div>';
                                        html = html + '<div class="tit"><strong>' + title + '</strong><strong style="float: right;">' + fromtitle + '<a href="#/Info/' + data[i].boxNumber + '">' + data[i].boxName + '</a></strong></div>';
                                        html = html + '<div class="tit"><span>' + data[i].content + '</span></div>';
                                        html = html + '<div class="pic" ng-show="' + data[i].image + '"><a href="#"><img src="' + data[i].image + '"/></a></div>';
                                        html = html + '</div>';
                                    } else if (data[i].type == 3) {
                                        title = $translate.instant('YYRecording');
                                        html = html + '<div class="info_box">';
                                        html = html + '<div class="iconfont icon talk">&#xe61b;</div>';
                                        html = html + '<div class="tit"><strong>' + title + '</strong></div>';
                                        html = html + '<div class="tit"><span>' + data[i].content + '</span></div>';
                                        html = html + '</div>';
                                    }
                                    html = html + "</li>";
                                }
                                //console.log(html);
                                // 为了测试，延迟1秒加载
                                $('#historyRecord').html("");
                                setTimeout(function () {
                                    $scope.$apply(function () {
                                        $('#historyRecord').append(html);
                                    })
                                    $scope.data.page = page;
                                    $scope.data.firstsize = $state.events.length;
                                    me.resetload();
                                }, 1000);
                                $scope.data.page = page;
                                $scope.data.firstsize = $state.events.length;
                                setTimeout(function () {
                                    $("#page").val("1");
                                    me.resetload();
                                }, 1000);
                            } else {
                                $(".dropload-load").html("亲，无更多信息请稍候重试！");
                                setTimeout(function () {
                                    me.resetload();
                                }, 1000);
                            }
                        },
                        error: function (xhr, type) {
                            me.resetload();
                        }
                    });
                },
                loadDownFn: function (me) {
                    var keyword = $scope.data.keyword;// 关键字
                    //获取跳转的类型
                    page = parseInt($("#page").val());
                    firstsize = $scope.data.firstsize;
                    //console.log("" + keyword + "==" + type + "==" + page + "==" + pageSize);
                    $.ajax({
                        url: $state.server + "/appapi/events/getHistoryList",
                        dataType: "json",
                        data: {
                            "page": page,
                            "keyword": keyword,
                            "pageSize": pageSize,
                            "userid": $state.user._id,
                            "firstsize": firstsize
                        },
                        success: function (mdata) {
                            if (my_media) {
                                my_media.stop();
                            }
                            var html = "";
                            addHtml(mdata, 1);
                            var data = $state.newevents;
                            if (data != null && data != "") {
                                for (var i = 0; i < data.length; i++) {
                                    var title = "";
                                    var fromtitle = ""
                                    html = html + "<li >";
                                    html = html + '<div class="info_time" id="' + data[i]._id + '"><span style="width:auto">' + data[i].dateTime + '</span></div>';
                                    if (data[i].type == 0) {
                                        title = $translate.instant('noEatTitle');
                                        fromtitle = $translate.instant('formTitle');
                                        html = html + '<div class="info_box">';
                                        html = html + '<div class="iconfont icon news">&#xe61b;</div>';
                                        html = html + '<div class="tit"><strong>' + title + '</strong><strong style="float: right;">' + fromtitle + '<a href="#/Info/' + data[i].boxNumber + '">' + data[i].boxName + '</a></strong></div>';
                                        html = html + '<div class="tit"><span>{{event.content}}</span></div></div>';
                                    } else if (data[i].type == 1) {
                                        title = $translate.instant('Recording');
                                        fromtitle = $translate.instant('formTitle');
                                        html = html + '<div class="info_box">';
                                        html = html + '<div class="iconfont icon talk">&#xe61d;</div>';
                                        html = html + '<div class="tit"><strong>' + title + '</strong><strong style="float: right;">' + fromtitle + '<a href="#/Info/' + data[i].boxNumber + '">' + data[i].boxName + '</a></strong></div>';
                                        html = html + '<div class="tit"><div class="voice openfile" onclick=openfile2(\"' + data[i].boxNumber + '\",\"' + data[i].filepath + '\",\"' + data[i].time + '\",\"' + data[i]._id + '\")><i></i>';
                                        html = html + '<img id="name_' + data[i]._id + '" src="images/info_voice.png"/></div>';
                                        if (data[i].time != "undefined" && data[i].time != "" && data[i].time != null) {
                                            html = html + '<div class="time">' + data[i].time + '' + '</div>';
                                        }
                                        html = html + '</div>';
                                    } else if (data[i].type == 2) {
                                        title = $translate.instant('noEatTitle');
                                        fromtitle = $translate.instant('formTitle');
                                        html = html + '<div class="info_box">';
                                        html = html + '<div class="iconfont icon news">&#xe61c;</div>';
                                        html = html + '<div class="tit"><strong>' + title + '</strong><strong style="float: right;">' + fromtitle + '<a href="#/Info/' + data[i].boxNumber + '">' + data[i].boxName + '</a></strong></div>';
                                        html = html + '<div class="tit"><span>' + data[i].content + '</span></div>';
                                        html = html + '<div class="pic" ng-show="' + data[i].image + '"><a href="#"><img src="' + data[i].image + '"/></a></div>';
                                        html = html + '</div>';
                                    } else if (data[i].type == 3) {
                                        title = $translate.instant('YYRecording');
                                        html = html + '<div class="info_box">';
                                        html = html + '<div class="iconfont icon talk">&#xe61b;</div>';
                                        html = html + '<div class="tit"><strong>' + title + '</strong></div>';
                                        html = html + '<div class="tit"><span>' + data[i].content + '</span></div>';
                                        html = html + '</div>';
                                    }
                                    html = html + "</li>";
                                }
                                //console.log(html);
                                // 为了测试，延迟1秒加载
                                $state.page = page;
                                setTimeout(function () {
                                    $scope.$apply(function () {
                                        $('#historyRecord').append(html);
                                    })
                                    page = page + 1;
                                    $("#page").val(page);
                                    $scope.$apply();
                                    me.resetload();
                                }, 1000);
                            } else {
                                $(".dropload-load").html("亲，无更多信息请稍候重试！");
                                setTimeout(function () {
                                    me.resetload();
                                }, 1000);
                            }
                        },
                        error: function (xhr, type) {
                            me.resetload();
                            //function gohome() {
                            //
                            //}
                        }
                    });
                }
            });
            //var pulldown = new RefreshInit($('#pullDown'));
            ////上啦加载动画
            //var pullup = new RefreshInit($('#pullUp'));
            //var holdPosition = 0, afterPosition = 0;
            //
            ////初始化Swiper
            //var mySwiper = $(".updown").swiper({
            //    mode: 'vertical',
            //    scrollContainer: true,
            //    mousewheelControl: true,
            //    slidesPerView: 'auto',
            //    watchActiveIndex: true,
            //    onTouchStart: function () {
            //        holdPosition = 0;
            //        afterPosition = 0;
            //    },
            //    onResistanceBefore: function (s, pos) {
            //        holdPosition = pos;
            //        if (holdPosition > 100 && !pulldown.isFlip()) {
            //            pulldown.pullDown();
            //        } else if (holdPosition < 100 && pulldown.isFlip()) {
            //            pulldown.pullDownReInit();
            //        }
            //    },
            //    onResistanceAfter: function (s, pos) {
            //        afterPosition = pos;
            //        if (afterPosition > 100 && !pullup.isFlip()) {
            //            pullup.pullUp();
            //        } else if (afterPosition < 100 && pullup.isFlip()) {
            //            pullup.pullUpReInit();
            //        }
            //    },
            //    onTouchEnd: function () {
            //        if (holdPosition > 100) {
            //            mySwiper.params.onlyExternal = true;
            //            loadNewSlides();
            //        }
            //        ;
            //        if (afterPosition > 100) {
            //            mySwiper.setWrapperTranslate(0, mySwiper.getWrapperTranslate("y"), 0);
            //            mySwiper.params.onlyExternal = true;
            //            AddloadSlides();
            //        }
            //    }
            //})
            ////进入当前页面时获取最新的10条消息
            //if ($state.fristLoading == 'true') {
            //    loading();
            //}
            //function loading() {
            //    type = 0;
            //    mySwiper.setWrapperTranslate(0, 60, 0);
            //    pulldown.loading();
            //    $http.post($state.server + "/appapi/events/getTenList", obj).success(function (mdata) {
            //        $state.fristLoading = "false";
            //        addHtml(mdata, type);
            //        pulldown.loadReInit();
            //    })
            //}
            //
            ////下拉刷新时刷新数据的方法
            //function loadNewSlides() {
            //    mySwiper.setWrapperTranslate(0, 60, 0);
            //    pulldown.loading();
            //    type = 0;
            //    localStorage.setItem("ViewTime", new Date());
            //    $state.ViewTime = new Date();
            //    setTimeout(function () {
            //        $http.post($state.server + "/appapi/events/getTenList", obj).success(function (mdata) {
            //            if (mdata != "null" && mdata.length > 0) {
            //                addHtml(mdata, type);
            //            } else {
            //                $state.events = mdata
            //            }
            //            pulldown.loadReInit();
            //        });
            //    }, 500);
            //}
            //
            ////上拉刷新时加载数据的方法
            //function AddloadSlides() {
            //    mySwiper.setWrapperTranslate(0, mySwiper.getWrapperTranslate("y") + 100, 0);
            //    pullup.loading();
            //    setTimeout(function () {
            //        obj.createTime = $state.lasttime;
            //        type = 1;
            //        $http.post($state.server + "/appapi/events/getHistoryList", obj).success(function (mdata) {
            //            if (mdata.length > 0 && mdata != "null") {
            //                pullup.loadReInit();
            //                for (var i = 0; i < mdata.length; i++) {
            //                    socket.emit("createmessage", {boxNumber: mdata[i].boxNumber, content: mdata[i]});
            //                }
            //            } else {
            //                pullup.loadEnd();
            //                mySwiper.setWrapperTranslate(0, -mySwiper.activeSlide().getHeight() + mySwiper.height, 0);
            //                mySwiper.params.onlyExternal = false;
            //            }
            //        });
            //    }, 500);
            //}

            //获取新添加的消息显示出来
            socket.on("message", function (message) {
                addHtml(message, 2);
            });
            function addHtml(mdata, type) {
                var events = [];
                for (var i = 0; i < mdata.length; i++) {
                    var createTime = new Date(mdata[i].createTime);
                    var nowTime = new Date();
                    var hours = createTime.getHours() + "", minutes = createTime.getMinutes() + "";
                    if (hours.length < 2) {
                        hours = "0" + hours;
                    }
                    if (minutes.length < 2) {
                        minutes = "0" + minutes;
                    }
                    if (nowTime.getDate() - createTime.getDate() == 1) {
                        var dayTitle = $translate.instant('yestitle');
                        var time = dayTitle + " " + hours + ":" + minutes;
                    } else if (nowTime.getDate() - createTime.getDate() > 1) {
                        var weekTitle = "";
                        switch (createTime.getDay()) {
                            case 1:
                                weekTitle = weekTitle + $translate.instant('Monday');
                                break;
                            case 2:
                                weekTitle = weekTitle + $translate.instant('Tuesday');
                                break;
                            case 3:
                                weekTitle = weekTitle + $translate.instant('Wednesday');
                                break;
                            case 4:
                                weekTitle = weekTitle + $translate.instant('Thursday');
                                break;
                            case 5:
                                weekTitle = weekTitle + $translate.instant('Friday');
                                break;
                            case 6:
                                weekTitle = weekTitle + $translate.instant('Saturday');
                                break;
                            case 0:
                                weekTitle = weekTitle + $translate.instant('Sunday');
                                break;
                        }
                        var time = weekTitle + " " + hours + ":" + minutes;
                    } else {
                        var time = hours + ":" + minutes;
                    }
                    var event = mdata[i];
                    event['dateTime'] = time;
                    events.push(event);
                    var lasttime = new Date($state.lasttime);
                    $state.lasttime = createTime.getTime() >= lasttime.getTime() ? lasttime : createTime;

                }
                if (type == 2) {
                    for (var x in events) {
                        $state.events.unshift(events[x]);
                        localStorage.setItem("events",JSON.stringify($state.events));
                    }
                } else {
                    $state.newevents = events;
                }

            }

            //
            ////初始化Swiper的长度
            //$scope.$on('exampleDirective', function () {
            //    mySwiper.reInit();
            //    mySwiper.params.onlyExternal = false;
            //});
            //播放语音文件
            var openindex = "";
            $scope.openfile = function (boxNumber, filepath, time, index) {
                if (!my_media) {
                    openindex = index;
                    $('#name_' + index).attr("src", "images/info_voice.gif");
                    captureSuccess(filepath, time, index);
                } else {
                    my_media.stop();
                    if (openindex == index) {
                        $('#name_' + openindex).attr("src", "images/info_voice.png");
                        my_media = null;
                    } else {
                        $('#name_' + openindex).attr("src", "images/info_voice.png");
                        $('#name_' + index).attr("src", "images/info_voice.gif");
                        openindex = index;
                        captureSuccess(filepath, time, index);
                    }
                }
                function captureSuccess(filepath, time, index) {
                    var i, len;
                    //业务逻辑
                    my_media = new Media($state.server + "/vv-box/" + boxNumber + "/" + filepath,
                        // success callback
                        function () {
                            //      alert("playAudio():Audio Success");
                        },
                        // error callback
                        function (err) {
                            //       alert("playAudio():Audio Error: " + err);
                        });
                    my_media.play();
                    if (time != null && time != "") {
                        $timeout(function () {
                            $('#name_' + openindex).attr("src", "images/info_voice.png");
                        }, time * 1000);
                    } else {
                        $timeout(function () {
                            $('#name_' + openindex).attr("src", "images/info_voice.png");
                        }, 10000);
                    }

                }
            }

            $state.title = $translate.instant('messageTitle');
        } else {
            $state.go("login");
        }

    }]);

//提醒alert.yy
boxControllers.controller('AlertCtrl', ['$scope', '$state', '$http', '$stateParams', '$translate', 'socket', '$timeout',
    function ($scope, $state, $http, $stateParams, $translate, socket, $timeout) {
        $translate.use($state.language);
        $state.infolist = false;
        $state.addlist = false;
        $state.facelist = false;
        $state.openInfos = false;
        $state.loading = false;
        if ($state.user) {
            $state.count = 0;
            var obj = {
                userid: $state.user._id
            }
            var boxNumber = "";
            $http.post($state.server + "/appapi/nobilitys/getUsername", obj).success(function (udata) {
                var boxNumbers = udata.boxIds;
                if (!boxNumbers.length > 0) {
                    $state.go("addbox");
                } else {
                    var nboxid = "";
                    if (udata.lastboxid != "" || udata.lastboxid != null) {
                        nboxid = udata.lastboxid;
                    } else {
                        nboxid = udata[0].number;
                    }
                    boxNumber = nboxid;
                    $http.post($state.server + "/appapi/boxes/getBoxList", {boxNumbers: boxNumbers}).success(function (data) {
                        $scope.boxlists = data;
                        if(localStorage.getItem(nboxid)!=null&&localStorage.getItem(nboxid)!="undefined"){
                            var boxid=JSON.parse(localStorage.getItem(nboxid));
                            $scope.boxname = boxid.number;
                            $scope.img = boxid.image;
                            $scope.number = boxid.number;
                        }
                        getOneBox(nboxid);

                    });
                    function getOneBox(boxid) {
                        $http.post($state.server + "/appapi/boxes/getOne", {boxid: boxid}).success(function (data) {
                            $scope.boxname = data.number;
                            $scope.img = data.image;
                            $scope.number = data.number;
                            getMessages(data.number);
                        });
                    }
                    function getMessages(mboxid) {
                        $http.post($state.server + "/appapi/messages/getList", {lastboxid: mboxid}).success(function (data) {
                            for (var i = 0; i < data.length; i++) {
                                $state[data[i]._id] = "images/microphone.png";
                            }
                            $state.alertmessages = data;
                            $state.ycolor = ['yw_red', 'yw_yellow', 'yw_blue', 'yw_green', 'yw_brown', 'yw_grey'];
                        });
                    }

                    $state.messagecount = 0;
                    localStorage.setItem($state.user._id, new Date());
                }
            });
            $state.title = $translate.instant('alertTitle');
            $scope.changeBox = function () {
                boxNumber = $scope.boxname;
                $http.post($state.server + "/appapi/boxes/getOneChange", {
                    userid: $state.user._id,
                    boxid: boxNumber
                }).success(function (data) {
                    //console.log(data);
                    $scope.boxname = data.number;
                    $scope.img = data.image;
                    $scope.number = data.number;
                });
                $http.post($state.server + "/appapi/messages/getList", {lastboxid: boxNumber}).success(function (data) {
                    for (var i = 0; i < data.length; i++) {
                        $state[data[i]._id] = "images/microphone.png";
                    }
                    $state.alertmessages = data;
                    $state.ycolor = ['yw_red', 'yw_yellow', 'yw_blue', 'yw_green', 'yw_brown', 'yw_grey'];
                });
                //var mtype="0";
                //$http.post($state.server+"/appapi/messages/getCount",{lastboxid:boxNumber,mtype:mtype}).success(function(mdata) {
                //    $scope.count=mdata-$state.messagecount;
                //    $state.messagecount=mdata;
                //});
            };
            $scope.deleteMessage = function (id, boxNumber) {
                $http.post($state.server + "/appapi/messages/deleteOneMessage", {id: id}).success(function (data) {
                    $http.post($state.server + "/appapi/messages/getList", {lastboxid: boxNumber}).success(function (data) {
                        for (var i = 0; i < data.length; i++) {
                            $state[data[i]._id] = "images/microphone.png";
                        }
                        $state.alertmessages = data;
                        $state.ycolor = ['yw_red', 'yw_yellow', 'yw_blue', 'yw_green', 'yw_brown', 'yw_grey'];
                    });
                }).error(function (data) {
                })
            };
            $scope.changeType = function (id, boxNumber, mtype) {
                //console.log(id);
                $http.post($state.server + "/appapi/messages/changeType", {
                    id: id,
                    type: mtype
                }).success(function (data) {
                    $http.post($state.server + "/appapi/messages/getList", {lastboxid: boxNumber}).success(function (data) {
                        for (var i = 0; i < data.length; i++) {
                            $state[data[i]._id] = "images/microphone.png";
                        }
                        $state.alertmessages = data;
                        $state.ycolor = ['yw_red', 'yw_yellow', 'yw_blue', 'yw_green', 'yw_brown', 'yw_grey'];
                    });
                })
            };
            $scope.$on("mousemove", function (e, id) {
                $state.loading = true;
                $state.infolist = false;
                $http.post($state.server + "/appapi/messages/getMessageById", {id: id}).success(function (mdata) {
                    $state.loading = false;
                    if (mdata.type == 0) {
                        $state.go("yydetail", {id: id});
                    } else {
                        $state.go("shdetail", {id: id});
                    }
                }).error(function (err) {
                    $state.loading = false;
                })
            })
            //$scope.mousemove = function ($event, id) {
            //    $event.stopPropagation();
            //
            //}
            var my_media;
            $scope.openfile = function ($event, filepath, time, id) {
                $("#openmediv").val(1);
                $('.swipe-delete div.open').animate({left: 0}, 200);
                $('.swipe-delete div.open').css('left', '0px').removeClass('open');
                $event.stopPropagation();
                if (!my_media) {
                    $state[id] = "images/microphone.gif";
                    captureSuccess(filepath, time, id);
                } else {
                    my_media.stop();
                    $state[id] = "images/microphone.png";
                    my_media = null;
                    $("#openmediv").val(0);
                }
                function captureSuccess(filepath, time, id) {
                    var i, len;
                    //业务逻辑
                    my_media = new Media($state.server + "/vv-box/" + boxNumber + "/" + filepath,
                        // success callback
                        function () {
                            $("#openmediv").val(1);
                        },
                        // error callback
                        function (err) {
                            $("#openmediv").val(0);
                            //       alert("playAudio():Audio Error: " + err);
                        });
                    my_media.play();
                    $timeout(function () {
                        $state[id] = "images/microphone.png";
                    }, time * 1000);
                }
            }
        } else {
            $state.go("login");
        }
    }]);

//添加用药提醒
boxControllers.controller('AlertAddYYCtrl', ['$scope', '$state', '$stateParams', '$timeout', '$http', '$translate', 'socket',
    function ($scope, $state, $stateParams, $timeout, $http, $translate, socket) {
        $state.loading = false;
        if ($state.user) {
            $state.save = $translate.instant('save');
            //当app账号和微信账号都没有登录的时候
            var obj = {
                username: $state.username,
                openid: $state.openid,
                userid: $state.user._id
            }
            if ($stateParams == null) {
                $state.go('alert.yy');
            }
            $state.infolist = false;
            $state.openInfos = false;
            $scope.data = {};
            $scope.data.boxNumber = $stateParams.boxNumber;
            $state.title = $translate.instant('alertDrug');
            $scope.cishu = [$translate.instant('OnceDay'), $translate.instant('TwiceDay'), $translate.instant('ThriceDay'), $translate.instant('FourDay'), $translate.instant('FiveDay')];
            $scope.cishuNo = 0;
            $scope.yaoliang = [$translate.instant('onepiece'), $translate.instant('twopiece'), $translate.instant('threepiece'), $translate.instant('fourpiece'), $translate.instant('fivepiece'), $translate.instant('sixpiece'), $translate.instant('severpiece')];
            $scope.yaoliangNo = 0;
            $scope.jiange = [$translate.instant('oneday'), $translate.instant('twoday'), $translate.instant('threeday'), $translate.instant('fourday'), $translate.instant('fiveday'), $translate.instant('sixday'), $translate.instant('severday')];
            $scope.jiangeNo = 0;
            $scope.data.type = 0;
            $scope.data["isf"] = 0;
            $scope.data.isK = 2;
            $scope.data.isXZ = 0;
            $scope.data.isYS = 0;
            $scope.data.messageNo = 1;
            $scope.data.times = [];
            $scope.data.meici = 1;
            $scope.data.jiange = 1;
            $scope.data.isYY = 0;
            $scope.data.mtype = 0;
            $scope.ycolor = ['yw_red', 'yw_yellow', 'yw_blue', 'yw_green', 'yw_brown', 'yw_grey'];

            $scope.clickK = function (val) {   //孔，
                $scope.data.isK = val;
            };

            $scope.addTime = function () {
                if ($scope.data.times.length < 8) {
                    $scope.data.times.push({
                        "index": $scope.data.times.length + 1,
                        "value": "08:00",
                        "id": "time" + ($scope.data.times.length + 1)
                    });
                    var index = $scope.data.times.length;
                    var opt = {};
                    opt.date = {preset: 'date'};
                    opt.time = {preset: 'time'};
                    var language=$state.language;
                    opt.default = {
                        index: index,
                        theme: 'android-ics light', //皮肤样式
                        display: 'bottom', //显示方式
                        mode: 'scroller', //日期选择模式
                        lang: language,
                        showNow: true,
                        timeWheels: "HHii",
                        timeFormat: 'HH:ii'
                    };
                    var optTime = $.extend(opt['time'], opt['default']);
                    var val = $scope.data.times[index - 1].id;
                    //$scope.$apply(function(){
                    $timeout(function () {
                        $("#" + val).mobiscroll(optTime).time(optTime);
                    }, 0);
                }
            };
            $scope.deleteTime = function (index) {
                $scope.data.times.splice(index - 1, 1);
            }
            $scope.addTime();
            $scope.clickF = function (val) {   //饭前，饭中，饭后
                $scope.data.isf = val;
            };
            $scope.clickAdd = function (key, max, callback) {   //加
                if ($scope.data[key] < max)
                    $scope.data[key] += 1;
                if (callback)callback();
            };

            $scope.clickDec = function (key, min, callback) {  //减
                if ($scope.data[key] > min) {
                    $scope.data[key] -= 1;
                    if (callback)callback();
                }
            };

            $scope.timeDec = function (key) {  //减
                var time = 200;
                $timeout(decjob, time);
                $scope.data.times[(key - 1)].isStop = 1;
                function decjob() {

                    var hm = $scope.data.times[(key - 1)].value;
                    var hm = hm.split(":");
                    hm[0] = parseInt(hm[0]);
                    hm[1] = parseInt(hm[1]) - 15;
                    if (hm[1] < 0) {
                        hm[0] = parseInt(hm[0]) - 1;
                        hm[1] = hm[1] + 60;
                    }
                    if (hm[0] < 0) {
                        hm[0] = hm[0] + 24;
                    }
                    if (hm[0] < 10) {
                        hm[0] = "0" + hm[0];
                    }
                    if (hm[1] < 10) {
                        hm[1] = "0" + hm[1];
                    }
                    $scope.data.times[(key - 1)].value = hm[0] + ":" + hm[1];
                    if ($scope.data.times[(key - 1)].isStop == 1) {
                        if (time > 30)time -= 10;
                        $timeout(decjob, time);
                    }
                }
            };

            $scope.timeDecStop = function (key) {
                $scope.data.times[(key - 1)].isStop = 0;
            };

            $scope.timeAdd = function (key) {  //增
                var hm = $scope.data.times[(key - 1)].value;
                var hm = hm.split(":");
                hm[1] = parseInt(hm[1]) + 15;
                hm[0] = parseInt(hm[0]);
                if (hm[1] >= 60) {
                    hm[0] = parseInt(hm[0]) + 1;
                    hm[1] = hm[1] % 60;
                }
                if (hm[0] >= 24) {
                    hm[0] = hm[0] % 24;
                }
                if (hm[0] < 10) {
                    hm[0] = "0" + hm[0];
                }
                if (hm[1] < 10) {
                    hm[1] = "0" + hm[1];
                }
                $scope.data.times[(key - 1)].value = hm[0] + ":" + hm[1];
            };
            $scope.timeAddStop = function (key) {
                $scope.data.times[(key - 1)].isStop = 0;
            };


            //保存药物提醒
            $scope.mesSave = function (key) {
                if ($scope.data.isK == '2' || $scope.data.isK == '1') {
                    var mes = {
                        boxNumber: $scope.data.boxNumber,
                        isK: $scope.data.isK
                    }
                    $http.post($state.server + "/appapi/messages/getMessageByBoxAndHole", mes).success(function (message) {
                        var isSave, isDelete = false;

                        if (message == "null") {
                            isSave = true;
                        } else {
                            if (confirm($translate.instant('largehole'))) {
                                isSave = true;
                                isDelete = true;
                            } else {
                                isSave = false;
                            }
                        }
                        if (isSave) {
                            if (isDelete) {
                                $http.post($state.server + "/appapi/messages/deleteOneMessage", {id: message._id}).success(function (data) {

                                })
                            }
                            saveMessage();
                        }
                    })
                } else {
                    saveMessage();
                }
            };
            function saveMessage() {
                $scope.data.messageNo = $scope.data.times.length;
                $state.loading = true;
                if ($scope.data.isYY == 0) {
                    if ($scope.data.name == null)
                        $scope.data.name = $translate.instant('medicine');
                    var tixin = $translate.instant('voiceContent') + "(" + $scope.data.name + ")" + $scope.data.meici + $translate.instant('piece');
                    navigator.synthetic.synthetic({code: tixin}, function (data) {
                        var fileURL = "file:" + data;
                        var options = new FileUploadOptions();
                        options.fileKey = "file";
                        options.fileName = fileURL.substr(fileURL.lastIndexOf('/') + 1);
                        options.mimeType = "text/plain";

                        var params = {};
                        params.value1 = $scope.data.boxNumber;
                        params.value2 = 2;
                        options.params = params;

                        var ft = new FileTransfer();
                        var win = function (r) {
                            var data = JSON.parse(r.response);
                            $scope.data.filepath = data.path;
                            $scope.data.time = data.time;
                            $http.post($state.server + "/appapi/messages/saveMes", $scope.data).success(function (mdata) {
                                $state.loading = false;
                                $state.go('alert.yy');
                            });
                        };

                        var fail = function (error) {
                            alert("An error has occurred: Code = " + error.code);
                            alert("upload error source " + error.source);
                            alert("upload error target " + error.target);
                        };
                        ft.upload(fileURL, encodeURI($state.server + "/audioupload"), win, fail, options);
                    });
                } else {
                    if ($scope.data.filepath != null) {
                        $scope.data.name = $translate.instant('medicine');
                        $http.post($state.server + "/appapi/messages/saveMes", $scope.data).success(function (mdata) {
                            socket.emit('alertJoin', mdata);
                            $state.loading = false;
                            $state.go('alert.yy');
                        });
                    } else {
                        $state.loading = false;
                        alert($translate.instant('remindvoice'));
                    }
                }
            }

            //音频
            $scope.showCapture = function () {
                //captureAudio方法成功执行后回调函数
                function captureSuccess(mediaFiles) {
                    var i, len;
                    for (i = 0, len = mediaFiles.length; i < len; i += 1) {
                        //业务逻辑
                        var my_media = new Media("/lf/" + mediaFiles[i].name,
                            // success callback
                            function () {
                                //      alert("playAudio():Audio Success");
                            },
                            // error callback
                            function (err) {
                                //       alert("playAudio():Audio Error: " + err);
                            });
                        my_media.play();
                        var fileURL = mediaFiles[i].fullPath;
                        var options = new FileUploadOptions();
                        options.fileKey = "file";
                        options.fileName = fileURL.substr(fileURL.lastIndexOf('/') + 1);
                        options.mimeType = "text/plain";
                        var params = {};
                        params.value1 = $scope.data.boxNumber;
                        params.value2 = 1;
                        options.params = params;
                        var ft = new FileTransfer();
                        var win = function (r) {
                            var data = JSON.parse(r.response);
                            $scope.data.filepath = data.path;
                            $scope.data.time = data.time;
                        };
                        var fail = function (error) {
                            alert("An error has occurred: Code = " + error.code);
                            alert("upload error source " + error.source);
                            alert("upload error target " + error.target);
                        };
                        ft.upload(fileURL, encodeURI($state.server + "/audioupload"), win, fail, options);

                    }
                }

                //captureAudio方法执行失败后回调函数
                function captureError(error) {
                    var msg = 'capture 发生错误: ' + error.code;
                    navigator.notification.alert(msg, null, 'Uh oh!');
                }

                $state.save = $translate.instant('save');
                //录制音频开始
                navigator.device.capture.captureAudio(captureSuccess, captureError, {limit: 1});
            }
        } else {
            $state.go("login");
        }
    }]);

//查看用药信息
boxControllers.controller('CtrlDetail', ['$scope', '$state', '$stateParams', '$timeout', '$http', '$translate',
    function ($scope, $state, $stateParams, $timeout, $http, $translate) {
        $state.loading = false;
        if ($state.user) {
            //当app账号和微信账号都没有登录的时候
            var obj = {
                userid: $state.user._id
            }
            if ($stateParams == null) {
                history.go(-1);
            }
            $scope.voiceimg = "images/info_voice.png";
            var messageid = $stateParams.id;
            $state.loading = true;
            $state.infolist = false;
            $state.openInfos = false;
            $state.ycolor = ['yw_red', 'yw_yellow', 'yw_blue', 'yw_green', 'yw_brown', 'yw_grey'];
            $scope.data = {};
            $http.post($state.server + "/appapi/messages/getMessageById", {id: messageid}).success(function (mdata) {
                $state.messageid = mdata._id;
                $state.loading = false;
                //$state.message=mdata;
                $state.title = $translate.instant('editRemind');
                $scope.data.name = mdata.name;
                $scope.cishu = [$translate.instant('OnceDay'), $translate.instant('TwiceDay'), $translate.instant('ThriceDay'), $translate.instant('FourDay'), $translate.instant('FiveDay')];
                $scope.yaoliang = [$translate.instant('onepiece'), $translate.instant('twopiece'), $translate.instant('threepiece'), $translate.instant('fourpiece'), $translate.instant('fivepiece'), $translate.instant('sixpiece'), $translate.instant('severpiece')];
                $scope.data.meici = mdata.ywNo;
                $scope.data.jiange = mdata.jiange;
                $scope.data.type = mdata.type;
                $scope.data["isf"] = mdata.isf;
                $scope.data.isK = mdata.isK;
                $scope.data.isXZ = mdata.style;
                $scope.data.isYS = mdata.color;
                $scope.data.messageNo = mdata.messageNo;
                $scope.data.times = [];
                for (var i = 0; i < mdata.messageTime.length; i++) {
                    $scope.data.times.push({"index": i + 1, "value": mdata.messageTime[i], "id": "time" + (i + 1)});
                }
                $scope.data.isYY = 0;
                $scope.data.filepath = mdata.filepath;
                $scope.data.boxNumber = mdata.boxNumber;
                $scope.data.time = mdata.time;

            });
            var my_media;

            $scope.openfile = function ($event, filepath, time) {
                $event.stopPropagation();
                if (!my_media) {
                    $scope.voiceimg = "images/info_voice.gif";
                    captureSuccess(filepath);
                } else {
                    my_media.stop();
                    $scope.voiceimg = "images/info_voice.png";
                    my_media = null;
                }
                function captureSuccess(filepath) {
                    var i, len;
                    //业务逻辑
                    my_media = new Media($state.server + "/vv-box/" + $scope.data.boxNumber + "/" + filepath,
                        // success callback
                        function () {
                            //      alert("playAudio():Audio Success");
                        },
                        // error callback
                        function (err) {
                            //       alert("playAudio():Audio Error: " + err);
                        });
                    my_media.play();
                    setTimeout(function () {
                        $scope.voiceimg = "images/info_voice.png";
                    }, time)
                }
            }
        } else {
            $state.go("login")
        }
    }]);
//编辑用药信息
boxControllers.controller('EditDetail', ['$scope', '$state', '$stateParams', '$timeout', '$http', '$translate',
    function ($scope, $state, $stateParams, $timeout, $http, $translate) {
        $state.infolist = false;
        $state.openInfos = false;
        $state.ycolor = ['yw_red', 'yw_yellow', 'yw_blue', 'yw_green', 'yw_brown', 'yw_grey'];
        $state.title = $translate.instant('editRemind');
        $scope.data = {};
        $http.post($state.server + "/appapi/messages/getMessageById", {id: $stateParams.id}).success(function (mdata) {
            $state.messageid = mdata._id;
            $scope.data.boxNumber = mdata.boxNumber;
            $scope.data.messageid = mdata._id;
            $scope.data.name = mdata.name;
            $scope.cishu = [$translate.instant('OnceDay'), $translate.instant('TwiceDay'), $translate.instant('ThriceDay'), $translate.instant('FourDay'), $translate.instant('FiveDay')];
            $scope.yaoliang = [$translate.instant('onepiece'), $translate.instant('twopiece'), $translate.instant('threepiece'), $translate.instant('fourpiece'), $translate.instant('fivepiece'), $translate.instant('sixpiece'), $translate.instant('severpiece')];
            $scope.data.meici = mdata.ywNo;
            $scope.jiange = [$translate.instant('oneday'), $translate.instant('twoday'), $translate.instant('threeday'), $translate.instant('fourday'), $translate.instant('fiveday'), $translate.instant('sixday'), $translate.instant('severday')];
            $scope.data.jiange = mdata.jiange;
            $scope.data.type = mdata.type;
            $scope.data["isf"] = mdata.isf;
            $scope.data.isK = mdata.isK;
            $scope.data.isXZ = mdata.style;
            $scope.data.isYY = 0;
            $scope.data.isYS = mdata.color;
            $scope.data.messageNo = mdata.messageNo;
            $scope.meslist = mdata.messageNo;
            $scope.data.proid = mdata.proid;
            $scope.data.mtype = 0;
            $scope.data.content = mdata.content;
            $scope.data.time = mdata.time;
            $scope.data.times = [];
            for (var i = 0; i < mdata.messageTime.length; i++) {
                $scope.data.times.push({"index": i + 1, "value": mdata.messageTime[i], "id": "time" + (i + 1)});
                $scope.hadTime();
            }
            $scope.data.isYY = 0;
            $scope.data.filepath = mdata.filepath;
        });
        $scope.clickK = function (val) {   //孔，
            $scope.data.isK = val;
        };
        $scope.clickF = function (val) {   //饭前，饭中，饭后
            $scope.data.isf = val;
        };
        $scope.hadTime = function () {
            var opt = {};
            opt.date = {preset: 'date'};
            opt.time = {preset: 'time'};
            var index = $scope.data.times.length;
            var language=$state.language;
            if ($state.language == ""||$state.language ==null) {
                language = 'zh'
            }
            opt.default = {
                index: index,
                theme: 'android-ics light', //皮肤样式
                display: 'bottom', //显示方式
                mode: 'scroller', //日期选择模式
                lang: language,
                showNow: true,
                timeWheels: "HHii",
                timeFormat: 'HH:ii'
            };
            var optTime = $.extend(opt['time'], opt['default']);
            var val = $scope.data.times[index - 1].id;
            //$scope.$apply(function(){
            $timeout(function () {
                $("#" + val).mobiscroll(optTime).time(optTime);
            }, 0);
        }
        $scope.addTime = function () {
            if ($scope.data.times.length < 8) {
                $scope.data.times.push({
                    "index": $scope.data.times.length + 1,
                    "value": "08:00",
                    "id": "time" + ($scope.data.times.length + 1)
                });
                var opt = {};
                opt.date = {preset: 'date'};
                opt.time = {preset: 'time'};
                var index = $scope.data.times.length;
                var language=$state.language;
                if ($state.language == ""||$state.language ==null) {
                    language = 'zh'
                }
                opt.default = {
                    theme: 'android-ics light', //皮肤样式
                    display: 'bottom', //显示方式
                    mode: 'scroller', //日期选择模式
                    lang: language,
                    showNow: true,
                    timeWheels: "HHii",
                    timeFormat: 'HH:ii'
                };
                var optTime = $.extend(opt['time'], opt['default']);
                var val = $scope.data.times[index - 1].id;
                //$scope.$apply(function(){
                $timeout(function () {
                    $("#" + val).mobiscroll(optTime).time(optTime);
                }, 0);
            }
        };
        $scope.deleteTime = function (index) {
            $scope.data.times.splice(index - 1, 1);
        }
        $scope.clickAdd = function (key, max, callback) {   //加
            if ($scope.data[key] < max)
                $scope.data[key] += 1;
            if (callback)callback();
        };

        $scope.clickDec = function (key, min, callback) {  //减
            if ($scope.data[key] > min) {
                $scope.data[key] -= 1;
                if (callback)callback();
            }
        };

        $scope.timeDec = function (key) {  //减
            var time = 200;
            $timeout(decjob, time);
            $scope.data.times[(key - 1)].isStop = 1;
            function decjob() {
                var hm = $scope.data.times[(key - 1)].value;
                var hm = hm.split(":");
                hm[0] = parseInt(hm[0]);
                hm[1] = parseInt(hm[1]) - 15;
                if (hm[1] < 0) {
                    hm[0] = parseInt(hm[0]) - 1;
                    hm[1] = hm[1] + 60;
                }
                if (hm[0] < 0) {
                    hm[0] = hm[0] + 24;
                }
                if (hm[0] < 10) {
                    hm[0] = "0" + hm[0];
                }
                if (hm[1] < 10) {
                    hm[1] = "0" + hm[1];
                }
                $scope.data.times[(key - 1)].value = hm[0] + ":" + hm[1];
                if ($scope.data.times[(key - 1)].isStop == 1) {
                    if (time > 30)time -= 10;
                    $timeout(decjob, time);
                }
            }
        };

        $scope.timeDecStop = function (key) {
            $scope.data.times[(key - 1)].isStop = 0;
        };

        $scope.timeAdd = function (key) {  //增
            var hm = $scope.data.times[(key - 1)].value;
            var hm = hm.split(":");
            hm[1] = parseInt(hm[1]) + 15;
            hm[0] = parseInt(hm[0]);
            if (hm[1] >= 60) {
                hm[0] = parseInt(hm[0]) + 1;
                hm[1] = hm[1] % 60;
            }
            if (hm[0] >= 24) {
                hm[0] = hm[0] % 24;
            }
            if (hm[0] < 10) {
                hm[0] = "0" + hm[0];
            }
            if (hm[1] < 10) {
                hm[1] = "0" + hm[1];
            }
            $scope.data.times[(key - 1)].value = hm[0] + ":" + hm[1];
        };
        $scope.timeAddStop = function (key) {
            $scope.data.times[(key - 1)].isStop = 0;
        };

        $scope.update = function (messageid) {
            if ($scope.data.isK == '2' || $scope.data.isK == '1') {
                var mes = {
                    boxNumber: $scope.data.boxNumber,
                    isK: $scope.data.isK
                }
                $http.post($state.server + "/appapi/messages/getMessageByBoxAndHole", mes).success(function (message) {
                    var isSave, isDelete = false;
                    if (message == "null") {
                        isSave = true;
                    } else {
                        if (message._id == $scope.data.messageid) {
                            isSave = true;
                        } else if (confirm($translate.instant('largehole'))) {
                            isSave = true;
                            isDelete = true;
                        } else {
                            isSave = false;
                        }
                    }
                    if (isSave) {
                        if (isDelete) {
                            $http.post($state.server + "/appapi/messages/deleteOneMessage", {id: message._id}).success(function (data) {

                            })
                        }
                        updateMessage();
                    }
                })
            } else {
                updateMessage();
            }
        }

        function updateMessage() {
            var data = new Date();
            var month = data.getMonth() + 1 + "";
            var day = data.getDate() + "";
            if (month.length < 2)month = "0" + month;
            if (day.length < 2)day = "0" + day;
            $scope.data.warntime = data.getFullYear() + "-" + month + "-" + day;
            $state.loading = true;
            $scope.data.messageNo = $scope.data.times.length;
            if ($scope.data.isYY == 0) {
                if ($scope.data.type == 0) {
                    if ($scope.data.name == null)$scope.data.name = $translate.instant('medicine');
                    var tixin = $translate.instant('voiceContent') + "(" + $scope.data.name + ")" + $scope.data.meici + " " +
                        "" + $translate.instant('piece');
                } else {
                    if ($scope.data.name == null)
                        $scope.data.name = $translate.instant('remind');
                    var tixin = $translate.instant('remindContent') + $scope.data.content;
                }
                navigator.synthetic.synthetic({code: tixin}, function (data) {
                    var fileURL = "file:" + data;
                    var options = new FileUploadOptions();
                    options.fileKey = "file";
                    options.fileName = fileURL.substr(fileURL.lastIndexOf('/') + 1);
                    options.mimeType = "text/plain";

                    var params = {};
                    params.value1 = $scope.data.boxNumber;
                    params.value2 = 2;
                    options.params = params;
                    var ft = new FileTransfer();
                    var win = function (r) {
                        var data = JSON.parse(r.response);
                        $scope.data.filepath = data.path;
                        $scope.data.time = data.time;
                        console.log($scope.data);
                        $http.post($state.server + "/appapi/messages/updateMessage", $scope.data).success(function (mdata) {
                            $state.loading = false;
                            if ($scope.data.type == 0) {
                                $state.go('alert.yy');
                            } else {
                                $state.go('alert.sh');
                            }
                        });
                    };
                    var fail = function (error) {
                        alert("An error has occurred: Code = " + error.code);
                        alert("upload error source " + error.source);
                        alert("upload error target " + error.target);
                    };
                    ft.upload(fileURL, encodeURI($state.server + "/audioupload"), win, fail, options);
                });
            } else {
                if ($scope.data.filepath != null) {
                    $http.post($state.server + "/appapi/messages/updateMessage", $scope.data).success(function (mdata) {
                        $state.loading = false;
                        if ($scope.data.type == 0) {
                            $state.go('alert.yy');
                        } else {
                            $state.go('alert.sh');
                        }
                    });
                } else {
                    $state.loading = false;
                    alert($translate.instant('remindvoice'));
                }
            }
        }

        //音频
        $scope.showCapture = function () {
            //captureAudio方法成功执行后回调函数
            function captureSuccess(mediaFiles) {
                var i, len;
                for (i = 0, len = mediaFiles.length; i < len; i += 1) {
                    //业务逻辑
                    var my_media = new Media("/lf/" + mediaFiles[i].name,
                        // success callback
                        function () {
                            //      alert("playAudio():Audio Success");
                        },
                        // error callback
                        function (err) {
                            //       alert("playAudio():Audio Error: " + err);
                        });
                    my_media.play();
                    var fileURL = mediaFiles[i].fullPath;
                    var options = new FileUploadOptions();
                    options.fileKey = "file";
                    options.fileName = fileURL.substr(fileURL.lastIndexOf('/') + 1);
                    options.mimeType = "text/plain";

                    var params = {};
                    params.value1 = $scope.data.boxNumber;
                    params.value2 = 1;
                    options.params = params;
                    var ft = new FileTransfer();
                    var win = function (r) {
                        var data = JSON.parse(r.response);
                        $scope.data.filepath = data.path;
                        $scope.data.time = data.time
                    };

                    var fail = function (error) {
                        alert("An error has occurred: Code = " + error.code);
                        alert("upload error source " + error.source);
                        alert("upload error target " + error.target);
                    };
                    ft.upload(fileURL, encodeURI($state.server + "/audioupload"), win, fail, options);

                }
            }

            //captureAudio方法执行失败后回调函数
            function captureError(error) {
                var msg = 'capture 发生错误: ' + error.code;
                navigator.notification.alert(msg, null, 'Uh oh!');
            }

            //录制音频开始
            navigator.device.capture.captureAudio(captureSuccess, captureError, {limit: 1});
        };


    }]);
//添加生活提醒
boxControllers.controller('AlertAddSHCtrl', ['$scope', '$state', '$stateParams', '$timeout', '$http', '$translate', 'socket',
    function ($scope, $state, $stateParams, $timeout, $http, $translate, socket) {
        $state.save = $translate.instant('save');
        $state.infolist = false;
        $state.openInfos = false;
        $state.loading = false;
        $scope.data = {};
        $scope.data.boxNumber = $stateParams.boxNumber;
        $state.title = $translate.instant('alertLife');
        $scope.cishu = [$translate.instant('OnceDay'), $translate.instant('TwiceDay'), $translate.instant('ThriceDay'), $translate.instant('FourDay'), $translate.instant('FiveDay')];
        $scope.cishuNo = 0;
        $scope.yaoliang = [$translate.instant('onepiece'), $translate.instant('twopiece'), $translate.instant('threepiece'), $translate.instant('fourpiece'), $translate.instant('fivepiece'), $translate.instant('sixpiece'), $translate.instant('severpiece')];
        $scope.yaoliangNo = 0;
        $scope.jiange = [$translate.instant('oneday'), $translate.instant('twoday'), $translate.instant('threeday'), $translate.instant('fourday'), $translate.instant('fiveday'), $translate.instant('sixday'), $translate.instant('severday')];
        $scope.jiangeNo = 0;
        $scope.data.type = 1;
        $scope.data["isf"] = 0;
        $scope.data.isK = 0;
        $scope.data.isXZ = 0;
        $scope.data.isYS = 0;
        $scope.data.messageNo = 1;
        $scope.data.times = [];
        $scope.data.meici = 1;
        $scope.data.jiange = 1;
        $scope.data.isYY = 0;
        $scope.data.mtype = 0;
        $scope.data.content = "";
        $scope.ycolor = ['yw_red', 'yw_yellow', 'yw_blue', 'yw_green', 'yw_brown', 'yw_grey'];
        $scope.clickK = function (val) {   //孔，
            $scope.data.isK = val;
        };
        $scope.addTime = function () {
            if ($scope.data.times.length < 8) {
                $scope.data.times.push({
                    "index": $scope.data.times.length + 1,
                    "value": "08:00",
                    "id": "time" + ($scope.data.times.length + 1)

                });
                var opt = {};
                opt.date = {preset: 'date'};
                opt.time = {preset: 'time'};
                var index = $scope.data.times.length;
                var language=$state.language;
                if ($state.language == ""||$state.language ==null) {
                    language = 'zh'
                }
                opt.default = {
                    index: index,
                    theme: 'android-ics light', //皮肤样式
                    display: 'bottom', //显示方式
                    mode: 'scroller', //日期选择模式
                    lang: language,
                    showNow: true,
                    timeWheels: "HHii",
                    timeFormat: 'HH:ii'
                };
                var optTime = $.extend(opt['time'], opt['default']);
                var val = $scope.data.times[index - 1].id;
                //$scope.$apply(function(){
                $timeout(function () {
                    $("#" + val).mobiscroll(optTime).time(optTime);
                }, 0);
            }
        };
        $scope.addTime();
        $scope.clickAdd = function (key, max, callback) {   //加
            if ($scope.data[key] < max)
                $scope.data[key] += 1;
            if (callback)callback();
        };

        $scope.clickDec = function (key, min, callback) {  //减
            if ($scope.data[key] > min) {
                $scope.data[key] -= 1;
                if (callback)callback();
            }
        };
        $scope.deleteTime = function (index) {
            $scope.data.times.splice(index - 1, 1);
        }
        $scope.timeDec = function (key) {  //减
            var time = 200;
            $timeout(decjob, time);
            $scope.data.times[(key - 1)].isStop = 1;
            function decjob() {
                var hm = $scope.data.times[(key - 1)].value;
                var hm = hm.split(":");
                hm[0] = parseInt(hm[0]);
                hm[1] = parseInt(hm[1]) - 15;
                if (hm[1] < 0) {
                    hm[0] = parseInt(hm[0]) - 1;
                    hm[1] = hm[1] + 60;
                }
                if (hm[0] < 0) {
                    hm[0] = hm[0] + 24;
                }
                if (hm[0] < 10) {
                    hm[0] = "0" + hm[0];
                }
                if (hm[1] < 10) {
                    hm[1] = "0" + hm[1];
                }
                $scope.data.times[(key - 1)].value = hm[0] + ":" + hm[1];
                if ($scope.data.times[(key - 1)].isStop == 1) {
                    if (time > 30)time -= 10;
                    $timeout(decjob, time);
                }
            }
        };

        $scope.timeDecStop = function (key) {
            $scope.data.times[(key - 1)].isStop = 0;
        }

        $scope.timeAdd = function (key) {  //增
            var hm = $scope.data.times[(key - 1)].value;
            var hm = hm.split(":");
            hm[1] = parseInt(hm[1]) + 15;
            hm[0] = parseInt(hm[0]);
            if (hm[1] >= 60) {
                hm[0] = parseInt(hm[0]) + 1;
                hm[1] = hm[1] % 60;
            }
            if (hm[0] >= 24) {
                hm[0] = hm[0] % 24;
            }
            if (hm[0] < 10) {
                hm[0] = "0" + hm[0];
            }
            if (hm[1] < 10) {
                hm[1] = "0" + hm[1];
            }
            $scope.data.times[(key - 1)].value = hm[0] + ":" + hm[1];
        };
        $scope.timeAddStop = function (key) {
            $scope.data.times[(key + 1)].isStop = 0;
        };

        $scope.mesSave = function (key) {
            $scope.data.messageNo = $scope.data.times.length;
            $state.loading = true;
            if ($scope.data.isYY == 0) {
                var content;
                if ($scope.data.name == null) {
                    $scope.data.name = $translate.instant('remind');
                }
                content = $translate.instant('remindTitle');
                var tixin = $translate.instant('remindContent') + content;
                navigator.synthetic.synthetic({code: tixin}, function (data) {
                    var fileURL = "file:" + data;
                    var options = new FileUploadOptions();
                    options.fileKey = "file";
                    options.fileName = fileURL.substr(fileURL.lastIndexOf('/') + 1);
                    options.mimeType = "text/plain";

                    var params = {};
                    params.value1 = $scope.data.boxNumber;
                    params.value2 = 2;
                    options.params = params;
                    var ft = new FileTransfer();
                    var win = function (r) {
                        var data = JSON.parse(r.response);
                        $scope.data.filepath = data.path;
                        $scope.data.time = data.time;
                        $http.post($state.server + "/appapi/messages/saveMes", $scope.data).success(function (mdata) {
                            $state.loading = false;
                            $state.go('alert.sh');
                        });
                    };

                    var fail = function (error) {
                        alert("An error has occurred: Code = " + error.code);
                        alert("upload error source " + error.source);
                        alert("upload error target " + error.target);
                    };
                    ft.upload(fileURL, encodeURI($state.server + "/audioupload"), win, fail, options);
                });
            } else {
                if ($scope.data.filepath != null) {
                    if ($scope.data.name == null)
                        $scope.data.name = $translate.instant('remind');
                    $http.post($state.server + "/appapi/messages/saveMes", $scope.data).success(function (mdata) {
                        socket.emit("alertJoin", mdata);
                        $state.loading = false;
                        $state.go('alert.sh');
                    });
                } else {
                    $state.loading = false;
                    alert($translate.instant('remindvoice'));
                }
            }
        };


        //音频
        $scope.showCapture = function () {
            //captureAudio方法成功执行后回调函数
            function captureSuccess(mediaFiles) {
                var i, len;
                for (i = 0, len = mediaFiles.length; i < len; i += 1) {
                    //业务逻辑
                    var my_media = new Media("/lf/" + mediaFiles[i].name,
                        // success callback
                        function () {
                            //      alert("playAudio():Audio Success");
                        },
                        // error callback
                        function (err) {
                            //       alert("playAudio():Audio Error: " + err);
                        });
                    my_media.play();
                    var fileURL = mediaFiles[i].fullPath;
                    var options = new FileUploadOptions();
                    options.fileKey = "file";
                    options.fileName = fileURL.substr(fileURL.lastIndexOf('/') + 1);
                    options.mimeType = "text/plain";

                    var params = {};
                    params.value1 = $scope.data.boxNumber;

                    options.params = params;

                    var ft = new FileTransfer();
                    var win = function (r) {
                        var data = JSON.stringify(r.response);
                        $scope.data.filepath = data.path;
                        $scope.data.time = data.time
                    };

                    var fail = function (error) {
                        alert("An error has occurred: Code = " + error.code);
                        alert("upload error source " + error.source);
                        alert("upload error target " + error.target);
                    };
                    ft.upload(fileURL, encodeURI($state.server + "/audioupload"), win, fail, options);

                }
            }

            //captureAudio方法执行失败后回调函数
            function captureError(error) {
                var msg = 'capture 发生错误: ' + error.code;
                navigator.notification.alert(msg, null, 'Uh oh!');
            }

            //录制音频开始

            navigator.device.capture.captureAudio(captureSuccess, captureError, {limit: 1});

        }
    }]);


//选择盒子样式
boxControllers.controller('BoxCheck', ['$scope', '$state', '$translate',
    function ($scope, $state, $translate) {
        $state.infolist = false;
        $state.openInfos = false;
        $scope.img = "images/boxcheck.png";
        //var cacheEngine = $cacheFactory("list");
        $state.title = $translate.instant('boxTitle');
        if ($state.user) {
            if ($state.user.boxtime == 0) {
                $state.showone = true;
                //$state.openInfos=true;
            }
            $scope.boxs1 = {display: ""};
            $scope.boxs2 = {display: "none"};
            $scope.boxs3 = {display: "none"};
            $scope.boxs4 = {display: "none"};
            $scope.boxs = function (name) {
                $scope.boxs1 = {display: "none"};
                $scope.boxs2 = {display: "none"};
                $scope.boxs3 = {display: "none"};
                $scope.boxs4 = {display: "none"};
                if (name == 1) {
                    $state.boximage = "images/box_01.png";
                    $state.bimage = "images/initialization.png";
                    //cacheEngine.put('list','images/initialization.png');
                    $scope.boxs1 = {display: ""};
                } else if (name == 2) {
                    $state.boximage = "images/box_02.png";
                    $state.bimage = "images/initialization-blue.png";
                    //cacheEngine.put('list','images/initialization-blue.png');
                    $scope.boxs2 = {display: ""};
                } else if (name == 3) {
                    $state.boximage = "images/box_03.png";
                    $state.bimage = "images/initialization-orange.png";
                    //cacheEngine.put('list','images/initialization-orange.png');
                    $scope.boxs3 = {display: ""};
                } else if (name == 4) {
                    $state.boximage = "images/box_04.png";
                    $state.bimage = "images/initialization-yellow.png";
                    //cacheEngine.put('list','images/initialization-yellow.png');
                    $scope.boxs4 = {display: ""};
                }
            };
        } else {
            $state.go("login");
        }
        //if(cacheEngine!=null){
        //      $scope.image=cacheEngine.get('list');
        //   }else{
        //      $scope.image="images/initialization.png";
        //  }
        //cacheEngine.destroy();
    }
]);   //更多

//选择盒子样式
boxControllers.controller('TitBox', ['$scope', '$state', '$translate',
    function ($scope, $state, $translate) {
        $scope.title = $translate.instant('boxTitle');
        $scope.yqtit = {display: "none"};
        $scope.mask1 = {display: "none"};
        $scope.usetit = function (name) {
            $scope.yqtit = {display: "block"};
            $scope.mask1 = {display: "block"};
        };
        $scope.nouse = function (name) {
            $scope.yqtit = {display: "none"};
            $scope.mask1 = {display: "none"};
        };

    }
]);

//盒子对应的使用情况
boxControllers.controller('WatchInfo', ['$scope', '$state', '$http', '$stateParams', '$translate',
    function ($scope, $state, $http, $stateParams, $translate) {
        var boxnumber = $stateParams.number;
        if(localStorage.getItem(boxnumber)!=null&&localStorage.getItem(boxnumber)!="undefined"){
            var box=localStorage.getItem(boxnumber);
            $state.boxid = boxnumber;
            $scope.boxname = box.name;
            $scope.img = box.image;
            $scope.percent = box.percent;
            $scope.filepath = $state.server + box.filepath;
            $scope.number = box.number;
        }
        $http.post($state.server + "/appapi/boxes/getOne", {boxid: boxnumber}).success(function (udata) {
            $state.boxid = boxnumber;
            $scope.boxname = udata.name;
            $scope.img = udata.image;
            $scope.percent = udata.percent;
            $scope.filepath = $state.server + udata.filepath;
            $scope.number = udata.number;
            if ($scope.percent > 50 && $scope.percent < 100) {
                $scope.right = {transform: "rotate(0deg)"};
                $scope.left = {transform: "rotate(-" + (180 - 180 / 50 * ($scope.percent - 50)) + "deg)"};
            } else {
                if($scope.percent==100){
                    $scope.right = {transform: "rotate(0deg)"};
                    $scope.left = {transform: "rotate(0deg)"};
                }else{
                    $scope.right = {transform: "rotate(-" + 180 / 50 * (50 - $scope.percent) + "deg)"};
                    $scope.left = {transform: "rotate(-180deg)"};
                }

            }
        });
        $scope.ycolor = ['yw_red', 'yw_yellow', 'yw_blue', 'yw_green', 'yw_brown', 'yw_grey'];
        $http.post($state.server + "/appapi/messages/getListByType", {
            boxnumber: boxnumber,
            type: 0
        }).success(function (udata) {
            $scope.messages = udata;
        });

        $scope.today = function () { // 创建一个方法，
            $scope.dt = {'boxnumber':boxnumber,server:$state.server};
        };
        $scope.today(); // 运行today方法
        $scope.disabled = function (date, mode) {
            return (mode === 'day' && (date.getDay() === 0 || date.getDay() === 6))
        };
        $scope.toggleMin = function () {
            var date = new Date();
            var month = date.getMonth() + 1 + "";
            var day = 1 + "";
            if (month.length < 2)month = "0" + month;
            if (day.length < 2)day = "0" + day;
            var newday = date.getFullYear() + "-" + month + "-" + day;
            $scope.minDate = $scope.minDate ? null : newday; //3元表达式，没啥好说的
        };
        $scope.toggleMin();
        $scope.dateOptions = {
            formatYear: 'yy',
            startingDay: 1
        };
        $scope.formats = ['dd-MMMM-yyyy', 'yyy/MM/dd', 'dd.MM.yyyy', 'shortDate']; //日期显示格式
        $scope.format = $scope.formats[0];  // 将formats的第0项设为默认显示格式
        $scope.openInfo = function () {
            $state.openInfos = true;
        }
        $state.title = $translate.instant("boxTitle");
    }
]);
//盒子对应的使用情况
boxControllers.controller('EditInfo', ['$scope', '$state', '$http', '$stateParams', '$translate',
    function ($scope, $state, $http, $stateParams, $translate) {
        var boxnumber = $stateParams.number;
        if(localStorage.getItem(boxnumber)!=null&&localStorage.getItem(boxnumber)!="undefined"){
            var box=localStorage.getItem(boxnumber);
            $state.boxid = box._id;
            $state.boxname = box.name;
            $state.number = box.number;
            $scope.img = box.image;
            $scope.filepath = $state.server + box.filepath;
            $scope.number = box.number;
        }
        $http.post($state.server + "/appapi/boxes/getOne", {boxid: boxnumber}).success(function (udata) {
            $state.boxid = udata._id;
            $state.boxname = udata.name;
            $state.number = udata.number;
            $scope.img = udata.image;
            $scope.filepath = $state.server + udata.filepath;
            $scope.number = udata.number;
        });
        $state.title = $translate.instant("boxTitle");
    }
]);

//进入设置
boxControllers.controller('SetCtrl', ['$scope', '$state', '$translate',
    function ($scope, $state, $translate) {
        $translate.use($state.language);
        $state.loading = false;
        if ($state.setctrl != null)document.body.scrollTop = $state.setctrl;
        $scope.mes = [{s: 2}, {s: 2}, {s: 2}, {s: 2}, {s: 2}, {s: 2}, {s: 2}, {s: 2}, {s: 2}, {s: 2}];
        $state.infolist = false;
        $state.openInfos = false;
        $state.title = $translate.instant('settingTitle');
        if ($state.user) {
            var obj = {
                userid: $state.user._id
            };
            $scope.setMenu = function (name) {
                $(".contact").addClass("ller");
                //$scope.$broadcast("CtrlName", name);
                $scope.$emit("CtrlName", name);
                $state.go(name);
            }
        } else {
            $state.go('login');
        }
    }
]);   //更多
//用户信息
boxControllers.controller('UserCtrl', ['$scope', '$state', '$http', 'socket', '$translate',
    function ($scope, $state, $http, socket, $translate) {
        $state.loading = false;
        $state.setctrl = document.body.scrollTop;
        $state.title = $translate.instant('userTitle');
        $state.save = $translate.instant('save');
        if ($state.user) {
            $scope.data = {};
            $scope.data._id = $state.user._id;
            $scope.data.name = $state.user.name;
            $scope.data.sex = $state.user.sex;
            $scope.data.age = $state.user.age;
            $scope.data.weixin = $state.user.weixin ? $state.user.weixin : "";
            $scope.data.username = $state.user.username;
            $scope.data.area = $state.user.area;
            $scope.data.language = $state.user.language;
            $scope.data.openid = $state.user.openid ? $state.user.openid : "";
            $scope.data.image = $state.user.image;
            $scope.data.volume = $state.user.volume;
            var obj = {
                userid: $state.user._id
            };
            $http.post($state.server + "/appapi/nobilitys/getUsername", obj).success(function (udata) {
                $scope.data._id = udata._id;
                $scope.data.name = udata.name;
                $scope.data.sex = udata.sex;
                $scope.data.age = udata.age;
                $scope.data.weixin = udata.weixin ? udata.weixin : "";
                $scope.data.username = udata.username;
                $scope.data.area = udata.area;
                $scope.data.language = udata.language;
                $scope.data.openid = udata.openid ? udata.openid : "";
                $scope.data.image = udata.image;
                $scope.data.volume = udata.volume;
            });
            $scope.layout = function () {
                socket.emit('deleteUser', $state.user._id);
                localStorage.setItem('username', null);
                localStorage.setItem('openid', null);
                localStorage.setItem('userid', null);
                localStorage.setItem('user', null);
                $state.username = "";
                $state.user = "";
                $state.openid = "";
                $state.userid = "";
                $state.lastboxid = "";
                $state.go("login");
            };

            $scope.changeBirthday = function () {
                var opt = {};
                opt.date = {preset: 'date'};
                var currYear = (new Date()).getFullYear();
                //opt.time = {preset: 'time'};
                var language=$state.language;
                if ($state.language == ""||$state.language ==null) {
                    language = 'zh'
                }
                opt.default = {
                    theme: 'android-ics light', //皮肤样式
                    display: 'bottom', //显示方式
                    mode: 'scroller', //日期选择模式
                    lang: language,
                    showNow: true,
                    dateFormat: 'yyyy-mm-dd',
                    dateOrder: 'yymmdd',
                    startYear: currYear - 120, //开始年份
                    endYear: currYear //结束年份

                };
                var optTime = $.extend(opt['date'], opt['default']);
                //$scope.$apply(function(){
                setTimeout(function () {
                    $("#time").mobiscroll(optTime);
                    //$("#time").mobiscroll(optTime).time(optTime);
                }, 0);
            };
            $scope.changeBirthday();
            //$scope.$watch('data.age',function(){
            //    var re = /^[0-9]*[1-9][0-9]*$/
            //    if(!re.test(s)){
            //        alert($translate.instant(''))
            //    }
            //})
            $scope.$on('userUpdate', function (e, d) {
                $state.loading = true;
                $scope.data._id = $state.user._id;
                $http.post($state.server + "/appapi/nobilitys/updateNobility", $scope.data).success(function (mdata) {
                    localStorage.setItem("user", JSON.stringify(mdata));
                    $state.userjson = mdata;
                    $state.loading = false;
                    $state.go('setting');
                });
            })
            //$scope.clickAdd = function (key, max) {   //加
            //    if ($scope.data[key] < max)
            //        $scope.data[key] += 1;
            //}
            //$scope.clickDec = function (key, min) {  //减
            //    if ($scope.data[key] > min) {
            //        $scope.data[key] -= 1;
            //    }
            //}

            //绑定微信，实际上就是微信登陆，将手机的uuid跟微信账号绑定
            $scope.wxlogin = function () {
                navigator.plugin_wxlogin.plugin_wxlogin({code: ""}, function (data) {
                    $scope.data = {};
                    $scope.data.phoneuuid = $state.phoneuuid;
                    $scope.data.username = "";
                    $scope.data.weixin = data.nickname;
                    $scope.data.openid = data.openid;
                    $scope.data.name = data.nickname;
                    $scope.data.area = data.country + "  " + data.city;
                    $scope.data.language = data.language;
                    $scope.data.sex = data.sex;
                    $scope.data.image = data.headimgurl;
                    $scope.data.unionid = data.unionid;
                    $http.post($state.server + "/appapi/nobilitys/BandWeixin", $scope.data).success(function (data) {
                        if (dara == "error") {
                            alert($translate.instant("WXBound"));
                        }
                        //用户表示存在用户，并且更新成功,
                        if (data != null && data != "") {
                            $state.openid = data.openid;
                            //localStorage.setItem('user',data);
                            localStorage.setItem('openid', data.openid);
                            localStorage.setItem("user", JSON.stringify(data));
                            localStorage.setItem('userid', data._id);
                            socket.emit('userlogin', data._id);
                            $state.go('home');
                        } else {
                            $state.go('login');
                        }

                    }).error(function (err) {
                        $state.go('login');
                    })

                })
            }

            //var telReg;
            //var emailReg;
            //var filter = /[\w!#$%&'*+/=?^_`{|}~-]+(?:\.[\w!#$%&'*+/=?^_`{|}~-]+)*@(?:[\w](?:[\w-]*[\w])?\.)+[\w](?:[\w-]*[\w])?/;
            ////验证用户名是否为手机号或者邮箱
            //$scope.$watch('data.username', function () {
            //    if ($scope.data.username != "") {
            //           telReg = !!$scope.data.username.match(/^(0|86|17951)?(13[0-9]|15[0-9]|17[678]|18[0-9]|14[57])[0-9]{8}$/);
            //           emailReg = filter.test($scope.data.username);
            //           if (telReg == false && emailReg == false) {
            //               $scope.color={border:'1px soide red'};
            //           }
            //       }
            //    })
            //$scope.selectAge=function(){
            //    $state.infolist=true;
            //    $('#age-select').animate({'bottom':'0em'},300);
            //    $scope.titleName="年龄";
            //    setTimeout(function(){
            //        var el, li, i,number;
            //        el=document.getElementById('swiper-slide');
            //        number=el.getElementsByTagName("li").length?el.getElementsByTagName("li").length:0;
            //        for(var m=0;m<number;m++){
            //            el.removeChild(el.childNodes[0]);
            //        }
            //        for(i=100;i>0;i--){
            //            li = document.createElement('li');
            //            li.style.height="200px";
            //            li.innerText=i+"";
            //            el.insertBefore(li, el.childNodes[0]);
            //        }
            //    },1000);
            //    mySwiper1.reInit();
            //    mySwiper1.params.onlyExternal=false;
            //    console.log(mySwiper1.height);
            //}
        }
        else {
            $state.go('login');
        }
    }
]);
//系统设置
boxControllers.controller('SystemCtrl', ['$scope', '$state', '$http', '$translate',
    function ($scope, $state, $http, $translate) {
        $state.loading = false;
        if ($state.user) {
            $scope.data = {};
            $scope.data._id = $state.user._id;
            $scope.data.name = $state.user.name;
            $scope.data.sex = $state.user.sex;
            $scope.data.age = $state.user.age ? $state.user.age : "";
            $scope.data.weixin = $state.user.weixin ? $state.user.weixin : "";
            $scope.data.username = $state.user.username;
            $scope.data.area = $state.user.area;
            $scope.data.language = $state.user.language;
            $scope.data.openid = $state.user.openid ? $state.user.openid : "";
            $scope.data.image = $state.user.image;
            $scope.data.volume = $state.user.volume;
            if ($scope.data.volume == "undefined") {
                $scope.data.volume = 8;
            }
            var obj = {
                userid: $state.user._id
            };
            $http.post($state.server + "/appapi/nobilitys/getUsername", obj).success(function (udata) {
                $scope.data._id = udata._id;
                $scope.data.name = udata.name;
                $scope.data.sex = udata.sex;
                $scope.data.age = udata.age ? udata.age : "";
                $scope.data.weixin = udata.weixin ? udata.weixin : "";
                $scope.data.username = udata.username;
                $scope.data.area = udata.area;
                $scope.data.language = udata.language;
                $scope.data.openid = udata.openid ? udata.openid : "";
                $scope.data.image = udata.image;
                $scope.data.volume = udata.volume;
                if ($scope.data.volume == "undefined") {
                    $scope.data.volume = 8;
                }
            });
            $scope.clickAdd = function (key, max) {   //加
                if ($scope.data[key] < max)
                    $scope.data[key] += 1;
            }
            $scope.clickDec = function (key, min) {  //减
                if ($scope.data[key] > min) {
                    $scope.data[key] -= 1;
                }
            }
            $scope.$watch('data.language', function () {
                $translate.use($scope.data.language);
                $state.title = $translate.instant('systemTitle');
                $state.save = $translate.instant('save');
            })
            $scope.$on('systemUpdate', function (e, d) {
                $state.loading = true;
                $scope.data._id = $state.user._id;
                $state.language = $scope.data.language;
                //alert($scope.data.language);
                $http.post($state.server + "/appapi/nobilitys/updateNobility", $scope.data).success(function (mdata) {
                    $state.loading = false;
                    localStorage.setItem("user", JSON.stringify(mdata));
                    localStorage.setItem("language", $state.language);
                    $state.go('setting');
                });
            })
        } else {
            $state.go('login');
        }
        $state.title = $translate.instant('systemTitle');
        $state.save = $translate.instant('save');
    }
]);
//box商城
boxControllers.controller('BoxMallCtrl', ['$scope', '$state', '$http', '$translate',
    function ($scope, $state, $http, $translate) {
        $state.loading = false;
        $state.setctrl = document.body.scrollTop;
        $state.title = $translate.instant('vvboxsMall');
        if ($state.user) {
            var obj = {
                userid: $state.user._id
            };
        }
        else {
            $state.go('login');
        }
    }
]);
//关于我们
boxControllers.controller('AboutUsCtrl', ['$scope', '$state', '$http', '$translate',
    function ($scope, $state, $http, $translate) {
        $state.setctrl = document.body.scrollTop;
        $state.loading = false;
        $state.title = $translate.instant('aboutus');
        if ($state.user) {
            var obj = {
                userid: $state.user._id
            };
        }
        else {
            $state.go('login');
        }

    }
]);
//意见反馈
boxControllers.controller('FeedbackCtrl', ['$scope', '$state', '$http', '$translate',
    function ($scope, $state, $http, $translate) {
        $state.setctrl = document.body.scrollTop;
        $state.title = $translate.instant('feedback');
        if ($state.user) {
            var obj = {
                userid: $state.user._id
            };
        }
        else {
            $state.go('login');
        }
    }
]);

//添加新的药盒

boxControllers.controller('addbox', ['$scope', '$stateParams', '$state', '$translate',
    function ($scope, $stateParams, $state, $translate) {
        //$state.go("addbox",{type:0})
        //type代表是否已经有盒子,如果没有则输入0，有为1
        $state.title = $translate.instant('addBox');

        $(".contact").addClass("ller");
    }
]);


//连接盒子的wifi Ti
boxControllers.controller('WIFI2Ctrl', ['$scope', '$state', '$interval', '$translate',
    function ($scope, $state, $interval, $translate) {
        $state.title = $translate.instant('boxTitle');
        $state.showwifi1 = false;
        var height=window.innerHeight;
        if ($state.user) {
            if ($state.user.boxtime == 0) {
                $state.showwifi2 = true;
                //$state.openInfos=true;
            }
            $scope.wifissid = "";
            var var_1 = $interval(function () {
                navigator.smartconfigweb.wifiname({}, function (data) {
                    $scope.wifissid = data;
                });
            }, 500);

            $scope.connectWifi = function () {
                $interval.cancel(var_1);
                if(height!=window.innerHeight){
                    var xxx=setInterval(function () {
                        if (height==window.innerHeight) {
                            clearInterval(xxx);
                            setTimeout(function () {
                                $state.go("wifi3");
                                navigator.smartconfigweb.smartconfigweb({
                                    ssid: $scope.wifissid,
                                    password: $state.wifipassword,
                                    server: $state.server,
                                    serverpcb: $state.serverpcb
                                }, function (data) {

                                })
                            }, 500)
                        }
                    }, 500);
                }else{
                    setTimeout(function () {
                        $state.go("wifi3");
                        navigator.smartconfigweb.smartconfigweb({
                            ssid: $scope.wifissid,
                            password: $state.wifipassword,
                            server: $state.server,
                            serverpcb: $state.serverpcb
                        }, function (data) {

                        })
                    }, 500)
                }



            }
        }
    }
]);

//等待连接完成
boxControllers.controller('WIFI3Ctrl', ['$scope', '$state', '$interval', '$translate',
    function ($scope, $state, $interval, $translate) {
        var ssindex = 0;
        $scope.ssdian = ".";
        $state.title = $translate.instant('boxTitle');
        $state.showwifi2 = false;
        var boxfound = setInterval(function () {
            navigator.smartconfigweb.getBoxNumber({}, function (data) {   //获取盒子的number/mac
                if (data == "") {    //尚未获取到设备数据
                    $scope.$apply(function () {
                        $scope.ssdian += ".";
                    })

                    ssindex += 1;
                    if (ssindex == 60) {
                        //没有搜到设备跳转到失败页面
                        clearInterval(boxfound);
                        $state.go("wifi4");
                    }
                } else {
                    clearInterval(boxfound);    //搜索到以后跳转到成功页面
                    $state.newboxNumber = data;
                    $state.go("wifi5");
                }
            })
        }, 1000);
    }
]);

//连接已完成
boxControllers.controller('WIFI5Ctrl', ['$scope', '$stateParams', '$state', '$interval', '$translate', 'socket',
    function ($scope, $stateParams, $state, $interval, $translate, socket) {
        $scope.boxNumber = $state.newboxNumber;
        $state.title = $translate.instant('boxTitle');
        $state.showwifi4 = false;
        if ($state.user) {
            if ($state.user.boxtime == 0) {
                $state.showwifi5 = true;
            }
            cordova.plugins.barcodeScanner.encode(
                "TEXT_TYPE",
                $scope.boxNumber,
                $scope.boxNumber,
                function (success) {
                    $scope.$apply(function () {
                        $scope.touxiang = success.file;
                    });
                    // alert("encode success: " + success);
                }, function (fail) {
                    alert("encoding failed: " + fail);
                }
            );

            $scope.savebox = function () {
                var fileURL = $scope.touxiang;
                var options = new FileUploadOptions();
                options.fileKey = "file";
                options.fileName = fileURL.substr(fileURL.lastIndexOf('/') + 1);
                options.mimeType = "text/plain";

                var params = {};
                params.boxNumber = $scope.boxNumber;
                params.name = $scope.name;
                params.nobility = $state.user._id;
                params.image = $state.boximage;
                options.params = params;

                var ft = new FileTransfer();
                var win = function (r) {
                    var data = JSON.parse(r.response);
                    var boxnumbers = [];
                    boxnumbers.push(params.boxNumber);
                    socket.emit("updatedevice", {boxNumbers: boxnumbers, name: $state.phoneuuid});
                    $state.go('home');

                };

                var fail = function (error) {
                    alert("An error has occurred: Code = " + error.code);
                    alert("upload error source " + error.source);
                    alert("upload error target " + error.target);
                };
                ft.upload(fileURL, encodeURI($state.server + "/appapi/boxes/savebox"), win, fail, options);
            }
        } else {
            $state.go("login")
        }
    }
]);