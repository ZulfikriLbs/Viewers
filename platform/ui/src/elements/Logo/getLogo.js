import React from 'react';
//import adjust from './icons/adjust.svg';
// Icons
//import adamMalikLogo from './logos/adam-malik.png';


const LOGOS = {
  //'adam-malik-logo': adamMalikLogo,
};

/**
 * Return the matching SVG Icon as a React Component.
 * Results in an inlined SVG Element. If there's no match,
 * return `null`
 */
export default function getIcon(key, props) {
  if (!key || !LOGOS[key]) {
    return React.createElement('div', null, 'Missing Icon');
  }

  return React.createElement('img', { src: LOGOS[key] }, null);
}

export { LOGOS };
