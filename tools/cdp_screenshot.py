#!/usr/bin/env python
"""通过 CDP 在真实时间流下截图（避免 virtual-time 假象）。"""
import base64
import json
import sys
import time
import urllib.request

import websocket

url = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:5199/"
out = sys.argv[2] if len(sys.argv) > 2 else "/tmp/cdp-shot.png"
wait_s = float(sys.argv[3]) if len(sys.argv) > 3 else 6.0

# 新建一个 tab
req = urllib.request.Request(f"http://127.0.0.1:9222/json/new?about:blank", method="PUT")
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
send("Page.navigate", {"url": url})
time.sleep(wait_s)  # 真实时间等待动画播放
shot = send("Page.captureScreenshot", {"format": "png"})
with open(out, "wb") as f:
    f.write(base64.b64decode(shot["data"]))

# 顺带读取页面状态：主题、粒子画布尺寸
state = send("Runtime.evaluate", {"expression": """JSON.stringify({
  theme: document.documentElement.getAttribute('data-theme'),
  canvases: Array.from(document.querySelectorAll('canvas')).map(c => ({w: c.width, h: c.height, cls: (c.className||'').slice(0,40), rect: JSON.stringify(c.getBoundingClientRect())})),
})""", "returnByValue": True})
print(state.get("result", {}).get("value"))

ws.close()
# 关闭 tab
urllib.request.urlopen(f"http://127.0.0.1:9222/json/close/{tab['id']}").read()
print("saved:", out)
