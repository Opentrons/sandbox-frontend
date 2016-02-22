/*
'communication.js' handles all the communication details with
the driver via crossbar.io with WAMP along with 'socketHandler.js'

aubahn.min.js required...
<script type="text/javascript" src="./js/autobahn.min.js"></script>

/*




/* GLOBAL VARIABLES */

var globalConnection1;
var id;
var driver_id;


/* Cookie Helpers */
function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1);
        if (c.indexOf(name) == 0) return c.substring(name.length,c.length);
    }
    return "";
}


function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
}
/* Initialize communication */

window.addEventListener ('load', function() {
	id = getCookie('otone-client-id');
	driver_id = getCookie('otone-driver-id');
	// Initialize the server/router url based off where the file came from
	var wsuri;
 	if (document.location.origin == "file://") {
		wsuri = "ws://127.0.0.1:8080/ws";
	} else {
    	//wsuri = (document.location.protocol === "http:" ? "ws:" : "wss:") + "//0.0.0.0:8080/ws";
    	wsuri = (document.location.protocol === "http:" ? "ws:" : "wss:") + "//10.10.1.2:8080/ws";
    	console.log("wsuri: " + wsuri);
    	//document.location.host + "/ws";
	}

	// Initialize the WAMP connection to the Router
	var connection1 = new autobahn.Connection({
		url: wsuri,
		realm: "ot_realm"
	});

	// Make connection accessible across the entire document
	globalConnection1 = connection1;

	connection1.onclose = function () {
		//TODO: whatever happens onclose
	};

	// When we open the connection, subscribe and register any protocols
	connection1.onopen = function(session) {
		
		// TODO: things that happens onopen
		// Subscribe and register all function end points we offer from the 
		// javascript to the other clients (ie python)

		//connection1.session.publish('com.opentrons.driver_handshake', [true]);
		if (id=="") {
			sendMessage('com.opentrons.driver_handshake',driver_id,id,'handshake','driver','extend','');
		} else {
			sendMessage('com.opentrons.driver_handshake',id,id,'handshake','driver','extend','');
		}
		
		connection1.session.subscribe('com.opentrons.frontend', function(str) {
			try{
				console.log('message on com.opentrons.frontend:\n'+str);
				var msg = JSON.parse(str);
				// TODO: add socketHandler here
				/* add socketHandler here */

				var msg = JSON.parse(str);
        		//if(msg.type && socketHandler[msg.type]) socketHandler[msg.type](msg.data);
        		//
        		// socketHandler format is no longer {'type': ... , 'data': ... }
        		// now it's {'name' , '' } ... TODO: run a test to confirm format and then finish this

				if (msg.type){
					console.log('socketHandler will be called here');
					if (socketHandler[msg.type]) socketHandler[msg.type](msg);
				} else {
					console.log('error, msg missing type');
				}
			} catch(e) {
				console.log('error handling message');
				console.log(e.message);
			}
		});

	};
	connection1.open();
});


/* Send messages function */

function sendMessage (topic,to,sessionID,type,name,message,param) {
	try{
		console.log('topic: ',topic);
		console.log('to: ',to);
		console.log('sessionID: ',sessionID);
		console.log('type: ',type);
		console.log('name: ',name);
		console.log('message: ',message);
		console.log('param: ',param);
		var msg = {
			'to':to,
			'from':id,
			'sessionID':id
			'type':type,
		};
		var dat = {'name':name};
		var mp = {};
		mp[message] = param;
		dat['message'] = mp;
		msg['data'] = dat;
		console.log('sending a message on ',topic,':\n'+JSON.stringify(msg));
		globalConnection1.session.publish(topic, [JSON.stringify(msg)]);
	} catch(e) {
		console.log('error sending message');
		console.log(e.message);
	}
}