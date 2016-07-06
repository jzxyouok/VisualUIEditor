
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
}

module.exports = MenuUtil;