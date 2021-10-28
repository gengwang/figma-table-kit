import * as _ from 'lodash';

// import {prisma_cloud_policies, prisma_cloud_alerts, artists, songs} from '../app/assets/datasets.js';
import {baseFrameWithAutoLayout, configFoCWithAutoLayout, transpose, charactersPerArea} from '../shared/utils';

// FIXME: If some columns are deleted, things will stop working
// var meta_tables: {id: string, cols: number}[] = [];
let table_style = {
    titleHeight: 48, // without subtitle
    titleWithSubtitleHeight: 64,
    rowHeight: 32,
    headerHeight: 32,
    columnWidth: 200,
    paginationHeight: 48,
    compact: {
        rowHeight: 24,
    },
    cozy: {
        rowHeight: 44,
    },
    spacious: {
        rowHeight: 100,
    },
};
const settings = {
    'manual-update': false,
};

enum TABLE_PART {
    'BodyCellFrame',
    'HeaderCellFrame',
    'BodyColumnFrame',
    // "PaginationFrame",
    'BodyCellInstance',
    'HeaderCellInstance',
    // "PaginationInstance",
}

const PRISMA_TABLE_COMPONENTS_INST_NAME = {
    'Card / Header': 'Card / Header',
    'Header - Text': 'Header - Text',
    'Header - Checkbox': 'Header - Checkbox',
    'Cell - Text': 'Cell - Text',
    'Cell - Checkbox': 'Cell - Checkbox',
    'Cell - Actions': 'Cell - Actions',
    'Cell - Severity': 'Cell - Severity',
    'Cell - Toggle': 'Cell - Toggle',
    'Table - Background': 'Table - Background',
    Pagination: 'Pagination',
};

// Including names of component names such as 'Cell - Text'
let PRISMA_TABLE_COMPONENT_NAMES = new Set();

// Used to load all variants components from Prisma DS library
const PRISMA_TABLE_COMPONENT_SAMPLES = [
    {name: PRISMA_TABLE_COMPONENTS_INST_NAME['Card / Header'], key: '061cacb1563153645cdd94fe1f0e5d9ec51c85bc'}, // Title for table
    {name: PRISMA_TABLE_COMPONENTS_INST_NAME['Header - Text'], key: 'faa7a0e47753b0f79a71c29c61ee340e83b087c7'},
    {name: PRISMA_TABLE_COMPONENTS_INST_NAME['Header - Checkbox'], key: 'd66c4bf33a2083e909bd4d074ec178060f35927f'},
    {name: PRISMA_TABLE_COMPONENTS_INST_NAME['Cell - Text'], key: '52f8db8c3eb06811177462ca81794c1e1b80b36d'},
    {name: PRISMA_TABLE_COMPONENTS_INST_NAME['Cell - Checkbox'], key: 'f8df0a61c1015d39c58f188dd5baa5a88a9f3160'},
    {name: PRISMA_TABLE_COMPONENTS_INST_NAME['Cell - Actions'], key: '95a16fd43a583bec88fbe376f5cac1bc2471b09e'},
    {name: PRISMA_TABLE_COMPONENTS_INST_NAME['Cell - Severity'], key: '32336a641c8d8bf847a19b2582d7fcd0c53e6696'},
    {name: PRISMA_TABLE_COMPONENTS_INST_NAME['Cell - Toggle'], key: 'bc73a96bfe0005857390306323f2dbd91f62b536'},
    {name: PRISMA_TABLE_COMPONENTS_INST_NAME['Table - Background'], key: 'f443506ec395fdb3b15b54e5c963273ce5b5d3a0'},
    {name: PRISMA_TABLE_COMPONENTS_INST_NAME.Pagination, key: 'a0dce3a552cfbe21ab347fd85677990281b6e4eb'},
];
interface tableCompInfo {
    compName: string;
    variantProperties?: object;
    component: ComponentNode;
    key: string;
}
// We only want to load all the components once
let _tableComponentsLoaded = false;
let allTableComponents: Array<tableCompInfo> = [];

loadAllTableComponents()
    .then(() => {
        console.log(
            `### Welcome to Palo Alto Design System \n#### Table components ready; ${allTableComponents.length} variants loaded.`
        );
        assignStyles();
    })
    .then(() => {
        figma.showUI(__html__, {height: 320});
    })
    .catch((error) => {
        console.error('error in loading Prisma Table cell components', error);
    });

