const { JSDOM } = require('jsdom');
const { htmlToText } = require('html-to-text');
const puppeteer = require('puppeteer');
const ObjectsToCsv = require('objects-to-csv');

const sites = [
	{ 
    url: 'https://www.optic4u.ru',
    search: '/catalog/?q=ITEM',
    proxy: '',
    itemLinkSelector: 'div.catalog_item div.item-title a',
    itemLinkAttribute: 'href',
    itemImageSelector: 'div.item_main_info a img',
    itemImageAttribute: 'src',
    itemContentSelector: 'div.detail_text'
  },
  {
    url: 'https://quarta-hunt.ru',
    search: '/catalog/?q=ITEM',
    proxy: '',
    itemLinkSelector: 'div.catalog-item a',
    itemLinkAttribute: 'href',
    itemImageSelector: 'div.gallery-img a img',
    itemImageAttribute: 'src',
    itemContentSelector: 'div.tab-content'
  },
  {
    url: 'https://avantmarket.ru',
    search: '/search/?q=ITEM',
    proxy: 'https://api.allorigins.win/raw?url=',
    itemLinkSelector: 'div.search-item a',
    itemLinkAttribute: 'href',
    itemImageSelector: 'div.catalog-element-gallery-pictures a',
    itemImageAttribute: 'href',
    itemContentSelector: 'div.catalog-element-section'
  }
];
var selectedSite = {};
var globalItems = [];

function setSitesDropdownValues(sites) {
  var dropdown = document.getElementById('sites');
  for(var i = 0; i < sites.length; i++) {
    var opt = createWithAttributes('li', {
      'class': 'option dropdown-item',
      'id': 'option' + (i+1).toString()
    });
    opt.innerHTML = sites[i]['url'];
    appendChilds(dropdown, [opt]);
  }
}

function createItemElement(id) {
  var itemElement = createWithAttributes('li', {
    'class': 'list-group-item align-items-top text-wrap text-break',
    'id': 'item' + (id+1).toString()
  });
  return itemElement
}

function createHeaderElement(name) {
  var headerElement = createWithAttributes('h4', {
    'class': 'list-group-item-heading'
  });
  headerElement.innerHTML = name;
  return headerElement
}

function createContentElement() {
  var contentElement = createWithAttributes('div', {
    'class': 'd-flex justify-content-between'
  });
  return contentElement
}

function createTextElement(text) {
  var textElement = createWithAttributes('textarea', {
    'class': 'list-group-item-text w-100'
  });
  textElement.value = text;
  textElement.disabled = true;
  return textElement
}

function createImageElement(url) {
  var imageElement = createWithAttributes('img', {
    'class': 'image-parent img-fluid px-2',
    'src': url,
    'style': 'width: 250px; height: auto;'
  });
  return imageElement
}

function createButtonsElement() {
  var buttonsElement = createWithAttributes('div', {
    'class': 'd-flex justify-content-end'
  });
  var editButtonElement = createWithAttributes('button', {
    'class': 'btn btn-warning btn-edit ms-1'
  });
  editButtonElement.innerHTML = "Изменить"
  var removeButtonElement = createWithAttributes('button', {
    'class': 'btn btn-danger btn-remove ms-1'
  });
  removeButtonElement.innerHTML = "Удалить"
  var saveButtonElement = createWithAttributes('button', {
    'class': 'btn btn-success btn-save ms-1'
  });
  saveButtonElement.innerHTML = "Сохранить"
  saveButtonElement.disabled = true;
  appendChilds(buttonsElement, [editButtonElement, saveButtonElement, removeButtonElement]);
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
  appendChilds(itemElement, [headerElement, contentElement, buttonsElement]);
  appendChilds(parent, [itemElement]);
}

function fadeEffect(el) {
  setTimeout(function () { 
    var intervalID = setInterval(function () {
      if (!el.style.opacity) {
        el.style.opacity = 1;
      }   
      if (el.style.opacity > 0) {
        el.style.opacity -= 0.1;
      } 
      else {
          clearInterval(intervalID);
      }
    },200);
  }, 5000);
}

function createSavedAlert(filename) {
  var alertBox = document.getElementById('alertBox');
  var alertElement = createWithAttributes('div', {
    'id': 'savedAlert',
    'class': 'alert alert-success alert-dismissible fade show m-0',
    'role': 'alert'
  });
  var buttonElement = createWithAttributes('button', {
    'class': 'btn-close',
    'data-bs-dismiss': 'alert',
    'aria-label': 'Close'
  });
  alertElement.innerHTML = 'Успешно сохранено в ' + filename;
  fadeEffect(alertElement);
  alertElement.appendChild(buttonElement);
  alertBox.prepend(alertElement);
}

function createNotFoundAlert(id, text) {
  var alertBox = document.getElementById('alertBox');
  var alertElement = createWithAttributes('div', {
    'id': 'notFoundAlert' + id.toString(),
    'class': 'alert alert-danger alert-dismissible fade show m-0',
    'role': 'alert'
  });
  var buttonElement = createWithAttributes('button', {
    'class': 'btn-close',
    'data-bs-dismiss': 'alert',
    'aria-label': 'Close'
  });
  alertElement.innerHTML = 'Не найден товар: ' + text;
  fadeEffect(alertElement);
  alertElement.appendChild(buttonElement);
  alertBox.prepend(alertElement);
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
              globalItems.push({'name': item['name'], 'image': selectedSite['url']+item['image'], 'description': item['text']});
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
document.querySelectorAll(".dropdown-menu li").forEach(el => { el.addEventListener('click', handleOptionSelected) });
document.getElementById('loadButton').addEventListener('click', SearchItems);
document.getElementById('saveToFileButton').addEventListener('click', handleSaveToFileButton);