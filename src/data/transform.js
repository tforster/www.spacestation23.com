"use strict";

// System dependencies
import { Transform } from "stream";

/**
 * Transforms and reshapes data into an array of page data objects.
 * - This is custom to the specific implementation and just needs to implement this.transformStream to be WebProducer compliant.
 * - All subsequent logic is the WP CLI, not the WebProducer engine
 *
 * @class WPTransform
 */
class CLITransform {
  /**
   * Creates an instance of WPTransform.
   * @date 2022-02-06
   * @memberof WPTransform
   */
  constructor() {
    // Create an instance of a TransformableStream so that WPTransform can transform the incoming data stream
    this.transformStream = new Transform({
      id: "wpTransform",
      objectMode: true,
      transform: (file, _, done) => {
        done(null, this.transform(file));
      },
    });
  }

  /**
   * transform
   * - The public entry point to this class that returns transformed output
   *
   * @param {object} vinylFile: The Transformer works on a streamed Vinyl file from VinylFS, converted HTTP Response, etc
   * @returns {object}:         The vinylFile with transformed .contents
   * @memberof Transform
   */
  transform(vinylFile) {
    // Extract the expected/required JSON contents
    const transformedData = JSON.parse(vinylFile.contents.toString());
    transformedData.pages = {};

    // Do transformy stuff...

    const episodes = transformedData.feed.items.sort((a, b) =>
      a["airDate"] < b["airDate"] ? 1 : -1
    );
    const latestEpisodes = episodes.slice(0, 3);

    const index = transformedData.uris["/index"];

    // Episodes
    index.latestEpisodes = latestEpisodes;
    index.latestEpisode = episodes[0];
    index.archiveEpisodes = episodes.sort((a, b) =>
      a["airDate"] > b["airDate"] ? 1 : -1
    );

    // Podcast Sources
    index.podcastSources = transformedData.podcastSources;

    transformedData.uris["/index"] = index;

    // RSS Feed
    let feed = transformedData.uris["/feed.xml"];

    feed = transformedData.feed;
    // Apply some more feed-specific processing
    this._feed(feed);

    transformedData.uris["/feed.xml"] = feed;

    // Robots file
    transformedData.uris["/robots.txt"] = {
      ...transformedData.uris["/robots.txt"],
      ...{ prod: process.env.STAGE === "prod" },
    };

    // Replace the original .contents with a restringified version of the new contents
    vinylFile.contents = Buffer.from(JSON.stringify(transformedData), "utf-8");

    // Return the updated Vinyl file
    return vinylFile;
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
   *  - https://validator.w3.org/feed/check.cgi?url=https%3A%2F%2Fwww.stage.spacestation23.com%2Ffeed.xml
   *  - https://castfeedvalidator.com/
   *
   * @param {object} feed:  An object containing metadata describing both the feed and it's children (aka items)
   * @memberof Transform
   */
  _feed(feed) {
    feed.webProducerKey = "pages/feed";
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

      // if (feed.trackerPrefix) {
      //   item.audio.url = `${feed.trackerPrefix}${item.url.replace("https://", "")}`;
      // }
      // TODO: Add support to transofrms via WebProducer for environments (dev, stage, prod) to variabalise properties like this.
      //item.link = `https://www.spacestation23.com${item.slug}`;

      // UTCString() is an iTunes required format
      item.pubDate = new Date(item.airDate).toUTCString();
    });
  }
}

// Create a singleton instance of WPTransform
const cliTransform = new CLITransform();

// Return the transformStream so that it can be accessed in a WritableStream.pipe() call
//module.exports = cliTransform.transformStream;
export default cliTransform.transformStream;