figma.ui.onmessage = (msg) => {
    switch (msg.type) {
        case 'update-settings':
            updateSettings(msg);
            break;
        case 'create-table':
            drawTable(msg.dataset);
            break;
        case 'update-table':
            console.log('update-table');

            if (figma.currentPage.selection.length > 0) {
                // drawTableBody(msg.dataset);
                drawTable(msg.dataset);
            }
        case 'update-striped':
            updateStriped(msg.striped);
            break;
        case 'select-row':
            selectRow();
            break;
        case 'update-row-height':
            const height = table_style[msg.height]['rowHeight'] as number;
            const target = figma.currentPage.selection.concat()[0];
            // updateRow(target);
            updateRowHeight(target, height);
            break;

        case 'draw-table-header':
            drawTableHeader(msg.dataset);
            break;

        case 'test':
            test();
            break;
        case 'log':
            log();
            break;
        case 'cancel':
            break;
        default:
            break;
    }

    // figma.closePlugin();
};

function assignStyles() {
    const _default = _.pick(
        table_style,
        Object.keys(table_style).filter((d) => {
            return d !== 'compact' && d !== 'cozy' && d !== 'default' && d !== 'spacious';
        })
    );
    table_style = {
        ...table_style,
        ...{
            default: _default,
        },
        ...{compact: {..._default, ...table_style.compact}},
        ...{cozy: {..._default, ...table_style.cozy}},
        ...{spacious: {..._default, ...table_style.spacious}},
    };
}
// figma.showUI(__html__, {height: 320});

