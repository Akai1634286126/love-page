from flask import Flask, render_template, jsonify
from datetime import datetime
from threading import Lock
import os
import random

app = Flask(__name__)

# ==========================================
# 动态数据
# ==========================================

visitor_count = 0
visitor_lock = Lock()

love_messages = [
    "遇见你之后，普通的日子也开始有了光。",
    "如果心动有声音，那一定是见到你的那一刻。",
    "人海那么大，我偏偏遇见了你。",
    "希望每一次星光落下，都刚好照亮你的笑。",
    "我想把所有浪漫，都偷偷藏进和你的日子里。",
    "喜欢不是一瞬间，是很多个瞬间都想起你。",
    "愿我们的故事，不止有开场，还有很多很多以后。",
    "今晚的月亮很好看，但我更想和你一起看。",
    "如果宇宙有答案，我希望答案是我们。",
    "你出现以后，我的世界像多了一层温柔的滤镜。"
]


# ==========================================
# 首页
# ==========================================

@app.route("/")
def index():
    return render_template("index.html")


# ==========================================
# 动态 API
# ==========================================

@app.route("/api/status")
def api_status():
    global visitor_count

    # 访问人数 +1
    with visitor_lock:
        visitor_count += 1
        current_visitors = visitor_count

    now = datetime.now()

    # 根据时间选择情话
    message = random.choice(love_messages)

    return jsonify({
        "success": True,
        "visitor_count": current_visitors,
        "server_time": now.strftime("%Y-%m-%d %H:%M:%S"),
        "message": message,
        "server": "Love-page2 Flask",
        "status": "online"
    })


# ==========================================
# 心跳检测 API
# ==========================================

@app.route("/api/ping")
def api_ping():
    return jsonify({
        "success": True,
        "message": "Love-page2 is alive ❤️",
        "time": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    })


# ==========================================
# 本地启动
# ==========================================

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))

    app.run(
        host="0.0.0.0",
        port=port,
        debug=True
    )
