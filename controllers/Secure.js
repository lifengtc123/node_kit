
/*
 * GET home page.
 */
var crypto =require("crypto");
var filter=require("./filter");
var async=require('async');
User = require("../models/user.js");

module.exports= Secure
function Secure(app){

	app.get('/login',filter.checkoutLogin,Secure.login);

	app.post('/login',filter.checkoutLogin,Secure.logining)

	app.get("/reg",filter.checkoutLogin,Secure.reg);

	app.post("/reg",filter.checkoutLogin,Secure.reging);

	app.all("/logout",Secure.logout);

}

Secure.login=function(req,res){
	var forwardedIpsStr =req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
	res.render('Secure/login', {ip:forwardedIpsStr,
		success:req.flash('success').toString(),
		error:req.flash('error').toString(),
		remember:req.flash("remember").toString()});
}

Secure.logining=function(req,res){
	var username=req.param('username');
	var password=req.param('password');
	var remember=req.param('remember');
	if(username==""||password==""){
		req.flash("error","请输入账户名和密码");
		req.flash("remember",remember);
		return res.redirect("/login");
	}
	var md5=crypto.createHash('md5');
		password=md5.update(password).digest('hex');
	User.Model().findOne({username:username,password:password}).populate('roleId').populate('departId').exec(function(err,user){
		if(err){
			console.log(err);
		}
        console.log(user);
		if(user){
			req.session.user=user;
			res.redirect("/");
		}else{
			req.flash("error","账户名或密码错误。");
			req.flash("remember",remember);
			return res.redirect("/login");
		}
	})
}

Secure.reg=function(req,res){
	res.render("Secure/reg",{
		success:req.flash('success').toString(),
		error:req.flash('error').toString(),
		remember:req.flash("remember").toString()});
}

Secure.reging=function(req,res){
	var user=new User(req.body.user);
	if(user.username==""||user.password==""){
		req.flash("error","请输入账户名和密码");
		return res.redirect("/reg");
	}
	async.waterfall([function(callback){
		User.getUsername(user.username,function(err,user){
			if(user){
				callback("用户名已经被注册。",user);
			}
			else{
				callback(null,null);
			}
		})
	},function(a,callback){
		var md5=crypto.createHash('md5');
		user.password=md5.update(user.password).digest('hex');
		user.save(function(err,user){
			callback(err,user);
		})
	}
	],function(err,user){
		if(err){
			req.flash("error",err);
			return res.redirect("/reg");
		}
		req.flash("success","注册成功111。");
		res.redirect("/login");
	})
	
}


// Secure.reging=function(req,res){
// 	var user=new User(req.body.user);
// 	if(user.username==""||user.password==""){
// 		req.flash("error","请输入账户名和密码");
// 		return res.redirect("/reg");
// 	}

// 		var md5=crypto.createHash('md5');
// 		user.password=md5.update(user.password).digest('hex');
// 		user.save200000(function(err,user){
// 			if(err){
// 				req.flash("error",err);
// 				return res.redirect("/reg");
// 			}
// 			req.flash("success","注册成功。");
// 			res.redirect("/login");
// 		})
// }

Secure.logout=function(req,res){
	req.session.user=null;
    req.session.role=null;
	req.flash("success","登出成功！");
	res.redirect('/login');
}