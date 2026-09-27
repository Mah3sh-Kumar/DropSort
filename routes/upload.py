import os
import uuid

from flask import Blueprint, jsonify, request
from werkzeug.utils import secure_filename

upload_bp = Blueprint("upload", __name__)

BASE_DIR = os.path.dirname(os.path.dirname(__file__))
UPLOAD_ROOT = os.path.join(BASE_DIR, "uploads")

os.makedirs(UPLOAD_ROOT, exist_ok=True)


def get_unique_filename(folder, filename):
    """
    Prevent files with the same name from overwriting each other.
    Example:
        report.pdf
        report_1.pdf
        report_2.pdf
    """
    name, extension = os.path.splitext(filename)

    candidate = filename
    counter = 1

    while os.path.exists(os.path.join(folder, candidate)):
        candidate = f"{name}_{counter}{extension}"
        counter += 1

    return candidate


@upload_bp.route("/upload", methods=["POST"])
def upload_files():

    files = request.files.getlist("files")

    if not files:
        return jsonify({"success": False, "message": "No files received."}), 400

    # Create a completely isolated batch
    batch_id = uuid.uuid4().hex

    batch_folder = os.path.join(UPLOAD_ROOT, batch_id)

    os.makedirs(batch_folder, exist_ok=True)

    uploaded = []
    failed = []

    for file in files:

        if not file:
            continue

        original_filename = file.filename

        if not original_filename:
            continue

        filename = secure_filename(original_filename)

        if not filename:
            failed.append({"filename": original_filename, "reason": "Invalid filename"})
            continue

        # IMPORTANT:
        # Never overwrite another uploaded file.
        filename = get_unique_filename(batch_folder, filename)

        filepath = os.path.join(batch_folder, filename)

        try:
            file.save(filepath)

            if os.path.exists(filepath):
                uploaded.append(
                    {"original_name": original_filename, "filename": filename}
                )
            else:
                failed.append(
                    {"filename": original_filename, "reason": "File was not saved"}
                )

        except OSError as error:
            failed.append({"filename": original_filename, "reason": str(error)})

    if not uploaded:
        # Remove empty batch
        try:
            os.rmdir(batch_folder)
        except OSError:
            pass

        return (
            jsonify({"success": False, "message": "No files could be uploaded."}),
            400,
        )

    return jsonify(
        {
            "success": True,
            "message": f"{len(uploaded)} of {len(files)} file(s) uploaded successfully.",
            "batch_id": batch_id,
            "uploaded_count": len(uploaded),
            "requested_count": len(files),
            "failed_count": len(failed),
            "files": uploaded,
            "failed": failed,
        }
    )
