/**
 *  kpID plugin for Movian
 *
 *  Copyright (C) 2019 
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
//ver 0.0.1

//OWw9fBx2ZM

// parsit plugin.json
var plugin = JSON.parse(Plugin.manifest);
var PREFIX = plugin.id;
var LOGO = Plugin.path + plugin.icon;
var UA = 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.87 Safari/537.36';

var page = require('movian/page');
var http = require('movian/http');
var html = require("movian/html");

// Create the service (ie, icon on home screen)
// Landing page
require('movian/itemhook').create({
  title: "Search at kpID",
  itemtype: "video",
  handler: function (obj, nav) {
    var title = obj.metadata.title.toString();
    title = title.replace(/<.+?>/g, "").replace(/\[.+?\]/g, "");
    nav.openURL(PREFIX + ":search:" + title);
  }
});

new page.Route(PREFIX + ":search:(.*)", search);

page.Searcher(PREFIX + " - Result", LOGO, search);

function search(page, query) {
  page.metadata.icon = LOGO;
  page.entries = 0;
  page.loading = true;
  page.model.contents = 'grid';
  page.type = 'directory';
  page.entries = 0;
  //https://www.kinopoisk.ru/index.php?level=7&from=forma&result=adv&m_act%5Bfrom%5D=forma&m_act%5Bwhat%5D=content&m_act%5Bfind%5D=the+boys
  res = http.request('https://www.kinopoisk.ru/s/type/film/list/1/find/' + encodeURIComponent(query), {//, {query.replace(/ /g, '+') + '/', {
    method: 'GET',
    headers: {
      'User-Agent': UA,
    },
    debug: 1,
    noFail: true,
  }, null).toString();
  //
  dom = html.parse(res).root;
  list = ScrapeList(dom);
  populateItemsFromList(page, list);

  page.loading = false;
};

function ScrapeList(dom) {
  var returnValue = [];
  //document.getElementsByClassName('search-page')
  content = dom.getElementByClassName('search_results search_results_last')[0];
  if ((elements = dom.getElementByClassName('element'))) {
    for (i = 0; i < elements.length; i++) {
      element = elements[i];
      //document.getElementsByClassName('element')[0].getElementsByClassName('pic')[0].getElementsByTagName('a')[0].attributes.
      kp_id = element.getElementByClassName('pic')[0].getElementByTagName('a')[0].attributes.getNamedItem('data-id').value
      returnValue.push({
        kp_id: kp_id,
        url: element.getElementByClassName('pic')[0].getElementByTagName('a')[0].attributes.getNamedItem('data-url').value,
        icon: 'https://st.kp.yandex.net/images/film_iphone/iphone360_' + kp_id + '.jpg',
        title: element.getElementByClassName('name')[0].children[0].textContent,
        //year: +element.getElementByClassName('b-content__inline_item-link')[0].children[1].textContent.match(/^\d+/)
        // description: element.getElementByClassName("b-content__inline_item-link")[0].children[1].textContent
      });
    }
  }
  //endOfData = document.getElementsByClassName('navigation').length ? document.getElementsByClassName('pagesList')[0].children[document.getElementsByClassName('pagesList')[0].children.length - 2].nodeName !== 'A' : true
  //document.getElementsByClassName('pagination').length ? document.getElementsByClassName('pagination')[0].getElementsByTagName('a')[document.getElementsByClassName('pagination')[0].getElementsByTagName('a').length - 2].attributes.length > 1 : true
  //!document.getElementsByClassName('navibut')[0].children[1].getElementsByTagName('a').length
  // if (pageHtml.dom.getElementByClassName("nnext").length !== 0) {
  //     returnValue.endOfData = !pageHtml.dom.getElementByClassName("nnext")[0].getElementByTagName("a").length;
  // } else returnValue.endOfData = true;
  if ((navigation = dom.getElementByClassName('b-navigation')[0])) {
    returnValue.endOfData = navigation.children[navigation.children.length - 1].attributes[0].value == 'no-page';
  } else returnValue.endOfData = true;
  return returnValue;
};

function populateItemsFromList(page, list) {
  page.entries = 0;
  for (i = 0; i < list.length; i++) {
    page.appendItem('yo:search:' + list[i].kp_id, 'video', {
      title: list[i].title,
      description: list[i].description,
      icon: list[i].icon
    });
    page.entries++;
  }
};