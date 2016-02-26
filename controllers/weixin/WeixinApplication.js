/**
* Created by lifeng on 15/6/16.
*/

/*
* GET home page.  //微信：zf@vv-box.com  pin: Vvboxfighting2015  wx31aeec0018c6c8ef  d2c6da348d2156e7e76ce21c76cf4858
*/
var crypto =require("crypto");
var async=require('async');
var request=require("request");
var needle = require('needle');
var API = require('wechat-api');
var wechat = require('wechat');
var fs = require('fs');
var Nobility = require("../../models/nobility.js");
var Box = require("../../models/box.js");
var News = require("../../models/news.js");
var Event = require("../../models/event.js");
var Job = require("../../models/job.js");
var sign = require('./sign.js');
WeixinApplication.weixins=require("../Weixins.js");




//var config = {
//    token: '25soft',
//    appid: 'wx31aeec0018c6c8ef',
//    encodingAESKey: '3zcmfEsmFHlO1E8mvPkdyAw8gC9Yi9rNriXfv78yh4Q'
//  //  d2c6da348d2156e7e76ce21c76cf4858
//};

var config = {
    token: 'jImIwEcHaT',
    appid: 'wxe7f8cddc17829dde',
    encodingAESKey: 'DPmeNxQpCfipt2tkAtn3CCui0edCJl6winplCKbnPee'
    //  d2c6da348d2156e7e76ce21c76cf4858
};


//var api = new API('wx31aeec0018c6c8ef', 'd2c6da348d2156e7e76ce21c76cf4858', function (callback) {
//    // 传入一个获取全局token的方法
//    fs.readFile('access_token.txt', 'utf8', function (err, txt) {
//        console.log(txt);
//        if (err) {return callback(err);}
//        callback(null, JSON.parse(txt));
//    });
//}, function (token, callback) {
//    // 请将token存储到全局，跨进程、跨机器级别的全局，比如写到数据库、redis等
//    // 这样才能在cluster模式及多机情况下使用，以下为写入到文件的示例
//    token.expireTime=new Date().getTime()+3000000;
//    fs.writeFile('access_token.txt', JSON.stringify(token), callback);
//});

var api = new API('wxe7f8cddc17829dde', 'b59cdbf42cda3126e568b51d9a382e29', function (callback) {
    // 传入一个获取全局token的方法
    fs.readFile('access_token.txt', 'utf8', function (err, txt) {
        console.log(txt);
        if (err) {return callback(err);}
        callback(null, JSON.parse(txt));
    });
}, function (token, callback) {
    // 请将token存储到全局，跨进程、跨机器级别的全局，比如写到数据库、redis等
    // 这样才能在cluster模式及多机情况下使用，以下为写入到文件的示例
    token.expireTime=new Date().getTime()+3000000;
    fs.writeFile('access_token.txt', JSON.stringify(token), callback);
});


