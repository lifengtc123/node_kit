/**
 * Created by lifeng on 15/3/17.
 */
var mongoose=require('./mongoosedb');
var async=require('async');
var Schema = mongoose.Schema ;

var indexdataSchema=new Schema({
    mondate:{ type: Date, default: Date.now },   //时间  月为单位
    boxToday:Schema.Types.Mixed,
    boxChart:[Schema.Types.Mixed],   //盒子在线数、激活数  {date:yyyy-mm-dd,onNum:0,acNum:0}
    messageToday:Schema.Types.Mixed,
    messageChart:[Schema.Types.Mixed],   //消息提醒数 提醒总数 成功提醒数 完成数
    appToday:Schema.Types.Mixed,
    appChart:[Schema.Types.Mixed],    //App装机量/上线量
    cpu:Schema.Types.Mixed,   //cpu使用率{ user: 121650, nice: 0, sys: 33170, idle: 2332520, irq: 0 }  user用户使用时间， sys系统使用时间 idle 空闲时间
    memory:Schema.Types.Mixed  //os.totalmem()  内存总数，单位字节 os.freemem() 空闲内存数，单位字节 os.networkInterfaces() 返回一个二维数组，每一个内层数组代表一个网络接口（物理网卡或者虚拟网卡）
},{
    conllection:"indexdata"
});



var indexdataModel= mongoose.model('IndexData',indexdataSchema);

function IndexData(indexdata){

};

module.exports=IndexData;

IndexData.Model=function(){
	return indexdataModel;
}

IndexData.prototype.save=function(callback){

    var newIndexData=new indexdataModel(this);

    newIndexData.save(function(err,brecord){
        if(err){
            return callback(err);
        }
        callback(null,brecord);
    });
}



IndexData.getOne=function(username,password,callback){
    brecordModel.findOne({username:username,password:password}).exec(function(err,brecord){
        callback(err,brecord);
    })
}

IndexData.getUsername=function(username,callback){
    boxModel.findOne({username:username}).exec(function(err,brecord){
        callback(err,brecord);
    })
}

IndexData.getGroup=function(name,_id,callback){
    brecordModel.aggregate().match({name:name}).group({"_id":{name:"$name"},count:{"$sum":1}}).exec(function(err,brecords){
        if(err){
            callback(err);
        }
        callback(null,brecords);
    })
}