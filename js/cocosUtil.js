var fs = require('fs');


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

    let childrenData = [];
    let children = node.getChildren();
    for(var i = 0; i < children.length; i++) {
        childrenData.push(cocosExportNodeData(children[i]));
    }

    if(childrenData.length > 0) {
        data["children"] = childrenData;
    }

    return data;
}

function saveSceneToFile(filename, scene) {
    let data = cocosExportNodeData(scene);
    fs.writeFileSync(filename, JSON.stringify(data, null, 4));
}