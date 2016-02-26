/**
 * Created by wbb on 15/6/5.
 */

var crypto =require("crypto");
var async=require('async');
Nobility = require("../../models/nobility.js");
Job=require("../../models/job.js");
//Box = require("../../models/box.js");

function Nobilitys(app){

}

module.exports= Nobilitys;


Nobilitys.validate=function(req,res){
    var username=req.body.username;
    if(username){
        Nobility.getUsername(username,function(err,nobility){
            if(err){
                res.json(err);
            }
            res.json(nobility);
        })
    }else{
        res.json(null);
    }
}
//根据手机id查询
Nobilitys.getPhoneuuid=function(req,res){
    var obj={
        language:req.param("language")?req.param("language"):"zh",
        phoneuuid:req.param("phoneuuid"),
        username:"",
        weixin:"",
        openid:"",
        name:"",
        area:"",
        image:"",
        volume:'8',
        password:"",
        age:'',
        unionid:''
    }
    Nobility.FindPhoneUUID(obj.phoneuuid,function(err,nobility){
        if(!nobility){
            var nobility=new Nobility(obj);
            nobility.save(function(err,newnobility){
                res.json(newnobility);
            })
        }else {
            res.json(nobility);
        }
    })
}
//通过userid查询
Nobilitys.getUsername=function(req,res){
    var obj={
        userid:req.param("userid")
    }
    Nobility.getUsername(obj,function(err,nobility){
    console.log(nobility);
        if(err){
            res.json("null");
        }else{
            res.json(nobility);
        }
    })
}
//通过userid查询
Nobilitys.FindUsername=function(req,res){
    var username=req.param("username")
    Nobility.FindUsername(username,function(err,nobility){
        res.json(nobility);
    })
}

//微信登录,查询openid,如果存在则将用户更新，不存在则创建新用户
Nobilitys.FindOpenid=function(req,res){
    var obj={
        username:req.param("username"),
        weixin:req.param("weixin"),
        openid:req.param("openid"),
        name:req.param("name"),
        area:req.param('area'),
        language:req.param("language"),
        sex:req.param("sex"),
        image:req.param("image"),
        unionid:req.param("unionid"),
        volume:'8',
        unionid:req.param('unionid'),
        age:''

    }
    //查找该微信账号是否绑定手机
    Nobility.FindOpenid(obj.openid,function(err,nobility){
        //用户不存在
        if(nobility==null||nobility==""){
            var nobility=new Nobility(obj);
            nobility.save(function(err,newnobility){
                if(err){
                    res.json(err);
                }else{
                    res.json(newnobility);
                }
            })
        }else{
            obj._id=nobility._id;
            //用户存在,更新用户
            Nobility.FindOneUpdate(obj,function(err,nobility){
                res.json(nobility);
            })

        }

    })
}

/**
* 绑定微信过程
*/
Nobilitys.BandWeixin=function(req,res){
    var obj={
        phoneuuid:req.param("phoneuuid"),
        username:req.param("username"),
        weixin:req.param("weixin"),
        openid:req.param("openid"),
        name:req.param("name"),
        area:req.param('area'),
        language:req.param("language"),
        sex:req.param("sex"),
        image:req.param("image"),
        unionid:req.param("unionid"),
        volume:'8'
    }
    async.waterfall([function(callback){
        Nobility.findOne({unionid:obj.unionid},function(err,open){
          callback(err,open);
        })
    },function(open,callback){
        if(open==null||open==""){
            Nobility.FindPhoneUUID(obj.phoneuuid,function(err,nobility){
                callback(err,nobility)
            })
        }else{
        	Nobility.FindPhoneUUID(obj.phoneuuid,function(err,nobility){
        	open.openid=null;
            open.unionid=null;
        	open.save();
                callback(err,nobility)
            })
        }
    },function(nobility,callback){
        if(nobility!=""&&nobility!=null){
            obj._id=nobility._id;
            Nobility.FindOneUpdate(obj,function(err,newNobility){
                callback(err,newNobility)
            })
        }else{
            callback(null,null)
        }
    }],function(err,obj){
        console.log(obj);
        if(err){
            res.json(err);
        }else{
            res.json(obj);
        }
    })
}


Nobilitys.checkNobility=function(req,res){
    var username=req.body.username;
    var md5=crypto.createHash('md5');
    var password=md5.update(req.body.password).digest('hex');
    Nobility.getOne(username,password,function(err,nobility){
        if(!err){
            res.json(nobility);
        }else{
            res.json("null");

        }
    })
}