function WeixinApplication(app){

    app.get('/weixin',wechat(config, WeixinApplication.index));

    //获取wxconfig 参数
    app.all('/weixin/wxconfig',function(req,res){
        getJsToken(function(data){
            res.send(data);
        });
    });

    app.all('/weixin/getOpenid',function(req,res){
        var code=req.param("code");
        var page=req.param("page");
        console.log(code);
        request.get("https://api.weixin.qq.com/sns/oauth2/access_token?appid="+config.appid+"&secret=d2c6da348d2156e7e76ce21c76cf4858&code="+code+"&grant_type=authorization_code",function(err,data,body){
            var data=JSON.parse(body);  //获取到openid和unionid
			console.log(data);
			api.getLatestToken(function(err,access_token){
			request.get("https://api.weixin.qq.com/cgi-bin/user/info?access_token="+access_token.accessToken+"&openid="+data.openid+"&lang=zh_CN",function(err,data,body){
		//	console.log(data);
		var data=JSON.parse(body);  //获取到openid和unionid
			Nobility.findOne({unionid:data.unionid},function(err,obj){
            console.log(err);
                if(obj){   //如果有用户数     据
                    res.render("Weixin/getOpenid",{action:'getOpenid',page:page,phoneuuid:obj.phoneuuid});
                }else{  //如果没有数据，则创建新的账户
                    var obj={
                        language:"zh",
                        phoneuuid:data.unionid,
                        username:"",
                        weixin:"",
                        name:"",
                        area:"",
                        image:"",
                        volume:'8',
                        password:"",
                        age:'',
                        unionid:data.unionid,
                        openid:data.openid
                    };
                    var nobility=new Nobility(obj);
                    nobility.save(function(err,newnobility){
                    	console.log(err);
                        res.render("Weixin/getOpenid",{action:'getOpenid',page:page,phoneuuid:newnobility.phoneuuid});

                    })
                }
            })
			
});
			});
        
            
        });

    });

    app.get('/weixin/video',function(req,res){

        var path=req.param("path");
        console.log(path);
        async.waterfall([function(callback){
            var boxNumber= "f4b85e49f212";   //固定一个盒子boxNumber
            Box.getOne(boxNumber,function(err,box){
            	console.log(err);
                callback(err,box);
            })
        },function(b,callback){
        	var dirpath='./public/vv-box/'+b.number;

            if (!fs.existsSync(dirpath)) {
                fs.mkdirSync(dirpath);
            }
            console.log(path);
            var name=parseInt(new Date().getTime()/1000)+'.amr';
            var target_path='./public/vv-box/'+b.number+"/"+name;
        	request(path).pipe(
                    fs.createWriteStream(target_path)
                );

        	console.log(b);
                var jobid= b.boxLastJobId2;
                if(b.boxLastJobId2==null||b.boxLastJobId2==255){
                    b.boxLastJobId2==100;

                }else{
                    b.boxLastJobId2++;
                }
                Box.update(b,function(err){
                    // console.log(err);
                    callback(err,{path:name,boxNumber: b.number,jobid:b.boxLastJobId2});
                })
        },function(c,callback){
            var newsobj={
                filepath: c.path,
                proid: c.jobid,
                boxNumber: c.boxNumber,
                type:1,
                Source:0
            };
            console.log(c);
            var event=new Event(newsobj);
            event.save(function(err,obj){
                callback(err,obj);
            })
        },function(d,callback){
            var jobobj={
                boxNumber: d.boxNumber,
                type:0,
                id: d.proid,
                state:0,
                filepath: d.filepath
            };
            var job=new Job(jobobj);
            job.save(function(err,obj){
                callback(err,obj);
            })
        }
        ],function(err,obj){    //查到盒子
            if(err){
                console.log(err);
                res.send(err);
            }else{
                console.log(obj);
                res.send('语言设定成功,id:'+obj.id+'。将会发送给爸爸的盒子。');
            }
        })
    });

    app.post('/weixin',wechat(config, wechat.text(WeixinApplication.text)
                                            .image(WeixinApplication.image)
                                            .voice(WeixinApplication.voice)
        .video(WeixinApplication.video)
        .location(WeixinApplication.location)
        .link(WeixinApplication.link)
        .event(WeixinApplication.event)
        .device_text(WeixinApplication.device_text)
        .device_event(WeixinApplication.device_event)
        .shortvideo(WeixinApplication.shortvideo)));
}

module.exports= WeixinApplication;

WeixinApplication.index=function(req, res){
    var query = req.query;
    var signature = query.signature;
    var echostr = query.echostr;
    var timestamp = query['timestamp'];
    var nonce = query.nonce;
    var oriArray = new Array();
    oriArray[0] = nonce;
    oriArray[1] = timestamp;
    oriArray[2] = "25soft";//这里填写你的token
    oriArray.sort();
    var original = oriArray[0]+oriArray[1]+oriArray[2];
    console.log("Original Str:"+original);
    console.log("signature:"+signature);
    var sha1 = crypto.createHash('sha1');
    var scyptoString = sha1.update(original).digest('hex');
    if (signature == scyptoString) {
        res.send(echostr);
    }
    else {
        res.send("Bad Token!");
    }
};

WeixinApplication.text=function(message,req, res){
    var message= req.weixin;
    var openId=message.FromUserName;
    async.waterfall([function(callback){
        Nobility.getOpenid(openId,function(err,nobility){
            if(nobility==null){
                callback("没有对应用户");
            }else{
                callback(err,nobility);
            }

        })
    },function(a,callback){
        var boxNumber= a.lastboxid;
        Box.getOne(boxNumber,function(err,box){
            callback(err,box);
        })
    }
    ],function(err,obj){
        if(err){
            console.log(err);
        }
        console.log(obj);
        console.log(message);
        res.reply('欢迎使用智能语音药盒。请选择我的盒子中查看盒子菜单。');
    })


};

