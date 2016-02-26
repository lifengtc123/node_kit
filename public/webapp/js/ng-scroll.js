/**
 * Created by zhoufang on 15/7/20.
 */
angular.module('ng-iscroll', []).directive('ngIscroll', function() {
    var myScroll,
        pullDownEl, pullDownOffset,
        pullUpEl, pullUpOffset;
    return {
        replace: false,
        restrict: 'A',
        link: function(scope, element, attr,$http){
            var ngScroll_timeout = 5;
            console.log(attr.ngIscroll);
            if (attr.ngIscroll !== "") {
                ngScroll_timeout = attr.ngIscroll;
            }
            scope.$watch(attr.ngIscroll, function(value){
                setTimeout(setScroll, ngScroll_timeout);
            });
            function setScroll() {
                pullDownEl = document.getElementById('pullDown');
                pullDownOffset = pullDownEl.offsetHeight;
                pullUpEl = document.getElementById('pullUp');
                pullUpOffset = pullUpEl.offsetHeight;
                myScroll = new iScroll('wrapper', {
                    useTransition: false,
                    topOffset: pullDownOffset,
                    onRefresh: function () {
                        if (pullDownEl.className.match('loading')) {
                            pullDownEl.className = '';
                            pullDownEl.querySelector('.pullDownLabel').innerHTML = 'Pull down to refresh...';
                        } else if (pullUpEl.className.match('loading')) {
                            pullUpEl.className = '';
                            pullUpEl.querySelector('.pullUpLabel').innerHTML = 'Pull up to load more...';
                        }
                    },
                    onScrollMove: function () {
                        if (this.y > 100 && !pullDownEl.className.match('flip')) {
                            pullDownEl.className = 'flip';
                            pullDownEl.querySelector('.pullDownLabel').innerHTML = 'Release to refresh...';
                            this.minScrollY = 0;
                        } else if (this.y < 100 && pullDownEl.className.match('flip')) {
                            pullDownEl.className = '';
                            pullDownEl.querySelector('.pullDownLabel').innerHTML = 'Pull down to refresh...';
                            this.minScrollY=(this.y+pullDownOffset);
                        } else if (this.y<(-this.maxScrollY - 100) && !pullUpEl.className.match('flip')) {
                            pullUpEl.className = 'flip';
                            pullUpEl.querySelector('.pullUpLabel').innerHTML = 'Release to refresh...';
                            this.maxScrollY = this.maxScrollY;
                        }else{
                            pullDownEl.className = '';
                            pullUpEl.className = '';
                            this.minScrollY=(this.y-pullDownOffset);
                        }
                        //console.log("y"+this.y);
                        //console.log("minScrollY"+this.minScrollY);
                        //console.log("maxScrollY"+this.maxScrollY);
                    },
                    onScrollEnd: function () {
                        if (pullDownEl.className.match('flip')) {
                            pullDownEl.className = 'loading';
                            pullDownEl.querySelector('.pullDownLabel').innerHTML = 'Loading...';
                            scope.$emit("pullDownAction");
                            pullDownAction();	// Execute custom function (ajax call?)
                        } else if (pullUpEl.className.match('flip')) {
                            pullUpEl.className = 'loading';
                            pullUpEl.querySelector('.pullUpLabel').innerHTML = 'Loading...';
                            scope.$emit("pullUpAction");
                            pullUpAction();	// Execute custom function (ajax call?)
                        }
                    }
                });
            }
            function pullDownAction () {
                setTimeout(function () {	// <-- Simulate network congestion, remove setTimeout from production!
                    var el, li, i;
                    el = document.getElementById('thelist');
                    //$http.post($state.server+"/appapi/events/getTenList",{username:$state.username}).success(function(mdata) {
                    console.log(scope.mdata);
                    if(scope.mdata!=null&&scope.mdata.length>0){
                        var mdata=scope.mdata;
                        for(var i=0;i<mdata.length;i++){
                            li = document.createElement('div');
                            if(mdata[i].type=='1'){
                                li.innerHTML = "<div class='info_time' id="+mdata[i].id+"><span>"+mdata[i].time+"</span></div><div class='info_box'><div class='iconfont icon warning'>&#xe61b;</div>"+
                                "<div class='tit'><strong>未吃药提醒</strong><a href='#'>来自:"+mdata[i].boxName+"</a></div>"+
                                "<div class='tit'><span>"+mdata[i].content+"</span></div></div></div>";
                            }else if(mdata[i].type=='2'){
                                li.innerHTML = "<div class='info_time' id="+mdata[i].id+"><span>"+mdata[i].time+"</span></div><div class='info_box'><div class='iconfont icon talk'>&#xe61d;</div>"+
                                "<div class='tit'><strong>录音提醒</strong><a href='#'>来自:"+mdata[i].boxName+"</a></div>"+
                                "<div class='tit'><div class='voice'><i></i><img src='images/info_voice.png' /></div><div class='time'>18''</div></div></div>";
                            }else if(mdata[i].type=='3'){
                                li.innerHTML = "<div class='info_time' id="+mdata[i].id+"><span>"+mdata[i].time+"</span></div><div class='info_box'><div class='iconfont icon news'>&#xe61c;</div>"+
                                "<div class='tit'><strong>最新咨询</strong></div>"+
                                "<div class='tit'><span>"+mdata[i].content+"</span></div>"+
                                "<div class='pic'><a href='#'><img src='"+mdata[i].image+"'/></a></div></div></div>";
                            }
                            el.insertBefore(li, el.childNodes[0]);
                        }
                    }
                    myScroll.refresh();		// Remember to refresh when contents are loaded (ie: on ajax completion)
                }, 1000);	// <-- Simulate network congestion, remove setTimeout from production!
            }

            function pullUpAction () {
                setTimeout(function () {	// <-- Simulate network congestion, remove setTimeout from production!
                    var el, li, i;
                    el = document.getElementById('thelist');
                    //$http.post($state.server+"/appapi/events/getTenList",{username:$state.username}).success(function(mdata) {
                    if(scope.mdata!=null&&scope.mdata.length>0){
                        var mdata=scope.mdata;
                        for(var i=0;i<mdata.length;i++){
                            li = document.createElement('div');
                            if(mdata[i].type=='1'){
                                li.innerHTML = "<div class='info_time' id="+mdata[i].id+"><span>"+mdata[i].time+"</span></div><div class='info_box'><div class='iconfont icon warning'>&#xe61b;</div>"+
                                "<div class='tit'><strong>未吃药提醒</strong><a href='#'>来自:"+mdata[i].boxName+"</a></div>"+
                                "<div class='tit'><span>"+mdata[i].content+"</span></div></div></div>";
                            }else if(mdata[i].type=='2'){
                                li.innerHTML = "<div class='info_time' id="+mdata[i].id+"><span>"+mdata[i].time+"</span></div><div class='info_box'><div class='iconfont icon talk'>&#xe61d;</div>"+
                                "<div class='tit'><strong>录音提醒</strong><a href='#'>来自:"+mdata[i].boxName+"</a></div>"+
                                "<div class='tit'><div class='voice'><i></i><img src='images/info_voice.png' /></div><div class='time'>18''</div></div></div>";
                            }else if(mdata[i].type=='3'){
                                li.innerHTML = "<div class='info_time' id="+mdata[i].id+"><span>"+mdata[i].time+"</span></div><div class='info_box'><div class='iconfont icon news'>&#xe61c;</div>"+
                                "<div class='tit'><strong>最新咨询</strong></div>"+
                                "<div class='tit'><span>"+mdata[i].content+"</span></div>"+
                                "<div class='pic'><a href='#'><img src='"+mdata[i].image+"'/></a></div></div></div>";
                            }
                            el.insertBefore(li, el.childNodes[0]);
                        }
                    }
                    myScroll.refresh();		// Remember to refresh when contents are loaded (ie: on ajax completion)
                }, 1000);	// <-- Simulate network congestion, remove setTimeout from production!
            }
        }
    };
});