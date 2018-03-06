import Ember from 'ember';
import Controller from 'ember-controller';
import service from 'ember-service/inject';
import get from 'ember-metal/get';
import { reads } from 'ember-computed';

export default Controller.extend({
  dj             : service(),
  hifi           : service(),
  metrics        : service(),
  session        : service(),
  listenAnalytics: service(),
  queue          : service('listen-queue'),

  queryParams:  ['modal', 'play'],
  modal:        null,
  play:         null,

  showPlayer: reads('dj.showPlayer'),

  isHomepage: Ember.computed.match('currentRouteName', /^index(_loading)?$/),

  actions: {

    showModal(which) {
      this._scrollY = window.scrollY;
      this.set('modal', which);
      this._wasModal = true;

      let metrics = get(this, 'metrics');
      metrics.trackEvent('GoogleAnalytics', {
        category: 'Persistent Player',
        action: 'Click',
        label: 'Open Queue'
      });
    },
    closeModal() {
      if (!this.get('modal')) {
        return;
      }
      window.scrollTo(0, this._scrollY);
      this.set('modal', null);
      this._wasModal = true;
    },


    soundTitleDidChange() {
      if (this.get('hifi.currentSound.isStream')) {
        this.get('listenAnalytics').trackStreamData(this.get('hifi.currentSound'));
      }
    },

    trackShare(data, sharedFrom) {
      let metrics = this.get('metrics');

      let {playContext, analyticsCode, type, shareText} = data;

      metrics.trackEvent('GoogleAnalytics', {
        category: 'Persistent Player',
        action: `Shared Story "${shareText}"`,
        label: `${playContext}|${analyticsCode}|${type}|${sharedFrom}`,
      });
    }
  }
});
