import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage, auth } from '../firebase';
import { v4 as uuidv4 } from 'uuid';

/**
 * Uploads a file to Firebase Storage
 * @param file The file to upload
 * @param pathPrefix Optional prefix for the storage path (default: 'uploads')
 * @returns Promise resolving to the download URL
 */
export const uploadFile = async (file: File, pathPrefix: string = 'uploads'): Promise<string> => {
    if (!auth.currentUser) {
        throw new Error('User must be authenticated to upload files');
    }

    const fileExtension = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExtension}`;
    const filePath = `${pathPrefix}/${auth.currentUser.uid}/${fileName}`;

    const storageRef = ref(storage, filePath);

    try {
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        return downloadURL;
    } catch (error) {
        console.error('Error uploading file:', error);
        throw error;
    }
};

/**
 * Deletes a file from Firebase Storage
 * @param url The download URL of the file to delete
 */
export const deleteFile = async (url: string): Promise<void> => {
    if (!auth.currentUser) {
        throw new Error('User must be authenticated to delete files');
    }

    try {
        // Create a reference to the file to delete
        const storageRef = ref(storage, url);
        await deleteObject(storageRef);
    } catch (error) {
        console.error('Error deleting file:', error);
        throw error;
    }
};
