var State = State || new function () {

    this.windows            = {};
    this.windowIds          = [];
    this.prevWindows        = {};
    this.prevWindowIds      = [];
    this.selectedWindowId   = -1;

    this.init = function() {

        // update prev state
        this.prevWindows    = this.windows;
        this.prevWindowIds  = this.windowIds;

        // reset
        this.windows    = {};
        this.windowIds  = [];

        // callback for get all tabs
        var callback = function(windowList) {

            // loop over all windows                
            for(var i=0;i<windowList.length;i++) {			
    
                var windowId = windowList[i].id;

                State.windows[windowId] = {};
                State.windowIds.push(windowId);

                // loop over tabs in a window
                for(var j=0;j<windowList[i].tabs.length;j++) {
                    
                    var tab                         = windowList[i].tabs[j];
                    var tabId                       = tab.id;
                    State.windows[windowId][tabId]  = tab;
                }
            }

            HTML.init();
        };

	    chrome.windows.getAll({ populate: true }, function(windowList) {
            callback(windowList);
            Popup.setStatus("");
	    });
    }

    this.getTabsCount = function(windowId) {

        if(windowId == undefined || windowId == -1) {
        
            return State.getAllTabsCount();
        }

        var tabs = State.windows[windowId];
        return Object.keys(tabs).length;
    }   

    this.getAllTabsCount = function() {
    
        var allTabs = State.getAllTabs();
        return Object.keys(allTabs).length;
    }

    this.getAllTabs = function() {
        
        var allTabs = {};

        for (var windowId in State.windows) {

            jQuery.extend(allTabs, State.getTabs(windowId));
        }

        return allTabs;
    }

    this.getTab = function(tabId, windowId) {
        
        return State.windows[windowId][tabId];
    }

    this.getTabs = function(windowId) {
        
        return State.windows[windowId];
    }
 
    this.getTabIds = function(windowId) {

        var tabIds = [];
        var tabs = State.windows[windowId];
 
        for (var tabId in tabs) {
            if (tabs.hasOwnProperty(tabId)) {
        
                tabIds.push(tabId);   
            }
        }
        
        return tabIds;
    }
   
    this.removeTab = function(tabId, windowId) {
    
        delete State.windows[windowId][tabId];
    }
 
    // this method updates a tab id with its new value
    this.updateTabId = function(oldId, windowId, newTabObj) {

        var newId = newTabObj.id;

        console.log("For windowId : "+windowId);
        console.log("Updating tab id : "+oldId+" to new tab id : "+newId);

        var isUpdateComplete    = false;

        console.log(State.windows[windowId]);

        // loop over tabs for this windowId
        for (var key in State.windows[windowId]) {

            if(State.windows[windowId][key].id == oldId) {

                State.windows[windowId][newId] = newTabObj;
                State.removeTab(oldId, windowId);
                delete State.windows[windowId][oldId];
 
                isUpdateComplete = true;
            }
        }

        console.log(State.windows[windowId]);

        if(!isUpdateComplete) {
            console.log("#updateTabId FATAL : old tab id not found");
        }
    }

}
