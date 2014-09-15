/*
 * ------------------------------------------
 * 提供作业用到的基础功能
 * @version  1.0
 * @author  libin
 * ------------------------------------------
 */

/**
 * 基本命名空间
 */
window.NS = {};


/**
 * 发送Ajax请求
 * @param {String} url 请求地址
 * @param {Object} option 请求选项
 */
NS.request = function (url, option) {
	function empty(){}
	var xhr,
		method = option.method || 'GET',
		async = option.async !== false,
		data = option.data || null,
		success = option.success || empty,
		failure = option.failure || empty;
	if(window.XMLHttpRequest) {
		xhr = new XMLHttpRequest();
		if(xhr.overrideMimeType) {
			xhr.overrideMimeType("text/xml");
		}
	}else if(window.ActiveXObject){
		try{
			xhr = new ActiveXObject("Msxml2.XMLHTTP");   
		}catch(e) {
			xhr = new ActiveXObject("Microsoft.XMLHTTP");   
		}
	}
	xhr.onreadystatechange = function () {
		if(xhr.readyState == 4) {
			if(xhr.status >= 200 && xhr.status < 300) {
				success(xhr);
			}else{
				failure(xhr);
			}
		}
	};
	xhr.open(method,url,async);
	xhr.send(data);
}

/**
  * 模板解析
  * @method parseTpl
  * @param {String} id 模板所在script标签的id
  * @param {Object} data 要绑定的数据
  */
NS.parseTpl = function(id,data) {
	var html = document.getElementById(id).innerHTML, //获取模板原始字符串
	funcStr = 'var str="",echo=function(result){str+=result;};with(scope){', //传递给Function构造器的字符串
	begin = '<%', //开始标签
	end = '%>', //结束标签
	indexStart = html.indexOf(begin), //开始标签的位置
	format = function(str) { //去除首尾空格以及换行符
		return str.replace(/^\s+|\s+$|(\r?\n)/g,'');
	},
	indexEnd,
	tmp;
	while(indexStart != -1) {
		funcStr += "str+='"+format(html.substring(0,indexStart))+"';"; //原封不动进行输出
		indexEnd = html.indexOf(end);
		tmp = html.substring(indexStart+begin.length,indexEnd);
		if(tmp.charAt(0) === '=') { //变量赋值
			funcStr += "str+="+tmp.substring(1)+";";
		}else{ //直接执行Javascript代码
			funcStr += format(tmp)+';';
		}
		//跳转到下一个位置
		html = html.substring(indexEnd+end.length); 
		indexStart = html.indexOf(begin);
	}
	//加上最后剩余的字符串
	funcStr += "str+='"+format(html)+"';return str;}";
	return new Function('scope',funcStr)(data);
}

/**
 * 扩展Date类型，增加格式化方法
 * @public
 * @example 
 * (new Date()).Format("yyyy-MM-dd hh:mm:ss.S") --> 2014-07-14 16:44:33.341
 * @param {String} fmt 需要的格式
 * @extends {Date}
 */
Date.prototype.Format = function(fmt){
  var o = {   
    "M+" : this.getMonth()+1,                 //月份   
    "d+" : this.getDate(),                    //日   
    "h+" : this.getHours(),                   //小时   
    "m+" : this.getMinutes(),                 //分   
    "s+" : this.getSeconds(),                 //秒   
    "q+" : Math.floor((this.getMonth()+3)/3), //季度   
    "S"  : this.getMilliseconds()             //毫秒   
  };   
  if(/(y+)/.test(fmt))   
    fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));   
  for(var k in o)   
    if(new RegExp("("+ k +")").test(fmt))   
  fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));   
  return fmt;
};

/* JSON in IE */
if (typeof JSON !== 'object') {
    JSON = {};
}
(function () {
    'use strict';
    var cx,escapable,gap,indent,meta;
    // 将字符串中可转义的部分进行转义
    function quote(string) {
        escapable.lastIndex = 0;
        return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
            var c = meta[a];
            return typeof c === 'string'
                ? c
                : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
        }) + '"' : '"' + string + '"';
    }
    function str(key, holder) {
        var i,          // The loop counter.
            k,          // The member key.
            v,          // The member value.
            length,
            mind = gap,
            partial,
            value = holder[key];
        if (value && typeof value === 'object' &&
                typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }
        switch (typeof value) {
        case 'string':
            return quote(value);
        case 'number':
            return isFinite(value) ? String(value) : 'null';
        case 'boolean':
        case 'null':
            return String(value);
        case 'object':
            if (!value) {
                return 'null';
            }
            gap += indent;
            partial = [];
            if (Object.prototype.toString.apply(value) === '[object Array]') {
                length = value.length;
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || 'null';
                }
                v = partial.length === 0
                    ? '[]'
                    : gap
                    ? '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']'
                    : '[' + partial.join(',') + ']';
                gap = mind;
                return v;
            }
            for (k in value) {
                if (Object.prototype.hasOwnProperty.call(value, k)) {
                    v = str(k, value);
                    if (v) {
                        partial.push(quote(k) + (gap ? ': ' : ':') + v);
                    }
                }
            }
            v = partial.length === 0
                ? '{}'
                : gap
                ? '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}'
                : '{' + partial.join(',') + '}';
            gap = mind;
            return v;
        }
    }
    if (typeof JSON.stringify !== 'function') {
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
        meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        };
        JSON.stringify = function (value) {
            return str('', {'': value});
        };
    }
    if (typeof JSON.parse !== 'function') {
        cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
        JSON.parse = function (text) {
            var j;
            text = String(text);
            cx.lastIndex = 0;
            // 特殊字符进行转义
            if (cx.test(text)) {
                text = text.replace(cx, function (a) {
                    return '\\u' +
                        ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }
            // 看JSON字符是否合法，若合法，则调用eval方法返回JSON值
			// 先将包含转义的替换为@，然后将普通字符替换为],然后将]:]删去.最后进行正则判断
            if (/^[\],:{}\s]*$/
                    .test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
                        .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
                        .replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {
                j = eval('(' + text + ')');
                return j;
            }
            throw new SyntaxError('JSON.parse');
        };
    }
}());