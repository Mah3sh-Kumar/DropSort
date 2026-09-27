const fileInput = document.getElementById("fileInput");
const filePreview = document.getElementById("filePreview");
const previewSection = document.getElementById("previewSection");
const fileCount = document.getElementById("fileCount");
const clearBtn = document.getElementById("clearBtn");
const organizeBtn = document.getElementById("organizeBtn");
const downloadBtn = document.getElementById("downloadBtn");
const dropZone = document.getElementById("dropZone");
const duplicateBadge = document.getElementById("duplicateBadge");
const resultsSection = document.getElementById("resultsSection");
const resultsMessage = document.getElementById("resultsMessage");
const resultsStats = document.getElementById("resultsStats");
const duplicatesSection = document.getElementById("duplicatesSection");
const duplicatesList = document.getElementById("duplicatesList");
const uploadSection = document.getElementById("organize");
const addMoreBtn = document.getElementById("addMoreBtn");
const resultsDownloadBtn = document.getElementById("resultsDownloadBtn");
const progressSection = document.getElementById("progressSection");
const progressTitle = document.getElementById("progressTitle");
const progressMessage = document.getElementById("progressMessage");
const progressIcon = document.getElementById("progressIcon");
const progressBar = document.getElementById("overallProgressBar");
const progressText = document.getElementById("overallProgressText");
const progressCounter = document.getElementById("progressCounter");
let currentDownloadUrl = "";

let selectedFiles = [];

// ========================================
// Mobile Navigation
// ========================================

const mobileMenuBtn = document.getElementById("mobileMenuBtn");
const navLinks = document.querySelector(".nav-links");

if (mobileMenuBtn && navLinks) {
    mobileMenuBtn.addEventListener("click", () => {
        navLinks.classList.toggle("mobile-open");
        const isOpen = navLinks.classList.contains("mobile-open");
        mobileMenuBtn.textContent = isOpen ? "✕" : "☰";
    });

    // Close menu after clicking a link
    navLinks.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", () => {
            navLinks.classList.remove("mobile-open");
            mobileMenuBtn.textContent = "☰";
        });
    });
}

// ========================================
// File Categories
// ========================================

// NOTE: Must stay synchronized with backend FILE_CATEGORIES in file_classifier.py
function getCategory(extension) {

    const categories = {
        "Images": ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp", "ico", "tiff", "tif", "heic", "heif", "avif", "raw", "cr2", "nef", "arw"],
        "Documents": ["pdf", "doc", "docx", "txt", "rtf", "odt", "tex", "pages"],
        "Spreadsheets": ["xls", "xlsx", "csv", "ods", "numbers"],
        "Presentations": ["ppt", "pptx", "odp", "key"],
        "Code": ["py", "js", "jsx", "ts", "tsx", "java", "c", "cpp", "h", "hpp", "cs", "php", "rb", "go", "rs", "swift", "kt", "dart", "lua", "r", "scala", "sh", "bash", "ps1"],
        "Web": ["html", "htm", "css", "scss", "sass", "less", "vue", "svelte"],
        "Databases": ["sql", "db", "sqlite", "sqlite3", "mdb", "accdb", "bak"],
        "Audio": ["mp3", "wav", "ogg", "flac", "aac", "m4a", "wma", "opus", "midi", "mid"],
        "Videos": ["mp4", "mkv", "avi", "mov", "webm", "flv", "wmv", "m4v", "3gp", "mpg", "mpeg"],
        "Archives": ["zip", "rar", "7z", "tar", "gz", "bz2", "xz", "tgz", "iso"],
        "Executables": ["exe", "msi", "apk", "appimage", "deb", "rpm"],
        "System/Config": ["ini", "cfg", "conf", "toml", "env", "properties", "reg"],
        "Fonts": ["ttf", "otf", "woff", "woff2", "eot"],
        "Design": ["psd", "ai", "eps", "sketch", "fig", "xd"],
        "3D/CAD": ["stl", "obj", "fbx", "blend", "glb", "gltf", "step", "stp", "dwg", "dxf"],
        "eBooks": ["epub", "mobi", "azw", "azw3", "fb2"],
        "Data": ["json", "xml", "yaml", "yml", "parquet", "avro"],
        "Subtitles": ["srt", "ass", "ssa", "vtt", "sub"],
        "Notebooks": ["ipynb"]
    };


    for (const category in categories) {

        if (
            categories[category].includes(extension)
        ) {
            return category;
        }

    }


    return "Other";
}

