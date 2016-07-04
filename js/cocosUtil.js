var fs = require('fs');

function isBaseType(node) {
    let name = node._className;
    if(name == "Label" || name == "Slider" || name == "Sprite" || name == "Scale9" || name == "Input" || name == "Button") {
        return true;
    }
    return false;
}

function cocosExportNodeData(node) {
    let data = {};
    let parent = node.getParent();
    if(node.isWidthPer && parent) {
        let ratio = node.width / parent.width * 100;
        data["width"] = ratio.toFixed(1) + "%";
    } else {
        data["width"] = node.width.toFixed(0);
    }

    if(node.isHeightPer && parent) {
        let ratio = node.height / parent.height * 100;
        data["height"] = ratio.toFixed(1) + "%";
    } else {
        data["height"] = node.height.toFixed(0);
    }

    if(node.left || node.right) {
        node.left && (data["left"] = node.left.toFixed(0));
        node.right && (data["right"] = node.right.toFixed(0));
    } else {
        data["x"] = node.x;
    }

    if(node.top || node.bottom) {
        node.top && (data["top"] = node.top.toFixed(0));
        node.bottom && (data["bottom"] = node.bottom.toFixed(0));
    } else {
        data["y"] = node.y;
    }

    if(node._name.length > 0) {
        data["id"] = node._name;
    }
    data["type"] = node._className;
    if(!node.color.equals(cc.Color.WHITE)) {
        data["color"] = [node.color.r, node.color.g, node.color.b, node.color.a];
    }

    if(node.scaleX != 1.0) {
        data["scaleX"] = node.scaleX;
    }

    if(node.scaleY != 1.0) {
        data["scaleY"] = node.scaleY;
    }

    if(node.rotation != 0) {
        data["rotation"] = node.rotation;
    }

    if(node.opacity != 255) {
        data["opacity"] = node.opacity;
    }

    if(node.anchorX != 0.5) {
        data["anchorX"] = node.anchorX; 
    }

    if(node.anchorY != 0.5) {
        data["anchorY"] = node.anchorY; 
    }

    //Label prop
    if(node._className == "LabelTTF") {
        data["string"] = node.string;
        if(node.textAlign != cc.TextAlignment.LEFT) {
            data["textAlign"] = node.textAlign;
        }
        if(node.verticalAlign != cc.VerticalTextAlignment.TOP) {
            data["verticalAlign"] = node.verticalAlign;
        }
        data["fontSize"] = node.fontSize;
        if(node.fontName.length > 0) {
            data["fontName"] = node.fontName;
        }

        if(!node.fillStyle.equals(cc.Color.WHITE)) {
            data["fillStyle"] = [node.fillStyle.r, node.fillStyle.g, node.fillStyle.b, node.fillStyle.a];
        }
        if(!node.strokeStyle.equals(cc.Color.WHITE)) {
            data["strokeStyle"] = [node.strokeStyle.r, node.strokeStyle.g, node.strokeStyle.b, node.strokeStyle.a];
        }
        if(node.lineWidth > 0) {
            data["lineWidth"] = node.lineWidth;
        }
        if(node.shadowOffsetX > 0) {
            data["shadowOffsetX"] = node.shadowOffsetX;
        }
        if(node.shadowOffsetY > 0) {
            data["shadowOffsetY"] = node.shadowOffsetY;
        }
        if(node.shadowOpacity > 0) {
            data["shadowOpacity"] = node.shadowOpacity;
        }
        if(node.shadowBlur > 0) {
            data["shadowBlur"] = node.shadowBlur;
        }
    } else if(node._className == "Sprite") {

    } else if(node._className == "Scale9") {

    } else if(node._className == "Input") {
        (node.string.length > 0) && (data["string"] = node.string);
        // (node.fontName.length > 0) && (data["fontName"] = node.fontName);
        // (node.fontSize > 0) && (data["fontSize"] = node.fontSize);
        // (!node.fontColor.equals(cc.Color.BLACK)) && (data["fontColor"] = [node.fontColor.r, node.fontColor.g, node.fontColor.b, node.fontColor.a]);
        (node.inputFlag != _ccsg.EditBox.InputFlag.SENSITIVE) && (data["inputFlag"] = node.inputFlag);
        (node.inputMode != _ccsg.EditBox.InputMode.ANY) && (data["inputMode"] = node.inputMode);
        (node.returnType != _ccsg.EditBox.KeyboardReturnType.DEFAULT) && (data["returnType"] = node.returnType);
        (node.maxLength != 50) && (data["maxLength"] = node.maxLength);
        // (node.placeHolder.length > 0) && (data["placeHolder"] = node.placeHolder);
        // (node.placeHolderFontName.length > 0) && (data["placeHolderFontName"] = node.placeHolderFontName);
        // (node.placeholderFontSize > 0) && (data["placeholderFontSize"] = node.placeholderFontSize);
        // (!node.placeholderFontColor.equals(cc.Color.GRAY)) && (data["placeholderFontColor"] = [node.placeholderFontColor.r, node.placeholderFontColor.g, node.placeholderFontColor.b, node.placeholderFontColor.a]);
    } else if(node._className == "Slider") {
        
    } else if(node._className == "Button") {
        
    }
    
            // this.string,
            // this.fontName,
            // this.fontSize,
            // this.fontColor,
            // this.inputFlag,
            // this.inputMode,
            // this.returnType,
            // this.maxLength,
            // this.placeHolderString,
            // this.placeHolderFontName,
            // this.placeHolderFontSize,
            // this.placeHolderFontColor,
            
    if(!isBaseType(node)) {
        let childrenData = [];
        let children = node.getChildren();
        for(var i = 0; i < children.length; i++) {
            childrenData.push(cocosExportNodeData(children[i]));
        }

        if(childrenData.length > 0) {
            data["children"] = childrenData;
        }
    }
    

    return data;
}

