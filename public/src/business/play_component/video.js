define(function(require, exports) {

	var ProjectMsg = require('../../business/i18n_zh/i18n_zh').msg,
	Base64 = require('../../business/base64/base64').Base64;
	require('./css/video.css');
	 var dialog = window.dialog = require('dialog');
	var Video = function(config) {
		config = $.extend(this.initConfig, config);
		this.init(config);
	};

    window.vers  = window.vers ? window.vers : function(){window.console && console.log('vers该方法加载失败');};

	var userType = $.cookie("DDNSCOOKIE").split(',')[7];

	try {
		var path = basePath;
	} catch (e) {
		var path = '';
	}

	$.extend(Video.prototype,Base.Event,(function() {

		var initConfig = {
			width : '100%',
			height : '100%'
		};

		/*
		 * private @method init 初始化组件，用于创建播放组件及控制工具 @param
		 * {Object} 配置项
		 */
		function init(config) {
			var me = this;
			if (config.position) {
				me.position = config.position.nodeName ? config.position
						: $(config.position)[0];
			}
			if (!render.call(me, config.width, config.height)) {
				return false;
			}
			;
		}
		;

		/*
		 * 缓冲
		 */
		function toload(step) {
			var me = this, load = me.loading;
			me.hidePrompt();
			me.showPrompt(false, true);
			me.loadingShow();
			try {
				step = step.split('_');
				if ((step[1] <= step[0])
						&& (step[1] > me.loadLastNum || me.loadLastNum === undefined)) {
					me.loadLastNum = (step[1]);
					load.step.html(Math.floor(step[1]
							/ (step[0] - 0 + 1) * 100)
							+ '%');
				}
			} catch (e) {
				load.step.html(10 + '%');
			}
		}

		/*
		 * 缓冲
		 */
		function toDefer(show) {
			show ? this.defer.removeClass('hide') : this.defer
					.addClass('hide');
		}

		/*
		 * private @method createCam 创建播放控件的dom元素
		 * 据IE与非IE分别生成对应的控件dom， 并通过测试组件的某一特性判定用户是否已经下载了插件
		 * 没有检测到支持插件，则出现下载插件提示
		 */
		function render(width, height) {
			var me = this;
			if (me.initConfig.wall
					&& (me.initConfig.wall.initConfig.type === 'more')) {

				var wrap = me.wrap = $('<div>').addClass(
						'_videoWrapper _videoWrapper_small')
						.css({
							width : width + 'px',
							height : height + 'px',
							margin : '0 auto'
						})[0];
				var prompt = me.prompt = $('<div>').addClass('_pluginPrompt_small hide focus'), 
					loadingF = me.loadingF = $('<iframe>')
						.addClass('_loading_small _loadingF _loadinghide')
						.css({
							'border' : 'none',
							'border-radius' : '0px',
							'background' : '#333'
						}),
                    prompt2 = me.prompt2 = $('<div>').addClass('_pluginPrompt2_small');

			} else {
				var wrap = me.wrap = $('<div>').addClass(
						'_videoWrapper').css({
					width : width + 'px',
					height : height + 'px',
					margin : '0 auto'
				})[0];
				var prompt = me.prompt = (userType == '1') ? $('<div>').addClass(
								'_pluginPrompt hide company')
						: $('<div>').addClass(
								'_pluginPrompt hide');
				var loadingF = me.loadingF = $('<iframe>')
						.addClass('_loading _loadingF _loadinghide')
						.css({
							'border' : 'none',
							'border-radius' : '0px',
							'background' : '#333'
						});

			}
			wrap.appendChild(loadingF[0]);
			wrap.appendChild(prompt[0]);
            if( me.prompt2 && util.browser.isMac && util.browser.isSafari ){   //当多画面时
                wrap.appendChild(prompt2[0]);
            }
			me.prompting = false;

			if ($.browser.isIE || !!( window.ActiveXObject || "ActiveXObject" in window )) {
				var ieEl = $('<div>');
				wrap.appendChild(ieEl[0]);
				ieEl.html(['<object ',
							'classid="clsid:955CC7B1-B517-469d-B10B-A41B39A8225E" ',
							'id="ShiPin7Ocx" ',
							'name="ShiPin7Ocx" ',
							'width="' + width + '" height="'
									+ (height - 3) + '" >',
							'<param name="wndtype" value="1" />',
							'<param name="wmode" value="opaque" />',
							'<param name="palymode" value="undefined" />',
							'</object>' ].join('')) ;
				me.el = $(wrap).find('object', true)[0];
			} else {
				var dom = $('<embed>')[0], el = me.el = dom;
				$(el).attr({
					type : 'application/hwp-shipin7-plugin',
					width : width,
					height : height,
					align : 'center',
					wndtype : "1",
					playmode : 'undefined'
				});
				wrap.appendChild(dom);
			}
			var loading = me.loading = $('<div>').addClass('_loading _loadinghide');
			loading.append(loading.step = $('<div>').addClass('_loadingStep fl').html('&nbsp;'));
			if (me.initConfig.wall && (me.initConfig.wall.initConfig.type === 'more')) {
				me.defer = $('<div>').addClass('_defer_small clearFix hide').html('<span class="wait">您的网络不给力，请耐心等待...</span>');
				me.stopBtn = $('<span>').addClass('stopBtn').html('<a href="javascript:void(0)">停止加载</a>');
				me.defer.append(me.stopBtn);
				me.stopBtn.on('click', function(e) {
					me.stop(0, 0, true);
					me.hidePrompt();
					me.loadingHide();
				});
			} else {
				me.defer = $('<div>').addClass('_defer hide').html('您的网络不给力，请耐心等待...');
			}
			wrap.appendChild(me.defer[0]);
			wrap.appendChild(loading[0]);
			me.position && me.position.appendChild(wrap);
			
			// 增加设置封面DOM
			wrap.appendChild($('<iframe>').addClass('coverIframe hide')[0]);
			me.cover = $('<div>').addClass('coverTip hide').html('<span style="float: left;">您的视频还没有封面，封面能便于您查看视频哦~</span><a href="javascript:void(0);" class="coverSetting" style="float: left;line-height: 21px;margin-top: 4px;">封面设置</a><a href="javascript:void(0);" class="closeCover" style="float: right;">&times;</a>');
			wrap.appendChild(me.cover[0]);
			
			setTimeout(_update, 500);
			function _update() {
				me.update();
				// me.playVideo && me.playVideo();
			}
			return true;
		}

		var update = function() {
			window.console&& console.log('2==create video component __ update');
			var me = this;
			setTimeout(_update, 1);
			function _update() {
				try {

                    var info = window.vers();

				} catch (e) {
					me.pluginError = true;
					var pluginError = me.pluginError = $('<a>').addClass('_pluginError'), 
					pluginErrorIframe = me.pluginErrorIframe = $('<iframe>').addClass('_pluginError');
					if ($.browser.isFirefox) {
						pluginError.html(ProjectMsg.DOWNLOAD_PLUGIN_PROMPT_REBOOT);
					} else {
						pluginError.html(ProjectMsg.DOWNLOAD_PLUGIN_PROMPT);
					}
					pluginError.attr('href',path+ "/assets/deps/PCPlayer.exe");
					me.wrap.appendChild(pluginErrorIframe);
					me.wrap.appendChild(pluginError);
					return false;
				}
				window.console&& console.log('3==create video component __ update complete to play');
				me.playVideo && me.playVideo();
			}
		};

		function promptToogle(show) {
			var me = this, prompt = me.prompt, el = me.el;
			if (!me.prompting) {
				me.showPrompt();
			} else if (me.prompting || (show === 'hide')) {
				me.hidePrompt();
			}
		}

		function showPrompt(ad, force) {
			var me = this, prompt = me.prompt, el = me.el;
			if (!me.prompting || force) {
				$(el).css({
					'visibility' : 'hidden'
				});
				if (ad) {
					prompt.addClass('_pluginPromptAD');
				}
				prompt.removeClass('hide');
				me.prompting = true;
			}
		}

		function hidePrompt() {
			var me = this, prompt = me.prompt, el = me.el;
			if (me.prompting) {
				$(el).css({
					'visibility' : 'visible'
				});
				prompt.removeClass('_pluginPromptAD');
				prompt.addClass('hide');
				prompt.html('');
				me.prompting = false;
			}
		}

		function setPrompt(value) {
			var me = this, prompt = me.prompt;
			me.showPrompt(true);
			prompt.addClass('_pluginPromptAD');
			prompt.html('<span class="icon">' + value
					+ '</span>');
		}

		var loadingHide = function() {
			var me = this;
			me.loading.addClass('_loadinghide');
			me.loadingF.addClass('_loadinghide');
			me.loadLastNum = false;
		}, loadingShow = function() {
			var me = this;
			me.loading.step.html('&nbsp;');
			me.loading.removeClass('_loadinghide');
			me.loadingF.removeClass('_loadinghide');
		};

		/*
		 * private @method capture_succ 抓图成功后的操作，提示操作成功
		 * 
		 */
		function capture_succ() {
			var me = this;
			me.captureSucc.addClass('show');
			function no() {
				me.captureSucc.removeClass('show');
			}
			;
			setTimeout(no, 1000);
		}

		/**
		 * @method startRecord 开始录像
		 * @param {
		 *            Number } window 视频窗口 default 0
		 * @param {
		 *            String } fileName 录像保存的文件名
		 * @return { Number } 0 成功， -1 失败, -2 空间不足,
		 */
		function startRecord(n, name) {
			var ret = 0, me = this, name = getFileName(me.info);
			if (wall.model.active.info.playing && !me.recording) {
				try {
					n = n || 0;
					// me.setPath();
					if ((ret = me.el.HWP_StartSave(n, name)) === 0) {
						me.recording = true;
						var recordTime = (function() {
							var i = 0;
							return function() {
								if (i >= 86399) {
									me.fire('stopRecord');
									me.fire('record');
								}
								i += 1;
								var h = Math.floor(i / 3600), m = Math
										.floor(i % 3600 / 60), s = i % 60;
								me.info.recordTime = (''
										+ $.pad('0', 2, h)
										+ ':'
										+ $.pad('0', 2, m)
										+ ':' + $.pad('0', 2,
										s));
								if (wall.model.active.info
										&& me.info.cameraId == wall.model.active.info.cameraId) {
									wall.toolbar.record
											.html(me.info.recordTime);
								} else {
									// wall.toolbar.record.html(
									// '' );
								}
							};
						})();
						me.recordIntervalId = setInterval(
								recordTime, 1000);
						wall.toolbar.record.html('00:00:00');
					}
					;
				} catch (e) {
					ret = -1;
				}
				;
			}
			;
			if (ret !== 0) {
				me.recording = false;
				var err = me.el.HWP_GetLastError();
				switch (err) {
				case 603:
					wall.error('存储路径不存在或没有权限，请重新配置 ');
					break;
				case 602:
					wall.error('磁盘空间不足');
					break;
				default:
					wall.error('录像失败');
				}
			}
			return ret;
		}
		;

		/**
		 * @method stopRecord 停止录像
		 * @param {
		 *            Number } window 播放窗口 default 0
		 * @return { Number } 0 成功，-1 不成功
		 */
		function stopRecord(n) {
			var me = this, ret = 0;
			if (wall.model.active.info.playing) {
				try {
					me.recording = false;
					n = n || 0;
					ret = me.el.HWP_StopSave(n);
					clearInterval(me.recordIntervalId);
					me.info.recordTime = '';
					wall.toolbar.record.html('');
					me.info.recording = false;
				} catch (e) {
					ret = -1;
				}
				;
			}
			;
			if (ret === -1) {
				wall.error('停止录像失败');
			}
			return ret;
		}
		;

		/*
		 * 截图和录像时调用 将通过 getLocalConfigFromCookie 获取到的路径配置给插件
		 * HWP_SetLocalConfig 返回 true时表示设置成功 不成功则弹出设置路径错误提示框
		 */
		function setPath() {

			var me = this, path = getLocalConfigFromPlugin(me);

			var localConfig = [
					"<?xml version='1.0' encoding='utf-8'?>",
					"<LocalConfigInfo>",
					"<ProtocolType>0</ProtocolType>", // 协议类型
														// 0-
														// TCP;
														// 1-
														// UTP
					"<StreamType>0</StreamType>", // 播放码流类型 0
													// -- 主码流;
													// 1- 子码流
					"<PackgeSize>1</PackgeSize>", // 打包大小 0-
													// 128MB; 1-
													// 256MB; 3-
													// 512MB
					"<PlayWndType>0</PlayWndType>", // 比例 0- 满屏
													// ;1- 4:3 ;
													// 2- 16:9;
													// 3-
													// 根据分辨率自适应
					"<BuffNumberType>2</BuffNumberType>", // 播放属性
															// 实时性
															// 0 1
															// 2
															// 流畅性
					"<RecordPath>" + (path + "\\RecordFiles\\")
							+ "</RecordPath>", // 录像
					"<CapturePath>"
							+ (path + '\\CaptureFiles\\')
							+ "</CapturePath>", // 抓图
					"<PlaybackFilePath>"
							+ (path + '\\PlaybackFiles\\')
							+ "</PlaybackFilePath>", // 录像
					"<PlaybackPicPath>"
							+ (path + '\\PlaybackPics\\')
							+ "</PlaybackPicPath>", // 抓图
					"</LocalConfigInfo>" ].join('');
			(me.el.HWP_SetLocalConfig(localConfig)) ? ''
					: dialog.errorInfo({content:'设置存储路径失败'}); 

		}
		;

		function getFileName(info) {
			var deviceSerial = info.ipcDeviceSerial
					|| info.deviceSerial, channelNo = info.ipcChannelNo
					|| info.channelNo, time = new Date( currentTime ), year = time
					.getFullYear(), month = time.getMonth() + 1, date = time
					.getDate(), hours = time.getHours(), minutes = time
					.getMinutes(), seconds = time.getSeconds(), milliseconds = time
					.getMilliseconds();
			return [ deviceSerial, "-", channelNo, "_",
					year + '-', $.pad('0', 2, month) + '-',
					$.pad('0', 2, date) + '_',
					$.pad('0', 2, hours) + '-',
					$.pad('0', 2, minutes) + '-',
					$.pad('0', 2, seconds) + '-',
					$.pad('0', 3, milliseconds) ].join('');
		}

		/**
		 * @method capture 截图
		 * @param {
		 *            Number } womdpw 视频窗口 default 0
		 * @param {
		 *            String } 截图保存的文件名
		 * @return { Number } 0 成功， -1 不成功
		 */
		function capture(n, name) {
			var ret = 0, me = this, name = getFileName(me.info);
			n = n || 0;
			if (wall.model.active.info.playing) {
				try {
					// me.setPath();
					if ((ret = me.el.HWP_CapturePicture(n,
							name)) !== '') {
						// capture_succ.call( me );
					}
					;
				} catch (e) {
					ret = -1;
				}
				;
			}
			;
			if (ret === '') {
				me.recording = false;
				var err = me.el.HWP_GetLastError();
				switch (err) {
				case 603:
					wall.error('存储路径不存在或没有权限，请重新配置');
					break;
				case 602:
					wall.error('磁盘空间不足');
					break;
				default:
					wall.error('截图失败');
				}
			}
			return ret;
		}
		;

		/**
		 * @method sound 开启声音
		 * @param {
		 *            Number } widow 视频窗口 default 0
		 * @return { Number } 0 成功， -1 不成功
		 */
		function sound(n) {
			var ret = 0, me = this;
			n = n || 0;
			if (wall.model.active.info && wall.model.active.info.playing) {
				try {
					if ((ret = me.el.HWP_OpenSound(n)) === 0) {
						me.sounding = true;
						// me.soundbtn.removeClass(
						// 'player_soundclose' ).addClass(
						// 'player_sound' );
					}
				} catch (e) {
					ret = -1;
				}
			}
			return ret;
			if (ret === -1) {
				me.sounding = false;
				wall.error('开启声音失败');
			}

		}
		;

		/**
		 * @method sound 关闭声音
		 * @param {
		 *            Number } window 视频窗口 default 0
		 * @return { Number } 0 成功， -1 不成功
		 */
		function closeSound() {
			var ret = 0, me = this;
			try {
				if ((ret = me.el.HWP_CloseSound()) === 0) {
					me.sounding = false;
					wall.model.active.info.voiceing = false;
					// me.soundbtn.removeClass( 'player_sound'
					// ).addClass( 'player_soundclose' );
				}

			} catch (e) {
				ret = -1;
			}
			return ret;
			if (ret === -1) {
				me.sounding = true;
				wall.error('关闭声音失败');
			}

		}
		;

		/**
		 * V1.7取流接口，包括预览回放
		 * 
		 * @author yechao
		 * @param iWndNum
		 *            窗口号，从0开始
		 * @param pwd
		 *            用户输入的明文密码
		 * @param iPlayType
		 *            取流类型，1-预览，2-回放
		 * @param startTime
		 *            开始时间
		 * @param endTime
		 *            结束时间
		 * @returns 0-成功，1-失败
		 */
		function playV17(me, iWndNum, pwd, iPlayType,
				startTime, endTime, config) {
            alert(111111);
			var sessionId = $.cookie("DDNSCOOKIE").split(',')[0];
			var userName = $.cookie("DDNSCOOKIE").split(',')[2];
			var forceStreamType = config.forceStreamType - 0;// 强制使用某种取流方式
																// 0-Auto
																// 1-直连
																// 2-P2P
																// 3-VTDU

			// 构造设备信息对象
			var config = config;

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
			devInfo.IsEncrypt = config.isEncrypt == 0 ? false
					: true;
			devInfo.UserName = userName;
			devInfo.PermanentKeyMd5 = config.encryptPwd;
			if (pwd && pwd != '') {
				pwd = DES.decode(pwd);
			} else {
				pwd = "";
			}
			devInfo.PermanentKey = pwd;
			devInfo.ISP = $.cookie("ISP") - 0;
            devInfo.videoScale = config.support_resolution ?config.support_resolution.split('-').join(':'):'';

			devInfo.VTDUProtoType = 1;//在现有的预览取流参数里加上VTDUProtoType字段 0：rtsp　；　1:　ys私有协议
			// 构造服务器信息对象
			var serverInfo = new Object();
			serverInfo.vtmIP = config.vtmIp;
			serverInfo.vtmPort = config.vtmPort;
			serverInfo.casIP = config.casIp;
			serverInfo.casPort = config.casPort;
			serverInfo.tokenUrl = config.authSvrAddr;

			return me.el.HWP_Play_V17(iWndNum || 0,
					sessionId, iPlayType, JSON
							.stringify(devInfo), JSON
							.stringify(serverInfo), startTime
							|| '', endTime || '',
					forceStreamType);
		}

		/**
		 * @method play 播放视频
		 * @param {
		 *            String } url 播放地址
		 * @param {
		 *            String } key 播放密钥
		 * @param {
		 *            Number } window 播放窗口 default 0
		 * @param {
		 *            String } startTime 开始时间点
		 * @param {
		 *            String } endTime 结束时间点
		 * @return { Number } 0 成功， -1 失败
		 */
		function play(url, key, n, iPlayType, startTime, endTime, serverInfo, newPwd, config) {

			wall.model.active.video.prompt.removeClass('_pluginPromptPause');
			n = n || 0;
			var ret = 0, me = this;
			me.hidePrompt();

			if ( ( wall.model.active.info && !wall.model.active.info.playing ) || !config.playing) {
				try {
					if (me.pausing) {
						me.fire('stop');
					}
					me.loadingShow();
					// 根据版本号区分控件来播放
					var releaseVersion = config.releaseVersion;

					window.console
							&& console.log('play__'
									+ config.deviceSerial);
					if (releaseVersion == 'VERSION_17') {
						ret = playV17(me, n, newPwd, iPlayType,
								startTime, endTime, config);
					} else {
						if (serverInfo) {
							// 是否强制走流媒体
							var forceStreamType = config.forceStreamType == 3 ? 2 : 255;
							ret = me.el.HWP_PlayByVtduEx(url,
									Base64.encode('admin' + ':'
											+ DES.decode(key)),
									n, startTime || '', endTime
											|| '', serverInfo, forceStreamType);
						} else {
							ret = me.el.HWP_Play(url,
									Base64.encode('admin' + ':'
											+ DES.decode(key)),
									n, startTime || '', endTime
											|| '');
						}
					}

					ret === 0;// && ( me.playing = true );
					me.showPrompt();
				} catch (e) {
					window.console && console.log('***********播放失败********'+e);
					ret = -1;
				}
			}
			if (ret === -1) {
				wall.error('播放失败');
			}
			return ret;
		}

		/**
		 * @method pause 暂停播放
		 * @param {Number}
		 *            播放窗口
		 * @return {Number} 0 成功 ， -1 失败
		 */
		function pause(n) {
			var me = this, ret;
			n = n || 0;
			if (wall.model.active.info.playing) {
				if (me.recording) {
					me.stopRecord(n);
				}
				try {
					// closeSound.call( me, n );
					ret = me.el.HWP_Pause(n); // HWP_Pause
				} catch (e) {
					ret = -1;
				}
				;
			}
			;
			if (ret === -1) {
				wall.error('暂停失败');
			} else {
				wall.model.active.info.pausing = true;
			}
			wall.toolbar.updateStatus()
			return ret;
		}
		;

		/**
		 * @method resume 继续播放
		 * @param {Number}
		 *            播放窗口
		 * @return {Number} 0 成功 ， -1 失败
		 */
		function resume(n) {
			var me = this;
			n = n || 0;
			var ret = -1;
			if (wall.model.active.info.playing) {
				try {
					ret = me.el.HWP_Resume(n); // HWP_Pause
				} catch (e) {
					ret = -1;
				}
				;
			}
			;
			if (ret === -1) {
				wall.error('重新播放失败');
			} else {
				wall.model.active.info.pausing = false;
			}
			wall.toolbar.updateStatus()
			return ret;
		}
		;

		/**
		 * @method stop 停止播放
		 * @param {Number}
		 *            播放窗口
		 * @return {Number} 0 成功 ， -1 失败
		 */
		function stop(n, p2p, force, sound, config) {
			 wall.model.active.video.prompt.addClass('_pluginPromptPause');
			var me = this, config = config
					|| wall.model.active.info, ret;
			n = n || 0;
			if (config
					&& (config.playing || me.pausing || force)) {
				if (me.recording) {
					me.stopRecord(n);
				}
				try {
					if (sound !== true) {
						closeSound.call(me, n);
					}
					var volumn = $("._voiceBox .progress").slider("value");
					if (volumn > 0 && (!wall.model.active.info.private)) {
						wall.model.active.video.sound();
						wall.model.active.video.el.HWP_SetVolume(0, volumn);
					} else {
						wall.model.active.video.closeSound();
					}
					me.stopTalk();
					var releaseVersion = config.releaseVersion;
					window.console
							&& console
									.log('stop__'
											+ config.deviceSerial
											+ "______"
											+ releaseVersion);
					if (releaseVersion == 'VERSION_17') {
						ret = me.el.HWP_Stop_V17(n); // HWP_Pause
					} else {
						if (p2p || config.netType !== '0') {
							ret = me.el.HWP_StopByVtdu(n);
						} else {
							ret = me.el.HWP_Stop(n); // HWP_Pause
						}
					}
					config.playing = false;
					config.pausing = false;
					me.showPrompt();
				} catch (e) {
					ret = -1;
				}
			}
			me.fire('afterStop');
			if (ret === -1) {
				wall.error('停止失败');
			}
			wall.model.active.video.loadingHide();
			wall.toolbar.updateStatus()
			return ret;
		}

		function full() {
			var ret = 0, me = this;
			try {
				if (ret = me.el.HWP_FullScreenDisplay(true)) {

				}
			} catch (e) {
				ret = -1;
			}
			if (ret === -1) {
				wall.error('全屏失败');
			}
			return ret;
		}

		function getLocalConfigFromPlugin(score) {
			var xml, path, config = score.el
					.HWP_GetLocalConfig();
			if ($.browser.msie
					& parseInt($.browser.version) < 9) {
				xml = new ActiveXObject("Microsoft.XMLDOM");
				xml.async = false;
				xml.loadXML(config);
			} else {
				xml = config;
			}
			var xmlObj = $(xml)[1];

			if (xmlObj && xmlObj.getElementsByTagName) {
				path = xmlObj
						.getElementsByTagName('CapturePath')[0].innerHTML;
			} else {
				path = /<CapturePath>(.*)<\/CapturePath>/
						.exec(config)[1];
			}
            if(util.browser.isAir || util.browser.isMac){
                path = path.split('\/');
                path = path.slice(0,path.length-2);
                return path.join('\/');
            }else{
                path = path.split('\\');
                path = path.slice(0, path.length - 2);
                return path.join('\\');
            }
		}

		function file() {
			var ret = 0, me = this, path;
			try {
				var path = getLocalConfigFromPlugin(me);
				if (ret = me.el.HWP_OpenFileDir(path)) {

				}
			} catch (e) {
				ret = -1;
			}
			if (ret === -1) {
				wall.error('打开文件夹失败');
			}
			return ret;
		}

		function startTalk(ip, hp, key) {
			var ret = 0, me = this, m_lHttp = 'http://';
			var config = wall.model.active.info;
			if(config.support_ptz){
				$('.list').addClass('hasPTZ');
			}
			try {
				iAudioType = 1;
				if (config.releaseVersion == 'VERSION_17') {
					var sessionId = $.cookie("DDNSCOOKIE")
							.split(',')[0];
					var devInfo = new Object();
					devInfo.Serial = config.deviceSerial;
					devInfo.InternetIP = config.deviceIp;
					devInfo.InternetCmdPort = config.cmdPort;
					devInfo.InternetStreamPort = config.streamPort;
					devInfo.InnerIP = config.localDeviceIp;
					devInfo.InnerCmdPort = config.localCmdPort;
					devInfo.InnerStreamPort = config.localStreamPort;
					devInfo.NATType = config.netType;
					devInfo.Channel = /(N1|R1|X3)/
							.test(config.fullModel) ? Math
							.floor(config.channelNo / 100) : 0;
					devInfo.AudioType = iAudioType;
					devInfo.ISP = $.cookie("ISP") - 0;
					var serverInfo = new Object();
					serverInfo.ttsIP = config.ttsIp;
					serverInfo.ttsPort = config.ttsPort;
					serverInfo.casIP = config.casIp;
					serverInfo.casPort = config.casPort;
					serverInfo.tokenUrl = config.authSvrAddr;

					ret = me.el.HWP_StartVoiceTalk_V17(0,
							sessionId, JSON.stringify(devInfo),
							JSON.stringify(serverInfo));
				} else {
					wall.error('设备不支持对讲。');
					return;
					/*
					 * var szOpenURL = m_lHttp + ip + ":" + hp +
					 * "/PSIA/Custom/SelfExt/TwoWayAudio/channels/1/open",
					 * szCloseURL = m_lHttp + ip + ":" + hp +
					 * "/PSIA/Custom/SelfExt/TwoWayAudio/channels/1/close",
					 * szDataUrl = m_lHttp + ip + ":" + hp +
					 * "/PSIA/Custom/SelfExt/TwoWayAudio/channels/1/audioData",
					 * ret =
					 * me.el.HWP_StartVoiceTalk(szOpenURL,
					 * szCloseURL, szDataUrl, Base64.encode(
					 * 'admin' + ':' + DES.decode(key) ),
					 * iAudioType )
					 */
				}
			} catch (e) {
				ret = -1;
			}
			;
			if (ret === -1) {
				wall.error('开启对讲失败');
			} else if (ret === -2) {
				dialog.warn({content:'<span style="font-size: 15px;">亲，同一时间只能与一台设备进行对讲哦，请停止其他对讲后再尝试</span>',width:380,height:150});
			}

			return ret;
		}
		;

		function stopTalk() {
			var ret = 0, me = this;
			var releaseVersion = wall.model.active.info.releaseVersion;
			try {
				if (releaseVersion == 'VERSION_17') {
					ret = me.el.HWP_StopVoiceTalk_V17(0);
				} else {
					ret = me.el.HWP_StopVoiceTalk();
				}
				//wall.model.active.info.talking = false;
				wall.toolbar.talk.removeClass(
						[ '_talking', '_talk' ]).addClass(
						'_talkloading').attr('title',
						'开启对讲');
			} catch (e) {
				ret = -1;
			}
			;
			if (ret === -1) {
				// wall.error( 'stopTalk' );
			}
			return ret;
		}
		;

		function searchRecord(url, key, searchType, startTime, endTime,config) {
			var ret = 0, me = this;
			try {
				// me.loadingShow();
				if (config.releaseVersion == 'VERSION_17') {
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
					devInfo.RecordType = 255; // 全部

					var serverInfo = new Object();
					serverInfo.casIP = config.casIp;
					serverInfo.casPort = config.casPort;

					var sessionId = $.cookie("DDNSCOOKIE")
							.split(',')[0];
					ret = me.el.HWP_SearchRecordFile_V17(0,
							sessionId, searchType, JSON
									.stringify(devInfo), JSON
									.stringify(serverInfo),
							startTime, endTime);
				} else {
					ret = me.el.HWP_SearchRecordFile(url,
							Base64.encode('admin' + ':'
									+ DES.decode(key)));
				}
			} catch (e) {
				window.console && console.log('*************查询录像失败***********'+e);
				ret = -1;
			}
			if (ret === -1) {
				wall.error('查询录像失败');
			}
			return ret;

		}

		function zoom(type) {
			var ret = 0, me = this;
			try {
				if (type) {
					ret = me.el.HWP_EnableZoom(0, 1);
				} else {
					me.el.HWP_DisableZoom(0);
					ret = 0;
				}
			} catch (e) {
				ret = -1;
			}
			;
			if (ret === -1) {
			}
			return ret;
		}

		/**
		 * 开始采集留言
		 */
		function startRecVoice() {
			var ret = 0, me = this;
			try {
				ret = me.el.HWP_VoiceCaptureStart();
			} catch (e) {
				ret = -2;
			}
			;
			return ret;
		}

		/**
		 * 完成留言采集
		 */
		function finishRecVoice() {
			var ret, me = this;
			try {
				ret = me.el.HWP_VoiceCaptureStop();
			} catch (e) {
			}
			;
			return ret;
		}

		/**
		 * 上传留言文件
		 */
		function uploadRecFile(serverInfo, fileInfo) {
			var ret = 0, me = this;
			try {
				ret = me.el.HWP_FileCloudUpload(JSON
						.stringify(serverInfo), JSON
						.stringify(fileInfo));
			} catch (e) {
				ret = -2;
			}
			;
			return ret;
		}

		window.ZoomInfoCallback = function() {
		};
		window.GetSelectWndInfo = function() {
		};

		return {
			playing : false,
			recording : false,
			initConfig : initConfig,
			play : play,
			pause : pause,
			init : init,
			stop : stop,
			startRecord : startRecord,
			stopRecord : stopRecord,
			capture : capture,
			sound : sound,
			closeSound : closeSound,
			resume : resume,
			loadingHide : loadingHide,
			loadingShow : loadingShow,
			setPath : setPath,
			full : full,
			file : file,
			startTalk : startTalk,
			stopTalk : stopTalk,
			update : update,
			searchRecord : searchRecord,
			promptToogle : promptToogle,
			setPrompt : setPrompt,
			hidePrompt : hidePrompt,
			showPrompt : showPrompt,
			toload : toload,
			toDefer : toDefer,
			zoom : zoom,
			startRecVoice : startRecVoice,
			finishRecVoice : finishRecVoice,
			uploadRecFile : uploadRecFile
		};
	})());
	
	window.changeSound = function() {
		var volumn = $("._voiceBox .progress").slider("value");
		if (volumn > 0) {
			wall.model.active.video.sound();
			wall.model.active.video.el.HWP_SetVolume(0, volumn);
		} else {
			wall.model.active.video.closeSound();
		}
	}
	
	exports.component  = Video;

})
