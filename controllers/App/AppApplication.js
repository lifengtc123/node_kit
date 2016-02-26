
/*
 * GET home page.
 */
var crypto =require("crypto");

AppApplication.messages=require('./Messages.js');
AppApplication.nobilitys=require('./Nobilitys.js');
AppApplication.jobs=require('./Jobs.js');
AppApplication.boxes=require('./Boxes.js');
AppApplication.events=require('./Events.js');
AppApplication.meRecords=require('./MeRecords.js');
AppApplication.medications=require('./Medications.js');
//AppApplication.boxtotlas=require('./Boxtotals.js');
AppApplication.versions=require('./Versions.js');
Version=require("../../models/version.js");
function AppApplication(app){
	app.get('/api',AppApplication.index);
    app.post('/updateApp',AppApplication.updateApp);
}

module.exports= AppApplication;

AppApplication.index=function(req, res){
	var forwardedIpsStr =req.ip;   //req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
	res.render('AppApplication/index', { action:'application',ip:forwardedIpsStr });
}
//告诉下面现在APP的版本 如果和APP当前版本不对，APP就会提示用户更新
AppApplication.updateApp=function(req, res){
    Version.findOne({verType:"ios"},function(version){
        res.send(version.verCode);
    })
}

