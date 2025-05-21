import http.server
import socketserver
import os
import sys

PORT = 3000

class MyHttpRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Add CORS headers
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET')
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

    def do_GET(self):
        try:
            super().do_GET()
        except Exception as e:
            print(f"Error handling request: {e}")
            self.send_error(500, f"Internal server error: {str(e)}")

Handler = MyHttpRequestHandler

try:
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f"Serving at http://localhost:{PORT}")
        print("Press Ctrl+C to stop the server")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down server...")
            httpd.server_close()
except OSError as e:
    if e.errno == 48:  # Address already in use
        print(f"Error: Port {PORT} is already in use.")
        print("Try these steps:")
        print("1. Kill the process using the port:")
        print(f"   lsof -i :{PORT} | grep LISTEN | awk '{{print $2}}' | xargs kill -9")
        print("2. Or use a different port by changing PORT in server.py")
        sys.exit(1)
    else:
        print(f"Error starting server: {e}")
        sys.exit(1) 