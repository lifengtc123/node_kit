/**
 * Created by lifeng on 15/6/24.
 */
/**
 * Created by lifeng on 15/3/11.
 */
// 消息表
var mongoose=require('./mongoosedb');
var async=require('async');
var Schema = mongoose.Schema ;

var newsSchema=new Schema({
    createTime:Date,
    updateTime:Date,
    filepath:String,    //语言文件地址
    proid:String,      //下发给盒子的ID
    boxNumber:{type:String,index:true},   //药盒ID
    mtype:{type:Number,default:0}, //已读未读状态 0:未读，1:已读
    Source:{type:Number,default:0},   // 来源   0 APP  1 微信
    openid:String                   //来源微信ID号
},{
    conllection:"news"
});



var newsModel= mongoose.model('News',newsSchema);

function News(news){
    this.filepath=news.filepath;
    this.proid=news.proid;
    this.boxNumber=news.boxNumber;
    this.Source=news.Source;
    this.openid=news.openid;
};

module.exports=News;

News.prototype.save=function(callback){
    this.createTime=new Date();
    this.updateTime=new Date();
    var newNews=new newsModel(this);
    newNews.save(function(err,news){
        if(err){
            return callback(err);
        }
        callback(null,news);
    });
}

News.update=function(news,callback){
    newsModel.update({_id:news._id},news,function(err){
        if(err){
            return callback(err);
        }
        callback(null);
    });
}

News.getOne=function(boxNumber,proid,callback){
    newsModel.findOne({boxNumber:boxNumber,proid:proid,mtype:0}).exec(function(err,message){
        callback(err,message);
    })
}

News.findAll= function (callback) {
    newsModel.find(function (err,news) {
        callback(err,news);
    })
}


News.getNewsByBoxNumber= function (boxnumber,callback) {
    newsModel.find({boxNumber:boxnumber}).exec(function(err,news){
        callback(err,news);
    })
}