var fs = require('fs')

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
      if(depth > 3) {
          return result;
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


function getFileName(path) {
    var result = path;
    var index = 0;
    for(var i = path.length - 1; i >= 0; i--) {
        if(path.charAt(i) == '\\' || path.charAt(i) == '/') {
            index = Math.min(i + 1, path.length - 1);
            break;
        }
    }
    return path.substring(index);
}
 
//遍历文件夹，获取所有文件夹里面的文件信息
/*
 * @param path 路径
 *
 */
 
function geFileList(path, filter)
{
    var filesList = [];
    var childList = [];
    filesList.push({
        name: getFileName(path),
        isDirectory: true,
        children: childList,
        path: path,
    });
    readFile(path,childList, filter)
    return filesList;
}
 
//遍历读取文件
function readFile(path,filesList, filter)
{
    files = fs.readdirSync(path);//需要用到同步读取
    files.forEach(walk);
    function walk(file)
    { 
        if(filter && filter(file)) {
            return;
        }
        states = fs.statSync(path+'/'+file);   
        if(states.isDirectory())
        {

            var childList = [];
            readFile(path+'/'+file, childList, filter);
            filesList.push({
                name: file,
                isDirectory: true,
                children: childList,
                path: path + "/" + file,
            })
        }
        else
        {
            filesList.push({
                name: file,
                isDirectory: false,
                path: path + "/" + file,
            })
        }  
    }
}
 

