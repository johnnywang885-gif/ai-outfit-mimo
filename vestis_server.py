import http.server
import json
import os
import sys

PORT = 8000
payload_data = None
result_data = None

class VestisHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Allow CORS for cross-origin Tampermonkey calls and web apps
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_POST(self):
        global payload_data, result_data
        if self.path == '/api/store_payload':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            try:
                payload_data = json.loads(post_data.decode('utf-8'))
                # Reset previous result when a new payload is set
                result_data = None
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"status": "success"}).encode('utf-8'))
            except Exception as e:
                self.send_response(400)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode('utf-8'))
        elif self.path == '/api/store_result':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            try:
                result_data = json.loads(post_data.decode('utf-8'))
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"status": "success"}).encode('utf-8'))
            except Exception as e:
                self.send_response(400)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode('utf-8'))
        else:
            super().do_POST()

    def do_GET(self):
        global payload_data, result_data
        if self.path == '/api/get_payload':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            if payload_data:
                self.wfile.write(json.dumps(payload_data).encode('utf-8'))
            else:
                self.wfile.write(json.dumps({}).encode('utf-8'))
        elif self.path == '/api/get_result':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            if result_data:
                # Consume result on retrieve to avoid duplicate loads
                response_payload = result_data
                result_data = None 
                self.wfile.write(json.dumps(response_payload).encode('utf-8'))
            else:
                self.wfile.write(json.dumps({}).encode('utf-8'))
        else:
            super().do_GET()

if __name__ == '__main__':
    # Make sure server directory points to workspace root
    script_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(script_dir)
    
    server_address = ('', PORT)
    httpd = http.server.HTTPServer(server_address, VestisHTTPRequestHandler)
    print(f"[VESTIS Server] Running on http://localhost:{PORT}...")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n[VESTIS Server] Stopping server...")
        sys.exit(0)
