import { useEffect, useState } from "react";
import { getPlantLogs } from "../services/plantService";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export default function PlantChart({ plantId }){
    const [logs, setLogs] = useState([]);

    useEffect(() => {
        const fetchLogs = async() => {
            const data = await getPlantLogs(plantId);
            const formatted = data.map(log => ({
                time: new Date(log.timestamp.seconds * 1000).toLocaleTimeString(),
                humidity: log.sensors?.humidity,
                temperature: log.sensors?.temperature,
                light: log.sensors?.light
            }));
            setLogs(formatted);
        };
        fetchLogs();
    }, [plantId]);

    return(
        <LineChart width={600} height={300} data={logs}>
            <CartesianGrid stroke="#ccc"/>
            <XAxis datakey="time" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" datakey="humidity" stroke="#82ca9d" name="Humidity" />
            <Line type="monotone" datakey="temperature" stroke="#8884d8" name="Temperature" />
        </LineChart>
    );
}