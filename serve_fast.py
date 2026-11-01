#!/usr/bin/env python3
"""
Ultra-fast, multi-threaded local HTTP server with caching and TCP_NODELAY
Designed for zero-latency asset delivery for Sanchayan Saha's Portfolio & Cultural Archive.
"""

import os
import sys
import socket
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler

PORT = 4173
DIRECTORY = os.path.abspath(os.path.dirname(__file__))

class FastPortfolioHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        # Enable caching for static assets to eliminate lag on repeat loads
        if self.path.endswith((".js", ".css", ".svg", ".json", ".woff2", ".png", ".jpg")):
            self.send_header("Cache-Control", "public, max-age=86400")
            self.send_header("Access-Control-Allow-Origin", "*")
        else:
            self.send_header("Cache-Control", "no-cache")
        super().end_headers()

    def log_message(self, format, *args):
        # Suppress noisy request logging for faster throughput
        pass

class FastThreadingServer(ThreadingHTTPServer):
    daemon_threads = True
    allow_reuse_address = True

    def server_bind(self):
        super().server_bind()
        # Enable TCP_NODELAY for minimum latency / instant packet flush
        self.socket.setsockopt(socket.IPPROTO_TCP, socket.TCP_NODELAY, 1)

def run():
    server_address = ("0.0.0.0", PORT)
    httpd = FastThreadingServer(server_address, FastPortfolioHandler)
    print(f"Fast HTTP Server running on http://localhost:{PORT}")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping server...")
        httpd.server_close()

if __name__ == "__main__":
    run()
