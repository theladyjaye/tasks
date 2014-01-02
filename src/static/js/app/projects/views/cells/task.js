define(function(require, exports, module) {

var marionette = require('marionette');
var modals = require('built/app/modals');
var ClickTestResponder = require('built/core/responders/clicks').ClickTestResponder;
var KeyResponder = require('built/core/responders/keys').KeyResponder;
var keys = require('built/app/keys');
var events = require('../../events');
var status = require('../../models/task').status;
var EditTaskFormView = require('app/modals/views/edit-task').EditTaskFormView;
var TaskActionsMenu = require('../menus/menu-task-actions').TaskActionsMenu;

var PopView = require('built/app/popovers').PopView;

var TaskView = marionette.Layout.extend({
    tagName: 'li',

    bindings:{
        '.lbl':'label',
        '.description':'description',
        '.loe': {
            observe: 'loe',
            update: function($el, val, model, options) {
                var loe = 'easy';
                switch(val){
                    case 0:
                        loe = 'easy';
                        break;
                    case 1:
                        loe = 'medium';
                        break;
                    case 2:
                        loe = 'hard';
                        break;
                }
                $el.find('>div').attr('class', loe);
            }
        },
        ':el': {
            observe: 'task_type',
            update: function($el, val, model, options) {
                if(val){
                    $el.addClass('bug');
                }else{
                    $el.removeClass('bug');
                }
            }
        },
    },

    events:{
        'click .actions':'wantsShowActions',
        'dblclick':'onDoubleClick'
    },

    ui: {
        'dropdownMenu':'.dropdown-menu',
        'actions': '.actions'
    },

    regions: {
        actions: '.actions-menu'
    },

    initialize: function(){
        // needed for when we reasign the assigned_to via server
        this.listenTo(this.model, 'change', this.render);
    },

    onClose: function(){
        if(this._clickTest){
            this._clickTest.close();
        }
        if(this.keyResponder){
            this.keyResponder.close();
            keys.removeFromResponderChain(this);
        }
    },

    onDoubleClick: function(){
        this.wantsEdit();
    },

    wantsShowActions: function(){
        var choices = {
            'backlog': [
            {label: 'Move To Todo', tag: 'todo'},
            {label: 'Move To In Progress', tag: 'in-progress'},
            {label: 'Move To In Completed', tag: 'completed'},
            ],

            'todo': [
            {label: 'Move To Backlog', tag: 'backlog'},
            {label: 'Move To In Progress', tag: 'in-progress'},
            ],

            'in-progress': [
            {label: 'Move To Todo', tag: 'todo'},
            {label: 'Move To Completed', tag: 'completed'},
            ],

            'completed': [
            {label: 'Move To Todo', tag: 'todo'},
            {label: 'Move To Archive', tag: 'archive'},
            ],

            'archived':[
            {label: 'Move To Todo', tag: 'todo'},
            {label: 'Move To In Progress', tag: 'in-progress'},
            {label: 'Move To In Completed', tag: 'completed'},
            ]
        };

        this.showActions(choices[this.tag] || []);
    },

    showActions: function(choices){
        var actions = this.actions;

        var menu = new TaskActionsMenu({
            choices: choices
        });

        function layout(anchorRect, $anchorElement, viewRect, css){
            css.top = -3; // drop shadow - 3
            css.right = viewRect.width - 3; // drop shadow + 3
        }

        var pop = new PopView();
        pop.show(menu, {rect: this.ui.actions.parent(), anchor: layout});
        // var pop = new PopView({view: menu});
        // pop.showRelativeToElement(this.ui.actions.parent(), layout);

        // handle a click
        menu.once('select', _.bind(function(){
            pop.close();

            if(!menu.selectedTag) return;

            var options = {
                'todo': 'wantsSetTodo',
                'in-progress': 'wantsSetInProgress',
                'completed': 'wantsSetCompleted',
                'archive': 'wantsSetArchived',
                'backlog': 'wantsSetBacklog',
                'edit': 'wantsEdit',
                'delete': 'wantsDelete'
            };

            var actionKey = options[menu.selectedTag] || null;
            if(!actionKey) return;
            this[actionKey]();

        }, this));
    },

    onRender: function(){
        this.stickit();
    },

    editTaskComplete: function(modalView){
        var data = modalView.getData();
        modals.dismissModal();
    },

    wantsSetTodo: function(){
        this.model.save('status', status.TODO);
    },

    wantsSetInProgress: function(){
        this.model.save('status', status.IN_PROGRESS);
    },

    wantsSetCompleted: function(){
        this.model.save('status', status.COMPLETED);
    },

    wantsSetArchived: function(){
        this.model.save('status', status.ARCHIVED);
    },

    wantsSetBacklog: function(){
        this.model.save('status', status.BACKLOG);
    },

    wantsEdit: function(){
        var taskForm = new EditTaskFormView({model: this.model});
        var modalView = modals.presentModal(taskForm);
        modalView.then(this.editTaskComplete);
    },

    wantsDelete: function(){
        this.model.destroy();
    },




});

exports.TaskView = TaskView;

});
