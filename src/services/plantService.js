import { collection, addDoc, getDocs, deleteDoc, doc, query, where, Timestamp, updateDoc, orderBy } from "firebase/firestore";
import { db } from "../firebase/config";
import { snapshotEqual } from "firebase/firestore";


/**
 * Adds a new plant to the Firestore database
 * @param {string} userId - ID of the user who owns the plant
 * @param {string} name - Name of the plant
 * @param {string} type - Type/species of the plant
 * @param {string} status - Initial health status of the plant
 * @returns {Promise<string>} - The document ID of the newly created plant
 */
export const addPlant = async(userId, name, type, status) => {
    const docRef = await addDoc(collection(db, "plants"), {
        userId, name, type, status, createdAt: Timestamp.now(), sensors: null, lastUpdated: Timestamp.now()
    });
    return docRef.id;
};


/**
 * Fetches all plants associated with a specific user
 * @param {string} userId - Firebase UID of the user
 * @returns {Promise<Array>} - Array of plant objects with IDs and data
 */
export const getPlantsByUser = async(userId) => {
    const q = query(collection(db, "plants"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};


/**
 * Deletes a plant from Firestore
 * @param {string} id - ID of the plant document
 * @returns {Promise<void>}
 */
export const deletePlant = async(id) => {
    await deleteDoc(doc(db, "plants", id));
};


/**
 * Updates the name/type/status of a plant
 * Also updates the lastUpdated timestamp
 * @param {string} id - ID of the plant document
 * @param {Object} updatedData - Data to update (e.g. name, type)
 * @returns {Promise<void>}
 */
export const editPlant = async(id, updatedData) => {
    await updateDoc(doc(db, "plants", id), {
        ...updatedData,
        lastUpdated: Timestamp.now()});
};


/**
 * Updates sensor data and status for a specific plant
 * Also creates a log entry and prunes excess logs
 * @param {string} plantId - ID of the plant
 * @param {Object} sensorData - New sensor readings
 * @param {string} status - New status determined from sensor data
 * @returns {Promise<void>}
 */
export const updatePlantSensorData = async(plantId, sensorData, status) => {
    await updateDoc(doc(db, "plants", plantId), {
        sensors: sensorData,
        status: status,
        lastUpdated: Timestamp.now()
    });
    await logPlantStatus(plantId, sensorData, status);
    await pruneLogs(plantId, 100);
};


/**
 * Creates a historical log entry of a plant's sensor readings and status
 * @param {string} plantId - ID of the plant
 * @param {Object} sensorData - Sensor readings at the time
 * @param {string} status - Current status of the plant
 * @returns {Promise<void>}
 */
export const logPlantStatus = async(plantId, sensorData, status) => {
    const logsRef = collection(db, "plants", plantId, "logs");
    await addDoc(logsRef, {
        plantId,
        status,
        sensors: sensorData,
        timestamp: Timestamp.now()
    })
}


/**
 * Retrieves historical sensor logs for a plant
 * @param {string} plantId - ID of the plant
 * @returns {Promise<Array>} - Array of log entries (ordered descending)
 */
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


/**
 * Deletes older log entries to keep the total under a limit
 * Keeps the most recent `maxLogs` entries
 * @param {string} plantId - ID of the plant
 * @param {number} maxLogs - Maximum number of log entries to keep
 * @returns {Promise<void>}
 */
export const pruneLogs = async (plantId, maxLogs = 50) => {
  const logsRef = collection(db, "plants", plantId, "logs");

  const logsQuery = query(logsRef, orderBy("timestamp", "desc"));
  const logsSnapshot = await getDocs(logsQuery);

  const logs = logsSnapshot.docs;
  if (logs.length > maxLogs) {
    const logsToDelete = logs.slice(maxLogs);
    for (const log of logsToDelete) {
      await deleteDoc(doc(db, "plants", plantId, "logs", log.id));
    }
  }
};