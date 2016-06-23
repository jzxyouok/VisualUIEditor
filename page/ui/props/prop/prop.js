"use strict";
Editor.polymerElement(
	{
		properties:{
			prop:{
				value:function(){
					return {path:"",type:"",name:"",attrs:{},value:null}
				},
				notify:!0
			},
			disabled:{
				type:Boolean,
				value:!1,
				notify:!0,
				reflectToAttribute:!0
			}
		},

		observers: [
			'knowPropChange(prop)'
		],
		knowPropChange: function(prop) {
			Editor.log(JSON.stringify(prop));
		},

		ready:function(){},
		_isValueProp:function(t){return"Array"===t?!1:"Object"!==t},
		_isArrayProp:function(t){return"Array"===t},
		_isObjectProp:function(t){return"Object"===t}
	});