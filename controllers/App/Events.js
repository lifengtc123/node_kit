/**
 * Created by lifeng on 15/3/13.
 */

var crypto =require("crypto");
var async=require('async');
Message = require("../../models/message.js");
Event = require("../../models/event.js");
Nobility = require("../../models/nobility.js");
Box=require("../../models/box.js");
function Events(app){

}

module.exports=Events;

Events.list=function(req,res){
    res.send("开发中");
}

Events.getCountByUser=function(req,res){
    var eventobj={
        nobility:req.param("userid"),
        boxids:[],
        createTime:req.param("ViewTime")
    }
    var boxNumbers=req.param("boxIds");
    for(var i=0;i<boxNumbers.length;i++){
        eventobj.boxids.push(boxNumbers[i]);
    }
    var count=0;
    Event.getCountByName(eventobj,function(err,event){
        //console.logs("查询Eventcc查询中"+event.length);
        if(event!=null&&event.length>0){
            count=event.length;
        }
        res.end(JSON.stringify(count));
    });
}

Events.getTenList=function(req,res){
    var eventobj={
        nobility:req.param("userid"),
        createTime:req.param("createTime"),
        boxids:[]
    }
    Nobility.getUserId(eventobj.nobility,function(err,nobility){
        if(nobility){
          if(nobility.boxIds!=null&&nobility.boxIds.length>0){
              eventobj.boxids=nobility.boxIds;
              Event.getTenList(eventobj,function(err,event){
                res.json(event);
            });
          }else{
            res.json({});
          }
        }else{
            res.json({});
        }
    })

}
Events.getHistoryList=function(req,res){
    var page = req.param("page");
    var pageSize = req.param("pageSize");
    var firstsize = req.param("firstsize");
    var userid=req.param("userid");
    Nobility.getUserId(userid,function(err,nobility){
        if(nobility){
           if(nobility.boxIds.length>0){
            var boxids=nobility.boxIds;

            Event.getHistoryList(boxids,userid,page,pageSize,firstsize,function(err,event){
                //console.logs(event);
                res.json(event);
            });
          }else{
               res.json({});
           }
        }else{
          res.json({});
        }
    });
}


Events.saveMes=function(req,res){
    var obj={
        name:req.param("name"),
        style:req.param("isXZ"),
        color:req.param("isYS"),
        boxNumber:req.param("boxNumber"),
        type:req.param("type"),
        messageNo:req.param("cishu"),
        ywNo:req.param("meici"),
        jiange:req.param("jiange"),
        filepath:req.param("filepath"),
        messageTime:[]
    }
    var times=req.param("times");

    for(var i=0;i<times.length;i++){

        obj.messageTime.push(times[i].value);
    }
    var message=new Message(obj);
    message.save(function(err,mes){
        //创建下发给box的数据
        if(!err){
            var times=[];
            for(var i=0;i<mes.messageTime.length;i++){
                var datatime=mes.messageTime[i];
                var data=mes.createTime;
                var month=data.getMonth() + 1+"";
                var day=data.getDate()+"";
                if(month.length<2)month="0"+month;
                if(day.length<2)day="0"+day;
                var odata=data.getFullYear()+"-"+month+"-"+ day+"T"+datatime;
                times.push(odata);
            }
            var jobobj={
                boxNumber:mes.boxNumber,
                type:1,    //定时任务
                id:1,     //id暂定  需要查询数据
                state:0,
                interval:mes.jiange*24*60,
                times:times,
                filepath:mes.filepath
            }

            var jonmodel=new Job(jobobj);
            jonmodel.save(function(err,obj){
                //console.logs(obj);
                res.json(mes);
            });
        }
    })
}

Events.saveEvent=function(req,res){
    var obj={
        type:req.param("type"),
        content:req.param("content")?req.param("content"):"",
        filepath:req.param("filepath"),
        time:req.param("time")?req.param("time"):"0",
        image:req.param("image"),
        boxNumber:req.param("boxNumber"),
        userid:req.param("userid")
    }
    async.waterfall([function(callback){
        var boxNumber= obj.boxNumber;
        if(boxNumber!=null){
            Box.getOne(boxNumber,function(err,box){
                callback(err,box);
            })
        }else{
            callback(null,null);
        }

    },function(b,callback){
        if(b!=null){
	         var jobid=b.boxLastJobId2;
	        if(b.boxLastJobId2==null||b.boxLastJobId2==255){
	            b.boxLastJobId2==100;
	        }else{
	            b.boxLastJobId2++;
	        }
	        Box.update(b,function(err){
	            // console.logs(err);
	            callback(err,{boxName: b.name,proid:jobid});
	        })
        }else{
           callback(null,null);
        }
    },function(c,callback){
	     if(c!=null){
	        obj.boxName=c.boxName;
	        obj.proid= c.proid;
	        var event=new Event(obj);
	        event.saveEvent(function(err,event){
	            callback(err,{filepath:event.filepath,time:event.time,boxNumber:event.boxNumber,proid:event.proid,event:event});
	        })
	      }else{
           callback(null,null);
          }
    },function(d,callback){
	    if(d!=null){
		     var jobobj={
	            boxNumber:d.boxNumber,
	            type:0,
	            id: d.proid,
	            state:0,
	            filepath: d.filepath
	        }
	        var job=new Job(jobobj);
	        job.save(function(err,obj){
	            callback(err, d.event);
	        })
	    }else{
           callback(null,null);
          }
    }],function(err,obj){    //查到盒子
        res.json(obj);
    })
}

Events.create=function(req,res){
    res.send("开发中");
}

Events.save=function(req,res){
    res.send("开发中");
}

Events.blank=function(req,res){
    res.send("开发中");
}

Events.show=function(req,res){
    res.send("开发中");
}

Events.detail=function(req,res){
    res.send("开发中");
}
