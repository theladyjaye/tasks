define(function(require, exports, module) {

var marionette = require('marionette');
var backbone = require('backbone');
var _ = require('underscore');
var Swimlane = require('./swimlane').Swimlane;
var Task = require('../models/task').Task;
var view = require('hbs!app/projects/templates/details');

var ProjectDetailView = marionette.ItemView.extend({
    template: view,
    className: 'details',

    ui:{
        projectName: '.project-name label',
        backlog: '.swimlanes .lane.backlog',
        accepted: '.swimlanes .lane.accepted',
        inProgress: '.swimlanes .lane.in-progress',
        completed: '.swimlanes .lane.completed',
        toggleButton: '.project-name .pane-action'
    },

    events: {
        'click .swimlanes .lane.backlog .heading .action': 'wantsAddToBacklog',
        'click .project-name .pane-action': 'wantsToggleProjectPane'

    },

    onShow: function(){
        this.listenTo(this.model, 'change', this.modelDidChange);
        this.initializeSwimlanes();
    },

    wantsToggleProjectPane: function(){
        var btn = this.ui.toggleButton;
        var label = '>';
        if(btn.text() == '>'){
            label = '<';
        }

        this.trigger('projects:toggle', this);
        btn.text(label);
    },

    wantsAddToBacklog: function(){
        this.addToBacklog();
    },

    addToBacklog: function(){
        var task = new Task({label: 'New Task'});
        this.swimlaneBacklog.collection.add(task);
    },

    initializeSwimlanes: function(){

        this.swimlaneBacklog = new Swimlane({
            el: this.ui.backlog.find('ul'),
            collection: new backbone.Collection()
        });

        this.swimlaneAccepted = new Swimlane({
            el: this.ui.accepted.find('ul'),
            collection: new backbone.Collection()
        });

        this.swimlaneInProgress = new Swimlane({
            el: this.ui.inProgress.find('ul'),
            collection: new backbone.Collection()
        });

        this.swimlaneCompleted = new Swimlane({
            el: this.ui.completed.find('ul'),
            collection: new backbone.Collection()
        });
    },

    modelDidChange: function(model){
        this.ui.projectName.text(model.get('projectName'));
    }

});

exports.ProjectDetailView = ProjectDetailView;

});
