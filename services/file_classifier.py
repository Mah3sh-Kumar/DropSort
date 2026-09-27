import os

from services.file_signature_detector import detect_by_signature

FILE_CATEGORIES = {
    
    # Images
    "Images": ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp", "ico", "tiff", "tif", "heic", "heif", "avif", "raw", "cr2", "nef", "arw"],
    
    # Documents
    "Documents": ["pdf", "doc", "docx", "txt", "rtf", "odt", "tex", "pages"],
   
   
    # Spreadsheets
    "Spreadsheets": ["xls", "xlsx", "csv", "ods", "numbers"],
   
    # Presentations
    "Presentations": ["ppt", "pptx", "odp", "key"],
   
    # Programming Languages
    "Code": ["py", "js", "jsx", "ts", "tsx", "java", "c", "cpp", "h", "hpp", "cs", "php", "rb", "go", "rs", "swift", "kt", "dart", "lua", "r", "scala", "sh", "bash", "ps1"],
   
    # Web Development
    "Web": ["html", "htm", "css", "scss", "sass", "less", "vue", "svelte"],
   
    # Databases
    "Databases": ["sql", "db", "sqlite", "sqlite3", "mdb", "accdb", "bak"],
    
    # Audio
    "Audio": ["mp3", "wav", "ogg", "flac", "aac", "m4a", "wma", "opus", "midi", "mid"],
    
    # Videos
    "Videos": ["mp4", "mkv", "avi", "mov", "webm", "flv", "wmv", "m4v", "3gp", "mpg", "mpeg"],
    
    # Archives
    "Archives": ["zip", "rar", "7z", "tar", "gz", "bz2", "xz", "tgz", "iso"],
   
    # Executables / Packages
    "Executables": ["exe", "msi", "apk", "appimage", "deb", "rpm"],
   
    # System / Configuration
    "System/Config": ["ini", "cfg", "conf", "toml", "env", "properties", "reg"],
   
    # Fonts
    "Fonts": ["ttf", "otf", "woff", "woff2", "eot"],
    
    # Design
    "Design": ["psd", "ai", "eps", "sketch", "fig", "xd"],

    # 3D / CAD
    "3D/CAD": ["stl", "obj", "fbx", "blend", "glb", "gltf", "step", "stp", "dwg", "dxf"],

    # eBooks
    "eBooks": ["epub", "mobi", "azw", "azw3", "fb2"],

    # Data
    "Data": ["json", "xml", "yaml", "yml", "parquet", "avro"],
    
    # Subtitles
    "Subtitles": ["srt", "ass", "ssa", "vtt", "sub"],
    
    # Notebooks
    "Notebooks": ["ipynb"],
}


def get_category(filename, filepath=None):
    """
    Determine the category of a file.

    Priority:
        1. Magic-number detection
        2. File-extension detection
        3. Other
    """


    # Magic Number Detection
    if filepath and os.path.isfile(filepath):

        signature_result = detect_by_signature(filepath)

        if signature_result:
            return signature_result["category"]


    # Extension Detection
    if filename.startswith(".") and filename.count(".") == 1:
        extension = filename.lstrip(".").lower()
    else:
        extension = os.path.splitext(filename)[1].lower().lstrip(".")

    if not extension:
        return "Other"

    for category, extensions in FILE_CATEGORIES.items():

        if extension in extensions:
            return category

    return "Other"
