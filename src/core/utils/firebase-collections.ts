import { firestore } from './firebase-client'
import type { CollectionsInterface } from '../types/firestoreInterface'
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
  // updateDoc,
  where,
  type DocumentData,
  writeBatch,
  onSnapshot,
  // DocumentSnapshot,
  // QuerySnapshot,
  // runTransaction,
  deleteDoc,
  getFirestore,
  getCountFromServer,
} from 'firebase/firestore'
// import type { Property } from './global-types'
// import { ref } from 'firebase/database'
import { chunk } from 'lodash'
import { uiHelpers } from './ui-helper'
import type { DbCollections } from './enums/dbCollection'
// import { DbCollections } from '@/types/enums/dbCollections'

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

const { isFullObj, replaceUndefinedWithNull } = uiHelpers

interface FirebaseReturn {
  status: boolean
  data: DocumentData | undefined
  error: string
}

interface FirebaseWhereReturn<T> {
  status: boolean
  data: T[] | []
  error: string
  totalCount: number
}

interface FirebaseModelReturn<T> {
  status: boolean
  data: T | undefined
  error: string
}

interface FirebaseWhereReturnAtomic<T> {
  status: boolean // Indicates if the operation was successful
  data: Array<T & { id?: string }> | [] // Include document IDs in data when applicable
  error: string // Error message if the operation fails
  failedOperations?: Array<{ id: string; error: string }> // Track failed operations in batch processes
}
export interface FirebaseDataReturnCollection<T extends keyof CollectionsInterface> {
  main: CollectionsInterface[T]['interface'];
  subCollections: {
    [K in CollectionsInterface[T]['subCollections'][number][0]]:
      CollectionsInterface[K]['interface'][];
  };
}


export interface FirebaseModelSCollectionReturn<T extends keyof CollectionsInterface> {
  status: boolean
  data: FirebaseDataReturnCollection<T> | undefined
  error: string
}
export interface FirebaseWhereSCollectionReturn<T extends keyof CollectionsInterface> {
  status: boolean
  data: FirebaseDataReturnCollection<T>[] | []
  error: string
  totalCount: number
}

export type NestedKeyOf<ObjectType> = ObjectType extends object
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

export type OrderCondition<T extends keyof CollectionsInterface> = {
  fieldName: NestedKeyOf<CollectionsInterface[T]['interface']>
  direction?: 'asc' | 'desc'
}

/**
 * Retrieves a single document from a Firestore collection.
 *
 * @param {T} $col - The collection key (e.g., 'users', 'posts').
 * @param {Object} $operation - The operation parameters.
 * @param {CollectionsInterface[T]['path']} $operation.$path - The full path of the document (e.g., 'collection/id').
 * @param {CollectionsInterface[T]['sub_params'] | null} [$operation.$sub_params=null] - Optional sub-parameters to replace dynamic segments in `$path`.
 * @param {string} $operation.id - The document ID to retrieve.
 *
 * @returns {Promise<FirebaseModelReturn<CollectionsInterface[T]['interface']>>} The result of the operation.
 */
