
var Foundry = Foundry || {};
Foundry.clientHub = Foundry.clientHub || {};
Foundry.tools = Foundry.tools || {};

//this module lets you send data and commands between windows
//it extends the normal pub/sub API in foundry core


(function (ns, fo, tools, undefined) {

    function log(message) {
        console.log(message);
    }
    function noop() { }

    var _commands = {};
    var _commandsSuccess = noop;
    ns.registerCommand = function (cmdJSON, onSuccess) {
        _commands = _commands ? _commands : {};
        if (onSuccess) _commandsSuccess = onSuccess;
        return tools.mixin(_commands, cmdJSON);
    }



    var _commandResponses = {};
    var _commandResponsesSuccess = noop;
    ns.registerCommandResponse = function (cmdJSON, onSuccess) {
        _commandResponses = _commandResponses ? _commandResponses : {};
        if (onSuccess)  _commandResponsesSuccess = onSuccess;
        return tools.mixin(_commandResponses, cmdJSON);
    }

    ns.sendCommand = function (command, payload, delay) {
        ns.sendMessage(command, payload, delay);
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



    var mainWindow = false;
    var destinationWindow;;

    ns.isWindowOpen = function () {
        return destinationWindow ? true : false;
    }
    ns.isMainWindow = function () {
        return mainWindow;
    }

    var _iframeWindow = false;
    ns.isIframeWindow = function () {
        return _iframeWindow;
    }

    var _crossDomain = false;
    ns.isCrossDomain = function () {
        return _crossDomain;
    }


    ns.isClientOpenerOrIframe = function () {
        var params = tools.getQueryParams(window.location.search);
        if (params.setCrossDomain) {
            toggleCrossDomain(true);
        }

        if (destinationWindow) return;

        //i think this makes the parent window the iframe
        if (window.parent && !window.opener) {
            var parent = window.parent;
            setDestinationWindow(parent);
            toggleCrossDomain(true);
            try {
                parent.receiveMessage = function (command, payload) {
                    if ('windowClosed'.matches(command)) return;
                    processReceivedMessage(command, payload);
                };
            } catch (e) {

            }

        }
    }


    // Default destination is the opening window (if any)
    function toggleCrossDomain(value) {
        _crossDomain = value;
        // Function to receive a CrossDomain message
        ns.receiveCrossDomainMessage = function (event) {
            try {
                log('Received message from ' + event.origin + ': ' + event.data);
                var message = JSON.parse(event.data);
                if (message) {
                    var payload = message.isJsonPayload ? message.payload : JSON.parse(message.payload);
                    processReceivedMessage(message.command, payload);
                }
            } catch (e) {
                log('Invalid message received');
            }
        }
        if (ns.isCrossDomain())
            window.addEventListener('message', ns.receiveCrossDomainMessage, false);
        else
            window.removeEventListener('message', ns.receiveCrossDomainMessage);

        // Function to send a CrossDomain message
        ns.sendCrossDomainMessage = function (destination, command, payload) {
            if (!destination || destination.closed) {
                log('No window or window closed');
                return false;
            }

            try {
                var message = JSON.stringify({
                    command: command,
                    payload: payload ,
                    isJsonPayload: !payload || typeof payload !== 'string',
                });
                log('Sending message: ' + message);
                destination.postMessage(message, '*');
            } catch (e) {
                log('Unable to send message');
            }
        }
    }


    ns.sendMessage = function (command, payload, delay) {
        var wait = delay ? delay : 0;
        window.setTimeout(function () {
            if (ns.isCrossDomain()) {
                ns.sendCrossDomainMessage(destinationWindow, command, payload);
            }
            else if (ns.isIframeWindow()) {
               destinationWindow.receiveMessage(command, payload);
            }
            else if (destinationWindow && destinationWindow.receiveMessage) {
                //it is the other windows that receives messages
                destinationWindow.receiveMessage(command, payload);
            }

        }, wait);
    }


    ns.silent = false;


    function closeCurrentWindow() {
        var temp = destinationWindow;
        stopMessageProcessing();
        if (temp && temp.receiveMessage) {
            temp.receiveMessage('windowClosed', {isMainWindow: mainWindow})
        }
        destinationWindow = undefined;
    }

    function stopMessageProcessing() {
        destinationWindow = undefined;
        _commandResponses = undefined;
        delete window.receiveMessage;
    }

    function processReceivedMessage(command, payload) {
        var isCmd = tools.isString(command);
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




    //having only once instance of destinationWindow prevents you from 
    //opening more than one window
    ns.openWindow = function (url, onClose) {
        //this means the window is the window who launched the child
        //destinationWindow is the child window who was launched
        if (destinationWindow) return destinationWindow;

        mainWindow = true;
        destinationWindow = window.open(url, "_blank"); //i think windowOpen only works in IE
        //now create an iframe in that window

        window.isServer = true;
        window.onbeforeunload = function (evt) {
            closeCurrentWindow();
        }

        ns.registerCommandResponse({
            windowClosed: function (payload) {
                if (payload && !payload.isMainWindow) {
                    onClose && onClose(destinationWindow);
                    destinationWindow = undefined;
                }
            }
        });

        window.receiveMessage = function (command, payload) {
            //alert('parent window receiveMessage');
            processReceivedMessage(command, payload);
        }
        return destinationWindow;
    }


    ns.closeWindow = function () {
        if (destinationWindow) {
            //this should clear other window automatically because 
            //the destinationWindow will send this window a windowClosed message also
            closeCurrentWindow();
        }
    }


    //having only once instance of destinationWindow prevents you from 
    //opening more than one window
    ns.openCrossDomainWindow = function (url, onClose) {
        //this means the window is the window who launched the child
        //destinationWindow is the child window who was launched
        if (destinationWindow) return destinationWindow;

        mainWindow = true;
        toggleCrossDomain(true);
        var params = "?setCrossDomain=true";

        destinationWindow = window.open(url + params, "_blank"); //i think windowOpen only works in IE
        //now create an iframe in that window

        window.onbeforeunload = function (evt) {
            closeCurrentWindow();
        }

        ns.registerCommandResponse({
            windowClosed: function (payload) {
                if (payload && !payload.isMainWindow) {
                    onClose && onClose(destinationWindow);
                    destinationWindow = undefined;
                }
            }
        });

        window.receiveMessage = function (command, payload) {
            //alert('parent window receiveMessage');
            processReceivedMessage(command, payload);
        }
        return destinationWindow;
    }

    //having only once instance of destinationWindow prevents you from 
    //opening more than one window
    ns.openIFrameWindow = function (iframeUrl, loadingUri, onClose) {
        //this means the window is the window who launched the child
        //destinationWindow is the child window who was launched
        if (destinationWindow) return destinationWindow;

        var params = tools.makeQueryParams({
            src: loadingUri,
            setCrossDomain: true,
        });
        var query = '?' +  tools.mapOverKeyValue(params, function (key, value) {
            return '{0}={1}'.format(key, value);
        }).join('&')

        _iframeWindow = true;
        mainWindow = true;
        destinationWindow = window.open(iframeUrl + query, "_blank"); //i think windowOpen only works in IE

        window.onbeforeunload = function (evt) {
            closeCurrentWindow();
        }

        ns.registerCommandResponse({
            windowClosed: function (payload) {
                if (payload && !payload.isMainWindow) {
                    onClose && onClose(destinationWindow);
                    destinationWindow = undefined;
                }
            }
        });

        window.receiveMessage = function (event) {
            try {
                log('Received message from ' + event.origin + ': ' + event.data);
                var message = JSON.parse(event.data);
                if (message) {
                    var payload = message.isJsonPayload ? message.payload : JSON.parse(message.payload);
                    processReceivedMessage(message.command, payload);
                }
            } catch (e) {
                log('Invalid message received');
            }
        }
        return destinationWindow;
    }

    function setDestinationWindow(destination) {
        //this is the default case if the hub is just loaded
        if (destination && !destinationWindow) {
            destinationWindow = destination;
            //this means the window is the child window and 
            //destinationWindow is the parent window who launched you
            window.onbeforeunload = function (evt) {
                closeCurrentWindow();
            }

            ns.registerCommandResponse({
                windowClosed: function (payload) {
                    closeCurrentWindow();
                    window.close(); //we should close this window also
                }
            });

            window.receiveMessage = function (command, payload) {
                processReceivedMessage(command, payload);
            }
        }
    }

    setDestinationWindow(window.opener);
    toggleCrossDomain(ns.isCrossDomain());




	
}(Foundry.clientHub, Foundry, Foundry.tools));