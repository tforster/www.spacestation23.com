"use strict";
/* eslint-disable no-restricted-syntax */

// Project dependencies
let episodes = require("../../src/data/data.json");

/**
 * Transforms and reshapes data into an array of page data objects
 * - The Transform module is customised to the WebProducer instance and is loaded dynamically from the data/meta folder.
 * - The constructor is required to enable breakpoint debugging. Toggle using WebProducer.main(debugTransform).
 * - Custom transformation logic should be placed in transform()
 * - Helper methods and properties can be created if required
 *
 * @class Transform
 */
class Transform {
  /**
   * Creates an instance of Transform.
   *
   * @param {boolean} [debugTransform=false]: Set true to improve debugging experience
   * @memberof Transform
   */
  constructor(debugTransform = false) {
    if (debugTransform) {
      // Set your breakpoints before resuming
      debugger;
    }
  }

  /**
   * transform
   * - The public entry point to this class that returns transformed output
   *
   * @param {object} rawData: The raw data received from the data provider (e.g. GraphQL, REST, static JSON, etc)
   * @returns {object}:       A dictionary of resources each referenced by it's unique key or URL
   * @memberof Transform
   */
  transform(rawData) {
    const transformedData = {};
    episodes = episodes.sort((a, b) => (a["Air Date"] < b["Air Date"] ? 1 : -1));
    const recentEpisodes = episodes.slice(1, 4);
    //const episodes = [];
    // The CosmicJS specific query returns a series of "objects" under a parent called getBucket. Pivot into an array of slugs.

    rawData.getBucket.objects.forEach((obj) => {
      if (obj.modelName != "episodes") {
        transformedData[`/${obj.slug}`] = obj;
      } else {
        // Episodic data is found in getBucket.object[modelName=episodes]. Create an array the home page can use to render episodes.
        //episodes.push(obj);
      }
    });

    transformedData["/index"].recentEpisodes = recentEpisodes;
    transformedData["/index"].latestEpisode = episodes[0];
    transformedData["/index"].archiveEpisodes = episodes.sort((a, b) => (a["Air Date"] > b["Air Date"] ? 1 : -1));

    return transformedData;

    // Create placeholder objects for transformed resources as well as common/global resources
    this.transformed = { common: [] };

    // Iterate the mixed data types (arrays, objects, etc) and normalise into an array of objects each containing a single resource
    for (const iterator in rawData) {
      const datum = rawData[iterator];
      if (Array.isArray(datum)) {
        // Flatten the array of items into the final transformed result
        let record = datum.length;
        while (record--) {
          //for (let record = 0; record < datum.length; record++) {
          addToTransformedResult(datum[record]);
        }
      } else if (datum) {
        addToTransformedResult(datum);
      }
    }

    // // Call Blog class methods to perform additional data manipulation to create a landing page, category pages and feed.xml
    // this.blog.finalise();
    // this.transformed[this.blog.landingPage.key] = this.blog.landingPage;
    // this.transformed[this.blog.feed.key] = this.blog.feed;
    // this.transformed = {
    //   ...this.transformed,
    //   ...this.blog.categoryLandingPages,
    //   ...this.blog.postPages,
    // };

    return this.transformed;
  }

  /**
   * Adds an sitemap object that includes information about every page
   *
   * @param {object} data:  The WebProducer data set containing pages, redirects, posts, etc
   * @returns {object}:     A JSON representation of an XML sitemap
   * @memberof Transform
   */
  _sitemap() {
    // Shortcut this.data
    const data = this.data;

    // Assign locs to the object that already contains _modelApiKey, etc
    data.locs = data.allPages.map((page) => {
      // Create a loc string consisting of the host plus page key
      let loc = data.host + page.key;

      // Strip trailing .html extension since we're extensionless by design
      loc = loc.replace(/\.html$/, "");

      // Skip pages that haven't been published
      if (!page._publishedAt) {
        return;
      }
      return {
        loc,
        // Sitemap.xml specifies date in format yyyy-mm-dd so trim THH:mm:ss
        lastmod: page._publishedAt.slice(0, 10),
      };
    });

    return data;
  }
}

module.exports = Transform;
