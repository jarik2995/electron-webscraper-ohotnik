const { JSDOM } = require('jsdom');
const { htmlToText } = require('html-to-text');
// const { domainToUnicode } = require('url');
// const { stat } = require('fs');

const sites = [
	{ 
        url: 'https://www.optic4u.ru',
        search: '/catalog/?q=ITEM&s=Поиск'
    }
];
var selectedSite = {};


function setSitesDropdownValues(sites) {
  var dropdown = document.getElementById('sites');
  for(var i = 0; i < sites.length; i++) {
    var opt = createWithAttributes('li', {
      'class': 'option dropdown-item',
      'id': 'option' + (i+1).toString()
    });
    // var opt = document.createElement('li');
    // opt.setAttribute('class', 'option dropdown-item')
    // opt.setAttribute();
    opt.innerHTML = sites[i]['url'];
    appendChilds(dropdown, [opt]);
  }
}

function createItemElement(id) {
  var itemElement = createWithAttributes('li', {
    'class': 'list-group-item align-items-top text-wrap text-break',
    'id': 'item' + (id+1).toString()
  });
  // var itemElement = document.createElement('li');
  // itemElement.setAttribute('class', "list-group-item align-items-top text-wrap text-break");
  // itemElement.setAttribute('id', 'item' + (i+1).toString());
  return itemElement
}

function createHeaderElement(name) {
  var headerElement = createWithAttributes('h4', {
    'class': 'list-group-item-heading'
  });
  // var headerElement = document.createElement('h4');
  // headerElement.setAttribute('class', "list-group-item-heading");
  headerElement.innerHTML = name;
  return headerElement
}

function createContentElement() {
  var contentElement = createWithAttributes('div', {
    'class': 'd-flex justify-content-between'
  });
  // var contentElement = document.createElement("div");
  // contentElement.setAttribute("class", "d-flex justify-content-between");
  return contentElement
}

function createTextElement(text) {
  var textElement = createWithAttributes('textarea', {
    'class': 'list-group-item-text w-100'
  });
  // var textElement = document.createElement('textarea');
  // textElement.setAttribute('class', "list-group-item-text w-100")
  textElement.value = text;
  textElement.disabled = true;
  return textElement
}

function createImageElement(url) {
  var imageElement = createWithAttributes('img', {
    'class': 'image-parent img-fluid px-2',
    'src': url
  });
  // var imageElement = document.createElement('img');
  // imageElement.setAttribute("class", "image-parent img-fluid px-2");
  // imageElement.setAttribute("src", selectedSite['url'] + item['detail']['image'])
  return imageElement
}

function createButtonsElement() {
  var buttonsElement = createWithAttributes('div', {
    'class': 'd-flex justify-content-end'
  });
  // var buttonsElement = document.createElement("div");
  // buttonsElement.setAttribute("class", "d-flex justify-content-end");
  var editButtonElement = createWithAttributes('button', {
    'class': 'btn btn-warning btn-edit ms-1'
  });
  // var editButtonElement = document.createElement("button");
  // editButtonElement.setAttribute("class", "btn btn-warning btn-edit ms-1");
  editButtonElement.innerHTML = "Изменить"
  var removeButtonElement = createWithAttributes('button', {
    'class': 'btn btn-danger btn-remove ms-1'
  });
  // var removeButtonElement = document.createElement("button");
  // removeButtonElement.setAttribute("class", "btn btn-danger btn-remove ms-1");
  removeButtonElement.innerHTML = "Удалить"
  var saveButtonElement = createWithAttributes('button', {
    'class': 'btn btn-success btn-save ms-1'
  });
  // var saveButtonElement = document.createElement("button");
  // saveButtonElement.setAttribute("class", "btn btn-success btn-save ms-1");
  saveButtonElement.innerHTML = "Сохранить"
  saveButtonElement.disabled = true;
  appendChilds(buttonsElement, [editButtonElement, saveButtonElement, removeButtonElement]);
  // buttonsElement.appendChild(editButtonElement);
  // buttonsElement.appendChild(saveButtonElement);
  // buttonsElement.appendChild(removeButtonElement);
  editButtonElement.addEventListener('click', handleEditButton);
  removeButtonElement.addEventListener('click', handleRemoveButton);
  saveButtonElement.addEventListener('click', handleSaveButton);
  return buttonsElement
}

function addItemToParentWindow(parent, item) {
  var itemElement = createItemElement(item['id']);
  var headerElement = createHeaderElement(item['detail']['name']);
  var contentElement = createContentElement();
  var textElement = createTextElement(item['detail']['text']);
  var imageElement = createImageElement(selectedSite['url'] + item['detail']['image']);
  var buttonsElement = createButtonsElement();
  appendChilds(contentElement, [imageElement, textElement]);
  // contentElement.appendChild(imageElement);
  // contentElement.appendChild(textElement);
  appendChilds(itemElement, [headerElement, contentElement, buttonsElement]);
  // itemElement.appendChild(headerElement);
  // itemElement.appendChild(contentElement);
  // itemElement.appendChild(buttonsElement);  
  appendChilds(parent, [itemElement]);
  // elementResult.appendChild(itemElement);
}

function createNotFoundAlert(id, text) {
  var alertElement = createWithAttributes('div', {
    'id': 'notFoundAlert' + id.toString(),
    'class': 'alert alert-danger alert-dismissible fade show m-0',
    'role': 'alert'
  });
  // var buttonElement = createWithAttributes('button', {
  //   'class': 'btn-close',
  //   'data-bs-dismiss': 'alert',
  //   'aria-label': 'Close'
  // });
  alertElement.innerHTML = 'Не найден товар: ' + text;
  // setTimeout(function () { 
  //   var intervalID = setInterval(function () {
  //     if (!alertElement.style.opacity) {
  //       alertElement.style.opacity = 1;
  //     }   
  //     if (alertElement.style.opacity > 0) {
  //       alertElement.style.opacity -= 0.1;
  //     } 
  //     else {
  //         clearInterval(intervalID);
  //     }
  //   },200);
  // }, 5000);
  // alertElement.appendChild(buttonElement);
  document.body.prepend(alertElement);
}

function SearchItems(e) {          
  var items = document.getElementById('items').value.replace(/^\s+\n|^\n|^\s+$/gm,'').replace(/\r\n/g,'\n').split('\n');
  items = items.filter(i => {
    return i != ""
  });
  var elementResult = document.getElementById('result');
  if (items.length != 0) {
    setButtonLoad(e.target, true);
  }
  for(var i = 0; i < items.length; i++) {
      getItemLink(i, items[i], selectedSite).then(item => {
          getItemDetail(item, selectedSite).then(item => {
            if (item['found']) {
              addItemToParentWindow(elementResult, {id: item['id'], detail: item});
            }
            else {
              createNotFoundAlert(item['id'], item['name']);
              //var bsAlert = new bootstrap.Alert(myAlert)
            }
            if (item['id'] >= items.length-1) {
              setButtonLoad(e.target, false);
            }
          });
      });
  }
}

setSitesDropdownValues(sites);
document.querySelector(".dropdown-menu li").addEventListener('click', handleOptionSelected);
document.getElementById('loadButton').addEventListener('click', SearchItems);