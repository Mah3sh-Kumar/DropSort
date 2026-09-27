import os

# ========================================
# File Signatures / Magic Numbers
# ========================================

FILE_SIGNATURES = {
    # ----------------------------------------
    # Images
    # ----------------------------------------
    "Images": {
        "jpg": [b"\xff\xd8\xff"],
        "jpeg": [b"\xff\xd8\xff"],
        "png": [b"\x89PNG\r\n\x1a\n"],
        "gif": [b"GIF87a", b"GIF89a"],
        "bmp": [b"BM"],
        "ico": [b"\x00\x00\x01\x00"],
    },
    # ----------------------------------------
    # Documents
    # ----------------------------------------
    "Documents": {
        "pdf": [b"%PDF"],
        "doc": [b"\xd0\xcf\x11\xe0\xa1\xb1\x1a\xe1"],
    },
    # ----------------------------------------
    # Archives
    # ----------------------------------------
    "Archives": {
        "rar": [b"Rar!\x1a\x07"],
        "7z": [b"7z\xbc\xaf\x27\x1c"],
        "gz": [b"\x1f\x8b"],
        "bz2": [b"BZh"],
        "xz": [b"\xfd7zXZ\x00"],
    },
    # ----------------------------------------
    # Audio
    # ----------------------------------------
    "Audio": {
        "flac": [b"fLaC"],
        "ogg": [b"OggS"],
        "mp3": [b"ID3"],
    },
    # ----------------------------------------
    # Videos
    # ----------------------------------------
    "Videos": {
        "webm": [b"\x1a\x45\xdf\xa3"],
    },
}


def get_file_signature(filepath, bytes_to_read=32):
    """
    Read the first bytes of a file.
    """
    try:
        with open(filepath, "rb") as file:
            return file.read(bytes_to_read)
    except (OSError, IOError):
        return b""


def detect_by_signature(filepath):
    """
    Detect file type using its magic number.

    Returns:
        {
            "category": "Images",
            "extension": "jpg"
        }
    or None if no known signature is found.
    """
    header = get_file_signature(filepath)

    if not header:
        return None

    # Handle ambiguous RIFF format (WEBP, WAV, AVI)
    if header.startswith(b"RIFF") and len(header) >= 12:
        format_id = header[8:12]
        if format_id == b"WEBP":
            return {"category": "Images", "extension": "webp"}
        elif format_id == b"WAVE":
            return {"category": "Audio", "extension": "wav"}
        elif format_id == b"AVI ":
            return {"category": "Videos", "extension": "avi"}

    # Handle ambiguous ZIP format (ZIP, DOCX, XLSX, PPTX, etc)
    # We return None to fall back to the file extension for accurate categorization
    if header.startswith(b"PK\x03\x04"):
        return None

    for category, extensions in FILE_SIGNATURES.items():
        for extension, signatures in extensions.items():
            for signature in signatures:
                if header.startswith(signature):
                    return {"category": category, "extension": extension}

    return None
