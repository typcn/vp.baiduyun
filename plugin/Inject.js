
window.sendToPlugin = function(data){
    var request = new XMLHttpRequest();
    request.open('POST', 'http://localhost:23330/pluginCall', true);
    request.setRequestHeader('Content-Type', 'application/json');
    request.send(JSON.stringify(data));
}

window.showToast = function(msg, type) {   
    var Toast = require("common:widget/toast/toast.js");
    Toast.obtain.useToast({
        toastMode: Toast.obtain[type],
        msg: msg,
        sticky: false
    });
};

window.getFileMeta = function(target){
    var API = (require("common:widget/restApi/restApi.js"),require("common:widget/hash/hash.js"));
    var path=API.get("path");
    if(path == null || path =="/"){
        path="";
    }
    var request = new XMLHttpRequest();
    request.open('GET', "//pan.baidu.com/api/filemetas?target="+encodeURIComponent("["+JSON.stringify(target)+"]")+"&dlink=1&bdstoken="+yunData.MYBDSTOKEN+"&channel=chunlei&clienttype=0&web=1", true);
    request.onload = function() {
      if (this.status >= 200 && this.status < 400) {
        // Success!
        var data = JSON.parse(this.response);
        if(data.errno == 0){
            showToast("获取文件信息成功!", "MODE_SUCCESS");
            sendToPlugin({ action:'baiduyun-playURL', data:data.info[0].dlink });
        }else{
            showToast("获取地址失败，错误码:" + data.errno, "MODE_FAILURE");
        }
      } else {
        showToast("获取地址失败，响应非 200", "MODE_FAILURE");
      }
    };

    request.onerror = function() {
        showToast("获取地址失败，网络错误", "MODE_FAILURE");
    };

    request.send();
}

window.getFileMetaDownload = function(target,name){
    var API = (require("common:widget/restApi/restApi.js"),require("common:widget/hash/hash.js"));
    var path=API.get("path");
    if(path == null || path =="/"){
        path="";
    }
    var request = new XMLHttpRequest();
    request.open('GET', "//pan.baidu.com/api/filemetas?target="+encodeURIComponent("["+JSON.stringify(target)+"]")+"&dlink=1&bdstoken="+yunData.MYBDSTOKEN+"&channel=chunlei&clienttype=0&web=1", true);
    request.onload = function() {
      if (this.status >= 200 && this.status < 400) {
        // Success!
        var data = JSON.parse(this.response);
        if(data.errno == 0){
            showToast("获取文件信息成功!", "MODE_SUCCESS");
            sendToPlugin({ action:'baiduyun-downloadURL', data:data.info[0].dlink + '_BL_SPLIT_' + name });
        }else{
            showToast("获取地址失败，错误码:" + data.errno, "MODE_FAILURE");
        }
      } else {
        showToast("获取地址失败，响应非 200", "MODE_FAILURE");
      }
    };

    request.onerror = function() {
        showToast("获取地址失败，网络错误", "MODE_FAILURE");
    };

    request.send();
}

setTimeout(function(){
    if(window.bctnloaded){
        return;
    }
    var btn = document.createElement("span");
    btn.className = "icon-btn-device";
    btn.style.float = "none";
    btn.innerHTML = '<span class="ico"></span><span class="text">播放视频</span>';
    document.getElementsByClassName("bar")[0].appendChild(btn);
    btn.addEventListener("click",function(){
         var API = (require("common:widget/restApi/restApi.js"),require("common:widget/hash/hash.js"));
        var path=API.get("path");
        var File = require("common:widget/data-center/data-center.js");
        var Service = require("common:widget/commonService/commonService.js");
        var Filename = File.get("selectedItemList");
        var length = Filename.length;
        if (length == 0) {
            showToast("请先勾选要播放的视频（只能选一个）","MODE_CAUTION");
            return;
        }
        var path=API.get("path");
        if(path == null){
            path="/";
        }else{
            path+="/";
        }
        var name =Filename[0].children().eq(0).children().eq(2).attr("title")||Filename[0].children().eq(1).children().eq(0).attr("title");
        getFileMeta(path+""+name);
    },true);
    var btn = document.createElement("span");
    btn.className = "icon-btn-device";
    btn.style.float = "none";
    btn.innerHTML = '<span class="ico"></span><span class="text">快速下载</span>';
    document.getElementsByClassName("bar")[0].appendChild(btn);
    btn.addEventListener("click",function(){
         var API = (require("common:widget/restApi/restApi.js"),require("common:widget/hash/hash.js"));
        var path=API.get("path");
        var File = require("common:widget/data-center/data-center.js");
        var Service = require("common:widget/commonService/commonService.js");
        var Filename = File.get("selectedItemList");
        var length = Filename.length;
        if (length == 0) {
            showToast("请先勾选要下载的文件）","MODE_CAUTION");
            return;
        }
        var path=API.get("path");
        if(path == null){
            path="/";
        }else{
            path+="/";
        }
        for(var i = 0;i < Filename.length;i++){
            var name =Filename[i].children().eq(0).children().eq(2).attr("title")||Filename[i].children().eq(1).children().eq(0).attr("title");
            getFileMetaDownload(path+""+name,name);
        }
    },true);
    var btn = document.createElement("span");
    btn.className = "icon-btn-device";
    btn.style.float = "none";
    btn.innerHTML = '<span class="ico"></span><span class="text">下载管理</span>';
    document.getElementsByClassName("bar")[0].appendChild(btn);
    btn.addEventListener("click",function(){
        window.open('http://static.tycdn.net/downloadManager/','_blank');
    },true);
    window.bctnloaded = true;
},500);