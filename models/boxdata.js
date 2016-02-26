/**
 * Created by lifeng on 15/5/8.
 */
//盒子任务表
var mongoose=require('./mongoosedb');
var async=require('async');
var Schema = mongoose.Schema ;


/**
 * 盒子需要下发的任务
 * @type {Schema}
 *
 */
var boxdataSchema=new Schema({
    username:String,          //用户名
    boxNumber:{type:String,index:true},   //盒子编码
    type:Number,                //消息类型  3定时上报 4即时上报
    hole:{type:Number,default:0},    //孔类型 0 其他 1 按钮 2 小孔 3 大孔
    state:Number,  //是否有效触发  0 无效 1 有效
    time:{type:Number}   //上传的时间戳
},{
    conllection:"boxdata"
});



var boxdataModel= mongoose.model('Boxdata',boxdataSchema);

function Boxdata(boxdata){
    this.boxNumber=boxdata.boxNumber;
    this.type=boxdata.type;
    this.hole=boxdata.hole;
    this.state=boxdata.state;
    this.time=boxdata.time;
//    console.logs(job.time1);
};

module.exports=Boxdata;

Boxdata.prototype.save=function(callback){

    var newJob=new jobModel(this);

    newJob.save(function(err,job){
        if(err){
            return callback(err);
        }
        callback(null,job);
    });
}

Boxdata.Model=function(){
	return boxdataModel;
}

