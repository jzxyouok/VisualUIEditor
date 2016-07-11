var fs = require('fs');

function isBaseTypeByName(name) {
    if(name == "Label" || name == "Slider" || name == "Sprite" || name == "Scale9" || name == "Input" || name == "Button") {
        return true;
    }
    return false;
}

function isBaseType(node) {
    let name = node._className;
    return isBaseTypeByName(name);
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
    if(!cc.colorEqual(node.color, cc.color.WHITE)) {
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
        if(node.textAlign != cc.TEXT_ALIGNMENT_LEFT) {
            data["textAlign"] = node.textAlign;
        }
        if(node.verticalAlign != cc.VERTICAL_TEXT_ALIGNMENT_TOP) {
            data["verticalAlign"] = node.verticalAlign;
        }
        data["fontSize"] = node.fontSize;
        if(node.fontName.length > 0) {
            data["fontName"] = node.fontName;
        }

        if(!cc.colorEqual(node.fillStyle, cc.color.WHITE)) {
            data["fillStyle"] = [node.fillStyle.r, node.fillStyle.g, node.fillStyle.b, node.fillStyle.a];
        }
        if(!cc.colorEqual(node.strokeStyle, cc.color.WHITE)) {
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
        if(node._spriteFrame)
            data["spriteFrame"] = node._spriteFrame;

        let blendFunc = node.getBlendFunc();
        if(blendFunc.src != cc.BLEND_SRC) {
            data["blendSrc"] = blendFunc.src;
        }

        if(blendFunc.dst != cc.BLEND_DST) {
            data["blendDst"] = blendFunc.dst;
        }
    } else if(node._className == "Scale9") {
        if(node._spriteFrame)
            data["spriteFrame"] = node._spriteFrame;

        node.insetLeft && (data.insetLeft = node.insetLeft);
        node.insetTop && (data.insetTop = node.insetTop);
        node.insetRight && (data.insetRight = node.insetRight);
        node.insetBottom && (data.insetBottom = node.insetBottom);

        
    } else if(node._className == "Input") {
        (node.string.length > 0) && (data["string"] = node.string);
        let value = null;
        value = node._nativeControl._edFontName;
        (value.length > 0) && (data["fontName"] = value);
        value = node._nativeControl._edFontSize;
        (value != 14) && (data["fontSize"] = value);
        value = node._nativeControl._textLabel ? node._nativeControl._textLabel.color : cc.color.BLACK;
        (!cc.colorEqual(value, cc.color.BLACK)) && (data["fontColor"] = [value.r, value.g, value.b, value.a]);
        (node.inputFlag != cc.EditBox.InputFlag.SENSITIVE) && (data["inputFlag"] = node.inputFlag);
        (node.inputMode != cc.EditBox.InputMode.ANY) && (data["inputMode"] = node.inputMode);
        (node.returnType != cc.EditBox.KeyboardReturnType.DEFAULT) && (data["returnType"] = node.returnType);
        (node.maxLength != 50) && (data["maxLength"] = node.maxLength);
        (node.placeHolder && node.placeHolder.length > 0) && (data["placeHolder"] = node.placeHolder);
        value = node._placeholderFontName;
        (value.length > 0) && (data["placeHolderFontName"] = value);
        value = node._placeholderFontSize;
        (value != 14) && (data["placeholderFontSize"] = value);
        value = node._placeholderColor || cc.color.GRAY;
        (!cc.colorEqual(value, cc.color.GRAY)) && (data["placeholderFontColor"] = [value.r, value.g, value.b, value.a]);
    } else if(node._className == "Slider") {
        
    } else if(node._className == "Button") {
        
    }

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

function covertToColor(value) {
    if(!value || !value[0] || !value[3]) {
        return null;
    }
    return new cc.color(value[0], value[1], value[2], value[3]);
}

function cocosGenNodeByData(data, parent) {
    let node = null;
    if(data.type == "Scene" || !parent) {
        node = new cc.Scene();
        if(!parent) {
            node.width = 800;
            node.height = 400;
        }
    } else if(data.type == "Sprite") {
        node = new cc.Sprite();
        node._className = "Sprite";
    } else if(data.type == "Scale9") {
        node = new cc.Scale9Sprite();
        node._className = "Scale9";
    } else if(data.type == "LabelTTF") {
        node = new cc.LabelTTF("");
    } else if(data.type == "Input") {
        // node = new cc.EditBox(cc.size(100, 20), null);
        // node._className = data.type;
        node = new cc.Node();
    } else {
        node = new cc.Node();
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

    (covertToColor(data.color)) && (node.color = covertToColor(data.color));

    if(data.type == "LabelTTF") {
        data.string && (node.string = data.string);
        data.textAlign && (node.textAlign = data.textAlign);
        data.textAlign && (node.textAlign = data.textAlign);
        data.verticalAlign && (node.verticalAlign = data.verticalAlign);
        data.fontSize && (node.fontSize = data.fontSize);
        data.fontName && (node.fontName = data.fontName);
        (covertToColor(data.fillStyle)) && (node.fillStyle = covertToColor(data.fillStyle));
        (covertToColor(data.strokeStyle)) && (node.strokeStyle = covertToColor(data.strokeStyle));
    } else if(data.type == "Input") {
        data.string && (node.string = data.string);
        data.fontSize && (node.fontSize = data.fontSize);
        data.fontName && (node.fontName = data.fontName);
        (covertToColor(data.fontColor)) && (node.fontColor = covertToColor(data.fontColor));
        data.maxLength && (node.maxLength = data.maxLength);
        data.placeholder && (node.string = data.placeholder);
        data.placeholderFontName && (node.placeholderFontName = data.placeholderFontName);
        data.placeholderFontSize && (node.placeholderFontSize = data.placeholderFontSize);
        (covertToColor(data.placeholderFontColor)) && (node.placeholderFontColor = covertToColor(data.placeholderFontColor));
        data.inputFlag && (node.inputFlag = data.inputFlag);
        data.inputMode && (node.inputMode = data.inputMode);
        data.returnType && (node.returnType = data.returnType);
    } else if(data.type == "Sprite") {
        if(data.spriteFrame && getFullPathForName(data.spriteFrame)) {
            let fullpath = getFullPathForName(data.spriteFrame);
            node.init(fullpath);
            node._spriteFrame = data.spriteFrame;
        }
        data.blendSrc && (node.setBlendFunc(parseInt(data.blendSrc), node.getBlendFunc().dst));
        data.blendDst && (node.getBlendFunc().src, node.setBlendFunc(parseInt(data.blendDst)));
    } else if(data.type == "Scale9") {
        let size = node.getContentSize();

        if(data.spriteFrame && getFullPathForName(data.spriteFrame)) {
            let fullpath = getFullPathForName(data.spriteFrame);
            node.initWithFile(fullpath);
            node._spriteFrame = data.spriteFrame;
        }

        if(!cc.sizeEqualToSize(size, cc.size(0, 0))) {
            node.setPreferredSize(size);
        }

        data.insetLeft && (node.insetLeft = data.insetLeft);
        data.insetTop && (node.insetTop = data.insetTop);
        data.insetRight && (node.insetRight = data.insetRight);
        data.insetBottom && (node.insetBottom = data.insetBottom);
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

function getFullPathForName(name) {
    let url = window.projectFolder + "/" + name;
    if( fs.existsSync(url) ) {
        return url;
    }
    url = __dirname + "/" + name;
    if( fs.existsSync(url) ) {
        return url;
    }
    return null;
}