"use strict";
/* eslint-disable no-restricted-syntax */

// Project dependencies
const data = require("../../src/data/data.json");

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
    const transformedData = rawData;

    const episodes = rawData.feed.items.sort((a, b) => (a["airDate"] < b["airDate"] ? 1 : -1));
    const latestEpisodes = episodes.slice(0, 3);
    //const episodes = [];
    // The CosmicJS specific query returns a series of "objects" under a parent called getBucket. Pivot into an array of slugs.

    // rawData.getBucket.objects.forEach((obj) => {
    //   if (obj.modelName != "episodes") {
    //     transformedData[`/${obj.slug}`] = obj;
    //   } else {
    //     // Episodic data is found in getBucket.object[modelName=episodes]. Create an array the home page can use to render episodes.
    //     //episodes.push(obj);
    //   }
    // });

    // Episodes
    transformedData["/index"].latestEpisodes = latestEpisodes;
    transformedData["/index"].latestEpisode = episodes[0];
    transformedData["/index"].archiveEpisodes = episodes.sort((a, b) => (a["airDate"] > b["airDate"] ? 1 : -1));

    // Podcast Sources
    transformedData["/index"].podcastSources = data.podcastSources;

    // RSS Feed
    transformedData["/feed.xml"] = data.feed;
    this._feed(transformedData["/feed.xml"]);

    return transformedData;
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

  /**
   * The RSS feed and it's item children have very specific requirements to pass feed validation and be accepted by iTunes
   * - Note that we do hand construct some XML here. If the feed changes often and drastically we may want to consider adding an XML
   *   parser module to eliminate human hand-coding errors. But that will add a lot of weight in Kb.
   * - Can be validated with:
   *  - https://validator.w3.org/feed/
   *  - https://castfeedvalidator.com/
   *
   * @param {object} feed:  An object containing metadata describing both the feed and it's children (aka items)
   * @memberof Transform
   */
  _feed(feed) {
    feed.modelName = "feed";
    // Sub categories have to be converted to nested xml itunes:category elements and look something like
    //
    // "categories": {
    //   "Society &amp; Culture": [
    //     "Documentary",
    //   ],
    //   "Health": [
    //     "Mental Health"
    //   ]
    // },
    //
    // <itunes:category text="Society &amp; Culture">
    //   <itunes:category text="Documentary" />
    // </itunes:category>
    // <itunes:category text="Health">
    //   <itunes:category text="Mental Health" />
    // </itunes:category>
    let tmpCategories = "";
    for (const category in feed.categories) {
      tmpCategories += `<itunes:category text="${category}">`;
      feed.categories[category].forEach((sub) => {
        tmpCategories += `<itunes:category text="${sub}" />`;
      });
      tmpCategories += "</itunes:category>";
    }

    // Replace feed.categories with new XML string
    feed.categories = tmpCategories;

    // The feed has an itunes:explicit tag and so do the items
    feed.explicit = feed.explicit ? "yes" : "no";

    // Transform the child items as required
    feed.items.forEach((item) => {
      item.explicit = item.explicit ? "yes" : "no";

      if (feed.trackerPrefix) {
        item.audio.url = `${feed.trackerPrefix}${item.url.replace("https://", "")}`;
      }
      // TODO: Add support to transofrms via WebProducer for environments (dev, stage, prod) to variabalise properties like this.
      //item.link = `https://www.rememberthispodcast.com${item.slug}`;

      // UTCString() is an iTunes required format
      item.pubDate = new Date(item.airDate).toUTCString();
    });
  }
}

module.exports = Transform;
