import { firestore } from './firebase-client'
import type { CollectionsInterface, SubCollectionKey } from '@/core/types/FirestoreTypes'
import type {
  UserData,
  WorkspaceData,
  PlatformApiData,
  MetaPageData,
  ChatBotFlowData,
} from '@/core/utils/types'
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  Timestamp,
  setDoc,
  startAfter,
  updateDoc,
  where,
  type DocumentData,
  writeBatch,
} from 'firebase/firestore'

type Collections = {
  user_profile: 'up_id'
  workspaces: 'ws_id'
  platform_api: 'pa_id'
  meta_pages: 'mp_id'
  chat_bot_flow: 'cb_id'
}

type CollectionFields = {
  user_profile: keyof UserData
  workspaces: keyof WorkspaceData
  platform_api: keyof PlatformApiData
  meta_pages: keyof MetaPageData
  chat_bot_flow: keyof ChatBotFlowData
}


export type FirebaseOperators =
  | '=='
  | '!='
  | '<'
  | '<='
  | '>'
  | '>='
  | 'array-contains'
  | 'array-contains-any'
  | 'in'
  | 'not-in'

interface FirebaseReturn {
  status: boolean
  data: DocumentData | undefined
  error: string
}

interface FirebaseWhereReturn<T> {
  status: boolean
  data: T[] | []
  error: string
}

export type FirebaseWhereCondition<T extends keyof Collections> = {
  fieldName: CollectionFields[T] // This will reference the fields for the collection type
  operator: FirebaseOperators
  value: any
}

export type FirebaseOrderCondition<T extends keyof Collections> = {
  fieldName: CollectionFields[T]
  direction?: 'asc' | 'desc'
}