// ========================================
// File Icons
// ========================================

function getIcon(category) {

    const icons = {

        Images: "🖼️",

        Documents: "📄",

        Spreadsheets: "📊",

        Presentations: "📽️",

        Code: "💻",

        Web: "🌐",

        Databases: "🗄️",

        Audio: "🎵",

        Videos: "🎬",

        Archives: "📦",

        Executables: "⚙️",

        "System/Config": "🔧",

        Fonts: "🔤",

        Design: "🎨",

        "3D/CAD": "🧊",

        eBooks: "📚",

        Data: "📝",

        Subtitles: "💬",

        Notebooks: "🧪",

        Other: "📁",

    };


    return icons[category] || "📁";
}

// ========================================
// Format File Size
// ========================================

function formatSize(bytes) {
    if (bytes < 1024) {
        return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
        return `${(bytes / 1024).toFixed(2)} KB`;
    }

    if (bytes < 1024 * 1024 * 1024) {
        return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    }

    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

// ========================================
// Get File Extension
// ========================================

function getExtension(filename) {
    const lastDot = filename.lastIndexOf(".");

    if (lastDot === -1 || lastDot === filename.length - 1) {
        return "";
    }

    return filename.substring(lastDot + 1).toLowerCase();
}

// ========================================
// Render Selected Files
// ========================================

function renderFiles() {
    filePreview.innerHTML = "";

    if (selectedFiles.length === 0) {
        previewSection.classList.add("d-none");
        uploadSection.classList.remove("d-none");
        organizeBtn.disabled = true;
        return;
    }

    previewSection.classList.remove("d-none");
    uploadSection.classList.add("d-none");
    organizeBtn.disabled = false;

    fileCount.textContent = `${selectedFiles.length} files selected`;

    selectedFiles.forEach((file, index) => {
        const extension = getExtension(file.name);

        const category = getCategory(extension);

        const icon = getIcon(category);

        const card = document.createElement("div");

        card.className = "file-card";

        card.innerHTML = `
      <div class="file-icon">
        ${icon}
      </div>

      <div class="file-info">
        <div class="file-name" title="${escapeHTML(file.name)}">
          ${escapeHTML(file.name)}
        </div>
        <div class="file-size">
          ${extension ? extension.toUpperCase() : "Unknown type"} • ${formatSize(file.size)}
        </div>
      </div>

      <button
        type="button"
        class="btn btn-sm btn-outline-secondary remove-file remove-file-btn"
        data-index="${index}">
        ✕
      </button>
    `;

        filePreview.appendChild(card);
    });
}

// ========================================
// Escape HTML
// Prevents filenames containing HTML
// from being rendered as HTML.
// ========================================

function escapeHTML(value) {
    const div = document.createElement("div");

    div.textContent = value;

    return div.innerHTML;
}

// ========================================
// Select Files
// ========================================

fileInput.addEventListener("change", function() {
    addFiles(fileInput.files);
});

// ========================================
// Add More Files
// ========================================

addMoreBtn.addEventListener("click", () => {
    fileInput.click();
});

// ========================================
// Remove Individual File
// ========================================

filePreview.addEventListener("click", function(event) {
    const button = event.target.closest(".remove-file-btn");

    if (!button) {
        return;
    }

    const index = Number(button.dataset.index);

    selectedFiles.splice(index, 1);

    renderFiles();
});

// ========================================
// Clear All Files
// ========================================

clearBtn.addEventListener("click", function() {
    selectedFiles = [];

    fileInput.value = "";

    renderFiles();
});

// ========================================
// Render Results Statistics
// ========================================

function renderResultsStats(organizeResult) {
    resultsStats.innerHTML = "";

    const results = organizeResult.results || {};

    const categories = new Set(
        Object.values(results)
    );

    const categoriesCount = categories.size;

    const totalCard = document.createElement("div");
    totalCard.className = "stat-card";
    totalCard.innerHTML = `
    <div class="stat-value">${organizeResult.total_files || 0}</div>
    <div class="stat-label">Files</div>
  `;
    resultsStats.appendChild(totalCard);

    const duplicatesCard = document.createElement("div");
    duplicatesCard.className = "stat-card";
    duplicatesCard.innerHTML = `
    <div class="stat-value">${organizeResult.duplicate_count || 0}</div>
    <div class="stat-label">Duplicates</div>
  `;
    resultsStats.appendChild(duplicatesCard);

    const skippedCard = document.createElement("div");
    skippedCard.className = "stat-card";
    skippedCard.innerHTML = `
    <div class="stat-value">${organizeResult.skipped_count ?? 0}</div>
    <div class="stat-label">Skipped</div>
  `;
    resultsStats.appendChild(skippedCard);

    const categoriesCard = document.createElement("div");
    categoriesCard.className = "stat-card";
    categoriesCard.innerHTML = `
    <div class="stat-value">${categoriesCount}</div>
    <div class="stat-label">Categories</div>
  `;
    resultsStats.appendChild(categoriesCard);
}

// ========================================
// Render Duplicate List
// ========================================

function renderDuplicates(duplicateGroups) {
    duplicatesList.innerHTML = "";

    if (!duplicateGroups || Object.keys(duplicateGroups).length === 0) {
        duplicatesSection.classList.add("d-none");
        duplicateBadge.textContent = "0";
        return;
    }

    duplicatesSection.classList.remove("d-none");
    duplicateBadge.textContent = Object.keys(duplicateGroups).length;

    let groupCounter = 1;
    for (const [hash, files] of Object.entries(duplicateGroups)) {
        const item = document.createElement("div");
        item.className = "duplicate-group";

        let filesHtml = files.map(f => `<div class="duplicate-file">${escapeHTML(f)}</div>`).join("");

        item.innerHTML = `
      <div class="duplicate-group-title">🔗 Group ${groupCounter}</div>
      ${filesHtml}
    `;

        duplicatesList.appendChild(item);
        groupCounter++;
    }
}

// ========================================
// Add Files
// ========================================

function addFiles(files) {
    selectedFiles = [...selectedFiles, ...Array.from(files)];

    renderFiles();
    fileInput.value = "";
}

// ========================================
// Drag & Drop
// ========================================

["dragenter", "dragover"].forEach((eventName) => {
    dropZone.addEventListener(eventName, function(event) {
        event.preventDefault();
        event.stopPropagation();

        dropZone.classList.add("drag-over");
    });
});


["dragleave", "drop"].forEach((eventName) => {
    dropZone.addEventListener(eventName, function(event) {
        event.preventDefault();
        event.stopPropagation();

        dropZone.classList.remove("drag-over");
    });
});


dropZone.addEventListener("drop", function(event) {

    const files = event.dataTransfer.files;

    if (!files || files.length === 0) {
        return;
    }

    addFiles(files);
});

// ========================================
// Progress Helpers
// ========================================

function showProgress() {
    progressSection.classList.remove("d-none");
    resultsSection.classList.add("d-none");
}

function setProgress(progress, title, message, icon = "🔄", current = null, total = null) {
    progress = Math.max(0, Math.min(100, progress));

    progressBar.style.width = `${progress}%`;
    progressText.textContent = `${Math.round(progress)}%`;

    progressTitle.textContent = title;
    progressMessage.textContent = message;
    progressIcon.textContent = icon;

    if (current !== null && total !== null) {
        progressCounter.textContent = `${current} / ${total} files`;
    }
}

function setStage(stage, state, statusText) {
    const stageElement = document.querySelector(`.progress-stage[data-stage="${stage}"]`);
    if (!stageElement) return;

    stageElement.classList.remove("active", "complete");

    if (state === "active") stageElement.classList.add("active");
    if (state === "complete") stageElement.classList.add("complete");

    const status = stageElement.querySelector(".stage-info span");
    if (status) status.textContent = statusText;

    const icon = stageElement.querySelector(".stage-icon");
    if (state === "complete" && icon) icon.textContent = "✓";
}

function setOrganizingState(isLoading) {
    if (isLoading) {
        organizeBtn.disabled = true;
        organizeBtn.innerHTML = `
      <span class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
      Organizing Files...
    `;
    } else {
        organizeBtn.disabled = selectedFiles.length === 0;
        organizeBtn.innerHTML = "Organize Files";
    }
}

// ========================================
// Upload Files + Organize
// ========================================

organizeBtn.addEventListener("click", async function() {
    if (selectedFiles.length === 0) {
        alert("Please select at least one file.");
        return;
    }

    setOrganizingState(true);

    try {
        showProgress();
        setStage("upload", "active", "Uploading...");
        setProgress(10, "Uploading Files", "Sending files to DropSort...", "⬆️");

        // --------------------------------
        // Step 1: Upload
        // --------------------------------

        const formData = new FormData();

        selectedFiles.forEach((file) => {
            formData.append("files", file);
        });

        const uploadResponse = await fetch("/upload", {
            method: "POST",
            body: formData,
        });

        if (!uploadResponse.ok) {
            throw new Error(`Upload failed: ${uploadResponse.status}`);
        }

        const uploadResult = await uploadResponse.json();

        if (!uploadResult.success) {
            throw new Error(uploadResult.message);
        }

        const batchId = uploadResult.batch_id;
        console.log("Uploaded files:", uploadResult.files);

        const requestedCount =
            uploadResult.requested_count || selectedFiles.length;

        const uploadedCount =
            uploadResult.uploaded_count || 0;

        setProgress(
            25,
            "Uploading Files",
            `${uploadedCount} / ${requestedCount} files uploaded`,
            "⬆️",
            uploadedCount,
            requestedCount
        );

        if (uploadedCount !== requestedCount) {
            throw new Error(
                `Only ${uploadedCount} of ${requestedCount} files were uploaded.`
            );
        }

        setStage(
            "upload",
            "complete",
            `${uploadedCount} files uploaded`
        );
        setStage("duplicates", "active", "Checking...");
        setProgress(30, "Checking Duplicates", "Comparing file contents...", "♻️");

        // --------------------------------
        // Step 2: Duplicate Detection
        // + Organization
        // --------------------------------

        const duplicateModeElement = document.querySelector('input[name="duplicateMode"]:checked');
        const duplicateMode = duplicateModeElement ? duplicateModeElement.value : "move";

        const organizeResponse = await fetch("/organize", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                duplicate_mode: duplicateMode,
                batch_id: batchId
            })
        });

        if (!organizeResponse.ok) {
            throw new Error(`Organization failed: ${organizeResponse.status}`);
        }

        const organizeResult = await organizeResponse.json();

        if (!organizeResult.success) {
            throw new Error(organizeResult.message);
        }

        console.log("Organization result:", organizeResult.results);
        console.log("Duplicates:", organizeResult.duplicates);
        console.log("Duplicate count:", organizeResult.duplicate_count);

        setStage("duplicates", "complete", "Complete");
        setStage("organizing", "active", "Organizing...");
        setProgress(55, "Organizing Files", "Sorting files into categories...", "📁");

        // --------------------------------
        // Step 3: Show Result
        // --------------------------------
        await new Promise(r => setTimeout(r, 600));

        setStage("organizing", "complete", "Complete");
        setStage("zip", "active", "Creating...");
        setProgress(85, "Creating ZIP", "Building your organized ZIP file...", "📦");

        // Simulate slight delay for zip creation UI effect or wait for real backend
        if (organizeResult.download_ready) {
            await new Promise(r => setTimeout(r, 600));
            setStage("zip", "complete", "Complete");
            setProgress(100, "Organization Complete", "Your organized ZIP is ready.", "🎉");
            progressCounter.textContent = "All files processed successfully";
        }

        const total =
            organizeResult.total_files || 0;

        const uploaded =
            organizeResult.uploaded_files || 0;

        const duplicates =
            organizeResult.duplicate_count || 0;

        const skipped =
            organizeResult.skipped_count || 0;

        resultsMessage.textContent =
            `${total} of ${uploaded} uploaded files were processed • ` +
            `${duplicates} duplicate(s) • ` +
            `${skipped} skipped.`;

        renderResultsStats(organizeResult);
        renderDuplicates(organizeResult.duplicate_groups);

        progressSection.classList.add("d-none");
        resultsSection.classList.remove("d-none");

        if (organizeResult.download_ready) {
            if (downloadBtn) {
                downloadBtn.classList.remove("d-none");
            }
            currentDownloadUrl = organizeResult.download_url;
        }

        resultsSection.scrollIntoView({
            behavior: "smooth",
            block: "start",
        });
    } catch (error) {
        console.error("DropSort Error:", error);
        alert(`Something went wrong:\n\n${error.message}`);
    } finally {
        setOrganizingState(false);
    }
});

// ========================================
// Download Organized ZIP
// ========================================

function downloadZip() {
    if (currentDownloadUrl) {
        window.location.href = currentDownloadUrl;
    }
}

if (downloadBtn) {
    downloadBtn.addEventListener("click", downloadZip);
}

if (resultsDownloadBtn) {
    resultsDownloadBtn.addEventListener("click", downloadZip);
}