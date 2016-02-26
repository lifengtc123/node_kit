/**
 * 强制等待弹窗组件
 * 2013-11-20
 * jizaiyi
 */

define( function( require, exports ){
		
	require( './loadingBox.css' );
	
	var slice = Array.prototype.slice;
	
	var extend = function(obj) {
		
		$.each( slice.call(arguments, 1), function( key, value ) {
		    if (value) {
		      for (var prop in value) {
		        obj[prop] = value[prop];
		      }
		    }
		  });
		  return obj;
	};
	
	var LoadingBox = function( config ) {
		var me = this;
		me.init( me.config = extend( me.initConfig, config || {} ) );
	};
		
	extend( LoadingBox.prototype, {

		constructor: LoadingBox,
		
		initConfig : {width: 400},

		init : function( config ){
			var me = this,
				wrap = me.wrap = $( '<div>' ).addClass( 'loadingBox hide' ),
				container = $( '<div>' ).addClass( 'loadingBox_container' ),
				el = me.el = $('<p>');
			wrap.css( {width: config.width } );
			el.html( config.text );
			container.append( el );
			wrap.append(container);
			$( 'body' ).append( wrap );
			wrap.append('<iframe src="" frameborder="0" border="0" style="width:100%;height:100%;position:absolute;top:0;left:0;z-index:-1;border: none;"></iframe>');
			
			
			this.createMask();
		},
		
		createMask : function(){
			
			var me = this,
				mask = me.mask = $( '<div>' ).addClass( 'loadingBox_mask' );
			mask.css( {height: $( 'body' ).height(), width: $( 'body' ).width() } );
			$( 'body' ).append( mask );
			$( window ).resize( function(){
				mask.css( {height: $( 'body' ).height(), width: $( 'body' ).width() } );
			} );
			this.mask = mask;
			
		},

		hide : function(){
			var me = this;
			me.hidden = true;
			me.wrap.addClass("hide");
			this.mask.hide();
		},
		
		show : function(value){
			var me = this,
				el = me.el;
			el.html( value || '正在加载' );
			
			me.hidden = false;
			me.wrap.removeClass("hide");
			this.mask.show();
		}
	});
	
	var loadingBox = window.loadingBox = new LoadingBox();
	
	exports.loadingBox = loadingBox;

});