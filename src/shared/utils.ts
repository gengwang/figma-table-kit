function baseFrame(nodeType: 'FRAME' | 'COMPONENT'):  BaseFrameMixin {
    switch (nodeType) {
        case 'COMPONENT':
            return figma.createComponent();
        default:
            return figma.createFrame();
    }
}
// Configure a Frame or a Component to support auto layout
function configFoCWithAutoLayout(
    { 
    foc,
    name = '_frame', 
    direction = 'HORIZONTAL', 
    // nodeType = 'FRAME', 
    width = 240, height = 160, 
    padding = 8, itemSpacing = 0,
}: 
{ 
    foc?: BaseFrameMixin, // either a 'FRAME' or a 'COMPONENT'
    name?: string; 
    direction?: BaseFrameMixin['layoutMode'];
    // nodeType?: 'FRAME' | 'COMPONENT';
    width?: number;
    height?: number;
    padding?: number;
    itemSpacing?: number; 
    } = {}) {
        
    foc.layoutMode = direction;
    foc.primaryAxisSizingMode = 'AUTO';
    foc.counterAxisSizingMode = 'AUTO';
    foc.layoutAlign = 'STRETCH';
    foc.paddingTop = foc.paddingRight = foc.paddingBottom = foc.paddingLeft = padding;
    foc.itemSpacing = itemSpacing;
    foc.name = name;
    foc.resize(width, height);

    const dummyRect = figma.createRectangle();
    dummyRect.resize(width - padding*2, height - padding*2);

    // Gotcha: the foc needs to have some content in order to "activate" the auto layout.
    foc.appendChild(dummyRect);
    dummyRect.remove();

}
function baseFrameWithAutoLayout(
{ 
    name = '_frame', 
    direction = 'HORIZONTAL', 
    nodeType = 'FRAME', 
    width = 240, height = 160, 
    padding = 8, itemSpacing = 0,
}: 
{ 
    name?: string; 
    direction?: BaseFrameMixin['layoutMode'];
    nodeType?: 'FRAME' | 'COMPONENT';
    width?: number;
    height?: number;
    padding?: number;
    itemSpacing?: number; 
    } = {}): BaseFrameMixin {
    let frame: BaseFrameMixin = baseFrame(nodeType);
    configFoCWithAutoLayout({
        foc: frame,
        name: name,
        direction: direction,
        width: width,
        height: height,
        padding: padding,
        itemSpacing: itemSpacing
    })
    return frame;
}

//* Source: https://www.figma.com/plugin-docs/editing-properties/ */
function clone(val) {
    const type = typeof val;
    if (val === null) {
        return null;
    } else if (type === 'undefined' || type === 'number' || type === 'string' || type === 'boolean') {
        return val;
    } else if (type === 'object') {
        if (val instanceof Array) {
            return val.map((x) => clone(x));
        } else if (val instanceof Uint8Array) {
            return new Uint8Array(val);
        } else {
            let o = {};
            for (const key in val) {
                o[key] = clone(val[key]);
            }
            return o;
        }
    }
    throw 'unknown';
}

//Source: https://stackoverflow.com/questions/4492678/swap-rows-with-columns-transposition-of-a-matrix-in-javascript
function transpose(a) {
    return Object.keys(a[0]).map(function(c) {
      return a.map(function(r) {
        return r[c];
      });
    });
}

export {
    baseFrameWithAutoLayout,
    configFoCWithAutoLayout,
    clone,
    transpose,
}