Nobilitys.ChangeNobilitys=function(req,res){
    var obj={
        userid:req.param("userid"),
        number:req.param("number")
    }
    var boxids=[];
    var lastboxNumber;
    Nobility.getUsername(obj,function(err,nobility){
        if(nobility!=null) {
            for (var o = 0; o < nobility.boxIds.length; o++) {
                if (nobility.boxIds[o] != obj.number) {
                    boxids.push(nobility.boxIds[o]);
                }
            }
            if (boxids.length > 0) {
                if (boxids.indexOf(nobility.lastboxid)== -1) {
                    lastboxNumber = boxids[0];
                }else {
                    if(nobility.lastboxid==obj.number){
                        lastboxNumber = boxids[0];
                    }else{
                        lastboxNumber=nobility.lastboxid;
                    }
                }
            } else{
                lastboxNumber="";
            }


        }
        var nob={
            _id:nobility._id,
            boxIds:boxids,
            lastboxid:lastboxNumber
        }
        Nobility.update(nob,function(err){
            res.json("");
        })
    })

}

Nobilitys.saveMes=function(req,res){
    var phoneuuid=req.param("phoneuuid");
    var obj={
        username:req.param("username"),
        password:req.param("password"),
        volume:'8'
    }
    var md5=crypto.createHash('md5');
    obj.password=md5.update(obj.password).digest('hex');
    if(phoneuuid!=null){
        Nobility.getPhoneuuid(phoneuuid,function(err,nobility){
            if(nobility!=null){
                nobility.username=obj.username;
                nobility.password=obj.password;
                Nobility.update(nobility,function(){
                    res.json(nobility);
                })
            }else{
                obj.phoneuuid=phoneuuid;
                var nobility=new Nobility(obj);
                nobility.save(function(err,nobility){
                    res.json(nobility);
                })
            }
        })
    }else{
        var nobility=new Nobility(obj);
        nobility.save(function(err,nobility){
            res.json(nobility);
        })
    }

}

Nobilitys.updateNobility=function(req,res){
    var obj={
        _id:req.param("_id"),
        weixin:req.param("weixin"),
        openid:req.param("openid"),
        unionid:req.param("unionid"),
        name:req.param("name"),
        area:req.param('area'),
        language:req.param("language"),
        sex:req.param("sex"),
        age:req.param("age"),
        image:req.param("image"),
        volume:req.param("volume")
    }
    async.waterfall([function(callback){
        Nobility.getUserId(obj._id,function(err,nobility){
            callback(err,nobility);
        })
    },function(nobility,callback){
          if(nobility!=null&&obj.volume!=null&&nobility.volume!=obj.volume){
                var jobs=[];
                for(var i=0;i<nobility.boxIds.length;i++){
                    var jobobj={
                        boxNumber:nobility.boxIds[i],
                        type:2,    //定时任务
                        id:nobility.boxIds[i].proid,     //id暂定  需要查询数据
                        hole:obj.volume    //孔 0 无孔 1 小孔 2 大孔
                    }
                    jobs.push(jobobj);
              }
                Job.savelist(jobs,function(err,mes){
                    callback(err,obj)
                });
            }else{
              if(obj.volume==null||obj.volume==""){
             	obj.volume=8;
              }
              callback(null,obj);
            }
    },function(noobj,callback){
        Nobility.update(noobj,function(err){
            callback(err,noobj);
        })
    }],function(err,obj){
    
    	if(err){
    		res.json(err);
    	}else{
    		res.json(obj);
    	}
    })
    //Nobility.getUserId(obj._id,function(err,nobility){
    //    if(nobility){
    //        if(nobility.volume!=obj.volume){
    //            var jobs=[];
    //            for(var i=0;i<nobility.boxIds.length;i++){
    //                var jobobj={
    //                    boxNumber:nobility.boxIds[i],
    //                    type:2,    //定时任务
    //                    id:nobility.boxIds[i].proid,     //id暂定  需要查询数据
    //                    hole:obj.volume    //孔 0 无孔 1 小孔 2 大孔
    //                }
    //                jobs.push(jobobj);
    //            }
    //            Job.savelist(jobs,function(err,mes){
    //                Nobility.update(obj,function(err){
    //                    res.json("");
    //                })
    //            });
    //        }else{
    //            Nobility.update(obj,function(err){
    //                res.json("");
    //            })
    //        }
    //
    //
    //    }
    //})
}

