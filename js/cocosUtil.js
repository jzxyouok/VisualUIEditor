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

    data["type"] = node._className;

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
    fs.writeFileSync(filename, JSON.stringify(data));
}