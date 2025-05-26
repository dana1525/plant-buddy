import { useState } from "react";
import { addPlant } from "../services/plantService";
import { auth } from "../firebase/config"
import { addDoc, collection } from "firebase/firestore";
import { db } from "../firebase/config";
import { initializePlantSensors } from "../services/sensorService";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

/**
 * AddPlantForm Component - handles adding new plants to user's collection
 * Creates plant record, initializes sensors, and provides user feedback
 * @param {Function} onPlantAdded - callback function to notify parent component of new plant
 */

export default function AddPlantForm({ onPlantAdded }){
    const [name, setName] = useState("");
    const [type, setType] = useState("");
    const [status, setStatus] = useState("");


    /**
     * Handles form submission and plant creation process
     * Creates plant record, initializes sensor data, resets form, and shows success notification
     * @param {Event} e - form submit event
     */
    const handleSubmit = async(e) => {
        e.preventDefault();
        const user = auth.currentUser;
        if(!user) return;

        const plantId = await addPlant(user.uid, name, type, status);
        
        await initializePlantSensors(plantId, type);

        // Reset form fields after successful submission
        setName("");
        setType("");
        setStatus("");
        if(onPlantAdded) onPlantAdded(); // Notify dashboard

        // Show success notification to user
        toast.success("New plant added!", {
            style: {
                background: "#1a1a1a"
            }
        });
    };

    return(
        <form onSubmit={handleSubmit}>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Plant Name" />
            <input value={type} onChange={e => setType(e.target.value)} placeholder="Plant Type" />
            {/* <select value={status} onChange={(e) => setStatus(e.target.value)} placeholder="Plant Status">
                <option value="Healthy">Healthy</option>
                <option value="Needs Water">Needs Water</option>
                <option value="Needs Attention">Needs Attention</option>
            </select> */}
            <button type="submit">Add Plant</button>
        </form>
    );
}