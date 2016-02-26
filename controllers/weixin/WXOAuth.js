/**
 * Created by lifeng on 15/7/20.
 */
var OAuth = require('wechat-oauth');
var client = new OAuth('wxadf514a817e8700e', 'fade2879e4fb1350ab582fd9a147d0ce');
Nobility = require("../../models/nobility.js");

function WXOAuth(app) {
    app.all("/wxoauth",WXOAuth.wxlogin);
}

module.exports= WXOAuth;


WXOAuth.wxlogin=function(req, res){
    console.log(req.param("code"));
    console.log(req.param("uuid"));
    client.getAccessToken(req.param("code"), function (err, result) {    // 通过code获取到用户登录
        console.log(result)
        var accessToken = result.data.access_token;
        var openid = result.data.openid;

        client.getUser(openid, function (err, result) {    //获取用户信息
            var userInfo = result;
            //console.log(userInfo);
            res.send(userInfo);
            
        });
    });

}