export async function getCollection<T extends keyof CollectionsInterface>(
  $col: T,
  $operation: {
    $sub_params?: CollectionsInterface[T]['sub_params'] | null
    id: string
  },
): Promise<FirebaseModelReturn<CollectionsInterface[T]['interface']>> {
  const { $sub_params = null, id } = $operation

  try {
    let fullPath = $col as string

    // Replace path parameters with their values
    if ($sub_params) {
      Object.entries($sub_params).forEach(([key, value]) => {
        if (typeof value === 'string') {
          fullPath = fullPath.replace(`:${key}`, value) // Replace :key with its corresponding value
        }
      })
    }

    const docRef = doc(firestore, fullPath, id)
    const docSnapshot = await getDoc(docRef)

    if (docSnapshot.exists()) {
      const data = {
        ...docSnapshot.data(),
        createdAt: docSnapshot.data().createdAt?.toDate()?.toISOString() ?? null,
        updatedAt: docSnapshot.data().updatedAt?.toDate()?.toISOString() ?? null,
      } as any

      return {
        status: true,
        data,
        error: '',
      }
    } else {
      return {
        status: false,
        error: `No data found for document with ID '${id}'.`,
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

/**
 * Retrieves documents from a Firestore collection based on query conditions.
 *
 * @param {T} $col - The collection key (e.g., 'users', 'posts').
 * @param {Object} $operation - The query operation parameters.
 * @param {CollectionsInterface[T]['path']} $operation.$path - The full path of the collection (e.g., 'collection/id').
 * @param {CollectionsInterface[T]['sub_params'] | null} [$operation.$sub_params=null] - Optional sub-parameters.
 * @param {Array<{fieldName: string, operator: FirebaseOperators, value: any}>} [$operation.whereConditions] - Conditions for the query.
 * @param {Array<{fieldName: string, direction: 'asc' | 'desc'}>} [$operation.orderConditions] - Optional order-by conditions.
 * @param {number} [$operation.limitResult] - Limit for the number of results.
 * @param {string} [$operation.lastDocumentId] - ID of the last document for pagination.
 *
 * @returns {Promise<FirebaseWhereReturn<CollectionsInterface[T]['interface']>>} The query results.
 */
export async function getWhereAny<T extends keyof CollectionsInterface>(
  $col: T, // Path like 'collection/id',
  $operation: {
    $sub_params?: CollectionsInterface[T]['sub_params'] | null
    whereConditions?: {
      fieldName: NestedKeyOf<CollectionsInterface[T]['interface']>
      operator: FirebaseOperators
      value: any
    }[]
    orderConditions?: OrderCondition<T>[]
    limitResult?: number
    lastDocumentId?: string
  },
): Promise<FirebaseWhereReturn<CollectionsInterface[T]['interface']>> {
  // Destructure the $operation object
  const {
    $sub_params = null,
    whereConditions = [],
    orderConditions,
    limitResult,
    lastDocumentId,
  } = $operation

  try {
    let fullPath = $col as string

    if ($sub_params) {
      Object.entries($sub_params).forEach(([key, value]) => {
        if (typeof value === 'string') fullPath = fullPath.replace(`:${key}`, value) // Replace :key with its corresponding value
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

    // Get the total count of documents that match the conditions
    const totalCountSnapshot = await getCountFromServer(q)
    const totalCount = totalCountSnapshot.data().count

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
    const data: any[] = [] // Array to hold documents

    // Loop through each document
    querySnapshot.forEach((doc) => {
      data.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate().toISOString(),
        updatedAt: doc.data().updatedAt?.toDate().toISOString(),
      })
    })

    return {
      status: true,
      data,
      error: '',
      totalCount,
    }
  } catch (error) {
    console.log(error)
    return {
      status: false,
      error: `Error fetching data: ${error}`,
      data: [],
      totalCount: 0,
    }
  }
}

export async function getWhereAnyBatch<T extends keyof CollectionsInterface>(
  queries: { $col: T; $operation: Parameters<typeof getWhereAny>[1] }[]
): Promise<Record<T, FirebaseWhereReturn<CollectionsInterface[T]['interface']>>> {
  try {
    const results = await Promise.all(
      queries.map(({ $col, $operation }) => getWhereAny($col, $operation))
    );

    // Convert results into an object where keys are collection names
    const resultObject = queries.reduce((acc, { $col }, index) => {
      acc[$col] = results[index];
      return acc;
    }, {} as Record<T, FirebaseWhereReturn<CollectionsInterface[T]['interface']>>);

    return resultObject;
  } catch (error) {
    console.error("Error fetching multiple collections:", error);
    throw new Error("Failed to fetch all collections.");
  }
}


/**
 * Retrieves documents and their subcollections from Firestore.
 *
 * @param {T} $col - The collection key (e.g., 'users', 'posts').
 * @param {Object} $operation - The operation parameters.
 * @param {CollectionsInterface[T]['path']} $operation.$path - The full path of the collection (e.g., 'collection/id').
 * @param {CollectionsInterface[T]['sub_params'] | null} [$operation.$sub_params=null] - Optional sub-parameters.
 * @param {Array<{fieldName: string, operator: FirebaseOperators, value: any}>} [$operation.whereConditions] - Conditions for the query.
 * @param {Array<{fieldName: string, direction: 'asc' | 'desc'}>} [$operation.orderConditions] - Optional order-by conditions.
 * @param {number} [$operation.limitResult] - Limit for the number of results.
 * @param {string} [$operation.lastDocumentId] - ID of the last document for pagination.
 * @param {A} $operation.subCollections - Subcollections to retrieve for each document.
 *
 * @returns {Promise<FirebaseWhereSCollectionReturn<T>>} The query results with subcollections.
 */
export async function getWhereAnyWithSubcollections<
  T extends keyof CollectionsInterface,
  A extends CollectionsInterface[T]['subCollections'][number][],
>(
  $col: T,
  $operation: {
    $sub_params?: CollectionsInterface[T]['sub_params'] | null
    whereConditions?: {
      fieldName: NestedKeyOf<CollectionsInterface[T]['interface']>
      operator: FirebaseOperators
      value: any
    }[]
    orderConditions?: OrderCondition<T>[]
    limitResult?: number
    lastDocumentId?: string
    subCollections: A // List of subcollections to fetch for each document
  },
): Promise<FirebaseWhereSCollectionReturn<T>> {
  const {
    $sub_params = null,
    whereConditions = [],
    orderConditions,
    limitResult,
    lastDocumentId,
    subCollections = [],
  } = $operation

  try {
    let fullPath = $col as string

    // Replace path parameters with their values
    if ($sub_params) {
      Object.entries($sub_params).forEach(([key, value]) => {
        if (typeof value === 'string') {
          fullPath = fullPath.replace(`:${key}`, value) // Replace :key with its corresponding value
        }
      })
    }

    const collectionRef = collection(firestore, fullPath)
    let q = query(collectionRef)

    // Apply where conditions to the query
    for (const condition of whereConditions) {
      q = query(q, where(condition.fieldName as string, condition.operator, condition.value))
    }

    // Apply orderBy condition if provided
    if (orderConditions) {
      for (const condition of orderConditions) {
        q = query(q, orderBy(condition.fieldName as string, condition.direction || 'asc'))
      }
    }

    // Get the total count of documents that match the conditions
    const totalCountSnapshot = await getCountFromServer(q)
    const totalCount = totalCountSnapshot.data().count

    // Apply limit if specified
    if (limitResult) {
      q = query(q, limit(limitResult))
    }

    // Apply startAfter for pagination if lastDocumentId is provided
    if (lastDocumentId) {
      const lastDocumentSnapshot = await getDoc(doc(firestore, fullPath, lastDocumentId))
      if (lastDocumentSnapshot.exists()) {
        q = query(q, startAfter(lastDocumentSnapshot))
      } else {
        console.warn(`Document with ID ${lastDocumentId} does not exist.`)
      }
    }

    const querySnapshot = await getDocs(q)
    const data: any[] = [] // Array to hold documents

    // Loop through each document and fetch subcollections
    for (const doc of querySnapshot.docs) {
      const mainData = {
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()?.toISOString() ?? null,
        updatedAt: doc.data().updatedAt?.toDate()?.toISOString() ?? null,
      }

      // Fetch subcollections for this document
      const subData: any = {}
      for (const sub of subCollections) {
        const subCollectionName = sub[0].split('/').pop()!; // Get last segment after `/`
        
        const subCollectionRef = collection(firestore, `${fullPath}/${doc.id}/${subCollectionName}`)
        const subDocsSnapshot = await getDocs(subCollectionRef)

        if (!subDocsSnapshot.empty) {
          subData[sub] = subDocsSnapshot.docs.map((subDoc) => ({
            ...subDoc.data(),
            createdAt: subDoc.data().createdAt?.toDate()?.toISOString() ?? null,
            updatedAt: subDoc.data().updatedAt?.toDate()?.toISOString() ?? null,
          }))
        } else {
          subData[sub] = []
        }
      }

      data.push({
        main: mainData,
        subCollections: subData,
      })
    }

    return {
      status: true,
      data,
      error: '',
      totalCount,
    }
  } catch (error) {
    console.error(error)
    return {
      status: false,
      error: `Error fetching data: ${error}`,
      data: [],
      totalCount: 0,
    }
  }
}

/**
 * Retrieves a specific document from Firestore with subcollections.
 *
 * @param {T} $col - The collection key (e.g., 'users', 'posts').
 * @param {Object} $operation - The operation parameters.
 * @param {CollectionsInterface[T]['path']} $operation.$path - The full path of the document (e.g., 'collection/id').
 * @param {string} $operation.id - The document ID to retrieve.
 * @param {Array} $operation.subCollections - Subcollections to retrieve for the document.
 *
 * @returns {Promise<FirebaseModelSCollectionReturn<T>>} The document and subcollections.
 */

export async function getCollectionWithSubcollections<
  T extends keyof CollectionsInterface,
  A extends CollectionsInterface[T]['subCollections'][number][],
>(
  $col: T,
  $operation: {
    $sub_params?: CollectionsInterface[T]['sub_params'] | null
    id: string
    subCollections: A
  },
): Promise<FirebaseModelSCollectionReturn<T>> {
  const { $sub_params = null, id, subCollections = [] } = $operation
  

  try {
    let fullPath = $col as string

    // Replace path parameters with their values
    if ($sub_params) {
      Object.entries($sub_params).forEach(([key, value]) => {
        if (typeof value === 'string') {
          fullPath = fullPath.replace(`:${key}`, value) // Replace :key with its corresponding value
        }
      })
    }

    const docRef = doc(firestore, fullPath, id)
    const docSnapshot = await getDoc(docRef)

    if (docSnapshot.exists()) {
      const data_main = {
        ...docSnapshot.data(),
        createdAt: docSnapshot.data().createdAt?.toDate()?.toISOString() ?? null,
        updatedAt: docSnapshot.data().updatedAt?.toDate()?.toISOString() ?? null,
      } as any

      const data_sub = {} as any
      
      // Fetch subcollections if specified
      for (const sub of subCollections) {
        const subCollectionName = sub[0].split('/').pop()!; // Get last segment after `/`
      
        const subCollectionRef = collection(firestore, `${fullPath}/${id}/${subCollectionName}`);
        const subDocsSnapshot = await getDocs(subCollectionRef);
      
        if (!subDocsSnapshot.empty) {
          data_sub[sub] = subDocsSnapshot.docs.map((subDoc) => ({
            ...subDoc.data(),
            createdAt: subDoc.data().createdAt?.toDate()?.toISOString() ?? null,
            updatedAt: subDoc.data().updatedAt?.toDate()?.toISOString() ?? null,
          }));
        } else {
          data_sub[sub] = [];
        }
      }
      

      return {
        status: true,
        data: {
          main: data_main,
          subCollections: data_sub,
        },
        error: '',
      }
    } else {
      return {
        status: false,
        error: `No data found for document with ID '${id}'.`,
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

/**
 * Fetches a single document from Firestore by path.
 *
 * @param {T} $col - The collection key (e.g., 'users', 'posts').
 * @param {Object} $operation - The operation parameters.
 * @param {string} $operation.$path - The full path of the document (e.g., 'collection/id').
 *
 * @returns {Promise<FirebaseModelReturn<CollectionsInterface[T]['interface']>>} The fetched document data.
 */
export async function getExact<T extends keyof CollectionsInterface>(
  $col: T, // Collection key (e.g., 'meta_page', 'invitation')
  $operation: {
    $path: string // Full path to the document (e.g., 'meta_pages/mp_id')
  },
): Promise<FirebaseModelReturn<CollectionsInterface[T]['interface']>> {
  // Destructure the $operation object
  const { $path } = $operation

  try {
    // Reference to the document
    const docRef = doc(firestore, $path)
    const userSnapshot = await getDoc(docRef) // Fetch the document

    if (userSnapshot.exists()) {
      // Extract document data and format timestamps
      const data = {
        ...userSnapshot.data(),
        createdAt: userSnapshot.data().createdAt.toDate().toISOString(),
        updatedAt: userSnapshot.data().updatedAt.toDate().toISOString(),
      }

      // Remove the id from the data to keep it clean
      const { ...new_data } = data

      // Return the document data along with subcollection data if available
      return {
        status: true,
        data: {
          ...new_data,
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

/**
 * Updates or creates a document in Firestore.
 *
 * @param {T} $col - The collection key (e.g., 'users', 'posts').
 * @param {Object} $operation - The operation parameters.
 * @param {CollectionsInterface[T]['path']} $operation.$path - The full path of the document (e.g., 'collection/id').
 * @param {CollectionsInterface[T]['sub_params'] | null} [$operation.$sub_params=null] - Optional sub-parameters.
 * @param {string} $operation.id - The document ID.
 * @param {CollectionsInterface[T]['interface']} $operation.data - Data to update or create.
 *
 * @returns {Promise<FirebaseModelReturn<CollectionsInterface[T]['interface']>>} The result of the operation.
 */
export async function postCollection<T extends keyof CollectionsInterface>(
  $col: T,
  $operation: {
    $sub_params?: CollectionsInterface[T]['sub_params'] | null // Optional sub-params
    idKey: keyof CollectionsInterface[T]['interface'] // Document ID is always provided
    data: CollectionsInterface[T]['interface'] // Data to update or create
  },
): Promise<FirebaseModelReturn<CollectionsInterface[T]['interface']>> {
  const { $sub_params = null, idKey, data } = $operation

  // Replace the dynamic segments in the path with provided sub-params
  let fullPath = $col as string
  if ($sub_params && Object.entries($sub_params).length > 0) {
    Object.entries($sub_params).forEach(([key, value]) => {
      fullPath = fullPath.replace(`:${key}`, value as string) // Replace :key with its corresponding value
    })
  }

  try {
    // Prepare the data to post, ensuring createdAt and updatedAt are set
    const postData = {
      ...replaceUndefinedWithNull({ ...data }),
      createdAt: data.createdAt
        ? Timestamp.fromDate(new Date(data.createdAt))
        : Timestamp.fromDate(new Date()), // Ensure createdAt is always set
      updatedAt: Timestamp.fromDate(new Date()), // Always update the updatedAt field
    }

    // Use the provided ID directly to create the document reference
    const id = data[idKey] as string
    if (!id) {
      throw new Error('Document ID is required')
    }

    const docRef = doc(firestore, fullPath, id)
  
    await setDoc(docRef, { ...postData }, { merge: true })

    return {
      status: true,
      data: {
        ...postData,
        createdAt: postData.createdAt.toDate().toISOString(),
        updatedAt: postData.updatedAt.toDate().toISOString(),
      },
      error: '',
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

/**
 * Deletes a document from Firestore.
 *
 * @param {T} $col - The collection key (e.g., 'users', 'posts').
 * @param {Object} $operation - The operation parameters.
 * @param {CollectionsInterface[T]['path']} $operation.$path - The full path of the document (e.g., 'collection/id').
 * @param {string} $operation.id - The document ID.
 *
 * @returns {Promise<FirebaseReturn>} The result of the delete operation.
 */
export async function deleteCollection<T extends keyof CollectionsInterface>(
  $col: T,
  $operation: {
    $sub_params?: CollectionsInterface[T]['sub_params'] | null
    id: string // Document ID to delete
  },
): Promise<FirebaseReturn> {
  const { $sub_params = null, id } = $operation
  let fullPath = $col as string

  // Replace placeholders in the path (e.g., ':userId') with actual values
  if ($sub_params) {
    if ($sub_params && Object.entries($sub_params).length > 0) {
      Object.entries($sub_params).forEach(([key, value]) => {
        fullPath = fullPath.replace(`:${key}`, value as string) // Replace :key with its corresponding value
      })
    }
  }

  // Create a reference to the document to delete
  console.log({ fullPath, id })
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

/**
 * Deletes multiple documents from Firestore in a batch operation.
 *
 * @param {T} $col - The collection key (e.g., 'users', 'posts').
 * @param {Object} $operation - The operation parameters.
 * @param {CollectionsInterface[T]['path']} $operation.$path - The full path of the document (e.g., 'collection/id').
 * @param {string[]} $operation.ids - Array of document IDs to delete.
 *
 * @returns {Promise<FirebaseWhereReturnAtomic>} The result of the batch delete operation.
 */
export async function deleteCollectionBatch<T extends keyof CollectionsInterface>(
  $col: T,
  $operation: {
    $sub_params?: CollectionsInterface[T]['sub_params'] | null // Substitution params
    ids: string[] // Array of document IDs to delete
  },
): Promise<FirebaseWhereReturnAtomic<CollectionsInterface[T]['interface']>> {
  const { $sub_params = null, ids } = $operation

  const batch = writeBatch(firestore)
  const results: FirebaseReturn[] = []
  const failedOperations: Array<{ id: string; error: string }> = []

  try {
    // Check for batch size limit (500 operations max per batch)
    const maxBatchSize = 500
    const batches = Math.ceil(ids.length / maxBatchSize)

    for (let batchIndex = 0; batchIndex < batches; batchIndex++) {
      const batchIds = ids.slice(batchIndex * maxBatchSize, (batchIndex + 1) * maxBatchSize)

      for (const id of batchIds) {
        let fullPath = $col as string

        // Replace placeholders in the path
        if ($sub_params && Object.keys($sub_params).length > 0) {
          Object.entries($sub_params).forEach(([key, value]) => {
            fullPath = fullPath.replace(`:${key}`, value as string)
          })
        }

        const docRef = doc(firestore, fullPath, id)

        // Add the delete operation to the batch
        batch.delete(docRef)

        // Prepare the result for successful deletion
        results.push({
          status: true,
          data: { id },
          error: '',
        })
      }

      // Commit the batch atomically
      await batch.commit()
    }

    // Ensure that data is always an array and never undefined
    const deletedIds = results.map((r) => r.data?.id).filter((id) => id !== undefined)

    return {
      status: true,
      data: deletedIds as CollectionsInterface[T]['interface'][],
      error: '',
    }
  } catch (error: any) {
    console.error('Error during batch delete:', error)

    const errorMessage = error.message || 'Unknown error occurred'
    for (const id of ids) {
      failedOperations.push({
        id,
        error: `Error deleting document: ${errorMessage}`,
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

/**
 * Posts a batch of document updates or creations to Firestore.
 *
 * @param {T} $col - The collection key (e.g., 'users', 'posts').
 * @param {Object} $operation - The operation parameters.
 * @param {CollectionsInterface[T]['path']} $operation.$path - The full path of the document (e.g., 'collection/id').
 * @param {string[]} $operation.ids - Array of document IDs to update or create.
 * @param {CollectionsInterface[T]['interface'][]} $operation.data - Array of data to post for the specified IDs.
 *
 * @returns {Promise<FirebaseWhereReturnAtomic<CollectionsInterface[T]['interface']>>} The result of the batch operation.
 */
export async function postCollectionBatch<T extends keyof CollectionsInterface>(
  $col: T,
  $operation: {
    $sub_params?: CollectionsInterface[T]['sub_params'] | null // Substitution params
    idKey: keyof CollectionsInterface[T]['interface']
    data: CollectionsInterface[T]['interface'][] // Data to post
  },
): Promise<FirebaseWhereReturnAtomic<CollectionsInterface[T]['interface']>> {
  const { $sub_params = null, idKey, data } = $operation

  const batch = writeBatch(firestore)
  const results: FirebaseReturn[] = []

  try {
    // Check for batch size limit (500 operations max per batch)
    const maxBatchSize = 500
    for (const batchData of chunk(data, maxBatchSize)) {
      for (const docData of batchData) {
        let fullPath = $col as string
        if (isFullObj($sub_params)) {
          Object.entries($sub_params).forEach(([key, value]) => {
            fullPath = fullPath.replace(`:${key}`, value as string) // Replace :key with its corresponding value
          })
        }

        const id = docData[idKey] as string
        const docRef = doc(firestore, fullPath, id)

        const replaceData = replaceUndefinedWithNull({ ...docData }) //Need to separate it from timestap because its replacing the timestamp with a non Timestamp object
        const postData = {
          ...replaceData,
          createdAt: replaceData.createdAt
            ? Timestamp.fromDate(new Date(replaceData.createdAt))
            : Timestamp.fromDate(new Date()), // Ensure createdAt is always set
          updatedAt: Timestamp.fromDate(new Date()), // Always update the updatedAt field
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
    }

    // Ensure that data is always an array and never undefined
    const nonUndefinedData = results.map((r) => r.data).filter((data) => data !== undefined)

    // Return the successful result with type assertion
    return {
      status: true,
      data: nonUndefinedData as (CollectionsInterface[T]['interface'] & { id?: string })[], // Assert the type here
      error: '',
    }
  } catch (error: any) {
    // Log the error for easier debugging
    console.error(error)

    // If the batch fails, track the failed operations
    const errorMessage = error.message || 'Unknown error occurred'
    return {
      status: false,
      error: `Batch operation failed: ${errorMessage}`,
      data: [],
    }
  }
}

/**
 * Posts a batch of document updates or creations to multiple Firestore collections.
 *
 * @param {Object} operations - The batch operations for multiple collections.
 * @param {Array<{ $col: string, $path: string, ids: string[], data: Object[] }>} operations.collections - The operations for each collection.
 *
 * @returns {Promise<FirebaseWhereReturnAtomic>} The result of the multi-collection batch operation.
 */
export async function postMultiCollectionBatch<T extends keyof CollectionsInterface>(operations: {
  collections: {
    $col: T // Collection name like 'users', 'references', etc.
    $sub_params?: CollectionsInterface[T]['sub_params'] | null // Substitution params
    ids: string[] // Array of document IDs to update or create
    data: CollectionsInterface[T]['interface'][] // Data to post
  }[]
}): Promise<FirebaseWhereReturnAtomic<any>> {
  const results: FirebaseReturn[] = []
  const failedOperations: Array<{ id: string; error: string }> = []

  const batch = writeBatch(firestore)

  try {
    // Loop through each collection operation
    for (const operation of operations.collections) {
      const { $col, $sub_params = null, ids, data } = operation

      if (ids.length !== data.length) {
        return {
          status: false,
          error: `Mismatch between the number of IDs and data items for collection ${$col}.`,
          data: [],
        }
      }

      // Check for batch size limit (500 operations max per batch)
      const maxBatchSize = 500
      const batches = Math.ceil(ids.length / maxBatchSize)

      for (let batchIndex = 0; batchIndex < batches; batchIndex++) {
        const batchIds = ids.slice(batchIndex * maxBatchSize, (batchIndex + 1) * maxBatchSize)
        const batchData = data.slice(batchIndex * maxBatchSize, (batchIndex + 1) * maxBatchSize)

        for (let i = 0; i < batchIds.length; i++) {
          const id = batchIds[i]
          const docData = batchData[i]

          let fullPath = $col as string
          if ($sub_params && Object.keys($sub_params).length > 0) {
            Object.entries($sub_params).forEach(([key, value]) => {
              fullPath = fullPath.replace(`:${key}`, value as string) // Replace :key with its corresponding value
            })
          }

          const docRef = doc(firestore, fullPath, id)

          const postData = {
            ...docData,
            createdAt: docData.createdAt
              ? Timestamp.fromDate(new Date(docData.createdAt))
              : Timestamp.fromDate(new Date()), // Ensure createdAt is always set
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
      }
    }

    // Ensure that data is always an array and never undefined
    const nonUndefinedData = results.map((r) => r.data).filter((data) => data !== undefined)

    // Return the successful result with type assertion
    return {
      status: true,
      data: nonUndefinedData,
      error: '',
    }
  } catch (error: any) {
    // Log the error for easier debugging
    console.error(error)

    // If the batch fails, track the failed operations
    const errorMessage = error.message || 'Unknown error occurred'
    for (const operation of operations.collections) {
      const { ids, $col } = operation
      for (let i = 0; i < ids.length; i++) {
        failedOperations.push({
          id: ids[i],
          error: `Error processing document in collection ${$col}: ${errorMessage}`,
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

/**
 * Listens to a Firestore document and provides real-time updates to the provided callback.
 *
 * @param {T} $col - The collection key (e.g., 'users', 'posts').
 * @param {Object} $operation - The operation parameters.
 * @param {CollectionsInterface[T]['path']} $operation.$path - The full path of the document (e.g., 'collection/id').
 * @param {string} $operation.id - The document ID to listen to.
 * @param {Function} callback - The callback function to handle real-time updates.
 *
 * @returns {Promise<void>} A promise resolving when the listener is set up.
 */
export async function listenToCollection<T extends keyof CollectionsInterface>(
  $col: T,
  $operation: {
    $sub_params?: CollectionsInterface[T]['sub_params'] | null;
    id: string;
  },
  callback: (data: FirebaseModelReturn<CollectionsInterface[T]['interface']>) => void
): Promise<(() => void) | null> {
  const { $sub_params = null, id } = $operation;

  try {
    let fullPath = $col as string;

    // Replace path parameters with their values
    if ($sub_params) {
      Object.entries($sub_params).forEach(([key, value]) => {
        if (typeof value === 'string') {
          fullPath = fullPath.replace(`:${key}`, value); // Replace :key with its corresponding value
        }
      });
    }

    const docRef = doc(firestore, fullPath, id);

    // Set up real-time listener
    const unsubscribe = onSnapshot(docRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const data = {
          ...docSnapshot.data(),
          createdAt: docSnapshot.data().createdAt?.toDate()?.toISOString() ?? null,
          updatedAt: docSnapshot.data().updatedAt?.toDate()?.toISOString() ?? null,
        } as any;

        callback({
          status: true,
          data,
          error: '',
        });
      } else {
        callback({
          status: false,
          error: `No data found for document with ID '${id}'.`,
          data: undefined,
        });
      }
    });

    // Return the unsubscribe function in case you want to stop the listener later
    return unsubscribe;
  } catch (error) {
    callback({
      status: false,
      error: `Error fetching data: ${error}`,
      data: undefined,
    });
    throw new Error(`Error fetching data: ${error}`);
  }
}
