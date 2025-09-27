import { WebFeature } from '../types';
import { baselineFeatures } from './baseline-features';

// Comprehensive web features data with real browser support information
// Generated from baseline compatibility data and real browser support matrices
export const webFeaturesData: Record<string, WebFeature> = {
  'css-has-selector': {
    id: 'css-has-selector',
    name: ':has() CSS selector',
    description: 'The :has() CSS pseudo-class represents an element if any of the relative selectors match when anchored against this element.',
    baseline: {
      status: 'newly',
      since: '2023-12'
    },
    browser_support: {
      chrome: '105',
      firefox: '121',
      safari: '15.4'
    },
    mdn_url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/:has'
  },
  'css-focus-visible': {
    id: 'css-focus-visible',
    name: ':focus-visible CSS selector',
    description: 'The :focus-visible pseudo-class applies while an element matches the :focus pseudo-class and the UA determines via heuristics that the focus should be made evident on the element.',
    baseline: {
      status: 'newly',
      since: '2023-03'
    },
    browser_support: {
      chrome: '86',
      firefox: '85',
      safari: '15.4'
    },
    mdn_url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/:focus-visible'
  },
  'clipboard-api': {
    id: 'clipboard-api',
    name: 'Clipboard API',
    description: 'The Clipboard API provides the ability to respond to clipboard commands (cut, copy, and paste) as well as to asynchronously read from and write to the system clipboard.',
    baseline: {
      status: 'limited'
    },
    browser_support: {
      chrome: '76',
      firefox: '127',
      safari: '13.1'
    },
    mdn_url: 'https://developer.mozilla.org/en-US/docs/Web/API/Clipboard_API'
  },
  'file-system-access': {
    id: 'file-system-access',
    name: 'File System Access API',
    description: 'The File System Access API allows web apps to read or save changes directly to files and folders on the user\'s device.',
    baseline: {
      status: 'limited'
    },
    browser_support: {
      chrome: '86',
      edge: '86'
    },
    mdn_url: 'https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API'
  },
  'view-transitions': {
    id: 'view-transitions',
    name: 'View Transitions API',
    description: 'The View Transitions API provides a mechanism for easily creating animated transitions between different DOM states.',
    baseline: {
      status: 'limited'
    },
    browser_support: {
      chrome: '111'
    },
    mdn_url: 'https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API'
  },
  'web-share': {
    id: 'web-share',
    name: 'Web Share API',
    description: 'The Web Share API provides a mechanism for sharing text, links, files, and other content to an arbitrary destination of the user\'s choice.',
    baseline: {
      status: 'limited'
    },
    browser_support: {
      chrome: '89',
      safari: '14'
    },
    mdn_url: 'https://developer.mozilla.org/en-US/docs/Web/API/Web_Share_API'
  },
  'dialog-element': {
    id: 'dialog-element',
    name: 'HTML Dialog Element',
    description: 'The HTML <dialog> element represents a dialog box or other interactive component.',
    baseline: {
      status: 'newly',
      since: '2022-03'
    },
    browser_support: {
      chrome: '37',
      firefox: '98',
      safari: '15.4'
    },
    mdn_url: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dialog'
  },
  'css-container-queries': {
    id: 'css-container-queries',
    name: 'CSS Container Queries',
    description: 'Container queries enable you to apply styles to an element based on the size of the element\'s container.',
    baseline: {
      status: 'newly',
      since: '2023-02'
    },
    browser_support: {
      chrome: '105',
      firefox: '110',
      safari: '16'
    },
    mdn_url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Container_Queries'
  },
  'css-oklch-color': {
    id: 'css-oklch-color',
    name: 'OKLCH Color Syntax',
    description: 'The oklch() functional notation expresses a given color in the OKLCH color space.',
    baseline: {
      status: 'newly',
      since: '2023-08'
    },
    browser_support: {
      chrome: '111',
      firefox: '113',
      safari: '15.4'
    },
    mdn_url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/oklch'
  },
  'css-color-mix': {
    id: 'css-color-mix',
    name: 'CSS color-mix() Function',
    description: 'The color-mix() functional notation takes two color values and returns the result of mixing them in a given colorspace.',
    baseline: {
      status: 'newly',
      since: '2023-06'
    },
    browser_support: {
      chrome: '111',
      firefox: '113',
      safari: '16.2'
    },
    mdn_url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/color-mix'
  },
  'css-accent-color': {
    id: 'css-accent-color',
    name: 'CSS accent-color Property',
    description: 'The accent-color CSS property sets the accent color for user-interface controls generated by some elements.',
    baseline: {
      status: 'newly',
      since: '2022-03'
    },
    browser_support: {
      chrome: '93',
      firefox: '92',
      safari: '15.4'
    },
    mdn_url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/accent-color'
  },
  'css-backdrop-filter': {
    id: 'css-backdrop-filter',
    name: 'CSS backdrop-filter Property',
    description: 'The backdrop-filter CSS property lets you apply graphical effects such as blurring or color shifting to the area behind an element.',
    baseline: {
      status: 'newly',
      since: '2022-03'
    },
    browser_support: {
      chrome: '76',
      firefox: '103',
      safari: '9'
    },
    mdn_url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/backdrop-filter'
  },
  'css-scroll-behavior': {
    id: 'css-scroll-behavior',
    name: 'CSS scroll-behavior Property',
    description: 'The scroll-behavior CSS property sets the behavior for a scrolling box when scrolling is triggered by the navigation or CSSOM scrolling APIs.',
    baseline: {
      status: 'newly',
      since: '2022-03'
    },
    browser_support: {
      chrome: '61',
      firefox: '36',
      safari: '15.4'
    },
    mdn_url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-behavior'
  },
  // Additional modern JavaScript features
  'intersection-observer': {
    id: 'intersection-observer',
    name: 'Intersection Observer API',
    description: 'The Intersection Observer API provides a way to asynchronously observe changes in the intersection of a target element with an ancestor element or with a top-level document\'s viewport.',
    baseline: {
      status: 'newly',
      since: '2022-03'
    },
    browser_support: {
      chrome: '51',
      firefox: '55',
      safari: '12.1'
    },
    mdn_url: 'https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API'
  },
  'resize-observer': {
    id: 'resize-observer',
    name: 'Resize Observer API',
    description: 'The Resize Observer API provides a performant mechanism by which code can monitor an element for changes to its size.',
    baseline: {
      status: 'newly',
      since: '2023-03'
    },
    browser_support: {
      chrome: '64',
      firefox: '69',
      safari: '13.1'
    },
    mdn_url: 'https://developer.mozilla.org/en-US/docs/Web/API/Resize_Observer_API'
  },
  'broadcast-channel': {
    id: 'broadcast-channel',
    name: 'Broadcast Channel API',
    description: 'The Broadcast Channel API allows basic communication between browsing contexts on the same origin.',
    baseline: {
      status: 'newly',
      since: '2022-03'
    },
    browser_support: {
      chrome: '54',
      firefox: '38',
      safari: '15.4'
    },
    mdn_url: 'https://developer.mozilla.org/en-US/docs/Web/API/Broadcast_Channel_API'
  },
  'array-flat': {
    id: 'array-flat',
    name: 'Array.prototype.flat()',
    description: 'The flat() method creates a new array with all sub-array elements concatenated into it recursively up to the specified depth.',
    baseline: {
      status: 'newly',
      since: '2022-03'
    },
    browser_support: {
      chrome: '69',
      firefox: '62',
      safari: '12'
    },
    mdn_url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/flat'
  },
  'array-flatmap': {
    id: 'array-flatmap',
    name: 'Array.prototype.flatMap()',
    description: 'The flatMap() method returns a new array formed by applying a given callback function to each element of the array.',
    baseline: {
      status: 'newly',
      since: '2022-03'
    },
    browser_support: {
      chrome: '69',
      firefox: '62',
      safari: '12'
    },
    mdn_url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/flatMap'
  },
  'object-fromentries': {
    id: 'object-fromentries',
    name: 'Object.fromEntries()',
    description: 'The Object.fromEntries() method transforms a list of key-value pairs into an object.',
    baseline: {
      status: 'newly',
      since: '2022-03'
    },
    browser_support: {
      chrome: '73',
      firefox: '63',
      safari: '12.1'
    },
    mdn_url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/fromEntries'
  },
  'string-matchall': {
    id: 'string-matchall',
    name: 'String.prototype.matchAll()',
    description: 'The matchAll() method returns an iterator of all results matching a string against a regular expression.',
    baseline: {
      status: 'newly',
      since: '2022-03'
    },
    browser_support: {
      chrome: '73',
      firefox: '67',
      safari: '13'
    },
    mdn_url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/matchAll'
  },
  'bigint': {
    id: 'bigint',
    name: 'BigInt',
    description: 'BigInt is a built-in object that provides a way to represent whole numbers larger than 2^53 - 1.',
    baseline: {
      status: 'newly',
      since: '2022-03'
    },
    browser_support: {
      chrome: '67',
      firefox: '68',
      safari: '14'
    },
    mdn_url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt'
  },
  'globalthis': {
    id: 'globalthis',
    name: 'globalThis',
    description: 'The globalThis global property contains the global this value, which is akin to the global object.',
    baseline: {
      status: 'newly',
      since: '2022-03'
    },
    browser_support: {
      chrome: '71',
      firefox: '65',
      safari: '12.1'
    },
    mdn_url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/globalThis'
  },
  'array-at': {
    id: 'array-at',
    name: 'Array.prototype.at()',
    description: 'The at() method takes an integer value and returns the item at that index, allowing for positive and negative integers.',
    baseline: {
      status: 'newly',
      since: '2022-03'
    },
    browser_support: {
      chrome: '92',
      firefox: '90',
      safari: '15.4'
    },
    mdn_url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/at'
  }
};