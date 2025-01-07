import { firestore } from './firebase-client'
import type { CollectionsInterface, SubCollectionKey } from '@/core/types/FirestoreTypes'

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
  runTransaction,
  deleteDoc,
} from 'firebase/firestore'

type Collections = {
  user_profile: 'up_id'
  workspaces: 'ws_id'
  platform_api: 'pa_id'
  meta_pages: 'mp_id'
  chat_bot_flow: 'cb_id'
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
  $operation: {
    $path: CollectionsInterface[T]['path'] // Path like 'collection/id'
    $sub_params?: CollectionsInterface[T]['sub_params'] | null // Optional sub-params
    id: string // Optional ID
    data: any // Data to update or create
    type?: 'update' | 'new' // Defaults to 'update'
  },
): Promise<FirebaseReturn> {
  const { $path, $sub_params = null, id = '', data, type = 'update' } = $operation

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
      if (type === 'update') {
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
      }

      return {
        status: false,
        error: `Document with ID already exists, use 'update' type instead.`,
        data: undefined,
      }
    } else {
      if (type === 'new') {
        const postData = {
          ...data,
          createdAt: Timestamp.fromDate(new Date()),
          updatedAt: Timestamp.fromDate(new Date()),
        }

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
    console.error(error)

    return {
      status: false,
      error: `Error occurred while processing operation for ${$col}: ${error}`,
      data: undefined,
    }
  }
}

