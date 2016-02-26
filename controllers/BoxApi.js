/**
 * Created by lifeng on 15/5/9.
 */
var crypto =require("crypto");
var Job = require("../models/job.js");
var fs=require("fs");
var Box=require("../models/box.js");
var Nobility=require("../models/nobility.js");
var Message=require("../models/message.js");
var Medication=require("../models/medication.js");
var MeRecord=require("../models/meRecord.js")
var Firmware=require("../models/firmware.js");
var Event=require("../models/event.js");
var WeixinApplication=require("./weixin/WeixinApplication.js");
var http=require("http");
var qs = require('querystring');  
var request=require("request");
function BoxApi(app){

    app.all('/database/:value?',BoxApi.index);

    app.all('/boxapi/:boxNumber/:password/:filename',function(req,res){
    console.log(req.param("filename"));
        Box.getOne(req.param("boxNumber").toLowerCase(),function(err,box){

            if(box&&box.updatebox==1&&box.updatepassword==req.param("password")){
                fs.readFile("./firmware/"+req.param("filename"),function(err,data){
                    res.send(data);
                });
            }else{
                res.send("error");
            }
        })
    })


}

module.exports= BoxApi;

/**
 * 如果是孔内任务 会擦掉任意id数据
 * @param req
 * @param res
 */
