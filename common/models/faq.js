'use strict';

module.exports = function (Faq) {
    Faq.getFAQ = function (cb) {
        async function __call() {
            var query = {};
            Faq.find(query, cb)
        }
        __call();

    }
    Faq.remoteMethod('getFAQ', {
        description: 'FAQs',
        
        returns: {
            arg: 'data',
            type: 'object'
        },
        http: {
            verb: 'POST',
            path: '/getFAQ'
        },
    });
};
