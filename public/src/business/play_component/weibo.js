define(function(require, exports) {

	 // ---------------------微博----------------------//
	var dialog = window.dialog = require('dialog');
	
	var Weibo = {};
	var weiboType;
	var picPath;
	var domSrc = {};
	var pServerIp = 'www.shipin7.com',
		pServerPort = 8888;
		urlSlash = '/qq_weibo/';
	var title = '#萤石云# 亲，我正在使用萤石云，“无论身在何处，家和企业就在身边”，快快访问www.ys7.com了解一下吧~',
		rLink = 'http://' + window.location.host,
		site  = 'appkey';
	
	$('body').on("mouseover","#capturePicList .img-container",function(e){
		$(this).find('.img-toolbar').show();
	})
	$('body').on("mouseout","#capturePicList .img-container",function(e){
		$(this).find('.img-toolbar').hide();
	})

	function bindWeiboEvent(){
		$('body').on('mousedown','#capturePicList .xinlang',function(evt){
			weiboType = 1;//新浪微博
			evt = evt || window.event;
            evt.stopPropagation();
            evt.preventDefault();
			var srcDom = this.parentNode;
	        picPath = srcDom.getAttribute('info');
	        sendWeiboMessage(weiboType, srcDom);
            return false;
		});
		$('body').on('mousedown','#capturePicList .tengxun',function(evt){
			weiboType = 2;//腾讯微博
			evt = evt || window.event;
            evt.stopPropagation();
            evt.preventDefault();
			var srcDom = this.parentNode;
	        picPath = srcDom.getAttribute('info');
	        sendWeiboMessage(weiboType, srcDom);
            return false;
		});
		$('body').on('mousedown','#capturePicList .fengmian',function(evt){
			evt = evt || window.event;
            evt.stopPropagation();
            evt.preventDefault();
			var srcDom = this.parentNode;
	        picPath = srcDom.getAttribute('info');
	        var originalFileBase64 = $('.share-pic',srcDom.parentNode)[0].getAttribute('fileContent');
	        var sessionId = $.cookie('DDNSCOOKIE').split(',')[0];
	        var info = wall.model.active.info;
	        var puid = info.deviceSerial;
	        var chan = info.channelNo > 100 ? Math.round(info.channelNo/100) : Number(info.channelNo);
	        wall.toolbar.SetDefaultImage(sessionId, puid, chan, originalFileBase64, srcDom);
            return false;
		});
	}
	window.bindWeiboEvent = bindWeiboEvent;
	bindWeiboEvent();
	
	function sendWeiboMessage(weiboType, srcDom){
		var pic = srcDom.getAttribute('infoU');
		if(!pic){
			var ret = wall.model.active.video.el.HWP_UploadFile2Server(0,picPath,"",pServerIp,pServerPort);
			domSrc[ret] = srcDom;
		}else{
			if(weiboType == 1){
				shareTSina(title,rLink,site,pic);
			}else if(weiboType == 2){
				shareToWb(title,rLink,site,pic);
			}
		}
	}
	
	window.PluginEventMsg = function(lParam1, lParam2, lParam3, lParam4, hUser){
			switch(lParam1){
			case 6://MSG_UPLOADFILE_SUCC （6） 
				var pic = 'http://' + pServerIp + ':' + pServerPort + lParam4;
				domSrc[lParam2].setAttribute('infoU',pic);
				window.console && window.console.log('pic:' + pic);
				if(weiboType == 1){
					shareTSina(title,rLink,site,pic);
				}else if(weiboType == 2){
					shareToWb(title,rLink,site,pic);
				}
				break;
			case 7://MSG_UPLOADFILE_EXCEPTION(7)
				dialog.errorInfo({
	                 content:'发送失败,请重试!'
	             });
				break;
			default:
				break;
		}
	}
	// 配合monitor.js 保证发送微博功能正常
	window.PluginEventMsg2 = function(lParam1, lParam2, lParam3, lParam4, hUser){
		switch(lParam1){
		case 6://MSG_UPLOADFILE_SUCC （6） 
			var pic = 'http://' + pServerIp + ':' + pServerPort + lParam4;
			domSrc[lParam2].setAttribute('infoU',pic);
			window.console && window.console.log('pic:' + pic);
			if(weiboType == 1){
				shareTSina(title,rLink,site,pic);
			}else if(weiboType == 2){
				shareToWb(title,rLink,site,pic);
			}
			break;
		case 7://MSG_UPLOADFILE_EXCEPTION(7)
			dialog.errorInfo({
                content:'发送失败,请重试!'
            });
			break;
		default:
			break;
		}
	}

	exports.component = Weibo;
})
