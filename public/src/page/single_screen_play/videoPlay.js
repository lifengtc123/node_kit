define(function(require, exports) {

	// -----------------相关组件模块加载----------------------//
	var Wall = require('./../../business/play_component/videoWall').component,
		Hint = require('hint').Hint,
		dialog = require('dialog'),
		VideoTimeBar = require('./../../business/play_component/videoPlayTimeBar').component,
		Weibo = require('./../../business/play_component/weibo').component,
	    ServerCloud = require('./../../business/cloud_service/serverCloud').ServerCloud,
	    pwdDialog = require('./../..//business/serial/serial');

	var hint = window.hint = new Hint();
	var AppView = require('./../../business/play_component/ptz').component;
	var payUrl = basePath  + '/service/cloudService!gotoCloudService.action';
	var _ = require('underscore');
	//分享弹出框
	var choiceShareType = require('../../business/choiceShareType/choiceShareType');
	
	var chart = require('./../../business/replay_chart/replay_chart').chart;
	var talkErrorText = {
		4001 : '您的电脑没有连接麦克风，暂时不能对讲，请连接后再尝试',
		3077 : '设备正在对讲，请稍后再尝试',
		5010 : '设备正在对讲，请稍后再尝试',
		3127 : '设备开启了镜头遮蔽，打开对讲失败',
		5013 : '设备开启了镜头遮蔽，打开对讲失败'
	};

	var version16PromptHtml = '<p class="version16Prompt" style="padding-left:70px;padding-top:5px; color:#999; font-size:12px;">初始密码为12345，若密码已被修改，请输入修改后的密码</p>';

	// 获取用户类型
	var userType = $.cookie("DDNSCOOKIE").split(',')[7];
	$('.changeModel').removeClass('hide');
	$('#chartWrapper').addClass('hide');
	
	// 初始化播放控件
	var wall = window.wall = new Wall(
		{
			position : '#wall',
			fence : 1
		}
	);


	function toBin(intNum) {
		  var answer = "";
		  if(/\d+/.test(intNum)) {
			while(intNum != 0) {
			  answer = Math.abs(intNum%2)+answer;
			  intNum = parseInt(intNum/2);
			}
			if(answer.length == 0)
			  answer = "0";
			return answer;
		  } else {
			return 0;
		  }
	}

	var setPageOpt= {
		pageStart: 0,
		pageSize: 20,
		isScroll: false,
		isMore: true,
		isAjax: true
	}
	getListCamera(setPageOpt);
	var temp =  '<div class="camera <%=unline%>">'+
                '<img class="pic" onerror=\'this.setAttribute("src","<%=basePath%>/assets/_imgs/blank.gif");this.setAttribute("class","pic pic_error")\' '+
                'cameraId="<%=cameraId%>"' +
                'needCover = "<%=needCover%>"'+
                'deviceSerial="<%=deviceSerial%>"'+
                'deviceIP="<%=deviceIP%>"'+
                'httpPort = "<%=httpPort%>"'+
                'devicePort="<%=devicePort%>"'+
                'cmdPort = "<%=cmdPort%>"'+
                'streamPort = "<%=streamPort%>"'+
                'localDeviceIP="<%=localDeviceIP%>"'+
                'localHttpPort = "<%=localHttpPort%>"'+
                'localDevicePort="<%=localDevicePort%>"'+
                'localCmdPort = "<%=localCmdPort%>"'+
                'localStreamPort = "<%=localStreamPort%>"'+
                'cameraName="<%=name%>"'+
                'plainPassword="<%=plainPassword%>"'+
                'channelNo="<%=channelNo%>"'+
                'userName="<%=userName%>"'+
                'upnp="<%=upnp%>"'+
                'capability="<%=capability%>"'+
                'videoLevel="<%=videoLevel%>"'+
                'netType="<%=netType%>"'+
                'casIp="<%=casIp%>"'+
                'casPort="<%=casPort%>"'+
                'isNeedUpgrade="<%=isNeedUpgrade%>"'+
                'status = "<%=status%>"'+
                'defence = "<%=defence%>"'+
                'diskNum = "<%=diskNum%>"'+
                'diskStatus = "<%=diskStatus%>"'+
                'privateStatus = "<%=privateStatus%>"'+
                'maskIp="255.255.255.255"'+
                'version="<%=version%>"'+
                'releaseVersion="<%=releaseVersion%>"'+
                'authSvrAddr="<%=authSvrAddr%>"'+
                'isEncrypt="<%=isEncrypt%>"'+
                'encryptPwd = "<%=encryptPwd%>" '+// 密码
                'permission="<%=permission%>"'+
                'fullSerial = "<%=fullSerial%>"'+
                'fullModel = "<%=fullModel%>"'+
                'hikPort = "<%=hikPort%>"'+
                'model = "<%=model%>"'+
                'supportExt=\'<%=supportExt%>\''+
                'forceStreamType="<%=forceStreamType%>"'+
                'isShare="<%=isShared%>"'+
                'inviterName="<%=inviterName%>"'+
                'inviterPhone="<%=inviterPhone%>"'+
                'vtmIp=\'<%=vtmIp%>\''+
                'vtmPort=\'<%=vtmPort%>\''+
                'ttsIp=\'<%=ttsIp%>\''+
                'cloudServiceStatus=\'<%=cloudServiceStatus%>\''+
                'ttsPort=\'<%=ttsPort%>\''+
                'deviceStatus = "<%=deviceStatus%>"'+
                'belongSerial="<%=belongSerial%>"'+
                'belongNo="<%=belongNo%>"'+
                'belongState="<%=belongState%>"'+
                'belongDevice_deviceSerial="<%=belongDevice.subSerial%>" '+// 所属设备相关内容
                'belongDevice_casIp="<%=belongDevice.casIp%>"'+
                'belongDevice_casPort="<%=belongDevice.casPort%>"'+
                'belongDevice_plainPassword="<%=belongDevice.plainPassword%>"'+
                'belongDevice_devicePort="<%=belongDevice.natRtspPort%>"'+
                'belongDevice_upnp="<%=belongDevice.upnp%>"'+
                'belongDevice_deviceIp="<%=belongDevice.natIp%>"'+
                'belongDevice_httpPort="<%=belongDevice.natHttpPort%>"'+
                'belongDevice_localDeviceIp="<%=belongDevice.localIp%>"'+
                'belongDevice_status = "<%=belongDevice.status%>"'+
                'belongDevice_maskIp="<%=belongDevice.maskIp%>"'+
                'belongDevice_localHttpPort="<%=belongDevice.localHttpPort%>"'+
                'belongDevice_localDevicePort="<%=belongDevice.localRtspPort%>"'+
                'belongDevice_netType="<%=belongDevice.netType%>"'+
                'belongDevice_localCmdPort = "<%=belongDevice.localCmdPort%>"'+
                'belongDevice_localStreamPort = "<%=belongDevice.localStreamPort%>"'+
                'belongDevice_cmdPort = "<%=belongDevice.natCmdPort%>"'+
                'belongDevice_streamPort = "<%=belongDevice.natStreamPort%>"'+
                'belongDevice_version="<%=belongDevice.version%>"'+
                'belongDevice_releaseVersion="<%=belongDevice.releaseVersion%>"'+
                'src="<%=basePath%><%=md5Serial%>_web.jpeg?<%=mobileRand%>"/>' +
                '<% if (currentUserType == 2) {%>'+
                '<div class="cameraConfigState">'+
                '<% if (privateStatus==0 ) {%>'+
                '<b title="已开启镜头遮蔽" class="m3 hide"></b>'+
                
                '<% }else{ %>'+
                '<b  title="已开启镜头遮蔽" class="m3"></b>'+
                '<%} %>'+
                '</div>'+

                '<% }else{ %>'+     
                '<div class="cameraConfigState">'+
                '<% if (defence==1) {%>'+
                '<b title="已开启安全防护" class="m1"></b>'+

                '<% }else{ %>'+
                '<b title="已开启安全防护" class="m1 hide"></b>'+
                '<%} %>'+
                     '<% if (diskNum<=0) {%>'+
                '<b title="磁盘异常" class="m2 hide"></b>'+

                '<%} else if (diskStatus.indexOf(\'1\')>=0 || diskStatus==\'\'){%>'+
                '<b title="磁盘异常" class="m2"></b>'+

                '<%} else if (diskStatus.indexOf(\'2\')>=0) {%>'+
                '<b title="未初始化" class="m2"></b>'+

                '<% }else{ %>'+
                '<b title="磁盘异常" class="m2 hide"></b>'+
                '<%} %>'+
                     '<% if (privateStatus==0) {%>'+
                '<b title="已开启镜头遮蔽" class="m3 hide"></b>'+

                '<% }else{ %>'+
                '<b  title="已开启镜头遮蔽" class="m3"></b>'+
                '<%} %>'+
                '<% if (isNeedUpgrade==0) {%>'+
                '<b title="可升级" class="m4 hide"></b>'+
  
                '<% }else{ %>'+
                '<b  title="可升级" class="m4"></b>'+
                '<%} %>'+
                '</div>'+
                '<%} %>'+
                '<b class="offline" cameraId="<%=cameraId%>"></b>'+
                '<% if (currentUserType== 2){%>'+
                '<a class="name ellipsis" title="<%=name%>" href="javascript:void(0)" style="cursor: default"><%=name%></a>'+

                '<% }else{ %>'+
                '<a class="name ellipsis" title="<%=name%>" href="<%=basePath%>/camera/cameraAction!goDeviceInfo.action?deviceSerial=<%=deviceSerial%>"><%=name%></a>'+
                '<%} %>'+
                '<p class="<%=isInviter%> comeFromUser ellipsis">来自&nbsp;:&nbsp;<span title="<%=inviterPhone%>"><%=inviterName%></span></p>'+
                '<a class="status">播放中...</a>'+
                '</div>';
		function getListCamera(cameraParam){
			$.ajax({
				url : basePath + '/camera/cameraAction!findPageAdded.action',
				type : 'post',
				timeout : 60000,
				data : cameraParam,
				dataType : 'json',
				success : function(data) {
					var data = data.cameraDtos;
					var html = "";

					if(data && data.length){
						for(var i=0 ; i< data.length; i++){
							if(data[i].cameraId != cameraId){
								var opt = data[i];
								opt.inviterName = (data[i].inviterName ? data[i].inviterName : "");
								opt.inviterPhone = (data[i].inviterPhone ? data[i].inviterPhone : "");
								opt.belongSerial = (data[i].belongSerial ? data[i].belongSerial: "");
								opt.belongNo = (data[i].belongNo ? data[i].belongNo : "");
								opt.belongState = (data[i].belongState ? data[i].belongState : "");
								opt.belongDevice = {};
								opt.belongDevice.subSerial = (data[i].belongDevice && data[i].belongDevice.subSerial ? data[i].belongDevice.subSerial : "");
								opt.belongDevice.casIp = (data[i].belongDevice.casIp ? data[i].belongDevice.casIp : "");
								opt.belongDevice.casPort = (data[i].belongDevice.casPort ? data[i].belongDevice.casPort : "");
								opt.belongDevice.plainPassword = (data[i].belongDevice.plainPassword ? data[i].belongDevice.plainPassword : "");
								opt.belongDevice.natRtspPort = (data[i].belongDevice.natRtspPort ? data[i].belongDevice.natRtspPort : "");
								opt.belongDevice.upnp = (data[i].belongDevice.upnp ? data[i].belongDevice.upnp : "");
								opt.belongDevice.natIp = (data[i].belongDevice.natIp ? data[i].belongDevice.natIp : "");
								opt.belongDevice.natHttpPort = (data[i].belongDevice.natHttpPort ? data[i].belongDevice.natHttpPort : "");
								opt.belongDevice.localIp = (data[i].belongDevice.localIp ? data[i].belongDevice.localIp : "");
								opt.belongDevice.status = (data[i].belongDevice.status ? data[i].belongDevice.status : "");
								opt.belongDevice.maskIp = (data[i].belongDevice.maskIp ? data[i].belongDevice.maskIp : "");
								opt.belongDevice.localHttpPort = (data[i].belongDevice.localHttpPort ? data[i].belongDevice.localHttpPort : "");
								opt.belongDevice.localRtspPort = (data[i].belongDevice.localRtspPort ? data[i].belongDevice.localRtspPort : "");
								opt.belongDevice.netType = (data[i].belongDevice.netType ? data[i].belongDevice.netType : "");
								opt.belongDevice.localCmdPort = (data[i].belongDevice.localCmdPort ? data[i].belongDevice.localCmdPort : "");
								opt.belongDevice.localStreamPort = (data[i].belongDevice.localStreamPort ? data[i].belongDevice.localStreamPort : "");
								opt.belongDevice.natCmdPort = (data[i].belongDevice.natCmdPort ? data[i].belongDevice.natCmdPort : "");
								opt.belongDevice.version = (data[i].belongDevice.version ? data[i].belongDevice.version : "");
								opt.belongDevice.releaseVersion = (data[i].belongDevice.releaseVersion ? data[i].belongDevice.releaseVersion : "");
								opt.unline = (data[i].status == '2' ? "unline" : "");
								opt.isInviter = (data[i].inviterName.length ? '' : 'hide');
								opt.vtmIp = data[i].vtmIp || data[i].vtmDomain || '';
								if(opt.deviceSwitchStatuses.length){
									var newStatusArr = {};
									for(var j = 0 ; j< opt.deviceSwitchStatuses.length; j++) {
										if(opt.deviceSwitchStatuses[j].type == 7){
											newStatusArr.privacy = opt.deviceSwitchStatuses[j].enable;
										}
										if(opt.deviceSwitchStatuses[j].type == 8){
											newStatusArr.voiceSource = opt.deviceSwitchStatuses[j].enable;
										}
										newStatusArr.serial = opt.deviceSerial;
									}
									statusArr.push(newStatusArr);
								}
								
								html +=  _.template(temp, opt);
							}
						}
						$('.listBox .loading').addClass('hide');
						$(".listBox .listBoxInner").append(html);
						setPageOpt.isAjax = true;
						
					}else{
						setPageOpt.isMore = false;
						$('.listBox .loading').addClass('hide');
					}
					getCamerInfo();
					//startPlay();
					imgClick();
				   
				},
				error: function(){
					$('.listBox .loading').addClass('hide');
					dialog.warn('请求失败，请检查网络！');
				}
			});
		}

	// 增加公用部分内容
	require('./../../business/play_component/share');
	require('./../../business/cloud_service/getCloudStreamServer');

	var replay = window.replay = require('./../../business/play_component/replay').replay; // 回放模块
	var real = window.real = require('./../../business/play_component/real').real; // 实时预览模块
	var firstPlay = false;
	// -------------------------时间条初始化------------------------------//
	// 初始化时间进度条
	var urlparams = window.location.href.split('&');
	var len = urlparams.length;
	for(var i=0 ;i<len;i++){
		var alarmTime = urlparams[i];
		if(alarmTime.indexOf('alarmTime') > -1){
			var c = alarmTime.split('=')[1].replace('%20', ' ');//"2015-08-04 10:57:47"
			break;
		}
	}
	
	var ccTime = c?c:'';
	if(ccTime){
	    var date = ccTime.match(/(\d{2})/g);
	    date[0] = date.shift() + date[0];
	    ccTime = new Date(date[0], date[1] - 1, date[2], date[3], date[4], date[5]);		
	}

	var videoTimeBar = wall.videoTimeBar = new VideoTimeBar(
		{
			renderTo : '#pluginTime',
			additionalAttr : 'isCloud',
			width : 734,
			alarmTime:ccTime//从消息页面的报警消息过来回放
		}
	);
    if( $.cookie("multi_screen_"+$.cookie('DDNSCOOKIE').split(',')[2]) ){
        $.cookie("multi_screen_"+$.cookie('DDNSCOOKIE').split(',')[2],null,{expires:365,path:'/'});
    }
	// 添加时间条时间变动事件
	videoTimeBar.on('timechange', function(data) {
		$('._pluginPrompt').removeClass('_pluginPromptPrivacy').show();
		wall.toolbar.ptzPanel.addClass('_ptz_frm_hide').removeClass('_ptz_frm_show');
		wall.toolbar.ptzCtrl.addClass('_ptz_frm_hide').removeClass('_ptz_frm_show');
		wall.toolbar.ptzShow.addClass('hide');
		wall.toolbar.privacy.addClass('hide');
		$('.list').removeClass('hasPTZ');
		$('.listBox').show();
        $('.content-PTZ').hide();
        $('#operate').hide();
		//$('.list .tab:eq(0)').trigger('click');
		// 判断子用户权限
		
	 
		if (!replay.canSubUserReplay(wall.model.active.info, true)) {
			$('.goto_spot').css({
				'visibility' : 'visible'
			});
			return false;
			}

		if (wall.model.active.info.talking) {
			dialog.win({
				content : '正在对讲，确定要退出？',
				btn:['OK','CANCEL'],
				icoCls: 'ysDialog_warn',
				height:140,
				title:"提示",
				handler : function(type) {
					if(type== 'ok'){
						wall.toolbar.quitTalk(wall.model.active.info.talking);
						if (isReal) {
							isReal = false; // 转换工具条
							$('.goto_spot').css({
								'visibility' : ''
							});
							wall.toolbar.level.addClass('_levelDisable');
						}
						if (data) {
		
							wall.model.active.video.stop(0, wall.model.active.info.netType !== '0', true);
							var parseTime = data.parseTime;
							window.console && window.console.log("timechange - parseTime : " + parseTime);
							if (data.index >= 0) {
								replay.autoPlay(parseTime);
							} else {
								playerPrompt('当前时间点无录像视频');
								if (!data.hasRecord) {
									gloabStartPlay = parseTime;
								}
								replay.isHasSearch(parseTime);
							}
						}

					}else{
						if(wall.model.active.info.support_ptz){
		                    $('.list').addClass('hasPTZ');
		                    if($('.controlPTZ').hasClass("t_active")){
			                    $('.listBox').hide();
			                    $('.content-PTZ').show();
			                    $('#operate').show();
			                }
		                }
		                
		            
						
		                videoTimeBar.startMove(videoTimeBar.setValue(replay.toShowTime(new Date( currentTime+1 ))));
					}

				}
			});
		} else {
			if (isReal) {
				isReal = false; // 转换工具条
				$('.goto_spot').css({
					'visibility' : ''
				});
				wall.toolbar.level.addClass('_levelDisable');
			}
			if (data) {
				wall.model.active.video.stop(0, wall.model.active.info.netType !== '0', true);
				var parseTime = data.parseTime;
				window.console && window.console.log("timechange - parseTime : " + parseTime);
				if (data.index >= 0) {
					replay.autoPlay(parseTime);
				} else {
					playerPrompt('当前时间点无录像视频');
					if (!data.hasRecord) {
						gloabStartPlay = parseTime;
					}
					replay.isHasSearch(parseTime);
				}
			}
		}

	});

	videoTimeBar.on('calenscroll', function(time, a, b, c) {
		var start = time[0];
		time = start.split(' ')[0];
		time = time.replace(/-|:/g, '');
		var searchTime = time + "01T000000Z-" + time + "01T235959Z";
		replay.searchHasDataTime(searchTime);
	});

	videoTimeBar.on('calentimechange', function(time) {
		time = time.replace(/-|:/g, '');
		var searchTime = time + "01T000000Z-" + time + "01T235959Z";
		replay.searchHasDataTime(searchTime);
	});

	// 添加时间移动
	videoTimeBar.on('timebarMove', function(parseTime) {
		$('._brightness').addClass('_disable');
		// window.console && window.console.log("timebarMove - parseTime : " + parseTime);
		if (parseTime) {
			videoTimeBar.stopMove();
			replay.isHasSearch(parseTime);
		}
	});

	// 添加时间移动
	videoTimeBar.on('framesmove', function() {
		var osdTime =wall.model.active.video.el.HWP_GetOSDTime(0) * 1000;
		 window.console && window.console.log("videoPlay_osdTime157 : " + osdTime);
        var date = new Date(osdTime);
		return date.getTime();
	});

	function toolbarPlay(wall, config, playReal) {
		if (isReal || playReal) {
			window.replyType = playReal;
			real.playerHandler(wall, config);
			if (!isReal) {
				isReal = true;
				$('.goto_spot').css({
					'visibility' : 'hidden'
				});
				wall.toolbar.level.removeClass('_levelDisable');
				videoTimeBar.setValue(replay.toShowTime(new Date(currentTime)));
			}
		} else {
			wall.toolbar.ptzPanel.addClass('_ptz_frm_hide').removeClass('_ptz_frm_show');
			wall.toolbar.ptzCtrl.addClass('_ptz_frm_hide').removeClass('_ptz_frm_show');
			wall.toolbar.ptzShow.addClass('hide');
			wall.toolbar.privacy.addClass('hide');
			$('.list').removeClass('hasPTZ');
			//$('.list .tab:eq(0)').trigger('click');
			// 判断子用户权限
			if (!replay.canSubUserReplay(wall.model.active.info, true)) {
				$('.goto_spot').css({
					'visibility' : 'visible'
				});
				return false; 
				}

			var currTime = videoTimeBar.getValue();
			var recSeqment = wall.videoTimeBar.getRecordByTime(currTime);
			if (recSeqment && recSeqment.index >= 0) {
				replay.autoPlay(currTime);
			} else {
				recSeqment = wall.videoTimeBar.getNextRecord();
				if (recSeqment && recSeqment.index >= 0) {
					replay.autoPlay(recSeqment);
				} else {
					playerPrompt('当前时间点无录像视频');
				}
			}
		}
	}

	wall.on('play', toolbarPlay);
	// -------------------------时间条初始化 end------------------------------//

	// 视频列表信息 deviceSerials ： 设备序列集合，刷新时
	var cameraName = $('#cameraName'),
		listPanel = $('#listPanel'),
		listBox = $('.listBox'),
		listInfo = window.listInfo = {},
		deviceSerials = window.deviceSerials = [],
		activeInfo = window.activeInfo = {};

	
	var getCamerInfo = function () {
		var i = 0;
        var statusArrL = 0;
        //权限说明
		var permissionObj = {
			'0': 'RealPlay',
			'1': 'RemoteReplay',
			'2': '报警',
			'3': 'talk',
			'8': 'ptz'
		}; 

		// 设备列表
		$.each($('#listPanel').find('.pic'),function(i,v){
			var el = $(v.parentNode),
				supportext = v.getAttribute('supportext') || '{}';

            var support_talk = false;
			var support_ptz = false;
			var support_remote_auth_randcode = false;
			var support_ssl = false;//声源定位
            var ptz_preset = false;//云台预置点
			var support_privacy = false;//镜头遮蔽
			var fetchEncrypkeyTag = false;
			var canRealPlay = 'no';
			var canRemoteReplay = 'no';
		 
			//好友分享 
			//权限设置  为分享的
			if( v.getAttribute('permission') >0 ){
				var permissionToBin = toBin(v.getAttribute('permission'));
				var lengthToBin = permissionToBin.length-1;
				$.each(permissionObj,function(k,v){
					var d = parseInt(k,10);
	 
					if( lengthToBin >= d ){
						if( permissionToBin[lengthToBin-d] =='1' ){
							 if( v == 'talk' ){
								support_talk = true;
							 }
							 if( v == 'ptz' ){
								support_ptz = true;
							 }
							 if( v == 'RealPlay' ){
								canRealPlay = 'yes';
							 }
							 if( v == 'RemoteReplay' ){
								canRemoteReplay = 'yes';
							 }
						}
					}
				});
			}else{
			  support_talk = JSON.parse(supportext).support_talk != '0';
              support_ptz = JSON.parse(supportext).support_ptz = (JSON.parse(supportext).ptz_top_bottom || JSON.parse(supportext).ptz_left_right)== '1'; 
			  support_ssl = JSON.parse(supportext).support_ssl == '1';
			  ptz_preset = JSON.parse(supportext).ptz_preset == '1';
			  support_privacy = JSON.parse(supportext).support_privacy == '1';
              support_remote_auth_randcode = JSON.parse(supportext).support_remote_auth_randcode == '1';
			  canRealPlay = getSubUserPermissionState(v.getAttribute('permission'), USER_PERMISSION_REAL_PLAY);
			  canRemoteReplay = getSubUserPermissionState(v.getAttribute('permission'), USER_PERMISSION_REMOTE_REPLAY);
			}


			listInfo[v.getAttribute('cameraid')] = {
				cameraId : v.getAttribute('cameraid'),
				deviceIp : v.getAttribute('deviceip'),
				httpPort : v.getAttribute('httpport') - 0,
				devicePort : v.getAttribute('deviceport') - 0,
				cmdPort : v.getAttribute('cmdPort') - 0,
				streamPort : v.getAttribute('streamPort') - 0,
				localDeviceIp : v.getAttribute('localdeviceip'),
				localIp : v.getAttribute('localdeviceip'),
				localHttpPort : v.getAttribute('localhttpport') - 0,
				localDevicePort : v.getAttribute('localdeviceport') - 0,
				localCmdPort : v.getAttribute('localCmdPort') - 0,
				localStreamPort : v.getAttribute('localStreamPort') - 0,
				cameraName : v.getAttribute('cameraname'),
				plainPassword : v.getAttribute('plainpassword'),
				netType : v.getAttribute('netType') - 0,
				casIp : v.getAttribute('casIp'),
				disknum : v.getAttribute('diskNum'),
				disksta : v.getAttribute('diskstatus'),
				maskIp : v.getAttribute('maskIp'),
				casPort : v.getAttribute('casPort') - 0,
				status : v.getAttribute('status') - 0,
				deviceSerial : v.getAttribute('deviceSerial'),
				subSerial : v.getAttribute('deviceSerial'),
				serial : v.getAttribute('fullSerial'),
				fullSerial : v.getAttribute('fullSerial'),
				fullModel : v.getAttribute('fullModel'),
				hikPort : v.getAttribute('hikPort'),
				model : v.getAttribute('model'),
				channelNo : v.getAttribute('channelno') * 100 + 2,
				orginChannelNo : v.getAttribute('channelno'),
				videolevel : v.getAttribute('videolevel'),
				capability : v.getAttribute('capability'),
				privateStatus : v.getAttribute('privateStatus'),
				upnp : v.getAttribute('upnp') + '',
				vtmDomain :v.getAttribute('vtmDomain'),
				vtmIp : v.getAttribute('vtmIp') || v.getAttribute('vtmDomain') || '',
				vtmPort : v.getAttribute('vtmPort') - 0,
				ttsIp : v.getAttribute('ttsIp') + '',
				ttsPort : v.getAttribute('ttsPort') - 0,
				// quality的值是0时，默认设置成子码流（值：2）
                quality : v.getAttribute('capability').split('-')[v.getAttribute('videolevel')] == '0'? 2 : (v.getAttribute('capability').split('-')[v.getAttribute('videolevel')] - 0),
				upgrade : v.getAttribute('isNeedUpgrade'),
				isNeedUpgrade : v.getAttribute('isNeedUpgrade'),
				deviceVersion : v.getAttribute('version'),
				version : v.getAttribute('version'),
				releaseVersion : v.getAttribute('releaseVersion'),
				isEncrypt : v.getAttribute('isEncrypt'),
				encryptPwd : v.getAttribute('encryptPwd'),
				authSvrAddr : v.getAttribute('authSvrAddr'),
				support_talk : support_talk,
				support_ptz : support_ptz,
				support_ssl : support_ssl,
				ptz_preset : ptz_preset,
				support_privacy : support_privacy,
				support_cloud : JSON.parse(supportext).support_cloud == '1',
				support_cloud_version : JSON.parse(supportext).support_cloud_version == '1',
				support_message : JSON.parse(supportext).support_message == '1',
                support_resolution:JSON.parse(supportext).support_resolution ? JSON.parse(supportext).support_resolution:'',
				forceStreamType : v.getAttribute('forceStreamType'),
				canRealPlay : canRealPlay,
				canRemoteReplay : canRemoteReplay,
				support_remote_auth_randcode : support_remote_auth_randcode,
				fetchEncrypkeyTag : fetchEncrypkeyTag,
				deviceStatus : v.getAttribute('deviceStatus') - 0,
				belongSerial : v.getAttribute('belongSerial'),
				belongState : v.getAttribute('belongState'),
				belongNo : v.getAttribute('belongNo') * 100 + 2,
				belongDevice_deviceSerial : v.getAttribute('belongDevice_deviceSerial'),
				belongDevice_casIp : v.getAttribute('belongDevice_casIp'),
				belongDevice_casPort : v.getAttribute('belongDevice_casPort') - 0,
				belongDevice_plainPassword : v.getAttribute('belongDevice_plainPassword'),
				belongDevice_devicePort : v.getAttribute('belongDevice_devicePort') - 0,
				belongDevice_upnp : v.getAttribute('belongDevice_upnp'),
				belongDevice_deviceIp : v.getAttribute('belongDevice_deviceIp'),
				belongDevice_httpPort : v.getAttribute('belongDevice_httpPort') - 0,
				belongDevice_localDeviceIp : v.getAttribute('belongDevice_localDeviceIp'),
				belongDevice_status : v.getAttribute('belongDevice_status'),
				belongDevice_maskIp : v.getAttribute('belongDevice_maskIp'),
				belongDevice_localHttpPort : v.getAttribute('belongDevice_localHttpPort') - 0,
				belongDevice_localDevicePort : v.getAttribute('belongDevice_localDevicePort') - 0,
				belongDevice_netType : v.getAttribute('belongDevice_netType') - 0,
				belongDevice_localCmdPort : v.getAttribute('belongDevice_localCmdPort') - 0,
				belongDevice_localStreamPort : v.getAttribute('belongDevice_localStreamPort') - 0,
				belongDevice_cmdPort : v.getAttribute('belongDevice_cmdPort') - 0,
				belongDevice_streamPort : v.getAttribute('belongDevice_streamPort') - 0,
				belongDevice_version : v.getAttribute('belongDevice_version'),
				belongDevice_releaseVersion : v.getAttribute('belongDevice_releaseVersion'),
				isshare:v.getAttribute('isshare'),
				inviterName:v.getAttribute('inviterName'),
                inviterPhone:v.getAttribute('inviterPhone'),
                cloudServiceStatus:v.getAttribute('cloudServiceStatus'),
				dom : v,
				el : el,
				defence : el.find('b.m1', true),
				diskStatus : el.find('b.m2', true),
				privateStatusEl : el.find('b.m3', true),
				playing : false,
				recording : false,
				recirdTime : 0,
				talking : false,
				voiceing : false,
				index : ++i,
				permission :  v.getAttribute('permission')
			};
			if( statusArr && statusArrL <= statusArr.length){
				listInfo[v.getAttribute('cameraid')]['privacy']	= (statusArr[statusArrL] && statusArr[statusArrL]['privacy'])|| false;
				listInfo[v.getAttribute('cameraid')]['voiceSource']	= (statusArr[statusArrL] && statusArr[statusArrL]['voiceSource']) || false;
				statusArrL++;
			}

			// 设备序列号array
			deviceSerials.push(v.getAttribute('deviceSerial'));
			if (v.getAttribute('status') == '2') {
				el.addClass('unline');
			}
			if(v.getAttribute('inviterName').length){
				$(el).find('p.comeFromUser').removeClass('hide');
				var inviterName = Base.format(v.getAttribute('inviterName') || '');
				var inviterPhone = Base.format(v.getAttribute('inviterPhone') || '');
				$(el).find('p.comeFromUser >span').html(inviterName).attr('title',inviterPhone).css({"position": "relative","cursor": "pointer"});
			}	
		});
	 	

		// 获取当前选中的设备
		activeInfo = listInfo[cameraId];
		if (!activeInfo) { // 判断当前设备不存在，已被删除，则跳转到主页面
			hint.show({content: '您要播放的设备已删除！' });
			setTimeout(function() {
				window.location.href = basePath + '/user/userAction!goToMyShipin7.action';
			}, 1000);
		}
 
       if (activeInfo.canRealPlay == 'no') {
			$('.goto_spot').css({
				'visibility' : 'hidden'
			});
	   }

		if (activeInfo.support_talk && currentUserType != 2) {
			wall.toolbar.talk.removeClass('hide');
		}
		if (activeInfo.support_ptz && currentUserType != 2) {
			wall.toolbar.ptzShow.removeClass('hide');
			if(!activeInfo.support_privacy){
				wall.toolbar.privacy.addClass('hide');
			}else{
				wall.toolbar.privacy.removeClass('hide');
			}
			if(!activeInfo.support_ssl){
				$('.list .sfar').addClass('hide');
			}else{
				$('.list .sfar').removeClass('hide');
			}
			if(!activeInfo.ptz_preset){
				$('.list .collectLocation').addClass('hide');
			}else{
				$('.list .collectLocation').removeClass('hide');
			}
			$('.list').addClass('hasPTZ');

			// 如果有云台控制，则默认就直接显示云台控制标签
			if(!setPageOpt.isScroll){
				$('.list .tab:eq(1)').addClass('t_active').siblings().removeClass('t_active');
				$('.listBox').hide();
				$('.content-PTZ').show();
				$('#operate').show();
			}
			//$('.list .tab:eq(0)').trigger('click');
		}     

		if (activeInfo.support_message && currentUserType != 2) {
			wall.toolbar.message.removeClass('hide');
		} else {
			wall.toolbar.message.addClass('hide');
		}

		//cloudServiceStatus,云存储状态 ：-1-关闭 ，1-开启，2-过期，0-暂停//1,2,-1暂无
        //交互定为 未开启和开启，未开启都显示了解一下。原因：这边cloudServiceStatus 获取的是设备云存储状态，只有开启和未开启。后端如果修改为用户的云存储状态，代码改动较大，且会影响页面加载时间和取流速度。
		if (activeInfo.support_cloud_version && currentUserType != 2 && activeInfo.status !=2) {
			var serial = activeInfo['deviceSerial'];
			if(activeInfo.cloudServiceStatus =="-1"){
				hideCloudActive();
				showCloudAvailable(serial);
			}else if(activeInfo.cloudServiceStatus =="0"){
				//hideCloudAvailable();
				//showCloudActive(serial);

                hideCloudActive();
                showCloudAvailable(serial);
			}else{
				hideCloudAvailable();
				hideCloudActive();
			}
		}else{
			hideCloudAvailable();
			hideCloudActive();
		} 
		if(activeInfo.inviterName.length || userType == 2){
			$('.videoShare').addClass('hide');
		}else{
			$('.videoShare').removeClass('hide');
		}
		var _type = activeInfo['model'],
			_version = activeInfo['version'].split(' ')[2];

		if (_type && _version) {

			if (!((_type.search(/C1|C2|C3|C4|8464|8133|F1/i) > -1) && (_version > '131201')) || activeInfo.inviterName.length) {
				$('#chartWrapper').hide();
				$('.up_canle_timebox').removeClass('hide');
			} else {
				$('#chartWrapper').show();
				$('.up_canle_timebox').removeClass('hide');
			}
			if(_type.search(/S1/i) > -1){
				$('#chartWrapper').hide();
				$('.up_canle_timebox').addClass('hide');
			}

			if (_type.search(/F1/i) > -1) {
			//	wall.toolbar.brightness.removeClass('hide');
				var sessionId = $.cookie('DDNSCOOKIE').split(',')[0],
					serial = activeInfo['deviceSerial'],
					casIp = activeInfo['casIp'],
					casPort = activeInfo['casPort'];

				var obj1 = {
					'Serial' : serial
				},
					obj2 = {
						'casIP' : casIp,
						'casPort' : casPort
					};

				var str1 = JSON.stringify(obj1),
					str2 = JSON.stringify(obj2);
					//if(!wall.model.active.info.playing ){

						ret = wall.model.active.video.el.HWP_GetLightCfg(sessionId, str1, str2);
					//}
				//

			} else {
				wall.toolbar.brightness.addClass('hide');
			}

		}

		// 添加
		activeInfo.el.addClass('isPlaying ');
		wall.model.active.info = activeInfo;
		wall.lastInfo = activeInfo;
		chart(activeInfo);
		wall.model.active.video.playVideo = function() {
			// 子用户不检查升级
			if (currentUserType == 2) {
				setTimeout(startPlay, 300);
			} else {
				
				var tag = checkDeviceUpgrade();
				if (tag) {
					//播放实时视频权限。现场视频权限
					if( activeInfo.canRealPlay == 'no' ){
						if (wall.model.active.info) {
							wall.model.active.info.playing = false;
						}
						//wall.model.active.info = wall.model.active.video.info = activeInfo;
						playerPrompt('您没有查看该摄像机实时视频的权限哦~');
					}else{
					    setTimeout(startPlay, 300);
					}
					
				}
			}
		};
		wall.updateStatus();
		updateTitle()

		// 摄像机列表滚动到指定位置
		listBox.scrollTop = (wall.model.active.info.index - 2) * 195 + 10;

		// 留言回复模式
		real.messageReplyType();

	};


	// 默认开始播放
	function startPlay(newpwd) {
//        if((util.browser.isMac ||util.browser.isAir) && !wall.model.active.video.el.HWP_Play_V17){
//            playerPrompt('<a href="http://www.ys7.com/product-download.html" target="_blank">点击下载视频服务插件</a>');
//            return;
//        }
		$('._level').addClass('_levelDisable').html( ['流畅','均衡','高清'][wall.model.active.info.videolevel]);

		if (isReal) { // 判断是否实时预览
			$('.goto_spot').css({
				'visibility' : 'hidden'
			});
			wall.toolbar.level.removeClass('_levelDisable')
			var date = new Date( currentTime );
			videoTimeBar.setValue(replay.toShowTime(date));
			gloabStartPlay = false;
			
			if(wall.model.active.info.privacy && wall.model.active.info.status != 2){//设备在线且云台镜头遮蔽
				wall.model.active.video.showPrompt();
				$('._privacy').removeClass('_privacyOn').attr('title','点击可关闭镜头遮蔽');
				$('._pluginPrompt').attr('class','_pluginPrompt _pluginPromptPrivacy').html('<span class="icon">镜头遮蔽中</span>').fadeIn();
				$('._Toolbar').addClass('_disable privacying');
				wall.toolbar.level.addClass('_levelDisable');

			}else{
				$('._privacy').addClass('_privacyOn').attr('title','点击可开启镜头遮蔽');
				$('._pluginPrompt').removeClass('_pluginPromptPrivacy').html('').show();
				//$('._level').removeClass('_levelDisable').html( ['流畅','均衡','高清'][wall.model.active.info.videolevel]);
				if(!firstPlay){
					firstPlay = true;
					real.playerHandler(wall, wall.model.active.info, true);
				}
			}
		//	if(activeInfo.canRemoteReplay !="no"){//无远程回放权限不搜索录像
				replay.isHasSearch(videoTimeBar.getValue());
		//	}

		} else {
			//$('._level').addClass('_levelDisable').html( ['流畅','均衡','高清'][wall.model.active.info.videolevel]);
				replay.searchPlay();
		}
	}
	function showCloudAvailable(serial){
		if($.cookie("closeAvailable_"+serial)=="true"){
			hideCloudAvailable();
		}else{
			$('.cloud_storage').removeClass('hide');
			$('.available').removeClass('hide');
		}
	}
	function hideCloudAvailable(){
		if($('.cloud_storage').hasClass('hide') && $('.available').hasClass('hide')){
			return;
		}else{
			$('.cloud_storage').addClass('hide');
			$('.available').addClass('hide');
		}
	}
	function hideCloudActive(){
		if($('.cloud_storage').hasClass('hide') && $('.active').hasClass('hide')){
			return;
		}else{
			$('.cloud_storage').addClass('hide');
			$('.active').addClass('hide');
		}
	}
	function showCloudActive(serial){
		if($.cookie("closeActive_"+serial)=="true"){
			hideCloudActive();
		}else{
			$('.cloud_storage').removeClass('hide');
			$('.active').removeClass('hide');
		}
	}
	$('.available_close').click(function(){
		var serial = activeInfo.subSerial;
		$.cookie("closeAvailable_"+serial, 'true');
		showCloudAvailable(serial);
	});
	$('.active_close').click(function(){
		var serial = activeInfo.subSerial;
		$.cookie("closeActive_"+serial, 'true');
		showCloudActive(serial);
	});
	var serverCloud = new ServerCloud();
	$('.active_ok').click(function(){
		 var obj = {
                 deviceSerial : activeInfo.subSerial,
                 channelNo :activeInfo.orginChannelNo ,//activeInfo.orginChannelNo
                 enable : 1
             }
		serverCloud.cloudService(obj,2,function( isOk, msg,data ){
			if(isOk){
				hint.show({content: '激活成功' });
				$('.active_ok').removeClass('load');
				$('.cloud_storage').addClass('hide');
                activeInfo.cloudServiceStatus = "1";
			}else{
				dialog.errorInfo({
                    content:msg
                });
			}
			 $('.active_ok').html('激活');
			 $('.active_ok').removeClass('load');
		});
		 $('.active_ok').html('正在激活');
		 $('.active_ok').addClass('load');
	});
	$('.available_ok').click(function(){
		// var obj = {
         //        deviceSerial : activeInfo.subSerial,
         //        channelNo : activeInfo.orginChannelNo
         //    }
		//serverCloud.cloudService(obj,0,function( isOk,msg, data ){
		//	if(isOk){
		//		hint.show({content: '开通成功' });
		//		$('.available_ok').removeClass('load');
		//		$('.cloud_storage').addClass('hide');
         //       activeInfo.cloudServiceStatus = "1";
		//	}else{
		//		dialog.errorInfo({
         //           content:msg
         //       });
		//	}
		//	$('.available_ok').html('同意服务协议并开通');
		//	$('.available_ok').removeClass('load');
		//});
		//	$('.available_ok').html('正在开通');
		//	$('.available_ok').addClass('load');

		window.location.href= payUrl;
	});
	
	
	
	// 插件事件抛出
	window.PluginEventHandler = function(lEventType, lParam1, lParam2, lUserData, errorCode) {
		window.console && console.log("lEventType  -  " + lEventType);
	    if (lEventType === 0 || lEventType === 1 || lEventType === 4 || wall.model.active.info.inviterName.length) {
            hideCover();
		}
		if(wall.model.active.info.isshare == "OVERDUE"){
			playerPrompt('播放失败');
			wall.model.active.video.loadingHide();
			return;
		}


		switch (lEventType) {
			case 0 : // 播放失败
				wall.model.active.info.playing = false;
				wall.model.active.info.recirdTime = 0;
				wall.model.active.info.recording = false;
				wall.model.active.video.recording = false;
				wall.model.active.video.toDefer();
				wall.updateStatus();
				if (errorCode == 410 || errorCode == 453) {
					if (!isReal) {
						var cloudSeqment = replay
								.hasCloudSeqment(wall.model.active.startPlayTime, wall.model.active.endPlayTime, videoTimeBar
										.getValue());
						if (!$.isEmptyObject(cloudSeqment)) {
							playerPrompt('设备达到最大连接数，正在切换云存储录像');
							replay.autoPlay(cloudSeqment);
							return;
						}
					}
				}
				pluginError(errorCode);
				break;
			case 1 :
				wall.model.active.info.playing = "loading";
				wall.model.active.info.recirdTime = 0;
				wall.model.active.info.recording = false;
				wall.model.active.video.recording = false;
				wall.model.active.video.toDefer(true);
				wall.updateStatus({
					defer : true
				});
				break;
			case 3 : // 播放开始
				hideWindow();
                wall.model.active.video.hidePrompt();
                wall.model.active.video.loadingHide();
				wall.model.active.info.playing = true;
				wall.model.active.info.pausing = false;
				wall.model.active.info.recirdTime = 0;
				wall.model.active.info.recording = false;
				wall.model.active.video.recording = false;
				wall.updateStatus();
				wall.model.active.video.hidePrompt();
				wall.model.active.video.toDefer();
				changeSound();
				// 判断当前是实时预览
				if (isReal) {

					var activeInfo = wall.model.active.info,
						_type = activeInfo['model'],
						_version = activeInfo['version'].split(' ')[2];
					if (_type.search(/F1/i) > -1) {

						var sessionId = $.cookie('DDNSCOOKIE').split(',')[0],
							serial = activeInfo['deviceSerial'],
							casIp = activeInfo['casIp'],
							casPort = activeInfo['casPort'];

						var obj1 = {
							'Serial' : serial
						},
							obj2 = {
								'casIP' : casIp,
								'casPort' : casPort
							};

						var str1 = JSON.stringify(obj1),
							str2 = JSON.stringify(obj2);
						ret = wall.model.active.video.el.HWP_GetLightCfg(sessionId, str1, str2);

					} 
					
					videoTimeBar.startMove();
					real.talkReplyType();
					
					if (currentUserType !== '2'){
					    replay.isHasSearch(videoTimeBar.getValue());
					}else if(wall.model.active.info.canRemoteReplay == 1){
					    replay.isHasSearch(videoTimeBar.getValue());
					}
					
				} else {
					wall.toolbar.ptzPanel.addClass('_ptz_frm_hide').removeClass('_ptz_frm_show');
					wall.toolbar.ptzCtrl.addClass('_ptz_frm_hide').removeClass('_ptz_frm_show');
					wall.toolbar.ptzShow.addClass('hide');
					wall.toolbar.privacy.addClass('hide');
					//$('.list').removeClass('hasPTZ');
					//$('.list .tab:eq(0)').trigger('click');
					var nextRecord = videoTimeBar.getNextRecord(wall.model.active.endPlayTime);
					if (nextRecord.index >= 0) {
                        var  cloudFileInfoObj = nextRecord;
                        if(cloudFileInfoObj.isCloud){
                            cloudFileInfoObj.fileId = nextRecord.cloudFile.file_id;
                            getCloudServerInfoNew(cloudFileInfoObj,replay.setNextRecordInfo);
                        }else{
                            replay.setNextRecordInfo(nextRecord);
                        }                    
					//	replay.setNextRecordInfo(nextRecord);
						return;
					}
				}
                // 根据needcover判断是否显示设置封面提示信息 1- 需要 0 - 不需要
                if ( ($('.isPlaying').find('img').attr('needcover') === "1") && ( $.cookie('DDNSCOOKIE').split(',')[7] != '2' )) {
                    $('.coverIframe').removeClass('hide');
                    $('.coverTip').removeClass('hide');
                }
				break;
			case 4 : // 播放终止
				wall.model.active.info.playing = false;
				wall.updateStatus();
				break;
			case 5 : // 回放结束
				wall.model.active.info.playing = false;
				wall.updateStatus();
				var nextRecord = videoTimeBar.getNextRecord();
				if (nextRecord.index >= 0) {
					replay.autoPlay(nextRecord);
					return;
				}
				wall.model.active.video.setPrompt('回放结束');
				// 回放结束，隐藏设置封面
				hideCover();
				break;
			case 16 :
				wall.model.active.info.talking = true;
				wall.toolbar.talk.removeClass('_talkloading').addClass('_talk');
				wall.toolbar.talkStatus();
				wall.model.active.video.closeSound();
				wall.model.active.video.el.HWP_setVoiceTalkVolume_V17(0, $("._voiceBox .progress").slider("value"));
				real.sendTalkInfo(lEventType, errorCode, lParam2);
				// hint.show('对讲开启成功，请开始说话', 'right');
				break;
			case 17 :
				wall.model.active.info.talking = false;
				
				wall.toolbar.quitTalk();
				wall.toolbar.talk.addClass('_talk').removeClass('_talkloading _talking');
				wall.toolbar.talk.attr('title', '开启对讲');
				changeSound();
				// 只处理5513,3500事件
				if (errorCode == '5513' || errorCode == '3500') {
					dialog.warn('<span style="font-size: 15px;">对讲中断，设备已开启镜头遮蔽</span>');
				}
				break;
			case 18 :
				wall.model.active.info.talking = false;
				wall.toolbar.quitTalk();
				wall.toolbar.talk.addClass('_talk').removeClass('_talkloading _talking');
				wall.toolbar.talk.attr('title', '开启对讲');
				changeSound();
				if (talkErrorText[errorCode]) {
					dialog.errorInfo({
	                    content:talkErrorText[errorCode]
	                });
				} else {
					dialog.errorInfo({
	                    content:'对讲失败'
	                });
				}
				real.sendTalkInfo(lEventType, errorCode, lParam2);
				break;
			case 20 : // 查询录像成功
			//	if (isReal && !firstPlay) {
				//	firstPlay = true;
				//	real.playerHandler(wall, wall.model.active.info, true);
			//	}
				replay.renderRecordSeqment(2, lParam2);
				break;
			case 22 : // 查询录像失败
				//3255认证无权限，当IPC被分享，但其有关联的N1，D1等存储设备时（存储设备无法被分享），就会出现该错误
				if (errorCode != 3255) {
					pluginError(errorCode, null, true);
				}

				if (!isReal) {
					replay.startPlayRecord();
				} else {
				//	if (errorCode != 401 && errorCode != 2012 && !firstPlay) {
				//		firstPlay = true;
					//	real.playerHandler(wall, wall.model.active.info, true);
				//	}
				}
				var searchDate = wall.searchEndTime && wall.searchEndTime.split(' ')[0];
				replay.rmYetSearchDate(searchDate);
				replay.renderRecordSeqment(4);
				break;
			case 28 : // 回放异常，可能是接收数据超时
				wall.model.active.info.playing = false;
				wall.updateStatus();
				if (errorCode == 410 || errorCode == 453) {
					if (!isReal) {
						var cloudSeqment = replay
								.hasCloudSeqment(wall.model.active.startPlayTime, wall.model.active.endPlayTime, videoTimeBar
										.getValue());
						if (!$.isEmptyObject(cloudSeqment)) {
							playerPrompt('设备达到最大连接数，正在切换云存储录像');
							replay.autoPlay(cloudSeqment);
							return;
						}
					}
				}
				pluginError(errorCode, '回放异常，请求数据超时，请重试');
				// wall.model.active.video.setPrompt('回放异常，请求数据超时，请重试');
				break;
			case 44 :// 查询录像成功
				if (lParam2 != '') {
					// 自动补位
					var addZero = function(num) {
						var str = String(num);
						if (str.length == 1) {
							return '0' + str;
						} else {
							return str;
						}
					};
					var dayObj = JSON.parse(lParam2);
					if (dayObj.DayList != '') {
						var templist = dayObj.DayList.split(',');
						var tempResult = [];
						for (var i = 0; i < templist.length; i++) {
							tempResult.push(dayObj.SearchYear + '-' + addZero(dayObj.SearchMonth) + '-'
									+ addZero(templist[i]));
						}
						wall.videoTimeBar.setVideoData(tempResult);
					}

				}
				break;
			case 45 :
				window.console && window.console.log("按月搜索失败：errorCode : " + errorCode);
				break;
			case 61 : // 回放云存储定位失败
				wall.model.active.info.playing = false;
				wall.updateStatus();
				playerPrompt('回放异常，定位失败');
				break;
			case 62 : // 留言上传云存储成功
				real.saveLeaveMessage(lParam1, lParam2);
				break;
			case 63 : // 留言上传云存储失败
				dialog.warn('<span style="font-size: 15px;">服务器异常，发送失败</span>');
				real.sendMessageInfo(3, errorCode);
				sendMessage.clear();
				return;
			case 90 : // 取流执行过程消息
				wall.model.active.video.toload(lParam2);
				break;
			case 60 : // 1.6.2版的 验证密码正确
			case 70 : // 1.7版的 验证密钥正确
				// 1.6设备密码正确事件，1.7密码正确事件
				hideWindow();
				break;
			case 40 :
				var value = JSON.parse(lParam2)['LightCfg'][0]['Light'];
				value = parseInt(value) * 10;
				$("._brightBox .progress").slider({
					'value' : value
				});
				break;
			case 91 : // 统计接口方式（取流类型）
				sendInfo(lParam2, 0);
				break;
			case 92 : // 统计接口方式（取流类型）
				sendInfo(lParam2, 1);
				break;
			case 2045://流媒体取流认证session不存在
				window.location.reload();
			case 3146://无效的session
				window.location.reload();
			case 3253://认证session错误
				window.location.reload();
			default :
				break;
		}
		// 处理控件错误码
		function pluginError(errorCode, defaultErrorMsg, isSearch) {
			var errCode = errorCode || wall.model.active.video.el.HWP_GetLastError();
            // 3121 为设备不在线。原本此处有个BUG，当回放时，弹出输入验证码框，确定后，失败了。验证码框消失。原因：第一次弹出点击确定后，再次触发了此地。但是 errCode == 3121；故消失了。 这边加上设备不在线时 判断。
			if (errCode != 401 && errCode != 2012 && errCode != 3121) { // 不是设备密码错误和安全验证码错误的情况下隐藏页面上的窗口
				hideWindow();
			}
			switch (errCode) {
				case 16 :
					wall.model.active.info.playing = false;
					playerPrompt('连接失败');
					break;
				case 56 :
					wall.model.active.info.playing = false;
					playerPrompt('视频播放失败，请检查您的网络');
					break;
				case 401 :
					// 设备密码错误
					wall.model.active.info.playing = false;
					if (wall.model.active.info.belongDevice_deviceSerial) {
						showPwdDialog(errCode, '设备密码', '设备密码：', '摄像机已与网络录像机关联，请输入网络录像机的密码', '视频播放失败，设备密码不正确', false, isSearch);
					} else {
						showPwdDialog(errCode, '设备密码', '设备密码：', '您的设备版本过低，需要输入设备密码，建议您升级设备 ', '视频播放失败，设备密码不正确', false, isSearch);
					}
					if ($("#diaPass").parent().find(".version16Prompt").size() <= 0) {
						$("#diaPass").parent().append(version16PromptHtml);
					}
					break;
				case 2012 :
					// 密码错误'密码','密码：','您的视频已加密，请输入密码');
					playerPrompt('视频播放失败，视频已加密');
					if($('#ys-window').css('display') != "none"){
						setErrorPrompt('密码不正确');
						break;
					}
					if(wall.model.active.info.isshare == "CUSTOMER"){
						showPwdDialog(errCode, '请输入视频图片加密密码', '密码：', '视频已加密，请联系分享者获取密码进行查看', '视频已加密，请联系分享者获取密码进行查看', false);
					}else{
						if(wall.model.active.info.fetchEncrypkeyTag){
							showPwdDialog(errCode, '提示', '密码：', '图像近期修改过加密密码，请输入密码进行查看<br><span style="color: #b1b1b1;">初始密码为机身标签上的验证码，如果没有验证码，请输入ABCDEF（密码区分大小写）</span> ', '视频播放失败，密码不正确', false);
							wall.model.active.info.fetchEncrypkeyTag = false;
						}else{
							showPwdDialog(errCode, '请输入视频图片加密密码', '密码：', '您的视频已加密，请输入密码进行查看<br><span style="color: #b1b1b1;">初始密码为机身标签上的验证码，如果没有验证码，请输入ABCDEF（密码区分大小写）</span> ', '视频播放失败，密码不正确', false);
						}
					}
					break;
				case 20 :
					playerPrompt('连接超时');
					break;
				case 410 :
					wall.model.active.info.playing = false;
					playerPrompt('设备连接数过大，请停止其它连接后重试');
					break;
				case 453 :
					wall.model.active.info.playing = false;
					playerPrompt('视频播放失败，N1连接超过最大值，网络带宽不足');
					break;
				case 409 :
					wall.model.active.info.playing = false;
					playerPrompt('视频播放失败，摄像机已开启镜头遮蔽模式');
					break;
				case 402 :
					wall.model.active.info.playing = false;
					playerPrompt('没有找到录像');
					break;
                case 801:
                case 3121:
                    playerPrompt('设备不在线，请刷新或检查设备网络');
                    wall.model.active.video.info.el.addClass('unline');
                    break;
				case 3061 :
				case 3062 :
				case 3063 :
					wall.model.active.info.playing = false;
					playerPrompt('查询录像失败');
					break;
				case 3209 :
					wall.model.active.info.playing = false;
					playerPrompt('视频播放失败，与服务器通讯失败');
					break;
				case 3146 :
					wall.model.active.info.playing = false;
					playerPrompt('视频播放失败，请刷新页面');
					break;
				case 3142 :
					wall.model.active.info.playing = false;
					playerPrompt('视频播放失败，用户未开通云存储');
					break;
				case 3147 :
					wall.model.active.info.playing = false;
					playerPrompt('视频播放失败，无效的文件句柄');
					break;
				case 3150 :
					wall.model.active.info.playing = false;
					playerPrompt('视频播放失败，无效的文件');
					break;
				case 3149 :
					wall.model.active.info.playing = false;
					playerPrompt('视频播放失败，不支持的文件类型');
					break;
				default :
					playerPrompt(defaultErrorMsg);
					break;
			}
			wall.updateStatus();
		}
		if($('.list').hasClass('hasPTZ')){
			if(wall.model.active.info.privacy && wall.model.active.info.status != 2){//设备在线且云台镜头遮蔽
				wall.model.active.video.showPrompt();
				wall.model.active.video.loadingHide();
				$('._privacy').removeClass('_privacyOn').attr('title','点击可关闭镜头遮蔽');
				$('._pluginPrompt').attr('class','_pluginPrompt _pluginPromptPrivacy').html('<span class="icon">镜头遮蔽中</span>').fadeIn();
				$('._Toolbar').addClass('_disable privacying');
			}else{
				$('._privacy').addClass('_privacyOn').attr('title','点击可开启镜头遮蔽');
				if(!$('._loadinghide').length){
					$('._pluginPrompt').removeClass('_pluginPromptPrivacy').html('').show();
			    }
			}
		}
	};
	function setErrorPrompt(text){
		$('.password .diaPass').val('');
		$('.passError').addClass('show').html(text);
	}
	//使用场景：点击获取验证码，按钮倒计时
    function countdown(element ){
        var sec = 60,
            countId = setInterval(count,1000);
        element.addClass("disabledBtn").attr("disabled","disabled");
        function count(){
            element[0].innerHTML ="重新获取（"+sec+"）" ;
            if(!(sec--)){
                element[0].innerHTML ="重新获取" ;
                clearInterval(countId);
                element.removeClass("disabledBtn").removeAttr("disabled");
                element.attr('data-btn','true');
            }
        }

        function repeat(){
            element[0].innerHTML ="重新获取" ;
            clearInterval(countId);
            element.removeClass("disabledBtn").removeAttr("disabled");
        }
        return repeat;
    }
    //弹出已发出短息提示信息框
    function showMobileKeyCodeTpl(data){
    	var reg = /(\d{3})\d{4}(\d{4})/;
		var getMobileKeyCodeTpl = [
			'<p>萤石云已经向您的手机'+data.phone.replace(reg,"$1****$2")+'发送了一条短信，请输入您收到的验证码，短信可能会延时，请稍等片刻。</p>',
			'<div class="getMobileKeyCodeBox clearfix"><label for="phoneNumber" class="phoneNumberBox">',
			'<div class="inputTip" >验证码：</div>',
            '<input type="text" autocomplete="off" class="phoneNumber texts" maxlength="50" id="phoneNumber" name="phoneNumber" >',
            '</label>',
            '<a href="javascript:;" class="btn getMobileKeyCode" id="getMobileKeyCode" data-btn="false">正在获取...</a></div>',
            '<div class="passErrorPrompt"></div>',
            '<div class="ys-btn showMobileKeyBtnBox">',
				'<input type="button" class="btnStyle handler okHandler" value="确定">&nbsp;&nbsp;<input type="button" class="btnStyle handler cancelHandler" value="取消">',
			'</div>',
			'<p class="picPwdChkBack">图像密码验证</p>'
		].join('');
		dialog.win({
			content:getMobileKeyCodeTpl,
			title: '手机验证码验证',//弹出窗标题
			height:240,//弹出窗高度
			width:340
		});
		$(".showMobileKeyBtnBox .okHandler").on('click',function(){
			var value = $('.phoneNumber').val();
			if(value == ""){
				$('.passErrorPrompt').html('不能为空').show();
			}else{
				var reqData = {
					checkcode : value,
					serial	 : wall.model.active.info.deviceSerial
				}
				fetchEncrypkey(reqData);
			}
			return false;
		});
		$(".showMobileKeyBtnBox .cancelHandler").on('click',function(){
			hideWindow();
			return false;
		});
		$(".picPwdChkBack").on('click',function(){
			hideWindow();
			showPwdDialog(2012, '请输入视频图片加密密码', '密码：', '您的视频已加密，请输入密码进行查看<br><span style="color: #b1b1b1;">初始密码为机身标签上的验证码，如果没有验证码，请输入ABCDEF（密码区分大小写）</span> ', '视频播放失败，密码不正确', false);
		});
    }
    //获取短信验证码
	function getMobileKeyCode(isFirst){
		var fetchCheckcodeMessage = {
            '1009': '手机号与用户名不匹配',
            '1010': '获取验证码失败，请稍后再试',
            '1041': '操作过于频繁，休息一下再试吧',
            '-1':'消息通道忙，休息一下再试吧',
            '-4':'服务器异常，请稍后再试',
            '0':'OK'
        }
		$.ajax({
			url : basePath + '/user/userAction!fetchOperationCheckCode.action',
			type : 'post',
			timeout : 60000,
			data : {},
			dataType : 'json',
			success : function(data) {
				if(data.resultCode == "0"){
					if(isFirst){
						hideWindow();
						showMobileKeyCodeTpl(data);
					}
				}else{
					if(typeof fetchCheckcodeMessage[data.resultCode]!=='undefined'){
                        hint.show(fetchCheckcodeMessage[data.resultCode],'warn');
                    }else{
                    	hint.show('服务器异常，请稍后再试','warn');
                    }
				}
				if($(".getMobileKeyCode").size() > 0 ){
					countdown($(".getMobileKeyCode"));
					$(".getMobileKeyCode").on('click',function(){
						if( $(".getMobileKeyCode").attr('data-btn')=='true' ){
							getMobileKeyCode(false);
							//添加标记，当验证码没有返回时，不能点击
		                    $(".getMobileKeyCode").attr('data-btn','false').html('正在获取...');
						}
					});
				}
			}
		});
	}
	//获取设备密码
	function fetchEncrypkey(reqData){
		var fetchEncrypkeyMessage = {
			'1021':'验证参数异常',
			'1012':'验证码失效',
			'1043':'验证码输入已超过规定次数',
			'1011':'验证码错误,请核对',
			'2000':'设备不存在',
			'-5':'网络异常，操作失败',
			'2003':'设备不在线',
			'2009':'设备请求响应超时',
			'-1':'服务器异常'
        }
		$.ajax({
			url : basePath + '/camera/cameraAction!queryDeviceEncryptKey.action',
			type : 'post',
			timeout : 60000,
			data : reqData,
			dataType : 'json',
			success : function(data) {
				if(data.resultCode == "0"){
					var desPwd = DES.encode(data.encrypkey);
					wall.model.active.info.plainPassword = desPwd;
					if (!(wall.model.active.info.belongDevice_deviceSerial && wall.model.active.info.belongDevice_releaseVersion == 'VERSION_DEFAULT')) {
						wall.model.active.info.belongDevice_plainPassword = desPwd;
					}
					if (isReal) {
						real.playVideo(wall.model.active, wall.model.active.info, 0, desPwd);
					} else {
						replay.autoPlay(videoTimeBar.getValue(), desPwd);
					}
					hideWindow();
					wall.model.active.info.fetchEncrypkeyTag = true;
				}else{
					$('.passErrorPrompt').html(fetchEncrypkeyMessage[data.resultCode]).show();
				}
			}
		});
	}
	//显示密码框、点击确定按钮事件
	function showPwdDialogOkFn(errCode, title, label, topPrompt, errorPrompt, isToUpperCase, isSearch){
		var value = $('.password .diaPass').val();
		if(value == ""){
			$('.passError').addClass('show').html('不能为空');
		}else{
			var desPwd = DES.encode(value);
			wall.model.active.info.plainPassword = desPwd;
			if (!(wall.model.active.info.belongDevice_deviceSerial && wall.model.active.info.belongDevice_releaseVersion == 'VERSION_DEFAULT')) {
				wall.model.active.info.belongDevice_plainPassword = desPwd;
			}
			if (errCode == 2012) { // 密码错误时
				if (isReal) {
					real.playVideo(wall.model.active, wall.model.active.info, 0, desPwd);
				} else {
					replay.autoPlay(videoTimeBar.getValue(), desPwd);
				}
			} else if (errCode == 401) { // 设备密码错误时，重新搜索录像
				if (isReal) {
					if (isSearch) {
						// 获取当前搜索时间片段 格式yyyy-MM-dd HH:mm:ss
						gloabStartPlay = false;
						replay.isHasSearch(videoTimeBar.getValue(), desPwd);
					} else {
						real.playVideo(wall.model.active, wall.model.active.info, 0, desPwd);
					}
				} else {
					// 获取当前搜索时间片段 格式yyyy-MM-dd HH:mm:ss
					gloabStartPlay = videoTimeBar.getValue();
					replay.isHasSearch(gloabStartPlay, desPwd);
				}
				hideWindow();
			}
		}	
	}
	// 显示密码框
	function showPwdDialog(errCode, title, label, topPrompt, errorPrompt, isToUpperCase, isSearch) {
		playerPrompt('视频播放失败，视频已加密');
		//support_remote_auth_randcode 是否具有远程授权能力级
		if(wall.model.active.info.support_remote_auth_randcode && !wall.model.active.info.fetchEncrypkeyTag){
			var contentHtml =[
				'<div class="topPrompt">'+topPrompt+'</div>',
				'<div class="password clearfix">',
					'<label class="diaPassText">'+label+'</label>',
					'<input type="password" autocomplete="off" class="diaPass" maxlength="50" >',
				'</div>',
				'<div class="passError"></div>',
				'<div class="ys-btn showPwdDialogBtnBox">',
					'<input type="button" class="btnStyle handler okHandler" value="确定">&nbsp;&nbsp;<input type="button" class="btnStyle handler cancelHandler" value="取消">',
				'</div>',
				'<p class="remote_randcode">忘记密码,用手机验证</p>'
			].join('');
			dialog.win({
				content:contentHtml,
				title: title,//弹出窗标题
				height:240,//弹出窗高度
				width:340,
				contentBind:function(){
					$(dialog.getContent()).find('.password input').focus();
				}
			});
			$(".showPwdDialogBtnBox .okHandler").on('click',function(){
				showPwdDialogOkFn(errCode, title, label, topPrompt, errorPrompt, isToUpperCase, isSearch);
				return false;
			});
			$(document.body).on('keyup',function(e){
				var $e = $(e.target);
				var keycode = e.keyCode;
				if ((keycode == 13 || keycode == 108) && $e.closest('.ys-content').length){
					showPwdDialogOkFn(errCode, title, label, topPrompt, errorPrompt, isToUpperCase, isSearch);
					return false;
				}
			})
			$(".showPwdDialogBtnBox .cancelHandler").on('click',function(){
				hideWindow();
				return false;
			});
			//添加获取短信验证码功能
			$(".remote_randcode").on('click',function(){
				getMobileKeyCode(true);
			});
		}else{
			dialog.win({
				content:'<div class="topPrompt">'+topPrompt+'</div><div class=" password clearfix"><label class="diaPassText">'+label+'</label>\
					<input type="password" autocomplete="off" class="diaPass" maxlength="50" ></div>\
					<div class="passError"></div>',
				title: title,//弹出窗标题
				height:254,//弹出窗高度
				width:340,
				btn:[['确定','ok'],['取消','cancel']],
				handler:function(auth){
					if(auth == "ok"){
						showPwdDialogOkFn(errCode, title, label, topPrompt, errorPrompt, isToUpperCase, isSearch);
						return false;
					}	
				}
			});
		}
		
		wall.model.active.video.setPrompt(errorPrompt);
	}

	// 插件渲染前，还原播放列表状态
	wall.on('beforeRender', function() {
		$.each(listInfo, function(key, val) {
			val.playing = false;
			val.recording = false;
			val.talking = false;
			val.voiceing = false;
		});
		wall.toolbar.updateStatus();
		updateTitle();
	});

	// 隐藏窗口
	function hideWindow() {
		if($('#ys-window').css('display') != "none"){
			dialog.close();
		}
	//	modCameraKey.hide();
	//	modCameraKeyN1.hide();
	//	modCameraKeyD1.hide();
	}

	// 添加右边摄像机列表点击事件

	function imgClick(){
		var imgClick = $("#listPanel").find(".listBox img,.listBox .offline");
	    imgClick.unbind().on('click', function(evt) {
	       // if(evt.target.className.indexOf('pic') == -1){
	       //     return;
	       // }
	       
			if (wall.model.active.info.talking) {
				dialog.win({
					content : '正在对讲，确定要退出？',
					btn:['OK','CANCEL'],
					icoCls: 'ysDialog_warn',
					height:140,
					title:"提示",
					handler : function(type) {
						if(type== 'ok'){
							wall.toolbar.quitTalk();
							changeCamera(evt)
						}
					}
				});
			} else {

				changeCamera(evt);
			}

			function changeCamera(evt) {
				 
		 		wall.model.active.video.prompt.removeClass('_pluginPromptPause');
			    wall.model.active.info.typePro = 'realplay';
				
				evt = evt || window.event;
				var srcDom = evt.target || evt.srcElement;
				if ($(srcDom).hasClass('pic') || $(srcDom).hasClass('offline')) {
					wall.model.active.video.hidePrompt();
					//activeInfo.el.removeClass('isPlaying ');
					activeInfo = listInfo[srcDom.getAttribute('cameraid')];
					wall.toolbar.resetTool();
					wall.model.active.video.stop(0, '', true, wall.lastInfo);
					// 判断是否有留言功能
					if (activeInfo.support_message && currentUserType != 2) {
						wall.toolbar.message.removeClass('hide');
					} else {
						wall.toolbar.message.addClass('hide');
					}
					wall.toolbar.ptzPanel.addClass('_ptz_frm_hide').removeClass('_ptz_frm_show');
					wall.toolbar.ptzCtrl.addClass('_ptz_frm_hide').removeClass('_ptz_frm_show');
					if (activeInfo.support_ptz == '1' && currentUserType != 2) {
						wall.toolbar.ptzShow.removeClass('hide');
						if(!activeInfo.support_privacy){
							wall.toolbar.privacy.addClass('hide');
						}else{
							wall.toolbar.privacy.removeClass('hide');
						}
						if(!activeInfo.support_ssl){
							$('.list .sfar').addClass('hide');
						}else{
							$('.list .sfar').removeClass('hide');
						}
						if(!activeInfo.ptz_preset){
							$('.list .collectLocation').addClass('hide');
						}else{
							$('.list .collectLocation').removeClass('hide');
						}
						$('.list').addClass('hasPTZ');

						window.ptz && window.ptz.fetch();
						$('.list .tab:eq(1)').trigger('click');
					}else{
						wall.toolbar.ptzShow.addClass('hide');
						wall.toolbar.privacy.addClass('hide');
						$('.list').removeClass('hasPTZ');
						$('.listBox').show();
						$('#operate').hide();
						//$('.list .tab:eq(0)').trigger('click');
					}
					// 判断是否有对讲功能
					if (activeInfo.support_talk && currentUserType != 2) {
						wall.toolbar.talk.removeClass('hide');
					} else {
						wall.toolbar.talk.addClass('hide');
					}
					if (activeInfo.support_cloud_version && currentUserType != 2 && activeInfo.status !=2) {
						var serial = activeInfo['deviceSerial'];
						if(activeInfo.cloudServiceStatus =="-1"){
							hideCloudActive();
							showCloudAvailable(serial);
						}else if(activeInfo.cloudServiceStatus =="0"){
	//						hideCloudAvailable();
	//						showCloudActive(serial);

	                        hideCloudActive();
	                        showCloudAvailable(serial);

						}else{
							hideCloudAvailable();
							hideCloudActive();
						}
					}else{
						hideCloudAvailable();
						hideCloudActive();
					}
					if(activeInfo.inviterName.length || userType == 2){
						$('.videoShare').addClass('hide');
					}else{
						$('.videoShare').removeClass('hide');
					}
					wall.toolbar.resetLevel(activeInfo.videolevel, activeInfo.capability);
					activeInfo.el.addClass('isPlaying ').siblings().removeClass('isPlaying ');
					videoTimeBar.reset();
					replay.replayRest();
					firstPlay = false;
					isReal = true;
					setPlayerInfo();
					if (activeInfo.support_ptz == '1' && currentUserType != 2) {
						window.ptz.fetch();
					}
					gloabStartPlay = true;
					wall.toolbar.updateStatus();
					updateTitle();
					chart(activeInfo);
					if( activeInfo.canRealPlay == 'no' ){
						if (wall.model.active.info) {
							wall.model.active.info.playing = false;
						}
							//wall.model.active.info = wall.model.active.video.info = activeInfo;
						playerPrompt('您没有查看该摄像机实时视频的权限哦~');
					}else{
						setTimeout(startPlay, 100);
					}
					$('#modelId').attr('href', basePath + '/camera/cameraAction!goCameraInfo.action?cameraId='
							+ activeInfo.cameraId + '&infoType=multiScreen');
					var _type = activeInfo['model'],
						_version = activeInfo['version'].split(' ')[2];

					if (_type && _version) {

						if (!((_type.search(/C1|C2|C3|C4|8464|8133|F1/i) > -1) && (_version > '131201'))|| activeInfo.inviterName.length) {
							$('#chartWrapper').hide();
							$('.up_canle_timebox').removeClass('hide');
						} else {
							$('#chartWrapper').show();
							$('.up_canle_timebox').removeClass('hide');
						}
						if(_type.search(/S1/i) > -1){
							$('#chartWrapper').hide();
							$('.up_canle_timebox').addClass('hide');
						}
					}
					 $('#toShare').attr( 'href', basePath + '/invite/inviteAction!shareDetail.action?cameraId='+wall.model.active.info.cameraId+'&callback=fireshare') ;

				}

			}
		});
	}
    

	// 设置设备监控点对象
	function setPlayerInfo() {
		var player = wall.model.active,
			wndNum = 0;
		player.video.stop(wndNum, '', true);
		player.info = activeInfo;
	};

	// -----------------------toolbar条按钮事件设置--------------------------//
	var sendMessage = wall.toolbar.sendMessage;
	wall.toolbar.sendMessage.on('click', function() {
		if (wall.model.active.info.status == '2') {
			hint.show({content: '该设备不在线' });
			return;
		}
		if (sendMessage.status == 'begin') {
			real.startRecVoice(wall.model.active);
		} else if (sendMessage.status == 'rec') {
			// 完成录制并发送
			var ret = real.finishRecVoice(wall.model.active);
			if (ret < 0) { return; }
			real.sendRecMessage(wall.model.active);
			sendMessage.sending();
		} else if (sendMessage.status == 'recFinish') { // 录制完成
			// 直接发送
			real.sendRecMessage(wall.model.active);
			sendMessage.sending();
		}
	})

	wall.toolbar.cancel.on('click', function() {

		if (sendMessage.status == 'rec') {
			dialog.win({
				content : '正在留言，确定要退出？',
				btn:['OK','CANCEL'],
				icoCls: 'ysDialog_warn',
				height:140,
				title:"提示",
				handler : function(type) {
					if(type== 'ok'){
						wall.model.active.video.finishRecVoice();
						wall.toolbar.resetTool();
					}
				}
			});
			
		} else {
			wall.toolbar.resetTool();
		}
	});

	wall.toolbar.on('hornFinish', function() {
		real.finishRecVoice(wall.model.active);
	})

	wall.toolbar.on('setLevel', function(level) {
		if (wall.model.active.info.status == '2' ) {
			//hint.show({content: '该设备不在线' });
			return;
		}
		$.ajax({
			url : basePath + '/camera/cameraAction!modifyVideoSetting.action',
			type : 'post',
			timeout : 60000,
			data : {
				'cameraId' : wall.model.active.info.cameraId,
				'videoLevel' : level
			},
			dataType : 'json',
			success : function(data) {
				wall.model.active.info.videolevel = level;
				wall.model.active.video.stop();
				wall.model.active.info.quality = wall.model.active.info.capability.split('-')[level] - 0;
				isReal = true; // 转换工具条
				$('.goto_spot').css({
					'visibility' : 'hidden'
				});
				wall.toolbar.level.removeClass('_levelDisable');
				$('._level').html( ['流畅','均衡','高清'][wall.model.active.info.videolevel]);
				videoTimeBar.setValue(replay.toShowTime(new Date( currentTime )));
				real.playVideo(wall.model.active, wall.model.active.info, 0);
			}
		});
	});

	$('.goto_spot').on('click', function() {
	    wall.model.active.info.typePro = 'RealPlay';
		$('._brightness').removeClass('_disable');
		isReal = true;
		$('.goto_spot').css({
			'visibility' : 'hidden'
		});
		if(!$('._privacy').hasClass('_privacyOn')){
			wall.toolbar.level.addClass('_levelDisable');
		}else{
			wall.toolbar.level.removeClass('_levelDisable');
		}
		videoTimeBar.setValue(replay.toShowTime(new Date( currentTime )));
		playRealHandler();
		if (activeInfo.support_ptz == '1' && currentUserType != 2) {
			wall.toolbar.ptzShow.removeClass('hide');
			if(!activeInfo.support_privacy){
				wall.toolbar.privacy.addClass('hide');
				//wall.toolbar.el.removeClass('privacying _disable');
			}else{
				wall.toolbar.privacy.removeClass('hide');
               // wall.toolbar.el.addClass('privacying _disable');
			}
			if(!activeInfo.support_ssl){
				$('.list .sfar').addClass('hide');
			}else{
				$('.list .sfar').removeClass('hide');
			}
			if(!activeInfo.ptz_preset){
				$('.list .collectLocation').addClass('hide');
			}else{
				$('.list .collectLocation').removeClass('hide');
			}
			$('.list').addClass('hasPTZ');			
	        if($('.controlPTZ').hasClass("t_active")){
	        	$('.listBox').hide();
	        	$('.content-PTZ').show();
	        	$('#operate').show();
	        }
	        wall.model.active.video.loadingHide();
			//$('.list .tab:eq(0)').trigger('click');
		}
		if(wall.model.active.info.canRealPlay == 'no'){
			playerPrompt('您没有查看该摄像机实时视频的权限哦~');
			return false;
		}
		/*if(wall.model.active.info.privacy && wall.model.active.info.status != 2){//设备在线且云台镜头遮蔽
			wall.model.active.video.showPrompt();
			$('._privacy').removeClass('_privacyOn').attr('title','点击可关闭镜头遮蔽');
			$('._pluginPrompt').attr('class','_pluginPrompt _pluginPromptPrivacy').html('<span class="icon">镜头遮蔽中</span>').fadeIn();
			$('._Toolbar').addClass('_disable privacying');
		}else{
			$('._privacy').addClass('_privacyOn').attr('title','点击可开启镜头遮蔽');
			$('._pluginPrompt').removeClass('_pluginPromptPrivacy').html('').show();
			playRealHandler();
		}*/

		
	});
	// ---------------------toolbar条按钮事件设置----------------------------//

	// ------------------升级及密码框相关内容---------------------//
	var upgradeCookie = $.cookie('UPGRADE') ? $.cookie('UPGRADE').split(',')[4] : '0';
	if (upgradeCookie === undefined) {
		upgradeCookie = '0';
	};
	if (!$.cookie('UPGRADE')) {
		$.cookie('UPGRADE', '0,0,0,0,0', {
			path : '/',
			expires : 1
		});
	}
	var cooUp = $.cookie('UPGRADE').split(',');
	cooUp[4] = '1';
	$.cookie('UPGRADE', cooUp.join(','), {
		path : '/',
		expires : 1
	});

	// 校验设备SD卡状态
	function checkDeviceUpgrade(){
		var cams = {};
		cams[activeInfo.fullSerial] = activeInfo;
		// 首次进入页面判断存储是否异常(或有无初始化)
		if (upgradeCookie === '0') {
			for (var p in cams) {
				var diskContent = '',
					diskContentType = '异常',
					storageType = 'SD卡',
					dev = cams[p];
				if (dev.disknum > 0 && (dev.disksta == 1 || dev.disksta == 2)) {
					if (dev.disksta == 1) {
						diskContentType = '未初始化';
					}// 默认为异常情况，若未初始化，则改为"未初始化"
					// 默认为SD卡，判断是否是设备，若是则提示为“存储”
					if (dev.fullModel.indexOf('CS-D1-') > -1 || dev.fullModel.indexOf('CS-N1-') || dev.fullModel.indexOf('CS-X3-') > -1
							|| dev.fullModel.indexOf('CS-R1-') > -1) {
						storageType = '存储';
					};
					diskContent = '<span style="color:#f15c43">' + dev.cameraName + '</span>' + '的' + storageType
							+ diskContentType + '，需初始化之后才能正常使用，现在初始化？';
					dialog.win({
						title: '初始化存储',
						content : diskContent,
						btn:[['现在初始化','ok'],['','cancel']],
						icoCls: 'ysDialog_warn',
						height:180,
						width:400,
						handler : function(type) {
							if(type== 'ok'){
								window.location.href = '/camera/cameraAction!goDeviceInfo.action?deviceSerial='
									+ dev.deviceSerial;
								var obj = $.cookie('formatCookie');
								obj = obj ? JSON.parse(obj) : {};
								obj[dev.fullSerial] = dev.fullSerial;
								$.cookie('formatCookie', JSON.stringify(obj), {
									path : '/',
									expires : 1
								});
							}else{
								//原页面只弹出modCameraKey框未做任何事情，故注释
							//	if ($(".version16Prompt").size() > 0) modCameraKey.show();  
								startPlay();
							}
						}
					});
					return false;
				}
			}
		}
		return true;
	}

	function updateTitle() {
		try {
			cameraName.html(wall.model.active.info.cameraName);
			cameraName.attr('title', wall.model.active.info.cameraName);
			if (currentUserType == 2) {
				cameraName.attr('href', 'javascript:void(0)');
				$("#cameraName").css("text-decoration", "none");
				$("#cameraName").css("cursor", "default");
			} else {
				cameraName.attr('href', basePath + '/camera/cameraAction!goDeviceInfo.action?deviceSerial='
						+ wall.model.active.info.deviceSerial);
			}
			wall.model.active.info.el.addClass('isPlaying ');
		} catch (e) {
			cameraName.html('');
		}
	}

	$(function() {
		getCamerInfo();
		$('.listBox').scroll(function(){
			setPageOpt.isScroll = true;
			var scrollH = parseInt($(this).height()) + parseInt($(this).scrollTop());
			var innerHH = parseInt($(this).find('.listBoxInner').height());
			if(innerHH <= scrollH && setPageOpt.isAjax && setPageOpt.isMore){
				$('.listBox .loading').removeClass('hide');
				setPageOpt.pageStart ++;
				getListCamera(setPageOpt);
			}else{
				$('.listBox .loading').addClass('hide');
			}
    	})
		updateStun(true);
		$(window).unload(function() {
			wall.model.active.video.stop(0, '', true, wall.lastInfo);
		});
	});
	// 时间轴操作提示生成，"我知道了"按钮操作回调
	function recordTips(index) {
		// index 表示我点击了第几个
		jQuery.ajax({
			type : "POST",
			url : basePath + "/user/userAction!updateTip.action",
			data : {
				tip : index
			},
			success : function(data, textStatus, jqXHR) {}
		});
	}


	!function() {
		function getTipValue(tip, index) {
			return (tip & (1 << index)) >> index
		}
		var tip = $.cookie('DDNSCOOKIE');
		if (!tip) return;
		var cookieArray = tip.split(',');

		if (!cookieArray[4] || !getTipValue(cookieArray[4], 0)) {
			return;
		} else {
			var timebarHintWrap = $('<div>').addClass('timebar_hint'),
				mask = $('<div>').addClass('timebar_mask'),
				hintWord = $('<img>').attr('src', '/assets/deps/imgs/timebar_hint_word.png'),
				hasKnowBtn = $('<button>'),
				element = $('#pluginTime')[0],
				top = element.offsetTop,
				left = element.offsetLeft,
				current = element.offsetParent;
			while (current !== null) {
				top += current.offsetTop;
				left += current.offsetLeft;
				current = current.offsetParent;
			}
			hasKnowBtn.html('我知道了');
			hasKnowBtn.on('click', function() {
				recordTips(0);

				timebarHintWrap.remove();
				mask.remove()
			});

			timebarHintWrap.css({
				top : top - 1 + 'px',
				left : left - 1 + 'px'
			});
			timebarHintWrap.append(hintWord);
			timebarHintWrap.append(hasKnowBtn);
			var body = $.getBody();
			body.append(mask);
			body.append(timebarHintWrap);
			
			// 【CHG】定位到进度条演示 @author fangyingchun
			var isCompat = document.compatMode == 'CSS1Compat';
			var bodyHeight = isCompat ? document.documentElement.clientHeight:document.body.clientHeight;
			var tarTop = $('.timebar_hint').offset().top;
			var tarHeight = $('.timebar_hint')[0].clientHeight;
			setTimeout(function(){
				// 不能用$(document.body),在Firefox下无效
				$(document).scrollTop(tarHeight + tarTop - bodyHeight);
			},1000);
		}
	}()

	// -----------------------------------------------
	// 王干 2013-12-30
	// 封面设置相关
	function hideCover() {
		$('.coverIframe').addClass('hide');
		$('.coverTip').addClass('hide');
	}
	$('.closeCover').click(function() {
		hideCover();
	});

	$('.coverSetting').click(function() {
		var ret = wall.model.active.video.capture();
        if(ret ==''){
            return;
        }

		var fileBase64;

		if ($.browser.msie && $.browser.version === "8.0") {
			fileBase64 = wall.model.active.video.el.HWP_GetFileContent(ret, 565, 380);
		} else {
			fileBase64 = wall.model.active.video.el.HWP_GetFileContent(ret, 500, 350);
		}
	
		dialog.win({
			title: '封面设置',
			content : '<img width="565" height="380" src="data:image/jpeg;base64,' + fileBase64 + '" />',
			btn:[['确定','ok'],['取消','cancel']],
			width:600,
			height:510,
			handler : function(type) {
				if(type== 'ok'){
					var userid = $.cookie('DDNSCOOKIE').split(',')[0];
					var info = wall.model.active.info;
					var puid = info.deviceSerial;
					var chan = info.channelNo > 100 ? Math.round(info.channelNo / 100) : Number(info.channelNo);
					SetDefaultImage(userid, puid, chan, fileBase64);
				}
			}
		});
	});

	// 设置封面
	function SetDefaultImage(userid, puid, chan, fileBase64) {
		var url = basePath + '/uploadpic',
			data = {
				cameraId   : wall.model.active.info.cameraId,
				uploadType : 1,
				userid : userid,
				puid : puid,
				chan : chan,
				data : fileBase64
			};
		$.ajax({
			url : url,
			type : 'post',
			data : data,
			dataType : 'json',
			complete : function(data) {
				if (data.responseText == 'error') {
					dialog.warn('<span style="font-size: 15px;">设置封面失败，请重试！</span>');
				} else {
					hint.show({content: '设置封面成功！' });
					hideCover();
					// 修改右侧播放列表相应监控点封面
					$('.camera.isPlaying').find('img').attr('src', "data:image/jpeg;base64," + fileBase64).attr('needcover','0');
				}
			}
		});
	}
	window.ptz = new AppView();

	

	if(wall.model.active.info && wall.model.active.info.support_ptz && currentUserType != 2){
		window.ptz.fetch();
		$('.list').addClass('hasPTZ');
	}else{
		$('.list').removeClass('hasPTZ');
	}
	window.onbeforeunload = function() {   
		if (wall.model.active.info.talking) {
			return '正在对讲，确定要退出?';
		}

	}
/*
	window.onbeforeunload = function() {

		if (wall.model.active.info.talking) {
			return '正在对讲，确定要退出?';
		}

	}*/

	// 统计多画面点击数
	$( '#modelId' ).on( 'click',function(){
		if(sendShareInfoLog){
			sendShareInfoLog(80008);
		}
	} );



});
