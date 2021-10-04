import * as _ from 'lodash';
// import {prisma_cloud_policies, prisma_cloud_alerts, artists, songs} from '../app/assets/datasets.js';
import {baseFrameWithAutoLayout, configFoCWithAutoLayout, transpose, parseCompName} from '../shared/utils';

// FIXME: If some columns are deleted, things will stop working
// var meta_tables: {id: string, cols: number}[] = [];
const table_style = {
    rowHeight: 32,
    headerHeight: 32,
    columnWidth: 200,
    compact: {
        rowHeight: 24,
    },
    cozy: {
        rowHeight: 44,
    },
};
const settings = {
    'manual-update': false,
};

enum PRISMA_TABLE_COMPONENTS_INST_NAME {
    'Header - Text',
    'Header - Checkbox',
    'Cell - Text',
    'Cell - Actions',
    'Cell - Checkbox',
    'Cell - Severity',
    'Cell - Toggle',
}

const PRISMA_TABLE_COMPONENTS: {
    key: string;
    instanceName: PRISMA_TABLE_COMPONENTS_INST_NAME;
    comp: any;
    variantObj: object;
}[] = [
    {
        key: 'faa7a0e47753b0f79a71c29c61ee340e83b087c7',
        comp: null,
        instanceName: PRISMA_TABLE_COMPONENTS_INST_NAME['Header - Text'],
        variantObj: null,
    },
    {
        key: '52f8db8c3eb06811177462ca81794c1e1b80b36d',
        comp: null,
        instanceName: PRISMA_TABLE_COMPONENTS_INST_NAME['Cell - Text'],
        variantObj: null,
    },
    {
        key: 'aeae4ca0fb4b52e8501f7288bd71859b5ff87df1',
        comp: null,
        instanceName: PRISMA_TABLE_COMPONENTS_INST_NAME['Cell - Text'],
        variantObj: null,
    },
    {
        key: '7c7c603f0d37e6cb2b21149b865d3eeb6ea70c4e',
        comp: null,
        instanceName: PRISMA_TABLE_COMPONENTS_INST_NAME['Cell - Text'],
        variantObj: null,
    },
    {
        key: '414c2a284ecd78ef15d9fa3b5abd33635f29cf38',
        comp: null,
        instanceName: PRISMA_TABLE_COMPONENTS_INST_NAME['Cell - Text'],
        variantObj: null,
    },
    {
        key: '4b3a13c71ecd87ecb955f3c27be566b5d1fa64d3',
        comp: null,
        instanceName: PRISMA_TABLE_COMPONENTS_INST_NAME['Cell - Text'],
        variantObj: null,
    },
    {
        key: '1b38e2108373907af387083e7c80614289cb323a',
        comp: null,
        instanceName: PRISMA_TABLE_COMPONENTS_INST_NAME['Cell - Text'],
        variantObj: null,
    },
    {
        key: '943c5b15b37a43f61753ff62e8e36fddcb4ce472',
        comp: null,
        instanceName: PRISMA_TABLE_COMPONENTS_INST_NAME['Cell - Text'],
        variantObj: null,
    },
    {
        key: '07ad0a31821a24c118ecdd7b258637be5fb5b400',
        comp: null,
        instanceName: PRISMA_TABLE_COMPONENTS_INST_NAME['Cell - Text'],
        variantObj: null,
    },
    {
        key: '3782e1e0a293fb1272f309e9dea168bf5253912e',
        comp: null,
        instanceName: PRISMA_TABLE_COMPONENTS_INST_NAME['Cell - Text'],
        variantObj: null,
    },
    {
        key: '271f306487b02aadbd8e91fa00bc07441ad66bc6',
        comp: null,
        instanceName: PRISMA_TABLE_COMPONENTS_INST_NAME['Cell - Text'],
        variantObj: null,
    },
    {
        key: 'ad98c22abd70dc4cc7c416f4d60236eae8af64d8',
        comp: null,
        instanceName: PRISMA_TABLE_COMPONENTS_INST_NAME['Cell - Text'],
        variantObj: null,
    },
    {
        key: 'bad9f37873cdfe29d1a3e3109481316ced867fef',
        comp: null,
        instanceName: PRISMA_TABLE_COMPONENTS_INST_NAME['Cell - Text'],
        variantObj: null,
    },
    {
        key: '2cffc40473d91e306a8abd83de636cc6bf2a665c',
        comp: null,
        instanceName: PRISMA_TABLE_COMPONENTS_INST_NAME['Cell - Text'],
        variantObj: null,
    },
    {
        key: '5f0ce4db2559489c1f6d64de01e087fc71990c50',
        comp: null,
        instanceName: PRISMA_TABLE_COMPONENTS_INST_NAME['Cell - Text'],
        variantObj: null,
    },
    {
        key: '4d1a18c202a9add97412f4773de1bdab6bd252e6',
        comp: null,
        instanceName: PRISMA_TABLE_COMPONENTS_INST_NAME['Cell - Text'],
        variantObj: null,
    },
    {
        key: '7596452dfedf909c25cfad654b2c40a6fef34311',
        comp: null,
        instanceName: PRISMA_TABLE_COMPONENTS_INST_NAME['Cell - Text'],
        variantObj: null,
    },
];

