/*
 *通过类名获取元素
*/

function getByClass(elem,classname){
	if(document.getElementsByClassName){
		return elem.getElementsByClassName(classname);
	} else {
		var elems = elem.getElementsByTagName("*");
		var results = [];

		for(var i=0,l=elems.length; i<l; i++){
			if(elems[i].className == classname){
				results.push(elems[i]);
			}
		}

		return results;
	}
}

/*
 *兼容浏览器添加事件
*/
function addEvent(elem,type,handler){
	if(document.addEventListener){
		elem.addEventListener(type,handler,false);
	} else if(document.attachEvent){
		elem.attachEvent("on"+type,handler);
	} else {
		elem["on"+type] = handler;
	}
}

/*
 * 显示元素
*/

function show(elem){
	elem.style.display = "block";
}

/*
 * 隐藏元素
*/

function hide(elem){
	elem.style.display = "none";
}



/*
 * 兼容浏览器创建xhr对象
*/
function ajax(url,callback){
	var createXHR = function(){
		if(window.XMLHttpRequest){
			return new XMLHttpRequest();
		} else {
			return new ActiveXObject("Microsoft.XMLHTTP")
		}
	}

	var xhr = createXHR();
	xhr.open('GET',url,true);
	xhr.send(null);

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
}



/*
 * 排序函数
*/


function sortBy(a,b){
	if(a.rank != b.rank){
		if(a.rank == 5){
			return -1;
		} else {
			return 1;
		}
	} else {
		if(a.publishTime < b.publishTime){
			return 1;
		} else {
			return -1;
		}
	}
}
/*
 * tab切换效果
*/
function tab(e,tablist,tabdisplay,classname){
	var _target = target(e);
	for( var i=0,l=tablist.length; i<l; i++){
		if(tablist[i] == _target) {
			tablist[i].className = classname;
			tabdisplay[i].style.display = "block";
		} else {
			tablist[i].className = "";
			tabdisplay[i].style.display = "none";
		}
	}
}

/*
 * 取消默认行为
*/

function preventDafult(e){
	if(e && e.preventDefault) {
　　     e.preventDefault();
	} else {
　　	window.event.returnValue = false;
	}
	return false;
}

/*
 * 定制时间格式
*/


Date.prototype.Format = function (fmt) { //author: meizz 
    var o = {
        "M+": this.getMonth() + 1, //月份 
        "d+": this.getDate(), //日 
        "h+": this.getHours(), //小时 
        "m+": this.getMinutes(), //分 
        "s+": this.getSeconds(), //秒 
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
        "S": this.getMilliseconds() //毫秒 
    };
    if (/(y+)/.test(fmt)) {
    	fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    }

    for (var k in o){
    	if (new RegExp("(" + k + ")").test(fmt)){
    		fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    	}
    }
     
    return fmt;
}

/*
 * 获取事件目标
*/

function target(e){
	var _e = e || window.event;
	return _e.target || _e.srcElement;
}

/*
 * 获取日志
*/

function logGet(url,callback){
	ajax(url,callback);
}


/*
 * 获取取消置顶参考元素
*/


function targetChild(elems,newchild){
		for(var i=0,l=elems.length; i<l; i++){
					
					if(elems[i].getAttribute("rank") == newchild.getAttribute("rank") && 
						parseInt(elems[i].getAttribute("date")) < parseInt(newchild.getAttribute("date"))){
							return elems[i];
					
					}
		}
	}