BoxApi.index=function(req, res){
    var value=req.param("value");
    var boxip=req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    console.log(req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress);
    /**
     * 验证MD5是否正确
     * @type {string}
     */
    var my="010101010101";
    var timetemp=parseInt(value.substr(44,8),16);   //获取到的时间

    var newtime=Math.floor(new Date().getTime()/1000);   //系统当前时间
    var valuetype=value.substr(56,2);   //消息类型
    console.log(valuetype);
    var state=value.substr(58,2);    //触发类型
 //   var jobid=value.substr(60,2);    //任务id
    var md5up=value.substr(0,32);


    var deviceId=value.substr(32,12).toLowerCase();
    var data=new Date();
    var month=data.getMonth()+1+"";
    var day=data.getDate()+"";
    if(month.length<2)month="0"+month;
    if(day.length<2)day="0"+day;
    var warntime=data.getFullYear()+"-"+month+"-"+ day;
    Box.getOne(deviceId,function(err,box){
        if(err||box==null){
        res.send(""); 
            return;
        }
        my=box.key;
        if(box.online==0)box.online=1;
            box.ip=boxip;
            box.save();
            var jy=CCAgreement.getMD5(value.substr(32)+my);
              console.log(jy.toUpperCase());
            if(jy.toUpperCase()!=md5up){
                console.log(value);
                console.log("error");
                res.send("error");
                return;
            }
            type=parseInt(valuetype,16);
            switch(type){
                case 128:
                    var jobid=value.substr(60,2);
                    var state=value.substr(62,2);
                    Job.getOkJob(deviceId,parseInt(jobid,16),parseInt(state,16),function(err,obj){
                        res.send("");
                    });
                    break;   // 无需相应， 修改任务已下发
                case 129:
                    var jobid=value.substr(60,2);
                    var state=value.substr(62,2);
                    Job.getOkJob(deviceId,parseInt(jobid,16),parseInt(state,16),function(err,obj){
                        res.send("");
                    });
                    break;   //无需相应 ，修改任务已下发
                case 3:
                    console.log("定时上报");
                    var datavalue=value.substr(56);
                    var hwNo=datavalue.substr(2,4);
                    console.log(hwNo);
                    console.log("红外触发次数"+parseInt(hwNo,16));
                    var temp=datavalue.substr(6,4);
                    console.log("温度："+parseInt(temp,16)/256);    // 温度直接给你一个有符号的2bytes的数值，你那边直接除以256得到结果
                    box.lastUpTime=new Date();
                    box.temp=(parseInt(temp,16)/256).toFixed(2);
                    if(hwNo!=0){
                        box.staffTime=new Date();
                        box.hwxNo=hwNo;
                    }
                    Box.update(box,function(){
                        res.send("");    //定时上报动作相应   //无需相应
                    });
                    break;
                case 4:                      //即时上报动作相应      //需要相应  按钮和大小孔的反射感应
                    var deviceMl=new CCAgreement(deviceId,my);
                    var state=value.substr(58,2);


                    var time=value.substr(60,8);
                    var isVaild=value.substr(68,2);
                    if(isVaild=="01"){   //有效触发 ，待记录处理
                        var backvalue=deviceMl.getSbFK(132,parseInt(state,16),parseInt(time,16),parseInt(isVaild,16));
                        res.send(backvalue);
                    }else{
                        Job.getOne(deviceId,function(err,job){
                            if(job==null){
                                var backvalue=deviceMl.getSbFK(132,parseInt(state,16),parseInt(time,16),parseInt(isVaild,16));
                                res.send(backvalue);
                            }else{
                                //   deviceId=CCAgreement.hexToString(deviceId);
                                if(job.type==2){    //音量调节任务
                                    var sss=new CCAgreement(deviceId,my);    //创建对应盒子编号的下发命令
                                    sss.setVolume(job.hole);
                                    console.log("backvalue:"+sss.getValue());
                                    res.send(sss.getValue());
                                }else{
                                    var sss=new CCAgreement(deviceId,my);    //创建对应盒子编号的下发命令
                                    sss.param(job.type,job.hole,job.id,job.state,job.interval,job.filepath,"0000000000000000");   //写入任务内容
                                    sss.setData(job.times);
                                    console.log("backvalue:"+sss.getValue());
                                    res.send(sss.getValue());
                                }
                            }
                        })
                    }
                    break;
                case 5:
                    Job.getOne(deviceId,function(err,job){
                       if(job!=null){
                           job.update=2;
                           job.save();
                       }
                        console.log(value);
                        res.send("");    //错误相应
                    })
                    break;
                case 134:               //固件更新反馈
                    box.updatebox=0;
                    Box.update(box,function(err,doc){
                        console.log(err);
                        res.send("");
                    });
                    break;
                case 7:                   //心跳包返回

                    if(box.updatebox==1){    //盒子有新版本的文件要更新
                        var deviceMl=new CCAgreement(deviceId,my);    //创建对应盒子编号的下发命令
                        Firmware.getOne(box.updatebb,function(err,firmware){
                            deviceMl.updateBB(firmware,box.updatepassword);
                            console.log("backvalue:"+deviceMl.getValue());
                            res.send(deviceMl.getValue());
                        })
                    }else if(box.reset==1){   //盒子重置  清除盒子上的所有消息
                        var deviceMl=new CCAgreement(deviceId,my);    //创建对应盒子编号的下发命令
                        deviceMl.reset();
                        console.log("backvalue:"+deviceMl.getValue());
                        box.reset=0;
                        box.save();
                        res.send(deviceMl.getValue());
                    }else{
                        Job.getOne(deviceId,function(err,job){
                            if(job==null){
                                var deviceMl=new CCAgreement(deviceId,my);    //创建对应盒子编号的下发命令
                                deviceMl.param(135);
                                console.log("backvalue:"+deviceMl.getValue());
                                res.send(deviceMl.getValue());
                            }else{
                             //   deviceId=CCAgreement.hexToString(deviceId);
                                if(job.type==2){    //音量调节任务
                                    var sss=new CCAgreement(deviceId,my);    //创建对应盒子编号的下发命令
                                    sss.setVolume(job.hole);
                                    console.log("backvalue:"+sss.getValue());
                                    res.send(sss.getValue());
                                }else{
                                    var sss=new CCAgreement(deviceId,my);    //创建对应盒子编号的下发命令
                                    sss.param(job.type,job.hole,job.id,job.state,job.interval,job.filepath,"0000000000000000");   //写入任务内容
                                    sss.setData(job.times);
                                    console.log("backvalue:"+sss.getValue());
                                    res.send(sss.getValue());
                                }
                            }
                        })
                    }
                    break;    //心跳包，检查任务

                case 9:
                    console.log("定时任务上报。");
                    var datavalue=value.substr(56);
                    var type=datavalue.substr(2,2);
                    console.log("触发类型"+type);
                    var jobNo=datavalue.substr(4,2);   //完成的任务数量 最大任务数为10个
                    console.log("完成任务数"+jobNo);
                    var jobids=datavalue.substr(6,jobNo*2);  //获取所有任务id
                    var jobtimes=datavalue.substr(6+jobNo*2,jobNo*8);    //所有任务的时间点
                    console.log("完成任务ID"+datavalue);
                    console.log("完成任务ID"+jobids);
                    //找到对应message数据和数据的盒子
                    var proid=[];
                    var rwtime={};
                    for(var i=0;i<jobNo*2;i+=2){
                        proid.push(parseInt(jobids.substr(i,i+2),16));
                        var time=parseInt(jobtimes.substr(i*4,i*4+8),16)*60000;
                        var timedate=new Date(time);
                        console.log(timedate);
                        var hour=timedate.getHours()+"";
                        var min=timedate.getMinutes()+"";
                        if(hour.length<2)hour="0"+hour;
                        if(min.length<2)min="0"+min;
                        rwtime[parseInt(jobids.substr(i,i+2),16)]=hour+":"+min;
                    }

                    Message.findByPorId(box.number,proid,function(err,messages){
                    var medicationobjs=[];
                    var eatno=0;
                    for(var i=0;i<messages.length;i++){
                        if(type!='8'){
                            eatno=eatno+1;
                        }
                        var dd=new Date();
                        var nowTime =dd.getHours()+":"+dd.getMinutes();
                        /**
                         * 添加一个dtype状态判断是否删除
                         * eatTime触发时间
                         */
                        var medicationobj={
                            messageid:messages[i]._id,
							message:{
                                    name:messages[i].name,
                                    style:messages[i].style,
                                    color:messages[i].color,
                                    isK:messages[i].isK,
                                    isf:messages[i].isf,
                                    content:messages[i].content,
                                    ywNo:messages[i].ywNo,
                                    jiange:messages[i].jiange,
                                    type:messages[i].type
                                },          
							isEat:type,
                            warntime:warntime,
                            messageTime:rwtime[messages[i].proid],
                            boxNumber:box.number,
                            dtype:0,
                            eatTime:nowTime
                        }
                        medicationobjs.push(medicationobj);
                    }
                    Medication.saveArray(medicationobjs,function(err,medicationobjs2){
                            var sss=new CCAgreement(deviceId,my);    //创建对应盒子编号的下发命令
                            sss.getRwfk(137,datavalue.substr(2).toLowerCase());
                            console.log(sss.getValue());
                            MeRecord.getOne({boxNumber:box.number,remindDate:warntime,dtype:0},function(err,merecord){
                                if(merecord!=null){
                                    merecord.donetimes=parseInt(merecord.donetimes)+parseInt(medicationobjs.length);
                                    var dotimes=parseInt(merecord.donetimes);
                                    var retimes=parseInt(merecord.retimes);
                                    if(retimes==0){
                                        box.percent=0;
                                        box.times=0;
                                    }else{
                                        box.times=merecord.donetimes;
                                        box.percent=((merecord.donetimes/merecord.retimes)*100).toFixed(0);
                                        if(box.percent>100){
                                            box.percent=100;
                                        }
                                    }

                                    box.save();
                                    merecord.save();
                                    res.send(sss.getValue());
                                }else{
                                    res.send(sss.getValue());
                                }

                            })

                        })



                    })
                    //反馈
                    break;
                case 10:
                    console.log("即时任务上报。");
                    var datavalue=value.substr(56);
                    var jobid=datavalue.substr(2,2);
                    console.log("完成任务ID"+jobid);
                    var sss=new CCAgreement(deviceId,my);    //创建对应盒子编号的下发命令
                    sss.getRwfk(138,datavalue.substr(2).toLowerCase());
                    Event.getOne2(deviceId,parseInt(jobid,16),function(err,event){           //将任务中的即时任务标记为已发送
                        if(event){
                            event.mtype=1;
                            Event.update(event,function(err){    //更新即时数据
                                console.log(sss.getValue());
                                if(event.Source==1){
                                    WeixinApplication.sendText(event.openid,"您发送的语言提醒“"+event.proid+"”"+box.name+"已经播放。",function(err,result){
                                        if(!err){
                                            res.send(sss.getValue());
                                        }
                                    })
                                }else{     //程序内即时消息发送
                                    var eventobj={
                                        type:3,
                                        content:"您发送的即时语言提醒,"+box.name+"已经播放",
                                        boxNumber:event.boxNumber
                                    };
                                    var newevent=new Event(eventobj);
                                    newevent.save(function(err,eobj){
                                        res.send(sss.getValue());
                                    })
                                }
                            })
                        }else{
                            res.send(sss.getValue());
                        }
                    });

                    break;
                case 140:   //音量修改下发反馈成功
                    console.log("音量下发反馈成功");
                    Job.getOkYL(function(err,obj){
                        res.send("");
                    });
                    break;
                case 13:   //盒子restart 需要反馈8D
                    console.log("盒子重新restart");
                    //重设后要删除所有定时提醒消息和清除绑定账户
                    // Nobility.updateOpt({boxIds:deviceId},{$pull:{boxIds:deviceId}},function(err){  //解除绑定用户
                    //     if(!err){
                    //         Message.remove({boxNumber:deviceId},function(err){   //删除所有定时提醒
                    //             MeRecord.remove(deviceId,warntime,function(err){
                    //                 var sss=new CCAgreement(deviceId,my);    //创建对应盒子编号的下发命令
                    //                 var datavalue=value.substr(58);
                    //                 sss.setRestart(datavalue);
                    //                 console.log("backvalue:"+sss.getValue());
                    //                 res.send(sss.getValue());
                    //             })
                    //     }
                    // });
                   
                    var sss=new CCAgreement(deviceId,my);    //创建对应盒子编号的下发命令
                            var datavalue=value.substr(58);
                            sss.setRestart(datavalue);
                            console.log("backvalue:"+sss.getValue());
                            res.send(sss.getValue());
                     
                    break;
                case 15:  //盒子重新设置了wifi密码  需要创建删除盒子消息的job 并且删除所有盒子消息
                    console.log("盒子重设wifi");
                    res.send("");
                    break;

                default: res.send("");break;
            }
     
        
    })
}