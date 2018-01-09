/*
    Foundry.hub.js part of the FoundryJS project
    Copyright (C) 2012 Steve Strong  http://foundryjs.azurewebsites.net/

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of the
    License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/


var Foundry = Foundry || {};
Foundry.hub = Foundry.hub || {};

//this module lets you send data and commands between windows
//it extends the normal pub/sub API in foundry core


(function (ns, fo, undefined) {

    function log(message) {
        fo.trace && fo.trace.log(message);
    }

    ns.subscribe = function (topic, callback) {
        fo.subscribe(topic, callback);
    };
    ns.unsubscribe = function (topic, callback) {
        fo.unsubscribe([topic, callback]);
    };
    ns.publish = function (topic, args) {
        fo.publish(topic, args);
    };


    var _commands = {};
    ns.registerCommand = function (cmdJSON) {
        _commands = _commands ? _commands : {};
        return fo.utils.extend(_commands, cmdJSON);
    }




    var _commandResponses = {};
    ns.registerCommandResponse = function (cmdJSON) {
        _commandResponses = _commandResponses ? _commandResponses : {};
        return fo.utils.extend(_commandResponses, cmdJSON);
    }

    ns.sendCommand = function (command, payload, delay) {
        ns.sendMessage(command, payload, delay);
    }



    function processCommand(cmd, payload) {
        var func = _commandResponses[cmd];
        if (func) {
            func(payload);
            return true;
        }
        var func = _commands[cmd];
        if (func) {
            func(payload);
            return true;
        }
    }


    var mainWindow = false;
    var destinationWindow = window.opener;

    ns.isWindowOpen = function () {
        return destinationWindow ? true : false;
    }
    ns.isMainWindow = function () {
        return mainWindow;
    }

    var crossDomain = false;
    ns.isCrossDomain = function () {
        return crossDomain;
    }

    ns.setCrossDomain = function (value) {
        if (value == crossDomain) return;
        toggleCrossDomain(value)
    }


    // Default destination is the opening window (if any)
    function toggleCrossDomain(value) {
        crossDomain = value;
        // Function to receive a CrossDomain message
        ns.receiveCrossDomainMessage = function (event) {
            try {
                log('Received message from ' + event.origin + ': ' + event.data);
                var message = JSON.parse(event.data);
                if (message) {
                    var payload = message.json ? JSON.parse(message.payload) : message.payload;
                    processReceivedMessage(message.command, payload);
                }
            } catch (e) {
                log('Invalid message received');
            }
        }
        if (crossDomain)
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
                    payload: payload,
                    json: typeof payload === 'string' ? false : true,
                });
                log('Sending message: ' + message);
                destination.postMessage(message, '*');
            } catch (e) {
                log('Unable to send message');
            }
        }
    }

    toggleCrossDomain(crossDomain);

    ns.sendMessage = function (command, payload, delay) {
        var wait = delay ? delay : 0;
        window.setTimeout(function () {
            if (crossDomain) {
                ns.sendCrossDomainMessage(destinationWindow, command, payload);
            } else {
                if (destinationWindow && destinationWindow.receiveMessage) {
                    //it is the other windows that receives messages
                    destinationWindow.receiveMessage(command, payload);
                }
            }

        }, wait);
    }


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

    function processReceivedMessage(command, payload, silent) {
        var isCmd = fo.utils.isString(command);
        if (isCmd && processCommand(command, payload)) {
            return true;
        }

        if (isCmd && !silent) {
            alert(command + ' WAS NOT PROCESSED ' + window.location.pathname);
            return false;
        }

       //ns.broadcastUICommand(command, payload);
        //ns.broadcastDataQuery(command, payload);
    }


    //SRS test if this is right
    ns.getHttpContext = function () {
        return location.protocol + "//" + location.host + location.pathname.slice(0, location.pathname.indexOf('/', 1));
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

    if (destinationWindow) {
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

    //having only once instance of destinationWindow prevents you from 
    //opening more than one window
    ns.openWindow = function (url, onClose) {
        //this means the window is the window who launched the child
        //destinationWindow is the child window who was launched
        if (destinationWindow) return destinationWindow;

        mainWindow = true;
        destinationWindow = window.open(url, "_blank"); //i think windowOpen only works in IE
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


    ns.closeWindow = function () {
        if (destinationWindow) {
            //this should clear other window automatically because 
            //the destinationWindow will send this window a windowClosed message also
            closeCurrentWindow();
        }
    }

    //having only once instance of destinationWindow prevents you from 
    //opening more than one window
    ns.openIFrameWindow = function (url, loadingUri, onClose) {
        //this means the window is the window who launched the child
        //destinationWindow is the child window who was launched
        if (destinationWindow) return destinationWindow;

        mainWindow = true;
        toggleCrossDomain(true);
        destinationWindow = window.open(url, "_blank"); //i think windowOpen only works in IE
        //now create an iframe in that window
        var doc = destinationWindow.document;
        var iframe = doc.getElementById('iframe');
        //iframe.width = '100%';
        //iframe.height = '100%';
        //iframe.src = loadingUri;
        //doc.body.appendChild(iframe);
        destinationWindow = iframe;

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




	//command and Control 
    var UIChannel = 'IUCommand';
    ns.broadcastUICommand = function (command, payload) {
        ns.publish(UIChannel, [command, payload]);
    };
    ns.subscribeUICommand = function (func) {
        ns.subscribe(UIChannel, func);
    };



    var DQChannel = 'DataQueryCommand';
    ns.broadcastDataQuery = function (command, payload) {
        ns.publish(DQChannel, [command, payload]);
    };
    ns.subscribeDataQuery = function (func) {
        ns.subscribe(DQChannel, func);
    };


	
}(Foundry.hub, Foundry));