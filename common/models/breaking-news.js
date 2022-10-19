'use strict';
var _ = require('lodash');

module.exports = function (Breakingnews) {


    Breakingnews.searchNews = function (__Data, cb) {
        async function __call(data) {
            if (data.category)
                var query = {
                    where: {
                        and: [
                            {
                                category: data.category
                            },
                            {
                                titletext: {
                                    like: data.titletext,
                                    options: "i"
                                }
                            }]

                    }
                };
            else
                var query = {
                    where: {
                        titletext: {
                            like: data.titletext,
                            options: "i"
                        }
                    }
                };
            Breakingnews.find(query, cb)
        }
        __call(__Data);

    }
    Breakingnews.remoteMethod('searchNews', {
        description: 'search news by catagories ',
        accepts: {
            arg: 'data',
            type: 'object',
            description: '{"titletext":"brake repair..","category":"category"}',
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
            path: '/searchNews'
        },
    });

    Breakingnews.findDropDownValues = function (cb) {
        var SparepartCollection = Breakingnews.getDataSource().connector.collection(Breakingnews.modelName)
        SparepartCollection.distinct('category', function (e, cats) {
            if (e) cb(e);
            let tempObj = [];
            _.forEach(cats, function (value, index) {
                tempObj.push({ id: index, title: value, value: value })
            });
            cb(null, tempObj)
        })
    }
    Breakingnews.remoteMethod('findDropDownValues', {
        description: 'fetch categories',
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