// We store which node we are interacting with
// TODO: store the whole array of current page selection
figma.on('selectionchange', () => {
    // We'll do nothing if the user wants manual upate
    if (settings['manual-update']) return;

    if (
        figma.currentPage.getPluginData('selectedEl') !== '' &&
        (figma.currentPage.selection.length === 0 || figma.currentPage.selection[0].name !== 'pa-table-container')
    ) {
        // if the user just de-selected something, we may want to update the row
        const sourceObj = JSON.parse(figma.currentPage.getPluginData('selectedEl'));

        if (sourceObj.type === 'FRAME' || sourceObj.type === 'INSTANCE') {
            const source = figma.currentPage.findOne((n) => n.id === sourceObj.id);
            updateRow(source);
            updateColumnComps(source);
            updateColumnHeader(source);
            updateColumn(source);
            updateTableSize(source);
        } else if (sourceObj.type === 'TEXT') {
            // console.log('source is a text and it is ', sourceObj, '; name: ', sourceObj.name);

            // if the previous node was a text node and the rest of the column is not????
            const source = figma.currentPage.findOne((n) => n.id === sourceObj.id) as TextNode;
            // TMP. TODO
            updateColumnIcons(source);
        }
    }
    // Store the selection so we can use in the next change event
    if (figma.currentPage.selection.length > 0) {
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
// Utilities
// Is the node a table part?
function tablePart(source: SceneNode): TABLE_PART {
    if (!source || (source.type !== 'INSTANCE' && source.type !== 'FRAME')) return null;

    const headerCelFrameReg = /(?<=col-)\d*/,
        bodyCelFrameReg = /(?<=cell-row-)\d*/,
        bodyColFrameReg = /(?<=col-)\d*/,
        bodyCellInstReg = /Cell - [A-Za-z]*/,
        headerCellInstReg = /Header - [A-Za-z]*/;

    if (source.type === 'FRAME') {
        if (source.parent && source.parent.name === 'pa-table-header') {
            if (source.name.match(headerCelFrameReg)) {
                return TABLE_PART.HeaderCellFrame;
            } else {
                return null;
            }
        } else if (source.name.match(bodyCelFrameReg)) {
            return TABLE_PART.BodyCellFrame;
        } else if (source.name.match(bodyColFrameReg)) {
            return TABLE_PART.BodyColumnFrame;
        } else {
            return null;
        }
    } else if (source.type === 'INSTANCE') {
        if (source.name.match(bodyCellInstReg)) {
            return TABLE_PART.BodyCellInstance;
        } else if (source.name.match(headerCellInstReg)) {
            return TABLE_PART.HeaderCellInstance;
        }
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Returns a frame node under the parent node; reuses one if it exists, otherwise
// creates a new one.
// This is applicable for a table frame constructed by this plugin:
// a table frame contains a collection of column frames, which contains a collection
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

    // TODO. For now you have to select a table container frame. TODO: to select any child
    const tableContainerEl = figma.currentPage.selection[0] as FrameNode;
    if (tableContainerEl.name !== 'pa-table-container') return;

    const tableEl = tableContainerEl.findOne((d) => d.name === 'pa-table') as FrameNode;

    if (!tableEl) return;

    const tableBodyEl = tableEl.findOne((d) => d.name === 'pa-table-body') as FrameNode;

    // TODO: Maybe we should get the color from the imported component named Default - Alt
    const evenRowColor = striped ? {r: 244 / 255, g: 245 / 255, b: 245 / 255} : {r: 1, g: 1, b: 1};
    if (tableBodyEl.name === 'pa-table-body') {
        tableBodyEl.children.forEach((colEl) => {
            const col = colEl as FrameNode;

            col.children.forEach((cellEl) => {
                const cell = cellEl as FrameNode;
                const cellMatches = cell.name.match(/(?<=cell-row-)\d*/);
                if (cellMatches.length > 0) {
                    const rowNum = cellMatches[0] as unknown;
                    const rowNum1 = rowNum as number;

                    // Swap the child
                    let srcInst = cell.children[0] as InstanceNode;

                    if (rowNum1 % 2 !== 0) {
                        // If this is an even row cell. Index is 0 based
                        // Repaint the backdrop color
                        cell.fills = [{type: 'SOLID', color: evenRowColor}];

                        const variantObj = srcInst.mainComponent['variantProperties'];

                        let destComp: ComponentNode;
                        if (srcInst.name === PRISMA_TABLE_COMPONENTS_INST_NAME['Cell - Text']) {
                            destComp = allTableComponents
                                .filter((d) => {
                                    return d.compName === PRISMA_TABLE_COMPONENTS_INST_NAME['Cell - Text'];
                                })
                                .find((d) => {
                                    return d.variantProperties['State'] === striped
                                        ? 'Default - Alt'
                                        : 'Default' &&
                                              d.variantProperties['Icon Left'] === variantObj['Icon Left'] &&
                                              d.variantProperties['Icon Right'] === variantObj['Icon Right'] &&
                                              d.variantProperties['Label'] === variantObj['Label'];
                                })['component'];
                        } else if (srcInst.name === PRISMA_TABLE_COMPONENTS_INST_NAME['Cell - Checkbox']) {
                            destComp = allTableComponents
                                .filter((d) => {
                                    return d.compName === PRISMA_TABLE_COMPONENTS_INST_NAME['Cell - Checkbox'];
                                })
                                .find((d) => {
                                    return d.variantProperties['State'] === striped
                                        ? 'Default - Alt'
                                        : 'Default' && d.variantProperties['Type'] === variantObj['Type'];
                                })['component'];
                        }
                        srcInst.swapComponent(destComp);
                    }
                    // draw the line for a cell
                    const cellLine = srcInst.findChild((e) => e.name === 'bottom border');
                    cellLine.visible = !striped;
                }
            });
        });
    }
}

// Update row height for all the rows in this table
function updateRowHeight(target: SceneNode, height: number) {
    // For now, make sure we are looking at a table

    if (!target || target.type !== 'GROUP' || target.name !== 'pa-table-container') return;

    const tableContainerEl = target as GroupNode;

    const tableEl = tableContainerEl.findOne((d) => d.name === 'pa-table') as FrameNode;
    const tableBodyEl = tableEl.findOne((d) => d.name === 'pa-table-body') as FrameNode;
    const cells = tableBodyEl.findAll((d) => d.type === 'FRAME' && d.name.includes('cell-row-')) as FrameNode[];

    cells.forEach((cel) => {
        const inst = (cel as FrameNode).children[0] as InstanceNode;

        // Update target cell height
        inst.resize(cel.width, height);
        // Rig the auto-layout again after explicitly setting the instance node's height
        inst.layoutAlign = 'STRETCH';
        inst.layoutGrow = 1;

        // Update the height for all the other cells in the same row
        cel.resize(cel.width, height);
    });
}

// TODO: If a column has just been resized, we want to re-fill the text for all the cell-text
// instances in that column
function updateColumn(source: SceneNode) {
    if (source === null) return;

    // TMP. Currently only support when the column frame is resized
    const reg = /(?<=col-)\d*/;
    const matches = source.name.match(reg);
    // if the user has just selected a column
    if (matches !== null) {
        const colEl = source as FrameNode;
        colEl.children.forEach((el) => {
            let inst = (el as FrameNode).children[0] as InstanceNode;
            fillTableBodyCellWithText(inst, el.getPluginData('cellText'));
            // console.log("cell text: ", el.getPluginData("cellText"));
        });
    }
}
// target can be a frame cell or the instance node it contains
async function updateRow(source: SceneNode) {
    // if it's a component instance
    let cell, cellHeight;

    if (tablePart(source) === TABLE_PART.BodyCellInstance) {
        cell = source.parent;
    } else if (tablePart(source) === TABLE_PART.BodyCellFrame) {
        cell = source;
    } else {
        return;
    }

    cellHeight = source.height;

    let row = rowForCell(cell);

    row.forEach((cel) => {
        const text = (cel as FrameNode).getPluginData('cellText');
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

        // Update the text
        if (text !== '') {
            fillTableBodyCellWithText(inst, text);
        }

        // Update the mouse states to be the same as the target
        updateCompMouseState(thisInst, insto);
    });
}
// if the source inst comp is HOVER/SELECTED, then find the non-hover/selected version
// if the source inst comp is alt, then find both the default and even versions

// Update the target's mouse state according to the source's: this is mostly used when we want to update the whole row
// TODO: FIXME: Not working when striped is off
// TODO: FIXME: Not quite working on header checkbox
function updateCompMouseState(source: InstanceNode, destination: InstanceNode) {
    // Find the source and the destination comp info
    const srcCompInfo: object = source.mainComponent['variantProperties'];
    const destCompInfo: object = destination.mainComponent['variantProperties'];

    // What's the desired comp we want?
    let expCompo: tableCompInfo;
    if (destination.name === PRISMA_TABLE_COMPONENTS_INST_NAME['Cell - Text']) {
        expCompo = allTableComponents
            .filter((d) => d.compName === PRISMA_TABLE_COMPONENTS_INST_NAME['Cell - Text'])
            .find((d) => {
                const _criteriaCheckboxSrc = d.variantProperties['State'] === srcCompInfo['State'];

                const _criteriaCellTextSrc =
                    d.variantProperties['Icon Left'] === destCompInfo['Icon Left'] &&
                    d.variantProperties['Icon Right'] === destCompInfo['Icon Right'] &&
                    d.variantProperties['Label'] === destCompInfo['Label'] &&
                    d.variantProperties['State'] === srcCompInfo['State'];

                if (source.name === 'Cell - Text') {
                    return _criteriaCellTextSrc;
                } else if (source.name === 'Cell - Checkbox') {
                    return _criteriaCheckboxSrc;
                } else {
                    console.error('Error assessing criteria for updating row cells.');
                    return undefined;
                }
            });
    } else if (destination.name === PRISMA_TABLE_COMPONENTS_INST_NAME['Cell - Checkbox']) {
        expCompo = allTableComponents
            .filter((d) => d.compName === PRISMA_TABLE_COMPONENTS_INST_NAME['Cell - Checkbox'])
            .filter((d) => d.variantProperties['State'] === srcCompInfo['State'])
            .find(
                (d) => d.variantProperties['Type'] === (srcCompInfo['State'] === 'Selected' ? 'Selected' : 'Unselected')
            );
    }
    if (expCompo) {
        destination.swapComponent(expCompo['component']);
    }
}

// Update the target's icon state (e.g., icon left/right/label) according to the source's while keeping the target's mouse state:
// This is mostly applicable when we want to update the whole column
function updateCompIconLabelVariant(source: InstanceNode, destination: InstanceNode) {
    // Find the source and the destination comp info

    const srcCompoInfo: object = source['variantProperties'];
    const destCompInfo: object = destination['variantProperties'];
    if (!srcCompoInfo || !destCompInfo) return;

    // What's the desired comp we want?
    const expCompo: ComponentNode = allTableComponents
        .filter((d) => d.compName === PRISMA_TABLE_COMPONENTS_INST_NAME['Cell - Text'])
        .find((d) => {
            return (
                d.variantProperties['Icon Left'] === srcCompoInfo['Icon Left'] &&
                d.variantProperties['Icon Right'] === srcCompoInfo['Icon Right'] &&
                d.variantProperties['Label'] === srcCompoInfo['Label'] &&
                d.variantProperties['State'] === destCompInfo['State']
            );
        })['component'];

    destination.swapComponent(expCompo);
}

// TODO: FIXME: Not working on header checkboxes
async function updateColumnComps(source: SceneNode) {
    if (!source || (source.type !== 'INSTANCE' && source.type !== 'FRAME')) return;

    if (
        (source.type === 'INSTANCE' && source.name === PRISMA_TABLE_COMPONENTS_INST_NAME['Cell - Text']) ||
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

        colEl.children.forEach((cellEl) => {
            let targetInst = (cellEl as FrameNode).children[0] as InstanceNode;
            updateCompIconLabelVariant(sourceInst, targetInst);
        });
    } else {
        // console.log('It IS NOT SUPPORTED...');
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

function updateColumnHeader(source: SceneNode) {
    if (!source) return;

    const reg = /(?<=col-)\d*/;
    const matches = source.name.match(reg);
    // if the user has just selected a column
    if (matches !== null) {
        const parentName = source.parent.name;
        const colIndex = matches[0];
        const w = (source as FrameNode).width;

        if (parentName !== 'pa-table-body' && parentName !== 'pa-table-header') return;

        // resize the corresponding header
        if (parentName === 'pa-table-body') {
            const headerContainer = source.parent.parent.findChild((d) => d.name === 'pa-table-header') as FrameNode;
            const columnHeaderContainer = headerContainer.findChild((d) => d.name === 'col-' + colIndex);
            columnHeaderContainer.resize(w, table_style.headerHeight);
        } else if (parentName === 'pa-table-header') {
            const boydColumnContainer = source.parent.parent.findChild((d) => d.name === 'pa-table-body') as FrameNode;
            const columnContainer = boydColumnContainer.findChild((d) => d.name === 'col-' + colIndex);
            columnContainer.resize(w, columnContainer.height);
        }
    }
}
// Update table size including the background
// TODO: Currently only updates when the title inst has been resized.
function updateTableSize(source: SceneNode) {
    console.log('>>> update table size.... for ', source);

    if (source?.type === 'INSTANCE') {
        if (source?.name === 'Card / Header') {
            const _titleInst = source as InstanceNode;
            const _tableTitle = source?.parent as FrameNode;
            const _tableEl = _tableTitle?.parent as FrameNode;
            const tableContainer = _tableEl?.parent as FrameNode;
            const _tableBackground = tableContainer?.findOne((d) => d.name === 'Table - Background');
            const _tableOverlay = tableContainer?.findOne((d) => d.name === 'pa-table-overlay');
            // update size
            _tableTitle.resize(_titleInst.width, _titleInst.height);
            let _tableHeight = 0,
                _tableWidth = _tableEl?.width;
            _tableEl?.children?.forEach((d) => {
                _tableHeight += d.height;
            });
            _tableEl?.resize(_tableWidth, _tableHeight);
            _tableBackground?.resize(_tableWidth, _tableHeight);
            _tableOverlay?.resize(_tableWidth, _tableHeight);
        }
    }
}
/* ** Return all the cells in the same row as the cell specified */
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
    return selection.length === 1 && selection[0].name === 'pa-table';
}

function drawTable(data) {
    console.log('draw table with data:::', data);

    Promise.all([drawTableTitle(data), drawTableHeader(data), drawTableBody(data)]).then(([title, header, body]) => {
        const bkg = allTableComponents
            .find((d) => d.compName === PRISMA_TABLE_COMPONENTS_INST_NAME['Table - Background'])
            ['component'].createInstance() as InstanceNode;

        const tableElWidth = 1440 - 32 * 2;
        const tableEl = figma.createFrame();
        tableEl.name = 'pa-table';
        tableEl.layoutMode = 'VERTICAL';
        tableEl.layoutGrow = 1;

        const _title = title as unknown as FrameNode;
        // _title.layoutGrow = 0; //

        const _header = header as unknown as FrameNode;
        // _header.resize(tableElWidth, table_style.headerHeight);
        _header.layoutGrow = 0; // Fixed height for header
        // _header.layoutAlign = 'STRETCH';

        const paginationEl: FrameNode = drawPagination(data);
        paginationEl.resize(tableElWidth, table_style.paginationHeight);
        paginationEl.layoutGrow = 0; // Fixed height for pagination
        // paginationEl.layoutAlign = 'STRETCH';

        // TMP: set the width to 1440 for now.
        // Record the "intrinsic" heights before appendment
        const w = tableElWidth,
            h = _header.height + body.height + table_style.paginationHeight + _title.height;

        tableEl.appendChild(_title);

        tableEl.appendChild(_header);

        body.layoutGrow = 0;
        tableEl.appendChild(body);

        tableEl.appendChild(paginationEl);

        tableEl.resize(w, h);
        bkg.resize(w, h);

        const overlayEl = figma.createFrame();
        overlayEl.name = 'pa-table-overlay';
        overlayEl.fills = [];
        overlayEl.resize(w, h);

        const tableContainer = figma.group([overlayEl, tableEl, bkg], figma.currentPage);
        tableContainer.name = 'pa-table-container';
    });
}
async function drawTableHeader(data) {
    await figma.loadFontAsync({family: 'Lato', style: 'Bold'});

    // TMP. TODO. Figure out what component we need by looking at header or the previously drawn instance

    const tableHeaderTextDefaultComp = allTableComponents.find((d) => {
        return (
            d.compName === PRISMA_TABLE_COMPONENTS_INST_NAME['Header - Text'] &&
            d.variantProperties['State'] === 'Default'
        );
    })['component'];

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
        const headerInst: InstanceNode = tableHeaderTextDefaultComp.createInstance();
        const label = headerInst.findOne((d) => d.name === 'Label') as TextNode;
        if (label) {
            label.characters = title;
        }
        headerInst.resize(table_style.columnWidth, table_style.headerHeight);
        headerInst.layoutGrow = i < headerTitles.length - 1 ? 0 : 1; // Set Last header cell to "Fill Width" while all other cells "Fixed Width"
        headerInst.layoutAlign = 'STRETCH';

        // column header
        const columnHeaderContainer = baseFrameWithAutoLayout({
            name: 'col-' + (i + 1), // leave 0 for the checkbox
            height: table_style.headerHeight,
            // width: table_style.columnWidth * headerTitles.length,
            width: table_style.columnWidth,
            padding: 0,
            itemSpacing: 0,
            direction: 'VERTICAL',
        }) as FrameNode;

        columnHeaderContainer.layoutGrow = i < headerTitles.length - 1 ? 0 : 1; // Set Last header cell to "Fill Width" while all other cells "Fixed Width"

        columnHeaderContainer.layoutAlign = 'STRETCH';

        columnHeaderContainer.appendChild(headerInst);
        headerContainer.appendChild(columnHeaderContainer);
    });

    // Add checkbox at the beginning
    const tableHeaderCheckboxDefaultComp = allTableComponents.find((d) => {
        return (
            d.compName === PRISMA_TABLE_COMPONENTS_INST_NAME['Header - Checkbox'] &&
            d.variantProperties['State'] === 'Default' &&
            d.variantProperties['Type'] === 'Unselected'
        );
    })['component'];

    const checkboxInst = tableHeaderCheckboxDefaultComp.createInstance();
    const checkboxInstContainer = baseFrameWithAutoLayout({
        name: 'col-' + 0,
        height: table_style.headerHeight,
        // width: table_style.columnWidth * headerTitles.length,
        width: table_style.rowHeight, // TMP: checkbox in Prisma DS happens to be a box
        padding: 0,
        itemSpacing: 0,
        direction: 'VERTICAL',
    }) as FrameNode;
    checkboxInstContainer.layoutGrow = 0; // so that the container to be "hug content"
    checkboxInstContainer.appendChild(checkboxInst);
    headerContainer.insertChild(0, checkboxInstContainer);

    return headerContainer;
}

// Returns title container frame
async function drawTableTitle(data) {
    await figma.loadFontAsync({family: 'Lato', style: 'Semibold'});

    const tableTitleComp = allTableComponents.find((d) => {
        return (
            d.compName === PRISMA_TABLE_COMPONENTS_INST_NAME['Card / Header'] &&
            d.variantProperties['Caption'] === 'True' &&
            d.variantProperties['Icon'] === 'False'
        );
    })['component'];

    const titleEl = tableTitleComp?.createInstance();
    const frameEl = titleEl.findOne((d) => d.name === 'Frame 1') as FrameNode;
    const textEl = frameEl?.findOne((d) => d.name === 'Title') as TextNode;
    const closeBtnEl = frameEl?.findOne((d) => d.name === 'Button - Icon Only') as InstanceNode;

    // FIXME: "Untitled" doesn't work.
    textEl.characters = data.title || 'Untitled';
    closeBtnEl.visible = false;

    const titleContainer = baseFrameWithAutoLayout({
        name: 'pa-table-title',
        // height: table_style.titleHeight,
        height: table_style.titleWithSubtitleHeight,
        // width: table_style.columnWidth * headerTitles.length,
        // width: 600,
        padding: 0,
        itemSpacing: 0,
        direction: 'HORIZONTAL',
    }) as FrameNode;

    titleContainer.layoutAlign = 'STRETCH';
    titleContainer.layoutGrow = 1;

    // titleEl.resize(960, table_style.titleHeight);

    titleContainer.appendChild(titleEl);

    titleEl.layoutGrow = 1; // Set width to be "stretch"

    return titleContainer;
}
// Draw table using the d3 update pattern(e.g., enter/update/exit).
// Using imported external components.
// TODO: Move 'pa-table-body' to a const
// The component we use need to be loaded first, plus all the assets
// such as fonts and styles(?)
async function drawTableBody(data, limitRows: number = 25) {
    await figma.loadFontAsync({family: 'Lato', style: 'Regular'});

    // TMP. TODO. Figure out what component we need by looking at header or the previously drawn instance
    const tableCellTextDefaultComp = allTableComponents.find(
        (d) =>
            d.compName === PRISMA_TABLE_COMPONENTS_INST_NAME['Cell - Text'] &&
            d.variantProperties['State'] === 'Default' &&
            d.variantProperties['Label'] === 'True' &&
            d.variantProperties['Icon Left'] === 'False' &&
            d.variantProperties['Icon Right'] === 'False'
    )['component'];

    const tableCellTextStripedEvenRowComp = allTableComponents.find(
        (d) =>
            d.compName === PRISMA_TABLE_COMPONENTS_INST_NAME['Cell - Text'] &&
            d.variantProperties['State'] === 'Default - Alt' &&
            d.variantProperties['Label'] === 'True' &&
            d.variantProperties['Icon Left'] === 'False' &&
            d.variantProperties['Icon Right'] === 'False'
    )['component'];

    const tableCellCheckboxDefaultComp = allTableComponents.find(
        (d) =>
            d.compName === PRISMA_TABLE_COMPONENTS_INST_NAME['Cell - Checkbox'] &&
            d.variantProperties['State'] === 'Default'
    )['component'];

    const tableCellCheckboxStripedEvenRowComp = allTableComponents.find(
        (d) =>
            d.compName === PRISMA_TABLE_COMPONENTS_INST_NAME['Cell - Checkbox'] &&
            d.variantProperties['State'] === 'Default - Alt'
    )['component'];

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
            padding: [6, 0],
        });
        sel = figma.currentPage.selection = [foc] as FrameNode[];
    }

    // row based data source
    let datagrid = data.rows;

    if (limitRows > 0) {
        datagrid = _.chain(data.rows).take(limitRows).value();
    }

    // column based data source
    const dataframe = transpose(datagrid);

    if (sel.length === 1 && sel[0].name === 'pa-table-body') {
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
            // Text
            const colEl = frameNodeOn({parent: tableEl, colIndex: i + 1}); // leave 0 for the checkbox
            colEl.layoutGrow = i < dataframe.length - 1 ? 0 : 1;

            const cellsData = cells as [];
            cellsData.forEach((cell, j) => {
                // Enter/Upate
                const cellContainer = frameNodeOn({
                    parent: colEl,
                    colIndex: i + 1,
                    rowIndex: j,
                    frameType: 'CELL',
                    height: rowHeight,
                });
                // Set up resizing to be w: 'Fill Container'/h: 'Fixed Height'
                // TODO: w: 'Fill COntainer' / h: 'Hug content'
                cellContainer.layoutGrow = 0;
                cellContainer.layoutAlign = 'STRETCH';

                // Set up for alternate row coloring. Note index starts from 0
                const text = (cell as any).toString();
                const t =
                    j % 2 == 0
                        ? tableBodyCellWithText(colEl, j, tableCellTextDefaultComp, text)
                        : tableBodyCellWithText(colEl, j, tableCellTextStripedEvenRowComp, text);

                // Set up resizing to be h: 'Fill Container'/w: 'Fill Container'
                // This will cause this instance node to fill the parent cell frame when
                // the parent cell frame resizes
                t.layoutAlign = 'STRETCH'; //'MIN';
                t.layoutGrow = 1;
                t.resize(t.width, rowHeight);
                cellContainer.appendChild(t);

                // Write the text as meta data to the parent frame so that we can use it when we resize.
                cellContainer.setPluginData('cellText', text);
            });
        });

        // Checkbox
        // const colEl0 = frameNodeOn({parent: tableEl, colIndex: 0, width: table_style.rowHeight });
        const colEl0 = baseFrameWithAutoLayout({
            name: 'col-' + 0,
            // height: table_style.rowHeight,
            // width: table_style.columnWidth * headerTitles.length,
            width: table_style.rowHeight, // TMP: checkbox in Prisma DS happens to be a box
            padding: 0,
            itemSpacing: 0,
            direction: 'VERTICAL',
        }) as FrameNode;

        colEl0.layoutGrow = 0;
        tableEl.insertChild(0, colEl0);

        const cellsData = dataframe[0] as [];
        cellsData.forEach((_, j) => {
            const ck =
                j % 2 === 0
                    ? tableCellCheckboxDefaultComp.createInstance()
                    : tableCellCheckboxStripedEvenRowComp.createInstance();

            const cellContainer = frameNodeOn({
                parent: colEl0,
                colIndex: 0,
                rowIndex: j,
                frameType: 'CELL',
                height: rowHeight,
            });
            cellContainer.layoutGrow = 0; // so that it hugs content
            cellContainer.appendChild(ck);
            cellContainer.resize(table_style.rowHeight, table_style.rowHeight);
        });
        colEl0.resize(table_style.rowHeight, colEl0.height);

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
    let tableCell: InstanceNode;
    if (parent.children.length > rowIndex && parent.children[rowIndex].type === 'INSTANCE') {
        tableCell = parent.children[rowIndex] as InstanceNode;
    } else {
        tableCell = comp.createInstance();
    }
    text = text.toString();
    fillTableBodyCellWithText(tableCell, text);

    return tableCell;
}
// Set the characters for the text node in an instance of Cell - Text based on available space for the text
// TODO: FIXME: Currently only works on text only cells. TODO: Support cells with icons.
async function fillTableBodyCellWithText(tableCell: InstanceNode, originalText: string) {
    await figma.loadFontAsync({family: 'Lato', style: 'Regular'});

    if (tableCell.name !== PRISMA_TABLE_COMPONENTS_INST_NAME['Cell - Text']) return;

    const textEl = tableCell.findChild((n) => n.type === 'TEXT') as TextNode;

    let truncatedLength = charactersPerArea(tableCell.width, tableCell.height);

    const _text: string =
        originalText.substring(0, truncatedLength) + (originalText.length > truncatedLength ? '...' : '');
    textEl.characters = _text;
}

