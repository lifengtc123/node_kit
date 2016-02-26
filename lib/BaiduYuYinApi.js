/**
 * Created by lifeng on 16/1/10.
 */
var request=require("request");
var fs = require('fs');
var ffmpeg = require('fluent-ffmpeg');
module.exports=BaiduYuYinApi;

function BaiduYuYinApi(){

}

BaiduYuYinApi.getMp3=function(txt,filepath,callback){
    BaiduYuYinApi.getToken(function(token){
        request({
            url:"http://tsn.baidu.com/text2audio",
            method:"POST",
            form: {
                tex:txt,
                lan:"zh",
                cuid:"000001",
                ctp:1,
                tok:token,
                spd:4
            }
        },function(err,res,body){
            callback(null,filepath);
        }).pipe(fs.createWriteStream(filepath));
    });
}

BaiduYuYinApi.getAmr=function(txt,filepath,callback){
    filepath=filepath.replace("amr","mp3");
    BaiduYuYinApi.getMp3(txt,filepath,function(err,result){   //先获取MP3  再转换amr
        var path={};
        ffmpeg(result)
            .audioCodec('libopencore_amrnb')

            .audioFrequency(8000)
            .audioChannels(1)
            .audioBitrate(64)
            .on('error', function(err) {
                console.log('An error occurred: ' + err.message);
            })
            .on('end', function(filenames) {
                path['path']=result.replace("mp3","amr");
                callback(null,path);

            })
            .save(result.replace("mp3","amr"))
            .ffprobe(0, function(err, data) {
                if(data!=null&&data!=""){
                    path['time']=data.format.duration.toFixed(2);
                }
            });
    });
}


BaiduYuYinApi.getToken=function(callback){
    fs.readFile('baidu_token.txt', 'utf8', function (err, txt) {
        var data=JSON.parse(txt);
        if(data.time!=null&&data.time>new Date().getTime()-3600*1000*24*15){
            callback(data.token);
        }else{
            //获取最新的token
            request.post("https://openapi.baidu.com/oauth/2.0/token",{form:{grant_type:'client_credentials',client_id:'oHGlyT0XRMGxdI5B4WFXngsn',client_secret:'c644W2RfKoDY593jbSWX8fpPLtqjLlOg'}},function(err,res,body){
                console.log(res.statusCode);
                var token=JSON.parse(body).access_token;
                fs.writeFile('baidu_token.txt', JSON.stringify({token:token,time:new Date().getTime()}), function(){
                    callback(token);
                });
            });
        }
    });
};