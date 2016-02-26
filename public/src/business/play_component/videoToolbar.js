
define( function( require, exports ){
    var Hint = require('hint').Hint;
    var hint = new Hint();
    var dialog = window.dialog = require('dialog');
    require('./css/videoPlay.css');
    require('jquery-ui');

    var Toolbar = function( config ){
        this.config = $.extend( this.initConfig, config );
        this.init( config );
    };

    $.extend( Toolbar.prototype,Base.Event, ( function(){

        var initConfig = {
            width : '100%',
            height: '100%'
        };
        // 获取或设置一个值,该值指示是否已静音
        var isMuted = false;
        // 临时的音量值
        var valueRecord = 50;


        var init = function( config ){
            var me = _toolbarObj = this,
                picList = me.picList = [],
                el = me.el = $( '<div>' ).addClass( '_Toolbar _disable' ),
                play = me.play = $( '<a>' ).addClass( '_ToolbarBtn _play' ).attr('title','播放'),
                ptzShow = me.ptzShow = $( '<a>' ).addClass( '_ToolbarBtn _ptzShow hide').attr({'title':'云台','id' : 'hide'}),
                privacy = me.privacy = $('<a>').addClass('_ToolbarBtn _privacy _privacyOn hide').attr('title','点击可开启镜头遮蔽'),
                capture = me.capture = $( '<a>' ).addClass( '_ToolbarBtn _capture' ).attr('title','截图'),
                record = me.record = $( '<a>' ).addClass( '_ToolbarBtn _record' ).attr('title', config.type === 'replay'? '开始剪辑':'开始录像'),
                talk = me.talk = $( '<a>' ).addClass( '_ToolbarBtn _talk hide' ).attr('title','开启对讲'),
                voiceBox = me.voiceBox = $( '<a>' ).addClass( ' _voiceBox' ),
                brightBox = me.brightBox = $( '<span>' ).addClass( ' _brightBox' ),
                full = me.full = $( '<a>' ).addClass( '_ToolbarBtn _full' ).attr('title','全屏'),
                level = me.level = $( '<a>' ).addClass( '_ToolbarBtn _level' ).attr('title','画面质量').html('流畅'),
                levels = me.levels = $( '<div>' ).addClass( '_levels' ),
                brightness = me.brightness = $( '<a>' ).addClass( '_ToolbarBtn _brightness hide' ).attr('title','画面亮度').html('<span class="bright_icon"></span>'),
                brightnesses = me.brightnesses = $( '<div>' ).addClass( '_brightnesses' ),
                file = me.file = $( '<a>' ).addClass( '_ToolbarBtn _file' ).attr('title','打开本地图像文件夹'),
                bear = me.bear = $( '<a>' ).addClass( '_ToolbarBtn _bear hide' ).attr('title','多画面'),
                zoom = me.zoom = $( '<a>' ).addClass( '_ToolbarBtn _zoom hide' ).attr('title','放大画面'),
                share = me.share = $( '<a>' ).addClass( '_ToolbarBtn _share' ).attr('title','分享'),
                change = me.change = $( '<a>' ).addClass( '_ToolbarBtn _change hide' ).attr('title','开启\\屏蔽视频'),
                hornBox = me.hornBox = $( '<span>' ).addClass( '_ToolbarBtn _hornBox hide' ).attr('title','对讲音量'),
                sendMessage = me.sendMessage = $( '<a>' ).addClass( '_ToolbarBtn _sendMessage hide' ).attr('title','留言按钮'),
                cancelTalk = me.cancelTalk = $( '<a>' ).addClass( '_ToolbarBtn _cancelTalk hide' ).attr('title','结束对讲'),
                cancel = me.cancel = $( '<a>' ).addClass( '_ToolbarBtn _cancel hide' ).attr('title','返回').html('返回'),
                message = me.message = $( '<a>' ).addClass( '_ToolbarBtn _message hide' ).attr('title','留言发送'),
                bears = me.bears = $( '<div>' ).addClass( '_bears' ),
                tip = me.tip = $( '<img>' ).addClass( 'capture_tip hide' ).attr('src','/assets/_imgs/captureTip.png'),

                ptzCtrl = me.ptzCtrl = $('<iframe>').addClass('_ptz_frm_hide'),
       			ptzPanel = me.ptzPanel = $('<div>').addClass('_ptz_frm_hide').attr('id','operate'),
                _ptz_Line1Row2 = $('<a>').addClass('_ptz_Line1Row2 _ptz_btn goUp').attr('title','上'),
                _ptz_Line2Row1 = $('<a>').addClass('_ptz_Line2Row1 _ptz_btn goRight').attr('title','左'),
                _ptz_Line2Row2 = $('<a>').addClass('_ptz_Line2Row2 _ptz_btn goMirror').attr('title','镜像'),
                _ptz_Line2Row3 = $('<a>').addClass('_ptz_Line2Row3 _ptz_btn goLeft').attr('title','右'),
                _ptz_Line3Row2 = $('<a>').addClass('_ptz_Line3Row2 _ptz_btn goDown').attr('title','下');

	       		ptzPanel.append(_ptz_Line1Row2);
	       		ptzPanel.append(_ptz_Line2Row1);
	       		ptzPanel.append(_ptz_Line2Row2);
	       		ptzPanel.append(_ptz_Line2Row3);
	       		ptzPanel.append(_ptz_Line3Row2);

            zoom.status = true;
            cancelTalk.html('<span class="text"><span class="time">00:00:00</span>，点击结束</span>');
            sendMessage.html('<span class="mask hide"></span><span class="text">点击开始留言</span>');
            sendMessage.status = 'begin';
            hornBox.html('<tt></tt>');

            el.append( play );
            el.append( capture );
            el.append( record );
            el.append( talk );
            el.append( full );
            el.append( file );
            el.append( level );
            el.append( brightness );
            el.append( message );
            el.append( change );
            el.append( hornBox );
            el.append( sendMessage );
            el.append( cancel );
            el.append(ptzShow);
            el.append(privacy);
            this.initConfig.control.videoBox.append( ptzCtrl );
        	this.initConfig.control.videoBox.append( ptzPanel );


            _ptz_Line1Row2.on('mousedown',function(e){ptzStart('UP');});
            _ptz_Line1Row2.on('mouseup',function(e){ptzStop('UP');});
            _ptz_Line1Row2.on('mouseout',function(e){ptzStop('UP');}); 

            _ptz_Line2Row1.on('mousedown',function(e){ptzStart('LEFT');});
            _ptz_Line2Row1.on('mouseup',function(e){ptzStop('LEFT');});
            _ptz_Line2Row1.on('mouseout',function(e){ptzStop('LEFT');});

            //镜像作特殊处理，每次点击都下发CENTER命令
            _ptz_Line2Row2.on('mousedown',function(e){  
                if(!wall.model.active.info.privacy){
                    loadingBox.show('操作正在处理，请稍后...'); 
                    if( !wall.model.active.info.isCenter) {
                        ptzStart('CENTER');
                    }
                }else{
                   dialog.warn('镜头已遮蔽，无法操作云台'); 
                }
            });

            _ptz_Line2Row3.on('mousedown',function(e){ptzStart('RIGHT');});
            _ptz_Line2Row3.on('mouseup',function(e){ptzStop('RIGHT');});
            _ptz_Line2Row3.on('mouseout',function(e){ptzStop('RIGHT');});

            _ptz_Line3Row2.on('mousedown',function(e){ptzStart('DOWN');});
            _ptz_Line3Row2.on('mouseup',function(e){ptzStop('DOWN');});
            _ptz_Line3Row2.on('mouseout',function(e){ptzStop('DOWN');});


            voiceBox.append($('<a>').addClass('_voicehead'));
            voiceBox.append($('<div>').addClass('progress'));
            brightBox.append($('<span>').addClass('_brighthead'));
            brightBox.append($('<div>').addClass('progress'));
            brightBox.append($('<span>').addClass('_brightend'));
            var voice = me.voice = voiceBox.find('._voicehead',true).attr('title','关闭声音');
            el.append( tip );
            bears.html('<a type="1" class="bs b1"></a><a type="4" class="bs b4"></a><a type="6" class="bs b6"></a><a type="9" class="bs b9"></a>');

            function createLevel( which ){
                return $( '<a>' ).addClass( '_ls' ).addClass( 'l' + which ).attr( 'type', which ).html( ['流畅','均衡','高清'][which]);
            }
            levels.append( levels.l0 = createLevel( 0 ) );
            levels.append( levels.l1 = createLevel( 1 ) );
            levels.append( levels.l2 = createLevel( 2 ) );
            el.append( bear );
            el.append( levels );
            el.append( brightnesses );
            brightnesses.append(brightBox);
            me.initConfig.control.position.append( bears );
            if( config.type === 'replay' ){
                level.addClass( 'hide' );
                bear.addClass( 'hide' );
                talk.addClass( 'hide' );
            } else if( config.type === 'local' ){
                level.addClass( 'hide' );
                bear.addClass( 'hide' );
                talk.addClass( 'hide' );
                zoom.addClass( 'hide' );
                record.addClass( 'hide' );
            }else if( config.type === 'cloud' ){
                capture.addClass( 'hide' );
                full.addClass( 'hide' );
                record.addClass( 'hide' );
                level.addClass( 'hide' );
                bear.addClass( 'hide' );
                talk.addClass( 'hide' );
                zoom.addClass( 'hide' );
                file.addClass( 'hide' );
                voiceBox.addClass( 'hide' );
            }
            el.append( zoom );
            el.append( voiceBox );
            el.append( cancelTalk );
            handler.call( me );
            bearsHandler.call( me );
            levelHandler.call( me );
            brightHandler.call( me );
            setTimeout( function(){
                $("._voiceBox .progress").slider({
                    range: "min",
                    value: 50,
                    min: 0,
                    max: 100,
                    slide: function( event, ui ) {
                        var value = ui.value - 0;
                        if( me.config.control.model.active.info.talking ){
                            ret = me.config.control.model.active.video.el.HWP_setVoiceTalkVolume_V17( 0, value );
                        } else {
                            me.config.control.model.active.video.sound();
                            if(value == 0){
                                ret = me.config.control.model.active.video.el.HWP_CloseSound();
                            }else{
                                ret = me.config.control.model.active.video.el.HWP_SetVolume( 0, value );
                            }
                        }
                        if(value == 0){
                            isMuted = true;
                            me.voiceBox.addClass(  '_voice' );
                            me.voice.attr( 'title', '开启声音');
                            $("._voiceBox .progress").slider( "option", "value", 0 );
                        }else{
                            isMuted = false;
                            me.voiceBox.removeClass(  '_voice' );
                            me.voice.attr( 'title', '关闭声音');
                            $("._voiceBox .progress").slider( "option", "value", valueRecord );
                        }
                    },
                    start:function(){

                    },
                    stop:function(){
                    	sendShareInfoLog && sendShareInfoLog(80015);
                   }
                });
            }, 50);


            setTimeout( function(){
                $("._brightBox .progress").slider({
                    range: "min",
                    value: 50,
                    min: 0,
                    max: 100,
                    slide: function( event, ui ) {

                    },
                    start:function(){

                    },
                    stop:function(event,ui){
                        var value = Math.floor((ui.value - 0)/10);

                        var _activeInfo = wall.model.active.info,
                        	sessionId = $.cookie('DDNSCOOKIE').split(',')[0],
                        	serial = _activeInfo['deviceSerial'],
                        	casIp = _activeInfo['casIp'],
                        	casPort = _activeInfo['casPort'];

                        var _arr = [];
                        _arr.push({'Index':0,'Light':value});
                        var obj1 = {'Serial':serial,'LightCfg':_arr},
                        	obj2 = {'casIP':casIp,'casPort':casPort};

                        var str1 = JSON.stringify(obj1),
                        	str2 = JSON.stringify(obj2);
                        ret = me.config.control.model.active.video.el.HWP_SetLightCfg( sessionId, str1,str2 );

                        sendShareInfoLog && sendShareInfoLog(80014);
                   }
                });
            }, 50);
            var doc = document;
            var doc_body = $(doc.body || doc.documentElement);
            doc_body.on( 'click', function( e ){
            	var target = e.target;
            	(target != levels[0] && target != level[0])&& levels.removeClass( 'show' );
            	(target != brightnesses[0] && target != brightness[0])&& brightnesses.removeClass( 'show' );
            });
 
        };


        var bearsHandler = function(){
            var me = this,
                bears = me.bears,
                bearsF = me.initConfig.control.bearsF,
                bear = me.bear;
            bear.on( 'click', function(){
                bears.addClass( 'show' );
                bearsF.addClass( 'show' );
            });

            bears.on( 'click', function( evt ){
                evt = evt || window.event;
                var srcDom = evt.target || evt.srcElement;
                if( $(srcDom).hasClass('bs')){
                    bear.removeClass('_bear1 _bear4 _bear6 _bear9').addClass( '_bear' + srcDom.getAttribute( 'type' ));
                    bears.removeClass( 'show' );
                    bearsF.removeClass( 'show' );
                    me.initConfig.control.render( srcDom.getAttribute( 'type' ));
                }
            });
        };

        function brightHandler( config ){

            var me = this,
	            brightness = me.brightness,
	            brightnesses = me.brightnesses;

            	brightness.on( 'click', function(e){

		            if( me.el.hasClass( '_disable' ) || me.brightness.hasClass('_disable')){
		                return false;
		            }

		            brightnesses.addClass( 'show' );
		        });


        }


        function levelHandler( config ){
            var me = this,
                level = me.level,
                levels = me.levels;
            level.on( 'click', function(){
                if(me.level.hasClass( '_levelDisable' ) ){
                    return false;
                }
                levels.addClass( 'show' );
            });
            levels.on( 'click', function( evt ){
                evt = evt || window.event;
                var srcDom = evt.target || evt.srcElement;

                if( $(srcDom).hasClass('_ls')){
                   
                    //bear.removeClass(['_bear1','_bear4','_bear6','_bear9']).addClass( '_bear' + srcDom.getAttribute( 'type' ));
                    //bears.removeClass( 'show' );
                    levels.removeClass( 'show' );
                    if($(srcDom).hasClass('_disable')){
                         return false;
                    }
                    me.resetZoom( false );
                    //playRealHandler();
                    me.fire( 'setLevel', srcDom.getAttribute( 'type'));
                                   
                    //me.initConfig.control.render( srcDom.getAttribute( 'type' ));
                }
            });
        };

        function resetLevel( select, enable ){
            var me = this,
                level = me.level,
                levels = me.levels;

            $.each(enable.split( '-' ),function(i,v){
            	levels['l' + i].removeClass( '_disable' );
                if( v == '0'){
                    levels['l' + i].addClass( '_disable' );
                }
            });
           
        };

        var handler = function(){
            var me = this,
                control = me.initConfig.control,
                play = me.play,
                capture = me.capture,
                record = me.record,
                talk = me.talk,
                full = me.full,
                level = me.level,
                file = me.file,
                brightness = me.brightness,
                voice = me.voice,
                message = me.message,
                voiceBox = me.voiceBox,
                zoom = me.zoom,
                change = me.change,
                hornBox = me.hornBox,
                sendMessage = me.sendMessage,
                cancel = me.cancel,
	            cancelTalk = me.cancelTalk;
                ptzShow = me.ptzShow;
            var privacy = me.privacy;

            hornBox.setValue = function(percent){
                var width;
                if(percent < 1){
                    width = 0;
                }else if(percent > 100){
                    width = 164;
                }else{
                    width = Math.floor(percent / 5) * 6 + 4;
                }
                $(hornBox).find('tt').css({'width':width + 'px'});
            };

            hornBox.close = function(){
                this.removeClass('start');
            };

            /*
             * sendMessage按钮status属性有四种状态值：
             * begin 初始状态
             * rec   录制状态
             * recFinish  录制成功状态
             * sending    正在发送状态
             * */

            //留言录制方法
            sendMessage.rec = function(){

                //只有当按钮处于初始状态时，才能留言；
                if(sendMessage.status != 'begin') return;

                sendMessage.status = 'rec';
                $(this).find('.text').html('留言中，点击发送');
                $(this).find('.mask').css({'width':0});
                var n = 0;
                $(this).find('.mask').removeClass('hide');
                sendMessage._time = setInterval(function(){
                    $(sendMessage).find('.mask').animate({ width: Math.floor((++n) * (159/15))},1000);
                    if(n == 15){
                        clearInterval(sendMessage._time);
                        $(sendMessage).find('.text').html('留言完成，点击发送');
                        $(sendMessage).find('.mask').addClass('finish');
                        sendMessage.status = 'recFinish';
                        _toolbarObj.fire( 'hornFinish');
                    }
                },1000);
            };

            //留言发送方法
            sendMessage.sending = function(){

                //只有当按钮处于录制或者录制成功状态时，才能发送；
                if(sendMessage.status != 'rec' && sendMessage.status != 'recFinish') return;

                sendMessage.status = 'sending';

                $(sendMessage).addClass('disable');
                var loadingText = ['正在发送','正在发送.','正在发送..','正在发送...'],
                    n = 0;
                if(sendMessage._time) clearInterval(sendMessage._time);
                $(sendMessage).addClass('loading').find('.text').html(loadingText[n++]);
                sendMessage.sendTime = setInterval(function(){
                   $(sendMessage).find('.text').html(loadingText[n++]);
                   n = (n == 4) ? 0 : n;
                },500);
                if(!$(sendMessage).find('.mask').hasClass('finish')){
                    $(sendMessage).find('.mask').addClass('finish');
                }
                setTimeout(function(){
                    hornBox.setValue(0);
                },200);
            };

            //重置按钮状态，恢复到初始值
            sendMessage.clear = function(){
                if(sendMessage.sendTime){
                    clearInterval(sendMessage.sendTime);
                    $(sendMessage).removeClass('loading');
                }
                if(sendMessage._time){
                    clearInterval(sendMessage._time);
                }
                hornBox.setValue(0);
                $(sendMessage).removeClass('disable');
                sendMessage.status = 'begin';
                $(sendMessage).find('.mask').addClass('hide').removeClass('finish').css({'width':0});
                $(sendMessage).find('.text').html('点击开始留言');

            };

            message.on('click',function(){

                if( $(me.message).hasClass( 'offline' )){
                    return;
                }

                _toolbarObj.startMessage();

            });

            //开启留言模式
            _toolbarObj.startMessage = function(){

                play.addClass( 'hide' );
                brightness.addClass( 'hide' );
                record.addClass( 'hide' );
                capture.addClass( 'hide' );
                zoom.addClass( 'hide' );
                talk.addClass( 'hide' );
                voiceBox.addClass( 'hide' );
                level.addClass( 'hide' );
                file.addClass( 'hide' );
                full.addClass( 'hide' );
                message.addClass( 'hide' );
                change.removeClass( 'hide' );
                hornBox.removeClass( 'hide' );
                sendMessage.removeClass( 'hide' );
                cancel.removeClass( 'hide' );
                ptzShow.addClass('hide');
                privacy.addClass('hide');
                $('.list').removeClass('hasPTZ');
                me.ptzPanel.addClass('_ptz_frm_hide').removeClass('_ptz_frm_show');
                me.ptzCtrl.addClass('_ptz_frm_hide').removeClass('_ptz_frm_show');

            };

            change.on('click',function(){

                var player = control.model.active;
                if(!$(change).hasClass('selected')){
                    $(change).addClass('selected');
                    player.video.stop( 0, '', true);
                    player.video.loadingHide();
                    $('._pluginPrompt').addClass('warm');
                }else{
                    $(change).removeClass('selected');

                    if ( !player.info.playing ){
                        $('._pluginPrompt').removeClass('warm');
                        control.fire( 'play', control, control.model.active.info );

                    }
                }

            });

			play.on('click',function(){
             
				if(me.initConfig.type == 'replay' ){
					var player = control.model.active;
                    if( !player.info ){
                        return hint.show({content:"请先选择需要播放视频"});
                    }
                    if( !me.initConfig.control.videoTimeBar.timebarUl || !player.info.playing ){
                        me.initConfig.control.videoTimeBar.playNextRecord();
                        return false;
                    }
                    if ( player.info.playing ){
                        !!player.info.pausing ?  player.video.resume( 0 ) : player.video.pause( 0 );
                    }
				}else if(me.initConfig.type == 'local'){
					 var player = control.model.active;
                    if( !player.info ){
                        return hint.show({content:"请先选择需要播放视频"});
                    }
                    if( !player.info.playing ){
                        control.fire( 'play' );
                        return;
                    }
                    if ( player.info.playing ){
                        !!player.info.pausing ?  player.video.resume( 0 ) : player.video.pause( 0 );
                    }
				}else if( me.initConfig.type == 'cloud'){
					var player = control.model.active;
                    if( !player.info ){
                        return hint.show({content:"请先选择需要播放视频"});
                    }
                    if( !player.info.playing ){
                        control.fire( 'play');
                        return;
                    }
                    if ( player.info.playing ){
                        !!player.info.pausing ?  player.video.resume( 0 ) : player.video.pause( 0 );
                    }
				}else{
					var player = control.model.active;
					var typePro = player.info.typePro ? player.info.typePro :true;

					if(typePro == 'replay'){
					    if(player.info.canRemoteReplay == 'no'){
							player.info.playing = false;
							playerPrompt('您没有查看该设备远程录像的权限哦~');
							return false;
						}
					}else if(typePro == 'realplay'){
						if(player.info.canRealPlay == 'no'){
							player.info.playing = false;
							playerPrompt('您没有查看该摄像机实时视频的权限哦~');
							return false;
						}

					}else {
							if(player.info.canRealPlay  == 'no'){
								player.info.playing = false;
								playerPrompt('您没有查看该摄像机实时视频的权限哦~');
								return false;
							}
					}
					if( !player.info ){
						return hint.show({content:"请先选择需要播放视频"});
					}
					if ( player.info.playing ){
						player.video.stop( 0 );
					} else {
						if(player.info.privacy){return;}
						control.fire( 'play', control, control.model.active.info );
					}
				}
			});

            capture.on( 'click', function(){

                var player = control.model.active;
                if( me.el.hasClass( '_disable' ) || me.capture.hasClass( '_captureDisable') ){
                    return;
                }
                var ret = player.video.capture();
                if(ret === ''){

                }else{
                	me.capture.addClass( '_captureDisable' );
                	setTimeout( function(){
                		me.capture.removeClass( '_captureDisable' );
                	},1500);
                    me.tip.removeClass('hide');
                    var tipShow = window.setTimeout(function(){
                        me.tip.addClass('hide');
                    },2000);
                    var fileBase64 = player.video.el.HWP_GetFileContent(ret,300,300);
                    var originalFileBase64 = player.video.el.HWP_GetFileContent(ret,0,0);
                    fileBase64 = "data:image/jpeg;base64," + fileBase64;
                    me.picList.push(ret);
                    if(currentUserType == 2 || control.model.active.info.isshare == "CUSTOMER"){
                        $('#capturePicListBox').prepend("<div class='img-container'><img class='share-pic' fileContent='"+originalFileBase64+"' src='"+fileBase64+"'/>");
                    }else{
                        $('#capturePicListBox').prepend("<div class='img-container'><img class='share-pic' fileContent='"+originalFileBase64+"' src='"+fileBase64+"'/><div class='img-toolbar' info='"+ret+"'><span class='title'>发送到</span><button class='fengmian' title='设置为封面'><img src='/assets/icons/share_fengmian.png'/></button><button class='xinlang'  title='分享到新浪微博'><img src='/assets/icons/share_weibo.png'/></button><button class='tengxun'  title='分享到腾讯微博'><img src='/assets/icons/share_tentxun.png'/></button></div><div>");
                    }
                    $('#capturePicList').show();
                    sendShareInfoLog && sendShareInfoLog(80001);
                    //bindWeiboEvent();
                }
            });

            me.recordHandler = function( force ){
                var player = control.model.active;
                if( me.el.hasClass( '_disable' )){
                    return;
                }
                if( !player.info.recording && force !== false ){
                    if( player.video.startRecord() === 0 ){
                        player.info.recording = true;
                        me.record.removeClass( '_record' ).addClass(  '_recording' ).attr( 'title', me.config.type === 'replay'? '停止剪辑':'停止录像');

                        sendShareInfoLog && sendShareInfoLog(80002);
                    }
                } else if( player.info.recording ) {
                    player.video.stopRecord();
                    player.info.recording = false;
                    me.record.removeClass( '_recording' ).addClass(  '_record' ).attr( 'title', me.config.type === 'replay'? '开始剪辑':'开始录像');
                    me.tip.removeClass('hide');
                    var tipShow = window.setTimeout(function(){
                        me.tip.addClass('hide');
                    },2000);
                    sendShareInfoLog && sendShareInfoLog(80003);
                }
            };


            record.on( 'click', me.recordHandler);

            voice.on( 'click', function(){
                // 参照优酷，使用设置音量为0来实现静音功能
                var valueCurrent = $("._voiceBox .progress").slider( "option", "value" );
                if(valueCurrent > 0){
                    valueRecord = valueCurrent;
                }
                if(me.voiceBox.hasClass( '_voice' )){
                    if( me.config.control.model.active.info.talking ){
                        ret = me.config.control.model.active.video.el.HWP_setVoiceTalkVolume_V17( 0, valueRecord );
                    } else {
                        me.config.control.model.active.video.sound();
                        if(valueRecord == 0){
                            ret = me.config.control.model.active.video.el.HWP_CloseSound();
                        }else{
                            ret = me.config.control.model.active.video.el.HWP_SetVolume( 0, valueRecord );
                        }
                    }
                    me.voiceBox.removeClass(  '_voice' );
                    me.voice.attr( 'title', '关闭声音');
                    $("._voiceBox .progress").slider( "option", "value", valueRecord );
                }else{
                    if( me.config.control.model.active.info.talking ){
                        ret = me.config.control.model.active.video.el.HWP_setVoiceTalkVolume_V17( 0, 0 );
                    } else {
                        me.config.control.model.active.video.sound();
                        ret = me.config.control.model.active.video.el.HWP_CloseSound();
                    }
                    me.voiceBox.addClass(  '_voice' );
                    me.voice.attr( 'title', '开启声音');
                    $("._voiceBox .progress").slider( "option", "value", 0 );
                }

            });


            full.on( 'click', function(){

                var player = control.model.active;
                if( me.el.hasClass( '_disable' )){
                    return;
                }
                player.video.full();
            });

            file.on( 'click', function(){

                var player = control.model.active;
                /*
                if( me.el.hasClass( '_disable' )){
                    return;
                }
                */
                player.video.file();
                sendShareInfoLog && sendShareInfoLog(80004);
            });

            zoom.on( 'click', function(){
                var player = control.model.active;
                if( me.el.hasClass( '_disable' )){
                    return;
                }
                if(player.video.zoom( zoom.status ) === 0){
                    zoom[ (zoom.status = !zoom.status) ? 'removeClass' : 'addClass']('_zoomCurrent');
                };
                sendShareInfoLog && sendShareInfoLog(80005);
            });

            //进入对讲模式
            _toolbarObj.talkStatus = function(){
            	$('._cancelTalk .time').html('00:00:00');
                play.addClass( 'hide' );
                record.addClass( 'hide' );
                zoom.addClass( 'hide' );
                brightness.addClass ( 'hide' );
                level.addClass( 'hide' );
                file.addClass( 'hide' );
                full.addClass( 'hide' );
                message.addClass( 'hide' );
                me.ptzShow.addClass('hide');
                me.privacy.addClass('hide');
                
                me.ptzPanel.addClass('_ptz_frm_hide').removeClass('_ptz_frm_show');
                me.ptzCtrl.addClass('_ptz_frm_hide').removeClass('_ptz_frm_show');
                //hornBox.removeClass( 'hide' );
                talk.addClass( 'hide' );
                cancelTalk.removeClass( 'hide' );
            	var player = control.model.active;
                player.info.talking = true;
                if(player.info.support_ptz){
                    $('.list').addClass('hasPTZ');
                }
                getTalkTime();
                function getTalkTime(){
                	if(me.intervalTalkTime){
                		clearInterval(me.intervalTalkTime);
                	}
                	var _seconds = 0,
                		_minutes = 0,
                		_hours = 0;
            		me.intervalTalkTime = setInterval(function(){
            			_seconds++;
            			if(_seconds == 60){
            				_seconds = 0;
            				_minutes++;
            				if(_minutes == 60){
            					_minutes = 0;
            					_hours++;
            				}
            			}
            			$('._cancelTalk .time').html(timePad('0',2,_hours)+':'+timePad('0',2,_minutes)+':'+timePad('0',2,_seconds));
            		},1000);

                }

            }

            //开启对讲模式
            _toolbarObj.startTalk = function(){
                var player = control.model.active;
                if(player.info.support_ptz){
                    $('.list').addClass('hasPTZ');
                }
               
                //$('.listBox').show();
                //$('.content-PTZ').hide();
               // $('#operate').hide();

                if( _toolbarObj.el.hasClass( '_disable' )){
                    return;
                }

                var releaseVersion = wall.model.active.info.releaseVersion;
                window.console && console.log( wall.model.active.info.deviceSerial + '设备的对讲功能为 ' + wall.model.active.info.support_talk );
                if ( !wall.model.active.info.support_talk ) {
                	dialog.warn('<span style="font-size: 15px;">设备不支持对讲。</span>');
                    return;
                }
                if ( releaseVersion != 'VERSION_17' ) {
                    dialog.warn('<span style="font-size: 15px;">设备版本过低，请升级后再使用该功能</span>');
                    return;
                }
                if( _toolbarObj.talk.hasClass('_talkloading')){
                    return _toolbarObj;
                }
                if( !player.info.talking ){

                    if ( !player.video.startTalk( player.info.deviceIp, player.info.httpPort, player.info.plainPassword )){
                        if(player.info.support_ptz){
                            $('.list').addClass('hasPTZ');
                        }
                        
                        //me.voice.addClass('hide');
                        player.info.talking = true;
                        _toolbarObj.talk.removeClass( '_talk' ).addClass(  '_talkloading ' ).attr('title', '停止对讲');
                        //me.voice.removeClass( '_voiceing' ).addClass(  '_voice' ).attr( 'title', '开启声音');
                        sendShareInfoLog && sendShareInfoLog(80006);
                        me.ptzCtrl.addClass('_ptz_frm_hide').removeClass('_ptz_frm_show');
                        me.ptzPanel.addClass('_ptz_frm_hide').removeClass('_ptz_frm_show');
                    }

                } else {
                    player.video.stopTalk();
                    //player.info.talking = false;
                    _toolbarObj.talk.removeClass( '_talking' ).addClass(  '_talk' ).attr('title', '开启对讲');
                    sendShareInfoLog && sendShareInfoLog(80007);
                    hint.show({content:"对讲关闭成功"});
                }

            }

            cancelTalk.on('click', function() {

            	quitTalk.call(me);

        	});


            talk.on( 'click', function(){
            	if( me.el.hasClass( '_disable' )){ // 工具条禁用状态下，不能点击
                    return;
                }
            	if( wall.model.active.info.status == '2'){
            		dialog.warn('<span style="font-size: 15px;">该设备不在线</span>');
            		return;
            	}
            	if(!isReal){
                    control.fire( 'play', control, control.model.active.info, "talk");
                    return ;
            	}
                _toolbarObj.startTalk();
            });

            ptzShow.on('click',function(){
            	if( me.el.hasClass( '_disable' )){ // 工具条禁用状态下，不能点击
                    return;
                }
                var ptzCtrl = me.ptzCtrl;
                var ptzPanel = me.ptzPanel;
                $('.title .tab:eq(1)').addClass('t_active').siblings().removeClass('t_active');
                $('.listBox').hide();
                $('.content-PTZ').show();
                $('#operate').show();
            	//if(ptzCtrl.hasClass('_ptz_frm_hide')){
            	//	ptzCtrl.removeClass('_ptz_frm_hide');
            	//	ptzPanel.removeClass('_ptz_frm_hide');
            	//	ptzCtrl.addClass('_ptz_frm_show');
            	//	ptzPanel.addClass('_ptz_frm_show');
            	//}else if(ptzCtrl.hasClass('_ptz_frm_show')){
            	//	ptzCtrl.removeClass('_ptz_frm_show');
            	//	ptzCtrl.addClass('_ptz_frm_hide');
            	//	ptzPanel.removeClass('_ptz_frm_show');
            	//	ptzPanel.addClass('_ptz_frm_hide');
            	//}

            });
            

            privacy.on('click',function(){
               
                if(me.el.attr('class') == '_Toolbar _disable'){
                    return;
                }
                var _this = $(this);
                var data = {};
                data.serial = window.wall.model.active.info.subSerial;
                data.enable =$(this).hasClass('_privacyOn') ? 1 : 0;
                data.type = 7;
                data.enable ? loadingBox.show('正在开启遮蔽中') :loadingBox.show('正在关闭遮蔽中');
                $.ajax({
                    url : basePath + '/device/deviceSwitch!swithRebotAlarm1.action?noCache='+ Math.random(),
                    data : data,
                    success : function(r){
                        //$('._pluginPrompt').addClass('_pluginPromptAD');

                        loadingBox.hide();

                        switch (r.resultCode){
                            case '0':
                                if(data.enable){
                                    var player = control.model.active;
                                    //alert(player.info.recording);
                                    if(player.info.recording){
                                        player.video.stopRecord();
                                        //player.info.talking = false;
                                        _toolbarObj.record.removeClass( '_recording' ).addClass(  '_record' ).attr('title', '开始录像');
                                        sendShareInfoLog && sendShareInfoLog(80003);
                                    }else{
                                        hint.show('开启成功！');
                                    } 
                                    me.el.addClass( '_disable privacying' );
                                    wall.model.active.info.privacy = true;

                                    wall.model.active.video.showPrompt();
                                    _this.removeClass('_privacyOn').attr('title','点击可关闭镜头遮蔽');
                                    $('._level').addClass('_levelDisable');
                                    $('._pluginPrompt').attr('class','_pluginPrompt _pluginPromptPrivacy').html('<span class="icon">镜头遮蔽中</span>').fadeIn();
                                    $('.content-PTZ .icon-switch,.content-PTZ .add,.content-PTZ .cl_item').addClass('disabled');      
                                }else{
									if(wall.model.active.info.playing !=true){
									   playRealHandler();
									}
                                    hint.show('关闭成功！');
                                    me.el.removeClass( '_disable privacying' );
                                    wall.model.active.info.privacy = false;
                                    _this.addClass('_privacyOn').attr('title','点击可开启镜头遮蔽');
                                    $('._pluginPrompt').addClass('_pluginPromptAD').fadeOut().html('');
                                    wall.model.active.video.hidePrompt();
                                    $('.content-PTZ .icon-switch,.content-PTZ .add,.content-PTZ .cl_item').removeClass('disabled');
                                    $('._level').removeClass('_levelDisable');
                                }
                                break;
                            default :
                                var getResultCode = ''; 
                                if(data.enable){
                                    if(r.resultCode){
                                        dialog.errorInfo('开启失败，' + getPtzError(r.resultCode));
                                    }else{
                                        dialog.errorInfo('开启失败，请检查网络' + getResultCode);
                                    }
                                }else{
                                    //dialog.errorInfo('关闭失败，请检查网络' + getResultCode);
                                    if(r.resultCode){
                                        dialog.errorInfo('关闭失败，' + getPtzError(r.resultCode));
                                    }else{
                                        dialog.errorInfo('关闭失败，请检查网络' + getResultCode);
                                    }
                                }
                        }
                    }
                });
            });

        };

        function resetZoom( bool ){
            var me = this,
                zoomHander = me.initConfig.control.model.active.video.zoom,
                zoom = me.zoom;
            try{
                if( bool === false ){
                    zoomHander.call( me.initConfig.control.model.active.video, false );
                    zoom['removeClass']('_zoomCurrent');
                    zoom.status = true;
                }
            } catch(e){
                zoom['removeClass']('_zoomCurrent');
                zoom.status = true;
            }
        }

        function resetTool(){
            var me = this;
            me.play.removeClass( 'hide' );
            me.record.removeClass( 'hide' );
            me.capture.removeClass( 'hide' );
            // me.zoom.removeClass( 'hide' );
            me.voiceBox.removeClass( 'hide' );
            me.talk.removeClass( 'hide' );
            me.level.removeClass( 'hide' );
            me.file.removeClass( 'hide' );
            me.full.removeClass( 'hide' );
            me.message.removeClass( 'hide' );
            me.change.addClass( 'hide' );
            me.hornBox.addClass( 'hide' );
            me.sendMessage.addClass( 'hide' );
            me.cancel.addClass( 'hide' );
            me.hornBox.close();
            $('._pluginPrompt').removeClass('warm');
            me.change.removeClass('selected');

            setTimeout(function(){
                me.sendMessage.clear();
            },1000);

            var _activeInfo = wall.model.active.info,
				_type = _activeInfo['model'],
				_version = _activeInfo['version'].split(' ')[2];
        }

        function quitTalk(){
        	var me = this,
        		player = me.config.control.model.active;
       	 	player.video.stopTalk();
            //player.info.talking = false;
            _toolbarObj.talk.removeClass( '_talking' ).addClass(  '_talk' ).attr('title', '开启对讲');
            sendShareInfoLog && sendShareInfoLog(80007);
            resetTalkTool.call(me);

        }

        function resetTalkTool(){
            
            var isReplay = wall.model.active.info.talking;

            var me = _toolbarObj;
            me.play.removeClass( 'hide' );
            me.record.removeClass( 'hide' );
            me.capture.removeClass( 'hide' );
            me.voiceBox.removeClass( 'hide' );
            me.talk.removeClass( 'hide' );
            me.level.removeClass( 'hide' );
            me.file.removeClass( 'hide' );
            me.full.removeClass( 'hide' );
            me.change.addClass( 'hide' );
            me.hornBox.addClass( 'hide' );
            me.sendMessage.addClass( 'hide' );
            me.cancel.addClass( 'hide' );
            me.hornBox.close();
            me.change.removeClass('selected');
            me.cancelTalk.addClass('hide');

            var activeInfo = me.config.control.model.active.info;

    		if (activeInfo.support_message && currentUserType != 2) {
    			_toolbarObj.message.removeClass('hide');
    		} else {
    			_toolbarObj.message.addClass('hide');
    		}
            if(isReplay){
                $('.list').removeClass('hasPTZ');
                $('.listBox').show();
                $('.content-PTZ').hide();
                $('#operate').hide();
                return false;
            }
           
    		if (activeInfo.support_ptz == '1') {
    			_toolbarObj.ptzShow.removeClass('hide');
                if(!activeInfo.support_privacy){
                    wall.toolbar.privacy.addClass('hide');
                }else{
                    wall.toolbar.privacy.removeClass('hide');
                }
                if(!activeInfo.support_ssl){
                    $('.list .sfar').addClass('hide');
                }else{
                    $('.list .sfar').removeClass('hide');
                }
                if(!activeInfo.ptz_preset){
                    $('.list .collectLocation').addClass('hide');
                }else{
                    $('.list .collectLocation').removeClass('hide');
                }
                $('.list').addClass('hasPTZ');
                if($('.controlPTZ').hasClass("t_active")){
                    $('.listBox').hide();
                    $('.content-PTZ').show();
                    $('#operate').show();
                }
                if(!$('.goto_spot').attr('style')){
                    $('.list').removeClass('hasPTZ');
                    $('.listBox').show();
                    $('.content-PTZ').hide();
                    $('#operate').hide();
                    _toolbarObj.ptzShow.addClass('hide');
                     _toolbarObj.privacy.addClass('hide');
                    return false;
                }
    		} else {
    			_toolbarObj.ptzShow.addClass('hide');
                _toolbarObj.privacy.addClass('hide');
                $('.list').removeClass('hasPTZ');
    		}
            var _activeInfo = wall.model.active.info,
				_type = _activeInfo['model'],
				_version = _activeInfo['version'].split(' ')[2];
        }

        var beRecording = function(){

            var me = this;
            try{
                if( !me.initConfig.control.model.active.info.recording ){
                    me.record.removeClass( '_recording' ).addClass( '_record' ).attr( 'title', me.config.type === 'replay'? '开始剪辑':'开始录像');
                    me.record.html('');
                } else {
                    me.record.removeClass( '_record' ).addClass( '_recording' ).attr( 'title', me.config.type === 'replay'? '停止剪辑':'停止录像');
                }
            } catch(e){
                me.record.removeClass( '_recording' ).addClass( '_record' ).attr( 'title', me.config.type === 'replay'? '开始剪辑':'开始录像');
                me.record.html('');
            }

        };

        var updateStatus = function(){
            var me = this,
                _message = $(me.message);
            try{
                var player  = me.initConfig.control.model.active.info,
                    _status = me.initConfig.control.model.active.info.status;
                if(_status != 1){
                    _message.addClass('offline');
                }else{
                    _message.removeClass('offline');
                }
                if( player.playing && !player.pausing  ){
                    me.el.removeClass( '_disable' );
                    if( me.initConfig.type == 'replay' || me.initConfig.type == 'local' || me.initConfig.type == 'cloud' ){
                        me.play.removeClass( '_play' ).addClass( '_pause').attr( 'title', '暂停' );
                    } else {
                        me.play.removeClass( '_play' ).addClass( '_stop').attr( 'title', '停止' );
                    }

                    me.talk.removeClass( player.talking ? '_talk' : '_talking' ).addClass( player.talking ? '_talking' : '_talk' );
                    me.talk.attr('title',player.talking ? '停止对讲' : '开启对讲');
                    // 默认开启声音
                    me.initConfig.control.model.active.video.sound();
                    player.voiceing = true;
                    me.voice.attr( 'title', ( player.voiceing ? '停止声音' : '开启声音' ) );
                    me.voiceBox.addClass( player.voiceing ? '' : '_voice' );//.attr( 'title', ( player.voiceing ? '停止声音' : '开启声音' ) );
                } else {
                	console.log('remove talkloading **************************');
                    me.el.addClass( '_disable' );
                    me.play.removeClass( '_stop _pause' ).addClass( '_play').attr( 'title', '播放' );
                    me.initConfig.control.model.active.video.stopTalk();
                    me.talk.removeClass( '_talkloading _talking' ).addClass( '_talk').attr( 'title', '开启对讲' );
                    //me.voice.attr( 'title', '开启声音' );
                    me.talk.attr('title','开启对讲');

                }
                me.resetZoom( false );
                if( player.recording === false ){
                    me.record.removeClass( '_recording' ).addClass(  '_record' ).attr( 'title', me.config.type === 'replay'? '开始剪辑':'开始录像');
                    if( !!me.initConfig.control.model.active.video.recordIntervalId ){
                        clearInterval( me.initConfig.control.model.active.video.recordIntervalId );
                        me.initConfig.control.model.active.video.el.HWP_StopSave( 0 );
                    }
                    player.recordTime = '';
                    me.record.html( '' );
                    player.recording = false;
                }
            } catch(e){
                me.el.addClass( '_disable' );
                me.play.removeClass( '_stop _pause' ).addClass( '_play');
                me.resetZoom( false );
            }
            beRecording.call( me );
        };
        function sendWeiboMessage(type, picPath){
            var fileBase64 = this.initConfig.control.model.active.video.el.HWP_GetFileContent(picPath);
            var url = basePath + '/uploadpic',
                data = {
                    uploadType : 2,
                    data       : fileBase64
            };
            var title = '欢迎使用萤石云',
                rLink = 'yun.ys7.com',
                site  = 'appkey';
            $.ajax({
                url : url,
                type : 'post',
                data : data,
                dataType : 'json',
                complete : function( data ) {
                    if(data.responseText == 'error'){
                        dialog.errorInfo({
                            content:'设置封面失败，请重试'
                        });
                    }else{
                        var pic = "http://" + window.location.host + data.responseText;
                        if(1 == type){
                            shareTSina(title,rLink,site,pic);
                        }else if(2 == type){
                            shareToWb(title,rLink,site,pic);
                        }
                    }
                }
            });
        }

        var redirectUri = "http://" + window.location.host + "/callback.html";
        function GetWeiboAuthReqUrl(type){
           var url = this.initConfig.control.model.active.video.el.HWP_GetWeiboAuthReqUrl(type,redirectUri);
           window.console && window.console.log(url);
           var iWidth = 800; //弹出窗口的宽度;
           var iHeight = 450; //弹出窗口的高度;
           var iTop = (window.screen.availHeight-30-iHeight)/2; //获得窗口的垂直位置;
           var iLeft = (window.screen.availWidth-10-iWidth)/2; //获得窗口的水平位置;
           window.open(url, 'sub', 'height=' + iHeight + ',width=' + iWidth + ',top=' + iTop + ',left=' + iLeft + 'toolbar=no,menubar=no,scrollbars=no, resizable=no,location=no, status=no');
        }

        function SendWeiboMess(type, auth, content, pic)        {
           var ret = this.initConfig.control.model.active.video.el.HWP_SendMicroblogging(type, auth, content, pic, redirectUri);
           window.console && window.console.log(ret + ' : ' + type + ' : ' + auth + ' : ' + pic + ' : ' + content);
        }

        function SetDefaultImage(userid, puid, chan, fileBase64, srcDom){
//          var fileBase64 = this.initConfig.control.model.active.video.el.HWP_GetFileContent(picPath);
            var url = basePath + '/uploadpic',
                data = {
            		cameraId   : wall.model.active.info.cameraId,
                    uploadType : 1,
                    userid     : userid,
                    puid       : puid,
                    chan       : chan,
                    data   : fileBase64
            	};
            $.ajax({
                url : url,
                type : 'post',
                data : data,
                dataType : 'json',
                complete : function( data ) {
                    if(data.responseText == 'error'){
                        dialog.errorInfo({
                            content:'设置封面失败，请重试！'
                        });
                    }else{
                        $('.fengmian', srcDom).addClass('hide')
                        hint.show({content:'设置封面成功！'});
                        $('.camera.isPlaying').find('img').attr('src', "data:image/jpeg;base64," + fileBase64).attr('needcover','0');
                    }
                }
            });
        }

    	function timePad(c, n, s){
    		var m = n - String(s).length;
    		return (m < 1) ? s : new Array(m+1).join(c) + s;
    	}

    	/**云台控制开始
    	 * tangfeng 2014-03-21
    	 */
    	function ptzStart(position){
            
            if(wall.model.active.info.status == 2){
                dialog.warn('设备不在线，请刷新或检查设备网络');
                loadingBox.hide();
                return false;
            }else if(wall.model.active.info.privacy){
                dialog.warn('镜头已遮蔽，无法操作云台');
                loadingBox.hide();
                return false;
            }else if( $('._Toolbar').hasClass('_disable') ){
                dialog.warn('当前设备状态不能进行相关操作');
                loadingBox.hide();
                return false;
            } else {

                if(position != null){
                    
                    ptzEventCtrl(position,"START");
                }
                return true; 
            }

    	}
    	/**云台控制结束
    	 * tangfeng 2014-03-21
    	 */
    	function ptzStop(position){
    		if(position != null ){
    			ptzEventCtrl(position,"STOP");
    		}
    	}

        function getPtzError(resultCode){
            var returnErrorMsg = "";
            switch(resultCode){
                case "2003": returnErrorMsg = '设备不在线'; break;
                case "2009": returnErrorMsg = '设备请求响应超时'; break;
                case "1310720": returnErrorMsg = '镜头转动中，请稍后'; break;
                case "1310721": returnErrorMsg = '听声辨位已开启，操作失败'; break;
                case "1310722": returnErrorMsg = '轨迹巡航中，请稍等'; break;
                case "1310723": returnErrorMsg = '当前位置已被删除，请返回刷新'; break;
                case "1310724": returnErrorMsg = '当前就在这个位置哦'; break;
                case "1310725": returnErrorMsg = '听声辨位中，请稍候'; break;
                case "1310726": returnErrorMsg = '镜头转动中，请稍后'; break;
                case "1310727": returnErrorMsg = '操作太频繁啦，先歇歇吧'; break;
                case "1310728": returnErrorMsg = '操作太频繁啦，先歇歇吧'; break;
                case "1310729": returnErrorMsg = '操作失败'; break;
                case "1310730": returnErrorMsg = '已经不能收藏更多了'; break;
                case "1310731": returnErrorMsg = '镜头已遮蔽，无法操作云台'; break;
                case "1310732": returnErrorMsg = '操作太频繁啦，先歇歇吧'; break;
                case "1310733": returnErrorMsg = '镜头转动中，请稍后'; break;
                case "1310734": returnErrorMsg = '操作失败，正在对讲中'; break;
                default : returnErrorMsg = '可能是网络异常，请稍后重试'; break;
            }
            return returnErrorMsg;
        }

    	/**云台控制事件处理
    	 * tangfeng 2014-03-21
    	 */
    	function ptzEventCtrl(position,action){
    		if(position != null && action !=null){
                
    			var szClientSession = $.cookie('DDNSCOOKIE').split(',')[0];
    			var _activeInfo = wall.model.active.info;
    			if(_activeInfo == null){
    				return;
    			}

                
    			var channelno = parseInt((_activeInfo.channelNo - 2)/100);//视频播放获取通道后，对原通道号进行了换算（channelno*100+2），这里需要换算回来了
    			var szDevInfo = {"subSerial":_activeInfo.deviceSerial,"channelNo":channelno,"command":position};
               if( position == 'CENTER'){
                    _activeInfo.isCenter = true;
                    $.ajax({
                        url : basePath + '/device/mirror/controll.json',
                        type : 'post',
                        //timeout : 60000,
                        data : szDevInfo,
                        dataType : 'json',
                        success : function(data) {
                            _activeInfo.isCenter = false;
                            loadingBox.hide();
                            if(data.resultCode != "0"){
                                dialog.warn(getPtzError(data.resultCode));
                            }   
                        },
                        error : function(){
                            _activeInfo.isCenter = false;
                            loadingBox.hide();
                            dialog.warn('可能是网络异常，请稍后重试');
                        }
                    });
               }else{
                    szDevInfo = {"subSerial":_activeInfo.deviceSerial,"channelNo":channelno,"command":position,"action":action,"speed":7};
                    $.ajax({
                        url : basePath + '/device/ptz/controll.json',
                        type : 'post',
                        //timeout : 60000,
                        data : szDevInfo,
                        dataType : 'json',
                        success : function(data) {
                            if( data.resultCode != ''){
                                if(data.resultCode != "0"){
                                    dialog.warn(getPtzError(data.resultCode));
                                }  
                            }
                            
                        },
                        error : function(){
                           
                            dialog.warn('可能是网络异常，请稍后重试');
                        }
                    });
               } 
    			//var szServerInfo ={"casIP":_activeInfo.casIp,"casPort":_activeInfo.casPort};
    			/*try{
    				var ret= null;
    				if(position == 'CENTER'){//镜像事件
    					szDevInfo ={"subSerial":_activeInfo.deviceSerial,"channelNo":channelno,"command":position};
    					//ret = wall.model.active.video.el.HWP_DisplayCtrl(szClientSession,JSON.stringify(szDevInfo),JSON.stringify(szServerInfo));
    				}else{
    					//ret = wall.model.active.video.el.HWP_PTZCtrl(szClientSession,JSON.stringify(szDevInfo),JSON.stringify(szServerInfo));
    				}

    				if(ret!= null){
    					var v = JSON.parse(ret);
    					if(v != 0){
    						dialog.errorInfo({
    						                 content:'控制云台失败('+v+')'
    						});
    					}
    				}
    			}catch(ex){
    				dialog.errorInfo({
		                 content:'控制云台出错('+v+')'
    				});
    			}*/
    		}
    	}

        return {
            initConfig : initConfig,
            init : init,
            updateStatus : updateStatus,
            resetLevel : resetLevel,
            resetZoom : resetZoom,
            GetWeiboAuthReqUrl : GetWeiboAuthReqUrl,
            SendWeiboMess : SendWeiboMess,
            SetDefaultImage : SetDefaultImage,
            sendWeiboMessage : sendWeiboMessage,
            resetTool : resetTool,
            resetTalkTool : resetTalkTool,
            quitTalk : quitTalk
        };
    })());

    exports.toolbar = Toolbar;
});

