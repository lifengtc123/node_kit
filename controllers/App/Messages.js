/**
 * Created by lifeng on 15/3/13.
 */

var crypto = require("crypto");
var async = require('async');
Message = require("../../models/message.js");
Box = require("../../models/box.js");
Job = require("../../models/job.js");
MeRecord = require("../../models/meRecord.js");
SystemDate = require("../../models/systemDate.js");
var schedule = require("node-schedule");
var log4js = require("log4js");
log4js.configure("./log4js.json");
var logInfo = log4js.getLogger('logInfo');
Nobility=require("../../models/nobility.js");
Medication=require("../../models/medication.js");
BaiduYuYinApi=require("../../lib/BaiduYuYinApi.js");
var fs = require('fs');
function Messages(app) {

}

module.exports = Messages;


//保存用药记录
/**
 * 2016-02-03修改
 * 加入for循环判断掉时间
 * @param boxNumber
 * @param warntime
 * @param adate
 */
function saveMecord(boxNumber,warntime,adate){
    var timecount=0;
    Medication.findList({boxNumber:boxNumber,warntime:warntime,dtype:0},function(err,medications){
        timecount=timecount+medications.length;
        Message.findobj({boxNumber:boxNumber,warntime:warntime,mtype:0}, function (err, message) {
            for(var i=0;i<message.length;i++){
                for(var j=0;j<message[i].messageTime.length;j++){
                    var pd=pdDate(adate,message[i].messageTime[j]);
                    if(!pd){
                        timecount++;
                    }
                }
            }
            MeRecord.getOne({boxNumber:boxNumber,remindDate:warntime,dtype:0},function(err,merecord2){
                if(merecord2==null){
                    var obj={
                        boxNumber:boxNumber,
                        remindDate:warntime,
                        retimes:timecount,
                        donetimes:medications.length,
                        dtype:0
                    }
                    var meRecord=new MeRecord(obj);
                    meRecord.save(function(err,mers){
                        return timecount;
                    });
                }else{
                    merecord2.retimes=timecount;
                    merecord2.donetimes=medications.length;
                    merecord2.save();
                    return timecount;
                }
            })
        });
    })
}

Messages.list = function (req, res) {
    res.send("开发中");
}

Messages.getCount = function (req, res) {
    var boxid = req.body.lastboxid;
    var createTime = req.body.alertTime;
    var uncount = 0;
    Message.getCount(boxid, createTime, function (err, message) {
        uncount = message.length;
        res.end(JSON.stringify(uncount));
    });
}

Messages.getMessageByBoxAndHole = function (req, res) {
    var obj = {
        boxNumber: req.param("boxNumber"),
        isK: req.param("isK"),
        mtype:{$ne:2}
    }
    Message.getMessageByBoxAndHole(obj, function (err, message) {
        if (message) {
            res.json(message);

        } else {
            res.json(null);
        }


    });
}

Messages.getMessageByBoxNumber = function (req, res) {
    var boxNumbers = req.body.boxNumbers;
    var warntime = req.body.warntime;
    Message.getMessageByBoxNumber(boxNumbers, warntime, function (err, messages) {
        res.json(messages);
    })
}


Messages.deleteOneMessage = function (req, res) {
    var id = req.body.id;
    var times = [];
    async.waterfall([function (cb) {
        Message.getMessageByid(id, function (err, message) {
            if (message == null)cb("无数据", null);
            cb(null, message);
        })
    }, function (a, cb) {
        if (a != null) {
            for (var i = 0; i < a.messageTime.length; i++) {
                var datatime = a.messageTime[i];
                var data = a.warntime;
                var odata = data + "T" + datatime;
                var time1 = new Date(odata);
                times.push(time1.getTime());
            }
            Message.updateobj({_id:a._id},{mtype:2}, function (err) {
                /**
                 * 2016-02-03修改
                 * 加入saveMecord方法
                 * 修改传的值
                 */
                    var timecount=0;
                    var data=new Date();
                    var adate=data.getHours()+":"+data.getMinutes();
                    timecount=timecount+saveMecord(a.boxNumber,a.warntime,adate);
                      var jobobj = {
                            boxNumber: a.boxNumber,
                            type: 1,    //定时任务
                            id: a.proid,     //id暂定  需要查询数据
                            state: 1,
                            hole: a.isK,     //孔 0 无孔 1 小孔 2 大孔
                            interval: a.jiange * 24 * 60,
                            times: times,
                            filepath: a.filepath
                        }
                        var jonmodel = new Job(jobobj);
                        jonmodel.save(function (err, obj) {
                            cb(err, {boxNumber: jobobj.boxNumber, count: jobobj.times.length, warntime: a.warntime});
                        });
                        
            })
        }
    }], function (err, obj) {
        if (err) {
            res.json(err);
        } else {
            res.json(obj);
        }
    })
}

