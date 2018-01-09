
var Foundry = Foundry || {};
Foundry.clientPostMessage = Foundry.clientPostMessage || {};

//this module lets you send data and commands between windows
//it extends the normal pub/sub API in foundry core


(function (ns, undefined) {

    function log(message) {
        window.console.log(message);
    }

    function errorLog(message) {
        window.console.log(message);
    }

    function noop() { }

    function mixin (target, source) {
        if (!source) return target;
        if (!target) return source;
        for (var name in source) {
            target[name] = source[name];
        }
        return target;
    };

    function isString(obj) {
        return typeof obj === 'string';
    };


    /////////////////////////////////////////////////


    var _commands = {};
    var _commandsSuccess = noop;
    ns.registerCommand = function (cmdJSON, onSuccess) {
        _commands = _commands ? _commands : {};
        if (onSuccess) _commandsSuccess = onSuccess;
        return mixin(_commands, cmdJSON);
    }


    var _commandResponses = {};
    var _commandResponsesSuccess = noop;
    ns.registerCommandResponse = function (cmdJSON, onSuccess) {
        _commandResponses = _commandResponses ? _commandResponses : {};
        if (onSuccess)  _commandResponsesSuccess = onSuccess;
        return mixin(_commandResponses, cmdJSON);
    }


    function processCommand(cmd, payload) {
        var func = _commandResponses && _commandResponses[cmd];
        if (func) {
            func(payload);
            _commandResponsesSuccess && _commandResponsesSuccess(cmd, payload);
            return true;
        }
        var func = _commands && _commands[cmd];
        if (func) {
            func(payload);
            _commandsSuccess && _commandsSuccess(cmd, payload);
            return true;
        }
    }


    /////////////////////////////////////////////////

    ns.silent = true;
    var _mainWindow = false;
    ns.isMainWindow = function () {
        return _mainWindow;
    }

    var _iframeWindow = false;
    ns.isIframeWindow = function () {
        return _iframeWindow;
    }

    /////////////////////////////////////////////////

    var openerWindow;   //the client window
    var _openWindows = {};  //all the windows opened from main

    function doCloseWindow(url) {
        var source = _openWindows[url];
        source && ns.sendPostMessage('windowClosed', { isMainWindow: _mainWindow }, [source])
    }

    function doOpenWindow(url, onClose) {
        if (!url) return;

        _mainWindow = true;


        //url is the key only allow one...
        if (_openWindows[url]) {
            return _openWindows[url];
        }

        var win = window.open(url, "_blank"); //i think windowOpen only works in IE
        win.name = url;
        _openWindows[win.name] = win;

        ns.registerCommandResponse({
            removeWindow: function (payload) {
                if (payload && !payload.isMainWindow) {
                    var key = payload.name;
                    removeOpenWindow(key);
                    onClose && onClose();
                }
            }
        });

        function removeOpenWindow(key) {
            //can you just get the url from the window?
            if (_openWindows[key]) {
                delete _openWindows[key];
            }
        }


        return win;
    }


    /////////////////////////////////////////////////







    // Default destination is the opening window (if any)
    function setupMessageEvents() {
        // Function to receive a CrossDomain message
        ns.receivePostMessage = function (event) {
            try {
                log('Received message from ' + event.origin + ': ' + event.data);
                var message = JSON.parse(event.data);
                if (message) {
                    var payload = message.isJsonPayload ? message.payload : JSON.parse(message.payload);
                    processReceivedMessage(message.command, payload);
                }
            } catch (e) {
                errorLog('Invalid message received ' + e);
            }
        }
        
        window.addEventListener('message', ns.receivePostMessage, false);

        // Function to send a CrossDomain message
        ns.sendPostMessage = function (command, payload, destinations) {
            try {
                var message = JSON.stringify({
                    command: command,
                    payload: payload,
                    isJsonPayload: !payload || typeof payload !== 'string',
                });
                log('Sending message: ' + message);
                destinations.forEach(function(source) {
                    source.postMessage(message, '*');
                });
            } catch (e) {
                errorLog('Invalid message received ' + e);
            }
        }
    }


    ns.sendMessage = function (command, payload, delay) {
        var wait = delay ? delay : 0;
        window.setTimeout(function () {
            if (openerWindow) { //you are a client window
                ns.sendPostMessage(command, payload, [openerWindow]);
            }
            else if (ns.isMainWindow()) {
                var list = [];
                for(var key in _openWindows) {
                    list.push(_openWindows[key]);
                }
                ns.sendPostMessage(command, payload, list);
            }
        }, wait);
    }

    //same name for the same thing
    ns.sendCommand = ns.sendMessage;





    function processReceivedMessage(command, payload) {
        var isCmd = isString(command);
        if (isCmd && processCommand(command, payload)) {
            return true;
        }

        if (isCmd && !ns.silent) {
            alert(command + ' WAS NOT PROCESSED ' + window.location.pathname);
            return false;
        }
    }


    ns.doCommand = function (command, payload, delay) {

        var func = _commands[command];
        if (func) {
            func(payload);
            return true;
        }

        var wait = delay ? delay : 0;
        window.setTimeout(function () {
            processReceivedMessage(command, payload, true)
        }, wait);
    }



    ns.closeWindow = function (name) {
        var keys = name ? [name] : Object.keys(_openWindows);
        keys.forEach(function (url) {
            doCloseWindow(url);
        })
    }


    //having only once instance of destinationWindow prevents you from 
    //opening more than one window
    ns.openWindow = function (url, onClose) {

        var win = doOpenWindow(url, onClose); //i think windowOpen only works in IE
        return win;
    }

    //having only once instance of destinationWindow prevents you from 
    //opening more than one window
    ns.openIFrameWindow = function (iframeUrl, loadingUri, onClose) {

        var query = '?src=' + decodeURIComponent(loadingUri);
        var url = iframeUrl + query;

        _iframeWindow = true;
        var win = doOpenWindow(url, onClose); //i think windowOpen only works in IE
        return win;
    }


    function setupOpenerEvents(destination) {
        //this is the default case if the hub is just loaded
        if (destination && !openerWindow) {
            openerWindow = destination;
            //this means the window is the child window and 
            //destinationWindow is the parent window who launched you
            window.onbeforeunload = function (evt) {
                var location = window.location;
                var context = location.pathname.slice(0, location.pathname.indexOf('/', 1));
                ns.sendPostMessage('removeWindow', {
                    isMainWindow: _mainWindow,
                    href: location.href,
                    pathname: location.pathname,
                    search: location.search,
                    context: context,
                    name: window.name,
                }, [openerWindow])
            }

            ns.registerCommandResponse({
                windowClosed: function (payload) {
                    if (payload && payload.isMainWindow) {
                        window.close();
                    }
                },
                removeWindow: function (payload) {
                    if (payload && !payload.isMainWindow) {
                        var key = payload.name;
                        removeOpenWindow(key);
                        onClose && onClose();
                    }
                }
            });

        }
    }


    setupOpenerEvents(window.opener);
    setupMessageEvents();

    //this will auto set a client used in an iFrame
    if (window.parent && !window.opener) {
        var parent = window.parent;
        var iframe = undefined; // parent.document.getElementsByTagName('iframe');
        if (!iframe) return;

        setupOpenerEvents(parent);
        ns.registerCommandResponse({
            windowClosed: function (payload) {
                if (payload && payload.isMainWindow) {
                    parent.close();
                }
            },
        });
    }


	
}(Foundry.clientPostMessage));