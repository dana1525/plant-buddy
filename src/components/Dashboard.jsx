import { useEffect, useState } from "react";
import { getPlantsByUser } from "../services/plantService";
import { deletePlant } from "../services/plantService";
import { auth } from "../firebase/config";
import AddPlantForm from "./AddPlantForm";
import { updateAllPlantSensors } from "../services/sensorService";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PlantChart from "./PlantChart";
import { editPlant } from "../services/plantService";
import { onAuthStateChanged } from "firebase/auth";

export default function Dashboard(){
    const [plants, setPlants] = useState([]);

    const [editingPlantId, setEditingPlantId] = useState(null);
    const [editedName, setEditedName] = useState("");
    const [editedType, setEditedType] = useState("");
    const [selectedPlantForChart, setSelectedPlantForChart] = useState(null);

    const getStatusClass = (status) => {
        switch(status){
            case "Needs Water":
            case "Overwatered":
            case "Needs More Light":
            case "Too Much Light":
                return "status-warning";
            case "Too Cold":
            case "Too Hot":
                return "status-danger";
            case "Healthy":
            default:
                return "status-okay";
        }
    };

    const fetchPlants = async() => {
        const user = auth.currentUser;
        if(!user) return;
        const data = await getPlantsByUser(user.uid);
        setPlants(data);
    };

    useEffect(() => {
        fetchPlants();
    }, []);

    const handleDelete = async(id) => {
        await deletePlant(id);
        if (selectedPlantForChart === id) {
        setSelectedPlantForChart(null);
        }
        fetchPlants();
        toast.success("Plant deleted!", {
            style: {
                background: "#1a1a1a"
            }
        });
    };

    const saveEdit = async(id) => {
        await editPlant(id, {
            name: editedName,
            type: editedType,
        });
        setEditingPlantId(null);
        fetchPlants();
        toast.success("Plant info updated!", {
            style: {
            background: "#1a1a1a"
            }
        });
    };

    const showChart = (plantId) => {
        setSelectedPlantForChart(selectedPlantForChart === plantId ? null : plantId);
    };

    useEffect(() => {
       const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
            updateAllPlantSensors(user.uid);
            const interval = setInterval(() => {
                updateAllPlantSensors(user.uid);
            }, 60000);

            return () => clearInterval(interval);
        }
    });
    return () => unsubscribe();
    }, []);

    return(
        <div>
            <h2>Your Plants 🌱</h2>
            <AddPlantForm onPlantAdded={fetchPlants} />

            {plants.length === 0 ?
                (<p>No plants yet! Add one above!</p>) : 
                (<ul className="plant-list">
                    {plants.map((plant) => (
                        <li key={plant.id} className={`plant-card ${getStatusClass(plant.status)}`}>
                            <div className="plant-header">
                                <strong>{plant.name}</strong> - {plant.type}
                                <div>Status: <b>{plant.status}</b></div>
                                {/* afisare date senzori */}
                                {plant.sensors && (
                                    <div className="sensor-data">
                                        <small>
                                            🌡️ {plant.sensors.temperature}°C | 
                                            💧 {plant.sensors.soilMoisture}% | 
                                            ☀️ {plant.sensors.lightLevel} lux
                                        </small>
                                    </div>
                                )}

                                <small>
                                    Last Update:{" "}
                                    {plant.lastUpdated
                                    ? new Date(plant.lastUpdated.seconds * 1000).toLocaleString()
                                    : "N/A"}
                                </small>
                            </div>

                        <div className="buttons">
                                <button onClick={() => showChart(plant.id)} className="button-chart">
                                    {selectedPlantForChart === plant.id ? 'Hide Chart' : 'Show Chart'}
                                </button>
                                
                                <button onClick={() => handleDelete(plant.id)} className="button-delete">Delete</button>
                                
                                {editingPlantId === plant.id ? (
                                    <>
                                        <input value={editedName} onChange={(e) => setEditedName(e.target.value)} placeholder="Plant name"/>
                                        <input value={editedType} onChange={(e) => setEditedType(e.target.value)} placeholder="Plant type"/>
                                        <button onClick={() => saveEdit(plant.id)}>Save</button>
                                        <button onClick={() => setEditingPlantId(null)}>Cancel</button>
                                    </>
                                ) : (
                                    <button onClick={() => {setEditingPlantId(plant.id); setEditedName(plant.name); setEditedType(plant.type);}}
                                        className="button-edit">
                                        Edit
                                    </button>
                                )}
                            </div>
                            
                            {/* afisare grafic daca este selectat */}
                            {selectedPlantForChart === plant.id && (
                                <div className="chart-container">
                                    <PlantChart plantId={plant.id} />
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            )}
            
            <ToastContainer />
        </div>
    );
}