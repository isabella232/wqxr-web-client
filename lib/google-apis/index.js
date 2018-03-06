/* eslint-env node */
module.exports = {
  name: 'google-apis',

  isDevelopingAddon: function() {
    return true;
  },

  contentFor: function(which, config) {
    if (which === 'head-footer' && this.app.env !== 'test') {
      var out = [
        '<script>window.googletag = window.googletag || {cmd: []};</script>',
        '<script src="https://www.google.com/jsapi"></script>',
        '<script src="//maps.googleapis.com/maps/api/js'
      ];
      if (config.googleAPIv3Key) {
        out.push('?key=' + config.googleAPIv3Key);
      }
      out.push('"></script>');
      return out.join("");
    }
  }

};
