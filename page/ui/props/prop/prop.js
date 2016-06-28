"use strict";
Editor.polymerElement(
	{
		properties:{
			prop:{
				value:function(){
					return {path:"",type:"",name:"",attrs:{},value:null}
				},
				notify:true
			},
			disabled:{
				type:Boolean,
				value:false,
				notify:true,
				reflectToAttribute:true
			}
		},

		ready:function(){},
		_isValueProp:function(t){return"Array"===t?!1:"Object"!==t},
		_isArrayProp:function(t){return"Array"===t},
		_isObjectProp:function(t){return"Object"===t}
	});