//$(function(){
//
//	//添加选择
//	$('.box_add_list li, .choose_color span, .shape span').on("click",function(){
//		if(!$(this).children('i').length){
//			$(this).append('<i class="iconfont">&#xe621;</i>').siblings().children('i').remove();
//		}
//	});
//
//	//初始化使用邀请码
//	if($('div').hasClass('initialization_invite_line')){
//		$('.initialization_invite').click(function(){
//			$('.initialization_invite_line').show();
//			$('.mask').show();
//		});
//		$('.mask').click(function(){
//			$('.initialization_invite_line').hide();
//			$('.mask').hide();
//		});
//	}
//
//	//用药编辑选择
//	$('.remind_choose .input_sub').click(function(){
//		$(this).addClass('on').siblings().removeClass('on');
//	});
//
//	//盒子信息
//	var intLine = $('.mybox_progress .line').width();
//	$('.mybox_progress .mybox_content').each(function(index){
//		var intContent = parseInt($(this).css('left'));
//		if(intLine >= intContent){
//			$(this).addClass('on');
//		}
//	});
//
//	//弹出语音按钮
//	if($('div').hasClass('input_talk')){
//		$('.input_talk').click(function(){
//			$('.talk_box').show();
//			$('.mask').show();
//		});
//		$('.mask').click(function(){
//			$('.talk_box').hide();
//			$('.mask').hide();
//		});
//	}
//
//	//弹出详细
//	if($('div').hasClass('input_content')){
//		$('.input_content').click(function(){
//			$('.box_info_list').show();
//			$('.mask').show();
//		});
//		$('.mask').click(function(){
//			$('.box_info_list').hide();
//			$('.mask').hide();
//		});
//	}
//
//	//弹出头部列表
//	if($('div').hasClass('header_face')){
//		$('.header_face').click(function(event){
//			$('.header_face_list').show();
//			$('.header_add_list').hide();
//			event.stopPropagation();
//		});
//		$('body').click(function(){
//			$('.header_face_list').hide();
//		});
//	}
//
//	if($('div').hasClass('header_add')){
//		$('.header_add').click(function(event){
//			$('.header_add_list').show();
//			$('.header_face_list').hide();
//			event.stopPropagation();
//		});
//		$('body').click(function(){
//			$('.header_add_list').hide();
//		});
//	}
//
//	//环形进度条
//	$(function() {
//		$('.circle').each(function(index, el) {
//			var num = $(this).find('b').text() * 3.6;
//			if (num<=180) {
//				$(this).find('.right').css('transform', "rotate(" + (num - 180) + "deg)");
//			} else {
//				$(this).find('.right').css('transform', "rotate(0deg)");
//				$(this).find('.left').css('transform', "rotate(" + num + "deg)");
//			};
//		});
//
//	});
//
//
//	if($('div').hasClass('habit_box')){
//		$('.habit_box .tit li').eq(0).css("color","#9a9a9a");
//		$('.habit_box .tit li').eq(6).css("color","#9a9a9a");
//
//		$('.habit_box .content ul').each(function(){
//			$(this).children("li").eq(0).css("color","#9a9a9a");
//			$(this).children("li").eq(6).css("color","#9a9a9a");
//		});
//	}
//
//	//头部弹出菜单去除最后一个li的底部线
//	$('.header_face_list li:last').css("border","none");
//	$('.header_add_list li:last').css("border","none");
//
//
//
//})
//
//
//
///**
//* 文本框根据输入内容自适应高度
//* @param                {HTMLElement}        输入框元素
//* @param                {Number}                设置光标与输入框保持的距离(默认0)
//* @param                {Number}                设置最大高度(可选)
//*/
//var autoTextarea = function (elem, extra, maxHeight) {
//        extra = extra || 0;
//        var isFirefox = !!document.getBoxObjectFor || 'mozInnerScreenX' in window,
//        isOpera = !!window.opera && !!window.opera.toString().indexOf('Opera'),
//                addEvent = function (type, callback) {
//                        elem.addEventListener ?
//                                elem.addEventListener(type, callback, false) :
//                                elem.attachEvent('on' + type, callback);
//                },
//                getStyle = elem.currentStyle ? function (name) {
//                        var val = elem.currentStyle[name];
//
//                        if (name === 'height' && val.search(/px/i) !== 1) {
//                                var rect = elem.getBoundingClientRect();
//                                return rect.bottom - rect.top -
//                                        parseFloat(getStyle('paddingTop')) -
//                                        parseFloat(getStyle('paddingBottom')) + 'px';
//                        };
//
//                        return val;
//                } : function (name) {
//                                return getComputedStyle(elem, null)[name];
//                },
//                minHeight = parseFloat(getStyle('height'));
//
//        elem.style.resize = 'none';
//
//        var change = function () {
//                var scrollTop, height,
//                        padding = 0,
//                        style = elem.style;
//
//                if (elem._length === elem.value.length) return;
//                elem._length = elem.value.length;
//
//                if (!isFirefox && !isOpera) {
//                        padding = parseInt(getStyle('paddingTop')) + parseInt(getStyle('paddingBottom'));
//                };
//                scrollTop = document.body.scrollTop || document.documentElement.scrollTop;
//
//                elem.style.height = minHeight + 'px';
//                if (elem.scrollHeight > minHeight) {
//                        if (maxHeight && elem.scrollHeight > maxHeight) {
//                                height = maxHeight - padding;
//                                style.overflowY = 'auto';
//                        } else {
//                                height = elem.scrollHeight - padding;
//                                style.overflowY = 'hidden';
//                        };
//                        style.height = height + extra + 'px';
//                        scrollTop += parseInt(style.height) - elem.currHeight;
//                        document.body.scrollTop = scrollTop;
//                        document.documentElement.scrollTop = scrollTop;
//                        elem.currHeight = parseInt(style.height);
//                };
//        };
//
//        addEvent('propertychange', change);
//        addEvent('input', change);
//        addEvent('focus', change);
//        change();
//};