//调用IOS方法插件

    var plugins = window.plugins || {};

    plugins.barcodeScanner = new function() {
         var self = this;
         this.encode =  function(type,data,name, parameter, success, fail){
           return Cordova.exec(success, fail, "MyPlugin", "QRcodeDrwa", [type,data,name]);
          };
        
        this.scan   =  function( success, fail){
            return Cordova.exec(success, fail, "MyPlugin", "QRCodeReader", []);
        };
    }

    plugins.audio = new function() {
        var self = this;
        //合成
        this.synthetic =  function(data, success, fail){
            return Cordova.exec(success, fail, "MyPlugin", "SynthesizedVoice", [data]);
        };
        //录制
        this.captureAudio   =  function(success, fail){
            return Cordova.exec(success, fail, "MyPlugin", "VoiceRecognizer", []);
        };
        //播放
        this.play   =  function(success, fail){
            return Cordova.exec(success, fail, "MyPlugin", "playVoice", []);
        };
        
    }

    plugins.wechat = new function() {
        var self = this;
        //授权
        this.login =  function(success, fail){
            return Cordova.exec(success, fail, "MyPlugin", "WeChat", []);
        };
        
        this.share =  function( parameter, success, fail){
            return Cordova.exec(success, fail, "MyPlugin", "ShareWeChat", parameter);
        };
    
    }

    plugins.device = new function() {
        var self = this;
        //授权
        this.start  =  function(success, fail){
            return Cordova.exec(success, fail, "MyPlugin", "StartDevice", []);
        };
        
    }


//var client = {
//    /**
//     * 调用IOS方法
//     * @param method 要调用IOS插件的方法名
//     * @param parameter 参数[数组]
//     * @param success 成功回调
//     * @param fail 失败回调
//     * @returns {*}
//     */
//    
//    QRCodeReader :  function(method, parameter, success, fail){
//        return Cordova.exec(success, fail, "MyPlugin", method, parameter);
//    },
//    
//    QRcodeDrwa :  function(method, parameter, success, fail){
//        return Cordova.exec(success, fail, "MyPlugin", method, parameter);
//    },
//    
//    WeChat:  function(method, parameter, success, fail){
//        return Cordova.exec(success, fail, "MyPlugin", method, parameter);
//    },
//    
//    VoiceRecognizer: function(method, parameter, success, fail){
//            return Cordova.exec(success, fail, "MyPlugin", method, parameter);
//        },
//    SynthesizedVoice: function(method, parameter, success, fail){
//        return Cordova.exec(success, fail, "MyPlugin", method, parameter);
//},
//    
//    StartDevice: function(method, parameter, success, fail){
//        return Cordova.exec(success, fail, "MyPlugin", method, parameter);
//    },
//    
//    ShareWeChat: function(method, parameter, success, fail){
//        return Cordova.exec(success, fail, "MyPlugin", method, parameter);
//    },
//    playVoice: function(method, parameter, success, fail){
//    return Cordova.exec(success, fail, "MyPlugin", method, parameter);
//},
//};