WeixinApplication.image=function(message,req, res) {
    res.reply('小盒还不认识图片');
}

WeixinApplication.voice=function(message,req, res) {
    var openid=message.FromUserName;
    var mediaId=message.MediaId;
    var boxName="小盒";
    async.waterfall([function(callback){
        api.getUser(openid, function(err,result){
            callback(err,result);
        });
    },
        function(a,callback){
        Nobility.findOne({unionid:a.unionid},function(err,nobility){
        	if(nobility&&nobility.boxIds!=null&&nobility.boxIds.length>0){
        		callback(err,nobility);
        	}else{
        		callback("您的微信还未绑定盒子，请点击我的盒子绑定。");
        	}

        })
    },function(a,callback){
        var boxNumber= a.lastboxid;
        Box.getOne(boxNumber,function(err,box){
            callback(err,box);
        })
    },function(b,callback){
            WeixinApplication.getMedia(mediaId,b.number,function(err,name){
                var jobid= b.boxLastJobId2;
                if(b.boxLastJobId2==null||b.boxLastJobId2==255){
                    b.boxLastJobId2==100;

                }else{
                    b.boxLastJobId2++;
                }
                Box.update(b,function(err){
                    boxName=b.name;
                    callback(err,{path:name,boxNumber: b.number,jobid:b.boxLastJobId2,boxName: b.name});
                })
            });

    },function(c,callback){
        var newsobj={
            filepath: c.path,
            proid: c.jobid,
            boxNumber: c.boxNumber,
            type:1,
            openid:openid,
            Source:1,
            boxName: c.boxName
        };
        var event=new Event(newsobj);
        event.save(function(err,obj){
            callback(err,obj);
        })
    },function(d,callback){
        var jobobj={
            boxNumber: d.boxNumber,
            type:0,
            id: d.proid,
            state:0,
            filepath: d.filepath
        };
        var job=new Job(jobobj);
        job.save(function(err,obj){
            callback(err,obj);
        })
    }
    ],function(err,obj){    //查到盒子
        if(err){
            console.log(err);
            res.reply(err);
        }else{
            console.log(obj);
            res.reply('语言设定成功,id:'+obj.id+'。将会发送给'+boxName+'。');
        }
    })

}

WeixinApplication.video=function(message,req, res) {
    res.reply('小盒还不认识video');
};

WeixinApplication.location=function(message,req, res) {
    res.reply('小盒还不认识location');
};

WeixinApplication.link=function(message,req, res) {
    res.reply('小盒还不认识link');
};

WeixinApplication.event=function(message,req, res) {
    switch(message.Event){
        case "CLICK":
        	console.log(message.EventKey);
            if(message.EventKey=="1"){
                Nobility.getUsername("15258284638",function(err,nobility){
                    nobility.openid=message.FromUserName;
                    Nobility.update(nobility,function(err){

                        WeixinApplication.setapi_template(message.FromUserName);
                    });

                    res.reply('');
                })
            }else if(message.EventKey=="3"){  //点击 求助客服
                WeixinApplication.sendText(message.FromUserName,"感谢关注“盒你一起”， 请您在下方聊天框中概述您遇到的问题，我们会在第一时间为你处理！在线客服每天8:30-23:00真人值守，全心全意为您服务! ",function(err){
                    if(!err) {
                        res.reply({type: "transfer_customer_service"});
                    }
                })

            }else if(message.EventKey=="4"){
                res.reply([
                    {
                        title: '微网站',
                        description: '欢迎访问小盒主页',
                        picurl: 'https://mmbiz.qlogo.cn/mmbiz/JuyNPY725Ums9qGs5M4rbuJV47iak1Q2WIXcxMJG7f9w4Z9QK8O5z3iagic86YFbR8JmhU3Y0uDGkwW4yJNhTvaCA/0?wx_fmt=jpeg',
                        url: 'http://www.vv-box.com/'
                    }
                ]);
            }
            break;
        default :    res.reply('欢迎使用VV_BOX\r\n<a href="http://www.vv-box.com/newsdetail.html?id=156">APP下载安装说明</a>\r\n<a href="http://www.vv-box.com/newsdetail.html?id=154">IPhone打开APP不信任的解决方法</a>\n');
		break;
    }
};