function saveSceneToFile(filename, scene) {
    let data = cocosExportNodeData(scene);
    fs.writeFileSync(filename, JSON.stringify(data, null, 4));
}

function cocosGenNodeByData(data, parent) {
    let node = null;
    if(data.type == "Scene") {
        node = new _ccsg.Scene();
    } else if(data.type == "Sprite") {
        node = new _ccsg.Sprite("res/grid.png");
    } else if(data.type == "LabelTTF") {
        node = new cc.LabelTTF("11111");
    } else {
        node = new _ccsg.Node();
    }

    node.uuid = gen_uuid();

    data.width && (node.width = parseFloat(data.width));
    data.height && (node.height = parseFloat(data.height));
    data.x && (node.x = parseFloat(data.x));
    data.y && (node.y = parseFloat(data.y));

    data.anchorX && (node.anchorX = parseFloat(data.anchorX));
    data.anchorY && (node.anchorY = parseFloat(data.anchorY));

    data.scaleX && (node.scaleX = parseFloat(data.scaleX));
    data.scaleY && (node.scaleY = parseFloat(data.scaleY));

    data.opacity && (node.opacity = parseFloat(data.opacity));
    data.rotation && (node.rotation = parseFloat(data.rotation));

    if(data.type == "LabelTTF") {
        data.string && (node.string = data.string);
        data.textAlign && (node.textAlign = data.textAlign);
        data.textAlign && (node.textAlign = data.textAlign);
        data.verticalAlign && (node.verticalAlign = data.verticalAlign);
        data.fontSize && (node.fontSize = data.fontSize);
        data.fontName && (node.fontName = data.fontName);
    }

    data.children = data.children || [];
    for(var i = 0; i < data.children.length; i++) {
        let child = cocosGenNodeByData(data.children[i], node);
        if(node) {
            node.addChild(child);
        }
    } 

    return node;
}

function loadSceneFromFile(filename) {
    let content = fs.readFileSync(filename);
    let data = JSON.parse(content || "");
    return cocosGenNodeByData(data, null);
}