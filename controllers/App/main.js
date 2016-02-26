/**
 * Created by lifeng on 15/3/13.
 */

/*
 * GET home page.
 */
var crypto =require("crypto");
var async=require('async');
Job = require("../../models/job.js");
Box = require("../../models/box.js");


function xx(){
    Box.getAllBox(function(err,boxs){
        if(boxs!="null"||boxs!=null){
            var jobs=[];
            for(var i=0;i<boxs.length;i++){
                var b=boxs[i];
                var data =new Date();
                var min=parseInt(data.getMinutes())+3;
                var hours =data.getHours()+ "";
                var min2 =min+ "";
                if (hours.length < 2)hours = "0" + hours;
                if (min2.length < 2)min2 = "0" + min2;
                var datatime =hours+":"+min2;
                var month = data.getMonth() + 1 + "";
                var day = data.getDate() + "";
                if (month.length < 2)month = "0" + month;
                if (day.length < 2)day = "0" + day;
                var times = data.getFullYear() + "-" + month + "-" + day + " " + datatime;
                console.log(times);
                var date=new Date(times);
                ////小孔
                //var jobobj = {
                //    boxNumber:b.number,
                //    type: 1,    //定时任务
                //    id:0,     //id暂定  需要查询数据
                //    state: 0,
                //    hole: 1,     //孔 0 无孔 1 小孔 2 大孔
                //    interval:1440,
                //    times: date.getTime(),
                //    filepath:"1450752341.amr"
                //}
                //jobs.push(jobobj);

                ////大孔
                //var job2={
                //    boxNumber:b.number,
                //    type: 1,    //定时任务
                //    id:0,     //id暂定  需要查询数据
                //    state: 0,
                //    hole: 2,     //孔 0 无孔 1 小孔 2 大孔
                //    interval:1440,
                //    times: date.getTime(),
                //    filepath:"1448879611.amr"
                //}
                //
                //jobs.push(job2);

                //删除小孔job
                //var jobobj = {
                //    boxNumber:b.number,
                //    type: 1,    //定时任务
                //    id:0,     //id暂定  需要查询数据
                //    state: 1,
                //    hole: 1,     //孔 0 无孔 1 小孔 2 大孔
                //    interval:1440,
                //    times: date.getTime(),
                //    filepath:"1450752341.amr"
                //}
                //jobs.push(jobobj);

                ////删除大孔job
                //var job2={
                //    boxNumber:b.number,
                //    type: 1,    //定时任务
                //    id:0,     //id暂定  需要查询数据
                //    state:1,
                //    hole: 2,     //孔 0 无孔 1 小孔 2 大孔
                //    interval:1440,
                //    times: date.getTime(),
                //    filepath:"1448879611.amr"
                //}
                //jobs.push(job2);

            }
            console.log(jobs);
            Job.savelist(jobs,function(err,obj){
                console.log("成功");
            })
        }
    })
}

function delejob(){
    Job.delejob(function(err){
        if(err){
            console.log("删除失败!");
        }else{
            console.log("删除成功!");
        }
    })
}

//xx();

//delejob();
