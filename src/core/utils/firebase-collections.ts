import type { UserProfileData, WorkspaceData, PlatformApiData, MetaPagesData, ChatBotFlowData } from '@/core/utils/types'
import type { NewType, Shared } from '@/core/types/WorkSpaceTypes'
import { firestore } from './firebase-client'
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  setDoc,
  startAfter,
  updateDoc,
  where,
  type DocumentData,
} from 'firebase/firestore'

type Collections = {
  user_profile: 'up_id'
  workspaces: 'ws_id'
  platform_api: 'pa_id'
  meta_pages: 'mp_id'
  chat_bot_flow: 'cb_id'
}

type CollectionFields = {
  user_profile: keyof UserProfileData;
  workspaces: keyof WorkspaceData;
  platform_api: keyof PlatformApiData;
  meta_pages: keyof MetaPagesData;
  chat_bot_flow: keyof ChatBotFlowData;

};

type CollectionsInterface = {
  user_profile: UserProfileData;
  workspaces: WorkspaceData;
  platform_api: PlatformApiData;
  meta_pages: MetaPagesData;
  chat_bot_flow: ChatBotFlowData;
}


interface PathParams {
  share?: string; // ID of the share subcollection
  comment?: string; // ID of the comment subcollection
}


type CollectionsInterface2 = {
  workspaces: {
    id: 'ws_id'
    path: 'workspaces'
    interface: WorkspaceData
    sub_col: (NewType<WorkspaceData>)[]
    sub_params: null
  }

  workspaces_share: {
    id: 'share_id'
    path: 'workspaces/:ws_id/share/'
    interface: Shared,
    sub_col: (NewType<Shared>)[]
    sub_params: {
      ws_id: string;
    }
  },

  workspaces_share_comment: {
    id: 'comment_id'
    path: 'workspaces/:ws_id/share/:share_id/comment'
    interface: WorkspaceData,
    sub_col: (NewType<WorkspaceData>)[]
    sub_params: {
      ws_id: string;
      share_id: string;
    }
  }

  user_profile: {
    id: 'up_id'
    path: 'user_profile'
    interface: UserProfileData,
    sub_col: (NewType<UserProfileData>)[]
    sub_params: null
  }
  platform_api: {
    id: 'pa_id'
    path: 'platform_api'
    interface: PlatformApiData,
    sub_col: (NewType<PlatformApiData>)[]
    sub_params: null
  };
  meta_pages: {
    id: 'mp_id'
    path: 'meta_pages'
    interface: MetaPagesData,
    sub_col: (NewType<MetaPagesData>)[]
    sub_params: null

  };
  chat_bot_flow: {
    id: 'cb_id'
    path: 'chat_bot_flow'
    interface: ChatBotFlowData,
    sub_col: (NewType<ChatBotFlowData>)[]
    sub_params: null
  };
}

export type FirebaseOperators = '==' | '!=' | '<' | '<=' | '>' | '>=' | 'array-contains' | 'array-contains-any' | 'in' | 'not-in'

interface FirebaseReturn {
  status: boolean
  data: DocumentData | undefined
  error: string
}