Messages.getList = function (req, res) {
    var boxid = req.body.lastboxid;
    Message.getOneList(boxid, function (err, message) {
        res.json(message);
    });
}

/**
*查询一个盒子下所有的未删除的数据
*/
Messages.getListByOBJ= function (req, res) {
    var boxid = req.body.lastboxid;
    Message.findobj({boxNumber:boxid,mtype:{$ne:2}}, function (err, message) {
        res.json(message);
    });
}

/**
*查询一个盒子正在使用的提醒列表
*/
Messages.getListByType2=function(req,res){
     var boxNumbers = req.body.boxNumbers;
    var warntime = req.body.warntime;
    Message.findobj({boxNumber:{$in:boxNumbers},warntime:warntime,mtype:0},function(err,messages){
        res.json(messages);
    })
}

/**
*2016-02-02
*盒子详细页面查询所有未删除的药物提醒
*/
Messages.getListByType3= function (req, res) {
    var boxNumber = req.body.boxnumber;
    Message.findobj({boxNumber:boxNumber,type:0,mtype:{$ne:2}},function(err,messages){
        res.json(messages);
    })
}
//根据type 和boxNumber查询提醒
Messages.getListByType = function (req, res) {
    var boxNumber = req.body.boxnumber;
    var type = req.body.type;
    Message.getListByType(boxNumber, type, function (err, messages) {
        res.json(messages);
    });
}
Messages.getMessages = function (req, res) {
    var boxNumbers = req.body.boxNumbers;
    var warntime = req.body.warntime;
    Message.getMessages(boxNumbers, warntime, function (err, messages) {
        res.json(messages);
    })
}


Messages.getMessagesTime = function (req, res) {
    var boxNumbers = req.body.boxNumbers;
    var warntime = req.body.warntime;
    Message.getMessages(boxNumbers, warntime, function (err, messages) {
        res.json(messages);
    })
}

Messages.changeType = function (req, res) {
    var id = req.body.id;
    var mtype = req.body.type;
    var jobstate;
    if (mtype == 1) {
        mtype = 0;
        jobstate = 4;
    } else if (mtype == 0) {
        mtype = 1;
        jobstate = 3;
    }
    var mobj = {
        mtype: mtype
    }
    var data = new Date();
    var month = data.getMonth() + 1 + "";
    var day = data.getDate() + "";
    if (month.length < 2)month = "0" + month;
    if (day.length < 2)day = "0" + day;
    mobj.warntime = data.getFullYear() + "-" + month + "-" + day;
    var adate=data.getHours()+":"+data.getMinutes();
    var times = [];
    Message.getMessageByid(id, function (err, message) {
        for (var i = 0; i < message.messageTime.length; i++) {
            var datatime = message.messageTime[i];
            var data = message.warntime;
            var odata = data + "T" + datatime;
            var time1 = new Date(odata);
            times.push(time1.getTime());
        }
        Message.update(id, mobj, function (err) {
            if(mtype==1){
                var data=new Date();
                var adate=data.getHours()+":"+data.getMinutes();
                var timecount=0;
                timecount=timecount+saveMecord(message.boxNumber,mobj.warntime,adate);
            }else{
                var data=new Date();
                var adate=data.getHours()+":"+data.getMinutes();
                var timecount=0;
                timecount=timecount+saveMecord(message.boxNumber,mobj.warntime,adate);
            }
            if (!err) {
                var jobobj = {
                    boxNumber: message.boxNumber,
                    type: 1,    //定时任务
                    id: message.proid,     //id暂定  需要查询数据
                    state: jobstate,
                    hole: message.isK,     //孔 0 无孔 1 小孔 2 大孔
                    interval: message.jiange * 24 * 60,
                    times: times,
                    filepath: message.filepath
                }
                var jonmodel = new Job(jobobj);
                jonmodel.save(function (err, mes) {
                    res.json(mes);
                });
            } else {
                res.json(err);
            }
        })
    })
}
//判断时间大小
 function pdDate(adate,bdate){
                var a = new Date("2016-01-22"+" "+adate);
                var b = new Date("2016-01-22"+" "+bdate);
                return a>b
}

