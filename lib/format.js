//格式化方法
var moment = require('moment');
function format(app){
    app.locals.dateFormat=format.dateFormat;

    app.locals.sortUrl=function(url){

        return {
            addPar:function (ref, value)
        {

            var str = "";
            if (url.indexOf('?') != -1)
                str = url.substr(url.indexOf('?') + 1);
            else{
                url= url + "?" + ref + "=" + value;
                return this;
            }

            var returnurl = "";
            var setparam = "";
            var arr;
            var modify = "0";
            if (str.indexOf('&') != -1) {
                arr = str.split('&');
                for (i in arr) {
                    if (arr[i].split('=')[0] == ref) {
                        setparam = value;
                        modify = "1";
                    }
                    else {
                        setparam = arr[i].split('=')[1];
                    }
                    returnurl = returnurl + arr[i].split('=')[0] + "=" + setparam + "&";
                }
                returnurl = returnurl.substr(0, returnurl.length - 1);
                if (modify == "0")
                    if (returnurl == str)
                        returnurl = returnurl + "&" + ref + "=" + value;
            }
            else {
                if (str.indexOf('=') != -1) {
                    arr = str.split('=');
                    if (arr[0] == ref) {
                        setparam = value;
                        modify = "1";
                    }
                    else {
                        setparam = arr[1];
                    }
                    returnurl = arr[0] + "=" + setparam;
                    if (modify == "0")
                        if (returnurl == str)
                            returnurl = returnurl + "&" + ref + "=" + value;
                }
                else
                    returnurl = ref + "=" + value;
            }
            url=url.substr(0, url.indexOf('?')) + "?" + returnurl;
            return this;
        },
            getURL:function(){
                return url;
            }
    }
    }


    app.locals.selectTree=function(objs){
        var tree=[],hash={};

        objs.forEach(function(obj,index){
            hash[obj.cid]=obj;
        });
        objs.forEach(function(obj,index){
            var hashv=hash[obj.pid];
            if(hashv){
                !hashv["children"] && (hashv["children"] = []);
                hashv["children"].push(obj);
            }else{
                tree.push(obj);
            }
        });
        var list=[];

        function getList(nodes,qz){
            nodes.forEach(function(node,index){
                // 空格列
                var sb="";
                if (qz >= 1) {
                    sb+=" ";
                }
                // 线条列
                for (var i = 1; i < qz; i++) {
                    if (index!=nodes.length-1) {
                        sb+="┃";
                    } else {
                        sb+="　";
                    }
                }
                // 节点列
                if (qz == 0) {
                } else if (index==nodes.length-1) {
                    sb+="┗";
                } else {
                    sb+="┣";
                }
                node.name=sb+node.name;
                list.push(node);
                if(node.children!=null){
                    var qz2=qz+1;
                    getList(node.children,qz2);
                    node.children=null;
                }
            })
        }
        getList(tree,0);

        return list;
    }
}

module.exports= format;


format.dateFormat=function(date,format){
    if (format == undefined) {
        format = 'YYYY-MM-DD HH:mm:ss';
    }
    var ret = moment(date).format(format);
    return ret == 'Invalid date' ? '' : ret;
}

