import React, { useState, useEffect } from 'react';
import Switch from 'react-switch';

export function Dttable() {
    const [dtt, setDtTaulukko] = useState([]);
    const [selectedDay, setSelectedDay] = useState('');
    const [selectedMonth, setSelectedMonth] = useState('');
    const [maintenanceAction, setMaintenanceAction] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        const storedData = JSON.parse(localStorage.getItem('dtt')) || [];
        if (storedData.length > 0) {
            setDtTaulukko(storedData);
        } else {
            initializeTable(true);
        }
    }, []);

    const initializeTable = (initialValue) => {
        const newTable = Array.from({ length: 81 }, (_, i) => ({
            id: i,
            dValue: ((Math.floor(i / 9)) * 0.5) + 1,
            tValue: 1 + ((i % 9) * 0.5),
            mon: initialValue, tue: initialValue, wed: initialValue, thu: initialValue, fri: initialValue, sat: initialValue, sun: initialValue,
            jan: initialValue, feb: initialValue, mar: initialValue, apr: initialValue, may: initialValue, jun: initialValue, jul: initialValue, aug: initialValue, sep: initialValue, oct: initialValue, nov: initialValue, dec: initialValue
        }));
        setDtTaulukko(newTable);
        localStorage.setItem('dtt', JSON.stringify(newTable));
    }

    const handleDayChange = (e) => {
        setSelectedDay(e.target.value);
        setSelectedMonth(''); // Clear month selection
    }

    const handleMonthChange = (e) => {
        setSelectedMonth(e.target.value);
        setSelectedDay(''); // Clear day selection
    }

    const toggleValue = (id, type) => {
        if (!isEditing) return;

        setDtTaulukko(prevDtt => {
            const updatedDtt = prevDtt.map(item =>
                item.id === id ? { ...item, [type]: !item[type] } : item
            );
            localStorage.setItem('dtt', JSON.stringify(updatedDtt));
            return updatedDtt;
        });
    }

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (event) => {
            const importedData = JSON.parse(event.target.result);
            setDtTaulukko(importedData);
            localStorage.setItem('dtt', JSON.stringify(importedData));
        };
        reader.readAsText(file);
    }

    const handleExport = () => {
        const dataStr = JSON.stringify(dtt, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'dtt-data.json';
        a.click();
        URL.revokeObjectURL(url);
    }

    const handleMaintenanceChange = (e) => {
        const action = e.target.value;
        setMaintenanceAction(action);

        if (action === 'initializeTrue') {
            initializeTable(true);
        } else if (action === 'initializeFalse') {
            initializeTable(false);
        } else if (action === 'export') {
            handleExport();
        }
    }

    const handleToggleEditing = (checked) => {
        setIsEditing(checked);
    }

    return (
        <>
            <div className="control-panel" style={{ display: 'flex', alignItems: 'center' }}>
                <label style={{ marginRight: '10px' }}>
                    <Switch onChange={handleToggleEditing} checked={isEditing} />
                    <span style={{ marginLeft: '10px' }}>Edit finds</span>
                </label>
                <select onChange={handleMaintenanceChange} value={maintenanceAction} className="mMenu" >
                    <option value="">Maintenance</option>
                    <option value="initializeTrue">Initialize with True</option>
                    <option value="initializeFalse">Initialize with False</option>
                    <option value="import">Import</option>
                    <option value="export">Export</option>
                </select>
                {maintenanceAction === 'import' && <input type="file" accept=".json" onChange={handleFileUpload} />}
            </div>
            <h2>
                Weekday
                <select id="weekdaySelector" onChange={handleDayChange} value={selectedDay} style={{ marginLeft: '20px' }}>
                    <option value="">Select a day</option>
                    <option value="mon">Monday</option>
                    <option value="tue">Tuesday</option>
                    <option value="wed">Wednesday</option>
                    <option value="thu">Thursday</option>
                    <option value="fri">Friday</option>
                    <option value="sat">Saturday</option>
                    <option value="sun">Sunday</option>
                </select>
                Month
                <select id="monthSelector" onChange={handleMonthChange} value={selectedMonth} style={{ marginLeft: '20px' }}>
                    <option value="">Select a month</option>
                    <option value="jan">January</option>
                    <option value="feb">February</option>
                    <option value="mar">March</option>
                    <option value="apr">April</option>
                    <option value="may">May</option>
                    <option value="jun">June</option>
                    <option value="jul">July</option>
                    <option value="aug">August</option>
                    <option value="sep">September</option>
                    <option value="oct">October</option>
                    <option value="nov">November</option>
                    <option value="dec">December</option>
                </select>
            </h2>
            <table>
                <thead>
                    <tr>
                        <th>D/T</th>
                        <th>1.0</th>
                        <th>1.5</th>
                        <th>2.0</th>
                        <th>2.5</th>
                        <th>3.0</th>
                        <th>3.5</th>
                        <th>4.0</th>
                        <th>4.5</th>
                        <th>5.0</th>
                    </tr>
                </thead>
                <tbody>
                    {[...Array(9)].map((_, row) => (
                        <tr key={row}>
                            <th>{(row + 2) * 0.5}</th>
                            {dtt.slice(row * 9, row * 9 + 9).map(item => {
                                const displayValue = selectedDay ? item[selectedDay] : selectedMonth ? item[selectedMonth] : true;
                                return (
                                    <td
                                        key={item.id}
                                        className="targetSquare"
                                        onClick={() => toggleValue(item.id, selectedDay || selectedMonth)}
                                        style={{ backgroundColor: displayValue ? 'green' : 'red' }}
                                    >
                                        {item.id + 1}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
            <p>created by Ja-x</p>
        </>
    );
}


 
