/**
 * Created by wangyang7 on 2014/5/13.
 */
define(function(require, exports) {
    var  dialog = require('dialog');

    window.ServerCloud = function(config) {

        $.extend(this, this.defaults, config || {});
        this.initialize();
    };

    $.extend(ServerCloud.prototype, {

        defaults : {
        },

        initialize : function() {
        },


        errorMsg: function(type){
            var text = '';
            switch (type){
                case 0: text='成功';
                    break;
                case 2009: text='设备响应超时，请检查您网络';
                    break;
                case 2003: text = '设备不在线，请检查您的网络';
                    break;
                case -1: text = '操作失败，服务器异常，请稍后再试';
                    break;
                case -6: text = '操作失败，参数错误';
                    break;
                case 2000: text = '操作失败，您的账户下无该设备';
                    break;
                case 8005: text = '设备版本过老，不支持云存储服务';
                    break;
                case 8002: text ='云服务没有开启';
                    break;
                case 8003: text ='云服务不存在';
                    break;
                case 8001: text ='云存储锁定上限';
                    break;
                case 8004: text ='云服务数量不合法';
                    break;
                default : text ="操作失败";
                    break;
            }
            return text;

        },

        // 根据服务类型获取通用的绑定参数
        getGeneralParams : function(serviceType) {
            var me = this;
            var deviceListSelectVal = $('.deviceListSelect').val();
            if (deviceListSelectVal == -1) {
				dialog.warn('无可用设备');
                return false;
            }
            var serviceYearNum = $('.serviceYearNum').val();
            if (serviceYearNum == -1) {
				dialog.warn('无可用服务');
                return false;
            }
            var serviceId = me.getServiceId(serviceType);
            var deviceSerial = deviceListSelectVal.split('_')[0];
            var channelNo = deviceListSelectVal.split('_')[1];
            var serviceType = serviceType;
            var serviceNum = serviceYearNum;

            var params = {
                deviceSerial : deviceSerial,
                serviceId : serviceId,
                channelNo : channelNo,
                serviceType : serviceType,
                serviceNum : serviceNum
            }

            return params;
        },

        getServiceId : function(serviceType) {
            var me = this;
            var cs = me.getCloudServiceInfo(serviceType);
            var serviceId = null;
            if (!$.isEmptyObject(cs)) {
                serviceId = cs.service_id;
            }
            return serviceId;
        },

        getCloudServiceInfo : function(serviceType) {
            var me = this;
            var cloudService;
            if (serviceType == 1) {
                cloudService = me.cloud.day.cloudService;
            } else if (serviceType == 2) {
                cloudService = me.cloud.timing.cloudService;
            } else if (serviceType == 3) {
                cloudService = me.cloud.event.cloudService;
            }
            return cloudService;
        },



        // 免费开通云服务
        openService:function( config,callback,me,that){
            //var me = this;
            var params;
            if ($.isEmptyObject(config)) {
                params = me.getGeneralParams(config.serviceType);
            } else {
                params = config;
            }
            if (!$.isEmptyObject(params)) {
                $.ajax({
                    type : 'POST',
                    url : basePath + '/service/cloudService!openFreeCloudService.action',
                    data : params,
                    before:function(){
                       // $(that).addClass('serviceBtnNewBefore');
                    },
                    success : function(data) {
                        var msg = me.errorMsg(parseInt(data.resultCode));
                        var isOk = data.resultCode === "0" ? true :false;
                        callback(isOk ,msg, data, that);
                    },
                    error : function() {
                        //$(that).removeClass('serviceBtnNewBefore');
                    }
                });
            } else{
				dialog.warn('绑定参数为空！');
            }
        },


        // 重新激活设备云服务
        resetActiveService : function(config,callback,me,that) {
            // loadingBox.show('重新激活中，请稍候...');
            //var me = this;
            $.ajax({
                type : 'POST',
                url : basePath + '/service/cloudService!activeCloudService.action',
                data : config,
                before:function(){
                   // $(that).addClass('serviceBtnNewBefore');
                },
                success : function(data) {
                    var msg = me.errorMsg(parseInt(data.resultCode));
                    var isOk = data.resultCode === "0" ? true :false;
                    callback(isOk ,msg, data, that);
                },
                error : function() {
                    //$(that).removeClass('serviceBtnNewBefore');
                }
            });
        },
        // 暂停设备云服务
        stopActiveService : function(config,callback,me,that) {
            // loadingBox.show('重新激活中，请稍候...');
            //var me = this;

            $.ajax({
                type : 'POST',
                url : basePath + '/service/cloudService!activeCloudService.action',
                data : config,
                before:function(){
                   // $(that).addClass('serviceBtnNewBefore');
                },
                success : function(data) {
                    var msg = me.errorMsg(parseInt(data.resultCode));
                    var isOk = data.resultCode === "0" ? true :false;
                    callback(isOk ,msg, data, that);
                },
                error : function() {
                   // $(that).removeClass('serviceBtnNewBefore');
                }
            });
        },

        //接口  type = [0,1,2]   开通 ， 暂停， 激活
        cloudService : function(config, type, callback){
            var me =this;
            [this.openService, this.stopActiveService, this.resetActiveService][ type ]( config, callback ,me);
        }
    });


    exports.ServerCloud = ServerCloud;
});