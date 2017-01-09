import { test } from 'qunit';
import moduleForAcceptance from 'wqxr-web-client/tests/helpers/module-for-acceptance';
import sinon from 'sinon';

moduleForAcceptance('Acceptance | playlist', {
  beforeEach() {
    window.googletag = {cmd: [], apiReady: true};
  },
  afterEach() {
    window.googletag = {cmd: [], apiReady: true};
  }
});

test('visiting /streams/wnyc-fm939', function(assert) {
  server.create('stream', {
    slug: 'wnyc-fm939', 
    name: 'WNYC FM',
  });
  server.create('whats-on', {
    slug: 'wnyc-fm939',
    current_show: {
      show_title: 'Foo Show',
      title: 'Episode Foo',
      url: 'http://fooshow.com',
      end: "2016-09-15T13:00:15.542Z" // 9 am
    }
  });
  
  let refreshSpy = sinon.spy();

  window.googletag.cmd = {
    push(fn) {
      fn();
    }
  };
  window.googletag.pubads = function() {
    return {
      refresh: refreshSpy,
      addEventListener() {}
    };
  };
  visit('/streams/wnyc-fm939');

  andThen(function() {
    assert.equal(currentURL(), '/streams/wnyc-fm939');
    assert.equal(find('a[href="http://fooshow.com"]').text().trim(), 'Episode Foo');
    assert.ok(refreshSpy.calledOnce, 'refresh was called');
  });
});