interface FirebaseWhereReturn<T> {
  status: boolean
  data: T[] | undefined
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

export async function getCollectionByField<
  T extends keyof Collections,
>(
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
      q = query(q, orderBy(condition.fieldName as string, !condition.direction ? 'asc' : condition.direction));
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

export async function postCollection<T extends keyof Collections>(
  $col: T,
  $id: Collections[T],
  id: string = '',
  data: any,
  type: 'update' | 'new' = 'update',
): Promise<FirebaseReturn> {
  const userDocRef = doc(firestore, $col, id)
  try {
    const userSnapshot = await getDoc(userDocRef) // Fetch the document
    if (userSnapshot.exists()) {
      // Get the document data
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
        await setDoc(userDocRef, { ...postData });

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

export async function getCollection<T extends keyof Collections>(
  $col: T,
  $id: Collections[T],
  id: string,
  subCollections?: string[], // Accepts an array of subcollection names as strings
): Promise<FirebaseReturn> {
  try {
    const userDocRef = doc(firestore, $col, id);
    const userSnapshot = await getDoc(userDocRef);

    if (userSnapshot.exists()) {
      const data = { id: userSnapshot.id, ...userSnapshot.data() };
      const subCollectionData: Record<string, any[]> = {}; // To store subcollection data

      // Fetch specified subcollections
      if (subCollections) {
        for (const subCol of subCollections) {
          const subColRef = collection(userDocRef, subCol);
          const subColSnapshot = await getDocs(subColRef);

          subCollectionData[subCol] = subColSnapshot.docs.map(doc => doc.data());
        }
      }

      return {
        status: true,
        data: {
          ...data,
          ...subCollectionData, // Add subcollection data to the result
        },
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
      error: `Error fetching data: ${error}`,
      data: undefined,
    };
  }
}


export type CollectionWhereCondition<T> = {
  fieldName: keyof T; // Use keyof to restrict to valid fields
  operator: FirebaseOperators;
  value: any;
};





export async function postBySub(
  $col: string,
  id: string = '',
  data: any,
  type: 'update' | 'new' = 'update',
): Promise<FirebaseReturn> {
  const userDocRef = doc(firestore, $col, id)
  try {
    const userSnapshot = await getDoc(userDocRef) // Fetch the document
    if (userSnapshot.exists()) {
      // Get the document data
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

        await setDoc(userDocRef, { ...postData });

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

export async function getBySub(
  $col: string,
  id: string,
  subCollections?: string[], // Accepts an array of subcollection names as strings
): Promise<FirebaseReturn> {
  try {
    const userDocRef = doc(firestore, $col, id);
    const userSnapshot = await getDoc(userDocRef);

    if (userSnapshot.exists()) {
      const data = { id: userSnapshot.id, ...userSnapshot.data() };
      const subCollectionData: Record<string, any[]> = {}; // To store subcollection data

      // Fetch specified subcollections
      if (subCollections) {
        for (const subCol of subCollections) {
          const subColRef = collection(userDocRef, subCol);
          const subColSnapshot = await getDocs(subColRef);

          subCollectionData[subCol] = subColSnapshot.docs.map(doc => doc.data());
        }
      }

      return {
        status: true,
        data: {
          ...data,
          ...subCollectionData, // Add subcollection data to the result
        },
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
      error: `Error fetching data: ${error}`,
      data: undefined,
    };
  }
}

type CollectionConfig<T> = {
  id: string;
  path: string;
  interface: T;
  sub_col: string[];
  sub_params: { key: string }[] | null // This can still be flexible
};


export async function getWhereAny<S, T extends keyof CollectionsInterface2>(
  $col: T, // Path like 'collection/id',
  $path: CollectionsInterface2[T]['path'], // Path like 'collection/id',
  $sub_params: CollectionsInterface2[T]['sub_params'] | null = null,
  $sub_col: NewType<CollectionsInterface2[T]['interface']> = [], // Array of subcollection names to check
  whereConditions: { fieldName: keyof CollectionsInterface2[T]['interface']; operator: FirebaseOperators; value: any; }[] = [],
  orderConditions?: { fieldName: keyof CollectionsInterface2[T]['interface']; direction?: 'asc' | 'desc' }[],

  limitResult?: number,
  lastDocumentId?: string
): Promise<FirebaseWhereReturn<T>> {
  try {
    let fullPath = $path as string

    if ($sub_params) {
      Object.entries($sub_params).forEach(([key, value]) => {
        fullPath = fullPath.replace(`:${key}`, value); // Replace :key with its corresponding value
      });
    }

    // Create a reference to the main collection
    const collectionRef = collection(firestore, fullPath);
    let q = query(collectionRef);

    // Apply where conditions
    for (const condition of whereConditions) {
      q = query(q, where(condition.fieldName as string, condition.operator, condition.value));
    }

    // Apply orderBy condition if provided
    if (orderConditions) {
      for (const condition of orderConditions) {
        q = query(q, orderBy(condition.fieldName as string, !condition.direction ? 'asc' : condition.direction));
      }
    }
    // Apply limit if specified
    if (limitResult) {
      q = query(q, limit(limitResult));
    }

    // Apply startAfter if a last document ID is provided
    if (lastDocumentId) {
      const lastDocumentSnapshot = await getDoc(doc(firestore, fullPath, lastDocumentId));
      if (lastDocumentSnapshot.exists()) {
        q = query(q, startAfter(lastDocumentSnapshot));
      } else {
        console.warn(`Document with ID ${lastDocumentId} does not exist.`);
      }
    }

    const querySnapshot = await getDocs(q);
    const data: any[] = []; // Array to hold documents with subcollection data

    // Loop through each document and fetch subcollections
    for (const doc of querySnapshot.docs) {
      const docData: { [key: string]: any } = { // Define a flexible type for docData
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate().toISOString(),
        updatedAt: doc.data().updatedAt?.toDate().toISOString(),
      };

      // Fetch data from each specified subcollection
      for (const sub of $sub_col) {
        const subCollectionRef = collection(firestore, `${fullPath}/${doc.id}/${sub}`);
        const subDocs = await getDocs(subCollectionRef);

        if (!subDocs.empty) {
          // Append the subcollection data directly to the document
          docData[sub] = subDocs.docs.map((subDoc) => ({
            id: subDoc.id,
            ...subDoc.data(),
            createdAt: subDoc.data().createdAt?.toDate().toISOString(),
            updatedAt: subDoc.data().updatedAt?.toDate().toISOString(),
          }));
        }
      }

      data.push(docData); // Add the document with its subcollection data to the results
    }

    return {
      status: true,
      data,
      error: '',
    };
  } catch (error) {
    console.log(error)
    return {
      status: false,
      error: `Error fetching data from subcollection path: ${error}`,
      data: undefined,
    };
  }
}