import os
import shutil


def create_organized_zip(organized_folder, output_folder):

    os.makedirs(output_folder, exist_ok=True)

    zip_base = os.path.join(output_folder, "DropSort_Organized")

    zip_path = f"{zip_base}.zip"

    # Remove previous ZIP
    if os.path.exists(zip_path):

        os.remove(zip_path)

    zip_path = shutil.make_archive(zip_base, "zip", organized_folder)

    return zip_path
