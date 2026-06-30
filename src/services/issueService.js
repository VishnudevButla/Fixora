import { db } from './firebase';
import { collection, addDoc, getDocs, query, orderBy, where, updateDoc, doc } from 'firebase/firestore';

const COLLECTION_NAME = 'issues';

export async function createIssue(issueData) {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...issueData,
      createdAt: new Date().toISOString(),
      status: 'pending',
      upvotes: 0
    });
    return docRef.id;
  } catch (error) {
    console.error("Error creating issue:", error);
    throw error;
  }
}

export async function getAllIssues() {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getting issues:", error);
    throw error;
  }
}

export async function upvoteIssue(issueId, currentUpvotes) {
  try {
    const docRef = doc(db, COLLECTION_NAME, issueId);
    await updateDoc(docRef, {
      upvotes: (currentUpvotes || 0) + 1
    });
  } catch (error) {
    console.error("Error upvoting issue:", error);
    throw error;
  }
}
