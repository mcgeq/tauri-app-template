use std::fs;
use std::io::Write;
use std::path::PathBuf;

use chrono::Local;
use tracing_subscriber::fmt::MakeWriter;

pub struct DailyFileWriter {
    dir: PathBuf,
    prefix: String,
}

impl DailyFileWriter {
    pub fn new(dir: PathBuf, prefix: &str) -> Self {
        Self {
            dir,
            prefix: prefix.to_string(),
        }
    }
}

impl<'a> MakeWriter<'a> for DailyFileWriter {
    type Writer = Box<dyn Write>;

    fn make_writer(&'a self) -> Self::Writer {
        let today = Local::now().format("%Y-%m-%d");
        let filename = format!("{}.{}.log", self.prefix, today);
        let path = self.dir.join(filename);

        if fs::create_dir_all(&self.dir).is_err() {
            eprintln!("Failed to create log directory, falling back to stderr");
            return Box::new(std::io::stderr());
        }

        match fs::OpenOptions::new().create(true).append(true).open(&path) {
            Ok(file) => Box::new(file),
            Err(e) => {
                eprintln!("Failed to open log file {path:?}: {e:?}, falling back to stderr");
                Box::new(std::io::stderr())
            }
        }
    }
}
