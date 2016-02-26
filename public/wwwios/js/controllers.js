/**
 * Created by lifeng on 15/4/17.
 */
/* Controllers */
var boxControllers = angular.module('boxControllers', [
    'ui.router',
    'boxControllersios'
]);


//websocket连接
boxControllers.factory('socket', function ($rootScope) {
    var socket = io.connect("http://192.168.1.50:8081");
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
                'password': $scope.data.password,
                phoneuuid:$state.phoneuuid
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
            //当app账号和微信账号都没有登录的时候
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
//        if ($state.setctrl != null)document.body.scrollTop = $state.setctrl;
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


