define(function(require, exports, module) {

var marionette = require('marionette');
var template = require('hbs!app/projects/templates/cell-in-progress');
var events = require('../../events');

var CellInProgressView = marionette.ItemView.extend({
    template: template,
    className: 'task in-progress',
    tagName: 'li',

    events: {
        'click': 'wantsClick'
    },

    triggers: {
        'click .action .btn.todo': events.TODO,
        'click .action .btn.in-progress': events.IN_PROGRESS,
        'click .action .btn.completed': events.COMPLETED
    },

    onShow: function(){
    },


});

exports.CellInProgressView = CellInProgressView;

});
