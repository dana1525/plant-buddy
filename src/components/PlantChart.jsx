import { useEffect, useState } from "react";
import { getPlantLogs } from "../services/plantService";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";

/**
 * PlantChart Component - displays sensor data for a specific plant
 * Fetches and visualizes logs like temperature, humidity, and light over time
 * Allows filtering data by week, month, or all available logs
 */

export default function PlantChart({ plantId }){
    const [logs, setLogs] = useState([]);
    const [filteredLogs, setFilteredLogs] = useState([]);
    const [timeRange, setTimeRange] = useState('week'); // 'week', 'month', 'all'
    const [loading, setLoading] = useState(true);

    /**
     * Fetches logs for the given plant and formats data for chart display
     * Runs when plantId changes
     */
    useEffect(() => {
    const fetchLogs = async () => {
        setLoading(true); // Reset loading on plant change
        const data = await getPlantLogs(plantId);
        const formatted = data.map(log => {
            const sensors = log.sensors || log.sensorData || {};
            const dateObj = new Date(log.timestamp.seconds * 1000);

            // Format timestamp as DD.MM.YYYY HH:MM
            const timeString = dateObj.toLocaleString("ro-RO", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: false
            });

            return {
                time: timeString,
                fullDate: dateObj,
                soilMoisture: sensors.soilMoisture || 0,
                temperature: sensors.temperature || 0,
                lightLevel: sensors.lightLevel || 0,
                status: log.status || "Unknown"
            };
});

        setLogs(formatted);
        setLoading(false);
        };
        fetchLogs();
    }, [plantId]);


    /**
     * Filters logs based on selected time range (week, month, all)
     * Runs when logs or timeRange changes
     */
    useEffect(() => {
        if (logs.length === 0) return;

        const now = new Date();
        let startDate;

        switch (timeRange) {
            case 'week':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case 'month':
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                break;
            default:
                startDate = new Date(0); // Includ all logs
        }

        const filtered = logs.filter(log => log.fullDate >= startDate);
        setFilteredLogs(filtered);
    }, [logs, timeRange]);


    /**
     * Custom tooltip for chart points
     * Displays time and value with appropriate units
     */
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
                    <p className="font-semibold">{`Timp: ${label}`}</p>
                    {payload.map((entry, index) => (
                        <p key={index} style={{ color: entry.color }}>
                            {`${entry.name}: ${entry.value}${getUnit(entry.dataKey)}`}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };


    /**
     * Returns unit symbol based on sensor type
     * @param {string} dataKey - sensor field name
     */
    const getUnit = (dataKey) => {
        switch (dataKey) {
            case 'soilMoisture': return '%';
            case 'temperature': return '°C';
            case 'lightLevel': return ' lux';
            default: return '';
        }
    };

    if(loading) return <div className="p-4">Loading chart data...</div>

    if(!logs.length) return <div className="p-4">No chart data available.</div>

    return(
        <div className="w-full min-h-[500px] max-w-5xl mx-auto">
            <div className="mb-4 flex gap-2">
                <button onClick = {() => setTimeRange('week')}
                        className = {`px-3 py-1 rounded ${timeRange === 'week' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>Last week</button>
                <button onClick = {() => setTimeRange('month')}
                        className = {`px-3 py-1 rounded ${timeRange === 'month' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>Last month</button>
                <button onClick = {() => setTimeRange('all')}
                        className = {`px-3 py-1 rounded ${timeRange === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>All data</button>
            </div>

            <div>
                <p className="text-sm text-gray-600"> {filteredLogs.length} / {logs.length} records</p>
            </div>

            <ResponsiveContainer width={1000} height={400}>
                <LineChart data={filteredLogs} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis dataKey="time" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={80}/>
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="soilMoisture" stroke="#82ca9d" name="Humidity" strokeWidth={2} dot={{ r: 3 }}/>
                    <Line type="monotone" dataKey="temperature" stroke="#8884d8" name="Temperature"strokeWidth={2} dot={{ r: 3 }}/>
                    <Line type="monotone" dataKey="lightLevel" stroke="#ffc658" name="Light Level" strokeWidth={2} dot={{ r: 3 }}/>
                </LineChart>
            </ResponsiveContainer>
        
        </div>

    );
}
