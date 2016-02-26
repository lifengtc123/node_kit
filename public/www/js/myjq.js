$(function(){
	
	//添加选择
	$('.box_add_list li, .choose_color span, .shape span').on("click",function(){
		if(!$(this).children('i').length){
			$(this).append('<i class="iconfont">&#xe621;</i>').siblings().children('i').remove();
		}
	});
	
	//初始化使用邀请码
	if($('div').hasClass('initialization_invite_line')){
		$('.initialization_invite').click(function(){
			$('.initialization_invite_line').show();
			$('.mask').show();
		});
		$('.mask').click(function(){
			$('.initialization_invite_line').hide();
			$('.mask').hide();
		});
	}
	
	//用药编辑选择
	$('.remind_choose .input_sub').click(function(){
		$(this).addClass('on').siblings().removeClass('on');
	});
	
	//盒子信息
	var intLine = $('.mybox_progress .line').width();
	$('.mybox_progress .content').each(function(index){
		var intContent = parseInt($(this).css('left'));
		if(intLine >= intContent){
			$(this).addClass('on');
		}
	});

})