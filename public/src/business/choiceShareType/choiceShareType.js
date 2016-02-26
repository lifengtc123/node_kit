/**
 * Created by wangyang7 on 2015/1/19.
 */

define(function(require, exports){

    var hint   = require( 'hint' ).hint,
        dialog = require('dialog');
    require('./css.css');

	var delegateEventSplitter = /^(\S+)\s*(.*)$/;

    
    var choiceShareType = {

	  
	   Template:{ 
	      dialog: '<ul class="choiceShareType"><a href="/entry/share/shareLiveList.jsp" target="_bank"><li class="share">分享广场</li></a><a href="/api/front/shareFriend/listPage.hik"  target="_bank"><li class="friend">分享好友</li></a><li class="qrcode">二维码分享</li></ul>'
	   },


        $el : $(document),

        init : function(){
            this.delegateEvents();
        },

        events : {
            'click .inviteUserOwner' : 'inviteUserOwner', //弹出分享
			'click #toShare' : 'inviteUserOwner'
			
        },


        delegateEvents: function() {
            var events = this.events;
            for (var key in events) {
                var method = events[key];
                if (!this.isFunction(method)) method = this[events[key]];
                if (!method) continue;

                var match = key.match(delegateEventSplitter);
                var eventName = match[1], selector = match[2];

                method = this.proxy(method, this);

                if (selector === "") {
                    this.$el.on(eventName, method);
                } else {
                    this.$el.on(eventName, selector, method );
                }

            }

            return this;
        },

        isFunction : function( obj ){
            return typeof obj === "function";
        },

        //保持上下文一致
        proxy : function( func, thisObject ){
            return( function(){
                return func.apply( thisObject, arguments );
            } );
        },

        inviteUserOwner : function(event){
		   event.preventDefault(); 
		   var $target = $(event.target);
           var href = '';
		   var me = this;

           if( !$.nodeName(event.target,'A')) {
             href = $target.parent('a').attr('href');
           } else {
             href = $target.attr('href');
           }


		   dialog.win({
		      title: '请选择分享类型',
			  content: me.Template.dialog,
              width:286,
              height:150,
              contentBind: function(){
			     $(dialog.getContent()).find('.qrcode').on('click',function(event){
				    event.preventDefault();
					window.location.href = href;
				 });
			  }
		   });
		}
       
	  
	};


    choiceShareType.init();

    exports.choiceShareType = choiceShareType;


});