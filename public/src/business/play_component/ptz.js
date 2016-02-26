/**
 * Created by wangpei3 on 2015/3/17.
 */
define(function(require,exports){

    var underscore = require('underscore');
    var Backbone = require('backbone');
    var loadingBox = require('loadingBox').loadingBox;
    var toolClass = {
        ajaxURL : {
            list : basePath + '/device/preset/list.json?noCache=',
            set : basePath + '/device/preset/set.json?noCache=',
            deviceSwitch : basePath + '/device/deviceSwitch!swithRebotAlarm1.action?noCache=',
            update : basePath +  '/device/preset/update.json?noCache=',
            config : basePath +  '/device/preset/config.json?noCache='
        }
    };

    var tpl = {
        item : '<img src="<%= url %>">\
                <div class="cover">\
                    <i class="del"></i>\
                </div>\
                <p class="camerName <%= isHide %>"><span><%= name %></span> <a class="editName"></a></p>\
                <p class="setLocationName <%= isFirst %>">\
                    <input type="text" placeholder="请输入位置名称" class="editing" value="">\
                    <input type="submit" class="saveNewName" value="保存"> \
                    <span class="reError"></span>\
                </p>',
        empty : '<div class="empty_info">\
                     <h3>请点击右上角加号添加位置</h3>\
                     <p>(位置收藏后，方便摄像机快速定位）</p>\
                  </div>',
        loading: '<div class="loadingImg"></div>'
    };


    var LocationView = Backbone.Model.extend({
        defaults : {
            url : '',
            name : '',
            index : ''
        }
    });

    var getErrorMsg = function(str,resultCode){
            var getResultCode = ''; 
            var getOtheResultCodeStr = str + '可能是网络异常，请稍后重试' + getResultCode;
            dialog.warn( Locations.ptzErrorCode[resultCode] || getOtheResultCodeStr);
        }


    var LocationList = Backbone.Collection.extend({
        url : toolClass.ajaxURL.list,
        model : LocationView,
        isUseble : function(){
            if(wall.model.active.info.status == 2){
                dialog.warn('设备不在线，请刷新或检查设备网络');
                return false;
            }else if(wall.model.active.info.privacy){
                dialog.warn('镜头已遮蔽，无法操作云台');
                return false;
            }else if( $('._Toolbar').hasClass('_disable') ){
                dialog.warn('当前设备状态不能进行相关操作');
                return false;
            }
            return true;
        },
        ptzErrorCode : {
            "2003" : '设备不在线',
            "2009" : '设备请求响应超时',
            "1310720" : '镜头转动中，请稍后',
            "1310721" : '听声辨位已开启，操作失败',
            "1310722" : '轨迹巡航中，请稍等',
            "1310723" : '当前位置已被删除，请返回刷新',
            "1310724" : '当前就在这个位置哦',
            "1310725" : '听声辨位中，请稍候',
            "1310726" : '镜头转动中，请稍后',
            "1310727" : '操作太频繁啦，先歇歇吧',
            "1310728" : '操作太频繁啦，先歇歇吧',
            "1310729" : '操作失败',
            "1310730" : '已经不能收藏更多了',
            "1310731" : '镜头已遮蔽，无法操作云台',
            "1310732" : '操作太频繁啦，先歇歇吧',
            "1310733" : '镜头转动中，请稍后',
            "1310734" : '操作失败，正在对讲中'
        }
    });
    
   
    var Locations = new LocationList(); 
   

    

    var LocationView = Backbone.View.extend({
        tagName : 'div',
        className : 'cl_item',
        template : underscore.template(tpl.item),
        events : {
            'click .editName' : 'edit',
            'blur .editing' : 'update',
            'click .saveNewName' : 'update',
            'click .del' :'clear',
            'click .cover' : 'config',
            'click img' : 'config'
        },
        initialize : function(){
            this.listenTo(this.model,'change',this.render);
            this.listenTo(this.model,'destroy',this.remove);
            this.setValue();
        },
        setValue : function(){
            this.info = window.wall.model.active.info;
            this.channelNo = parseInt((this.info.channelNo - 2)/100);
            this.subSerial = this.info.subSerial;
            this.data = {};
            this.data.channelNo = this.channelNo;
            this.data.subSerial = this.subSerial;
        },
        render : function(){
            $(this.el).html(this.template(this.model.toJSON()));
            this.ipt = $(this.el).find('.editing');
            return this;
        },
        edit: function(){
            $(this.el).find('.setLocationName').removeClass('hide gray');
            $(this.el).find('.editing').val(this.model.attributes.name).focus();
            $(this.el).find('.camerName').addClass('hide');   
        },
        update : function(){
            //if(!Locations.isUseble()){return false;}
            var data = this.data;
            data.index = this.model.get('index');
            var model = this.model;
            var $elem  = $(this.el);
            data.name = (this.ipt.val() && this.ipt.val() != '请输入位置名称' ? this.ipt.val() : '位置' +model.attributes.index);
            if (data.name.length > 50) {
                $elem.find(".reError").removeClass('hide').html("不能超过50个字符");
                return false;
            } else if(/[\^\$\.\*\+\?\=\!\:\|\\\/\[\]\{\}\%\&\'\"\<\>]/.test(data.name)){
                $elem.find(".reError").removeClass('hide').html("不支持^.*[\\\\/:\\*\\?\"<>\\|'%]+.*$组合"); //名称不能包含非法字符12
                return false;
            }else if(/\s/.test(data.name)){
                $elem.find(".reError").removeClass('hide').html("名称不能包含空格");
                return false;
            }else {
                $elem.find(".reError").addClass('hide');
            }    
           
            loadingBox.show('收藏中...');

            $.ajax({
                url : toolClass.ajaxURL.update + Math.random(),
                type : 'post',
                data : data,
                success : function(r){
                    loadingBox.hide();
                    switch (r.resultCode){
                        case '0':
                            model.set({name : r.Preset.name});
                            hint.show('修改成功！');
                            $elem.find('.setLocationName').addClass('hide');
                            $elem.find('.camerName').removeClass('hide');
                            break;
                        default :
                            getErrorMsg('信息更新失败，',r.resultCode);
                            //dialog.warn( Locations.ptzErrorCode[r.resultCode] || '信息更新失败，可能是网络异常，请稍后重试');
                    }
                }
            });
        },
        clear : function(e){
            //if(!Locations.isUseble()){return false;}
            e.stopPropagation();
            var model = this.model;
            var data = this.data;
            data.configPreset = "CLE_PRESET";
            data.index = model.get('index');
            var deleteDevice = function(){
                $.ajax({
                    url : toolClass.ajaxURL.config + Math.random(),
                    data : data,
                    success : function(r){
                        loadingBox.hide();
                        switch (r.resultCode){
                            case '0':
                                hint.show('位置删除成功！');
                                model.destroy();
                                if(!Locations.models.length){
                                    $('.cl_list').html(tpl.empty);
                                }
                                break;
                            default :
                            getErrorMsg('位置删除失败，',r.resultCode);
                                //dialog.warn( Locations.ptzErrorCode[r.resultCode] || '位置删除失败，可能是网络异常，请稍后重试');
                        }
                    }
                });
            };
            dialog.warn({
                title :'删除位置',
                content: '确定要删除位置吗？',
                btn: [['确定','ok'],['取消','cancel']],
                handler : function( type ){
                    if( type == 'ok' ){
                        loadingBox.show('正在删除中...');
                        deleteDevice();
                    }
                }
            });
        },
        config : function(e){
            if(!Locations.isUseble()){return false;}
            var target = $(e.target);
            if(target.hasClass('iDisabled')){
                return;
            }
            target.addClass('iDisabled');

            var _this = this;
            var model = this.model;
            var data = this.data;
            data.configPreset = 'GOTO_PRESET';
            data.index = model.get('index');
            $.ajax({
                url : toolClass.ajaxURL.config + Math.random(),
                data : data,
                success : function(r){
                    target.removeClass('iDisabled');
                    switch(r.resultCode){
                        case "0":
                            break;
                        default :
                        getErrorMsg('位置调用失败，',r.resultCode);
                           // dialog.warn( Locations.ptzErrorCode[r.resultCode] || '位置调用失败，可能是网络异常，请稍后重试');
                    }
                }
            });
        }
    });

    var AppView = Backbone.View.extend({
        el : $('.list'),
        events : {
            'click .tab' : 'tabSwitch',
            'click #addLocation' : 'createOne',
            'click .icon-switch' : 'switchVoiceSource'
        },
        initialize : function(){
            this.listenTo(Locations,'add',this.addOne);
            this.listenTo(Locations,'reset',this.setValue);
        },
        fetch : function(){
            var _this = this;
            this.setValue();
            var newArr = [];
            _this.emptyLoading();
            if(window.wall.model.active.info.support_ptz){
                $.ajax({
                    url : toolClass.ajaxURL.list + Math.random(),
                    data : this.data,
                    type : 'post',
                    success:function(response) {

                        switch (response.resultCode){
                            case '0':
                                Locations.reset();
                                _this.emptyView();
                               
                                if(response.data && response.data.length){
                                    for(var i = 0,l = response.data.length;i < l;i++){
                                        var data = response.data[i];
                                        var obj = {
                                            url : data.picUrl,
                                            name :data.name,
                                            index : data.index,
                                            isHide: '',
                                            isFirst: 'hide'
                                        };
                                        newArr.push(data.index);
                                        Locations.add(obj);
                                    }
                                }
                                _this.indexArr = newArr;
                                break;
                            default :
                                getErrorMsg('',response.resultCode);
                                //dialog.warn( Locations.ptzErrorCode[r.resultCode] || '可能是网络异常，请稍后重试' );
                        }
                        if(!Locations.models.length){
                            $('.cl_list').html(tpl.empty);
                        }
                    },
                    error: function(){
                        $('.cl_list').html(tpl.empty);
                    }
                });
            }
        },
        setValue : function(){
            this.info = window.wall.model.active.info;
            this.channelNo = parseInt((this.info.channelNo - 2)/100);
            this.subSerial = this.info.subSerial;
            this.data = {};
            this.data.channelNo = this.channelNo;
            this.data.subSerial = this.subSerial;
            this.checkStatus();
            //this.emptyView();
        },
        checkStatus : function(){
            this.info = window.wall.model.active.info;
            this.info.voiceSource ? this.$('.icon-switch').removeClass('icon-switch-close') : this.$('.icon-switch').addClass('icon-switch-close');
            if(this.info.privacy || this.info.status == 2){ //镜头遮蔽或者设备不在线
                $(this.el).find('#addLocation').addClass('disabled');
                $('.cl_item').addClass('disabled');
                $(this.el).find('.icon-switch').addClass('disabled');
            }else{
                $(this.el).find('#addLocation').removeClass('disabled');
                $('.cl_item').removeClass('disabled');
                $(this.el).find('.icon-switch').removeClass('disabled');
            }
            if(!Locations.models.length){
                $('.cl_list').html(tpl.empty);
            }
        },
        emptyView: function(){
            this.$('.cl_list').html('');
        },

        emptyLoading: function(){
            this.$('.cl_list').html(tpl.loading);
        },

        addAll : function(){
            Locations.each(this.addOne);
        },
        addOne : function(iLocation){
            var view = new LocationView({model:iLocation});
            this.$('.cl_list').append(view.render().el);
        },
        tabSwitch : function(e){
            var target = $(e.target);
            e.stopPropagation();
            this.checkStatus();
            target.addClass('t_active').siblings().removeClass('t_active');
            switch (target.index()){
                case 0:
                    this.$('.listBox').show();
                    this.$('.content-PTZ').hide();
                    $('#operate').hide();
                    break;
                case 1:
                    this.$('.listBox').hide();
                    this.$('.content-PTZ').show();
                    $('#operate').show();
                    break;
            }
        },
        createOne : function(e){
            e.stopPropagation();
            if(!Locations.isUseble()){return false;}
            //if(Locations.models.length >= 12){
            //dialog.warn('暂时只支持收藏12个位置');
            //return;
            //}
            var player = window.wall.model.active;
            var data = this.data;
            var num = Locations.models.length;
            var _this = this;
            var newArr = _this.indexArr;
            
            if(newArr.length ){
                for(var i in newArr){
                    if(newArr[i] == num && newArr.length<13){
                        newArr.push(++num);
                    }
                }
            }else{
               newArr.push(++num);
            }
            _this.indexArr= newArr ;
            
            data.name = '位置' + _this.indexArr.length-1;
            var ret = player.video.capture();
            if( ret==='' ){ dialog.warn('截图失败，请重新收藏'); return false; }
            data.fileData = player.video.el.HWP_GetFileContent(ret,0,0);
            loadingBox.show('收藏中...');
            $.ajax({
                url : toolClass.ajaxURL.set + Math.random(),
                data : data,
                type : 'post',
                success : function(r){
                    loadingBox.hide();
                    switch (r.resultCode){
                        case '0':
                            if(!Locations.models.length){
                                _this.emptyView();
                            }
                            var info = r.Preset;

                            var obj = {
                                url : info.picUrl,
                                name : info.name,
                                index : info.index,
                                isHide: 'hide',
                                isFirst: 'gray'
                            };
                            Locations.add(obj);
                            
                            $(_this.el).find('.editing:visible').focus();
                            $(_this.el).find('.editing:visible').keydown(function(){
                                $(this).closest('.setLocationName').removeClass("gray");
                            });
                            break;
                        default :
                        getErrorMsg('位置收藏失败，',r.resultCode);
                        //dialog.warn( Locations.ptzErrorCode[r.resultCode] || '位置收藏失败，可能是网络异常，请稍后重试');
                    }
                }
            });
        },
        switchVoiceSource : function(){
            if(!Locations.isUseble()){return false;}
            var btn = this.$('.icon-switch');
            var data = {};
            data.serial = this.subSerial;
            data.enable =btn.hasClass('icon-switch-close') ? 1 : 0;
            data.type = 8;
            btn.hasClass('icon-switch-close') ? loadingBox.show('正在开启中') : loadingBox.show('正在关闭中');
            $.ajax({
                url : toolClass.ajaxURL.deviceSwitch + Math.random(),
                data : data,
                success : function(r){
                    loadingBox.hide();
                    switch (r.resultCode){
                        case '0':
                            if(data.enable){
                                btn.removeClass('icon-switch-close');
                                hint.show('开启成功');
                            }else{
                                btn.addClass('icon-switch-close');
                                hint.show('关闭成功');
                            }
                            break;
                        default :
                        getErrorMsg('',r.resultCode);
                            //dialog.warn( Locations.ptzErrorCode[r.resultCode] || '可能是网络异常，请稍后重试');
                    }
                }
            });
        }
    });

    exports.component = AppView;
});
