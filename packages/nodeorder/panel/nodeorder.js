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

      Editor.log("ffffffffffffffffffffffffff");
      print_func(this.$.tree);
      Editor.log("kkkkkkkkkkkkkkkkkkkkkkkkkk");
      var childItem = document.createElement('td-tree-item');
      childItem.name = "mytest";
      this.$.tree.shift();
      // this.$.tree.addItem(this.$.tree, childItem);
      // var path = Editor.url('packages://ui-tree/test/fixtures/mw2-tree.json');
      // Fs.readFile( path, function ( err, data ) {
      //     if ( !err ) {
      //         var data = JSON.parse(data);
      //         this.build(data);
      //     }
      // }.bind(this));
    },

    // build: function ( data ) {
    //     console.time('tree');

    //     data.forEach( function ( entry ) {
    //         var newEL = this.newEntryRecursively(entry);
    //         this.$.tree.addItem( this.$.tree, newEL, {
    //             id: entry.path,
    //             name: entry.name,
    //         } );

    //         newEL.folded = false;
    //     }.bind(this));

    //     console.timeEnd('tree');
    // },

    // newEntryRecursively: function ( entry ) {
    //     var el = this.newEntry();

    //     if ( entry.children ) {
    //         entry.children.forEach( function ( childEntry ) {
    //             var childEL = this.newEntryRecursively(childEntry);
    //             this.$.tree.addItem( el, childEL, {
    //                 id: childEntry.path,
    //                 name: childEntry.name,
    //             } );
    //             // childEL.folded = false;
    //         }.bind(this) );
    //     }

    //     return el;
    // },

    // newEntry: function () {
    //     return document.createElement('tree-item');
    // },

    messages: {
      
    },

  });

})();
