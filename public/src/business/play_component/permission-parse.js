var USER_PERMISSION_REAL_PLAY = 1;
var USER_PERMISSION_REMOTE_REPLAY = 2;

function getSubUserPermissionState(permissionCode, type){
	 var res = -1;
     if (type === USER_PERMISSION_REAL_PLAY) {
         res = (permissionCode & type);
     } else if (type === USER_PERMISSION_REMOTE_REPLAY) {
         res = (permissionCode & type) >> 1;
     }
     return res;
}