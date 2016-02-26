 /**
 * Created by lifeng on 15/3/13.
 */

/*
 * GET home page.
 */
var crypto =require("crypto");
var filter=require("./filter");
var async=require('async');
 var fs = require('fs');
Job = require("../models/job.js");
 var ffmpeg = require('fluent-ffmpeg');

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

    console.log(list);
    //Job.getAll();
}

Jobs.create=function(req,res){
     req.body.job.times=new Array();
     req.body.job.times.push(req.body.job.time1);
     req.body.job.times.push(req.body.job.time2);
     var dirpath='./public/vv-box/'+req.body.job.boxNumber;
     var filename=parseInt(new Date().getTime()/1000)+".mp3";
     if (!fs.existsSync(dirpath)) {
         fs.mkdirSync(dirpath);
     }
     var target_path='./public/vv-box/'+req.body.job.boxNumber+"/"+filename;
     //console.logs(target_path);
     //console.logs(req.files.file.path);
     fs.renameSync(req.files.job.filepath.path,target_path);
     var path={};
     ffmpeg(target_path)
         .audioCodec('libopencore_amrnb')

         .audioFrequency(8000)
         .audioChannels(1)
         .audioBitrate(64)
         .on('error', function(err) {
             //console.logs('An error occurred: ' + err.message);
         })
         .on('end', function(filenames) {
             fs.unlinkSync(target_path);
             req.body.job.filepath=filename.replace("mp3","amr");
             var job=new Job(req.body.job);
             //res.send("");

             job.type='0';
             job.hole=0;
             job.id=30;
             job.interval=0;
             console.log(job);
             job.save(function(err,obj){
                 res.send(obj);
             });
             //console.logs('Processing finished !');
         })
         .save(target_path.replace("mp3","amr"))
         .ffprobe(0, function(err, data) {
             if(data!=null&&data!=""){
                 path['time']=data.format.duration;
             }

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


