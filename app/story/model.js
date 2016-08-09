import Ember from 'ember';
import DS from 'ember-data';
import ENV from '../config/environment';
import get from 'ember-metal/get';
import computed from 'ember-computed';
import parseAnalyticsCode from '../utils/analytics-code-parser';
import { shareMetadata } from 'overhaul/helpers/share-metadata';
const { attr, Model } = DS;

export default Model.extend({
  analyticsCode: attr('string'),
  audio: attr('string'),
  audioAvailable: attr('boolean'),
  audioDurationReadable: attr('string'),
  audioEventually: attr('boolean'),
  audioMayDownload: attr('boolean'),
  audioMayEmbed: attr('boolean'),
  audioShowOptions: attr('boolean'),
  commentsCount: attr('number'),
  commentsEnabled: attr('boolean'),
  cmsPK: attr('string'),
  dateLine: attr('string'),
  dateLineDatetime: attr('string'),
  donateURL: attr('string'),
  editLink: attr('string'),
  headers: attr(),
  imageMain: attr(),
  itemType: attr('string'),
  itemTypeId: attr('number'),
  isLatest: attr('boolean'),
  largeTeaseLayout: attr('boolean'),
  slug: attr('string'),
  tease: attr('string'),
  title: attr('string'),
  url: attr('string'),
  extendedStory: attr(),
  escapedBody: computed('extendedStory.body', {
    get() {
      let body = get(this, 'extendedStory.body');
      if (!body) {
        return '';
      }
      return body.replace(/\\x3C\/script>/g, '</script>');
    }
  }),
  commentSecurityURL(browserId) {
    let data = {
      content_type: 'cms.' + this.get('itemType'),
      object_pk: this.get('id'),
      bust_cache: Math.random()
    };
    if (browserId) {
      data.id = browserId;
    }
    return `${ENV.wnycAccountRoot}/comments/security_info/?${Ember.$.param(data)}`;
  },
  analytics: computed('analyticsCode', {
    get() {
      let analyticsCode = get(this, 'analyticsCode');
      let {channeltitle, showtitle, seriestitles, isblog, modelchar} = parseAnalyticsCode(analyticsCode);
      // compact first to guard against returned undefineds
      let containers = [channeltitle, showtitle, seriestitles].compact().map((c, i) => {
        if (i === 0 && c) {
          return `${isblog ? 'Blog' : 'Article Channel'}: ${c}`;
        } else if (i === 1 && c) {
          return `Show: ${c}`;
        } else if (i === 2 && c.length) {
          return `Series: ${c.join('+')}`;
        }
      }).compact().join(' | ');
      if (modelchar === 'n' && !containers) {
        containers = 'NPR';
      }
      return {
        containers,
        title: get(this, 'title')
      };
    }
  }),
  shareMetadata: computed(function() {
    return shareMetadata(this);
  }),
  // so Ember Simple Auth inludes a records ID when it saves
  toJSON() {
    var serializer = this.store.serializerFor('story');
    var snapshot = this._internalModel.createSnapshot();
    return serializer.serialize(snapshot, {includeId: true});
  }
});
