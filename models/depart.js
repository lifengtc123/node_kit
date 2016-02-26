/**
 * Created by lifeng on 15/3/26.
 */
var mongoose=require('./mongoosedb');
var async=require('async');
//mongoose.connect("mongodb://192.168.1.210/lifeng");
var Schema = mongoose.Schema ;

var departSchema=new Schema({
	pid:String,         //父id
	cid:String,         //子id
    name:{type:String,index:true},
    sort:{type:Number,default:0},  //排序
	flag:{type:Number,default:0},  //标志
	createTime:{type:Date},//创建时间
    updateTime:{type:Date}, //更新时间
	contents:String 
},{
    conllection:"departs"
});

departSchema.pre("save",function(next){
    this.updateTime=new Date();
    next();
});

departSchema.pre("update",function(next){
    this.updateTime=new Date();
    next();
});

var departModel= mongoose.model('Depart',departSchema);

function Depart(depart){
    this.name=depart.name;
    this.sort=depart.sort;
    this.pid=depart.pid;
    this.flag = depart.flag;
    this.contents=depart.contents;
    this.createTime=depart.createTime;
    this.updateTime=depart.updateTime;
};

module.exports=Depart;

Depart.prototype.save=function(callback){
 	var depart={
 		pid:this.pid,
 		contents:this.contents,
 		flag:this.flag,
 		name:this.name,
 		sort:this.sort,
 		createTime:new Date(),
	    updateTime:new Date()
 	};
 	async.waterfall([function(cb){
 			if(depart.pid==null)depart.pid="0";
 			departModel.findOne({pid:depart.pid}).sort({cid:-1}).exec(function(err,obj){
 				cb(err,obj);
 			})
 		},function(obj,cb){
 			if(obj==null){
 				depart.cid="0"==depart.pid ? "001" : depart.pid+"001";
 			}else{
 				depart.cid=parseInt(obj.cid)+1+"";
 				
 				while(depart.cid.length<3){
 					depart.cid="0"+depart.cid;
 				}
 			}
 			//console.log("cid:"+depart.cid);
			//console.log(depart.cid.length);
 			var newDepart=new departModel(depart);
 			newDepart.save(function(err,depart){
 				//console.log(err);
	 			cb(err,depart);
	 		});
	 	}],function(err,depart){
             callback(err,depart);
	 	})
 }


/**
 * 根据id查询组织机构
 */
Depart.findOne=function(id,callback){
	departModel.findOne({_id:id}).exec(function(err,departs){
        callback(err,departs);
    })
}

/**
 * 查询所有的组织机构
 */
Depart.findAll=function(callback){
	departModel.find({}).sort({'updateTime':-1}).exec(function(err,departs){
        callback(err,departs);
    })
}

/**
 * 查询组织机构的直接下级机构
 */
Depart.listByDepartId=function(cid,callback){
	departModel.find({pid:cid}).sort({'updateTime':-1}).exec(function(err,departs){
		callback(err,departs);
	})
}

/**
 * 根据组织机构的名字来查询组织机构
 */
Depart.getUsername=function(name,callback){
	departModel.findOne({name:name}).exec(function(err,departs){
        callback(err,departs);
    })
}

Depart.getGroup=function(name,_id,callback){
	departModel.aggregate().match({name:name}).group({"_id":{name:"$name"},count:{"$sum":1}}).exec(function(err,departs){
        if(err){
            callback(err);
        }
        callback(null,departs);
    })
}

/**
 * 查询组织机构的直接下级机构
 */
Depart.findAllPid=function(pid,callback){
	departModel.find({pid:pid,flag:1}).exec(function(err,departs){
        callback(err,departs);
    })
}


/**
 * 根据id来查询组织机构
 */
Depart.getDepartById=function(id,callback){
	departModel.findOne({_id:id}).exec(function(err,depart){
        callback(err,depart);
    })
}


/**
 * 根据pid来查询组织机构
 */
Depart.findOnePid=function(pid,callback){
	departModel.findOne({pid:pid,flag:1}).exec(function(err,departs){
        callback(err,departs);
    })
}

/**
 * 更新组织机构
 */
Depart.findAndUpdate=function(depart,callback){
	departModel.findOneAndUpdate({_id:depart._id},depart,function(err,depart){
        callback(err,depart);
    })
}

/**
 * 删除组织机构
 */
Depart.delete=function(_id,callback) {
	departModel.remove({_id: _id}, function (err, depart) {
        callback(err, depart);
    })
}

/**
 * 批量删除组织机构
 */
Depart.deleteList=function(array,callback) {
	departModel.remove({_id:{$in:array}}, function (err, depart) {
	  callback(err, depart);
    })
}