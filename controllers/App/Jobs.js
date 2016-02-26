/**
 * Created by lifeng on 15/3/13.
 */

/*
 * GET home page.
 */
var crypto =require("crypto");
var async=require('async');
Job = require("../../models/job.js");

function Jobs(app){

}

module.exports= Jobs;

Jobs.chart=function(req,res){
    res.render("Jobs/chart",{action:'jobs'});
}

Jobs.list=function(req,res){
    res.render("Jobs/list",{action:'jobs'});
}

Jobs.joblist=function(req,res){
    //var jobid=req.jobdd;
    //console.logs(jobid);
    var list=new Array();
    list=req.jobdd;

    //console.logs(list);
    //Job.getAll();
}

//Jobs.getlist=function(req,res){
//    var boxNumbers=req.body.boxNumbers;
//    Job.getByBoxnumber(boxNumbers,function(err,jobs){
//        //console.logs(jobs);
//        var newjobs=[];
//        for(var i=0;i<jobs.length;i++){
//            for(var j=0;j<jobs[i].times.length;j++){
//                var newjob={_id:jobs[i]._id,boxNumber:jobs[i].boxNumber,type:jobs[i].type,id:jobs[i].id,state:jobs[i].state,filepath:jobs[i].filepath,__v:jobs[i].__v,update:jobs[i].update,time:jobs[i].times[j],interval:jobs[i].interval,hole:jobs[i].hole}
//                newjobs.push(newjob);
//            }
//        }
//        //console.logs(newjobs);
//        res.json(newjobs);
//    })
//}

Jobs.create=function(req,res){
    req.body.job.times=new Array();
    req.body.job.times.push(req.body.job.time1);
    req.body.job.times.push(req.body.job.time2);
    //console.logs(req.body.job);
    var job=new Job(req.body.job);
    job.save(function(err,obj){
        res.send(obj);
    });
}

Jobs.save=function(req,res){
    res.send("开发中");
}

Jobs.blank=function(req,res){
    Job.getOne("000102030405",function(err,obj){
        res.render("Jobs/blank",{action:'jobs',obj:obj});
    })
}

Jobs.show=function(req,res){
    res.send("开发中");
}

Jobs.detail=function(req,res){
    res.send("开发中");
}


