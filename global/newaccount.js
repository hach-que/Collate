/*
 * Name:            Collate.Global.NewAccount
 * Author:          James Rhodes
 * License:         MIT License
 *
 * Description:
 *  The global new account page that allows the user to create a new account.
 *
 */

Collate.Global.NewAccount = Class.create(Collate.Global, {

    // <summary>
    // Initalizes the new account page.
    // </summary>
    initialize: function()
    {
    },
    
    setupParameters: function(parameters)
    {
        // Set up the parameters required.
        var y = -24 * parameters.length;
        var views = [];
        for (var i = 0; i < parameters.length; i += 1)
        {
            var p = parameters[i];
            views[views.length] = { view: 'Label', rect: '0 ' + (241 + y) + ' 300 22', anchors: 'left top', text: p.text + ":" };
            switch (p.type)
            {
                case "Text":
                    views[views.length] = { view: 'TextField', rect: '100 ' + (241 + y) + ' 200 22', anchors: 'left top', id: "Parameters-" + p.name, placeholder: p.default };
                    break;
                default:
                    break;
            }
            y += 24;
        }
        uki(views).attachTo(uki('#NewAccount-Options').dom(), '580 280');
    },
    
    createAccount: function(acc, name, parameters)
    {
        // Add the account details to local storage.
        var s = Collate.Storage.getRawItem("global-accounts");
        if (s == null)
            s = [];
        s[s.length] = {
            type: acc.ID,
            name: name,
            parameters: parameters
            };
        Collate.Storage.setRawItem("global-accounts", s);
        
        // Create the instance of the account.
        Collate.User.Accounts[name] = new acc(parameters);
        Collate.User.Accounts[name].connect();
        
        // Regenerate the account sidebar.
        GenerateAccountSidebar();
        ReassignAccountSidebar();
    },
    
    // <summary>
    // Requests the UKI UI to show in the main area.
    // </summary>
    // <param name="attach">Call this function with the generated UKI before modifying elements.</param>
    getUI: function(attach)
    {
        // Determine options.
        var opts = [];
        for (var i in Collate.Account)
        {
            if (Collate.Account[i] != null && typeof(Collate.Account[i]) == "function" && Collate.Account[i].Name != undefined)
            {
                Collate.Account[i].ID = i;
                opts[opts.length] = { value: Collate.Account[i], text: Collate.Account[i].Name };
            }
        }        
        
        // Perform the initial setup.
        attach(uki(
            { view: 'Box', rect: '0 0 1000 1000', anchors: 'top left right width', childViews: [
        
                { view: 'Label', rect: '208 70 600 0', anchors: 'top', text: 'New Account Wizard', style: { fontSize: '20px' } },
        
                // Main area
                { view: 'Box', rect: '200 100 600 300', anchors: 'top', id: 'NewAccount-BorderBox', childViews: [
                    { view: 'Label', rect: '10 10 300 22', anchors: 'left top', text: 'What kind of account do you want to add?' },
                    { view: 'Select', rect: '320 10 270 22', anchors: 'left top', id: 'NewAccount-AccountType', rowHeight: 22, options: opts },
                    { view: 'Label', rect: '10 37 300 22', anchors: 'left top', text: 'What do you want to call this account?' },
                    { view: 'TextField', rect: '320 37 270 22', anchors: 'left top', id: 'NewAccount-AccountName' },
                    { view: 'Box', rect: '0 67 600 0', anchors: 'top', id: 'NewAccount-BorderLine1', childViews: [ ] },
                    
                    { view: 'Label', rect: '10 77 580 280', anchors: 'left top', id: 'NewAccount-AccountDesc', multiline: true, html: opts[0].value.Description },
                    { view: 'Box', rect: '10 50 580 280', anchors: 'bottom', id: 'NewAccount-Options', childViews: [ ] },
                    { view: 'Button', rect: '490 265 100 24', anchors: 'bottom right', id: 'NewAccount-Create', text: 'Create' },
                ] }
                
            ] }
        ));
        
        // Now modify and attach events to the elements.
        var me = this;
        uki('#NewAccount-BorderBox').dom().style.border = 'solid 1px #CCC';
        uki('#NewAccount-BorderBox').dom().style.borderRadius = '15px';
        uki('#NewAccount-BorderLine1').dom().style.border = 'none';
        uki('#NewAccount-BorderLine1').dom().style.borderTop = 'solid 1px #CCC';
        uki('#NewAccount-AccountType').bind('click', function ()
        {
            var value = uki('#NewAccount-AccountType').value();
            uki('#NewAccount-AccountDesc').html(value.Description);
            
            me.setupParameters(value.Parameters);
        });
        uki('#NewAccount-Create').bind('click', function ()
        {
            var value = uki('#NewAccount-AccountType').value();
            var name = uki('#NewAccount-AccountName').value();
            
            // Check to see if the name is valid.
            if (name == null || typeof(name) != "string" || name.length == 0)
            {
                alert("You supplied an invalid account name.");
                return;
            }
            
            // Check to see if it already exists.
            for (var i in Collate.User.Accounts)
            {
                if (i == name)
                {
                    alert("You must supply a unique account name.");
                    return;
                }
            }
            
            // Get parameter values.
            var params = {};
            for (var i = 0; i < value.Parameters.length; i += 1)
            {
                params[value.Parameters[i].name] = uki("#Parameters-" + value.Parameters[i].name).value();
            }
            
            me.createAccount(value, name, params);
        });
        this.setupParameters(opts[0].value.Parameters);
    }
    
});