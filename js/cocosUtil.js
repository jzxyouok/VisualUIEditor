var fs = require('fs');

cocosGetItemByUUID = function(node, uuid) {
    if(!uuid) {
        return null;
    }
    function recursiveGetChild(node, uuid) {
        if (node.uuid == uuid) {
            return node;
        }
        var children = node.getChildren();
        for(var i = 0; i < children.length; i++) {
            let subNode = recursiveGetChild(children[i], uuid);
            if(subNode) {
                return subNode;
            }
        }
        return null;
    }
    return recursiveGetChild(node, uuid);
}

function isBaseTypeByName(name) {
    if(name == "LabelTTF" || name == "Slider" || name == "Sprite"
       || name == "Scale9" || name == "Input" || name == "Button" || name == "CheckBox") {
        return true;
    }
    if(startWith(name, "SubPath:")) {
        return true;
    }
    return false;
}

function isBaseType(node) {
    if(node._path != null) {
        return true
    }
    let name = node._className;
    return isBaseTypeByName(name);
}

function setNodeSpriteFrame(path, value, node, fn) {
    if(!value)
        return;
    let url = getFullPathForName(value);
    let exist = checkTextureExist(url);
    if(!exist) {
        return;
    }
    let newPath = "_" + path;
    node[newPath] = value;
    fn.call(node, url);
}

function cocosExportNodeData(node, ext) {
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
        node.left && (data["left"] = fixFloatValue(node.left));
        node.right && (data["right"] = fixFloatValue(node.right));
    } else {
        data["x"] = fixFloatValue(node.x);
    }

    if(node.top || node.bottom) {
        node.top && (data["top"] = fixFloatValue(node.top));
        node.bottom && (data["bottom"] = fixFloatValue(node.bottom));
    } else {
        data["y"] = fixFloatValue(node.y);
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

    if(node._touchEnabled == false) {
        data["touchEnabled"] = node._touchEnabled;
    }

    if(node.touchListener) {
        data["touchListener"] = node.touchListener;
    }

    //适用于删除及添加的撤消操作
    if(ext && ext.uuid) {
        data["uuid"] = node.uuid;
    }

    (!node.isVisible()) && (data["visible"] = node.isVisible());

    if(startWith(node._className, "SubPath")) {
        data["path"] = node._path;
    }
    //Label prop
    else if(node._className == "LabelTTF") {
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
        value = node._edFontName;
        (value.length > 0) && (data["fontName"] = value);
        value = node._edFontSize;
        (value != 14) && (data["fontSize"] = value);
        value = node._textColor;
        (!cc.colorEqual(value, cc.color.BLACK)) && (data["fontColor"] = [value.r, value.g, value.b, value.a]);
        (node.inputFlag != cc.EDITBOX_INPUT_FLAG_SENSITIVE) && (data["inputFlag"] = node.inputFlag);
        (node.inputMode != cc.EDITBOX_INPUT_MODE_ANY) && (data["inputMode"] = node.inputMode);
        (node.returnType != cc.KEYBOARD_RETURNTYPE_DEFAULT) && (data["returnType"] = node.returnType);
        (node.maxLength != 50) && (data["maxLength"] = node.maxLength);
        (node.placeHolder && node.placeHolder.length > 0) && (data["placeHolder"] = node.placeHolder);
        value = node._placeholderFontName;
        (value.length > 0) && (data["placeHolderFontName"] = value);
        value = node._placeholderFontSize;
        (value != 14) && (data["placeholderFontSize"] = value);
        value = node._placeholderColor || cc.color.GRAY;
        (!cc.colorEqual(value, cc.color.GRAY)) && (data["placeholderFontColor"] = [value.r, value.g, value.b, value.a]);
        value = node._spriteBg;
        (value && value.length > 0) && (data["spriteBg"] = value);
    } else if(node._className == "Slider") {
        (node.percent) && (data["percent"] = node.percent);
        (node._barBg) && (data["barBg"] = node._barBg);
        (node._barProgress) && (data["barProgress"] = node._barProgress);
        (node._barNormalBall) && (data["barNormalBall"] = node._barNormalBall);
        (node._barSelectBall) && (data["barSelectBall"] = node._barSelectBall);
        (node._barDisableBall) && (data["barDisableBall"] = node._barDisableBall);
    } else if(node._className == "Button") {
        (node._bgNormal) && (data["bgNormal"] = node._bgNormal);
        (node._bgSelect) && (data["bgSelect"] = node._bgSelect);
        (node._bgDisable) && (data["bgDisable"] = node._bgDisable);
        (node.getTitleText().length > 0) && (data["titleText"] = node.getTitleText());
        (node.getTitleFontName().length > 0) && (data["fontName"] = node.getTitleFontName());
        (node.getTitleFontSize() > 0) && (data["fontSize"] = node.getTitleFontSize());
        if(!cc.colorEqual(node.getTitleColor(), cc.color.WHITE)) {
            let color = node.getTitleColor();
            data["fontColor"] = [color.r, color.g, color.b, color.a];
        }
    } else if(node._className == "CheckBox") {
        (node._back) && (data["back"] = node._back);
        (node._backSelect) && (data["backSelect"] = node._backSelect);
        (node._active) && (data["active"] = node._active);
        (node._backDisable) && (data["backDisable"] = node._backDisable);
        (node._activeDisable) && (data["activeDisable"] = node._activeDisable);

        data["select"] = node.isSelected();
        data["enable"] = node.isTouchEnabled();
    } else if(node._className == "Layout") {
        (node._backGroundImageFileName && node._backGroundImageFileName.length > 0) && (data["bkImg"] = node._backGroundImageFileName);
        (node._backGroundScale9Enabled) && (node["bkScaleEnable"] = node._backGroundScale9Enabled);
        let backgroupColorType = node.getBackGroundColorType();
        if(backgroupColorType != ccui.Layout.BG_COLOR_NONE) {
            data["bkColorType"] = backgroupColorType;
            if(backgroupColorType == ccui.Layout.BG_COLOR_SOLID) {
                let color = node.getBackGroundColor();
                data["bkColor"] = [color.r, color.g, color.b, color.a];
            } else if(backgroupColorType == ccui.Layout.BG_COLOR_GRADIENT) {
                let color = node.getBackGroundStartColor();
                data["bkStartColor"] = [color.r, color.g, color.b, color.a];
                color = node.getBackGroundEndColor();
                data["bkEndColor"] = [color.r, color.g, color.b, color.a];
            }
        }

       data["layoutType"] = node.layoutType;
       if(node.clippingEnabled) {
           data["clippingEnabled"] = node.clippingEnabled;
           data["clippingType"] = node.clippingType;
       }

    }

    if(!isBaseType(node)) {
        let childrenData = [];
        let children = node.getChildren();
        for(var i = 0; i < children.length; i++) {
            childrenData.push(cocosExportNodeData(children[i], ext));
        }

        if(childrenData.length > 0) {
            data["children"] = childrenData;
        }
    }
    

    return data;
}

