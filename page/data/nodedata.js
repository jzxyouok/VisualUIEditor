
function NodeData(node) {
    this._node = node;
}

function SpriteData(node) {
    this._node = node;
}

function LabelData(node) {
    this._node = node;
}

function WidgetData(node) {
    this._node = node;
}

function FixNodeHor(node, step) {
    node.x += step;
    if(node.left) {
        node.left += step; 
    }
    if(node.right) {
        node.right -= step;
    } 
}

function FixNodeVer(node, step) {
    node.y += step;
    if(node.top) {
        node.top -= step; 
    }
    if(node.bottom) {
        node.right += step;
    }
}

function NodePropChange(node, prop, newValue) {
    if(prop == "x") {
        let step = newValue - node[prop];
        FixNodeHor(node, step);
    } else if(prop == "y") {
        let step = newValue - node[prop];
        FixNodeVer(node, step);
    } else {
        node[prop] = newValue;
    }
}

NodeData.prototype = {
    get uuid() {
        return this._node.uuid;
    },
    get position() {
        let t = typeof this._node.x;
        return {
            path: "position",
            type: "vec2",
            name: "Position",
            attrs: {
                min: 1,
                max: 100,
            },
            value: {
                x: this._node.getPositionX(),
                y: this._node.getPositionY(),
            }
        }
    },

    get rotation() {
        return {
            path: "rotation",
            type: "Number",
            name: "Rotation",
            attrs: {
                min: 0,
                max: 360,
            },
            value: this._node.getRotation()
        }
    },

    get scale() {
        return {
            path: "scale",
            type: "vec2",
            name: "Scale",
            attrs: {
                min: 0,
                max: 360,
            },
            value: {
                x: this._node.getScaleX(),
                y: this._node.getScaleY(),
            }
        }
    },

    get anchor() {
        return {
            path: "anchor",
            type: "vec2",
            name: "Anchor",
            attrs: {
                min: 0,
                max: 360,
            },
            value: {
                x: this._node.anchorX,
                y: this._node.anchorY,
            }
        }
    },

    get size() {
        let parent = this._node.getParent();
        let heightPer = 100;
        let widthPer = 100;
        if(parent && parent.width) {
            widthPer = this._node.width / parent.width * 100;
        }
        if(parent && parent.height) {
            heightPer = this._node.height / parent.height * 100;
        }
        return {
            path: "size",
            type: "size",
            name: "Size",
            attrs: {
                hasParent : parent != null,
                min: 0,
                max: 360,
            },
            value: {
                isWidthPer: this._node.isWidthPer,
                width: this._node.width,
                widthPer: widthPer,
                isHeightPer: this._node.isHeightPer,
                height: this._node.height,
                heightPer: heightPer,
            }
        }
    },


    get opacity() {
        return {
            path: "opacity",
            type: "Number",
            name: "Opacity",
            attrs: {
                min: 0,
                max: 255,
            },
            value: this._node.opacity
        }
    },

    get skew() {
        return {
            path: "skew",
            type: "vec2",
            name: "Skew",
            attrs: {
                min: 0,
                max: 360,
            },
            value: {
                x: this._node.skewX,
                y: this._node.skewY,
            }
        }
    },

    get color() {
        return {
            path: "color",
            type: "color",
            name: "Color",
            attrs: {
                min: 0,
                max: 360,
            },
            value: {
                r: this._node.color.r,
                g: this._node.color.g,
                b: this._node.color.b,
                a: this._node.color.a
            }
        }
    },

    get __comps__() {

        if(this._node._className == "Node") {
            return [ new WidgetData(this._node) ];
        } else if(this._node._className == "Sprite") {
            return [ new SpriteData(this._node), new WidgetData(this._node) ];
        } else {
            return [ new WidgetData(this._node) ];
        }
        return [];
    },

    setAttrib(path, value) {
        if(path == "position.x") {
            this._node.x = value;
            this._node.left = null;
            this._node.right = null;
        } else if(path == "position.y") {
            this._node.y = value;
            this._node.top = null;
            this._node.bottom = null;
        } else if(path == "rotation") {
            this._node.rotation = value;
        } else if(path == "scale.x") {
            this._node.scaleX = value;
        } else if(path == "scale.y") {
            this._node.scaleY = value;
        } else if(path == "anchor.x") {
            this._node.anchorX = value;
        } else if(path == "anchor.y") {
            this._node.anchorY = value;
        } else if(path == "skew.x") {
            this._node.skewX = value;
        } else if(path == "skew.y") {
            this._node.skewY = value;
        } else if(path == "size.width") {
            this._node.width = value;
        } else if(path == "size.height") {
            this._node.height = value;
        } else if(path == "opacity") {
            this._node.opacity = value;
        } else if(path == "color") {
            this._node.color = new cc.Color(value.r, value.g, value.b, value.a);
        } else if(path == "size.isWidthPer") {
            this._node.isWidthPer = !this._node.isWidthPer;
        } else if(path == "size.isHeightPer") {
            this._node.isHeightPer = !this._node.isHeightPer;
        } else if(path == "size.widthPer") {
            let parent = this._node.getParent();
            if(parent && parent.width) {
                let val = value * parent.width / 100;
                this._node.width = parseFloat(val.toFixed(0));
            }
        } else if(path == "size.heightPer") {
            let parent = this._node.getParent();
            if(parent && parent.height) {
                let val = value * parent.height / 100;
                this._node.height = parseFloat(val.toFixed(0));
            }
        } else if(path == "relativePosition.checkTop") {
            if(!value) {
                this._node.top = null;
            }
        } else if(path == "relativePosition.checkLeft") {
            if(!value) {
                this._node.left = null;
            }
        } else if(path == "relativePosition.checkRight") {
            if(!value) {
                this._node.right = null;
            }
        } else if(path == "relativePosition.checkBottom") {
            if(!value) {
                this._node.bottom = null;
            }
        }
         else if(path == "relativePosition.top") {
            value = parseFloat(value);
            let parent = this._node.getParent();
            if(parent && parent.height) {
                this._node.y = parent.height - value;
                this._node.top = value;
            }
        } else if(path == "relativePosition.bottom") {
            value = parseFloat(value);
            this._node.y = value;
            this._node.bottom = value;
        } else if(path == "relativePosition.left") {
            value = parseFloat(value);
            this._node.x = value;
            this._node.left = value;
        } else if(path == "relativePosition.right") {
            value = parseFloat(value);
            let parent = this._node.getParent();
            if(parent && parent.width) {
                this._node.x = parent.width - value;
                this._node.right = value;
            }
        } else {
            return;
        }
        Editor.Ipc.sendToAll("ui:has_item_change", {});
    },
}

