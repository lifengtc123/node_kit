
define( function( require, exports ){
	
	 require( './css/calendar.css' );
	
	var today = new Date( currentTime );
	function getToday(){
		return [today.getFullYear(), today.getMonth()+1, today.getDate(), today.getHours(), today.getMinutes(), today.getSeconds()];
	};
	var WEEK = ['一', '二', '三', '四', '五', '六', '七'];
	/** 
	* Calendar组件开始
	*/
		
	var Calendar = function( config ){
		var me = this;
		this.data = getToday();
		me.config = $.extend({}, me.initConfig, config );
		me.init();
	};	
	
	$.extend( Calendar.prototype, Base.Event, {
			
			initConfig : {},
			
			init : function(){
				var me = this,
					config = me.config,
					container = me.visibleTag = me.disableTag = me.container = $( '<div>' ).addClass( 'calen_container' );
				me.config.timeLimit && me.parseTimeLimit();
				me.createWrap( container );
				$( config.renderTo ).append( container);
				me.clearMenus();
			},
			
			createWrap : function( container ){	//创建日历主体外围、iframe、静态元素
				var me = this,
					wrap = me.wrap = $( '<div>' ),
					iframe = me.iframe = $( '<iframe>' );
				wrap.addClass( 'up_calen_wrap' );
				iframe.addClass( 'up_calen_iframe' );
				container.append( iframe );
				container.append( wrap );
				me.createStatic( wrap );
				me.loadData(me.data);
				return wrap;
			},
			
			loadData: function( data ){
				var me = this;
				var nowMonthDays = new Date(data[0], data[1], 0).getDate();
				if(data[2] > nowMonthDays) data[2] = nowMonthDays;
				me.data = data;
				me.render( data );
				me.timeLimitFn();
			},
			
			getValue : function(){
				var now = new Date( this.data[0], this.data[1]-1, this.data[2] );
				return [now.getFullYear(), now.getMonth()+1, now.getDate()];
			},
			
			setValue: function(data){
				var me = this,
					len = data.length;
				me.main.html('');
				for(var i = 0; i < len; i++){
					data[i] = parseInt(data[i], 10);
				}
				me.data = data;
				me.loadData( data );
				//this.fire('setValue', this.data );
			},
			
			reset: function(){
				this.setValue( getToday() );
				this.fire( 'reset', this.data );
				return this;
			},
			
			show: function(){
				this.wrap.parent().removeClass('hide');
			//	Calendar.superclass.show.call( this );
				this.setValue( this.data );
			},
			
			hide: function(){
				this.wrap.parent().addClass('hide');
				//Calendar.superclass.hide.call( this );
				delete this._data;
			},
			
			render : function( data ){	//渲染日历
				var me = this,
					main = me.main,
					daySet = me.getNow( data ),	
					ele,
					eles = $( '<ul>' );
				me.yearbox.html(daySet[0]);
				me.monthbox.html(daySet[1]);
				$.each( daySet[2], function( i,ele ){
					eles.append( me.createDay( ele ));
				});
				main.html('');
				main.append( eles );
				me.videoData && me.setVideoMark(me.videoData[data[0] + '-' + $.pad('0', 2, data[1])]);
			},
			
			//组件时间限制日期对象转成数组
			parseTimeLimit : function(){
				var me = this,
					timeLimit = me.config.timeLimit;
				me.config.timeLimit = [timeLimit.getFullYear(), timeLimit.getMonth()+1, timeLimit.getDate(), timeLimit.getHours(), timeLimit.getMinutes(), timeLimit.getSeconds()];
			},
			
			getNow : function( data ){	//获取当前日历显示的日期
				var me = this,
					data = data || me.data,
					now = new Date( data[0], data[1]-1, data[2] ),
					year = now.getFullYear(),
					month = now.getMonth(),
					curMonth = new Date(year, month+1, 0),
					preMonth = new Date(year, month, 0),
					curDate = curMonth.getDate(),
					preDate = preMonth.getDate(),
					preWeek = preMonth.getDay(),
					ret = [],
					pad = $.pad,
					str;
				for( var i = preWeek - 1; i >= 0; i-- ){
					str = curMonth.getFullYear() + '-' + month + '-' + ( preDate - i );
					ret.push( str + 'l' );
				};
				
				for( var i = 0; i < curDate; ){
					str = now.getFullYear() + '-' + ( month + 1 ) + '-' + ( ++i );
					ret.push( str );
				};
				for( var i = 0, len = 42 - ret.length; i < len; ){
					str = now.getFullYear() + '-' + ( month + 2 ) + '-' + ( ++i );
					ret.push( str + 'n' );
				};
				return [year, month + 1, ret];
					
			},
			
			setPos : function(){
				var me = this,
					refer = $( me.config.referTo ),
					container = me.container,
					referpos = $.getPosition(refer),
					height = container[0].offsetHeight,
					width = container[0].offsetWidth;
				container.css( {left: referpos[0] + 'px', top: referpos[1] - height + 'px'} );
			},
			
			createDay : function( ele ){	//创建每天的dom
				var me = this,
					li = $( '<li>' ),
					inner = ele.split( '-' )[2];
				if( !( /[ln]$/.test( ele ))){	//非当前月的不创建
					if(me.config.timeLimit && me.config.timeLimit[0] + '-' + me.config.timeLimit[1] == ele.replace(/-\d+$/g,'') && parseInt(ele.match(/\d+$/)[0],10) > me.config.timeLimit[2]){
						li.addClass('disabled');
					}else{
						li.on( 'click', function(){
							me.data[2] = inner;
							me._data && (me._data[2] = inner);
							me.data = me._data || me.data;
							delete me._data;
							me.fire( 'click', me.getValue() );
						});
						li.on( 'mouseover', function(){
							li.addClass( 'up_calen_lihover' );
						});
						li.on( 'mouseout', function(){
							li.removeClass( 'up_calen_lihover' );
						});
					}
					li.html( inner );
					if( inner == me.data[2 ]){
						li.addClass( 'up_calen_current' );
					}
				}else{
					li.addClass('empty');
				}
				return li;
			},
			
			createStatic : function(wrap){  //创建日历的静态部分年、月、周
				var me = this,
					ymbox = me.ymbox = $( '<div>' ).addClass( 'up_calen_ymbox' ),
					yearbox = me.yearbox = $( '<div>' ).addClass( 'up_calen_yearbox' ),
					yearboxL = me.yearboxL = $( '<div>' ).addClass( 'up_calen_datechoose up_calen_L' ),
					yearboxR = me.yearboxR = $( '<div>' ).addClass( 'up_calen_datechoose up_calen_R' ),
					monthbox = me.monthbox = $( '<div>' ).addClass( 'up_calen_monthbox' ),
					monthL = me.monthL = $( '<div>' ).addClass( 'up_calen_datechoose up_calen_L up_calen_Lb' ),
					monthR = me.monthR = $( '<div>' ).addClass( 'up_calen_datechoose up_calen_R' ),
					weekbox = me.weekbox = $( '<div>' ),
					main = me.main = $( '<div>' ),
					ul = $( '<ul>' ),
					week,
					li;
				ymbox.append( yearboxL );
				ymbox.append( yearbox );
				ymbox.append( yearboxR );
				ymbox.append( monthL );
				monthL.on( 'click', function(){
					me._change( 1, -1 );
				});
				monthR.on( 'click', function(){
					!me.monthR.disabled && me._change( 1, 1 );
				});
				yearboxL.on( 'click', function(){
					me._change( 0, -1 );
				});
				yearboxR.on( 'click', function(){
					!me.yearboxR.disabled && me._change( 0, 1 );
				});
				ymbox.append( monthbox );
				ymbox.append( monthR );
				wrap.append( ymbox );
				while( week = WEEK.shift() ){
					li = $( '<li>' );
					li.html( week );
					weekbox.append( li );
				};
				weekbox.append( ul );
				wrap.append( weekbox.addClass( 'up_calen_weekbox' ));
				wrap.append( main.addClass( 'up_calen_main' ));
			},
			
			timeLimitFn : function(){
				var me = this;
				
				if(!me.config.timeLimit) return;
				if(me.data[0] == me.config.timeLimit[0]){
					me.yearboxR.disabled = true;
					me.yearboxR.addClass('disabled');
					if(me.data[1] == me.config.timeLimit[1]){
						me.monthR.disabled = true;
						me.monthR.addClass('disabled');
					}else{
						me.monthR.disabled = false;
						me.monthR.removeClass('disabled');
					}
				}else{
					if(me.monthR.disabled == true){
						me.monthR.disabled = false;
						me.monthR.removeClass('disabled');
					}
					me.yearboxR.disabled = false;
					me.yearboxR.removeClass('disabled');
				}
			},
			
			_change : function( where, dir ){		//修改月
				this._data = this._data || [].concat(this.data);				
				this._data.splice(where, 1, this._data[where] + dir );
				if(this.data[1] > 12){
					this.data[0] += 1;
					this.data[1] = 1;
				}
				if(this._data[1] > 12){
					this._data[0] += 1;
					this._data[1] = 1;
				}
				
				if(this.data[1] < 1){
					this.data[0] -= 1;
					this.data[1] = 12;
				}
				if(this._data[1] < 1){
					this._data[0] -= 1;
					this._data[1] = 12;
				}
				this.loadData( this._data );
				
				var data = this._data;
				this.fire('timechange', data[0] + '-' + $.pad('0', 2, data[1]));
			},
			
			clearMenus : function(){	
				var me = this;
				$.getBody().on( 'mousedown', function( e ){
					!$.isTarget(me.container, e )&& me.hide();
				});
			},
			
			//设置录像数据
			setVideoData : function(data){
				var me = this,
					_data = data.slice(0),
					videoData = me.videoData = (me.videoData || {}),
					c;
				if(_data.length){
					while(c = _data.shift()){
						var month = c.match(/\d*-\d*/)[0],
							monthData;
						(!videoData[month]) && (videoData[month] = []);
						
						monthData = videoData[month];
						for(var i=0, len=monthData.length; i<len; i++){
							if(monthData[i] == c){
								monthData.splice(i,1);
								break;
							}
						}
						monthData.push(c);
					}
				}
				
			},
			//设置录像标识
			setVideoMark : function(data){
				if(data){
					var _data = data.slice(0),
						me = this,
						c;
					if(_data.length){
						while(c = _data.shift()){
							if(c.match(/\d*-\d*/)[0] == me.data[0] + '-' + $.pad('0', 2, me.data[1])){
								var dateEl = me.main.find('li');
								for(var i=0, len=dateEl.length; i<len; i++){
									var el = dateEl[i];
									if($.pad('0', 2, el.innerHTML) == c.split('-')[2]){
										$(el).removeClass('has_video').addClass('has_video');
										break;
									}
								}
							}
						}
					}
				}
			},
			
			//清除日历录像标记
			clearVideoMark : function(){
				var me = this;
				me.videoData = null;
			}
		}
	);
	
	exports.component =  Calendar;
});

