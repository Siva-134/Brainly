const { MongoClient } = require('mongodb');
const fs = require('fs');

async function check() {
    const c = await MongoClient.connect('mongodb://localhost:27017');
    const db = c.db('secondbrain');
    const arr = await db.collection('contents').find().sort({_id:-1}).limit(10).toArray();
    let out = '';
    arr.forEach(doc => {
        out += `LINK: ${doc.link} | THUMBNAIL: ${doc.thumbnail}\n`;
    });
    fs.writeFileSync('test_out.txt', out);
    c.close();
}
check();
