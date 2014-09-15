/**
 * Created by hzfengshikun on 2014/9/1.
 */
var EventUtil = {

    addHandler: function (element, type, handler) {
        if (element.addEventListener) {
            element.addEventListener(type, handler, false);
        } else if (element.attachEvent) {
            element.attachEvent("on" + type, handler);
        } else {
            element["on" + type] = handler;
        }
    },

    getButton: function (event) {
        if (document.implementation.hasFeature("MouseEvents", "2.0")) {
            return event.button;
        } else {
            switch (event.button) {
                case 0:
                case 1:
                case 3:
                case 5:
                case 7:
                    return 0;
                case 2:
                case 6:
                    return 2;
                case 4:
                    return 1;
            }
        }
    },

    getCharCode: function (event) {
        if (typeof event.charCode == "number") {
            return event.charCode;
        } else {
            return event.keyCode;
        }
    },

    getClipboardText: function (event) {
        var clipboardData = (event.clipboardData || window.clipboardData);
        return clipboardData.getData("text");
    },

    getEvent: function (event) {
        return event ? event : window.event;
    },

    getRelatedTarget: function (event) {
        if (event.relatedTarget) {
            return event.relatedTarget;
        } else if (event.toElement) {
            return event.toElement;
        } else if (event.fromElement) {
            return event.fromElement;
        } else {
            return null;
        }

    },

    getTarget: function (event) {
        return event.target || event.srcElement;
    },

    getWheelDelta: function (event) {
        if (event.wheelDelta) {
            return (client.engine.opera && client.engine.opera < 9.5 ? -event.wheelDelta : event.wheelDelta);
        } else {
            return -event.detail * 40;
        }
    },

    preventDefault: function (event) {
        if (event.preventDefault) {
            event.preventDefault();
        } else {
            event.returnValue = false;
        }
    },

    removeHandler: function (element, type, handler) {
        if (element.removeEventListener) {
            element.removeEventListener(type, handler, false);
        } else if (element.detachEvent) {
            element.detachEvent("on" + type, handler);
        } else {
            element["on" + type] = null;
        }
    },

    setClipboardText: function (event, value) {
        if (event.clipboardData) {
            event.clipboardData.setData("text/plain", value);
        } else if (window.clipboardData) {
            window.clipboardData.setData("text", value);
        }
    },

    stopPropagation: function (event) {
        if (event.stopPropagation) {
            event.stopPropagation();
        } else {
            event.cancelBubble = true;
        }
    }
};
/*
 *AjaxHttp
 * @intro:set post or get httprequest and return data
 * @args:
 * handler:function that handle the returned data
 * type:get or post
 * url:the url that request
 * sendContent:args in the send method
 * args:arguments send to handler by caller function
 * @return {void}
 */
function AjaxHttp(handler,type,url,sendContent,args)
{
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304) {
                var someObj = JSON.parse(xhr.responseText);
                handler(someObj,args);
            }
            else {
                window.alert("Request was unsuccessful: " + xhr.status)
            }
        }
    };
    xhr.open(type,url,false);//do not use asynchronous request

    if(sendContent!=null)
    {
        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhr.send(sendContent);//Chinese character need to call encodeURIComponent()
    }
    else
    {
        xhr.send(null);
    }
}

function $findChilds(parentNode, text)
{
    if(parentNode == undefined)
        parentNode = document.body;
    var childNodes = parentNode.childNodes;
    var results = [];
    if(childNodes.length > 0)
    {
        var length = childNodes.length;
        for(var i=0;i<length;++i)
        {
            switch(text.substr(0, 1))
            {
                case '.':
                    if(parentNode.getElementsByClassName)
                        return parentNode.getElementsByClassName(text.substr(1));
                    else if(parentNode.all)
                    {
                        var finded = [];
                        var jlength = parentNode.all.length;
                        for(var j=0;j<jlength;++j)
                            if(parentNode.all[j].className == text.substr(1))
                                finded.push(parentNode.all[j]);
                        return finded;
                    }
                    if(childNodes[i].className == text.substr(1))
                        results.push(childNodes[i]);
                    break;
                case '#':
                    return [document.getElementById(text.substr(1))];
                default:
                    return parentNode.getElementsByTagName(text);
            }
            results = results.concat($findChilds(childNodes[i], text));
        }
    }
    return results;
}

String.prototype.vtrim = function() {
    return this.replace(/^\s+|\s+$/g, '');
}

function $g(text)
{
    //按照空格分割参数
    var values = text.vtrim().split(" ");
    var length = values.length;
    //如果只有一个选择参数的话，就直接调用dom方法返回结果。
    if(length == 1)
        switch(values[0].substr(0, 1))
        {
            case "#":
                return document.getElementById(values[0].substr(1));
            case ".":
                if(document.getElementsByClassName)
                    return document.getElementsByClassName(values[0].substr(1));
            default:
                return document.getElementsByTagName(values[0]);
        }
    var parentNodes = [document.body];
    for(var i = 0; i < length; ++i)
    {
        var jlength = parentNodes.length;
        var results = [];
        var tmpValue = values[i].vtrim();
        if(tmpValue.length <= 0)
            continue;
        for(var j=0;j<jlength;++j)
        {
            var result = $findChilds(parentNodes[j], values[i].vtrim());
            var rlength = result.length;
            for (var k = 0; k < rlength; ++k)
                results.push(result[k]);
        }
        if(results == undefined || results.length <= 0)
            return undefined;
        if (i == length - 1)
        {
            if (values[i].substr(0, 1) == "#")
                return results[0];
            return results;
        }
        parentNodes = results;
    }
}

