var Utils = Utils || new function () {
    
    this.bytesToMegaBytes = function(number) {
        return Math.round(number / 1024 / 1024) + " MB";
    }

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    this.escapeHTML = function(s) {
        return s.replace(/[&"<>]/g, function (c) {
            return {
                '&': "&amp;",
                '"': "&quot;",
                '<': "&lt;",
                '>': "&gt;"
            }[c];
        });
    }

};
