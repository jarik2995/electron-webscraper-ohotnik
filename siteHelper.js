function setButtonLoad(button, status) {
    if (status) {
        button.innerHTML = button.getAttribute('data-loading-text') + button.innerHTML;
        button.disabled = true;
    }
    else {
        const re = new RegExp(button.getAttribute('data-loading-text').replace(/'/g,'"'),'g');
        button.disabled = false;
        button.innerHTML = button.innerHTML.replace(re,'');
    }
}

function createWithAttributes(name, attributes) {
    var el = document.createElement(name);
    Object.entries(attributes).forEach(a => {
      const [key, value] = a;
      el.setAttribute(key, value);
    });
    return el;
  }
  
function appendChilds(parent, childs) {
    childs.forEach(child => {
        parent.appendChild(child);
    });
}

function convertHTMLToText(html) {
    // get table names from caption
    html.querySelectorAll('caption').forEach(el => {
      var cellColSpan = Math.max(el.parentElement.querySelector('tr td').colSpan, el.parentElement.querySelector('tr').cells.length);
      var row = el.parentElement.insertRow(0);
      var cell = row.insertCell(0);
      cell.colSpan = cellColSpan;
      cell.innerHTML = el.innerHTML;
    });
    return htmlToText(html.innerHTML, {
      wordwrap: false,
      tables: true,
      tags: {
        'a': { 
          format: 'anchor',
          options: { baseUrl: null, hideLinkHrefIfSameAsText: false, ignoreHref: true, noAnchorUrl: true, noLinkBrackets: false } },
        'br': { format: 'skip' },
        'img': { format: 'skip' },
        'p': { options: { leadingLineBreaks: 2, trailingLineBreaks: 2, trimEmptyLines: true } },
        'pre': { options: { leadingLineBreaks: 1, trailingLineBreaks: 1 } },
        'table': { options: { maxColumnWidth: 10000, leadingLineBreaks: 2, trailingLineBreaks: 2} }
      }
    })
    .replace(/^\s+\n/gm,'\n').replace(/^\s\s+/gm,' ').replace(/\s{5,}/gm,': ').replace(/ {3,}/gm,', ')
  }

async function getItemLink(id, item, site) {
    const response = await fetch(site['url'] + site['search'].replace(/ITEM/g,item));
    const text = await response.text();
    const dom = await new JSDOM(text);
    const foundItem = dom.window.document.querySelector('div.catalog_item div.item-title a');
    var link = null
    var found = false;
    if (foundItem) {
      link = foundItem.getAttribute('href');
      found = true;
    }
    return {
        'id': id,
        'name': item,
        'link': link,
        'found': found
    }
  }


async function getItemDetail(item, site) {
    if (item['found']) {
      const response = await fetch(site['url'] + item['link']);
      const text = await response.text();
      const dom = await new JSDOM(text);
      const image = dom.window.document.querySelector('div.item_main_info a img').getAttribute('src');
      const itext = dom.window.document.querySelector('div.detail_text');
      item['image']=image;
      item['text']=convertHTMLToText(itext);
    }
    return item
}