SpriteData.prototype = {
    __editor__ : {
        "inspector": "cc.Sprite",
    },
    __displayName__: "Sprite",

    __type__: "cc.Sprite",

    get type() {
        return {
            path: "type",
            type: "select",
            name: "Type",
            attrs: {
                min: 0,
                max: 360,
                selects: {
                    0: "SIMPLE",
                    1: "SLICED",
                    2: "TILED",
                    3: "FILLED"
                }
            },
            value: this._type,
        };
    },

    get trim() {
        return {
            path: "trim",
            type: "check",
            name: "Trim",
            attrs: {
                min: 0,
                max: 360,
            },
            value: this._node.trim,
        };
    }

}


WidgetData.prototype = {
    __editor__ : {
        "inspector": "cc.Widget",
    },
    __displayName__: "Widget",
    __type__: "cc.Widget",

    get isRelativePos() {
        return {
            path: "isRelativePos",
            type: "check",
            name: "RelativePos",
            attrs: {
            },
            value: this._node.isRelativePos || false,
        };
    },


    get folded() {
        return true;
    },

    get relativePosition() {
        return {
            path: "relativePosition",
            type: "vec2",
            name: "relativePosition",
            attrs: {
                min: 1,
                max: 100,
            },
            value: {
                isAlignLeft: "number" == typeof this._node.left,
                isAlignTop: "number" == typeof this._node.top,
                isAlignRight: "number" == typeof this._node.right,
                isAlignBottom: "number" == typeof this._node.bottom,
                left:this._node.left || 0,
                top:this._node.top || 0,
                right:this._node.right || 0,
                bottom:this._node.bottom || 0,
            }
        }
    },
}
        // <editor-prop title="Position" prop="{{target.position}}"></editor-prop>
        // <editor-prop title="Rotation" prop="{{target.rotation}}"></editor-prop>
        //  <!--<editor-prop title="Scale" prop="{{target.scale}}"></editor-prop>
        // <editor-prop title="Anchor" prop="{{target.anchor}}"></editor-prop>
        // <editor-prop title="Size" prop="{{target.size}}"></editor-prop>
        // <editor-prop title="Color" prop="{{target.color}}"></editor-prop>
        // <editor-prop title="Opacity" prop="{{target.opacity}}"></editor-prop>
        // <editor-prop title="Skew" prop="{{target.skew}}"></editor-prop>
            

//  * @property {Number}               x                   - x axis position of node
//  * @property {Number}               y                   - y axis position of node
//  * @property {Number}               width               - Width of node
//  * @property {Number}               height              - Height of node
//  * @property {Number}               anchorX             - Anchor point's position on x axis
//  * @property {Number}               anchorY             - Anchor point's position on y axis
//  * @property {Boolean}              ignoreAnchor        - Indicate whether ignore the anchor point property for positioning
//  * @property {Number}               skewX               - Skew x
//  * @property {Number}               skewY               - Skew y
//  * @property {Number}               zIndex              - Z order in depth which stands for the drawing order
//  * @property {Number}               vertexZ             - WebGL Z vertex of this node, z order works OK if all the nodes uses the same openGL Z vertex
//  * @property {Number}               rotation            - Rotation of node
//  * @property {Number}               rotationX           - Rotation on x axis
//  * @property {Number}               rotationY           - Rotation on y axis
//  * @property {Number}               scale               - Scale of node
//  * @property {Number}               scaleX              - Scale on x axis
//  * @property {Number}               scaleY              - Scale on y axis
//  * @property {Boolean}              visible             - Indicate whether node is visible or not
//  * @property {cc.Color}             color               - Color of node, default value is white: (255, 255, 255)
//  * @property {Boolean}              cascadeColor        - Indicate whether node's color value affect its child nodes, default value is false
//  * @property {Number}               opacity             - Opacity of node, default value is 255
//  * @property {Boolean}              opacityModifyRGB    - Indicate whether opacity affect the color value, default value is false
//  * @property {Boolean}              cascadeOpacity      - Indicate whether node's opacity value affect its child nodes, default value is false
//  * @property {Array}                children            - <@readonly> All children nodes
//  * @property {Number}               childrenCount       - <@readonly> Number of children
//  * @property {_ccsg.Node}           parent              - Parent node
//  * @property {Boolean}              running             - <@readonly> Indicate whether node is running or not
//  * @property {Number}               tag                 - Tag of node
//  * @property {Number}               arrivalOrder        - The arrival order, indicates which children is added previously
//  * @property {cc.ActionManager}     actionManager       - The CCActionManager object that is used by all actions.
//  * @property {cc.GLProgram}         shaderProgram       - The shader program currently used for this node
//  * @property {Number}               glServerState       - The state of OpenGL server side
//  * @property {cc.Scheduler}         scheduler           - cc.Scheduler used to schedule all "updates" and timers