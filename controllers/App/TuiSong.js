var Xinge = require('xinge');

//var accessId  = 2100111986;
//var secretKey = '84f3557fdc6956cd19f4edadc85e9994';
var accessId  = 2200162191;
var secretKey = '6ed101decdf5e47bdac6608f24a4826b';
var XingeApp = new Xinge.XingeApp(accessId, secretKey);

var style = new Xinge.Style();
style.ring = 1;    //是否响铃
style.vibrate = 0;  //是否震动
style.builderId = 77;   //本地通知样式

//推送消息给所有设备
function pushToAllDevices(option){
    var action = new Xinge.ClickAction();
    action.actionType = Xinge.ACTION_TYPE_ACTIVITY;

    var androidMessage = new Xinge.AndroidMessage();
    androidMessage.type = Xinge.MESSAGE_TYPE_NOTIFICATION;
    androidMessage.title = '智能药盒';    //标题
    androidMessage.content = option.content;     //内容
    androidMessage.style = style;
    androidMessage.action = action;
    androidMessage.sendTime = Date.parse('2014-02-19 15:33:30') / 1000;
    androidMessage.expireTime = 0;
    androidMessage.customContent={"lifeng":"你好。"};


    androidMessage.multiPkg = 0;

    XingeApp.pushToAllDevices(androidMessage, function(err, result){
        if(err){
            console.log(err);
        }
        console.log(result);
    });
}

//推送消息给指定账户或别名
function pushToSingleAccount(option){
    var action = new Xinge.ClickAction();
    action.actionType = Xinge.ACTION_TYPE_ACTIVITY;

    var androidMessage = new Xinge.AndroidMessage();
    androidMessage.type = Xinge.MESSAGE_TYPE_NOTIFICATION;
    androidMessage.title = '智能药盒';    //标题
    androidMessage.content = option.content;     //内容
    androidMessage.style = style;
    androidMessage.action = action;
    androidMessage.sendTime = Date.parse('2014-02-19 15:33:30') / 1000;
    androidMessage.expireTime = 0;
    androidMessage.customContent={"lifeng":"你好。"};


    androidMessage.multiPkg = 0;


    XingeApp.pushToSingleAccount(option.account, androidMessage, function(err, result){
        console.log(result);
    });
}

pushToAllDevices({content:"vvbox's medicine was not to completed at 18:00."});

//Android message start.


var action = new Xinge.ClickAction();
action.actionType = Xinge.ACTION_TYPE_ACTIVITY;
//action.packageName.packageName = 'com.demo.xg';
//action.packageName.packageDownloadUrl = 'http://a.com';
//action.packageName.confirm = 1;

//var androidMessage = new Xinge.AndroidMessage();
//androidMessage.type = Xinge.MESSAGE_TYPE_NOTIFICATION;
//androidMessage.title = 'a';
//androidMessage.content = 'v';
//androidMessage.style = style;
//androidMessage.action = action;
//androidMessage.sendTime = Date.parse('2014-02-19 15:33:30') / 1000;
//androidMessage.expireTime = 0;
////androidMessage.acceptTime.push(new Xinge.TimeInterval(0, 0, 23, 59));
//
//androidMessage.multiPkg = 0;androidMessage.customContent = {
//    'name': 'huangnaiang'
//};
//androidMessage.loopTimes = 3;
//androidMessage.loopInterval = 2;
//And message end.

//IOS message start.
var iOSMessage = new Xinge.IOSMessage();
iOSMessage.alert = 'av0017';
iOSMessage.badge = 5;
iOSMessage.sound = 'df';
iOSMessage.acceptTime.push(new Xinge.TimeInterval(0, 0, 23, 0));
iOSMessage.customContent = {
    key1: 'value1',
    key2: 'value2'
};
//iOSMessage.loopTimes = 3;
//iOSMessage.loopInterval = 2;
//IOS message end.

//推送消息给指定设备
//XingeApp.pushToSingleDevice('IosAndroid_59816BC0-F77F-4CDB-943B-1EB594519635', iOSMessage, Xinge.IOS_ENV_PRO, function(err, result){
//	console.logs(result);
//});

//推送消息给指定账户或别名

//XingeApp.pushToSingleAccount('010101010101', androidMessage, function(err, result){
//	console.log(result);
//});

//推送消息给批量账号
//XingeApp.pushByAccounts(['a', 'b'], androidMessage, function(err, result){
//    console.logs(result);
//});

//推送消息给所有设备
//XingeApp.pushToAllDevices(iOSMessage, Xinge.IOS_ENV_PRO,function(err, result){
//    if(err){
//        console.logs(err);
//    }
//    console.logs(result);
//});

//推送消息给指定tag
//XingeApp.pushByTags(['av'], Xinge.TAG_OPERATION_OR, iOSMessage, Xinge.IOS_ENV_DEV, function(err, result){
//	console.logs(result);
//});
//
////批量查询消息推送状态
//XingeApp.queryPushStatus(['2824'], function(err, result){
//	console.logs(result);
//});
//
//查询设备数量
//XingeApp.queryDeviceNum(function(err, result){
//	console.log(result);
//});
//
////查询tag
//XingeApp.queryTags(0, 100, function(err, result){
//	console.logs(result);
//});
//
////取消未触发的定时任务
//XingeApp.cancelTimingTask(718, function(err, result){
//	console.logs(result);
//});
//
////批量设置标签
//XingeApp.setTags([['tag1','token1'], ['tag2','token2']], function(err, result){
//    console.logs(result);
//});
//
////批量删除标签
//XingeApp.deleteTags([['tag1','token1'], ['tag2','token2']], function(err, result){
//    console.logs(result);
//});
//
////根据设备token查询tag
//XingeApp.queryTagsByDeviceToken('token1', function(err, result){
//    console.logs(result);
//});
//
////根据tag查询设备数
//XingeApp.queryDeviceNumByTag('tag1', function(err, result){
//    console.logs(result);
//});