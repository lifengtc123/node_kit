
/*好友请求 、、新的好友列表弹出框 每个请求全部处理后，刷新页面
 *    如果用户没有处理，就关闭了弹出框，不刷新页面。
 *    如果用户已经处理过了，关闭了弹出框，则刷新页面。
 *    如果用户将所有请求都处理了，自动关闭弹出框，刷新页面。
 
 *   调用接口 说明文档 ： http://nvwa.hikvision.com.cn/pages/viewpage.action?pageId=8808013
 *   后端开发者 -- 彭雄伟
 *   前端开发者 -- 汪洋
 *   前端开发日志：
 *   创建日期： 2015.07.18 下午
 *       
*/

define(function(require, exports){

    var dialog = require('dialog');

    var _ =require('underscore');    

    require('./css.css');

    //标记 ：接受个数 ，如果接受个数大于0，点击弹出框的close，刷新页面
    var acceptNum = 0;

    //标记数组 ： 每次点击某个请求的 接受或拒绝按钮，保存该 记录，直到该请求响应后移除。
    //防止重复请求。
    var ajaxMarkArray = [];

    //true 首页、云图像、消息 执行修改模板
    var isUnderTemplateBool = window.location.href.indexOf('userAction!goToMyShipin7.action') > -1 ||
                              window.location.href.indexOf('cloudService!gotoCloudView.action') > -1 ||
                              window.location.href.indexOf('alarmLogAction!goToAlarmLogQuery.action') > -1 ||
                              window.location.href.indexOf('leaveMessageAction!goToLeaveMessageQuery.action') > -1;
              
 
    // 修改模版标签为
    // <? ?>、<?= ?>、<?- ?>
    if(isUnderTemplateBool){
        _._.templateSettings = {
            evaluate : /\<\?([\s\S]+?)\?\>/g,
            interpolate : /\<\?=([\s\S]+?)\?\>/g,
            escape : /\<\?-([\s\S]+?)\?\>/g
        };
    }

    //帮助类
    var Help = {
        //自定义弹出框， 使用方法 myDialog({width:300,height:250,title:'我的测试',content:'测试',id:'firstDialog',btn:true});
         myDialog: function(config, callback){
            var Hint = function( config ) {
                var me = this;
                me.init( me.config = $.extend( {},me.initConfig, config || {} ) );
            };

            $.extend( Hint.prototype, {
                constructor: Hint,
                initConfig : {width: 200, height:'',title:'内容',content:'内容',btn:true, id: 'myDialog'+parseInt(Math.random()*100),callback:function(){ }, zIndex:8888 },
                init : function(){
                    var me = this;
                    var config = me.config;

                    this.hides = false;

                    me.config.callback();

                    var tops = 0;
                    if(config.height  == 'auto'){
                        tops = 100;
                    } else {
                        tops = config.height/2;
                    }

                    var style= 'width:'+config.width+'px;height:'+config.height+'px;margin-top:-'+tops+'px;margin-left:-'+config.width/2+'px;z-index:'+config.zIndex;
                    var btnStyle = config.btn ? '': 'hide';
                    var htmlContent = '<div class="myDialog" style="'+style+'" id="'+config.id+'">' +
                        '<iframe src="" frameborder="0" border="0" style="width:100%;height:100%;position:absolute;top:0;left:0;z-index:-1;border: none;"></iframe>'+
                        '<div class="myDialog-header">' +
                        '<div class="myDialog-title">'+config.title+'</div>' +
                        '<div class="myDialog-close" title="关闭"><strong>X</strong></div>' +
                        '</div>' +
                        '<div class="myDialog-content">'+config.content+'</div>' +
                        '<div class="myDialog-footer '+btnStyle+'">' +
                        '<input type="button"  style="cursor:pointer" class="btnStyle handler myDialog-isOk" value=" 确 定 ">' +
                        '<input type="button"   style="cursor:pointer" class="btnStyle handler myDialog-isCancel" value=" 取 消 ">' +
                        '</div>' +
                        '</div>';

                    var fullStyle = 'width:'+$("body").width()+'px;height:'+$("body").height()+'px;z-index:'+(config.zIndex-1)+';display:none;';
                    var fullbg = '<div class="fullbg" style="'+fullStyle+'"></div>';

                    me.fullbg = $(fullbg);

                    $('body').append(me.fullbg);

                    me.htmlContent = $(htmlContent);

                    $('body').append(me.htmlContent);

                    $('#'+this.config.id).on('click','.myDialog-close, .myDialog-isCancel',function(){
                        me.remove();
                    });

                    $('#'+this.config.id).on('click','.myDialog-isOk',function(){
                        me.isOk();
                    });

                    me.$dom = $('#'+this.config.id);

                },

                show : function(){
                    this.hides = false;
                    $('#'+this.config.id).show();
                    this.fullbg.show();
                    return this;
                },

                hide : function(){
                    this.hides = true;
                    $('#'+this.config.id).hide();
                    this.fullbg.hide();
                    return this;
                },

                remove: function(){
                    this.hides = true;
                    $('#'+this.config.id).remove();
                    this.fullbg.remove();
                    return this;
                },

                isOk: function(){
                    if( typeof callback == "function" ) {
                        callback && callback();
                        this.remove();
                    } else {
                        this.remove();
                    }
                },

                setContent: function(view){
                    this.content = view;
                    this.$dom.find('.myDialog-content').html(view);
                }

            });

            return new Hint(config);
        }
    };


    //创建一个好友请求类
    var friendsAccept = {

        //新好友列表模型
        inviteFriendList:[],

        //视图 
        view: '', 

        //弹出框保存变量Dom
        dialogDom:'',

        //请求地址
        url:{
           // 好友邀请列表 
           inviteList :basePath+'/api/front/shareFriend/invite/list.hik',

           //接受好友请求
           accept :basePath+'/api/front/shareFriend/accept.hik',

           //拒绝好友请求
           reject :basePath+'/api//front/shareFriend/reject.hik'

        },

        // 异步请求数据
        // ajaxUrl ，请求路径
        // type, 请求类型 type = 0  POST, type=1 GET
        // config , 请求参数
        // callBack, 回调函数
        ajax: function( ajaxUrl,type,callBack,config,errorCallback , resource ){
            var me = this;
            $.ajax({
                type: ['POST','GET'][type],
                url : ajaxUrl,
                data: config || {},
                success: function( data){
                    if( resource ){
                        callBack.call( me, data, resource );
                    }else{
                        callBack.call( me, data );
                    }
                }.bind(me),
                error: function(){
                    errorCallback && errorCallback.call(me);
                    window.console && console.log('获取数据失败，请检查您的网络');
                }
            });
        },

        template: {
            //弹出框主体
            mainPart: function(collection){
                var tpl = '';

                if(collection.length == 1){
                    if(isUnderTemplateBool){
                        tpl = '<div class="Dialog-friendsAccept">'+
                                 '<? _.each(collection, function(obj){ ?>'+
                                     '<div class="Dialog-friendsAccept-main clearfix">'+
                                       '<img src="<?= obj.friendAvatar ?>" class="friendAvatar" onerror="errorLoadImg(this)">'+
                                       '<div class="Dialog-friendsAccept-info">'+
                                          '<span class="friendName" title="<?= obj.friendName ?>"><?= obj.friendName ?></span>'+
                                          '<span class="remak" title="<?= obj.requestDesc ?>">验证消息：<?= obj.requestDesc ?></span>'+
                                          '<span>请求添加为您的好友</span>'+
                                       '</div>'+
                                     '</div>'+ 
                                     '<div class="Dialog-friendsAccept-footer">'+
                                       '接受好友请求后，好友分享的视频会被自动接受，详细可见 '+
                                       '<a href="'+basePath+'/camera/cameraAction!manageCamera.action" title="配置管理">配置管理></a><a href="'+basePath+'/api/front/friendGroup/listPage.hik" title="好友管理">好友管理</a>' +
                                     '</div>'+
                                     '<div class="buttonBox clearfix">'+
                                        '<a href="javascript:;" class="btn accept" shareFriendId=<?= obj.shareFriendId ?> >接受</a>'+
                                        '<a href="javascript:;" class="btn reject" shareFriendId=<?= obj.shareFriendId ?> >拒绝</a>'+
                                     '</div>' +
                                  '<? }) ?>'+   
                              '</div>';
                    } else {

                        tpl = '<div class="Dialog-friendsAccept">'+
                                 '<% _.each(collection, function(obj){ %>'+
                                     '<div class="Dialog-friendsAccept-main clearfix">'+
                                       '<img src="<%= obj.friendAvatar %>" class="friendAvatar" onerror="errorLoadImg(this)">'+
                                       '<div class="Dialog-friendsAccept-info">'+
                                          '<span class="friendName" title="<%= obj.friendName %>"><%= obj.friendName %></span>'+
                                          '<span class="remak" title="<%= obj.requestDesc %>">验证消息：<%= obj.requestDesc %></span>'+
                                          '<span>请求添加为您的好友</span>'+
                                       '</div>'+
                                     '</div>'+ 
                                     '<div class="Dialog-friendsAccept-footer">'+
                                       '接受好友请求后，好友分享的视频会被自动接受，详细可见 '+
                                       '<a href="'+basePath+'/camera/cameraAction!manageCamera.action" title="配置管理">配置管理></a><a href="'+basePath+'/api/front/friendGroup/listPage.hik" title="好友管理">好友管理</a>' +
                                     '</div>'+
                                     '<div class="buttonBox clearfix">'+
                                        '<a href="javascript:;" class="btn accept" shareFriendId=<%= obj.shareFriendId %> >接受</a>'+
                                        '<a href="javascript:;" class="btn reject" shareFriendId=<%= obj.shareFriendId %> >拒绝</a>'+
                                     '</div>' +
                                  '<% }) %>'+   
                              '</div>';
                    }

                } else if( collection.length >1 ){
                    if(isUnderTemplateBool){
                        tpl = '<div class="Dialog-friendsAccept">'+
                                '<ul class="inviteListBox">'+
                                  '<? _.each(collection, function(obj){ ?>'+
                                    '<li class="clearfix">'+
                                       '<img src="<?= obj.friendAvatar ?>"  class="friendAvatar" onerror="errorLoadImg(this)">'+
                                       '<div class="Dialog-friendsAccept-info">'+
                                         '<span class="friendName" title="<?= obj.friendName ?>"><?= obj.friendName ?></span>'+
                                         '<span class="remak" title="<?= obj.requestDesc ?>">验证消息：<?= obj.requestDesc ?></span>'+
                                         '<span>请求添加为您的好友</span>'+
                                         '<div class="buttonBox buttonBox-more clearfix">'+
                                            '<a href="javascript:;" class="btn accept" shareFriendId=<?= obj.shareFriendId ?> >接受</a>'+
                                            '<a href="javascript:;" class="btn reject" shareFriendId=<?= obj.shareFriendId ?> >拒绝</a>'+
                                         '</div>' +
                                       '</div>'+
                                    '</li>' +
                                  ' <? }) ?>'+
                                '</ul>'+ 
                                '<div class="Dialog-friendsAccept-footer">'+
                                   '接受好友请求后，好友分享的视频会被自动接受，详细可见 '+
                                   '<a href="'+basePath+'/camera/cameraAction!manageCamera.action" title="配置管理">配置管理></a><a href="'+basePath+'/api/front/friendGroup/listPage.hik" title="好友管理">好友管理</a>' +
                                '</div>'+
                              '</div>';
                    } else {
                        tpl = '<div class="Dialog-friendsAccept">'+
                                '<ul class="inviteListBox">'+
                                  '<% _.each(collection, function(obj){ %>'+
                                    '<li class="clearfix">'+
                                       '<img src="<%= obj.friendAvatar %>"  class="friendAvatar" onerror="errorLoadImg(this)">'+
                                       '<div class="Dialog-friendsAccept-info">'+
                                         '<span class="friendName" title="<%= obj.friendName %>"><%= obj.friendName %></span>'+
                                         '<span class="remak" title="<%= obj.requestDesc %>">验证消息：<%= obj.requestDesc %></span>'+
                                         '<span>请求添加为您的好友</span>'+
                                         '<div class="buttonBox buttonBox-more clearfix">'+
                                            '<a href="javascript:;" class="btn accept" shareFriendId=<%= obj.shareFriendId %> >接受</a>'+
                                            '<a href="javascript:;" class="btn reject" shareFriendId=<%= obj.shareFriendId %> >拒绝</a>'+
                                         '</div>' +
                                       '</div>'+
                                    '</li>' +
                                  ' <% }) %>'+
                                '</ul>'+ 
                                '<div class="Dialog-friendsAccept-footer">'+
                                   '接受好友请求后，好友分享的视频会被自动接受，详细可见 '+
                                   '<a href="'+basePath+'/camera/cameraAction!manageCamera.action" title="配置管理">配置管理></a><a href="'+basePath+'/api/front/friendGroup/listPage.hik" title="好友管理">好友管理</a>' +
                                '</div>'+
                              '</div>';
                    }
                }

                return _.template(tpl,{collection:collection}) || '' ;          
            }
        },

        set: function(collection,callback){
            this.inviteFriendList = collection;
            callback && callback.call(this);
            this.trigger('view:changeModel');
        },

        get: function(){
            return this.inviteFriendList;
        },

        on: function(ev, callback){
            var calls = this._callbacks || (this._callbacks = {});
            (this._callbacks[ev] || (this._callbacks[ev] = [] ) ).push(callback);
            return this;
        },

        trigger: function(){
           var args = Array.prototype.slice.call(arguments, 0);
           //拿出第一个参数，即事件名称
           var ev = args.shift();
     
           var list,calls,i,l;
           if(!(calls = this._callbacks)) return this;
           if(!(list = this._callbacks[ev])) return this;

           for(i = 0,l = list.length; i < l; i++ ){
               list[i].apply(this,args);
           }
           return this;
        },         

        //弹出框
        //先请求完数据，如果有数据再弹出
        dialog: function(tpl){
            var me = this;

            me.dialogDom = Help.myDialog({width:300,height:'auto',btn:false, title:'新的好友',content:tpl,id:'friendsAcceptDialogMessage'});
            me.dialogDom.show();

            //接受
            me.dialogDom.$dom.on('click','.accept', function(e){
                var $target = $(e.target);
                var shareFriendId = $.trim($target.attr('shareFriendId'));
                var ddArray = _.each(ajaxMarkArray, function(value){
                    return value == shareFriendId;
                });
                if(!ddArray.length){
                   ajaxMarkArray.push(shareFriendId);
                   me.accept(shareFriendId); 
                }
                
            });

            //拒绝
            me.dialogDom.$dom.on('click','.reject', function(e){
                var $target = $(e.target);
                var shareFriendId = $.trim($target.attr('shareFriendId'));
                var ddArray = _.each(ajaxMarkArray, function(value){
                    return value == shareFriendId;
                });
                if(!ddArray.length){
                   ajaxMarkArray.push(shareFriendId); 
                   me.reject(shareFriendId);
                }
                
            });

            //点击弹出框的 close, 如果 acceptNum值大于0，刷新页面
            me.dialogDom.$dom.on('click','.myDialog-close, .myDialog-isCancel', function(){
                if(acceptNum>0){
                    setTimeout(function() {
                        window.location.reload();
                    }, 1000);
                }
            });
        },

        //接受
        accept: function(shareFriendId){
            var me = this;
            me.ajax(
                me.url.accept,
                0,
                function(data){
                    ajaxMarkArray = _.filter(ajaxMarkArray, function(value){
                        return value != shareFriendId;
                    });

                    if(data.resultCode == 0){
                        var inviteFriendList = _.filter(me.get(), function(obj){
                            return obj.shareFriendId != shareFriendId;
                        });
                        me.set(inviteFriendList);
                        acceptNum += 1;
                    } else {
                        var errorString = '请求失败';
                        switch(data.resultCode){
                            case '-6':
                               errorString = '参数错误';
                               break;
                            case '20004':
                               errorString = '好友跟当前用户不是好友关系';
                               break;
                            case '20002':
                               errorString = '好友不存在';      
                            default:
                               errorString = '请求失败';           
                        };
                        dialog.errorInfo(errorString);
                        window.console && console.log('请求失败');
                    }
                },
                {shareFriendId:shareFriendId},
                function(){
                    ajaxMarkArray = _.filter(ajaxMarkArray, function(value){
                        return value != shareFriendId;
                    }); 
                }
            );

        },

        //拒绝
        reject: function(shareFriendId){
            var me = this;
            me.ajax(
                me.url.reject,
                0,
                function(data){
                    ajaxMarkArray = _.filter(ajaxMarkArray, function(value){
                        return value != shareFriendId;
                    });

                    if(data.resultCode == 0){
                        var inviteFriendList = _.filter(me.get(), function(obj){
                            return obj.shareFriendId != shareFriendId;
                        });
                        me.set(inviteFriendList);
                    } else {
                        var errorString = '请求失败';
                        switch(data.resultCode){
                            case '-6':
                               errorString = '参数错误';
                               break;
                            case '20004':
                               errorString = '好友跟当前用户不是好友关系';
                               break;
                            case '20002':
                               errorString = '好友不存在';      
                            default:
                               errorString = '请求失败';           
                        };
                        dialog.errorInfo(errorString);
                        window.console && console.log('请求失败');
                    }
                },
                {shareFriendId:shareFriendId},
                function(){
                    ajaxMarkArray = _.filter(ajaxMarkArray, function(value){
                        return value != shareFriendId;
                    });
                }
            );
        },

        //请求数据
        getData: function(){
            var me = this;
            me.ajax(
                me.url.inviteList,
                0,
                function(data){ me.trigger('ajax:getData',data); }
            );
        },

        //添加事件
        addEvent: function(){
            var me = this;
            //注册事件
            me.on('ajax:getData',function(data){
                if(data.resultCode == 0){
                    if(data.inviteFriendList && data.inviteFriendList.length ){
                        _.each(data.inviteFriendList, function(obj){
                            if(obj.friendAvatar == null){
                                obj.friendAvatar = basePath+'/src/common/imgs/userpic.jpg';
                            }
                        });
                        me.set(data.inviteFriendList, function(){me.trigger('view:dialog')});
                    }
                } else {
                    window.console && console.log('数据请求异常,错误码'+data.resultCode);
                }
            });

            //当请求有数据时，触发弹出框
            me.on('view:dialog', function(){
                if(me.inviteFriendList.length){
                    me.dialog(me.template.mainPart(me.get()));
                }
            });

            //添加新好友请求视图显示列表。数据改变,视图随之更新
            me.on('view:changeModel', function(){
                if(me.get().length){
                    me.view = me.template.mainPart(me.get());
                    me.dialogDom.setContent(me.view);
                } else {
                    me.dialogDom.remove();
                    setTimeout(function() {
                        window.location.reload();
                    }, 1000);
                }
            });
        },

        init: function(){
            var me = this;
            me.addEvent();

            //开始请求数据
            me.getData();
        }
    };

    //当页面加载完后，过一段时间再请求数据
    $(function(){
        window.setTimeout(function(){
            friendsAccept.init.call(friendsAccept);
        }, 3000);
    });
    
    //错误时触发加载默认头像
    window.errorLoadImg = function(that){
        that.src = basePath+'/src/common/imgs/userpic.jpg';
    };

    exports.friendsAccept = friendsAccept;


});