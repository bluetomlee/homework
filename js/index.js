/**
 * [业务逻辑]
 */
var base = {

    init : function(){
        host = 'http://fed.hz.netease.com';
        this.postblog();
        this.getblog();
        this.editblog();
        this.getfriendblog();
        this.tab();
        this.placeholder();
        this.reset();
        this.operlay();
        this.checkall();
        this.delall();
    },
    postblog : function(){
        $.bind($.elem("#btn-post"),"click",function(){
            var content = {
                title : ($.elem('.tab-note'))[0].value,
                blogContent : ($.elem('.blog-wr'))[0].value,
                publishTime : new Date().getTime(),
                modifyTime: new Date().getTime(),
                shortPublishDateStr : $.timeformat(new Date()).substring(0,11),
                publishTimeStr :  $.timeformat(new Date()).substring(11),
                accessCount:0,
                allowView:-100,
                classId:'fks_0870508080067081',
                id : 'fks_' + Math.random()*999999,
                commentCount:0,
                userId:126770605,
                userName:'testblog1',
                userNickname:'testblog'
            };
            var dataid = ($.elem(".m-post"))[0].name;
            if(!content.title || !content.blogContent||content.title == '日志标题"' || content.blogContent == '这里可以写日志哦~'){
                alert("请填写完整标题和内容");
                return false;
            }
            if(dataid){
                base.saveorup(host+'/api/editBlog?blog={}',content,true,dataid);
            }
            else{
                base.saveorup(host+'/api/addBlog?blog={}',content);
            }
        })
    },
    editblog : function(){
       var list = $.elem("#m-list");
       list.onclick = function(){
            var e = arguments[0] || window.event,
                target = e.target || e.srcElement;
            if(target.className == 'ls-edit'){
                var id = target.parentNode.parentNode.parentNode.id;
                ($.elem(".tab-note"))[0].value = target.parentNode.parentNode.childNodes[1].childNodes[3].innerHTML;
                ($.elem(".blog-wr"))[0].value = target.parentNode.parentNode.childNodes[1].childNodes[3].innerHTML;
                ($.elem(".m-post"))[0].name = id;
            }else if(target.className == 'del'){
                 var id = target.parentNode.parentNode.parentNode.parentNode.parentNode.id; 
                 if(confirm("确定删除日志？")){
                   base.delblog(host + '/api/deleteBlogs?id=' + id,id);
                }
               
            }else if(target.className == 'up'){
                var id = target.parentNode.parentNode.parentNode.parentNode.parentNode.id;
                base.upblog(host + '/api/topBlog?id=' + id,id);
                target.innerHTML = '取消置顶';
            }
       }
    },
    delblog :function(url,id){
        $.Ajax(url,function(data){
            if(data == 1){
                if(typeof id == 'string'){
                     var a = $.elem("#"+id);
                     a.parentNode.removeChild(a);
                }else{
                     for (var i = id.length - 1; i >= 0; i--) {
                         var a = document.getElementById(id[i]);
                         a.parentNode.removeChild(a);
                     };
                }
            }
        })
    },
    delall : function(){
        $.bind($.elem("#del"),"click",function(){
            var id = [],
                ids =  '',
                list = $.elem(".log-item"),
                cklist = $.elem(".checkitem");
            for (var i = 0; i < list.length; i++) {
                if(cklist[i].checked){
                    id.push(list[i].id);
                    ids += (id!=''?'&':'') + list[i].id;
                }
            };
            base.delblog(host + '/api/deleteBlogs?id='+ids ,id);
        })
    },
    upblog : function(url,id){
        $.Ajax(url,function(data){
            if(data ==1){
                var c = $.elem("#m-list"),
                    a = $.elem("#" + id),
                    b = ($.elem(".log-item"))[0];
                c.insertBefore(a,b);
                a.setAttribute("rank",5);
            }
        })
    },
    saveorup : function(url,content,isup,blogid){
        $.Ajax(url,function(data){
             var ul = $.elem("#m-list"),
                 item0 = ($.elem(".log-item"))[1],
                 item = item0.innerHTML; 
            if(data == 1){
                if(isup){
                    $.html($.elem("#"+blogid).childNodes[1].childNodes[1].childNodes[3],content.title);

                }else{
                    newblog = base.createblog([content],item);
                    ul.insertBefore(newblog,ul.firstChild);
                }
                $.elem("#btn-reset").click();
               ($.elem(".m-post"))[0].name = '';

            }
        })
    },
    getblog : function(){
        var url = host + '/api/getblogs';
        $.Ajax(url,function(data){
            var len  = data.length;
                order = function(a,b) {
                    if(a.rank != b.rank) {
                        if(a.rank == 5) {
                            return -1;
                        } else {
                            return 1;
                        } 
                    } else {
                        if(a.publishTime < b.publishTime) {
                            return 1;
                        } else {
                            return -1;
                        }
                    }  
                };
            data.sort(order);
            var ul = $.elem("#m-list"),
                item0 = ($.elem(".log-item"))[0],
                item = item0.innerHTML,
                vessel = base.createblog(data,item);
                 item0.parentNode.removeChild(item0);           
            ul.appendChild(vessel);
           
        });    
    },
    getfriendblog : function(){
        var url = host + '/api/getFriendsLatestBlogs';
        $.Ajax(url, function(data){
             var order = function(a,b) {
                    if(a.publishTime < b.publishTime) {
                        return 1;
                    } else {
                        return -1;
                    }
        
                },
                mfrd = ($.elem(".ls-frd"))[0];
            data.sort(order);   
            data.length = 5;
            var item0 = ($.elem(".frd"))[0],
            item = ($.elem(".frd"))[0].innerHTML;
            frdlist = base.createfrdblog(data,item);
            while(item0.hasChildNodes()) {
                    item0.removeChild(item0.lastChild);
                }
            mfrd.appendChild(frdlist);
        })
    },
    createblog : function(data,template){
        var fragment = document.createDocumentFragment(),
            blogitem;
        for (var i = 0,len = data.length ; i < len; i++) {
            blogitem = data[i];
            li = $.createHtml('li','log-item');
            li.innerHTML = template;
            var lstt = li.childNodes[1].childNodes[1].childNodes[3],
                lstime = li.childNodes[1].childNodes[1].childNodes[5].childNodes[1],
                lsread = li.childNodes[1].childNodes[1].childNodes[5].childNodes[3],
                lscmt = li.childNodes[1].childNodes[1].childNodes[5].childNodes[5];
            if(blogitem.allowView == 1000){
                $.html(lstt,"私人日志");
            }else{
                $.html(lstt,blogitem.title);
                lstt.title = blogitem.content;
                li.id = blogitem.id;
            }
           $.html(lstime,blogitem.shortPublishDateStr + ' ' + blogitem.publishTimeStr);
           $.html(lsread,'阅读' + blogitem.accessCount);
           $.html(lscmt,'评论' + blogitem.commentCount);
            fragment.appendChild(li);
        };
        return fragment;


    },
    createfrdblog : function(data,template){
        var fragment = document.createDocumentFragment(),
            blogitem;
        for (var i = 0,len = data.length ; i < len; i++) {
            blogitem = data[i];
            li = $.createHtml('div','frd');
            li.innerHTML = template;
            var lstt = li.childNodes[3].childNodes[0],
                lscon = li.childNodes[5];
            if(blogitem.allowView == 1000){
                $.html(lscon,"私人日志");
            }else{
                $.html(lscon,blogitem.title);
            }
           $.html(lstt,blogitem.userNickname);
           $.html(lscon,blogitem.title);
            fragment.appendChild(li);
        };
        return fragment;


    },
    tab : function(){
        var a = $.elem("#j-tab"),
            tabls = $.elem("#j-tab").getElementsByTagName("span");
        $.bind(a,"click",function(e){
            var _target = $.target(e),
                tabc = $.elem(".tab-con");
            for( var i=0,l=tabls.length; i<l; i++){
                if(tabls[i] == _target) {
                    tabls[i].className = "bdc0 tab-tt tab-now";
                   $.show(tabc[i]);
                } else {
                    tabls[i].className = "bdc0 tab-tt s-blue";
                   $.hide(tabc[i]);
                }
            }
        })

    },
    placeholder : function(){
        var titletext = '日志标题',
              logtext = '这里可以写日志哦~',
              tt = ($.elem(".tab-note"))[0],
              conc = ($.elem(".blog-wr"))[0];
              // console.log(tt.value);
              $.bind(tt,"focus",function(){
                if(tt.value === titletext){
                tt.value = '';
                }
              });
              $.bind(tt,"blur",function(){
                if(tt.value === ''){
                tt.value = titletext;
                }
              });
             $.bind(conc,"focus",function(){
                if(conc.value === logtext){
                conc.value = '';
                conc.style.color = '#333';
                 }
             });
             $.bind(conc,"blur",function(){
                if(conc.value === ''){
                conc.value = logtext;
                conc.style.color = '#a4a4a4';
                 }
             });
              
    },
    reset : function(){
        $.bind($.elem("#btn-reset"),"click",function(){
            var tt = ($.elem(".tab-note"))[0],
              conc = ($.elem(".blog-wr"))[0];
            tt.value = '日志标题';
            conc.value = '这里可以写日志哦~';
        })
    },
    operlay : function(){
        $.bind($.elem("#m-list"),"click",function(e){
             var _target = $.target(e),
                 mlist = $.elem("#m-list"),
                 more = $.elem(".u-more");
            for (var i = more.length - 1; i >= 0; i--) {
                if(more[i] == _target){
                    _target.parentNode.parentNode.className = "ls-more f-ib select";
                }else if(more[i] !== _target){
                    more[i].parentNode.parentNode.className = "ls-more";
                }
            };

        })
    },
    checkall : function(){
        var all = $.elem("#checkall");
        $.bind(all,"click",function(){
            var allcheck = $.elem(".checkitem");
            for (var i = allcheck.length - 1; i >= 0; i--) {
               if (all.checked){
                    allcheck[i].checked = true;
               }else{
                    allcheck[i].checked = false;
               }
            };
        })
    }
};
base.init();