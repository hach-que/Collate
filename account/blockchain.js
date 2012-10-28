/*
 * Name:            Collate.Account.BlockChainExplorer
 * Author:          James Rhodes
 * License:         MIT License
 *
 * Description:
 *  Defines the class for connecting to BlockChain for a safe way
 *  view your balance without running the BitCoin server.
 *
 */

Collate.Account.BlockChainExplorer = Class.create(Collate.Account, {

    // <summary>
    // Initializes a block explorer-based account, allowing the user to view their
    // estimated balance without running the server.
    // </summary>
    // <param name="name">The name of this account as it appears in Collate.</param>
    // <param name="parameters">The custom settings applicable to this account.</param>
    initialize: function(name, parameters)
    {
        this.name = name;
        this.uiid = null;
        
        // Copy the parameters to the settings variable.
        this.settings = {
            address: parameters.address || "1Bxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
            };
        
        this.connected = false;
        this.state = null;
        this.cachedBalance = null;
        this.hasError = false;
    },
    
    // <summary>
    // Connects to the Block Explorer.
    // </summary>
    connect: function($super)
    {
        // Check to see if we are already connected.
        if (this.connected)
            return true;
        
        // Construct the URL.
        this.state = {
            url:"http://blockchain.info/q/addressbalance/" + this.settings.address,
            };
        
        // We are now connected (the onRequest won't fire correctly unless
        // we set this to true first).
        this.connected = true;
        
        // Call the callback with the xhr set to null; this will indicate that
        // we're just going to start a request rather than handling an existing
        // one.
        this.onRequest(null);
        return true;
    },
    
    // <summary>
    // Callback for when the frontend has loaded and is ready to accept
    // requests to set statuses on the sidebar.  
    // </summary>
    onFrontendLoad: function()
    {
        // Update the sidebar.
        this.updateSidebar();
    },
    
    // <summary>
    // Callback function for handling the XMLHttpRequest events.
    // </summary>
    onRequest: function($super, xhr)
    {
        // See if we have disconnected and don't need to do anything.
        if (!this.connected)
            return;
        
        // Handle the XMLHttpRequest if there is one.
        if (xhr != null)
        {
            this.hasError = false;
            if (xhr.status != 200 || xhr.responseText == "" || xhr.responseText.substring(0, 5) == "ERROR")
            {
                // Some kind of error.
                this.hasError = true;
                if (uki)
                {
                    // Update the sidebar.
                    this.updateSidebar();
                            
                    // Generate wallet dashboard.
                    this.generateWalletDashboard();
                }
            }
            else
            {
                this.cachedBalance = parseFloat(xhr.responseText) / 100000000;
                
                // Cause the backend to refresh the total balance.
                Backend.refreshBalance();
                
                // Skip the next part if we can't update the UI.
                if (uki)
                {
                    // Update the sidebar.
                    this.updateSidebar();
                    
                    // Generate wallet dashboard.
                    this.generateWalletDashboard();                    
                }
            }
        }
        
        // (Re)start a new XMLHttpRequest.
        var call = new XMLHttpRequest();
        var me = this;
        call.open("GET", this.state.url, true);
        call.onreadystatechange = function() 
        {
            if (call.readyState == 4)
                me.onRequest(call);
        };
        if (this.cachedBalance == null)
            window.setTimeout(function ()
            {
                call.send();
            }, 1000);
        else
            window.setTimeout(function ()
            {
                call.send();
            }, 1000 * 60);
    },
    
    // <summary>
    // Disconnects from the appropriate service.  This should not
    // throw away the connection information, but rather be ready
    // to connect again at whim.
    // </summary>
    disconnect: function($super)
    {
        this.connected = false;
        this.state = null;
        this.cachedBalance = null;
        return true;
    },
    
    // <summary>
    // Update all the sidebar statistics.
    // </summary>
    updateSidebar: function()
    {
        // Check to see if we should show "Error" in the sidebar.
        if (this.hasError)
        {
            Backend.getFrontend().setPageStatus(this, null, "ERROR");
            return;
        }
        
        // Set the balance in the sidebar.
        if (this.cachedBalance == null)
            Backend.getFrontend().setPageStatus(this, null, null);
        else
            Backend.getFrontend().setPageStatus(this, null, "&#x0E3F " + this.cachedBalance.toFixed(2));
    },
    
    // <summary>
    // Requests a list of toolbar items to show at the top of the screen while
    // this account is in the active window.
    // </summary>
    getToolbar: function()
    {
        // Return the relevant toolbar items for the dashboard.
        return [
                {
                    text: "Visit BlockChain",
                    width: 149,
                    onClick: function()
                    {
                        window.open("http://blockchain.info/");
                    }
                }
            ];
    },
    
    // <summary>
    // Requests a list of subitems to show in the sidebar, or null
    // if the top-level item will be used.  In the later case, null
    // will be passed to getUI instead of one of the strings in the array.
    // </summary>
    getMenu: function()
    {
        // Return menu items.
        return null;
    },
    
    // <summary>
    // Requests the UKI UI to show in the main area.  You should probably
    // create this the first time it is requested, and cache it for all
    // times after that.
    // </summary>
    // <param name="attach">Call this function with the generated UKI before modifying elements.</param>
    // <param name="page">One of the menu items, or null.</param>
    getUI: function(attach, uiid, page)
    {
        if (!this.connected)
            this.connect();
        this.uiid = uiid;
        
        switch (page)
        {
            case null:
                // Create the wallet view.
                attach(uki(
                    { view: 'Box', rect: '0 0 1000 1000', anchors: 'top left right width', childViews: [
                
                        { view: 'Label', rect: '208 70 600 0', anchors: 'top', text: this.name, style: { fontSize: '20px' } },
                        { view: 'Label', rect: '208 70 580 0', anchors: 'top', id: this.uiid + '-Dashboard-Balance', textSelectable: true, html: '&#x0E3F _.__', style: { fontSize: '20px', textAlign: 'right' } },
                
                        // Main area
                        { view: 'Box', rect: '200 100 600 300', anchors: 'top', id: this.uiid + '-Dashboard-BorderBox', childViews: [
                            { view: 'Label', rect: '10 10 580 280', anchors: 'left top', id: this.uiid + '-Dashboard-Status', textSelectable: true, multiline: true,  text: 'Loading information...' },
                        ] }
                        
                    ] }
                ));
                
                // Now modify and attach events to the elements.
                uki('#' + this.uiid + '-Dashboard-BorderBox').dom().style.border = 'solid 1px #CCC';
                uki('#' + this.uiid + '-Dashboard-BorderBox').dom().style.borderRadius = '15px';
                uki('#' + this.uiid + '-Dashboard-Status').dom().style.lineHeight = '20px';
                
                // Generate wallet dashboard.
                this.generateWalletDashboard();
                
                break;
                                
            default:
                return null;
        }
        
        // Update the sidebar.
        this.updateSidebar();
    },
        
    // <summary>
    // Regenerates the wallet information for the dashboard.
    // </summary>
    generateWalletDashboard: function($super)
    {
        if (!uki) return;
        
        if (this.hasError)
        {
            uki('#' + this.uiid + '-Dashboard-Status').html("The plugin was unable to connect to <a href='http://blockchain.info/' target='_blank'>BlockChain</a>.  This usually indicates the website is down for maintainance or could otherwise not be contacted.<br/><br/>It's also possible that you provided an invalid BitCoin address when creating the account; you can edit this account by clicking on the main dashboard and selecting 'Edit Accounts'.");
            uki('#' + this.uiid + '-Dashboard-Balance').html("&#x0E3F _.__");
        }
        else if (this.cachedBalance != null)
        {
            var text = "This wallet information is retrieved using <a href='http://www.blockchain.info/' target='_blank'>BlockChain</a> and hence carries a delay of up to two minutes.";
            
            uki('#' + this.uiid + '-Dashboard-Status').html(text);
            uki('#' + this.uiid + '-Dashboard-Balance').html("&#x0E3F " + this.cachedBalance.toFixed(2));
        }
        else
        {
            uki('#' + this.uiid + '-Dashboard-Status').text("Loading information...");
            uki('#' + this.uiid + '-Dashboard-Balance').html("&#x0E3F _.__");
        }
    },

    // <summary>
    // Returns the current balance of the account.
    // </summary>
    getBalance: function($super)
    {
        // If this returns null, it means there's no value yet.
        return this.cachedBalance;
    }
    
});

// <summary>
// The account type name (to be shown in the New Account wizard).
// </summary>
Collate.Account.BlockChainExplorer.Name = "BlockChain Explorer (Wallet)";

// <summary>
// The account type description (to be shown in the New Account wizard).
// </summary>
Collate.Account.BlockChainExplorer.Description = "<i>Connects to BlockChain API to show the balance of any public address.</i>";

// <summary>
// The account parameter list.
// </summary>
Collate.Account.BlockChainExplorer.Parameters = [
    { type: 'Text', name: 'address', text: 'Address', default: '1Bxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' }
];

