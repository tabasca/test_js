import { FilterType } from './meta';

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

export const getCoords = (elem) => {
  var box = elem.getBoundingClientRect();

  var body = document.body;
  var docElem = document.documentElement;

  var scrollTop = window.pageYOffset || docElem.scrollTop || body.scrollTop;
  var scrollLeft = window.pageXOffset || docElem.scrollLeft || body.scrollLeft;

  var clientTop = docElem.clientTop || body.clientTop || 0;
  var clientLeft = docElem.clientLeft || body.clientLeft || 0;

  var top = box.top + scrollTop - clientTop;
  var left = box.left + scrollLeft - clientLeft;

  return {
    top: Math.round(top),
    left: Math.round(left)
  };
};

export const getElementUnderClientXY = (elem, clientX, clientY) => {
  var display = elem.style.display || '';
  elem.style.display = 'none';

  var target = document.elementFromPoint(clientX, clientY);

  elem.style.display = display;

  if (!target || target === document) {
    target = document.body;
  }

  return target;
};

export const isDescendant = (parent, child) => {
  let node = child.parentNode;

  while (node !== null) {
    if (node === parent) {
      return true;
    }
    node = node.parentNode;
  }

  return false;
};

export const findAncestor = (el, cls) => {
  while ((el = el.parentElement) && !el.classList.contains(cls));
  return el;
};

export const sortArr = (arr, sortType) => {
  let assignedArr = completeAssign({}, arr);

  if (typeof assignedArr.map !== 'function') {
    assignedArr = Object.keys(assignedArr).map(key => assignedArr[key]);
  }

  return assignedArr.sort(function (a, b) {
    let nameA = a.listItem.name.toLowerCase();
    let nameB = b.listItem.name.toLowerCase();

    switch (sortType) {
      case FilterType.ASCENDING:
        if (nameA < nameB) {
          return -1;
        }

        if (nameA > nameB) {
          return 1;
        }
        break;
      case FilterType.DESCENDING:
        if (nameA < nameB) {
          return 1;
        }

        if (nameA > nameB) {
          return -1;
        }
        break;
      default:
        return 0;
    }
  });
};

export const swapItemsInArr = (arr, a, b) => {
  let aIndex = arr.findIndex(x => x.name === a.name);
  let bIndex = arr.findIndex(x => x.name === b.name);

  let temp = arr[aIndex];

  arr[aIndex] = arr[bIndex];
  arr[bIndex] = temp;
};

export const transformToArr = (obj) => {
  if (typeof obj.map !== 'function') {
    obj = Object.keys(obj).map(key => obj[key]);
    return obj;
  }

  return obj;
};
