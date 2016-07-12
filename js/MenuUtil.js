
let MenuUtil = {};

MenuUtil.createFileMenu = function() {
    return [
        {
            label: Editor.T('创建文件夹'),
            click () {
                Editor.Ipc.sendToAll('ui:create_folder');
            }
        },
        { type: 'separator' },
        {
            label: Editor.T('创建Scene'),
            click () {
                Editor.Ipc.sendToAll('ui:create_scene');
            }
        },
    ]
};

MenuUtil.createNodeMenu = function() {
    return [
        {
            label: Editor.T('创建空节点'),
            click () {
                Editor.Ipc.sendToAll('ui:create_render_node', "Node");
            }
        },
        { type: 'separator' },
        {
            label: Editor.T('创建Sprite(精灵)'),
            click () {
                Editor.Ipc.sendToAll('ui:create_render_node', "Sprite");
            }
        },
        {
            label: Editor.T('创建LabelTTF(文字)'),
            click () {
                Editor.Ipc.sendToAll('ui:create_render_node', "LabelTTF");
            }
        },
        {
            label: Editor.T('创建Scale9(九宫)'),
            click () {
                Editor.Ipc.sendToAll('ui:create_render_node', "Scale9");
            }
        },
        {
            label: Editor.T('创建EditBox(输入框)'),
            click () {
                Editor.Ipc.sendToAll('ui:create_render_node', "Input");
            }
        },
        {
            label: Editor.T('创建Slider(滑动条)'),
            click () {
                Editor.Ipc.sendToAll('ui:create_render_node', "Slider");
            }
        },
        {
            label: Editor.T('创建Button(按钮)'),
            click () {
                Editor.Ipc.sendToAll('ui:create_render_node', "Button");
            }
        },
        {
            label: Editor.T('创建CheckBox(选中框)'),
            click () {
                Editor.Ipc.sendToAll('ui:create_render_node', "CheckBox");
            }
        }
        
    ]
}


module.exports = MenuUtil;