
define( function( require, exports ){
	
	var Toolbar = require('./multiScreenToolbar').component,
		dialog = window.dialog = require('dialog'),
		Video = require('./video').component;

	var Wall = function( config ){
		config = $.extend( this.initConfig, config );
		this.model = {};
		this.init( config );
	};
	
	$.extend( Wall.prototype,Base.Event, ( function(){
		
		var initConfig = {
			width : '100%',
			height: '100%'
		};
		
		var init = function( config ){
			var me = this;
			me.position = $( config.position );
			var bearsF = me.bearsF = $( '<iframe>' ).addClass( '_bears _bearsF _bearsFhide ' ); 
			me.position.append( bearsF );
			if(me.initConfig.type == 'more'){
				var videoBox = me.videoBox = $( '<div>').addClass( '_videoBox _videoBox_small' );
			}else{
				var videoBox = me.videoBox = $( '<div>').addClass( '_videoBox' );
			}
			if( me.initConfig.fence != 1 ){
				videoBox.css({ height: me.position[0].clientHeight - 48 + 'px'});
			} else {
				videoBox.css({ height: me.position[0].clientHeight - 42 + 'px'});
			}
			me.position.append( videoBox );
			render.call( me, config.fence );
			if( config.type == 'local'){
				var timebar = me.timebar = $( '<div>' );
				timebar.addClass( 'progressBar' );
				timebar.html( ['<div class="leftTime"></div>',
							   '<div class="progress" id="timeProgressBar">',
							   '</div>',
					           '<div class="rightTime"></div>'].join(''));
				me.position.append( timebar );
			};
			var toolbar = me.toolbar = new Toolbar({
				control : me,
				type : me.initConfig.type
			});
			me.position.append( toolbar.el );
			if (config.type == 'cloud') {
				var timebar = me.timebar = $('<div>');
				timebar.addClass('progressBar');
				timebar.addClass('cloudPosition');
				timebar.html([
						'<div class="leftTime"></div>',
						'<div class="progress" id="timeProgressBar">',
						'</div>',
						'<div class="rightTime"></div>'].join(''));
				$(me.toolbar.el).append(timebar);
			};
			me.position.addClass( '_' + ( config.type || 'monitor'));
		};
		
		var render = function( fence ){
			var me = this;
			fence = parseInt( fence || 1 );
			var me = this,
				pos = me.position[0],
				posWidth = pos.clientWidth,
				posHeight = pos.clientHeight-42,
				videoBox = me.videoBox;
			if( me.initConfig.fence != 1 ){
				posWidth -= 6
				posHeight -= 6;
			}
			me.videoBox.innerHTML = '';
			me.model = {};
			me.fire( 'beforeRender');
			switch ( fence ){
				case 1:
					render1.call( me, posWidth, posHeight, videoBox );
					break;
				case 4:
					render4.call( me, posWidth, posHeight, videoBox );
					break;
				case 6:
					render6.call( me, posWidth, posHeight, videoBox );
					break;
				case 9:
					render9.call( me, posWidth, posHeight, videoBox );
					break;
				default:
					break;					
			};
			me.model['active'] = me.model['0'];
		};
		
		var render1 = function( posWidth, posHeight, videoBox){
			var me = this,
				i = 0
			for( ;i < 1 ;i++){
				var video = create.call(me, posWidth, posHeight );
				me.model[i.toString()] = {};
				me.model[i.toString()].video = video;
				me.model[i.toString()].index = i;
				videoBox.append( video.wrap );
				try{
					video.el.HWP_SetUserData(i);
				}catch(e){
					video.update();
				}
				
			}
		};
		
		var render4 = function( posWidth, posHeight, videoBox){
			var me = this,
				i = 0
			for( ;i < 4 ;i++){
				var video = create.call(me, Math.floor(posWidth/2 - 6), posHeight/2 - 6, i );
				me.model[i.toString()] = {};
				me.model[i.toString()].video = video;
				me.model[i.toString()].index = i;
				videoBox.append( video.wrap );
				video.el.HWP_SetUserData(i);
			}
		};
		
		var render6 = function( posWidth, posHeight, videoBox){
			var me = this,
				i = 0
			for( ;i < 6 ;i++){
				if( i == 0 ){
					var video = create( Math.floor(posWidth/3)*2, Math.floor(posHeight/3)*2 );
				} else {
					var video = create( Math.floor(posWidth/3), Math.floor(posHeight/3) );
				}
				me.model[i.toString()] = {};
				me.model[i.toString()].video = video;
				me.model[i.toString()].index = i;
				videoBox.append( video.wrap );
				video.el.HWP_SetUserData(i);
			}
		};
		
		var render9 = function( posWidth, posHeight, videoBox){
			var me = this,
				i = 0
			for( ;i < 9 ;i++){
				var video = create( posWidth/3, posHeight/3 );
				me.model[i.toString()] = {};
				me.model[i.toString()].video = video;
				me.model[i.toString()].index = i;
				videoBox.append( video.wrap );
				video.el.HWP_SetUserData(i);
			}
		};
		
		var create = function( width, height, index ){
			var el = $( '<div>'),
				video,
				index = index;
			video = new Video({
					width: width, 
					height: height,
					wall: this
				});
			$( video.wrap ).on( 'click', function(e){
				$(this).find('._pluginPrompt_small').addClass('focus');
				window.GetSelectWndInfo && window.GetSelectWndInfo(null,index);
			});
			return video;
		};
		
		var updateStatus = function( config ){
			config = config || {};
			if( !this.model.active || !this.model.active.info ){
				return false;
			}
			var me = this,
				player = me.model.active,
				toolbar = me.toolbar;
			if( player.info.playing ){
				
			} else {
				player.info.recording = false;
				player.info.talking = false;
				player.info.voiceing = false;
			}
			if( !config.defer ){
				player.video.loadingHide();
			}
			toolbar.updateStatus();
		};
		
		var error = function( code ){
			dialog.errorInfo({
	            content:code
	        });
		};
		
		return {
			initConfig : initConfig,
			init : init,
			render : render,
			updateStatus : updateStatus,
			error : error
		};
		
	})());	
	
	exports.component = Wall;
})

