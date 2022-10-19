'use strict';

module.exports = function (Productguide) {


    Productguide.searchGuide = function (__Data, cb) {
        async function __call(data) {
            var query = {
                where: {
                    and: [
                        {
                            type: data.type
                        },
                        {
                            title: {
                                like: data.title,
                                options: "i"
                            }
                        }]

                }
            };
            Productguide.find(query, cb)
        }
        __call(__Data);

    }
    Productguide.remoteMethod('searchGuide', {
        description: 'search product/troubleshooting/videoHub guide',
        accepts: {
            arg: 'data',
            type: 'object',
            description: '{"title":"brake repair..","type:"productInfo/troubleshoot/videoHub"}',
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
            path: '/searchGuide'
        },
    });


};
