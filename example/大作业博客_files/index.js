$(function(){
    
    /**daily template  **/

    var template = $('.m-dshw').find('ul').child('li').firstEle().innerHTML;
    $('#daily-title').firstEle().blur();

     /** tab */
     var tab = $('.tab').firstEle(),
         container = $('.container').firstEle();

     $('li',tab).bind('click',function(){
        var _this = $(this),
            className = '.j-' + _this.attr('id');
        $('li',tab).removeClass('active');
        _this.addClass('active');
        $('.container').getChildEles()
        .addClass('z-hide')
        .removeClass('z-show');
        $(className).addClass('z-show');
     });

     /** daily title **/


     $('#daily-title').bind('focus',function(event,target){
        var _this = $(target);
        if ( _this.val() != "" && _this.val() == _this.attr('data-placeholder')) {
            _this.val("");
        }
     }).val('日志标题');

      $('#daily-title').bind('blur',function(event,target){
        var _this = $(target);
        if ( _this.attr('data-placeholder') != "" && (_this.val() == '' || _this.val() == _this.attr('data-placeholder'))) {
           _this.val(_this.attr('data-placeholder'));
        }
     }).firstEle().blur();


    $('#daily-content').bind('focus',function(event,target){
        var _this = $(target);
        if ( _this.val() != "" && _this.val() == _this.attr('data-placeholder')) {
            _this.removeClass('hp').val("");
        }
     }).val('这里可以写日志哦~');

    $('#daily-content').bind('blur',function(event,target){
        var _this = $(target);
        if ( _this.attr('data-placeholder') != "" && (_this.val() == '' || _this.val() == _this.attr('data-placeholder'))) {
           _this.addClass('hp').val(_this.attr('data-placeholder'));
        }
     }).firstEle().blur();


     


      /** hover **/

      $('.m-menu').bind('mouseover',function(event,target){
        
            if(target.tagName.toLowerCase() === 'li') {
                    if(!$(target).hasClass('z-clicked')) {
                         $(target).addClass('z-hover');
                    }     
                }
      });

      $('.m-menu').bind('mouseout',function(event,target){
         
            if(target.tagName.toLowerCase() === 'li') {
                $(target).removeClass('z-hover');
            }
      });

      $('.m-menu').bind('click',function(event,target){
            var _this = this;
            if(target.tagName.toLowerCase() === 'li') {
                $('.m-menu').find('li').removeClass('z-clicked');
                $(target).addClass('z-clicked');
            }
      });



    /** get blog and display blog **/

    function createDailyItems(data,template) {
        var lisFragment = document.createDocumentFragment(),
            li,single;
        for(var i = 0,len = data.length; i < len; i++) {
            single = data[i];
            li = $.createEle('li');
            li.innerHTML = template;
            $(li).attr('id',single.id);
            $(li).attr('data-rank',single.rank);
            $(li).attr('data-time',single.publishTime);
            $(li).attr('data-content',single.blogContent);
            if(single.allowView == 10000 ) {
                $('.j-title',li).html('<i class="icon icon-suser"></i>' + single.title);
            } else {
                $('.j-title',li).text(single.title);
            }
            $('.time',li).text($.getFormatDateStr(new Date(single.publishTime-0)));
            $('.read',li).text('阅读' + single.accessCount);
            $('.comment',li).text('评论' + single.commentCount);
            lisFragment.appendChild(li);
        }
        return lisFragment;
    }


    function zIndexFixForIE67() {
        var zIndex = 10000;
        $('.m-dshw').child('ul').child('li').each(function(){
            $('.title',this).css('zIndex',zIndex--);
        });
    }

    $.ajax({
        url : 'http://fed.hz.netease.com/api/getblogs',
        method : 'GET',
        callback : function(data){
                var sortFn = function(a,b) {

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
                data.sort(sortFn);
                var dUl = $('.m-dshw').find('ul').firstEle(),
                    template = $('li',dUl).firstEle().innerHTML,
                    lisFragment = createDailyItems(data,template);
                $(dUl).empty().firstEle().appendChild(lisFragment);
                // fix bug for ie 6 7
                if($.isIE6_7()) {
                    zIndexFixForIE67();
                }
        }
    });


    /* choose blog and delete blog */


    $('#checkall').bind('click',function(event,target){
     
           var allInput = $('.m-dshw').find('input');
               allInput.elements.length -= 1;
           if(target.checked) {
               allInput.attr('checked',true,true);
           } else { 
               allInput.attr('checked',false,true);
           }
    });

    $('#del').bind('click',function(event,target){
        var ids = [],
            isCheckAll = $('#checkall').firstEle().checked;
        if(isCheckAll) {
                allLi = $('.m-dshw').child('ul').child('li');
                allLi.each(function(){
                    ids.push(this.getAttribute('id'));
                });
        } else {
            allInput = $('.m-dshw').child('ul').child('li').find('input');
            allInput.each(function(){
                var that = this;
                if(this.checked) {
                   ids.push($(this).parent('li').attr('id'));
                }
            });
        }

        deleteBlogById(ids,isCheckAll);
       
    });


    /*more btn function*/

    function deleteBlogById(ids,opt_isCheckall) {
           $.ajax({
            url : 'http://fed.hz.netease.com/api/deleteBlogs?id=' + ids.join('&'),
            method : 'GET',
            callback : function(data){
                    if(data == 1) {
                        if(opt_isCheckall) {
                            $('.m-dshw').child('ul').empty();
                        } else {
                            for(var i = 0; i < ids.length; i++) {
                                $('#' + ids[i]).remove();
                            }
                        }
                    }
            }
        });
    }


    function topBlogById(id) {
         $.ajax({
            url : 'http://fed.hz.netease.com/api/topBlog?id=' + id,
            method : 'GET',
            callback : function(data){
                    if(data == 1) {
                        $('.m-dshw').child('ul').before($('#' + id).attr('data-rank','5').firstEle());
                        // re-adjust z-index for ie6 7 after top or untop blog
                         if($.isIE6_7()) {
                             zIndexFixForIE67();
                        }
                    }
            }
         });
    }
     
    function unTopBlogById(id) {
         $.ajax({
            url : 'http://fed.hz.netease.com/api/untopBlog?id=' + id,
            method : 'GET',
            callback : function(data){
                    if(data == 1) {
                         var isLastBlog = 1;
                         time = $('#' + id).attr('data-time');
                         $('#' + id).attr('data-rank','0');
                         $('.m-dshw').child('ul').child('li').each(function(){
                            if($(this).attr('data-rank') == 0 && time > $(this).attr('data-time')) {
                                $('.m-dshw').child('ul').before($('#' + id).firstEle(),this);
                                 isLastBlog = 0;
                                 return false;
                            }
                         });
                         if(isLastBlog) {
                            $('.m-dshw').child('ul').after($('#' + id).firstEle());
                         }
                           // re-adjust z-index for ie6 7 after top or untop blog
                        if($.isIE6_7()) {
                             zIndexFixForIE67();
                        }
                    }
            }
        });
    }


    $('.m-dshw').child('ul').bind('click',function(event,target) {
        
        if($(target).hasClass('more-btn')) {
            //expand more button
            $('.more-btn').parent().removeClass('active');
            $(target).parent().addClass('active');
        } else if($(target).parent().hasClass('more-drop')) {
            if(target.tagName.toLowerCase() === 'li') {
                //delete blog or top blog or untop blog
                   var id = $(target).parent('li').attr('id');
                   if($(target).hasClass('j-del')) {
                        if($('.m-dpst').attr('data-blogid') == $('#' + id).attr('id')) {
                            if(confirm('确定要放弃修改并删除日志吗？')) {
                                $('#clear-input').firstEle().click();
                                $('.m-dpst').delAttr('data-blogid');
                            } else {
                                return;
                            }
                        }
                        deleteBlogById([id]);
                   } else if($(target).hasClass('j-top')) {
                        $(target).text('取消置顶').removeClass('j-top').addClass('j-untop');
                        topBlogById(id);
                   } else {
                        $(target).text('置顶').removeClass('j-untop').addClass('j-top');
                        unTopBlogById(id);
                   }
                
            }
        } else if($(target).hasClass('edit') && target.tagName.toLowerCase() === 'span') {
            //edit blog 
             var id = $(target).parent('li').attr('id'); 
             $('#daily-title').val($('#' + id).find('.j-title').text());
             $('#daily-content').val($('#' + id).attr('data-content'));
             $('.m-dpst').attr('data-blogid',id);
        }

    });

    // when click other place drop menu picks up.
    $(document).bind('click',function(event,target){
        var target = $(target);
        if(!target.hasClass('more-btn') && !target.hasClass('more-drop')) {
             $('.more-btn').parent().removeClass('active');
        }
    });

    //drop menu hover effect
     $('.m-dshw').child('ul').bind('mouseover',function(event,target){
             if(target.tagName.toLowerCase() === 'li') {
                if($(target).parent('ul').hasClass("more-drop")) {
                    $(target).addClass('z-hover');
             }
        }
       
    });

     $('.m-dshw').child('ul').bind('mouseout',function(event,target){   
            if(target.tagName.toLowerCase() === 'li') {
                if($(target).parent('ul').hasClass("more-drop")) {
                    $(target).removeClass('z-hover');
            }
          }
    });


    /** post blog and modify blog **/


    // clear blog title and blog content
    $('#clear-input').bind('click',function(event,target){
        $('#daily-title').val("日志标题");
        $('#daily-content').addClass('hp').val("这里可以写日志哦~");
    });

    //post blog or update blog 
    $('#post-blog').bind('click',function(event,target){
        var props = {
            title : $('#daily-title').realVal(),
            blogContent : $('#daily-content').realVal(),
            publishTime : new Date().getTime(),
            modifyTime: new Date().getTime(),
            accessCount:0,
            allowView:-100,
            classId:'fks_0870508080067081',
            id : 'fks_' + Math.random()*1000,
            commentCount:0,
            userId:126770605,
            userName:'testblog1',
            userNickname:'testblog'
        };

        if(!props.title || !props.blogContent) {
            alert('title or content can not empty!');
            return;
        }
        var id = $('.m-dpst').attr('data-blogid');

        if(id) {
            //if blog list item has data-blogid attribute,then update blog.
            props.id = id;
            saveOrUpdateBlog('http://fed.hz.netease.com/api/editBlog?blog={}',props,true,id);
        } else {
            saveOrUpdateBlog('http://fed.hz.netease.com/api/addBlog?blog={}',props);
        }    
    });

    function saveOrUpdateBlog(url,props,opt_isUpdate,opt_blogid) {
             $.ajax({
                url : url,
                data : props,
                method : 'POST',
                callback : function(data){
                    if(data==1) {
                        if(opt_isUpdate) {
                            $('#' + opt_blogid).attr('data-content',props.blogContent)
                            .find('.j-title').text(props.title);
                            $('.m-dpst').delAttr('data-blogid');
                        } else {
                            $('.m-dshw').child('ul').before(createDailyItems([props],template));
                        }                
                        $('#clear-input').firstEle().click();
                    }
                }
            });
    }

/** latest blog **/

//create friends latest blog item 
function createFriendsDailyItems(data,template) {
      var lisFragment = document.createDocumentFragment(),
            li,single;
        for(var i = 0,len = data.length; i < len; i++) {
            single = data[i];
            li = $.createEle('li');
            li.innerHTML = template;
            $('.uname',li).text(single.userNickname);
            $('.dc',li).text(single.title);
            lisFragment.appendChild(li);
        }
        return lisFragment;
}

//get friends latest blog data and display top 5 items
$.ajax({
        url : 'http://fed.hz.netease.com/api/getFriendsLatestBlogs?userid=126770605',
        method : 'GET',
        callback : function(data){
                var sortFn = function(a,b) {
      
                        if(a.publishTime < b.publishTime) {
                            return 1;
                        } else {
                            return -1;
                        }
        
                };
                data.sort(sortFn);   
                // data[5] = data[0];
                data.length = 5; //get top 5 items 

                var template = $('#latestblog').child('li').firstEle().innerHTML,
                    lisFragment = createFriendsDailyItems(data,template);
                $('#latestblog').empty().after(lisFragment);
               
        }
  });


   //top 5 items carousel

   var timer =  setInterval(function(){
       $('#latestblog').animate('top','-52','-260');
    },2000);

    $('#latestblog').bind('mouseover',function(event,target){
        clearInterval(timer);
    });

     $('#latestblog').bind('mouseout',function(event,target){
       timer =  setInterval(function(){
          $('#latestblog').animate('top','-52','-260');
       },2000);
    });


});

