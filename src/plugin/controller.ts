import * as _ from 'lodash';
// import {prisma_cloud_policies, prisma_cloud_alerts, artists, songs} from '../app/assets/datasets.js';
import {baseFrameWithAutoLayout, clone, transpose} from '../shared/utils';

// FIXME: If some columns are deleted, things will stop working
var meta_tables: {id: string, cols: number}[] = [];
const table_style = {rowHeight: 36, columnWidth: 160};

const bodySRegularStyleId = 'S:9368379dc9395a663811d1eb894e2c5c21793701,33995:33';

figma.showUI(__html__, {height: 320});

figma.ui.onmessage = (msg) => {
    switch(msg.type) {
        case 'create-table':
            drawTable(msg.dataset);
            break;
        case 'update-table':
            drawTable2(msg.dataset);
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
            testPluginData(msg.action);
            break;
        case 'cancel':
            testStyle();
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
// creates a new one 
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
async function testPluginData(action:string) {
    await figma.loadFontAsync({family: 'Roboto', style: 'Regular'});
    const sel = figma.currentPage.selection;
    switch(action) {
         case 'get':
            console.log("get data:");
            if(sel.length > 0) {
                const selection = sel[0] as FrameNode;
                console.log("cell #4:", selection.children[4]);
                
                // const tableInfo = selection.getPluginData('table-info');
                // console.log("get table-info:", tableInfo);
            }
            break;
        case 'set':
            console.log('set data');
            if(sel.length > 0) {
                const selection = sel[0];
                // First remove extraneous columns and cells if any
                // Do we need to remove any columns?

                // const tableInfo = {'row-heights': [48, 28, 28, 36, 61]};
                // selection.setPluginData('table-info', JSON.stringify(tableInfo));

                // TEST to see if we can change content inside...
                const tableEl = selection as FrameNode;


                // const existingColCount = tableEl.children.length;
                // const newColCount = 

                tableEl.children.forEach(col=>{
                    const colEl = col as FrameNode;
                    colEl.children.forEach(cell => {
                        console.log("cell:", cell.name);
                        const cellEl = cell as FrameNode;
                        // first remove all children:
                        cellEl.children.forEach(c=>c.remove());
                        // Reset height for each cell since it's most likely what you'd want
                        // then add the new content
                        const textEl = figma.createText();
                        textEl.characters = 'hello world';
                        cellEl.appendChild(textEl);
                    })
                })
            }
            break;
        default:
            break;
    }
}
function testStyle() {
    // const style = figma.getStyleById('Body/S (12px)/Regular');
    const sel = figma.currentPage.selection[0] as TextNode;
    const textStyleId = sel.textStyleId;
    // const txtStyle = figma.getStyleById(textStyleId);
    const txtStyle = figma.getStyleById('S:9368379dc9395a663811d1eb894e2c5c21793701,33995:33');
    // sel.textStyleId = txtStyle;
    console.log("text length", sel.characters.length);
    
    console.log("test style....", txtStyle);
    sel.setRangeTextStyleId(0, sel.characters.length-1, 'S:9368379dc9395a663811d1eb894e2c5c21793701,33995:33');

}
async function drawTable_simple() {
    await figma.loadFontAsync({family: 'Roboto', style: 'Regular'});
    const text = "By default, parented under figma.currentPage. Without setting additional properties, the text has no characters. You can assign a string, to the .characters property of the returned node to provide it with text.";
    const t = figma.createText();
    t.characters = text;
    t.layoutAlign = 'STRETCH';
    t.layoutGrow = 1;
    const cell = baseFrameWithAutoLayout({name: "cell", direction: 'HORIZONTAL', 
                    width: 120, height: table_style.rowHeight});
    cell.appendChild(t);
}
function updateStriped(striped:boolean) {
    // First select the table body, pls
    if(figma.currentPage.selection.length === 0) return;
    // TMP
    const tableEl = figma.currentPage.selection[0] as FrameNode;
    const color = striped? {r: 234/255, g: 235/255, b: 235/255} :{r: 1, g: 1, b: 1};
    if(tableEl.name === 'table-body') {
        console.log("table!!!");
        const reg = /(?<=cell-row-)\d*/;
        tableEl.children.forEach(colEl => {
            const col = colEl as FrameNode;
            // TODO: Find all the even rows
            // const reg = /(?<=cell-row-)\d*/
            // const evenCells = col.findChildren(cell => {
            //     const cellMatches = cell.name.match(reg);
            //     if(cellMatches.length > 0) {
            //         console.log("match::", cellMatches[0]);
            //         const rowNum = cellMatches[0] as unknown;
            //         const rowNum1 = rowNum as number;
            //         console.log("rowNum1::", rowNum1);
            //         return rowNum1 % 2 === 0;
            //     }
            //     return false;
            // })
            // figma.currentPage.selection = evenCells;

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
            // TMP. Here we simply update all cells
            // col.children.forEach(cell => {
            //     const cellEl = cell as FrameNode;
            //     cellEl.fills = [{type: 'SOLID', color: {r: 1, g: 1, b: 1}}];
            // })
        })
    }
    // Select all the cells in the even rows
    // Fill background color
}
function updateRowHeight() {
    console.log("update row height");
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
                // console.log("rownIndex", rowIndex);
                // how many coloumns do we have?
                // TODO: first make sure we are looking at the right table: is the same id as the one we select?
                // console.log("meta tables?", meta_tables);
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
function isTable(selection:readonly SceneNode[]): boolean {
    return selection.length == 1 && selection[0].name.includes('table-body');
}
async function drawTable2(data) {
    const sel = figma.currentPage.selection;
    if (sel.length === 0) return;

    console.log("calling drawTable2");
    
    await figma.loadFontAsync({family: 'Roboto', style: 'Regular'});
    // row based data source
    const datagrid = _.chain(data.rows)
        .take(10)
        .value();
    
    // const headers = _.chain(datagrid)
    //     .first()
    //     .keys()
    //     .value();

    // column based data source
    const dataframe = transpose(datagrid);

    // See if the selection is a table by checking out the name of the frame
    
    // TMP. Is it a table
    if(isTable(sel)) {
        const tableEl = sel[0] as FrameNode;
        const colsEl = tableEl.children as FrameNode[];
        const existingColCount = colsEl.length;
        const newColCount = dataframe.length;
        const existingRowCount =  (colsEl[0].children as FrameNode[]).length;
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
    
    // if yes, then add
    // enter
    // add all new cell frames including content
    // update
    // will do update on all the content inside each cell frame
    // remove
    // remove the extraneous cell frames
    
}

async function drawTable(data) {
    // FIXME: Load Lato font
    await figma.loadFontAsync({family: 'Roboto', style: 'Regular'});
    // await figma.loadFontAsync({family: 'Lato', style: 'Regular'});
    // await figma.loadFontAsync({family: 'LatoLatin', style: 'Regular'});
    // await figma.loadFontAsync({family: 'Font Awesome 5 Pro', style: 'Regular'});

    // const data = prisma_cloud_policies;

    // const data = songs;
    // const data = artists;

    const datagrid = _.chain(data.rows)
            .take(10)
            .value();
    const rowCount = datagrid.length;
    // Transpose data set from rows to columns
    const dataframe = {
        headers: _.chain(datagrid)
            .first()
            .keys()
            .value(),
        columns: transpose(datagrid)
    };

    const bodyContainer = baseFrameWithAutoLayout({ name: "table-body", 
        itemSpacing: 0 }) as FrameNode;
    
    const columnContent = dataframe.columns;

    columnContent.forEach((col, i) => {
        const colContainer = drawColumn({ frameName: "col-" + i, columnTexts: col, columnWidth: table_style.columnWidth });
        bodyContainer.appendChild(colContainer);
    });

    bodyContainer.resize(table_style.columnWidth * columnContent.length, table_style.rowHeight * rowCount);

    // Update meta data so that we can update the table later when asked
    meta_tables.push({'id': bodyContainer.id, 'cols': columnContent.length});

    // update Figma view
    bodyContainer.x = figma.viewport.center.x;
    bodyContainer.y = figma.viewport.center.y;
    figma.viewport.scrollAndZoomIntoView([bodyContainer]);
    figma.currentPage.selection = [bodyContainer];
}
function drawColumn(
{ frameName, columnTexts, columnWidth = 400, height = 400, padding = 0, margin = 0, cellPadding = 8 }: 
{ frameName: string; columnTexts: string[]; columnWidth?: number; height?: number; 
    padding?: number; margin?: number; cellPadding?: number; })
:FrameNode {
        
    const colContainer = baseFrameWithAutoLayout({ name: frameName, 
        direction: "VERTICAL", itemSpacing: 0, width: columnWidth }) as FrameNode;
   
    
    // TODO: Calculate column width based on the maximum length of text for that column
   // or User input. For a better looking table, the width of columns should be adaptive to their content
        columnTexts.forEach((txt, i) => {
        const cellContainer = baseFrameWithAutoLayout({
            name: "cell-row-" + i + "-" + frameName, 
            direction: 'HORIZONTAL', 
            width: columnWidth, 
            height: table_style.rowHeight}) as FrameNode;
        
        // Set up resizing to be 'Fill Container'
        cellContainer.layoutAlign = 'STRETCH';

        // Set the background color for the alternating rows:
        if(i%2 == 0){
            const fills = clone(cellContainer.fills);
            // Prisma "Light/Structures/List Structures": #EAEBEB
            fills[0].color.r = 234/255;
            fills[0].color.g = 235/255;
            fills[0].color.b = 235/255;
            cellContainer.fills = fills;
        }
        const t = figma.createText();
        t.characters = txt.toString();
        
        // TMP
        if(t.characters.length > 0) {
            t.setRangeTextStyleId(0, t.characters.length, bodySRegularStyleId);
        }
       
        // Set up resizing
        t.layoutAlign = 'STRETCH';
        t.layoutGrow = 1;

        t.x = cellPadding;
        t.y = cellPadding;

        cellContainer.appendChild(t);

        colContainer.appendChild(cellContainer);
    });

    // Set up resizing to "Fill Container" on the x axis
    colContainer.layoutGrow = 1;

    colContainer.paddingLeft = colContainer.paddingRight 
    = colContainer.paddingTop = colContainer.paddingBottom = padding;

    colContainer.itemSpacing = margin;

    colContainer.resize(columnWidth, height);

    return colContainer as FrameNode;
    
}

