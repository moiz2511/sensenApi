'use strict';
const csv = require('csv-parser');
const fs = require('fs');
const ObjectID = require('mongodb').ObjectID;
module.exports = function (Partdescription) {
    Partdescription.readCsv = function (flag, cb) {


        fs.createReadStream('csv/SENSEN (1)/CatalogDescriptions.csv')
            .pipe(csv())
            .on('data', (row) => {
                console.log('row===>>>>>>>');
                console.log(row['Item Identifier']);
                Partdescription.create(row);
                Partdescription.upsertWithWhere(
                    {
                        "Item Identifier": row['Item Identifier'],
                        "Long": row["Long"]
                    }, row);
            })
            .on('headers', (headers) => {
                console.log(`First header: ${headers}`)
            })
            .on('end', () => {
                console.log('row===>>>>>>>');
                cb(null, 'done... ');
            });



    }

    Partdescription.remoteMethod('readCsv', {
        accepts: { arg: 'flag', type: 'boolean' },
        returns: { arg: 'result', type: 'string' }
    });
};
