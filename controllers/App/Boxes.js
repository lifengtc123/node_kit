/**
 * Created by wbb on 15/6/5.
 */
/*
 * GET home page.
 */
var crypto =require("crypto");
var async=require('async');
Box = require("../../models/box.js");
Job=require("../../models/job.js");
Firmware=require("../../models/firmware.js");
Nobility=require("../../models/nobility.js");
Message=require("../../models/message.js");
MeRecord=require("../../models/meRecord.js");
Medications=require("../../models/medication.js");
var fs=require("fs");

function Boxes(app){

}

module.exports=Boxes;

Boxes.chart=function(req,res){
    res.render("Boxes/chart",{action:'boxes',user:req.session.user});
}

Boxes.getOne=function(req,res){
    var number=req.body.boxid.toLowerCase();
    Box.getOne(number,function(err,box){
        res.json(box);
    })
}
//huo
Boxes.getOneAndBind=function(req,res){
    var number=req.param("number").toLowerCase();
    var userid=req.param("userid");
    Box.getOne(number,function(err,box){
        if(box){
            Nobility.getUserId(userid,function(err,nobility){
                if(nobility){
                   if(nobility.boxIds.length<=0){
                       nobility.boxIds.push(number);
                       nobility.lastboxid=number;
                       Nobility.update(nobility,function(err){
                           res.json({type:0})
                       })
                   }else{
                       var json=true;
                       for(var i=0;i<nobility.boxIds.length;i++){
                           if(nobility.boxIds[i]==number){
                               json=false;
                               break;
                           }
                       }
                       if(json==true){
                           nobility.boxIds.push(number);
                           nobility.lastboxid=number;
                           Nobility.update(nobility,function(err){
                               res.json({type:0})
                           })
                       }else{
                           res.json({type:1})
                       }
                   }
                }
            })
        }else{
            res.json({type:2});
        }
    })
}

Boxes.getOneChange=function(req,res){
    var number=req.body.boxid;
    var userid=req.body.userid;
    Nobility.updatelastboxid(userid,number,function(err){
        Box.getOneChange(number,function(err,box){
            res.json(box);
        })
    })
}

Boxes.getBoxList=function(req,res){
    var boxNumbers=req.body.boxNumbers;
    Box.getBoxes(boxNumbers,function(err,boxes){
        res.json(boxes);
    });
}

//当前ip下是否有未绑定的盒子
Boxes.getBoxNoBd=function(req,res){
    var ip=req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    Box.Model().find({ip:{$regex:ip, $options:'i'}},function(err,datas){
        var i=0;
        var boxNoBd=[];
        async.whilst(function(){
            return i<datas.length;
        },function(cb){
            
            Nobility.findOne({boxIds:datas[i].number},function(err,nob){
                if(err==null&&nob==null){
                    boxNoBd.push(datas[i]);
                }
                i++;
                cb(err);
            })
        },function(err){
            res.json(boxNoBd);
        });
    });
}

//根据用户账号,微信账号,账户id查询
Boxes.getlist=function(req,res){
    var obj={
        userid:req.param("userid")
    }
    var boxIds=[];
    Nobility.getUsername(obj,function(err,user){
        if(user!=null){
            for(var i=0;i<user.boxIds.length;i++){
                boxIds.push(user.boxIds[i]);
            }
            if(boxIds.length>0){
                Box.getBoxes(boxIds,function(err,boxes){
                    res.json(boxes);
                });
            }else{
                res.json([]);
            }
        }else{
            res.json([]);
        }
    });
}

//智能模式绑定盒子，请求盒子序列号
Boxes.newboxcon=function(req,res){
    var boxnumber=req.param("mac");
    Box.getOne(boxnumber,function(err,box){
        if(box==null){   //如果没有盒子  则创造一个盒子数据
            var md5=crypto.createHash('md5');
            password=md5.update(boxnumber).digest('hex');

            var boxobj={
                number:boxnumber,
                key:password.substr(10,12),
                ip:""
            }
            var box=new Box(boxobj);
            box.save(function(err,obj){
                res.send(obj.key);
            })
        }else{          
        	//如果有盒子，则把盒子的信息保存下来
        	
                        
                                 res.send(box.key);
                   
        }
    })
}


