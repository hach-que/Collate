/*
 * Name:            Collate.Global.Sync
 * Author:          James Rhodes
 * License:         MIT License
 *
 * Description:
 *  The global sync page that allows the user to set up sync information.
 *
 */

Collate.Global.Sync = Class.create(Collate.Global, {

    // <summary>
    // Initializes the new account page.
    // </summary>
    initialize: function()
    {
    },
    
    // <summary>
    // Requests a list of toolbar items to show at the top of the screen while
    // this account is in the active window.
    // </summary>
    getToolbar: function()
    {
        return this.getUniversalToolbar();
    },
        
    // <summary>
    // Requests the UKI UI to show in the main area.
    // </summary>
    // <param name="attach">Call this function with the generated UKI before modifying elements.</param>
    getUI: function(attach)
    {       
        // Perform the initial setup.
        attach(uki(
            { view: 'Box', rect: '0 0 1000 1000', anchors: 'top left right width', childViews: [
        
                { view: 'Label', rect: '208 70 600 0', anchors: 'top', text: 'Sync Setup', style: { fontSize: '20px' } },
        
                // Main area
                { view: 'Box', rect: '200 100 600 340', anchors: 'top', id: this.uiid + '-BorderBox', childViews: [
                    { view: 'Label', rect: '10 12 580 280', anchors: 'left top', id: this.uiid + '-Inform', textSelectable: true, multiline: true, text: '' },
                    { view: 'Label', rect: '10 160 580 14', anchors: 'left top', text: 'Sync Configuration', style: { fontSize: '14px', fontWeight: 'bold' } },

                    { view: 'Label', rect: '10 187 580 14', anchors: 'left top', id: this.uiid + '-Status', text: '' },
                    { view: 'Label', rect: '10 212 300 22', anchors: 'left top', text: 'Hostname:' },
                    { view: 'TextField', rect: '320 212 270 22', anchors: 'left top', id: this.uiid + '-Host', value: (Backend.Storage.Host == null) ? "collate.redpointsoftware.com.au" : Backend.Storage.Host },
                    { view: 'Label', rect: '10 239 300 22', anchors: 'left top', text: 'Username:' },
                    { view: 'TextField', rect: '320 239 270 22', anchors: 'left top', id: this.uiid + '-User', value: Backend.Storage.User },
                    { view: 'Label', rect: '10 266 300 22', anchors: 'left top', text: 'Password:' },
                    { view: 'PasswordTextField', rect: '320 266 270 22', anchors: 'left top', id: this.uiid + '-Pass', value: Backend.Storage.Pass },

//                    { view: 'Box', rect: '0 67 600 0', anchors: 'top', id: this.uiid + '-BorderLine1', childViews: [ ] },
                    
//                    { view: 'Label', rect: '10 77 580 280', anchors: 'left top', id: this.uiid + '-AccountDesc', multiline: true, html: "" },
//                    { view: 'Box', rect: '10 50 580 280', anchors: 'bottom', id: this.uiid + '-Options', childViews: [ ] },
                    { view: 'Button', rect: '490 305 100 24', anchors: 'bottom right', id: this.uiid + '-Save', text: 'Save and Sync' },
                ] }
                
            ] }
        ));

        // Now modify and attach events to the elements.
        uki('#' + this.uiid + '-BorderBox').dom().style.border = 'solid 1px #CCC';
        uki('#' + this.uiid + '-BorderBox').dom().style.borderRadius = '15px';

        uki('#' + this.uiid + '-Inform').html("Sync allows you to keep your settings stored on a remote server, so that your " + 
                                              "Collate settings are the same across all devices, and do not get lost if the " + 
                                              "extension is ever uninstalled.<br/><br/>" + 
                                              "Configuration data is encrypted with AES-256 before being sent to the server, and " +
                                              "can only be decrypted using the password specified below.  The password is stored " +
                                              "in plain-text locally, and a hash is transmitted to the server to verify sync updates.<br/><br/>" +
                                              "The default sync server (collate.redpointsoftware.com.au) is a <strong>valid and " +
                                              "running server</strong>, and requires no registration. " +
                                              "Just enter a unique username and password and you're good to go.");

        if (Backend.Storage.isConfigured())
            uki('#' + this.uiid + '-Status').style({color: 'green'}).text("Sync is configured.");
        else
            uki('#' + this.uiid + '-Status').style({color: 'red'}).text("Sync is not configured.");

        uki('#' + this.uiid + '-Save').bind('click', function ()
        {
            var user = uki('#' + this.uiid + '-User').value()
            if (user.length < 3)
            {
                uki('#' + this.uiid + '-Status').style({color: 'red'}).text("Username must be at least 3 characters.");
                return;
            }
            if (!(/^[a-zA-Z0-9-_]+$/.test(user)))
            {
                uki('#' + this.uiid + '-Status').style({color: 'red'}).text("Username can only contain a-z, A-Z, 0-9, dash and underscore.");
                return;
            }
            if (uki('#' + this.uiid + '-Pass').value().length < 8)
            {
                uki('#' + this.uiid + '-Status').style({color: 'red'}).text("Password must be at least 8 characters.");
                return;
            }

            Backend.Storage.configure(
                uki('#' + this.uiid + '-Host').value(),
                uki('#' + this.uiid + '-User').value(),
                uki('#' + this.uiid + '-Pass').value()
            );

            if (Backend.Storage.isConfigured())
                uki('#' + this.uiid + '-Status').style({color: 'green'}).text("Sync is configured.");
            else
                uki('#' + this.uiid + '-Status').style({color: 'red'}).text("Sync is not configured.");
        });
    }
    
});
