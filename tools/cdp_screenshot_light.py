#!/usr/bin/env python
"""CDP 截图（可模拟浅色主题）。"""
import base64
import json
import sys
import time
import urllib.request

import websocket

url = "http://localhost:5199/"
out = "/tmp/hero-light.png"

req = urllib.request.Request("http://127.0.0.1:9222/json/new?about:blank", method="PUT")
tab = json.loads(urllib.request.urlopen(req).read())
ws = websocket.create_connection(tab["webSocketDebuggerUrl"], timeout=30)

mid = 0
def send(method, params=None):
    global mid
    mid += 1
    ws.send(json.dumps({"id": mid, "method": method, "params": params or {}}))
    while True:
        msg = json.loads(ws.recv())
        if msg.get("id") == mid:
            return msg.get("result", {})

send("Page.enable")
send("Emulation.setDeviceMetricsOverride", {"width": 1440, "height": 900, "deviceScaleFactor": 1, "mobile": False})
# 模拟系统浅色偏好，验证浅色主题下的点阵配色
send("Emulation.setEmulatedMedia", {"features": [{"name": "prefers-color-scheme", "value": "light"}]})
send("Page.navigate", {"url": url})
time.sleep(8)
shot = send("Page.captureScreenshot", {"format": "png"})
with open(out, "wb") as f:
    f.write(base64.b64decode(shot["data"]))
state = send("Runtime.evaluate", {"expression": "document.documentElement.getAttribute('data-theme')", "returnByValue": True})
print("theme:", state.get("result", {}).get("value"))
ws.close()
urllib.request.urlopen(f"http://127.0.0.1:9222/json/close/{tab['id']}").read()
print("saved:", out)