export async function postCollection<T extends keyof CollectionsInterface>(
  $col: T,
  $path: CollectionsInterface[T]['path'], // Path like 'collection/id',
  $sub_params: CollectionsInterface[T]['sub_params'] | null = null,
  id: string = '',
  data: any,
  type: 'update' | 'new' = 'update',
): Promise<FirebaseReturn> {
  let fullPath = $path as string

  if ($sub_params) {
    Object.entries($sub_params).forEach(([key, value]) => {
      fullPath = fullPath.replace(`:${key}`, value) // Replace :key with its corresponding value
    })
  }

  const userDocRef = doc(firestore, fullPath, id)

  try {
    const userSnapshot = await getDoc(userDocRef) // Fetch the document
    if (userSnapshot.exists()) {
      // Get the document data
      console.log(data.createdAt)
      const postData = {
        ...data,
        createdAt: Timestamp.fromDate(new Date(data.createdAt)),
        updatedAt: Timestamp.fromDate(new Date()),
      }

      await updateDoc(userDocRef, { ...postData })
      return {
        status: true,
        data: {
          ...postData,
          createdAt: postData.createdAt.toDate().toISOString(),
          updatedAt: postData.updatedAt.toDate().toISOString(),
        },
        error: '',
      }
    } else {
      if (type === 'new') {
        const postData = {
          ...data,
          createdAt: Timestamp.fromDate(new Date()),
          updatedAt: Timestamp.fromDate(new Date()),
        }

        // // Create a reference to the 'userStatuses' subcollection
        // const userStatusRef = collection(userDocRef, 'shared_users');
        // // Create a new document reference in the subcollection
        // const statusDocRef = doc(userStatusRef, 'statusId');
        // // Add the postData to the subcollection document
        // await setDoc(statusDocRef, postData);
        //await setDoc(userDocRef, { ...postData }, { merge: true });

        // Optionally, you can also set additional data in the main document
        await setDoc(userDocRef, { ...postData })

        return {
          status: true,
          data: {
            ...postData,
            createdAt: postData.createdAt.toDate().toISOString(),
            updatedAt: postData.updatedAt.toDate().toISOString(),
          },
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
    console.log(error)
    return {
      status: false,
      error: `No data found with that id error! ${$col}.`,
      data: undefined,
    }
  }
}

export async function postCollectionBatch<T extends keyof CollectionsInterface>(
  $col: T,
  $path: CollectionsInterface[T]["path"], // Path like 'collection/id',
  $sub_params: CollectionsInterface[T]["sub_params"] | null = null,
  ids: string[], // Array of document IDs to update or create
  data: CollectionsInterface[T]["interface"][]
): Promise<FirebaseWhereReturn<CollectionsInterface[T]['interface']>> {
  const batch = writeBatch(firestore);
  const results: FirebaseReturn[] = [];

  try {
    for (let i = 0; i < ids.length; i++) {
      const id = ids[i];
      const docData = data[i];

      let fullPath = $path as string;
      if ($sub_params) {
        Object.entries($sub_params).forEach(([key, value]) => {
          fullPath = fullPath.replace(`:${key}`, value); // Replace :key with its corresponding value
        });
      }

      const docRef = doc(firestore, fullPath, id);

      const postData = {
        ...docData,
        createdAt: docData.createdAt
          ? Timestamp.fromDate(new Date(docData.createdAt))
          : Timestamp.fromDate(new Date()),
        updatedAt: Timestamp.fromDate(new Date()),
      };

      // Use set with merge: true to either create or update the document
      batch.set(docRef, { ...postData }, { merge: true });

      results.push({
        status: true,
        data: {
          ...postData,
          createdAt: postData.createdAt.toDate().toISOString(),
          updatedAt: postData.updatedAt.toDate().toISOString(),
        },
        error: "",
      });
    }

    // Commit the batch operation
    await batch.commit();

    return {
      status: true,
      data,
      error: '',
    }
  } catch (error:any) {
    return {
      status: false,
      error: `Error fetching data from subcollection path: ${error}`,
      data: [],
    }
  }
}

export async function getCollection<T extends keyof CollectionsInterface>(
  $col: T,
  $path: CollectionsInterface[T]['path'], // Path like 'collection/id',
  $sub_params: CollectionsInterface[T]['sub_params'] | null = null,
  id: string,
  $sub_col: SubCollectionKey<CollectionsInterface[T]['interface']> = [], // Array of subcollection names to check
): Promise<FirebaseReturn> {
  try {
    let fullPath = $path as string

    if ($sub_params) {
      Object.entries($sub_params).forEach(([key, value]) => {
        fullPath = fullPath.replace(`:${key}`, value) // Replace :key with its corresponding value
      })
    }

    const userDocRef = doc(firestore, fullPath, id)
    const userSnapshot = await getDoc(userDocRef)
    

    if (userSnapshot.exists()) {
      const data = { id: userSnapshot.id, ...userSnapshot.data(), 
        createdAt: userSnapshot.data().createdAt.toDate().toISOString(),
        updatedAt: userSnapshot.data().updatedAt.toDate().toISOString(),
       }
      const subCollectionData: Record<string, any[]> = {} // To store subcollection data

      // Fetch specified subcollections
      if ($sub_col) {
        for (const sub of $sub_col) {
          
          const subColRef = collection(firestore, `${fullPath}/${data.id}/${sub}`)
          const subColSnapshot = await getDocs(subColRef)          
          subCollectionData[sub] = subColSnapshot.docs.map((doc) => ({
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate().toISOString(),
            updatedAt: doc.data().updatedAt?.toDate().toISOString(),
          }))
          
        }  
      }

      return {
        status: true,
        data: {
          ...data,
          ...subCollectionData, // Add subcollection data to the result
        },
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
      error: `Error fetching data: ${error}`,
      data: undefined,
    }
  }
}

export type CollectionWhereCondition<T> = {
  fieldName: keyof T // Use keyof to restrict to valid fields
  operator: FirebaseOperators
  value: any
}

export async function getBySub(
  $col: string,
  id: string,
  subCollections?: string[], // Accepts an array of subcollection names as strings
): Promise<FirebaseReturn> {
  try {
    const userDocRef = doc(firestore, $col, id)
    const userSnapshot = await getDoc(userDocRef)

    if (userSnapshot.exists()) {
      const data = { id: userSnapshot.id, ...userSnapshot.data() }
      const subCollectionData: Record<string, any[]> = {} // To store subcollection data

      // Fetch specified subcollections
      if (subCollections) {
        for (const subCol of subCollections) {
          const subColRef = collection(userDocRef, subCol)
          const subColSnapshot = await getDocs(subColRef)

          subCollectionData[subCol] = subColSnapshot.docs.map((doc) => doc.data())
        }
      }

      return {
        status: true,
        data: {
          ...data,
          ...subCollectionData, // Add subcollection data to the result
        },
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
      error: `Error fetching data: ${error}`,
      data: undefined,
    }
  }
}

type CollectionConfig<T> = {
  id: string
  path: string
  interface: T
  sub_col: string[]
  sub_params: { key: string }[] | null // This can still be flexible
}

export async function getCollectionByField<T extends keyof Collections>(
  $col: T,
  $id: Collections[T],
  // fieldName: F,
  whereConditions: FirebaseWhereCondition<T>[],
  limitResults?: number,
  orderConditions?: FirebaseOrderCondition<T>[],
  lastDocumentId?: string,
): Promise<FirebaseReturn> {
  const collectionRef = collection(firestore, $col)

  // Create a base query
  let q = query(collectionRef)

  // Apply where conditions
  for (const condition of whereConditions) {
    q = query(q, where(condition.fieldName as string, condition.operator, condition.value))
  }

  // Apply order conditions
  if (orderConditions) {
    for (const condition of orderConditions) {
      q = query(q,orderBy(condition.fieldName as string, !condition.direction ? 'asc' : condition.direction),)
      q = query(
        q,
        orderBy(condition.fieldName as string, !condition.direction ? 'asc' : condition.direction),
      )
    }
  }

  // Apply limit if specified
  if (limitResults) {
    q = query(q, limit(limitResults))
  }

  // Apply startAfter if a document is provided
  if (lastDocumentId) {
    const lastDocumentSnapshot = await getDoc(doc(firestore, $col, lastDocumentId)) // Fetch last document snapshot
    if (lastDocumentSnapshot.exists()) {
      q = query(q, startAfter(lastDocumentSnapshot)) // Use the snapshot for pagination
    } else {
      console.warn(`Document with ID ${lastDocumentId} does not exist.`)
      // Optional: handle non-existing document scenario, e.g., reset to initial query
    }
  }

  try {
    const querySnapshot = await getDocs(q) // Fetch the documents
    if (!querySnapshot.empty) {
      const data = querySnapshot.docs.map((doc) => ({
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate().toISOString(),
        updatedAt: doc.data().updatedAt.toDate().toISOString(),
      })) // Include document ID if needed
      return {
        status: true,
        data: data,
        error: '',
      }
    } else {
      return {
        status: false,
        error: `No data found.`,
        data: [],
      }
    }
  } catch (error) {
    return {
      status: false,
      error: `Error fetching data ${error}`,
      data: undefined,
    }
  }
}


export async function getWhereAny<T extends keyof CollectionsInterface>(
  $col: T, // Path like 'collection/id',
  $path: CollectionsInterface[T]['path'], // Path like 'collection/id',
  $sub_params: CollectionsInterface[T]['sub_params'] | null = null,
  $sub_col: SubCollectionKey<CollectionsInterface[T]['interface']> = [], // Array of subcollection names to check
  whereConditions: {
    fieldName: keyof CollectionsInterface[T]['interface']
    operator: FirebaseOperators
    value: any
  }[] = [],
  orderConditions?: {
    fieldName: keyof CollectionsInterface[T]['interface']
    direction?: 'asc' | 'desc'
  }[],

  limitResult?: number,
  lastDocumentId?: string,
): Promise<FirebaseWhereReturn<CollectionsInterface[T]['interface']>> {
  try {
    let fullPath = $path as string

    if ($sub_params) {
      Object.entries($sub_params).forEach(([key, value]) => {
        fullPath = fullPath.replace(`:${key}`, value) // Replace :key with its corresponding value
      })
    }

    // Create a reference to the main collection
    const collectionRef = collection(firestore, fullPath)
    let q = query(collectionRef)

    // Apply where conditions
    for (const condition of whereConditions) {
      q = query(q, where(condition.fieldName as string, condition.operator, condition.value))
    }

    // Apply orderBy condition if provided
    if (orderConditions) {
      for (const condition of orderConditions) {
        q = query(
          q,
          orderBy(
            condition.fieldName as string,
            !condition.direction ? 'asc' : condition.direction,
          ),
        )
      }
    }
    // Apply limit if specified
    if (limitResult) {
      q = query(q, limit(limitResult))
    }

    // Apply startAfter if a last document ID is provided
    if (lastDocumentId) {
      const lastDocumentSnapshot = await getDoc(doc(firestore, fullPath, lastDocumentId))
      if (lastDocumentSnapshot.exists()) {
        q = query(q, startAfter(lastDocumentSnapshot))
      } else {
        console.warn(`Document with ID ${lastDocumentId} does not exist.`)
      }
    }

    const querySnapshot = await getDocs(q)
    const data: any[] = [] // Array to hold documents with subcollection data

    // Loop through each document and fetch subcollections
    for (const doc of querySnapshot.docs) {
      const docData: { [key: string]: any } = {
        // Define a flexible type for docData
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate().toISOString(),
        updatedAt: doc.data().updatedAt?.toDate().toISOString(),
      }

      // Fetch data from each specified subcollection
      for (const sub of $sub_col) {
        const subCollectionRef = collection(firestore, `${fullPath}/${doc.id}/${sub}`)
        const subDocs = await getDocs(subCollectionRef)
        

        if (!subDocs.empty) {
          // Append the subcollection data directly to the document
          docData[sub] = subDocs.docs.map((subDoc) => ({
            id: subDoc.id,
            ...subDoc.data(),
            createdAt: subDoc.data().createdAt?.toDate().toISOString(),
            updatedAt: subDoc.data().updatedAt?.toDate().toISOString(),
          }))
        }
      }

      data.push(docData) // Add the document with its subcollection data to the results
    }

    return {
      status: true,
      data,
      error: '',
    }
  } catch (error) {
    console.log(error)
    return {
      status: false,
      error: `Error fetching data from subcollection path: ${error}`,
      data: [],
    }
  }
}
