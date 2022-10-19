'use strict';
const csv = require('csv-parser');
const fs = require('fs');
module.exports = function (Sparepartimage) {
    Sparepartimage.readCsv = function (flag, cb) {


        fs.createReadStream('csv/Copy of Item_Cloudfront_Assets_20201006203740_Olga.csv')
            .pipe(csv())
            .on('data', (row) => {
                Sparepartimage.upsertWithWhere({ "Selling Part Number": row['Selling Part Number'] }, row);
            })
            // .on('headers', (headers) => {
            //     console.log(`First header: ${headers}`)
            // })
            .on('end', () => {
                console.log('row===>>>>>>>');
                cb(null, 'done... ');
            });



    }

    Sparepartimage.remoteMethod('readCsv', {
        accepts: { arg: 'flag', type: 'boolean' },
        returns: { arg: 'result', type: 'string' }
    });
};
