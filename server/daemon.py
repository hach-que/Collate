#!/usr/bin/env python
import cgi
from BaseHTTPServer import BaseHTTPRequestHandler, HTTPServer
import sqlite3
import os
import traceback

if __name__ == '__main__':
    # Connect to the SQLite database; create it if it
    # does not exist.
    if not os.path.isfile("database.db"):
        conn = sqlite3.connect("database.db")
        c = conn.cursor()
        c.execute("CREATE TABLE data (key text, passhash text, value text)")
        conn.commit()
    else:
        conn = sqlite3.connect("database.db")
        c = conn.cursor()

class CollateHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        print "Handling GET %s..." % self.path
        try:
            if self.path.startswith("/retrieve/"):
                key = self.path[len("/retrieve/"):]
                c.execute("SELECT value FROM data WHERE key = ?", (key,))
                value = c.fetchone()
                if value == None:
                    self.send_error(404, "Key not found: %s" % key)
                    return
                self.send_response(200)
                self.send_header("Content-type", "text/plain")
                self.end_headers()
                self.wfile.write(value)
            else:
                self.send_error(404, "Unknown request")
        except:
            self.send_error(500, "Internal server error")
            traceback.print_exc()

    def do_POST(self):
        print "Handling POST %s..." % self.path
        try:
            if self.path == "/store":
                ctype, pdict = cgi.parse_header(self.headers.getheader("content-type"))
                if ctype == "multipart/form-data":
                    query = cgi.parse_multipart(self.rfile, pdict)
                key = query.get("key")[0]
                value = query.get("value")[0]
                passhash = query.get("passhash")[0]
                print "key: " + str(key)
                print "value: " + str(value)
                print "hash:" + str(passhash)
                c.execute("SELECT value FROM data WHERE key = ?", (key,))
                if c.fetchone() != None:
                    c.execute("SELECT value FROM data WHERE key = ? AND passhash = ?", (key, passhash))
                    if c.fetchone() == None:
                        # Not permitted.
                        self.send_error(403, "Access denied to write to: %s" % key)
                    c.execute("UPDATE data SET value = ? WHERE key = ? AND passhash = ?", (value, key, passhash))
                else:
                    c.execute("INSERT INTO data (value, key, passhash) VALUES (?, ?, ?)", (value, key, passhash))

                conn.commit()
                self.send_response(200)
                self.end_headers()
            else:
                self.send_error(404, "Unknown request")
        except:
            self.send_error(500, "Internal server error")
            traceback.print_exc()

def main():
    try:
        server = HTTPServer(('', 46597), CollateHandler)
        print "Starting Collate server..."
        server.serve_forever()
    except KeyboardInterrupt:
        print "^C recieved, shutting down..."
        server.socket.close()
        c.close()

if __name__ == '__main__':
    main()
