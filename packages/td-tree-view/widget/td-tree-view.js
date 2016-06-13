(() => {
  'use strict';

  Editor.polymerElement({
    properties: {
      enableDrag: Boolean,
    },

    ready () {
      this._id2el = {};
      this._activeElement = null;
    },


    created: function() {
      Editor.log('Highlighting for ', 111, 'enabled!');
    },

    // messages: {
    // },
    
    _getLastChildRecursively ( childItem ) {
        if ( childItem.foldable && !childItem.folded ) {
        return _getLastChildRecursively ( Polymer.dom(childItem).lastElementChild );
        }
        return childItem;
    },

    _checkFoldable ( item ) {
        return Polymer.dom( ).childNodes.length > 0;
    },

    listeners: {
      scroll: 'handleScroll',
      'dom-change': 'trackElements'
    },
    handleScroll: function() {
      Editor.log("scroll!!!!!!!!!!!!");
      if (this.dragEl) {
        this.updateDragPosition();
      }
    },
    trackElements: function(e) {
      Editor.log("aaaaaaaaaaaaaaaa");

      this.listen(e, 'track', 'handleTrack');
      
    },
    updateDragPosition: function(dy) {
      this.trackDelta = dy || this.trackDelta || 0;
      var scrollDelta = this.scrollTop - this.startScrollTop;
      var pos = this.trackDelta + scrollDelta;
      this.translate3d(0, pos + 'px', 0, this.dragEl);
    },
    handleTrack: function(e) {
      Editor.log("handleTrack!!!!!!!!!!!!");
      switch (e.detail.state) {
        case 'start':
          // Capture initial state
          this.startScrollTop = this.scrollTop;
          this.dragEl = e.target;
          this.dragEl.style.pointerEvents = 'none';
          this.dragEl.classList.add('dragging');
          this.dragModel = this.repeater.modelForElement(this.dragEl);
          break;
        case 'track':
          // Re-position dragged item
          this.updateDragPosition(e.detail.dy);
          // Translate non-dragged items up/down
          var overEl = e.detail.hover();
          var overModel = overEl && this.repeater.modelForElement(overEl);
          if (overModel) {
            this.overModel = overModel;
            this.dirOffset = e.detail.ddy < 0 ? -1 : 0;
            var lastOverIndex = this.overIndex || 0;
            var overIndex = overModel.index + this.dirOffset;
            var start = Math.max(overIndex < lastOverIndex ? overIndex : lastOverIndex, 0);
            var end = overModel.index < lastOverIndex ? lastOverIndex : overModel.index;
            var children = Polymer.dom(this).children;
            for (var i=start; i<=end; i++) {
              var el = children[i];
              if (el != this.repeater && i !== this.dragModel.index) {
                var dir = 0;
                if (i > this.dragModel.index && i <= overIndex) {
                  dir = -1;
                } else if (i > overIndex && i < this.dragModel.index) {
                  dir = 1;
                }
                el.classList.add('moving');
                this.translate3d(0, dir * this.dragEl.offsetHeight + 'px', 0, el);
              }
            }
            this.overIndex = overModel.index;
          }
          break;
        case 'end':
          // Move item in array to new position
          var fromIdx = this.repeater.items.indexOf(this.dragModel.item);
          if (fromIdx >= 0 && this.overModel) {
            var toIdx = this.repeater.items.indexOf(this.overModel.item) +
              (this.overModel.index > this.dragModel.index ? this.dirOffset : 0);
            var item = this.repeater.splice('items', fromIdx, 1)[0];
            this.repeater.splice('items', toIdx, 0, item);
          }
          // Reset style of dragged & moved elements
          this.dragEl.style.pointerEvents = '';
          this.dragEl.classList.remove('dragging');
          this.dragEl = null;
          Polymer.dom(this).children.forEach(function(el) {
            this.transform('', el);
            el.classList.remove('moving');
          }, this);
          break;
      }
    },
    shift : function() {
        Editor.log("fkkkkkkkkkkkkkk!!!!!!!!!!!!!!!!");
    },

    addItem ( parentItem, childItem) {
      // print_func(childItem);

      var uuid = gen_uuid();
      childItem._uuid = uuid;
      Polymer.dom(parentItem).appendChild(childItem);
      if ( parentItem !== this ) {
        parentItem.foldable = true;
      }
      this.trackElements(childItem);
      // add to id table
      this._id2el[uuid] = childItem;
      return uuid;
    },

    removeItem ( childItem ) {
	  // children
	  let children = Polymer.dom(childItem).children;
	  for ( let i = 0; i < children.length; ++i ) {
	    removeItem(children[i]);
	  }
      let parentItem = Polymer.dom(childItem).parentNode;
      Polymer.dom(parentItem).removeChild(childItem);

      if ( parentItem !== this ) {
        parentItem.foldable = _checkFoldable(parentItem);
      }
      delete self._id2el[childItem._uuid];
    },

    removeItemById (id) {
      let el = this._id2el[id];
      if ( el ) {
        this.removeItem(el);
      }
    },

    setItemParent ( childItem, parentItem ) {
      if ( Editor.UI.PolymerUtils.isSelfOrAncient( parentItem, childItem ) ) {
        throw new Error('Failed to set item parent to its child');
      }

      let oldparentItem = Polymer.dom(childItem).parentNode;
      Polymer.dom(parentItem).appendChild(childItem);
      parentItem.foldable = _checkFoldable(parentItem);

      if ( oldparentItem !== this ) {
        oldparentItem.foldable = _checkFoldable(oldparentItem);
      }
    },

    setItemParentById (id, parentId) {
      let childItem = this._id2el[id];
      if ( !childItem ) {
        return;
      }

      let parentItem = parentId ? this._id2el[parentId] : this;
      if ( !parentItem ) {
        return;
      }
      this.setItemParent(childItem, parentItem);
    },

    nextItem ( curItem, skipChildren ) {
      let curItemDOM = Polymer.dom(curItem);
      if ( !skipChildren && curItem.foldable && !curItem.folded ) {
        return curItemDOM.firstElementChild;
      }

      if ( curItemDOM.nextElementSibling ) {
        return curItemDOM.nextElementSibling;
      }

      let parentItem = curItemDOM.parentNode;
      if ( parentItem === this ) {
        return null;
      }

      return this.nextItem(parentItem, true);
    },

    prevItem ( curItem ) {
      let curItemDOM = Polymer.dom(curItem);

      let prevSiblingEL = curItemDOM.previousSibling;
      if ( prevSiblingEL ) {
        if ( prevSiblingEL.foldable && !prevSiblingEL.folded ) {
          return _getLastChildRecursively (prevSiblingEL);
        }

        return prevSiblingEL;
      }

      let parentItem = curItemDOM.parentNode;
      if ( parentItem === this ) {
        return null;
      }

      return parentItem;
    },

    lastItem () {
      let lastChildEL = Polymer.dom(this).lastElementChild;
      if ( lastChildEL && lastChildEL.foldable && !lastChildEL.folded ) {
        return _getLastChildRecursively (lastChildEL);
      }
      return lastChildEL;
    },

    clear () {
      let thisDOM = Polymer.dom(this);
      while (thisDOM.firstChild) {
        thisDOM.removeChild(thisDOM.firstChild);
      }
      this._id2el = {};
    },

    expand ( id, expand ) {
      let childItem = this._id2el[id];
      let parentItem = Polymer.dom(childItem).parentNode;
      while ( parentItem ) {
        if ( parentItem === this ) {
          break;
        }

        parentItem.folded = !expand;
        parentItem = Polymer.dom(parentItem).parentNode;
      }
    },

    scrollToItem ( el ) {
      window.requestAnimationFrame(() => {
        this.$.content.scrollTop = el.offsetTop + 16 - this.offsetHeight/2;
      });
    },

    selectItemById ( id ) {
      let childItem = this._id2el[id];
      if ( childItem ) {
        childItem.selected = true;
      }
    },

    unselectItemById ( id ) {
      let childItem = this._id2el[id];
      if ( childItem ) {
        childItem.selected = false;
      }
    },

    activeItemById ( id ) {
      let childItem = this._id2el[id];
      if ( childItem ) {
        this._activeElement = childItem;
      }
    },

    deactiveItemById ( id ) {
      if ( this._activeElement && this._activeElement._userId === id ) {
        this._activeElement = null;
      }
    },

    activeItem ( childItem ) {
      this._activeElement = childItem;
    },

    deactiveItem ( childItem ) {
      if ( childItem && this._activeElement === childItem ) {
        this._activeElement = null;
      }
    },

    dumpItemStates () {
      let states = [];

      for ( let id in this._id2el ) {
        if ( this._id2el[id].foldable ) {
          states.push({
            uuid: this._id2el[id]._uuid,
            folded: this._id2el[id].folded
          });
        }
      }

      return states;
    },

    restoreItemStates (states) {
      if ( !states ) {
        return;
      }

      states.forEach(state => {
        let childItem = this._id2el[state.uuid];
        if ( childItem ) {
          childItem.folded = state.folded;
        }
      });
    },

    getToplevelElements ( ids ) {
      let elements = new Array(ids.length);
      for ( let i = 0; i < ids.length; ++i ) {
        elements[i] = this._id2el[ids[i]];
      }

      let resultELs = Editor.Utils.arrayCmpFilter ( elements, ( elA, elB ) => {
        if ( elA.contains(elB) ) {
          return 1;
        }

        if ( elB.contains(elA) ) {
          return -1;
        }

        return 0;
      });
      return resultELs;
    },
  });

})();