function drawPagination(data): FrameNode {
    // Are we looking at an existing table?
    let sel = figma.currentPage.selection;
    let container: FrameNode;
    let paginationInst: InstanceNode;
    if (isTable(sel)) {
        // If we are looking at an existing table
        const tableEl = sel[0] as FrameNode;
        container = tableEl.findChild((d) => d.name === 'pa-table-pagination') as FrameNode;
        paginationInst = container.findChild((d) => d.name === 'Pagination') as InstanceNode;
    } else {
        // If we are creating something new
        container = baseFrameWithAutoLayout({name: 'pa-table-pagination', itemSpacing: 0, padding: 0}) as FrameNode;
        paginationInst = allTableComponents
            .find((d) => d.compName === PRISMA_TABLE_COMPONENTS_INST_NAME.Pagination)
            ['component'].createInstance() as InstanceNode;
        paginationInst.layoutGrow = 1;
        container.appendChild(paginationInst);
        container.resize(paginationInst.width, paginationInst.height);
        container.layoutGrow = 1;
        container.layoutAlign = 'MIN';
    }

    // Update the counter
    const count = data['rows'] ? data['rows'].length : undefined;
    const text = paginationInst.findChild((d) => d.type === 'TEXT') as TextNode;
    text.characters = `Displaying ${count} results of [000]`;

    return container;
}

