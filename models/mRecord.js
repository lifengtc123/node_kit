/**
 * Created by lifeng on 15/3/11.
 */
    /*
    *提醒记录
     */
var mongoose=require('./mongoosedb');
var async=require('async');
var Schema = mongoose.Schema ;

var mrecordSchema=new Schema({
    type:Number,    //触发时间  0 大孔 1 小孔 2 按钮 3 红外
    dataTime:Date,   //触发时间
    state:Number,    //触发类型   0 有效完成 1 无效未完成
    messageId:{type:Number},  //消息ID
    boxId:{type:String}
},{
    conllection:"mrecord"
});



var mrecordModel= mongoose.model('MRecord',mrecordSchema);

function MRecord(mrecord){
    this.type=mrecord.type;
    this.dataTime=mrecord.dataTime;
    this.state=mrecord.state;
    this.messageId=mrecord.messageId;
    this.boxId=mrecord.boxId;
};

module.exports=MRecord;

MRecord.prototype.save=function(callback){

    var newMRecord=new mrecordModel(this);

    newMRecord.save(function(err,mrecord){
        if(err){
            return callback(err);
        }
        callback(null,mrecord);
    });
}



MRecord.getOne=function(username,password,callback){
    mrecordModel.findOne({username:username,password:password}).exec(function(err,mrecord){
        callback(err,mrecord);
    })
}

MRecord.getUsername=function(username,callback){
    mrecordModel.findOne({username:username}).exec(function(err,mrecord){
        callback(err,mrecord);
    })
}

MRecord.getGroup=function(name,_id,callback){
    mrecordModel.aggregate().match({name:name}).group({"_id":{name:"$name"},count:{"$sum":1}}).exec(function(err,mrecords){
        if(err){
            callback(err);
        }
        callback(null,mrecords);
    })
}
