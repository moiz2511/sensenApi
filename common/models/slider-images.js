'use strict';

module.exports = function (Sliderimages) {
    Sliderimages.sliderImagesArray = function (data, cb) {
        async function __filename(__data) {
            var query = {}
            if (data.type) {
                query['where'] = {}
                query.where['type'] = data.type
            }
            cb(null, await Sliderimages.find(query).map(function (item) {
                return item['url'];
            }))
        }
        __filename(data);

    }

    Sliderimages.remoteMethod('sliderImagesArray', {
        accepts: {
            arg: 'data',
            type: 'object',
            description: '{"type":"news/general"}',
            http: {
                source: 'body'
            }
        },
        returns: { arg: 'images', type: 'array' }
    });
};
