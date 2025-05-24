// import { logout } from "../services/authService";
// import { useNavigate } from "react-router-dom";
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
    // const navigate = useNavigate();
    
    const [plants, setPlants] = useState([]);

    const [editingPlantId, setEditingPlantId] = useState(null);
    const [editedName, setEditedName] = useState("");
    const [editedType, setEditedType] = useState("");

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

    useEffect(() => {
       const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
            updateAllPlantSensors(user.uid);
            const interval = setInterval(() => {
                updateAllPlantSensors(user.uid);
            }, 2000);

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
                <ul className="plant-list">
  {plants.map((plant) => (
    <li key={plant.id} className={`plant-card ${getStatusClass(plant.status)}`}>
      <strong>{plant.name}</strong> - {plant.type}
      <div>Status: <b>{plant.status}</b></div>
      <small>
        Last Update:{" "}
        {plant.lastUpdated
          ? new Date(plant.lastUpdated.seconds * 1000).toLocaleString()
          : "N/A"}
      </small>
      <div className="buttons">
        <button onClick={() => handleDelete(plant.id)} className="button-delete">Delete</button>
        {editingPlantId === plant.id ? (
          <>
            <input value={editedName} onChange={(e) => setEditedName(e.target.value)} />
            <input value={editedType} onChange={(e) => setEditedType(e.target.value)} />
            <button onClick={() => saveEdit(plant.id)}>Save</button>
            <button onClick={() => setEditingPlantId(null)}>Cancel</button>
          </>
        ) : (
          <button
            onClick={() => {
              setEditingPlantId(plant.id);
              setEditedName(plant.name);
              setEditedType(plant.type);
            }}
            className="button-edit"
          >
            Edit
          </button>
        )}
      </div>
    </li>
  ))}
</ul>


            }
        </div>
    );
}