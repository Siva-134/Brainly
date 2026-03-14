const React = require('react');

const thumbnail = "";
const getYouTubeThumbnail = () => null;
const getGoogleFavicon = (url) => `https://www.google.com/s2/favicons?domain=${url}&sz=128`;
const link = "https://github.com";

const result = thumbnail || getYouTubeThumbnail(link) || getGoogleFavicon(link);
console.log("RESULT:", result);
