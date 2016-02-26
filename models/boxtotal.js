/**
 * Created by lifeng on 15/3/11.
 */
//盒子表
var mongoose=require('./mongoosedb');
var async=require('async');
var Schema = mongoose.Schema ;
/**
 * 盒子信息
 * @type {Schema}
 *
 */
var BoxtotalSchema=new Schema({
    online:{type:Number,default:0},    //在线还是离线  0 离线 1 在线
    data:[],
    lastUpTime:Date,            //更新时间
    createTime:Date,
    Tyear:Date                  //2016年统计
},{
    conllection:"Boxtotal"
});



var BoxtotalModel= mongoose.model('Boxtotal',BoxtotalSchema);

function Boxtotal(Boxtotal){
    this.online=Boxtotal.online;
    this.data=Boxtotal.data;
    this.Tyear=Boxtotal.Tyear;
};

module.exports=Boxtotal;

Boxtotal.prototype.save=function(callback){
    var date=new Date();
    var month=date.getMonth()+1+"";
    var day=date.getDate()+"";
    if(month.length<2)month="0"+month;
    if(day.length<2)day="0"+day;
    this.createTime=new Date();
    this.lastUpTime=new Date(date.getFullYear()+"-"+month+"-"+day+" 00:00:00.000Z");
    this.Tyear=new Date(date.getFullYear()+"-01-01 00:00:00.000Z");
    var newBoxtotal=new BoxtotalModel(this);
    newBoxtotal.save(function(err,Boxtotal){
        if(err){
            return callback(err);
        }
        callback(null,Boxtotal);
    });
}

Boxtotal.Model=function(){
    return BoxtotalModel;
}

Boxtotal.update=function(Boxtotal,callback){
    BoxtotalModel.update({_id:Boxtotal._id},Boxtotal,function(err,doc){
        if(err){
            return callback(err);
        }
        callback(null,doc);
    });
}

Boxtotal.find=function(obj,callback){
    BoxtotalModel.find(obj,function(err,docs){
        callback(err,docs);
    });
}

Boxtotal.findOne=function(obj,callback){
    BoxtotalModel.findOne(obj,function(err,doc){
        callback(err,doc);
    });
}

Boxtotal.updateOpt=function(obj,option,callback){
    BoxtotalModel.update(obj,option,{ multi: true },function(err,doc){
        if(err){
            return callback(err);
        }
        callback(null,doc);
    });
}

Boxtotal.getAllBoxtotal=function(callback){
    BoxtotalModel.find({}).exec(function(err,Boxtotals){
      callback(err,Boxtotals)
    })
}
//Boxtotal.updateAndFind=function(callback){
//    BoxtotalModel.update({BoxtotalNumber:{$ne:null}},{"$inc":{"days":1}},null,function(err,Boxtotales){
//        callback(err);
//    });
//}

Boxtotal.updateAndFind=function(callback){
    BoxtotalModel.update({BoxtotalNumber:{$ne:null}},{"$inc":{"days":1}},null,function(err,Boxtotales){
        callback(err);
    });
}

Boxtotal.getOne=function(number,callback){
    BoxtotalModel.findOne({number:number}).exec(function(err,Boxtotal){
        callback(err,Boxtotal);
    })
}

Boxtotal.getOneChange=function(number,callback){
    BoxtotalModel.findOne({number:number}).exec(function(err,Boxtotal){
        callback(err,Boxtotal);
    })
}

Boxtotal.getAll=function(number,callback){
    //console.logs(username);
    var number=number;
    BoxtotalModel.find({number:number}).exec(function(err,Boxtotal){
        //console.logs(Boxtotal.length);
       callback(err,Boxtotal);
   })
}

//
Boxtotal.getBoxtotales=function(numbers,callback){
    var numbers=numbers;
    BoxtotalModel.find({'number':{"$in":numbers}}).exec(function(err,Boxtotal){
        console.log(err);
        console.log(Boxtotal);
        callback(err,Boxtotal);
    })
}

Boxtotal.getUsername=function(username,callback){
    BoxtotalModel.findOne({username:username}).exec(function(err,Boxtotal){
        callback(err,Boxtotal);
    })
}

Boxtotal.getGroup=function(name,_id,callback){
    BoxtotalModel.aggregate().match({name:name}).group({"_id":{name:"$name"},count:{"$sum":1}}).exec(function(err,Boxtotales){
        if(err){
            callback(err);
        }
        callback(null,Boxtotales);
    })
}
//盒子更新系统
Boxtotal.updateGx=function(number,password,updatebb,callback){
    BoxtotalModel.update({number:number},{ $set: { updateBoxtotal: 1,updatepassword:password},updatebb:updatebb},{},function(err,obj){
        callback(err,obj)
     })
}

//用系统天数来更新所有的消息
Boxtotal.updateP=function(callback){
    BoxtotalModel.update({},{percent:0},{ multi: true },function(err){
        callback(err);
    })
}

Boxtotal.prototype.batchsave=function (obj,callback){
    BoxtotalModel.create(obj,function(err,meRecords){
        callback(err,meRecords);
    })
}



