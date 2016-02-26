$(function() {
		var username;
		if(!!$.cookie) {
			if( !$.cookie("DDNSCOOKIE") ) return;
			username = $.cookie("DDNSCOOKIE").split(",")[2];
			$('.username').html(username);
			if($.cookie("DDNSCOOKIE").split(",")[7] === '2'){
				$('.navigator li').eq(0).addClass('hide');
				$('#serivceNav').css({'left':'335px'});
			}else{
				$('#serivceNav').css({'left':'482px'});
			}
			//如果是微门户的站点，那么样式略微做下调整
			if(isTinyWeb && isTinyWeb == 'true')
			{
				$('.account-box').css("right","70px");
			}
		}
		$(".quit").click(function() {
			//退出时，清除完善手机信息相关标记cookie。相关代码在 business/completePhoneNumber.js中
			var USERNAME = $.cookie('DDNSCOOKIE').split(',')[2];
			$.cookie(USERNAME+'completePhoneNumber',null,{path:'/'});

			$.cookie('UPGRADE', null, {path : '/'});
			//如果此web是微门户web，退出的链接需要修改一下
			if( isTinyWeb && isTinyWeb == 'true')
			{
				window.location.href='/logout?'+'host='+window.location.host+'&returnUrl=app-logout&r=' + Math.random();
				return;
			}
			window.location.href='/logout?host='+window.location.host+'&returnUrl=indx&r=' + Math.random();
		});
	});

	
$(function(){
	$(".navacc-box").bind("mouseover", function() {
		$(this).show();
	}).bind("mouseout", function() {
		$(this).hide();
	});
	//$(".yingshi-box").bind("mouseover", function() {
//		$(this).show();
//	}).bind("mouseout", function() {
//		$(this).hide();
//	});
	$(".navigation-box").bind("mouseover", function() {
		$(this).show();
	}).bind("mouseout", function() {
		$(this).hide();
	});
	
	$(".topnav-item .username").bind("mouseover", function() {
		$(".account-box").show();
	});

	$(".topnav-item .yingshiNav").bind("mouseover", function() {
		$(".yingshi-box").show();
	});
	$(".topnav-item .webNavagation").bind("mouseover", function() {
		$(".navigation-box").show();
	});
	$(".login").click(function() {
        window.location.href = basePath + '/auth?host=i.ys7.com&returnUrl=plugin&r=' + Math.random();  
	});
	
});
var HtmlUtil = window.HtmlUtil = {
    /*1.用浏览器内部转换器实现html转码*/
    htmlEncode:function (html){
        //1.首先动态创建一个容器标签元素，如DIV
        var temp = document.createElement ("div");
        //2.然后将要转换的字符串设置为这个元素的innerText(ie支持)或者textContent(火狐，google支持)
        (temp.textContent != undefined ) ? (temp.textContent = html) : (temp.innerText = html);
        //3.最后返回这个元素的innerHTML，即得到经过HTML编码转换的字符串了
        var output = temp.innerHTML;
        temp = null;
        return output;
    },
    /*2.用浏览器内部转换器实现html解码*/
    htmlDecode:function (text){
        //1.首先动态创建一个容器标签元素，如DIV
        var temp = document.createElement("div");
        //2.然后将要转换的字符串设置为这个元素的innerHTML(ie，火狐，google都支持)
        temp.innerHTML = text;
        //3.最后返回这个元素的innerText(ie支持)或者textContent(火狐，google支持)，即得到经过HTML解码的字符串了。
        var output = temp.innerText || temp.textContent;
        temp = null;
        return output;
    }
};

	