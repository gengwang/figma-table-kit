import * as React from 'react';
import '../styles/ui.css';
import {prisma_cloud_policies, prisma_cloud_alerts} from '../assets/datasets.js';

declare function require(path: string): any;

const App = ({}) => {
    // const textbox = React.useRef<HTMLInputElement>(undefined);

    // const countRef = React.useCallback((element: HTMLInputElement) => {
    //     if (element) element.value = '5';
    //     textbox.current = element;
    // }, []);
    const DATA = {
        prisma_cloud_alerts: prisma_cloud_alerts,
        prisma_cloud_policies: prisma_cloud_policies,
    };

    const STYLE = {
        rowHeight: 'default',
    };

    const [striped, onStripedChange] = React.useReducer((striped) => {
        parent.postMessage({pluginMessage: {type: 'update-striped', striped: !striped}}, '*');
        return !striped;
    }, true);

    const [manualUpdate, setManualUpdate] = React.useReducer((manual) => {
        parent.postMessage({pluginMessage: {type: 'update-settings', setting: 'manual-update', value: !manual}}, '*');
        return !manual;
    }, false);

    const [dataset, setDataset] = React.useState(DATA.prisma_cloud_alerts);
    const [rowHeight, setRowHeight] = React.useState(STYLE.rowHeight);

    const onCreate = () => {
        // const count = parseInt(textbox.current.value, 10);
        // const dataset = "prisma-cloud-alerts"
        parent.postMessage({pluginMessage: {type: 'create-table', dataset: dataset}}, '*');
    };

    const onDataSetChange = (dsName) => {
        setDataset(DATA[dsName]);
        parent.postMessage({pluginMessage: {type: 'update-table', dataset: dataset}}, '*');
    };

    const onUpdateRowHeight = (h) => {
        setRowHeight(h);
        parent.postMessage({pluginMessage: {type: 'update-row-height', height: h}}, '*');
    };

    const onFileSelect = () => {
        const fileElem = document.getElementById('fileElem');
        if (fileElem) {
            console.log('file select>>>', fileElem);
            fileElem.click();
        }
    };

    const onFileChange = (e) => {
        // e.target is the file input which has ["files"] array
        if (!e.target.files || e.target.files.length == 0) return;
        const fileToRead = e.target.files[0];
        var fileReader = new FileReader();
        fileReader.onload = function (e) {
            var content = e.target.result;
            // console.log(content);
            var json_data = JSON.parse(content as string); // Array of Objects.
            // console.log('json_data:', json_data);
            // setDataset(json_data);
            // parent.postMessage({ pluginMessage: { type: 'send-data', json_data } }, '*')
            parent.postMessage({pluginMessage: {type: 'create-table', dataset: json_data}}, '*');
        };
        fileReader.readAsText(fileToRead);
    };

    const onTest = () => {
        parent.postMessage({pluginMessage: {type: 'test'}}, '*');
    };

    React.useEffect(() => {
        // This is how we read messages sent from the plugin controller
        window.onmessage = (event) => {
            const {type, message} = event.data.pluginMessage;
            if (type === 'create-table') {
                console.log(`Figma Says: ${message}`);
            }
        };
    }, []);

    return (
        <div className="list">
            {/* <img src={require('../assets/logo.svg')} /> */}

            <button id="create" onClick={onCreate}>
                Create Table
            </button>

            <div className="checkbox-group">
                <label>Data sets</label>

                <select onChange={(val) => onDataSetChange(val.target.value)}>
                    <option value="prisma_cloud_alerts">Prisma Cloud - Alerts</option>
                    <option value="prisma_cloud_policies">Prisma Cloud - Policies</option>
                </select>
            </div>

            <input
                type="file"
                id="fileElem"
                accept="application/JSON"
                style={{display: 'none'}}
                onChange={onFileChange}
            ></input>
            <button id="fileSelect" onClick={onFileSelect}>
                My Own Dataset
            </button>

            {/* Row density */}
            <div className="checkbox-group">
                <label>Row Height</label>
                <select defaultValue={rowHeight} onChange={(val) => onUpdateRowHeight(val.target.value)}>
                    <option value="compact">Compact</option>
                    <option value="default">Default</option>
                    <option value="cozy">Cozy</option>
                </select>
            </div>

            <div className="checkbox-group">
                <input name="stripedCheckbox" type="checkbox" checked={striped} onChange={onStripedChange} />
                <label>Striped</label>
            </div>

            <hr style={{width: '100%'}} />

            <div className="checkbox-group">
                <input name="manualCheckbox" type="checkbox" checked={manualUpdate} onChange={setManualUpdate} />
                <label>Manually Update</label>
            </div>

            <hr style={{width: '100%'}} />

            {/* <button id="update-row" onClick={onSelectRow}>
                Select Row
            </button> */}
            {/*  <button id="update-row" onClick={onUpdateRowHeight}>
                Update Selected Row Height
            </button> */}

            <button id="test" onClick={onTest}>
                Debug: Log selection
            </button>
        </div>
    );
};

export default App;
