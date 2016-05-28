
window.sendToPlugin = function(data){
    var request = new XMLHttpRequest();
    request.open('POST', 'http://localhost:23330/pluginCall', true);
    request.setRequestHeader('Content-Type', 'application/json');
    request.send(JSON.stringify(data));
}

window.showToast = function(msg, type) {   
    var Toast = require("system-core:context/context.js").instanceForSystem;
    if(type.startsWith("MODE")){
        type=type.split("_")[1].toLowerCase();
    }
    Toast.ui.tip({
                 mode: type,
                 msg: msg
                 });
};

window.getFileMeta = function(target){
    var encode = new Function("return " + yunData.sign2)();
    var sign = btoa(encode(yunData.sign3, yunData.sign1)) ;
    var request = new XMLHttpRequest();
    request.open('GET', "//pan.baidu.com/api/download?sign=" + encodeURIComponent(sign) + "&timestamp=" + yunData.timestamp +"&fidlist=" + encodeURIComponent("[" + target + "]") + "&bdstoken="+yunData.MYBDSTOKEN+"&type=dlink&channel=chunlei&web=1&app_id=250528&clienttype=0", true);
    request.onload = function() {
      if (this.status >= 200 && this.status < 400) {
        // Success!
        var data = JSON.parse(this.response);
        if(data.errno == 0){
            showToast("获取文件信息成功!", "MODE_SUCCESS");
            sendToPlugin({ action:'baiduyun-playURL', data:data.dlink[0].dlink });
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
    var encode = new Function("return " + yunData.sign2)();
    var sign = btoa(encode(yunData.sign3, yunData.sign1)) ;
    var request = new XMLHttpRequest();
    request.open('GET', "//pan.baidu.com/api/download?sign=" + encodeURIComponent(sign) + "&timestamp=" + yunData.timestamp +"&fidlist=" + encodeURIComponent("[" + target + "]") + "&bdstoken="+yunData.MYBDSTOKEN+"&type=dlink&channel=chunlei&web=1&app_id=250528&clienttype=0", true);
    request.onload = function() {
      if (this.status >= 200 && this.status < 400) {
        // Success!
        var data = JSON.parse(this.response);
        if(data.errno == 0){
            showToast("获取文件信息成功!", "MODE_SUCCESS");
            sendToPlugin({ action:'baiduyun-downloadURL', data:data.dlink[0].dlink + '_BL_SPLIT_' + name });
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
    var btn = document.createElement("a");
    btn.className = "g-button";
    btn.href = "javascript:void(0)";
    btn.innerHTML = '<span class="g-button-right"><em class="icon icon icon-play-music" title="播放视频"></em><span class="text" style="width: auto;">播放视频</span></span>';
    document.querySelector('.default-dom .bar div:nth-child(2)').appendChild(btn);
    btn.addEventListener("click",function(){
        var Filename = require("system-core:context/context.js").instanceForSystem.list.getSelected();
        var length = Filename.length;
        if (length == 0) {
            showToast("请先勾选要播放的视频（只能选一个）","MODE_CAUTION");
        }
        getFileMeta(Filename[0].fs_id);
    },true);
    var btn = document.createElement("a");
    btn.className = "g-button";
    btn.href = "javascript:void(0)";
    btn.innerHTML = '<span class="g-button-right"><em class="icon icon icon-offline-download" title="快速下载"></em><span class="text" style="width: auto;">快速下载</span></span>';
    document.querySelector('.default-dom .bar div:nth-child(2)').appendChild(btn);
    btn.addEventListener("click",function(){
        var Filename = require("system-core:context/context.js").instanceForSystem.list.getSelected();
        var path= require("system-core:context/context.js").instanceForSystem.list.getCurrentPath();
        if(path == null){
            path="/";
        }else{
            path+="/";
        }
        var length = Filename.length;
        if (length == 0) {
            showToast("请先勾选要下载的文件","MODE_CAUTION");
            return;
        }
        for(var i = 0;i < Filename.length;i++){
            getFileMetaDownload(Filename[i].fs_id,Filename[i].server_filename);
        }
    },true);
    var btn = document.createElement("a");
    btn.className = "g-button";
    btn.href = "javascript:void(0)";
    btn.innerHTML = '<span class="g-button-right"><em class="icon icon-device-tool" title="下载管理"></em><span class="text" style="width: auto;">下载管理</span></span>';
    document.querySelector('.default-dom .bar div:nth-child(2)').appendChild(btn);
    btn.addEventListener("click",function(){
        window.open('http://static.tycdn.net/downloadManager/','_blank');
    },true);
    window.bctnloaded = true;
},500);