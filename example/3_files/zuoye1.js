/*
 * ------------------------------------------
 * 主脚本文件
 * @version  1.0
 * @author  libin
 * ------------------------------------------
 */

(function(){
	// 变量定义
	var baseURL = 'http://fed.hz.netease.com/api/',
		$ = function(id){return document.getElementById(id);},
		container = $('blogContainer'),
		currentId = $('blogId'),
		title = $('blogTitle'),
		content = $('blogContent'),
		menuSide = $('menuSide'),
		contentHint = '这里可以写日志哦~',
		titleHint = '日志标题',
		checkList = [],
		blogArr = [];

	// 请求我的日志列表
	NS.request(baseURL+'getblogs',{
		success: function(xhr) {
			var ret = xhr.responseText;
			blogArr = JSON.parse(ret) || blogArr;
			checkList = container.getElementsByTagName("input");
			refreshBlog();
		}
	});

	// 请求好友日志列表
	NS.request(baseURL+'getFriendsLatestBlogs?userid=XXXXX',{
		success: function(xhr) {
			var ret = xhr.responseText,
				friendBlogList = JSON.parse(ret) || [],
				friendCotainer = $('friendBlogs');
			for(var i=0; i<5 && i<friendBlogList.length; i++) {
				var parsed = NS.parseTpl("friendTpl",friendBlogList[i]);
			    friendCotainer.innerHTML += parsed;
			}
			marquee(friendCotainer,52);
		}
	});

	/**
	 * 滚动显示列表
	 * @param {Object} container 显示内容所在的容器
	 * @param {Number} itemHeight 每个条目的高度
	 * @param {Number} speed 滚动的速度
	 */
	function marquee(container,itemHeight,speed) {
		var number = 5,
			speed = speed || 20,
			current = 0,
			// 需要定时执行的滚动方法
			rolling = function() {
				var top = Math.abs(container.style.top.match(/(\d+)px/)[1]);
				// 一个条目滚动完
				if(top % itemHeight == 0 && top != current * itemHeight) {
					// 滚到顶时从头进行滚动
					if(top == itemHeight * number) {
						current = -1;
						container.style.top = '0px';
					}
					// 停留2s再继续滚动
					clearInterval(timer);
					setTimeout(function() {
						// 避免在2s内由于鼠标移动而增加新的定时器
						clearInterval(timer);
						timer = setInterval(rolling,speed);
					}, 2000);
					current++;
				}else {
					top++;
					container.style.top = '-' + top + 'px';
				}
			},
			timer = setInterval(rolling,speed);
		container.style.top = '0px';
		//移上去停止滚动，移走继续滚动
		container.onmouseover = function() {clearInterval(timer);};
		container.onmouseout = function() {clearInterval(timer);timer = setInterval(rolling,speed);};
	}

	/**
	 * 刷新日志列表
	 */
	function refreshBlog() {
		// 清除container中的内容
		while(container.hasChildNodes()) {
			container.removeChild(container.lastChild);
		}
		// 按照时间进行排序,并将置顶的放到前面
		blogArr.sort(function(blog1, blog2) {
			var firstTop = (blog1.rank=='5'),
				secondTop = (blog2.rank=='5');
			if((firstTop&&secondTop) || (!firstTop&&!secondTop)) { //都置顶或都不置顶
				return blog2.publishTime - blog1.publishTime;
			}else if(firstTop) {
				return -1;
			}else if(secondTop) {
				return 1;
			}
		});
		// 插入container
		for(var i=0; i<blogArr.length; i++) {
		  var parsed = NS.parseTpl("blogTpl",blogArr[i]),
		      li = document.createElement("li"),
		      version = navigator.appVersion;
		  if(version.indexOf('MSIE 7.0') != -1 || version.indexOf('MSIE 6.0') != -1) {
		  	li.setAttribute('className','item'); // for IE
		  }else {
		  	li.setAttribute('class','item');
		  }
		  li.innerHTML = parsed.replace(/\$\$/,100-i);
		  container.appendChild(li);
		}
	}

	/**
	 * 根据id选择blog条目
	 * @param id {String} 日志的id
	 * @return {Object} 所在的位置和blog条目的内容
	 */
	function blogSelector(id) {
		for(var i=0, len=blogArr.length; i<len; i++) {
			var item = blogArr[i];
			if(item.id == id) {
				return {
					index: i,
					content: item
				};
			}
		}
	}

	// 事件处理函数
	NS.handler = {
		// 保存输入框中输入的日志内容
		save: function() {
			var now = new Date(),
				blog = {
				 title: title.value,//日志标题
				 blogContent: content.value,//日志内容
				 modifyTime: now.getTime().toString(),//日志修改时间
				 publishTime: now.getTime().toString(),//日志发布时间
				 accessCount:0,//阅读数
				 allowView:-100,//阅读权限
				 classId:'xxxxxxxxx',//日志分类
				 "rank":"0", //日志排名，5代表置顶日志
				 commentCount:0,//日志评论数
				 id: (currentId.value!="")?currentId.value:'xxxxxxxxxxx',//日志ID,客户端随机生成
				 userId:126770605,//用户ID
				 userName:'testblog1',//用户名
				 userNickname:'testblog'
			};
			if(currentId.value != "") { //编辑
				NS.request(baseURL+'addBlog?editBlog='+JSON.stringify(blog),{
					success: function(xhr) {
						var ret = xhr.responseText;
						if(ret == 1) {
							blogArr[blogSelector(blog.id).index] = blog; //修改现有日志
							refreshBlog();
							NS.handler.clear();
						}
					}
				});
			}else { // 添加
				NS.request(baseURL+'addBlog?blog='+JSON.stringify(blog),{
					success: function(xhr) {
						var ret = xhr.responseText;
						if(ret == 1) {
							blogArr.push(blog); //追加新的日志
							refreshBlog();
							NS.handler.clear();
						}
					}
				});
			}
		},
		// 编辑
		edit: function(id) {
			var item = blogSelector(id).content;
			currentId.value = item.id;
			title.value = item.title;
			content.value = item.blogContent;
			return false;
		},
		// 清空
		clear: function() {
			currentId.value = "";
			title.value = titleHint;
			content.value = contentHint;
		},
		// 置顶/取消置顶
		top: function(id, shouldTop) {
			NS.request(baseURL+(shouldTop?'topBlog':'untopBlog')+'?id='+id,{
				success: function(xhr) {
					var ret = xhr.responseText;
					if(ret == 1) {
						// 更改状态
						var item = blogSelector(id).content;
						item.rank = (item.rank=='0') ? '5' : '0';
						refreshBlog();
					}
				}
			});
			return false;
		},
		// 删除
		deleteBlog: function(id) {
			NS.request(baseURL+'deleteBlogs?id='+id,{
				success: function(xhr) {
					var ret = xhr.responseText;
					if(ret == 1) {
						// 更改状态
						var idArr = id.split('&'), i, index;
						for(i=0; i<idArr.length; i++) {
							index = blogSelector(idArr[i]).index;
							blogArr.splice(index,1);
						}
						refreshBlog();
					}
				}
			});
			return false;
		},
		// 删除多个
		deleteSome: function() {
			var id = '';
			for(var i=0; i<checkList.length; i++) {
				if(checkList[i].checked) {
					id += (id!=''?'&':'') + blogArr[i].id;
				}
			}
			NS.handler.deleteBlog(id);
		},
		// 全选
		selectAll: function(checked) {
			for(var i=0; i<checkList.length; i++) {
				checkList[i].checked = checked ? true : false;
			}
		},
		// 菜单选中
		menu: function(event) {
			var event = event || window.event,
				element = event.target || event.srcElement,
				tagName = element.tagName.toUpperCase(),
				selectedLi = (tagName === 'LI') ? element : ((tagName === 'A')?element.parentNode:null),
				liList = menuSide.getElementsByTagName('li');
			if(!selectedLi) return false;
			for(var i=0; i<liList.length; i++) {
				liList[i].className = liList[i].className.replace(/\s?active/,'');
				if(liList[i] === selectedLi) {
					liList[i].className += ' active';
				}
			}
			return false;
		},
		// 切换tab标签
		changeTab: function() {
			var ul = this.parentNode,
				liList = ul.getElementsByTagName('li'),
				contentList = $('tabContent').children,
				index = -1;

			for(var i=0; i<liList.length; i++) {
				liList[i].className = liList[i].className.replace(/\s?active/,'');
				if(liList[i] == this) {
					liList[i].className += ' active';
					index = i;
				}
			}
			for(var i=0, j=0; i<contentList.length; i++) {
				if(contentList[i].nodeType!=1) continue;
				contentList[i].className = contentList[i].className.replace(/\s?crt/,'');
				if(j == index) {
					contentList[i].className += ' crt';
				}
				j++;
			}
			return false;
		},
		// textarea 获得焦点
		focusta: function() {
			if(blogContent.value === contentHint) {
				blogContent.value = '';
			}
		},
		// textarea 失去焦点
		blurta: function() {
			if(blogContent.value === '') {
				blogContent.value = contentHint;
			}
		},
		// input 获得焦点
		focusipt: function() {
			if(title.value === titleHint) {
				title.value = '';
			}
		},
		// input 失去焦点
		bluript: function() {
			if(title.value === '') {
				title.value = titleHint;
			}
		}
	};

})();