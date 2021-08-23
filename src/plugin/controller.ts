import * as _ from 'lodash';
import {transpose} from './utils.js';
import {prisma_cloud_alerts} from '../app/assets/datasets.js';

figma.showUI(__html__);

figma.ui.onmessage = (msg) => {
    if (msg.type === 'create-table') {
        const datagrid = prisma_cloud_alerts.rows;
        // Transpose data set from json to columns
        const dataframe = {
            headers: 
                _.chain(datagrid)
                .first()
                .keys()
                .value(),
            columns: transpose(datagrid)
          };

          console.log("dataframe:", dataframe);
          

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
