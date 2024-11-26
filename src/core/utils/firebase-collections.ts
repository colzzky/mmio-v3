import { firestore } from './firebase-client'
import type { CollectionsInterface, SubCollectionKey } from '@/core/types/FirestoreTypes'
import type {
  UserData,
  WorkspaceData,
  PlatformApiData,
  MetaPageData,
  ChatBotFlowData,
  TeamMembersData,
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
  onSnapshot,
  DocumentSnapshot,
  QuerySnapshot,
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
interface FirebaseModelReturn<T> {
  status: boolean
  data: T | undefined
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

type NestedKeyOf<ObjectType> = ObjectType extends object
  ? {
      [Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends object | undefined // Changed this line to handle optional objects
        ? Key extends string | number
          ? `${Key}` | `${Key}.${NestedKeyOf<Exclude<ObjectType[Key], undefined>>}`
          : never
        : Key extends string | number
          ? `${Key}`
          : never
    }[keyof ObjectType & (string | number)]
  : never

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
  $path: CollectionsInterface[T]['path'], // Path like 'collection/id',
  $sub_params: CollectionsInterface[T]['sub_params'] | null = null,
  ids: string[], // Array of document IDs to update or create
  data: CollectionsInterface[T]['interface'][],
): Promise<FirebaseWhereReturn<CollectionsInterface[T]['interface']>> {
  const batch = writeBatch(firestore)
  const results: FirebaseReturn[] = []

  try {
    for (let i = 0; i < ids.length; i++) {
      const id = ids[i]
      const docData = data[i]

      let fullPath = $path as string
      if ($sub_params) {
        Object.entries($sub_params).forEach(([key, value]) => {
          fullPath = fullPath.replace(`:${key}`, value) // Replace :key with its corresponding value
        })
      }

      const docRef = doc(firestore, fullPath, id)

      const postData = {
        ...docData,
        createdAt: docData.createdAt
          ? Timestamp.fromDate(new Date(docData.createdAt))
          : Timestamp.fromDate(new Date()),
        updatedAt: Timestamp.fromDate(new Date()),
      }

      // Use set with merge: true to either create or update the document
      batch.set(docRef, { ...postData }, { merge: true })

      results.push({
        status: true,
        data: {
          ...postData,
          createdAt: postData.createdAt.toDate().toISOString(),
          updatedAt: postData.updatedAt.toDate().toISOString(),
        },
        error: '',
      })
    }

    // Commit the batch operation
    await batch.commit()

    return {
      status: true,
      data,
      error: '',
    }
  } catch (error: any) {
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
      const data = {
        id: userSnapshot.id,
        ...userSnapshot.data(),
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
      q = query(
        q,
        orderBy(condition.fieldName as string, !condition.direction ? 'asc' : condition.direction),
      )
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
    fieldName: NestedKeyOf<CollectionsInterface[T]['interface']>
    operator: FirebaseOperators
    value: any
  }[] = [],
  orderConditions?: {
    fieldName: NestedKeyOf<CollectionsInterface[T]['interface']>
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

/**
 * Fetches a specific document from Firestore and optionally its subcollections.
 *
 * @param $col - The main collection key (from `CollectionsInterface`) to define which collection the document belongs to.
 * @param $path - The full path to the document (e.g., `collection/id`).
 * @param $sub_col - An optional array of subcollection names to fetch data from. Default is an empty array (no subcollections).
 *
 * @returns A promise that resolves to an object representing the status, data, and any error message.
 *
 * The data returned will include:
 * - The fields from the document specified in `CollectionsInterface[T]['interface']`.
 * - Optionally, data from any subcollections if `$sub_col` is provided.
 *
 * If an error occurs while fetching the document or subcollections, the promise will resolve to an error message.
 *
 * Example:
 * ```ts
 * const result = await getExact('meta_page', 'meta_pages/mp_id', ['comments', 'logs']);
 * if (result.status) {
 *   console.log(result.data); // Document data along with subcollection data
 * } else {
 *   console.error(result.error); // Error message
 * }
 * ```
 */
export async function getExact<T extends keyof CollectionsInterface>(
  $col: T, // Collection key (e.g., 'meta_page', 'invitation')
  $path: string, // Full path to the document (e.g., 'meta_pages/mp_id')
  $sub_col: SubCollectionKey<CollectionsInterface[T]['interface']> = [], // Subcollection names (e.g., ['comments', 'logs'])
): Promise<FirebaseModelReturn<CollectionsInterface[T]['interface']>> {
  try {
    // Reference to the document
    const docRef = doc(firestore, $path)
    const userSnapshot = await getDoc(docRef) // Fetch the document

    if (userSnapshot.exists()) {
      // Extract document data and format timestamps
      const data = {
        id: userSnapshot.id,
        ...userSnapshot.data(),
        createdAt: userSnapshot.data().createdAt.toDate().toISOString(),
        updatedAt: userSnapshot.data().updatedAt.toDate().toISOString(),
      }

      // Store subcollection data if available
      const subCollectionData: Record<string, any[]> = {} // To store subcollection data

      // Fetch subcollections if provided
      if ($sub_col) {
        for (const sub of $sub_col) {
          const subColRef = collection(firestore, `${$path}/${data.id}/${sub}`)
          const subColSnapshot = await getDocs(subColRef)

          // Map and format subcollection data
          subCollectionData[sub] = subColSnapshot.docs.map((doc) => ({
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate().toISOString(),
            updatedAt: doc.data().updatedAt?.toDate().toISOString(),
          }))
        }
      }

      // Remove the id from the data to keep it clean
      const { id, ...new_data } = data

      // Return the document data along with subcollection data if available
      return {
        status: true,
        data: {
          ...new_data,
          ...subCollectionData, // Add subcollection data to the result
        } as CollectionsInterface[T]['interface'],
        error: '',
      }
    } else {
      return {
        status: false,
        error: `No data found`,
        data: undefined,
      }
    }
  } catch (error) {
    // Catch any errors and return them
    return {
      status: false,
      error: `Error fetching data: ${error}`,
      data: undefined,
    }
  }
}

export async function listenToCollection<T extends keyof CollectionsInterface>(
  $col: T,
  $path: CollectionsInterface[T]["path"],
  $sub_params: CollectionsInterface[T]["sub_params"] | null = null,
  id: string,
  $sub_col: SubCollectionKey<CollectionsInterface[T]["interface"]> = [], // Array of subcollection names to check
  onUpdate: (data: any) => void // Callback to handle updates
): Promise<() => void> {
  try {
    let fullPath = $path as string;

    if ($sub_params) {
      Object.entries($sub_params).forEach(([key, value]) => {
        fullPath = fullPath.replace(`:${key}`, value); // Replace :key with its corresponding value
      });
    }

    const docRef = doc(firestore, fullPath, id);

    // Listener for the main document
    const unsubscribeDoc = onSnapshot(docRef, async (docSnapshot: DocumentSnapshot) => {
      if (docSnapshot.exists()) {
        const data = {
          id: docSnapshot.id,
          ...docSnapshot.data(),
          createdAt: docSnapshot.data()?.createdAt?.toDate().toISOString(),
          updatedAt: docSnapshot.data()?.updatedAt?.toDate().toISOString(),
        };

        const subCollectionData: Record<string, any[]> = {};

        // Listener for specified subcollections
        const unsubscribeSubCollections = await Promise.all(
          $sub_col.map(async (sub) => {
            const subColRef = collection(firestore, `${fullPath}/${data.id}/${sub}`);
            return onSnapshot(subColRef, (subSnapshot: QuerySnapshot) => {
              subCollectionData[sub] = subSnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data()?.createdAt?.toDate().toISOString(),
                updatedAt: doc.data()?.updatedAt?.toDate().toISOString(),
              }));

              // Notify with the updated data including subcollections
              onUpdate({
                ...data,
                ...subCollectionData,
              });
            });
          })
        );

        // Notify with initial data
        onUpdate({
          ...data,
          ...subCollectionData,
        });

        // Return a function to unsubscribe both main and subcollection listeners
        return () => {
          unsubscribeDoc();
          unsubscribeSubCollections.forEach((unsubscribe) => unsubscribe());
        };
      } else {
        console.warn("Document does not exist.");
        onUpdate(null); // Notify with null if the document doesn't exist
      }
    });

    // Return unsubscribe function for the main document listener
    return unsubscribeDoc;
  } catch (error) {
    console.error("Error setting up listener:", error);
    throw error;
  }
}