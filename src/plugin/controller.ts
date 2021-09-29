import * as _ from 'lodash';
// import {prisma_cloud_policies, prisma_cloud_alerts, artists, songs} from '../app/assets/datasets.js';
import {baseFrameWithAutoLayout, configFoCWithAutoLayout, transpose} from '../shared/utils';

// FIXME: If some columns are deleted, things will stop working
// var meta_tables: {id: string, cols: number}[] = [];
const table_style = {rowHeight: 36, columnWidth: 160};
const settings = {
    "manual-update": false,
}

// const bodySRegularStyleId = 'S:9368379dc9395a663811d1eb894e2c5c21793701,33995:33';
// You can get the key of a main component by first creating an instance and then instanceNode.mainComponent.key
// const tableBodyCellDefaultComponentKey = '52f8db8c3eb06811177462ca81794c1e1b80b36d'; ////////
// const tableBodyCellStripedEvenRowComponentKey = 'aeae4ca0fb4b52e8501f7288bd71859b5ff87df1'; ////////
const tableBodyCellDefaultIconLeftComponentKey = '7c7c603f0d37e6cb2b21149b865d3eeb6ea70c4e'; ////////
// const tableBodyCellDefaultIconRightComponentKey = '414c2a284ecd78ef15d9fa3b5abd33635f29cf38'; ////////
// const tableBodyCellDefaultIconBothComponentKey = '4b3a13c71ecd87ecb955f3c27be566b5d1fa64d3'; ////////
const tableBodyCellStripedEvenRowIconLeftComponentKey = '1b38e2108373907af387083e7c80614289cb323a'; ////////
// const tableBodyCellStripedEvenRowIconRightComponentKey = '943c5b15b37a43f61753ff62e8e36fddcb4ce472'; ////////
// const tableBodyCellStripedEvenRowIconBothComponentKey = '07ad0a31821a24c118ecdd7b258637be5fb5b400'; ////////
// const tableBodyCellHoverComponentKey = '3782e1e0a293fb1272f309e9dea168bf5253912e'; ////////
// const tableBodyCellSelectedComponentKey = '2cffc40473d91e306a8abd83de636cc6bf2a665c'; ////////

enum MouseState {
    Default, Hover, Selected
}
enum IconState {
    None, Left, Right, LeftAndRight,
}
enum StripedCell {
    None, Even
}
enum TableCellVariant {
     CellDefault,
     CellStripedEvenRow,
     CellIconLeft,
     CellIconRight,
     CellIconLeftAndRight,
     CellStripedEvenRowIconLeft,
     CellStripedEvenRowIconRight,
     CellStripedEvenRowIconLeftAndRight,
     CellHover,
     CellHoverIconLeft,
     CellHoverIconRight,
     CellHoverIconBoth,
     CellSelected,
     CellSelectedIconLeft,
     CellSelectedIconRight,
     CellSelectedIconBoth,
}

