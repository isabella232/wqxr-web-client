import config from 'overhaul/config/environment';
import { skip, test } from 'qunit';
import { plantBetaTrial } from 'overhaul/tests/helpers/beta';
import moduleForAcceptance from 'overhaul/tests/helpers/module-for-acceptance';
import djangoPage from 'overhaul/tests/pages/django-page';
import 'overhaul/tests/helpers/with-feature';
import Ember from 'ember';
const { wnycURL } = config;
import {
  resetHTML
} from 'overhaul/tests/helpers/html';

function escapeNavigation() {
  return 'leaving';
}

moduleForAcceptance('Acceptance | Django Rendered | Proper Re-renders', {
  beforeEach() {
    window.onbeforeunload = escapeNavigation;
  },
  afterEach() {
    window.onbeforeunload = undefined;
    resetHTML();
  }
});

test('on the homepage', function(assert) {
  let home = server.create('django-page', {id: '/'});
  djangoPage
    .bootstrap(home)
    .visit(home);

  andThen(function() {
    assert.equal(currentURL(), '/');
    let djangoContent = findWithAssert('.django-content');
    assert.ok(djangoContent.contents().length);
  });
});

test('on a search page with a query', function(assert) {
  let search = server.create('django-page', {id: 'search/?q=foo'});
  djangoPage
    .bootstrap(search)
    .visit({id: 'search/?q=foo'});

  andThen(function() {
    assert.equal(currentURL(), 'search/?q=foo');
    let djangoContent = findWithAssert('.django-content');
    assert.ok(djangoContent.contents().length);
  });
});

test('it properly routes to the search page', function(assert) {
  withFeature('django-page-routing');
  let home = server.create('django-page', {id: '/'});
  server.create('django-page', {id: 'search/?q=foo'});

  djangoPage
    .bootstrap(home)
    .visit(home);

  fillIn('#search-input', 'foo');
  triggerEvent('#search-form', 'submit');

  andThen(function() {
    assert.equal(currentURL(), '/search/?q=foo');
  });
});

moduleForAcceptance('Acceptance | Django Rendered | Beta Trial', {
  beforeEach() {
    window.onbeforeunload = escapeNavigation;
    config.betaTrials.active = true;
    config.betaTrials.preBeta = true;
  },
  afterEach() {
    window.onbeforeunload = undefined;
    resetHTML();
  }
});

skip('alien doms with beta trials keep the beta bar if it has not been dismissed', function(assert) {
  plantBetaTrial();

  withFeature('django-page-routing');
  let djangoHTML = `<a href="${wnycURL}/foo" id="link">click me</a>`;
  let page = server.create('django-page', {testMarkup: djangoHTML});
  server.create('django-page', {id: 'foo/'});

  djangoPage
    .bootstrap(page)
    .visit(page)
    .alienClick('#link');

  andThen(() => {
    assert.equal(currentURL(), '/foo');
  });
  andThen(() => {
    assert.ok(Ember.$('[data-test-selector=beta-tease]').length, 'beta trial tease is visible afer transition');
  });
});
