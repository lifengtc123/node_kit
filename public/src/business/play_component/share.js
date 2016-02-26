var stun,
	serverInfoTmp = [
			'<?xml version="1.0" encoding="UTF-8"?>',
			'<ServerInfo>',
			'<Server type="STUN" ip="{0}" port="{1}"/>',
			'<Server type="STUN" ip="{2}" port="{3}"/>',
			'<Server type="VTDU" ip="{4}" port="{5}"/>',
			'</ServerInfo>'].join(''),
	searchInfoTmp = ['fileSearch://', '{0}:{1}:{2}:{3}/', '{4}://{5}:', '{6}:{7}:{8}:{9}'].join('');

// 发送到后台的请求类型 0 : 实时播放  1 ：普通远程回放 2 - 发送留言  3 ： 云存储回放
// sendData ： 播放器发给后台信息统计播放相关信息
var sendData = {};

var gloabStartPlay = true; // 是否需要自动播放

var username = $.cookie('DDNSCOOKIE').split(',')[2]; // 当前登录用户名

var clientSession = $.cookie("STORAGESESSION");


// 发送回放相关数据到后台，统计查询使用
function sendInfo(config, requestType) {
	var interval = ($.cookie('DDNSCOOKIE').split(',')[5] || 10) * 60 * 1000,
		info = wall.model.active.info;
	window.console && console.log("sendInfo param2 **********"+config);
    var playInfoLog;
    try{
         playInfoLog = JSON.parse(config);
    }catch(ex){
         playInfoLog ={"Clt":0,"Type":10};
    };
	if (sendData[info.cameraId] && ((new Date( currentTime ) - sendData[info.cameraId].lastTime) < interval)
			&& (sendData[info.cameraId].deviceNatType === info.netType)
			&& (sendData[info.cameraId].clientNatType === playInfoLog.Clt)
			&& config === sendData[info.cameraId].detail) { return false; }
	var _version = window.vers();
	var data = {
		'deviceSerial' : info.deviceSerial,
		'requestType' : requestType,
		'deviceNatType' : info.netType,
		'clientNatType' : playInfoLog.Clt,
		'userName' : username,
		'interactiveType' : playInfoLog.Type,
		'version' : _version,
		'browserVersion' : util.browserVersion,
		'sysVersion' : util.sysVersion,
		'detail' : config
	};
	sendData[info.cameraId] = data;
	$.ajax({
		type : "POST",
		url : basePath + "/omm/ommAction!addVideoRequestInfo.action",
		data : data,
		success : function(data) {}
	});
	sendData[info.cameraId].lastTime = new Date( currentTime );
}
/*
 * 获取非直连播放信息
 */
function getStun() {
	var stuncookie = $.cookie('STUNIPCOOKIE'),
		serverIP = [];
	if (stuncookie) {
		serverIP = serverIP.concat(stuncookie.split(',')[0].split(':').concat(stuncookie.split(',')[1].split(':')));
	} else {
		serverIP = serverIP.concat(['127.0.0.1', '0', '127.0.0.1', '0']);
	}
	serverIP = serverIP.concat(['127.0.0.1', '0']);
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
 * 获取stun信息设置给控件 通过 getStun 获取 cookie里的 stun 信息，成功则设置给控制。 不成功则通过resetServerInfo告知后台重置 stun
 */
function updateStun(noReset) {
	var player = wall.model.active.video,
		stun = getStun(), err, reg, serverInfo;
	stun.map(function(v, i) {
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

// 播放控件上显示提示信息
function playerPrompt(text) {
	if(wall.model.active.info.playing){
		return ;
	}
	wall.model.active.video.loadingHide();
	wall.model.active.video.setPrompt(text || '播放失败');
}

// 刷新按钮 TODO 需要更新设备相关的所属设备信息
function doRefreshBtn() {
	refreshBtn.addClass('refreshing');
	$('.list .tab:eq(0)').addClass('t_active').siblings().removeClass('t_active');
	if (refreshBtn.loading
			|| (new Date( currentTime ).getTime() - refreshBtn.loadTime < $.cookie('DDNSCOOKIE').split(',')[6] * 1000)) {
		setTimeout(refreshStop, 3000);
		return;
	};
	refreshBtn.loading = true;
	refreshBtn.loadTime = (new Date( currentTime )).getTime();
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
		
			for (var prop in listInfo) {
				var value = listInfo[prop],
					_s = _status[value.deviceSerial];
				if(_s){
					if (_s.status != 1) {
						value.deviceIp = '';
						value.el.addClass('unline');
						value.status = _s.status;
					} else {
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
						vale.releaseVersion = _s.releaseVersion;
						value.isEncrypt = _s.isEncrypted;
						value.encryptPwd = _s.encryptPwd;
						value.status = _s.status;
						value.el.removeClass('unline');
					}
				}
				
				
			}
			refreshBtn.loading = false;
		},
		error : function(data) {}
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
