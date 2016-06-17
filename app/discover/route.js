import Ember from 'ember';

export default Ember.Route.extend({
  session: Ember.inject.service(),
  model() {
    // Everything in this feature needs the list of the topics, so we'll get them now
    return this.store.query("discover.topics", {discover_station: "wnyc"}).then(topics => {
      var savedTopics = [];
      let savedTopicsKeys = this.get('session.data.discover-topics');
      if (savedTopicsKeys) {
        // Now we'll find the matching objects in the discover topics,
        // and add them to the selectedTopics list
        topics.forEach(function(topic) {
          if (savedTopicsKeys.contains(topic.get('url'))) {
            savedTopics.addObject(topic);
          }
        });
      }

      return Ember.RSVP.hash({
        topics: topics,
        savedTopics: savedTopics
      });
    });
  },
  beforeModel() {
    // look at session data and redirect to start if there are no selected topics
    // and shows
    if (!this.get('session.data.discover-topics') && !this.get('session.data.discover-topics')) {
      this.replaceWith('discover.start');
    }
    // else {
    //   this.transitionTo('discover.index');
    // }
  },
  actions: {
    saveShows(selectedShows) {
      // called by child routes
      this.get('session').set('data.discover-shows', selectedShows.map(s => s.get('id')));
    },
    saveTopics(selectedTopics) {
      // called by child routes
      this.get('session').set('data.discover-topics', selectedTopics.map(s => s.get('url')));
    }
  }
});
