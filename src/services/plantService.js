import { collection, addDoc, getDocs, deleteDoc, doc, query, where, Timestamp, updateDoc, orderBy } from "firebase/firestore";
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

export const editPlant = async(id, updatedData) => {
    await updateDoc(doc(db, "plants", id), {
        ...updatedData,
        lastUpdated: Timestamp.now()});
};

export const updatePlantSensorData = async(plantId, sensorData, status) => {
    await updateDoc(doc(db, "plants", plantId), {
        sensors: sensorData,
        status: status,
        lastUpdated: Timestamp.now()
    });
};

//salvare stare curenta a plantei intr-un log istoric
export const logPlantStatus = async(plantId, sensorData, status) => {
    const logsRef = collection(db, "plants", plantId, "logs");
    await addDoc(logsRef, {
        status,
        sensorData,
        timestamp: Timestamp.now()
    })
}

export const getPlantLogs = async(plantId) => {
    const logsRef = collection(db, "plants", plantId, "logs");
    // const q = query(logsRef, orderBy("timestamp"));
    const snapshot = await getDocs(logsRef);
    // return snapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
    return snapshotEqual.docs.map(doc => doc.data());
}