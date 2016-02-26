function showLayers(){
    if(!document.getElementById("shareLayer")) return false;
    if(!document.getElementById("l_box")) return false;
    var layerId = document.getElementById("shareLayer");
    var lBoxId = document.getElementById("l_box");
    if(layerId.offsetWidth == 30){
        layerId.style.width = "180px"
        lBoxId.style.display = "block";
    }else{
        layerId.style.width = "30px"
        lBoxId.style.display = "none";
    }
}
var appkeySina = '1585212127';
var appkeyQQ = '801291845';
var iWidth = 600,
	iHeight = 400,
	iTop = (window.screen.availHeight-30-iHeight)/2,
	iLeft = (window.screen.availWidth-10-iWidth)/2;
/*title是标题，rLink链接，summary内容，site分享来源，pic分享图片路径*/
function sendShareInfoLog(param){
	var type = {'real': '90001',
			'replay': '90002', 
			'replaylocal': '90003', 
			'goToAlarmLogQuery': '90004', 
			'DEFAULT': '90005', 
			'cloudService!gotoVideoPlay':'90006', 
			'cloudService!gotoCloudView':'90007', 
			'cloudService!gotoImageView':'90008',
			'cameraAction!showPicClips':'90009',
			'cameraAction!showMontage':'90010',
			'multiScreen':'90011'};
	var reg = /(real)|(replaylocal)|(replay)|(goToAlarmLogQuery)|(cloudService!gotoVideoPlay)|(cloudService!gotoCloudView)|(cloudService!gotoImageView)|(cameraAction!showPicClips)|(cameraAction!showMontage)|(multiScreen)/;
    var data = {
    		'userName' : $.cookie('DDNSCOOKIE').split(',')[2],
            'operationType' : param,
            'detail' : type[reg.test(window.location.href)? reg.exec(window.location.href)[0]: 'DEFAULT'],
            'browserVersion' :util.browserVersion,
            'sysVersion' :util.sysVersion
        };
    $.ajax({
       type: "POST",
       url: basePath+"/omm/ommAction!addUserActionInfo.action",
       data : data,
       success: function( data ){
            
       }
    }); 
}
/*新浪微博*/
function shareTSina(title,rLink,site,pic){
	window.console && window.console.log('sina:' + pic);
    window.open('http://service.weibo.com/share/share.php?title='+encodeURIComponent(title)+'&appkey='+encodeURIComponent(appkeySina)+'&pic='+encodeURIComponent(pic) + '&noCache=' + Math.random(),'_blank','scrollbars=no,width=' + iWidth + ',height=' + iHeight + ',left=' + iLeft + ',top=' + iTop + ',status=no');     
    sendShareInfoLog(90001);
}
/*腾讯微博*/
function shareToWb(title,rLink,site,pic){
	if(!!pic.match(/\w+\.\w+\.\w+:|([0-9]{1,3}\.{1}){3}[0-9]{1,3}:/)){
		var host = window.location.hostname + '/qq_weibo/';
		pic = pic.replace(/\w+\.\w+\.\w+:|([0-9]{1,3}\.{1}){3}[0-9]{1,3}:/,host);
	}
	window.console && window.console.log('qq:' + pic);
    window.open('http://share.v.t.qq.com/index.php?c=share&a=index&url=http://www.ys7.com&title='+encodeURIComponent(title)+'&appkey='+encodeURI(appkeyQQ)+'&pic='+encodeURIComponent(pic) + '&noCache=' + Math.random(),'_blank','scrollbars=no,width=' + iWidth + ',height=' + iHeight + ',left=' + iLeft + ',top=' + iTop + ',status=no');   
    sendShareInfoLog(90002);
}
/*人人*/
function shareRR(title,rLink,summary){
    window.open('http://widget.renren.com/dialog/feed?title='+encodeURIComponent(title)+'&link='+encodeURIComponent(rLink)+'&description='+encodeURIComponent(summary),'_blank','scrollbars=no,width=600,height=450,left=75,top=20,status=no,resizable=yes');
}
/*开心网*/
function shareKX(title,rLink,summary){
    window.open('http://www.kaixin001.com/repaste/bshare.php?rtitle='+encodeURIComponent(title)+'&rurl='+encodeURIComponent(rLink)+'&rcontent='+encodeURIComponent(summary),'_blank','scrollbars=no,width=600,height=450,left=75,top=20,status=no,resizable=yes' )    
}
/*QQ空间*/
function shareQzone(title,rLink,summary,site,pic){
    window.open('http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?title='+encodeURIComponent(title)+'&url='+encodeURIComponent(rLink)+'&summary='+encodeURIComponent(summary)+ '&site='+encodeURIComponent(site)+'&pics='+encodeURIComponent(pic),'_blank','scrollbars=no,width=600,height=450,left=75,top=20,status=no,resizable=yes')
}
/*百度*/
function shareBaiDu(title,rLink){
    window.open('http://apps.hi.baidu.com/share?title='+encodeURIComponent(title)+'&url='+encodeURIComponent(rLink),'_blank','scrollbars=no,width=600,height=450,left=75,top=20,status=no,resizable=yes')    
}
/*豆瓣*/
function shareDouBan(title,rLink){
    window.open('http://www.douban.com/recommend?title='+encodeURIComponent(title)+'&url='+encodeURIComponent(rLink),'_blank','scrollbars=no,width=600,height=450,left=75,top=20,status=no,resizable=yes')    
}