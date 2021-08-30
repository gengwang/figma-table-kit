import * as React from 'react';
import '../styles/ui.css';

declare function require(path: string): any;

const App = ({}) => {
    // const textbox = React.useRef<HTMLInputElement>(undefined);

    // const countRef = React.useCallback((element: HTMLInputElement) => {
    //     if (element) element.value = '5';
    //     textbox.current = element;
    // }, []);
    var striped = true;

    const onCreate = () => {
        // const count = parseInt(textbox.current.value, 10);
        const dataset = "prisma-cloud-alerts"
        parent.postMessage({pluginMessage: {type: 'create-table', dataset}}, '*');
    };

    const onSelectRow = () => {
        parent.postMessage({pluginMessage: {type: 'select-row'}}, '*');
    }

    const onUpdateRowHeight = () => {
        parent.postMessage({pluginMessage: {type: 'update-row-height'}}, '*');
    }

    const onStripedChange = (event) => {
        striped = event.target.checked;
        parent.postMessage({pluginMessage: {type: 'update-striped', striped: striped}}, '*');
    }
    const onCancel = () => {
        parent.postMessage({pluginMessage: {type: 'cancel'}}, '*');

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
                <input
                    name="stripedCheckbox"
                    type="checkbox"
                    // checked={striped}
                    onChange={onStripedChange}
                    />
                <label>Striped</label>
            </div>

            <button id="update-row" onClick={onSelectRow}>
                Select Row
            </button>
            <button id="update-row" onClick={onUpdateRowHeight}>
                Update Selected Row Height
            </button>

            <button onClick={onCancel}>Cancel</button>
        </div>
    );
};

export default App;
