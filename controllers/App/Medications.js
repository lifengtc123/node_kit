/**
 * Created by wbb on 15/6/24.
 */

var crypto =require("crypto");
var async=require('async');
Medication = require("../../models/medication.js");
Box=require("../../models/box.js");
Message=require("../../models/message.js");
MeRecord=require("../../models/meRecord.js");
function Medications(app){

}

module.exports= Medications;

Medications.list=function(req,res){
    res.send("开发中");
}

Medications.getMessageIdAndTime=function(req,res){
    var messageid=req.body.messageid;
    var time=req.body.time;
    var date=new Date();
    var month=date.getMonth()+1+"";
    var day=date.getDate()+"";
    if(month.length<2)month="0"+month;
    if(day.length<2)day="0"+day;
    var date2=date.getFullYear()+"-"+month+"-"+day;
    Medication.findOne({messageid:messageid,messageTime:time,warntime:date2,dtype:0},function(err,medication){
        res.json(medication);
    });
}

//当盒子处理完提醒后保存一条处理结果消息
Medications.saveMedication=function(req,res){
    var obj={
        messageid:req.param("messageid"),    //提醒id
        messageTime:req.param("messageTime"),  //提醒时间--08：00
        warntime:req.param("warntime"),     //提醒日期--哪一天提醒的
        isEat:req.param("isEat")     //是否吃药状态(1:按钮点击,2,小孔,4:大孔,8:超时)
    }
    var medication=new Medication(obj);
    async.waterfall([function(callback){
        medication.save(function(err,medication){
            callback(null,medication);
        })
    },function(a,callback){
        //找到对应的提醒
        Message.findById(obj.messageid,function(err,message){
            callback(null,message);
        })
    },function(b,callback){
        //找到对应的盒子
        Box.getOne(b.boxNumber,function(err,box){
            callback(null,box);
        })
    },function(c,callback){
        //找到对应是否触发记录
        MeRecord.findByBoxAndWarntime(c.boxNumber,obj.warntime,function(err,meRecord){
            callback(null,{merecord:meRecord,box:c});
        })
    } ,function(d,callback){
        //获取当日提醒消息的总的数量来计算当日完成度
        d.box.percent=(d.merecord.donetimes/d.merecord.retimes)*100;
           Box.update(d.box,function(err,box){
               callback(null,box);
        })
    }],function(err,obj){
        if(err){
            res.json(err);
        }else{
            res.json(obj);
        }
    })
}

Medications.getMedicationList=function(req,res){
    var warntime=req.param("warntime");
    var boxNumber=req.param("boxNumber");
    Medication.findList({boxNumber:boxNumber,warntime:warntime,dtype:0},function(err,medications){
        res.json(medications);
    })
}

Medications.getMedicationLists=function(req,res){
    var warntime=req.param("warntime");
    var boxNumbers=req.param("boxNumbers");
    Medication.findList({boxNumber:{$in:boxNumbers},warntime:warntime,dtype:0},function(err,medications){
        res.json(medications);
    })
}

Medications.getMedication=function(req,res){
    var id=req.param("id");
    Medication.findOne({_id:id},function(err,medication){
        res.json(medication);
    })
}
