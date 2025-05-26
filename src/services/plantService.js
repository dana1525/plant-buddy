import { collection, addDoc, getDocs, deleteDoc, doc, query, where, Timestamp, updateDoc, orderBy } from "firebase/firestore";
import { db } from "../firebase/config";
import { snapshotEqual } from "firebase/firestore";

export const addPlant = async(userId, name, type, status) => {
    const docRef = await addDoc(collection(db, "plants"), {
        userId, name, type, status, createdAt: Timestamp.now(), sensors: null, lastUpdated: Timestamp.now()
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
    await logPlantStatus(plantId, sensorData, status);
    await pruneLogs(plantId, 100);
};

//salvare stare curenta a plantei intr-un log istoric
export const logPlantStatus = async(plantId, sensorData, status) => {
    const logsRef = collection(db, "plants", plantId, "logs");
    await addDoc(logsRef, {
        plantId,
        status,
        sensors: sensorData,
        timestamp: Timestamp.now()
    })
}

export const getPlantLogs = async (plantId) => {
  const logsRef = collection(db, "plants", plantId, "logs");
  const logsQuery = query(
    logsRef,
    orderBy("timestamp", "desc")
  );

  const snapshot = await getDocs(logsQuery);
  const logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  return logs;
};

export const pruneLogs = async (plantId, maxLogs = 50) => {
  const logsRef = collection(db, "plants", plantId, "logs");

  // toate logurile, ordonate descrescator dupa timestamp
  const logsQuery = query(logsRef, orderBy("timestamp", "desc"));
  const logsSnapshot = await getDocs(logsQuery);

  // daca sunt prea multe loguri, le sterg pe cele mai vechi
  const logs = logsSnapshot.docs;
  if (logs.length > maxLogs) {
    const logsToDelete = logs.slice(maxLogs); // cele mai vechi
    for (const log of logsToDelete) {
      await deleteDoc(doc(db, "plants", plantId, "logs", log.id));
    }
  }
};