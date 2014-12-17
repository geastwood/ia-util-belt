module.exports = function(options) {
    return {
        run: function() {
            console.log('options', options);
            console.log('arguments', arguments);
        }
    };
};
