import { collection, addDoc, getDocs, deleteDoc, doc, query, where, Timestamp, updateDoc } from "firebase/firestore";
import { db } from "../firebase/config";

export const addPlant = async(userId, name, type, status) => {
    const docRef = await addDoc(collection(db, "plants"), {
        userId, name, type, status, createdAt: Timestamp.now(), sonsors: null, lastUpdated: Timestamp.now()
    });
    return docRef.id;
};

export const getPlantsByUser = async(userId) => {
    const q = query(collection(db, "plants"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const deletePlant = async(id) => {
    await deleteDoc(doc(db, "plants", id));
};

export const updatePlantSensorData = async(plantId, sensorData, status) => {
    await updateDoc(doc(db, "plants", plantId), {
        sensors: sensorData,
        status: status,
        lastUpdated: Timestamp.now() //SAU updatedAt: new Date()
    });
};