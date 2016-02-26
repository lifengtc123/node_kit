var mongoose=require('./mongoosedb');
var async=require('async');
//mongoose.connect("mongodb://192.168.1.210/lifeng");
var Schema = mongoose.Schema ;

var menuSchema=new Schema({
	pid:String,
	cid:String,
	name:String,
	url:{type:String,index:true},
	icon:String,
	target:String,
	sort:{type:Number,default:0},
	flag:{type:Number,default:0},
    createTime:{type:Date},//创建时间
    updateTime:{type:Date}, //更新时间
    rolcontrol:[Schema.Types.Mixed]
},{
	conllection:"menus"
});

menuSchema.pre("save",function(next){
    this.updateTime=new Date();
    next();
});

menuSchema.pre("update",function(next){
    this.updateTime=new Date();
    next();
});


 var menuModel= mongoose.model('Menu',menuSchema);

 function Menu(menu){
 	this.pid=menu.pid,
 	this.url=menu.url;
 	this.icon=menu.icon;
 	this.target=menu.target;
 	this.name=menu.name;
 	this.sort=menu.sort;
 	this.flag=menu.flag;
 };

module.exports=Menu;

 Menu.prototype.save=function(callback){
 	var menu={
 		pid:this.pid,
 		url:this.url,
 		icon:this.icon,
 		target:this.target,
 		flag:this.flag,
 		name:this.name,
 		sort:this.sort
 	};

 	
 	async.waterfall([
 		function(cb){
 			if(menu.pid==null)menu.pid="0";
 			menuModel.findOne({pid:menu.pid}).sort({cid:-1}).exec(function(err,obj){
 				cb(err,obj);
 			})
 		},function(obj,cb){
 			if(obj==null){
 				menu.cid="0"==menu.pid ? "001" : menu.pid+"001";
 			}else{
 				menu.cid=parseInt(obj.cid)+1+"";
 				console.log(menu.cid);
 				console.log(menu.cid.length);
 				while(menu.cid.length<3){
 					menu.cid="0"+menu.cid;
 				}
 			}
 			var newMenu=new menuModel(menu);
 			newMenu.save(function(err,menu){
 				console.log(err);
	 			cb(err,menu);
	 		});
	 	}],function(err,menu){
	 		callback(err,menu);
	 	})
 }

Menu.Model=function(){
    return menuModel;
}

 Menu.getOne=function(username,password,callback){
 	menuModel.findOne({username:username,password:password}).exec(function(err,menu){
 		callback(err,menu);
 	})
 }

 Menu.getList=function(where,fields,options,callback){
 	menuModel.find(where,fields,options).exec(function(err,menus){
 		callback(err,menus);
 	})
 }

 Menu.delete=function(_id,callback){
 	menuModel.remove({_id:_id},callback(err,option))
 }

 Menu.getGroup=function(name,_id,callback){
 	menuModel.aggregate().match({name:name}).group({"_id":{name:"$name"},count:{"$sum":1}}).exec(function(err,users){
 		if(err){
 			callback(err);
 		}
 		callback(null,users);
 	})
 }

 Menu.getCount=function(obj,callback){
 	 menuModel.count(obj,function(err,count){
 	 	callback(err,count);
 	 })
 }