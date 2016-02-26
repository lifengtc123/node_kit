/**
 * Created by lifeng on 15/3/11.
 */
var mongoose=require('./mongoosedb');
var async=require('async');
var Schema = mongoose.Schema ;

/**
 * 盒子记录
 * @type {Schema}
 */

var brecordSchema=new Schema({
    type:Number,   //记录类型  0 上线 1 离线 2 红外  3 大孔 4 小孔 5 按钮
    datatime:Date,
    number:Number,   //触发次数
    boxId:String
},{
    conllection:"brecord"
});



var brecordModel= mongoose.model('BRecord',brecordSchema);

function BRecord(brecord){
    this.type=brecord.type;
    this.datatime=brecord.datatime;
    this.number=brecord.number;
};

module.exports=BRecord;

BRecord.prototype.save=function(callback){

    var newBRecord=new brecordModel(this);

    newBRecord.save(function(err,brecord){
        if(err){
            return callback(err);
        }
        callback(null,brecord);
    });
}



BRecord.getOne=function(username,password,callback){
    brecordModel.findOne({username:username,password:password}).exec(function(err,brecord){
        callback(err,brecord);
    })
}

BRecord.getUsername=function(username,callback){
    brecordModel.findOne({username:username}).exec(function(err,brecord){
        callback(err,brecord);
    })
}

BRecord.getGroup=function(name,_id,callback){
    brecordModel.aggregate().match({name:name}).group({"_id":{name:"$name"},count:{"$sum":1}}).exec(function(err,brecords){
        if(err){
            callback(err);
        }
        callback(null,brecords);
    })
}
