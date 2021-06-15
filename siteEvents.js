function handleOptionSelected(e){
    const selectedValue = e.target.textContent;
    sites.forEach(site => {
        if (site['url'] == selectedValue) {
            selectedSite = site;
        }
    });
    document.querySelector('.btn').innerHTML = selectedValue;
    document.getElementById('items').disabled = false;
  }
    
function handleEditButton(e){
    const itemText = e.target.closest('li').querySelector('textarea');
    const itemSaveButton = e.target.closest('li').querySelector('.btn-save');
    itemSaveButton.disabled = false;
    itemText.disabled = false;
}

function handleRemoveButton(e){
    const itemRemoveButton = e.target;
    const itemName = e.target.closest('li').querySelector('h4');
    globalItems = globalItems.filter(item => { return item['name'] != itemName.textContent });
    itemRemoveButton.closest('li').remove(); 
}

function handleSaveButton(e){
    const itemSaveButton = e.target;
    const itemName = e.target.closest('li').querySelector('h4');
    const itemText = e.target.closest('li').querySelector('textarea');
    globalItems.forEach((item, index, arr) => {
        if (item['name'] == itemName.textContent) {
            arr[index]['description'] = itemText.textContent;
        }
      }, globalItems);
    itemText.disabled = true;
    itemSaveButton.disabled = true;
}

function handleSaveToFileButton(e){
    saveToFileDialog(globalItems).then( filePath => {
        if (filePath) {
            const csv = new ObjectsToCsv(globalItems);
            csv.toDisk(filePath).then(() => {
                createSavedAlert(filePath);
            });
        }
    })
}