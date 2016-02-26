/**
 * Created by lifeng on 15/3/11.
 */
//盒子表
var mongoose=require('./mongoosedb');
var async=require('async');
var Schema = mongoose.Schema ;
Jobs=require("../controllers/Jobs.js");
Nobility=require("../controllers/Jobs.js");
/**
 * 盒子信息
 * @type {Schema}
 *
 */
var boxSchema=new Schema({
    number:{type:String,index:true},   //编码 000000000000
    key:String,                //秘钥
    online:{type:Number,default:0},    //在线还是离线  0 离线 1 在线
    ip:{type:String,index:true},   //盒子公网ip地址
    host:String,    //盒子所访问服务器的地址
    jobId:{type:Array},  //盒子现在对应的所有任务  0-255
    hasJob:{type:Number,default:0},  //当前是否有新任务 0 无 1 有
    updatebox:{type:Number,default:0},   //盒子是不是要更新  0 不用， 1需要
    updatepassword:{type:String},    //更新密码
    updatebb:String,     //更新的版本号,
    name:{type:String},    //盒子名
    percent:{type:Number,default:0},  //今日完成百分比
    image:String,    //盒子的外观图片
    boxLastJobId:{type:Number,default:0},    //定时任务ID  0-99循环
    boxLastJobId2:{type:Number,default:100},  //即时任务ID  100-255循环
    filepath:{type:String},    //二维码图片地址
    days:{type:Number,default:0}, //当前天数
    temp:{type:Number,default:0},   //盒子当前温度  摄氏度
    hwxNo:{type:Number,default:0},    //最近检测到的红外线触发次数
    lastUpTime:Date,            //最后一次定时数据上传的时间
    staffTime:Date,            //红外感应时间
    createTime:Date,
    ipaddress:String,
    onlinetype:{type:Number,default:0},    //在线还是离线  0离线 1 在线,每次统计后变成0
    newjh:{type:Number,default:0},  //激活状态 0新激活，1，已经激活
    nobilityid:String,
    reset:{type:Number,default:0},   //是否重置 0 否 1 是
     times:{type:Number,default:0}   //吃药次数
},{
    conllection:"box"
});


var boxModel= mongoose.model('Box',boxSchema);

function Box(box){
    this.number=box.number;
    this.key=box.key;
    this.days=box.days;
    this.image=box.image;
    this.name=box.name;
    this.filepath=box.filepath;
    this.online=box.online;
    this.lastUpTime=box.lastUpTime;
    this.nobilityid=box.nobilityid;
    this.staffTime=box.staffTime;
    this.times=box.times;
};

module.exports=Box;

Box.prototype.save=function(callback){
    this.days=1;
    this.createTime=new Date();
    var newBox=new boxModel(this);
    
    newBox.save(function(err,box){
        if(err){
            return callback(err);
        }
        callback(null,box);
    });
}

Box.Model=function(){
    return boxModel;
}

Box.update=function(box,callback){
    boxModel.update({_id:box._id},box,function(err,doc){
        if(err){
            return callback(err);
        }
        callback(null,doc);
    });
}

Box.find=function(obj,callback){
    boxModel.find(obj,function(err,docs){
        callback(err,docs);
    });
}

Box.findOne=function(obj,callback){
    boxModel.findOne(obj,function(err,doc){
        callback(err,doc);
    });
}

Box.updateOpt=function(obj,option,callback){
    boxModel.update(obj,option,{ multi: true },function(err,doc){
        if(err){
            return callback(err);
        }
        callback(null,doc);
    });
}

Box.getAllBox=function(callback){
    boxModel.find({}).exec(function(err,boxs){
      callback(err,boxs)
    })
}

Box.updateAndFind=function(callback){
    boxModel.update({boxNumber:{$ne:null}},{"$inc":{"days":1}},null,function(err,boxes){
        callback(err);
    });
}

Box.getOne=function(number,callback){
    boxModel.findOne({number:number}).exec(function(err,box){
        callback(err,box);
    })
}

Box.getOneChange=function(number,callback){
    boxModel.findOne({number:number}).exec(function(err,box){
        callback(err,box);
    })
}

Box.getAll=function(number,callback){
    //console.logs(username);
    var number=number;
    boxModel.find({number:number}).exec(function(err,box){
        //console.logs(box.length);
       callback(err,box);
   })
}

//
Box.getBoxes=function(numbers,callback){
    var numbers=numbers;
    boxModel.find({'number':{"$in":numbers}}).exec(function(err,box){
        callback(err,box);
    })
}

Box.getUsername=function(username,callback){
    boxModel.findOne({username:username}).exec(function(err,box){
        callback(err,box);
    })
}

Box.getGroup=function(name,_id,callback){
    boxModel.aggregate().match({name:name}).group({"_id":{name:"$name"},count:{"$sum":1}}).exec(function(err,boxes){
        if(err){
            callback(err);
        }
        callback(null,boxes);
    })
}
//盒子更新系统
Box.updateGx=function(number,password,updatebb,callback){
    boxModel.update({number:number},{ $set: { updatebox: 1,updatepassword:password},updatebb:updatebb},{},function(err,obj){
        callback(err,obj)
     })
}

//用系统天数来更新所有的消息
Box.updateP=function(callback){
    boxModel.update({},{percent:0,time:0},{ multi: true },function(err){
        callback(err);
    })
}

Box.prototype.batchsave=function (obj,callback){
    boxModel.create(obj,function(err,meRecords){
        callback(err,meRecords);
    })
}
//获取盒子数量
Box.getCount=function(obj,callback){
    boxModel.count(obj,function(err,count){
        callback(err,count);
    })
}


Box.getOneByObj=function(obj,callback){
    boxModel.findOne(obj,function(err,box){
        callback(err,box);
    })
}

Box.getListByObj=function(obj,callback){
    boxModel.find(obj,function(err,box){
            callback(err,box);
    })
}

Box.getPagedList=function(pagedList,search,searchField,orderBy,order,condition,where,callback){
    pagedList.query(["name","number"],search,searchField,orderBy,order,condition,where);
    boxModel.execPageQuery(pagedList.pageNumber,pagedList.pageSize,pagedList.where,null,pagedList.sort,function(err,objs){
        pagedList.data=objs.rows;
        pagedList.pageCount=parseInt(objs.total/pagedList.pageSize)+1;
        pagedList.setTotal(objs.total);
        callback(err,pagedList);
    });
}