//更新提醒
Messages.updateMessage = function (req, res) {
    var messageid = req.param("messageid");
    var obj = {
        name: req.param("name"),
        style: req.param("isXZ"),
        color: req.param("isYS"),
        type: req.param('type'),
        messageNo: req.param("messageNo"),
        ywNo: req.param("meici"),
        jiange: req.param("jiange"),
        filepath: req.param("filepath"),
        proid: req.param("proid"),
        number: req.param("boxNumber"),
        isK: req.param("isK"),
        isf:req.param("isf"),
        time: req.param("time"),
        content: req.param("content"),
        messageTime: []
    }

    var count=0;
    obj.mtype = 0;
    var data = new Date();
    var month = data.getMonth() + 1 + "";
    var day = data.getDate() + "";
    if (month.length < 2)month = "0" + month;
    if (day.length < 2)day = "0" + day;
    var adate=data.getHours()+":"+data.getMinutes();
    obj.warntime = data.getFullYear() + "-" + month + "-" + day;
    var times = req.param("times");
    for (var i = 0; i < times.length; i++) {
        obj.messageTime.push(times[i].value);
    }
    var times = [];
    for (var i = 0; i < obj.messageTime.length; i++) {
        var datatime = obj.messageTime[i];
        var data = obj.warntime;
        var odata = data + "T" + datatime;
        var time1 = new Date(odata);
        times.push(time1.getTime());
    }
    var nobility = req.param("nobility");
    Nobility.updatelastboxid(nobility, obj.number, function (err) {
        async.waterfall([function (cb) {
            Message.getMessageByid(messageid, function (err, message) {
                cb(err, message);
            })
        }, function (message, cb) {
            Message.update(messageid, obj, function (err, mes) {
                if (message) {
                    if (message.isK != obj.isK) {
                        var jobobj2 = {
                            boxNumber: obj.number,
                            type: 1,    //定时任务
                            id: obj.proid,     //id暂定  需要查询数据
                            state: 1,
                            hole: message.isK,     //孔 0 无孔 1 小孔 2 大孔
                            interval: obj.jiange * 24 * 60,
                            times: times,
                            filepath: obj.filepath
                        }
                        var jonmodel = new Job(jobobj2);
                        jonmodel.save(function (err, mes) {
                            Box.getOne(obj.number,function(err,box){
                            	var jobobj3={
                            		boxNumber:obj.number,
                            		type:1,
                            		id:box.boxLastJobId,
                            		state:0,
                            		hole:obj.isK,
                            		interval: obj.jiange * 24 * 60,
		                            times: times,
		                            filepath: obj.filepath
                            	}
                            	var jonmodel = new Job(jobobj3);
                      			  jonmodel.save(function (err,newjos) {
                      			  	cb(err,message);
                      			  })
                            })
			          });
                    } else {
                        var jobobj = {
                            boxNumber: obj.number,
                            type: 1,    //定时任务
                            id: obj.proid,     //id暂定  需要查询数据
                            state: 2,
                            hole: obj.isK,     //孔 0 无孔 1 小孔 2 大孔
                            interval: obj.jiange * 24 * 60,
                            times: times,
                            filepath: obj.filepath
                        }
                        var jonmodel = new Job(jobobj);
                        jonmodel.save(function (err, mes) {
                            cb(err, message);
                        });
                    }
                } else {
                    cb(null, null);
                }
            })
        }, function (merecord, cb) {
            /**
             * 2016-02-03修改
             * 加入saveMecord方法
             * 修改传的值
             */
            var data=new Date();
            var adate=data.getHours()+":"+data.getMinutes();
            var timecount=0;
            timecount=timecount+saveMecord(merecord.boxNumber,obj.warntime,adate);
            cb(null,merecord);
        }], function (err, obj) {
            if (err) {
                res.json(err);
            } else {
                res.json(obj);
            }
        })
    })
}


