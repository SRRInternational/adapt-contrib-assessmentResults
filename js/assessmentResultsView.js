define([
  'core/js/adapt',
  'core/js/views/componentView'
], function(Adapt, ComponentView) {

  var AssessmentResultsView = ComponentView.extend({

    events: {
      'click .js-assessment-retry-btn': 'onRetryClicked',
      'click .js-assessment-next-btn': 'onNextClicked',
      'click .js-assessment-exit-btn': 'onExitClicked'
    },

    preRender: function () {
      this.model.setLocking('_isVisible', false);

      this.listenTo(Adapt, 'preRemove', function () {
        this.model.unsetLocking('_isVisible');
      });

      this.listenTo(this.model, {
        'change:_feedbackBand': this.addClassesToArticle,
        'change:body': this.render
      });
    },

    postRender: function() {
      this.model.checkIfAssessmentComplete();
      this.setReadyStatus();
      this.setupInviewCompletion('.component__inner', this.model.checkCompletion.bind(this.model));

      var assessmentModel = Adapt.assessment.get(this.model.get('_assessmentId'));
      console.log('assessmentModel.... ', assessmentModel);
      var state = assessmentModel.getState();
      console.log('state..... ', state.isPass);
      if(state.isPass) {
        if(this.model.get('_next')._isEnabled == true) {
          this.$('.assessmentresults__next-btn').show();
        }
        //Show exit button if learner passed
        var _sLockType = Adapt.course.get('_lockType');
        console.log('_sLockType - ', _sLockType, this.model.get('_exit'));
        if(_sLockType == "sequential" && this.model.get('_exit')._isEnabled == true) {
          this.$('.assessmentresults__exit-btn').show();
        }
      }
    },

    /**
     * Resets the state of the assessment and optionally redirects the user
     * back to the assessment for another attempt.
     */
    onRetryClicked: function() {
      var state = this.model.get('_state');

      Adapt.assessment.get(state.id).reset();

      if (this.model.get('_retry')._routeToAssessment === true) {
        Adapt.navigateToElement('.' + state.articleId);
      }
    },

    onNextClicked: function() {
      console.log('onNextClicked');
      Backbone.history.navigate('#/id/'+this.model.get('_next')._pageId, {trigger: true});
    },

    onExitClicked: function() {
      console.log('onExitClicked');
      window.close();
    },

    /**
     * If there are classes specified for the feedback band, apply them to the containing article
     * This allows for custom styling based on the band the user's score falls into
     */
    addClassesToArticle: function(model, value) {
      if (!value || !value._classes) return;

      this.$el.parents('.article').addClass(value._classes);
    }

  }, {
    template: 'assessmentResults'
  });

  return AssessmentResultsView;

});
