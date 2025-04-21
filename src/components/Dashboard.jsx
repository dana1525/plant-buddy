import { logout } from "../services/authService";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getPlantsByUser } from "../services/plantService";
import { deletePlant } from "../services/plantService";
import { auth } from "../firebase/config";
import AddPlantForm from "./AddPlantForm";
import { updateAllPlantSensors } from "../services/sensorService";

export default function Dashboard(){
    const navigate = useNavigate();

    // const handleLogout = async() => {
    //     await logout();
    //     navigate("/");
    // }

    const [plants, setPlants] = useState([]);

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
    }

    useEffect(() => {
        const interval = setInterval(() => {
            const user = auth.currentUser;
            if(user) updateAllPlantSensors(user.uid);
        }, 60000);
        return() => clearInterval(interval);
    }, []);


    return(
        <div>
            <h2>Your Plants 🌱</h2>
            <AddPlantForm onPlantAdded={fetchPlants} />
            <ul>
                {plants.map((plant) => (
                <li key={plant.id}>
                    <strong>{plant.name}</strong> - {plant.type} - Status: {plant.status}
                    <button onClick={() => handleDelete(plant.id)} className="button-delete">Delete</button>
                </li>
                ))}
            </ul>
        </div>
    );
}