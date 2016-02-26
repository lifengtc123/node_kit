
/**
 * Module dependencies.
 */

var express = require('express');
var log4js = require("log4js");
log4js.configure("./log4js.json");
var logInfo = log4js.getLogger('logInfo');
logInfo.info("测试日志信息");
var routes = require('./routes');
var format = require('./lib/format');
var socketApi=require("./controllers/SocketApi");
var appApiSocket=require("./controllers/App/AppApiSocket");
var Custom=require("./controllers/custom");
var System=require("./models/systemDate");
var Box=require("./models/box");
var http = require('http');
var path = require('path');
var os = require('os')
ejs = require('ejs');
//会话保持
var SessionStore = require('session-mongoose')(express);
var settings = require('./settings')
var flash=require('connect-flash');
/*socket.io验证开始*/
var parseSignedCookie=require('connect').utils.parseSignedCookie;

/*socket.io验证结束*/
var app = express();

app.use(log4js.connectLogger(logInfo,{level:log4js.levels.INFO}));
// all environments
app.set('port', process.env.PORT || 9666);
app.set('views', path.join(__dirname, 'views'));
app.engine('.html', ejs.__express);
app.set('view engine', 'html');// app.set('view engine', 'ejs');
app.use(flash());
app.use(express.favicon());
app.use(express.logger('dev'));
//app.use(express.json());
//app.use(express.urlencoded());
app.use(express.bodyParser({keepExtensions:true,uploadDir:'./public/audioupload'}));
app.use(express.methodOverride());

app.use(express.cookieParser());
app.use(express.cookieSession({secret : 'lifeng'}));
var store = new SessionStore({
url: "mongodb://127.0.0.1/lifeng",
interval: 120000
});
app.use(express.session({
secret : 'lifeng',
store: store,
cookie: { maxAge: 900000 }
}));


System.findDay(function(err,obj){
    global.systemdate=obj;
    var createTime= global.systemdate.createTime.getTime();
    var nowTime=new Date().getTime();
    var checkday=parseInt((nowTime-createTime)/(24*60*60*1000))%420;
    while(checkday>419){
         checkday=checkday-419;
    }
    if(checkday!=global.systemdate.days){
        System.updateAndFind(checkday,function(err,obj){
            global.systemdate=obj;
        })
    }
});

app.use(app.router);

app.use(express.static(path.join(__dirname, 'public')));
// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

format(app);
routes(app);


//启动服务
var io=require('socket.io').listen(app.listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
}));

var socketuser={};
var appsocketuser={};

io.sockets.on('connection',function(socket){
    appApiSocket(socket,appsocketuser);
    socketApi(socket,socketuser);
})
var data=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
var dataMenory=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
setInterval(function(){
    if(data.length>99)
    data = data.slice(1);
    var cpuS=os.cpus();
    var y=0;
    for(var i=0;i<cpuS.length;i++){
        var datas=cpuS[i].times;
        y+= (datas.user+datas.sys)/(datas.user+datas.sys+datas.idle);
       // console.log((datas.user+datas.sys)/(datas.user+datas.sys+datas.idle))
    }
    data.push(y*25+Math.random()*1);

    if(dataMenory.length>99)
        dataMenory = dataMenory.slice(1);
    var freemem=os.freemem();
    var totalmem=os.totalmem();
    var y=(totalmem-freemem)/totalmem;
    dataMenory.push(y*100+Math.random()*1);

    io.sockets.in("serverIndex").emit("cpudata",{cpu:data,menory:dataMenory});
},2000);


Custom(io,socketuser,appsocketuser);
//http.createServer(app).listen(app.get('port'), function(){
//    console.log(os.cpus());
//  console.log('Express server listening on port ' + app.get('port'));
//});