define( function ( require, exports ) {
	
	"use strict"; // jshint ;_;

	var ProjectMsg = {
		
		// 实时视频 + 录像回放
		SET_PATH_FAIL : '存储路径配置失败',
		PLAY_FAIL_FOR_NET : '视频播放失败，请检查您的网络',
		RECORD_FAIL : '录像失败',
		CAPTURE_FAIL : '截图失败',
		NO_USER_EXIST : '用户名不存在',
		UNKOWN_WRONG : '未知错误',
		SYSTEM_WRONG : '系统错误',
		NO_CAMERAID : '设备不在线',
		PUTIN_PASSWORD_WRONG : '您输入的密码错误',
		NO_FIND_RECORD : '没有查询到录像',
		PLAY_FAIL : '播放失败',
		
		//CamerPlugin组件
		RECORD_NO_ENOUGH : '剩余磁盘空间不足',
		DOWNLOAD_PLUGIN_PROMPT : '请点击此处下载插件，安装完成后请刷新浏览器',
        DOWNLOAD_PLUGIN_PROMPT_REBOOT : '请点击此处下载插件，安装完成后请重启浏览器',
		CAMERA_PLAY : '播放',
		CAMERA_CAPTURE : '抓图',
		CAMERA_RECORD : '录像',
		CAMERA_SOUND : '声音',
		CAMERA_FULL : '全屏',
		CAMERA_STOP : '暂停',
		
		//登录页面
		USERNAME_EMPTY : '用户名不能为空，请输入用户名',
		PASSWORD_EMPTY : '密码不能为空，请输入密码',
		USERNAME_NOT_EXIST : '用户名不存在',
		PASSWORD_RRROR : '密码不正确',
		VERIFICATIONCODE_ERROR : '验证码错误，请核对您的验证码',
		VERIFICATIONCODE_EMPTY : '验证码不能为空，请输入验证码',
		NETWORK_EXCEPTION_ONE : '登录失败，请检查您的网络',
		SERVER_EXCEPTION : '登录失败，服务器异常',

		//注册页面
		NETWORK_EXCEPTION_TWO : '注册失败，请检查您的网络',
		USER_PHONE_USED : '手机号已被占用，换一个吧',
		USER_REGIST_SEND_MESSAGE_FAILD : '获取验证码失败，请稍后再试',
		USER_INDEXCODE_USED_EXCEPTION : '该用户名已存在，换一个吧',
		NETWORK_EXCEPTION_SEVEN : '获取验证码失败，请检查您的网络',
		USER_CHECKCODE_USELESS : '验证码失效,请稍后重新获取',
		

		//找回密码
		VERIFICATIONCODE_ERROR_TWO : '验证失败，请核对您的验证码',
		NETWORK_EXCEPTION_THREE : '验证失败，请检查您的网络',
		NETWORK_EXCEPTION_FOUR : '验证用户名失败，请检查您的网络',
		USER_INDEXCODE_PHONE_MISMATCH : '手机号与用户名不匹配',
		NETWORK_EXCEPTION_FIVE : '修改失败，请检查您的网络',
		USER_VERIFY_CHECKCODE_EXCEPTION : '验证码错误,请核对',


		//账户资料
		NETWORK_EXCEPTION_SIX : '修改失败，请检查您的网络',
		USER_INVALID_PARAM_EXCEPTION : '抱歉，验证异常(1021)'
		//修改密码
	};

	exports.msg = ProjectMsg;

});