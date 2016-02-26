define(function(require){
    require('./serial.css');
    require('validator');
    var _ = require('underscore');

    var ysDialog = require('dialog');
    var serial =  '<%=topPrompt%>\
                    <form id="serialForm" class="serial-form">\
                        <label class="left-side" for="validateCode"><%=labelTitle%>:</label>\
                        <input id="validateCode" name="validateCode" type="password" class="right-side" value="<%=value%>"/>\
                        <label for="validateCode" class="error"><%=promptText%></label>\
                        <label class="tip hide">&nbsp;</label>\
                    </form>';
    var tplSerial = _.template(serial);
    return {
        open:function(conf){
            ysDialog.win({
                content: tplSerial({
                    topPrompt: conf.topPrompt || '',
                    labelTitle: conf.labelText,//'设备验证码',
                    promptText: conf.promptText || '',
                    value: conf.value || ''
                }),
                width: 360,
                height: conf.height,
                maskAlpha:0.4,
                icoCls:conf.icoCls,
                title: conf.title,//'设备验证码',
                btn: [
                    ['确定', 'yes'],
                    ['取消', 'cancel']
                ],
                contentBind:conf.contentBind||function(){}
            },null,true);
            var valForm = $('#serialForm').validate({
                rules: {
                    validateCode: {
                        required: true
                    }
                },
                submitHandler:function(){
                    ysDialog.fire('yes');
                },
                success:function(){}
            });
            ysDialog.on('yes', function () {
                var auth = $.trim($("#validateCode").val());
                if (!valForm.form()) {
                    return false;
                } else {
                    if(conf.callback(auth) === false)
                        return false;
                }
                ysDialog.doHandler('yes');
            });

        },
        close:function(){
            ysDialog.close();
        }
    }
});