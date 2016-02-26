/**
 * # 弱提示框 Hint
 * 本提示框弱提示，用户成功性操作等警示性不强的提示，显示2秒
 *
 * **使用范例**：
 *
 *     @example
 *     var hint = new Hint( '删除成功' );
 * @class Hint
 */
define( function( require, exports ){
	
	
	require( './hint.css' );
	var	Hint = function ( config ){
			var me = this;
			me.config = $.extend( {}, this.defaults, config || {} );
			me.init( me.config );
		};

    $.extend( Hint.prototype, {

		/**
         * @constructor Modal构造器
         */
		constructor: Hint,

        /**
         * 配置项目描述
         * @cfg {Object} config
         * @cfg {String} config.width 200
         * @cfg {String} config.type 'right'
         * @cfg {String} config.content default '操作成功' 提示框内容
         * @cfg {String} config.renderTo default BODY 渲染到哪里
         */
		defaults: {
			width:			200,
			content:		'操作成功！',
            type:           'right',
			sureCallback:   function(){}
		},

		/**
         * @method init
         * 组件初始化入口，创建DOM，设置标题，添加事件，渲染
         * @private
         *
         */
		init : function( config ){
			var me = this;
			me.createEl( config );
			me.render();
		},

		/**
         * @method createEl
         * 创建 MODAL 主体
         * @private
         *
         */
		createEl: function( config ){
			
			var me = this;
			me.el = $( '<div>' ).addClass('hintContainer hide').append('<iframe src="javascript:false" class="iframe"></iframe>').css( { 'width': me.config.width +'px' } );
			var hintContainer =$( '<div>' ).addClass( 'newhint' );
			hintContainer.append( me.createContent(config.type));
			me.el.append(hintContainer);
			return me;

		},

		/**
         * @method createBody
         * 创建 modal-body 主体
         * @private
		 * @return {el} body
         */
		createContent: function(type){
			var me = this;
            var type = type?type:"right";
			$.extend( me, {
				content: $( '<div>' ).addClass( 'newhint-content' ).addClass( 'newhint_'+type )
			} );
			me.setContent( me.config.content );
			return me.content;
		},
		
		/**
         * @method render
         * 将生成好的el添加到 renderTo 里
         * @private
		 * @return {component} modal
         */
		render: function(){

			var me = this;
            $( 'body' ).append( me.el );
			me.el.css( {
				'margin-left': '-' + me.el.width() / 2 + 'px',
				'margin-top': '-' + me.el.height() / 2 + 'px'
			} );
			return me;

		},
		
		/**
         * @method handler
         * 为弹出框可交互部分添加事件 及 回调
         * @private
		 * @return {component} modal
         */
		handler: function(){
			var me = this;
			setTimeout( function(){
				me.hide();
			}, 2000 );
		},

		/**
         * @method setIndex
         * 暂不开放
         * @private
		 * @return {component} modal
         */
		setIndex : function(){
			
		},
		
		/**
		 *  @method toggle
		 *  据当前的显隐状态，反向隐显
		 * @return {component} modal
		 */
		toggle: function(){
			var me = this;
			if( me.hidden ){
				me.show();
			} else {
				me.hide();
			};
			return me;
		},		
		
		/**
		 *  @method hide
		 *  隐藏对话框
		 * @return {component} modal
		 */
		hide : function( force ){
			this.el.addClass( 'hide' );
			return this;
		},
		
		/**
		 *  @method show
		 *  显示对话框
		 *  @return {component} modal
		 */
		show : function( config, type ){
			var hint_type = type ? 'newhint_'+type : 'newhint_right';
			if( typeof config == 'string' ){
				config = { content: config }
			} 
			config || ( config = {} );
			config.content && this.content.html( config.content  );
			this.content.removeClass( 'newhint_right' ).removeClass( 'newhint_wrong' ).removeClass( 'newhint_warn' ).addClass( hint_type );
			this.el.removeClass( 'hide' );
			this.content.css( 'margin-left', ( this.el.width() - this.content.width() - 55 ) / 2 );
			this.handler();
			return this; 
		},
		
		/**
		 *  @method setContent
		 *  设置内容
		 *  @param {String} content 弹框主体内容
		 *  @return {component} modal
		 */
		 setContent: function( txt ){
			
			this.config.content = txt || '操作成功';
			this.content.html( this.config.content  );
			return this;

		 }
		
		 /**
		 *  @event hide
		 *  隐藏对话框时触发的事件 
		 *  @param none
		 */

	});
	
	exports.Hint = Hint;
    exports.hint = window.hint = new Hint();


});