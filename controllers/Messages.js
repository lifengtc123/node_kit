/**
 * Created by lifeng on 15/3/13.
 */

var crypto =require("crypto");
var filter=require("./filter");
var async=require('async');
Message = require("../models/message.js");
Box = require("../models/box.js");

function Messages(app){
    app.post("/Messages/getCount",Messages.getCount);
    app.post("/Messages/getList",Messages.getList);
    app.post("/Messages/saveMes",Messages.saveMes);
}

module.exports= Messages;

Messages.index= function (req,res) {
    res.render("Messages/index", {
        title: '提醒管理',
        user:req.session.user,
        menus_left:"/messages/left",
        menus_list:"/messages/list"
    });
}


Messages.left=function(req,res){
    async.waterfall([function (callback) {
        Box.getAllBox(function (err,boxs) {
            callback(err,boxs);
        })
    }], function (err,boxs) {
        if(boxs==null){
            boxs=[];
        }
        res.render("Messages/left",{
            title:'盒子列表',
            user:req.session.user,
            boxs:boxs
        });
    })
}

Messages.list=function(req,res){
    async.waterfall([function (callback) {
        Message.findAll(function (err,messages) {
            callback(err,messages);
        })
    }], function (err,messages) {
        res.render("Messages/list",{
            title:'提醒列表',
            user:req.session.user,
            messages:messages,
            success:req.flash('success'.toString()),
            error:req.flash('error'.toString())
        });
    })
}

//通过小盒ID查找消息列表
Messages.listByBoxId= function (req,res) {
    var boxnumber=req.param("boxnumber");
    async.waterfall([function (callback) {
        Message.getMessageByBoxNumber(boxnumber,{},function (err,messages) {
            callback(err,messages);
        })
    }], function (err,messages) {
        res.render("Messages/list",{
            title:'提醒列表',
            user:req.session.user,
            messages:messages,
            success:req.flash('success'.toString()),
            error:req.flash('error'.toString())
        })
    })
}

Messages.getCount=function(req,res){
    //console.logs(123);
    var lastboxid=req.body.lastboxid;
    var uncount=0;
    Box.getOne(lastboxid,function(err,messages){
        if(messages!=null){
            var messageids=messages.messageid;
            for(var i=0;i<messageids.length;i++){
                if(messageids[i].mtype==0){
                    uncount=uncount+1;
                }
            }
        }
            res.end(JSON.stringify(uncount));
    });
}

Messages.getList=function(req,res){
    //console.logs(123);
    var lastboxid=req.body.lastboxid;
    var messages=[]
    Box.getOne(lastboxid,function(err,message){
        if(message!=null){
            var messageids=message.messageid;
            for(var i=0;i<messageids.length;i++){
                if(messageids[i].mtype==0){
                    messages.push(message);
                }
            }
        }
        res.end(JSON.stringify(messages));
    });
}

Messages.saveMes=function(req,res){
    var obj={
        name:req.param("name"),
        style:req.param("isXZ"),
        color:req.param("isYS"),
        boxNumber:req.param("boxNumber"),
        type:req.param("type"),
        messageNo:req.param("cishu"),
        ywNo:req.param("meici"),
        jiange:req.param("jiange"),
        times:[]
    }

    var times=req.param("times");
    for(var i=0;i<times.length;i++){
        obj.times.push(times.value);
    }
    var message=new Message(obj);
    message.save(function(err,mes){
        res.json(mes);
    })
}


Messages.create=function(req,res){
    res.send("开发中");
}

Messages.save=function(req,res){
    res.send("开发中");
}

Messages.blank=function(req,res){
    res.send("开发中");
}

Messages.show=function(req,res){
    res.send("开发中");
}

Messages.detail=function(req,res){
    res.send("开发中");
}

