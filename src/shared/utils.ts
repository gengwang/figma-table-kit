function baseFrameWithAutoLayout(
{ 
    name = '_frame', 
    direction = 'HORIZONTAL', 
    nodeType = 'FRAME', 
    width = 240, height = 160, 
    padding = 8, margin = 8,
}: 
{ 
    name?: string; 
    direction?: BaseFrameMixin['layoutMode'];
    nodeType?: 'FRAME' | 'COMPONENT';
    width?: number;
    height?: number;
    padding?: number;
    margin?: number; 
    } = {}): BaseFrameMixin {
    let frame: BaseFrameMixin;
    switch (nodeType) {
        case 'COMPONENT':
            frame = figma.createComponent();
            break;
        default:
            frame = figma.createFrame();
            break;
    }
    frame.layoutMode = direction;
    frame.primaryAxisSizingMode = 'AUTO';
    frame.counterAxisSizingMode = 'AUTO';
    frame.layoutAlign = 'STRETCH';
    frame.paddingTop = frame.paddingRight = frame.paddingBottom = frame.paddingLeft = padding;
    frame.itemSpacing = margin;
    frame.name = name;
    frame.resize(width, height);

    const dummyRect = figma.createRectangle();
    dummyRect.resize(width - padding*2, height - padding*2);

    // Gotcha: the frame needs to have some content in order to "activate" the auto layout.
    frame.appendChild(dummyRect);
    dummyRect.remove();
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
    clone,
    transpose,
}