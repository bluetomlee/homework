/**
 * Created by hzfengshikun on 2014/9/1.
 */

var friendTemplate_1 = "<div class='m-friendItem f-cb'>"+
"<div class='m-Image'></div>"+
    "<div class = 'userName'></div>"+
    "<div class='content'></div>"+
"</div>";
var friendTemplate = "<div class='m-Image'></div>"+
    "<div class = 'userName'></div>"+
    "<div class='content'></div>";


var friendListShow = 5;
var blogShow = 9;
var fBlogListDiv = document.getElementsByName("friendList")[0];
var Blogs=[];
var blogListDiv = document.getElementsByName("blogItem")[0];//blog item template
var listShow = document.getElementById("listShow");
var blogTitle = document.getElementsByName("title")[0];
var blogContent = document.getElementsByName("content")[0];
var editState = false;
var releaseBu = document.getElementsByName("releaseBu")[0];
var resetBu = document.getElementsByName("resetBu")[0];
var selectCb = document.getElementsByName("all")[0];
var tabChangeDiv = document.getElementsByClassName("g-blogContent")[0];
var currentEditInd = -1;
var titleDefault = "日志标题";
var contentDefault = "这里可以写日志哦~";

EventUtil.addHandler(window,"load",getFriendBlogs());
EventUtil.addHandler(window,"load",getBlogs());
EventUtil.addHandler(window,"click",eventHandler);

function getFriendBlogs()
{
    var url = "http://10.211.55.3/api/getFriendsLatestBlogs?userId=126770605";
    var type = "get";
    var sentContent = null;
    AjaxHttp(showFriendBlogs,type,url,sentContent);
}

function showFriendBlogs(fBlogs)
{
    for(var i = 0; i<friendListShow ; i++)
    {
        var warpDiv = document.createElement("div");
        warpDiv.className = "m-friendItem f-cb";
        warpDiv.innerHTML = friendTemplate;
        warpDiv.childNodes[1].innerHTML = fBlogs[i].userNickname;
        warpDiv.childNodes[2].innerHTML = fBlogs[i].title;
        fBlogListDiv.appendChild(warpDiv);
    }
}

function getBlogs()
{
    var url = "http://10.211.55.3/api/getblogs";
    var type = "get";
    var sentContent = null;
    AjaxHttp(initShowBlogs,type,url,sentContent);
}

function formatTime(date)
{

    return date.getFullYear()+"-"+addZero(date.getMonth()+1)+"-"+addZero(date.getDay())+" "+
        addZero(date.getHours())+":"+addZero(date.getMinutes());
}
function addZero(Num)
{
    if(Num<10)
        return "0"+Num;
    else
        return Num.toString();
}

function initShowBlogs(blogs)
{
    Blogs = blogs;
    for(var i = 0; i<Blogs.length;i++)
    {
        if(Blogs[i].modifyTime == "0")
            Blogs[i].modifyTime = Blogs[i].publishTime;
    }
    showBlogs(Blogs,true);
}
function showBlogs(Blogs,isSort)
{
    listShow.innerHTML="";
    if(isSort==true)
        sortByAttri(Blogs,"rank","modifyTime");
    for(var i = 0;i< blogShow&&i<Blogs.length ; i++)
    {
        var wrapDiv = blogListDiv.cloneNode(true);
        wrapDiv.setAttribute("ind", i.toString());
        wrapDiv.childNodes[1].childNodes[3].setAttribute("ind", i.toString());//checkbox
        wrapDiv.childNodes[1].childNodes[1].childNodes[3].setAttribute("ind", i.toString());//edit
        wrapDiv.childNodes[1].childNodes[1].childNodes[1].childNodes[1].childNodes[0].setAttribute("ind", i.toString());//more
        wrapDiv.childNodes[1].childNodes[1].childNodes[1].childNodes[3].childNodes[0].setAttribute("ind", i.toString());//delete
        wrapDiv.childNodes[1].childNodes[1].childNodes[1].childNodes[5].childNodes[0].setAttribute("ind", i.toString());//rank
        wrapDiv.style.display="block";
        wrapDiv.childNodes[1].childNodes[5].innerHTML = Blogs[i].title;//title
        if(Blogs[i].allowView=="10000")
            wrapDiv.childNodes[1].childNodes[5].className+=" private";
        var modifyT = Blogs[i].modifyTime;
        var modDate = new Date(parseInt(modifyT));
        wrapDiv.childNodes[3].childNodes[1].innerHTML = formatTime(modDate);
        wrapDiv.childNodes[3].childNodes[3].innerHTML = "阅读:"+Blogs[i].accessCount;
        wrapDiv.childNodes[3].childNodes[5].innerHTML = "评论:"+Blogs[i].commentCount;
        if(Blogs[i].rank=="5")
            wrapDiv.childNodes[1].childNodes[1].childNodes[1].childNodes[5].childNodes[0].innerHTML="取消置顶";
        listShow.appendChild(wrapDiv);
    }
}


