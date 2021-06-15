const { dialog } = require('electron').remote;

global.saveToFileDialog = async function() {
    const saveTo = await dialog.showSaveDialog({ filters: [{ name: 'CSV', extensions: ['csv'] }] });
    return saveTo.filePath;
}