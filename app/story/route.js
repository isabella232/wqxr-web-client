import Ember from 'ember';
import service from 'ember-service/inject';
import PlayParamMixin from 'wqxr-web-client/mixins/play-param';
import config from 'wqxr-web-client/config/environment';
const { get } = Ember;
const { hash: waitFor } = Ember.RSVP;

export default Ember.Route.extend(PlayParamMixin, {
  metrics:      service(),
  session:      service(),
  googleAds:    service(),
  dataPipeline: service(),
  currentUser:  service(),
  audio:        service(),
  
  titleToken(model) {
    return `${get(model, 'story.title')} - ${get(model, 'story.headers.brand.title')}`;
  },
  title(tokens) {
    return `${tokens[0]} - WQXR`;
  },
  model({ slug }, { queryParams }) {
    
    return this.store.findRecord('story', slug, {adapterOptions: {queryParams}}).then(story => {
      let comments = this.store.query('comment', { itemTypeId: story.get('itemTypeId'), itemId: story.get('cmsPK') });
      let relatedStories = this.store.query('story', {related: { itemId: story.get('cmsPK'), limit: 5 }});
      return waitFor({
        story,
        getComments: () => comments,
        getRelatedStories: () => relatedStories,
        adminURL: `${config.wnycAdminRoot}/admin`
      });
    }).catch(function(data){
      console.log("there is an error on the api call", data.errors[0]);
      let errorstatus = data.errors[0].status;
      console.log("status", data.errors[0].status, typeof(data.errors[0].status));
      if (errorstatus === '404'){
        console.log("404 error");
        var error = new Error(data.errors[0]);
        error.response = data.errors[0];
        throw error;
      }

    });
  },
  afterModel(model, transition) {
    get(this, 'googleAds').doTargeting(get(model, 'story').forDfp());

    if (get(model, 'story.headerDonateChunk')) {
      transition.send('updateDonateChunk', get(model, 'story.headerDonateChunk'));
    }
  },
  
  setupController(controller) {
    controller.set('isMobile', window.Modernizr.touchevents);
    controller.set('session', get(this, 'session'));
    controller.set('user', get(this, 'currentUser.user'));
    controller.set('audio', get(this, 'audio'));
    return this._super(...arguments);
  },
  
  actions: {
    didTransition() {
      this._super(...arguments);
      
      let model = get(this, 'currentModel');
      let metrics = get(this, 'metrics');
      let dataPipeline = get(this, 'dataPipeline');
      let {containers:action, title:label} = get(model, 'story.analytics');
      let nprVals = get(model, 'story.nprAnalyticsDimensions');

      // google analytics
      metrics.trackEvent('GoogleAnalytics', {
        category: 'Viewed Story',
        action,
        label,
      });



      // NPR
      metrics.trackPage('NprAnalytics', {
        page: `/story/${get(model, 'story.slug')}`,
        title: label,
        nprVals,
      });
      
      // data pipeline
      dataPipeline.reportItemView({
        cms_id: get(model, 'story.cmsPK'),
        item_type: get(model, 'story.itemType'),
      });
      
      return true;
    }
  }
});
