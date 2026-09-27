import os
import shutil

from flask import Blueprint, jsonify, request

from services.duplicate_detector import find_duplicates
from services.file_organizer import organize_files
from services.zip_generator import create_organized_zip

organize_bp = Blueprint("organize", __name__)


BASE_DIR = os.path.dirname(os.path.dirname(__file__))

UPLOAD_ROOT = os.path.join(BASE_DIR, "uploads")

ORGANIZED_ROOT = os.path.join(BASE_DIR, "organized")

DOWNLOAD_FOLDER = os.path.join(BASE_DIR, "downloads")


os.makedirs(UPLOAD_ROOT, exist_ok=True)

os.makedirs(ORGANIZED_ROOT, exist_ok=True)

os.makedirs(DOWNLOAD_FOLDER, exist_ok=True)


@organize_bp.route("/organize", methods=["POST"])
def organize():

    data = request.get_json(silent=True) or {}

    batch_id = data.get("batch_id")

    duplicate_mode = data.get("duplicate_mode", "move")

    # ========================================
    # Validate batch
    # ========================================

    if not batch_id:

        return jsonify({"success": False, "message": "Missing upload batch ID."}), 400

    # Only allow our generated UUID-style IDs.
    # This also prevents path traversal.
    if "/" in batch_id or "\\" in batch_id or ".." in batch_id:

        return jsonify({"success": False, "message": "Invalid batch ID."}), 400

    upload_folder = os.path.join(UPLOAD_ROOT, batch_id)

    if not os.path.isdir(upload_folder):

        return jsonify({"success": False, "message": "Upload batch not found."}), 404

    # ========================================
    # Validate duplicate mode
    # ========================================

    allowed_modes = {"move", "skip", "keep", "rename"}

    if duplicate_mode not in allowed_modes:

        duplicate_mode = "move"

    # ========================================
    # Get uploaded files
    # ========================================

    uploaded_files = [
        filename
        for filename in os.listdir(upload_folder)
        if os.path.isfile(os.path.join(upload_folder, filename))
    ]

    if not uploaded_files:

        return (
            jsonify(
                {"success": False, "message": "No files found in this upload batch."}
            ),
            400,
        )

    # ========================================
    # Duplicate detection
    # ========================================

    duplicates = find_duplicates(upload_folder)

    # ========================================
    # Create isolated organized folder
    # ========================================

    organized_folder = os.path.join(ORGANIZED_ROOT, batch_id)

    # Remove an old folder if the same batch is
    # somehow organized again.
    if os.path.exists(organized_folder):

        shutil.rmtree(organized_folder)

    os.makedirs(organized_folder, exist_ok=True)

    # ========================================
    # Organize
    # ========================================

    organization = organize_files(
        upload_folder=upload_folder,
        organized_folder=organized_folder,
        duplicates=duplicates,
        duplicate_mode=duplicate_mode,
    )

    # ========================================
    # Create ZIP
    # ========================================

    batch_download_folder = os.path.join(DOWNLOAD_FOLDER, batch_id)

    zip_path = create_organized_zip(organized_folder, batch_download_folder)

    # ========================================
    # Duplicate groups for UI
    # ========================================

    duplicate_groups = {}

    for duplicate in duplicates:

        file_hash = duplicate["hash"]

        if file_hash not in duplicate_groups:

            duplicate_groups[file_hash] = [duplicate["duplicate_of"]]

        duplicate_groups[file_hash].append(duplicate["file"])

    # Remove accidental duplicates in group
    for file_hash in duplicate_groups:

        duplicate_groups[file_hash] = list(dict.fromkeys(duplicate_groups[file_hash]))

    # ========================================
    # Response
    # ========================================

    return jsonify(
        {
            "success": True,
            "message": (
                f"{organization['processed']} "
                f"of {organization['total']} "
                f"file(s) processed successfully."
            ),
            "batch_id": batch_id,
            "requested_files": len(uploaded_files),
            "total_files": organization["processed"],
            "uploaded_files": len(uploaded_files),
            "duplicate_count": len(duplicates),
            "skipped_count": organization["skipped"],
            "results": organization["results"],
            "duplicates": duplicates,
            "duplicate_groups": duplicate_groups,
            "skipped_files": organization["skipped_files"],
            "download_ready": os.path.exists(zip_path),
            "download_url": f"/download/{batch_id}",
        }
    )
