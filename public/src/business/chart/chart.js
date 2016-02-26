/**
 * 图表统计模块
 */
define( function( require, exports ){

	require('./chart.css');
    //require('./excanvas-ie8');
	var Base= require('../../page/message/core/base').Base;




     //!$.isIE8 && !$.isIE7

    var isNotIEBool = !(/[78]/.test($.browser.version));
    isNotIEBool = !util.browser.isIE7 && !util.browser.isIE8;

     //require('../../common/scripts/head/base.js');


	var chartGraph = function(config){
		var me = this,
			config = config || {};
		me.initConfig = $.extend( me.config ,config );
		this.initComponent(me.initConfig);
	};

	var Observable = function(){};

	Observable.prototype = {

		events : {},

		addListener : function(eventName, callback){
			var me = this,
				events = me.events = me.events || {};
			events[eventName] = events[eventName] || {};
			(events[eventName].listeners = events[eventName].listeners || []).push(callback);
		},

		fireEvent : function(eventName,scope){
			var me = this,
				events = (me.events[eventName]) ? me.events[eventName].listeners : [],
				args = Base.toArray(arguments).splice(2);
			Base.each(events,function(event){
				if($.isFunction(event)){
					if( event.apply(scope || me,args) === FALSE){
						return false
					}
				}
			});
			return true;
		}
	};

	Observable.prototype.on = Observable.prototype.addListener;

	Base.extend( chartGraph, Observable,{

		data : [],

		coordinates : [],

		initComponent : function(config){
			var me = this;
			if($.isEmptyObject(config)){
				return false;
			}
			var me = this;
			var renderTo = me.renderTo = $('#'+config.renderTo);
            if(renderTo){
                var tipValue = me.tipValue = $('<div>').addClass('tipValue');
                renderTo.append(tipValue);
                me.onRender(renderTo);
                this.dataCode = [];
                me.event();
            }

			//me.ghost();
		},

		config : {
			left : 70,
			bottom : 45,
			top: 30,
			right : 20,
			yCoordWidth : 5,
			lineWidthH : 16,
			xCoordWidth : 5,
			mark : {font:'24px Arial', color:'353535'}
		},

		clear : function(){
			var me = this;
			me.coordinates = [];
			me.cxt.clearRect(0,0,me.cxtSize.width,me.cxtSize.height)
		},

		//添加统计图中,想要放在任何位置的标识
		ghost : function(){
			var me = this,
				ghost = me.ghostEl =$('<div>');
			ghost.css({width: '10px',height: '10px', background: '#f00', position:'absolute', display: 'none'});
			me.renderTo.append(ghost);
		},

		setValue : function(v,arr){
			if(arr){
				var me = this,
					ret = [];
				if(!me.cxt) return;
				me.clear();
				if($.isArray(arr)){
					Base.each(arr, function(v){
						ret.push(this.canvasMode(v));
					},me)
				}
				me.boardX(ret[0],arr[0].noText,arr[0]);
				me.boardY(ret[1],arr[1].noText,arr[1]);
				me.borderXY();
			}
			var me = this,
				mc = me.initConfig,
				cxt = me.cxt,
				bottom = me.config.bottom,
			    width = me.cxtSize.ablewidth,
				height = me.cxtSize.height - bottom,
				ableH = me.cxtSize.ableheight;
				hInte = me.inte.h[0],
				wInte = me.inte.w[0],
				left = me.config.left,
				color = me.initConfig.color || '#333',
				args = arguments;
			me.data = [].concat(v);
			if(args.length == 1 && !$.isArray(v)){
				v = v.value;
			}
			$.extend(mc,{value:v,color:color || me.initConfig.color});
			color = mc.color;
			me.dataCode = [];
			if($.isArray(v)){
				var i = 0, len = v.length - 1;
				for(; i < len; i++){
					function draw(){
						me.setMethod(cxt,left,height,v[i]*ableH/(me.inte.h[2]),v[i+1]*ableH/(me.inte.h[2]),hInte,wInte,color,v[i+1],i == 0,v[i]);
					}
					draw();
					left += wInte
				}
			}
			me.tag = false
		},

		setMethod : function(cxt,w,height,v,v1,h,wInte,color,value,start,startValue){
			var me = this;
			cxt.beginPath();
			cxt.strokeStyle = color;
			cxt.fillStyle = color;
			cxt.lineWidth = 2;
			cxt.moveTo(w,height-v);
			cxt.lineTo((w += wInte),height-v1);
			//cxt.lineCap = 'round';
			//cxt.strokeRect(w,height-v1,1,1);

			this.dataCode.push({'x':Math.floor(w),'y':Math.floor(height-v),'value':value});
			cxt.stroke();
			cxt.closePath();
			cxt.beginPath();
			if(start){
				cxt.arc(w-wInte,height-v,3,0,Math.PI*2,true);
				me.coordinates.push({x:w-wInte,y:height-v,value:startValue});
			}
			cxt.arc(w,height-v1,3,0,Math.PI*2,true);
			me.coordinates.push({x:w,y:height-v1,value:value});
			cxt.fill();
		},


		event : function(e){
			var me = this,
				canvas = me.canvas;

			function findCoord(e, click){
				var x = Base.parentPosition(me.canvas[0])[0],
					y = Base.parentPosition(me.canvas[0])[1],
					e = e || window.event,
					ex = (e.pageX || e.clientX) - x,
					ey = (e.pageY || e.clientY) - y;
				for(var i = 0,c; c = me.coordinates[i];i++){
					if((ey >= c.y -3) && (ey <= c.y +3) && (ex >= c.x -3) && (ex <= c.x +3)){
						me.tipValue.html(c.value).css({'left':c.x - 10,'top':c.y + 20,'display':'block'});
					}
				}

			}
           
                canvas.on('mousemove', function(e){
                    findCoord(e, false);
                });

                canvas.on('mouseout', function(e){
                    me.tipValue.css({'display':'none'});
                });
		},


		onRender : function(position){
			var me = this,
				mc = me.initConfig,
				ret = [];
			if(!me.canvas){
				var canvas = me.canvas = me.el = $('#'+me.initConfig.id);
                if(canvas[0] && canvas[0].getContext){
                    var	cxt = me.cxt = canvas[0].getContext('2d');
                }else{
                    return;
                }

				var width = canvas[0].width = mc.width,
					height = canvas[0].height = mc.height;

				canvas.css({background:mc.bgcolor});
				(me.cxtSize = me.cxtSize || {})['width'] = mc.width;
				me.cxtSize['height'] = mc.height;

				//统计图可用宽度
				me.cxtSize['ablewidth'] = me.cxtSize.width - mc.left - mc.right;

				//统计图可用高度
				me.cxtSize['ableheight'] = me.cxtSize.height - mc.top - mc.bottom;
			}

			if($.isArray(mc.board)){
				$.each(mc.board, function( i, v ){
					ret.push(me.canvasMode( v ));
				})
			}


			$.isArray(ret[0]) && ret[0].length > 0 ?
				me.boardX(ret[0],mc.board[0].noText,mc.board[0]) : null;
			$.isArray(ret[1]) && ret[1].length > 0 ?
				me.boardY(ret[1],mc.board[1].noText,mc.board[1]) : null;
			if(mc.grid){
				me.borderXY();
			}
		},

		boardX : function(ret,notext,obj){

			if(!$.isArray(ret))	return;

			var me = this,
				mc = me.initConfig,
				width = me.cxtSize.ablewidth,
				height = me.cxtSize.ableheight,
				top = mc.top,
				left = mc.left,
				cxt = me.cxt,
				len = ret.length,
				name = obj.name,
				color = obj.color || '#333',
				wInte = me.wInte = width/(len-1),
				wz = mc.left;
			(me.inte = me.inte || []).w = [wInte,len];
			cxt.font = "12px arial";
			cxt.textBaseline = 'top';
			cxt.textAlign = 'center';
			cxt.fillStyle = mc.mark.textColor;
			cxt.textBaseline = 'top';

			if( isNotIEBool){
				cxt.fillText(mc.board[0].showText !== false ? ret[0] : '',wz,height + top + this.config.xCoordWidth);
			}else{
				cxt.font="normal normal bold 12px arial";
				cxt.fillText(mc.board[0].showText !== false ? ret[0] : '',wz,height + top + this.config.xCoordWidth);
			}
			for(var i = 0; i < len-1; i++){
				cxt.beginPath();
				cxt.lineWidth = 2;
				cxt.strokeStyle = mc.mark.color;
				cxt.moveTo(wz,height + top );
				cxt.lineTo((wz += wInte),height + top);
				cxt.stroke();
				cxt.closePath();
				if(mc.board[0].showText !== false){
					//cxt.lineTo(wz, height + top + this.config.xCoordWidth);
					cxt.strokeStyle = mc.mark.textColor;
					if( isNotIEBool){
						cxt.fillText(mc.board[0].showText !== false ? ret[i+1] : '',wz,height + top + this.config.xCoordWidth);
					}else{
						cxt.font="normal normal bold 12px arial";
						cxt.fillText(mc.board[0].showText !== false ? ret[i+1] : '',wz,height + top + this.config.xCoordWidth);
					}

				}

			}
			if(name){
				cxt.fillStyle = color;
				if( isNotIEBool){
					cxt.fillText(name,(width+left) / 2,height + top + 23);
				}else{
					cxt.font="normal normal bold 12px arial";
					cxt.fillText(name,(width+left) / 2,height + top + 23);
				}
			}
		},

		boardY : function(ret,notext,obj){
			if(!$.isArray(ret)) return;
			var me = this,
				mc = me.initConfig,
				width = me.cxtSize.ablewidth,
				height = me.cxtSize.ableheight,
				cxt = me.cxt;
				len = ret.length,
				wInte = height/(len-1),
				name = obj.name,
				color = obj.color || '#333',
				h = height + mc.top,
				wz = mc.left;
			(me.inte = me.inte || []).h = [wInte,len,(ret[ret.length-1] - ret[0])];
			cxt.font = mc.mark.font;
			cxt.textAlign = 'right';
			cxt.textBaseline = 'middle';
			cxt.fillStyle = mc.mark.textColor;
			//cxt.stroke(mc.board[1].showText !== false ? String(ret[0]) : '',wz - mc.yCoordWidth -2,h)
			for(var i = 0; i < len-1; i++){
				cxt.beginPath();
				cxt.lineWidth = 2;
				cxt.strokeStyle = mc.mark.color;
				cxt.moveTo(wz,h)
				cxt.lineTo(wz,h -= wInte);
				cxt.stroke();
				cxt.closePath();
				if(mc.board[1].showText !== false){
					//cxt.lineTo(wz - this.config.yCoordWidth, h);
					cxt.strokeStyle = mc.mark.textColor;
					if( !(/[78]/.test($.browser.version))){
						cxt.fillText(String(ret[i+1]),wz - mc.yCoordWidth -2,h);
					}else{
						cxt.font="normal normal bold 12px arial";
						cxt.fillText(String(ret[i+1]),wz - mc.yCoordWidth -20,h);
					}

					//cxt.strokeText(String(ret[i+1]),wz - mc.yCoordWidth -2,h);

				}
			}
			if(name){
				cxt.fillStyle = color;
				if( isNotIEBool ){
					cxt.fillText(name,wz,10);
				}else{
					cxt.font="normal normal bold 12px arial";
					cxt.fillText(name,wz,10);
				}
			}
		},

		borderXY : function(){
			var me = this,
				mc = me.initConfig,
				cxt = this.cxt,
				width = this.cxtSize.ablewidth,
				height = this.cxtSize.ableheight,
				left = this.config.left,
				top = this.config.top,
				wInte = this.inte.w[0],
				wInteL = this.inte.w[1],
				hInte = this.inte.h[0],
				hInteL = this.inte.h[1];
			cxt.strokeStyle = mc.grid.color;
			while(hInteL>1){
				cxt.beginPath();
				cxt.lineWidth = 1;
				cxt.moveTo(left,height+top-hInte*(hInteL-1));
				cxt.lineTo(left+width,height+top-hInte*(hInteL-1));
				cxt.stroke();
				hInteL--;
			}

			while(wInteL>1){
				cxt.beginPath();
				cxt.moveTo(left+wInte*(wInteL-1),height+top);
				cxt.lineTo(left+wInte*(wInteL-1),top);
				cxt.stroke();
				wInteL--;
			}
		},


		canvasMode : function(v){
			return (this['template'+v.mode.toLowerCase()] || function(){})(v)
		},

		templatemonth : function(v){	//month
			var bank,
				start,
				end,
				bank = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
			start = bank.indexOf(v.from);
			end = bank.indexOf(v.to);
			return (bank.splice(start,end-start+2) || [])
		},

		templatepercent : function(v){
			var bank,
				start,
				end,
				ret = [],
				inte;
			bank = v.to - v.from;
			inte = bank/v.unit;
			start = v.from;
			end = v.to;
			while((start <= end)){
				ret.push(start);
				start += inte;
			}
			return ret;
		},

		templaterecur : function(v){
			return v.region;
		},


		reset : function(){
			var me = this;
			me.clear();
			me.render()
		}

	});

	exports.chartGraph = chartGraph;
});