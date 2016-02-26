/**
 * Created by lifeng on 15/4/17.
 */
/* Controllers */
var boxControllersios = angular.module('boxControllersios', [
    'ui.router'
]);


/**
 *
 * @param 盒子列表页面 显示盒子字体的个数，10个字符
 * @returns {*}
 */
function subtitle(titles) {
    if (titles == null)return '';
    else {
        var len = 0;
        for (var i = 0; i < titles.length; i++) {
            var c = titles.charCodeAt(i);
            //单字节加1
            if ((c >= 0x0001 && c <= 0x007e) || (0xff60 <= c && c <= 0xff9f)) {
                len++;
            }
            else {
                len += 2;
            }
            if (len > 10) {
                return titles.substring(0, i) + "..";
            }
        }
        return titles;
    }
}

//页面最外层的方法 可指定头部 和菜单里的事件
boxControllersios.controller('IndexCtrl', ['$scope', '$state', '$http', 'socket', '$translate',
    function ($scope, $state, $http, socket, $translate,aa) {
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
        if (!$state.messageTime) {
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
            $state.bd = false;
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
        //weixin扫一扫功能
        $scope.openScan=function(){
            //调起微信扫一扫接口
            wx.scanQRCode({
                needResult: 1, // 默认为0，扫描结果由微信处理，1则直接返回扫描结果，
                scanType: ["qrCode","barCode"], // 可以指定扫二维码还是一维码，默认二者都有
                success: function (res) {
                    var result = res.resultStr; // 当needResult 为 1 时，扫码返回的结果
                    if (result!= null && result.length == 12) {
                        $http.post($state.server + "/appapi/boxes/getOneAndBind", {
                            userid: $state.user._id,
                            number: result
                        }).success(function (udata) {
                            if (udata.type == 0) {
                                if($state.current.name=="home"){
                                    $http.post($state.server + "/appapi/boxes/getOne", {boxid: result}).success(function (data) {
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
                    } else if (result.text != null) {
                        alert($translate.instant('Invitationwrong'));
                    }
                }
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
            $state.useincod = true;
            $state.infolist3 = true;
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
                            alert($translate.instant("boxTitle"));
                        }
                    })
                }
            } else {
                $state.go('Info', {number: $state.number});
            }

        }


    }]);


//登录页面
boxControllersios.controller('LoginCtrl', ['$scope', '$state', '$http', 'socket', '$translate',
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

        $state.title=$translate.instant('loginTitle');
    }]);


//Home页面
boxControllersios.controller('HomeCtrl', ['$scope', '$state', '$http', '$translate', 'socket',
    function ($scope, $state, $http, $translate, socket) {
        //关闭遮罩层
        $scope.closeDetail2 = function () {
            $state.infolist2 = false;
            $state.mlist = false;
        };

        $state.mlist = false;

        $translate.use($state.language);
        $state.openInfos = false;
        $scope.type = true;
        $state.loading = false;
        //设置翻译
        $state.title = $translate.instant('boxTitle');
        //判断是否有用户
        if (!$state.user||$state.user._id==null) {
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

            if ($state.phoneuuid) {
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
            } else {
                $state.go("login");
            }
        } else {
            homeindex();
        }
        /*
         *首页面
         */
        function homeindex() {
            $state.infolist2 = false;
            $state.openInfos2 = false;
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

            // /**
            //  * 查询附近是否有新盒子 有就提醒用户绑定
            //  */
            // $http.post($state.server + "/appapi/boxes/getBoxNoBd", {}).success(function (data) {

            //     alert(data.length);
            //     alert(data);
            // });

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
                        var datex = new Date(date2 + "T" + x.time);
                        var datey = new Date(date2 + "T" + y.time);
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
                            var name = subtitle(boxm.name);
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
                                    lastTime = new Date(date2 + "T" + messagesort[sum - 1].time);
                                    firstTime = new Date(date2 + "T" + messagesort[0].time);
                                    linesize = (sum - 1) * 20;
                                    if (nowTime >= lastTime) {
                                        linewidth = 100;
                                        slidenum = sum - 1;
                                    } else {
                                        for (var st = 0; st < sum; st++) {
                                            var ctime = new Date(date2 + "T" + messagesort[st].time);
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
                    localStorage.removeItem('homeboxs');
                    $state.homeboxs = null;
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
              $state.infolist2 = true;
            $state.mlist = true;
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
            $state.infolist2 = false;
            $state.mlist = false;
        };
        $scope.$on('showinfo', function (e, number) {
            $state.go('Info', {number: number});
        });
//weixin发送即时录音消息
        $scope.data = {};
        $scope.showCapture = function ($event, boxNumber) {

        };
    }
]);



//添加用药提醒
boxControllersios.controller('AlertAddYYCtrl', ['$scope', '$state', '$stateParams', '$timeout', '$http', '$translate', 'socket',
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
                    if ($state.language ==null || $state.language == "") {
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
            //weixinok调用语音合成插件
            function saveMessage(){
                $scope.data.messageNo=$scope.data.times.length;
                $state.loading = true;
                if ($scope.data.isYY == 0) {
                    if ($scope.data.name == null)
                        $scope.data.name = $translate.instant('medicine');
                    var fan = $translate.instant('beforemeals');
                    if ($scope.data.isf == 1) {
                        fan = $translate.instant('therice');
                    } else if ($scope.data.isf == 2) {
                        fan = $translate.instant('afterdinner');
                    }
                    fan = fan + $translate.instant('fuyong');
                    //提醒文字
                    var tixin =$translate.instant('voiceContent') +"("+fan+ $scope.data.name+")"+ $scope.data.meici + $translate.instant('piece') ;
                    $scope.data.txt = tixin;
                    $http.post($state.server + "/appapi/messages/wxsaveMes", $scope.data).success(function (mdata) {
                        $state.loading = false;
                        $state.go('alert.yy');


                    });
                } else {
                    if ($scope.data.filepath != null) {
                        if ($scope.data.name == null)
                            $scope.data.name = $translate.instant('medicine');
                        $http.post($state.server + "/appapi/messages/saveMes", $scope.data).success(function (mdata) {
                            $state.loading = false;
                            $state.go('alert.yy');
                        });
                    } else {
                        $state.loading = false;
                        alert($translate.instant('remindvoice'));
                    }
                }
            }
            //weixin音频
            $scope.showCapture = function () {
            }
        } else {
            $state.go("login");
        }
    }]);

//添加生活提醒
boxControllersios.controller('AlertAddSHCtrl', ['$scope', '$state', '$stateParams', '$timeout', '$http', '$translate', 'socket',
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
//ios音频合成上传
        $scope.mesSave=function(key){
            $scope.data.messageNo=$scope.data.times.length;
            $state.loading=true;
            if($scope.data.isYY==0){
                var content;
                if($scope.data.name==null){
                    $scope.data.name=$translate.instant('remind');
                }
                content=$translate.instant('remindTitle');
                var tixin=$translate.instant('remindContent')+content+ ":" + $scope.data.content;
                $scope.data.txt = tixin;
                $http.post($state.server + "/appapi/messages/wxsaveMes", $scope.data).success(function (mdata) {
                    $state.loading=false;
                    $state.go('alert.sh');
                });
            }else{
                if($scope.data.filepath!=null){
                    if($scope.data.name==null)
                        $scope.data.name=$translate.instant('remind');
                    $http.post($state.server+"/appapi/messages/saveMes",$scope.data).success(function(mdata) {
                        $state.loading=false;
                        $state.go('alert.sh');
                    });
                }else{
                    $state.loading=false;
                    alert($translate.instant('remindvoice'));
                }
            }
        };
        //weixin音频
        $scope.showCapture=function(){

        }
    }]);



//编辑用药信息
boxControllersios.controller('EditDetail', ['$scope', '$state', '$stateParams', '$timeout', '$http', '$translate',
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
            $scope.data.content = mdata.content?mdata.content:"";
            $scope.data.time = mdata.time;
            $scope.data.times = [];
            for (var i = 0; i < mdata.messageTime.length; i++) {
                $scope.data.times.push({"index": i + 1, "value": mdata.messageTime[i], "id": "time" + (i + 1)});
                $scope.hadTime();
            }
            $scope.data.isYY = 0;
            $scope.data.filepath ="";
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
//weixin音频合成
        function updateMessage(){
            var data = new Date();
            var month = data.getMonth() + 1 + "";
            var day = data.getDate() + "";
            if (month.length < 2)month = "0" + month;
            if (day.length < 2)day = "0" + day;
            $scope.data.warntime = data.getFullYear() + "-" + month + "-" + day;
            $state.loading = true;
            $scope.data.messageNo = $scope.data.times.length;
            if ($scope.data.type == 0) {
                if ($scope.data.name == null)$scope.data.name = $translate.instant('medicine');
            } else {
                if ($scope.data.name == null)$scope.data.name = $translate.instant('remind');
            }
            $scope.data.nobility=$state.user._id;
            if ($scope.data.isYY == 0) {
            	var tixin = "";
                if ($scope.data.type == 0) {
                    if ($scope.data.name == null)$scope.data.name = $translate.instant('medicine');
                    var fan = $translate.instant('beforemeals');
                    if ($scope.data.isf == 1) {
                        fan = $translate.instant('therice');
                    } else if ($scope.data.isf == 2) {
                        fan = $translate.instant('afterdinner');
                    }
                    fan = fan + $translate.instant('fuyong');
                    tixin = $translate.instant('voiceContent') + "(" + fan + $scope.data.name + ")" + $scope.data.meici + $translate.instant('piece');

                } else {
                    content = $translate.instant('remindTitle');
                    tixin = $translate.instant('remindContent') + content + ":" + $scope.data.content;
                }
                $scope.data.txt=tixin;
                $http.post($state.server + "/appapi/messages/updatewxMessage", $scope.data).success(function (mdata) {
                    $state.loading = false;
                    if ($scope.data.type == 0) {
                        $state.go('alert.yy');
                    } else {
                        $state.go('alert.sh');
                    }
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
    //weixin音频
    $scope.showCapture=function(){

    };

}]);

boxControllersios.controller('WIFI1Ctrl', ['$scope', '$state', '$interval', '$stateParams', '$translate',
    function ($scope, $state, $http, $interval, $stateParams, $translate) {
        //关闭遮罩层
        $scope.closeDetail3 = function () {
            $state.infolist3 = false;
            $state.useincod = false;
        };
        $state.infolist3 = false;
        $state.useincod = false;
        $state.showone = false;
        $scope.image = $state.bimage;
        //$scope.img="images/boxcheck.png";
        if ($state.user) {
            if ($state.user.boxtime == 0) {
                $state.showwifi1 = true;
                //$state.openInfos=true;
            }
            $state.wifi = 'addbox';
            $scope.yq = {}
            $scope.yq.tit = "";
            $scope.linktit = function () {
                if ($scope.yq.tit != null && $scope.yq.tit.length == 12) {
                    var Invitation = $scope.yq.tit.toLowerCase();
                    $http.post($state.server + "/appapi/boxes/getOneAndBind", {
                        userid: $state.user._id,
                        number: Invitation
                    }).success(function (udata) {
                        if (udata.type == 0) {
                            $scope.error = $translate.instant('Successful');
                            setTimeout(function () {
                                $state.go("home");
                            }, 500)
                        } else if (udata.type == 1) {
                            $scope.error = $translate.instant('havelink');
                        } else if (udata.type == 2) {
                            $scope.error = $translate.instant('Invitationwrong');
                        }
                    })
                } else {
                    $scope.error = $translate.instant('Invitationwrong');
                }
            }
        } else {
            $state.go("login");
        }
    }
]);

//weixin连接已完成
boxControllersios.controller('WIFI5Ctrl', ['$scope', '$stateParams', '$state', '$interval', '$translate', 'socket',
    function ($scope, $stateParams, $state, $interval, $translate, socket) {
        $scope.boxNumber = $state.newboxNumber;
        $state.title = $translate.instant('boxTitle');
        $state.showwifi4 = false;
        if ($state.user) {
            if ($state.user.boxtime == 0) {
                $state.showwifi5 = true;
            }
            //weixin二维码
            //weixin盒子上传保存
            $scope.savebox = function () {

            }
        } else {
            $state.go("login")
        }
    }
]);
    