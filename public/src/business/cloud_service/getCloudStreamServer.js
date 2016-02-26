var streamServer;

// 获取stream服务器相关信息
!(function getStreamServer(lISP) {
	$.ajax({
		type : "POST",
		url : basePath + "/service/cloudService!getStreamServer.action",
		success : function(data, textStatus, jqXHR) {
			var resultCode = data.resultCode;
			switch (resultCode) {
				case '0' :
					var streamServerInfo = data.streamServerInfo;
					if (streamServerInfo) {
						streamServer = JSON.parse(streamServerInfo);
					} else {
						window.console && window.console.log("获取streamServerInfo内容为空！");
					}
					break;
				default :
					window.console && window.console.log("获取stream服务器信息失败！");
			};
		}
	});
})()

// 根据云存储类型和isp获取stream服务相关信息
function getCloudServerInfo(cloudType) {
	try {
		if (streamServer && !$.isEmptyObject(streamServer) && cloudType > 0) {
		    var serverInfo = streamServer['s' + cloudType];          
            var port = serverInfo['port'];
            var ip = serverInfo['domain'];
            return {
                CloudServerIp : ip,
                CloudServerPort : port
            };

			}
		
	} catch (e) {

	}
	return null;
}
// 优化后的获取云存储服务器接口，根据云存储类型和isp获取stream服务相关信息，指针对播放页面
function getCloudServerInfoNew(cloudFileInfoObj,callback) {
    var streamServerInfo;
    $.ajax({
        type : "POST",
        data:{fileIds:cloudFileInfoObj.fileId},
        async: false,
        url : basePath + "/service/cloudService!searchByFileIds.action",
        success : function(data, textStatus, jqXHR) {
            var resultCode = data.resultCode;
            switch (resultCode) {
                case '0' :
                    var len = data.files.length;
                    if(len==0){
                        window.console && window.console.log("获取stream服务器信息失败！");
                    }else{
                        var fileInfo = data.files[0];
                            if (streamServer && !$.isEmptyObject(streamServer) && fileInfo.cloud_type > 0) {
                                var serverInfo = streamServer['s' + fileInfo.cloud_type];
                                var port = serverInfo['port'];
                                var ip = serverInfo['domain'];
                                window.console && console.log("*************************"+{
                                    "CloudServerIp" : ip,
                                    "CloudServerPort" : port
                                });
                                cloudFileInfoObj.CloudServerIp = ip;
                                cloudFileInfoObj.CloudServerPort = port;
                                cloudFileInfoObj.checkSum =fileInfo.key_checksum;
                                cloudFileInfoObj.fileType =fileInfo.file_type;
                                callback(cloudFileInfoObj);
                            }
                        }
                    break;
                default :
                    window.console && window.console.log("获取stream服务器信息失败！");
           }
         }
    });
}
define(function(){});