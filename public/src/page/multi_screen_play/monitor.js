/**
 * 实时视频模块
 */
define(function(require, exports) {

	/*
	 * 模块加载
	 */
	var Wall = require('./../../business/play_component/multiScreenWall').component,
		dialog = window.dialog = require('dialog'),
		Weibo = require('./../../business/play_component/weibo').component,
		ocxOldVersion = require('./../../business/ocxOldVersion/ocxOldVersion').ocxOldVersion;
	var AppView = require('./../../business/play_component/ptz').component;
	var Hint = window.Hint= require('hint').Hint;
	var hint = new Hint({width:310});
	var listPanel = $('#listPanel'),
		wall = window.wall = new Wall({
			position : '#wall',
			fence : 4,
			type : 'more'
		});

	var wallCurrent = 0;
	var _ = require('underscore');

	window.vers  = window.vers ? window.vers : function(){window.console && console.log('vers该方法加载失败');};
	// 密码
//	$("#diaPass").live('focus', function() {
//		$(".version16Prompt").addClass('show');
//		if ($(".passError").html() == '不能为空')
//			$('.passError').removeClass("show").css({
//				'visibility' : 'hidden'
//			});

//	});
	if( !$.cookie("multi_screen_"+$.cookie('DDNSCOOKIE').split(',')[2]) ){
		$.cookie("multi_screen_"+$.cookie('DDNSCOOKIE').split(',')[2],true,{expires:365,path:'/'});
	}

	var errorText = {
		'1013' : '用户不存在',
		'2003' : '设备不在线',
		'1014' : '设备密码错误',
		'2004' : '设备连接异常',
		'-4' : '未知错误'
	};

	var version16PromptHtml = '<p class="version16Prompt" style="padding-left:70px;padding-top:5px; color:#999; font-size:12px;">初始密码为12345，若密码已被修改，请输入修改后的密码</p>';
	/*
	 * cameraName : 播放设备标题 
	 * toReplay : 跳转到历史回放
	 * modCameraKey ：输入设备密码弹出框 
	 * cameraKey :上面弹出框里的密码输入框 
	 * sendData ： 播放器发给后台信息统计播放相关信息
	 */
	var cameraName = $('#cameraName'),
		cameraKey = $('#cameraKey'),
		listBox = $('.listBox'),
		sendData = {};

	/*
	 * 视频列表信息
	 * deviceSerials ： 设备序列集合，刷新时
	 */
	var listInfo = window.listInfo = {}, deviceSerials = [], activeInfo = window.activeInfo = {};

	/*
	 * 非直连 需要检测stun 不能为空
	 */
	var stun, serverInfoTmp = [ '<?xml version="1.0" encoding="UTF-8"?>',
		'<ServerInfo>', '<Server type="STUN" ip="{0}" port="{1}"/>',
		'<Server type="STUN" ip="{2}" port="{3}"/>',
		'<Server type="VTDU" ip="{4}" port="{5}"/>', '</ServerInfo>' ]
		.join('');


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
		isScroll:  false,
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
					/*data.sort(function(a,b){
			            return a.status-b.status
			        });*/

					if(data && data.length){
						
						for(var i= 0; i<data.length;i++){
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
						
					}else{
						setPageOpt.isMore = false;
						$('.listBox .loading').addClass('hide');
					}
				    setPageOpt.isAjax = true;
					getCamerInfo($('.listBox'));
					imgClick();
				},
				error: function(){
					$('.listBox .loading').addClass('hide');
					dialog.warn('请求失败，请检查网络！');
				}
			});
		}

	//getCamerInfo();

	$('.listBox').scroll(function(){
		setPageOpt.isScroll = true;
		var scrollH = parseInt($(this).height()) + parseInt($(this).scrollTop());
		var innerHH = parseInt($(this).find('.listBoxInner').height());
		if(innerHH <= scrollH && setPageOpt.isAjax){
			$('.listBox .loading').removeClass('hide');
			setPageOpt.pageStart ++;
			getListCamera(setPageOpt);
		}else{
			$('.listBox .loading').addClass('hide');
		}
	})

	/*
	 * 所有设备信息 listInfo，获取页面上所有camera的信息，以cameraId为key保存到 listInfo对象里 
	 * 将所有的序列号保存在deviceSerials 数组里，设置离线设备状态
	 */
	function getCamerInfo(dom){
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

		$.each(dom.find('.pic'),function(i,v){
			var el = $(v.parentNode),
				supportext = v.getAttribute('supportext') || '{}';

			var support_ptz = false;
			var canRealPlay = 'no';
			var canRemoteReplay = 'no';
			var support_remote_auth_randcode = false;
			var support_ssl = false;//声源定位
            var ptz_preset = false;//云台预置点
			var support_privacy = false;//镜头遮蔽

			//好友分享
			//权限设置  为分享的
			if( v.getAttribute('permission') >0 ){
				var permissionToBin = toBin(v.getAttribute('permission'));
				var lengthToBin = permissionToBin.length-1;
				$.each(permissionObj,function(k,v){
					var d = parseInt(k,10);

					if( lengthToBin >= d ){
						if( permissionToBin[lengthToBin-d] =='1' ){
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
				support_ptz = JSON.parse(supportext).support_ptz == '1';
				support_ssl = !!JSON.parse(supportext).support_ssl || false;
			    ptz_preset = !!JSON.parse(supportext).ptz_preset || false;
			    support_privacy = !!JSON.parse(supportext).support_privacy || false;
				canRealPlay = getSubUserPermissionState(v.getAttribute('permission'),USER_PERMISSION_REAL_PLAY);
				canRemoteReplay = getSubUserPermissionState(v.getAttribute('permission'),USER_PERMISSION_REMOTE_REPLAY);
				support_remote_auth_randcode = JSON.parse(v.getAttribute('supportext') || '{}').support_remote_auth_randcode == '1';
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
				localDeviceIP : v.getAttribute('localdeviceip'),
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
				videolevel : v.getAttribute('videolevel'),
				capability : v.getAttribute('capability'),
				privateStatus : v.getAttribute('privateStatus'),
				upnp : v.getAttribute('upnp') + '',
				quality : v.getAttribute('capability').split('-')[v.getAttribute('videolevel')] - 0,
				upgrade : v.getAttribute('isNeedUpgrade'),
				isNeedUpgrade : v.getAttribute('isNeedUpgrade'),
				deviceVersion : v.getAttribute('version'),
				version : v.getAttribute('version'),
				vtmDomain :v.getAttribute('vtmDomain'),
				vtmIp : v.getAttribute('vtmIp') || v.getAttribute('vtmDomain') || '',
				vtmPort 		: v.getAttribute('vtmPort') - 0,
				ttsIp	 	    : v.getAttribute('ttsIp'),
				ttsPort		    : v.getAttribute('ttsPort') - 0,
				releaseVersion : v.getAttribute('releaseVersion'),
				isEncrypt : v.getAttribute('isEncrypt'),
				encryptPwd : v.getAttribute('encryptPwd'),
				authSvrAddr : v.getAttribute('authSvrAddr'),
				support_talk : JSON.parse(supportext).support_talk != '0',
				support_ptz : support_ptz,
				support_ssl : support_ssl,
				ptz_preset : ptz_preset,
				support_privacy : support_privacy,
				support_message : JSON.parse(supportext).support_message == '1',
				forceStreamType : v.getAttribute('forceStreamType'),
				canRealPlay : canRealPlay,
				canRemoteReplay : canRemoteReplay,
				support_remote_auth_randcode : support_remote_auth_randcode,
				dom : v,
				el : el,
				isshare:v.getAttribute('isshare'),
				inviterName:v.getAttribute('inviterName'),
				inviterPhone:v.getAttribute('inviterPhone'),
				defence : el.find('b.m1', true),
				diskStatus : el.find('b.m2', true),
				privateStatusEl : el.find('b.m3', true),
				playing : false,
				recording : false,
				recirdTime : 0,
				talking : false,
				voiceing : false,
				index : i += 1,
				permission :  v.getAttribute('permission')
			};
			if( statusArr && statusArrL <= statusArr.length){
				listInfo[v.getAttribute('cameraid')]['privacy']	= (statusArr[statusArrL] && statusArr[statusArrL]['privacy'])|| false;
				listInfo[v.getAttribute('cameraid')]['voiceSource']	= (statusArr[statusArrL] && statusArr[statusArrL]['voiceSource']) || false;
				statusArrL++;
			}
			//activeInfo = listInfo[cameraId];
			deviceSerials.push(v.getAttribute('deviceSerial'));
			
			if (v.getAttribute('status') == '2') {
				el.addClass('unline');
				if (activeInfo.support_ptz && currentUserType != 2){
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
			}

				
				if(!activeInfo.support_ptz){
					wall.toolbar.ptzShow.addClass('hide');
				}else{
					wall.toolbar.ptzShow.removeClass('hide');

				}
			}

			if(v.getAttribute('inviterName').length){
				$(el).find('p.comeFromUser').removeClass('hide');
				var inviterName = Base.format(v.getAttribute('inviterName') || '');
				var inviterPhone = Base.format(v.getAttribute('inviterPhone') || '');
				$(el).find('p.comeFromUser >span').html(inviterName).attr('title',inviterPhone).css({"position": "relative","cursor": "pointer"});
			}
		});
		activeInfo = listInfo[cameraId];
		if (!activeInfo) {
			dialog.warn('<span style="font-size: 15px;">您要播放的设备已删除！</span>');
			setTimeout(function() {
				// window.location.href = basePath +
				// '/user/userAction!goToMyShipin7.action';
			}, 1000);
		}

		if (activeInfo.support_ptz && currentUserType != 2 &&(!setPageOpt.isScroll)) {
			wall.toolbar.privacy.removeClass('hide');
			$('.list').addClass('hasPTZ');

			// 如果有云台控制，则默认就直接显示云台控制标签
			$('.list .tab:eq(1)').addClass('t_active').siblings().removeClass('t_active');
			$('.listBox').hide();
			$('.content-PTZ').show();
			$('#operate').show();

			/*hidePTZ*/
		//wall.toolbar.privacy.addClass('hide');
		//$('.list').removeClass('hasPTZ');

		}


		// 多画面模式下，无对讲和留言功能
		//	wall.toolbar.talk.addClass('hide');
		//	wall.toolbar.message.addClass('hide');
		wall.toolbar.zoom.addClass('hide');

		activeInfo.el.addClass('isPlaying ');
		wall.lastInfo = activeInfo;
		wall.model.active.info = activeInfo;
		wall.model[wallCurrent].cameraId = activeInfo.cameraId;
		wall.model.active.video.playVideo = function() {
			// 子用户不检查升级
			window.console && console.log('4==playVideo');
			if (currentUserType == 2) {
				//setTimeout(function() {
					playVideo(wall.model.active, wall.model.active.info, '0');
				//},300);
				wall.updateStatus({defer: true});
			}else{
				if( activeInfo.canRealPlay == 'no' ){
					if (wall.model.active.info) {
						wall.model.active.info.playing = false;
					}
					wall.updateStatus();
					playerPrompt('您没有查看该摄像机实时视频的权限哦~');
				}else{
					//setTimeout(function() {
				    	playerHandler(wall, activeInfo);
				    //},300);
					wall.updateStatus({defer: true});
			   	}
			}
		};

		
		updateTitle();
		if(wall.toolbar.del){
			wall.toolbar.del.addClass('hide');
		}
		listBox.scrollTop = (wall.model.active.info.index - 2) * 195 + 10;

		//playerHandler(wall, activeInfo);
	}
	$(function() {
		getCamerInfo(listPanel);
		//playerHandler(wall, activeInfo);
	});

	 //}
	
	

	var talkErrorText = {
		4001 : '您的电脑没有连接麦克风，暂时不能对讲，请连接后再尝试',
		3077 : '设备正在对讲，请稍后再尝试',
		5010 : '设备正在对讲，请稍后再尝试',
		3127 : '设备开启了镜头遮蔽，打开对讲失败',
		5013 : '设备开启了镜头遮蔽，打开对讲失败'
	};

	wall.model.active.video.playVideo = function() {
		if( activeInfo.canRealPlay == 'no' ){
			if (wall.model.active.info) {
				wall.model.active.info.playing = false;
			}
			playerPrompt('您没有查看该摄像机实时视频的权限哦~');
		}
		playerHandler(wall, wall.model.active.info, true);

	};
	function setErrorPrompt(text){
		$('.password .diaPass').val('');
		$('.passError').addClass('show').html(text);
	}
	/*
	 * 插件事件抛出
	 */
	window.PluginEventHandler = function(lEventType, lParam1, lParam2,lUserData, errorCode) {
		window.console && console.log('******************' + lUserData);
        if(wall.model[lUserData].video.prompt2 && $('._pluginPrompt2_small').eq(lUserData).is(':visible')){
            $('._pluginPrompt2_small').eq(lUserData).addClass('hide');
        }
        if(wall.model[lUserData].info.isshare == "OVERDUE"){
			playerPrompt('播放失败');
			wall.model[lUserData].video.loadingHide()
			return;
		}
		switch (lEventType) {
			case 0:
				wall.model[lUserData].info.playing = false;
				wall.model[lUserData].info.recirdTime = 0;
				wall.model[lUserData].info.recording = false;
				wall.model[lUserData].video.recording = false;
				wall.model[lUserData].video.toDefer();
				pluginError(errorCode, lUserData);
				break;
			case 1:
				wall.model[lUserData].info.playing = "loading";
				wall.model[lUserData].info.recirdTime = 0;
				wall.model[lUserData].info.recording = false;
				wall.model[lUserData].video.recording = false;
				wall.model[lUserData].video.toDefer(true);
				wall.updateStatus({
					defer : true
				});
				break;
			case 3:
				if ($('#ys-window').css('display') != 'none') {
					dialog.close && dialog.close();
				}
				wall.model[lUserData].info.playing = true;
				wall.updateStatus();
				wall.model[lUserData].video.hidePrompt();
				wall.model[lUserData].video.toDefer();
				wall.model[lUserData].video.loadingHide()
				changeSound &&changeSound();
				if($('.videoFocus').length == 0){
					$(wall.model[lUserData].video.el).addClass('videoFocus');
				}
				break;
			case 4:
				break;
			case 70:
				// 1.6设备密码正确事件，1.7密码正确事件
				if ($('#ys-window').css('display') != 'none') {
					dialog.close && dialog.close();
				}
				break;
			case 90:
				// wall.model[ lUserData ].video.toDefer(true);
				// 缓冲
				wall.model[lUserData].info.playing = true;
				wall.model[lUserData].video.toload(lParam2);
				break;
			case 91:
				sendInfo(lParam2);
				break;
			case 100:
				wall.toolbar.recordHandler(false);
				break;
			default:
				break;
		}
		function pluginError(errorCode, lUserData) {
			var errCode = errorCode
				|| wall.model[lUserData].video.el.HWP_GetLastError();
			if (errCode != 401 && errCode != 2012 && ($('#ys-window').css('display') != "none")) {
				dialog.close();
			}

			switch (errCode) {
				case 56:
					wall.model.active.info.playing = false;
					playerPrompt('视频播放失败，请检查您的网络');
					break;
				case 16:
					wall.model.active.info.playing = false;
					playerPrompt('连接失败');
					break;
				case 410:
					wall.model.active.info.playing = false;
					playerPrompt('设备连接数过大，请停止其它连接后重试');
					break;
				case 409:
					wall.model.active.info.playing = false;
					playerPrompt('视频播放失败，设备已开启镜头遮蔽');
					break;
				case 401:
					wall.model.active.info.playing = false;
					if ($('#ys-window').css('display') != "none") {
						dialog.errorInfo({
							content:'设备密码不正确'
						});
						break;
					}
					if (wall.model.active.info.fullModel.indexOf("CS-D1") > -1) {// D1
						showPwdDialog('设备密码', '设备密码：', '请输入设备密码  ','视频播放失败，设备密码不正确', false,lUserData);
					} else {
						showPwdDialog('设备密码', '设备密码：','您的设备版本过低，需要输入设备密码，建议您升级设备 ', '视频播放失败，设备密码不正确',false,lUserData);
						if ($("#diaPass").parent().find(".version16Prompt").size() <= 0) {
							$("#diaPass").parent().append(version16PromptHtml);
						}
					}
					break;
				case 2012:
					wall.model.active.info.playing = false;
					if ($('#ys-window').css('display') != "none") {
						setErrorPrompt('密码不正确');
						break;
					}
					if(wall.model.active.info.isshare == "CUSTOMER"){
						showPwdDialog(
							'请输入视频图片加密密码',
							'密码：',
							'视频已加密，请联系分享者获取密码进行查看 ',
							'视频已加密，请联系分享者获取密码进行查看', true,lUserData);
					}else{
						showPwdDialog(
							'请输入视频图片加密密码',
							'密码：',
							'您的视频已加密，请输入密码进行查看<br><span style="color: #b1b1b1;">初始密码为机身标签上的验证码，如果没有验证码，请输入ABCDEF（密码区分大小写）</span> ',
							'视频播放失败，密码不正确', true,lUserData);
					}
					break;
				case 2045://流媒体取流认证session不存在
					window.location.reload();
				case 3146://无效的session
					window.location.reload();
				case 3253://认证session错误
					window.location.reload();
				default:
					playerPrompt();
					break;
			}
			wall.updateStatus();
		}
	};
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
			showPwdDialog(
				'请输入视频图片加密密码',
				'密码：',
				'您的视频已加密，请输入密码进行查看<br><span style="color: #b1b1b1;">初始密码为机身标签上的验证码，如果没有验证码，请输入ABCDEF（密码区分大小写）</span> ',
				'视频播放失败，密码不正确', true,0);
		});
	}
	//获取短信验证码
	function getMobileKeyCode(isFirst){
		var fetchCheckcodeMessage =  {
			'1006': '手机号已被占用，换一个吧',
			'1008': '请输入有效的手机号',
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
					listInfo[wall.model.active.info.cameraId].plainPassword = desPwd;
					playVideo(wall.model.active, wall.model.active.info, 0, desPwd);
					hideWindow();
				}else{
					$('.passErrorPrompt').html(fetchEncrypkeyMessage[data.resultCode]).show();
				}
			}
		});
	}
	// 隐藏窗口
	function hideWindow() {
		if($('#ys-window').css('display') != "none"){
			dialog.close();
		}
	}
	//显示密码框、点击确定按钮事件
	function showPwdDialogOkFn(title, label, topPrompt, errorPrompt, isToUpperCase,lUserData){
		var value = $('.password .diaPass').val();
		if(value == ""){
			$('.passError').addClass('show').html('不能为空');
			return false;
		}else{
			wall.model.active.info.plainPassword = DES.encode(value);
			listInfo[wall.model.active.info.cameraId].plainPassword = DES.encode(value);
			playVideo(wall.model.active, wall.model.active.info, 0, DES.encode(value));
		}
	}
	function showPwdDialog(title, label, topPrompt, errorPrompt, isToUpperCase,lUserData) {
		//support_remote_auth_randcode 是否具有远程授权能力级
		var remote_randcode_tpl = wall.model.active.info.support_remote_auth_randcode ? '<p class="remote_randcode">忘记密码,用手机验证</p>':'';
		if(wall.model.active.info.support_remote_auth_randcode){
			var contentHtml =[
				'<div class="topPrompt">'+topPrompt+'</div>',
				'<div class=" password clearfix">',
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
				width:340
			});
			$(".showPwdDialogBtnBox .okHandler").on('click',function(){
				showPwdDialogOkFn(title, label, topPrompt, errorPrompt, isToUpperCase,lUserData);
				return false;
			});
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
						showPwdDialogOkFn(title, label, topPrompt, errorPrompt, isToUpperCase,lUserData);
						return false;
					}
				}
			});
		}
		wall.model.active.video.setPrompt(errorPrompt);
	}

	/*
	 * 插件渲染前，还原播放列表状态
	 */
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

	/*
	 * 播放列表点击事件
	 */
	 function imgClick(){
	 	var imgClick = $("#listPanel").find(".listBox img,.listBox .offline");
		imgClick.unbind().on('click', function(evt) {
			
			wall.model.active.video.toDefer();
			evt = evt || window.event;
			var srcDom = evt.target || evt.srcElement;
			if ($(srcDom).hasClass('pic')|| $(srcDom).hasClass('offline')) {
				wall.model.active.video.hidePrompt();
				if( wall.model[ wallCurrent ].info && ( activeInfo.cameraId == wall.model[ wallCurrent ].info.cameraId ) ){
					activeInfo.el.removeClass('isPlaying ');
				}
				activeInfo = listInfo[srcDom.getAttribute('cameraid')];
				wall.toolbar.resetTool();
				// 多画面模式下，无对讲和留言功能
				wall.toolbar.talk.addClass('hide');
				wall.toolbar.message.addClass('hide');
				wall.toolbar.zoom.addClass('hide');
				wall.model.active.video.stop(0,'',true,wall.lastInfo);
				wall.toolbar.ptzPanel.addClass('_ptz_frm_hide').removeClass('_ptz_frm_show');
				wall.toolbar.ptzCtrl.addClass('_ptz_frm_hide').removeClass('_ptz_frm_show');
				wall.toolbar.resetLevel(activeInfo.videolevel,activeInfo.capability);
				var flag = false,
					videoIndex = 0;
				for(var j in wall.model){
					if(j == 'active') continue;
					if(activeInfo.cameraId == wall.model[j].cameraId){
						flag = true;
						videoIndex = parseInt(j);
						break;
					}
				}
				if((!flag) || (videoIndex == wallCurrent)){   //没在其他窗口加载
					wall.model[wallCurrent].cameraId = activeInfo.cameraId;
					playerHandler(wall, activeInfo);
				}else if(flag && wall.model[videoIndex].info.playing == false && (!activeInfo.privacy)){//在其他窗口加载但未播放
					delete wall.model[videoIndex].info;
					delete wall.model[videoIndex].cameraId;
					delete wall.model[videoIndex].video.info;
					wall.model[wallCurrent].cameraId = activeInfo.cameraId;
					playerHandler(wall, activeInfo);
				}else if(flag && wall.model[videoIndex].info.playing == "loading"){
					wall.model[wallCurrent].cameraId = undefined;
					dialog.warn('<span style="font-size: 15px;">该视频已经在'+(videoIndex + 1)+'窗口努力加载哦~</span>');
					return;
				}else{ // 在其他窗口加载并且在播放
					wall.model[wallCurrent].cameraId = undefined;
					dialog.warn('<span style="font-size: 15px;">该视频已经在'+(videoIndex + 1)+'窗口播放了哦~</span>');
					return;
				}

				activeInfo.el.addClass('isPlaying');
				updateTitle();
				wall.lastInfo = activeInfo;
			}
			if ($(srcDom).hasClass('pic')) {
				activeInfo = listInfo[srcDom.getAttribute('cameraid')];
				wall.model.active.info = activeInfo;
				updateTitle();
			}

			if ($(srcDom).hasClass('pic')|| $(srcDom).hasClass('offline')) {
				if (activeInfo.support_ptz == '1' && currentUserType != 2) {
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
					wall.toolbar.ptzShow.removeClass('hide');

					$('.list').addClass('hasPTZ');
					window.ptz && window.ptz.fetch();

					// 如果有云台控制，则默认就直接显示云台控制标签
					$('.list .tab:eq(1)').trigger('click');
				}else{
					wall.toolbar.privacy.addClass('hide');
					wall.toolbar.ptzShow.addClass('hide');
					$('.list').removeClass('hasPTZ');
					listTab();
				}
			}



				/*hidePTZ*/
			//wall.toolbar.privacy.addClass('hide');
			//$('.list').removeClass('hasPTZ');

		});
	 }


	/*
	 * 控件的播放 或 停止控制 playerHandler 多画面控制
	 */
	wall.on('play', playerHandler);


	function playerHandler(wall, config) {
		if(config){

		}
		var player = wall.model.active, wndNum = 0;
		if (!player.playing) {
			playVideo(player, config, wndNum);
		} else {
			if (!activeInfo.playing) {
				player.info.playing = false;
				// updateList( player.video.info );
				player.info = config;
				playVideo(player, config);
			} else {
				if (activeInfo.cameraId == player.info.cameraId) {
					if (player.info.playing) {
						//player.video.stop(wndNum,player.video.info.netType !== '0');
						player.playing = false;
						// updateList( player.video.info );
						player.info.playing = false;
						wall.updateStatus();
					} else {
						playVideo(player, config);
					}
				} else {
					dialog.warn('<span style="font-size: 15px;">该视频已经在'+activeInfo.wall+'窗口播放了哦~</span>');
				}
			}
		}
		// updateList( player.info );
	};

	/*
	 * 获取非直连播放信息
	 */
	function getStun() {
		var stuncookie = $.cookie('STUNIPCOOKIE'), serverIP = [];
		if (stuncookie) {
			serverIP = serverIP.concat(stuncookie.split(',')[0].split(':')
				.concat(stuncookie.split(',')[1].split(':')));
		} else {
			serverIP = serverIP.concat([ '127.0.0.1', '0', '127.0.0.1', '0' ]);
		}
		serverIP = serverIP.concat([ '127.0.0.1', '0' ]);
		return serverIP;
	}

	function resetServerInfo(player, config) {
		$.ajax({
			url : basePath + '/loginAction!reSetCookie.action',
			success : function(data) {
				var err = false;
				if (stun = getStun()) {
					updateStun(false);
				}
			}
		});
	}

	/*
	 * 获取stun信息设置给控件 通过 getStun 获取 cookie里的 stun 信息，成功则设置给控制。
	 * 不成功则通过resetServerInfo告知后台重置 stun
	 */
	function updateStun(noReset) {
		var player = wall.model.active.video, stun = getStun(), err, reg, serverInfo;
		stun.map(function(i, v) {
			err = err || (!(i % 2) && (v === 'null' || v === ''));
		});
		if (err && noReset) {
			resetServerInfo();
		} else {
			serverInfo = serverInfoTmp;
			stun.map(function(v, i) {
				reg = new RegExp('\\{' + i + '\\}');
				serverInfo = serverInfo.replace(reg, v);
			});
			player.el.HWP_SetSpecialInfo(serverInfo, 99);
			window.getISPMsg && window.getISPMsg(player.el);
		}
	}
	updateStun(true);

	/*
	 * 播放视频 直连播放 及 非直连播放
	 */
	function playVideo(player, config, wndNum, newPwd) {
		// 判断子用户权限
		window.console && console.log('5==playVideo');
		if(!config) return;
		if (currentUserType == 2) {
			if (config.canRealPlay == 'no') {
				if (wall.model.active.info) {
					wall.model.active.info.playing = false;
				}
				player.info = player.video.info = config;
				playerPrompt('您没有查看该摄像机实时视频的权限哦~');
				return false;
			}
		}else{
			if (config && config.canRealPlay == 'no') {
				if (wall.model.active.info) {
					wall.model.active.info.playing = false;
				}
				player.info = player.video.info = config;
				playerPrompt('您没有查看该摄像机实时视频的权限哦~');
				return false;
			}
		}

		if(config.privacy && config.status != 2){//设备在线且云台镜头遮蔽
			//player.video.showPrompt();
			$('._privacy').removeClass('_privacyOn').attr('title','点击可关闭镜头遮蔽');
			$('._pluginPrompt_small').eq(player.index).addClass('_pluginPromptPrivacy focus _pluginPromptAD').removeClass('hide').html('<span class="icon">镜头遮蔽中</span>').fadeIn();
			playerPrompt('镜头遮蔽中');
			$('._Toolbar').addClass('_disable privacying');
			$('._level').addClass('_levelDisable').html( ['流畅','均衡','高清'][config.videolevel]);
			wall.toolbar.ptzShow.removeClass('hide');
			$('._levels').removeClass( 'show' );
			return false;
		}else{
			$('._privacy').addClass('_privacyOn').attr('title','点击可开启镜头遮蔽');
			$('._pluginPrompt_small').eq(player.index).removeClass('_pluginPromptPrivacy').css('background-color:',"#343434").html('');
			wall.toolbar.ptzShow.removeClass('hide');
			$('._level').removeClass('_levelDisable').html( ['流畅','均衡','高清'][config.videolevel]);
		}
		
		var url, serverInfo, err = false, reg, ret, username;
		username = $.cookie('DDNSCOOKIE').split(',')[2];
		wall.toolbar.resetLevel(config.videolevel, config.capability);
		if ((config.status == 0 || config.upnp === '1') && config.deviceIp) {
			window.console && console.log('6=1=playVideo');
			if ($.cookie("USERIPCOOKIE") === config.deviceIp) {
				url = 'rtsp://'
				+ config.localDeviceIp
				+ ':'
				+ config.localDevicePort
				+ '/PSIA/streaming/channels/'
				+ ((config.channelNo + '').replace(/\d$/, '') + ((config.quality - 0) || '2'))
				+ '?' + config.httpPort + '&' + username + '&'
				+ config.deviceSerial;
			} else {
				url = 'rtsp://'
				+ config.deviceIp
				+ ':'
				+ config.devicePort
				+ '/PSIA/streaming/channels/'
				+ ((config.channelNo + '').replace(/\d$/, '') + ((config.quality - 0) || '2'))
				+ '?' + config.httpPort + '&' + username + '&'
				+ config.deviceSerial;
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

			var url = [
				'Ehome://', // stream_type
				(config.deviceIp || '120.0.0.1') + ':', // internet_ip
				(config.httpPort || '80') + ':', // internet_http_port
				(config.localDeviceIp || '127.0.0.1') + ':', // local_ip
				(config.maskIp || '255.255.255.255') + ':', // local_mask
				(config.localHttpPort || '80') + ':', // local_http_port
				config.netType + ':', // net_type
				config.deviceSerial + ':', // device_index_code
				config.channelNo.toString().replace(/\d\d$/, '') + ':', // channel_no
				[ '0', '0', '1' ][config.quality || config.capability.split('-')[config.videolevel] - 0 || '2'] + ':', // stream_type //stream_type
				'0' + ':', // pu_link_type
				config.casIp + ':', // ppvs_ip
				config.casPort + '?', config.localDevicePort,
				'&' + username + '&' + config.deviceSerial ].join(''); // ppvs_port

		}

		window.console && console.log('7==playVideo');
		var iPlayType = 1;// 预览
		if (config.status == 2) { // 设备不在线，无法播放
			playerPrompt('设备不在线，请刷新或检查设备网络');
			ret = 0;
		} else {
			ret = player.video.play(url, newPwd || config.plainPassword, 0,
				iPlayType, '', '', serverInfo, newPwd, config);
		}
		if (ret === 0) {
			player.info = player.video.info = config;
			wall.updateStatus({
					defer : true
				});
			config.wall = player.index;
		}
	}

	function playerPrompt(text) {
		wall.model.active.video.setPrompt(text || '播放失败');
	}

	/*
	 * 更新播放窗口标题 及 详情、回放链接
	 */
	function updateTitle(index) {
		try {
			cameraName.html(wall.model.active.info.cameraName);
			cameraName.attr('title',wall.model.active.info.cameraName);
			if (currentUserType == 2) {
				cameraName.attr('href', 'javascript:void(0)');
				$("#cameraName").css("text-decoration", "none");
				$("#cameraName").css("cursor", "default");
			} else {
				cameraName.attr('href', basePath + '/camera/cameraAction!goDeviceInfo.action?deviceSerial='+ wall.model.active.info.deviceSerial + '#gotoVideo');
			}
			//wall.model.active.info.el.addClass('isPlaying');
		} catch (e) {
			cameraName.attr('href', '#');
			cameraName.attr('title', (parseInt(index) + 1) + '号播放窗口');
			cameraName.html((parseInt(index) + 1) + '号播放窗口');
		}
	}




	/*
	 * 播放成功后向后台发送播放的统计信息，仅超过指定时间发
	 */
	function sendInfo(config) {
		var interval = ($.cookie('DDNSCOOKIE').split(',')[5] || 10) * 60 * 1000, info = wall.model.active.info;
		if (!info) {
			return;
		}
		var playInfoLog ;
		try{
			playInfoLog = JSON.parse(config);
		}catch(ex){
			playInfoLog ={"Clt":0,"Type":10};
		};
		if (sendData[info.cameraId]
			&& ((new Date() - sendData[info.cameraId].lastTime) < interval)
			&& (sendData[info.cameraId].deviceNatType === info.netType)
			&& (sendData[info.cameraId].clientNatType === playInfoLog.Clt)
			&& config === sendData[info.cameraId].detail) {
			return false;
		}
		var _version = window.vers();
		var data = new Object();
		data = {
			'deviceSerial' : info.deviceSerial,
			'requestType' : 0,
			'deviceNatType' : info.netType,
			'clientNatType' : playInfoLog.Clt,
			'userName' : $.cookie('DDNSCOOKIE').split(',')[2],
			'interactiveType' : playInfoLog.Type,
			'version' : _version,
			'browserVersion' :util.browserVersion,
			'sysVersion' :util.sysVersion,
			'detail' : config
		};
		sendData[info.cameraId] = data;
		$.ajax({
			type : "POST",
			url : basePath + "/omm/ommAction!addVideoRequestInfo.action",
			data : data,
			success : function(data) {

			}
		});
		sendData[info.cameraId].lastTime = new Date();
	}

	/**
	 * 语音对讲失败后，发送到后台保存
	 */
	function sendTalkInfo(eventType, errorCode, config) {
		var info = wall.model.active.info;
		var playInfoLog = config.split('&')[0];
		try {
			var jsonConfig = JSON.parse(config);
			var _version = window.vers();
			var data = {
				'deviceSerial' : info.deviceSerial,
				'requestType' : 2,
				'deviceNatType' : info.netType,
				'clientNatType' : jsonConfig.ClientNatType,
				'userName' : $.cookie('DDNSCOOKIE').split(',')[2],
				'interactiveType' : jsonConfig.TalkType,
				'version' : _version,
				'browserVersion' :util.browserVersion,
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
		} catch (e) {
		}
	}

	/*
	 * 刷新按钮
	 */
	function doRefreshBtn() {
		refreshBtn.addClass('refreshing');
		$('.list .tab:eq(0)').addClass('t_active').siblings().removeClass('t_active');
		if (refreshBtn.loading	|| (new Date().getTime() - refreshBtn.loadTime < $.cookie('DDNSCOOKIE').split(',')[6] * 1000)) {
			setTimeout(refreshStop, 3000);
			return;
		};
		refreshBtn.loading = true;
		refreshBtn.loadTime = new Date().getTime();
		var refreshTime = ($.cookie('DDNSCOOKIE').split(',')[6] || 30) * 1000;
		$.ajax({
			url : basePath + '/camera/cameraAction!refreshDeviceInfo.action?t=' + Math.random(),
			data : {
				serials : deviceSerials.join(';')
			},
			success : function(data) {
				setTimeout(refreshStop, 2000);
				var _status = {};
				data.deviceList.map(function(v, i) {
					_status[v.subSerial] = v;
				});
				for ( var prop in listInfo) {
					var value = listInfo[prop], _s = _status[value.deviceSerial];
					if(_s){
						if (_s.status != '1') {
							value.el.addClass('unline');
							value.status = 0;
						} else {
							value.status = 1;
							value.deviceIp = _s.natIp;
							value.httpPort = _s.natHttpPort;
							value.devicePort = _s.natRtspPort;
							value.cmdPort = _s.natCmdPort;
							value.streamPort = _s.natStreamPort;
							value.localDeviceIp = _s.localIp;
							value.localHttpPort = _s.localHttpPort;
							value.localDevicePort = _s.localRtspPort;
							value.localCmdPort = _s.localCmdPort;
							value.localStreamPort = _s.localStreamPort;
							value.netType = _s.netType;
							value.upnp = String(_s.upnp);
							value.casPort = _s.casPort;
							value.casIp = _s.casIp;
							value.maskIp = _s.maskIp;
							value.privateStatus = _s.privateStatus;
							value.hikPort = _s.localCmdPort;
							value.isNeedUpgrade = _s.isNeedUpgrade;
							value.deviceVersion = _s.version;
							value.version = _s.version;
							value.releaseVersion = _s.releaseVersion;
							value.isEncrypt = _s.isEncrypted;
							value.encryptPwd = _s.encryptPwd;
							value.el.removeClass('unline');
							// value.defence[( _s.defence === 1 ?
							// 'removeClass' : 'addClass')]('hide');
							// value.diskStatus[(( /[1|2|3]/.test(
							// _s.diskStatus ) && _s.diskStatus.indexOf(
							// '-1' ) < 0 ) ? 'removeClass' :
							// 'addClass')]('hide');
							// value.privateStatusEl[( _s.privateStatus ===
							// 0 ? 'addClass' : 'removeClass')]('hide');
						}
					}
				}
				refreshBtn.loading = false;
			}
		});

	};
	function refreshStop() {
		refreshBtn.removeClass('refreshing');
	}
	var refreshBtn = $('#refresh');
	refreshBtn.on('click', doRefreshBtn);
	/* 如果密码有改动，触发刷新按钮点击事件 */
	function handlerStorage(e) {
		// 为了兼容ie8，必须使用setTimeout
		setTimeout(function() {
			if (window.localStorage.getItem("refreshForChangeCameraPw") == 1) {
				window.localStorage.removeItem("refreshForChangeCameraPw");
				doRefreshBtn();
			}
		}, 0);

		return;
	};

	// 第一次删除
	window.localStorage && window.localStorage.removeItem("refreshForChangeCameraPw");
	// 添加storage监听事件
	if (window.addEventListener) {
		window.localStorage && window.addEventListener("storage", handlerStorage, false);
	} else {
		// IE浏览器 ie8
		window.localStorage && document.attachEvent("onstorage", handlerStorage);
	};

	/*
	 * 修改密码，应用于播放密码不对
	 */
	$('#cameraKeyForm').on('submit',function(event) {
		event.preventDefault ? event.preventDefault(): window.event.returnValue = false;
		if (modCameraKeyText.validate() === true) {
			var pwdValue = cameraKey.getValue();
			wall.model.active.info.plainPassword = DES.encode(pwdValue);
			playVideo(wall.model.active,wall.model.active.info, 0, DES.encode(pwdValue));
			cameraKey.setValue('');
		}
	});

	wall.toolbar.on('setLevel',function(level) {
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
				playVideo(wall.model.active,wall.model.active.info, 0);
			}
		});
	});
	$('._ptzShow').on('click',function(){
    	if( $('._Toolbar').hasClass( '_disable' )){ // 工具条禁用状态下，不能点击
            return;
        }
        var ptzCtrl = wall.toolbar.ptzCtrl;
        var ptzPanel = wall.toolbar.ptzPanel;
    	  $('.title .tab:eq(1)').addClass('t_active').siblings().removeClass('t_active');
        $('.listBox').hide();
        $('.content-PTZ').show();
        $('#operate').show();
    	
    });

	window.GetSelectWndInfo = function(wndinfo, lUserData) {
		var i = 0;
		while (i < 4) {
			$(wall.model[i++].video.el).removeClass('videoFocus');
		}
		$('._pluginPrompt_small').each(function(index) {
			if (index != lUserData) {
				$(this).removeClass('focus');
				wall.toolbar.ptzShow.addClass('hide');
			} else {
				$(this).addClass('focus');
			}

			if($(this).hasClass('_pluginPromptPrivacy') && $(this).hasClass('focus')){

				$('._Toolbar').addClass('_disable');
				$('._privacy').removeClass('_privacyOn').attr('title','点击可关闭镜头遮蔽');
				$('._level').addClass('_levelDisable');
				$('._levels').removeClass( 'show' );
				return false;
			}else{
				$('._privacy').addClass('_privacyOn').attr('title','点击可开启镜头遮蔽');
				$('._level').removeClass('_levelDisable');
			}
		});

		wallCurrent = lUserData;
		wall.model[lUserData].video.el.HWP_SetWinSelectStatus(0, 0);
		$(wall.model[lUserData].video.el).addClass('videoFocus');

		wall.model.active = wall.model[lUserData];
		if(!wall.model.active.cameraId){
			$('._level').addClass('_levelDisable').text('流畅');
			$('._levels').removeClass( 'show' );
		}
		
		if (wall.model[wallCurrent].info) {
			wall.toolbar.resetLevel(wall.model.active.info.videolevel,wall.model.active.info.capability);
			activeInfo = wall.model.active.info;
			if (activeInfo.support_ptz == '1' && currentUserType != 2) {
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
				if(!activeInfo.support_ptz){
					wall.toolbar.ptzShow.addClass('hide');
				}else{
					wall.toolbar.ptzShow.removeClass('hide');
				}

				wall.toolbar.privacy.removeClass('hide');
				$('.list').addClass('hasPTZ');

				// 如果有云台控制，则默认就直接显示云台控制标签
				window.ptz && window.ptz.fetch();
				$('.list .tab:eq(1)').trigger('click');
			}else{
				wall.toolbar.privacy.addClass('hide');
				$('.list').removeClass('hasPTZ');
				listTab();
			}
		}else{
			wall.toolbar.privacy.addClass('hide');
			$('.list').removeClass('hasPTZ');
			wall.toolbar.ptzShow.addClass('hide');
			listTab();
		}
		wall.toolbar.updateStatus();
	
		updateTitle(lUserData);


		/*hidePTZ*/
		//wall.toolbar.privacy.addClass('hide');
		//$('.list').removeClass('hasPTZ');

	};
    
    function listTab(){
    	$('.list .tab:eq(0)').addClass('t_active').siblings().removeClass('t_active');
    	$('.listBox').show();
        $('.content-PTZ').hide();
        $('#operate').hide();
    }
    window.ptz = new AppView();
	if(wall.model.active.info.support_ptz && currentUserType != 2){
		
		window.ptz.fetch();
		$('.list').addClass('hasPTZ');
	}else{
		$('.list').removeClass('hasPTZ');
	}


});