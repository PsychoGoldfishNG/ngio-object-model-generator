'use strict';
const fs = require('fs');

module.exports = {
	
	generateObject: function(objectName,objectData) {


function castValue(key,value,type,tab) {
	switch (type) {
		default:
			return key+" = "+value+";";
	}
}

function castObject(key,value,obj, tab) {
	return `if (!(${value} instanceof ngio.objects.${obj})) {
${tab}	console.error("Unexpected value: ",${value}, "Expecting instance of ngio.objects.${obj}");
${tab}	return;
${tab}}
${tab}${key} = ${value};`;
}

var out = `
/**
 * ${objectData.description}
 */
ngio.objects.${objectName} extends ngio.object {

	constructor(props) 
	{
`;

for (const [name, obj] of Object.entries(objectData.properties)) {
	out += "		this._"+name+" = typeof(props["+name+"]) !== 'undefined' ? props["+name+"] : null;\n"
}

out += 
`	}
`;

for (const [name, obj] of Object.entries(objectData.properties)) {

out += `
	get ${name}() 
	{
		return this._${name};
	}

	set ${name}(newVal)
	{
`;

// ============================= handle properties that can be passed as typecast arrays =============================//
if (obj.array) {

out += `		if (Array.isArray(newVal)) {
`;
	if (obj.array.type === 'mixed') {

out += `
			${castValue('this._'+name, 'newVal', obj.array, '			')}
`;

	} else if (obj.array.object) {

out += `
			${castObject('this._'+name, 'newVal', obj.array.object, '			')}
`;

	} else {

out += `
			let newArr = [];
			newVal.forEach(function(val,index) {
				${castValue('newArr[index]', 'val', obj.array, '				')}
			});
			this._${name} = newArr;
`;

	}

out += `			return;
		}
`;
}

out += `
	} 
`;
}
out += `
} 
`;

		return out;
	}

}