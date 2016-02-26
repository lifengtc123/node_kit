/**
 * Created by lifeng on 15/3/11.
 */
// 消息表
var mongoose=require('./mongoosedb');
var async=require('async');
var Schema = mongoose.Schema ;

var messageSchema=new Schema({
    createTime:Date,
    updateTime:Date,
    name:{type:String,index:true},   //药名
    style:String,                //样式
    color:String,    //颜色
    boxNumber:{type:String,index:true},   //药盒ID
    type:{type:Number},  //提醒类型（0：药物提醒/1：非药物提醒）
    messageNo:Number,     //一天吃几次
    ywNo:Number,   //一次吃几颗
    messageTime:{type:Array},  //提醒时间
    jiange:Number,     //间隔时间 天为单位
    filepath:String,    //语言地址
    mtype:{type:Number}, //启用停用状态 0:启用，1:停用,删除:2
    isK:Number,   //对应孔 0:外置，1:小孔 2:大孔
    content:String, //提醒内容(生活提醒中有)
    warntime:String,  //最后播放的时间
    isf:String,    //服用类型。饭前，饭后，随饭服用,
    proid:Number,    //这个任务的盒子下发的ID
    time:String,     //语音文件的播放时间,
    warnFile:{type:Array} //提醒数组，方便查询哪一天提醒

},{
    conllection:"message"
});



var messageModel= mongoose.model('Message',messageSchema);

function Message(message){
    this.createTime=message.createTime;
    this.updateTime=message.updateTime;
    this.name=message.name;
    this.style=message.style;
    this.color=message.color;
    this.boxNumber=message.boxNumber;
    this.type=message.type;
    this.mtype=message.mtype;
    this.messageNo=message.messageNo;
    this.ywNo=message.ywNo;
    this.messageTime=message.messageTime;
    this.filepath=message.filepath;
    this.jiange=message.jiange;
    this.content=message.content;
    this.warntime=message.warntime;
    this.isf=message.isf;
    this.isK=message.isK;
    this.proid=message.proid;
    this.time=message.time;
    this.warnFile=message.warnFile;
};

module.exports=Message;

Message.prototype.save=function(callback){
    this.createTime=new Date();
    this.updateTime=new Date();
    var jiange=this.jiange;
    var warnFile=[];
    if(jiange==0){
        warnFile.push("-1");
    }else if(jiange==1){
        warnFile.push("");
    }else{
        for(var i=global.systemdate.days%jiange;i<=420;i=i+jiange){
              warnFile.push(i);
         }
    }
    this.warnFile=warnFile;
    var data=new Date();
    var month=data.getMonth()+1+"";
    var day=data.getDate()+"";
    if(month.length<2)month="0"+month;
    if(day.length<2)day="0"+day;
    this.warntime=data.getFullYear()+"-"+month+"-"+ day;
    var newMessage=new messageModel(this);
    newMessage.save(function(err,message){
        if(err){
             callback(err);
        }
        callback(null,message);
    });
}

Message.remove=function(obj,callback){
    messageModel.remove(obj,function(err){
        callback(err);
    })
}

//更新单条提醒的所有内容
Message.update=function(id,mobj,callback){
    mobj._id=id;
    mobj.updateTime=new Date();
    var jiange=this.jiange;
    var warnFile=[];
    if(jiange==0){
        warnFile.push("-1");
    }else if(jiange==1){
        warnFile.push("");
    }else{
        for(var i=global.systemdate.days%jiange;i<=420;i=i+jiange){
            warnFile.push(i);
        }
    }
    mobj.warnFile=warnFile;
    messageModel.update({_id:id},mobj,function(err){
        console.log(err);
        callback(err);
    })
}

//用系统天数来更新所有的消息
Message.updateByDays=function(days,warntime,callback){
    messageModel.update({$or:[{"jiange":1},{warnFile:days}],mtype:0},{warntime:warntime},{ multi: true },function(err){
        callback(err);
    })
}
/**
 * 无条件查询所有的用药提醒
 * @param callback
 */
Message.findAll= function (callback) {
    messageModel.find({}).exec(function(err,messages){
        callback(err,messages);
    })
}

/**
 * 2016-02-02
 *批量更新所有的提醒
 */
Message.updateByList=function(obj,mes,callback){
    messageModel.update(obj,mes,{ multi: true },function(err){
        callback(err);
    })
}

//用in查询所有的message 提醒
Message.getMessages=function(boxNumbers,warntime,callback){
    messageModel.find({'boxNumber':{"$in":boxNumbers},'warntime':warntime}).exec(function(err,messages){
        callback(err,messages);
    })
}
////根据boxNumber和提醒时间查询 提醒
//Message.getMessageByBoxNumber=function(boxNumber,warntime,callback){
//    messageModel.find({'boxNumber':boxNumber,'warntime':warntime}).exec(function(err,messages){
//        callback(err,messages);
//    })
//}

