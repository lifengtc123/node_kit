define(function(require, exports){
	
	var Base = {
			isNumber : function(v){
				return Object.prototype.toString.call(v) == '[object Number]' ? true : false	
			},
			toNumber : function(v){
				v = Number(v);
				if(this.isNumber(v)){
					return v;
				};
				return 0;
			},
			
			parentPosition : function(dom,top,left){
				var me = this,
					elDom = dom,
					top = top || elDom.offsetTop,
					left = left || elDom.offsetLeft,
					parent;
				if(parent = elDom.offsetParent){
					top += me.toNumber(parent.offsetTop);
					left += me.toNumber(parent.offsetLeft);
					return me.parentPosition(parent,top,left);
				}
				return [left, top];
			},
			
			toArray : function(arr){
				var i = 0,
					cc,
					ret = [];
				for(; cc = arr[i]; i++){
					ret.push(cc);
				}
				return ret;
			},
			each : function(arr, fn, scope, obj){
				if(typeof arr == 'string'){
					arr = [arr]
				}
				if($.isArray(arr) || $.isArray(arr = this.toArray(arr))){
					var i = 0,len,v;
					for(len = arr.length; i < len; i++){
						v = arr[i];
						fn.call(scope,v,i,arr,arr.length)
					}
				} else if(!$.isEmptyObject(arr)){
					var prop;
					for(prop in arr){
						if(arr.hasOwnProperty(prop)){
							fn.call(scope,prop,arr[prop],arr)
						}
					}
				}
			},
			namespace : function(){
				var len = arguments.length,
					ns,
					cur,
					len2,
					sub,
					i = 0,
					j;
				for(; i < len; i++){
					ns = arguments[i].split('.');
					cur = window[ns[0]];
					if(cur === undefined){
						cur = window[ns[0]] = {};
					}
					len2 = (sub = ns.slice(1)).length;
					for(j = 0; j < len2; j++){
						cur = cur[sub[j]] = cur[sub[j]] || {};
					}
				}
				return cur;
			},
			extend : function(){
				var io = function(o){
					for(var m in o){
						this[m] = o[m];
					}
				};
				var oc = Object.prototype.constructor;
		
				return function(sb, sp, overrides){
					if(typeof sp == 'object'){
						overrides = sp;
						sp = sb;
						sb = overrides.constructor != oc ? overrides.constructor : function(){sp.apply(this, arguments);};
					}
					var F = function(){},
						sbp,
						spp = sp.prototype;
		
					F.prototype = spp;
					sbp = sb.prototype = new F();
					sbp.constructor=sb;
					sb.superclass=spp;
					if(spp.constructor == oc){
						spp.constructor=sp;
					}
					//sb.override = function(o){
					//	Ext.override(sb, o);
					//};
					sbp.superclass = sbp.supr = (function(){
						return spp;
					});
					sbp.override = io;
					$.extend(sbp, overrides);
					sb.extend = function(o){return Base.extend(sb, o);};
					return sb;
				};
			}()	
						
			
	};


	window.console = window.console || {
		log: function(){},
		warn: function(){}
	};
	
	exports.Base = Base;

});