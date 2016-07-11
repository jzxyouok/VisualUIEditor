const ipcRenderer = Electron.ipcRenderer;

function ChangeProjectFolder() {
    let newFolder = Electron.remote.dialog.showOpenDialog({properties: ['openFile', 'openDirectory']});
    if(newFolder) {
        window.projectFolder = newFolder[0];
        window.localStorage["projectFolder"] = newFolder[0];
        Editor.Ipc.sendToAll("ui:project_floder_change", {folder: newFolder[0]});
    }
}

ipcRenderer.on('ui:open-project-folder', (event, message, ...args) => {
    ChangeProjectFolder();
});

function applyFilterByTree(tree, filter) {
    filter = (filter || "").toLowerCase();
    function recursiveFilter(item, filter) {
        let show = false;
        if(!filter || filter.length == 0) {
            show = true;
        } else if(item.name.toLowerCase().indexOf(filter) >= 0) {
            show = true;
        }

        let children = Polymer.dom(item).children;
        for(var i = 0; i < children.length; i++) {
            let childShow = recursiveFilter(children[i], filter);
            show = show || childShow;
        }
        item.hidden = !show;
        return show;
    }
    let children = Polymer.dom(tree).children;
    for(var i = 0; i < children.length; i++) {
    	recursiveFilter(children[i], filter);
    }
}

function treeExpandAll(tree) {
    function recursiveExpand(item) {
        item.folded = false;
        let children = Polymer.dom(item).children;
        for(var i = 0; i < children.length; i++) {
            recursiveExpand(children[i]);
        }
    }
    let children = Polymer.dom(tree).children;
    for(var i = 0; i < children.length; i++) {
    	recursiveExpand(children[i]);
    }
}

function treeFoldedAll(tree) {
    function recursiveFolded(item) {
        item.folded = true;
        let children = Polymer.dom(item).children;
        for(var i = 0; i < children.length; i++) {
            recursiveFolded(children[i]);
        }
    }
    let children = Polymer.dom(tree).children;
    for(var i = 0; i < children.length; i++) {
    	recursiveFolded(children[i]);
    }
}

function calcRelativePath(parentPath, subPath) {
    parentPath = parentPath.replace(/\\/g, '/');
    subPath = subPath.replace(/\\/g, '/');
    let index = subPath.indexOf(parentPath);
    if(index < 0) {
        return subPath;
    }
    return subPath.substr(index + parentPath.length);
}

function checkTextureExist(url) {
    if(!url) {
        return false;
    }
    var tex = cc.textureCache.getTextureForKey(url);
    if (!tex) {
        tex = cc.textureCache.addImage(url);
        if(!tex) {
            return false;
        }
    }
    return true;
}