Messages.getMessageById = function (req, res) {
    var id = req.body.id;
    //console.logs(id);
    Message.getMessageByid(id, function (err, message) {
        res.json(message);
    })
}

Messages.saveJsMes = function (req, res) {
    var obj = {
        boxNumber: req.param("boxNumber"),
        filepath: req.param("filepath"),
        time: req.param("time")?req.param("time"):"10",
        type: 1
    }
    async.waterfall([function (callback) {
        var boxNumber = obj.boxNumber;
        Box.getOne(boxNumber, function (err, box) {
            callback(err, box);
        })
    }, function (b, callback) {
        var jobid = b.boxLastJobId2;
        if (b.boxLastJobId2 == null || b.boxLastJobId2 == 255) {
            b.boxLastJobId2 == 100;
        } else {
            b.boxLastJobId2++;
        }
        Box.update(b, function (err) {
            // console.logs(err);
            callback(err, {path: obj.filepath, boxNumber: b.number, jobid: b.boxLastJobId2});
        })
    }, function (c, callback) {
        var newsobj = {
            filepath: c.path,
            proid: c.jobid,
            boxNumber: c.boxNumber,
            type: 1,
            Source: 0
        }

        var event = new Event(newsobj);
        event.save(function (err, obj) {
            callback(err, obj);
        })
    }, function (d, callback) {
        var jobobj = {
            boxNumber: d.boxNumber,
            type: 0,
            id: d.proid,
            state: 0,
            filepath: d.filepath
        }
        var job = new Job(jobobj);
        job.save(function (err, obj) {
            callback(err, obj);
        })
    }
    ], function (err, obj) {    //查到盒子
        res.json(obj);
    })
}

