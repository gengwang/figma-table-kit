import * as _ from 'lodash';
// import * as d3 from './d3';
/*
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
} */
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
    padding = [6, 0],
    itemSpacing = 0,
}: {
    foc?: BaseFrameMixin; // either a 'FRAME' or a 'COMPONENT'
    name?: string;
    direction?: BaseFrameMixin['layoutMode'];
    // nodeType?: 'FRAME' | 'COMPONENT';
    width?: number;
    height?: number;
    padding?: number | number[];
    itemSpacing?: number;
} = {}) {
    foc.layoutMode = direction;

    foc.primaryAxisSizingMode = 'FIXED';
    foc.counterAxisSizingMode = 'AUTO';
    foc.layoutGrow = 1;
    foc.layoutAlign = 'STRETCH';

    if (typeof padding === 'number') {
        const _padding: number = padding;
        foc.paddingTop = foc.paddingRight = foc.paddingBottom = foc.paddingLeft = _padding;
    } else if (Array.isArray(padding)) {
        if (padding.length === 2) {
            foc.paddingTop = foc.paddingBottom = padding[0];
            foc.paddingLeft = foc.paddingRight = padding[1];
        } else if (padding.length === 4) {
            foc.paddingTop = padding[0];
            foc.paddingRight = padding[1];
            foc.paddingBottom = padding[2];
            foc.paddingLeft = padding[3];
        } else if (padding.length === 3) {
            foc.paddingTop = padding[0];
            foc.paddingRight = foc.paddingLeft = padding[1];
            foc.paddingBottom = padding[2];
        } else {
            console.error('padding should have a length of 2, 4, or 3');
        }
    }

    foc.itemSpacing = itemSpacing;
    foc.name = name;
    foc.resize(width, height);

    const dummyRect = figma.createRectangle();
    dummyRect.resize(width - foc.paddingLeft - foc.paddingRight, height - foc.paddingTop - foc.paddingBottom);

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
    padding?: number | number[];
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

async function loadFontForTextNode(textEl: TextNode) {
    await figma.loadFontAsync(textEl.fontName as FontName);
}
// Estimate the number of characters that can fit into an area.
// Based on 'Cell - Text' style in Prisma DS:
// Lato size: 12px line-height: 20px
// The paddings should not be counted.
// It looks like the only solution would be to modify the Prisma DS "Cell - Text" component so that
// it has an auto-layout frame wrapping the text with some top/bottom padding (6px), and then wrapping
// the bottom line and this frame inside another, non auto-layout frame.
function charactersPerArea(width: number, height: number, offsetChars = 14): number {
    // Not sure why the font constant has changed around end of Dec, 2021
    const fontConstant = 5.18333333333333 * 1.7;
    const lineHeight = 20;

    if (width <= 60) width -= 72;
    if (width > 120 && width < 300) width -= 64;
    if (width >= 500) width -= 56;

    let charCountPerLine = Math.floor(width / fontConstant);

    const rowCount = Math.floor(height / lineHeight);

    // We want some paddings on the top and the bottom
    if (height > 40) height -= 24;
    if (height <= 40 && height > 32) height -= 12;

    // Manually cut off some characters since it appears we'd overcount if we didn't
    if (charCountPerLine > offsetChars + 2) charCountPerLine -= offsetChars;

    // TODO. Make sure we are not getting negative numbers?
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

// source: https://stackoverflow.com/questions/31681732/lodash-get-duplicate-values-from-an-array
// retun the duplicates as an array:
// example: dups([1, 1, 2, 2, 3]) returns [1, 2]
function dups(arr) {
    return _.uniq(_.filter(arr, (v, i, a) => a.indexOf(v) !== i));
}
// Number of letters in an English word. The average is 4.79 letters per word, and 80% are between 2 and 7 letters long. [Reference](http://norvig.com/mayzner.html)
function lorem(minLen = 3, maxLen = 8, minLetters = 2, maxLetters = 10) {
    function randomLetters(len = 3) {
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        return _.sampleSize(letters.split(''), len).join('').trim();
    }
    function randomWords(wordCount) {
        return Array.from({length: wordCount}).map(() => {
            // d3.randomExponential("hello");
            //   const letterCount = Number.parseInt(
            //     d3.randomExponential(4.75)(24) * 24 + 1
            //   );
            const letterCount = _.random(minLetters, maxLetters);
            return randomLetters(letterCount);
        });
    }
    return randomWords(_.random(minLen, maxLen)).join(' ');
}

export {
    baseFrameWithAutoLayout,
    configFoCWithAutoLayout,
    loadFontForTextNode,
    charactersPerArea,
    clone,
    transpose,
    dups,
    lorem,
};