function sortByAttri(arr,attri_1,attri_2)
{
    var sortF = function(value1,value2){
        if(value2[attri_1].localeCompare(value1[attri_1]) == 0)
            return value2[attri_2].localeCompare(value1[attri_2]);
        else
            return value2[attri_1].localeCompare(value1[attri_1]);
    };
    arr.sort(sortF);
}

function eventHandler(event)
{
    event = EventUtil.getEvent(event);
    var target = EventUtil.getTarget(event);
    if(target.className == "title")
    {
        if(blogContent.value == "")
            blogContent.value=contentDefault;
        if(blogTitle.value == titleDefault)
            blogTitle.value="";
        return;
    }
    if(target.className == "content")
    {
        if(blogTitle.value=="")
            blogTitle.value = titleDefault;
        if(blogContent.value==contentDefault)
            blogContent.value="";
        return;
    }
    if(target.className=="delete")
    {
        var arr = [];
        arr.push(target.getAttribute("ind"));
        deleteHandler(arr);
        return;
    }
    if(target.className=="cbAll")
    {
        selectAllHandler(target);
        return;
    }
    if(target.className=="deleteBu")
    {
        deleteButtonHandler();
        return;
    }
    if(target.className=="edit")
    {
        editHandler(target);
        return;
    }
    if(target.className.search(/u-button-release/)!= -1 )
    {
        EventUtil.preventDefault(event);
        if(editState==true)
        {
            editState = false;
            releaseBlog(currentEditInd);
        }
        else
        {
            releaseBlog(null);
        }
        setDefault();
        return;
    }
    if(target.className=="rankFirst")
    {
        rankHandler(target);
        return;
    }
    if(target.className=="more")
    {
        changeStyle(target);
        return;
    }
    if(target.className=="nCur")
    {
        tabChange(target);
    }
}

function changeStyle(target)
{
    if(target.parentNode.parentNode.className=="menuItems")
        target.parentNode.parentNode.className+=" menuSelect";
    else
        target.parentNode.parentNode.className="menuItems";
}
function deleteHandler(arrInd)
{
    arrInd.sort();
    for(var i=0;i<arrInd.length;i++)
    {
        Blogs.splice(arrInd[i]-i,1);
    }
    showBlogs(Blogs,true);
}

function selectAllHandler(target)
{
    if(target.checked==true)
    {
        for(var i = 0;i< blogShow&&i<Blogs.length ; i++)
        {
            listShow.childNodes[i].childNodes[1].childNodes[3].checked=true;
        }
    }
    else
        for(var i = 0;i< blogShow&&i<Blogs.length ; i++)
        {
            listShow.childNodes[i].childNodes[1].childNodes[3].checked=false;
        }
}

function deleteButtonHandler()
{
    var delArr = [];
    for(var i = 0;i< blogShow&&i<Blogs.length ; i++)
    {
        if(listShow.childNodes[i].childNodes[1].childNodes[3].checked==true)
            delArr.push(i);
    }
    deleteHandler(delArr);
    if(selectCb.checked==true)
        selectCb.checked=false;
}

function releaseBlog(ind) {
    var now = new Date();
    if (ind != null)//edit state
    {
        Blogs[ind].title = blogTitle.value;
        Blogs[ind].blogContent = blogContent.value;
        Blogs[ind].modifyTime = now.getTime().toString();
        listShow.childNodes[ind].childNodes[1].childNodes[5].innerHTML = Blogs[ind].title;//reset title
        listShow.childNodes[ind].childNodes[3].childNodes[1].innerHTML = formatTime(now);//reset time
        //over
    }
    else
    {
        var newBlog={title: blogTitle.value,//日志标题
            blogContent: blogContent.value,//日志内容
            modifyTime:now.getTime().toString(),//日志创建时间
            accessCount:0,//阅读数
            allowView:-100,//阅读权限
            classId:"我不知道啊",//日志分类
            commentCount:0,//日志评论数
            id:"",//日志ID,客户端随机生成 todo list
            userId:126770605,//用户ID
            userName:"testblog1",//用户名
            rank:"0",
            userNickname:"testblog"};//用户昵称
        Blogs.push(newBlog);
        showBlogs(Blogs,true);
    }
}

function editHandler(target)
{
    var ind = target.getAttribute("ind");
    blogTitle.value = Blogs[ind].title;
    blogContent.value = Blogs[ind].blogContent;
    editState = true;
    currentEditInd = ind;
}

function setDefault()
{
    blogContent.value = contentDefault;
    blogTitle.value = titleDefault;
}

function rankHandler(target)
{
    var ind = target.getAttribute("ind");
    if(target.innerHTML=="置顶")
    {
        target.innerHTML="取消置顶";
        Blogs[ind].rank="5";
        showBlogs(Blogs,true);
    }
    else
    {
        target.innerHTML="置顶";
        Blogs[ind].rank="0";
        showBlogs(Blogs,true);
    }
}

function tabChange(target)
{
    if(target.innerHTML=="日志")
    {
        target.parentNode.nextSibling.childNodes[0].className="nCur";
        target.className="curr";
        tabChangeDiv.style.left="0px";
    }
    else
    {
        target.parentNode.previousSibling.childNodes[0].className="nCur";
        target.className="curr";
        tabChangeDiv.style.left="-548px";
    }
}