Messages.saveMes = function (req, res) {
    var obj = {
        name: req.param("name"),
        style: req.param("isXZ"),
        color: req.param("isYS"),
        boxNumber: req.param("boxNumber"),
        type: req.param("type"),
        messageNo: req.param("messageNo"),
        ywNo: req.param("meici"),
        jiange: req.param("jiange"),
        filepath: req.param("filepath"),
        mtype: req.param("mtype"),
        isK: req.param("isK"),
        isf: req.param("isf"),
        time: req.param("time"),
        content:req.param("content"),
        messageTime: []
    }
    var nobility= req.param("nobility");
    var count = 0;//计算总共有多少个提醒，每个时间段算一个提醒
    var times = req.param("times");
    for (var i = 0; i < times.length; i++) {
        obj.messageTime.push(times[i].value);
    }
    async.waterfall([function (callback) {
        Box.getOne(obj.boxNumber, function (err, box) {
            callback(null, box);
        })
    }, function (a, callback) {
        //保存message
        //console.logs(a);
        if (a != null) {
            Nobility.updatelastboxid(nobility,a.number,function(err){
                /**
                 * 2016-02-03修改
                 * 加入saveMecord方法
                 * 修改传的值
                 */
                var data=new Date();
                var month = data.getMonth() + 1 + "";
                var day = data.getDate() + "";
                if (month.length < 2)month = "0" + month;
                if (day.length < 2)day = "0" + day;
                var adate=data.getHours()+":"+data.getMinutes();
                var warntime = data.getFullYear() + "-" + month + "-" + day;
                var adate=data.getHours()+":"+data.getMinutes();
                var timecount=0;
                timecount=timecount+saveMecord(a.number,warntime,adate);
                obj.proid = a.boxLastJobId;
                var message = new Message(obj);
                message.save(function (err, mes) {
                    callback(null, {mes: mes, box: a});
                })
            })

        } else {
            callback(null, null);
        }

    }, function (d, callback) {
        if (d != null) {
            var times = [];
            for (var i = 0; i < d.mes.messageTime.length; i++) {
                var datatime = d.mes.messageTime[i];
                var data = d.mes.createTime;
                var month = data.getMonth() + 1 + "";
                var day = data.getDate() + "";
                if (month.length < 2)month = "0" + month;
                if (day.length < 2)day = "0" + day;
                var odata = data.getFullYear() + "-" + month + "-" + day + "T" + datatime;
                times.push(odata);
            }
            var jobobj = {
                boxNumber: d.mes.boxNumber,
                type: 1,    //定时任务
                id: obj.proid,     //id暂定  需要查询数据
                state: 0,
                hole: obj.isK,     //孔 0 无孔 1 小孔 2 大孔
                interval: d.mes.jiange * 24 * 60,
                times: times,
                filepath: d.mes.filepath
            }
            var jonmodel = new Job(jobobj);
            jonmodel.save(function (err, obj) {
                callback(null, d.box);
            })
        } else {
            callback(null, null);
        }

    }, function (e, callback) {
        if (e != null) {
            e.boxLastJobId++;
            if (e.boxLastJobId > 99) {
                e.boxLastJobId = 0;
            }
            Box.update(e, function (err) {
                callback(err, null);
            })
        } else {
            callback(null, null);
        }
    }], function (err, obj) {
        if (err) {
            res.json(err);
        } else {
            res.json(obj);
        }
    })
}


//微信保存消息
Messages.wxsaveMes = function (req, res) {
    var  boxNumber=req.param("boxNumber");
    var dirpath='./public/vv-box/'+boxNumber;
    if (!fs.existsSync(dirpath)) {
        fs.mkdirSync(dirpath);
    }
    var filename=parseInt(new Date().getTime()/1000)+".amr";
    var target_path=dirpath+"/"+filename;
    BaiduYuYinApi.getAmr(req.param("txt"),target_path,function(err,result){
        req.params["filepath"]=result.path.substr(result.path.lastIndexOf("/")+1);
        req.params["time"]=result.time;
        Messages.saveMes(req,res);
    });
}
//微信更新消息
Messages.updatewxMessage=function(req, res){
	
    var  boxNumber=req.param("boxNumber");
    var dirpath='./public/vv-box/'+boxNumber;
    if (!fs.existsSync(dirpath)) {
        fs.mkdirSync(dirpath);
    }
    var filename=parseInt(new Date().getTime()/1000)+".amr";
    var target_path=dirpath+"/"+filename;
    BaiduYuYinApi.getAmr(req.param("txt"),target_path,function(err,result){
    	console.log(err);
        req.params["filepath"]=result.path.substr(result.path.lastIndexOf("/")+1);
        req.params["time"]=result.time;
        Messages.updateMessage(req,res);
    });
}

Messages.create = function (req, res) {
    res.send("开发中");
}

Messages.save = function (req, res) {
    res.send("开发中");
}

Messages.blank = function (req, res) {
    res.send("开发中");
}

Messages.show = function (req, res) {
    res.send("开发中");
}

Messages.detail = function (req, res) {
    res.send("开发中");
}
Messages.count=function(req,res){
    var type=req.param("type");
   var boxNumbe=req.param("boxNumber");
   Message.count({boxNumber:boxNumbe,type:type,mtype:{$ne:2}},function(err,count){
        res.json(count);
   })
}

/**
*getalert
*获取当前用户的小盒信息和提醒内容
*/
Messages.getalert=function(req,res){
    var boxNumbers=req.param("boxNumbers");
    Box.findobj({number:{$in:boxNumbers}},function(err,boxes){
        if(!boxes){
            res.json(err);
        }else{
            
        }
    })
}

