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
// const tableHeaderCellHoverComponentKey = '3782e1e0a293fb1272f309e9dea168bf5253912e';
const tableBodyCellDefaultComponentKey = '52f8db8c3eb06811177462ca81794c1e1b80b36d';
const tableBodyCellStripedEvenRowComponentKey = 'aeae4ca0fb4b52e8501f7288bd71859b5ff87df1';
const tableBodyCellDefaultIconLeftComponentKey = '7c7c603f0d37e6cb2b21149b865d3eeb6ea70c4e';
// const tableBodyCellDefaultIconRightComponentKey = '414c2a284ecd78ef15d9fa3b5abd33635f29cf38';
// const tableBodyCellDefaultIconBothComponentKey = '4b3a13c71ecd87ecb955f3c27be566b5d1fa64d3';
const tableBodyCellStripedEvenRowIconLeftComponentKey = '1b38e2108373907af387083e7c80614289cb323a';
// const tableBodyCellStripedEvenRowIconRightComponentKey = '943c5b15b37a43f61753ff62e8e36fddcb4ce472';
// const tableBodyCellStripedEvenRowIconBothComponentKey = '07ad0a31821a24c118ecdd7b258637be5fb5b400';
// const tableBodyCellHoverComponentKey = '52f8db8c3eb06811177462ca81794c1e1b80b36d';
// const tableActionCellComponentKey = '0c261446286f17942208d7c617d9ad7feacd0335';
const ROW_HEIGHT = {
    cozy: 44,
    default: 32,
    compact: 24,
};

figma.showUI(__html__, {height: 320});

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
                updateRowHeight(target);
            } else if (targetObj.type === 'TEXT') {
                // if the previous node was a text node and the rest of the column is not????
                const target = figma.currentPage.findOne(n => n.id === targetObj.id) as TextNode;
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
            updateRowHeight(target);
            break;
        case 'test':
            test();
            break;
        case 'cancel':
            break;
        default:
            break;
    }
    // if (msg.type === 'create-table') {
       
        // const nodes = [];

        // for (let i = 0; i < msg.count; i++) {
        //     const rect = figma.createRectangle();
        //     rect.x = i * 150;
        //     rect.fills = [{type: 'SOLID', color: {r: 1, g: 0.5, b: 0}}];
        //     figma.currentPage.appendChild(rect);
        //     nodes.push(rect);
        // }

        // figma.currentPage.selection = nodes;
        // figma.viewport.scrollAndZoomIntoView(nodes);

        // // This is how figma responds back to the ui
        // figma.ui.postMessage({
        //     type: 'create-rectangles',
        //     message: `Created ${msg.count} Rectangles`,
        // });
        
    // }

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

async function updateStriped(striped:boolean) {
    const tableBodyCellDefaultComp = await figma.importComponentByKeyAsync(tableBodyCellDefaultComponentKey);
    // const tableBodyCellStripedEvenRowComp = await figma.importComponentByKeyAsync(tableBodyCellStripedEvenRowComponentKey);
    
    // First select the table body, pls
    if(figma.currentPage.selection.length === 0) return;
    // TMP
    const tableEl = figma.currentPage.selection[0] as FrameNode;
    const color = striped? {r: 244/255, g: 245/255, b: 245/255} :{r: 1, g: 1, b: 1};
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
                    if (rowNum1 % 2 === 0 ) { // this is an even row cell
                        // Repaint the backdrop color
                        cell.fills = [{type: 'SOLID', color: color}];
                        // Swap the child
                        let cellComp = cell.children[0] as InstanceNode;
                        if(tableBodyCellDefaultComp) {
                            cellComp.swapComponent(tableBodyCellDefaultComp);
                        }
                    }
                }
            })
        })
    }
}
// target can be a frame cell or the instance node it contains
function updateRowHeight(target: SceneNode) {
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
            const inst = cell.children[0] as InstanceNode;
            inst.resize(cel.width, cellHeight);
            // Rig the auto-layout again after explicitly setting the instance node's height
            inst.layoutAlign = 'STRETCH';
            inst.layoutGrow = 1;
            cel.resize(cel.width, cellHeight);
        })
    }
}

async function updateColumnIcons(target: SceneNode) {
    const tableBodyCellDefaultIconLeftComponent = await figma.importComponentByKeyAsync(tableBodyCellDefaultIconLeftComponentKey);
    const tableBodyCellStripedEvenRowIconLeftComponent = await figma.importComponentByKeyAsync(tableBodyCellStripedEvenRowIconLeftComponentKey);
    
    console.log("we think we might need to change the icon!", target);
    // For now, we only assume it's a text node
    if(target.type !== 'TEXT') return;
    const tar = target as TextNode;
    const colEl = tar.parent.parent.parent;
    console.log("colEl:::", colEl.name);
    colEl.children.forEach((cellEl, rowIndex) => {
        console.log("cellEl::", cellEl.name, "; index:", rowIndex);
        const inst = (cellEl as FrameNode).children[0] as InstanceNode;
        if(inst.mainComponent.key !== tableBodyCellDefaultIconLeftComponentKey &&
            inst.mainComponent.key !== tableBodyCellStripedEvenRowIconLeftComponentKey ) {
                inst.swapComponent(rowIndex % 2 === 0? tableBodyCellDefaultIconLeftComponent : 
                    tableBodyCellStripedEvenRowIconLeftComponent);    
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
    console.log("calling select row...");
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
    // await figma.loadFontAsync({family: 'Roboto', style: 'Regular'});
    await figma.loadFontAsync({family: 'Lato', style: 'Regular'});
    const tableBodyCellDefaultComp = await figma.importComponentByKeyAsync(tableBodyCellDefaultComponentKey);
    const tableBodyCellStripedEvenRowComp = await figma.importComponentByKeyAsync(tableBodyCellStripedEvenRowComponentKey);
    const rowHeight = ROW_HEIGHT.default;
    // TODO: This doesn't work
    // await figma.loadFontAsync({family: "Lao Sans Pro", style: "Regular"});

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
async function test() {
    console.log("let's load external component...");
    // tableBodyCellWithText("one two three");
    const sel = figma.currentPage.selection;
    console.log("sel:", sel[0]);
    // const comp0 = await figma.importComponentByKeyAsync(tableHeaderCellHoverComponentKey);
    // const comp1 = comp0.findChild(n => n.name === 'Icon Left=False, Icon Right=False, Label=True, State=Hover') as ComponentNode;
    // console.log("comp1===>", comp1);
    // const tableHeader0 = comp0.createInstance();
    // tableHeader0.swapComponent(comp1);

    // return;
    // await figma.loadFontAsync({family: 'Lato', style: 'Regular'});
    // const comp = await figma.importComponentByKeyAsync(tableBodyCellDefaultComponentKey);
    // // const comp = await figma.importComponentByKeyAsync(tableHeaderCellHoverComponentKey);
    // const tableHeader = comp.createInstance();
    // console.log("header:::::", tableHeader.mainComponent.name);
    
    // // set label to on
    // // tableHeader.
    // // set state to default
    // const text = tableHeader.findChild(n => n.type === "TEXT") as TextNode;
    // console.log("text::", text);
    // text.characters = "ipsum loram!";
    // drawTableWithComponents
    //drawTableWithComponents
}