const PRISMA_TABLE_CELL_COMPONENTS: {variant: TableCellVariant; key: string; comp: any; mouseState: MouseState}[] = [
    {
        variant: TableCellVariant.CellDefault,
        key: '52f8db8c3eb06811177462ca81794c1e1b80b36d',
        comp: null,
        mouseState: MouseState.Default,
    },
    {
        variant: TableCellVariant.CellStripedEvenRow,
        key: 'aeae4ca0fb4b52e8501f7288bd71859b5ff87df1',
        comp: null,
        mouseState: MouseState.Default,
    },
    {
        variant: TableCellVariant.CellIconLeft,
        key: '7c7c603f0d37e6cb2b21149b865d3eeb6ea70c4e',
        comp: null,
        mouseState: MouseState.Default,
    },
    {
        variant: TableCellVariant.CellIconRight,
        key: '414c2a284ecd78ef15d9fa3b5abd33635f29cf38',
        comp: null,
        mouseState: MouseState.Default,
    },
    {
        variant: TableCellVariant.CellIconLeftAndRight,
        key: '4b3a13c71ecd87ecb955f3c27be566b5d1fa64d3',
        comp: null,
        mouseState: MouseState.Default,
    },
    {
        variant: TableCellVariant.CellStripedEvenRowIconLeft,
        key: '1b38e2108373907af387083e7c80614289cb323a',
        comp: null,
        mouseState: MouseState.Default,
    },
    {
        variant: TableCellVariant.CellStripedEvenRowIconRight,
        key: '943c5b15b37a43f61753ff62e8e36fddcb4ce472',
        comp: null,
        mouseState: MouseState.Default,
    },
    {
        variant: TableCellVariant.CellStripedEvenRowIconLeftAndRight,
        key: '07ad0a31821a24c118ecdd7b258637be5fb5b400',
        comp: null,
        mouseState: MouseState.Default,
    },
    {
        variant: TableCellVariant.CellHover,
        key: '3782e1e0a293fb1272f309e9dea168bf5253912e',
        comp: null,
        mouseState: MouseState.Hover,
    },
    {
        variant: TableCellVariant.CellHoverIconLeft,
        key: '271f306487b02aadbd8e91fa00bc07441ad66bc6',
        comp: null,
        mouseState: MouseState.Hover,
    },
    {
        variant: TableCellVariant.CellHoverIconRight,
        key: 'ad98c22abd70dc4cc7c416f4d60236eae8af64d8',
        comp: null,
        mouseState: MouseState.Hover,
    },
    {
        variant: TableCellVariant.CellHoverIconBoth,
        key: 'bad9f37873cdfe29d1a3e3109481316ced867fef',
        comp: null,
        mouseState: MouseState.Default,
    },
    {
        variant: TableCellVariant.CellSelected,
        key: '2cffc40473d91e306a8abd83de636cc6bf2a665c',
        comp: null,
        mouseState: MouseState.Selected,
    },
    {
        variant: TableCellVariant.CellSelectedIconLeft,
        key: '5f0ce4db2559489c1f6d64de01e087fc71990c50',
        comp: null,
        mouseState: MouseState.Selected,
    },
    {
        variant: TableCellVariant.CellSelectedIconRight,
        key: '4d1a18c202a9add97412f4773de1bdab6bd252e6',
        comp: null,
        mouseState: MouseState.Selected,
    },
    {
        variant: TableCellVariant.CellSelectedIconBoth,
        key: '7596452dfedf909c25cfad654b2c40a6fef34311',
        comp: null,
        mouseState: MouseState.Selected,
    },
];

// const tableActionCellComponentKey = '0c261446286f17942208d7c617d9ad7feacd0335';
const ROW_HEIGHT = {
    cozy: 44,
    default: 32,
    compact: 24,
};


// figma.importComponentByKeyAsync('aeae4ca0fb4b52e8501f7288bd71859b5ff87df1')
// .then(comp => console.log("comp loaded:::", comp))
// .catch(error => console.error("error:", error))

// First making sure all Table Cell components are loaded, then show the UI
PRISMA_TABLE_CELL_COMPONENTS.forEach(d => {
    d.comp = figma.importComponentByKeyAsync(d.key);
});

Promise.all(PRISMA_TABLE_CELL_COMPONENTS.map((d) => d.comp))
    .then((comps) => {
        comps.forEach((comp, i) => {
            PRISMA_TABLE_CELL_COMPONENTS[i]['comp'] = comp;
        });
    })
    .then(() => {
        figma.showUI(__html__, {height: 320});
    })
    .catch((error) => {
        console.error('error in loading Prisma Table cell components', error);
    });

// figma.showUI(__html__, {height: 320});

function tableCellComp( variant:TableCellVariant ):ComponentNode {
    // if(!TableCellVariant.hasOwnProperty(variant)) return null;
    const obj = PRISMA_TABLE_CELL_COMPONENTS.find(d => d.variant === variant);
    return obj? obj.comp : null;
}
// We store which node we are interacting with
// TODO: store the whole array of current page selection
figma.on("selectionchange", () => {
    // We'll do nothing if the user wants manual upate
    if(settings['manual-update']) return;

    if(figma.currentPage.getPluginData('selectedEl') !== "" 
        && figma.currentPage.selection.length === 0) 
        // if the user just de-selected something, we may want to update the row 
        {
            const targetObj = JSON.parse(figma.currentPage.getPluginData('selectedEl'));
            if(targetObj.type === 'FRAME' || targetObj.type === 'INSTANCE') {
                const target = figma.currentPage.findOne(n => n.id === targetObj.id);
                updateRow(target);
                updateColumnComps(target);
            } else if (targetObj.type === 'TEXT') {
                // if the previous node was a text node and the rest of the column is not????
                const target = figma.currentPage.findOne(n => n.id === targetObj.id) as TextNode;
                // TMP. TODO
                updateColumnIcons(target);
            }
    }
    // Store the selection so we can use in the next change event
    if(figma.currentPage.selection.length > 0) {
        const el = figma.currentPage.selection[0];
        const obj = {
            "name": el.name,
            "type": el.type,
            "id": el.id,
        };
        figma.currentPage.setPluginData('selectedEl', JSON.stringify(obj));
    }
}
)

