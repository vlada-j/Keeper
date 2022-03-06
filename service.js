import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.8/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.6.8/firebase-auth.js';
import { getFirestore, collection, getDocs, addDoc, doc, getDoc, deleteDoc, updateDoc } from 'https://www.gstatic.com/firebasejs/9.6.8/firebase-firestore.js';
import EventDispatcher from "./EventDispatcher.js"

const COLLECTION_NAME = "keeper-notes"
const CONFIG = {
	apiKey: "AIzaSyCj9-LVU0ssDj0J0CSVE11GQeGcUhKOKhY",
	authDomain: "vj-lab.firebaseapp.com",
	databaseURL: "https://vj-lab.firebaseio.com",
	projectId: "vj-lab",
	storageBucket: "vj-lab.appspot.com",
	messagingSenderId: "493814968976",
	appId: "1:493814968976:web:09431f3a8cde9fee995e15"
};

class Service extends EventDispatcher {

	user = null

	constructor() {
		super()
		this.app = initializeApp(CONFIG);
		this.db = getFirestore(this.app);
		this.auth = getAuth();

		onAuthStateChanged(this.auth, this._onAuthStateChanged.bind(this));
	}

	_onAuthStateChanged(user) {
		this.user = user;
		this._trigger('auth', user);
	}

	logIn(username, password) {
		signInWithEmailAndPassword(this.auth, username, password)
			.then((userCredential) => {
				// userCredential.user;
			})
			.catch((error) => {
				const errorCode = error.code;
				const errorMessage = error.message;
				console.log(errorMessage);
				this._trigger('error', errorMessage)
			});
	}

	logOut() {
		this.auth.signOut()
	}

	async getAllNews() {
		const newsCol = collection(this.db, COLLECTION_NAME);
		const newsSnapshot = await getDocs(newsCol);
		return newsSnapshot.docs
			.map(doc => {
				let d = doc.data();
				d.id = doc.id
				return d
			});
	}

	async getNews(id) {
		const docRef = doc(this.db, COLLECTION_NAME, id);
		const docSnap = await getDoc(docRef);

		if (docSnap.exists()) {
			return docSnap.data();
		} else {
			return false
		}
	}

	async addNews(data) {
		try {
			const docRef = await addDoc(collection(this.db, COLLECTION_NAME), data);
			console.log("Document written with ID: ", docRef.id);
			return docRef
		} catch (e) {
			console.error("Error adding document: ", e);
			return e
		}
	}

	async editNews(id, data) {

		const docRef = doc(this.db, COLLECTION_NAME, id);
		return await updateDoc( docRef, data );
	}

	async removeNews(id) {
		return await deleteDoc( doc(this.db, COLLECTION_NAME, id) );
	}
}

export default new Service()




