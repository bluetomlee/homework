(function(){

	var _tabNav = document.getElementById("tab-nav");
	var _mainctWrap = getByClass(document,"main-ct-wrap");
	var _tabLists = _tabNav.getElementsByTagName("li");
	var _moreCt = getByClass(document,"more-ct");
	var _hidden = getByClass(document,"more-hidden");
	var _all = document.getElementById("all");
	var _allOptions = getByClass(document,"log-check");
	var _logTt = getByClass(document,"log-title-detail")
	var _logDate = getByClass(document,"log-date-detail");
	var _logRead = getByClass(document,"log-read");
	var _logComment = getByClass(document,"log-comment");
	var _logList = getByClass(document,"log-list");
	var _tabText = document.getElementById("tab-text");
	var _tabTarea = document.getElementById("tab-tarea");
	var _allBtn = document.getElementById("all-btn");
	var _logListParent = document.getElementById("log-list");
	var _logCheck = getByClass(document,"log-check");
	var _logEdit = getByClass(document,"log-edit");
	var _delete = getByClass(document,"delete");
	var _setTop = getByClass(document,"settop");
	var _friendName = getByClass(document,"friend-name");
	var _friendLog = getByClass(document,"friend-logt");
	var _elemScroll = document.getElementById("friend-log");
	var _logSubmit = document.getElementById("log-submit");

	/*
	 * tab切换
	*/
	
	addEvent(_tabNav,"click",function(e){
		tab(e,_tabLists,_mainctWrap,"tab-default");
	})


	/*
	 * tab中“更多”部分的显示隐藏
	*/
	

	addEvent(document,"click",function(e){
		var _target = target(e);

		for(var i=0,l=_moreCt.length; i<l; i++){
			if(_target == _moreCt[i]){
				show(_hidden[i]);
			} else if(_target !== _moreCt[i]){
				hide(_hidden[i]);
			}
		}
		
	})

	/*
	 * 全选功能的实现
	*/

	

	addEvent(_all,"click",function(){
		for(var i=0,l=_allOptions.length; i<l; i++){
			if(_all.checked){
				_allOptions[i].checked = true;
			} else {
				_allOptions[i].checked = false;
			}
			
		}
	})

	/*
	 * 获取日志列表功能的实现
	*/
	

	var _cbXHRHandle = function(_obj){

		_obj.sort(sortBy);//日志排序
		
		for(var i=0,l=_obj.length; i<l; i++){	

			_logTt[i].innerHTML = _obj[i].title;
			_logTt[i].setAttribute("data-content",_obj[i].blogContent);
			_logDate[i].innerHTML =_obj[i].shortPublishDateStr+" "+_obj[i].publishTimeStr;
			_logRead[i].innerHTML = "阅读"+ _obj[i].accessCount;
			_logComment[i].innerHTML = "评论"+ _obj[i].commentCount;

			if(_obj[i].allowView == 10000){
				_logTt[i].className = "log-title-detail"+" "+"log-personal";
			}

			_logList[i].id = _obj[i].id;
			_logList[i].setAttribute("date",_obj[i].publishTime);
			_logList[i].setAttribute("rank",0);

		}
	}

	logGet("http://fed.hz.netease.com/api/getblogs",_cbXHRHandle)


	/*
	 * 日志编辑框默认文字切换
	*/

	

	addEvent(_tabText,"focus",function(){
		if(_tabText.value == "日志标题"){
			_tabText.value = "";
		}
	})

	addEvent(_tabText,"blur",function(){
		if(_tabText.value == ""){
			_tabText.value = "日志标题";
		}
	})

	addEvent(_tabTarea,"focus",function(){
		if(_tabTarea.value == "这里可以写日志哦~"){
				_tabTarea.value = "";
		}
	})

	addEvent(_tabTarea,"blur",function(){
		if(_tabTarea.value == ""){
			_tabTarea.value = "这里可以写日志哦~";
		}
	})



	/*
	 * 删除日志功能实现
	*/
	
	//通过删除按钮删除日志
	addEvent(_allBtn,"click",function(){
		var _idArr = [];
		for(var i=0,l=_logList.length; i<l; i++){
			
			if(_logCheck[i].checked == true){
				_idArr.push(_logList[i].id);
			}
		}

		ajax("http://fed.hz.netease.com/api/deleteBlogs?id="+_idArr.join("&"),function(data){
			if(data == 1){
				for(var i=0,l=_idArr.length; i<l; i++){
					var _child = document.getElementById(_idArr[i])
					_child.parentNode.removeChild(_child);
				}
			}
		})
	})

	var logsDelete = function(){

		for(var j=0,n=_logEdit.length; j<n; j++){
			
			_logEdit[j].onclick = function(e){
				var _e = e || window.event;
				var _target = target(e);
				var id = this.parentNode.parentNode.id;
				preventDafult(_e);

				if(/delete/.test(_target.className)){
					
					ajax("http://fed.hz.netease.com/api/deleteBlogs?id="+id,
						function(data){
							if(data == 1){
									var _child = document.getElementById(id)
									_child.parentNode.removeChild(_child);
								
							}
					})
				}

				//置顶
				if(/settop/.test(_target.className)){
					topSet(id);
				}

				//取消置顶
				if(/settop/.test(_target.className) && _target.innerHTML == "取消置顶"){
					topCancel(id);
				}

				//编辑
				if(/edit/.test(_target.className)){
					logEdit(id);
				}
			}
			
		}

		
		
	}

	logsDelete()

	/*
	 * 置顶和取消置顶日志功能实现
	*/

	var topSet = function(id){
		var _logListParent = document.getElementById("log-list");
		var _exitChild = getByClass(document,"log-list")[0];
		var _newChild = document.getElementById(id);
		var _setTop = getByClass(_newChild,"settop")[0];

		ajax("http://fed.hz.netease.com/api/topBlog?id="+id,function(data){
			if(data == 1){
				_logListParent.insertBefore(_newChild,_exitChild);
				_newChild.setAttribute("rank",5);
				_setTop.innerHTML = "取消置顶";
			}
		});
	}

	

	var topCancel = function(id){
		var _exitChild = null;
		var _newChild = document.getElementById(id);
		var _setTop = getByClass(_newChild,"settop")[0];
		var _date = _newChild.getAttribute("date");
		var _logList = getByClass(document,"log-list");
		

		ajax("http://fed.hz.netease.com/api/untopBlog?id="+id,function(data){
			if(data == 1){

				_newChild.setAttribute("rank",0);
				_setTop.innerHTML = "置顶";
				_exitChild = targetChild(_logList,_newChild);				
				_logListParent.insertBefore(_newChild,_exitChild);
			}
		});
	}



	/*
	 * 添加日志功能实现
	*/

	_logSubmit.onclick = function(){
		var _logList = getByClass(document,"log-list");
		var _exitChild = getByClass(document,"log-list")[0];
		var _logEdit = getByClass(document,"log-edit");
	
		ajax("http://fed.hz.netease.com/api/addBlog?blog={}",function(data){
			if(data == 1){
				var _newChild = document.createElement("div");
				_newChild.className = "log-list";
				_logListParent.insertBefore(_newChild,_exitChild);
				var _logString = '<div class="log">'
						+'<div class="log-title">'
							+'<input type="checkbox" id="checkbox1" class="log-check"><label for="checkbox1" class="log-title-detail">js高性能原则（转载）</label>'
						+'</div>'
						+'<div class="log-edit">'
							+'<a href="#" class="edit">编辑</a><div class="more">'
								+'<span class="more-ct">更多</span><div class="more-hidden">'
									+'<span class="hidden">更多</span><a href="#" class="delete">删除</a><a href="#" class="settop">置顶</a>'
								+'</div>'
							+'</div>'
						+'</div>'
					+'</div>'
					+'<div class="log-date">'
						+'<span class="log-date-detail">2010-06-23 11:36</span>'
						+'<span class="log-read">阅读0</span>'
						+'<span class="log-comment">评论0</span>'
					+'</div>';


				_newChild.innerHTML = _logString;
				_newChild.id = Math.floor(Math.random()*1000000+1);
				logsDelete()
				var _title = document.getElementById("tab-text").value;
				var _date = new Date();
				var _id = "checkbox"+_logList.length;
				var _logTd = getByClass(_newChild,"log-title-detail")[0];

				_logTd.innerHTML = _title;
				getByClass(_newChild,"log-date-detail")[0].innerHTML = _date.Format("yyyy-MM-dd hh:mm:ss"); 
				getByClass(_newChild,"log-check")[0].setAttribute("id",_id);
				_logTd.setAttribute("for",_id);
				_newChild.setAttribute("date",_date.getTime());
				_newChild.setAttribute("rank",0);
				
			}
		})
		_logEdit = getByClass(document,"log-edit");
		
		
	}
		

	/*
	 * 编辑日志功能实现
	*/

	var logEdit = function(id){
		
		var _elem = document.getElementById(id);
		var _logTd = getByClass(_elem,"log-title-detail")[0];

		ajax("http://fed.hz.netease.com/api/editBlog?blog={}",function(data){
			if(data == 1){
				_tabText.value = _logTd.innerHTML;
				_tabTarea.value = _logTd.getAttribute("data-content");
			}
		});
	}

	/*
	 * 滚动好友日志功能实现
	*/

	

	var friendLogScroll = function(elem,lh,speed,delay){	

		ajax("http://fed.hz.netease.com/api/getFriendsLatestBlogs?userid=126770605",function(_data){

			for(var i=0,l=_friendName.length; i<l; i++){
			
				_friendName[i].innerHTML = _data[i].userNickname;
				_friendLog[i].innerHTML = _data[i].title;
			}
		});

		var p=false;
		var t = null;
		elem.innerHTML+=elem.innerHTML;
		elem.style.marginTop=0;

		addEvent(elem,"mouseover",function(){
			p = true;
		})

		addEvent(elem,"mouseout",function(){
			p = false;
		})
		
		function start(){
			setTimeout(scrolling,speed);
			if(!p) {
				elem.style.marginTop=parseInt(elem.style.marginTop)-1+"px";
			}
		}
	
		function scrolling(){
			if(parseInt(elem.style.marginTop)%lh!=0){
				elem.style.marginTop=parseInt(elem.style.marginTop)-1+"px";
				if(Math.abs(parseInt(elem.style.marginTop))>=elem.scrollHeight/2) {
					elem.style.marginTop=0;
				}
				t=setTimeout(scrolling,speed)
			} else {
				clearInterval(t);
				setTimeout(start,delay);
				
			}
			
		}
		setTimeout(start,delay);
			
	}
friendLogScroll(_elemScroll,60,20,2000);

//IE6/7下 z-index 失效的修正
var indexC = function(){
	var zindex = 100;
	for(var i=0,l=_logList.length; i<l; i++){
		_logList[i].style.zIndex = zindex--;
	}
}
indexC();


})()



