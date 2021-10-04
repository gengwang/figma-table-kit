import * as React from 'react';
import '../styles/ui.css';
import {prisma_cloud_policies, prisma_cloud_alerts, artists, songs} from '../assets/datasets.js';

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
        artists: artists,
        songs: songs,
    };

    const [striped, onStripedChange] = React.useReducer((striped) => {
        parent.postMessage({pluginMessage: {type: 'update-striped', striped: !striped}}, '*');
        return !striped;
    }, true);

    const [manualUpdate, setManualUpdate] = React.useReducer((manual) => {
        parent.postMessage({pluginMessage: {type: 'update-settings', setting: 'manual-update', value: !manual}}, '*');
        return !manual;
    }, false);

    const [dataset, setDataset] = React.useState(DATA.artists);

    const onCreate = () => {
        // const count = parseInt(textbox.current.value, 10);
        // const dataset = "prisma-cloud-alerts"
        parent.postMessage({pluginMessage: {type: 'create-table', dataset: dataset}}, '*');
    };

    const onDataSetChange = (dsName) => {
        setDataset(DATA[dsName]);
        parent.postMessage({pluginMessage: {type: 'update-table', dataset: dataset}}, '*');
    };

    /*  const onSelectRow = () => {
        parent.postMessage({pluginMessage: {type: 'select-row'}}, '*');
    }

    const onUpdateRowHeight = () => {
        parent.postMessage({pluginMessage: {type: 'update-row-height'}}, '*');
    } */
    const onTestDrawTableHeader = () => {
        parent.postMessage({pluginMessage: {type: 'draw-table-header', dataset: dataset}}, '*');
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
                    {/* <option value="prisma_cloud_alerts">Prisma Cloud - Alerts</option>
                    <option value="prisma_cloud_policies">Prisma Cloud - Policies</option> */}
                    <option value="artists">Artists</option>
                    <option value="songs">Songs</option>
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
            <button id="test1" onClick={onTestDrawTableHeader}>
                Test: Draw Table Header
            </button>
            <button id="test" onClick={onTest}>
                Test: Log sel
            </button>
        </div>
    );
};

export default App;
