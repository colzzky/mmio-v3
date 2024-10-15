import { firestore, auth } from './firebase-client'
import { addDoc, collection, doc, getDoc, getDocs, getFirestore, query, serverTimestamp, setDoc, updateDoc, where, type DocumentData } from 'firebase/firestore'

type Collections = {
  'user_profile': 'up_id',
  'settings': 's_id'
};

export async function postCollection<T extends keyof Collections>($col: T, $id: Collections[T], id: string = '', data: any, type: 'update' | 'new' = 'update'): Promise<{
  status: boolean;
  data: DocumentData | undefined;
  error: string;
}> {
  const userDocRef = doc(firestore, $col, id)
  try {
    const userSnapshot = await getDoc(userDocRef) // Fetch the document
    if (userSnapshot.exists()) {
       // Get the document data
      await updateDoc(userDocRef, {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
      const returnData = userSnapshot.data()
      return {
        status: true,
        data: returnData,
        error: ''
      }
    } else {
      if(type === 'new'){
        await setDoc(userDocRef, {
          ...data,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        })
        const returnData = userSnapshot.data()
        return {
          status: true,
          data: returnData,
          error: ''
        }
      }
      return {
        status: false,
        error: `No data found with that id ${$col}.`,
        data: undefined
      }

    }
  } catch (error) {
    return {
      status: false,
      error: `No data found with that id ${$col}.`,
      data: undefined
    }
  }

}

export async function getCollection<T extends keyof Collections>($col: T, $id: Collections[T], id: string): Promise<{
  status: boolean;
  data: DocumentData | undefined;
  error: string;
}> {
  try {
    const collectionRef = collection(firestore, $col);
    const q = query(collectionRef, where(`${$id}`, '==', id));

    const querySnapshot = await getDocs(q) // Fetch the document
    if (!querySnapshot.empty) {
      const data = querySnapshot.docs.map(doc => ({ ...doc.data() })); // Get the document data
      return {
        status: true,
        data: data,
        error: ''
      };
    } else {
      return {
        status: false,
        error: `No data found.`,
        data: undefined
      };
    }

  } catch (error) {
    return {
      status: false,
      error: `No data found with that id ${$col}.`,
      data: undefined
    }
  }
}

export async function getCollectionByField<T extends keyof Collections>($col: T, $id: Collections[T],
  fieldName: string,
  operator: '==' | '!=' | '<' | '<=' | '>' | '>=' | 'array-contains' | 'array-contains-any' | 'in' | 'not-in',
  fieldValue: any // Use 'any' to accommodate different types of values
): Promise<{
  status: boolean;
  data: DocumentData | undefined;
  error: string;
}> {
  const collectionRef = collection(firestore, $col);

  // Create a query based on the specified field, operator, and value
  const q = query(collectionRef, where(fieldName, operator, fieldValue));

  try {
    const querySnapshot = await getDocs(q); // Fetch the documents
    if (!querySnapshot.empty) {
      const data = querySnapshot.docs.map(doc => ({...doc.data() })); // Get the document data
      return {
        status: true,
        data: data,
        error: ''
      };
    } else {
      return {
        status: false,
        error: `No data found.`,
        data: undefined
      };
    }
  } catch (error) {
    return {
      status: false,
      error: `Error fetching data.`,
      data: undefined
    };
  }
}
