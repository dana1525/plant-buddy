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

/**
 * Dashboard Component - main interface for plant management
 * Allows users to view, edit, delete, and monitor their plants
 * Integrates with Firebase Auth and displays sensor data per plant
 * Provides chart visualization and periodic sensor updates
 */

export default function Dashboard() {
    const [plants, setPlants] = useState([]);
    const [editingPlantId, setEditingPlantId] = useState(null);
    const [editedName, setEditedName] = useState("");
    const [editedType, setEditedType] = useState("");
    const [selectedPlantForChart, setSelectedPlantForChart] = useState(null);
    const [showModal, setShowModal] = useState(false);

    /**
     * Maps plant status to CSS class for styling
     * @param {string} status - plant health/status
     */
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

    /**
     * Fetches all plants associated with the current user
     */
    const fetchPlants = async() => {
        const user = auth.currentUser;
        if(!user) return;
        const data = await getPlantsByUser(user.uid);
        setPlants(data);
        };

        // Initial fetch of user's plants
        useEffect(() => {
            fetchPlants();
        }, []);

    /**
     * Deletes a plant by ID and refreshes the list
     * @param {string} id - plant ID to delete
     */
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

    /**
     * Saves edited plant name and type
     * @param {string} id - plant ID to edit
     */
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

    /**
     * Opens modal to show chart for selected plant
     * @param {string} plantId - plant to display chart for
     */
    const showChart = (plantId) => {
        setSelectedPlantForChart(plantId);
        setShowModal(true);
    };

    /**
     * Closes the chart modal
     */
    const closeModal = () => {
        setShowModal(false);
        setSelectedPlantForChart(null);
    };

    /**
     * Starts interval to update sensors when user is authenticated
     */
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
                                <div><b>{plant.status}</b></div>
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
                            <button 
                                onClick={() => showChart(plant.id)} 
                                className="button-chart"
                            >
                                Show Chart
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
                        </li>
                    ))}
                </ul>
            )}
            
            {/* Modal for plant chart */}
            {showModal && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    backdropFilter: 'blur(4px)',
                    zIndex: 100,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '1rem'
                }}>
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black bg-opacity-85 backdrop-blur-sm">
                    <div className="relative w-full max-w-6xl bg-gray-800 rounded-xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto border border-gray-600">
                        <button 
                            onClick={closeModal}
                            className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-700 transition-colors"
                            aria-label="Close chart"
                        >X</button>
                        
                        <h3 className="text-2xl font-bold mb-6 text-white">
                            {plants.find(p => p.id === selectedPlantForChart)?.name} - Sensor Data
                        </h3>
                        
                        <div className="mt-4">
                            <PlantChart plantId={selectedPlantForChart} />
                        </div>
                    </div>
                </div>
                </div>
            )}
            
            {/* Toast messages container */}
            <ToastContainer />
        </div>
    );
}