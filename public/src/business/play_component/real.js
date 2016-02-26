define(function(require, exports) {
	var Hint = require('hint').Hint;
	var hint = new Hint();
	var dialog = window.dialog = require('dialog');
	var sendMessage = wall.toolbar.sendMessage;
	// 留言功能变量
	var LEAVE_MESSAGE_VOICE_TYPE = 5;
	var uploadLMInfo = new Object();
	var LMError = {
		'-1' : '您的电脑没有连接麦克风，暂时不能留言，请连接后再尝试'
	};



	// 语音对讲失败后，发送到后台保存
	function sendTalkInfo(eventType, errorCode, config) {
		var info = wall.model.active.info;
		var playInfoLog = config.split('&')[0];


        var  _version = window.vers();

		try {
			var jsonConfig = JSON.parse(config);
			var data = {
				'deviceSerial' : info.deviceSerial,
				'requestType' : 2,
				'deviceNatType' : info.netType,
				'clientNatType' : jsonConfig.ClientNatType,
				'userName' : $.cookie('DDNSCOOKIE').split(',')[2],
				'interactiveType' : jsonConfig.TalkType,
				'version' : _version,
				'browserVersion' : util.browserVersion,
				'sysVersion' : util.sysVersion,
				'detail' : config,
				'errorCode' : errorCode
			};
			$.ajax({
				type : "POST",
				url : basePath + "/omm/ommAction!addVideoRequestInfo.action",
				data : data,
				success : function(data) {

				}
			});
		} catch (e) {}
	}

	// 语音留言失败后，发送到后台保存
	function sendMessageInfo(param, detail) {
		var info = wall.model.active.info;
		var vers = window.vers();
		var data = {
			'deviceSerial' : info.deviceSerial + ',' + param,
			'operationType' : 14,
			'userName' : $.cookie('DDNSCOOKIE').split(',')[2],
			'version' : vers,
			'browserVersion' :util.browserVersion,
			'sysVersion' :util.sysVersion,
			'detail' : detail
		};
		$.ajax({
			type : "POST",
			url : basePath + "/omm/ommAction!addDeviceOperationInfo.action",
			data : data,
			success : function(data) {

			}
		});
	}

	// 录制留言
	window.PluginEventMsg = function(lParam1, lParam2, lParam3, lParam4, hUser) {
		switch (lParam1) {
			case 13 : // 录音，采集的声音强度
				window.console && console.log(lParam2)
				wall.toolbar.hornBox.setValue(lParam2);
				break;
			default :
				window.PluginEventMsg2 && window.PluginEventMsg2(lParam1, lParam2, lParam3, lParam4, hUser);
				break;
		}
	};

	// 开始录音
	function startRecVoice(player) {
		var ret = player.video.startRecVoice();
		if (ret === 0) {
			wall.toolbar.hornBox.addClass('start');
			sendMessage.rec();
		} else if (ret === -2) {
			ocxOldVersion.show();
		} else {
			 dialog.errorInfo({
                 content:LMError[ret]
             });
		}
	}

	// 发送语音留言至云存储服务器
	function sendRecMessage(player) {
		// 调用getCloudStreamServer.js中的方法获取云存储stream服务器信息
	    //FIXME 目前留言只保存至武汉云存储 cloud_type = 2
		var cloudServerInfo = getCloudServerInfo(2);
		if ($.isEmptyObject(cloudServerInfo)) {
			window.console && window.console.log('当前无可用的stream服务器');
			 dialog.errorInfo({
                 content:'无可用的stream服务器'
             });
			return ;
		}

		var messageId = uploadLMInfo.messageId;
		var duration = uploadLMInfo.duration;
		var fileInfo = new Object();
		fileInfo.Session = clientSession;
		fileInfo.FileId = messageId;
		fileInfo.FileName = uploadLMInfo.deviceSerial + "_1";
		fileInfo.FileType = LEAVE_MESSAGE_VOICE_TYPE;

		var ret = player.video.uploadRecFile(cloudServerInfo, fileInfo);
		if (ret < 0) {
			 dialog.errorInfo({
                 content:'服务器异常，发送失败'
             });
			sendMessageInfo(3, '服务器异常，发送失败');
			sendMessage.clear();
			return;
		} else if (ret === -2) {
			ocxOldVersion.show();
		} else {
			uploadLMInfo.taskNo = ret;
		}

	}

	// 完成录制
	function finishRecVoice(player) {
		var ret = player.video.finishRecVoice();
		if (ret) {
			ret = JSON.parse(ret);
			if (ret.TimeLen < 1) {
				dialog.errorInfo({
	                content:'留言时间太短，发送失败'
	            });
				sendMessage.clear();
				return -1;
			}
			uploadLMInfo.messageId = ret.FileId;
			uploadLMInfo.duration = ret.TimeLen;
			uploadLMInfo.deviceSerial = player.info.deviceSerial;
			return 0;
		} else if (ret === -2) {
			ocxOldVersion.show();
		} else {
			dialog.errorInfo({
                content:'录制留言失败，请重试！'
            });
			sendMessage.clear();
			return -1;
		}
	}

	// 保存留言消息记录
	function saveLeaveMessage(taskNo, messageId) {
		if (taskNo != uploadLMInfo.taskNo || messageId != uploadLMInfo.messageId) {
			dialog.errorInfo({
                content:'服务器异常，发送失败'
            });
			sendMessage.clear();
			return;
		}
		$.ajax({
			url : basePath + '/leaveMessage/leaveMessageAction!saveLeaveMessageReply.action',
			type : 'POST',
			data : {
				"leaveMessageDto.messageId" : uploadLMInfo.messageId,
				"leaveMessageDto.deviceSerial" : uploadLMInfo.deviceSerial,
				"leaveMessageDto.duration" : uploadLMInfo.duration,
				"leaveMessageDto.contentType" : 1,
				"leaveMessageDto.senderType" : 2
			},
			dataType : 'json',
			success : function(data) {
				if (data.success == "success") {
					hint.show({content:"留言成功"});
					sendMessageInfo(2, 0);
					sendMessage.clear();
				} else {
					 dialog.errorInfo({
	                        content:'留言失败'
	                    });
					sendMessageInfo(3, "save db error");
					sendMessage.clear();
				}
			}
		});
	}

	window.NotifyGetISPMsg = function(lISP, lpRecMsg) {
		window.console && window.console.log("monitor.jsp NotifyGetISPMsg  ---   " + lISP);
		$.cookie('ISP', lISP);
	};

	// 根据类型判断开启留言模式或对讲模式
	function messageReplyType() {
		if (window.replyType && (window.replyType == 'message')) {
			window.replyType = null;
			wall.toolbar.startMessage();
		}
	}
	function talkReplyType() {
		if (window.replyType && (window.replyType == 'talk')) {
			window.replyType = null;
			wall.toolbar.startTalk();
		}
	}

	// 播放实时预览
	window.playRealHandler = function() {
		wall.model.active.video.stop(0, wall.model.active.info.netType !== '0', true);
		isReal = true;
		playVideo(wall.model.active, wall.model.active.info, 0);
	}

	function playerHandler(wall, config, forceStop) {
		var player = wall.model.active;
		if (player.video.info && player.video.info.playing) {
			player.video.stop(0, player.video.info.upnp !== '1', forceStop, wall.lastInfo);
		}
		player.info = config;
		player.info.playing = false;
		wall.updateStatus();
		playVideo(player, config);
	}

	// 播放实时视频
	function playVideo(player, config, wndNum, newPwd) {
		// 判断子用户权限
       wall.model.active.video.showPrompt();
        wall.model.active.video.loadingShow();
		window.console && console.log('5==playVideo');
		if (currentUserType == 2) {
			if (config.canRealPlay == 0) {
				wall.model.active.info.playing = false;
				player.info = player.video.info = config;
				playerPrompt('您没有查看该设备现场视频的权限哦~');
				return false;
			}
//			else if (config.isEncrypt == 1) {
//				wall.model.active.info.playing = false;
//				player.info = player.video.info = config;
//				dialog.show({
//					'title' : '提示',
//					'content' : '您的视频已加密，无法查看，请联系主用户 ',
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
		var url, serverInfo,
			err = false, reg, ret;
		wall.toolbar.resetLevel(config.videolevel, config.capability);
		if ((config.status == 0 || config.upnp === '1') && config.deviceIp && config.forceStreamType != '3') {
			window.console && console.log('6=1=playVideo');
			if ($.cookie("USERIPCOOKIE") === config.deviceIp) {
				url = 'rtsp://' + config.localDeviceIp + ':' + config.localDevicePort + '/PSIA/streaming/channels/'
						+ ((config.channelNo + '').replace(/\d$/, '') + ((config.quality - 0) || '2')) + '?'
						+ config.httpPort + '&' + username + '&' + config.deviceSerial;
			} else {
				url = 'rtsp://' + config.deviceIp + ':' + config.devicePort + '/PSIA/streaming/channels/'
						+ ((config.channelNo + '').replace(/\d$/, '') + ((config.quality - 0) || '2')) + '?'
						+ config.httpPort + '&' + username + '&' + config.deviceSerial;
			}
		} else {
			window.console && console.log('6=2=playVideo');
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

			var url = ['Ehome://', // stream_type
					(config.deviceIp || '120.0.0.1') + ':', // internet_ip
					(config.httpPort || '80') + ':', // internet_http_port
					(config.localDeviceIp || '127.0.0.1') + ':', // local_ip
					(config.maskIp || '255.255.255.255') + ':', // local_mask
					(config.localHttpPort || '80') + ':', // local_http_port
					config.netType + ':', // net_type
					config.deviceSerial + ':', // device_index_code
					config.channelNo.toString().replace(/\d\d$/, '') + ':', // channel_no
					['0', '0', '1'][config.quality || config.capability.split('-')[config.videolevel] - 0 || '2'] + ':', // stream_type
					'0' + ':', // pu_link_type
					config.casIp + ':', // ppvs_ip
					config.casPort + '?',
					config.localDevicePort,
					'&' + username + '&' + config.deviceSerial].join(''); // ppvs_port

		}

		window.console && console.log('7==playVideo');
		var iPlayType = 1;// 预览
		if (config.status == 2) { // 设备不在线，无法播放
			playerPrompt('设备不在线，无法播放');
			ret = 0;
		} else {
			ret = player.video
					.play(url, newPwd || config.plainPassword, 0, iPlayType, '', '', serverInfo, newPwd, config);
			var volumn = $("._voiceBox .progress").slider("value");
	        if (volumn > 0) {
	            wall.model.active.video.sound();
	            wall.model.active.video.el.HWP_SetVolume(0, volumn);
	        } else {
	            wall.model.active.video.closeSound();
	        }
            
		}
		if (ret === 0) {
			player.info = player.video.info = config;
			config.wall = player.index;
		}
	}

	exports.real = {
		playVideo : playVideo,
		playerHandler : playerHandler,
		talkReplyType : talkReplyType,
		messageReplyType : messageReplyType,
		sendTalkInfo : sendTalkInfo,
		sendMessageInfo : sendMessageInfo,
		sendRecMessage : sendRecMessage,
		saveLeaveMessage : saveLeaveMessage,
		startRecVoice : startRecVoice,
		finishRecVoice : finishRecVoice
	}

})
