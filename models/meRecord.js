/**
 * Created by wbb on 15/6/24.
 */
var mongoose=require('./mongoosedb');
var async=require('async');
var Schema = mongoose.Schema ;

var meRecordSchema=new Schema({
    createTime:Date,
    updateTime:Date,
    boxNumber:String,   //盒子编号
    remindDate:String,  //提醒日期
    retimes:{type:Number,default:0},      //需提醒次数
    donetimes:{type:Number,default:0},   //已经完成的提醒次数
    dtype:{type:Number,default:0}       //0,不删除，计算，1删除不计算
},{
    conllection:"meRecord"
});

var meRecordModel= mongoose.model('MeRecord',meRecordSchema);

function MeRecord(meRecord){
    this.createTime=meRecord.createTime;
    this.updateTime=meRecord.updateTime;
    this.boxNumber=meRecord.boxNumber;
    this.remindDate=meRecord.remindDate;
    this.retimes=meRecord.retimes;
    this.dtype=meRecord.dtype;
};

module.exports=MeRecord;

MeRecord.prototype.save=function(callback){
    this.createTime=new Date();
    this.updateTime=new Date();
    var newMeRecord=new meRecordModel(this);
    newMeRecord.save(function(err,meRecord){
        if(err){
            callback(err);
        }
        callback(null,meRecord);
    });
}

MeRecord.batchsave=function (obj,callback){
    meRecordModel.create(obj,function(err,meRecords){
        callback(err,meRecords);
    })
}
/*
 *时间空间中查询一个月的记录
 */
MeRecord.getListByDate=function(boxNumber,year,month,callback){
    if(month=='0'){
        year=year-1;
        month='12';
    }
    month=month+"";
    if(month.length<2)month="0"+month;
    var start =year+"-"+month+"-01";
      var month2="";
    if(month=="12"){
       year=parseInt(year)+1;
       month2="01";
    }else{
      month2=parseInt(month)+1+"";
    }
    if(month2.length<2)month2="0"+month2;
    var end=year+"-"+month2+"-01";
    var data=new Date();
    var month=data.getMonth()+1+"";
    var day=data.getDate()+"";
    if(month.length<2)month="0"+month;
    if(day.length<2)day="0"+day;
    var warntime=data.getFullYear()+"-"+month+"-"+ day;
    meRecordModel.find({boxNumber:boxNumber,remindDate:{$gte: start, $lt: end},remindDate:warntime,dtype:0}).exec(function(err,reRecord){
        callback(err,reRecord);
    })
}
MeRecord.getList=function(boxNumber,callback){
    meRecordModel.find({boxNumber:boxNumber}).exec(function(err,reRecord){
        callback(err,reRecord);
    })
}

MeRecord.findByBoxAndWarntime=function(boxNumber,date,callback){
    //console.logs("在meRecord.js111行"+date+"--"+boxNumber);
    meRecordModel.findOne({remindDate:date,boxNumber:boxNumber}).exec(function(err,reRecord){
        callback(err,reRecord);
    })
}

MeRecord.findByBoxAndTime=function(boxNumber,date,callback){
    //console.logs("在meRecord.js111行"+date+"--"+boxNumber);
    meRecordModel.find({remindDate:date,boxNumber:boxNumber}).exec(function(err,reRecord){
        callback(err,reRecord);
    })
}
//更新提醒时间
MeRecord.updateTimes=function(messageid,date,callback){
    meRecordModel.update({_id:messageid},{"warntime":date},function(err){
        //console.logs(err);
        callback(err);
    });
}
//增加盒子的数量
MeRecord.updateCount=function(boxNumber,remindDate,recordCount,callback){
    meRecordModel.update({boxNumber:boxNumber,remindDate:remindDate},{$inc:{"retimes":recordCount}},function(err){
        callback(err);
    });
}
//删除提醒的数量
MeRecord.deleteCount=function(boxNumber,remindDate,recordCount,callback){
    meRecordModel.update({boxNumber:boxNumber,remindDate:remindDate},{$set:{"retimes":recordCount}},function(err){
        callback(err);
    });
}
//更新提醒数量
MeRecord.update=function(id,recordCount,callback){
    meRecordModel.update({_id:id},{"retimes":recordCount},function(err){
        callback(err);
    });
}
MeRecord.remove=function(boxNumber,remindDate,callback){
    meRecordModel.remove({boxNumber:boxNumber,remindDate:remindDate},function(err){
        callback(err);
    });
}



/**
 *2016-02-02
 *更具条件查询一条数据
 * obj是条件
 */
MeRecord.getOne=function(obj,callback){
    //console.logs("在meRecord.js111行"+date+"--"+boxNumber);
    meRecordModel.findOne(obj).exec(function(err,reRecord){
        callback(err,reRecord);
    })
}

/**
 *2016-02-02
 *批量所有的用药记录
 */
MeRecord.updateByList=function(obj,mes,callback){
    meRecordModel.update(obj,mes,{ multi: true },function(err){
        callback(err);
    })
}

