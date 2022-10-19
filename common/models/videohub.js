'use strict';

module.exports = function (Videohub) {
    Videohub.searchVideos = function (__Data, cb) {
        async function __call(data) {
            if (data.title)
                var query = {
                    where: {
                        "snippet.title": {
                            like: data.title,
                            options: "i"
                        }
                    }
                };
            else
                var query = {};
            Videohub.find(query, cb)
        }
        __call(__Data);

    }
    Videohub.remoteMethod('searchVideos', {
        description: 'search videos by title ',
        accepts: {
            arg: 'data',
            type: 'object',
            description: '{"title":"video "}',
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
            path: '/searchVideos'
        },
    });
};