WeixinApplication.device_text=function(message,req, res) {
    res.reply('小盒还不认识device_text');
};

WeixinApplication.device_event=function(message,req, res) {  //关注事件

    res.reply('欢迎使用VV_BOX\r\n<a href="http://www.vv-box.com/newsdetail.html?id=156">APP下载安装说明</a>\r\n<a href="http://www.vv-box.com/newsdetail.html?id=154">IPhone打开APP不信任的解决方法</a>\n');
};

WeixinApplication.shortvideo=function(message,req, res) {
    res.reply('小盒还不认识shortvideo');
};

function getToken(){
    request("https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=wx31aeec0018c6c8ef&secret=d2c6da348d2156e7e76ce21c76cf4858",function(error,response,body){

        if(!error&&response.statusCode==200){
            console.log(JSON.parse(body).access_token);
        }
    })
}

function setCD(){
    //var api = new API('wx31aeec0018c6c8ef', 'd2c6da348d2156e7e76ce21c76cf4858');

    var redirect_uri_wdhz=encodeURIComponent("http://node.vv-box.com/weixin/getOpenid?page=/home");
    var redirect_uri_yytx=encodeURIComponent("http://node.vv-box.com/weixin/getOpenid?page=/alert/alert/yy");
    console.log(redirect_uri_wdhz);
    var menu={
        "button":[
            {
                "name":"我的盒子",     //https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx520c15f417810387&redirect_uri=https%3A%2F%2Fchong.qq.com%2Fphp%2Findex.php%3Fd%3D%26c%3DwxAdapter%26m%3DmobileDeal%26showwxpaytitle%3D1%26vb2ctag%3D4_2030_5_1194_60&response_type=code&scope=snsapi_base&state=123#wechat_redirect
                "sub_button":[
                    {
                        "type":"view",
                        "name":"我的盒子",
                        "url":"https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx31aeec0018c6c8ef&redirect_uri="+redirect_uri_wdhz+"&response_type=code&scope=snsapi_base&state=123#wechat_redirect"
                    },
                    {
                        "type":"view",   //https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx520c15f417810387&redirect_uri=https%3A%2F%2Fchong.qq.com%2Fphp%2Findex.php%3Fd%3D%26c%3DwxAdapter%26m%3DmobileDeal%26showwxpaytitle%3D1%26vb2ctag%3D4_2030_5_1194_60&response_type=code&scope=snsapi_base&state=123#wechat_redirect
                        "name":"用药提醒",
                        "url":"https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx31aeec0018c6c8ef&redirect_uri="+redirect_uri_yytx+"&response_type=code&scope=snsapi_base&state=123#wechat_redirect"
                    },
                    {
                        "type":"view",   //https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx520c15f417810387&redirect_uri=https%3A%2F%2Fchong.qq.com%2Fphp%2Findex.php%3Fd%3D%26c%3DwxAdapter%26m%3DmobileDeal%26showwxpaytitle%3D1%26vb2ctag%3D4_2030_5_1194_60&response_type=code&scope=snsapi_base&state=123#wechat_redirect
                        "name":"使用帮助",
                        "url":"http://other.vv-box.com/phone/Cmsinfos/cmslist"
                    }]
            },
            {
                "name":"社区",
                "sub_button":[
                    {
                        "type":"click",
                        "name":"联系客服",
                        "key":"3"
                    }]
            },{
                "name":"活动",
                "sub_button":[
                    {
                        "type":"click",
                        "name":"微官网",
                        "key":"4"
                    }]
            }]
            };
    api.createMenu(menu, function(err,result){


        console.log(result);
    });
}
//
//setCD();

