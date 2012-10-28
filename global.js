/*
 * Name:            Collate.Global
 * Author:          James Rhodes
 * License:         MIT License
 *
 * Description:
 *  Defines the base class for global pages.
 *
 */

Collate.Global = Class.create({

    // <summary>
    // Initializes the base class (this doesn't do anything).
    // </summary>
    initialize: function()
    {
        // Nothing to do.
    },
    
    // <summary>
    // Requests a list of toolbar items to show at the top of the screen while
    // this account is in the active window.
    // </summary>
    getToolbar: function()
    {
        // There's no toolbar items as this isn't a proper class.
        return null;
    },
    
    // <summary>
    // Requests the UKI UI to show in the main area.
    // </summary>
    // <param name="attach">Call this function with the generated UKI before modifying elements.</param>
    getUI: function(attach, uiid)
    {
        // There's no UI as this isn't a proper class.
        return null;
    },
    
    // <summary>
    // Gets the universal toolbar for any global pages.
    // </summary>
    getUniversalToolbar: function()
    {
        // Return the relevant toolbar items for the dashboard.
        var n = 0; for (var i in Collate.Backend.Accounts) n += 1;
        if (n > 0)
            return [
                    {
                        text: "Sync",
                        width: 80,
                        target: Backend.Pages["Sync"],
                        page: null
                    },
                    {
                        text: "New Account",
                        width: 121,
                        target: Backend.Pages["NewAccount"],
                        page: null
                    },
                    {
                        text: "Edit Accounts",
                        width: 122,
                        target: Backend.Pages["EditAccounts"],
                        page: null
                    }
                ];
        else
            return [
                    {
                        text: "Sync",
                        width: 80,
                        target: Backend.Pages["Sync"],
                        page: null
                    },
                    {
                        text: "New Account",
                        width: 121,
                        target: Backend.Pages["NewAccount"],
                        page: null
                    }
                ];
    }

});
