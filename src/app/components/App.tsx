import * as React from 'react';
import '../styles/ui.css';
import {prisma_cloud_policies, prisma_cloud_alerts} from '../assets/datasets.js';
import * as _ from 'lodash';
import * as csv from 'csvtojson';
import * as d3 from 'd3-dsv';

declare function require(path: string): any;

const App = ({}) => {
    const INITIAL_DATA_SOURCE = [
        {name: 'Prisma Cloud - Alerts', data: prisma_cloud_alerts},
        {name: 'Prisma Cloud - Policies', data: prisma_cloud_policies},
    ];

    const [dataSources, setDataSources] = React.useState(INITIAL_DATA_SOURCE);

    const [dataSourceName, setDataSourceName] = React.useState(INITIAL_DATA_SOURCE[0]['name']);

    const [dataset, setDataset] = React.useState(
        _.chain(dataSources)
            .find((d) => d.name === 'Prisma Cloud - Alerts')
            .get('data')
            .value()
    );

    const STYLE = {
        rowHeight: 'default',
    };

    const ROW_HEIGHT_VARIANT = [
        {name: 'Compact', value: 'compact'},
        {name: 'Default', value: 'default'},
        {name: 'Cozy', value: 'cozy'},
    ];

    const [striped, onStripedChange] = React.useReducer((striped) => {
        parent.postMessage({pluginMessage: {type: 'update-striped', striped: !striped}}, '*');
        return !striped;
    }, true);

    const [manualUpdate, setManualUpdate] = React.useReducer((manual) => {
        parent.postMessage({pluginMessage: {type: 'update-settings', setting: 'manual-update', value: !manual}}, '*');
        return !manual;
    }, false);

    const [rowHeight, setRowHeight] = React.useState(STYLE.rowHeight);

    const onCreate = () => {
        parent.postMessage({pluginMessage: {type: 'create-table', dataset: dataset}}, '*');
    };

    const onDataSetChange = (dsName) => {
        // TMP. TODO: React way
        const dataset = _.chain(dataSources)
            .find((d) => d.name === dsName)
            .get('data')
            .value();

        setDataSourceName(dsName);
        setDataset(dataset);
        parent.postMessage({pluginMessage: {type: 'update-table', dataset: dataset}}, '*');
    };

    const onUpdateRowHeight = (h) => {
        setRowHeight(h);
        parent.postMessage({pluginMessage: {type: 'update-row-height', height: h}}, '*');
    };

    const onFileSelect = () => {
        const fileElem = document.getElementById('fileElem');
        if (fileElem) {
            fileElem.click();
        }
    };

    function parseCSV(content: string): [] {
        // console.log("csv::::", csv());
        console.log('d3::::', d3.dsvFormat('\t').parse(content));
        // console.log("d3::::", d3.parse(content));
        /*  
        const jsonArray= await csv().fromFile(filePath).then((jsonObj)=>{
            console.log(jsonObj);
        });
         */
        const rows = d3.dsvFormat('\t').parse(content);
        return rows || [];
    }
    const onFileChange = (e) => {
        // e.target is the file input which has ["files"] array
        if (!e.target.files || e.target.files.length == 0) return;
        const fileToRead = e.target.files[0];
        // console.log('csv available?', csv);

        // console.log('file to read:::', fileToRead.path);

        // const jsonArray= parseCSV(fileToRead.path);

        var fileReader = new FileReader();
        fileReader.onload = function (e) {
            var content = e.target.result;
            var json_data = parseCSV(content as string);
            const table_data = {title: 'undefined', rows: json_data};
            const {name, data} = {name: 'Custom Dataset ' + (dataSources.length - 1), data: table_data};
            setDataset(data);
            setDataSourceName(name);
            setDataSources([...dataSources, {name, data}]);
            // var json_data = JSON.parse(content as string); // Array of Objects.
            parent.postMessage({pluginMessage: {type: 'create-table', dataset: table_data}}, '*');
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

                <select value={dataSourceName} onChange={(e) => onDataSetChange(e.currentTarget.value)}>
                    {dataSources.map(({name}, k) => {
                        return (
                            <option value={name} key={k}>
                                {name}
                            </option>
                        );
                    })}
                </select>
            </div>

            <input
                type="file"
                id="fileElem"
                accept=".csv,.json"
                style={{display: 'none'}}
                onChange={onFileChange}
            ></input>
            <button id="fileSelect" onClick={onFileSelect}>
                Add My Own Dataset
            </button>

            {/* Row density */}
            <div className="checkbox-group">
                <label>Row Height</label>
                <select defaultValue={rowHeight} onChange={(val) => onUpdateRowHeight(val.target.value)}>
                    {ROW_HEIGHT_VARIANT.map((d, k) => (
                        <option value={d.value} key={k}>
                            {d.name}
                        </option>
                    ))}
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

            <button id="test" onClick={onTest}>
                Debug: Log selection
            </button>
        </div>
    );
};

export default App;
