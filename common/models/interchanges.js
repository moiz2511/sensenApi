'use strict';
const csv = require('csv-parser');
const fs = require('fs');
const ObjectID = require('mongodb').ObjectID;
module.exports = function (Interchanges) {
    Interchanges.readCsv = function (flag, cb) {


        fs.createReadStream('csv/SENSEN (1)/Interchanges.csv')
            .pipe(csv())
            .on('data', (row) => {
                console.log('row===>>>>>>>');
                console.log(row['Item Identifier']);
                Interchanges.create(row);
                if (row['Item Identifier'])
                    Interchanges.upsertWithWhere(
                        {
                            "Item Identifier": row['Item Identifier'],
                            "Interchange Target": row['Interchange Target'],
                            "Interchange Part Number": row["Interchange Part Number"]
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

    Interchanges.remoteMethod('readCsv', {
        accepts: { arg: 'flag', type: 'boolean' },
        returns: { arg: 'result', type: 'string' }
    });
};
