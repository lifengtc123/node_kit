/**
 * 报警类型配置文件
 * 2014-01-07
 * jizaiyi
 */

define( function( require, exports ){
	
	var alarmType = {
			10000 : {code:10000,txt:'人体感应事件',alarmPic:'/image/CS-A1-RELATED/pir.png'},
			10001 : {code:10001,txt:'紧急遥控按钮事件',alarmPic:'/image/CS-A1-RELATED/callhelp.png'},
			10002 : {code:10002,txt:'移动侦测报警'},
			10003 : {code:10003,txt:'婴儿啼哭报警'},
			10004 : {code:10004,txt:'门磁报警',alarmPic:'/image/CS-A1-RELATED/magnetometer.png'},
			10005 : {code:10005,txt:'烟感报警',alarmPic:'/image/CS-A1-RELATED/fire.png'},
			10006 : {code:10006,txt:'可燃气体报警',alarmPic:'/image/CS-A1-RELATED/gas.png'},
			10007 : {code:10007,txt:'入侵报警',alarmPic:'/image/CS-A1-RELATED/telecontrol.png'},
			10008 : {code:10008,txt:'水浸报警',alarmPic:'/image/CS-A1-RELATED/waterlogging.png'},
			10009 : {code:10009,txt:'紧急按钮报警',alarmPic:'/image/CS-A1-RELATED/callhelp.png'},
			10010 : {code:10010,txt:'人体感应报警',alarmPic:'/image/CS-A1-RELATED/pir.png'},
			10100 : {code:10100,txt:'IO 报警'},
			30001 : {code:30001,txt:'语音留言消息'},
			30002 : {code:30002,txt:'视频留言消息'},
			30010 : {code:30010,txt:'设备下线'}
	};
	
	exports.alarmType = alarmType;

});