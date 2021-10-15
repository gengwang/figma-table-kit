// A master component in Figma are named something like
// "Icon Left=True, Icon Right=False, Label=True, State=Default - Alt".
// This function returns a JSON representation of the name:
//  {
//     "Icon Left": true,
//     "Icon Right": false,
//     "Label": true,
//     "State": "Default - Alt"
// }
function parseCompName(name: string): object {
    return name
        .split(',')
        .map((d) => d.split('='))
        .map((d) => {
            let [_p, _v] = d;
            _p = _p.trim();
            // TypeScript wouldn't allow reassigning type in destruction assignment
            let v = _v != 'True' && _v != 'False' ? _v : _v === 'True';
            return {[_p]: v};
        })
        .reduce((acc, d, i, arr) => {
            if (i == 0) acc = arr[0];
            const k = Object.keys(d)[0];
            const v = Object.values(d)[0];
            return {...acc, [k]: v};
        }, {});
}
function baseFrame(nodeType: 'FRAME' | 'COMPONENT'): BaseFrameMixin {
    switch (nodeType) {
        case 'COMPONENT':
            return figma.createComponent();
        default:
            return figma.createFrame();
    }
}
// Configure a Frame or a Component to support auto layout
function configFoCWithAutoLayout({
    foc,
    name = '_frame',
    direction = 'HORIZONTAL',
    // nodeType = 'FRAME',
    width = 240,
    height = 160,
    padding = 8,
    itemSpacing = 0,
}: {
    foc?: BaseFrameMixin; // either a 'FRAME' or a 'COMPONENT'
    name?: string;
    direction?: BaseFrameMixin['layoutMode'];
    // nodeType?: 'FRAME' | 'COMPONENT';
    width?: number;
    height?: number;
    padding?: number;
    itemSpacing?: number;
} = {}) {
    foc.layoutMode = direction;

    foc.primaryAxisSizingMode = 'FIXED';
    foc.counterAxisSizingMode = 'AUTO';
    foc.layoutGrow = 1;
    foc.layoutAlign = 'STRETCH';

    foc.paddingTop = foc.paddingRight = foc.paddingBottom = foc.paddingLeft = padding;
    foc.itemSpacing = itemSpacing;
    foc.name = name;
    foc.resize(width, height);

    const dummyRect = figma.createRectangle();
    dummyRect.resize(width - padding * 2, height - padding * 2);

    // Gotcha: the foc needs to have some content in order to "activate" the auto layout.
    foc.appendChild(dummyRect);
    dummyRect.remove();
}
function baseFrameWithAutoLayout({
    name = '_frame',
    direction = 'HORIZONTAL',
    nodeType = 'FRAME',
    width = 1200,
    height = 120,
    padding = 0,
    itemSpacing = 0,
}: {
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
        itemSpacing: itemSpacing,
    });
    return frame;
}
// Estimate the number of characters that can fit into an area.
// Based on Cell - Text style in Prisma DS:
// Lato size: 12px line-height: 20px
// The paddings should not be counted.
function charactersPerArea(width: number, heigh: number, offsetChars = 14): number {
    const fontConstant = 5.18333333333333;
    const lineHeight = 20;
    let charCountPerLine = Math.floor(width / fontConstant);
    const rowCount = Math.floor(heigh / lineHeight);

    // We want some paddings on the top and the bottom
    if (heigh > 40) heigh -= 24;
    if (heigh <= 40 && heigh > 32) heigh -= 12;

    // Manually cut off some characters since it appears we'd overcount if we didn't
    if (charCountPerLine > offsetChars + 2) charCountPerLine -= offsetChars;
    return charCountPerLine * rowCount;
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
    return Object.keys(a[0]).map(function (c) {
        return a.map(function (r) {
            return r[c];
        });
    });
}

export {baseFrameWithAutoLayout, configFoCWithAutoLayout, charactersPerArea, clone, transpose, parseCompName};
