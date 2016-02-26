/**
 * Created by wbb on 15/6/25.
 */
//是否吃药
var mongoose=require('./mongoosedb');
var async=require('async');
var Schema = mongoose.Schema ;

var medicationSchema=new Schema({
    createTime:{type:Date,default:new Date()},
    updateTime:{type:Date,default:new Date()},
    message:{},    //提醒id,
    messageid:String,
    boxNumber:String,    //盒子number
    messageTime:String,  //提醒时间
    eatTime:String,     //触发时间
    warntime:String,     //提醒日期
    isEat:Number,   //是否吃药状态(1:按钮点击,2,小孔,4:大孔,8:超时)
    mtype:{type:String,default:1}, //1启用，0停用
    dtype:{type:String,default:0}  //0,不删除，计算 1删除，不计算

},{
    conllection:"medication"
});

var medicationModel= mongoose.model('Medication',medicationSchema);

function Medication(medication){
    this.createTime=medication.createTime;
    this.updateTime=medication.updateTime;
    this.message=medication.message;
    this.boxNumber=medication.boxNumber;
    this.warntime=medication.warntime;
    this.messageTime=medication.messageTime;
    this.isEat=medication.isEat;
    this.messageid=medication.messageid;
    this.mtype=medication.mtype;
    this.dtype=medication.dtype;
    this.eatTime=medication.eatTime;
};

module.exports=Medication;

Medication.Model=function(){
	return medicationModel;
}

//通过id查询数据库得到Message
Medication.getMessageIdAndTime=function(messageid,time,warntime,callback){
    medicationModel.findOne({'messageid':messageid,'messageTime':time,'warntime':warntime}).sort({'_id':-1}).exec(function(err,medications){
        callback(err,medications);
    });
}

//保存数据。
Medication.prototype.save=function(callback){
    this.createTime=new Date();
    this.updateTime=new Date();
    var newMedication=new medicationModel(this);
    newMedication.save(function(err,medications){
        if(err){
            callback(err);
        }else{
            callback(null,medications);
        }
    });
}


Medication.saveArray=function(objs,callback){
    medicationModel.create(objs,function(err,objs){
        callback(err,objs);
    });
}

//批量删除
Medication.delete=function(obj,callback) {
    medicationModel.remove(obj, function (err, menu) {
      callback(err, menu);
    })
}

//查询多个
Medication.findList=function(obj,callback){
    medicationModel.find(obj,function(err,medications){
        callback(err,medications);
    })
}
//查询多个
Medication.findOne=function(obj,callback){
    medicationModel.findOne(obj,function(err,medications){
        callback(err,medications);
    })
}

/**
*批量单个纪录
*/
Medication.update=function(obj,array,callback){
    medicationModel.update(obj,array,function(err){
        callback(err);
    })
}
/**
*批量更新
*/
Medication.updatearray=function(obj,array,callback){
    medicationModel.update(obj,array,{ multi: true },function(err){
        callback(err);
    })
}