//自动执行更改messages播放时间
var changeMessage = function () {
    //console.logs("执行任务");
    //设定每个星期的每天凌晨进行更新
    var rule = new schedule.RecurrenceRule();
    rule.dayOfWeek = [0, new schedule.Range(1, 6)];
    rule.hour = 00;
    rule.minute = 00;
    rule.second = 00;
    // var rule = new schedule.RecurrenceRule();
    // var times = [];
    // for(var i=1; i<60; i++){
    // times.push(i);
    // }
    // rule.second = times;
    var j = schedule.scheduleJob(rule, function (req, res) {
        var date = new Date();
        var year = date.getFullYear();
        var month = date.getMonth() + 1 + "";
        var day = date.getDate() + "";
        if (month.length < 2)month = "0" + month;
        if (day.length < 2)day = "0" + day;
        var date2 = year + "-" + month + "-" + day;
        async.waterfall([function (callback) {
            Box.updateP(function(){
                if (global.systemdate.days == null || global.systemdate.days == 419) {
                    global.systemdate.days = 0;
                } else {
                    global.systemdate.days++;
                }
                SystemDate.updateAndFind(global.systemdate.days, function (err, obj) {
                    global.systemdate = obj;
                    callback(err, obj)
                })
            })
        }, function (system, callback) {
            if(system!=null){
                Message.updateByDays(system.days, date2, function (err) {
                    callback(err, system);
                })
            }else{
                callback(null, null);
            }

        }, function (sys, callback) {
            if(sys!=null){
                var i = 0;
                var n = 1
                Message.findByBoxNumberAndUpdate1(function (err, meRecord) {
                    saveMecord(meRecord, date2, i, n);
                })
                var saveMecord = function (meRecord, date2, i, n) {
                    var allmeRecord = meRecord;//所有需要添加的盒子编号
                    var meRecords = [];      //当前添加的100条数据
                    var successlist = [];      //保存100个盒子编号
                    var content = [];          //成功添加的盒子列表,以100个为一组,保存
                    var length = meRecord.length;
                    if (length > n * 100) {
                        var length = n * 100;
                    }
                    for (i; i < length; i++) {
                        var boxNumber = meRecord[i].boxNumber;
                        var retimes = meRecord[i].messageTime;
                        var obj = {
                            createTime: new Date(),
                            updateTime: new Date(),
                            boxNumber: boxNumber,
                            retimes: retimes,
                            remindDate: date2,
                            dtype:0
                        }
                        meRecords.push(obj);
                        successlist.push(boxNumber);
                    }
                    if (meRecords.length > 0) {
                        //var merecord = new MeRecord(meRecords);
                        MeRecord.batchsave(meRecords, function (err, mercordlist) {
                            if (mercordlist.length < meRecords.length || err) {
                                callback(err, {
                                    result: 'error',
                                    content: content,
                                    n: n,
                                    err: err,
                                    allmeRecord: allmeRecord
                                });
                            } else if (meRecord.length > n * 100) {
                                var sussessResult = {
                                    genera: n,
                                    content: successlist
                                }
                                content.push(sussessResult);
                                saveMecord(meRecord, date2, i, n++);
                            } else {
                                callback(err, {result: 'success', content: content, allmeRecord: allmeRecord})
                            }
                        })
                    }
                }
            }else{
                callback(null, {result: 'none', content:"时间错误,没有时间！"})
            }

        }], function (err, obj) {
            if (obj.result == "error") {
                console.log("已经更新一下盒子编号的MeRecord" + obj.content);
                console.log("当前第" + obj.n + "个列表的数据出错");
                console.log("错误原因--------" + obj.err);
                logInfo.error("已经更新一下盒子编号的MeRecord" + obj.content);
                logInfo.error("当前第" + obj.n + "个列表的数据出错");
                logInfo.error("错误原因--------" + obj.err);
            } else if(obj.result == "success"){
                console.log("更新成功");
                logInfo.info("更新成功");
            }else if(obj.result == "none"){
                console.log(obj.content);
                logInfo.error("出错了，你怎么搞的");
            }
        })
    });
}
changeMessage();