//根据boxNumber和提醒时间查询 提醒
Message.getMessageByBoxNumber=function(boxNumber,warntime,callback){
    messageModel.find({'boxNumber':boxNumber,'warntime':warntime,mtype:0}).exec(function(err,messages){
        callback(err,messages);
    })
}

//通过id查询数据库得到Message
Message.getMessageByid=function(id,callback){
    messageModel.findOne({'_id':id}).exec(function(err,message){
        callback(err,message);
    })
}
//通过id和Hole查询数据库得到Message
Message.getMessageByBoxAndHole=function(obj,callback){
    messageModel.findOne(obj).exec(function(err,message){
        callback(err,message);
    })
}
//根据type查找所有的提醒
Message.getListByType=function(boxNumber,type,callback){
    messageModel.find({boxNumber:boxNumber,type:type}).exec(function(err,messages){
        callback(err,messages);
    })
}

Message.getGroup=function(name,_id,callback){
    messageModel.aggregate().match({name:name}).group({"_id":{name:"$name"},count:{"$sum":1}}).exec(function(err,messages){
        if(err){
            callback(err);
        }
        callback(null,messages);
    })
}

Message.getCount=function(boxId,createTime,callback){
    messageModel.find({boxNumber:boxId,createTime:{$lt:createTime}}).exec(function(err,message){
        callback(err,message);
    })
}

Message.getOneList=function(boxId,callback){
    messageModel.find({boxNumber:boxId,mtype:{$ne:2}}).exec(function(err,message){
        for(var i=0;i<message.length;i++){
                messageModel.update({_id:message[i]._id},function(err){
                    //console.logs(err);
                });
            }
        callback(err,message);
    })
}

//根据时间查找message
Message.findByTime=function(date,callback){
    messageModel.find({warntime:{$ne:date},warntime:{$ne:null},warntime:{$lt:date}}).exec(function(err,message){
        callback(err,message);
    })
}

//根据时间和间隔
Message.updateTimes=function(messageid,date,callback){
    messageModel.update({_id:messageid},{"warntime":date},function(err,docs){
        callback(err);
    })
}
Message.findById=function(messageid,date,callback){
    messageModel.findOne({_id:messageid}).exec(function(err,message){
        callback(err,message);
    })
}
//根据porid和盒子编号查询
Message.findByPorId=function(boxNumber,proid,callback){
    messageModel.find({boxNumber:boxNumber,proid:{$in:proid}}).exec(function(err,messages){
        callback(err,messages);
    })
}

//删除message通过messageid
Message.deleteById=function(id,callback){
    messageModel.remove({'_id':id},function(err){
        if(err) {
            callback(err);
        } else {
            callback("success");
        }
 })
}

Message.findByBoxNumberAndUpdate=function(box,warntime,callback){
    messageModel.update({$or:[{'boxNumber':box.boxNumber,warnFile:'1'},{'boxNumber':box.boxNumber,warnFile:box.days}]},{"warntime":warntime},function(err,messages){
          callback(err,messages);
    })
}


var group={
    key: {boxNumber:1},
    cond:{'mtype':0}, //查询条件         cond: {'user':user, 'create_at': { $gt:firstDay,$lt:lastDay}}, //查询条件
    initial:{messageTime:0}, //初始值
    reduce: function(obj, prev) {
        prev.messageTime+=obj.messageTime.length;
    },
    finalize:{}
};

Message.findByBoxNumberAndUpdate1=function(callback){
    messageModel.collection.group(
        group.key,
        group.cond, //查询条件
        group.initial, //初始值
        group.reduce,
        group.finalize,
        true,//reduce
        function(err,sendinfos){
            if (err) {
                 callback(err);
            }
            callback(null,sendinfos);
        }
    );
}




Message.prototype.batchsave=function (obj,callback){
    messageModel.create(obj,function(err,meRecords){
        callback(err,meRecords);
    })
}

/**
*根据obj进行更新
*obj是查询条件
*message是更新的内容
*/
Message.updateobj=function(obj,message,callback){
    messageModel.update(obj,message,function(err,message){
        callback(err,message);
    })
}


/**
*根据obj进行查询
*obj是查询条件
*/
Message.findobj=function(obj,callback){
    messageModel.find(obj,function(err,messages){
        callback(err,messages);
    })
}

/**
*2016-01-25
*计算提醒数量的
*/
Message.count=function(obj,callback){
    messageModel.count(obj,function(err,count){
        callback(err,count);
    })
}
