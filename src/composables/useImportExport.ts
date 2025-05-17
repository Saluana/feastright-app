import { db } from './useDexie';
import { exportDB } from 'dexie-export-import';
import download from 'downloadjs';

/**
 * Exports the database to a JSON file and triggers a download
 * @param filename Optional custom filename (without extension)
 */
export const exportDatabase = async (filename: string = 'recipe-db-backup') => {
  try {
    // Export the database to a Blob
    const blob = await exportDB(db, { prettyJson: true });
    
    // Create a timestamp for the filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      .replace('T', '_')
      .split('.')[0];
    
    // Trigger download
    download(
      blob,
      `${filename}-${timestamp}.json`,
      'application/json'
    );
    
    return { success: true };
  } catch (error) {
    console.error('Error exporting database:', error);
    return { success: false, error };
  }
};

/**
 * Imports a database from a file
 * @param file The File object to import from
 * @returns Promise that resolves to an object with success status and optional error
 */
export const importDatabase = async (file: File): Promise<{ success: boolean; error?: Error }> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as ArrayBuffer;
        if (!content) {
          throw new Error('No file content');
        }
        
        // Convert ArrayBuffer to Blob
        const blob = new Blob([content], { type: 'application/json' });
        
        // Import the database
        await db.delete();
        await db.open();
        await db.import(blob, { clearTablesBeforeImport: true });
        
        resolve({ success: true });
      } catch (error) {
        console.error('Error importing database:', error);
        resolve({ success: false, error: error as Error });
      }
    };
    
    reader.onerror = () => {
      const error = new Error('Failed to read file');
      console.error('FileReader error:', error);
      resolve({ success: false, error });
    };
    
    reader.readAsArrayBuffer(file);
  });
};

/**
 * Component helper for file input that triggers import
 * @returns Object with import function and input element props
 */
export const useImportHelper = () => {
  const handleImportClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      return await importDatabase(file);
    };
    
    input.click();
  };
  
  return {
    triggerImport: handleImportClick,
    // For use with v-model on a file input element
    importProps: {
      type: 'file',
      accept: '.json',
      style: 'display: none',
      onChange: (e: Event) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;
        return importDatabase(file);
      },
    },
  };
};