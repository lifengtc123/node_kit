/**
 * 设备格式化组件
 * 2013-10-14
 */

define(function(require, exports){
	
	var dialog = require( 'dialog' );

	var ocxOldVersion = {
		show:function(){
			dialog.warn({
		        'content': '您的控件不是最新版本，该功能无法使用，点击"确定"下载最新控件',
		        'cancelBtn':true,
                'btn':[['确定','ok'],['取消','cancel']],
		        'handler': function( type ){
                    if( type === 'ok' ){
                        location.href = basePath +'/assets/deps/PCPlayer.exe';
                    }

		        }
		    });
		}	
			
	};
	
	exports.ocxOldVersion = ocxOldVersion;
});