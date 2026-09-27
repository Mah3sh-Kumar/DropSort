import os

from flask import Blueprint, send_file

download_bp = Blueprint("download", __name__)


BASE_DIR = os.path.dirname(os.path.dirname(__file__))

ORGANIZED_FOLDER = os.path.join(BASE_DIR, "organized")

OUTPUT_FOLDER = os.path.join(BASE_DIR, "downloads")


os.makedirs(OUTPUT_FOLDER, exist_ok=True)


@download_bp.route("/download/<batch_id>", methods=["GET"])
def download_zip(batch_id):

    batch_output_folder = os.path.join(OUTPUT_FOLDER, batch_id)

    zip_path = os.path.join(batch_output_folder, "DropSort_Organized.zip")

    if not os.path.exists(zip_path):
        return {"success": False, "message": "No organized ZIP file found."}, 404

    return send_file(
        zip_path,
        as_attachment=True,
        download_name="DropSort_Organized.zip",
        mimetype="application/zip",
    )
