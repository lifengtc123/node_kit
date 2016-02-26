var handlers = {
  'lan-content': function(element, key, dictionary) {
      element.innerHTML = dictionary[key];
  },
  'lan-options': function(select, key, dictionary) {
      var options = dictionary[key];
      $.each(options,function(key){
        var optionData = options[key];
        var option = typeof optionData == 'string' ?
            new Option(optionData) :
            new Option(optionData[1], optionData[0]);
        select.appendChild(option);
      });
  },
  'lan-values': function(element, attributeAndKeys, dictionary) {
    var parts = attributeAndKeys.replace(/\s/g, '').split(/;/);
    var dataId;
    $.each(parts,function(n){
      if(parts[n].split(':')[0] == 'dataId'){
        dataId = parts[n].split(':')[1];
      }
    });
    $.each(parts,function(n) {
      if (!parts[n]){
        return;
      }
      var attributeAndKeyPair = parts[n].match(/^([^:]+):(.+)$/);
      if (!attributeAndKeyPair){
        throw new Error('malformed lan-values: ' + attributeAndKeys);
      }
      var propName = attributeAndKeyPair[1];
      var propExpr = attributeAndKeyPair[2];
      var value = dictionary[dataId][propExpr];
      if(propName != 'dataId'){
        element.setAttribute(propName, value);
      }
    });
  }
}
var lanInit = function(obj,dictionary){
  var elements = obj == '*' ? $(document).find(obj) : $(obj).find('*');
  for (var element, i = 0; element = elements[i]; i++) {
    for(var key in handlers){
      var attribute = element.getAttribute(key);
      if (attribute != null){
        handlers[key](element, attribute, languageData[dictionary]);
      }
    }
  }
}