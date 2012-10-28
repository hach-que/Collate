/*
 * Name:            Collate.Storage
 * Author:          James Rhodes
 * License:         MIT License
 *
 * Description:
 *  Manages storing settings for plugins and global information using
 *  the browser's localStorage.
 *
 */

Collate.Backend.Storage = Class.create({

    // <summary>
    // Initializes the class.
    // </summary>
    initialize: function(host, user, pass)
    {
        this.Host = host;
        this.User = user;
        this.Pass = pass;
    },

    // <summary>
    // Calculates a hash of the password suitable for
    // sending to the server.
    // </summary>
    getPasswordHash: function()
    {
        return hex_sha1(this.Pass);
    },
    
    // <summary>
    // Retrieves a copy of the value with the specified key in
    // the local storage. Note that it is a COPY not a REFERENCE;
    // you need to use setRawItem to save any changes back to
    // the local storage.
    // </summary>
    getRawItem: function(key)
    {
        // Read the entire existing state from the server.
        var data = null;
        var xhr = new XMLHttpRequest();
        xhr.open("GET", "http://" + this.Host + "/retrieve/" + this.User, false);
        xhr.send();
        if (xhr.status == 200)
        {
            if (xhr.responseText == null || xhr.responseText == "")
                return null;
            else
                data = xhr.responseText;
        }
        else
            return null;

        // Decrypt with password.
        try
        {
            data = JSON.parse(sjcl.decrypt(this.Pass, data));
        }
        catch
        {
            return null;
        }

        // Return the value.
        return data[key];
    },
    
    // <summary>
    // Sets the value for the specified key.
    // </summary>
    setRawItem: function(key, value)
    {
        // Read the entire existing state from the server.
        var data = null;
        var xhr = new XMLHttpRequest();
        xhr.open("GET", "http://" + this.Host + "/retrieve/" + this.User, false);
        xhr.send();
        if (xhr.status == 200)
        {
            if (xhr.responseText == null || xhr.responseText == "")
                return false;
            else
                data = xhr.responseText;
        }
        else
            return false;

        // Decrypt with password.
        try
        {
            data = JSON.parse(sjcl.decrypt(this.Pass, data));
        }
        catch
        {
            return false;
        }

        // Set the value.
        if (data == null)
            data = {};
        data[key] = JSON.stringify(value);

        // Reencrypt with password.
        try
        {
            data = sjcl.encrypt(this.Pass, JSON.stringify(data));
        }
        catch
        {
            return null;
        }

        // Save the blob back to the server.
        var fd = new FormData();
        fd.append("key", key);
        fd.append("value", data);
        fd.append("passhash", this.getPasswordHash());
        xhr = new XMLHttpRequest();
        xhr.open("POST", "http://" + this.Host + "/store", false);
        xhr.send(fd);
        if (xhr.status == 200)
            return true;
        else
            return false;
    }
    
});
