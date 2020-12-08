//import './Icon.styl';

import PropTypes from 'prop-types';
import getLogo from './getLogo.js';

const Logo = props => {
  return getLogo(props.name, props);
};

Logo.propTypes = {
  /** The string name of the icon to display */
  name: PropTypes.string.isRequired,
};

export default Logo;
