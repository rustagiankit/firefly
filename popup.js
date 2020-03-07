var Popup = Popup || new function () {

    this.clearStatus = function() {
        Popup.setStatus("");
    }    

    this.setStatus = function(str) {
        str = "Firefly [ "+str+" ]";
        $("#status").text(str);

        setTimeout( function(){ $("#status").text("Firefly [  ]"); }, 2000);
    }    

    // memory stats
    this.loadMemoryStats = function() {

        var callback = function(info) {

            var capacity    = Utils.bytesToMegaBytes(info.capacity);
            var maxCapacity = Utils.bytesToMegaBytes(info.availableCapacity);

            var memoryText = maxCapacity+"/"+capacity
            $("#memory").text(memoryText);
        };

        chrome.system.memory.getInfo(function(info){                                  
            callback(info) 
        });
    }

    // setup and display
    this.init = function() {
        
        State.init();
        this.loadMemoryStats();

        $("#discardAll").click(function() {
            console.log('discarding all');
            Tab.discardAll();
        });

        this.setStatus("");
    }
}

document.addEventListener('DOMContentLoaded', function() {

	Popup.init();	

    // refresh memory stats periodically
    setInterval(function(){ Popup.loadMemoryStats(); }, 3000);

});
