/**
 * Created by lifeng on 15/3/11.
 */
//声音表
var mongoose=require('./mongoosedb');
var async=require('async');
var Schema = mongoose.Schema ;


/**
 * 盒子信息
 * @type {Schema}
 *
 */
var sysmusicSchema=new Schema({
    number:{type:String,index:true},   //声音编号
    filepath:{type:String},  //声音地址
    updatebb:String     //更新的版本号,
},{
    conllection:"filepath"
});



var sysmusicModel= mongoose.model('Sysmusic',sysmusicSchema);

function Sysmusic(sysmusic){
    this.number=sysmusic.number;
    this.filepath=sysmusic.filepath;
};

module.exports=Sysmusic;

Sysmusic.prototype.save=function(callback){

    var newSysmusic=new sysmusicModel(this);

    newSysmusic.save(function(err,sysmusic){
        if(err){
            return callback(err);
        }
        callback(null,sysmusic);
    });
}


Sysmusic.update=function(sysmusic,callback){
    sysmusicModel.update({_id:box._id},box,function(err,doc){
        if(err){
            return callback(err);
        }
        callback(null,doc);
    });
}


Sysmusic.getOne=function(number,callback){
    sysmusicModel.findOne({number:number}).exec(function(err,sysmusic){
        callback(err,sysmusic);
    })
}

Sysmusic.getUsername=function(username,callback){
    sysmusicModel.findOne({username:username}).exec(function(err,sysmusic){
        callback(err,sysmusic);        callback(err,ssssysmusic);

    })
}

Sysmusic.getGroup=function(name,_id,callback){
    sysmusicModel.aggregate().match({name:name}).group({"_id":{name:"$name"},count:{"$sum":1}}).exec(function(err,sysmusics){
        if(err){
            callback(err);
        }
        callback(null,sysmusics);
    })
}



