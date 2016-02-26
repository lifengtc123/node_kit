!function () {
    var Base = window.Base = {};

    var eventSplitter = /\s+/,
        slice = Array.prototype.slice;

    Base.Event = {
        on: function (events, callback, context) {
            var calls,
                event,
                node,
                tail,
                list;
            if (!callback) {
                return this;
            }
            events = events.split(eventSplitter);
            calls = this._callbacks || (this._callbacks = {});

            while (event = events.shift()) {
                list = calls[event];
                node = list ? list.tail : {};
                node.next = tail = {};
                node.context = context;
                node.callback = callback;
                calls[event] = {tail: tail, next: list ? list.next : node};
            }
            return this;
        },


        fire: function (events) {
            var event, node, calls, tail, args, all, rest, ret;
            if (!(calls = this._callbacks)) return this;
            all = calls.all;
            events = events.split(eventSplitter);
            rest = slice.call(arguments, 1);

            while (event = events.shift()) {
                if (node = calls[event]) {
                    tail = node.tail;
                    while ((node = node.next) !== tail && (ret = node.callback.apply(node.context || this, rest)) !== false) {
                    }
                }
                if (node = all) {
                    tail = node.tail;
                    args = [event].concat(rest);
                    while ((node = node.next) !== tail) {
                        node.callback.apply(node.context || this, args);
                    }
                }
            }

            return ret;
        },

        off:function(events){
            var event,node,calls,tail;
            if (!(calls = this._callbacks)) return this;
            events = events.split(eventSplitter);
            while (event = events.shift()) {
                if (node = calls[event]) {
                    tail = node.tail;
                    node.next = tail;
                }
            }
        },

        offAll:function(){
            this._callbacks = {};
        }

    };

    String.prototype.startWith = function (str) {
        if (str == null || str == "" || this.length == 0
            || str.length > this.length)
            return false;
        if (this.substr(0, str.length) == str)
            return true;
        else
            return false;
        return true;
    };

    String.prototype.endWith = function (str) {
        if (str == null || str == "" || this.length == 0
            || str.length > this.length)
            return false;
        if (this.substring(this.length - str.length) == str)
            return true;
        else
            return false;
        return true;
    };
    
    /**
	 * 转义字符串特殊字符
	 */
    String.prototype.escapeCSS = function(){
    	var str = this.toString();
    	if(str==null || str=="") {
			return null;
		}
    	str = str.replace(/:/g,"\\:");  
		str = str.replace(/\./g,"\\.");  
		str = str.replace(/\//g,"\\/");  
		str = str.replace(/\$/g,"\\$");  
		str = str.replace(/\[/g,"\\[");  
		str = str.replace(/\]/g,"\\]");  
		str = str.replace(/=/g,"\\=");
		str = str.replace(/\+/g,"\\+");
		return str;
    };
    Array.prototype.map = function(fn){
		var me = this,
		ret = [];
		for(var i = 0; i < me.length; i++){
			ret.push(fn(me[i], i));
		};
		return ret;
    };
    Array.prototype.indexOf = function(val){
		return (function(val, arr){
					for(var i = 0; i < arr.length; i++){
						if(arr[i] === val){
							return i;
						};
					};
					return -1;
			   })(val, this);
	};
	Base.format = function(value){
		return value.replace( /\&/g,'&amp;').replace( /\>/g, '&gt;').replace( /\</g, '&lt;').replace( /\"/g, '&quot;').replace( /\'/g, '&#x27;').replace( /\//g, '&#x2F;');
	}
	$.extend({
		pad : function( c, n, s ){
			var m = n - String( s ).length;
			return ( m < 1 ) ? s : new Array( m + 1 ).join( c ) + s;
		},
		getBody :function(){
			var doc = document;
			return $(doc.body || doc.documentElement);
		},
		/**
		 * @method setCapture
		 * 事件对象捕捉，通常用于拖动元素操作上
		 * @param { Node } node 捕捉的Node元素
		 */
		setCapture : function( node ){
			if( node.setCapture ){
				node.setCapture();
			}else if( window.captureEvents ){
				window.captureEvents( Event.MOUSEMOVE || Event.MOUSEUP );
			}
		},
		/**
		 * @modethod releaseCapture
		 * 对应capture方法，释放捕捉对象
		 * @param {Node} node 释放的Node元素
		 */
		releaseCapture : function( node ){
			if( node.releaseCapture ){
				node.releaseCapture();
			} else if( window.captureEvents ){
				window.captureEvents( Event.MOUSEMOVE || Event.MOUSEUP );
			}
			document.onmousemove=null;
			document.onmouseup=null;
		},
		isTarget : function(dom,e){//dom,body分别是jquery对象
			e = e || window.event;
			var origin = e.srcElement || e.target,
				body = $.getBody()[0];
			dom = dom[0];
			while((origin !== dom) && (origin !== body) && origin.parentNode){
				origin = origin.parentNode;
			};
			if(origin !== body){
				return true;
			};
			return false;
		},
		getPosition : function(dom){
			var	top = 0,
				left = 0;
			dom =dom[0];
			while( dom && dom.nodeName && dom.nodeName.toUpperCase() !== 'BODY'){
				top += dom.offsetTop;
				left += dom.offsetLeft;
				dom = dom.offsetParent;
			}
			return [left, top];
		}
	});
	

//调用形式   new Date().format('yyyy-MM-dd')
// Date实例方法（原型方法）
    Date.prototype.format = function (fmt) {
        var me = this;
     //   me = Date.formatToBJ(me);
        var o = {
            "M+": me.getMonth() + 1, // 月份
            "d+": me.getDate(), // 日
            "h+": me.getHours(), // 小时
            "m+": me.getMinutes(), // 分
            "s+": me.getSeconds(), // 秒
            "q+": Math.floor((me.getMonth() + 3) / 3), // 季度
            "S": me.getMilliseconds()
            // 毫秒
        };
        if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (me.getFullYear() + "").substr(4 - RegExp.$1.length));
        for (var k in o)
            if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt
                .replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        return fmt;
    };
    //调用形式  formatToBJ( new Date())
//参数为date对象，返回值为北京时区的date对象
    Date.formatToBJ = function (date) {
        var localTime = date.getTime();
        var offsetUtcTime = date.getTimezoneOffset()*60000;
        var utcTime = localTime + offsetUtcTime;
        var offsetBeijing = 8;
        var beijingTime = utcTime + 3600000*offsetBeijing;
        beijingTime = new Date(beijingTime);
        return beijingTime;
    };
//格式化时间 参数：20140529T112135Z 返回值：1401333695000
//Date静态方法
    Date.fixTime = function (hikTime) {
        var tmpDate = new Date( currentTime );
        var timeArr = hikTime.match(/\d{2}/g);
        timeArr[1] = [timeArr[0], timeArr[1]].join("");
        timeArr.shift();
        if (timeArr.length != 6) {
            return null;
        }
        for (var i = 0; timeArr[i]; i++) {
            timeArr[i] = new Number(timeArr[i]) + 0;
        }
        tmpDate.setYear(timeArr[0]);
        tmpDate.setMonth(timeArr[1] - 1);
        tmpDate.setDate(timeArr[2]);
        tmpDate.setHours(timeArr[3]);
        tmpDate.setMinutes(timeArr[4]);
        tmpDate.setSeconds(timeArr[5]);
        tmpDate.setMilliseconds(0);
        return tmpDate - 0;
    };
    var EventUtil =window.EventUtil = {
        getEvent: function (event) {
            return event ? event : window.event;
        },
        addHandler: function (element, type, handler) {
            if (element.addEventListener) {
                element.addEventListener(type, handler, false);
            } else if (element.attachEvent) {
                element.attachEvent("on" + type, handler);
            } else {
                element["on" + type] = handler;
            }
        },
        removeHandler : function(element,type,handler){
			if(element.removeEventListener){
				element.removeEventListener(type,handler,false);
			}else if(element.detachEvent){
				element.detachEvent("on"+type,handler);
			}else {
				element["on"+type]=null;
			}
		}
    };
    EventUtil.addHandler(window, "unload", function (event) {
        try {
            var c = $('[type="application/hwp-shipin7-plugin"]')[0];
            if (c) {
                c.HWP_OnUnload()
            } else {
                $('[classid="clsid:955CC7B1-B517-469d-B10B-A41B39A8225E"]')[0].HWP_OnUnload();
            }
        } catch (e) {
        }
    });
}();