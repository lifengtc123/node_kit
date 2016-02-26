

/**
	 * @method getDecryptContent
	 * 
	 * @param {String} pURl 远程文件url 0 远程文件
	 * @param {JSON} pDevInfo json格式设备信息
	 * @param {String} pDevInfo.Serial 设备序列号
	 * @param {String} pDevInfo.UserName
	 * @param {String} pDevInfo.PermanentKeyMd5 设备当前存储密钥两次md5加密后的值
	 * @param {String} pDevInfo.PermanentKey 存储密钥、固定密钥，明文
	 * 
	 * @param {Number} nWidth 图片最大宽度（注：IE8用base64显示图片，图片内容必须在32K内，根据经验图片长宽控制在400*400内即可）
	 * @param {Number} nHeight 图片最大高度
	 * @returns {Number} 任务号 >0 失败 -1
	 */
	window.getDecryptContent = function(pURl, pDevInfo, nWidth, nHeight) {
		var shipin7Plugin = document.getElementById('shipin7Plugin');
		return shipin7Plugin.HWP_GetDecryptContent_V17(0, pURl, JSON.stringify(pDevInfo), nWidth, nHeight);
	}
	
	/**
	 * 全局回调函数对象：pluginSpecialEventMsgCallbacks
	 */
	window.pluginSpecialEventMsgCallbacks = {};
	/**
	 * 加密图片解密抛出事件接口：PluginSpecialEventMsg
	 * 获取图片内容结果通过PluginSpecialEventMsg 事件抛出
	 * 
	 * @param {Number} lParam1 事件编号，8（成功），9（失败）
	 * @param {Number} lParam2 此处为调用HWP_GetDecryptContent_V17返回的任务编号
	 * @param {Number} lParam3 此处为错误号
	 * 605 非加密图片
	 * 2012  密钥错误
	 * 3222 aes解密失败
	 * 18 接收失败，此处指下载图片出错
	 * 16 连接失败，此处指连接PMS失败
	 * 
	 * @param {Number} lParam4 返回的图片Base64内容，失败为空字符
	 * @param {Number} hUser 用户数据
	 */
	window.PluginSpecialEventMsg = function(lParam1, lParam2, lParam3, lParam4, hUser) {
		if(pluginSpecialEventMsgCallbacks[lParam2]){
			pluginSpecialEventMsgCallbacks[lParam2].call(null, lParam1, lParam2, lParam3, lParam4, hUser);
		}
		
	};
	

	
	// 对应http端口与https的端口映射
	var portMap = {}
	var pmsCookie = $.cookie("PMSCOOKIE");
	if (pmsCookie) {
		try {
			pmsCookie = '[' + pmsCookie.split('|').join(',') + ']';
			var pmsMaps = eval('(' + pmsCookie + ')');
			for ( var i = 0; i < pmsMaps.length; i++) {
				var pms = pmsMaps[i];
				if (!$.isEmptyObject(pms)) {
					portMap[pms.http] = pms;
				}
			}
		} catch (e) {
			Log('解析PMS数据错误');
			Log(e);
		}
	}
	// 根据当前协议转换图片URL
	window.changeHttpsPicUrl = function(picUrl, x){
		if (/cloud/.test(picUrl)) {
			picUrl = picUrl + "&session=" + encodeURIComponent($.cookie('STORAGESESSION'));
			if (x > 0) {
				picUrl += "&x=" + x;
			}
		} else {
			var protocol = window.location.protocol;
			var uri = io.util.parseUri(picUrl);
			if (uri.protocol == 'http' && protocol == 'https:') {
				if (!$.isEmptyObject(portMap)) {
					if (uri.port && !$.isEmptyObject(portMap[uri.port])) {
						picUrl = picUrl.replace('http:', protocol);
	                    picUrl = picUrl.replace(':' + uri.port + '/', ':' + portMap[uri.port].https + '/');
	                    if (uri.host) {
	                        picUrl = picUrl.replace(uri.host, portMap[uri.port].domain);
	                    }
	                }
				}
			}
			picUrl = picUrl.split("?")[0];
			if (x > 0) {
				picUrl += "?x=" + x;
			}
		}
		return picUrl;
	}
	
	$(function() {
		
		window.WEB_SOCKET_SWF_LOCATION = "WebSocketMain.swf";
		
		// 0 家庭
		// 1 企业
        if($.cookie("DDNSCOOKIE")!=null){
            var userType = $.cookie("DDNSCOOKIE").split(',')[7];
        }
		var STORAGESESSION = $.cookie('STORAGESESSION');
			
		/**
		 * @method getConfig 获取配置信息
		 */
		function getConfig(){
			var config = {};
            if($.cookie("DDNSCOOKIE")!=null){
             var   DDNSCOOKIE = $.cookie("DDNSCOOKIE").split(",");
            }
			if (!!DDNSCOOKIE) {
                var	tempArr = DDNSCOOKIE[8].split(":");
				config.serverIP = tempArr[0];
				config.serverPort = tempArr[1];
				config.userName = DDNSCOOKIE[2];
				config.userCategory = DDNSCOOKIE[7],
				config.sessionId = DDNSCOOKIE[0];
			}
			return config;
		}
		
		/**
		 * 连接NodeJS服务器，并返回创建的Socket连接对象
		 */
		function connect(config){
			var serverIP = config.serverIP,
				serverPort = config.serverPort,
				userName = config.userName,
				sessionId = config.sessionId;
			
			if(!serverIP || !serverPort) {
				return;
			}
			// TODO
			// 本地测试，需要删除
			//var socket = io.connect("https://" + serverIP + ":" + serverPort);
			var socket = io.connect(serverIP + ":" + serverPort);
			socket.on("connect", function(){
				// 连接成功后发送一条注册消息到服务器
				socket.send(JSON.stringify({
					type : 'subscribe',
					sessionId : sessionId,
					destination : userName
				}));
				
				// 处理消息方法
				socket.on("message", function(message){
					var parsed = JSON.parse(message);
					counter++;
					$pic.attr('src','');
					$desc.html('');
					$time.html('');
					switch(parsed.messageType) {
						case "1":// 普通报警消息
							showAlarmMessage(parsed);
							// 修改消息数字
							globalNamespace.updateNumberUI(1, 0, 0);
							break;
						case "2":// 留言消息
							showLeaveMessage(parsed);
							// 修改消息数字
							globalNamespace.updateNumberUI(0, 1, 0);
							break;
						default:
							break;
					}
				});
			});
				
			// socket注销消息方法
			socket.unsubscribe = function(destination){
				socket.send(JSON.stringify({
					type : 'unsubscribe',
					destination : destination
				}));
			};
			
			return socket;
		}
		
		var $pic = $("#socketMessage .pic"),
			$desc = $("#socketMessage .desc"),
			$time = $("#socketMessage .time"),
			$close = $("#socketMessage .close"),
			$socketMessage = $("#socketMessage"),
			$socketMessageLink = $("#socketMessageLink"),
			$socketIframe = $("#socketIframe"),
			$socketNum = $("#socketNum");
		
		var timeHandler;//定时器
		
		//推送消息：
		//显示最新推送消息的数字，超过100条时显示99+；
		//（数字为最新推送过来的消息数量，不分设备，不查历史）
		var counter = 0;
		
		/**
		 * 判断图片是否加密
		 */
		function isEncrypted(picUrl) {
			return /isEncrypted=1/.test(picUrl);
		}
		
		/**
		 * 获取图片真实地址
		 */
		function getRealPicUrl(picUrl) {


			if(/isCloudStored=1/.test(picUrl)){

                if(/isCloudStored=1/.test(picUrl)){
                    if( /\?/.test(picUrl) ){
                        return picUrl + "&x=125&session=" + encodeURIComponent(STORAGESESSION);
                    }else{
                        return picUrl + "?x=125&session=" + encodeURIComponent(STORAGESESSION);
                    }
                }
			}
			picUrl = changeHttpsPicUrl(picUrl, 125);
			return picUrl;
		}
		
		/**
		 * 事件消息推送
		 * type：标识消息类型，值固定是'message'。
		 * messageType:业务消息类型，1 普通报警消息，2 留言消息
		 * alarmID：报警ID。
		 * alarmType：报警类型。
		 * deviceSeril：设备序列号。
		 * alarmTime：报警时间。
		 * channelID：通道ID。
		 * channelName：通道名称。
		 * picUrl：图片URL。
		 * recordUrl：录像URL。
		 * source：消息发送的源地址，'src'是发送这条消息的源。
		 * content：消息发送的内容。
		 */
		function showAlarmMessage(data) {
			Log(data);
			var alarmType = Number(data.alarmType),
				alarmTime = data.alarmTime,
				realPicUrl = "",
				picUrl = "",
				current = new Date();
				//content = data.content.replace( /\(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\)/, function($1){ return '' });
			
			content = data.channelName + '发生报警了';
			
			if(alarmType === 10000 || alarmType === 10002) { // 移动侦测报警
				content = data.channelName + '检测到了一个活动事件';
			}
			
			if(alarmType === 10001) { // 紧急遥控按钮事件
				content = data.channelName + '的紧急按钮被触发了';
			}
			
			if(alarmType === 10003) { // 婴儿啼哭报警
				content = '您的宝宝哭了';
			}
			if(alarmType === 10017) { // 婴儿啼哭报警
				content = data.channelName + '发生摄像机失去管理';
			}
            if(alarmType === 10018){    //幕帘
                content = data.channelName + '发生报警了';
            }
            if(alarmType === 10019){    //单体门磁
                content = data.channelName + '发生报警了';
            }

			$time.html("今天 " + alarmTime.split(" ")[1]);
			
			if((alarmType >= 10004 && alarmType <= 10010) || (alarmType >= 10018 && alarmType <= 10019)) {// 连接A1报警器产生的报警--10018,10019幕帘和单体门磁
                if (alarmType == 10004) { // 门磁
                    realPicUrl = basePath + "/image/CS-A1-RELATED/magnetometer.png";
                } else if (alarmType == 10005) { // 烟感
                    realPicUrl = basePath + "/image/CS-A1-RELATED/fire.png";
                } else if (alarmType == 10006) { //可燃气体  gas
                    realPicUrl = basePath + "/image/CS-A1-RELATED/gas.png";
                } else if (alarmType == 10007) { // 入侵报警 tamper
                    realPicUrl = basePath + "/image/CS-A1-RELATED/telecontrol.png";
                } else if (alarmType == 10008) { // 水浸报警 waterlogging
                    realPicUrl = basePath + "/image/CS-A1-RELATED/waterlogging.png";
                } else if (alarmType == 10009) {// 紧急遥控按钮事件 callhelp
                    realPicUrl = basePath + "/image/CS-A1-RELATED/callhelp.png";
                } else if (alarmType == 10010) {// 人体感应事件 pir
                    realPicUrl = basePath + "/image/CS-A1-RELATED/pir.png";
                } else if (alarmType == 10018 ) {// 幕帘感应事件 curtain
                    realPicUrl = basePath + "/image/CS-A1-RELATED/curtain.png";
                } else if (alarmType == 10019 ) {// 单体门磁感应事件 move_magnetometer
                    realPicUrl = basePath + "/image/CS-A1-RELATED/move_magnetometer.png";
                } else {
                    realPicUrl = basePath + "/image/CS-A1-RELATED/alertor.png";
                }
			} else if(alarmType == 10017 ){
				realPicUrl = basePath + "/image/CS-X3-108/1_web.jpeg";
			} else {// 人体感应报警、紧急遥控按钮报警
				if(isEncrypted(data.picUrl)) { // 图片加密
					picUrl = getRealPicUrl(data.picUrl);
					realPicUrl = basePath + "/src/common/imgs/125.gif";
					var pURl;
					if(/isCloudStored=1/.test(picUrl)){
						pURl = picUrl;
					}else{
						pURl = picUrl.split("?")[0];
					}
					var pDevInfo = {
						Serial: data.deviceSeril,
						UserName: config.userName,
						PermanentKeyMd5: "",
						PermanentKey: ""
					};
					
					var ret = getDecryptContent(pURl, pDevInfo, 60, 55);

                    /* =S 打印测试 无限调用控件下载图片问题 */
                    window.console && console.log('pURl:',pURl,'ret:',ret);
                    /* =E 打印测试 无限调用控件下载图片问题 */

					pluginSpecialEventMsgCallbacks[ret] = function(lParam1, lParam2, lParam3, lParam4, hUser) {
                        window.console && console.log('lParam1：',lParam1);
						// 成功，则将默认“图像已加密图片”替换，失败不处理
						if(lParam1 === 8) {
							$pic.attr({
								'src': 'data:image/png;base64,' + lParam4
								
							});
						}else{
							$pic.attr('src', basePath + "/assets/icons/img_locked.png");
						}
					}
				} else {
					realPicUrl = changeHttpsPicUrl(data.picUrl, 125);
				}
			}
			
			$pic.attr({
				"src": realPicUrl
			});
			
			if(counter > 100) {
				$socketNum.html("99+");
			} else {
				$socketNum.html(counter);
			}

			$socketMessageLink.attr({
				"href": basePath + "/alarmlog/alarmLogAction!goToAlarmLogQuery.action"
			});

            if (alarmType == 10016) {
                content='';
                content = data.content;
            }

			$desc.html(content);
			
			if(!$socketMessage.hasClass("fadeInDown")) {
				$socketIframe.show();
				$socketMessage.removeClass("fadeOutUp").addClass("fadeInDown");
				$socketMessage.show();
			}
			
			if(timeHandler) {
				clearTimeout(timeHandler);
			}
			
			timeHandler = setTimeout(function(){
				$socketMessage.removeClass("fadeInDown").addClass("fadeOutUp");
				$socketIframe.hide();
				counter = 0;
				if (util.browser.isIE) {
					$socketMessage.hide();
				}
			}, 1000000);
		}
		
		/**
		 * 留言消息推送
		 * type：标识消息类型，值固定是'message'。
		 * messageType:业务消息类型，1 普通报警消息，2 留言消息
		 * destination：消息发送的目标地址，'dest'是当前客户端到的目标地址。
		 * lmID：留言ID。
		 * lmType：留言类型。1表示语音留言，2表示视频留言
		 * deviceSeril：设备序列号。
		 * lmTime：留言时间。
		 * deviceName：设备名称。
		 * source：消息发送的源地址，'src'是发送这条消息的源。
		 */
		function showLeaveMessage(data) {
			Log(data);
			
			// 留言消息暂时没有截图，根据用户类型，显示相应的默认图片
			if(userType === "1") { // 企业用户
				$pic.attr({
					"src": "/assets/icons/icon_every_t1_s2.png"
				});
			} else {
				$pic.attr({
					"src": "/assets/icons/icon_every_t1_s1.png"
				});
			}
			
			if(counter > 100) {
				$socketNum.html("99+");
			} else {
				$socketNum.html(counter);
			}
			
			$socketMessageLink.attr({
				"href": basePath + "/leaveMessage/leaveMessageAction!goToLeaveMessageQuery.action"
			});
			
			$desc.html(data.deviceName + '给您发了一条留言哦');
			$time.html("今天 " + data.lmTime.split(" ")[1]);
			if(!$socketMessage.hasClass("fadeInDown")) {
				$socketIframe.show();
				$socketMessage.removeClass("fadeOutUp").addClass("fadeInDown");
				$socketMessage.show();
			}
			
			if(timeHandler) {
				clearTimeout(timeHandler);
			}
			
			timeHandler = setTimeout(function(){
				$socketMessage.removeClass("fadeInDown").addClass("fadeOutUp");
				$socketIframe.hide();
				counter = 0;
				if (util.browser.isIE) {
					$socketMessage.hide();
				}
			}, 10000);
		}
		
		$close.click(function() {
			$socketMessage.removeClass("fadeInDown").addClass("fadeOutUp");
			$socketIframe.hide();
			if (util.browser.isIE) {
				$socketMessage.hide();
			}
			clearTimeout(timeHandler);
			counter = 0;
		});
		
		/**
		 * 页面离开时发送一条注销信息
		 */
		window.onunload = function(){
			try{
				if (socketConn) {
					socketConn.unsubscribe(config.userName);
				}
			}catch(e){
				
			}
		};
		
		var config = getConfig();

		// 测试配置，请不要删除
		/* config = {
			serverIP : "127.0.0.1",
			serverPort : 3000,
			userName : "wanggan",
			userCategory : 1,
			sessionId : "helloworld"
		}; */
		
		if (config.userCategory !=='2') {
			window.socketConn = connect(config);
		}
		
		/**
		 * 下面跟消息数字相关
		 * -------------------------------------------------------------------------
		 */
		// 判断是否是消息页面
		function isMessagePage() {
			var href = window.location.href;
			return /goToAlarmLogQuery/.test(href) || /goToLeaveMessageQuery/.test(href) || /goToBullentinPage/.test(href) || /fetchDailyReport/.test(href);
		}
		
		// 获取未读事件消息、未读留言消息以及未读系统消息的个数
		function findAllUnCheckLogCount(succCall,failCall) {
			$.ajax({
				url : basePath + '/alarmlog/alarmLogAction!findAllUnCheckLogCount.action',
				type : 'POST',
				timeout : 30000,
				success : function(data, status){
					succCall(data);
				},
				error : function(data){
					failCall();
				}
			});
		}
		
		// 更新DOM 
		function updateDOM() {

            $eventNum = $("#eventNum");
            $leaveNum = $("#leaveNum");
            $systemNum = $("#systemNum");


			if(isMessagePage()) { //消息相关界面

				
				// 事件消息 
				if(globalNamespace.totalAlarmLogCount === 0) {
					$eventNum.hide();

				} else if(globalNamespace.totalAlarmLogCount > 999) {
					$eventNum.html("(999+)");

				} else {
					$eventNum.html("(" + globalNamespace.totalAlarmLogCount + ")");
				}
				
				// 留言消息
				if(globalNamespace.totalLeaveMessageCount === 0) {
					$leaveNum.hide();
				} else if(globalNamespace.totalLeaveMessageCount > 999) {
					$leaveNum.html("(999+)");
                    $leaveNum.parents('li').addClass('hasMessage');
				} else {
					$leaveNum.html("(" + globalNamespace.totalLeaveMessageCount + ")");
                    $leaveNum.parents('li').addClass('hasMessage');
				}
				
				// 系统消息
				if(globalNamespace.totalBullentinCount === 0) {
					$systemNum.hide();
				} else if(globalNamespace.totalBullentinCount > 999) {
					$systemNum.html("(999+);");
				} else {
					$systemNum.html("(" + globalNamespace.totalBullentinCount + ")");
				}

			} else { // 非消息相关界面

				// 总个数
				if(globalNamespace.totalNumber === 0) {
					$totalNumber.hide();
				} else if(globalNamespace.totalNumber > 100) {
					$totalNumber.html("99+").show();
				} else {
					$totalNumber.html(globalNamespace.totalNumber).show();
				}
			}
		}
		
		/**
		 * 更新未读事件消息、未读留言消息、未读系统消息相关的数字及界面
		 * i = -1未读事件消息个数减1，0不变，+1未读事件消息个数加1
		 * j, k同理
		 */
		function updateNumberUI(i, j, k) {
			globalNamespace.totalAlarmLogCount += i;
			globalNamespace.totalLeaveMessageCount += j;
			globalNamespace.totalBullentinCount += k;
			globalNamespace.totalNumber += (i + j + k);
			updateDOM();
		}

		var $eventNum,
			$leaveNum,
			$systemNum,
            $eventTip,
            $leaveTip,
			$totalNumber = $("#totalNumber");
		
		var globalNamespace = window.globalNamespace = {};
		globalNamespace.updateNumberUI = updateNumberUI;

		findAllUnCheckLogCount(function(data) {// 成功回调 
			Log(data);
			if(data.resultCode === "0") {
				globalNamespace.totalAlarmLogCount = data.totalAlarmLogCount;
				globalNamespace.totalBullentinCount = data.totalBullentinCount;
				globalNamespace.totalLeaveMessageCount = data.totalLeaveMessageCount;
				globalNamespace.totalNumber = data.totalAlarmLogCount + data.totalBullentinCount + data.totalLeaveMessageCount;
				updateDOM();
			}
		}, function() {// 失败回调
			
		});



        /**
         * 获取云服务到期状态
         * */
        var CloudStatus = {
            ajaxUrl: {
                'findAllDevices':    basePath + '/service/cloudService!findAllDevices.action'
            },

            init: function(){
                this.getDeviceListEntities();
            },

            fetch: function(options){
                options = options ? $.extend({},options) : {};
                var dataConfig = options.dataConfig,
                    success = options.success,
                    error = options.error ,
                    type = options.type || 0,
                    url = options.url || this.url;

                $.ajax({
                    type: ['POST','GET'][type],
                    url : url,
                    async : (options.async && options.async == 'isFalse') ? false : true,
                    data: dataConfig || {},
                    success: function( data ){
                        options.success(data);
                    },
                    error: function(data){
                        error(data);
                    }
                });
            },

            getDeviceListEntities: function(dataConfig){
                var me = this;
                var url = me.ajaxUrl.findAllDevices;
                me.fetch({
                    url: url,
                    dataConfig : dataConfig,
                    type : 0,
                    success: function(data){
                        var listArray = [];
                        var device;
                        if(data.cloudDevices && data.cloudDevices.length){
                            while(device = data.cloudDevices.shift()){
                                if( device.status == 0 || device.status == 1 ) {
                                    if(device.validDate <= 7){
                                        $('.navigator .deadline').removeClass('hide');
                                        $('#serviceBoxPage .deadline').removeClass('hide');
                                    }
                                }
                                if(device.status == 2){
                                    $('.navigator .deadline').removeClass('hide');
                                    $('#serviceBoxPage .deadline').removeClass('hide');
                                }
                            }

                        }
                    },
                    error: function(data){
                        window.console && console.log('获取数据失败，请检查您的网络!');

                    }
                });
            }

        };
        var href = window.location.href;
        if(!/gotoCloudService/.test(href)) {
            CloudStatus.init();
        }


	});