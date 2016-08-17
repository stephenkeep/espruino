// See Wifi Documentation here: http://www.espruino.com/ESP8266_WifiUsage

var wifi = require("Wifi");
var http = require("http");

function hexToRgb(hex) {
    // No RegEx in Espruino yet...
    var R, G, B;
    if (hex.length == 3) {
        R = hex.substring(0, 1);
        R = R + R;
        G = hex.substring(1, 2);
        G = G + G;
        B = hex.substring(2, 3);
        B = B + B;
    } else {
        R = hex.substring(0, 2);
        G = hex.substring(2, 4);
        B = hex.substring(4, 6);
    }

    return {
        R: parseInt(R, 16),
        G: parseInt(G, 16),
        B: parseInt(B, 16)
    };
}

function Witty() {
    var self = this;
    this.colorIntervalId = null;
    this.colorDuration = 1000;
    this.PIN_LDR = 0;
    this.PIN_BUTTON = 4;
    this.PIN_LED_R = 15;
    this.PIN_LED_G = 12;
    this.PIN_LED_B = 13;

    this.buttonActions = [];

    this._btnWatch = setWatch(
      function(evt) {
        for (var i = 0; i < self.buttonActions.length; i++) {
          self.buttonActions[i].apply(self, [evt]);
        }
      },
      this.PIN_BUTTON,
      {repeat: true, edge: 'rising'}
    );
    // TODO:csd - Not working
    this._ldrWatch = setWatch(
      function(evt) {
        console.log("LDR", evt);
      },
      this.PIN_LDR,
      {repeat:true}
    );
}

Witty.prototype.addButtonAction = function(fn) {
    this.buttonActions.push(fn); 
};

Witty.prototype.getPhotoResistance = function() {
    return analogRead(0);
};

Witty.prototype.setLED = function(hex) {
    console.log("Setting LED", hex);
    var result = hexToRgb(hex);
    console.log("Which is", result);
    digitalWrite(this.PIN_LED_R, result.R);
    digitalWrite(this.PIN_LED_G, result.G);
    digitalWrite(this.PIN_LED_B, result.B);
};

var witty = new Witty();
witty.addButtonAction(function(evt) {
    console.log("Button pressed", evt.state, evt.time, evt.lastTime);
    console.log("Photo resistance is", witty.getPhotoResistance());
    
    http.get("http://192.168.1.111:1880/living-room-lamps", function(res) {
        res.on('data', function(data) {
            console.log(data);
        });
    });
});

witty.setLED("f00");

/**
 * Handles the connection for the wifi.connect call.
 * 
 * @param {Error} err
 */
function onConnect(err) {
    if(err) {
        console.log("An error has occured :( ", err.message);
    } else {
        console.log("Connected with IP : ", wifi.getIP().ip);
        witty.setLED("0f0");
    }
}

E.on('init', function() {
    wifi.connect("skeep", { password: "Burnley33" }, onConnect);
});