// First making sure all Table Cell components are loaded, then show the UI
PRISMA_TABLE_COMPONENTS.forEach((d) => {
    d.comp = figma.importComponentByKeyAsync(d.key);
});

figma.ui.onmessage = (msg) => {
    switch (msg.type) {
        case 'update-settings':
            updateSettings(msg);
            break;
        case 'create-table':
            drawTable(msg.dataset);
            // drawTableBody(msg.dataset);
            break;
        case 'update-table':
            if (figma.currentPage.selection.length > 0) {
                drawTableBody(msg.dataset);
            }
        case 'update-striped':
            updateStriped(msg.striped);
            break;
        case 'select-row':
            selectRow();
            break;
        case 'update-row-height':
            const target = figma.currentPage.selection.concat()[0];
            updateRow(target);
            break;

        case 'draw-table-header':
            drawTableHeader(msg.dataset);
            break;

        case 'test':
            test();
            break;
        case 'cancel':
            break;
        default:
            break;
    }

    // figma.closePlugin();
};

Promise.all(PRISMA_TABLE_COMPONENTS.map((d) => d.comp))
    .then((comps) => {
        comps.forEach((comp, i) => {
            PRISMA_TABLE_COMPONENTS[i]['comp'] = comp;
            PRISMA_TABLE_COMPONENTS[i]['variantObj'] = parseCompName(comp.name);
        });
    })
    .then(() => {
        figma.showUI(__html__, {height: 320});
    })
    .catch((error) => {
        console.error('error in loading Prisma Table cell components', error);
    });

// figma.showUI(__html__, {height: 320});

