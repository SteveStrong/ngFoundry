var Foundry = Foundry || {};

(function (ns,  undefined) {

    var pubsubCache = {};
    function publishBegin(topic) {
        return topic + 'Begin';
    }

    function publishComplete(topic) {
        return topic + 'Complete';
    }

    ns.publishNoLock = function (topic, args) {
        if (pubsubCache[topic] === undefined) return true;

        var noErrors = true;
        pubsubCache[topic].forEach(function (func) {
            try {
                func.apply(topic, args || []);
            }
            catch (err) {
                ns.trace && ns.trace.log(err);
                noErrors = false;
            }
        });
        return noErrors;
    };

    ns.publish = function (topic, args) {
        // ns.runWithUIRefreshLock(function () {
        ns.publishNoLock(publishBegin(topic), args);
        ns.publishNoLock(topic, args);
        ns.publishNoLock(publishComplete(topic), args);
        // });
    }


    ns.subscribe = function (topic, callback) {
        if (!pubsubCache[topic]) {
            pubsubCache[topic] = [];
        }
        pubsubCache[topic].push(callback);
        return [topic, callback]; // Array
    };


    ns.subscribeBegin = function (topic, callback) {
        ns.subscribe(publishBegin(topic), callback);
    };

    ns.subscribeComplete = function (topic, callback) {
        ns.subscribe(publishComplete(topic), callback);
    };

    ns.unsubscribe = function (handle) {
        var topic = handle[0];
        pubsubCache[topic] && pubsubCache[topic].forEach(function (idx) {
            if (this == handle[1]) {
                pubsubCache[topic].splice(idx, 1);
            }
        });
    };

    ns.unsubscribeBegin = function (topic, callback) {
        ns.unsubscribe(publishBegin(topic), callback);
    };

    ns.unsubscribeComplete = function (topic, callback) {
        ns.unsubscribe(publishComplete(topic), callback);
    };

    ns.flushPubSubCache = function (topic) {
        delete pubsubCache[publishBegin(topic)];
        delete pubsubCache[topic];
        delete pubsubCache[publishComplete(topic)];
    };


}(Foundry));
