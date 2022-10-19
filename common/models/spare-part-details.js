'use strict';
const csv = require('csv-parser');
const fs = require('fs');
module.exports = function (Sparepartdetails) {
    Sparepartdetails.readCsv = function (flag, cb) {


        fs.createReadStream('csv/Product_Data_-_Attribute_Grid_A_20200805133450_TP (1).csv')
            .pipe(csv())
            .on('data', (row) => {
                Sparepartdetails.upsertWithWhere({ "Item Identifier": row['Item Identifier'] }, row);
            })
            // .on('headers', (headers) => {
            //     console.log(`First header: ${headers}`)
            // })
            .on('end', () => {
                console.log('row===>>>>>>>');
                cb(null, 'done... ');
            });



    }

    Sparepartdetails.remoteMethod('readCsv', {
        accepts: { arg: 'flag', type: 'boolean' },
        returns: { arg: 'result', type: 'string' }
    });
};
