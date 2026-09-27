import os
import shutil

from services.file_classifier import get_category


def get_unique_filename(folder, filename):
    """
    Prevent filename collisions inside category folders.
    """

    name, extension = os.path.splitext(filename)

    candidate = filename
    counter = 1

    while os.path.exists(os.path.join(folder, candidate)):
        candidate = f"{name}_{counter}{extension}"
        counter += 1

    return candidate


def organize_files(upload_folder, organized_folder, duplicates, duplicate_mode="move"):
    """
    Organize files into category folders.

    duplicate_mode:
        move   -> duplicates go to Duplicates/
        skip   -> duplicates are not copied
        keep   -> duplicates stay in their normal category
        rename -> duplicates stay in category with unique names
    """

    results = {}
    skipped = []
    total = 0

    # Files identified as duplicates
    duplicate_files = {duplicate["file"] for duplicate in duplicates}

    for filename in os.listdir(upload_folder):

        source_path = os.path.join(upload_folder, filename)

        if not os.path.isfile(source_path):
            continue

        total += 1

        is_duplicate = filename in duplicate_files

        # ========================================
        # SKIP DUPLICATES
        # ========================================

        if is_duplicate and duplicate_mode == "skip":

            skipped.append(filename)

            continue

        # ========================================
        # MOVE DUPLICATES
        # ========================================

        if is_duplicate and duplicate_mode == "move":

            category = "Duplicates"

        else:

            # ========================================
            # NORMAL CATEGORY DETECTION
            # Magic number first, extension fallback
            # ========================================

            category = get_category(filename, source_path)

        category_folder = os.path.join(organized_folder, category)

        os.makedirs(category_folder, exist_ok=True)

        destination_filename = get_unique_filename(category_folder, filename)

        destination_path = os.path.join(category_folder, destination_filename)

        shutil.copy2(source_path, destination_path)

        results[filename] = category

    return {
        "total": total,
        "processed": len(results),
        "skipped": len(skipped),
        "skipped_files": skipped,
        "results": results,
    }
