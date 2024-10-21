import type { UserProfileData, ProjectData} from '@/core/utils/types'
import { firestore } from './firebase-client'
import {
  collection,
  doc,
  DocumentSnapshot,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  startAfter,
  updateDoc,
  where,
  type DocumentData,
} from 'firebase/firestore'

type Collections = {
  user_profile: 'up_id'
  projects: 'pj_id'
}

type CollectionFields = {
  user_profile:keyof UserProfileData;
  projects: keyof ProjectData;
};

export type FirebaseOperators = '==' | '!=' | '<' | '<=' | '>' | '>=' | 'array-contains' | 'array-contains-any' | 'in' | 'not-in'

interface FirebaseReturn {
  status: boolean
  data: DocumentData | undefined
  error: string
}

export type FirebaseWhereCondition<T extends keyof Collections> = {
  fieldName: CollectionFields[T]; // This will reference the fields for the collection type
  operator: FirebaseOperators;
  value: any;
};

export type FirebaseOrderCondition<T extends keyof Collections> = {
  fieldName: CollectionFields[T];
  direction?: 'asc' | 'desc';
};


export async function getCollectionByField<
  T extends keyof Collections,
  //F extends CollectionFields[T]
>(
  $col: T,
  $id: Collections[T],
  // fieldName: F,
  whereConditions: FirebaseWhereCondition<T>[],
  limitResults?: number,
  orderConditions?: FirebaseOrderCondition<T>[],
  lastDocumentId?: string,
): Promise<FirebaseReturn> {
  const collectionRef = collection(firestore, $col);
  
  // Create a base query
  let q = query(collectionRef);

  // Apply where conditions
  for (const condition of whereConditions) {
    q = query(q, where(condition.fieldName as string, condition.operator, condition.value));
  }

  // Apply order conditions
  if (orderConditions) {
    for (const condition of orderConditions) {
      q = query(q, orderBy(condition.fieldName as string, condition.direction ? 'asc': condition.direction));
    }
  }

  // Apply limit if specified
  if (limitResults) {
    q = query(q, limit(limitResults));
  }

  // Apply startAfter if a document is provided
  if (lastDocumentId) {
    const lastDocumentSnapshot = await getDoc(doc(firestore, $col, lastDocumentId)); // Fetch last document snapshot
    if (lastDocumentSnapshot.exists()) {
      q = query(q, startAfter(lastDocumentSnapshot)); // Use the snapshot for pagination
    } else {
      console.warn(`Document with ID ${lastDocumentId} does not exist.`);
      // Optional: handle non-existing document scenario, e.g., reset to initial query
    }
  }

  try {
    const querySnapshot = await getDocs(q); // Fetch the documents
    if (!querySnapshot.empty) {
      const data = querySnapshot.docs.map((doc) => ({ ...doc.data() })); // Include document ID if needed
      return {
        status: true,
        data: data,
        error: '',
      };
    } else {
      return {
        status: false,
        error: `No data found.`,
        data: undefined,
      };
    }
  } catch (error) {
    return {
      status: false,
      error: `Error fetching data ${error}`,
      data: undefined,
    };
  }
}

export async function postCollection<T extends keyof Collections>( $col: T, $id: Collections[T], id: string = '', data: any, type: 'update' | 'new' = 'update' ): Promise<FirebaseReturn> {
  const userDocRef = doc(firestore, $col, id)
  try {
    const userSnapshot = await getDoc(userDocRef) // Fetch the document
    if (userSnapshot.exists()) {
      // Get the document data
      const postData = {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }
      await updateDoc(userDocRef, { ...postData })
      return {
        status: true,
        data: { ...postData },
        error: '',
      }
    } else {
      if (type === 'new') {
        const postData = {
          ...data,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }
        await setDoc(userDocRef, { ...postData })

        return {
          status: true,
          data: { ...postData },
          error: '',
        }
      }
      return {
        status: false,
        error: `No data found with that id ${$col}.`,
        data: undefined,
      }
    }
  } catch (error) {
    return {
      status: false,
      error: `No data found with that id ${$col}.`,
      data: undefined,
    }
  }
}

export async function getCollection<T extends keyof Collections>($col: T, $id: Collections[T], id: string): Promise<FirebaseReturn> {
  try {
    const userDocRef = doc(firestore, $col, id)
    const userSnapshot = await getDoc(userDocRef)
    if (userSnapshot.exists()) {
      return {
        status: true,
        data: { id: userSnapshot.id, ...userSnapshot.data() },
        error: '',
      }
    } else {
      return {
        status: false,
        error: `No data found.`,
        data: undefined,
      }
    }
  } catch (error) {
    return {
      status: false,
      error: `No data found with that id ${$col}.`,
      data: undefined,
    }
  }
}