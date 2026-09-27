import hashlib
import os


def calculate_hash(filepath, chunk_size=1024 * 1024):
    """
    Calculate SHA-256 hash of a file.
    Files with the same content will have the same hash.
    """
    sha256 = hashlib.sha256()

    with open(filepath, "rb") as file:
        while True:
            chunk = file.read(chunk_size)

            if not chunk:
                break

            sha256.update(chunk)

    return sha256.hexdigest()


def find_duplicates(folder):
    """
    Find duplicate files inside a folder.

    Returns:
        [
            {
                "file": "copy.jpg",
                "duplicate_of": "original.jpg",
                "hash": "..."
            }
        ]
    """

    hashes = {}
    duplicates = []

    if not os.path.isdir(folder):
        return duplicates

    for filename in os.listdir(folder):
        filepath = os.path.join(folder, filename)

        # Ignore directories
        if not os.path.isfile(filepath):
            continue

        try:
            file_hash = calculate_hash(filepath)
        except (OSError, IOError):
            continue

        if file_hash in hashes:
            duplicates.append(
                {"file": filename, "duplicate_of": hashes[file_hash], "hash": file_hash}
            )
        else:
            hashes[file_hash] = filename

    return duplicates
