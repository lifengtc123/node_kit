/**
 * Created by lifeng on 15/5/8.
 */
//盒子任务表
var mongoose=require('./mongoosedb');
var async=require('async');
var Schema = mongoose.Schema ;


/**
 * 盒子需要下发的任务
 * @type {Schema}
 *
 */
var jobSchema=new Schema({
    boxNumber:{type:String,index:true},   //盒子编码
    type:Number,                //消息类型   1 定时 0 即时  2 音量调节
    hole:{type:Number,default:0},    //孔类型 0 无孔 1 小孔 2 大孔  声音就是 0-8的值
    id:{type:Number,index:true},   //任务ID
    state:Number,  //操作类型   0 增 1 删 2 改,3 停用
    interval:{type:Number,default:0},  //任务的时间间隔 分钟为单位
    filepath:String,     //声音地址
    times:{type:Array},
    update:{type:Number,default:0}   //是否下发了任务
},{
    conllection:"job"
});



var jobModel= mongoose.model('Job',jobSchema);

function Job(job){
    this.boxNumber=job.boxNumber;
    this.type=job.type;
    if(job.hole!=null)this.hole=job.hole;
    this.id=job.id;
    this.state=job.state;
    if(job.interval!=null)this.interval=job.interval;
    this.filepath=job.filepath;
    if(job.times!=null){
        this.times=new Array();
        for(var i=0;i<job.times.length;i++){
            var time1=new Date(job.times[i]);
            var sc=time1.getTimezoneOffset();
            this.times.push(time1.getTime()+sc*60000);
        }
    }
//    console.logs(job.time1);
};

module.exports=Job;

Job.Model=function(){
    return jobModel;
}
Job.prototype.save=function(callback){

    var newJob=new jobModel(this);

    newJob.save(function(err,job){
        if(err){
            return callback(err);
        }
        callback(null,job);
    });
}

Job.savelist=function(jobs,callback){
    jobModel.create(jobs,function(err,jobs){
        callback(err,jobs);
    })
}
//检查是否有新任务
Job.getOne=function(boxNumber,callback){
    jobModel.findOne({boxNumber:boxNumber,update:0}).sort({_id:1}).exec(function(err,job){
        callback(err,job);
    })
}

//Job.updateByid=function(jobobj,callback){
//    if(jobobj.times!=null){
//        var newtimes=new Array();
//        for(var i=0;i<jobobj.times.length;i++){
//            var time1=new Date(jobobj.times[i]);
//            var sc=time1.getTimezoneOffset();
//            newtimes.push(time1.getTime()+sc*60000);
//        }
//    }
//    jobModel.update(jobobj,function(err){
//        callback(err);
//    })
//}

Job.getByBoxnumber=function(boxNumbers,callback){
    jobModel.find({'boxNumber':{"$in":boxNumbers}}).exec(function(err,jobs){
            callback(err,jobs);
        })

}
Job.getById=function(id,callback){
    jobModel.find({id:id}).exec(function(err,jobs){
        //console.logs(jobs);
        ////for(var i=0;i<boxs.length;i++){

        ////    Jobs.list()
        ////}
        callback(err,jobs);
    })
}

Job.getOkJob=function(boxNumber,id,state,callback){
    async.waterfall([function(cb){
        jobModel.findOne({boxNumber:boxNumber,id:id,update:0,state:state}).sort({_id:1}).exec(function(err,obj){
            cb(err,obj);
        })
    },function(obj,cb){
        if(obj==null){
            cb(null,null);
        }else{
            jobModel.update({_id:obj._id},{ $set: { update: 1}},{},function(err,obj){
                cb(err,obj)
            })
        }

    }],function(err,obj){
        callback(err,obj);
    })
}

Job.getGroup=function(name,_id,callback){
    jobModel.aggregate().match({name:name}).group({"_id":{name:"$name"},count:{"$sum":1}}).exec(function(err,jobs){
        if(err){
            callback(err);
        }
        callback(null,jobs);
    })
}

Job.getOkYL=function(callback){
    async.waterfall([function(cb){
        jobModel.findOne({type:2,update:0}).sort({_id:1}).exec(function(err,obj){
            cb(err,obj);
        })
    },function(obj,cb){
        jobModel.update({_id:obj._id},{ $set: { update: 1}},{},function(err,obj){
            cb(err,obj)
        })
    }],function(err,obj){
        callback(err,obj);
    })
}

Job.delejob=function(callback){
    jobModel.remove({},function(err){
        callback(err);
    })
}