function logSelection() {
    const sel = figma.currentPage.selection;
    console.clear();
    const _keyInfo = sel[0].type === 'INSTANCE' ? `key: ${(sel[0] as InstanceNode).mainComponent.key}` : ``;
    console.log(`${_keyInfo}\nname: ${sel[0].name}`);
    console.log('sel: ', sel[0]);
}

async function loadAllTableComponents() {
    if (_tableComponentsLoaded) {
        console.log('++++++we have all components: ', allTableComponents);
        return;
    }

    for (const {key} of PRISMA_TABLE_COMPONENT_SAMPLES) {
        const comp = await figma.importComponentByKeyAsync(key);
        const inst = comp.createInstance();

        const mainComponent = inst.mainComponent;
        const mainComponentParentNode = mainComponent?.parent;
        if (mainComponentParentNode && mainComponentParentNode.type === 'COMPONENT_SET') {
            // if it's a component set, e.g., Cell - Text
            const componentSetName = mainComponentParentNode.name;
            PRISMA_TABLE_COMPONENT_NAMES.add(componentSetName);
            const allCompsInSet = mainComponentParentNode.children as ComponentNode[];
            const comps = allCompsInSet.map((comp) => ({
                compName: componentSetName,
                variantProperties: comp['variantProperties'],
                component: comp,
                key: comp.key,
            }));
            allTableComponents = [...allTableComponents, ...comps];
        } else {
            // if it's not a set, e.g., Table - Background, which has only one component
            const tableComp1: tableCompInfo = {
                compName: mainComponent.name,
                variantProperties: mainComponent['variantProperties'],
                component: mainComponent,
                key: mainComponent.key,
            };
            allTableComponents = [...allTableComponents, tableComp1];
        }
        inst.remove();
    }

    _tableComponentsLoaded = true;

    // console.log("___+++now we should have all components: ", allTableComponents);
}

async function _loadSomeComponentsFromFigmaDS() {
    const _compKeys = ['be67cfb6dd2772a959bcb2feed1fc50658b91392'];

    const _frame = baseFrameWithAutoLayout({
        direction: 'HORIZONTAL',
        nodeType: 'FRAME',
    });

    let w = 0,
        h = 0;
    for (const key of _compKeys) {
        const comp = await figma.importComponentByKeyAsync(key);
        const inst = comp.createInstance();
        w += inst.width;
        h = inst.height > h ? inst.height : h;
        _frame.resize(w, h);
        _frame.appendChild(inst);

        inst.layoutGrow = 0;
        inst.layoutAlign = 'MIN';
    }
}
function log() {
    logSelection();
}

function test() {
    _loadSomeComponentsFromFigmaDS();
    // drawTableTitle()
    // loadAllTableComponents();
    // _testPaddings();
    // console.log("let's load external component...");
    // tableBodyCellWithText("one two three");
    // logSelection();
}
