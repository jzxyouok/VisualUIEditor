
let MenuUtil = {};

MenuUtil.createFileMenu = function() {
    return [
        {
            label: Editor.T('创建文件夹'),
            click () {
                Editor.log("create folder");
            }
        },
        { type: 'separator' },
        {
            label: Editor.T('创建Scene'),
            click () {
                Editor.log("create scene");
            }
        },
    ]
}

module.exports = MenuUtil;