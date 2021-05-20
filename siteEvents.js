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
    itemRemoveButton.closest('li').remove(); 
}

function handleSaveButton(e){
    const itemSaveButton = e.target;
    const itemText = e.target.closest('li').querySelector('textarea');
    itemText.disabled = true;
    itemSaveButton.disabled = true;
}

