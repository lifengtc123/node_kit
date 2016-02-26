/*
* 过滤
*/
exports.checkLogin=function(req,res,next){
	if(!req.session.user){
		return res.redirect("/login");
	}
    res.locals.user=req.session.user;
    res.locals.role=req.session.role;
	if(next)next();
}

exports.checkoutLogin=function(req,res,next){
	if(req.session.user){
		return res.redirect("/");
	}
	if(next)next();
}