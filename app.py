from flask import Flask, render_template

from routes.download import download_bp
from routes.organize import organize_bp
from routes.upload import upload_bp

app = Flask(__name__)


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/features")
def features():
    return render_template("features.html")


@app.route("/how-to-use")
def how_to_use():
    return render_template("how_to_use.html")


app.register_blueprint(upload_bp)
app.register_blueprint(organize_bp)
app.register_blueprint(download_bp)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True, use_reloader=False)
