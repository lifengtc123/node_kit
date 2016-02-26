/**
 * Created by zhangzj on 16/1/28.
 */
//版本更新
var mongoose=require('./mongoosedb');
var async=require('async');
var Schema = mongoose.Schema ;
/**
 * 版本更新
 * @type {Schema}
 *
 */
var VersionSchema=new Schema({
    verCode:{type:String},   //版本号apk verCode
    verName:{type:String},   //apk-verName
    updateuser:{type:String},   //更新人
    updatetime:{type:Date},     //更新时间
    filepath:{type:String},     //文件路径
    filename:{type:String},     //文件名
    updateurl:{type:String}     //更新路径
},{
    conllection:"version"
});


var VersionModel= mongoose.model('version',VersionSchema);

function Version(version){
    this.verCode=version.verCode;
    this.verName=version.verName;
    this.updateuser=version.updateuser;
    this.updatetime=version.updatetime;
    this.filepath=version.filepath;
    this.filename=version.filename;
    this.updateurl=version.updateurl;
};

module.exports=Version;

Version.prototype.save= function (callback) {

}

Version.Model= function () {
    return VersionModel;
}

Version.prototype.save=function(callback){

    var newVersion=new VersionModel(this.obj);
    newVersion.createTime=new Date();
    newVersion.save(function(err,v){
        if(err){
            return callback(err);
        }
        callback(null,v);
    });
}

Version.prototype.save= function (callback) {
    var version={
        verCode:this.verCode,
        verName:this.verName,
        updateuser:this.updateuser,
        updatetime:new Date(),
        filepath:this.filepath,
        filename:this.filename,
        updateurl:this.updateurl
    };
    async.waterfall([function (cb) {
       VersionModel.findOne().exec(function (err,obj) {
           cb(err,obj);
       })
    }, function (obj,cb) {
       var newVersion=new VersionModel(version);
        newVersion.save(function (err,version) {
            cb(err,version);
        });
    }], function (err,version) {
        callback(err,version);
    })
}

Version.getPagedList= function (pagedList,search,searchField,orderBy,order,condition,where,callback) {
    pagedList.query([],search,searchField,orderBy,order,condition,where);
    VersionModel.execPageQuery(pagedList.pageNumber,pagedList.pageSize,pagedList.where,null,pagedList.sort, function (err,objs) {
        pagedList.data=objs.rows;
        pagedList.pageCount=parseInt(objs.total/pagedList.pageSize)+1;
        pagedList.setTotal(objs.total);
        callback(err,pagedList);
    });
}



Version.getVersionById= function (id,callback) {
    VersionModel.findOne({_id:id}).exec(function (err,version) {
        callback(err,version);
    })
}


Version.findAll= function (callback) {
    VersionModel.find({}).exec(function (err,version) {
        callback(err,version);
    })
}

Version.delete= function (_id,callback) {
    VersionModel.remove({_id:_id}, function (err,version) {
        callback(err,version);
    })
}

Version.deleteList= function (array,callback) {
    VersionModel.remove({_id:{$in:array}}, function (err,version) {
        callback(err,version);
    })
}

Version.findAndUpdate= function (version,callback) {
    VersionModel.findOneUpdate({_id:version._id},version, function (err,version) {
        callback(err,version);
    })
}