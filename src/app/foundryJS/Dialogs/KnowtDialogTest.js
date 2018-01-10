
var knowtApp = angular.module('knowtDialogTest', ['ngRoute', 'ngAnimate', 'ui.bootstrap']);
knowtApp.header = { title: 'Knowt Dialog', help: 'knowtshareHelp.html' };

//initial document and run implemented...

(function (app, fo, undefined) {
    app.defaultNS = function (name) {
        var id = fo.getNamespaceKey(this.name, name);
        return id;
    }

    app.stencilNS = function (name) {
        var id = fo.getNamespaceKey("KnowtShare", name);
        return id;
    }

}(knowtApp, Foundry));

(function (app, fo, undefined) {

//    //http://odetocode.com/blogs/scott/archive/2013/06/06/decorating-angularjs-services.aspx
//    //http://www.bennadel.com/blog/2542-logging-client-side-errors-with-angularjs-and-stacktrace-js.htm


app.service('workspaceService', ['$log', function ($log) {

        var space;

        this.workSpace = function (template) {
            if (space) return space;

            space = fo.ws.makeModelWorkspace("KnowtShare", {
                title: "Knowt Dialog",
                subTitle: "testing for popup dialogs",
                userId: "123456780",
                userNickName: 'sedona',
            }, template);

            return space;
        };

    }]);

}(knowtApp, Foundry));

//now create the main controller
(function (app, fo, undefined) {

    //load templares for tialogs and shapes...
    fo.utils.loadTemplate('KnowtView.Dialogs.html');
    fo.utils.loadTemplate('KnowtView.NoteTemplate.html');



    app.controller('workSpace', function ($scope, $log, workspaceService, dialogService) {

        var space = workspaceService.workSpace({
            dialogService: dialogService,
        });

        var model = space.rootModel

        model.doTest = function () {
            dialogService.doPopupDialog({
                headerTemplate: 'ClearAllHeader.html',
                bodyTemplate: 'ClearAllBody.html',
                footerTemplate: 'ClearAllFooter.html',
            });
        }

        model.requestClear = function () {
            dialogService.doPopupDialog({
                headerTemplate: '<p>The author of this content is requesting you clear your screen.</p>',
                bodyTemplate: '<p>Select Yes to clear your screen and sync with the author.</p><p>Select No to ignore the content for now and use resync command to sync later.</p>',
                footerTemplate: 'YesNoFooter.html',
            });
        }

        return space;
    });

}(knowtApp, Foundry));