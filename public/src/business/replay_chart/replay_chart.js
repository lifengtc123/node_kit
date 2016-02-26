/**
 * 远程回放，统计模块
 */
define( function( require, exports ){
	/*
	 * 模块加载
	 */

	/**
	 * @method findVideoLogNum
	 * 设备移动侦测活动信息统计
	 * subSerial  设备子序列号   
     * statisticsType 统计类型 0：按天统计，1：按周统计 
     * startDate 按天统计为查询日期
	 * 按周统计为该周第一天 格式“YYYY-MM-DD” 
     * endDate  按天统计为空
	 * 按周统计为该周最后一天 格式“YYYY-MM-DD” 
	 */
	  
	var Hint = require('hint').Hint;
	var hint = new Hint({width:240});
	function findVideoLogNum(dataConfig) {
		dataConfig.subSerial = subSerial;
		var me = this;
		dataConfig.subSerial = subSerial;
		$.ajax({
			url: basePath + '/motionDetection/motionDetectionAction!findMotionNum.action',
			type: 'POST',
			data: dataConfig,
			timeout: 30000,
			success: function(data, textStatus, jqXHR) {
				if(textStatus === 'success') {
					var statisticsResultList = data.statisticsResultList;
					var _vals= [];
					var board = [{
						mode:'recur',
						region:[],
						showText:true,
						name:'(日期)',
						color:'#499ed7'
					},{
						mode:'percent',
						from:0,
						to:8,
						unit:8,
						showText:true,
						name:'(次数)',
						color:'#499ed7'
					}];
					

					if(dataConfig.statisticsType === 1) { // 按周统计，横轴显示“日期”
						board[0].name = "日期";
					} else { 
						board[0].name = "日期：" + dataConfig.startDate;
					}
					
					for(var i = 0; i < statisticsResultList.length; i++) {
						if(statisticsResultList[i].propertyNum > board[1].to) {
							board[1].to = statisticsResultList[i].propertyNum;
							board[1].to = board[1].to - board[1].to % 8 + 8;
						}
						_vals.push(statisticsResultList[i].propertyNum);
						if(dataConfig.statisticsType === 0){
							board[0].region.push(statisticsResultList[i].property);	
						}else{
							board[0].region.push(statisticsResultList[i].property.split('-').slice(1).join('-'));	
						}
						
					}
					
					graph.setValue(_vals,board);
				}
			},
			error: function(jqXHR, textStatus, errorThrown) {
				
			}
		});
	}

	var chartGraph= require('./../chart/chart').chartGraph,
		subSerial;
 
	var graph = new chartGraph({

		renderTo: 'chartWrapper',

		width :710,

		height: 240,
		
		right:35,

		bgcolor:'#fff',

		color: '#ff8261',

		board : [{mode:'recur',region:[0,'11月1日','','11月2日','','11月3日','','11月4日','','11月5日','','11月6日','','11月7日',''],showText:true,name:'(日期)',color:'#499ed7'},{mode:'percent',from:0,to:400,unit:8,showText:true,name:'(次数)',color:'#499ed7'}],

		grid : {color:'#c6e4ed'},

		mark : {color:'#88c7da', size:16,textColor : '#888'},
		
		id : 'cv'
		
	});
	
	$('canvas').hide();
	
    $('.chartBtn').click(function(){
    	if($(this).hasClass('chartCollapse')){
        	$(this).removeClass('chartCollapse').html('活动视频片段数');
        	$('.chartMenu').addClass('hide');
        	$('canvas').slideUp();
        	$('#chartWrapper').removeClass('border');
    	}else{
        	$(this).addClass('chartCollapse').html('折叠');
        	$('.chartMenu').removeClass('hide');
        	$('canvas').slideDown();
        	$('#chartWrapper').addClass('border');
    	}
    });
	var ONE_WEEK_MILLISECONDS = 7 * 24 * 3600 * 1000, // 一周毫秒数
	//TODAY = $.format.date(new Date(), "yyyy-MM-dd"),
    YESTADAY = new Date();
    YESTADAY.setDate(YESTADAY.getDate()-1);
   var YESTADAYF = YESTADAY.format("yyyy/MM/dd"),
    YESTADAY_MILLISECONDS = Date.parse(YESTADAYF + " 23:59:59") + 1000;

	// 按周查询默认配置,不会再作修改
	var byWeekDefaultConfig = {
		statisticsType: 1,
		startDate:new Date(YESTADAY_MILLISECONDS - ONE_WEEK_MILLISECONDS).format("yyyy-MM-dd"),
		endDate: new Date().format("yyyy-MM-dd")
	};
	
	// 按天查询默认配置，不会再作修改
	var byDayDefaultConfig = {
		statisticsType: 0,
		startDate: YESTADAY.format("yyyy-MM-dd"),
		endDate: ""
	};
	
	// 界面操作时会发生变化
	var byWeekConfig = {
		statisticsType: 1,
		endDate: YESTADAY.format("yyyy-MM-dd")
	};
	
	// 界面操作时会发生变化
	var byDayConfig = {
		statisticsType: 1,
		endDate: YESTADAY.format("yyyy-MM-dd")
	};
	
	byWeekConfig.startDate = byWeekDefaultConfig.startDate;
	var byDayConfig = {
		statisticsType: 0,
		startDate: YESTADAY.format("yyyy-MM-dd"),
		endDate: ""
	};
    
    $('.chartPrev a').click(function(){
    	if($(this).html() == "上一周"){
    		
    		byWeekConfig.startDate = updateWeek(byWeekConfig.startDate, -1);
    		byWeekConfig.endDate = updateWeek(byWeekConfig.endDate, -1);	
    		findVideoLogNum(byWeekConfig);
    		
    	}else{
    		var currentDate= new Date().format("yyyy/MM/dd");
    		var endDate= byDayConfig.endDate = byDayConfig.startDate;
    		var endDate = Date.parse(endDate.replace(/-/g,'/'));
    		
    		var gapmilSec = Date.parse(currentDate)- (endDate - 24 * 3600 * 1000);
    		var gapDay = gapmilSec/(24 * 3600 * 1000);
    		if( gapDay > 7){
    			hint.show({content:"只能查询最近7天哦~"});
    			$('.chartPrev').addClass('disabled');
    		}else{
        		byDayConfig.startDate = updateDay(byDayConfig.startDate, -1);
        		findVideoLogNum(byDayConfig);	
        		$('.chartNext').removeClass('disabled');
    		}
    	}
    });
    
    $('.chartNext a').click(function(){
    	if($(this).html() == "下一周"){
			if(byWeekConfig.endDate === byWeekDefaultConfig.endDate) return; // 说明已经是最后一周，直接返回，什么都不处理
    		byWeekConfig.startDate = updateWeek(byWeekConfig.startDate, +1);
    		byWeekConfig.endDate = updateWeek(byWeekConfig.endDate, +1);
    		findVideoLogNum(byWeekConfig);
    		
        	if(byWeekConfig.endDate === byWeekDefaultConfig.endDate){
        		$('.chartNext').addClass('disabled');
        	}
    		
    	}else{
    		
			if(byDayConfig.startDate === byDayDefaultConfig.startDate) return; // 相等，说明是今天，直接返回，什么都不处理	
    		byDayConfig.startDate = byDayConfig.endDate;
    		byDayConfig.endDate = updateDay(byDayConfig.endDate, +1);
    		findVideoLogNum(byDayConfig);
    		$('.chartPrev').removeClass('disabled');
        	if(byDayConfig.startDate === byDayDefaultConfig.startDate){
        		$('.chartNext').addClass('disabled');
        	}
    		
    	}
    });
    
    $('.chartDay a').click(function(){
    	
    	if($(this).parent().hasClass('selected')) return;
    	$('.chartDay').addClass('selected');
    	$('.chartWeek').removeClass('selected');
    	$('.chartPrev a').html('上一天');
    	$('.chartNext a').html('下一天');
    	byDayDefaultConfig['subSerial'] = subSerial;
    	findVideoLogNum(byDayConfig);
    	
       	if(byDayConfig.endDate === byDayDefaultConfig.endDate){
    		$('.chartNext').addClass('disabled');
    	}else{
    		$('.chartNext').removeClass('disabled');
    	}
    	
    });
    
    $('.chartWeek a').click(function(){
    	
    	if($(this).parent().hasClass('selected')) return;
    	$('.chartWeek').addClass('selected');
    	$('.chartDay').removeClass('selected');
    	$('.chartNext').addClass('disabled');
    	$('.chartPrev a').html('');
    	$('.chartNext a').html('');
    	byWeekDefaultConfig['subSerial'] = subSerial;
    	findVideoLogNum(byWeekConfig);
    	
       	if(byWeekConfig.endDate === byWeekDefaultConfig.endDate){
    		$('.chartNext').addClass('disabled');
    	}else{
    		$('.chartNext').removeClass('disabled');
    	}
    	
    });

	/**
	 * 前一周：传入("2013-11-15",-1)，返回("2013-11-09")
	 * 后一周：例如传入("2013-11-09", +1)，返回("2013-11-15")
	 */
	function updateWeek(date, position) {
		var temp = Date.parse(date.replace(/-/g,'/'));
		if(position === -1) {
			return new Date(temp - ONE_WEEK_MILLISECONDS).format("yyyy-MM-dd");
		} else {
			return new Date(temp + ONE_WEEK_MILLISECONDS).format("yyyy-MM-dd");
		}
	}

	/**
	 * 前一天：传入("2013-11-18", -1)，返回("2013-11-17");
	 * 后一天：传入("2013-11-17", 1)，返回("2013-11-18");
	 */
	function updateDay(date, position) {
		var ONE_DAY_MILLISECONDS = 24 * 3600 * 1000; // 一天毫秒数
		var temp = Date.parse(date.replace(/-/g,'/'));
		if(position === -1) {
			return new Date(temp - ONE_DAY_MILLISECONDS).format("yyyy-MM-dd");
		} else {
			return new Date(temp + ONE_DAY_MILLISECONDS).format("yyyy-MM-dd");
		}
	}
	
    
    //默认按周查询
    function getInfo( info ){
 
    	byDayDefaultConfig['subSerial'] = subSerial = info.subSerial;
    	$('.chartWeek').addClass('selected');
    	$('.chartDay').removeClass('selected');
    	$('.chartNext').addClass('disabled');
    	$('.chartPrev a').html('');
    	$('.chartNext a').html('');
    	$.extend(byWeekConfig,byWeekDefaultConfig);
    	$.extend(byDayConfig,byDayDefaultConfig);
    	findVideoLogNum(byWeekDefaultConfig);
 
    }
    
    exports.chart = getInfo;
	
});