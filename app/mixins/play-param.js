import QueryMethodMixin from 'ember-query-method/mixins/query-method';

export default QueryMethodMixin.reopen({
  factory: 'service:dj',
  method: 'play'
});
