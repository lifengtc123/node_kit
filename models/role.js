/**
 * Created by lifeng on 15/3/26.
 */
var mongoose=require('./mongoosedb');
var async=require('async');
//mongoose.connect("mongodb://192.168.1.210/lifeng");
var Schema = mongoose.Schema ;

var roleSchema=new Schema({
    name:{type:String,index:true},
    sort:Number,
    menu:{},
    value:{type:String,index:true},
    creator:{
        creatorid:String,
        creatorName:String
    },//创建人
    roleControl:[String],
    createTime:{type:Date},//创建时间
    updateTime:{type:Date}, //更新时间
    flag:{type:Number,default:0}
},{
    conllection:"roles"
});

roleSchema.pre("save",function(next){
    this.updateTime=new Date();
    next();
});

roleSchema.pre("update",function(next){
    this.updateTime=new Date();
    next();
});

var roleModel= mongoose.model('Role',roleSchema);

function Role(role){
    this.name=role.name;
    this.sort=role.sort;
    this.menu=role.menu;
    this.value=role.value;
};

module.exports=Role;

Role.prototype.save=function(callback){
    var newRole=new userModel(this);

    newRole.save(function(err,role){
        if(err){
            return callback(err);
        }
        callback(null,role);
    });
}

Role.Model=function(){
    return roleModel;
}

Role.getOne=function(username,password,callback){
    roleModel.findOne({username:username,password:password}).exec(function(err,role){
        callback(err,role);
    })
}

Role.getUsername=function(username,callback){
    roleModel.findOne({username:username}).exec(function(err,role){
        callback(err,role);
    })
}

Role.getGroup=function(name,_id,callback){
    roleModel.aggregate().match({name:name}).group({"_id":{name:"$name"},count:{"$sum":1}}).exec(function(err,roles){
        if(err){
            callback(err);
        }
        callback(null,roles);
    })
}