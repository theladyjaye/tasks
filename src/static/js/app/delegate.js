define(function(require, exports, module) {

var $ = require('jquery');
var stickit = require('backbone/stickit');
var marionette = require('marionette');
var vent = require('app/vent').vent;

var modalEvents = require('app/modals/events');
var sidebarEvents = require('app/sidebar/events');
var projectEvents = require('app/projects/events');
var SidebarView = require('app/sidebar/views/sidebar').SidebarView;
var getSettings = require('app/settings/defaults').getSettings;
var session     = require('app/session/session');

var modals = require('app/modals/modals');
var AccountFormView = require('app/modals/views/account').AccountFormView;
var InProcessView = require('app/projects/views/in-process').InProcessView;
var SessionInitializationView = require('app/modals/views/session').SessionInitializationView;

var ApplicationDelegate = marionette.Controller.extend({

    initialize: function(options){
        this.app = options.app;


        this.listenTo(vent, modalEvents.PRESENT, this.presentModal);
        this.listenTo(vent, modalEvents.DISMISS, this.dismissModal);

        var currentSettings = getSettings();
        var token = currentSettings.getToken();

        if (!token){
            this.beginLoginFlow();
            return;
        }

        this.beginApplication(token);
    },

    beginApplication: function(token){

        $(document).ajaxSend(function(e, request){
            request.setRequestHeader('Authorization', 'Bearer ' + token);
        });

        this.sidebarView = new SidebarView({});

        this.listenTo(this.sidebarView, sidebarEvents.SELECT_PROJECT, this.wantsChangeProject);
        this.app.sidebar.show(this.sidebarView);
    },

    wantsChangeProject: function(project){
        this.showProject(project);
    },

    showProject: function(project){
        var inProcessView = new InProcessView({model: project});

        if (this.currentProjectView){
            this.stopListening(this.currentProjectView, projectEvents.TOGGLE_SIDEBAR, this.wantsToggleSidebar);
        }

        this.app.projectDetail.show(inProcessView);
        this.currentProjectView = inProcessView;
        this.listenTo(inProcessView, projectEvents.TOGGLE_SIDEBAR, this.wantsToggleSidebar);
    },

    wantsToggleSidebar: function(){
        var $el = this.sidebarView.$el;

        if($el.parent().hasClass('hide')){
            this.sidebarView.showProjectsPane(true);
        } else {
            this.sidebarView.showProjectsPane(false);
        }
    },

    beginLoginFlow: function(){
        var modalView = modals.presentModal(new AccountFormView());
        modalView.once(modalEvents.COMPLETE, function(){
                var account = modalView.getData().model;
                modals.dismissModal();
                this.startSession(account);
            }, this);
    },

    startSession: function(account){

        var currentSettings = getSettings();

        modals.presentModal(new SessionInitializationView());
        var self = this;

        var success = function(token){
            currentSettings.setToken(token);
            self.beginApplication(token);
            setTimeout(function(){
                modals.dismissModal();
            }, 1300);
        };

        var fail = function(){
            setTimeout(function(){
                modals.dismissModal();
                self.beginLoginFlow();
            }, 1300);
        };

        session.startSession(account).then(success, fail);
    },

    presentModal: function(modalView){
        this.app.modal.show(modalView);
    },

    dismissModal: function(modalView){
        this.app.modal.close().then(function(){
            modals.nextModal();
        });
    }
});



exports.ApplicationDelegate = ApplicationDelegate;
exports.vent = vent;
});
