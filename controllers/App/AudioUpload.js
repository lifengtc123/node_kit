
/**
 * Created by lifeng on 15/4/22.
 */
var crypto =require("crypto");
var fs=require("fs");
var ffmpeg = require('fluent-ffmpeg');


function AudioUpload(app){

    app.post('/audioupload',function(req,res){
        var type=req.param("value2");
        if(type==0){
            var dirpath='./public/vv-box/'+req.param("value1");
            var filename=req.files.file.name;
            if (!fs.existsSync(dirpath)) {
                fs.mkdirSync(dirpath);
            }
            var target_path='./public/vv-box/'+req.param("value1")+"/"+req.files.file.name;
            var target_path2=target_path.replace("m4a","mp3");
            var path={};
            console.log(target_path2);
            fs.renameSync(req.files.file.path,target_path2);
            var path={};

            ffmpeg(target_path2)
                .noVideo()
                .audioCodec('libopencore_amrnb')

                .audioFrequency(8000)
                .audioChannels(1)
                .audioBitrate(64)
                .on('error', function(err) {
                    //console.logs('An error occurred: ' + err.message);
                })
                .on('end', function(filenames) {
                    path['path']=filename.replace("m4a","amr");

                    res.json(path);
                    //console.logs('Processing finished !');
                })
                .save(target_path2.replace("mp3","amr"))
                .ffprobe(0, function(err, data) {
                    if(data!=null&&data!=""){
                        path['time']=data.format.duration.toFixed(2);
                    }

                });

        }
        else if(type==1){
            var dirpath='./public/vv-box/'+req.param("value1");
            var filename=req.files.file.name;
            if (!fs.existsSync(dirpath)) {
                    fs.mkdirSync(dirpath);
               }
            var target_path='./public/vv-box/'+req.param("value1")+"/"+req.files.file.name;
            var target_path2=target_path.replace("m4a","mp3");
            var path={};
            console.log(target_path2);
            fs.renameSync(req.files.file.path,target_path);
            ffmpeg(target_path2)       //声音转换 去视频
                .noVideo()
                .save(target_path2.replace("mp3","amr"))
                .ffprobe(0, function(err, data) {
                    if(data!=null&&data!=""&&data.format.duration!=null){
                        path['time']=data.format.duration.toFixed(2);
                    }
                    path['path']=filename;
                    res.json(path);
                });
        }else{
            var dirpath='./public/vv-box/'+req.param("value1");
            var filename=req.files.file.name;
            if (!fs.existsSync(dirpath)) {
                fs.mkdirSync(dirpath);
            }
            var target_path='./public/vv-box/'+req.param("value1")+"/"+req.files.file.name;
            //console.log(target_path);
           // console.log(req.files.file.path);
            fs.renameSync(req.files.file.path,target_path);
            var path={};
            ffmpeg(target_path)
                .audioCodec('libopencore_amrnb')

                .audioFrequency(8000)
                .audioChannels(1)
                .audioBitrate(64)
                .on('error', function(err) {
                    console.log('An error occurred: ' + err.message);
                })
                .on('end', function(filenames) {
                    //fs.unlinkSync(target_path);
                    console.log('Processing finished !');
                    path['path']=filename.replace("mp3","amr");
                    res.json(path);
                    
                })
                .save(target_path.replace("mp3","amr"))
                .ffprobe(0, function(err, data) {
                    if(data!=null&&data!=""){
                        path['time']=data.format.duration.toFixed(2);
                    }

                });
        }
    });


}

module.exports= AudioUpload;

