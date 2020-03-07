var HTML = HTML || new function() {

    this.init = function() {

        // display windows drop down
        $("#selectWindow").empty().append( HTML.getWindowsMenuOptions(State.windowIds) );

        HTML.displayTabs(State.selectedWindowId);        

    }

    this.displayTabs = function(windowId) {

        var tabsHTML = "";        

        if(windowId == undefined || windowId == -1) {
            
            tabsHTML = HTML.getAllTabs();
        
        }else {

            tabsHTML = HTML.getTabs(windowId);
        }

        // append rows
        $("#table").empty().append(tabsHTML);

        // display number of tabs
        $("#numTabs").text(State.getTabsCount(windowId)+" Tabs")

        // since we have added new rows, need to setup onclicks
        Tab.setupOnClicks();
    }

    this.getAllTabs = function() {
        
        var allTabs = State.getAllTabs();
        var result  = "";
        
        for (var key in allTabs) {
    
            var tab         = allTabs[key];
            var windowId    = tab.windowId;
            var tabId       = tab.id;
        
            result += HTML.getTab(windowId, tabId);
        }
    
        return result;
    }

    this.getTabs = function(windowId) {

        var result = "";
        var tabIds = State.getTabIds(windowId); 

        for(var i=0; i<tabIds.length; i++) {

            var tabId    = tabIds[i];
            result      += HTML.getTab(windowId, tabId); 
        }
 
        return result;
    }

   this.getTab = function(windowId, tabId) {

        var classes = "url";
        if(Tab.isDiscarded(tabId, windowId)) {
            classes += " selected";
        }

        // BUG check order of tabs in all tabs
        var html     = '<tr id="'+tabId+'" data-window="'+windowId+'" class="'+classes+'"><td>';
        html        += HTML.getTabIcon(windowId, tabId);
        html        += '<span style="display:inline-block; width: 10px;"></span>';
        html        += Tab.getTitle(windowId, tabId);
        html        += '<span style="display:inline-block; width: 10px;"></span>';
        html        += HTML.getLoadingIcon(tabId);
        html        += '<img id="closeTabButton" style="float:right" class="closeTab">';
        html        += '</td></tr>';

        return html;
    }

    this.getWindowsMenuOptions = function(windowIds) {

        var html = "";

        if(windowIds.length > 1) {
            html += '<option value="-1">All Windows</option>';
        }

        for(var i=0; i<windowIds.length; i++) {
            var windowId = windowIds[i];
            html += '<option value="'+windowId+'">Window '+(i+1)+'</option>';
        }
 
        return html;
    }

    this.toggleTab = function(tabId) {

        var row = $("#"+tabId);
        var img = row.find("img");
        
        row.toggleClass("selected");
        img.toggleClass("grayscale");
    }

    //------------------------ Icons --------------------------------------------------

    this.getLoadingIcon = function(tabId) {
        var html = '<img id="loading_'+tabId+'" src="images/loading.gif" alt="Loading" height="15" width="15" class="hidden"></img>';
        return html;
    }

    this.getTabIcon = function(windowId, tabId) {

        var imageURL = State.windows[windowId][tabId].favIconUrl;
        if(imageURL == undefined) {
            imageURL = 'default.ico';
        }

        var classes = "favicon";

        if(Tab.isDiscarded(tabId, windowId)) {
             classes += " grayscale"
         }

        var html = '<img id="img_'+tabId+'" src="'+ imageURL  +'" alt="'+ imageURL  +'" class="'+classes+'"></img>';
        return html;
    }


}
