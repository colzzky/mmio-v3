import { firestore, auth } from './firebase-client'
import { doc, getDoc, getFirestore, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore'

type collections = 'user_profile'

export async function postCollection(collection: collections, id: string | null, data: any, type: 'find' | 'new' = 'find') {
  const uniqueId = () => {
    if (!id) {
      const newDocRef = doc(firestore, collection)
      return newDocRef.id;
    }
    return id
  }
  const userDocRef = doc(firestore, collection, uniqueId())

  try {
    const userSnapshot = await getDoc(userDocRef) // Fetch the document
    if (userSnapshot.exists()) {
      const returnData = userSnapshot.data() // Get the document data
      await updateDoc(userDocRef, {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
      return {
        status: true,
        data: returnData
      }
    } else {
      if (type === 'new') {
        await setDoc(userDocRef, {
          ...data,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
      return {
        status: false,
        error: `No data found with that id ${collection}.`
      }
    }
  } catch (error) {
    return {
      status: false,
      error: `No data found with that id ${collection}.`
    }
  }
}
export async function getCollection(collection: collections, id: string) {
  const userDocRef = doc(firestore, collection, id)
  try {
    const userSnapshot = await getDoc(userDocRef) // Fetch the document
    if (userSnapshot.exists()) {
      const data = userSnapshot.data() // Get the document data
      return {
        status: true,
        data: data
      }
    } else {
      return {
        status: false,
        error: `No data found with that id ${collection}.`
      }
    }
  } catch (error) {
    return {
      status: false,
      error: `No data found with that id ${collection}.`
    }
  }
}
