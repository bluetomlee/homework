

!function(window,undefined){

	//save native object and same prototype method to reduce access time
	var document = window.document,
		navigator = window.navigator,
		toString = Object.prototype.toString,
		hasOwn = Object.prototype.hasOwnProperty,
		push = Array.prototype.push,
		slice = Array.prototype.slice,
		trim = String.prototype.trim,
		indexOf = Array.prototype.indexOf;


	var zQuery = function(selector,context) {
		return new zQuery.fn.init(selector,context);
	};

	zQuery.fn = zQuery.prototype = {
		consturctor : zQuery,

		/**
			@param : {'#id'|'.class'|'tag'|element|doument}
			@return zQuery object
		**/
		init : function(selector,context) {
			this.elements = [];
			context = context ? context : document;

			if(!selector) {
				return this;
			}

			if(typeof selector === 'function') {
				this._addEvent(window,'load',selector);
				return this;
			}

			if(typeof selector === 'object' && selector.nodeType && (selector.nodeType == 1 || selector.nodeType == 9)) {
				this.elements[0] = selector;
				return this;
			}

			switch(selector.charAt(0)) {
				case '#':
					this.elements[0] = document.getElementById(selector.substring(1));
					break;
				case '.':
					this.elements = this._getElementByClassName(selector.substring(1),context);
					break;
				default:
					this.elements = this._toArray(context.getElementsByTagName(selector));
					break;
			}
		},


		/**
		*	covert to array-like list to real array
		*	@param : array-like list
		* 	@return : javascript array
		*/
		_toArray : function(arrayLikeList) {
			try {
				return slice.call(arrayLikeList,0);
			} catch(e) {

			   var arr = [];
               for(var i = 0,len = arrayLikeList.length; i < len; i++){
                    arr[i] = arrayLikeList[i];  
               }
               return arr;
			}

		},

		/**
		*	@param : element,array,i
		* 	@return : -1 or element position in array
		*/
		_inArray : function( elem, array, i ) {
			var len;
			if ( array ) {
				if ( indexOf ) {
					return indexOf.call( array, elem, i );
				}

				len = array.length;
				i = i ? i < 0 ? Math.max( 0, len + i ) : i : 0;

				for ( ; i < len; i++ ) {
					if ( i in array && array[ i ] === elem ) {
						return i;
					}
				}
			}
			return -1;
		},

		/**
		*	@param : classname,context
		* 	@return : elements in context
		*/
		_getElementByClassName : function(className,context) {

			if(context.getElementsByClassName) {
				return this._toArray(context.getElementsByClassName(className));
			} else if(document.querySelectorAll) {
				return this._toArray(context.querySelectorAll('.' + className));
			} else {
				var all = context.getElementsByTagName("*"),
				elements = [],
                i = 0;
	            for (; i < all.length; i++) {
	                if (all[i].className && (" " + all[i].className + " ").indexOf(" " + className + " ") > -1 && this._inArray(elements,all[i]) === -1) elements.push(all[i]);
	            }
           	 	return elements;
			}

		},

		/**
		*	@param : target element,eventType,callback function
		*/
		_addEvent : function(target,eventType,fn) {

			var newFn  = function(event) {
				var event = event || window.event,
					tagit = event.target || event.srcElement;
				fn.call(target,event,tagit);
			};

			if(target.addEventListener) {
				target.addEventListener(eventType,newFn,false);
			} else if(target.attachEvent) {
				target.attachEvent('on' + eventType, newFn);
			} else {
				throw new Error("cant't bind event on this element");
			}
		},

		/**
		*	@param : eventType,function
		* 	@return : current zQuery object
		*/
		bind : function(eventType,fn) {
			var eles = this.elements,
				i = eles.length;
				while(i--) {
					this._addEvent(eles[i],eventType,fn);
				}
			return this;
		},

		each : function(array,fn) {
			var result;
			if(!fn) {
				fn =  array;
				array = this.elements;
			}
			for(var i = 0; i < array.length; i++) {
				result = fn.call(array[i]);
				if(result !== undefined && !result) {
					break;
				}
			}
		},

		_trim : function(str) {
			trimLeft = /^\s+/,
			trimRight = /\s+$/;
			return trim ? trim.call(str) : str.replace( trimLeft, "" ).replace( trimRight, "" );
		},

		removeClass : function(className) {
			var eles = this.elements,
				that = this;

			this.each(eles,function(){
				var oldClassNames = that._trim(this.className).split(/\s+/),
					newClassNames = "";
				for(var i = 0; i < oldClassNames.length; i++) {
					if(oldClassNames[i] !== className) {
						newClassNames += i ? " " + oldClassNames[i] : oldClassNames[i];
					}
				}
				this.className = newClassNames;
			});
			return that;
		},
		/** 
		*	add class to html element
		*	@param : className
		* 	@return : current zQuery object
		*/
		addClass : function(className) {
			var eles = this.elements,
				that = this,
				className = that._trim(className);
				
			this.each(eles,function(){
				var oldClassNames = that._trim(this.className);

				if(oldClassNames.indexOf(className) < 0) {
					this.className = oldClassNames ?  oldClassNames + ' ' + className : className;
				}

			});
			return that;
		},

		/**
		* 	@return : first element in zQuery object
		*/
		firstEle : function() {
			return this.elements[0];
		},

		/**
		* 	get next sibling 
		*/
		next : function() {
			var ele = this.elements[0],
				next;
			if(ele.nextElementSibling) {
				this.elements[0] = ele.nextElementSibling;
			} else if(ele.nextSibling) {
				next = ele.nextSibling;
				while(next.nodeType != 1) {
					next = next.nextSibling;
				}
				this.elements[0] = next;
			}
			return this;
		},

		/**
		* 	get previous sibling 
		*/
		prev : function() {
			var ele = this.elements[0],
				prev;
			if(ele.previousElementSibling) {
				this.elements[0] = ele.previousElementSibling;
			} else if(ele.previousSibling) {
				prev = ele.previousSibling;
				while(prev.nodeType != 1) {
					prev = prev.previousSibling;
				}
				this.elements[0] = prev;
			}
			return this;
		},

		/**
		*	set or get css style
		* 	@param : ruleName,ruleValue
		*	@return : cuurent zQuery object
		*/
		css : function(ruleName,ruleValue) {
			var that = this,
				ele = that.elements[0],
				eles = that.elements;
			if(ruleValue !== undefined) {
				that.each(eles,function(){
					this.style[ruleName] = ruleValue;
				});
			} else {
				var style = ele.currentStyle? ele.currentStyle : window.getComputedStyle(ele, null);
				return style.getAttribute ? style.getAttribute(ruleName) : style.getPropertyValue(ruleName);
			}
			return that;
		},

		//get element attribute or set element attribute may not compatible across browsers
		attr : function(attrName,opt_value,opt_direct) {
			var that = this,
				ele = that.elements[0],
				eles = that.elements;

			if(opt_value !== undefined) {
				that.each(eles,function(){
					if(opt_direct) {
						this[attrName] = opt_value;
					} else {
						this.setAttribute(attrName,opt_value);
					}
				});
				return that;
			} else {
					return ele.getAttribute(attrName);
			}
		},

		delAttr : function(attrName) {
			var that = this,
				eles = that.elements;

			that.each(eles,function(){
				this.removeAttribute(attrName);
			});
			return that;
		},

		//get direct children of element
		getChildEles : function() {
			var eles = this.elements,
				childEles = [],
				that = this;

			that.each(eles, function(){
				childEles = childEles.concat(that._toArray(this.children));
			});
			that.elements = childEles;
			return that;
		},

		// get child elements 
		find : function(selector) {
			var that = this,
				eles = this.elements,
				newEles = [];

			that.each(eles,function(){
				newEles = newEles.concat($(selector,this).elements);
			});
			this.elements = newEles;
			return that;
		},

		hasClass : function(className) {
			var ele = this.elements[0],
				className = this._trim(className),
				oldClassNames = this._trim(ele.className);
			if(oldClassNames.indexOf(className) < 0) {
				return false;
			} else {
				return true;
			}
		},

		text : function(text) {
			var ele = this.elements[0];
			if(text) {
				if(ele.innerText) {
					ele.innerText = text;
				} else {
					ele.textContent = text;
				}
			} else {
				return ele.innerText || ele.textContent;
			}
			return this;
		},

		html : function(html) {
			var ele = this.elements[0];
			if(html) {
				ele.innerHTML = html;
			} else {
				return ele.innerHTML;
			}
		},
		//remove this html element
		remove : function() {
			this.each(function(){
				this.parentNode.removeChild(this);
			});
			return this;
		},
		empty : function() {
			var that = this,
				eles = that.elements;
			that.each(eles,function(){
				var childs =  that._toArray(this.children),
					len = childs.length,
					i;
				for(i = 0; i < len; i++) {
					this.removeChild(childs[i]);
				}
			});
			return that;
		},

		child : function(tag) {
			var that = this,
				eles = that.elements,
				newEles = [],
				childs;
			that.each(eles,function(){
				childs = that._toArray(this.children);
				for(var i = 0, len = childs.length; i < len; i++) {
					if(childs[i].tagName.toLowerCase() !== tag) {
						childs.splice(i,1);
						len = childs.length;
					}
				}
				newEles = newEles.concat(childs);
			});
			that.elements = newEles;
			return that;
		},

		parent : function(selector) {
			var that = this,
				eles = that.elements,
				newEles = [],
				parent;
			if(!selector) {
				that.each(eles,function(){
					parent = this.parentNode;
					newEles.push(parent)
				});
			} else {
				switch(selector.charAt(0)) {
					case '#':
						that.each(eles,function(){
							parent = this.parentNode;
							while(parent && $(parent).attr('id') !== selector.substring(1)) {
								parent = parent.parentNode;
							}
							newEles.push(parent)
						});
						break;
					case '.':
						that.each(eles,function(){
							parent = this.parentNode;
							while(parent && !$(parent).hasClass(selector.substring(1))) {
								parent = parent.parentNode;
							}
							newEles.push(parent)
						});
						break;
					default:
						that.each(eles,function(){
							parent = this.parentNode;
							while(parent && parent.tagName.toLowerCase() !== selector) {
								parent = parent.parentNode;
							}
							newEles.push(parent)
						});
						break;
				}
			}

			that.elements = newEles;
			return that;
		},


		val : function(opt_val) {
			if(opt_val !== undefined) {
				this.each(function(){
					this.value = opt_val;
				});
				return this;
			} else {
				return this._trim(this.elements[0].value);
			}
		},

		realVal : function() {
			var val = this._trim(this.elements[0].value);
			if(val == this.attr('data-placeholder')) {
				val = "";
			}
			return val;
		},

		before : function(ele,opt_ele) {
			this.each(function(){
				if(!opt_ele) {
					opt_ele = this.children[0];
				} 
				this.insertBefore(ele,opt_ele);
			});
			return this;
		},

		after : function(ele) {
			this.each(function(){
				this.appendChild(ele);
			});
			return this;
		},
		ease : function(time) {
			return Math.pow(time,1/2);
		},

		animate : function(attr,value,opt_stop,opt_fn) {
			var begin,_animate,
				that = this;

			_animate = function(ele,start,end,duration) {
				begin = (new Date()).getTime();
				duration = duration || 1000;


				var  _realAnimate = function() {
						var pos = (new Date().getTime() - begin ) / duration;

						if(pos >= 1.0) {
							if(opt_fn) {
								opt_fn.call(that);
							}
							return false;
						} 
						pos = that.ease(pos);
						var newValue  = (parseInt(start) + (end-start)*pos);
						if(newValue <= opt_stop) {
							newValue = 0;
						}
						return !!(ele.style[attr] = newValue + 'px');

				};

				var step = function() {
					if(_realAnimate()) {
						setTimeout(step,13);
					}
				};
				setTimeout(step,13);
			};

			this.each(function(){
				var oldValue = $(this).css(attr),
					newValue;
				if(oldValue.indexOf('px')) {
					oldValue = oldValue.substring(0,oldValue.length-2);
				}
				switch(value.charAt(0)) {
					case '-' :
						newValue = oldValue - value.substring(1);
						_animate(this,oldValue,newValue);
						break;
					case '+' :
						newValue = value.substring(1)-0 + parseInt(oldValue,10);
						_animate(this,oldValue,newValue);
						break;
				}
			});
		}
	
	};
	zQuery.isIE6_7 = function() {
		var uAgent = navigator.userAgent;
		return  uAgent.indexOf('MSIE 6.0') > 0 ||　uAgent.indexOf('MSIE 7.0') > 0;
	};

	zQuery.serialize = function(obj) {
		var data = [];
		for(prop in obj) {
			if(hasOwn.call(obj,prop)) {
				push.call(data,encodeURIComponent(prop) + '=' + encodeURIComponent(obj[prop]));
			}
		}
		return data.join('&');
	};

	zQuery.addZero = function(d) {
                return new String(d).length >= 2 ? d : '0' + d;
    };

    zQuery.getFormatDateStr = function(date) {
                var y = date.getFullYear(),
                    m = date.getMonth() + 1,
                    d = date.getDay() + 1,
                    h = date.getHours(),
                    mi = date.getMinutes();
                return y + '-' + $.addZero(m) + '-' + $.addZero(d) + ' ' + $.addZero(h) + ':' + $.addZero(mi);
     };

	zQuery.createEle = function(tag) {
			return document.createElement(tag);
	};


	zQuery.ajax = function(props) {
		props.async = props.async === undefined ? true : props.async;
		var createXHR = function() {
			if(!window.XMLHttpRequest) {
				try {
					return new ActiveXObject('Msxml2.XMLHTTP.6.0');
				} catch (e1) {
					try {
						return new ActiveXObject('Msxml2.XMLHTTP.3.0')
					} catch (e2) {
						throw new Error('XMLHttpRequest is not supported');
					}
				}
			} else {
				return new XMLHttpRequest();
			}
		};

		var xhr = createXHR();
		xhr.open(props.method,props.url,props.async);
		if(props.method == "GET") {
			xhr.send(null);
		} else if (props.method == "POST") {
			xhr.send($.serialize(props.data));
		}
		

		xhr.onreadystatechange = function() {
			if(xhr.readyState == 4) {
				if((xhr.status >= 200 && xhr.status < 300 )|| xhr.status == 304) {
					if(window.JSON && JSON.parse) {
						props.callback.call(null,JSON.parse(xhr.responseText));
					} else {
						props.callback.call(null,eval('(' + xhr.responseText +')')); 
					}
				} else {
					alert('failed');
				}
			}
		};

		

	};


	zQuery.fn.init.prototype = zQuery.fn;
	window.$ = window.zQuery = zQuery;

}(window,undefined);