var $button = $('#returnTop');
$(function(){
	$(window).scroll(function () {
		$(this).scrollTop() != 0 ? $button.fadeIn() : $button.fadeOut();
	});
})
$button.click(function () {
	$('body,html').animate({scrollTop:0}, 800);
});	

// 导航栏样式
!function(){
	var code, nav;
	if( $ && ( code = $('body').attr('page')) && (nav = $('.navigator a')) ){
		var thisPage = $('.navigator a[data-page='+code.split('-')[0]+']');
		if(thisPage.length > 0){
			thisPage.addClass('current');
		}
		$(nav[code.split('-')[0]]).addClass('current');
	}
}();


function getISPMsg( hwp ){
	try{
		if (!$.cookie('ISP')){
			hwp.HWP_GetIspInfo();
		}
	} catch (e){}
}
window.NotifyGetISPMsg = function( lISP, lpRecMsg ){
	$.cookie('ISP', lISP);
};

$(function(){
	//浏览器检测
	var userAgent = navigator.userAgent.toLowerCase();
	var check = function(regex){
	        return regex.test(userAgent);
	    },
	    isStrict = document.compatMode === "CSS1Compat",
	    version = function (is, regex) {
	        var m;
	        return (is && (m = regex.exec(userAgent))) ? parseFloat(m[1]) : 0;
	    },
	    docMode = document.documentMode,
	    isOpera = check(/opera/),
	    isIE = !isOpera && check(/msie/),
	    isIE7 = isIE && ((check(/msie 7/) && docMode != 8 && docMode != 9 && docMode != 10) || docMode == 7),
	    isIE8 = isIE && ((check(/msie 8/) && docMode != 7 && docMode != 9 && docMode != 10) || docMode == 8),
	    isIE9 = isIE && ((check(/msie 9/) && docMode != 7 && docMode != 8 && docMode != 10) || docMode == 9),
	    isIE10 = isIE && ((check(/msie 10/) && docMode != 7 && docMode != 8 && docMode != 9) || docMode == 10),
	    isIE6 = isIE && check(/msie 6/),
	    ieVersion = version(isIE, /msie (\d+\.\d+)/);
	var HWP;

	function IEIsProtectedMode() {
		var _model = HWP.HWP_IEIsProtectedMode();
		if( _model === 0) {
			Log("禁用保护模式");
			return false;
		} else if( _model === 1) {
			Log("启用保护模式");
			return true;
		}
	}
	    
	function detectCheck(){
		HWP = document.getElementById("shipin7Plugin") || ( window.wall && window.wall.active && wall.model.active.video.el.dom ) || document.getElementById("ShiPin7Ocx");
		if(isIE && !!HWP ) {
			if(  IEIsProtectedMode() ){
				$(".security-detect").fadeIn();
			}
		} else {
			setTimeout(detectCheck, 100);
		}
	}
	setTimeout(detectCheck, 100);
	
	// 如果是IE7，就认为浏览器开启了兼容模式
	if(isIE && ieVersion === 7) {
	    $(".compatible-detect").fadeIn();
	}


    //获取控件版本号信息
    var vers = window.vers = function(){
        var   HWP = document.getElementById("shipin7Plugin") || ( window.wall && window.wall.active && wall.model.active.video.el.dom ) || document.getElementById("ShiPin7Ocx");
        var  HWP_GetSpecialInfo ,
            _version;
        try{
            HWP_GetSpecialInfo = HWP.HWP_GetSpecialInfo( 0 );
            if(HWP_GetSpecialInfo === null){
                _version = HWP_GetSpecialInfo = '0.0.1.1';
            }else if(HWP_GetSpecialInfo === ''){
                _version = HWP_GetSpecialInfo = '0.0.1.2';
            }else{
                _version= /<Version>(.*)<\/Version>/.exec( HWP_GetSpecialInfo )[1];

                if( _version === null ){
                    _version = '0.0.1.3';
                }else if( _version === ''  ){
                    _version = '0.0.1.4';
                }
            }

        }catch(e) {
            _version =  HWP_GetSpecialInfo = '0.0.1.0';
        }
        return _version;
    }


});