// We store which node we are interacting with
// TODO: store the whole array of current page selection
figma.on('selectionchange', () => {
    // We'll do nothing if the user wants manual upate
    if (settings['manual-update']) return;

    if (figma.currentPage.getPluginData('selectedEl') !== '' && figma.currentPage.selection.length === 0) {
        // if the user just de-selected something, we may want to update the row
        const targetObj = JSON.parse(figma.currentPage.getPluginData('selectedEl'));
        if (targetObj.type === 'FRAME' || targetObj.type === 'INSTANCE') {
            const target = figma.currentPage.findOne((n) => n.id === targetObj.id);
            updateRow(target);
            updateColumnComps(target);
        } else if (targetObj.type === 'TEXT') {
            console.log('target is a text and it is ', targetObj, '; name: ', targetObj.name);

            // if the previous node was a text node and the rest of the column is not????
            const target = figma.currentPage.findOne((n) => n.id === targetObj.id) as TextNode;
            // TMP. TODO
            updateColumnIcons(target);
        }
    }
    // Store the selection so we can use in the next change event
    if (figma.currentPage.selection.length > 0) {
        ``;
        const el = figma.currentPage.selection[0];
        const obj = {
            name: el.name,
            type: el.type,
            id: el.id,
        };
        figma.currentPage.setPluginData('selectedEl', JSON.stringify(obj));
    }
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Settings
function updateSettings(msg: any) {
    if (msg.setting === 'manual-update') {
        settings['manual-update'] = msg.value;
    }

    console.log('update settings::', msg, 'now manual setting is:', settings['manual-update']);
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Returns a frame node under the parent node; reuses one if it exists, otherwise
// creates a new one.
// This is applicable for a table frame constructed by this plugin:
// a table frame contains a collection of column frames, which in tern contains a collection
// of cell frames.
function frameNodeOn({
    parent,
    colIndex,
    rowIndex,
    frameType = 'COLUMN',
    height = table_style.rowHeight,
    width = table_style.columnWidth,
}: {
    parent: FrameNode;
    colIndex: number;
    rowIndex?: number;
    frameType?: 'COLUMN' | 'CELL';
    height?: number;
    width?: number;
}): FrameNode {
    if (frameType === 'COLUMN') {
        const col = parent.children[colIndex];
        const colName = 'col-' + colIndex;
        if (col) {
            col.name = colName;
            const colEl = col as FrameNode;
            colEl.children.forEach((c) => c.remove());
            return colEl;
        } else {
            const colEl = baseFrameWithAutoLayout({
                name: colName,
                nodeType: 'FRAME',
                direction: 'VERTICAL',
                width: width,
                padding: 0,
            }) as FrameNode;
            parent.appendChild(colEl);
            return colEl;
        }
    } else if (frameType === 'CELL') {
        const cell = parent.children[rowIndex];
        // Something like 'cell-row-3-col-0'
        const cellName = 'cell-row-' + rowIndex + '-col-' + colIndex;
        if (cell) {
            cell.name = cellName;
            const cellEl = cell as FrameNode;
            cellEl.children.forEach((c) => c.remove());
            return cellEl;
        } else {
            // direction is VERTICAL so that the content of the instance node can wrap when resized
            const cellEl = baseFrameWithAutoLayout({
                name: cellName,
                nodeType: 'FRAME',
                direction: 'VERTICAL',
                height: height,
                width: width,
                padding: 0,
            }) as FrameNode;
            parent.appendChild(cellEl);
            return cellEl;
        }
    }
    return null;
}

function updateStriped(striped: boolean) {
    // First select the table body, pls
    if (figma.currentPage.selection.length === 0) return;

    // TODO. For now you have to select a table frame. TODO: to select any child
    const tableEl = figma.currentPage.selection[0] as FrameNode;
    // TODO: Maybe we should get the color from the imported component named Default - Alt
    const evenRowColor = striped ? {r: 244 / 255, g: 245 / 255, b: 245 / 255} : {r: 1, g: 1, b: 1};
    if (tableEl.name === 'pa-table-body') {
        const reg = /(?<=cell-row-)\d*/;
        tableEl.children.forEach((colEl) => {
            const col = colEl as FrameNode;

            col.children.forEach((cellEl) => {
                const cell = cellEl as FrameNode;
                const cellMatches = cell.name.match(reg);
                if (cellMatches.length > 0) {
                    const rowNum = cellMatches[0] as unknown;
                    const rowNum1 = rowNum as number;
                    // Swap the child
                    let destInst = cell.children[0] as InstanceNode;
                    if (rowNum1 % 2 !== 0) {
                        // If this is an even row cell. Index is 0 based
                        // Repaint the backdrop color
                        cell.fills = [{type: 'SOLID', color: evenRowColor}];
                        const stateVar: object = parseCompName(destInst.mainComponent.name);

                        let evenRowComp: ComponentNode = PRISMA_TABLE_COMPONENTS.filter((d) => {
                            return d.instanceName === PRISMA_TABLE_COMPONENTS_INST_NAME['Cell - Text'];
                        }).find((d) => {
                            return d.variantObj['State'] === striped
                                ? 'Default - Alt'
                                : 'Default' &&
                                      d.variantObj['Icon Left'] === stateVar['Icon Left'] &&
                                      d.variantObj['Icon Right'] === stateVar['Icon Right'] &&
                                      d.variantObj['Label'] === stateVar['Label'];
                        })['comp'];

                        destInst.swapComponent(evenRowComp);
                    }
                    // draw the line for a cell
                    const cellLine = destInst.findChild((e) => e.name === 'bottom border');
                    cellLine.visible = !striped;
                }
            });
        });
    }
}
// target can be a frame cell or the instance node it contains
async function updateRow(target: SceneNode) {
    if (!target || (target.type !== 'INSTANCE' && target.type !== 'FRAME')) return;

    if (
        (target.type === 'INSTANCE' && target.name === 'Cell - Text') ||
        (target.type === 'FRAME' && target.name.includes('cell-row-'))
    ) {
        // if it's a component instance
        let cell, cellHeight;
        cellHeight = target.height;

        if (target.type === 'INSTANCE') {
            cell = target.parent;
        } else if (target.type === 'FRAME') {
            cell = target;
        }

        let row = rowForCell(cell);

        row.forEach((cel) => {
            // const inst = cell.children[0] as InstanceNode;
            const inst = (cel as FrameNode).children[0] as InstanceNode;

            // Update target cell height
            inst.resize(cel.width, cellHeight);
            // Rig the auto-layout again after explicitly setting the instance node's height
            inst.layoutAlign = 'STRETCH';
            inst.layoutGrow = 1;

            // Update the height for all the other cells in the same row
            cel.resize(cel.width, cellHeight);

            const thisInst = (cell as FrameNode).children[0] as InstanceNode;
            const insto = (cel as FrameNode).children[0] as InstanceNode;

            // Update the mouse states to be the same as the target
            updateCompMouseState(thisInst, insto);
        });
    }
}
// if the source inst comp is HOVER/SELECTED, then find the non-hover/selected version
// if the source inst comp is alt, then find both the default and even versions

// Update the target's mouse state according to the source's: this is mostly used when we want to update the whole row
function updateCompMouseState(source: InstanceNode, destination: InstanceNode) {
    // Find the source and the destination comp info
    const srcCompInfo: object = parseCompName(source.mainComponent.name);
    const destCompInfo: object = parseCompName(destination.mainComponent.name);
    // What's the desired comp we want?
    const expCompo: ComponentNode = PRISMA_TABLE_COMPONENTS.filter(
        (d) => d.instanceName === PRISMA_TABLE_COMPONENTS_INST_NAME['Cell - Text']
    ).find((d) => {
        return (
            d.variantObj['Icon Left'] === destCompInfo['Icon Left'] &&
            d.variantObj['Icon Right'] === destCompInfo['Icon Right'] &&
            d.variantObj['Label'] === destCompInfo['Label'] &&
            d.variantObj['State'] === srcCompInfo['State']
        );
    })['comp'];
    destination.swapComponent(expCompo);
}

// Update the target's icon state (e.g., icon left/right/label) according to the source's while keeping the target's mouse state:
// This is mostly applicable when we want to update the whole column
function updateCompIconLabelVariant(source: InstanceNode, destination: InstanceNode) {
    // Find the source and the destination comp info
    const srcCompoInfo: object = parseCompName(source.mainComponent.name);
    const destCompInfo: object = parseCompName(destination.mainComponent.name);
    // What's the desired comp we want?
    const expCompo: ComponentNode = PRISMA_TABLE_COMPONENTS.filter(
        (d) => d.instanceName === PRISMA_TABLE_COMPONENTS_INST_NAME['Cell - Text']
    ).find((d) => {
        return (
            d.variantObj['Icon Left'] === srcCompoInfo['Icon Left'] &&
            d.variantObj['Icon Right'] === srcCompoInfo['Icon Right'] &&
            d.variantObj['Label'] === srcCompoInfo['Label'] &&
            d.variantObj['State'] === destCompInfo['State']
        );
    })['comp'];
    destination.swapComponent(expCompo);
}

async function updateColumnComps(source: SceneNode) {
    if (!source || (source.type !== 'INSTANCE' && source.type !== 'FRAME')) return;

    if (
        (source.type === 'INSTANCE' && source.name === 'Cell - Text') ||
        (source.type === 'FRAME' && source.name.includes('cell-row-'))
    ) {
        // find all the instance for the column
        let sourceInst: InstanceNode;
        if (source.type === 'INSTANCE') {
            sourceInst = source as InstanceNode;
        } else if (source.type === 'FRAME') {
            sourceInst = (source as FrameNode).children[0] as InstanceNode;
        }
        const colEl = sourceInst.parent.parent as FrameNode;

        colEl.children.forEach((el) => {
            let targetInst = (el as FrameNode).children[0] as InstanceNode;
            updateCompIconLabelVariant(sourceInst, targetInst);
        });
    }
}

async function updateColumnIcons(source: TextNode) {
    // Don't update the text unless it's a left/right icon.
    if (source.name !== 'exclamation-triangle' && source.name !== 'angle-right') return;

    await figma.loadFontAsync({family: 'Font Awesome 5 Pro', style: 'Solid'});
    const sourceInst = source.parent as InstanceNode;
    const colEl = sourceInst.parent.parent as FrameNode;
    const sourceIcon: TextNode = sourceInst.findChild((d) => d.name === source.name) as TextNode;
    if (!sourceIcon) return;
    colEl.children.forEach((el) => {
        let targetInst = (el as FrameNode).children[0] as InstanceNode;
        updateCompIconLabelVariant(sourceInst, targetInst);
        // Prisma Library is using icon font for left/right icons
        const targetIcon: TextNode = targetInst.findChild((d) => d.name === source.name) as TextNode;
        if (targetIcon) {
            targetIcon.characters = sourceIcon.characters;
        }
    });
}

function rowForCell(cell: SceneNode): SceneNode[] {
    const reg = /\d+/;
    const rowMatches = cell.name.match(reg);
    if (rowMatches.length > 0) {
        let result = [];
        const rowIndex = rowMatches[0];
        const tableEl = cell.parent.parent;

        tableEl.children.forEach((colNode, j) => {
            const colEl = colNode as DefaultFrameMixin;
            // cell-row-0-col-0
            const celEl = colEl.findChild((n) => n.type === 'FRAME' && n.name === 'cell-row-' + rowIndex + '-col-' + j);
            result.push(celEl);
        });
        return result;
    }
    return null;
}

// Select all the cells in the row where the user needs to select a cell on this row first.
function selectRow() {
    const sel = figma.currentPage.selection.concat()[0];
    let cell;

    if (sel.type === 'INSTANCE') {
        cell = sel.parent;
    } else if (sel.type === 'FRAME') {
        cell = sel;
    }

    let _row = rowForCell(cell);
    if (_row) figma.currentPage.selection = _row;
}

// Quick and dirty way to see if the selection is a table
function isTable(selection: readonly SceneNode[]): boolean {
    return selection.length == 1 && selection[0].name.includes('pa-table-body');
}

function drawTable(data) {
    Promise.all([drawTableHeader(data), drawTableBody(data)]).then(([header, body]) => {
        // console.log("frames now are available:::", frames);
        const tableEl = figma.createFrame();
        tableEl.name = 'pa-table';
        tableEl.layoutMode = 'VERTICAL';
        tableEl.layoutGrow = 0;

        // tableEl.layoutAlign = 'MAX';

        header.layoutGrow = 0;
        tableEl.appendChild(header);
        body.layoutGrow = 0;
        tableEl.appendChild(body);

        // TMP: set the width to 1440 for now.
        tableEl.resize(1440 - 32 * 2, header.height + body.height);
    });
}
async function drawTableHeader(data) {
    await figma.loadFontAsync({family: 'Lato', style: 'Bold'});

    // TMP. TODO. Figure out what component we need by looking at header or the previously drawn instance
    const tableHeaderCellDefaultComp = PRISMA_TABLE_COMPONENTS.filter(
        (d) => d.instanceName === PRISMA_TABLE_COMPONENTS_INST_NAME['Header - Text']
    ).find((d) => d.variantObj['State'] === 'Default')['comp'];

    // Get the header title:
    const headerTitles: string[] = Object.keys(data['rows'][0] as object);

    // let sel = figma.currentPage.selection;
    const headerContainer = baseFrameWithAutoLayout({
        name: 'pa-table-header',
        height: table_style.headerHeight,
        // width: table_style.columnWidth * headerTitles.length,
        // width: 600,
        padding: 0,
        itemSpacing: 0,
        direction: 'HORIZONTAL',
    }) as FrameNode;

    headerContainer.layoutGrow = 1;

    headerTitles.forEach((title, i) => {
        const headerInst: InstanceNode = tableHeaderCellDefaultComp.createInstance();
        const label = headerInst.findOne((d) => d.name === 'Label') as TextNode;
        if (label) {
            label.characters = title;
        }
        headerInst.resize(table_style.columnWidth, table_style.headerHeight);
        headerInst.layoutGrow = i < headerTitles.length - 1 ? 0 : 1; // Set Last header cell to "Fill Width" while all other cells "Fixed Width"
        headerInst.layoutAlign = 'STRETCH'; // Fill Height
        headerContainer.appendChild(headerInst);
    });

    return headerContainer;
}

// Draw table using the d3 update pattern(e.g., enter/update/exit).
// Using imported external components.
// TODO: Move 'pa-table-body' to a const
// The component we use need to be loaded first, plus all the assets
// such as fonts and styles(?)
async function drawTableBody(data) {
    await figma.loadFontAsync({family: 'Lato', style: 'Regular'});

    // TMP. TODO. Figure out what component we need by looking at header or the previously drawn instance
    const tableBodyCellDefaultComp = PRISMA_TABLE_COMPONENTS.filter(
        (d) => d.instanceName === PRISMA_TABLE_COMPONENTS_INST_NAME['Cell - Text']
    ).find((d) => d.variantObj['State'] === 'Default')['comp'];
    const tableBodyCellStripedEvenRowComp = PRISMA_TABLE_COMPONENTS.filter(
        (d) => d.instanceName === PRISMA_TABLE_COMPONENTS_INST_NAME['Cell - Text']
    ).find((d) => d.variantObj['State'] === 'Default - Alt')['comp'];
    const rowHeight = table_style.rowHeight;

    let sel = figma.currentPage.selection;
    if (sel.length === 0) {
        // if nothing is selected, go ahead and create a baseFrameWithAutoLayout and proceed
        const bodyContainer = baseFrameWithAutoLayout({name: 'pa-table-body', itemSpacing: 0, padding: 0}) as FrameNode;
        sel = figma.currentPage.selection = [bodyContainer] as FrameNode[];
    } else if (sel[0].type === 'FRAME' && sel[0].children.length === 0) {
        // if selection is an empty frame, configure it using autolayout for table and proceed
        let foc = sel[0];

        configFoCWithAutoLayout({
            foc: foc,
            name: 'pa-table-body',
            width: foc.width,
            height: foc.height,
            padding: 0,
        });
        sel = figma.currentPage.selection = [foc] as FrameNode[];
    }

    // row based data source
    const datagrid = _.chain(data.rows).take(10).value();

    // column based data source
    const dataframe = transpose(datagrid);

    if (isTable(sel)) {
        // See if the selection is a table by checking out the name of the frame

        const tableEl = sel[0] as FrameNode;
        const colsEl = tableEl.children as FrameNode[];
        const existingColCount = colsEl.length;
        const newColCount = dataframe.length;
        const existingRowCount = existingColCount === 0 ? 0 : (colsEl[0].children as FrameNode[]).length;
        const newRowCount = datagrid.length;

        let [tableWidth, tableHeight] = [tableEl.width, newRowCount * rowHeight];

        dataframe.forEach((cells, i) => {
            // Enter
            const colEl = frameNodeOn({parent: tableEl, colIndex: i});
            colEl.layoutGrow = i < dataframe.length - 1 ? 0 : 1;
            // colEl.layoutAlign = 'MAX';

            // colEl.primaryAxisSizingMode = 'FIXED';
            const cellsData = cells as [];
            cellsData.forEach((cell, j) => {
                // Enter/Upate
                const cellContainer = frameNodeOn({
                    parent: colEl,
                    colIndex: i,
                    rowIndex: j,
                    frameType: 'CELL',
                    height: rowHeight,
                });
                // Set up resizing to be w: 'Fill Container'/h: 'Fixed Height'
                // TODO: w: 'Fill COntainer' / h: 'Hug content'
                cellContainer.layoutGrow = 0;
                cellContainer.layoutAlign = 'STRETCH';

                // Set up for alternate row coloring. Note index starts from 0
                const t =
                    j % 2 == 0
                        ? tableBodyCellWithText(colEl, j, tableBodyCellDefaultComp, cell as string)
                        : tableBodyCellWithText(colEl, j, tableBodyCellStripedEvenRowComp, cell as string);

                // Set up resizing to be h: 'Fill Container'/w: 'Fill Container'
                // This will cause this instance node to fill the parent cell frame when
                // the parent cell frame resizes
                t.layoutAlign = 'STRETCH'; //'MIN';
                t.layoutGrow = 1;
                t.resize(t.width, rowHeight);
                cellContainer.appendChild(t);
            });
        });

        // Exit
        if (newColCount < existingColCount || newRowCount < existingRowCount) {
            colsEl.forEach((colEl, i) => {
                const rowsEl = colEl.children as FrameNode[];
                rowsEl.forEach((rowEl, j) => {
                    // remove extra rows
                    if (j >= newRowCount) {
                        rowEl.remove();
                    }
                });
                // remove the extra columns
                if (i >= newColCount) {
                    colEl.remove();
                }
            });
        }

        tableEl.resize(tableWidth, tableHeight);
    }

    figma.viewport.scrollAndZoomIntoView(sel);
    figma.currentPage.selection = sel;
    return sel[0];
}
// NOTE: The client function needs to loadFontAsync at the top of the function
function tableBodyCellWithText(
    parent: FrameNode,
    rowIndex: number,
    comp: ComponentNode,
    text: string = 'ipsum loram!'
): InstanceNode {
    let tableCell;
    if (parent.children.length > rowIndex && parent.children[rowIndex].type === 'INSTANCE') {
        tableCell = parent.children[rowIndex];
    } else {
        tableCell = comp.createInstance();
    }
    const textEl = tableCell.findChild((n) => n.type === 'TEXT') as TextNode;
    textEl.characters = text.toString();
    return tableCell;
}
function logSelection() {
    const sel = figma.currentPage.selection;
    console.log('sel:', sel[0]);
}
function test() {
    console.log("let's load external component...");
    // tableBodyCellWithText("one two three");
    logSelection();
}
