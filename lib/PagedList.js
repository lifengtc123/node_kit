/**
 * Created by lifeng on 15/9/2.
 */
/**
 * Created by lifeng on 15/3/30.
 */
function PagedList(req){
    this.params = req.query;
    this.pageSize=10;
    this.pageNumber = 1;
    this.pageCount;  //总页数
    this.rowCount;//总的记录数
    this.action=req.url;
    if(this.action.indexOf("?")>0)this.action=this.action.substr(0,this.action.indexOf("?"));
    if(this.params.pageSize!=null)this.pageSize=this.params.pageSize;
    if(this.params.pageNumber!=null)this.pageNumber=this.params.pageNumber;
};

module.exports=PagedList;

PagedList.prototype.query=function(models,search,searchField,orderBy,order,condition,where) {
    var q={};

    if(search!=null&&search!=""){

        if(condition==null||condition=="like"){
            search=new RegExp(search,"i");
        }else if(condition==">"){
            search={$gt:search};
        }else if(condition=="<"){
            search={$lt:search};
        }


        if(searchField!=null){   //如果限定查询字段
            models=[searchField];
        }
        if(models.length==1){
            q[models[0]]=search;
        }
        for(var x in models){
            var s={};
            s[models[x]]=search;
            if(q["$or"]==null)q["$or"]=[]
            q["$or"].push(s);
        }
    }


    this.where=q;
    if(where!=null){
        this.where={$and:[this.where,where]};
    }



    if(orderBy==null){
        orderBy="_id";
    }

    if(order==null){
        order="desc";
    }

    this.sort={sort:{}};
    this.sort["sort"][orderBy]=order;

};

PagedList.prototype.setTotal=function(total){
    this.rowCount=total;

}

PagedList.prototype.getCallbackURL=function(i){
    var url=this.action+"?"
    this.params['pageNumber']=i;
    for(var key in this.params){
        url+=key+"="+this.params[key]+"&";
    }
    return url
}
