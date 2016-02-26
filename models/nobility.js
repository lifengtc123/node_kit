/**
 * Created by lifeng on 15/3/11.
 * app用户
 */
var mongoose=require('./mongoosedb');
var async=require('async');
var Schema = mongoose.Schema ;

var nobilitySchema=new Schema({
    name:{type:String,index:true},   //姓名
    password:String,                //密码
    sex:{type:Number,default:0},    //性别
    username:{type:String,index:true},   //用户名、手机号
    weixin:{type:String,index:true},  //微信账号绑定
    age:{type:String},  //年龄
    boxIds:{type:Array},  //关联的盒子
    lastboxid:String,      //最后查看的盒子
    openid:{type:String,index:true},   //微信账号的openid
    phoneuuid:{type:String},     //登陆的手机设备UUID
    area:{type:String},
    volume:{type:String}, //音量大小0-8;
    unionid:{type:String,index:true}, //微信的唯一识别
    language:{type:String},//客户语言版本
    boxtime:{type:Number,default:0},//作为客户首次创建盒子的记录,出引导
    createTime:{type:Date},//创建时间
    updateTime:{type:Date}, //更新时间
    image:{type:String,default:"images/head.jpg"}
},{
    conllection:"nobility"
});


nobilitySchema.pre("save",function(next){
    this.updateTime=new Date();
    this.createTime=new Date();
    next();
});

nobilitySchema.pre("update",function(next){
    this.updateTime=new Date();
    next();
});


var nobilityModel= mongoose.model('Nobility',nobilitySchema);

function Nobility(nobility){
    this.name=nobility.name;
    this.password=nobility.password;
    this.username=nobility.username;
    this.area=nobility.area;
    this.weixin=nobility.weixin;
    this.age=nobility.age;
    this.language=nobility.language;
    this.lastboxid=nobility.lastboxid;
    this.unionid=nobility.unionid;
    this.phoneuuid=nobility.phoneuuid;
    this.openid=nobility.openid;
    this.volume=nobility.volume;
};

module.exports=Nobility;



Nobility.prototype.save=function(callback){
    var newNobility=new nobilityModel(this);
    newNobility.save(function(err,nobility){
        if(err){
            callback(err);
        }
        callback(null,nobility);
    });
}

Nobility.find=function(obj,callback){
    nobilityModel.find(obj,function(err,nobilitys){
        callback(err,nobilitys);
    })
}

Nobility.findOne=function(obj,callback){
    nobilityModel.findOne(obj,function(err,nobilitys){
        callback(err,nobilitys);
    })
}

//根据条件更新数据
Nobility.updateOpt=function(obj,data,callback){
    nobilityModel.update(obj,data,{ multi: true },function(err){
        callback(err);
    });
}
//更新用户并且返回信息
Nobility.FindOneUpdate=function(obj,callback){
    nobilityModel.findOneAndUpdate({_id:obj._id},obj,function(err,nobility){
        callback(err,nobility);
    })
}
////根据PhoneUuid更新用户并且返回信息
//Nobility.FindPhoneUUIDAndUpdate=function(obj,callback){
//    nobilityModel.findOneAndUpdate({phoneuuid:obj.phoneuuid},obj,function(err,nobility){
//        callback(err,nobility);
//    })
//}
//修改账户
Nobility.update=function(nobility,callback){
    nobilityModel.update({_id:nobility._id},nobility,function(err){
       callback(err);
    });
}
//删除账户
Nobility.delete=function(id,callback){
    nobilityModel.remove({_id:id}, function (err, courseware) {
        callback(err, courseware);
    })
}

//修改密码
Nobility.updatePassword=function(username,password,callback){
    nobilityModel.update({username:username},{password:password},function(err,doc){
        if(err){
             callback(err);
        }
        callback(null,doc);
    });
}
//通过用户账号更新最后一个盒子
Nobility.updatelastboxid=function(userid,lastboxid,callback){
    nobilityModel.update({_id:userid},{lastboxid:lastboxid},function(err,doc){
        if(err){
             callback(err);
        }
        callback(null,doc);
    });
}
//根据ID获取用户信息
Nobility.getUserId=function(id,callback){
    nobilityModel.findOne({_id:id},function(err,nobility){
        callback(err,nobility);
    });
}
//确认盒子与该用户是否已经绑定
Nobility.checkNumber=function(id,number,callback){
    nobilityModel.findOne({_id:id,boxids:{$ne:number}},function(err,nobility){
        //console.logs(err);
        callback(err,nobility);
    });
}
//根据账号密码获取用户信息
Nobility.getOne=function(username,password,callback){
    nobilityModel.findOne({username:username,password:password}).exec(function(err,nobility){
        callback(err,nobility);
    });
}
//根据userid查询用户信息
Nobility.getUsername=function(obj,callback){
        nobilityModel.findOne({'_id':obj.userid}).exec(function(err,nobility){
            callback(err,nobility);
        })
}
//根据phoneuuid查询用户信息
Nobility.getPhoneuuid=function(phoneuuid,callback){
    nobilityModel.findOne({'phoneuuid':phoneuuid}).exec(function(err,nobility){
        callback(err,nobility);
    })
}

//根据微信账号获取用户信息
Nobility.FindOpenid=function(openid,callback){
    nobilityModel.findOne({'openid':openid}).exec(function(err,nobility){
        callback(err,nobility);
    })
}

//根据手机ID来查询用户信息
Nobility.FindPhoneUUID=function(phoneuuid,callback){
    nobilityModel.findOne({'phoneuuid':phoneuuid}).exec(function(err,nobility){
        callback(err,nobility);
    })
}

//根据手机id未绑定微信时
Nobility.FindUsername=function(username,callback){
    nobilityModel.findOne({'username':username}).exec(function(err,nobility){
        callback(err,nobility);
    })
}
//根据手机id未绑定微信时
Nobility.FindPhoneUUIDAndUpdate=function(phoneuuid,callback){
    nobilityModel.findOne({'phoneuuid':phoneuuid}).exec(function(err,nobility){
        callback(err,nobility);
    })
}


Nobility.getGroup=function(name,_id,callback){
    nobilityModel.aggregate().match({name:name}).group({"_id":{name:"$name"},count:{"$sum":1}}).exec(function(err,nobilitys){
        if(err){
            callback(err);
        }
        callback(null,nobilitys);
    })
}
//根据微信账号获取用户信息
Nobility.getOpenid=function(openid,callback){
    nobilityModel.findOne({openid:openid}).exec(function(err,nobility){
        callback(err,nobility);
    })
}
//根据用户根据盒子的ID查询对应的用户
Nobility.getBoxid=function(boxid,callback){
    nobilityModel.findOne({boxIds:boxid}).exec(function(err,nobility){
        callback(err,nobility);
    })
}
//根据用户表的_id查询数据
Nobility.getById=function(_id,callback){
    nobilityModel.findOne({_id:_id}).exec(function(err,nobility){
        callback(err,nobility);
    })
}

Nobility.getPagedList= function (pagedList, search, searchField, orderBy, order, condition, where, callback) {
    pagedList.query([],search,searchField,orderBy,order,condition,where);
    nobilityModel.execPageQuery(pagedList.pageNumber,pagedList.pageSize,pagedList.where,null,pagedList.sort, function (err,objs) {
        pagedList.data=objs.rows;
        pagedList.pageCount=parseInt(objs.total/pagedList.pageSize)+1;
        pagedList.setTotal(objs.total);
        callback(err,pagedList);
    });
}