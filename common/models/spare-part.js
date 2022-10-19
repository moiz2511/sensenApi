'use strict';
const csv = require('csv-parser');
const fs = require('fs');
const async = require('async');
const ObjectID = require('mongodb').ObjectID;

module.exports = function (Sparepart) {


    Sparepart.readCsv = function (flag, cb) {


        fs.createReadStream('csv/SENSEN (1).csv')
            .pipe(csv())
            .on('data', (row) => {
                console.log('row===>>>>>>>');
                console.log(row['Item Identifier']);
                Sparepart.create(row);
                // Sparepart.upsertWithWhere(
                //     {
                //         "Item Identifier": row['Item Identifier'],
                //         "Make": row["Make"],
                //         "Model": row["Model"],
                //         "Year": row["Year"],
                //         "Submodel": row["Submodel"]
                //     }, row);
            })
            // .on('headers', (headers) => {
            //     console.log(`First header: ${headers}`)
            // })
            .on('end', () => {
                console.log('row===>>>>>>>');
                cb(null, 'done... ');
            });



    }

    Sparepart.remoteMethod('readCsv', {
        accepts: { arg: 'flag', type: 'boolean' },
        returns: { arg: 'result', type: 'string' }
    });

    Sparepart.findSparepart = function (__Data, cb) {
        async function __call(data) {
            var query = [
                {
                    $lookup:
                    {
                        from: "sparePartDetails",
                        localField: "Item Identifier",
                        foreignField: "Item Identifier",
                        as: "details"
                    }
                },
                {
                    $lookup:
                    {
                        from: "sparePartImage",
                        localField: "Item Identifier",
                        foreignField: "Selling Part Number",
                        as: "images"
                    }
                }
            ]
            if (data.partNumber) {
                var Value_match = new RegExp(data.partNumber, 'i');
                query.push({ $match: { "Item Identifier": { $regex: Value_match } } })
            }
            if (data.pageNumber && data.limit)
                query.push({ $skip: data.pageNumber * data.limit })
            if (data.limit)
                query.push({ $limit: data.limit })
            Sparepart.getDataSource().connector.connect(function (err, db) {
                if (err) cb(err)
                var collection = db.collection('sparePart');
                collection.aggregate(query).toArray(cb);
            });
        }
        __call(__Data);

    }
    Sparepart.remoteMethod('findSparepart', {
        description: 'fetch Spare Parts by partNumber',
        accepts: {
            arg: 'data',
            type: 'object',
            description: '{"partNumber":"xxxx","pageNumber":1,"limit":10}',
            http: {
                source: 'body'
            }
        },
        returns: {
            arg: 'data',
            type: 'object'
        },
        http: {
            verb: 'POST',
            path: '/findSparepart'
        },
    });


    Sparepart.findSparepartByYearModelMake = function (__Data, callback) {
        async function __call(data) {
            async.auto({
                get_data: function (cb) {

                    var query = [
                        {
                            $lookup:
                            {
                                from: "sparePartImage",
                                localField: "Item Identifier",
                                foreignField: "Selling Part Number",
                                as: "images"
                            }
                        }
                    ]
                    if (data.Attributes) {
                        query.push({ $match: { "Attributes": data.Attributes } })
                    }
                    if (data.PartTerminology) {
                        query.push({ $match: { "PartTerminology": data.PartTerminology } })
                    }


                    if (data.params && data.params.Year) {
                        query.push({ $match: { "Year": data.params.Year } })
                    }
                    if (data.params && data.params.Make) {
                        query.push({ $match: { "Make": data.params.Make } })
                    }
                    if (data.params && data.params.Model) {
                        query.push({ $match: { "Model": data.params.Model } })
                    }
                    if (data.params && data.params.partNumber) {
                        var Value_match = new RegExp(data.params.partNumber, 'i');
                        query.push({ $match: { "Item Identifier": { $regex: Value_match } } })
                    }
                    if (data.pageNumber && data.limit)
                        query.push({ $skip: (data.pageNumber - 1) * data.limit })
                    if (data.limit)
                        query.push({ $limit: data.limit })
                    Sparepart.getDataSource().connector.connect(function (err, db) {
                        if (err) cb(err)
                        var collection = db.collection('sparePart');
                        collection.aggregate(query).toArray(cb);
                    });
                },
                get_reference_data: function (cb) {
                    if (data.params && data.params.partNumber) {
                        var query = [


                            {
                                $lookup: {
                                    from: "sparePart",
                                    localField: "Item Identifier",
                                    foreignField: "Item Identifier",
                                    as: "sparePart"
                                }

                            }, {
                                $lookup:
                                {
                                    from: "sparePartImage",
                                    localField: "Item Identifier",
                                    foreignField: "Selling Part Number",
                                    as: "images"
                                }
                            }
                        ]
                        // var query = []
                        if (data.params && data.params.partNumber) {
                            var Value_match = new RegExp(data.params.partNumber, 'i');
                            query.push({ $match: { "Interchange Part Number": { $regex: Value_match } } })
                        }
                        Sparepart.getDataSource().connector.connect(function (err, db) {
                            if (err) cb(err)
                            var collection = db.collection('interchanges');
                            collection.aggregate(query).toArray(cb);
                        });
                    } else {
                        cb(null, [])
                    }
                }
            }, callback);


        }

        __call(__Data);

    }
    Sparepart.remoteMethod('findSparepartByYearModelMake', {
        description: 'fetch Spare Parts by Year Model Make partNumber',
        accepts: {
            arg: 'data',
            type: 'object',
            description: `{"params":{"Year":"2006","Model":"Explorer",
            "Make":"Ford","partNumber":"8"},
            "pageNumber":1,"limit":10}`,
            http: {
                source: 'body'
            }
        },
        returns: {
            arg: 'data',
            type: 'object'
        },
        http: {
            verb: 'POST',
            path: '/findSparepartByYearModelMake'
        },
    });

    // item details by id
    Sparepart.findSparepartDetailsById = function (__Data, cb) {

        async function __call(data) {
            var query = [
                {
                    $lookup:
                    {
                        from: "partDescription",
                        localField: "Item Identifier",
                        foreignField: "Item Identifier",
                        as: "partDescription"
                    }
                },
                {
                    $lookup:
                    {
                        from: "interchanges",
                        localField: "Item Identifier",
                        foreignField: "Item Identifier",
                        as: "interchanges"
                    }
                },
                {
                    $graphLookup: {
                        from: "sparePart",
                        startWith: "$Item Identifier",
                        connectFromField: "Item Identifier",
                        connectToField: "Item Identifier",
                        as: "childrens",
                        maxDepth: 0,
                    }

                }
                ,
                {
                    $lookup:
                    {
                        from: "sparePartDetails",
                        localField: "Item Identifier",
                        foreignField: "Item Identifier",
                        as: "details"
                    }
                },
                {
                    $lookup:
                    {
                        from: "sparePartImage",
                        localField: "Item Identifier",
                        foreignField: "Selling Part Number",
                        as: "images"
                    }
                }
            ]
            if (data._id && data._id !== undefined) {
                query.push({ $match: { "_id": ObjectID(data._id) } })
            }
            Sparepart.getDataSource().connector.connect(function (err, db) {
                if (err) cb(err)
                var collection = db.collection('sparePart');
                collection.aggregate(query).toArray(cb);
            });
        }
        __call(__Data);

    }
    Sparepart.remoteMethod('findSparepartDetailsById', {
        description: 'fetch Spare Part with details by id',
        accepts: {
            arg: 'data',
            type: 'object',
            description: '{"_id":"xxx"}',
            http: {
                source: 'body'
            }
        },
        returns: {
            arg: 'data',
            type: 'object'
        },
        http: {
            verb: 'POST',
            path: '/findSparepartDetailsById'
        },
    });


    // api values for year/make/model
    Sparepart.findDropDownValues = function (__Data, cb) {
        var SparepartCollection = Sparepart.getDataSource().connector.collection(Sparepart.modelName)
        SparepartCollection.distinct(__Data.felid, __Data.input, function (err, items) {
            let outPut = { data: items, felid: __Data.felid }
            cb(err, outPut)
        })
    }
    Sparepart.remoteMethod('findDropDownValues', {
        description: 'fetch Model/Year/Make',
        accepts: {
            arg: 'data',
            type: 'object',
            description: '{"felid":"Model","input":{"Year":"2001","Make":"Nissan"}}',
            http: {
                source: 'body'
            }
        },
        returns: {
            arg: 'data',
            type: 'object'
        },
        http: {
            verb: 'POST',
            path: '/findDropDownValues'
        },
    });



};


