import * as functions from 'firebase-functions';
import * as express from 'express';
const cors = require('cors');
const nunjucks = require('nunjucks');
const admin = require('firebase-admin');
const stripHtml = require("string-strip-html");

admin.initializeApp();

const db = admin.firestore();
const app = express();

nunjucks.configure('src/views', {
    autoescape: true,
    express: app
});

app.use(cors({ origin: true }));
app.use('/assets', express.static('src/assets'));

app.get('/', (req,res) => {
    res.render('index.html');
});

app.get('/event/:id', (req,res) => {
    db.collection('events').doc(req.params.id).get().then((ref: { exists: any; data: () => any; }) => {
        if(ref.exists) {
            const data = ref.data();
            data.id = req.params.id;
            data.descriptionHeader = stripHtml(data.description).result;
            data.month = new Date(data.date.startDate).toLocaleDateString('default', { month: 'long' });
            data.day = new Date(data.date.startDate).toLocaleDateString('default', { day:'numeric' });
            data.startTime = new Date(data.date.startDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            data.endTime = new Date(data.date.endDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            res.render('event.html', data);
        } else {
            res.send({ message: 'Not found' });
        }
    })
});

exports.site = functions.https.onRequest(app);