//保存用户对盒子的信息
Boxes.savebox=function(req,res){
    var obj=req.body;
    var dirpath='./public/vv-box/'+obj.boxNumber;   //文件夹路径
    var filename=req.files.file.name;
    if (!fs.existsSync(dirpath)) {
        fs.mkdirSync(dirpath);
    }
    var target_path='./public/vv-box/'+obj.boxNumber+"/"+req.files.file.name;

    fs.renameSync(req.files.file.path,target_path);
    var boxnumber=obj.boxNumber;
    Box.getOne(obj.boxNumber,function(err,boxobj){
        if(boxobj!=null&&boxobj!=""){   //如果已经有盒子
        var reset=boxobj.reset;
        boxobj.filepath=target_path.replace("./public","");
        boxobj.name=obj.name;
        boxobj.image=obj.image;
        boxobj.online=1;
        boxobj.times=0;
        boxobj.percent=0;
        boxobj.lastUpTime=new Date();
            boxobj.reset=1;  //重置清除盒子提醒
            async.series([
                function(cb){
                    Nobility.updateOpt({boxIds:boxobj.number},{$pull:{boxIds:boxobj.number}},function(err) {  //解除绑定用户
                        cb(err,null);
                    })
                },function(cb){
                    //Message.remove({boxNumber:boxobj.number},function(err) {   //删除所有定时提醒
                    //    cb(err,null);
                    //});
                    //更新所有该盒子的提醒，设置为删除
                    Message.updateByList({boxNumber:boxobj.number},{mtype:2},function(err){
                        cb(err,null);
                    })
                },function(cb){
                    var data=new Date();
                    var month=data.getMonth()+1+"";
                    var day=data.getDate()+"";
                    if(month.length<2)month="0"+month;
                    if(day.length<2)day="0"+day;
                    var warntime=data.getFullYear()+"-"+month+"-"+ day;
                    //2016-02-03添加一个reset,删除的时候创建一条新的 当然纪录
                    if(reset==1){
                        cb(err,null);
                    }else{
                        MeRecord.updateByList({boxNumber:boxobj.number},{dtype:1},function(err){
                            var obj={
                                retimes:0,
                                donetimes:0,
                                remindDate:warntime,
                                boxNumber:boxobj.number,
                                dtype:0
                            }
                            var merecord=new MeRecord(obj);
                            merecord.save(function(err,mers){
                                cb(err,null);
                            })
                        })
                    }
                    //MeRecord.remove(boxobj.number,warntime,function(err){
                    //    cb(err,null);
                    //})
                },function(cb){
                    Medications.updatearray({boxNumber:boxobj.number},{dtype:1},function(err){
                        cb(err,null);
                    })
                },function(cb){
                    Job.Model().remove({boxNumber:boxobj.number,update:0},function(err){
                        cb(err,null);
                    })
                }
            ],function(err,values){
                Box.update(boxobj,function(err){
                    console.log(obj.nobility);   //15258284638
                    Nobility.getById(obj.nobility,function(err,obj){
                        if(obj!=null){
                            var cole=false;
                            for(var i=0;i<obj.boxIds.length;i++){
                                if(obj.boxIds[i]==boxobj.number){
                                    cole=true;
                                    break;
                                }else{
                                    cole=false;
                                }
                            }
                            if(cole==false){
                                if(obj.boxIds==null){
                                    obj.boxIds=[];
                                }
                                obj.boxIds.push(boxobj.number);
                            }
                            obj.lastboxid=boxobj.number;
                            Nobility.update(obj,function(err){
                                res.json("success");
                            })
                        }else{
                            res.json("error");
                        }
                    });
                })
            })
        }else{   //如果AP模式第一次连接盒子 则创建盒子
            var md5=crypto.createHash('md5');
            password=md5.update(boxnumber).digest('hex');
            var boxobj={
                number:boxnumber,
                key:password.substr(10,12),
                ip:"",
                filepath:target_path.replace("./public",""),
                name:obj.name,
                image:obj.image,
                online:1,
                lastUpTime:new Date(),
                nobilityid:obj.nobility
            }
            var box=new Box(boxobj);
            box.save(function(err,boxobj){
                Nobility.getById(obj.nobility,function(err,obj){
                    if(obj!=null){
                        var cole=false;
                        for(var i=0;i<obj.boxIds.length;i++){
                            if(obj.boxIds[i]==boxobj.number){
                                cole=true;
                                break;
                            }else{
                                cole=false;
                            }
                        }
                        if(cole==false){
                            if(obj.boxIds==null){
                                obj.boxIds=[];
                            }
                            obj.boxIds.push(boxobj.number);
                        }
                        obj.lastboxid=boxobj.number;
                        Nobility.update(obj,function(err){
                            res.json("success");
                        })
                    }else{
                        res.json("error");
                    }
                });
            })
        }
    })
}


//保存盒子信息
Boxes.saveInfo=function(req,res){
    var box={
      _id:req.param("_id"),
       name:req.param("name")
    }
    Box.update(box,function(err){
       if(err){
           res.json({type:0});
       }else{
           res.json({type:1});
       }
    })
}

//保存盒子信息
Boxes.updatebox=function(req,res){
    var boxs=req.param("upboxs");
    console.log(boxs);
    for(var i=0;i<boxs.length;i++){
        Box.update(boxs[i],function(err){

        })
    }
    res.json({success:"success"});
}