function saveSceneToFile(filename, scene, ext) {
    let data = cocosExportNodeData(scene, ext);
    fs.writeFileSync(filename, JSON.stringify(data, null, 4));
}

function covertToColor(value) {
    if(!value || !value[0] || !value[3]) {
        return null;
    }
    return new cc.color(value[0], value[1], value[2], value[3]);
}

function checkPathRepeat(node, path) {
    let parent = node
    while(parent) {
        if(path == parent._path || path == parent._sceneSubPath) {
            return true
        }
        parent = parent.getParent()
    }
    return false
}

function cocosGenNodeByData(data, parent, isSetParent) {
    if(!data) {
        return;
    }
    let node = null;
    if(isSetParent) {
        node = parent;
    } else if(data.path) {
        node = new cc.Node();
        node._path = data.path;
        if(checkPathRepeat(parent, data.path)) {
            return null;
        }
        cocosGenNodeByData(getPathData(data.path), node, true)
        node._className = "SubPath:" + data.path;
    } else if(data.type == "Scene" || !parent) {
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
        node = new cc.EditBox(cc.size(100, 20), new cc.Scale9Sprite());
        node._className = data.type;
    } else if(data.type == "Slider") {
        node = new ccui.Slider();
        node._className = data.type;
    } else if(data.type == "Button") {
        node = new ccui.Button();
        node._className = data.type;
    } else if(data.type == "CheckBox") {
        node = new ccui.CheckBox();
        node._className = data.type;
    } else if(data.type == "Layout") {
        node = new ccui.Layout();
        node._className = "Layout";
    } else {
        node = new cc.Node();
        node._className = "Node";
    }
    node._name = "";

    node.uuid = data.uuid || gen_uuid();

    (data.id) && (node._name = data.id);
    if(!isNull(data.width) || !isNull(data.height)) {
        let setFn = node.setPreferredSize ? node.setPreferredSize : node.setContentSize;
        let width = !isNull(data.width) ? parseFloat(data.width) : node.width;
        let height = !isNull(data.height) ? parseFloat(data.height) : node.height;
        setFn.call(node, width, height);
    }
    // (!isNull(data.width)) && (node.width = parseFloat(data.width));
    // (!isNull(data.height)) && (node.height = parseFloat(data.height));
    (!isNull(data.x)) && (node.x = parseFloat(data.x));
    (!isNull(data.y)) && (node.y = parseFloat(data.y));

    (!isNull(data.left)) && (node.x = parseFloat(data.left), node.left = data.left);
    (!isNull(data.right) && parent) && (node.x = parent.width - parseFloat(data.right), node.right = data.right );

    (!isNull(data.bottom)) && (node.y = parseFloat(data.bottom), node.bottom = data.bottom );
    (!isNull(data.top) && parent) && (node.y = parent.height - parseFloat(data.top), node.top = data.top );

    (!isNull(data.anchorX)) && (node.anchorX = parseFloat(data.anchorX));
    (!isNull(data.anchorY)) && (node.anchorY = parseFloat(data.anchorY));

    (!isNull(data.scaleX)) && (node.scaleX = parseFloat(data.scaleX));
    (!isNull(data.scaleY)) && (node.scaleY = parseFloat(data.scaleY));

    (!isNull(data.opacity)) && (node.opacity = parseFloat(data.opacity));
    (!isNull(data.rotation)) && (node.rotation = parseFloat(data.rotation));

    (!isNull(data.visible)) && node.setVisible(data.visible);

    (covertToColor(data.color)) && (node.color = covertToColor(data.color));

    (!isNull(data.touchEnabled)) && (node._touchEnabled = data.touchEnabled);
    (!isNull(data.touchListener)) && (node.touchListener = data.touchListener);

    if(data.type == "LabelTTF") {
        data.string && (node.string = data.string);
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
        data.placeHolder && (node.placeHolder = data.placeHolder);
        data.placeHolderFontName && (node.placeHolderFontName = data.placeHolderFontName);
        data.placeHolderFontSize && (node.placeHolderFontSize = data.placeHolderFontSize);
        (covertToColor(data.placeholderFontColor)) && (node.placeholderFontColor = covertToColor(data.placeholderFontColor));
        data.inputFlag && (node.inputFlag = data.inputFlag);
        data.inputMode && (node.inputMode = data.inputMode);
        data.returnType && (node.returnType = data.returnType);

        if(data.spriteBg && getFullPathForName(data.spriteBg)) {
            let fullpath = getFullPathForName(data.spriteBg);
            node.initWithBackgroundSprite(new cc.Scale9Sprite(fullpath));
            node._spriteBg = data.spriteBg;
        }

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
    } else if(data.type == "Slider") {
        (data["percent"]) && (node.percent = data["percent"]);
        setNodeSpriteFrame("barBg", data["barBg"], node, node.loadBarTexture);
        setNodeSpriteFrame("barProgress", data["barProgress"], node, node.loadProgressBarTexture);
        setNodeSpriteFrame("barNormalBall", data["barNormalBall"], node, node.loadSlidBallTextureNormal);
        setNodeSpriteFrame("barSelectBall", data["barSelectBall"], node, node.loadSlidBallTexturePressed);
        setNodeSpriteFrame("barDisableBall", data["barDisableBall"], node, node.loadSlidBallTextureDisabled);
    } else if(data.type == "Button") {
        (data["percent"]) && (node.percent = data["percent"]);
        setNodeSpriteFrame("bgNormal", data["bgNormal"], node, node.loadTextureNormal);
        setNodeSpriteFrame("bgSelect", data["bgSelect"], node, node.loadTexturePressed);
        setNodeSpriteFrame("bgDisable", data["bgDisable"], node, node.loadTextureDisabled);
        
        (data["titleText"]) && (node.setTitleText(data["titleText"]));
        (data["fontName"]) && (node.setTitleFontName(data["fontName"]));
        (data["fontSize"]) && (node.setTitleFontSize(data["fontSize"]));
        (data["fontColor"]) && (node.setTitleColor(covertToColor(data["fontColor"])));
    } else if(node._className == "CheckBox") {
        setNodeSpriteFrame("back", data["back"], node, node.loadTextureBackGround);
        setNodeSpriteFrame("backSelect", data["backSelect"], node, node.loadTextureBackGroundSelected);
        setNodeSpriteFrame("active", data["active"], node, node.loadTextureFrontCross);
        setNodeSpriteFrame("backDisable", data["backDisable"], node, node.loadTextureBackGroundDisabled);
        setNodeSpriteFrame("activeDisable", data["activeDisable"], node, node.loadTextureFrontCrossDisabled);

        (data["select"]) && (node.setSelected(data["select"]));
        // (data["enable"]) && (node.setTouchEnabled(data["enable"]));
    } else if(node._className == "Layout") {
        setNodeSpriteFrame("backGroundImageFileName", data["bkImg"], node, node.setBackGroundImage);
        (data["bkScaleEnable"]) && (node.setBackGroundImageScale9Enabled(data["bkScaleEnable"]));
        
        (data["bkColorType"]) && (node.setBackGroundColorType(data["bkColorType"]));
        (covertToColor(data.bkColor)) && (node.setBackGroundColor(covertToColor(data.bkColor)));
        if(covertToColor(data.bkStartColor) && covertToColor(data.bkEndColor)) {
            node.setBackGroundColor(covertToColor(data.bkStartColor), covertToColor(data.bkEndColor));
        }

        (data["layoutType"]) && (node.setLayoutType(data["layoutType"]));
        (data["clippingEnabled"]) && (node.setClippingEnabled(data["clippingEnabled"]));
        (data["clippingType"]) && (node.setClippingType(data["clippingType"]));

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

function getPathData(path) {
    if(!path || !getFullPathForName(path)) {
        return JSON.parse("{}");
    }
    let content = fs.readFileSync(getFullPathForName(path));
    return JSON.parse(content || "{}");
}

function loadSceneFromFile(filename) {
    let content = fs.readFileSync(filename);
    let data = JSON.parse(content || "{}");
    data._sceneSubPath = calcRelativePath(window.projectFolder, filename)
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

function createEmptyNodeByType(data) {
    var node = null;
    if(data == "Sprite") {
        let value = "res/default/Sprite.png";
        node = new cc.Sprite(getFullPathForName(value) );
        node._spriteFrame = value
        node._className = "Sprite";
    } else if(data == "LabelTTF") {
        node = new cc.LabelTTF("VisualUI", "Arial", 20);
    } else if(data == "Scale9") {
        let value = "res/default/Scale9.png";
        node = new cc.Scale9Sprite(value);
        node._spriteFrame = value
        node._className = "Scale9";
    } else if(data == "Input") {
        let value = "res/default/shurukuang.png";
        node = new cc.EditBox(cc.size(100, 20), new cc.Scale9Sprite(value));
        node.placeHolder = "VisualUI";
        node.placeholderFontName = "Arial";
        node.placeholderFontColor = cc.Color.GRAY;
        node._className = "Input";
        node._spriteBg = value;
    } else if(data == "Slider") {
        let back = "res/default/SliderBack.png";
        let normalBall = "res/default/SliderNodeNormal.png";
        let barProgress = "res/default/SliderBar.png";
        node = new ccui.Slider(back, normalBall);
        node._barBg = back;
        node._barNormalBall = normalBall;

        setNodeSpriteFrame("barProgress", barProgress, node, node.loadProgressBarTexture)
        node._className = "Slider";
    } else if(data == "Button") {
        let normal = "res/default/ButtonNormal.png";
        let select = "res/default/ButtonSelect.png";
        let disable = "res/default/ButtonDisable.png";
        node = new ccui.Button(normal, select, disable);
        node._className = "Button";
        node._bgNormal = normal;
        node._bgSelect = select;
        node._bgDisable = disable;
    } else if(data == "Node") {
        node = new cc.Node();
        node.setContentSize(cc.size(40, 40));
        node._className = "Node";
    } else if(data == "CheckBox") {
        let back = "res/default/CheckBoxNormal.png";
        let backSelect = "res/default/CheckBoxSelect.png";
        let active = "res/default/CheckBoxNodeNormal.png";
        let backDisable = "res/default/CheckBoxDisable.png";
        let activeDisable = "res/default/CheckBoxNodeDisable.png";
        node = new ccui.CheckBox(back, backSelect, active, backDisable, activeDisable);
        node._back = back;
        node._backSelect = backSelect;
        node._active = active;
        node._backDisable = backDisable;
        node._activeDisable = activeDisable;
        node.setSelected(true);
        node._className = "CheckBox";
    } else if(data == "Layout") {
        node = new ccui.Layout();
        node.setBackGroundColorType(1);
        node.setContentSize(cc.size(100, 100));
        node._className = "Layout";
    }
    node._name = "";
    return node;
}

function getRootNode(node) {
    let root = node;
    while(root.getParent()) {
        root = root.getParent();
    }
    return root;
}