export async function deleteCollection<T extends keyof CollectionsInterface>(
  $col: T,
  $operation: {
    $path: CollectionsInterface[T]['path'] // Path like 'collection/id'
    $sub_params?: CollectionsInterface[T]['sub_params'] | null
    id: string // Document ID to delete
  },
): Promise<FirebaseReturn> {
  const { $path, $sub_params = null, id } = $operation
  let fullPath = $path as string

  // Replace placeholders in the path (e.g., ':userId') with actual values
  if ($sub_params) {
    Object.entries($sub_params).forEach(([key, value]) => {
      fullPath = fullPath.replace(`:${key}`, value) // Replace :key with its corresponding value
    })
  }

  // Create a reference to the document to delete
  const docRef = doc(firestore, fullPath, id)

  try {
    // Attempt to delete the document
    await deleteDoc(docRef)

    return {
      status: true,
      data: undefined,
      error: '',
    }
  } catch (error) {
    console.error('Error deleting document:', error)

    return {
      status: false,
      data: undefined,
      error: `Failed to delete document: ${error}`,
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
  $operation: {
    $path: CollectionsInterface[T]['path'] // Path like 'collection/id',
    $sub_params?: CollectionsInterface[T]['sub_params'] | null
    id: string
    $sub_col?: SubCollectionKey<CollectionsInterface[T]['interface']> // Array of subcollection names to check
  },
): Promise<FirebaseReturn> {
  const { $path, $sub_params = null, id, $sub_col = [] } = $operation

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
      if ($sub_col.length > 0) {
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


export async function getWhereAny<T extends keyof CollectionsInterface>(
  $col: T, // Path like 'collection/id',
  $operation: {
    $path: CollectionsInterface[T]['path'] // Path like 'collection/id',
    $sub_params?: CollectionsInterface[T]['sub_params'] | null
    $sub_col?: SubCollectionKey<CollectionsInterface[T]['interface']> // Array of subcollection names to check
    whereConditions?: {
      fieldName: NestedKeyOf<CollectionsInterface[T]['interface']>
      operator: FirebaseOperators
      value: any
    }[]
    orderConditions?: {
      fieldName: NestedKeyOf<CollectionsInterface[T]['interface']>
      direction?: 'asc' | 'desc'
    }[]
    limitResult?: number
    lastDocumentId?: string
  },
): Promise<FirebaseWhereReturn<CollectionsInterface[T]['interface']>> {
  // Destructure the $operation object
  const {
    $path,
    $sub_params = null,
    $sub_col = [],
    whereConditions = [],
    orderConditions,
    limitResult,
    lastDocumentId,
  } = $operation

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
  $operation: {
    $path: string // Full path to the document (e.g., 'meta_pages/mp_id')
    $sub_col?: SubCollectionKey<CollectionsInterface[T]['interface']> // Subcollection names (e.g., ['comments', 'logs'])
  },
): Promise<FirebaseModelReturn<CollectionsInterface[T]['interface']>> {
  // Destructure the $operation object
  const { $path, $sub_col = [] } = $operation

  try {
    // Reference to the document
    const docRef = doc(firestore, $path)
    const userSnapshot = await getDoc(docRef) // Fetch the document

    if (userSnapshot.exists()) {
      // Extract document data and format timestamps
      const id_snap = userSnapshot.id
      const data = {
        ...userSnapshot.data(),
        createdAt: userSnapshot.data().createdAt.toDate().toISOString(),
        updatedAt: userSnapshot.data().updatedAt.toDate().toISOString(),
      }

      // Store subcollection data if available
      const subCollectionData: Record<string, any[]> = {} // To store subcollection data

      // Fetch subcollections if provided
      if ($sub_col) {
        for (const sub of $sub_col) {
          const subColRef = collection(firestore, `${$path}/${id_snap}/${sub}`)
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
      const { ...new_data } = data

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
  $path: CollectionsInterface[T]['path'],
  $sub_params: CollectionsInterface[T]['sub_params'] | null = null,
  id: string,
  $sub_col: SubCollectionKey<CollectionsInterface[T]['interface']> = [], // Array of subcollection names to check
  onUpdate: (data: any) => void, // Callback to handle updates
): Promise<() => void> {
  try {
    let fullPath = $path as string

    if ($sub_params) {
      Object.entries($sub_params).forEach(([key, value]) => {
        fullPath = fullPath.replace(`:${key}`, value) // Replace :key with its corresponding value
      })
    }

    const docRef = doc(firestore, fullPath, id)

    // Listener for the main document
    const unsubscribeDoc = onSnapshot(docRef, async (docSnapshot: DocumentSnapshot) => {
      if (docSnapshot.exists()) {
        const data = {
          id: docSnapshot.id,
          ...docSnapshot.data(),
          createdAt: docSnapshot.data()?.createdAt?.toDate().toISOString(),
          updatedAt: docSnapshot.data()?.updatedAt?.toDate().toISOString(),
        }

        const subCollectionData: Record<string, any[]> = {}

        // Listener for specified subcollections
        const unsubscribeSubCollections = await Promise.all(
          $sub_col.map(async (sub) => {
            const subColRef = collection(firestore, `${fullPath}/${data.id}/${sub}`)
            return onSnapshot(subColRef, (subSnapshot: QuerySnapshot) => {
              subCollectionData[sub] = subSnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data()?.createdAt?.toDate().toISOString(),
                updatedAt: doc.data()?.updatedAt?.toDate().toISOString(),
              }))

              // Notify with the updated data including subcollections
              onUpdate({
                ...data,
                ...subCollectionData,
              })
            })
          }),
        )

        // Notify with initial data
        onUpdate({
          ...data,
          ...subCollectionData,
        })

        // Return a function to unsubscribe both main and subcollection listeners
        return () => {
          unsubscribeDoc()
          unsubscribeSubCollections.forEach((unsubscribe) => unsubscribe())
        }
      } else {
        console.warn('Document does not exist.')
        onUpdate(null) // Notify with null if the document doesn't exist
      }
    })

    // Return unsubscribe function for the main document listener
    return unsubscribeDoc
  } catch (error) {
    console.error('Error setting up listener:', error)
    throw error
  }
}

//Atomic Post Collection

export type FSPostBatchCollection<T extends keyof CollectionsInterface> = Array<{
  $col: T
  $path: CollectionsInterface[T]['path']
  $sub_params: CollectionsInterface[T]['sub_params'] | null
  id: string
  data: Record<string, any>
  type: 'update' | 'new'
}>

export async function postMultipleCollectionsAtmoic<T extends keyof CollectionsInterface>(
  operations: FSPostBatchCollection<T>,
): Promise<Array<FirebaseReturn>> {
  try {
    const results = await runTransaction(firestore, async (transaction) => {
      const responseArray: Array<FirebaseReturn> = []

      for (const op of operations) {
        let fullPath = op.$path as string

        // Replace dynamic placeholders in path with actual values
        if (op.$sub_params) {
          Object.entries(op.$sub_params).forEach(([key, value]) => {
            fullPath = fullPath.replace(`:${key}`, value)
          })
        }

        const docRef = doc(firestore, fullPath, op.id)

        // Fetch the document inside the transaction
        const docSnapshot = await transaction.get(docRef)

        if (docSnapshot.exists()) {
          if (op.type === 'update') {
            const updatedData = {
              ...op.data,
              updatedAt: Timestamp.fromDate(new Date()),
            }
            transaction.update(docRef, updatedData)

            responseArray.push({
              status: true,
              data: {
                ...updatedData,
                updatedAt: updatedData.updatedAt.toDate().toISOString(),
              },
              error: '',
            })
          } else {
            throw new Error(`Document already exists. Use 'update' instead.`)
          }
        } else {
          if (op.type === 'new') {
            const newData = {
              ...op.data,
              createdAt: Timestamp.fromDate(new Date()),
              updatedAt: Timestamp.fromDate(new Date()),
            }
            transaction.set(docRef, newData)

            responseArray.push({
              status: true,
              data: {
                ...newData,
                createdAt: newData.createdAt.toDate().toISOString(),
                updatedAt: newData.updatedAt.toDate().toISOString(),
              },
              error: '',
            })
          } else {
            throw new Error(`Document does not exist. Use 'new' instead.`)
          }
        }
      }

      return responseArray
    })

    return results
  } catch (error) {
    console.error('Transaction failed:', error)
    return operations.map(() => ({
      status: false,
      error: `Transaction failed: ${error}`,
      data: undefined,
    }))
  }
}

interface FirebaseWhereReturnAtomic<T> {
  status: boolean // Indicates if the operation was successful
  data: Array<T & { id?: string }> | [] // Include document IDs in data when applicable
  error: string // Error message if the operation fails
  failedOperations?: Array<{ id: string; error: string }> // Track failed operations in batch processes
}

export async function postCollectionBatchAtomic<T extends keyof CollectionsInterface>(
  $col: T,
  $operation: {
    $path: CollectionsInterface[T]['path'] // Path like 'collection/id'
    $sub_params?: CollectionsInterface[T]['sub_params'] | null // Substitution params
    ids: string[] // Array of document IDs to update or create
    data: CollectionsInterface[T]['interface'][] // Data to post
  },
): Promise<FirebaseWhereReturnAtomic<CollectionsInterface[T]['interface']>> {
  const { $path, $sub_params = null, ids, data } = $operation

  if (ids.length !== data.length) {
    return {
      status: false,
      error: 'Mismatch between the number of IDs and data items.',
      data: [],
    }
  }

  const batch = writeBatch(firestore)
  const results: FirebaseReturn[] = []
  const failedOperations: Array<{ id: string; error: string }> = []

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

      // Add the operation to the batch
      batch.set(docRef, { ...postData }, { merge: true })

      // Prepare the result for successful operation
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

    // Commit the batch atomically
    await batch.commit()

    // Ensure that data is always an array and never undefined
    const nonUndefinedData = results.map((r) => r.data).filter((data) => data !== undefined)

    // Type assertion to assert that the result matches the expected type
    return {
      status: true,
      data: nonUndefinedData as (CollectionsInterface[T]['interface'] & { id?: string })[], // Assert the type here
      error: '',
    }
  } catch (error: any) {
    // If the batch fails, track the failed operations
    const errorMessage = error.message || 'Unknown error occurred'
    for (let i = 0; i < ids.length; i++) {
      failedOperations.push({
        id: ids[i],
        error: `Error processing document: ${errorMessage}`,
      })
    }

    return {
      status: false,
      error: `Batch operation failed: ${errorMessage}`,
      data: [],
      failedOperations,
    }
  }
}

export type FSPostMultiCollectAtomic<T extends keyof CollectionsInterface> = Array<{
  $col: T
  $path: CollectionsInterface[T]['path']
  $sub_params: CollectionsInterface[T]['sub_params'] | null
  ids: string[] // Array of document IDs to update or create
  data: CollectionsInterface[T]['interface'][] // Corresponding data for each document ID
}>

export async function postMultipleCollectionsBatchAtomic<T extends keyof CollectionsInterface>(
  operations: FSPostMultiCollectAtomic<T>,
): Promise<FirebaseWhereReturnAtomic<CollectionsInterface[T]['interface']>> {
  const batch = writeBatch(firestore)
  const results: FirebaseReturn[] = []
  const failedOperations: Array<{ id: string; error: string }> = []

  try {
    for (const operation of operations) {
      const { $col, $path, $sub_params, ids, data } = operation

      // Ensure ids and data arrays have the same length
      if (ids.length !== data.length) {
        return {
          status: false,
          error: `Mismatch between the number of IDs and data items for collection ${$col}`,
          data: [],
        }
      }

      // Iterate through each document to either create or update
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

        // Check if the document exists, and decide whether to create or update
        const docSnapshot = await getDoc(docRef)
        if (docSnapshot.exists()) {
          // Document exists, update it
          batch.update(docRef, { ...postData })
        } else {
          // Document does not exist, create it
          batch.set(docRef, { ...postData })
        }

        // Prepare the result for successful operation
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
    }

    // Commit the batch atomically
    await batch.commit()

    // Ensure that data is always an array and never undefined
    const nonUndefinedData = results.map((r) => r.data).filter((data) => data !== undefined)

    // Type assertion to assert that the result matches the expected type
    return {
      status: true,
      data: nonUndefinedData as (CollectionsInterface[T]['interface'] & { id?: string })[], // Assert the type here
      error: '',
    }
  } catch (error: any) {
    // If the batch fails, track the failed operations
    const errorMessage = error.message || 'Unknown error occurred'
    for (const operation of operations) {
      for (let i = 0; i < operation.ids.length; i++) {
        failedOperations.push({
          id: operation.ids[i],
          error: `Error processing document: ${errorMessage}`,
        })
      }
    }
    return {
      status: false,
      error: `Batch operation failed: ${errorMessage}`,
      data: [],
      failedOperations,
    }
  }
}
