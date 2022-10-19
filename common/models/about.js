'use strict';

var sql = require("mssql");
var async = require("async");
var config = require('../../server/config.json');
var server = require('../../server/server');

module.exports = function (About) {
    About.newSeedMongoDbFromSql = function (cb) {
        const tables = {
            ACES_FITMENTS:
            {
                "fromTable": "ACES_FITMENTS", "toTable": "faq",
                "pid": "ID", "batchSize": 1000
            },
            INERCHANGES: {
                "fromTable": "INERCHANGES", "toTable": "interchanges",
                "pid": "ID", "batchSize": 1000
            },
            PHOTO_ASSETS: {
                "fromTable": "PHOTO_ASSETS", "toTable": "sparePartImage",
                "pid": "ID", "batchSize": 1000
            },
            PIES_ATTRIBUTES: {
                "fromTable": "PIES_ATTRIBUTES", "toTable": "faq",
                "pid": "ID", "batchSize": 1000
            },
            PIES_DESCRIPTION: {
                "fromTable": "PIES_DESCRIPTION", "toTable": "faq",
                "pid": "ID", "batchSize": 1000
            }
        }
        async.auto({
            // add_pid: function (callback) {
            //     var dbConn = new sql.ConnectionPool(config.dbConfig);
            //     dbConn.connect().then(function () {
            //         var request = new sql.Request(dbConn)
            //         function alterTable(tableNames) {
            //             return Promise.all(tableNames.map(updatePID));
            //         }
            //         function updatePID(table_name) {
            //             console.log(table_name)
            //             var addIDQuery = "ALTER TABLE [SENSEN].[dbo].["+table_name.key+"] ADD IDD INT NOT NULL IDENTITY PRIMARY KEY"
            //             return request.query(addIDQuery)
            //         }
            //         alterTable(Object.keys(tables).map(key => { return { key } })).then(resp => {
            //             callback(null, resp)
            //         }).catch(e => {
            //             callback(e)
            //         })
            //     })
            // },
            clear_mdb: function (callback) {
                function alterTable(tableNames) {
                    return Promise.all(tableNames.map(updatePID));
                }
                function updatePID(table_name) {
                    return server.models[tables[table_name.key].toTable].destroyAll({})
                }
                alterTable(Object.keys(tables).map(key => { return { key } })).then(resp => {
                    callback(null, resp)
                }).catch(e => {
                    callback(e)
                })
            },
            // seed_mdb: ['add_pid', 'clear_mdb', function (results, callback) {
                seed_mdb: ['clear_mdb', function (results, callback) {
                var names = Object.keys(tables);
                var table, x, i = 0;

                if (names.length > 0) {
                    table = tables[names[i]];
                    x = table;
                    console.log("start");
                    asyncProcessing(x)
                        .then(onSuccess)
                        .catch(onFailure);
                }

                function onFailure(e) {
                    console.log("[FAILURE]", e);
                    callback(e);
                }

                function onSuccess(xx) {
                    console.log("[SUCCESS]", xx);
                    if (i < names.length) {
                        table = tables[names[i]];
                        x = table;
                        asyncProcessing(x)
                            .then(onSuccess)
                            .catch(onFailure);
                    } else {
                        console.log("end");
                        callback();
                    }
                }

                function asyncProcessing(data) {

                    return new Promise(function (resolve, reject) {
                        // force first two success then random
                        if (data.fromTable && data.toTable) {
                            var dbConn = new sql.ConnectionPool(config.dbConfig);
                            var courserPoint = 0;
                            var courserPointFlag = true;
                            dbConn.connect().then(function () {
                                var request = new sql.Request(dbConn)
                                async.whilst(
                                    function () {
                                        if (courserPointFlag == true) return true;
                                        if (courserPointFlag == false) return false;
                                    },
                                    function (callback) {
                                        let tempQuery = `select top ` + data.batchSize + ` * from [SENSEN].[dbo].[` + data.fromTable + `] where ` + data.pid + ` > ` + courserPoint + ` order by ` + data.pid + ` asc`;
                                        request.query(tempQuery).then(function (resp) {
                                            // dbConn.close();
                                            console.log("cvcvc132", resp)
                                            if (resp.recordsets[0].length > 0) {
                                                courserPoint = resp.recordsets[0][resp.recordsets[0].length - 1][data.pid]
                                                server.models[data.toTable].create(resp.recordsets[0], callback)
                                            }
                                            else {
                                                courserPointFlag = false
                                                callback();
                                            }
                                        }).catch(function (err) {
                                            dbConn.close();
                                            console.log(">?>?>?143", err)
                                            callback(err);
                                        });
                                    },
                                    function (err) {
                                        if (err) {
                                            reject(err);
                                        }
                                        else {
                                            i = i + 1
                                            resolve('done...')
                                        }
                                    }
                                );

                            }).catch(function (err) {
                                reject(err);
                            });
                        } else {
                            reject("table/db not found");
                        }
                    });
                }
            }]
        }, cb);
    }

    // const tables = {
    //     ACES_FITMENTS: "collection_name",
    //     INERCHANGES: "col_name",
    //     PHOTO_ASSETS: "about",
    //     PIES_ATTRIBUTES: "col_name",
    //     PIES_DESCRIPTION: "col_name"
    // }
    // const views = {
    //     PYMM: 'PYMM',
    //     PYMMPT: 'PYMMPT',
    //     YMM: 'YMM'
    // }

    About.remoteMethod('newSeedMongoDbFromSql', {
        description: 'seed mongodb from msSql ',
        returns: {
            arg: 'data',
            type: 'object'
        },
        http: {
            verb: 'POST',
            path: '/newSeedMongoDbFromSql'
        },
    });

    About.seedMongoDbFromSql = function (__Data, cb) {

        async function __call(data) {
            if (data.fromTable && data.toTable) {
                var dbConn = new sql.ConnectionPool(config.dbConfig);
                var courserPoint = 0;
                var courserPointFlag = true;
                dbConn.connect().then(function () {
                    var request = new sql.Request(dbConn)
                    async.whilst(
                        function () {
                            if (courserPointFlag == true) return true;
                            if (courserPointFlag == false) return false;
                        },
                        function (callback) {
                            // console.log("select top " + data.batchSize + " * from " + data.table + " where " + data.pid + " > " + courserPoint + " order by " + data.pid + " asc")
                            request.query("select top " + data.batchSize + " * from " + data.fromTable + " where " + data.pid + " > " + courserPoint + " order by " + data.pid + " asc").then(function (resp) {
                                // dbConn.close();
                                if (resp.recordsets[0].length > 0) {
                                    courserPoint = resp.recordsets[0][resp.recordsets[0].length - 1][data.pid]
                                    server.models[data.toTable].create(resp.recordsets[0], callback)
                                }
                                else {
                                    courserPointFlag = false
                                    callback();
                                }
                            }).catch(function (err) {
                                dbConn.close();
                                callback(err);
                            });
                        },
                        function (err) {
                            if (err) {
                                cb({ 'status': 0, 'message': 'not found', err: err });
                            }
                            else {
                                cb(null, 'done...')
                            }
                        }
                    );

                }).catch(function (err) {
                    cb({ 'status': 0, 'message': 'not found', err: err });
                });
            } else {
                cb({ 'status': 0, 'message': 'table/db not found' })
            }
        }
        if (config.dbConfig.server == 'localhost')
            cb('only works in localhost')
        else
            __call(__Data);

    }
    About.remoteMethod('seedMongoDbFromSql', {
        description: 'seed mongodb from msSql ',
        accepts: {
            arg: 'data',
            type: 'object',
            description: `{"fromTable":"faq","toTable":"faq",
            "pid":"pid/_id/id","batchSize":1000}`,
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
            path: '/seedMongoDbFromSql'
        },
    });

};
