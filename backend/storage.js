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
    initialize: function()
    {
        this.Host = localStorage.getItem("host");
        this.User = localStorage.getItem("user");
        this.Pass = localStorage.getItem("pass");
        this.Cache = localStorage.getItem("cache");
        if (this.Cache != null)
            this.Cache = JSON.parse(this.Cache);
        if (this.Host == null)
            // Give a sensible default.
            this.Host = "collate.redpointsoftware.com.au";
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
    // Returns whether the storage manager is configured correctly.
    // </summary>
    isConfigured: function()
    {
        return this.Host != null && this.User != null &&
            this.Pass != null;
    },

    // <summary>
    // Reconfigures the storage manager.
    // </summary>
    configure: function(host, user, pass)
    {
        if (user.length < 3 || (!(/^[a-zA-Z0-9-_]+$/.test(user))) ||
            password.length < 8)
            return;

        this.Host = host;
        this.User = user;
        this.Pass = pass;
        localStorage.setItem("host", this.Host);
        localStorage.setItem("user", this.User);
        localStorage.setItem("pass", this.Pass);

        // If the cache is not null, send the cache to the server.
        if (this.Cache == null)
            return;

        // Encrypt with password.
        var data = null;
        try
        {
            data = sjcl.encrypt(this.Pass, JSON.stringify(this.Cache));
        }
        catch (e)
        {
            return false;
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

    },

    // <summary>
    // Retrieves a copy of the value with the specified key in
    // the local storage. Note that it is a COPY not a REFERENCE;
    // you need to use setRawItem to save any changes back to
    // the local storage.
    // </summary>
    getRawItem: function(key)
    {
        // If we already have a cached copy, set that as the result
        // and then attempt to refresh the cache.
        var result = null;
        if (this.Cache != null && key in this.Cache)
            result = JSON.parse(this.Cache[key]);

        // If we have no remote server, return the result from the
        // cache.
        if (this.Host == null || this.User == null)
            return result;

        // Try to pull down a new copy of the data from the server.
        var data = null;
        var xhr = new XMLHttpRequest();
        try
        {
            xhr.open("GET", "http://" + this.Host + "/retrieve/" + this.User, false);
            xhr.send();
            if (xhr.status == 200)
            {
                if (xhr.responseText == null || xhr.responseText == "")
                    return result;
                else
                    data = xhr.responseText;
            }
            else
                return result;

            data = sjcl.decrypt(this.Pass, data);
            localStorage.setItem("cache", data);
            data = JSON.parse(data);
            this.Cache = data;
            return JSON.parse(this.Cache[key]);
        }
        catch (e)
        {
            return result;
        }
    },
    
    // <summary>
    // Sets the value for the specified key.
    // </summary>
    setRawItem: function(key, value)
    {
        // If we are not configured for remote server, save the
        // data in the local cache.
        if (this.Host == null || this.User == null ||
            this.Pass == null)
        {
            var data = localStorage.getItem("cache");
            if (data == null)
                data = {};
            else
                data = JSON.parse(data);
            data[key] = value;
            localStorage.setItem("cache", JSON.stringify(data));
            return true;
        }

        // Read the entire existing state from the server.
        var data = null;
        var xhr = new XMLHttpRequest();
        xhr.open("GET", "http://" + this.Host + "/retrieve/" + this.User, false);
        xhr.send();
        if (xhr.status == 200)
        {
            if (xhr.responseText == null || xhr.responseText == "")
                data = {};
            else
            {
                data = xhr.responseText;
                try
                {
                    data = JSON.parse(sjcl.decrypt(this.Pass, data));
                }
                catch (e)
                {
                    return false;
                }
            }
        }
        else if (xhr.status == 404)
            data = {};

        // Set the value.
        if (data == null)
            data = {};
        data[key] = JSON.stringify(value);
        localStorage.setItem("cache", JSON.stringify(data));
        this.Cache = data;

        // Reencrypt with password.
        try
        {
            data = sjcl.encrypt(this.Pass, JSON.stringify(data));
        }
        catch (e)
        {
            return null;
        }

        // Save the blob back to the server.
        var fd = new FormData();
        fd.append("key", this.User);
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
