define(function(require, exports) {
		var  Calendar = require('./calendar').component,
		CalendarExp = require('./calendar-exp2').component;
	require('./uuid.js');
	require('./css/videoPlayTimeBar.css');
	var alarmType = require( '../../business/alarmType/alarmType' ).alarmType;
	require('jquery-ui');

	function formatDate(date, format){
		if(arguments.length < 2 && !date.getTime){
			format = data;
			date = new Date( currentTime );
		}
		typeof format != 'string' && (format = 'YYYY-MM-DD hh:mm:ss');
		
		return format.replace(/YYYY|YY|MM|DD|hh|mm|ss/g, function(a){
			switch (a){
			case 'YYYY': return date.getFullYear();
			case 'YY': return (date.getFullYear() + '').slice(2);
			case 'MM': return $.pad('0', 2, date.getMonth() + 1);
			case 'DD': return $.pad('0', 2, date.getDate());
			case "hh": return $.pad('0', 2, date.getHours());
            case "mm": return $.pad('0', 2, date.getMinutes());
            case "ss": return $.pad('0', 2, date.getSeconds());
			}
		});
	}
	
	/*******************************************************************************************************************
	 * Function: VideoTimeBar Description: 创建 播放进度条 对象
	 ******************************************************************************************************************/

	var VideoTimeBar = function(config) {
		var me = this;
		me.noRecord = true;
		me.allFiles = []; // 初始化所有片段录像的数组
		me.config = $.extend(me.initConfig, config);
		me.init();
	};


	$.extend(VideoTimeBar.prototype,Base.Event,(function() {
		return {

			initConfig : {},

			init : function() {
				var me = this,
					config = me.config,
					position = me.position = $(config.renderTo),
					calendarWrap = me.calendarWrap = $('<div>');
				me.scale = config.scale || 1; // 时间轴缩放倍数，1代表天模式
				me.baseWidth = (me.config.width - 14 || 720) * me.scale;
				me.data = {}; // 记录已获取过数据的日期
				me.noOfDays = 2; // 已绘制天数，初始绘制两天的时间轴
				me.width = me.baseWidth * me.noOfDays;
				me.updateParseTime = true;
				calendarWrap.css({width : me.config.width + 'px'})
				me.calenEnter(calendarWrap);
				// 今天24点毫秒数（即第二天零点）
				var today = me._getTodayEnd().getTime(),
					// 开始时间，昨天的零点
					start = new Date(today - (2 * 86400 * 1000)),
					// 指针初始化时间，当天的12点
					initDate = config.alarmTime ? config.alarmTime :new Date();
				start = start.getFullYear() + '-' + $.pad('0', 2, start.getMonth() + 1) + '-'
						+ $.pad('0', 2, start.getDate()) + ' 00:00:00';
				initDate = [initDate.getFullYear(), initDate.getMonth() + 1, initDate.getDate(), initDate.getHours(), initDate.getMinutes(), initDate.getSeconds()];
				me.renderLaterDate = initDate[0] + '-' + $.pad('0', 2, initDate[1]) + '-'
						+ $.pad('0', 2, initDate[2]) + ' 00:00:00';
				me._parseTime = initDate[3] + ':' + $.pad('0', 2, initDate[4]) + ':' + $.pad('0', 2, initDate[5])
						+ ' ' + initDate[0] + '/' + $.pad('0', 2, initDate[1]) + '/' + $.pad('0', 2, initDate[2]);
				// 绘制时间轴，从start开始
				me.editTimebar(start);
				start = start.split(' ');
				me.framesTime.html(me._parseTime.replace(/\//g, '-')) // 设置远程回放时间条上的时间，指针时间
				me.timebarContentMove(); // 添加时间条拖动事件
				me.createButtons(); // 创建时、天切换按钮

				// 创建日期控件
				var calen = me.calen = new Calendar(
					{
						renderTo : 'body',
						referTo : me.calenEnter,
						timeLimit : new Date( currentTime )
					}
				);
				calen.on('timechange', function(date){
					wall.model.active.info.typePro= 'replay';
					me.fire('calentimechange', date);
				});
				
				window.onresize = function() {
					calen.setPos();
				};
				me.calenEnter.on('click', function() {
					if(wall.model.active.info.canRemoteReplay =='no'){
						dialog.warn('您没有查看该设备远程录像的权限哦');
						return false;
					}
					var time = me._parseTime.replace(/[^\d]/g, ' ').split(' ');
					time = time.slice(3).concat(time.slice(0, 3));
					calen.setValue(time);
					calen.show();
					calen.setPos();
				});
				position.append(calendarWrap.addClass('up_canle_timebox'));


				var calenExpBox = me.calenExpBox = $('<div>').addClass('up_canle_exp_box');
				calendarWrap.append(calenExpBox);
				var calenExp = me.calenExp = new CalendarExp(
					{
						renderTo : calenExpBox
					}
				);
				calenExp.setSliderPos(initDate);

				calenExp.on('click', function(data) {
					var parseTime = data.split(' '),
						record;
					parseTime = parseTime[1] + ' ' + parseTime[0].replace(/-/g, '/');
					me.ifHasRender(parseTime);
					me.framesPos(data);
					me.updateParseTime = false; // 为false时不再更新_parseTime
					record = me.timeChange(parseTime);
					me.fire('timechange', record);
				});

				calenExp.on('dragstart', function(data) {
					me.stopMove();
				});
				calenExp.on('move', function(data) {
					var parseTime = data.split(' ');
					parseTime = parseTime[1] + ' ' + parseTime[0].replace(/-/g, '/');
					me.ifHasRender(parseTime);
					me.framesPos(data);
					parseTime = me._parseTimeFormat(parseTime);		
					me.fire('timebarMove', parseTime, me.data[parseTime.split(' ')[0]] ? true : false);
					
				});
				calenExp.on('dragend', function(data) {
					var _parseTime = _parseTime || data.split(' '), // "09:34:35 2013/10/12"
						record;
					_parseTime = _parseTime[1] + ' ' + _parseTime[0].replace(/-/g, '/');
					me.updateParseTime = false;
					record = me.timeChange(_parseTime);
					me.fire('timechange', record);
				});
				
				calenExp.on('calenscroll', function(data){
					me.fire('calenscroll', data);
				})

				calen.hide();
				calen.on('click', function(time) {
					me.calenEnter.title = time;
					var startTime = time[0] + '-' + $.pad('0', 2, time[1]) + '-' + $.pad('0', 2, time[2])
							+ ' 00:00:00',
						endTime = time[0] + '-' + $.pad('0', 2, time[1]) + '-' + $.pad('0', 2, time[2]) + ' 23:59:59',
						record;
					me.setStartHMS(time);

					me.searchTime = [startTime, endTime];
					calen.hide();
					me.ifHasRender( '12:00:00 ' + time[0] + '/' + $.pad('0', 2, time[1]) + '/'
							+ $.pad('0', 2, time[2]));
					me.framesPos(time[0] + '-' + $.pad('0', 2, time[1]) + '-' + $.pad('0', 2, time[2]) + ' 12:00:00');

					me.calenExp.setValue(time.concat([12 , 0 , 0]));
					record = me.timeChange( '12:00:00 ' + time[0] + '/' + $.pad('0', 2, time[1]) + '/'
							+ $.pad('0', 2, time[2]));
					me.fire('timechange', record);

				});

			},
			//查找当天第一个有视频片段的时间点（【小时，分钟，秒】）
			setStartHMS : function(time){
			    var timer,i,
					 me = this;
				timer=setInterval(function(){
					for(i = 0;i < me.allFiles.length;i++){
						var v = me.allFiles[i];
						var stime = v.stime.match(/(\d{2})/g);
						stime[0] = stime.shift() + stime[0];
						if(stime[0]==time[0] && stime[1]==time[1] && stime[2] ==time[2]){
							me.rePosition(stime);
							clearInterval(timer);
							timer = null;
							break;
						}
					}
				},25);
			},
			//重新定位时间轴时间
			rePosition : function (stime){
				var me = this;
				me.ifHasRender( stime[3] + ':' + stime[4] +':' + stime[5] + ' ' + stime[0] + '/' + $.pad('0', 2, stime[1]) + '/'
				+ $.pad('0', 2, stime[2]));
				me.framesPos(stime[3] + '-' + $.pad('0', 2, stime[4]) + '-' + $.pad('0', 2, stime[5]) + ' ' + stime[0] + ':' + stime[1] + ':' + stime[2]);

				me.calenExp.setValue(stime);
				record = me.timeChange( stime[3] + ':' + stime[4] + ':' + stime[5] + ' ' + stime[0] + '/' + $.pad('0', 2, stime[1]) + '/'
				+ $.pad('0', 2, stime[2]));
				me.fire('timechange', record);
			},

			// 创建 timebar 上的日历选择器 calenEnter、横向日历容器 及时间轴
			calenEnter : function(pos) {
				var me = this,
					calenEnter = me.calenEnter = $('<div>').addClass('up_canle_enter'),
					framesTime = me.framesTime = $('<div>').addClass('up_calen_framesTime'),
					timebar = me.timebar = $('<div>').addClass('up_canle_timebar');
				calenEnter.html( '选择日期');
				pos.append(calenEnter);
				timebar.append(framesTime);
				pos.append(timebar);
				return calenEnter;
			},

			// 转换成20131026T121314Z(YYYYMMDDTHHmmssZ)的播放时间格式
			convertToPlayTime : function(time) {
				var me = this;
				var date = me._convertToDate(time);
				if (date) {
					var playTime = $.pad('0', 2, date.getFullYear()) + '' + $.pad('0', 2, date.getMonth() + 1)
							+ $.pad('0', 2, date.getDate()) + 'T' + $.pad('0', 2, date.getHours())
							+ $.pad('0', 2, date.getMinutes()) + $.pad('0', 2, date.getSeconds()) + 'Z';
					return playTime;
				}
				return "";
			},

			// 把字符串格式的日期转换成日期
			_convertToDate : function(time) {
				var date = time.match(/(\d{2})/g);
				date[0] = date.shift() + date[0];
				date = new Date(date[0], date[1] - 1, date[2], date[3], date[4], date[5]);
				if ((typeof date == 'object') && date.constructor == Date) { return date; }
				return null;
			},

			// 转换成标准格式的时间，(YYYY-MM-DD HH:mm:ss)
			changTime : function(time) {
				var me = this;
				var date = me._convertToDate(time);
				if (date) { return $.pad('0', 2, date.getFullYear()) + '-' + $.pad('0', 2, date.getMonth() + 1) + '-'
						+ $.pad('0', 2, date.getDate()) + ' ' + $.pad('0', 2, date.getHours()) + ':'
						+ $.pad('0', 2, date.getMinutes()) + ':' + $.pad('0', 2, date.getSeconds()); }
				return "";
			},

			// 转换成 HH:mm:ss YYYY/MM/DD时间格式
			changToParseTime : function(time) {
				var me = this;
				var date = me._convertToDate(time);
				if (date) {
					var playTime = $.pad('0', 2, date.getHours()) + ":" + $.pad('0', 2, date.getMinutes()) + ":"
							+ $.pad('0', 2, date.getSeconds()) + ' ' + $.pad('0', 2, date.getFullYear()) + "/"
							+ $.pad('0', 2, date.getMonth() + 1) + "/" + $.pad('0', 2, date.getDate());
					return playTime;
				}
				return "";
			},
			
			//更新组件数据
			updateRecord : function(data){
				var me = this,
					data = [].concat(data),
					len = data.length,
					allFiles = me.allFiles,
					file,
					ret = false,
					stime, etime, files,
					stimes = [],
					etimes = [],
					additionalAttrs = [], name, start,
					allFiles = me.allFiles, initDate, _timeStr, _timeArr;
				for(var i=0; i<len; i+=1){
					file = {}
					for(var j in data[i]){
						file[j] = data[i][j];
					}
					me.saveVideoTimebarData(file.stime.split('T')[0], file.etime.split('T')[0]);
					additionalAttrs.push(file[me.config.additionalAttr]);
					stimes.push(file.stime.replace(/T/g, ' ').replace(/Z/g, ''));
					etimes.push(file.etime.replace(/T/g, ' ').replace(/Z/g, ''));
					allFiles.push(file);
				}
				if(allFiles.length){
					me.sortFile(me.allFiles, 'stime');
					me.noRecord = false;
				}else{
					ret = ret || 'noFindRecord';
					me.noRecord = true;
				}
				
				if (stimes.length > 0) {
					me.renderVideoPoint(stimes, etimes, additionalAttrs); // 增加渲染消息点
				}
				
			},
			
			// 存储videoTimebar组件data
			saveVideoTimebarData : function(startTime, endTime) {
				var me = this,
					_startTime = startTime.split(' ')[0],
					_endTime = endTime.split(' ')[0];
				me.data[_startTime] = _startTime;
				me.data[_endTime] = _endTime;
			},

			// 排序时间片段
			sortFile : function(arr, param) {				
				arr.sort(function(x, y) { // 根据起始时间排序
					var _param = param;
					if (x[_param] > y[_param]) {
						return 1;
					} else {
						return -1;
					}
				});
			},

			// 创建时间指针
			createframes : function() {
				var me = this;
				if (me.frames) { // 已有则先删除
					// me.framesTime.remove();
					me.frames.remove();
					// delete me.framesTime;
					delete me.framePic;
					delete me.frames;
				};
				var frames = me.frames = $('<div>').addClass('up_calen_frames');
				me.timebar.append(frames);
			},

			//YYYY-MM-DD hh:mm:ss
			selectSection : function(time, strict) {
				var me = this,
					index = -1,
					file,
					inside, //代表time是否在开始时间和结束时间范围内
					intervalDis = 6,
					interval = parseInt(intervalDis*86400*1000 / me.baseWidth/me.scale);
				for (var i = 0, _len = me.allFiles.length; i < _len; i+=1) {
					var v = me.allFiles[i],
						stime = v.stime,
						etime = v.etime;
					inside = false;
					if (time >= stime && time < etime) {
						index = i;
						file = v;
						inside = true;
						break;
					} else if(!strict){
						var stimeSec = stime.match(/(\d{2})/g);
                        stimeSec[0] = stimeSec.shift() + stimeSec[0];
                        var timeSec = time.match(/(\d{2})/g);
                        timeSec[0] = timeSec.shift() + timeSec[0];
						stimeSec = new Date(stimeSec[0], stimeSec[1], stimeSec[2], stimeSec[3], stimeSec[4], stimeSec[5]).getTime();
						timeSec = new Date(timeSec[0], timeSec[1], timeSec[2], timeSec[3], timeSec[4], timeSec[5]).getTime();
						if(timeSec-interval <= stimeSec && timeSec > stimeSec){
							index = i;
							file = v;
						}
						if(timeSec+interval >= stimeSec && timeSec < stimeSec){
							index = i;
							file = v;
							break;
						}
					}
				}
				return {
					index : index,
					file : file,
					inside : inside
				};
			},

			// 创建时、天按钮
			createButtons : function() {
				var me = this,
					btnBox = me.btnBox = $('<div>').addClass('up_timebar_btn_box scale_1'),
					minuteBtn = me.minuteBtn = $('<div>').addClass('up_timebar_minute_btn').html('分'),
					hourBtn = me.hourBtn = $('<div>').addClass('up_timebar_hour_btn').html('时'),
					dayBtn = me.dayBtn = $('<div>').addClass('up_timebar_day_btn').html('天');
				btnBox.append(minuteBtn);
				btnBox.append(hourBtn);
				btnBox.append(dayBtn);
				me.timebar.append(btnBox);
				minuteBtn.on('click', function() {
					me.setScale({
						scale : 120,
						marks : 6,
						sliderWidth : 15
					});
				});
				hourBtn.on('click', function() {
					me.setScale({
						scale : 24,
						marks : 6,
						sliderWidth : 34
					});
				});
				dayBtn.on('click', function() {
					me.setScale(1);
				});
			},
			
			getCalenRang : function(){
				return this.calenExp.getDateRange();
			},

			// 为时间轴内容区域添加拖动事件
			timebarContentMove : function() {
				var me = this,
					frames = me.frames,
					parentPos = me.timebar[0].offsetLeft,
					framesTime = me.framesTime,
					timebarContent = me.timebarContent, startTime;



				timebarContent.on('mousedown', function(e) {
					if(wall.model.active.info.canRemoteReplay =='no'){
						if($('#ys-window').css('display')== "none"){
							dialog.warn('您没有查看该设备远程录像的权限哦');
						}
						
						return false;
					}
					if($.isIE){
						document.body.onselectstart = function() {return false;}
					}else{
						$('body').css({
							'-webkit-user-select' : 'none'
						});
					}
					var dom = this, _parseTime,
						e = e || window.event,
						oldMouseX = e.pageX || e.clientX,
						canSearch = false;
					$.setCapture(dom);
					if (!me.timebarUl) { return false; }
					if (me.coolSearchTrigger) clearTimeout(me.coolSearchTrigger);
					me.stopMove();

					document.onmousemove = function(e) {
						var e = e || window.event,
							timebarContentPos = parseInt(me.timebarContent[0].style.right || 0),
							right = timebarContentPos - (e.pageX || e.clientX) + oldMouseX,
							maxRight = me.baseWidth / 2;
						if ((e.pageX || e.clientX) != oldMouseX) {
							canSearch = true;
							if (right > maxRight) right = maxRight;
							oldMouseX = e.pageX || e.clientX;
							timebarContent.css({
								'right' : right + 'px'
							});
							_parseTime = me.parseTime(right);
							framesTime.html( _parseTime.replace(/\//g, '-'));

							me.ifHasRender(_parseTime);
							var calenExpData = _parseTime.split(' ');
							calenExpData = calenExpData[1].split('/').concat(calenExpData[0].split(':'));
							me.calenExp.setSliderPos(calenExpData);
							_parseTime = me._parseTimeFormat(_parseTime);	
							me.fire('timebarMove', _parseTime, me.data[_parseTime.split(' ')[0]] ? true : false);
						}
					};
					document.onmouseup = function(e) {
						wall.model.active.info.typePro= 'replay';
						if(!$.isIE){
							$('body').css({
								'-webkit-user-select' : 'auto'
							});
						}
						if (canSearch) {
							canSearch = false;
							_parseTime = _parseTime || me.parseTime(parseFloat(timebarContent[0].style.right));
							me._parseTime = me.changToParseTime(_parseTime);
							me.coolSearchTrigger = setTimeout(function() {	
								var record = me.timeChange(me._parseTime);
								me.fire('timechange', record);
							}, 1000);
							$.releaseCapture(dom);
						} else {
							 
							me.startMove();
							$.releaseCapture(dom);							
							 

						}
					};
				});
			},
			
			//当时间轴时间改变时调用
			timeChange : function(_parseTime){
				wall.model.active.info.typePro= 'replay';
				var me = this;
					var parseTime = me._parseTimeFormat(_parseTime);
					var result = me.selectSection(parseTime) || {};
				me._parseTime = _parseTime;
				me.calen.setValue(me._strToDateArr(parseTime));
				if (result.index >= 0) {
					var file = result.file,
						stime = file.stime.replace(/-|:/g, ''),
						etime = file.etime.replace(/-|:/g, '');
					if(!result.inside){
						var time = stime.match(/(\d{2})/g);
			            time[0] = time.shift() + time[0];
			            var right = me.gap(time);
						me._parseTime = time.splice(3,6).join(':') + ' ' + time.join('/');
						me.timebarContent.css({
							width : me.width + 'px',
							right : right + 'px'
						});
					}
				}
				delete result.inside;
				me.framesTime.html( me._parseTime.replace(/\//g, '-'));
				result.parseTime = me._parseTimeFormat(me._parseTime);
				result.hasRecord = me.data[result.parseTime.split(' ')[0]] ? true : false;
				return result;
			},
			
			//设置时间轴的时间轴，参数格式：YYYY-MM-DD hh:mm:SS
			setValue : function(data){
				var me = this,
					timeArr = me._strToDateArr(data);
				me.ifHasRender(timeArr[3] + ':' + timeArr[4] + ':' + timeArr[5] + ' ' + timeArr[0] + '/' + timeArr[1] + '/' + timeArr[2]);
				me.framesPos(new Date(timeArr[0], parseInt(timeArr[1], 10)-1, parseInt(timeArr[2], 10), parseInt(timeArr[3], 10), parseInt(timeArr[4], 10), parseInt(timeArr[5], 10)).getTime());
				me.calenExp.setValue(timeArr);
				me.calenExp.staticTimePoint[1] = new Date(timeArr[0], Math.floor(timeArr[1])-1, timeArr[2], timeArr[3], timeArr[4], timeArr[5]).getTime() - 6.5*86400*1000;
			},
			
			//返回当前时间 YYYY-MM-DD hh:mm:SS
			getValue : function(){
				return this._parseTimeFormat();
			},
			
			//返回当前时间下一段录像的数据
			getNextRecord : function(time){
				var me = this,
					len = me.allFiles.length;
					if(time){
						var Arr = time.split('T')
						var year = Arr[0][0].toString() +Arr[0][1].toString()+Arr[0][2].toString()+Arr[0][3].toString(),
						month = Arr[0][4].toString() +Arr[0][5].toString(),
						date = Arr[0][6].toString() +Arr[0][7].toString(),
						hour = Arr[1][0].toString() +Arr[1][1].toString(),
						minutes = Arr[1][2].toString() +Arr[1][3].toString(),
						seconds = Arr[1][4].toString() +Arr[1][5].toString();
						me._parseTime = hour +":"+minutes +":" + seconds +' ' + year +'/' +month +'/' +date;
					}
					time = me.convertToPlayTime(time?time:me._parseTimeFormat());	
				for (var i = 0; i < len; i+=1) {
					var v = me.allFiles[i],
						stime = me.convertToPlayTime(v.stime),
						etime = me.convertToPlayTime(v.etime);
					/*if (stime <= time && time < etime && etime != wall.model.active.endPlayTime) {
						v.index = i;
						v.stime = me.changTime(time);
						return v;
					} else if(time <=stime){
						v.index = i;
						return v;
					}*/

                    if ( etime <= wall.model.active.endPlayTime) {
                       continue;
                    } else {
                        v.index = i;
                        v.stime = me.changTime(time);
                        return v;
                    }
				}
				return {index:-1}
			},
			
			//根据时间点返回数据
			getRecordByTime : function(time){
				var me = this,
				result = me.selectSection(time);
				result.file = result.file || {};
				result.file.index = result.index;
				return result.file;
			},
			
			//返回索引为index的数据
			getRecordByIndex : function(index){
				return this.allFiles[index];
			},

			// 设置时间轴缩放倍数
			setScale : function(scale) {
				var me = this,
					timebarContent = me.timebarContent, _scale,
					_marks = 1, liWidth;
				me.marks && delete me.marks;
				if (typeof scale == 'object') {
					_scale = scale.scale || me.scale;
					_marks = me.marks = scale.marks || 1;
				} else {
					_scale = scale || me.scale;
				}
				if (_scale == me.scale) return;
				me.width = me.baseWidth * me.noOfDays * _scale;
				me.btnBox.removeClass('scale_' + me.scale);
				timebarContent.removeClass('scale_' + me.scale);
				me.btnBox.addClass('scale_' + _scale);
				timebarContent.addClass('scale_' + _scale);

				me.scale = _scale;
				var time = me._parseTime.split(' ');
				time[1] = time[1].replace(/\//g, '-');
				var t = me.timeTo(time[1] + ' ' + time[0]),
					right = me.gap(t);
				timebarContent.css({
					width : me.width + 'px',
					right : right + 'px'
				});

				me.renderMarks(me._parseTime, _scale, _marks);//时间轴刻度
				me.setRecordScale(_scale);//时间轴上录像
				me.redrawAlarmMsg();//时间轴刻度上的三角箭头（报警）
				me.calenExp.setScale(_scale, scale.sliderWidth);//设置滑动块大小
			},

			// 绘制刻度
			renderMarks : function(_parseTime, _scale, _marks) {
				var me = this,
					parseTime = _parseTime || me._parseTime,
					todayDate = me._getTodayEnd(), noOfDays, marksRight;
				if(me.marksUl && !_scale && !_marks){
					parseTime = parseTime.split(' ');
					parseTime = parseTime[1].split('/');
					noOfDays = (todayDate.getTime() - 86400 * 1000 - new Date(
						parseTime[0], parseInt(parseTime[1]) - 1, parseTime[2]
					).getTime())
							/ (86400 * 1000);
					me.marksTime = parseTime;
					marksRight = noOfDays * me.baseWidth * me.scale - me.baseWidth * me.scale;
					me.marksUl.css({
						'right' : marksRight + 'px'
					});
					return;
				}
				
				var _scale = _scale || me.scale,
					_marks = _marks || me.marks, liWidth,
					timebarContent = me.timebarContent,
					marksUl = me.marksUl || $('<ul>').addClass('marks_box');

				marksUl.html('');
				if (_marks != 1) {
					liWidth = me.baseWidth / _marks + 'px';

					parseTime = parseTime.split(' ');
					parseTime = parseTime[1].split('/');
					noOfDays = (todayDate.getTime() - 86400 * 1000 - new Date(
						parseTime[0], parseInt(parseTime[1]) - 1, parseTime[2]
					).getTime())
							/ (86400 * 1000);
					me.marksTime = parseTime;
					marksRight = noOfDays * me.baseWidth * _scale - me.baseWidth * _scale;
					marksUl.css({
						'width' : me.baseWidth * _scale * 3 + 'px',
						'right' : marksRight + 'px'
					});
					var _hour = 0,
						_minute = 60,
						_minuteInterval = 60 / (_scale * _marks / 24),
						k = 0,
						i = 0,
						j = 0,
						oFrag = document.createDocumentFragment();
					
					for (k = 0; k < 3; k+=1) {
						for (i = _scale - 1; i > -1; i-=1) {
							for (j = _marks - 1; j > -1; j-=1) {
								var li = $('<li>');
								li.css({
									width : liWidth
								});
								if (i == 0 && j == 0){
									li.addClass('zero');
									li.html( '0');
								}else{
									var curHour = parseInt(i * 24 / _scale);
									if(_hour !== curHour){
										_hour = curHour;
										_minute = 60;
									}
									_minute -= _minuteInterval;
									li.html( $.pad('0', 2, _hour) + ':' + $.pad('0', 2, _minute));
								}
								$(oFrag).append(li);
							}
						}
					}
					marksUl.append(oFrag);
				}

				if (!me.marksUl) timebarContent.append(marksUl);
				me.marksUl = marksUl;
			},

			// 设置录像li缩放倍数
			setRecordScale : function(scale) {
				var me = this,
					timebarUl = me.timebarUl,
					timebarLi = $(timebarUl).find('li');

				if (!timebarLi.length) return;
				timebarLi.each(function(index) {
					var _this = $(this),
						widthTime = Number(_this.attr('data-widthtime')),
						beginTime = Number(_this.attr('data-begintime')),
						liwidth = Math.ceil(me.baseWidth * scale * widthTime),
						libegin = Math.ceil(me.baseWidth * scale * beginTime - liwidth);
					if (liwidth < 0) {
						liwidth = Math.ceil(me.baseWidth * scale * widthTime);
						libegin = 0;
					}
					_this.css('right', libegin + 'px');
					_this.width(liwidth);
				});
			},

			// 添加css3动画效果
			cssCartoon : function(name) {
				var prefixes = ['', '-ms-', '-moz-', '-webkit-', '-khtml-', '-o-'],
					rcap = /-([a-z])/g,
					capfn = function($0, $1) {
						return $1.toUpperCase();
					};
				cssName = function(name, target, test) {
					target = target || document.documentElement.style;
					for (var i = 0, l = prefixes.length; i < l; i+=1) {
						test = (prefixes[i] + name).replace(rcap, capfn);
						if (test in target) { return test; }
					}
					return null;
				};
				return cssName(name);
			},

			// 据时间修改距离
			// 此前为定义滑块位置，修改为定义时间轴内容(up_timebar_content)位置，滑块变为指针，位置居中不动
			framesPos : function(time) {
				var me = this,
					framesTime = me.framesTime,
					frames = me.frames,
					timebarContent = me.timebarContent,
					_time;
				if (!time) {
					me.stopMove();
					return;
				} else if (time === true) {
					framesTime.html('00:00:00');
					frames.css({
						right : '0px'
					});
					return;
				}
				var t = me.timeTo(time),
					right = me.gap(t),
					month = typeof t[1] == "number" ? t[1] + 1 : t[1];
				right = right || 0;
				me.right || (me.right = right);
				
				_time = $.pad('0', 2, t[3]) + ':' + $.pad('0', 2, t[4]) + ':' + $.pad('0', 2, t[5]) + ' ' + t[0] + '-' + $.pad('0', 2, month) + '-' + $.pad('0', 2, t[2]);
				framesTime.html(_time);
				
				var month = typeof t[1] == 'number' ? t[1] + 1 : t[1];
				me._parseTime = _time.replace(/-/g, '/');
				
				me.ifHasRender(me._parseTime);
				
				if(arguments[1]){
					var dRight = right - me.right;
					if(Math.abs(dRight) >= 1){
						right = me.right + Math.round(dRight);
						me.right = right;
						timebarContent.css({
							right : right + 'px'
						});
						me.timebarContentMove();
					}
				}else{
					timebarContent.css({
						right : right + 'px'
					});
					me.timebarContentMove();
				}
			},
			
			// 时间转距离（修改为：将t的时间点定在时间轴中间的时间轴内容的right坐标）
			gap : function(t) {
				var me = this,
					month = (typeof t[1] == 'number') ? t[1] : t[1] - 1,
					timenow =new Date(t[0], month, t[2], t[3], t[4], t[5]).getTime(), ret, l,
					d = me._getTodayEnd().getTime();
				l = (d - timenow) / (86400 * 1000) * me.baseWidth * me.scale;
				ret = -l + (me.baseWidth / 2);
				return ret;
			},

			// 距离转时间（返回距离今天24:00:00的时间段）
			parseTime : function(right) {
				var me = this,
					d = me._getTodayEnd().getTime(),
					now = d - (me.baseWidth / 2 - right) * 86400 * 1000 / me.baseWidth / me.scale;
				
				now = new Date(now);
				return formatDate(new Date(now), 'hh:mm:ss YYYY/MM/DD');
			},

			timeTo : function(time) {
				var me = this, s, d, t, v;
				if (parseInt(time)) {
					if(time.toString().indexOf('-') != -1){
						time = time.replace(/-/g,"/");
					}
					var now = new Date(time);
					return [
							now.getFullYear(),
							now.getMonth(),
							now.getDate(),
							now.getHours(),
							now.getMinutes(),
							now.getSeconds()];
				} else {
					var s = time.split(' ')[0],
						d = time.split(' ')[1],
						t = s.split('-'),
						v = d.split(':');
					return [t[0], t[1], t[2], v[0], v[1], v[2]];
				}
			},

			// 通过获取播放器的播放时间更改播放时间轴上的指针
			framesMoving : function() {
				var me = this,
					frames = me.frames, time;
				if (true) {
					time = me.fire('framesmove');
					if (!!time) {
						me.ifHasRender(formatDate(new Date(time), 'hh:mm:ss YYYY/MM/DD'));
						me.framesPos(time, 1); //第二个参数代表时间轴自动滚动
						time = new Date(time);
						me.calenExp.setSliderPos([
								time.getFullYear(),
								time.getMonth() + 1,
								time.getDate(),
								time.getHours(),
								time.getMinutes(),
								time.getSeconds()]);
					}
				} else {
					clearInterval(me.setInt);
					me.setInt = false;
				}
			},

			// 设置时间轴内容定时移动
			startMove : function(time) {
				var me = this,
					move = me.framesMoving;
				if(time) me._parseTime = me.changToParseTime(time);
				function _move() {
					move.call(me);
				}
				clearInterval(me.setInt);
				me.setInt = setInterval(_move, 1000);
			},

			// 停止时间轴内容定时移动
			stopMove : function() {
				var me = this;
				clearInterval(me.setInt);
				me.setInt = false;
			},

			// 创建时间轴上的所有 有回放的时间点
			editTimebar : function(start) {
				// initDate修改为今天24:00，即下一天的零点
				var me = this,
					today = new Date( currentTime ),
					todayArr = [today.getFullYear() + '', today.getMonth() + 1 + '', today.getDate() + ''], _timeul,
					startTime = start.split(' ')[0].split('-'),
					noOfDays = (new Date(todayArr[0], todayArr[1] - 1, todayArr[2], 24, 0, 0).getTime() - new Date(
						startTime[0], parseInt(startTime[1]) - 1, startTime[2].slice(0, 2)
					).getTime())
						/ 86400 / 1000,
					timebarContent = me.timebarContent = me.timebarContent
							|| $('<div>').addClass('up_timebar_content');
				
				if (noOfDays > me.noOfDays) {
					me.width = noOfDays * me.baseWidth * me.scale;
					timebarContent.css({
						width : me.width + 'px'
					});

					me.noOfDays = noOfDays;
				} else {
					timebarContent.css({
						width : me.noOfDays * me.baseWidth * me.scale + 'px'
					});
				}
				
				if (me.timebarUl) return;
				_timeul = me.timebarUl = $('<ul>').addClass('up_canle_timebarUl');
				timebarContent.append(_timeul);
				var timebarContentBg = $('<div>').addClass('up_timebar_content_bg'),
					timebarContentBox = $('<div>').addClass('up_timebar_content_box');
				timebarContentBox.append(timebarContent);
				timebarContentBg.append(timebarContentBox);
				me.timebar.append(timebarContentBg);
				me.calendarWrap.append(me.timebar);
				if (!me.frames) me.createframes();
			},

			// 创建时间轴上的 单个 回放的时间点， 被renderVideoPoint调用
			addTimeing : function(start, end, year, month, date, additionalAttr) {
				var me = this,
					li = $('<li>'),
					TIME = 86400;
				// 时间点定位改为以右边为基准，计算其right
				var endDay = end.split(' ')[0].split('-')[2],
					start = start.split(' ')[1].split(':'),
					end = end.split(' ')[1].split(':'),
					endDate = endDay === date ? date : parseInt(date) + 1,
					timestart = new Date(year, month - 1, date, start[0], start[1], start[2]),
					timeend =new Date(year, month - 1, endDate, end[0], end[1], end[2]),
					widthTime = (timeend - timestart) / 86400 / 1000,
					liwidth = me.baseWidth * me.scale * widthTime,
					timeinit = me._getTodayEnd(),
					beginTime = (timeinit - timestart) / 86400 / 1000,
					libegin = me.baseWidth * me.scale * beginTime - liwidth;
				if (liwidth < 0) {
					widthTime = (timeend - timeinit) / 86400 / 1000;
					liwidth = me.baseWidth * me.scale * widthTime;
					libegin = 0;
				}

				li.attr({
					'data-widthtime' : widthTime,
					'data-begintime' : beginTime
				});

				li.css({
					width : Math.ceil(liwidth) + 'px',
					right : Math.ceil(libegin) + 'px'
				});
				if (additionalAttr) {
					li.addClass(me.config.additionalAttr);
				}
				return li;
			},

			// 绘制录像点，如果其各父节点均已创建，则返回false
			renderVideoPoint : function(startSet, endSet, additionalAttrSet) {
				var me = this,
					i = 0,
					len = startSet.length,
					today = new Date( currentTime ),
					todayArr = [today.getFullYear() + '', today.getMonth() + 1 + '', today.getDate() + ''], _start, _end, additionalAttr,
					time = len ? endSet[0].split(' ')[0].split('-') : todayArr,
					endTime = len ? endSet[endSet.length - 1].split(' ')[0].split('-') : todayArr,
					year = time[0],
					month = time[1],
					_timeul = false;

				for (; i < len; i+=1) {
					_start = startSet[i].replace(/^\.*\s/);
					_end = endSet[i];
					additionalAttr = additionalAttrSet[i];
					if (_end > _start) { // 判断片段时间一定要结束时间大于起始时间
						var date = _start.split(' ')[0].split('-')[2];
						me.timebarUl.append(me.addTimeing(_start, _end, year, month, date, additionalAttr));
					}
				};
				return _timeul;
			},
			
			//更新报警信息数据
			updateAlarmMsgData : function(data){
				var me = this,
					detectData;
				me.alarmMsgData = me.alarmMsgData || [];
				var data = [].concat(data);
				
				for(var i=0, len=data.length; i<len; i+=1){
					if(typeof data[i].alarmStartTime == 'undefined'){
						data.splice(i, 1);
						if(!len) break;
						continue;
					}
					
					if(me.alarmMsgData.length){
						for(var j=0, len2 = me.alarmMsgData.length; j < len2; j+=1){
							if(data[i] && data[i].alarmStartTime === me.alarmMsgData[j].alarmStartTime){
								data.splice(i, 1);
								len-=1;
								if(!len) break;
							}
						}		
					}
				}
				
				me.alarmMsgData = me.alarmMsgData.concat(data);
				if(!me.allFiles.length){
					detectData = setTimeout(function(){
							clearTimeout(detectData);
							me.renderAlarmMsg(me.alarmMsgData);
					}, 1000);
				}else{
					me.renderAlarmMsg(data);
				}
			},
			
			//重绘报警气泡
			redrawAlarmMsg : function(){
				var me = this;
				if(typeof me.alarmMsgUl !== 'undefined'){
					me.alarmMsgUl.html ('');
					me.renderAlarmMsg(me.alarmMsgData);
				}
			},
			
			//清除报警气泡所有信息
			clearAlarmMsg : function(){
				var me = this;
				if(typeof me.alarmMsgUl !== 'undefined'){
					me.alarmMsgUl.remove();
					if(me.clearAlarmImg){
						clearTimeout(me.clearAlarmImg);
						delete me.clearAlarmImg;
					}
					delete me.alarmMsgUl;
					delete me.alarmMsgData;
				}
			},
			
			//绘制报警气泡
			renderAlarmMsg : function(data){
				if(!data) return;
				var me = this,
					alarmMsgUl = (me.alarmMsgUl || $('<ul>').addClass('alarm_msg_box')),
					alarmMsgImgBox = me.alarmMsgImgBox = (me.alarmMsgImgBox || $('<ul>').addClass('alarm_msg_img_box')),
					len = data.length,
					beginTime,
					timeinit = me._getTodayEnd().getTime(),
					timestart = 0,
					alarmDuration = 8 / me.baseWidth / me.scale * 86400 * 1000, //一个气泡宽度所占时长(毫秒)
					oFrag = document.createDocumentFragment();  //文档碎片
				me.sortFile(data, 'alarmStartTime');
				
				alarmMsgImgBox.on('mouseover', function(){
					if(me.clearAlarmImg){
						clearTimeout(me.clearAlarmImg);
						delete me.clearAlarmImg;
					}
				});
				
				alarmMsgImgBox.on('mouseout', function(e){
					var e = e || window.event;
					if(((e.target && e.target.className !== 'alarm_msg_arrow') || (e.srcElement && e.srcElement.className !== 'alarm_msg_arrow')) && !me.clearAlarmImg){
						me.clearAlarmImg = setTimeout(function(){
							alarmMsgImgBox.html( '');
							alarmMsgImgBox.css({'display' : 'none'});
						}, 300);
					}
				});
				
				for(var i=0; i<len; i+=1){
					var dataItem = data[i],
						startTime = dataItem.alarmStartTime.split(' '),
						itemStartTime,
						li;
					startTime[0] = startTime[0].split('-');
					startTime[1] = startTime[1].split(':');
					startTime = startTime[0].concat(startTime[1]);
					itemStartTime = new Date(startTime[0], parseInt(startTime[1],10) - 1, startTime[2], startTime[3], startTime[4], startTime[5]).getTime();
					if(timestart + alarmDuration < itemStartTime){
						timestart = itemStartTime;
						var beginTime = (timeinit - timestart) / 86400 / 1000,
							libegin = (me.baseWidth * me.scale * beginTime)-8;
						li = document.createElement('li');
						$(li).attr({'data-begintime' : beginTime});
						li.style.right = libegin + 'px';
						li.imgArr = [{src : changeHttpsPicUrl(dataItem.alarmPicUrl, 125), time : dataItem.alarmStartTime, alarmType : dataItem.alarmType, isEncrypt : dataItem.isEncrypt, deviceSerial:dataItem.deviceSerial}];
						li.onmouseover = function(e){
							if(me.clearAlarmImg){
								clearTimeout(me.clearAlarmImg);
								delete me.clearAlarmImg;
							}
							alarmMsgImgBox.html('');
							var imgFrag = document.createDocumentFragment(),
								imgLen = this.imgArr.length,
								hasRecord;
							for(var i=0; i<imgLen; i+=1){
								var item = this.imgArr[i],
									imgLi = document.createElement('li'),
									imgItem = document.createElement('img');
								if(!item.isEncrypt){
									imgItem.src = item.src;
								}else{
									var pUrl;
									if(/api\/cloud\?method=download/.test(item.src)){
										pUrl = item.src;
									}else{
										pUrl = item.src.split('?')[0];
									}
									var ret = getDecryptContent(pUrl, {
										Serial: item.deviceSerial,
										UserName: $.cookie("DDNSCOOKIE").split(",")[2],
										PermanentKeyMd5: "",
										PermanentKey: ""
									}, 80, 60);
									$(imgItem).attr('data-lParam2', ret);
									
									pluginSpecialEventMsgCallbacks[ret] = function(lParam1, lParam2, lParam3, lParam4, hUser){
											// 成功，则将默认“图像已加密图片”替换，失败不处理
											if(lParam1 === 8) {
												$('img[data-lparam2=' + lParam2 + ']').attr('src', 'data:image/png;base64,' + lParam4);
											}else{
												$('img[data-lparam2=' + lParam2 + ']').attr('src', '/assets/deps/imgs/alarm_img_locked.png');
											}
										}									
								}
								
								imgItem.onerror = function(e){
									this.className = 'error';
									this.src = '/assets/deps/imgs/alarm_img_error.png';
								}
								
								$(imgLi).append(imgItem);
								$(imgLi).append($('<span>').html(item.time.split(' ')[1]));
								
								hasRecord = me.selectSection(item.time, true).index >=0 ? true : false
								if(hasRecord){
									var playBtn = document.createElement('i');
									playBtn.onclick = (function(e){
										var _startTime = item.time;
										return function(){
											me.framesPos(_startTime);
											me.calenExp.setSliderPos(me._strToDateArr(_startTime));
											alarmMsgImgBox.css('display','none');
											var record = me.timeChange(me.changToParseTime(_startTime));
											me.fire('timechange', record);
										}
									})();
									$(imgLi).append(playBtn);
									imgLi.title = alarmType[item.alarmType].txt;
								}else{
									imgLi.title = alarmType[item.alarmType].txt + '（录像不存在或已被覆盖）';
								}
								$(imgFrag).append(imgLi);
							}
							alarmMsgImgBox.append(imgFrag);
							alarmMsgImgBox.append($('<span>').addClass('alarm_msg_arrow'));
							alarmMsgImgBox.css({'display' : 'block', width : 88*imgLen+2+'px', 'right' : parseInt(this.style.right, 10) + parseInt(me.timebarContent[0].style.right, 10) - (88*imgLen)/2 + 8+ 'px'});
						}
						li.onmouseout = function(e){
							me.clearAlarmImg = setTimeout(function(){
								alarmMsgImgBox.html('');
								alarmMsgImgBox.css({'display' : 'none'});
							}, 300);
						}
						$(oFrag).append(li);
					}else{
						li.imgArr.push({src : changeHttpsPicUrl(dataItem.alarmPicUrl, 125), time : dataItem.alarmStartTime, alarmType : dataItem.alarmType, isEncrypt : dataItem.isEncrypt, deviceSerial:dataItem.deviceSerial});
					}
				}
				alarmMsgUl.append(oFrag);
				if(me.alarmMsgUl) return;
				me.alarmMsgUl = alarmMsgUl;
				me.timebarContent.append(alarmMsgUl);
				me.calendarWrap.append(alarmMsgImgBox);
			},

			// 判断后面的时间轴是否已渲染
			ifHasRender : function(parseTime) {
				var me = this, curDate, curDateTime, _time, startYMD, endYMD,
					renderLaterDate = me.renderLaterDate.split(' ')[0].split('-');
				renderLaterDate = new Date(renderLaterDate[0], parseInt(renderLaterDate[1]) - 1, renderLaterDate[2])
						.getTime();
				// renderLaterDate：最前渲染日期当天零点的毫秒数，当指针位于这天12点时立即渲染下一天的时间轴，抛出事件，进行后台录像查询

				curDate = parseTime.split(' ');
				curDate = curDate[1].split('/').concat(curDate[0].split(':'));
				curDate = new Date(curDate[0], parseInt(curDate[1]) - 1, curDate[2], curDate[3], curDate[4], curDate[5]);
				curDateTime = _time = curDate.getTime();
				// curDate：指针当前所在时间点毫秒数
				if (curDateTime < renderLaterDate + (43200 * 1000)) {
					if (curDate.getHours() < 12) {
						_time = curDateTime - (86400 * 1000);
					}
					_time = new Date(_time);

					startYMD = [
							_time.getFullYear(),
							$.pad('0', 2, (_time.getMonth() + 1)),
							$.pad('0', 2, _time.getDate())];
					startYMD = startYMD.join('-');
					endYMD = [
							curDate.getFullYear(),
							$.pad('0', 2, (curDate.getMonth() + 1)),
							$.pad('0', 2, curDate.getDate())];
					endYMD = endYMD.join('-');
					var startAddTime = startYMD + ' 00:00:00',
						// 追加的查询开始时间
						endAddTime = endYMD + ' 23:59:59'; // 追加的查询结束时间
					me.renderLaterDate = startYMD + ' 00:00:00';
					me.editTimebar(startAddTime);

					if (me.data[startYMD]) startYMD = endYMD;
					if (me.data[endYMD]) endYMD = startYMD;
					if (me.data[startYMD] && me.data[endYMD]) return;

					startAddTime = startYMD + ' 00:00:00';
					endAddTime = endYMD + ' 23:59:59';
				}
				
				if (me.marksTime) {
					var marksTimeSec = new Date(
						me.marksTime[0], parseInt(me.marksTime[1]) - 1, me.marksTime[2], 12, 0, 0
					).getTime();
					if (marksTimeSec >= curDateTime + 3600*1000*35 || marksTimeSec <= curDateTime - 3600*1000*35){
						me.renderMarks(parseTime);
					}
				}
			},
			
			//给日历设置录像标记
			setVideoData : function(data){
				this.calen.setVideoData(data);
				this.calenExp.setVideoData(data);
			},
			
			//清除日历录像标记
			clearVideoMark : function(){
				this.calen.clearVideoMark();
				this.calenExp.clearVideoMark();
			},

			// 获取明天零点时间
			_getTodayEnd : function() {
				var today =new Date( currentTime );
				return new Date(today.getFullYear(), today.getMonth(), today.getDate(), 24, 0, 0);
			},

			// 字符串转时间数组（'2013-10-12 14:46:30' to [2013, 10, 12, 14, 46, 30]）
			_strToDateArr : function(str) {
				var str = str.split(' ');
				str[0] = str[0].split('-');
				str[1] = str[1].split(':');
				return [str[0][0], str[0][1], str[0][2], str[1][0], str[1][1], str[1][2]];
			},
			
			//'14:46:30 2013/10/12'转成'2013-10-12 14:46:30'
			_parseTimeFormat : function(_parseTime){
				var parseTime = _parseTime || this._parseTime;
				parseTime = parseTime.split(' ');
				parseTime[1] = parseTime[1].replace(/\//g, '-');
				return parseTime[1] + ' ' + parseTime[0];
			},

			reset : function() {
				var me = this;
				me.stopMove();
				me.setScale(1);
				me.clearAlarmMsg();
				me.clearVideoMark();
				me.allFiles = [];
				me.data = {};
				me.noOfDays = 2;
				me.updateParseTime = true;
				me.width = me.baseWidth * me.noOfDays;
				me.timebarContent.css({
					'width' : me.width + 'px'
				});
				me.calen.reset();
				if (me.frames && me.timebarUl) {
					me.timebarUl.html('');
					var todayTime = me._getTodayEnd().getTime(),
						initTime = new Date(todayTime - (43200 * 1000)), _timeStr;
					_timeStr = new Date(todayTime - (2 * 86400 * 1000));
					me.renderLaterDate = formatDate(initTime, 'YYYY-MM-DD') + ' 00:00:00';
					me.calenExp.setValue([initTime.getFullYear(), initTime.getMonth() + 1, initTime.getDate()].concat([
							12,
							0,
							0]));
					me._parseTime = '12:00:00 ' + formatDate(initTime, 'YYYY/MM/DD');
					initTime = formatDate(initTime, 'YYYY-MM-DD hh:mm:ss');
					me.framesPos(initTime);
				};
			}
		};
	})());

	exports.component = VideoTimeBar;
	/*
	 * 注意position与container的区别，前者是指渲染到，container是组件的外围，并且其内只有组件
	 */

});
