var Checklist = Checklist || function () {

  // The checklist object.
  var checklist;

  // Define the model.
  var CheckBoxModel = Backbone.Model.extend({
    defaults: {
      checked: false
    },
  });

  // Define the collection.
  var CheckBoxCollection = Backbone.Collection.extend({
    model: CheckBoxModel,

    // Gets an existing model, otherwise creates new and returns.
    gain: function(id) {
      if (!this.get(id)) {
        this.add({ id: id });
      }
      return this.get(id);
    }
  });

  // Define the view associated with a checkbox.
  var CheckBoxView = Backbone.View.extend({
    tagName: 'input',

    attributes: {
      type: 'checkbox'
    },

    events: {
      'change': 'change'
    },

    initialize: function() {
      this.listenTo(this.model, 'change', this.render);
    },

    render: function() {
      this.$el.attr('checked', this.model.get('checked'));

      return this;
    },

    change: function () {
      this.model.save({ checked: this.$el.is(':checked') });
    }
  });

  // Define the view associated with a list item.
  var ListItemView = Backbone.View.extend({
    initialize: function() {
      var checkBoxView = new CheckBoxView({ model: this.model });
      this.$el
        .prepend(checkBoxView.render().el)
        .wrapInner('<label />');

      this.listenTo(this.model, 'change', this.update);
      this.update();
    },

    update: function() {
      this.$el.attr('data-checked', this.model.get('checked'));
    },
  });

  // Attaches checklist views to HTML list items.
  var attachChecklist = function(checklist) {
    $('.checklist').each(function(index) {

      // Get an HTML list ID.
      var checklistId = $(this).attr('id') || '_checklist_' +  index + '_';

      $(this).find('>li').each(function(index) {

        // Attach a view to a list item.
        new ListItemView({
          el: $(this),
          model: checklist.gain(checklistId + '-' + index)
        });
      });
    });
  };

  // Returns init function.
  return {
    init: function(storageId) {

      // Set falback storage ID based on the current URL.
      storageId = storageId ||  window.location.origin + window.location.pathname;

      // Create local storage with given ID.
      _.extend(CheckBoxCollection.prototype, {
        localStorage: new Backbone.LocalStorage(storageId)
      });

      // Create collection instance.
      this.checklist = new CheckBoxCollection();

      // Fetch data from the storage.
      this.checklist.fetch({ success: attachChecklist });
    }
  }
}();