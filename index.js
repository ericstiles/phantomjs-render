var _ = require('underscore'),
    system = require("system");

var folder = "test/";

var urlChecked = [],
    RenderUrlsToFile,
    arrayOfUrls,
    retrieve,
    webpage,
    urlIndex = 0,
    arrayOfUrls = null,
    viewportSize = null,
    currentViewPortIndex = 4;
/**
 * get image description based on current settings
 * @param  {String} url                  current url for the image
 * @param  {Integer} currentViewPortIndex index of the current view port size
 * @return {String}                      name to be used for current file
 */
getFilename = function(url, currentViewPortIndex) {
    var tmpUrlArray = _.compact(url.split('/'));
    return tmpUrlArray[tmpUrlArray.length - 1] + "-" + getViewPortSize(currentViewPortIndex).width + "x" + getViewPortSize(currentViewPortIndex).height + ".png";
};
/**
 * start processing next url in list
 * @param  {[type]}   status         [description]
 * @param  {[type]}   url            [description]
 * @param  {[type]}   file           [description]
 * @param  {[type]}   callbackPerUrl [description]
 * @param  {[type]}   links          [description]
 * @return {Function}                [description]
 */
next = function(status, url, file, callbackPerUrl, links) {
    arrayOfUrls.push.apply(arrayOfUrls, _.difference(_.reject(links, function(checkLink) {
        return !checkLink.match(/localhost/g);
    }), urlChecked, arrayOfUrls));

    console.log("arrayOfUrls after push of links:" + arrayOfUrls.length);

    page.close();
    callbackPerUrl(status, url, file);
    return retrieve();
};
/**
 * update list of array that need to be processed and have been processed
 * @param  {[type]} urls [description]
 * @return {[type]}      [description]
 */
update = function(urls) {
    console.log("arrayOfUrls before shift:" + arrayOfUrls.length);
    console.log("currentViewPortIndex:" + currentViewPortIndex);
    nextViewPortIndexNumber();
    console.log("currentViewPortIndex:" + currentViewPortIndex);
    if (currentViewPortIndex === 0) {
        if (urls.length > 0) {
            urlChecked.push(urls.shift());
            console.log("arrayOfUrls after shift:" + arrayOfUrls.length);
            console.log('urlChecked:' + urlChecked.length);
            return _.last(urlChecked);
        }
        return '';
    } else {
        return _.last(urlChecked);
    }
};
/**
 * get object literal referencing view port dimensions from array of choices
 * @param  {[type]} index [description]
 * @return {[type]}       [description]
 */
getViewPortSize = function(index) {
    return viewportSizes[index];
};
/**
 * Roll through next view port index.  If at end of list, start over with 0;
 * @return {[type]} [description]
 */
nextViewPortIndexNumber = function() {
    currentViewPortIndex++;
    if (currentViewPortIndex >= viewportSizes.length) {
        currentViewPortIndex = 0;
    }
    return currentViewPortIndex;
};
/*
Render given urls
@param array of URLs to render
@param callbackPerUrl Function called after finishing each URL, including the last URL
@param callbackFinal Function called after finishing everything
*/
RenderUrlsToFile = function(urls, callbackPerUrl, callbackFinal) {
    webpage = require("webpage");
    page = null;

    retrieve = function() {
        var url = update(urls);
        if (url) {
            page = webpage.create();
            page.viewportSize = getViewPortSize(currentViewPortIndex);
            page.settings.userAgent = "Phantom.js bot";
            return page.open(url, function(status) {
                var links;
                if (status === "success") {
                    links = page.evaluate(function() {
                        var nodes = [];
                        matches = document.querySelectorAll("a");
                        for (var i = 0; i < matches.length; ++i) {
                            nodes.push(matches[i].href);
                        }
                        return nodes;
                    });
                    return window.setTimeout((function() {
                        page.render(folder + getFilename(url, currentViewPortIndex));
                        return next(status, url, getFilename(url, currentViewPortIndex), callbackPerUrl, links);
                    }), 200);
                } else {
                    return next(status, url, getFilename(url, currentViewPortIndex), callbackPerUrl, links);
                }
            });
        } else {
            return callbackFinal();
        }
    };
    return retrieve();
};

//Start running scripts here.
//Check if arguments are correctly passed
if (system.args.length > 1) {
    arrayOfUrls = Array.prototype.slice.call(system.args, 1);
} else {
    console.log("Usage: phantomjs render_multi_url.js [domain.name1, domain.name2, ...]");
    arrayOfUrls = ['http://localhost'];
    viewportSizes = [{
        width: 600,
        height: 600
    }, {
        width: 800,
        height: 600
    }, {
        width: 1000,
        height: 600
    }, {
        width: 1200,
        height: 600
    }, {
        width: 1400,
        height: 600
    }];
    currentViewPortIndex = viewportSizes.length;
}
//Calling RenderUrlsToFile function
RenderUrlsToFile(arrayOfUrls, (function(status, url, file) {
    if (status !== "success") {
        return console.log("Unable to render '" + url + "'");
    } else {
        return console.log("Rendered '" + url + "' at '" + file + "'");
    }
}), function() {
    console.log('final call back');
    return phantom.exit();
});
