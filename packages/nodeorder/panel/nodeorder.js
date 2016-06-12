(() => {
  'use strict';

  var Fs = require('fire-fs');
  
  Editor.polymerPanel('nodeorder', {
    properties: {
      filterText: {
        type: String,
        value: '',
      },
    },

    ready: function () {
      this._addLogTimeoutID = null;
      this._logsToAdd = [];
      var path = Editor.url('packages://ui-tree/test/fixtures/mw2-tree.json');
      Fs.readFile( path, function ( err, data ) {
          if ( !err ) {
              var data = JSON.parse(data);
              this.build(data);
          }
      }.bind(this));
    },

    build: function ( data ) {
        console.time('tree');

        data.forEach( function ( entry ) {
            var newEL = this.newEntryRecursively(entry);
            this.$.tree.addItem( this.$.tree, newEL, {
                id: entry.path,
                name: entry.name,
            } );

            newEL.folded = false;
        }.bind(this));

        console.timeEnd('tree');
    },

    newEntryRecursively: function ( entry ) {
        var el = this.newEntry();

        if ( entry.children ) {
            entry.children.forEach( function ( childEntry ) {
                var childEL = this.newEntryRecursively(childEntry);
                this.$.tree.addItem( el, childEL, {
                    id: childEntry.path,
                    name: childEntry.name,
                } );
                // childEL.folded = false;
            }.bind(this) );
        }

        return el;
    },

    newEntry: function () {
        return document.createElement('tree-item');
    },

    messages: {
      
    },

  });

})();
