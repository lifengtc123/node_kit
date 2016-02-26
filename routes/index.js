
/*
 * GET home page.
 */
var crypto =require("crypto");
var filter=require("../controllers/filter");
Secure=require("../controllers/Secure");
Application=require("../controllers/Application");
AudioUpload=require("../controllers/App/AudioUpload");
CCAgreement=require("../lib/CCAgreement");
User = require("../models/user.js");
BoxApi=require("../controllers/BoxApi.js");

AppApplication=require('../controllers/App/AppApplication');
WeixinApplication=require('../controllers/weixin/WeixinApplication');
WXOAuth=require('../controllers/weixin/WXOAuth');



module.exports= function(app){


    app.use(function(req,res){
        res.render("error/404");
    })
  //  Messages(app);  //提醒
  //  Boxes(app);     //获取盒子信息
    BoxApi(app);    //盒子Api
	Application(app);  //主入口
    AppApplication(app);   //appapi入口
    WeixinApplication(app);   //微信入口
	Secure(app);     //登陆 注册
    AudioUpload(app);  //声音上传
    WXOAuth(app);    //手机端微信登录


// requests will never reach this route


    app.use("/:controller/:action",function(req,res,next){
        console.log(222);
    })


	app.all("/:controller/:action",function(req,res,next){
		var controller=req.param("controller");
		var action=req.param("action");
		if(Application[controller]&&Application[controller][action]){
			filter.checkLogin(req,res);   //登陆验证
			Application[controller][action](req,res,next);
		}else{
			next();
		}
	})

    app.all("/appapi/:controller/:action",function(req,res,next){

        var controller=req.param("controller");
        var action=req.param("action");
        if(AppApplication[controller]&&AppApplication[controller][action]){
            AppApplication[controller][action](req,res,next);
        }else{
            next();
        }
    })

    app.all("/weixin/:controller/:action",function(req,res,next){

        var controller=req.param("controller");
        var action=req.param("action");
        if(WeixinApplication[controller]&&WeixinApplication[controller][action]){
            WeixinApplication[controller][action](req,res,next);
        }else{
            next();
        }
    })
}