
(function (app, fo, tools, undefined) {

    //http://stackoverflow.com/questions/14833326/how-to-set-focus-in-angularjs

    app.directive('captureFocus', function ($timeout, $parse) {
        return {
            link: function (scope, element, attrs) {
                var model = $parse(attrs.captureFocus);
                scope.$watch(model, function (value) {
                   // console.log('value=', value);
                    if (value === true) {
                        $timeout(function () {
                            element[0].focus();
                        }, 800);
                    }
                });
                //element.bind('blur', function () {
                //    console.log('blur')
                //    scope.$apply(model.assign(scope, false));
                //})
            }
        };
    });

    app.directive('ngEnter', function () {
        return function (scope, element, attrs) {
            element.bind("keydown keypress", function (event) {
                if (event.which === 13) {
                    scope.$apply(function () {
                        scope.$eval(attrs.ngEnter);
                    });

                    event.preventDefault();
                }
            });
        };
    });

    //http://weblogs.asp.net/dwahlin/building-an-angularjs-dialog-service

    //this 'global' variable helps make the dialog modal, so 2 cannot be opened at once
    var currentDialogInstance;
    function isDialogBusy () {
        return currentDialogInstance !== undefined;
    }
    function markAsBusy(dialog) {
        currentDialogInstance = dialog;
        return currentDialogInstance;
    }
    function unmarkAsBusy() {
        var result = currentDialogInstance;
        currentDialogInstance = undefined;
        return result;
    }


    app.service('dialogService', ['$uibModal', '$templateCache', function ($uibModal, $templateCache) {

        var defaultDialogProperties = {
            context: {
            },
            role: '.html',
            headerTemplate: function () {
                var type = this.context.myType && tools.getType(this.context) + 'Header' + this.role;
                var templateUrl = this.context.headerUrl ? this.context.headerUrl : type;
                return templateUrl;
            },
            bodyTemplate: function () {
                var type = this.context.myType && tools.getType(this.context) + 'Body' + this.role;
                var templateUrl = this.context.templateUrl ? this.context.templateUrl : type;
                return templateUrl;
            },
            footerTemplate: function () {
                var type = this.context.myType && tools.getType(this.context) + 'Footer' + this.role;
                var templateUrl = this.context.footerUrl ? this.context.footerUrl : type;
                return templateUrl;
            },
            dialogTemplate: function () {
                var dialog = "dialogTemplate.html";
                return dialog;
            },
            dialogHeader: function () {
                var templateUrl = this.headerTemplate;
                var template = $templateCache.get(templateUrl);

                var dialogHeader = template ? template : templateUrl;
                $templateCache.put('dialogHeader.html', dialogHeader ? dialogHeader : '');
                return dialogHeader;
            },
            dialogBody: function () {
                var templateUrl = this.bodyTemplate;
                var template = $templateCache.get(templateUrl);

                var dialogBody = template ? template : templateUrl;
                $templateCache.put('dialogBody.html', dialogBody ? dialogBody : '');
                return dialogBody;
            },
            dialogFooter: function () {
                var templateUrl = this.footerTemplate;
                var template = $templateCache.get(templateUrl);

                var dialogFooter = template ? template : templateUrl;
                $templateCache.put('dialogFooter.html', dialogFooter ? dialogFooter : '');
                return dialogFooter;
            },
        }

        function modalInstanceController($scope, $uibModalInstance, context, root, args, service) {
            //add all the args to scope  this will make a great way to inject methods and values.
            tools.mixin($scope, args);

            $scope.context = context;
            $scope.root = root;
            $scope.showHeader = service.dialogHeader ? true : false;
            $scope.showBody = service.dialogBody ? true : false;
            $scope.showFooter = service.dialogFooter ? true : false;

            $scope.doOK = function () {
                service.onOK && service.onOK($uibModalInstance, context);
                $uibModalInstance.close(context);
            };

            $scope.doCancel = function () {
                service.onCancel && service.onCancel($uibModalInstance, context);
                $uibModalInstance.dismiss(context);
            };

            $scope.showDetails = false;
            $scope.doMore = function () {
                service.onMore ? service.onMore($uibModalInstance, $scope) : $scope.showDetails = !$scope.showDetails;
            };

            service.onInitialize && service.onInitialize($uibModalInstance, $scope);
        };


        var defaultDialogActions = {
            doShow: function (args) {
                var self = this;

                //make sure the templates are in place
                self.dialogHeader;
                self.dialogBody;
                self.dialogFooter;

                var info = $templateCache.info();

                //you should maybe get the spec for the context
                //to support undo edit or cancel...

                function dialogOpened(result) {
                    self.onReady && self.onReady(result);
                    args.onServiceActivated && args.onServiceActivated(self);

                }
 
                function exitOk(result) {
                    args.onServiceComplete && args.onServiceComplete();
                    self.onExit && self.onExit(result, true);
                }

                function exitCancel(result) {
                    args.onServiceComplete && args.onServiceComplete();
                    self.onExit && self.onExit(result, false);
                }


                var instance = $uibModal.open({
                    resolve: {
                        context: function () {
                            return self.context;
                        },
                        root: function () {
                            return self.root;
                        },
                        args: function () { return args; },
                        service: function () { return self; },
                    },
                    templateUrl: self.dialogTemplate,
                    controller: modalInstanceController,
                });

                instance.opened.then(dialogOpened);
                instance.result.then(exitOk, exitCancel);
                return instance;
            },

            display: function (args, actions) {
                if (isDialogBusy()) return;
                tools.mixin(this, actions);
                var result = this.doShow(args);
                markAsBusy(result);
                return result;
            }
        }

        this.createDialog = function(spec, actions) {
            var properties = tools.union(defaultDialogProperties, spec);
            var methods = tools.union(defaultDialogActions, actions);

            var dialog = fo.makeNode(properties);

            tools.mixin(dialog, methods);
            return dialog;
        }


        this.isBusy = function () {
            return isDialogBusy();
        }

        this.doPopupDialog = function (spec, actions, args) {
            if (isDialogBusy()) return;

            var dialog = this.createDialog(spec, actions);
            var dialogArgs = tools.mixin(args, {
                onServiceActivated: function () { },
                onServiceComplete: unmarkAsBusy,          
            });

            var result = dialog.display(dialogArgs);
            markAsBusy(result);
            return result;
        }


        this.doCloseDialog = function (result) {
            var dialog = unmarkAsBusy();
            if (dialog) dialog.close(result);
        }

        this.doDismissDialog = function (result) {
            var dialog = unmarkAsBusy();
            if (dialog) dialog.dismiss(result);
        }

        var dialogService = this;
        //override a version that has no dialog
        if (fo.Workspace) {
            fo.Workspace.prototype.userSaveFileDialog = function (onComplete, defaultExt, defaultValue) {
                var self = this;

                var saveSpec = {
                    documentName: self.documentName.replace(defaultExt, ""),
                }

                //tou need to have a finename before you exit OK
                dialogService.doPopupDialog({
                    headerTemplate: 'saveFileHeader.html',
                    bodyTemplate: 'saveFileBody.html',
                    footerTemplate: 'saveFilelFooter.html',
                    context: fo.makeComponent(saveSpec),
                },
                {
                    onOK: function () {
                        var context = this.context;
                        var ext = defaultExt || ".knt";
                        var name = context.documentName;


                        //current model to payload requires this to be set,  but the timing is wrong
                        //they should be set upon save along with the is Saved tag
                        self.documentExt = ext;
                        self.documentName = name;

                        var payload = self.currentModelToPayload({}, true);
                        onComplete && onComplete(payload, name, ext);
                    },
                },
                {
                    IgnoreAndContinue: function () {
                        //fo.publish('error', ['IgnoreAndContinue', 'not implemented']);
                        self.clear();
                        dialogService.doCloseDialog();
                    }
                });
            }

        }

    }]);

}(foApp, Foundry, Foundry.tools));
