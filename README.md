This tool was created for a homeless hostel where I used to work, 
but could be applied in various scenarios. 

It allows staff (who have accounts - simple un and pw) to enable/disable
internet access for a given amount of time. 

It must be used with a browser whose proxy settings are set to localhost 9000 for
http and https. 

When it is run (node kioskaccesssystem after npm install), port 80 and port 443
become blocked. 

When the browser attempts to access the internet, a denied message is supplied (transparently via localhost:9000)

The system provides a control interface on port 3000, so locally at localhost:3000
or it's IP address (e.g. 192.168.1.64:3000). This can be used to enable the web. 

At this point port 80 and 443 are unblocked, and the tool acts as transparent proxy
recording browsing history. 