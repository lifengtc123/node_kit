var mongoose=require('./mongoosedb');
var async=require('async');
//mongoose.connect("mongodb://192.168.1.210/lifeng");
var Schema = mongoose.Schema ;

var userSchema=new Schema({
	name:{type:String,index:true,unique:true},
	password:String,
	login:{type:Number,default:0},
	username:{type:String,index:true},
    createTime:{type:Date},//创建时间
    updateTime:{type:Date}, //更新时间
    roleId:{
        type:Schema.ObjectId,
        ref : 'Role'
    },
    departId:{
        type:Schema.ObjectId,
        ref : 'Depart'
    }

},{
	conllection:"users"
});


userSchema.pre("save",function(next){
    this.updateTime=new Date();
    next();
});

userSchema.pre("update",function(next){
    this.updateTime=new Date();
    next();
});

 var userModel= mongoose.model('User',userSchema);

 function User(user){
 	this.obj=user;

 };

module.exports=User;

 User.prototype.save=function(callback){

 	var newUser=new userModel(this.obj);
     newUser.createTime=new Date();
 	newUser.save(function(err,user){
 		if(err){
 			return callback(err);
 		}
 		callback(null,user);
 	});
 }

User.Model=function(){
    return userModel;
}

 User.getOne=function(username,password,callback){
 	userModel.findOne({username:username,password:password}).exec(function(err,user){
 		callback(err,user);
 	})
 }

 User.getUsername=function(username,callback){
 	userModel.findOne({username:username}).exec(function(err,user){
 		callback(err,user);
 	})
 }

User.getList=function(where,fields,options,callback){
    userModel.find(where,fields,options).exec(function(err,users){
        callback(err,users);
    })
}

User.getCount=function(where,callback){
    userModel.count(where,function(err,totals){
        callback(err,totals);
    })
}

 User.getGroup=function(name,_id,callback){
 	userModel.aggregate().match({name:name}).group({"_id":{name:"$name"},count:{"$sum":1}}).exec(function(err,users){
 		if(err){
 			callback(err);
 		}
 		callback(null,users);
 	})
 }

User.getPagedList=function(pagedList,search,searchField,orderBy,order,condition,where,callback){
    pagedList.query(["name","number"],search,searchField,orderBy,order,condition,where);
    userModel.execPageQuery(pagedList.pageNumber,pagedList.pageSize,pagedList.where,null,pagedList.sort,['roleId','departId'],function(err,objs){
        pagedList.data=objs.rows;
        pagedList.pageCount=parseInt(objs.total/pagedList.pageSize)+1;
        pagedList.setTotal(objs.total);
        callback(err,pagedList);
    });
}

