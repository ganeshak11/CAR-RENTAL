#!/usr/bin/env python3
import http.server
import socketserver
import webbrowser
import os
from threading import Timer

PORT = 5500
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

def open_browser():
    webbrowser.open(f'http://127.0.0.1:{PORT}/login.html')

if __name__ == '__main__':
    with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
        print(f"Server running at http://127.0.0.1:{PORT}/")
        print(f"Opening login page...")
        Timer(1, open_browser).start()
        httpd.serve_forever()
