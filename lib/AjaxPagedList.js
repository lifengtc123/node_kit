/**
 * Created by lifeng on 15/3/30.
 */
function AjaxPagedList(req){
    var params = req.query;
    this.iDisplayLength=params.iDisplayLength;
    this.iDisplayStart = parseInt(params.iDisplayStart);
    if(this.iDisplayLength==-1)this.iDisplayLength=null;
    this.sSearch=params.sSearch;
    this.bRegex=params.bRegex;
    this.sEcho=params.sEcho;
    this.iColumns=parseInt(params.iColumns);
    this.mDataProps=new Array();
    this.sSearchs=new Array();
    this.bSearchables=new Array();
    this.bSortables=new Array();
    for(var i=0;i<this.iColumns;i++){
        this.mDataProps.push(params["mDataProp_"+i]);
        this.sSearchs.push(params["sSearch_"+i]);
        this.bSearchables.push(eval(params["bSearchable_"+i]));
        this.bSortables.push(eval(params["bSortable_"+i]));
    }
    this.iSortingCols=parseInt(params["iSortingCols"]);
    var iSortCols=new Array();
    var sSortDirs=new Array();
    var bSearchables=new Array();
    for(var i=0;i<this.iSortingCols;i++){
        iSortCols.push(parseInt(params["iSortCol_"+i]));
        sSortDirs.push(params["sSortDir_"+i]);
        bSearchables.push(eval(params["bSearchable"]));
    }

};

module.exports=AjaxPagedList;

AjaxPagedList.prototype.find=function(Obj,where,callback){
    var sEcho=this.sEcho;
    if(this.sSearch!=null&&this.sSearch!=""){
        this.sSearch=new RegExp(this.sSearch,"i");
        where["$or"]=new Array();
        for(var i=0;i<this.iColumns;i++){
            if(this.bSearchables[i]){
                var s=this.mDataProps[i];
                var objs={};
                objs[s]=this.sSearch;
                where["$or"].push(objs);
            }
        }


    }
    options={sort:{_id:-1},limit:this.iDisplayLength,skip:this.iDisplayStart};
    Obj.Model().find(where,null,options,function(err,objs){
        Obj.Model().count(where,function(err,total) {
            callback(err, {iTotalRecords: total, iTotalDisplayRecords: total, sEcho: sEcho, aaData: objs});
        })
    });
};