figma.ui.onmessage = (msg) => {
    switch(msg.type) {
        case 'update-settings':
            updateSettings(msg)
            break;
        case 'create-table':
            drawTableWithComponents(msg.dataset);
            break;
        case 'update-table':
            drawTableWithComponents(msg.dataset);
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

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Settings
function updateSettings(msg: any) {
    if(msg.setting === 'manual-update') {
        settings['manual-update'] = msg.value;
    }
    
    console.log("update settings::", msg, "now manual setting is:", settings['manual-update']);
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
    width = 400,
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
            colEl.children.forEach(c => c.remove());
            return colEl;
        } else {
            const colEl = baseFrameWithAutoLayout({name: colName, 
                nodeType: 'FRAME', direction: 'VERTICAL', width: width, padding: 0}) as FrameNode;
            parent.appendChild(colEl);
            return colEl;
        }
    } else if(frameType === 'CELL') {
        const cell = parent.children[rowIndex];
        // Something like 'cell-row-3-col-0'
        const cellName = 'cell-row-' + rowIndex + '-col-' + colIndex;
        if(cell) {
            cell.name = cellName;
            const cellEl = cell as FrameNode;
            cellEl.children.forEach(c => c.remove());
            return cellEl;
        } else {
            // direction is VERTICAL so that the content of the instance node can wrap when resized
            const cellEl = baseFrameWithAutoLayout({name: cellName, nodeType: 'FRAME', 
            direction: 'VERTICAL', height: height, width: width, padding: 0}) as FrameNode;
            parent.appendChild(cellEl);
            return cellEl;
        }
    }
    return null;
}

function updateStriped(striped:boolean) {
    
    // First select the table body, pls
    if(figma.currentPage.selection.length === 0) return;
   
    const tableEl = figma.currentPage.selection[0] as FrameNode;
    const evenRowColor = striped? {r: 244/255, g: 245/255, b: 245/255} :{r: 1, g: 1, b: 1};
    if(tableEl.name === 'pa-table-body') {
        const reg = /(?<=cell-row-)\d*/;
        tableEl.children.forEach(colEl => {
            
            const col = colEl as FrameNode;

            col.children.forEach(cellEl => {
                const cell = cellEl as FrameNode;
                const cellMatches = cell.name.match(reg);
                if(cellMatches.length > 0) {
                    const rowNum = cellMatches[0] as unknown;
                    const rowNum1 = rowNum as number;
                    // Swap the child
                    let cellComp = cell.children[0] as InstanceNode;
                    if (rowNum1 % 2 !== 0 ) { // this is an even row cell. Index is 0 based
                        // Repaint the backdrop color
                        cell.fills = [{type: 'SOLID', color: evenRowColor}];
                        cellComp.swapComponent(tableCellComp(TableCellVariant.CellDefault));
                    }
                    // draw the line for a cell
                    const cellLine = cellComp.findChild(e => e.name === 'bottom border');
                    cellLine.visible = !striped;
                }
            })
        })
    }
}
// target can be a frame cell or the instance node it contains
async function updateRow(target: SceneNode) {
    
    if(!target || (target.type !== 'INSTANCE' && target.type !== 'FRAME' )) return;

    if((target.type === 'INSTANCE' && target.name === 'Cell - Text') || 
    (target.type === 'FRAME' && target.name.includes("cell-row-"))) { // if it's a component instance
        let cell, cellHeight;
        cellHeight = target.height;

        if(target.type === 'INSTANCE') {
            cell = target.parent;
        } else if(target.type === 'FRAME') {
            cell = target;
        }
    
        let row = rowForCell(cell);

        row.forEach(cel => {
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
            // copyComp(thisInst, insto);
            updateCompMouseState(thisInst, insto);
            
        })
    }
}
// if the source inst comp is HOVER/SELECTED, then find the non-hover/selected version
// if the source inst comp is alt, then find both the default and even versions

