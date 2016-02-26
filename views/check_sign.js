var sign = require('./sign.js');

console.log(sign('bxLdikRXVbTPdHSM05e5u1qX5tu2cajzaycEAM64O1ihJY6QGH5GvefbH83d-sTFXmpWQWkyxb3v7hJrggeyvQ', 'http://vvbox.wicp.net/weixin/index'));
/*
 *something like this
 *{
 *  jsapi_ticket: 'jsapi_ticket',
 *  nonceStr: '82zklqj7ycoywrk',
 *  timestamp: '1415171822',
 *  url: 'http://example.com',
 *  signature: '1316ed92e0827786cfda3ae355f33760c4f70c1f'
 *}
 */

var request=require("request");
//request('https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=wx68b779ee1d32b13b&secret=f1e7f796f6eb9d1c7352e6ba78919056',function(err,res,body){
//    console.log(body);
//    request('https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=ByirPXpEr94bnG-nOhKO7RiEEFfkGg7i2G6S93_OWscQxGFMd0uBQsVbu6eI7L1Mh8nnE6QkkOyTkQUowSdOdRC9p8xw-HVdbc3pe2JdrhU&type=jsapi',function(err,res,body){
//        console.log(body);
//    })
//})