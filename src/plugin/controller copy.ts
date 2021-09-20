import * as _ from 'lodash';
// import {prisma_cloud_policies, prisma_cloud_alerts, artists, songs} from '../app/assets/datasets.js';
import {baseFrameWithAutoLayout, configFoCWithAutoLayout, clone, transpose} from '../shared/utils';

// FIXME: If some columns are deleted, things will stop working
var meta_tables: {id: string, cols: number}[] = [];
const table_style = {rowHeight: 36, columnWidth: 160};

const bodySRegularStyleId = 'S:9368379dc9395a663811d1eb894e2c5c21793701,33995:33';
// You can get the key of a main component by first creating an instance and then instanceNode.mainComponent.key
const tableHeaderCellHoverComponentKey = '3782e1e0a293fb1272f309e9dea168bf5253912e';
const tableHeaderCellDefaultComponentKey = '52f8db8c3eb06811177462ca81794c1e1b80b36d';
const tableBodyCellComponentKey = '52f8db8c3eb06811177462ca81794c1e1b80b36d';
const tableActionCellComponentKey = '0c261446286f17942208d7c617d9ad7feacd0335';


figma.showUI(__html__, {height: 320});

figma.ui.onmessage = (msg) => {
    switch(msg.type) {
        case 'create-table':
            drawTable(msg.dataset);
            break;
        case 'update-table':
            drawTable(msg.dataset);
        case 'update-striped':
            updateStriped(msg.striped);
            break;
        case 'select-row':
            selectRow();
            break;
        case 'update-row-height':
            updateRowHeight();
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
            const cellEl = baseFrameWithAutoLayout({name: cellName, nodeType: 'FRAME', 
            direction: 'HORIZONTAL', height: height, width: width}) as FrameNode;
            parent.appendChild(cellEl);
            return cellEl;
        }
    }
    return null;
}

function updateStriped(striped:boolean) {
    // First select the table body, pls
    if(figma.currentPage.selection.length === 0) return;
    // TMP
    const tableEl = figma.currentPage.selection[0] as FrameNode;
    const color = striped? {r: 234/255, g: 235/255, b: 235/255} :{r: 1, g: 1, b: 1};
    if(tableEl.name === 'pa-table-body') {
        console.log("table!!!");
        const reg = /(?<=cell-row-)\d*/;
        tableEl.children.forEach(colEl => {
            const col = colEl as FrameNode;

            col.children.forEach(cellEl => {
                const cell = cellEl as FrameNode;
                const cellMatches = cell.name.match(reg);
                if(cellMatches.length > 0) {
                    const rowNum = cellMatches[0] as unknown;
                    const rowNum1 = rowNum as number;
                    if (rowNum1 % 2 === 0 ) {
                        cell.fills = [{type: 'SOLID', color: color}]; 
                    }
                }
            })
        })
    }
}
function updateRowHeight() {
    const sel = figma.currentPage.selection.concat();

    // TODO: First make sure we select a cell
    // TMP
    let cellEl = sel[0] as FrameNode;
    // what's the height of the current selected cell?
    // console.log("cellEl:", cellEl);
    let cellHeight = cellEl.height;
    let row = rowForSelectedCell();
    row.forEach(cel => {
        cel.resize(cel.width, cellHeight);
    })
}

function rowForSelectedCell(): SceneNode[] {
    const sel = figma.currentPage.selection.concat();
    if(sel.length !== 1) {
        console.log("pls select a cell on the row first");
        return null;
    } else {
        // If it looks like a cell in a row, attempt to update all the cells in that row
        if (sel[0].type === 'FRAME') {
            // TODO. TMP. Match a pattern like 'cell-row-6-col-0'
            const reg = /\d+/;
            const rowMatches = sel[0].name.match(reg);
            if(rowMatches.length > 0) {
                const rowIndex = rowMatches[0];
                // TODO: first make sure we are looking at the right table: is the same id as the one we select?
                let cellEl = sel[0] as FrameNode;
                const tableEl =  cellEl.parent.parent;

                tableEl.children.forEach((colNode, j) => {
                    const colEl = colNode as FrameNode;
                    // cell-row-0-col-0
                    const celEl = colEl.findChild(n => n.type === 'FRAME' && n.name === 'cell-row-'+ rowIndex + '-col-' + j);                   
                    sel.push(celEl);
                })

                // figma.currentPage.selection = sel;
                return sel;
            }
        }
        return null;
    }
}
// Select all the cells in the row where the user needs to select a cell on this row first.
function selectRow() {
    const _row = rowForSelectedCell();
    if(_row) figma.currentPage.selection = _row;
}
// Quick and dirty way to see if the selection is a table
function isTable(selection:readonly SceneNode[]): boolean {
    return selection.length == 1 && selection[0].name.includes('pa-table-body');
}

// Draw table using the d3 update pattern(e.g., enter/update/exit).
// TODO: Move 'pa-table-body' to a const
async function drawTable(data) {
    await figma.loadFontAsync({family: 'Roboto', style: 'Regular'});
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
            const cellsData = cells as [];
            cellsData.forEach((cell, j) => {
                // Enter
                const cellContainer = frameNodeOn({parent: colEl, colIndex: i, rowIndex: j, frameType: 'CELL'});
                // TMP: Update
                 // Set up resizing to be 'Fill Container'
                cellContainer.layoutAlign = 'STRETCH';
                cellContainer.layoutGrow = 1;

                // rect.fills = [{type: 'SOLID', color: {r: 1, g: 0.5, b: 0}}];
                if(j%2 == 0){
                    cellContainer.fills = [{type: 'SOLID', color: {r: 234/255, g: 235/255, b: 235/255}}];
                }
                const t = figma.createText();
                t.characters = (cell as string).toString();
                if(t.characters.length > 0) {
                    t.setRangeTextStyleId(0, t.characters.length, bodySRegularStyleId);
                }
               
                // Set up resizing
                t.layoutAlign = 'STRETCH';
                t.layoutGrow = 1;
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

async function test() {
    console.log("let's load external component...");
    // const sel = figma.currentPage.selection;
    // console.log("sel:", sel[0]);
    // const comp0 = await figma.importComponentByKeyAsync(tableHeaderCellHoverComponentKey);
    // const comp1 = comp0.findChild(n => n.name === 'Icon Left=False, Icon Right=False, Label=True, State=Hover') as ComponentNode;
    // console.log("comp1===>", comp1);
    // const tableHeader0 = comp0.createInstance();
    // tableHeader0.swapComponent(comp1);

    // return;
    await figma.loadFontAsync({family: 'Lato', style: 'Regular'});
    const comp = await figma.importComponentByKeyAsync(tableHeaderCellDefaultComponentKey);
    // const comp = await figma.importComponentByKeyAsync(tableHeaderCellHoverComponentKey);
    const tableHeader = comp.createInstance();
    console.log("header:::::", tableHeader.mainComponent.name);
    
    // set label to on
    // tableHeader.
    // set state to default
    const text = tableHeader.findChild(n => n.type === "TEXT") as TextNode;
    console.log("text::", text);
    text.characters = "ipsum loram!";
    
}