// Update the target's mouse state according to the source's
function updateCompMouseState(source: FrameNode | InstanceNode | TextNode, target: InstanceNode) {
    let sourceInst: InstanceNode;

    if(source.type === 'INSTANCE') {
        sourceInst = source;
    } else if(source.type === 'FRAME') {
        sourceInst = source.children[0] as InstanceNode;
    } else if(source.type === 'TEXT') {
        sourceInst = source.parent as InstanceNode;
    }
    // what's the mouse state
    const mouseState = PRISMA_TABLE_CELL_COMPONENTS.find( d => d.key === sourceInst.mainComponent.key ).mouseState;
    console.log("Mouse state turns out to be:", mouseState);
    // mainComponent.name === "Icon Left=True, Icon Right=False, Label=True, State=Default - Alt"
    // const mouseState:string = 
}
function updateCompIconVariant(source: FrameNode | InstanceNode | TextNode, target: InstanceNode) {

}
// Make the target instance the same comp as the source
function copyComp(source: FrameNode | InstanceNode | TextNode, target: InstanceNode) {
    // find the comp instance
    let sourceInst: InstanceNode;

    if(source.type === 'INSTANCE') {
        sourceInst = source;
    } else if(source.type === 'FRAME') {
        sourceInst = source.children[0] as InstanceNode;
    } else if(source.type === 'TEXT') {
        sourceInst = source.parent as InstanceNode;
    }

    // find the main comp
    const comp:ComponentNode = PRISMA_TABLE_CELL_COMPONENTS
                                .find( d => d.key === sourceInst.mainComponent.key).comp;
    // swap
    target.swapComponent(comp);
}
async function updateColumnComps(source: SceneNode) {
    // TODO
    return;
    if(!source || (source.type !== 'INSTANCE' && source.type !== 'FRAME' )) return;

    if((source.type === 'INSTANCE' && source.name === 'Cell - Text') || 
    (source.type === 'FRAME' && source.name.includes("cell-row-"))) { 
        // find all the instance for the column
        let sourceCell: InstanceNode;
        if(source.type === 'INSTANCE') {
            sourceCell = source;
        } else if(source.type === 'FRAME') {
            sourceCell = source.children[0] as InstanceNode;
        }
        
        const colEl = sourceCell.parent.parent as FrameNode;
        colEl.children.forEach( el => {
            // align instance
            let target = (el as FrameNode).children[0] as InstanceNode;
            copyComp(sourceCell, target);
        });
    }

}

async function updateColumnIcons(targetCell: SceneNode) {
    const tableBodyCellDefaultIconLeftComponent = await figma.importComponentByKeyAsync(tableBodyCellDefaultIconLeftComponentKey);
    const tableBodyCellStripedEvenRowIconLeftComponent = await figma.importComponentByKeyAsync(tableBodyCellStripedEvenRowIconLeftComponentKey);
    
    console.log("we think we might need to change the icon!", targetCell);
    // For now, we only assume it's a text node
    if(targetCell.type !== 'TEXT') return;
    const tar = targetCell as TextNode;
    const colEl = tar.parent.parent.parent;
    colEl.children.forEach((cellEl, rowIndex) => {
        const inst = (cellEl as FrameNode).children[0] as InstanceNode;
        if(inst.mainComponent.key !== tableBodyCellDefaultIconLeftComponentKey &&
            inst.mainComponent.key !== tableBodyCellStripedEvenRowIconLeftComponentKey ) {
                inst.swapComponent(rowIndex % 2 === 0? tableBodyCellDefaultIconLeftComponent : 
                    tableBodyCellStripedEvenRowIconLeftComponent);
            // Update all the instances
            // If the new instance includes icons, also update icons
        } else {
           
        }
        console.log("inst::", inst.name);
        
    })
    
    // change all the column cells to the same type?
    // update the icons
}

function rowForCell(cell: SceneNode): SceneNode[] {
    const reg = /\d+/;
    const rowMatches = cell.name.match(reg);
    if(rowMatches.length > 0) {
        let result = [];
        const rowIndex = rowMatches[0];
        const tableEl =  cell.parent.parent;

        tableEl.children.forEach((colNode, j) => {
            const colEl = colNode as DefaultFrameMixin;
            // cell-row-0-col-0
            const celEl = colEl.findChild(n => n.type === 'FRAME' && n.name === 'cell-row-'+ rowIndex + '-col-' + j);                   
            result.push(celEl);
        })
        return result;
    }
    return null;
}

// Select all the cells in the row where the user needs to select a cell on this row first.
function selectRow() {
    const sel = figma.currentPage.selection.concat()[0];
    let cell;
    
    if(sel.type === 'INSTANCE') {
        cell = sel.parent;
    } else if(sel.type === 'FRAME') {
        cell = sel;
    }

    let _row = rowForCell(cell);
    if(_row) figma.currentPage.selection = _row;
}
// Quick and dirty way to see if the selection is a table
function isTable(selection:readonly SceneNode[]): boolean {
    return selection.length == 1 && selection[0].name.includes('pa-table-body');
}

