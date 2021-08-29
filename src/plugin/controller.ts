import * as _ from 'lodash';
import {prisma_cloud_policies, prisma_cloud_alerts} from '../app/assets/datasets.js';
import {baseFrameWithAutoLayout, clone, transpose} from '../shared/utils';

figma.showUI(__html__);

figma.ui.onmessage = (msg) => {
    if (msg.type === 'create-table') {
       
        drawTable();
        

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
        console.log("controller::: create-table runs!");
        
    }

    figma.closePlugin();
};
async function drawTable_simple() {
    await figma.loadFontAsync({family: 'Roboto', style: 'Regular'});
    const text = "By default, parented under figma.currentPage. Without setting additional properties, the text has no characters. You can assign a string, to the .characters property of the returned node to provide it with text.";
    const t = figma.createText();
    t.characters = text;
    t.layoutAlign = 'STRETCH';
    t.layoutGrow = 1;
    const cell = baseFrameWithAutoLayout({name: "cell", layoutMode: 'HORIZONTAL', width: 120, height: 36});
    cell.appendChild(t);
    // t.constraints = {horizontal: 'STRETCH', vertical: 'MIN'};
}
async function drawTable() {
    // FIXME: Load Lato font
    await figma.loadFontAsync({family: 'Roboto', style: 'Regular'});
    // await figma.loadFontAsync({family: 'Lato', style: 'Regular'});
    // await figma.loadFontAsync({family: 'LatoLatin', style: 'Regular'});
    console.log('loadFontAsync 1')
    // await figma.loadFontAsync({family: 'Font Awesome 5 Pro', style: 'Regular'});
    
    // TMP
    // await figma.importStyleByKeyAsync("Prisma Component Library");
    // let style = figma.getStyleById("Body/M (14px)/Regular");
    // console.log("style::", style);

    const datagrid = _.chain(prisma_cloud_policies.rows)
            .take(25)
            // .map(d=>({
            //     "Category": d["Category"], 
            //     "Class": d["Class"], 
            //     "Compliance Standard": d["Compliance Standard"],
            //     "Labels": d["Labels"],
            //     "Last Modified": d["Last Modified"],
            //     "Last Modified By": d["Last Modified By"],
            //     "Policy Name": d["Policy Name"],
            //     "Policy Type": d["Policy Type"],
            //     "Remediable": d["Remediable"],
            //     "Severity": d["Severity"],
            //     "Status": d["Status"],
            // }))
            .value();
    // const datagrid = _.take(prisma_cloud_alerts.rows, 2);
    console.log("datagrid:", datagrid);
    
    // Transpose data set from rows to columns
    const dataframe = {
        headers: _.chain(datagrid)
            .first()
            .keys()
            .value(),
        columns: transpose(datagrid)
    };

    const bodyContainer = baseFrameWithAutoLayout({ name: "table-body", margin: 0 }) as FrameNode;

    const columnContent = dataframe.columns;

    columnContent.forEach((col, i) => {
        const colContainer = drawColumn({ frameName: "col-" + i, columnTexts: col, columnWidth: 160 });
        bodyContainer.appendChild(colContainer);
    });

    bodyContainer.resize(160*columnContent.length, 960);
}
function drawColumn(
{ frameName, columnTexts, columnWidth = 400, height = 400, padding = 0, margin = 0, cellPadding = 8 }: 
{ frameName: string; columnTexts: string[]; columnWidth?: number; height?: number; 
    padding?: number; margin?: number; cellPadding?: number; })
:FrameNode {
        
    const colContainer = baseFrameWithAutoLayout({ name: frameName, 
        layoutMode: "VERTICAL", margin: 0, width: columnWidth }) as FrameNode;
   
    
    // TODO: Calculate column width based on the maximum length of text for that column
   // or User input. For a better looking table, the width of columns should be adaptive to their content
        columnTexts.forEach((txt, i) => {
        // const cellContainer = figma.createFrame();
        // cellContainer.name = "cell-row-" + i + "-" + frameName;
        const cellContainer = baseFrameWithAutoLayout({
            name: "cell-row-" + i + "-" + frameName, 
            layoutMode: 'HORIZONTAL', 
            width: columnWidth, 
            height: 14*2}) as FrameNode;
        
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

