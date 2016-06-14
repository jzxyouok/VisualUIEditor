function gen_uuid() {
    var s = [];
    var hexDigits = "0123456789abcdef";
    for (var i = 0; i < 36; i++) {
        s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
    }
    s[14] = "4";  // bits 12-15 of the time_hi_and_version field to 0010
    s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
    s[8] = s[13] = s[18] = s[23] = "-";
 
    var uuid = s.join("");
    return uuid;
}

// function ergodic(obj,indentation){
//   var indent = "  " + indentation;
//   if(obj.constructor == Array || obj.constructor == Object){
 
//     for(var p in obj){
//       if(obj[p].constructor == Array|| obj[p].constructor == Object){
//         Editor.log(indent + "["+p+"] => "+typeof(obj)+"");
//         Editor.log(indent + "{");
//         ergodic(obj[p], indent);
//         Editor.log(indent + "}");
//       } else if (obj[p].constructor == String) {
//         Editor.log(indent + "["+p+"] => '"+obj[p]+"'");
//       } else {
//         Editor.log(indent + "["+p+"] => "+obj[p]+"");
//       }
//     }
//   }
// }
 
// function print_r(obj) {
//   Editor.log("{")
//   ergodic(obj, "");
//   Editor.log("}")
// }

function print_func(o) {
  var result = '';
  var type = typeof o;
  switch(type) {
    case 'string':
    case 'number':
    case 'boolean':
    case 'undefined':
        break;
    case 'function':
        result += o;
        break;
    case 'object':
    default:
      result += '[';
      for(var key in o) {
         if (typeof o[key] == "function") {
            result += key + ", ";
         }
      }
      result += ']';
  }
  Editor.log(result);
  return result;
}

function print_keys(o) {
  var result = '';
  var type = typeof o;
  switch(type) {
    case 'string':
    case 'number':
    case 'boolean':
    case 'undefined':
        break;
    case 'function':
        result += o;
        break;
    case 'object':
    default:
      result += '[';
      for(var key in o) {
        result += key + ", ";
      }
      result += ']';
  }
  Editor.log(result);
  return result;
}

function print_r(o, depth) {
      var result = '';
      depth || (depth=1);
      if (depth > 1) {
          return "";
      }
      var indent = new Array(4*depth+1).join(' ');
      var indentNext = new Array(4*(depth+1)+1).join(' ');
      var indentNextTwo = new Array(4*(depth+2)+1).join(' ');
      var tmp = '';
      var type = typeof o;
      switch(type) {
        case 'string':
        case 'number':
        case 'boolean':
        case 'undefined':
        case 'function':
          tmp += indent + indentNext + o + "\n";
          break;
        case 'object':
        default:
          for(var key in o) {
            tmp += indentNextTwo + '[' + key + '] = ';
            tmp += print_r(o[key], (depth+1));
          }
      }
      result += type + "\n";
      result += indentNext + '(' + "\n";
      result += tmp;
      result += indentNext + ')' + "\n";
      Editor.log(result)
      return result;
};