// Draw table using the d3 update pattern(e.g., enter/update/exit).
// TODO: Move 'pa-table-body' to a const
// The component we use need to be loaded first, plus all the assets
// such as fonts and styles(?)
async function drawTableWithComponents(data) {
    await figma.loadFontAsync({family: 'Lato', style: 'Regular'});
    
    const tableBodyCellDefaultComp =  tableCellComp(TableCellVariant.CellDefault);
    const tableBodyCellStripedEvenRowComp = tableCellComp(TableCellVariant.CellStripedEvenRow);
    
    const rowHeight = ROW_HEIGHT.default;

    let sel = figma.currentPage.selection;
    if (sel.length === 0) {
        
        // if nothing is selected, go ahead and create a baseFrameWithAutoLayout and proceed
        const bodyContainer = baseFrameWithAutoLayout({ name: "pa-table-body", 
        itemSpacing: 0 }) as FrameNode;
        sel = figma.currentPage.selection = [bodyContainer] as FrameNode[];
    
    } else if(sel[0].type === 'FRAME' && sel[0].children.length === 0) {
        // if selection is an empty frame, configure it using autolayout for table and proceed
        let foc = sel[0];
        configFoCWithAutoLayout({
            foc: foc,
            name: 'pa-table-body',
            width: foc.width,
            height: foc.height
        });
        sel = figma.currentPage.selection = [foc] as FrameNode[];
    }

    // row based data source
    const datagrid = _.chain(data.rows)
        .take(10)
        .value();

    // column based data source
    const dataframe = transpose(datagrid);
    
    if(isTable(sel)) { 
        // See if the selection is a table by checking out the name of the frame
        
        const tableEl = sel[0] as FrameNode;
        const colsEl = tableEl.children as FrameNode[];
        const existingColCount = colsEl.length;
        const newColCount = dataframe.length;
        const existingRowCount = existingColCount === 0? 0 : (colsEl[0].children as FrameNode[]).length;
        const newRowCount = datagrid.length;

        dataframe.forEach((cells, i) => {
            // Enter
            const colEl = frameNodeOn({parent: tableEl, colIndex: i});
            // colEl.primaryAxisSizingMode = 'FIXED';
            const cellsData = cells as [];
            cellsData.forEach((cell, j) => {
                // Enter/Upate
                const cellContainer = frameNodeOn({parent: colEl, 
                        colIndex: i, rowIndex: j, frameType: 'CELL', height: rowHeight});
                 // Set up resizing to be w: 'Fill Container'/h: 'Fixed Height' 
                 // TODO: w: 'Fill COntainer' / h: 'Hug content'
                cellContainer.layoutAlign = 'STRETCH';
                cellContainer.layoutGrow = 0;

                // Set up for alternate row coloring. Note index starts from 0
                const t = j%2 == 0 ? tableBodyCellWithText(colEl, j, tableBodyCellDefaultComp, cell as string) : 
                                tableBodyCellWithText(colEl, j, tableBodyCellStripedEvenRowComp, cell as string);
               
                // Set up resizing to be h: 'Fill Container'/w: 'Fill Container'
                // This will cause this instance node to fill the parent cell frame when
                // the parent cell frame resizes
                t.layoutAlign = 'STRETCH';//'MIN';
                t.layoutGrow = 1;
                t.resize(t.width, rowHeight);
                cellContainer.appendChild(t);
            })
            
        });

        // Exit
        if(newColCount < existingColCount || newRowCount < existingRowCount) {
            
            colsEl.forEach((colEl, i) => {
                const rowsEl = colEl.children as FrameNode[];
                rowsEl.forEach((rowEl, j) => {
                    // remove extra rows
                    if(j >= newRowCount) {
                        rowEl.remove();
                    }
                })
                // remove the extra columns
                if(i >= newColCount) {
                    colEl.remove();
                }
            })
        }
    }

    figma.viewport.scrollAndZoomIntoView(sel);
    figma.currentPage.selection = sel;
}
// NOTE: The client function needs to loadFontAsync at the top of the function
function tableBodyCellWithText(
    parent: FrameNode,
    rowIndex: number,
    comp: ComponentNode,
    text: string = 'ipsum loram!'
): InstanceNode {
    let tableCell;
    if (parent.children.length > rowIndex && 
        parent.children[rowIndex].type === 'INSTANCE') {
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
    console.log("sel:", sel[0]);
}
function test() {
    console.log("let's load external component...");
    // tableBodyCellWithText("one two three");
    logSelection();
}
