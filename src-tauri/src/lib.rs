use serde::Serialize;
use std::path::PathBuf;
use walkdir::WalkDir;

#[derive(Serialize, Clone)]
pub struct MidiFileEntry {
    path: String,
    name: String,
    folder: String,
    size: u64,
}

#[tauri::command]
fn scan_midi_files() -> Vec<MidiFileEntry> {
    let mut results: Vec<MidiFileEntry> = Vec::new();
    let mut dirs_to_scan: Vec<(PathBuf, String)> = Vec::new();

    if let Some(downloads) = dirs::download_dir() {
        dirs_to_scan.push((downloads, "Downloads".to_string()));
    }
    if let Some(music) = dirs::audio_dir() {
        dirs_to_scan.push((music, "Música".to_string()));
    }
    if let Some(documents) = dirs::document_dir() {
        dirs_to_scan.push((documents, "Documentos".to_string()));
    }
    if let Some(desktop) = dirs::desktop_dir() {
        dirs_to_scan.push((desktop, "Desktop".to_string()));
    }

    for (dir, folder_name) in dirs_to_scan {
        if !dir.exists() {
            continue;
        }
        for entry in WalkDir::new(&dir)
            .max_depth(5)
            .follow_links(false)
            .into_iter()
            .filter_map(|e| e.ok())
        {
            let path = entry.path();
            if let Some(ext) = path.extension() {
                let ext_lower = ext.to_string_lossy().to_lowercase();
                if ext_lower == "mid" || ext_lower == "midi" {
                    if let Ok(metadata) = entry.metadata() {
                        let name = path
                            .file_stem()
                            .map(|s| s.to_string_lossy().to_string())
                            .unwrap_or_default();
                        results.push(MidiFileEntry {
                            path: path.to_string_lossy().to_string(),
                            name,
                            folder: folder_name.clone(),
                            size: metadata.len(),
                        });
                    }
                }
            }
        }
    }

    results.sort_by(|a, b| a.name.to_lowercase().cmp(&b.name.to_lowercase()));
    results
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![scan_midi_files])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
