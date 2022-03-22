export async function readDirectoryEntriesAsync(directoryReader: FileSystemDirectoryReader): Promise<FileSystemEntry[]> {
  let finalOutput: any = [];

  function readEntries(): Promise<number> {
    return new Promise(resolve => {
      directoryReader.readEntries(entries => {
        finalOutput.push(...entries);
        resolve(entries.length);
      });
    })
  }

  let lastEnt = await readEntries();

  while (lastEnt > 0) {
    lastEnt = await readEntries();
  }
  
  return finalOutput;
}

export function fileEntryToFile(file: FileSystemFileEntry): Promise<File> {
  return new Promise(resolve => {
    file.file(f => resolve(f))
  });
}

/**
 * Returns a "directory map" where each key is either the name of a directory
 * or the name of a file. If it's a file, then its value will be a FileEntry.
 * If it's a directory, then its value will be another "directory map" object.
 * Type safety for an object of this kind doesn't seem possible with a standard
 * interface which is why the return type is of type any.
 */
export async function scanDirectory(entry: FileSystemEntry, data: any = {}): Promise<any> {
  if (entry && entry.isDirectory) {
    const directory = entry as FileSystemDirectoryEntry;
    const directoryReader = directory.createReader();

    data[directory.name] = {};
    const entries = await readDirectoryEntriesAsync(directoryReader);
    for (const entry of entries) {
      await scanDirectory(entry, data[directory.name]);
    }
  } else {
    data[entry.name] = entry;
  }

  return data;
}

export async function getFileTypeLines(container: any, extension: string) {
  let totalLines = 0;

  for (const scriptFolder of Object.values(container)) {
    for (const key of Object.keys(scriptFolder as any)) {

      if (key.includes(extension)) {
        const fileEntry = (scriptFolder as any)[key] as FileSystemFileEntry;
        const file = await fileEntryToFile(fileEntry);
        const fileText = await file.text();

        // Regex to split by newlines
        totalLines += fileText.split(/\r\n|\r|\n/).length;
      }

    }
  }

  return totalLines;
}