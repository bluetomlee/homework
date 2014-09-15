/**
 * -----------------------
 * Provide Basic Tool
 * @author hzliyi
 * ----------------------
 */

			/**
			 * [命名空间]
			 */
			window.EZ = window.$ = {};

			/**
			 * [选择器]
			 */
			EZ.elem = function(selector){
				var element=[];
				switch(selector.charAt(0)){
					case '#':
						element[0] = document.getElementById(selector.substring(1));
						return element[0];
					break;
					case '.':
						var classElem = selector.substring(1);
						if(document.getElementsByClassName){
							return document.getElementsByClassName(classElem);
						} else{
							var allClass = document.getElementsByTagName("*");
							for (var i = 0; i < allClass.length; i++) {
								if(allClass[i].nodeType == 1 && allClass[i].getAttribute('class') == classElem){
									element.push(allClass[i]);
									}
								};
						}
					break;
					default:
						var elements = document.getElementsByTagName(selector);
						for (var i = 0; i < elements.length; i++) {
							element[i] = elements[i];
						};
					break;
				}
				return element;
				
			}
			/**
			 * [html方法]
			 * @param  {[type]} obj
			 * @param  {[type]} v
			 * @return {[type]}
			 */
			EZ.html = function(obj,v){
				if(!v){
					return obj.innerHTML;
				}else{
					obj.innerHTML = v;
					return obj;
				}
			}
			/**
			 * [text方法]
			 * @param  {[type]} obj 
			 * @param  {[type]} v   
			 * @return {[type]}     
			 */
			EZ.text = function(obj,v){
				if(!v){
					return obj.innerText;
				}
				else{
					for (var i = 0; i < obj.length; i++) {
						return obj[i].innerText = v;
					}
				}
				return obj;
			}
			/**
			 * [createHtml]
			 * @param  {[type]} obj
			 * @param  {[type]} content
			 * @param  {[type]} style
			 * @return {[type]}
			 */
			EZ.createHtml = function(ele,classname){
				var elm = document.createElement(ele);
					elm.className = classname;
				return elm;
			}
			EZ.timeformat = function(date){
		        var year = date.getFullYear();       //年
		        var month = date.getMonth() + 1;     //月
		        var day = date.getDate() + 1;            //日
		        var hh = date.getHours();            //时
		        var mm = date.getMinutes();          //分
		        var clock = year + "-";
		        if(month < 10)
		            clock += "0";
		        clock += month + "-";
		        if(day < 10)
		            clock += "0";
		        clock += day + " ";
		        if(hh < 10)
		            clock += "0";
		        clock += hh + ":";
		        if (mm < 10) clock += '0'; 
		        clock += mm; 
		        return(clock); 
			}
			EZ.timezero = function(date){
				return new Date(parseInt(date) * 1000).toLocaleString().replace(/年|月/g, "-").replace(/日/g, " ");
			}
			/**
			 * [隐藏元素]
			 * @param  {[type]} obj
			 * @return {[type]}
			 */
			EZ.hide = function(obj){
				obj.style.display = "none";
			}
			/**
			 * [展示元素]
			 * @param  {[type]} obj
			 * @return {[type]}
			 */
			EZ.show = function(obj){
				obj.style.display = "block";
			}
			/**
			 * [获取事件]
			 * @param  {[type]} e
			 * @return {[type]}
			 */
			EZ.target = function(e){
				var _e = e || window.event;
				return _e.target || _e.srcElement;
			}
			/**
			 * [addEvent 事件处理]
			 */
			EZ.bind = function(elemment,type,fn){
				if(elemment.addEventListener)
					elemment.addEventListener(type,fn,false);
				else
					elemment.attachEvent('on'+type,fn);
			}
			/**
			 * [Ajax]
			 * @param {[string]}   url
			 * @param {Function} callback
			 */
			EZ.Ajax = function(url,callback){
				var createXHR = function(){
					if(window.XMLHttpRequest){
						return new XMLHttpRequest();
					} else {
						return new ActiveXObject("Microsoft.XMLHTTP")
					}
				}

				var xhr = createXHR();
				xhr.onreadystatechange = function(){
					if(xhr.readyState == 4){
						if((xhr.status >= 200 && xhr.status < 300 )|| xhr.status == 304) {
								if(window.JSON && JSON.parse) {
									callback.call(null,JSON.parse(xhr.responseText));
								} else {
									callback.call(null,eval('(' + xhr.responseText +')')); 
								}
						}
					}
				}
				xhr.open('GET',url,true);
				xhr.send(null);
			}

