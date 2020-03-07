var Tab = Tab || new function () {

    // display tabs in the table
    this.setupOnClicks = function() {
   
        // onclick
        var rows = document.getElementById("table").rows;
        for (var i = 0; i < rows.length; i++) {
            rows[i].onclick = (function() {

                return function() {
                    var discardTabId    = parseInt($(this).attr("id"));
                    var windowId        = parseInt($(this).attr("data-window"));
                    Tab.toggleTab(discardTabId, windowId);
                }    
            })();
        }

        // close tab button
        var buttons = document.getElementsByClassName('closeTab');
        for(var i=0; i<buttons.length; i++) {
             buttons[i].onclick = (function(ev) {

                return function(ev) {
                    ev.stopPropagation();
                    var tabId       = parseInt($(this).parents("tr").attr("id"));
                    console.log('Closing tab id : '+tabId);

                    chrome.tabs.remove( tabId, function(){

                        console.log('Closed tab id : '+tabId);
                        var windowId = $("#"+tabId).attr("data-window");
                        $("#"+tabId).remove();
                        State.removeTab(tabId, windowId);

                        setTimeout(function(){ 

                            HTML.displayTabs(State.selectedWindowId);

                        }, 500);
                    });
                }    
            })();
        }

        // change window onclick
        var selectWindow = document.getElementById('selectWindow');
        selectWindow.onchange = function() {

            var newWindowId = ($(this).find(":selected").attr('value'));
            console.log("select windowId : "+newWindowId);

            State.selectedWindowId = newWindowId;
            HTML.displayTabs(newWindowId);
        };
    }

    // discard or undiscard a tab
    this.toggleTab = function(tabId, windowId) {

        if(Tab.isEmpty(tabId, windowId)) {
            console.log("Tab is empty, nothing to discard");
            return;
        }

        if(State.windows[windowId][tabId].active == true 
                && Tab.isEmpty(tabId, windowId) == false) {
            console.log("Tab is active, skipping");
            Popup.setStatus("The active tab cannot be discarded");
            return;
        }

        HTML.toggleTab(tabId);   

        var isTabDiscarded = this.isDiscarded(tabId, windowId);
        
        if(isTabDiscarded) {
           
            console.log("resume - "+tabId);

            var callback = function(tabId, windowId) {
               
                State.windows[windowId][tabId].discarded = false;
                Popup.clearStatus();
                Popup.loadMemoryStats();
            };

            // resume        
            $("#status").text("Resuming")
            chrome.tabs.reload( tabId, callback(tabId, windowId) );
    
        }else {

            console.log("discard - "+tabId);

            var callback = function(tabId, windowId, tab) {

                $("#loading_"+tabId).toggleClass("hidden");

                // was discard successful?
                if(tab == undefined) {
        
                    $("#"+tabId).toggleClass("selected");
                    $("#"+tabId).find("img").toggleClass("grayscale");
                
                    console.log("FATAL : Unable to discard");
                    Popup.setStatus("Unable to Discard");
                    return;
                }

                console.log("Discard Successful");
                Popup.clearStatus();

                // discard changes tabId, updating
                var newTabId = tab.id;
        
                console.log("Found new tab id : "+newTabId);
                State.updateTabId(tabId, windowId, tab);

                State.windows[windowId][newTabId].discarded = true;

                $("#"+tabId+"").attr('id', newTabId);

                Popup.loadMemoryStats();
            };

            // discard
            Popup.setStatus("Discarding");
            $("#loading_"+tabId).toggleClass("hidden");


            chrome.tabs.discard( tabId, function(tab) {
                callback(tabId, windowId, tab);
            });

            // if this is the active tab and is not a new tab page, we
            // need to open a new tab and then perform discard

            /*if(State.windows[windowId][tabId].active == true 
                    && Tab.isEmpty(tabId, windowId) == false) {

                chrome.tabs.create( {}, function() {

                    chrome.tabs.discard( tabId, function(tab) {
                        callback(tabId, windowId, tab);
                    });

                });               
                
            } else {

                chrome.tabs.discard( tabId, function(tab) {
                    callback(tabId, windowId, tab);
                });
            }*/

        }
    }

    // nuke
    this.discardTabsInWindow = function(windowId) {

        var tabIds = State.getTabIds(windowId);

        for(let i=0;i<tabIds.length;i++) {
                
            var tabId = parseInt(tabIds[i]);    
            if(!Tab.isDiscarded(tabId, windowId)) {                
                Tab.toggleTab(tabId, windowId);
            }
        }
    }
   
    // nuke
    this.discardAll = function(windowId) {

        for (let i=0; i<State.windowIds.length; i++) {
            this.discardTabsInWindow(State.windowIds[i]);
        }
    }
   
    //------------------------ Utils --------------------------------------------------

    this.getTitle = function(windowId, tabId) {

        var title = State.windows[windowId][tabId].title;
                
        if(title.length > Constants.maxURLLength) {
            title = title.substring(0, Constants.maxTitleLength) + '...';
        }   

        return Utils.escapeHTML(title);
    }

    this.isDiscarded = function(tabId, windowId) {

        return State.windows[windowId][tabId].discarded;
    }

    this.isEmpty = function(tabId, windowId) {
        
        var newTabURL = "chrome://newtab/";
        var tab = State.getTab(tabId, windowId);

        return (tab.url == newTabURL);
    }
};
