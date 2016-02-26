define(function(require, exports) {
    require('./css/calendar.css');

    function getToday() {
        var today = new Date( currentTime );
        return [today.getFullYear(), today.getMonth() + 1, today.getDate(), today.getHours(), today.getMinutes(), today.getSeconds()];
    };
    var today = getToday();
    /** 
     * CalendarExp组件开始
     */

    var CalendarExp = function(config) {
        var me = this;
        this.data = today.slice(0, 3).concat([12, 0, 0]);
        me.config = $.extend({}, me.initConfig, config);
        me.init();
    };

    $.extend(CalendarExp.prototype, Base.Event, {

        initConfig: {},

        init: function() {
            var me = this,
                curDate = new Date( currentTime ),
                config = me.config,
                container = me.visibleTag = me.disableTag = me.container = $('<div>').addClass('calen_exp_container');
            me.scale = config.scale || 1; //时间轴缩放倍数，1代表天模式
            me.dayLiWidth = 84;
            me.sliderWidth = me.sliderBaseWidth = 84;
            me.arrowWidth = 28;
            me.baseWidth = 587;

            curDate = me.curDate = [curDate.getFullYear(), curDate.getMonth() + 1, curDate.getDate(), curDate.getHours(), curDate.getMinutes(), curDate.getSeconds()];
            me.createWrap(container);
            config.renderTo.append(container);
        },

        createWrap: function(container) { //创建日历主体外围、静态元素
            var me = this,
                wrap = me.wrap = $('<div>');
            wrap.addClass('up_calen_exp_wrap');
            container.append(wrap);
            me.createStatic(wrap);
            me.loadData(me.data);
            return wrap;
        },

        loadData: function(data) {
            var me = this;
            me.render(data)
        },

        getValue: function() {
            var now =new Date(this.data[0], this.data[1] - 1, this.data[2]);
            return [now.getFullYear(), now.getMonth() + 1, now.getDate()];
        },

        setValue: function(data) {
            var me = this;
            me.data = data;
            delete me.staticTimePoint;
            me.loadData(data);
            //this.fire('setValue', this.data );
        },

        reset: function() {
            this.setValue(today);
            this.fire('reset', this.data);
            return this;
        },

        show: function() {
            this.wrap.parent().removeClass('hide');
            //		CalendarExp.superclass.show.call( this );
            this.setValue(this.data);
        },

        hide: function() {
            this.wrap.parent().addClass('hide');
            //	CalendarExp.superclass.hide.call( this );
            delete this._data;
        },

        render: function(data) { //渲染日历
            var me = this,
                main = me.main,
                daySet = me.getNow(data)[2] || [],
                ele,
                eles = $('<ul>');
            $.each(daySet, function(i, ele) {
                eles.append(me.createDay(ele));
            });
            main.css({
                'right': me.arrowWidth + 'px',
                'width': me.dayLiWidth * daySet.length + 'px'
            });
            me.slideDis = me.dayLiWidth * daySet.length - 1 + 'px';
            main.html('');
            main.append(eles);
            main.append(me.slider);
            me.setSliderPos();
            if (new Date(me.data[0], me.data[1] - 1, me.data[2], me.data[3], me.data[4], me.data[5]).getTime() >= new Date(me.curDate[0], me.curDate[1] - 1, me.curDate[2], me.curDate[3], me.curDate[4], me.curDate[5]).getTime()) {
                me.canScroll(1, false);
            } else {
                me.canScroll(1, true);
            }

            if (me.videoData) {
                var videoData = me.videoData[data[0] + '-' + $.pad('0', 2, data[1])],
                    showLaterDate = new Date(me.staticTimePoint[1]),
                    preMonthVideoData;
                if (preMonthVideoData = me.videoData[showLaterDate.getFullYear() + '-' + $.pad('0', 2, showLaterDate.getMonth()+1)]) videoData = videoData.concat(preMonthVideoData);
                me.setVideoMark(videoData);
            }
        },

        _addDay: function(dir, startDate) {
            var me = this,
                main = me.main,
                _startDate = new Date(startDate + (dir * 86400 * 1000)),
                daySet = me.getNow([_startDate.getFullYear(), _startDate.getMonth() + 1, _startDate.getDate(), 0, 0, 0], dir)[2] || [],
                eles = me.main.find('ul'),
                ele,
                videoData,
                YM, //startDate-->yyyy-mm
                _YM; //_startDate-->yyyy-mm
            if (!daySet.length) return;
            me.staticTimePoint[3] += daySet.length;
            main.css({
                'width': (parseInt(main[0].style.width) + (me.dayLiWidth * daySet.length)) + 'px'
            });

            if (dir < 0) {
                while (ele = daySet.pop()) {
                    $(eles[0]).prepend(me.createDay(ele));
                }
            } else {
                main.css({
                    'right': (parseInt(main[0].style.right) - (me.dayLiWidth * daySet.length)) + 'px'
                });
                while (ele = daySet.pop()) {
                    $(eles[0]).append(me.createDay(ele));
                }
                me.setSliderPos(null, true);
            }
            if (me.videoData) {
                var _date = new Date(startDate);
                YM = _date.getFullYear() + '-' + $.pad('0', 2, _date.getMonth() + 1);
                _date = new Date(_startDate);
                _YM = _date.getFullYear() + '-' + $.pad('0', 2, _date.getMonth() + 1);
                videoData = YM == _YM ? me.videoData[YM] : (me.videoData[YM] ? me.videoData[YM].concat(me.videoData[_YM]) : me.videoData[_YM]);
                me.setVideoMark(videoData);
            }
        },

        getNow: function(data) { //获取当前日历显示的日期
            var me = this,
                data = data || me.data,
                now = new Date(data[0], data[1] - 1, data[2]), //根据data得到的时间点
                nowSec = now.getTime(),
                year = now.getFullYear(),
                month = now.getMonth(),
                ret = [],
                pad = $.pad,
                str,
                renderTime, //当前已渲染的最早日期
                curFirstTime, //当前显示的第一个日期
                renderLastTime, //当前已渲染的最晚日期
                renderDays; //已渲染总天数
            if (!arguments[1] || arguments[1] < 0) {
                if (data[2] < 7) {
                    var preMonth = new Date(year, month, 0),
                        preDate = preMonth.getDate();
                    for (var i = 0; i < preDate;) {
                        str = [preMonth.getFullYear(), preMonth.getMonth() + 1, ++i];
                        ret.push(str[0] + '-' + str[1] + '-' + str[2]);
                    };
                    me.staticTimePoint ? null : renderTime = new Date(preMonth.getFullYear(), preMonth.getMonth(), 1).getTime();
                }
                for (var i = 0; i < data[2];) {
                    str = [now.getFullYear(), month + 1, ++i];
                    ret.push(str[0] + '-' + str[1] + '-' + str[2]);
                };
                if (!me.staticTimePoint) {
                    curFirstTime = now.getTime() - (6 * 86400 * 1000);
                    renderTime = renderTime || new Date(year, month, 1).getTime();
                    renderLastTime =new Date(data[0], data[1] - 1, data[2], 23, 59, 59).getTime();
                    renderDays = ret.length;
                    me.staticTimePoint = [renderTime, curFirstTime, renderLastTime, renderDays];
                } else {
                    me.staticTimePoint[0] = new Date(year, month, 1).getTime();
                }
            } else {
                var curDate =new Date(this.curDate[0], this.curDate[1] - 1, this.curDate[2], 23, 59, 59).getTime();

                if (me.staticTimePoint[2] >= curDate &&new Date(data[0], data[1] - 1, data[2], data[3], data[4], data[5]).getTime() >= curDate) return [];
                var nowMonthDays = new Date(year, month + 1, 0).getDate(), //获取本月天数
                    renderLastDay = data[2] - 1,
                    len = nowMonthDays - renderLastDay;

                for (var i = 0; i < len;) {
                    str = [now.getFullYear(), month + 1, ++i + renderLastDay];
                    ret.unshift(str[0] + '-' + str[1] + '-' + str[2]);
                    if (str[0] == today[0] && str[1] == today[1] && str[2] == today[2]) break;
                }
                renderLastDay += len;
                if (data[0] == me.curDate[0] && data[1] == me.curDate[1]) renderLastDay = me.curDate[2];
                //					var _date = new Date(year,month+1,0);
                //					for(var i = 0; i < renderLastDay;){
                //						str = [_date.getFullYear(), _date.getMonth()+1, ++i];
                //						if(new Date(str[0], str[1], str[2]) < new Date(today[0], today[1], today[2])) ret.unshift(  str[0] + '-' + str[1] + '-' + str[2]  );
                //					}
                me.staticTimePoint[2] = new Date(year, month, renderLastDay, 23, 59, 59).getTime();
            }


            return [year, month + 1, ret];

        },

        createDay: function(ele) { //创建每天的dom
            var me = this,
                li = $('<li>'),
                eleArray = ele.split('-');
            if (!(/[ln]$/.test(ele))) { //非当前月的不创建
                li.on('click', function(e) {
                    var e = e || window.event,
                        offsetX = e.offsetX,
                        dateInDay = parseInt(offsetX / me.dayLiWidth * 84600 * 1000),
                        srcElement = e.target || e.srcElement;
                    if (srcElement.tagName == 'SPAN') return;
                    me.data[0] = parseInt(eleArray[0]);
                    me.data[1] = parseInt(eleArray[1]);
                    me.data[2] = parseInt(eleArray[2]);
                    var date = new Date(new Date(me.data[0], me.data[1] - 1, me.data[2], 0, 0, 0).getTime() + dateInDay),
                        hourInDay = me.data[3] = date.getHours(),
                        minInDay = me.data[4] = date.getMinutes(),
                        secInDay = me.data[5] = date.getSeconds();
                    if (me._data) {
                        me._data[1] = parseInt(eleArray[1]);
                        me._data[2] = parseInt(eleArray[2]);
                        me._data[3] = hourInDay;
                        me._data[4] = minInDay;
                        me._data[5] = secInDay;
                    }
                    me.data = me._data || me.data;
                    delete me._data;
                    me.setSliderPos();
                    me.fire('click', me.parseTime(parseInt(me.slider[0].style.right)));
                });
                li.on('mouseover', function() {
                    li.addClass('up_calen_lihover');
                });
                li.on('mouseout', function() {
                    li.removeClass('up_calen_lihover');
                });

                if (today[0] == eleArray[0] && today[1] == eleArray[1] && today[2] == eleArray[2]) {
                    li.html('<span>今天</span>');
                } else {
                    li.html('<span>' + eleArray[1] + '.' + eleArray[2] + '</span>');
                }
                //					if( inner == me.data[1] + '月' + me.data[2] + '日'){
                //						li.addClass( 'up_calen_current' );
                //					};
            };
            return li;
        },

        createStatic: function(wrap) { //创建日历的静态部分年、月、周
            var me = this,
                main = me.main = $('<div>'),
                ul = $('<ul>'),
                scrollL = me.scrollL = $('<div>').addClass('up_calen_exp_l'),
                scrollR = me.scrollR = $('<div>').addClass('up_calen_exp_r'),
                slider = window.slider = me.slider = $('<div>').addClass('up_calen_exp_slider').css({
                    'right': '0px'
                }),
                week,
                li;

            scrollL.on('click', function() {
				if(wall.model.active.info.canRemoteReplay =='no'){
					dialog.warn('您没有查看该设备远程录像的权限哦');
					return false;
				}
                if (util.browser.isIE) {
                    document.body.onselectstart = function() {
                        return false;
                    }
                } else {
                    $('body').css({
                        '-webkit-user-select': 'none'
                    });
                }
                me.scrollL.disabled || me._scroll(-1);
                me.sliderStill = true;
            });
            
            me.config.renderTo.on('mousedown',function(e){

				if(wall.model.active.info.canRemoteReplay =='no'){
					dialog.warn('您没有查看该设备远程录像的权限哦');
					return false;
				}

            	if($(e.target).closest('.up_calen_exp_slider').length){
                    if (util.browser.isIE) {
                        document.body.onselectstart = function() {
                            return false;
                        }
                    } else {
                        $('body').css({
                            '-webkit-user-select': 'none'
                        });
                    }
                    var dom = this,
                        e = e || window.event,
                        oldMouseX = e.pageX || e.clientX,
                        mainRight,
                        minRight,
                        maxRight,
                        setMainRight;
                    me.fire('dragstart', me.parseTime(parseInt(me.slider[0].style.right)));
                    $.setCapture(dom);
                    document.onmousemove = function(e) {
                        var e = e || window.event,
                            sliderPos = parseInt(me.slider[0].style.right),
                            right = sliderPos - (e.pageX || e.clientX) + oldMouseX,
                            curDate,
                            curDateArr;
                        mainRight = parseFloat(main[0].style.right);
                        minRight = -mainRight + me.arrowWidth;
                        maxRight = minRight + me.baseWidth - me.sliderWidth;
                        if (setMainRight) {
                            clearInterval(setMainRight);
                        }
                        if (right < minRight) {
                            me.intervale = true;
                            setMainRight = setInterval(function() {
                                mainRight = parseInt(main[0].style.right) + 1;
                                right = -mainRight + me.arrowWidth;
                                curDate = me.parseTime(right);
                                var todayDate =new Date(today[0], today[0] - 1, today[2]).getTime(),
                                    curLateTime = me.staticTimePoint[1] + parseInt(86400 * 1000 * 7 / me.baseWidth),
                                    ifToday;
                                if (curLateTime + 6 * 86400 * 1000 >= todayDate) ifToday = true;

                                if (!ifToday && mainRight > me.arrowWidth) {
                                    var curDateArr = curDate.split(' ')[0].split('-');
                                    me._addDay(1,new Date(curDateArr[0], parseInt(curDateArr[1] - 1), curDateArr[2]).getTime());
                                    mainRight = parseInt(main[0].style.right) + 1;
                                    right = -mainRight + me.arrowWidth;
                                    curDate = me.parseTime(right);
                                }

                                if (mainRight >= me.arrowWidth + me.sliderWidth / 2) {
                                    right = -me.sliderWidth / 2;
                                    mainRight = me.arrowWidth - right;
                                    slider.css({
                                        'right': right + 'px'
                                    });
                                    main.css({
                                        'right': mainRight + 'px'
                                    });
                                    curDate = me.data[0] + '-' + me.data[1] + '-' + me.data[2] + ' 23:59:59';
                                    curDateArr = curDate.split(' ');
                                    curDateArr[0] = curDateArr[0].split('-');
                                    curDateArr[1] = curDateArr[1].split(':');
                                    me.data = curDateArr[0].concat(curDateArr[1]);
                                    me.canScroll(1, false);
                                    me.fire('move', curDate);

                                    clearInterval(setMainRight);
                                    return;
                                }

                                slider.css({
                                    'right': right + 'px'
                                });
                                main.css({
                                    'right': mainRight + 'px'
                                });
                                me.staticTimePoint[1] = curLateTime;
                                curDateArr = curDate.split(' ');
                                curDateArr[0] = curDateArr[0].split('-');
                                curDateArr[1] = curDateArr[1].split(':');
                                me.data = curDateArr[0].concat(curDateArr[1]);
                                me.fire('move', curDate);
                            }, 50);
                            return;
                        }
                        if (right > maxRight) {
                            me.canScroll(1, true);
                            setMainRight = setInterval(function() {
                                mainRight -= 1;
                                right = -mainRight + me.arrowWidth - (me.sliderWidth) + me.baseWidth;
                                slider.css({
                                    'right': right + 'px'
                                });
                                main.css({
                                    'right': mainRight + 'px'
                                });
                                me.staticTimePoint[1] -= parseInt(86400 * 1000 * 7 / me.baseWidth);
                                if (me.staticTimePoint[1] <= me.staticTimePoint[0]) {
                                    me._addDay(-1, me.staticTimePoint[0]);
                                }
                                curDate = me.parseTime(right);
                                curDateArr = curDate.split(' ');
                                curDateArr[0] = curDateArr[0].split('-');
                                curDateArr[1] = curDateArr[1].split(':');
                                me.data = curDateArr[0].concat(curDateArr[1]);
                                me.fire('move', curDate);
                            }, 50);
                            return;
                        }
                        oldMouseX = e.pageX || e.clientX;
                        slider.css({
                            'right': right + 'px'
                        });
                        curDate = me.parseTime(right);
                        curDateArr = curDate.split(' ');
                        curDateArr[0] = curDateArr[0].split('-');
                        curDateArr[1] = curDateArr[1].split(':');
                        me.data = curDateArr[0].concat(curDateArr[1]);
                        me.fire('move', curDate);
                    };
                    document.onmouseup = function(e) {
                        if (!util.browser.isIE) {
                            $('body').css({
                                '-webkit-user-select': 'auto'
                            });
                        }
                        if (setMainRight) {
                            clearInterval(setMainRight);
                        }
                        me.fire('dragend', me.data[0] + '-' + me.data[1] + '-' + me.data[2] + ' ' + me.data[3] + ':' + me.data[4] + ':' + me.data[5]);
                        $.releaseCapture(dom);
                        me.ifCurrent();
                    };
            	}
            });      
            
            scrollR.on('click', function() {
				if(wall.model.active.info.canRemoteReplay =='no'){
					dialog.warn('您没有查看该设备远程录像的权限哦');
					return false;
				}
                if (util.browser.isIE) {
                    document.body.onselectstart = function() {
                        return false;
                    }
                } else {
                    $('body').css({
                        '-webkit-user-select': 'none'
                    });
                }
                me.scrollR.disabled || me._scroll(1);
                me.sliderStill = true;
            });
            wrap.append(main.addClass('up_calen_main'));
            wrap.append(scrollL);
            wrap.append(scrollR);
        },

        //根据滑块位置（right属性）转时间点
        parseTime: function(right) {
            var me = this,
                date = (right + (me.sliderWidth / 2)) / me.dayLiWidth * 86400 * 1000;
            date = new Date(parseInt(me.staticTimePoint[2] - date));
            var hour = date.getHours();
            if (hour <= 9) hour = '0' + hour;
            return date.getFullYear() + '-' + $.pad('0', 2, date.getMonth() + 1) + '-' + $.pad('0', 2, date.getDate()) + ' ' + hour + ':' + $.pad('0', 2, date.getMinutes()) + ':' + $.pad('0', 2, date.getSeconds());
        },

        //依照时间设置滑块位置
        setSliderPos: function(data, sliderStill) {
            var me = this,
                data = data || me.data,
                lag = me.staticTimePoint[2] - new Date(data[0], data[1] - 1, data[2], data[3], data[4], data[5]).getTime(),
                right = lag * me.dayLiWidth / 86400 / 1000 - (me.sliderWidth / 2),
                mainRight = parseInt(me.main[0].style.right),
                minRignt = -mainRight + me.arrowWidth,
                maxRight = minRignt + me.baseWidth - me.sliderWidth;
            if (sliderStill) me.sliderStill = sliderStill;
            me.slider.css({
                'right': right + 'px'
            });
            if (!me.sliderStill) {
                if (parseInt(right) < 0 || right <= minRignt) {
                    me.main.css({
                        'right': -right + me.arrowWidth + 'px'
                    });
                }
                if (right >= maxRight) {
                    me.main.css({
                        'right': -right + me.arrowWidth + me.baseWidth - me.sliderWidth + 'px'
                    });
                }
            }
            me.data = data;
            if (data[0] == me.curDate[0] && data[1] == me.curDate[1] && data[2] == me.curDate[2]) return;
            var now =new Date(data[0], parseInt(data[1], 10) - 1, data[2]).getTime();
            if (now + 86400 * 1000 - 1000 >= me.staticTimePoint[2]) {
                me._addDay(1, now);
            }
            if (now - 86400 * 1000 <= me.staticTimePoint[0]) {
                me._addDay(-1, now);
            }
            me.ifCurrent();
        },

        //判断滑块整体是否可见
        ifCurrent: function() {
            var me = this,
                sliderR = parseInt(me.slider[0].style.right, 10),
                mainR = parseInt(me.main[0].style.right, 10);
            if (sliderR >= me.arrowWidth - mainR && sliderR <= me.arrowWidth + me.baseWidth - me.sliderWidth - mainR) {
                me.sliderStill = false;
            }
        },

        // 获取今天最后时间
        _getTodayEnd: function() {
            var today = new Date( currentTime );
            return new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
        },

        canScroll: function(dir, scroll) {
            var me = this,
                dir = dir == -1 ? 'L' : 'R',
                ele = me['scroll' + dir];
            scroll ? (ele.removeClass('disabled')).disabled = false : (ele.addClass('disabled')).disabled = true;
        },

        _scroll: function(dir) {
            var me = this,
                data = me.data,
                curDateSec =new Date(me.curDate[0], me.curDate[1] - 1, me.curDate[2], 0, 0, 0).getTime(),
                mainRight,
                laterDate,
                curShowDate,
                todayEnd = me._getTodayEnd().getTime();

            if (me.staticTimePoint[1] - 86400 * 1000 <= me.staticTimePoint[0]) {
                me._addDay(-1, me.staticTimePoint[0]);
            }
            if (dir > 0) {
                var lastDate =new Date(me.staticTimePoint[2]),
                    year = lastDate.getFullYear(),
                    month = lastDate.getMonth(),
                    day = lastDate.getDate(),
                    dayTimePoint =new Date(year, month, day, 0, 0, 0).getTime();

                if (dayTimePoint != curDateSec && me.staticTimePoint[1] + (86400 * 1000 * 6) == dayTimePoint) {
                    me._addDay(1, dayTimePoint);
                }
            }
            me.staticTimePoint[1] = me.staticTimePoint[1] + (dir * 86400 * 1000);
            mainRight = parseInt(me.main[0].style.right) + (dir * me.dayLiWidth);
            if (mainRight > me.arrowWidth + me.sliderWidth / 2) {
                mainRight = me.arrowWidth + me.sliderWidth / 2;
                me.staticTimePoint[1] = curDateSec - 5.5 * 86400 * 1000;
            }
            me.main.css({
                'right': mainRight + 'px'
            });
            if (dir == 1 && me.staticTimePoint[1] + (6 * 86400 * 1000) >= new Date(me.curDate[0], me.curDate[1] - 1, me.curDate[2]).getTime() + 43200 * 1000) {
                me.canScroll(1, false); //第一个参数为滚动方向，向左为-1，向右为1，第二个参数定义是否可滚动
            } else {
                me.canScroll(1, true);
            }

            laterDate = new Date((me.staticTimePoint[1]));
            curShowDate = laterDate.getTime() + 7 * 86400 * 1000;
            if (curShowDate > todayEnd) curShowDate = todayEnd;

            me.fire('calenscroll', [me.parseDate(laterDate), me.parseDate(curShowDate)]);
        },
        setScale: function(scale, sliderWidth) {
            var me = this,
                oldWidth = parseFloat(me.slider[0].style.width) || me.sliderBaseWidth,
                newWidth = me.sliderWidth = sliderWidth || me.sliderBaseWidth,
                oldRight = parseFloat(me.slider[0].style.right) || 0,
                newRight;
            me.sliderStill = true;
            newRight = oldRight + oldWidth / 2 - newWidth / 2;
            me.slider.css({
                width: newWidth + 'px',
                right: newRight + 'px'
            });
            me.slider.removeClass('scale_' + me.scale);
            me.slider.addClass('scale_' + scale);
            var mainRightNo = parseFloat(me.main[0].style.right);
            if (mainRightNo > me.arrowWidth + me.sliderWidth / 2) {
                me.main.css({
                    'right': me.arrowWidth + me.sliderWidth / 2 + 'px'
                });
            }

            if (mainRightNo < me.sliderWidth / 2 + me.arrowWidth) {
                me.canScroll(1, true);
            } else {
                me.canScroll(1, false);
            }
            me.scale = scale;
        },
        //设置录像数据
        setVideoData: function(data) {
            var me = this,
                _data = data.slice(0),
                videoData = me.videoData = (me.videoData || {}),
                c;
            if (_data.length) {
                while (c = _data.shift()) {
                    var month = c.match(/\d*-\d*/)[0],
                        monthData;
                    (!videoData[month]) && (videoData[month] = []);

                    monthData = videoData[month];
                    for (var i = 0, len = monthData.length; i < len; i++) {
                        if (monthData[i] == c) {
                            monthData.splice(i, 1);
                            break;
                        }
                    }
                    monthData.push(c);
                }
                me.setVideoMark(data);
            }
        },
        //设置录像标识
        setVideoMark: function(data) {
            if (data) {
                var _data = data.slice(0),
                    me = this,
                    c;
                if (_data.length) {
                    while (c = _data.shift()) {
                        var dateEl = me.main.find('li');
                        for (var i = 0, len = dateEl.length; i < len; i++) {
                            var el = dateEl[i],
                                elData = el.innerHTML.match(/\d+/g);

                            if (elData && ($.pad('0', 2, elData[0]) + '-' + $.pad('0', 2, elData[1]) == c.match(/\d*-\d*$/)[0])) {
                                $(el).removeClass('has_video').addClass('has_video');
                                break;
                            }

                            if (c.match(/\d*-\d*$/)[0] == ($.pad('0', 2, me.curDate[1]) + '-' + $.pad('0', 2, me.curDate[2])) && $(el).text().trim() == '今天') {
                                $(el).removeClass('has_video').addClass('has_video');
                                break;
                            }
                        }
                    }
                }
            }
        },

        //清除日历录像标记
        clearVideoMark: function() {
            var me = this;
            me.videoData = null;
        },

        //获取显示的时间区间
        getDateRange: function() {
            var me = this,
                laterTime = me.parseDate(me.staticTimePoint[1]),
                curShowTime = me.staticTimePoint[1] + 7 * 86400 * 1000,
                todayEnd = me._getTodayEnd().getTime();
            if (curShowTime > todayEnd) curShowTime = todayEnd;
            return [laterTime, me.parseDate(curShowTime)];
        },

        //毫秒数转yyyy-mm-dd HH:MM:SS
        parseDate: function(date) {
            var date =new Date(date);
            return date.getFullYear() + '-' + $.pad('0', 2, date.getMonth() + 1) + '-' + $.pad('0', 2, date.getDate()) + ' ' + $.pad('0', 2, date.getHours()) + ':' + $.pad('0', 2, date.getMinutes()) + ':' + $.pad('0', 2, date.getSeconds());
        }

    });

    exports.component = CalendarExp;
});