//绑定小盒账号，新账号和老账号数据整合
Nobilitys.bdNobility=function(req,res){
    var olddata=req.param("olddata");
    var newdata=req.param("newdata");
    olddata.phoneuuid=newdata.phoneuuid;
    //if(olddata.boxIds!=null||newdata.boxIds!=null){
         if(olddata.boxIds==null||olddata.boxIds.length<=0){
             olddata.boxIds=newdata.boxIds;
         }else if(newdata.boxIds!=null&&newdata.boxIds.length>0){
             for(var i=0;i<newdata.boxIds.length;i++){
                 var co=false;
                 for(var j=0;j<olddata.boxIds.length;j++){
                     if(olddata.boxIds[j]==newdata.boxIds[i]){
                         co=false;
                         break;
                     }else{
                         co=true;
                     }
                 }
                 if(co==true){
                     olddata.boxIds.push(newdata.boxIds[i]);
                 }
             }
         }
    //}
    olddata.lastboxid=newdata.lastboxid?newdata.lastboxid:olddata.lastboxid;
    olddata.language=newdata.language?newdata.language:olddata.language;
    olddata.age=newdata.age?newdata.age:olddata.age;
    if(newdata.weixin!=null){
        olddata.weixin=newdata.weixin;
        if(newdata.unionid!=null){
            olddata.unionid=newdata.unionid;
        }
    }
    olddata.name=newdata.name?newdata.name:olddata.name;
    olddata.sex=newdata.sex?newdata.sex:olddata.sex;
    olddata.volume=newdata.volume?newdata.volume:olddata.volume;
    olddata.area=newdata.area?newdata.area:olddata.area;
    if(olddata.boxtime==null&&newdata.boxtime!=null){
        olddata.boxtime=newdata.boxtime;
    }
    Nobility.update(olddata,function(err){
        if(!err){
            Nobility.delete(newdata._id,function(err,nobility){
                res.json(olddata);
            })
        }else{
            res.json(err);
        }
    })
}

Nobilitys.updateNobility2=function(req,res){
    var id=req.param("_id");
    var username=req.param("username");
    var obj={
        _id:req.param("_id"),
        weixin:req.param("weixin"),
        openid:req.param("openid"),
        name:req.param("name"),
        username:req.param("username"),
        area:req.param('area'),
        language:req.param("language"),
        sex:req.param("sex"),
        age:req.param("age"),
        image:req.param("image"),
        volume:req.param("volume"),
        unionid:req.param("unionid")
    }
    async.waterfall([function(callback){
        Nobility.getUserId(id,function(err,nobility){
            callback(err,nobility);
        })
    },function(nobility,callback){
        if(username!=null&&username!=""&&username!=nobility.username){
            Nobility.FindUsername(username,function(err,nobi){
                if(nobi!=null){
                   obj._id=nobi._id;
                   obj.phoneuuid=nobility.phoneuuid;
                   obj.boxIds=nobi.boxIds;
                   obj.lastboxid=nobility.lastboxid;
                   if(nobility.boxIds.length>0&&nobi.boxIds.length>0){
                        for(var i=0;i<nobility.boxIds.length;i++){
                            var co=false;
                            for(var j=0;j<nobi.boxIds.length;j++){
                                console.log(nobility.boxIds[i]);
                                if(nobi.boxIds[j]==nobility.boxIds[i]){
                                    co=false;
                                    break;
                                }else{
                                    co=true;
                                }
                            }
                            if(co==true){
                                obj.boxIds.push(nobility.boxIds[i]);
                            }
                        }
                   }else if(nobility.boxIds.length>0){
                       obj.boxIds=nobility.boxIds;
                   }
                    Nobility.update(obj,function(err){
                        if(!err){
                            Nobility.delete(id,function(err,nobility){
                                callback(null,obj);
                            })
                        }else{
                            callback(null,null);
                        }
                    })
                }else{
                    Nobility.update(obj,function(err){
                        if(err){
                            callback(err,obj);
                        }else{
                            callback(err,null);
                        }
                    })
                }
            })
        }else{
            Nobility.update(obj,function(err){
                if(err){
                    callback(err,obj);
                }else{
                    callback(err,null);
                }

            })
        }
    }],function(err,obj){
        res.json(obj);
    })
}