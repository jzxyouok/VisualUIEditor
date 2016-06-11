## DOM Event

### 'panel-show'

Emitted when panel show

### 'panel-hide'

Emitted when panel hide

### 'panel-resize'

Emitted when panel resize

### panel-cut

Emitted when panel cut

### panel-copy

Emitted when panel copy

### panel-paste

Emitted when panel paste

## Lifecycle Callback

### ready()

Invoked when panel frame loaded.

### run(argv)

Invoked when panel opened or panel show up by `Editor.Panel.open`.
The `argv` is an `Object` that you send through `Editor.Panel.open`.

### close()

Invoked before panel close or window close.
