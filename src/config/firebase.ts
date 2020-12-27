import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';
import 'firebase/analytics';

const firebaseConfig = {
    apiKey: 'AIzaSyBeQtjQP_mHTtSVdLy36CwXgcetOoJXxe0',
    authDomain: 'croco-finance.firebaseapp.com',
    databaseURL: 'https://croco-finance-a02aa.firebaseio.com/',
    // databaseURL: 'https://croco-finance.firebaseio.com',
    projectId: 'croco-finance',
    messagingSenderId: '619222403105',
    appId: '1:619222403105:web:bffcce3986234e73a5bb60',
    measurementId: 'G-Z20W1K81CF',
};

// firebase.initializeApp(firebaseConfig);
// const analytics = firebase.analytics();

class Firebase {
    db: any;

    constructor() {
        firebase.initializeApp(firebaseConfig);
        firebase.analytics();
        this.db = firebase.database();
    }

    //  Data references API
    snaps = address => this.db.ref(`users/${address}`);
    dailyFees = poolId => this.db.ref(`daily/${poolId}`);
    poolSnap = (poolId, dayId) => this.db.ref(`poolSnaps/${poolId}/${dayId}`);
    exchangeDayId = exchange => this.db.ref(`lastUpdate/${exchange}/dayId`);
}

// // create firebase instance which I will use across the whole project
const firebaseInstance = new Firebase();
const analytics = firebase.analytics();

export default firebaseInstance;
export { analytics };