WeixinApplication.setapi_template=function(openid){
    var api = new API('wx31aeec0018c6c8ef', 'd2c6da348d2156e7e76ce21c76cf4858', function (callback) {
        // 传入一个获取全局token的方法
        fs.readFile('access_token.txt', 'utf8', function (err, txt) {

            if (err) {return callback(err);}
            callback(null, JSON.parse(txt));
        });
    }, function (token, callback) {

        // 请将token存储到全局，跨进程、跨机器级别的全局，比如写到数据库、redis等
        // 这样才能在cluster模式及多机情况下使用，以下为写入到文件的示例
        token.expireTime=new Date().getTime()+3000000;
        fs.writeFile('access_token.txt', JSON.stringify(token), callback);
    });
    api.getLatestToken();
    var industryIds = {
        "industry_id1":'1',
        "industry_id2":"4"
    };
    var templateId = 's6vUYgJxipVW3htrpInN6C6CcNkrbqzorK-A9xgAs7Q';
    var url= 'http://weixin.qq.com/download';
    var topcolor = '#FF0000'; // 顶部颜色
    var data = {
        first:{
            "value":'vv-box绑定盒子',
            "color":"#777"
        },
        keyword1:{
            "value":'爸爸的盒子',
            "color":"#777"
        },
        keyword2:{
            "value":'绑定成功',
            "color":"#777"
        },
        "remark":{
            "value":"感谢您的使用。",
            "color":"#777"
        }
    };
    api.sendTemplate(openid, templateId, url, topcolor, data, function(err,result){
       // console.log(err);
    });

};
//setapi_template();

// sendTemplate   发送模板消息

//WeixinApplication.sendTemplate=function(openid,)

WeixinApplication.getMedia=function(mediaid,boxnumber,callback){     //获取语言文件
    api = new API('wx31aeec0018c6c8ef', 'd2c6da348d2156e7e76ce21c76cf4858', function (callback) {
        // 传入一个获取全局token的方法
        fs.readFile('access_token.txt', 'utf8', function (err, txt) {

            if (err) {return callback(err);}
            callback(null, JSON.parse(txt));
        });
    }, function (token, callback) {

        // 请将token存储到全局，跨进程、跨机器级别的全局，比如写到数据库、redis等
        // 这样才能在cluster模式及多机情况下使用，以下为写入到文件的示例
        fs.writeFile('access_token.txt', JSON.stringify(token), callback);
    });
    api.getMedia(mediaid, function(err,result,res){
        var dirpath='./public/vv-box/'+boxnumber;

        if (!fs.existsSync(dirpath)) {
            fs.mkdirSync(dirpath);
        }

        var name=parseInt(new Date().getTime()/1000)+'.amr';
        var target_path='./public/vv-box/'+boxnumber+"/"+name;
        fs.writeFile(target_path, result, function (err, txt) {

            callback(err,name);
        });

    });

};

//发送客服文字消息
WeixinApplication.sendText=function (openid,message,callback){
    var api = new API('wx31aeec0018c6c8ef', 'd2c6da348d2156e7e76ce21c76cf4858', function (callback) {
        // 传入一个获取全局token的方法
        fs.readFile('access_token.txt', 'utf8', function (err, txt) {

            if (err) {return callback(err);}
            callback(null, JSON.parse(txt));
        });
    }, function (token, callback) {

        // 请将token存储到全局，跨进程、跨机器级别的全局，比如写到数据库、redis等
        // 这样才能在cluster模式及多机情况下使用，以下为写入到文件的示例
        token.expireTime=new Date().getTime()+3000000;
        fs.writeFile('access_token.txt', JSON.stringify(token), callback);
    });
    api.sendText(openid, message, function(err,result){
        callback(err,result);
    });
};


//微信 获取jssdk 的weixin_jsapi_ticket

getJsToken=function(callback){
    var api = new API('wx31aeec0018c6c8ef', 'd2c6da348d2156e7e76ce21c76cf4858', function (callback) {
        // 传入一个获取全局token的方法
        fs.readFile('access_token.txt', 'utf8', function (err, txt) {
            if (err) {return callback(err);}
            callback(null, JSON.parse(txt));
        });
    }, function (token, callback) {
        // 请将token存储到全局，跨进程、跨机器级别的全局，比如写到数据库、redis等
        // 这样才能在cluster模式及多机情况下使用，以下为写入到文件的示例
        token.expireTime=new Date().getTime()+3000000;
        fs.writeFile('access_token.txt', JSON.stringify(token), callback);
    });

    api.getTicket(function(err,result){
    	console.log(err);
   	 	console.log(result);
        callback(sign(result.ticket, 'http://node.vv-box.com/wxwww/index.html'));
    });
};