// This is an assign function that copies full descriptors
export const completeAssign = (target, ...sources) => {
	sources.forEach((source) => {
		let objDescriptors = Object.keys(source).reduce((descriptors, key) => {
			descriptors[key] = Object.getOwnPropertyDescriptor(source, key);
			return descriptors;
		}, {});
		// by default, Object.assign copies enumerable Symbols too
		Object.getOwnPropertySymbols(source).forEach((sym) => {
			let descriptor = Object.getOwnPropertyDescriptor(source, sym);
			if (descriptor.enumerable) {
				objDescriptors[sym] = descriptor;
			}
		});
		Object.defineProperties(target, objDescriptors);
	});
	return target;
};

export const getElementFromTemplate = (templateHtml) => {
	let template = document.createElement('div');
	template.innerHTML = templateHtml;

	return template.firstChild;
};

