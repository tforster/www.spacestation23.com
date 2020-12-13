"use strict";
/* eslint-disable no-restricted-syntax */

// Project dependencies

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
    // Cache the global data object for use elsewhere in the class instance
    this.data = rawData;

    return rawData;

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

  /**
   * Creates a text file that can be used as a placeholder in S3 and similar hosts. The targetAddress is later converted to a header
   *
   * @param {object} record:  A WebProducer page record
   * @returns {object}:       A JSON object describing the source, target and type of redirect (currently supports only 301)
   * @memberof Transform
   */
  _redirect(record) {
    record.redirect = 301;
    return record;
  }

  /**
   * Implements the generic questionnaire data set as currently found in Money Script and KMBI forms
   *
   * @param {object} record:  A WebProducer page record
   * @returns
   * @memberof Transform
   */
  _questionnaire(record) {
    // Use [].reduce to flatten the sub arrays
    const questions = record.questions.reduce((acc, group) => {
      // Create a template object with a placeholder for the answer
      const template = {
        groupId: group.id,
        question: "",
        answer: "",
        heading: group.heading,
        explanation: group.explanation,
      };
      // Reduce, aka flatten, the multiple arrays into one
      const flattenedQuestions = group.questions.map((question) => {
        // Get a copy of the template inside this iteration
        const result = { ...template };
        // Assign the iteration specific question
        result.question = question;
        return result;
      });
      return [...acc, ...flattenedQuestions];
    }, []);

    // Reassign the data.questions the new flattened questions array
    record.questions = this.shuffleArray(questions);

    return record;
  }

  _translate(record) {
    // Model specific translators can be added here
    const _translators = {
      feed: () => this.blog.feedTransform(record),
      blog_landing_page: () => this.blog.landingTransform(record),
      post: () => this.blog.postTransform(record),
      sitemap: () => this._sitemap(),
      redirect: () => this._redirect(record),
      kmbi_page: () => this._questionnaire(record),
      money_script_page: () => this._questionnaire(record),
      default: () => record,
    };

    return (_translators[record.modelName] || _translators["default"])(record);
  }

  /**
   * Strips the .html extensions from the record data and references.
   */
  convertRecordToExtensionless(record) {
    record.key = this.stripExtensionFromKey(record.key);
    record.href = this.convertKeyToHref(record.key);

    if (record.pageMeta && record.pageMeta[0]) {
      record.meta = record.pageMeta[0];
      if (record.meta.pageParent) {
        const parent = record.meta.pageParent;
        parent.key = this.stripExtensionFromKey(parent.key);
        parent.href = this.convertKeyToHref(parent.key);
        if (parent.pageMeta && parent.pageMeta[0]) {
          parent.meta = parent.pageMeta[0];
          if (parent.meta.pageChildren) {
            parent.meta.pageChildren.forEach((child) => {
              child.key = this.stripExtensionFromKey(child.key);
              child.href = this.convertKeyToHref(child.key);
              if (child.pageMeta && child.pageMeta[0]) {
                child.meta = child.pageMeta[0];
              }
            });
          }
        }
      }
      if (record.meta.pageChildren) {
        record.meta.pageChildren.forEach((child) => {
          child.key = this.stripExtensionFromKey(child.key);
          child.href = this.convertKeyToHref(child.key);
          if (child.pageMeta && child.pageMeta[0]) {
            child.meta = child.pageMeta[0];
          }
        });
      }
    }

    return record;
  }

  /**
   * Converts the key to the proper href to use, without the trailing index.
   */
  convertKeyToHref(key) {
    if (!key || key.slice(-6) !== "/index") {
      return key;
    }
    return key.replace("/index", "/");
  }

  /**
   * Strips the specified extension from the key provided.
   */
  stripExtensionFromKey(key, extension) {
    extension = extension || ".html";
    if (!key || key.slice(-5) !== extension) {
      return key;
    }
    return key.replace(extension, "");
  }

  /**
   * Shuffles the provided array.
   * @see https://stackoverflow.com/questions/2450954/
   */
  shuffleArray(array) {
    let currentIndex = array.length;
    let temporaryValue;
    let randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }

    return array;
  }
}

module.exports = Transform;
