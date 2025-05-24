import { useState } from "react";
import { addPlant } from "../services/plantService";
import { auth } from "../firebase/config"
import { addDoc, collection } from "firebase/firestore";
import { db } from "../firebase/config";
import { initializePlantSensors } from "../services/sensorService";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function AddPlantForm({ onPlantAdded }){
    const [name, setName] = useState("");
    const [type, setType] = useState("");
    const [status, setStatus] = useState("");

    const handleSubmit = async(e) => {
        e.preventDefault();
        const user = auth.currentUser;
        if(!user) return;

        // const plantDoc = await addDoc(collection(db, "plants"), {
        //     userId: user.uid, name, type, createdAt: new Date()
        // });
    
        const plantId = await addPlant(user.uid, name, type, status);
        
        await initializePlantSensors(plantId, type);
        setName("");
        setType("");
        setStatus("");
        if(onPlantAdded) onPlantAdded(); //notify dashboard

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