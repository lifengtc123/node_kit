// 录像回放模块
define(function(require, exports) {

	var UserName = $.cookie("DDNSCOOKIE").split(",")[2];
	// -----------------云存储相关属性----------------------//
	// cloud - 云存储定向发布时候开启，1-开启 0-关闭
	// clientSession - 用户登录的完整session值，主要用户云存储C++服务器校验
	var cloud = $.cookie('DDNSCOOKIE').split(',')[9],
		cloudFileInfo = {};
	require('../../../src/business/play_component/uuid');

	var allSeqment = new Object(); // 所以录像片段，根据开始时间区别片段，
	var delSeqments = []; // 被删除的云存储片段
	var cloudSeqment = new Object(); // 保存查询出来的云存储片段
	var yetSearchDate = {};
	var searchTimeArray = {};
    var hasCloudSeqmentFlag = 0;

	function getdelSeqments() {
		return delSeqments;
	}

	function replayRest() {
		allSeqment = new Object();
		cloudSeqment = new Object();
		yetSearchDate = {};
		searchTimeArray = {};
		searchHasDataTimeArray = [];
	}

	function rmYetSearchDate(time) {
		yetSearchDate[time] = null;
	}

	// 报警回放时间转换
	function toDate(time) {
		var date = convertToDate(time);
		var date1 = new Date(date.getTime() - 5000),
			date2 = new Date(date.getTime() + 180000),
			_date1 = toShowTime(date1),
			_date2 = toShowTime(date2),
			_date3 = toShowTime(date2, '00:00:00'),
			_date4 = toShowTime(date2, '23:59:59');
		return [_date1, _date2, _date3, _date4];

	}

	// 默认开始搜索方法
	function searchPlay() {
		// 判断子用户权限
		if (!canSubUserReplay(wall.model.active.info, true)) { return false; }
		var alarmTime, searchStartTime, searchEndTime;
		var urlparams = window.location.href.split('&');
		if ((alarmTime = urlparams.pop()).indexOf('alarmTime') > -1) { // 判断是否有报警时间
			var c = toDate(alarmTime.split('=')[1].replace('%20', ' ')); // 转换成时间片段对象
			// 默认搜索报警消息当天的录像
			gloabStartPlay = c[0];
			searchStartTime = c[2];
			searchEndTime = c[3];
			wall.videoTimeBar.setScale({
				scale : 120,
				marks : 6,
				sliderWidth : 15
			});
		} else {
			var date = new Date( currentTime );
			searchStartTime = toShowTime(date, '00:00:00');
			searchEndTime = toShowTime(date, '23:59:59');
		}
		// 默认搜索今天的的录像
		getSearch(searchStartTime, searchEndTime);
	}

	// 保存搜索过的日期
	function saveYetSearchDateData(searchTime) {
		var _startTime = searchTime.split('-')[0],
			_endTime = searchTime.split('-')[0];
		_startTime = toShowTime(_startTime).split(' ')[0];
		_endTime = toShowTime(_endTime).split(' ')[0];
		yetSearchDate[_startTime] = _startTime;
		yetSearchDate[_endTime] = _endTime;
	}

	function saveSearchTimes(startTime, endTime) {
		var _startTime = startTime.split(' ')[0],
			_endTime = endTime.split(' ')[0];
		window.console && window.console.log("saveSearchTimes startTime " + startTime);
		searchTimeArray[_endTime] = _endTime;
	}

	setInterval(function() {
		console.log && console.log("clear searchTimeArray ");
		searchTimeArray = {}
	}, 3000);

	// 搜索回放录像，直连 及 非直连情况 时间格式 ： 2013-10-26 00:00:00
	function getSearch(startTime, endTime, newPwd, searchType) {
		// 判断子用户权限
		var config = wall.model.active.info;
		if (!canSubUserReplay(config, false)) {
			if (isReal) {
				real.playerHandler(wall, wall.model.active.info, true);
			}
			return false;
		}

		if (searchTimeArray[endTime.split(' ')[0]] && searchType != 4) { return; }
		window.console
				&& window.console.log("getSearch--(startTime--" + startTime + "|endTime--" + endTime + ")"
						+ "searchType : " + searchType);

		wall.lastInfo = config;
		saveSearchTimes(startTime, endTime);

		// 设置每次调用的搜索时间
		wall.searchStartTime = startTime;
		wall.searchEndTime = endTime;

		var searchConfig = {};
		searchConfig.start = startTime;
		searchConfig.end = endTime;

		var playerInfo = $.extend({}, config);
		if (playerInfo.belongDevice_deviceSerial && playerInfo.belongDevice_status == '1') {
			var superDevice = {};
			superDevice.cameraId = playerInfo.belongDevice_deviceSerial;
			superDevice.casIp = playerInfo.belongDevice_casIp;
			superDevice.casPort = playerInfo.belongDevice_casPort;
			superDevice.plainPassword = playerInfo.belongDevice_plainPassword;
			superDevice.deviceSerial = playerInfo.belongDevice_deviceSerial;
			superDevice.devicePort = playerInfo.belongDevice_devicePort;
			superDevice.upnp = playerInfo.belongDevice_upnp;
			superDevice.deviceIp = playerInfo.belongDevice_deviceIp;
			superDevice.httpPort = playerInfo.belongDevice_httpPort;
			superDevice.localDeviceIp = playerInfo.belongDevice_localDeviceIp;
			superDevice.maskIp = playerInfo.belongDevice_maskIp;
			superDevice.localHttpPort = playerInfo.belongDevice_localHttpPort;
			superDevice.localDevicePort = playerInfo.belongDevice_localDevicePort;
			superDevice.netType = playerInfo.belongDevice_netType;
			superDevice.cmdPort = playerInfo.belongDevice_cmdPort;
			superDevice.streamPort = playerInfo.belongDevice_streamPort;
			superDevice.localCmdPort = playerInfo.belongDevice_localCmdPort;
			superDevice.localStreamPort = playerInfo.belongDevice_localStreamPort;
			superDevice.version = playerInfo.belongDevice_version;
			superDevice.releaseVersion = playerInfo.belongDevice_releaseVersion;
			superDevice.status = playerInfo.belongDevice_status;

			superDevice.ipcDeviceSerial = playerInfo.deviceSerial;
			superDevice.ipcChannelNo = playerInfo.channelNo;
			playerInfo = $.extend(playerInfo, superDevice);
			playerInfo.channelNo = playerInfo.belongNo;
		}
		if (searchType == 4) { // 搜索云存储含有数据的日期值
			searchConfig.pwd = newPwd || playerInfo.plainPassword;
			searchConfig.playerInfo = playerInfo;
			searchConfig.player = wall.model.active;
			searchRecordFile(4, searchConfig);
		} else {
			if (playerInfo.casPort <= 0) { // 判断设备没有cas端口，走1.5ehome设备去后台查询录像片段
				var password = wall.model.active.video.el.HWP_GetDevPwd_V16(playerInfo.deviceSerial, username); // 获取设备密码
				if (!password) {
					password = newPwd || DES.decode(playerInfo.plainPassword);
				}
				var url = basePath + '/camera/cameraAction!searchVedioReplay.action',
					plainPassword = password,
					deviceIP = playerInfo.deviceIp,
					httpPort = playerInfo.httpPort;

				searchConfig.url = url;
				searchConfig.deviceIP = deviceIP;
				searchConfig.port = httpPort;
				searchConfig.pwd = plainPassword;
				searchConfig.channelNo = 1;
				searchConfig.iType = 2;
				searchConfig.player = wall.model.active;
				searchRecordFile(1, searchConfig);
			} else {
				searchConfig.pwd = newPwd || playerInfo.plainPassword;
				searchConfig.playerInfo = playerInfo;
				searchConfig.player = wall.model.active;
				searchRecordFile(3, searchConfig);
			}
		}
	}

	var searchHasDataTimeArray = [];

	// 搜索拥有录像数据的时间段
	function searchHasDataTime(searchTime, newPwd) {
		if (wall.model.active.info.releaseVersion == "VERSION_DEFAULT") { return; }
		if (searchTime) {
			var start = toShowTime(searchTime.split('-')[0]);
			var end = toShowTime(searchTime.split('-')[1]);
			start = convertToDate(start);
			end = convertToDate(end);
			start.setDate(1);
			end.setMonth(end.getMonth() + 1);
			end.setDate(0);
			start = toShowTime(start);
			end = toShowTime(end);
			var searchRange = start + '-' + end;
			var str = searchHasDataTimeArray.toString();
			if (str.indexOf(searchRange.toString()) < 0) {
				searchHasDataTimeArray.push(searchRange);
				getSearch(start, end, newPwd, 4);
			}
		}
	}
function getOneDayFilesByPaging(){

}

	// 搜索历史录像文件 type 1 - 1.6流程查询设备录像|2 - 1.7流程查询设备录像|3 - 查询云存储录像|4 - 查询云存储含数据的时间段
	function searchRecordFile(type, config, searchType) {
		if (type == 1) {
			var start = config.start.replace(' ', 'T') + 'Z';
			var end = config.end.replace(' ', 'T') + 'Z';
			data['deviceIP'] = config.deviceIP;
			data['port'] = config.port;
			data['pwd'] = config.pwd;
			data['uuid'] = createUUID();
			data['start'] = start;
			data['end'] = end;
			data['channelNo'] = config.channelNo;
			data = $.param(data); // 生成请求请求数据
			$.ajax({
				type : "POST",
				url : config.url,
				async : true,
				timeout : 5000,
				processData : false,
				data : data,
				dataType : 'json',
				success : function(data) {
					var code = data.resultCode;
					if (code === '1014') {
						modCameraKey.toggle();
						return;
					}
					searchRecordFile(1, data.xml);
				},
				error : function() {
					playerPrompt('搜索录像请求超时');
				}
			});
		}
        else if (type == 2) {
			if (config.playerInfo.status != 1 && hasCloudSeqmentFlag == 0) {
				playerPrompt('设备不在线，请刷新或检查设备网络');
				return;
			}
			var url = searchInfoTmp,
				start = toPlayTime(config.start),
				end = toPlayTime(config.end);
			var reg,
				ipConfig = [
						config.playerInfo.casIp,
						config.playerInfo.casPort,
						username || 'admin',
						DES.decode(config.pwd),
						'Ehome',
						config.playerInfo.deviceSerial,
						config.playerInfo.channelNo.toString().replace(/\d\d$/, ''),
						'255',
						start,
						end];
			ipConfig.map(function(v, i) {
				reg = new RegExp('\\{' + i + '\\}');
				url = url.replace(reg, v);
			});
			wall.model.active.video
					.searchRecord(url, config.pwd, searchType ? searchType : 1, start, end, config.playerInfo);
		}
        else if (type == 3) {
		//	var url = basePath + "/service/cloudService!searchFile.action";
        //    var url = basePath + "/service/cloudService!getOneDayFiles.action";
           var url = "/service/cloudService!searchOnedayPathInfo.action";
			// 默认原有的设备查询
			var channelNo = (config.player.info.channelNo - 2) / 100; // 获取摄像头通道号
			var deviceSerial = config.player.info.deviceSerial; // 设备序列号
			var searchTimeKey = toPlayTime(config.start) + "-" + toPlayTime(config.end);
			// 查询云存储录像片段
			$.ajax({
				type : "POST",
				url : url,
				data : {
				//	fileType : 1, // 文件类型 1 - 录像 2 - 图片
					deviceSerial : deviceSerial, // 设备序列号
					channelNo : channelNo, // 通道号
				//	begin : config.start // 搜索开始时间
                    searchDate: config.start.split(' ')[0]
				},
				success : function(data, textStatus, jqXHR) {
					switch (data.resultCode) {
						case '0' :
					//		var enable = data.enable; // 用户云存储服务器是否开启 1 ：开启 | 0 ：关闭
							var files = data.files;
							var len = files.length;
							if (len > 0) {
                                hasCloudSeqmentFlag =1;
								var recArray = renderRecordSeqment(3, files);
								cloudSeqment[searchTimeKey] = recArray;
								if (config.playerInfo.status == 2) { // 设备不在线，不搜索设备录像
									if (recArray && recArray.length > 0) {
										wall.videoTimeBar.updateRecord(recArray);
										if (isReal) {
											real.playerHandler(wall, wall.model.active.info, true);
										} else {
											startPlayRecord();
										}
									} 
									var calenRange = wall.videoTimeBar.getCalenRang();
									var start = calenRange[0];
									start = start.split(' ')[0];
									start = start.replace(/-|:/g, '');
									var startSearchTime = start + "01T000000Z-" + start + "01T235959Z";
									searchHasDataTime(startSearchTime);
									searchHasDataTime(searchTimeKey);
								}
							} else {
                                if(config.playerInfo.status == 2){
                                	var calenRange = wall.videoTimeBar.getCalenRang();
                                    var start = calenRange[0];
                                    start = start.split(' ')[0];
                                    start = start.replace(/-|:/g, '');
                                    var startSearchTime = start + "01T000000Z-" + start + "01T235959Z";
                                    searchHasDataTime(startSearchTime);
                                    searchHasDataTime(searchTimeKey);
                                }
							}
							// 原有逻辑 控件搜索录像
							searchRecordFile(2, config);
							break;
						default :
							searchRecordFile(2, config);
					};
				},
				error : function() {
					searchRecordFile(2, config);
				}
			});
		}
        else if (type == 4) {
			var url = basePath + "/service/cloudService!searchHasDataTime.action";
			// 默认原有的设备查询
			var channelNo = (config.player.info.channelNo - 2) / 100; // 获取摄像头通道号
			var deviceSerial = config.player.info.deviceSerial; // 设备序列号
			// 查询云存储录像片段
			$.ajax({
				type : "POST",
				url : url,
				data : {
					fileType : 1, // 文件类型 1 - 录像 2 - 图片
					deviceSerial : deviceSerial, // 设备序列号
					channelNo : channelNo, // 通道号
					begin : config.start
				},
				success : function(data, textStatus, jqXHR) {
					switch (data.resultCode) {
						case '0' :
							var dates = data.dates;
							wall.videoTimeBar.setVideoData(dates);
							searchRecordFile(2, config, 2);
							break;
						default :
							searchRecordFile(2, config, 2);
					};
				},
				error : function() {
					searchRecordFile(2, config, 2);
				}
			});
		}
	}

	// 整合云存储录像片段
	function hasmixed(cloudSeqments, startTime, endTime) {
		var onDateSeq = cloudSeqments || [];
		var isInclude = false; // 表示设备录像起止时间在一个云存储时间区间内
		var result = [];
		for (var i = 0; i < onDateSeq.length; i++) {
			var v = onDateSeq[i];
			if (v.isCloud) {
				var cstime = v.stime; // 云存储起始时间
				var cetime = v.etime; // 云存储结束时间
				// 设备开始时间小于云存储起始时间 并且设备结束时间大于云存储结束时间，可以做出2个片段
				if ((startTime < cstime && endTime > cetime) || (startTime == cstime && endTime > cetime)
						|| (startTime < cstime && endTime == cetime)) {
					// ----1----/
					// ---yuns--------------yune---/
					// sdks--------------------sdke/
					// ----2----/
					// yuns-----------------yune---/
					// sdks--------------------sdke/
					// ----3----/
					// ------yuns--------------yune/
					// sdks--------------------sdke/
					var delCloudSeqment = cloudSeqments.splice(i, 1);
					var delSeqment = {
						startTime : startTime,
						endTime : endTime,
						cloudSeqment : delCloudSeqment[0]
					}
					delSeqments.push(delSeqment);
					i--;
				} else if (startTime < cstime && cstime < endTime && endTime < cetime) {
					// ---yuns--------------yune---/
					// sdks-------------sdke-------/
					result.push([startTime, cstime]);
					startTime = startTime;
					endTime = cstime;
				} else if (startTime > cstime && startTime < cetime && endTime > cetime) {
					// yuns-----------------yune---/
					// ----sdks----------------sdke/
					result.push([cetime, endTime]);
					startTime = cetime;
					endTime = endTime;
				} else if (startTime >= cstime && endTime <= cetime) {
					// yuns--------------------yune/
					// -----sdks----------sdke-----/
					isInclude = true;
					break;
				}
			}
		}
		if (result && result.length == 0 && !isInclude) {
			result.push([startTime, endTime]);
		}
		return result;
	}

	// 渲染录像片段 1 - 1.6流程查询设备录像结果|2 - 1.7流程查询设备录像结果|3 - 查询云存储录像结果
	function renderRecordSeqment(type, ret) {
		var beFinish = 0;
		var recArray = [];
		if (type == 1) { // 1.6ajax返回结果
			var xmlDoc = toXML(ret);
			var len;
			if ((len = $(xmlDoc).find('searchMatchItem').length) > 0) {
				for (var i = 0; i < len; i++) {
					var stime = $(xmlDoc).find('startTime').eq(i).text();
					var etime = $(xmlDoc).find('endTime').eq(i).text();
					stime = toShowTime(stime);
					etime = toShowTime(etime);
					addVideoSeqment(stime, etime, false);
					recArray.push({
						stime : stime,
						etime : etime,
						isCloud : false
					})
				};
			}
			beFinish = 1;
		} else if (type == 2) { // 1.7控件抛出结果
			var xmlDoc = toXML(ret, true);
			var searchTime = $(xmlDoc).find('SearchTime').text();
			beFinish = parseInt($(xmlDoc).find('BeFinish').text());
			// 保存录像搜索过的时间段，防止重复搜索
			saveYetSearchDateData(searchTime);
			var cloudSeqments = cloudSeqment[searchTime];
			var files;
			if (((files = $(xmlDoc).find('File')).length) > 0) {
				files.map(function(i, v) {
					stime = $(v).find('StartTime').text();
					etime = $(v).find('StopTime').text();
					stime = toShowTime(stime);
					etime = toShowTime(etime);
					if (etime > stime) { // 判断结束时间一定要大于起始时间
						var timeRanges = hasmixed(cloudSeqments, stime, etime);
						if (timeRanges && timeRanges.length > 0) {
							for (var i = 0; i < timeRanges.length; i++) {
								var timeRange = timeRanges[i];
								addVideoSeqment(timeRange[0], timeRange[1], false);
								recArray.push({
									stime : timeRange[0],
									etime : timeRange[1],
									isCloud : false
								});
							}
						}
					}
				});
			}
			if (beFinish == 1) {
				var calenRange = wall.videoTimeBar.getCalenRang();
				var start = calenRange[0];
				start = start.split(' ')[0];
				start = start.replace(/-|:/g, '');
				var startSearchTime = start + "01T000000Z-" + start + "01T235959Z";
				searchHasDataTime(startSearchTime);
				searchHasDataTime(searchTime);
			}
			if (cloudSeqments && cloudSeqments.length > 0) {
				recArray = recArray.concat(cloudSeqments);
			}
		} else if (type == 3) { // 云存储查询结果
			var files = ret,
				len = files.length;
			for (var i = 0; i < len; i++) {
				var file = files[i];
				if (file.start_time < file.stop_time) {
					// 云存储录像开始时间格式：20131026131214 转换成 2013-10-26 13:12:14
					var stime = toShowTime(file.start_time);
					// 云存储录像结束时间格式：20131026131414 转换成 2013-10-26 13:14:14
					var etime = toShowTime(file.stop_time);
					if (stime && etime) {
						// addVideoSeqment(stime, etime, true, file);
						recArray.push({
							stime : stime,
							etime : etime,
							isCloud : true,
							cloudFile : file
						});
					}
				}
			}
		}
		// 判断1和2, 判断是否进入页面第一次，如果是第一次则，默认播放搜索到第一片段的录像
		if (type != 3) {
			if(type == 4){//修改搜索云录像失败时即使有云录像也不展示的bug
				if(cloudSeqment){
					var cloudSeqments;
					for(var i in cloudSeqment){
						cloudSeqments = cloudSeqment[i];
						recArray = recArray.concat(cloudSeqments);
					}
				}
			}
			if (recArray && recArray.length > 0) { // 判断云存储不进行绘制
				// 渲染时间条
				wall.videoTimeBar.updateRecord(recArray);
				// window.console && window.console.log(recArray);
			}
			queryAlarmList(wall.searchStartTime, wall.searchEndTime);
			if (beFinish == 1) {
				startPlayRecord();
			}
		}
		return recArray;
	}

	// 查询报警信息
	function queryAlarmList(startTime, endTime) {
		var dataConfig = {
			queryType : 3,
			objectName : wall.model.active.info.deviceSerial,
			alarmStart : startTime,
			alarmEnd : endTime,
			alarmType : -1,
			checkState : 2,
			pageStart : 0,
			pageSize : 10000
		};
		var findAlarmLogs = function(dataConfig, callback) {
			$.ajax({
				url : basePath + '/alarmlog/alarmLogAction!findAlarmLogs.action',
				type : 'POST',
				data : dataConfig,
				dataType : 'json',
				timeout : 30000,
				success : function(data, textStatus, jqXHR) {
					callback(data);
				},
				error : function(jqXHR, textStatus, errorThrown) {

				}
			});
		};

		function updateAlarmMsgData(data) {
			wall.videoTimeBar.updateAlarmMsgData(data.alarmLogs);
		}
		findAlarmLogs(dataConfig, updateAlarmMsgData);
	}

	// 默认第一次播放
	function startPlayRecord() {
		if (gloabStartPlay && !wall.model.active.info.replaying) {
			if (gloabStartPlay === true) {
				var date = new Date( currentTime );
				date = toShowTime(date);
				date = date.split(' ')[0];
				var oneDateSeq = allSeqment[date] || [];
				if (oneDateSeq && oneDateSeq.length > 0) {
					autoPlay(oneDateSeq[0].stime);
				} else {
					playerPrompt('没有搜索到录像');
				}
			} else {
				autoPlay(gloabStartPlay);
			}
			gloabStartPlay = false;
		} else {
			//wall.model.active.video.loadingHide();
		}
	}

	// 添加录像片段, 根据开始时间添加到每天的数组中去
	function addVideoSeqment(stime, etime, iscloud, file) {
		var date = stime.split(' ')[0];
		var oneDateSeq = allSeqment[date] || [];
		oneDateSeq.push({
			stime : stime,
			etime : etime,
			isCloud : iscloud,
			cloudFile : file
		});
		allSeqment[date] = oneDateSeq;
	}

	// 判断是否需要搜索前一天和后一天
	function isHasSearch(parseTime, desPwd) {
		var parseDate = parseTime.split(' ')[0];
		if (wall.model.active.info.version == 'V4.1.0 build 130126') { // 判断1.5的设备去，每次去搜索
			getSearch(parseDate + " 00:00:00", parseDate + " 23:59:59", desPwd);
			return;
		}
		if (!yetSearchDate[parseDate]) {
			getSearch(parseDate + " 00:00:00", parseDate + " 23:59:59", desPwd);
		} else {
			var currDate = convertToDate(parseTime);
			if (currDate.getHours() < 12) { // 判断当前时间小于12点，则搜索前一天录像
				var yesterday = new Date(currDate.getTime() - (86400 * 1000));
				var YMD = $.pad('0', 2, yesterday.getFullYear()) + "-" + $.pad('0', 2, yesterday.getMonth() + 1)
						+ "-" + $.pad('0', 2, yesterday.getDate());
			} else { // 反之，则搜索后一天
				var tomorrow = new Date(currDate.getTime() + (86400 * 1000));
				var today = new Date( currentTime );
				var todyYMD = $.pad('0', 2, today.getFullYear()) + "-" + $.pad('0', 2, today.getMonth() + 1) + "-"
						+ $.pad('0', 2, today.getDate());
				var YMD = $.pad('0', 2, tomorrow.getFullYear()) + "-" + $.pad('0', 2, tomorrow.getMonth() + 1) + "-"
						+ $.pad('0', 2, tomorrow.getDate());
				if (YMD > todyYMD) { // 判断时间
					return;
				}
			}
			if (!yetSearchDate[YMD]) { // 判断没有搜索过
				getSearch(YMD + " 00:00:00", YMD + " 23:59:59", desPwd);
			}
		}
	}

	// 自动播放录像片段 时间格式yyyy-MM-dd hh:mm:ss
	function autoPlay(time, newpwd) {
		if(wall.model.active.info.canRemoteReplay =='no'){
			playerPrompt('您没有查看该摄像机远程录像的权限哦~');
			return;
		}
		// 根据时间获取录像片段
		if ($.type(time) == 'string') {
			var recSeqment = wall.videoTimeBar.getRecordByTime(time);
			var stime = time;
		} else {
			var recSeqment = time;
			var ctime = wall.videoTimeBar.getValue();
			if (ctime > recSeqment.stime && ctime < recSeqment.etime) { // 判断指针当前时间点时候大于片段开始时间，小于片段结束时间时
				stime = ctime;
			} else {
				stime = recSeqment.stime;
			}
		}
		// 设置指针位置
		wall.videoTimeBar.startMove(stime);
		isHasSearch(stime);
		if (recSeqment && recSeqment.index >= 0) {
			wall.videoTimeBar.playIndex = recSeqment.index;
			var channelNo = (wall.model.active.info.channelNo - 2) / 100; // 获取摄像头通道号
			var deviceSerial = wall.model.active.info.deviceSerial; // 设备序列号
			var start = toPlayTime(stime);
			var end = toPlayTime(recSeqment.etime);
			if (start <= end) {
				wall.model.active.startPlayTime = start;
				wall.model.active.endPlayTime = end;
				if (recSeqment.isCloud) {
					if(DES.decode(newpwd).length > 0){
                        var cloudFileInfoObj ={
                            channelNo:deviceSerial + "_" + channelNo,
                            fileId:recSeqment.cloudFile.file_id,
                            cloud_type: recSeqment.cloudFile.cloud_type,
                            checkSum: recSeqment.cloudFile.key_checksum,
                            start:start,
                            end:end,
                            pwd:DES.decode(newpwd)
                    };
                        getCloudServerInfoNew(cloudFileInfoObj,playCloudVideo);
					//	playCloudVideo(deviceSerial + "_" + channelNo,recSeqment.cloudFile.file_id, recSeqment.cloudFile.cloud_type, recSeqment.cloudFile.key_checksum, start, end,DES.decode(newpwd));
					}else{
                        var cloudFileInfoObj ={
                            channelNo:deviceSerial + "_" + channelNo,
                            fileId:recSeqment.cloudFile.file_id,
                            cloud_type: recSeqment.cloudFile.cloud_type,
                            checkSum: recSeqment.cloudFile.key_checksum,
                            start:start,
                            end:end
                        };
                        getCloudServerInfoNew(cloudFileInfoObj,playCloudVideo);
					//	playCloudVideo(deviceSerial + "_" + channelNo, recSeqment.cloudFile.file_id,recSeqment.cloudFile.cloud_type, recSeqment.cloudFile.key_checksum, start, end);
					}
					
				} else {
					if (newpwd) {
						playVideo(wall.model.active, wall.model.active.info, start, end, newpwd);
					} else {
						playVideo(wall.model.active, wall.model.active.info, start, end);
					}
				}
				wall.videoTimeBar.startMove();
				return;
			}
		}
		wall.videoTimeBar.framesPos(time);
		playerPrompt('当前时间点无录像视频');
	}

	// 字符串转换成xml对象
	function toXML(xmlStr, grade) {
		var xml;
		if ($.browser.msie & parseInt($.browser.version) < 9) {
			xml = new ActiveXObject("Microsoft.XMLDOM");
			xml.async = false;
			xml.loadXML(xmlStr);
			if (!grade) {
				xml = $(xml).children('cmsearchresult'); // 这里的nodes为最顶级的节点
			}
		} else {
			xml = xmlStr;
		};
		var xmlDoc = $(xml);
		return xmlDoc;
	}

	// 播放视频 直连播放 及 非直连播放
	function playVideo(player, config, startTime, endTime, newPwd) {
		window.console && window.console.log("playVideo  startTime:" + startTime + "|endTime:" + endTime);
		var url, serverInfo,
			err = false, reg;
		var playerInfo = $.extend({}, config);
		if (playerInfo.belongDevice_deviceSerial && playerInfo.belongDevice_status == '1') {
			var superDevice = {};
			superDevice.cameraId = playerInfo.belongDevice_deviceSerial;
			superDevice.casIp = playerInfo.belongDevice_casIp;
			superDevice.casPort = playerInfo.belongDevice_casPort;
			superDevice.plainPassword = playerInfo.belongDevice_plainPassword;
			superDevice.deviceSerial = playerInfo.belongDevice_deviceSerial;
			superDevice.devicePort = playerInfo.belongDevice_devicePort;
			superDevice.upnp = playerInfo.belongDevice_upnp;
			superDevice.deviceIp = playerInfo.belongDevice_deviceIp;
			superDevice.httpPort = playerInfo.belongDevice_httpPort;
			superDevice.localDeviceIp = playerInfo.belongDevice_localDeviceIp;
			superDevice.maskIp = playerInfo.belongDevice_maskIp;
			superDevice.localHttpPort = playerInfo.belongDevice_localHttpPort;
			superDevice.localDevicePort = playerInfo.belongDevice_localDevicePort;
			superDevice.netType = playerInfo.belongDevice_netType;
			superDevice.cmdPort = playerInfo.belongDevice_cmdPort;
			superDevice.streamPort = playerInfo.belongDevice_streamPort;
			superDevice.localCmdPort = playerInfo.belongDevice_localCmdPort;
			superDevice.localStreamPort = playerInfo.belongDevice_localStreamPort;
			superDevice.version = playerInfo.belongDevice_version;
			superDevice.releaseVersion = playerInfo.belongDevice_releaseVersion;
			superDevice.status = playerInfo.belongDevice_status;

			superDevice.ipcDeviceSerial = playerInfo.deviceSerial;
			superDevice.ipcChannelNo = playerInfo.channelNo;
			playerInfo = $.extend(playerInfo, superDevice);
			playerInfo.channelNo = playerInfo.belongNo;
		}
		config = playerInfo;
		if ((config.status == 0 || config.upnp === '1') && config.deviceIp) {
			if ($.cookie("USERIPCOOKIE") === config.deviceIp) { // 判断用户本地IP与设备的IP相同，直连设备PISA取流
				url = 'rtsp://' + config.localDeviceIp + ':' + config.localDevicePort + '/PSIA/streaming/tracks/'
						+ config.channelNo.toString().replace(/\d$/, '1') + '?starttime=' + startTime + '&endtime='
						+ endTime + '&' + config.httpPort + '&' + username + '&' + config.deviceSerial;
			} else {
				url = 'rtsp://' + config.deviceIp + ':' + config.devicePort + '/PSIA/streaming/tracks/'
						+ config.channelNo.toString().replace(/\d$/, '1') + '?starttime=' + startTime + '&endtime='
						+ endTime + '&' + config.httpPort + '&' + username + '&' + config.deviceSerial;
			}
		} else { // E家回放
			stun = stun || getStun();
			stun.splice(4, 2, config.vtmIp, config.vtmPort);
			stun.map(function(v, i) {
				err = err || (!(i % 2) && (v === 'null' || v === ''));
			});
			if (err) {
				resetServerInfo();
			}
			serverInfo = serverInfoTmp;
			stun.map(function(v, i) {
				reg = new RegExp('\\{' + i + '\\}');
				serverInfo = serverInfo.replace(reg, v);
			});
			// E家取流URL
			url = ['Efile://', // stream_type
					(config.deviceIp || '120.0.0.1') + ':', // internet_ip
					(config.httpPort || '80') + ':', // internet_http_port
					(config.localDeviceIp || '127.0.0.1') + ':', // local_ip
					(config.maskIp || '255.255.255.255') + ':', // local_mask
					(config.localHttpPort || '80') + ':', // local_http_port
					config.netType + ':', // net_type
					config.deviceSerial + ':', // device_index_code
					config.channelNo.toString().replace(/\d\d$/, '') + ':', // channel_no
					(config.version != 'V4.1.0 build 130126' ? '1' : '0') + ':', // stream_type
					'0' + ':', // pu_link_type
					config.casIp + ':', // ppvs_ip
					config.casPort + '?',
					config.localDevicePort,
					'&' + username + '&' + config.deviceSerial].join(''); // ppvs_port

		}

		var iPlayType = 2;// 回放
		// 调用video.js中播放接口
		var ret = player.video
				.play(url, config.plainPassword, 0, iPlayType, startTime, endTime, serverInfo, newPwd, config);
		if (ret === 0) {
			player.info = player.video.info = wall.model.active.info;
			listInfo[config.cameraId] = config;
			config.wall = player.index;
		}
	}

	// 播放云存储录像回放
	function playCloudVideo(cloudFileInfoObj) {
		// 调用getCloudStreamServer.js中的方法获取云存储stream服务器信息
		var cloudServerInfo = {CloudServerIp:cloudFileInfoObj.CloudServerIp,CloudServerPort:cloudFileInfoObj.CloudServerPort};
		if ($.isEmptyObject(cloudServerInfo)) {
			playerPrompt('当前无可用的stream服务器');
			window.console && window.console.log('当前无可用的stream服务器');
			return;
		}
		var fileInfo = {
			Session : clientSession,
			CameraId : cloudFileInfoObj.channelNo,
            FileIdEx :cloudFileInfoObj.fileId,
			BeginTime : cloudFileInfoObj.start.replace(/-|:/g, ''),
			EndTime : cloudFileInfoObj.end.replace(/-|:/g, ''),
			UserName : UserName,
			PermanentKeyMd5 : cloudFileInfoObj.checkSum,
			PermanentKey : cloudFileInfoObj.pwd ? cloudFileInfoObj.pwd:'',
            FileType:cloudFileInfoObj.fileType
		};
		var serverInfoStr = JSON.stringify(cloudServerInfo);
		var fileInfoStr = JSON.stringify(fileInfo);
		var ret = wall.model.active.video.el.HWP_StartCloudReplay(0, serverInfoStr, fileInfoStr);
		if (ret === -1) {
			playerPrompt('播放失败');
		} else {
			wall.model.active.info = wall.model.active.video.info = wall.model.active.info;
			wall.model.active.info.wall = wall.model.active.index;
		}

	}

	// 设置下一个录像
	function setNextRecordInfo(file) {
		var player = wall.model.active.video,
			iWndNum = 0, iRecordType, szRecordInfo, szServerInfo, sStartTime, sStopTime, ret;
		if (file) {
			iRecordType = file.isCloud ? 2 : 1; // 判断录像类型
			// 转换录像播放时间
			sStartTime = toPlayTime(file.stime); // 起始时间
			sStopTime = toPlayTime(file.etime); // 结束时间
			if (iRecordType == 2) { // 云存储录像
				// 调用getCloudStreamServer.js中的方法获取云存储stream服务器信息
				var cloudServerInfo =  {
                    CloudServerIp:file.CloudServerIp,
                    CloudServerPort:file.CloudServerPort
            }
				if ($.isEmptyObject(cloudServerInfo)) {
					window.console && window.console.log('当前无可用的stream服务器');
					return;
				}
				var channelNo = (wall.model.active.info.channelNo - 2) / 100; // 获取摄像头通道号
				var deviceSerial = wall.model.active.info.deviceSerial; // 设备序列号
				var fileInfo = {
					Session : clientSession,
					CameraId : deviceSerial + "_" + channelNo,
					BeginTime : sStartTime,
					EndTime : sStopTime,
					UserName : UserName,
					PermanentKeyMd5 : file.cloudFile.key_checksum,
					PermanentKey : ''
				};
				szRecordInfo = JSON.stringify(fileInfo);
				szServerInfo = JSON.stringify(cloudServerInfo);
			} else { // 普通回放录像
				var config = wall.model.active.info;

				var playerInfo = $.extend({}, config);
				if (playerInfo.belongDevice_deviceSerial && playerInfo.belongDevice_status == '1') {
					var superDevice = {};
					superDevice.cameraId = playerInfo.belongDevice_deviceSerial;
					superDevice.casIp = playerInfo.belongDevice_casIp;
					superDevice.casPort = playerInfo.belongDevice_casPort;
					superDevice.plainPassword = playerInfo.belongDevice_plainPassword;
					superDevice.deviceSerial = playerInfo.belongDevice_deviceSerial;
					superDevice.devicePort = playerInfo.belongDevice_devicePort;
					superDevice.upnp = playerInfo.belongDevice_upnp;
					superDevice.deviceIp = playerInfo.belongDevice_deviceIp;
					superDevice.httpPort = playerInfo.belongDevice_httpPort;
					superDevice.localDeviceIp = playerInfo.belongDevice_localDeviceIp;
					superDevice.maskIp = playerInfo.belongDevice_maskIp;
					superDevice.localHttpPort = playerInfo.belongDevice_localHttpPort;
					superDevice.localDevicePort = playerInfo.belongDevice_localDevicePort;
					superDevice.netType = playerInfo.belongDevice_netType;
					superDevice.cmdPort = playerInfo.belongDevice_cmdPort;
					superDevice.streamPort = playerInfo.belongDevice_streamPort;
					superDevice.localCmdPort = playerInfo.belongDevice_localCmdPort;
					superDevice.localStreamPort = playerInfo.belongDevice_localStreamPort;
					superDevice.version = playerInfo.belongDevice_version;
					superDevice.releaseVersion = playerInfo.belongDevice_releaseVersion;
					superDevice.status = playerInfo.belongDevice_status;

					superDevice.ipcDeviceSerial = playerInfo.deviceSerial;
					superDevice.ipcChannelNo = playerInfo.channelNo;
					playerInfo = $.extend(playerInfo, superDevice);
					playerInfo.channelNo = playerInfo.belongNo;
				}
				config = playerInfo;

				var forceStreamType = config.forceStreamType - 0;// 强制使用某种取流方式 0-Auto 1-直连 2-P2P 3-VTDU

				var devInfo = new Object();
				devInfo.Serial = config.deviceSerial;
				devInfo.InternetIP = config.deviceIp;
				devInfo.InternetCmdPort = config.cmdPort;
				devInfo.InternetStreamPort = config.streamPort;
				devInfo.InnerIP = config.localDeviceIp;
				devInfo.InnerCmdPort = config.localCmdPort;
				devInfo.InnerStreamPort = config.localStreamPort;
				devInfo.NATType = config.netType;
				devInfo.Channel = (config.channelNo - 2) / 100;
				devInfo.ChannelSerial = config.ipcDeviceSerial;
				devInfo.StreamType = config.quality;
				devInfo.TransProto = 'TCP';
				devInfo.IsEncrypt = config.isEncrypt == 0 ? false : true;
				devInfo.UserName = username;
				devInfo.PermanentKeyMd5 = config.encryptPwd;
				devInfo.PermanentKey = "";
				devInfo.ISP = $.cookie("ISP") - 0;

				// 构造服务器信息对象
				var serverInfo = new Object();
				serverInfo.vtmIP = config.vtmIp;
				serverInfo.vtmPort = config.vtmPort;
				serverInfo.casIP = config.casIp;
				serverInfo.casPort = config.casPort;
				serverInfo.tokenUrl = config.authSvrAddr;

				szRecordInfo = JSON.stringify(devInfo);
				szServerInfo = JSON.stringify(serverInfo);;
			}

			try {
				window.console && window.console.log("szRecordInfo  | " + szRecordInfo);
				window.console && window.console.log("szServerInfo  | " + szServerInfo);
				var sessionId = $.cookie("DDNSCOOKIE").split(',')[0];
				// 设置下个片段录像
				ret = player.el
						.HWP_SetNextRecordInfo(iWndNum, sessionId, iRecordType, szRecordInfo, szServerInfo, sStartTime, sStopTime);
			} catch (e) {
				window.console && window.console.log("调用接口失败，" + e);
			}
			if (ret == 1) {
				window.console && window.console.log("调用接口HWP_SetNextRecordInfo成功");
			}
		}
	}

	// ---------------------时间格式转换-----------------------//
	// 转换成20131026T121314Z(yyyyMMddTHHmmssZ)的播放时间格式
	function toPlayTime(time) {
		var date = convertToDate(time);
		if (date) {
			var playTime = $.pad('0', 2, date.getFullYear()) + '' + $.pad('0', 2, date.getMonth() + 1)
					+ $.pad('0', 2, date.getDate()) + 'T' + $.pad('0', 2, date.getHours())
					+ $.pad('0', 2, date.getMinutes()) + $.pad('0', 2, date.getSeconds()) + 'Z';
			return playTime;
		}
		return "";
	}

	// 把字符串格式的日期转换成日期
	function convertToDate(time) {
		if ($.type(time) === "date") {
			return time;
		} else if ($.type(time) === "string") {
			var date = time.match(/(\d{2})/g);
			date[0] = date.shift() + date[0];
			date = new Date(date[0], date[1] - 1, date[2], date[3], date[4], date[5]);
			if ((typeof date == 'object') && date.constructor == Date) { return date; }
		} else if ($.type(time) === "array") {
			var date =new Date(time[0], time[1] - 1, time[2], time[3], time[4], time[5]);
			if ((typeof date == 'object') && date.constructor == Date) { return date; }
		}
		return null;
	}

	// 转换成标准格式的时间，(yyyy-MM-dd HH:mm:ss)
	function toShowTime(time, timeStr) {
		var date = convertToDate(time);
		if (date) {
			if (!timeStr) {
				timeStr = $.pad('0', 2, date.getHours()) + ':' + $.pad('0', 2, date.getMinutes()) + ':'
						+ $.pad('0', 2, date.getSeconds());
			}
			return $.pad('0', 2, date.getFullYear()) + '-' + $.pad('0', 2, date.getMonth() + 1) + '-'
					+ $.pad('0', 2, date.getDate()) + ' ' + timeStr;
		}
		return "";
	}

	// 查询中删除片段中是否包含相应的云存储片段
	function hasCloudSeqment(start, end, currentTime) {
		for (var i = 0; i < delSeqments.length; i++) {
			var seq = delSeqments[i];
			var cloudSeqment = seq.cloudSeqment;
			if (toPlayTime(seq.startTime) <= start
					&& toPlayTime(seq.endTime) == end
					&& (toPlayTime(cloudSeqment.stime) <= toPlayTime(currentTime) && toPlayTime(currentTime) <= toPlayTime(cloudSeqment.etime))) {
				cloudSeqment.index = 9999;
				return cloudSeqment;
			}
		}
		return null;
	}

	function canSubUserReplay(config, showError) {
		if (currentUserType == 2) { // 判断是否当前登录账户时候子账户
			if (config.canRemoteReplay == 0) { // 判断是否有远程回放权限
				wall.model.active.info.playing = false;
				wall.updateStatus();
				if (showError) {
					playerPrompt('您没有查看该设备远程录像的权限哦~');
				}
				return false;
			}
//			else if (config.isEncrypt == 1) { // 判断摄像机是否开启加密模式
//				wall.model.active.info.playing = false;
//				wall.updateStatus();
//				dialog.show({
//					'title' : '提示',
//					'content' : '您的视频已加密，无法查看，请联系主用户',
//					'type' : 'warn',
//					'cancelBtn' : false,
//					'callback' : function() {
//						playerPrompt('视频已加密，播放失败');
//					},
//					'closeCallback' : function() {
//						playerPrompt('视频已加密，播放失败');
//					},
//					'isIframe' : true
//				});
//				return false;
//			}
		}

        

		return true;
	}

	exports.replay = {
		searchPlay : searchPlay,
		getSearch : getSearch,
		searchRecordFile : searchRecordFile,
		searchHasDataTime : searchHasDataTime,
		startPlayRecord : startPlayRecord,
		isHasSearch : isHasSearch,
		renderRecordSeqment : renderRecordSeqment,
		autoPlay : autoPlay,
		playVideo : playVideo,
		playCloudVideo : playCloudVideo,
		toPlayTime : toPlayTime,
		toShowTime : toShowTime,
		replayRest : replayRest,
		setNextRecordInfo : setNextRecordInfo,
		rmYetSearchDate : rmYetSearchDate,
		hasCloudSeqment : hasCloudSeqment,
		getdelSeqments : getdelSeqments,
		canSubUserReplay : canSubUserReplay
	};
});
