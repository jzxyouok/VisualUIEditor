'use strict';

/**
 * @module ResMgr
 */
let ResMgr = {};
module.exports = ResMgr;

// requires
const Console = require('../../console');

let _cachedResources = {};

// ==========================
// exports
// ==========================

ResMgr.getResource = function ( url ) {
  return _cachedResources[url];
};

// stylesheet

ResMgr.importStylesheet = function ( url ) {
  let cached = _cachedResources[url];
  if ( cached !== undefined ) {
    return new Promise(function(fulfill) {
      fulfill(cached);
    });
  }

  return _loadResourcePromise(url).then(
    _cacheStylesheet.bind(this, url),
    _cacheStylesheet.bind(this, url, undefined)
  );
};

ResMgr.importStylesheets = function ( urls ) {
  if ( !Array.isArray(urls) ) {
    Console.error('The parameter must be array');
    return;
  }

  let promises = [];
  for (let i = 0; i < urls.length; ++i) {
    let url = urls[i];
    promises.push(ResMgr.importStylesheet(url));
  }
  return Promise.all(promises);
};

// script

ResMgr.importScript = function ( url ) {
  let cached = _cachedResources[url];
  if ( cached !== undefined ) {
    return new Promise(function(fulfill) {
      fulfill(cached);
    });
  }

  return _loadResourcePromise(url).then(
    _evaluateAndCacheScript.bind(this, url),
    _evaluateAndCacheScript.bind(this, url, undefined)
  );
};

ResMgr.importScripts = function ( urls ) {
  if ( !Array.isArray(urls) ) {
    Console.error('The parameter must be array');
    return;
  }

  let promises = [];
  for (let i = 0; i < urls.length; ++i) {
    let url = urls[i];
    promises.push(ResMgr.importScript(url));
  }
  return Promise.all(promises);
};

// template
// TODO: load template with data, get cache first

ResMgr.importTemplate = function (url) {
  let cached = _cachedResources[url];
  if ( cached !== undefined ) {
    return new Promise(function(fulfill) {
      fulfill(cached);
    });
  }

  return _loadResourcePromise(url).then(
    _cacheResource.bind(this, url),
    _cacheResource.bind(this, url, undefined)
  );
};

// other resources

ResMgr.importResource = function (url) {
  let cached = _cachedResources[url];
  if ( cached !== undefined ) {
    return new Promise(function(fulfill) {
      fulfill(cached);
    });
  }

  return _loadResourcePromise(url).then(
    _cacheResource.bind(this, url),
    _cacheResource.bind(this, url, undefined)
  );
};

// ==========================
// Internal
// ==========================

function _loadResourcePromise (url) {
  return new Promise(load);

  function load (fulfill, reject) {
    let xhr = new window.XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.onreadystatechange = onreadystatechange;
    xhr.send(null);

    function onreadystatechange(e) {
      if (xhr.readyState !== 4) {
        return;
      }

      // Testing harness file:/// results in 0.
      if ([0, 200, 304].indexOf(xhr.status) === -1) {
        reject(
          new Error(
            `While loading from url ${url} server responded with a status of ${xhr.status}`
          )
        );
      } else {
        fulfill(e.target.response);
      }
    }
  }
}

// DISABLE
// function _importHTMLPromise ( url ) {
//   return new Promise(load);
//   function load (fulfill, reject) {
//     let link = document.createElement('link');
//     link.rel = 'import';
//     link.href = url;
//     link.onload = function () {
//       fulfill(this);
//     };
//     link.onerror = function () {
//       reject(
//         new Error(
//           `Error loading import: ${url}`
//         )
//       );
//     };
//     document.head.appendChild(link);
//   }
// }

function _cacheResource (url, content) {
  if ( content === undefined ) {
    Console.error(`Failed to load stylesheet: ${url}`);
    _cachedResources[url] = undefined;
    return;
  }

  _cachedResources[url] = content;

  return content;
}

function _cacheStylesheet (url, content) {
  if ( content === undefined ) {
    Console.error(`Failed to load stylesheet: ${url}`);
    _cachedResources[url] = undefined;
    return;
  }

  content = content + `\n//# sourceURL=${url}`;
  _cachedResources[url] = content;

  return content;
}

function _evaluateAndCacheScript (url, content) {
  if ( content === undefined ) {
    Console.error(`Failed to load script: ${url}`);
    _cachedResources[url] = undefined;
    return;
  }

  content = content + `\n//# sourceURL=${url}`;

  let result = window.eval(content);
  _cachedResources[url] = result;

  return result;
}
