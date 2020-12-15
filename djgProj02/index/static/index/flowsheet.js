//"use strict";
//import {processFlowsheet} from './parseFlowsheet.js'; // does not work with paperscript, would need to use java script
// instead of paperscript

// key global points
//let app
//{
//    let glbl01;
//}

function drawObj(x,y,h,w,name,dynclass)
{
    var topLeft = new Point(x,y);
    //console.log(topLeft);
    var size = new Size(w,h); // paper script size takes width first then height
    //console.log(size);

    // 2 ways to draw a rectangle
    //var rect = new Rectangle(x,y,w,h);
    // or
    var rect = new Path.Rectangle(topLeft,size);
    if(dynclass != undefined)
    {
        if(dynclass.endsWith('TANK'))
        {
           rect.fillColor = 'blue';
        }
        else if(dynclass.endsWith('SOURCE'))
        {
            rect.fillColor = 'grey';
        }
        else if(dynclass.endsWith('SINK'))
        {
            rect.fillColor = 'grey';
        }
        else if(dynclass.endsWith('VALVE'))
        {
            rect.fillColor = 'yellow';
        }
        else
        {
           rect.fillColor = 'cornflowerblue';
        }
         // TODO: when parsing JSON, store the DYNSIM type/class in the generic data object
         rect.data.class = dynclass;
    }
    else
    {
       rect.fillColor = 'red';
    }


    if(name != undefined && name != '') // should always be defined
    {
       rect.name = name;
       var txt = new PointText(new Point(x,y));
       txt.justification = 'center';
       txt.fillColor = 'black';
       txt.content = name;
       // TODO: this is valid because the position is the center of the rectangle
       // could use bounds property go calc actual width and height of text
       var xmid = x + w/2;
       txt.position = new Point(xmid,y+h+15);
       txt.name = '.txt.' + name;
       // TODO: can group the label and the object

       // make sources and sinks a different color


    }

    console.log(rect);

}

// for Transmitter and PID
function drawCircle(x,y,h,w,name,dynclass)
{
// original Java code ties everything top left, paperscript positions circles at center
    var topLeft = new Point(x+w/2,y+h/2);
    //console.log(topLeft);
    var radius = (w + h)/4; // for circles, w and h should always be the same
    //console.log(radius);


    var circle = new Path.Circle(topLeft, radius);
    if(dynclass != undefined)
    {
        if(dynclass.endsWith('PID'))
        {
           circle.fillColor = 'orange';
        }
        else if(dynclass.endsWith('TRANSMITTER'))
        {
            circle.fillColor = 'purple';
        }
        else
        {
           circle.fillColor = 'cornflowerblue';
        }
         // TODO: when parsing JSON, store the DYNSIM type/class in the generic data object
         circle.data.class = dynclass;
    }
    else
    {
       circle.fillColor = 'red';
    }


// for transmitters and controllers, default label position is above
    if(name != undefined && name != '') // should always be defined
    {
       circle.name = name;
       var txt = new PointText(new Point(x,y));
       txt.justification = 'center';
       txt.fillColor = 'black';
       txt.content = name;
       // TODO: this is valid because the position is the center of the circle
       // could use bounds property go calc actual width and height of text

       txt.position = new Point(x+w/2,y-h/2); // add font size as well
       txt.name = '.txt.' + name;
       // TODO: can group the label and the object
    }

    console.log(circle);

}


function drawValve(x,y,h,w,name)
{
//     var v = new Path();
//     v.strokeColor = 'red';
//     v.add(new Point(0, 0), new Point(0, h), new Point(w, 0), new Point(w, h));
//     v.closed = true;
//     v.position = new Point(x,y);
     // until we get the svg working, we will draw a valve with lines
     var tr1 = new Path.RegularPolygon(new Point(100,100), 3, w/2);
     tr1.rotate(90);
     var tr2 = new Path.RegularPolygon(new Point(100+w/2+2,100), 3, w/2);
     tr2.rotate(-90);

     var valve = new Group([tr1, tr2]);
     valve.style = {
        fillColor: 'gold'
        //strokeColor: 'black',
        //strokeWidth: 1
     };

     valve.position = new Point(x + w/2, y + h/2);

     if(name != 'undefined')
     {
        valve.name = name
        var txt = new PointText(new Point(x,y));
        txt.justification = 'center';
        txt.fillColor = 'black';
        txt.content = name;
        // TODO: this is valid because the position is the center of the rectangle
        // could use bounds property go calc actual width and height of text
        var xmid = x + w/2;
        txt.position = new Point(xmid,y+h+15);
        txt.name = '.txt.' + name;
        // TODO: can group the label and the object

        // using a group is not necessarily the best way to go here.
        // Probably best to draw an invisible rectangle that will
        // respond to the hit test and move the items inside it
        valve.addChild(txt);
     }
}

// get started with some code
// x,y,h,w taken manually from FS1.GMB.JSON from RenderTest.js4m

//var src = drawObj(95,144,55,55,'SRC1','SOURCE');
//var snk = drawObj(707,200,55,55,'SNK1','SINK');
//var tnk = drawObj(380,169,55,55,'T1','TANK');
//var vlv1 = drawValve(231,171,24,24,'XV1');
//var vlv2 = drawValve(548,192,24,24,'XV2');



var hitOptions = {
	segments: true,
	stroke: true,
	fill: true,
	tolerance: 5
};

// hit testing and dragging code taken from paperjs website exanple
// http://paperjs.org/examples/hit-testing/
var segment, path;
var movePath = false;
function onMouseDown(event) {
	segment = path = null;
	var hitResult = project.hitTest(event.point, hitOptions);
	if (!hitResult)
		return;

	if (event.modifiers.shift) {
		if (hitResult.type == 'segment') {
			hitResult.segment.remove();
		};
		return;
	}

	if (hitResult) {
		path = hitResult.item;
		console.log(hitResult.type);
		if (hitResult.type == 'segment') {
			segment = hitResult.segment;
		} else if (hitResult.type == 'stroke') {
			var location = hitResult.location;
			segment = path.insert(location.index + 1, event.point);
			path.smooth();
		}
	}
	movePath = hitResult.type == 'fill';
	if (movePath)
		project.activeLayer.addChild(hitResult.item);
}

function onMouseMove(event) {
	project.activeLayer.selected = false;
	if (event.item)
		event.item.selected = true;
}

function onMouseDrag(event) {
	if (segment) {
		segment.point += event.delta;
		path.smooth();
	} else if (path) {
		path.position += event.delta;
	}
}








//----------------------------------------------------------------
//                       DATA REGION
// data below is accessible even though it is below function calls
//----------------------------------------------------------------
var g2Gmb = {
    "elements": [
      {
        "vertices": [
          -21,
          26,
          -21,
          28,
          3,
          28,
          3,
          -5,
          106,
          -5
          ],
        "cat": "MODEL CONNECTOR",
        "name": "S5",
        "x": 605,
        "width": 98,
        "index": 0,
        "y": 114,
        "params": {
          "elementID": 15,
          "startPortLoc": "584,140;BaseProdVapor",
          "nameSegment": -2,
          "dataStatus": 212,
          "isEndRemote": false,
          "connectorData": "D101.OProdVapor = PV101.OFeedStream",
          "labelFontInfo": "",
          "nameLocation": 4,
          "endPortLoc": "711,109;FeedPort",
          "endObject": "",
          "isStartRemote": false,
          "startObject": "",
          "showEndPortName": false,
          "showStartPortName": false,
          "startPortLabel": "OProdVapor",
          "clientClassName": "com.sim4me.gmb.canvas.GMBModelConnector"
        },
        "ports": [],
        "class": "com.sim4me.gmb.models.STREAM",
        "height": 62
      },
      {
        "vertices": [
          -74,
          0,
          -74,
          0,
          -69,
          0,
          -69,
          69,
          54,
          69
          ],
        "cat": "MODEL CONNECTOR",
        "name": "S15",
        "x": 387,
        "width": 114,
        "index": 1,
        "y": 483,
        "params": {
          "elementID": 21,
          "startPortLoc": "313,483;BaseProdLiquid",
          "nameSegment": -1,
          "ConnectorArrow": 2,
          "dataStatus": 212,
          "isEndRemote": false,
          "connectorData": "D102.OProdLiquid = P102.OFeedStream",
          "labelFontInfo": "",
          "nameLocation": 4,
          "endPortLoc": "441,552;FeedPort",
          "endObject": "",
          "isStartRemote": false,
          "startObject": "",
          "showEndPortName": false,
          "showStartPortName": false,
          "startPortLabel": "OProdLiquid",
          "clientClassName": "com.sim4me.gmb.canvas.GMBModelConnector"
        },
        "ports": [],
        "class": "com.sim4me.gmb.models.STREAM",
        "height": 174
      },
      {
        "vertices": [
          474,
          52,
          474,
          0,
          423,
          0,
          423,
          100,
          3,
          100
          ],
        "cat": "DrawElement",
        "name": "",
        "x": 331,
        "width": 476,
        "index": 2,
        "y": 327,
        "params": {
          "elementID": 99,
          "fillColorParam": [
            0,
            0,
            0
            ],
          "lineStyle": 3,
          "lineThickness": 1.0,
          "fillParam": false,
          "lineColorParam": [
            0,
            0,
            0
            ]
        },
        "ports": [],
        "class": "com.sim4me.gmb.primitives.GMBPolyline",
        "height": 105
      },
      {
        "vertices": [
          0,
          0,
          287,
          0,
          287,
          75
          ],
        "cat": "DrawElement",
        "name": "",
        "x": 335,
        "width": 294,
        "index": 3,
        "y": 471,
        "params": {
          "elementID": 97,
          "fillColorParam": [
            0,
            0,
            0
            ],
          "lineStyle": 3,
          "lineThickness": 1.0,
          "fillParam": false,
          "lineColorParam": [
            0,
            0,
            0
            ]
        },
        "ports": [],
        "class": "com.sim4me.gmb.primitives.GMBPolyline",
        "height": 75
      },
      {
        "vertices": [
          -1,
          2,
          -1,
          73,
          -26,
          73
          ],
        "cat": "MODEL CONNECTOR",
        "name": "S10",
        "x": 326,
        "width": 48,
        "index": 4,
        "y": 345,
        "params": {
          "elementID": 19,
          "startPortLoc": "325,347;BaseLiquid",
          "nameSegment": -2,
          "dataStatus": 212,
          "isEndRemote": false,
          "connectorData": "T1.OBaseProdLiquid = D102.OFeedStream",
          "labelFontInfo": "",
          "nameLocation": 4,
          "endPortLoc": "300,418;FeedPort",
          "endObject": "",
          "isStartRemote": false,
          "startObject": "",
          "showEndPortName": false,
          "showStartPortName": false,
          "startPortLabel": "OBaseProdLiquid",
          "clientClassName": "com.sim4me.gmb.canvas.GMBModelConnector"
        },
        "ports": [],
        "class": "com.sim4me.gmb.models.STREAM",
        "height": 85
      },
      {
        "vertices": [
          10,
          64,
          0,
          64,
          0,
          1
          ],
        "cat": "MODEL CONNECTOR",
        "name": "S11",
        "x": 308,
        "width": 82,
        "index": 5,
        "y": 346,
        "params": {
          "elementID": 37,
          "startPortLoc": "318,410;BaseProdVapor",
          "nameSegment": -2,
          "dataStatus": 212,
          "isEndRemote": false,
          "connectorData": "D102.OProdVapor = T1.OBaseFeedVapor",
          "labelFontInfo": "",
          "nameLocation": 4,
          "endPortLoc": "308,347;BaseVapor",
          "endObject": "",
          "isStartRemote": false,
          "startObject": "",
          "showEndPortName": false,
          "showStartPortName": false,
          "startPortLabel": "OProdVapor",
          "clientClassName": "com.sim4me.gmb.canvas.GMBModelConnector"
        },
        "ports": [],
        "class": "com.sim4me.gmb.models.STREAM",
        "height": 68
      },
      {
        "vertices": [
          -11,
          -20,
          6,
          -20,
          6,
          13
          ],
        "cat": "MODEL CONNECTOR",
        "name": "MS2",
        "x": 454,
        "width": 30,
        "index": 6,
        "y": 528,
        "params": {
          "elementID": 40,
          "startPortLoc": "443,508;MechPort",
          "nameSegment": -1,
          "dataStatus": 212,
          "isEndRemote": false,
          "connectorData": "M102.OMechStream = P102.OMechStream",
          "labelFontInfo": "",
          "nameLocation": 4,
          "endPortLoc": "460,541;MechPort",
          "endObject": "",
          "isStartRemote": false,
          "startObject": "",
          "showEndPortName": false,
          "showStartPortName": false,
          "startPortLabel": "OMechStream",
          "clientClassName": "com.sim4me.gmb.canvas.GMBModelConnector"
        },
        "ports": [],
        "class": "com.sim4me.gmb.models.MECHSTREAM",
        "height": 50
      },
      {
        "vertices": [
          1,
          3,
          1,
          2,
          138,
          2
          ],
        "cat": "MODEL CONNECTOR",
        "name": "S16",
        "x": 474,
        "width": 152,
        "index": 7,
        "y": 541,
        "params": {
          "elementID": 39,
          "startPortLoc": "475,544;ProductPort",
          "nameSegment": -1,
          "dataStatus": 212,
          "isEndRemote": false,
          "connectorData": "P102.OProdStream = LV102.OFeedStream",
          "labelFontInfo": "",
          "nameLocation": 4,
          "endPortLoc": "612,543;FeedPort",
          "endObject": "",
          "isStartRemote": false,
          "startObject": "",
          "showEndPortName": false,
          "showStartPortName": false,
          "startPortLabel": "OProdStream",
          "clientClassName": "com.sim4me.gmb.canvas.GMBModelConnector"
        },
        "ports": [],
        "class": "com.sim4me.gmb.models.STREAM",
        "height": 41
      },
      {
        "vertices": [
          7,
          1,
          7,
          1,
          67,
          1
          ],
        "cat": "MODEL CONNECTOR",
        "name": "S13",
        "x": 727,
        "width": 71,
        "index": 8,
        "y": 379,
        "params": {
          "elementID": 24,
          "startPortLoc": "734,380;ProductPort",
          "nameSegment": -1,
          "dataStatus": 212,
          "isEndRemote": false,
          "connectorData": "E102.PROCESS.OProdStream = TV101.OFeedStream",
          "labelFontInfo": "",
          "nameLocation": 4,
          "endPortLoc": "794,380;FeedPort",
          "endObject": "",
          "isStartRemote": false,
          "startObject": "",
          "showEndPortName": false,
          "Desc.W": "Steam flow rate",
          "showStartPortName": false,
          "startPortLabel": "PROCESS.OProdStream",
          "clientClassName": "com.sim4me.gmb.canvas.GMBModelConnector"
        },
        "ports": [],
        "class": "com.sim4me.gmb.models.STREAM",
        "height": 8
      },
      {
        "vertices": [
          0,
          129,
          0,
          62,
          96,
          62,
          96,
          6,
          111,
          6
          ],
        "cat": "DrawElement",
        "name": "",
        "x": 443,
        "width": 113,
        "index": 9,
        "y": 163,
        "params": {
          "elementID": 96,
          "fillColorParam": [
            0,
            0,
            0
            ],
          "lineStyle": 3,
          "lineThickness": 1.0,
          "fillParam": false,
          "lineColorParam": [
            0,
            0,
            0
            ]
        },
        "ports": [],
        "class": "com.sim4me.gmb.primitives.GMBPolyline",
        "height": 131
      },
      {
        "vertices": [
          -28,
          6,
          -28,
          1,
          60,
          1
          ],
        "cat": "MODEL CONNECTOR",
        "name": "S12",
        "x": 643,
        "width": 56,
        "index": 10,
        "y": 379,
        "params": {
          "elementID": 23,
          "startPortLoc": "615,385;ProductPort",
          "nameSegment": -1,
          "dataStatus": 212,
          "isEndRemote": false,
          "connectorData": "SO_E102_UTILITY.OProdStream = E102.PROCESS.OFeedStream",
          "labelFontInfo": "",
          "nameLocation": 4,
          "endPortLoc": "703,380;FeedPort",
          "endObject": "",
          "isStartRemote": false,
          "startObject": "",
          "showEndPortName": false,
          "showStartPortName": false,
          "startPortLabel": "OProdStream",
          "clientClassName": "com.sim4me.gmb.canvas.GMBModelConnector"
        },
        "ports": [],
        "class": "com.sim4me.gmb.models.STREAM",
        "height": 12
      },
      {
        "vertices": [
          71,
          24,
          71,
          25,
          6,
          25
          ],
        "cat": "MODEL CONNECTOR",
        "name": "S8",
        "x": 448,
        "width": 59,
        "index": 11,
        "y": 269,
        "params": {
          "elementID": 44,
          "startPortLoc": "519,293;ProductPort",
          "nameSegment": -1,
          "dataStatus": 212,
          "isEndRemote": false,
          "connectorData": "P101.OProdStream = LV101.OFeedStream",
          "labelFontInfo": "",
          "nameLocation": 4,
          "endPortLoc": "454,294;FeedPort",
          "endObject": "",
          "isStartRemote": false,
          "startObject": "",
          "showEndPortName": false,
          "showStartPortName": false,
          "startPortLabel": "OProdStream",
          "clientClassName": "com.sim4me.gmb.canvas.GMBModelConnector"
        },
        "ports": [],
        "class": "com.sim4me.gmb.models.STREAM",
        "height": 6
      },
      {
        "vertices": [
          70,
          3,
          70,
          2,
          203,
          2
          ],
        "cat": "MODEL CONNECTOR",
        "name": "S19",
        "x": 665,
        "width": 203,
        "index": 12,
        "y": 225,
        "params": {
          "elementID": 35,
          "startPortLoc": "735,228;ProductPort",
          "nameSegment": -1,
          "ConnectorArrow": 2,
          "dataStatus": 212,
          "isEndRemote": false,
          "connectorData": "DrainVlv.OProdStream = SI_DRAIN.OFeedStream",
          "labelFontInfo": "",
          "nameLocation": 4,
          "endPortLoc": "868,227;FeedPort",
          "endObject": "",
          "isStartRemote": false,
          "startObject": "",
          "showEndPortName": false,
          "showStartPortName": false,
          "startPortLabel": "OProdStream",
          "clientClassName": "com.sim4me.gmb.canvas.GMBModelConnector"
        },
        "ports": [],
        "class": "com.sim4me.gmb.models.STREAM",
        "height": 31
      },
      {
        "vertices": [
          95,
          47,
          95,
          3,
          2,
          3,
          2,
          50
          ],
        "cat": "DrawElement",
        "name": "",
        "x": 629,
        "width": 97,
        "index": 13,
        "y": 61,
        "params": {
          "elementID": 94,
          "fillColorParam": [
            0,
            0,
            0
            ],
          "lineStyle": 3,
          "lineThickness": 1.0,
          "fillParam": false,
          "lineColorParam": [
            0,
            0,
            0
            ]
        },
        "ports": [],
        "class": "com.sim4me.gmb.primitives.GMBPolyline",
        "height": 52
      },
      {
        "vertices": [
          27,
          75,
          27,
          77,
          2,
          77,
          2,
          4
          ],
        "cat": "MODEL CONNECTOR",
        "name": "S20",
        "x": 557,
        "width": 129,
        "index": 14,
        "y": 65,
        "params": {
          "elementID": 48,
          "startPortLoc": "584,140;BaseProdVapor",
          "nameSegment": -2,
          "dataStatus": 212,
          "isEndRemote": false,
          "connectorData": "D101.OProdVapor = PSV101.OFeedStream",
          "labelFontInfo": "",
          "nameLocation": 4,
          "endPortLoc": "559,69;FeedPort",
          "endObject": "",
          "isStartRemote": false,
          "startObject": "",
          "showEndPortName": false,
          "showStartPortName": false,
          "startPortLabel": "OProdVapor",
          "clientClassName": "com.sim4me.gmb.canvas.GMBModelConnector"
        },
        "ports": [],
        "class": "com.sim4me.gmb.models.STREAM",
        "height": 179
      },
      {
        "vertices": [
          67,
          2,
          67,
          2,
          17,
          2
          ],
        "cat": "MODEL CONNECTOR",
        "name": "S21",
        "x": 477,
        "width": 70,
        "index": 15,
        "y": 51,
        "params": {
          "elementID": 49,
          "startPortLoc": "544,53;ProductPort",
          "nameSegment": -1,
          "ConnectorArrow": 2,
          "dataStatus": 212,
          "isEndRemote": false,
          "connectorData": "PSV101.OProdStream = SI_RELIEFVENT.OFeedStream",
          "labelFontInfo": "",
          "nameLocation": 4,
          "endPortLoc": "494,53;FeedPort",
          "endObject": "",
          "isStartRemote": false,
          "startObject": "",
          "showEndPortName": false,
          "showStartPortName": false,
          "startPortLabel": "OProdStream",
          "clientClassName": "com.sim4me.gmb.canvas.GMBModelConnector"
        },
        "ports": [],
        "class": "com.sim4me.gmb.models.STREAM",
        "height": 9
      },
      {
        "vertices": [
          78,
          55,
          78,
          1,
          0,
          1,
          0,
          56
          ],
        "cat": "DrawElement",
        "name": "",
        "x": 137,
        "width": 80,
        "index": 16,
        "y": 198,
        "params": {
          "elementID": 93,
          "fillColorParam": [
            0,
            0,
            0
            ],
          "lineStyle": 3,
          "lineThickness": 1.0,
          "fillParam": false,
          "lineColorParam": [
            0,
            0,
            0
            ]
        },
        "ports": [],
        "class": "com.sim4me.gmb.primitives.GMBPolyline",
        "height": 58
      },
      {
        "vertices": [
          -1,
          5,
          -1,
          6,
          68,
          6
          ],
        "cat": "MODEL CONNECTOR",
        "name": "S2",
        "x": 228,
        "width": 72,
        "index": 17,
        "y": 249,
        "params": {
          "elementID": 11,
          "startPortLoc": "227,254;ProductPort",
          "nameSegment": -1,
          "dataStatus": 212,
          "isEndRemote": false,
          "connectorData": "FV101.OProdStream = T1.OFeedStream",
          "labelFontInfo": "",
          "nameLocation": 4,
          "endPortLoc": "296,255;LeftFeed",
          "endObject": "",
          "isStartRemote": false,
          "startObject": "",
          "showEndPortName": false,
          "showStartPortName": false,
          "startPortLabel": "OProdStream",
          "clientClassName": "com.sim4me.gmb.canvas.GMBModelConnector"
        },
        "ports": [],
        "class": "com.sim4me.gmb.models.STREAM",
        "height": 8
      },
      {
        "vertices": [
          -30,
          9,
          -30,
          8,
          82,
          8
          ],
        "cat": "MODEL CONNECTOR",
        "name": "S1",
        "x": 122,
        "width": 144,
        "index": 18,
        "y": 246,
        "params": {
          "elementID": 10,
          "startPortLoc": "92,255;ProductPort",
          "nameSegment": -2,
          "dataStatus": 212,
          "isEndRemote": false,
          "connectorData": "SO_FEED.OProdStream = FV101.OFeedStream",
          "labelFontInfo": "",
          "nameLocation": 4,
          "endPortLoc": "204,254;FeedPort",
          "endObject": "",
          "isStartRemote": false,
          "startObject": "",
          "showEndPortName": false,
          "showStartPortName": false,
          "startPortLabel": "OProdStream",
          "clientClassName": "com.sim4me.gmb.canvas.GMBModelConnector"
        },
        "ports": [
          {
            "orientation": 2,
            "showName": 1,
            "connector": "FT101.IN = S1.Q",
            "yPort": 254,
            "lineThickness": 1,
            "name": "Q",
            "x": 139,
            "xPort": 139,
            "y": 254,
            "conFlag": 1
          }
          ],
        "class": "com.sim4me.gmb.models.STREAM",
        "height": 5
      },
      {
        "vertices": [],
        "cat": "DrawElement",
        "name": "",
        "x": 26,
        "width": 219,
        "index": 19,
        "y": 430,
        "params": {
          "elementID": 1,
          "fillColorParam": [
            192,
            192,
            192
            ],
          "lineStyle": 1,
          "lineThickness": 2.0,
          "fillParam": true,
          "lineColorParam": [
            0,
            0,
            0
            ]
        },
        "ports": [],
        "class": "com.sim4me.gmb.primitives.GMBRectangle",
        "height": 91
      },
      {
        "vertices": [],
        "cat": "DrawElement",
        "name": "S4.T",
        "x": 463,
        "width": 70,
        "index": 20,
        "y": 135,
        "params": {
          "elementID": 2,
          "format": "###0.0",
          "valueSize": 50,
          "labelFontInfo": "",
          "pointResized": true,
          "valueFontInfo": "",
          "descSize": 0,
          "pointSize": 0,
          "showValue": true,
          "unitsSize": 20,
          "UnitofMeasure": "",
          "editValue": false,
          "nameSize": 0
        },
        "ports": [],
        "class": "com.sim4me.gmb.references.GMBPointReference",
        "height": 18
      },
      {
        "vertices": [],
        "cat": "MODEL OBJECT",
        "name": "FV101",
        "x": 203,
        "width": 24,
        "index": 21,
        "y": 237,
        "params": {
          "elementID": 3,
          "dataStatus": 212,
          "labelFontInfo": "",
          "fillParam": false,
          "nameLocation": 5,
          "remoteFunction": false,
          "rotateState": 0,
          "fillColorParam": [
            0,
            0,
            0
            ],
          "valveAction": 1,
          "valveType": 0,
          "flipState": 0,
          "imageType": "ImageNormal",
          "clientClassName": "com.sim4me.gmb.models.DynSimValve"
        },
        "ports": [
          {
            "orientation": 2,
            "showName": 0,
            "connector": "S1",
            "yPort": 254,
            "lineThickness": 1,
            "name": "FeedPort",
            "x": 204,
            "xPort": 204,
            "y": 254,
            "conFlag": 2
          },
          {
            "orientation": 1,
            "showName": 1,
            "connector": "FV101.OP = FC101.OUT",
            "yPort": 227,
            "lineThickness": 1,
            "name": "OP",
            "x": 215,
            "xPort": 215,
            "y": 247,
            "conFlag": 2
          },
          {
            "orientation": 2,
            "showName": 0,
            "connector": "S2",
            "yPort": 254,
            "lineThickness": 1,
            "name": "ProductPort",
            "x": 227,
            "xPort": 227,
            "y": 254,
            "conFlag": 1
          }
          ],
        "class": "com.sim4me.gmb.models.VALVE",
        "height": 24
      },
      {
        "vertices": [],
        "cat": "MODEL OBJECT",
        "name": "SO_D101VAP",
        "x": 34,
        "width": 55,
        "index": 22,
        "y": 322,
        "params": {
          "elementID": 4,
          "fillColorParam": [
            0,
            0,
            0
            ],
          "dataStatus": 212,
          "labelFontInfo": "",
          "fillParam": false,
          "nameLocation": 5,
          "flipState": 0,
          "remoteFunction": false,
          "imageType": "ImageNormal",
          "rotateState": 0,
          "clientClassName": "com.sim4me.gmb.canvas.GMBS4MModelObject"
        },
        "ports": [],
        "class": "com.sim4me.gmb.models.SOURCE",
        "height": 55
      },
      {
        "vertices": [],
        "cat": "MODEL OBJECT",
        "name": "SO_FEED",
        "x": 37,
        "width": 55,
        "index": 23,
        "y": 224,
        "params": {
          "elementID": 5,
          "fillColorParam": [
            0,
            0,
            0
            ],
          "dataStatus": 212,
          "labelFontInfo": "",
          "fillParam": false,
          "nameLocation": 5,
          "flipState": 0,
          "remoteFunction": false,
          "imageType": "ImageNormal",
          "rotateState": 0,
          "clientClassName": "com.sim4me.gmb.canvas.GMBS4MModelObject"
        },
        "ports": [
          {
            "orientation": 2,
            "showName": 0,
            "connector": "S1",
            "yPort": 255,
            "lineThickness": 1,
            "name": "ProductPort",
            "x": 92,
            "xPort": 92,
            "y": 255,
            "conFlag": 1
          }
          ],
        "class": "com.sim4me.gmb.models.SOURCE",
        "height": 55
      },
      {
        "vertices": [],
        "cat": "MODEL OBJECT",
        "name": "E102",
        "x": 702,
        "width": 33,
        "index": 24,
        "y": 362,
        "params": {
          "elementID": 6,
          "fillColorParam": [
            0,
            0,
            0
            ],
          "dataStatus": 212,
          "labelFontInfo": "",
          "fillParam": false,
          "nameLocation": 1,
          "flipState": 0,
          "remoteFunction": false,
          "imageType": "ImageNormal",
          "rotateState": 0,
          "clientClassName": "com.sim4me.gmb.canvas.GMBS4MModelObject"
        },
        "ports": [
          {
            "orientation": 1,
            "showName": 0,
            "connector": "HS1",
            "yPort": 398,
            "lineThickness": 1,
            "name": "HeatStreamPort",
            "x": 718,
            "xPort": 718,
            "y": 398,
            "conFlag": 1
          },
          {
            "orientation": 2,
            "showName": 0,
            "connector": "S12",
            "yPort": 380,
            "lineThickness": 0,
            "name": "FeedPort",
            "x": 703,
            "xPort": 703,
            "y": 380,
            "conFlag": 2
          },
          {
            "orientation": 2,
            "showName": 0,
            "connector": "S13",
            "yPort": 380,
            "lineThickness": 0,
            "name": "ProductPort",
            "x": 734,
            "xPort": 734,
            "y": 380,
            "conFlag": 1
          }
          ],
        "class": "com.sim4me.gmb.models.UTILITYEXCHANGER",
        "height": 36
      },
      {
        "vertices": [],
        "cat": "MODEL OBJECT",
        "name": "D101",
        "x": 547,
        "width": 75,
        "index": 25,
        "y": 140,
        "params": {
          "elementID": 7,
          "lParam": false,
          "l2ColorParam": [
            0,
            200,
            255
            ],
          "upperOffset": 2,
          "autoValidateFlowLevels": true,
          "lColorParam": [
            0,
            0,
            255
            ],
          "lowerOffset": 2,
          "dataStatus": 212,
          "labelFontInfo": "",
          "fillParam": false,
          "nameLocation": 3,
          "remoteFunction": false,
          "horizontalOffset": 0,
          "rotateState": 0,
          "l2Param": false,
          "fillColorParam": [
            0,
            0,
            0
            ],
          "flipState": 0,
          "levelIndicationWidth": 12,
          "imageType": "Horizontal",
          "clientClassName": "com.sim4me.gmb.models.DynSimVesselBase"
        },
        "ports": [
          {
            "orientation": 2,
            "showName": 0,
            "connector": "S4",
            "yPort": 156,
            "lineThickness": 1,
            "name": "FeedPort",
            "x": 549,
            "xPort": 549,
            "y": 156,
            "conFlag": 2
          },
          {
            "orientation": 2,
            "showName": 1,
            "connector": "LT101.IN = D101.L",
            "yPort": 177,
            "lineThickness": 1,
            "name": "L",
            "x": 553,
            "xPort": 533,
            "y": 175,
            "conFlag": 1
          },
          {
            "orientation": 1,
            "showName": 0,
            "connector": "S7",
            "yPort": 180,
            "lineThickness": 1,
            "name": "BaseProdLiquid",
            "x": 572,
            "xPort": 572,
            "y": 180,
            "conFlag": 1
          },
          {
            "orientation": 1,
            "showName": 0,
            "connector": "S20",
            "yPort": 140,
            "lineThickness": 1,
            "name": "BaseProdVapor",
            "x": 584,
            "xPort": 584,
            "y": 140,
            "conFlag": 1
          },
          {
            "orientation": 1,
            "showName": 0,
            "connector": "S5",
            "yPort": 140,
            "lineThickness": 1,
            "name": "BaseProdVapor",
            "x": 584,
            "xPort": 584,
            "y": 140,
            "conFlag": 1
          },
          {
            "orientation": 1,
            "showName": 1,
            "connector": "PT101.IN = D101.P",
            "yPort": 122,
            "lineThickness": 1,
            "name": "P",
            "x": 596,
            "xPort": 596,
            "y": 142,
            "conFlag": 1
          },
          {
            "orientation": 1,
            "showName": 0,
            "connector": "S18",
            "yPort": 180,
            "lineThickness": 1,
            "name": "BaseProdLiquid2",
            "x": 597,
            "xPort": 597,
            "y": 180,
            "conFlag": 1
          }
          ],
        "class": "com.sim4me.gmb.models.DRUM",
        "height": 41
      },
      {
        "vertices": [
          -1,
          8,
          -1,
          4,
          94,
          4
          ],
        "cat": "MODEL CONNECTOR",
        "name": "S3",
        "x": 333,
        "width": 96,
        "index": 26,
        "y": 152,
        "params": {
          "elementID": 8,
          "startPortLoc": "332,160;RightProduct",
          "nameSegment": -3,
          "dataStatus": 212,
          "isEndRemote": false,
          "connectorData": "T1.OProdStream = E101.PROCESS.OFeedStream",
          "labelFontInfo": "",
          "nameLocation": 4,
          "endPortLoc": "427,156;FeedPort",
          "endObject": "",
          "isStartRemote": false,
          "startObject": "",
          "showEndPortName": false,
          "showStartPortName": false,
          "startPortLabel": "OProdStream",
          "clientClassName": "com.sim4me.gmb.canvas.GMBModelConnector"
        },
        "ports": [],
        "class": "com.sim4me.gmb.models.STREAM",
        "height": 9
      },
      {
        "vertices": [],
        "cat": "MODEL OBJECT",
        "name": "D102",
        "x": 298,
        "width": 41,
        "index": 27,
        "y": 410,
        "params": {
          "elementID": 9,
          "lParam": false,
          "l2ColorParam": [
            0,
            200,
            255
            ],
          "upperOffset": 2,
          "autoValidateFlowLevels": true,
          "lColorParam": [
            0,
            0,
            255
            ],
          "lowerOffset": 2,
          "dataStatus": 212,
          "labelFontInfo": "",
          "fillParam": false,
          "nameLocation": 8,
          "remoteFunction": false,
          "horizontalOffset": 0,
          "rotateState": 0,
          "l2Param": false,
          "fillColorParam": [
            0,
            0,
            0
            ],
          "flipState": 0,
          "levelIndicationWidth": 12,
          "imageType": "ImageNormal",
          "clientClassName": "com.sim4me.gmb.models.DynSimVesselBase"
        },
        "ports": [
          {
            "orientation": 2,
            "showName": 0,
            "connector": "S10",
            "yPort": 418,
            "lineThickness": 1,
            "name": "FeedPort",
            "x": 300,
            "xPort": 300,
            "y": 418,
            "conFlag": 2
          },
          {
            "orientation": 1,
            "showName": 0,
            "connector": "S15",
            "yPort": 483,
            "lineThickness": 1,
            "name": "BaseProdLiquid",
            "x": 313,
            "xPort": 313,
            "y": 483,
            "conFlag": 1
          },
          {
            "orientation": 1,
            "showName": 0,
            "connector": "S11",
            "yPort": 410,
            "lineThickness": 1,
            "name": "BaseProdVapor",
            "x": 318,
            "xPort": 318,
            "y": 410,
            "conFlag": 1
          },
          {
            "orientation": 2,
            "showName": 0,
            "connector": "HS1",
            "yPort": 446,
            "lineThickness": 1,
            "name": "FluidHeatPort",
            "x": 318,
            "xPort": 318,
            "y": 446,
            "conFlag": 2
          },
          {
            "orientation": 2,
            "showName": 1,
            "connector": "LC102.PV = D102.L",
            "yPort": 486,
            "lineThickness": 1,
            "name": "L",
            "x": 331,
            "xPort": 351,
            "y": 485,
            "conFlag": 1
          },
          {
            "orientation": 2,
            "showName": 1,
            "connector": "TT101.IN = D102.FLASH.T",
            "yPort": 466,
            "lineThickness": 1,
            "name": "FLASH.T",
            "x": 339,
            "xPort": 359,
            "y": 466,
            "conFlag": 1
          }
          ],
        "class": "com.sim4me.gmb.models.DRUM",
        "height": 75
      },
      {
        "vertices": [
          6,
          1,
          32,
          1,
          32,
          1,
          97,
          1
          ],
        "cat": "MODEL CONNECTOR",
        "name": "S4",
        "x": 452,
        "width": 102,
        "index": 28,
        "y": 155,
        "params": {
          "elementID": 12,
          "startPortLoc": "458,156;ProductPort",
          "nameSegment": -1,
          "dataStatus": 212,
          "isEndRemote": false,
          "connectorData": "E101.PROCESS.OProdStream = D101.OFeedStream",
          "labelFontInfo": "",
          "nameLocation": 4,
          "endPortLoc": "549,156;FeedPort",
          "endObject": "",
          "isStartRemote": false,
          "startObject": "",
          "showEndPortName": false,
          "showStartPortName": false,
          "startPortLabel": "PROCESS.OProdStream",
          "clientClassName": "com.sim4me.gmb.canvas.GMBModelConnector"
        },
        "ports": [],
        "class": "com.sim4me.gmb.models.STREAM",
        "height": 6
      },
      {
        "vertices": [],
        "cat": "MODEL OBJECT",
        "name": "PV101",
        "x": 711,
        "width": 24,
        "index": 29,
        "y": 94,
        "params": {
          "elementID": 13,
          "dataStatus": 212,
          "labelFontInfo": "",
          "fillParam": false,
          "nameLocation": 5,
          "remoteFunction": false,
          "rotateState": 0,
          "fillColorParam": [
            0,
            0,
            0
            ],
          "valveAction": 1,
          "valveType": 0,
          "flipState": 0,
          "imageType": "ImageNormal",
          "clientClassName": "com.sim4me.gmb.models.DynSimValve"
        },
        "ports": [
          {
            "orientation": 1,
            "showName": 1,
            "connector": "PV101.OP = PC101.OUT",
            "yPort": 86,
            "lineThickness": 1,
            "name": "OP",
            "x": 723,
            "xPort": 723,
            "y": 94,
            "conFlag": 2
          },
          {
            "orientation": 2,
            "showName": 0,
            "connector": "S6",
            "yPort": 109,
            "lineThickness": 1,
            "name": "ProductPort",
            "x": 734,
            "xPort": 734,
            "y": 109,
            "conFlag": 1
          },
          {
            "orientation": 2,
            "showName": 0,
            "connector": "S5",
            "yPort": 109,
            "lineThickness": 0,
            "name": "FeedPort",
            "x": 711,
            "xPort": 711,
            "y": 109,
            "conFlag": 2
          }
          ],
        "class": "com.sim4me.gmb.models.VALVE",
        "height": 24
      },
      {
        "vertices": [
          39,
          0,
          173,
          0,
          173,
          -18
          ],
        "cat": "MODEL CONNECTOR",
        "name": "S6",
        "x": 695,
        "width": 172,
        "index": 30,
        "y": 109,
        "params": {
          "elementID": 14,
          "startPortLoc": "734,109;ProductPort",
          "nameSegment": -1,
          "ConnectorArrow": 2,
          "dataStatus": 212,
          "isEndRemote": false,
          "connectorData": "PV101.OProdStream = SI_OVHDPROD.OFeedStream",
          "labelFontInfo": "",
          "nameLocation": 4,
          "endPortLoc": "868,91;FeedPort",
          "endObject": "",
          "isStartRemote": false,
          "startObject": "",
          "showEndPortName": false,
          "Desc.W": "Top product flow rate",
          "showStartPortName": false,
          "startPortLabel": "OProdStream",
          "clientClassName": "com.sim4me.gmb.canvas.GMBModelConnector"
        },
        "ports": [],
        "class": "com.sim4me.gmb.models.STREAM",
        "height": 11
      },
      {
        "vertices": [],
        "cat": "MODEL OBJECT",
        "name": "P101",
        "x": 518,
        "width": 37,
        "index": 31,
        "y": 289,
        "params": {
          "elementID": 16,
          "fillColorParam": [
            0,
            0,
            0
            ],
          "dataStatus": 212,
          "labelFontInfo": "",
          "fillParam": false,
          "nameLocation": 5,
          "flipState": 1,
          "remoteFunction": false,
          "imageType": "ImageNormal",
          "rotateState": 0,
          "clientClassName": "com.sim4me.gmb.canvas.GMBS4MModelObject"
        },
        "ports": [
          {
            "orientation": 2,
            "showName": 0,
            "connector": "S8",
            "yPort": 293,
            "lineThickness": 1,
            "name": "ProductPort",
            "x": 519,
            "xPort": 519,
            "y": 293,
            "conFlag": 1
          },
          {
            "orientation": 1,
            "showName": 0,
            "connector": "MS1",
            "yPort": 290,
            "lineThickness": 1,
            "name": "MechPort",
            "x": 534,
            "xPort": 534,
            "y": 290,
            "conFlag": 2
          },
          {
            "orientation": 2,
            "showName": 0,
            "connector": "S7",
            "yPort": 301,
            "lineThickness": 1,
            "name": "FeedPort",
            "x": 553,
            "xPort": 553,
            "y": 301,
            "conFlag": 2
          }
          ],
        "class": "com.sim4me.gmb.models.PUMP",
        "height": 30
      },
      {
        "vertices": [
          21,
          19,
          21,
          140,
          2,
          140
          ],
        "cat": "MODEL CONNECTOR",
        "name": "S7",
        "x": 551,
        "width": 32,
        "index": 32,
        "y": 161,
        "params": {
          "elementID": 17,
          "startPortLoc": "572,180;BaseProdLiquid",
          "nameSegment": -3,
          "ConnectorArrow": 2,
          "dataStatus": 212,
          "isEndRemote": false,
          "connectorData": "D101.OProdLiquid = P101.OFeedStream",
          "labelFontInfo": "",
          "nameLocation": 4,
          "endPortLoc": "553,301;FeedPort",
          "endObject": "",
          "isStartRemote": false,
          "startObject": "",
          "showEndPortName": false,
          "showStartPortName": false,
          "startPortLabel": "OProdLiquid",
          "clientClassName": "com.sim4me.gmb.canvas.GMBModelConnector"
        },
        "ports": [],
        "class": "com.sim4me.gmb.models.STREAM",
        "height": 47
      },
      {
        "vertices": [
          98,
          125,
          28,
          125,
          28,
          7,
          -1,
          7
          ],
        "cat": "MODEL CONNECTOR",
        "name": "S9",
        "x": 333,
        "width": 116,
        "index": 33,
        "y": 169,
        "params": {
          "elementID": 18,
          "startPortLoc": "431,294;ProductPort",
          "nameSegment": -2,
          "dataStatus": 212,
          "isEndRemote": false,
          "connectorData": "LV101.OProdStream = T1.OFeedStream",
          "labelFontInfo": "",
          "nameLocation": 4,
          "endPortLoc": "332,176;RightFeed",
          "endObject": "",
          "isStartRemote": false,
          "startObject": "",
          "showEndPortName": false,
          "Desc.W": "Reflux flow rate",
          "showStartPortName": false,
          "startPortLabel": "OProdStream",
          "clientClassName": "com.sim4me.gmb.canvas.GMBModelConnector"
        },
        "ports": [],
        "class": "com.sim4me.gmb.models.STREAM",
        "height": 127
      },
      {
        "vertices": [],
        "cat": "MODEL OBJECT",
        "name": "SO_E102_UTILITY",
        "x": 563,
        "width": 55,
        "index": 34,
        "y": 347,
        "params": {
          "elementID": 20,
          "fillColorParam": [
            0,
            0,
            0
            ],
          "dataStatus": 212,
          "labelFontInfo": "",
          "fillParam": false,
          "nameLocation": 5,
          "flipState": 0,
          "remoteFunction": false,
          "imageType": "ImageNormal",
          "rotateState": 0,
          "clientClassName": "com.sim4me.gmb.canvas.GMBS4MModelObject"
        },
        "ports": [
          {
            "orientation": 2,
            "showName": 0,
            "connector": "S12",
            "yPort": 385,
            "lineThickness": 1,
            "name": "ProductPort",
            "x": 615,
            "xPort": 615,
            "y": 385,
            "conFlag": 1
          }
          ],
        "class": "com.sim4me.gmb.models.SOURCE",
        "height": 55
      },
      {
        "vertices": [
          326,
          -2,
          326,
          46,
          -74,
          46
          ],
        "cat": "MODEL CONNECTOR",
        "name": "HS1",
        "x": 392,
        "width": 387,
        "index": 35,
        "y": 400,
        "params": {
          "elementID": 22,
          "startPortLoc": "718,398;HeatStreamPort",
          "nameSegment": -2,
          "dataStatus": 212,
          "isEndRemote": false,
          "connectorData": "E102.UTILITY.OProdHeatStream = D102.OFeedFluidHeatStream",
          "labelFontInfo": "",
          "nameLocation": 4,
          "endPortLoc": "318,446;FluidHeatPort",
          "endObject": "",
          "isStartRemote": false,
          "startObject": "",
          "showEndPortName": false,
          "showStartPortName": false,
          "startPortLabel": "UTILITY.OProdHeatStream",
          "clientClassName": "com.sim4me.gmb.canvas.GMBModelConnector"
        },
        "ports": [],
        "class": "com.sim4me.gmb.models.HEATSTREAM",
        "height": 53
      },
      {
        "vertices": [
          4,
          7,
          55,
          7,
          55,
          -11
          ],
        "cat": "MODEL CONNECTOR",
        "name": "S14",
        "x": 813,
        "width": 107,
        "index": 36,
        "y": 372,
        "params": {
          "elementID": 25,
          "startPortLoc": "817,379;ProductPort",
          "nameSegment": -1,
          "ConnectorArrow": 2,
          "dataStatus": 212,
          "isEndRemote": false,
          "connectorData": "TV101.OProdStream = SI_STEAMHDR.OFeedStream",
          "labelFontInfo": "",
          "nameLocation": 4,
          "endPortLoc": "868,361;FeedPort",
          "endObject": "",
          "isStartRemote": false,
          "startObject": "",
          "showEndPortName": false,
          "showStartPortName": false,
          "startPortLabel": "OProdStream",
          "clientClassName": "com.sim4me.gmb.canvas.GMBModelConnector"
        },
        "ports": [],
        "class": "com.sim4me.gmb.models.STREAM",
        "height": 16
      },
      {
        "vertices": [
          30,
          3,
          264,
          3,
          264,
          3
          ],
        "cat": "MODEL CONNECTOR",
        "name": "S17",
        "x": 605,
        "width": 270,
        "index": 37,
        "y": 540,
        "params": {
          "elementID": 26,
          "startPortLoc": "635,543;ProductPort",
          "nameSegment": -2,
          "dataStatus": 212,
          "isEndRemote": false,
          "connectorData": "LV102.OProdStream = SI_BTMSPROD.OFeedStream",
          "labelFontInfo": "",
          "nameLocation": 4,
          "endPortLoc": "869,543;FeedPort",
          "endObject": "",
          "isStartRemote": false,
          "startObject": "",
          "showEndPortName": false,
          "Desc.W": "Bottom product flow rate",
          "showStartPortName": false,
          "startPortLabel": "OProdStream",
          "clientClassName": "com.sim4me.gmb.canvas.GMBModelConnector"
        },
        "ports": [],
        "class": "com.sim4me.gmb.models.STREAM",
        "height": 7
      },
      {
        "vertices": [],
        "cat": "MODEL OBJECT",
        "name": "LC101",
        "x": 433,
        "width": 21,
        "index": 38,
        "y": 214,
        "params": {
          "elementID": 27,
          "fillColorParam": [
            0,
            0,
            0
            ],
          "dataStatus": 212,
          "labelFontInfo": "",
          "fillParam": false,
          "nameLocation": 1,
          "flipState": 0,
          "remoteFunction": false,
          "imageType": "Level Controller",
          "rotateState": 0,
          "clientClassName": "com.sim4me.gmb.models.DynSimPID"
        },
        "ports": [
          {
            "orientation": 1,
            "showName": 1,
            "connector": "LV101.OP = LC101.OUT",
            "yPort": 241,
            "lineThickness": 1,
            "name": "OUT",
            "x": 444,
            "xPort": 443,
            "y": 235,
            "conFlag": 1
          },
          {
            "orientation": 2,
            "showName": 1,
            "connector": "LC101.PV = LT101.MV",
            "yPort": 227,
            "lineThickness": 1,
            "name": "PV",
            "x": 454,
            "xPort": 474,
            "y": 227,
            "conFlag": 2
          }
          ],
        "class": "com.sim4me.gmb.models.PID",
        "height": 21
      },
      {
        "vertices": [],
        "cat": "MODEL OBJECT",
        "name": "PC101",
        "x": 714,
        "width": 21,
        "index": 39,
        "y": 53,
        "params": {
          "elementID": 28,
          "fillColorParam": [
            0,
            0,
            0
            ],
          "dataStatus": 212,
          "labelFontInfo": "",
          "fillParam": false,
          "nameLocation": 1,
          "flipState": 0,
          "remoteFunction": false,
          "imageType": "Pressure Controller",
          "rotateState": 0,
          "clientClassName": "com.sim4me.gmb.models.DynSimPID"
        },
        "ports": [
          {
            "orientation": 2,
            "showName": 1,
            "connector": "PC101.PV = PT101.MV",
            "yPort": 66,
            "lineThickness": 1,
            "name": "PV",
            "x": 716,
            "xPort": 696,
            "y": 66,
            "conFlag": 2
          },
          {
            "orientation": 1,
            "showName": 1,
            "connector": "PV101.OP = PC101.OUT",
            "yPort": 91,
            "lineThickness": 1,
            "name": "OUT",
            "x": 725,
            "xPort": 725,
            "y": 73,
            "conFlag": 1
          }
          ],
        "class": "com.sim4me.gmb.models.PID",
        "height": 21
      },
      {
        "vertices": [],
        "cat": "MODEL OBJECT",
        "name": "FC101",
        "x": 204,
        "width": 21,
        "index": 40,
        "y": 188,
        "params": {
          "elementID": 29,
          "fillColorParam": [
            0,
            0,
            0
            ],
          "dataStatus": 212,
          "labelFontInfo": "",
          "fillParam": false,
          "nameLocation": 1,
          "flipState": 0,
          "remoteFunction": false,
          "imageType": "Flow Controller",
          "rotateState": 0,
          "clientClassName": "com.sim4me.gmb.models.DynSimPID"
        },
        "ports": [
          {
            "orientation": 2,
            "showName": 1,
            "connector": "FC101.PV = FT101.MVPLANT",
            "yPort": 198,
            "lineThickness": 1,
            "name": "PV",
            "x": 204,
            "xPort": 204,
            "y": 198,
            "conFlag": 2
          },
          {
            "orientation": 1,
            "showName": 1,
            "connector": "FV101.OP = FC101.OUT",
            "yPort": 209,
            "lineThickness": 1,
            "name": "OUT",
            "x": 214,
            "xPort": 214,
            "y": 209,
            "conFlag": 1
          }
          ],
        "class": "com.sim4me.gmb.models.PID",
        "height": 21
      },
      {
        "vertices": [],
        "cat": "MODEL OBJECT",
        "name": "TC101",
        "x": 795,
        "width": 21,
        "index": 41,
        "y": 316,
        "params": {
          "elementID": 30,
          "fillColorParam": [
            0,
            0,
            0
            ],
          "dataStatus": 212,
          "labelFontInfo": "",
          "fillParam": false,
          "nameLocation": 1,
          "flipState": 0,
          "remoteFunction": false,
          "imageType": "Temperature Controller",
          "rotateState": 0,
          "clientClassName": "com.sim4me.gmb.models.DynSimPID"
        },
        "ports": [
          {
            "orientation": 2,
            "showName": 1,
            "connector": "TC101.PV = TT101.MV",
            "yPort": 326,
            "lineThickness": 1,
            "name": "PV",
            "x": 795,
            "xPort": 795,
            "y": 326,
            "conFlag": 2
          },
          {
            "orientation": 1,
            "showName": 1,
            "connector": "TV101.OP = TC101.OUT",
            "yPort": 316,
            "lineThickness": 1,
            "name": "OUT",
            "x": 805,
            "xPort": 805,
            "y": 316,
            "conFlag": 1
          }
          ],
        "class": "com.sim4me.gmb.models.PID",
        "height": 21
      },
      {
        "vertices": [],
        "cat": "DrawElement",
        "name": "D101.P",
        "x": 473,
        "width": 70,
        "index": 42,
        "y": 118,
        "params": {
          "elementID": 31,
          "format": "###0.0",
          "valueSize": 40,
          "labelFontInfo": "",
          "pointResized": true,
          "valueFontInfo": "",
          "descSize": 0,
          "pointSize": 0,
          "showValue": true,
          "unitsSize": 30,
          "UnitofMeasure": "",
          "editValue": false,
          "nameSize": 0
        },
        "ports": [],
        "class": "com.sim4me.gmb.references.GMBPointReference",
        "height": 18
      },
      {
        "vertices": [],
        "cat": "DrawElement",
        "name": "D102.P",
        "x": 314,
        "width": 90,
        "index": 43,
        "y": 386,
        "params": {
          "elementID": 32,
          "format": "###0.0",
          "valueSize": 60,
          "labelFontInfo": "",
          "pointResized": true,
          "valueFontInfo": "",
          "descSize": 0,
          "pointSize": 0,
          "showValue": true,
          "unitsSize": 30,
          "UnitofMeasure": "",
          "editValue": false,
          "nameSize": 0
        },
        "ports": [],
        "class": "com.sim4me.gmb.references.GMBPointReference",
        "height": 18
      },
      {
        "vertices": [],
        "cat": "MODEL OBJECT",
        "name": "DrainVlv",
        "x": 711,
        "width": 24,
        "index": 44,
        "y": 211,
        "params": {
          "elementID": 33,
          "dataStatus": 212,
          "labelFontInfo": "",
          "fillParam": false,
          "nameLocation": 5,
          "remoteFunction": false,
          "rotateState": 0,
          "fillColorParam": [
            0,
            0,
            0
            ],
          "valveAction": 1,
          "valveType": 0,
          "flipState": 0,
          "imageType": "ImageNormal",
          "clientClassName": "com.sim4me.gmb.models.DynSimValve"
        },
        "ports": [
          {
            "orientation": 2,
            "showName": 0,
            "connector": "S19",
            "yPort": 228,
            "lineThickness": 1,
            "name": "ProductPort",
            "x": 735,
            "xPort": 735,
            "y": 228,
            "conFlag": 1
          },
          {
            "orientation": 2,
            "showName": 0,
            "connector": "S18",
            "yPort": 226,
            "lineThickness": 0,
            "name": "FeedPort",
            "x": 711,
            "xPort": 711,
            "y": 226,
            "conFlag": 2
          }
          ],
        "class": "com.sim4me.gmb.models.VALVE",
        "height": 24
      },
      {
        "vertices": [
          0,
          2,
          0,
          48,
          114,
          48
          ],
        "cat": "MODEL CONNECTOR",
        "name": "S18",
        "x": 597,
        "width": 119,
        "index": 45,
        "y": 178,
        "params": {
          "elementID": 34,
          "startPortLoc": "597,180;BaseProdLiquid2",
          "nameSegment": -1,
          "dataStatus": 212,
          "isEndRemote": false,
          "connectorData": "D101.OProdLiquid2 = DrainVlv.OFeedStream",
          "labelFontInfo": "",
          "nameLocation": 4,
          "endPortLoc": "711,226;FeedPort",
          "endObject": "",
          "isStartRemote": false,
          "startObject": "",
          "showEndPortName": false,
          "showStartPortName": false,
          "startPortLabel": "OProdLiquid2",
          "clientClassName": "com.sim4me.gmb.canvas.GMBModelConnector"
        },
        "ports": [],
        "class": "com.sim4me.gmb.models.STREAM",
        "height": 77
      },
      {
        "vertices": [],
        "cat": "DrawElement",
        "name": "D102.FLASH.T{C}",
        "x": 364,
        "width": 90,
        "index": 46,
        "y": 408,
        "params": {
          "elementID": 36,
          "format": "###0.0",
          "valueSize": 60,
          "labelFontInfo": "",
          "pointResized": true,
          "valueFontInfo": "",
          "descSize": 0,
          "pointSize": 0,
          "showValue": true,
          "unitsSize": 30,
          "UnitofMeasure": "",
          "editValue": false,
          "nameSize": 0
        },
        "ports": [],
        "class": "com.sim4me.gmb.references.GMBPointReference",
        "height": 18
      },
      {
        "vertices": [],
        "cat": "MODEL OBJECT",
        "name": "P102",
        "x": 440,
        "width": 37,
        "index": 47,
        "y": 540,
        "params": {
          "elementID": 38,
          "fillColorParam": [
            0,
            0,
            0
            ],
          "dataStatus": 212,
          "labelFontInfo": "",
          "fillParam": false,
          "nameLocation": 5,
          "flipState": 0,
          "remoteFunction": false,
          "imageType": "ImageNormal",
          "rotateState": 0,
          "clientClassName": "com.sim4me.gmb.canvas.GMBS4MModelObject"
        },
        "ports": [
          {
            "orientation": 2,
            "showName": 0,
            "connector": "S15",
            "yPort": 552,
            "lineThickness": 1,
            "name": "FeedPort",
            "x": 441,
            "xPort": 441,
            "y": 552,
            "conFlag": 2
          },
          {
            "orientation": 1,
            "showName": 0,
            "connector": "MS2",
            "yPort": 541,
            "lineThickness": 1,
            "name": "MechPort",
            "x": 460,
            "xPort": 460,
            "y": 541,
            "conFlag": 2
          },
          {
            "orientation": 2,
            "showName": 0,
            "connector": "S16",
            "yPort": 544,
            "lineThickness": 1,
            "name": "ProductPort",
            "x": 475,
            "xPort": 475,
            "y": 544,
            "conFlag": 1
          }
          ],
        "class": "com.sim4me.gmb.models.PUMP",
        "height": 30
      },
      {
        "vertices": [],
        "cat": "MODEL OBJECT",
        "name": "LV102",
        "x": 612,
        "width": 24,
        "index": 48,
        "y": 528,
        "params": {
          "elementID": 41,
          "dataStatus": 212,
          "labelFontInfo": "",
          "fillParam": false,
          "nameLocation": 5,
          "remoteFunction": false,
          "rotateState": 0,
          "fillColorParam": [
            0,
            0,
            0
            ],
          "valveAction": 1,
          "valveType": 0,
          "flipState": 0,
          "imageType": "ImageNormal",
          "clientClassName": "com.sim4me.gmb.models.DynSimValve"
        },
        "ports": [
          {
            "orientation": 1,
            "showName": 1,
            "connector": "LV102.OP = LC102.OUT",
            "yPort": 521,
            "lineThickness": 1,
            "name": "OP",
            "x": 624,
            "xPort": 623,
            "y": 529,
            "conFlag": 2
          },
          {
            "orientation": 2,
            "showName": 0,
            "connector": "S17",
            "yPort": 543,
            "lineThickness": 0,
            "name": "ProductPort",
            "x": 635,
            "xPort": 635,
            "y": 543,
            "conFlag": 1
          },
          {
            "orientation": 2,
            "showName": 0,
            "connector": "S16",
            "yPort": 543,
            "lineThickness": 0,
            "name": "FeedPort",
            "x": 612,
            "xPort": 612,
            "y": 543,
            "conFlag": 2
          }
          ],
        "class": "com.sim4me.gmb.models.VALVE",
        "height": 24
      },
      {
        "vertices": [],
        "cat": "MODEL OBJECT",
        "name": "LC102",
        "x": 612,
        "width": 21,
        "index": 49,
        "y": 460,
        "params": {
          "elementID": 42,
          "fillColorParam": [
            0,
            0,
            0
            ],
          "dataStatus": 212,
          "labelFontInfo": "",
          "fillParam": false,
          "nameLocation": 3,
          "flipState": 0,
          "remoteFunction": false,
          "imageType": "Level Controller",
          "rotateState": 0,
          "clientClassName": "com.sim4me.gmb.models.DynSimPID"
        },
        "ports": [
          {
            "orientation": 2,
            "showName": 1,
            "connector": "LC102.PV = D102.L",
            "yPort": 470,
            "lineThickness": 1,
            "name": "PV",
            "x": 612,
            "xPort": 612,
            "y": 470,
            "conFlag": 2
          },
          {
            "orientation": 1,
            "showName": 1,
            "connector": "LV102.OP = LC102.OUT",
            "yPort": 481,
            "lineThickness": 1,
            "name": "OUT",
            "x": 622,
            "xPort": 622,
            "y": 481,
            "conFlag": 1
          }
          ],
        "class": "com.sim4me.gmb.models.PID",
        "height": 21
      },
      {
        "vertices": [],
        "cat": "MODEL OBJECT",
        "name": "LV101",
        "x": 431,
        "width": 24,
        "index": 50,
        "y": 279,
        "params": {
          "elementID": 43,
          "dataStatus": 212,
          "labelFontInfo": "",
          "fillParam": false,
          "nameLocation": 5,
          "remoteFunction": false,
          "rotateState": 0,
          "fillColorParam": [
            0,
            0,
            0
            ],
          "valveAction": 1,
          "valveType": 0,
          "flipState": 0,
          "imageType": "ImageNormal",
          "clientClassName": "com.sim4me.gmb.models.DynSimValve"
        },
        "ports": [
          {
            "orientation": 1,
            "showName": 1,
            "connector": "LV101.OP = LC101.OUT",
            "yPort": 268,
            "lineThickness": 1,
            "name": "OP",
            "x": 445,
            "xPort": 445,
            "y": 282,
            "conFlag": 2
          },
          {
            "orientation": 2,
            "showName": 0,
            "connector": "S9",
            "yPort": 294,
            "lineThickness": 0,
            "name": "ProductPort",
            "x": 431,
            "xPort": 431,
            "y": 294,
            "conFlag": 1
          },
          {
            "orientation": 2,
            "showName": 0,
            "connector": "S8",
            "yPort": 294,
            "lineThickness": 0,
            "name": "FeedPort",
            "x": 454,
            "xPort": 454,
            "y": 294,
            "conFlag": 2
          }
          ],
        "class": "com.sim4me.gmb.models.VALVE",
        "height": 24
      },
      {
        "vertices": [],
        "cat": "MODEL OBJECT",
        "name": "TV101",
        "x": 794,
        "width": 24,
        "index": 51,
        "y": 364,
        "params": {
          "elementID": 45,
          "dataStatus": 212,
          "labelFontInfo": "",
          "fillParam": false,
          "nameLocation": 5,
          "remoteFunction": false,
          "rotateState": 0,
          "fillColorParam": [
            0,
            0,
            0
            ],
          "valveAction": 1,
          "valveType": 0,
          "flipState": 0,
          "imageType": "ImageNormal",
          "clientClassName": "com.sim4me.gmb.models.DynSimValve"
        },
        "ports": [
          {
            "orientation": 2,
            "showName": 0,
            "connector": "S13",
            "yPort": 380,
            "lineThickness": 1,
            "name": "FeedPort",
            "x": 794,
            "xPort": 794,
            "y": 380,
            "conFlag": 2
          },
          {
            "orientation": 1,
            "showName": 1,
            "connector": "TV101.OP = TC101.OUT",
            "yPort": 344,
            "lineThickness": 1,
            "name": "OP",
            "x": 807,
            "xPort": 807,
            "y": 364,
            "conFlag": 2
          },
          {
            "orientation": 2,
            "showName": 0,
            "connector": "S14",
            "yPort": 379,
            "lineThickness": 1,
            "name": "ProductPort",
            "x": 817,
            "xPort": 817,
            "y": 379,
            "conFlag": 1
          }
          ],
        "class": "com.sim4me.gmb.models.VALVE",
        "height": 24
      },
      {
        "vertices": [],
        "cat": "MODEL OBJECT",
        "name": "PSV101",
        "x": 545,
        "width": 25,
        "index": 52,
        "y": 37,
        "params": {
          "elementID": 46,
          "fillColorParam": [
            0,
            0,
            0
            ],
          "dataStatus": 212,
          "labelFontInfo": "",
          "fillParam": false,
          "nameLocation": 1,
          "valveType": 1,
          "flipState": 1,
          "remoteFunction": false,
          "imageType": "ImageNormal",
          "rotateState": 0,
          "clientClassName": "com.sim4me.gmb.models.DynSimReliefValve"
        },
        "ports": [
          {
            "orientation": 2,
            "showName": 0,
            "connector": "S21",
            "yPort": 53,
            "lineThickness": 1,
            "name": "ProductPort",
            "x": 544,
            "xPort": 544,
            "y": 53,
            "conFlag": 1
          },
          {
            "orientation": 1,
            "showName": 0,
            "connector": "S20",
            "yPort": 69,
            "lineThickness": 1,
            "name": "FeedPort",
            "x": 559,
            "xPort": 559,
            "y": 69,
            "conFlag": 2
          }
          ],
        "class": "com.sim4me.gmb.models.RELIEFVALVE",
        "height": 33
      },
      {
        "vertices": [],
        "cat": "MODEL OBJECT",
        "name": "SI_RELIEFVENT",
        "x": 439,
        "width": 55,
        "index": 53,
        "y": 20,
        "params": {
          "elementID": 47,
          "fillColorParam": [
            0,
            0,
            0
            ],
          "dataStatus": 212,
          "labelFontInfo": "",
          "fillParam": false,
          "nameLocation": 5,
          "flipState": 1,
          "remoteFunction": false,
          "imageType": "ImageNormal",
          "rotateState": 0,
          "clientClassName": "com.sim4me.gmb.canvas.GMBS4MModelObject"
        },
        "ports": [
          {
            "orientation": 2,
            "showName": 0,
            "connector": "S21",
            "yPort": 53,
            "lineThickness": 1,
            "name": "FeedPort",
            "x": 494,
            "xPort": 494,
            "y": 53,
            "conFlag": 2
          }
          ],
        "class": "com.sim4me.gmb.models.SINK",
        "height": 55
      },
      {
        "vertices": [],
        "cat": "MODEL OBJECT",
        "name": "SI_OVHDPROD",
        "x": 867,
        "width": 55,
        "index": 54,
        "y": 76,
        "params": {
          "elementID": 50,
          "fillColorParam": [
            0,
            0,
            0
            ],
          "dataStatus": 212,
          "labelFontInfo": "",
          "fillParam": false,
          "nameLocation": 5,
          "flipState": 0,
          "remoteFunction": false,
          "imageType": "ImageNormal",
          "rotateState": 0,
          "clientClassName": "com.sim4me.gmb.canvas.GMBS4MModelObject"
        },
        "ports": [
          {
            "orientation": 2,
            "showName": 0,
            "connector": "S6",
            "yPort": 91,
            "lineThickness": 1,
            "name": "FeedPort",
            "x": 868,
            "xPort": 868,
            "y": 91,
            "conFlag": 2
          }
          ],
        "class": "com.sim4me.gmb.models.SINK",
        "height": 55
      },
      {
        "vertices": [],
        "cat": "MODEL OBJECT",
        "name": "SI_STEAMHDR",
        "x": 867,
        "width": 55,
        "index": 55,
        "y": 346,
        "params": {
          "elementID": 51,
          "fillColorParam": [
            0,
            0,
            0
            ],
          "dataStatus": 212,
          "labelFontInfo": "",
          "fillParam": false,
          "nameLocation": 5,
          "flipState": 0,
          "remoteFunction": false,
          "imageType": "ImageNormal",
          "rotateState": 0,
          "clientClassName": "com.sim4me.gmb.canvas.GMBS4MModelObject"
        },
        "ports": [
          {
            "orientation": 2,
            "showName": 0,
            "connector": "S14",
            "yPort": 361,
            "lineThickness": 1,
            "name": "FeedPort",
            "x": 868,
            "xPort": 868,
            "y": 361,
            "conFlag": 2
          }
          ],
        "class": "com.sim4me.gmb.models.SINK",
        "height": 55
      },
      {
        "vertices": [],
        "cat": "MODEL OBJECT",
        "name": "SI_BTMSPROD",
        "x": 867,
        "width": 55,
        "index": 56,
        "y": 510,
        "params": {
          "elementID": 52,
          "fillColorParam": [
            0,
            0,
            0
            ],
          "dataStatus": 212,
          "labelFontInfo": "",
          "fillParam": false,
          "nameLocation": 5,
          "flipState": 0,
          "remoteFunction": false,
          "imageType": "ImageNormal",
          "rotateState": 0,
          "clientClassName": "com.sim4me.gmb.canvas.GMBS4MModelObject"
        },
        "ports": [
          {
            "orientation": 2,
            "showName": 0,
            "connector": "S17",
            "yPort": 543,
            "lineThickness": 0,
            "name": "FeedPort",
            "x": 869,
            "xPort": 869,
            "y": 543,
            "conFlag": 2
          }
          ],
        "class": "com.sim4me.gmb.models.SINK",
        "height": 55
      },
      {
        "vertices": [],
        "cat": "MODEL OBJECT",
        "name": "SI_DRAIN",
        "x": 867,
        "width": 55,
        "index": 57,
        "y": 192,
        "params": {
          "elementID": 53,
          "fillColorParam": [
            0,
            0,
            0
            ],
          "dataStatus": 212,
          "labelFontInfo": "",
          "fillParam": false,
          "nameLocation": 5,
          "flipState": 0,
          "remoteFunction": false,
          "imageType": "ImageNormal",
          "rotateState": 0,
          "clientClassName": "com.sim4me.gmb.canvas.GMBS4MModelObject"
        },
        "ports": [
          {
            "orientation": 2,
            "showName": 0,
            "connector": "S19",
            "yPort": 227,
            "lineThickness": 1,
            "name": "FeedPort",
            "x": 868,
            "xPort": 868,
            "y": 227,
            "conFlag": 2
          }
          ],
        "class": "com.sim4me.gmb.models.SINK",
        "height": 55
      },
      {
        "vertices": [],
        "cat": "MODEL OBJECT",
        "name": "M101",
        "x": 470,
        "width": 50,
        "index": 58,
        "y": 245,
        "params": {
          "elementID": 54,
          "fillColorParam": [
            0,
            0,
            0
            ],
          "dataStatus": 210,
          "labelFontInfo": "",
          "fillParam": false,
          "nameLocation": 5,
          "flipState": 0,
          "remoteFunction": false,
          "imageType": "ImageNormal",
          "rotateState": 0,
          "clientClassName": "com.sim4me.gmb.models.MOTOR"
        },
        "ports": [
          {
            "orientation": 2,
            "showName": 0,
            "connector": "MS1",
            "yPort": 257,
            "lineThickness": 1,
            "name": "MechPort",
            "x": 519,
            "xPort": 519,
            "y": 257,
            "conFlag": 1
          }
          ],
        "class": "com.sim4me.gmb.models.MOTOR",
        "height": 24
      },
      {
        "vertices": [
          3,
          26,
          18,
          26,
          18,
          59
          ],
        "cat": "MODEL CONNECTOR",
        "name": "MS1",
        "x": 516,
        "width": 12,
        "index": 59,
        "y": 231,
        "params": {
          "elementID": 55,
          "startPortLoc": "519,257;MechPort",
          "nameSegment": -1,
          "dataStatus": 212,
          "isEndRemote": false,
          "connectorData": "M101.OMechStream = P101.OMechStream",
          "labelFontInfo": "",
          "nameLocation": 4,
          "endPortLoc": "534,290;MechPort",
          "endObject": "",
          "isStartRemote": false,
          "startObject": "",
          "showEndPortName": false,
          "showStartPortName": false,
          "startPortLabel": "OMechStream",
          "clientClassName": "com.sim4me.gmb.canvas.GMBModelConnector"
        },
        "ports": [],
        "class": "com.sim4me.gmb.models.MECHSTREAM",
        "height": 43
      },
      {
        "vertices": [],
        "cat": "MODEL OBJECT",
        "name": "M102",
        "x": 394,
        "width": 50,
        "index": 60,
        "y": 496,
        "params": {
          "elementID": 56,
          "fillColorParam": [
            0,
            0,
            0
            ],
          "dataStatus": 210,
          "labelFontInfo": "",
          "fillParam": false,
          "nameLocation": 5,
          "flipState": 0,
          "remoteFunction": false,
          "imageType": "ImageNormal",
          "rotateState": 0,
          "clientClassName": "com.sim4me.gmb.models.MOTOR"
        },
        "ports": [
          {
            "orientation": 2,
            "showName": 0,
            "connector": "MS2",
            "yPort": 508,
            "lineThickness": 1,
            "name": "MechPort",
            "x": 443,
            "xPort": 443,
            "y": 508,
            "conFlag": 1
          }
          ],
        "class": "com.sim4me.gmb.models.MOTOR",
        "height": 24
      },
      {
        "vertices": [],
        "cat": "DrawElement",
        "name": "T1.P[STAGE1]",
        "x": 323,
        "width": 90,
        "index": 61,
        "y": 118,
        "params": {
          "elementID": 57,
          "format": "###0.0",
          "valueSize": 50,
          "labelFontInfo": "",
          "pointResized": true,
          "valueFontInfo": "",
          "descSize": 0,
          "pointSize": 0,
          "showValue": true,
          "unitsSize": 40,
          "UnitofMeasure": "",
          "editValue": false,
          "nameSize": 0
        },
        "ports": [],
        "class": "com.sim4me.gmb.references.GMBPointReference",
        "height": 18
      },
      {
        "vertices": [],
        "cat": "DrawElement",
        "name": "",
        "x": 35,
        "width": 200,
        "index": 62,
        "y": 459,
        "params": {
          "elementID": 58,
          "minimumValue": 10.0,
          "fontType": 0,
          "fontName": "Helvetica",
          "uom": "kg-mol",
          "orient": false,
          "pointName": "SO_FEED.MB[PROPANE]",
          "fontSize": 12,
          "majorTickSpacing": 5.0,
          "minorTickSpacing": 1.0,
          "textColorParam": [
            0,
            0,
            0
            ],
          "maximumValue": 30.0
        },
        "ports": [],
        "class": "com.sim4me.gmb.widgets.GMBSlider",
        "height": 60
      },
      {
        "vertices": [],
        "cat": "DrawElement",
        "name": "Feed Propane Composition",
        "x": 54,
        "width": 163,
        "index": 63,
        "y": 438,
        "params": {
          "elementID": 59,
          "fontType": 1,
          "fontName": "Helvetica",
          "fillColorParam": [
            0,
            0,
            0
            ],
          "lineStyle": 0,
          "lineThickness": 2.0,
          "fontSize": 12,
          "fillParam": false,
          "text": "Feed Propane Composition",
          "textColorParam": [
            0,
            0,
            0
            ],
          "lineColorParam": [
            0,
            0,
            0
            ]
        },
        "ports": [],
        "class": "com.sim4me.gmb.primitives.GMBSingleLineText",
        "height": 18
      },
      {
        "vertices": [
          4,
          7,
          4,
          8,
          2,
          8,
          2,
          2
          ],
        "cat": "CONNECTOR",
        "name": "PV101.OP = PC101.OUT",
        "x": 721,
        "width": 7,
        "index": 64,
        "y": 84,
        "params": {
          "elementID": 60,
          "startObject": "",
          "showEndPortName": true,
          "showStartPortName": true,
          "startPortLabel": "OUT",
          "isHidden": true,
          "endObject": ""
        },
        "ports": [],
        "class": "com.sim4me.gmb.canvas.GMBDefaultConnector",
        "height": 11
      },
      {
        "vertices": [
          2,
          2,
          2,
          115,
          4,
          115,
          4,
          30
          ],
        "cat": "CONNECTOR",
        "name": "TV101.OP = TC101.OUT",
        "x": 803,
        "width": 7,
        "index": 65,
        "y": 314,
        "params": {
          "elementID": 61,
          "startObject": "",
          "showEndPortName": true,
          "showStartPortName": true,
          "startPortLabel": "OUT",
          "isHidden": true,
          "endObject": ""
        },
        "ports": [],
        "class": "com.sim4me.gmb.canvas.GMBDefaultConnector",
        "height": 118
      },
      {
        "vertices": [
          2,
          18,
          160,
          18,
          160,
          2,
          263,
          2
          ],
        "cat": "CONNECTOR",
        "name": "LC102.PV = D102.L",
        "x": 349,
        "width": 266,
        "index": 66,
        "y": 468,
        "params": {
          "elementID": 62,
          "startObject": "",
          "showEndPortName": true,
          "showStartPortName": true,
          "startPortLabel": "L",
          "isHidden": true,
          "endObject": ""
        },
        "ports": [],
        "class": "com.sim4me.gmb.canvas.GMBDefaultConnector",
        "height": 21
      },
      {
        "vertices": [
          2,
          2,
          2,
          46,
          3,
          46,
          3,
          42
          ],
        "cat": "CONNECTOR",
        "name": "LV102.OP = LC102.OUT",
        "x": 620,
        "width": 6,
        "index": 67,
        "y": 479,
        "params": {
          "elementID": 63,
          "startObject": "",
          "showEndPortName": true,
          "showStartPortName": true,
          "startPortLabel": "OUT",
          "isHidden": true,
          "endObject": ""
        },
        "ports": [],
        "class": "com.sim4me.gmb.canvas.GMBDefaultConnector",
        "height": 49
      },
      {
        "vertices": [
          2,
          14,
          2,
          2,
          4,
          2,
          4,
          41
          ],
        "cat": "CONNECTOR",
        "name": "LV101.OP = LC101.OUT",
        "x": 441,
        "width": 7,
        "index": 68,
        "y": 227,
        "params": {
          "elementID": 64,
          "startObject": "",
          "showEndPortName": true,
          "showStartPortName": true,
          "startPortLabel": "OUT",
          "isHidden": true,
          "endObject": ""
        },
        "ports": [],
        "class": "com.sim4me.gmb.canvas.GMBDefaultConnector",
        "height": 44
      },
      {
        "vertices": [],
        "cat": "DrawElement",
        "name": "T1.TV[STAGE1]",
        "x": 313,
        "width": 90,
        "index": 69,
        "y": 135,
        "params": {
          "elementID": 65,
          "format": "###0.0",
          "valueSize": 60,
          "labelFontInfo": "",
          "pointResized": true,
          "valueFontInfo": "",
          "descSize": 0,
          "pointSize": 0,
          "showValue": true,
          "unitsSize": 30,
          "UnitofMeasure": "",
          "editValue": false,
          "nameSize": 0
        },
        "ports": [],
        "class": "com.sim4me.gmb.references.GMBPointReference",
        "height": 18
      },
      {
        "vertices": [],
        "cat": "DrawElement",
        "name": "s6{kg\/hr}",
        "x": 736,
        "width": 130,
        "index": 70,
        "y": 82,
        "params": {
          "elementID": 66,
          "unitsSize": 60,
          "inletFlow": false,
          "isStreamFlow": true,
          "UnitofMeasure": "",
          "nameSize": 0,
          "format": "###0.0",
          "valueSize": 70,
          "labelFontInfo": "",
          "unitsType": "Mass Units",
          "showNormalReverse": false,
          "valueFontInfo": ""
        },
        "ports": [],
        "class": "com.sim4me.gmb.references.GMBFlowRateIndicator",
        "height": 25
      },
      {
        "vertices": [],
        "cat": "DrawElement",
        "name": "s14{kg\/hr}",
        "x": 594,
        "width": 130,
        "index": 71,
        "y": 353,
        "params": {
          "elementID": 67,
          "unitsSize": 60,
          "inletFlow": false,
          "isStreamFlow": true,
          "UnitofMeasure": "",
          "nameSize": 0,
          "format": "###0.0",
          "valueSize": 70,
          "labelFontInfo": "",
          "unitsType": "Mass Units",
          "showNormalReverse": false,
          "valueFontInfo": ""
        },
        "ports": [],
        "class": "com.sim4me.gmb.references.GMBFlowRateIndicator",
        "height": 25
      },
      {
        "vertices": [],
        "cat": "DrawElement",
        "name": "s17{kg\/hr}",
        "x": 671,
        "width": 105,
        "index": 72,
        "y": 514,
        "params": {
          "elementID": 68,
          "unitsSize": 60,
          "inletFlow": false,
          "isStreamFlow": true,
          "UnitofMeasure": "",
          "nameSize": 0,
          "format": "###0.0",
          "valueSize": 70,
          "labelFontInfo": "",
          "unitsType": "Mass Units",
          "showNormalReverse": false,
          "valueFontInfo": ""
        },
        "ports": [],
        "class": "com.sim4me.gmb.references.GMBFlowRateIndicator",
        "height": 25
      },
      {
        "vertices": [],
        "cat": "DrawElement",
        "name": "s9{kg\/hr}",
        "x": 340,
        "width": 101,
        "index": 73,
        "y": 265,
        "params": {
          "elementID": 69,
          "unitsSize": 60,
          "inletFlow": false,
          "isStreamFlow": true,
          "UnitofMeasure": "",
          "nameSize": 0,
          "format": "###0.0",
          "valueSize": 70,
          "labelFontInfo": "",
          "unitsType": "Mass Units",
          "showNormalReverse": true,
          "valueFontInfo": ""
        },
        "ports": [],
        "class": "com.sim4me.gmb.references.GMBFlowRateIndicator",
        "height": 25
      },
      {
        "vertices": [],
        "cat": "DrawElement",
        "name": "s2{kg\/hr}",
        "x": 84,
        "width": 130,
        "index": 74,
        "y": 260,
        "params": {
          "elementID": 70,
          "unitsSize": 60,
          "inletFlow": false,
          "isStreamFlow": true,
          "UnitofMeasure": "",
          "nameSize": 0,
          "format": "###0.0",
          "valueSize": 70,
          "labelFontInfo": "",
          "unitsType": "Mass Units",
          "showNormalReverse": false,
          "valueFontInfo": ""
        },
        "ports": [],
        "class": "com.sim4me.gmb.references.GMBFlowRateIndicator",
        "height": 25
      },
      {
        "vertices": [],
        "cat": "MODEL OBJECT",
        "name": "E101",
        "x": 426,
        "width": 33,
        "index": 75,
        "y": 138,
        "params": {
          "elementID": 71,
          "fillColorParam": [
            0,
            0,
            0
            ],
          "dataStatus": 212,
          "labelFontInfo": "",
          "fillParam": false,
          "nameLocation": 1,
          "flipState": 0,
          "remoteFunction": false,
          "imageType": "ImageNormal",
          "rotateState": 0,
          "clientClassName": "com.sim4me.gmb.canvas.GMBS4MModelObject"
        },
        "ports": [
          {
            "orientation": 2,
            "showName": 0,
            "connector": "S4",
            "yPort": 156,
            "lineThickness": 1,
            "name": "ProductPort",
            "x": 458,
            "xPort": 458,
            "y": 156,
            "conFlag": 1
          },
          {
            "orientation": 2,
            "showName": 0,
            "connector": "S3",
            "yPort": 156,
            "lineThickness": 0,
            "name": "FeedPort",
            "x": 427,
            "xPort": 427,
            "y": 156,
            "conFlag": 2
          }
          ],
        "class": "com.sim4me.gmb.models.UTILITYEXCHANGER",
        "height": 36
      },
      {
        "vertices": [],
        "cat": "DrawElement",
        "name": "FC101 RESPONSE",
        "x": 165,
        "width": 25,
        "index": 76,
        "y": 124,
        "params": {
          "elementID": 72,
          "fillColorParam": [
            254,
            254,
            255
            ]
        },
        "ports": [],
        "class": "com.sim4me.gmb.references.GMBTrendReference",
        "height": 17
      },
      {
        "vertices": [],
        "cat": "DrawElement",
        "name": "LC101 RESPONSE",
        "x": 429,
        "width": 25,
        "index": 77,
        "y": 326,
        "params": {
          "elementID": 73,
          "fillColorParam": [
            254,
            254,
            255
            ]
        },
        "ports": [],
        "class": "com.sim4me.gmb.references.GMBTrendReference",
        "height": 17
      },
      {
        "vertices": [],
        "cat": "DrawElement",
        "name": "TC101 RESPONSE",
        "x": 705,
        "width": 25,
        "index": 78,
        "y": 284,
        "params": {
          "elementID": 74,
          "fillColorParam": [
            254,
            254,
            255
            ]
        },
        "ports": [],
        "class": "com.sim4me.gmb.references.GMBTrendReference",
        "height": 17
      },
      {
        "vertices": [
          2,
          2,
          2,
          11,
          3,
          11,
          3,
          20
          ],
        "cat": "CONNECTOR",
        "name": "FV101.OP = FC101.OUT",
        "x": 212,
        "width": 6,
        "index": 79,
        "y": 207,
        "params": {
          "elementID": 75,
          "startObject": "",
          "showEndPortName": true,
          "showStartPortName": true,
          "startPortLabel": "OUT",
          "isHidden": true,
          "endObject": ""
        },
        "ports": [],
        "class": "com.sim4me.gmb.canvas.GMBDefaultConnector",
        "height": 23
      },
      {
        "vertices": [],
        "cat": "MODEL OBJECT",
        "name": "T1",
        "x": 294,
        "width": 41,
        "index": 80,
        "y": 142,
        "params": {
          "elementID": 76,
          "fillColorParam": [
            0,
            0,
            0
            ],
          "dataStatus": 210,
          "labelFontInfo": "",
          "fillParam": false,
          "nameLocation": 6,
          "flipState": 0,
          "remoteFunction": false,
          "imageType": "ImageNormal",
          "rotateState": 0,
          "clientClassName": "com.sim4me.gmb.canvas.GMBS4MModelObject"
        },
        "ports": [
          {
            "orientation": 1,
            "showName": 0,
            "connector": "S11",
            "yPort": 347,
            "lineThickness": 1,
            "name": "BaseVapor",
            "x": 308,
            "xPort": 308,
            "y": 347,
            "conFlag": 2
          },
          {
            "orientation": 1,
            "showName": 0,
            "connector": "S10",
            "yPort": 347,
            "lineThickness": 1,
            "name": "BaseLiquid",
            "x": 325,
            "xPort": 325,
            "y": 347,
            "conFlag": 1
          },
          {
            "orientation": 2,
            "showName": 0,
            "connector": "S3",
            "yPort": 160,
            "lineThickness": 1,
            "name": "RightProduct",
            "x": 332,
            "xPort": 332,
            "y": 160,
            "conFlag": 1
          },
          {
            "orientation": 2,
            "showName": 0,
            "connector": "S9",
            "yPort": 176,
            "lineThickness": 1,
            "name": "RightFeed",
            "x": 332,
            "xPort": 332,
            "y": 160,
            "conFlag": 2
          },
          {
            "orientation": 2,
            "showName": 0,
            "connector": "S2",
            "yPort": 255,
            "lineThickness": 1,
            "name": "LeftFeed",
            "x": 296,
            "xPort": 296,
            "y": 255,
            "conFlag": 2
          }
          ],
        "class": "com.sim4me.gmb.models.TOWER",
        "height": 207
      },
      {
        "vertices": [],
        "cat": "DrawElement",
        "name": "DYNAMIC RESPONSE",
        "x": 718,
        "width": 25,
        "index": 81,
        "y": 157,
        "params": {
          "elementID": 77,
          "fillColorParam": [
            254,
            254,
            255
            ]
        },
        "ports": [],
        "class": "com.sim4me.gmb.references.GMBTrendReference",
        "height": 17
      },
      {
        "vertices": [],
        "cat": "DrawElement",
        "name": "PC101 RESPONSE",
        "x": 799,
        "width": 25,
        "index": 82,
        "y": 24,
        "params": {
          "elementID": 78,
          "fillColorParam": [
            254,
            254,
            255
            ]
        },
        "ports": [],
        "class": "com.sim4me.gmb.references.GMBTrendReference",
        "height": 17
      },
      {
        "vertices": [],
        "cat": "DrawElement",
        "name": "P101 PLOT",
        "x": 613,
        "width": 25,
        "index": 83,
        "y": 284,
        "params": {
          "elementID": 79,
          "fillColorParam": [
            254,
            254,
            255
            ]
        },
        "ports": [],
        "class": "com.sim4me.gmb.references.GMBXYPlotReference",
        "height": 17
      },
      {
        "vertices": [],
        "cat": "DrawElement",
        "name": "P102 PLOT",
        "x": 494,
        "width": 25,
        "index": 84,
        "y": 580,
        "params": {
          "elementID": 80,
          "fillColorParam": [
            254,
            254,
            255
            ]
        },
        "ports": [],
        "class": "com.sim4me.gmb.references.GMBXYPlotReference",
        "height": 17
      },
      {
        "vertices": [],
        "cat": "MODEL OBJECT",
        "name": "FT101",
        "x": 127,
        "width": 21,
        "index": 85,
        "y": 188,
        "params": {
          "elementID": 81,
          "fillColorParam": [
            0,
            0,
            0
            ],
          "dataStatus": 212,
          "labelFontInfo": "",
          "fillParam": false,
          "nameLocation": 1,
          "flipState": 0,
          "remoteFunction": false,
          "imageType": "Generic Transmitter",
          "rotateState": 0,
          "clientClassName": "com.sim4me.gmb.models.DynSimTransmitter"
        },
        "ports": [
          {
            "orientation": 2,
            "showName": 1,
            "connector": "FC101.PV = FT101.MVPLANT",
            "yPort": 202,
            "lineThickness": 1,
            "name": "MVPLANT",
            "x": 148,
            "xPort": 168,
            "y": 202,
            "conFlag": 1
          },
          {
            "orientation": 1,
            "showName": 1,
            "connector": "FT101.IN = S1.Q",
            "yPort": 229,
            "lineThickness": 1,
            "name": "IN",
            "x": 136,
            "xPort": 136,
            "y": 209,
            "conFlag": 2
          }
          ],
        "class": "com.sim4me.gmb.models.TRANSMITTER",
        "height": 21
      },
      {
        "vertices": [
          2,
          6,
          26,
          6,
          26,
          2,
          38,
          2
          ],
        "cat": "CONNECTOR",
        "name": "FC101.PV = FT101.MVPLANT",
        "x": 166,
        "width": 41,
        "index": 86,
        "y": 196,
        "params": {
          "elementID": 82,
          "startObject": "",
          "showEndPortName": true,
          "showStartPortName": true,
          "startPortLabel": "MVPLANT",
          "isHidden": true,
          "endObject": ""
        },
        "ports": [],
        "class": "com.sim4me.gmb.canvas.GMBDefaultConnector",
        "height": 9
      },
      {
        "vertices": [],
        "cat": "MODEL OBJECT",
        "name": "LT101",
        "x": 527,
        "width": 21,
        "index": 87,
        "y": 214,
        "params": {
          "elementID": 83,
          "fillColorParam": [
            0,
            0,
            0
            ],
          "dataStatus": 210,
          "labelFontInfo": "",
          "fillParam": false,
          "nameLocation": 8,
          "flipState": 0,
          "remoteFunction": false,
          "imageType": "Level Transmitter",
          "rotateState": 0,
          "clientClassName": "com.sim4me.gmb.models.DynSimTransmitter"
        },
        "ports": [
          {
            "orientation": 2,
            "showName": 1,
            "connector": "LC101.PV = LT101.MV",
            "yPort": 224,
            "lineThickness": 1,
            "name": "MV",
            "x": 527,
            "xPort": 527,
            "y": 224,
            "conFlag": 1
          },
          {
            "orientation": 2,
            "showName": 1,
            "connector": "LT101.IN = D101.L",
            "yPort": 224,
            "lineThickness": 1,
            "name": "IN",
            "x": 548,
            "xPort": 548,
            "y": 224,
            "conFlag": 2
          }
          ],
        "class": "com.sim4me.gmb.models.TRANSMITTER",
        "height": 21
      },
      {
        "vertices": [
          2,
          2,
          3,
          2,
          3,
          49,
          17,
          49
          ],
        "cat": "CONNECTOR",
        "name": "LT101.IN = D101.L",
        "x": 531,
        "width": 20,
        "index": 88,
        "y": 175,
        "params": {
          "elementID": 84,
          "startObject": "",
          "showEndPortName": true,
          "showStartPortName": true,
          "startPortLabel": "L",
          "isHidden": true,
          "endObject": ""
        },
        "ports": [],
        "class": "com.sim4me.gmb.canvas.GMBDefaultConnector",
        "height": 52
      },
      {
        "vertices": [
          57,
          2,
          2,
          2,
          2,
          5,
          4,
          5
          ],
        "cat": "CONNECTOR",
        "name": "LC101.PV = LT101.MV",
        "x": 470,
        "width": 60,
        "index": 89,
        "y": 222,
        "params": {
          "elementID": 85,
          "startObject": "",
          "showEndPortName": true,
          "showStartPortName": true,
          "startPortLabel": "MV",
          "isHidden": true,
          "endObject": ""
        },
        "ports": [],
        "class": "com.sim4me.gmb.canvas.GMBDefaultConnector",
        "height": 8
      },
      {
        "vertices": [],
        "cat": "MODEL OBJECT",
        "name": "TT101",
        "x": 448,
        "width": 21,
        "index": 90,
        "y": 416,
        "params": {
          "elementID": 86,
          "fillColorParam": [
            0,
            0,
            0
            ],
          "dataStatus": 212,
          "labelFontInfo": "",
          "fillParam": false,
          "nameLocation": 1,
          "flipState": 0,
          "remoteFunction": false,
          "imageType": "Temperature Transmitter",
          "rotateState": 0,
          "clientClassName": "com.sim4me.gmb.models.DynSimTransmitter"
        },
        "ports": [
          {
            "orientation": 2,
            "showName": 1,
            "connector": "TT101.IN = D102.FLASH.T",
            "yPort": 426,
            "lineThickness": 1,
            "name": "IN",
            "x": 448,
            "xPort": 448,
            "y": 426,
            "conFlag": 2
          },
          {
            "orientation": 2,
            "showName": 1,
            "connector": "TC101.PV = TT101.MV",
            "yPort": 426,
            "lineThickness": 1,
            "name": "MV",
            "x": 469,
            "xPort": 469,
            "y": 426,
            "conFlag": 1
          }
          ],
        "class": "com.sim4me.gmb.models.TRANSMITTER",
        "height": 21
      },
      {
        "vertices": [
          2,
          42,
          183,
          42,
          183,
          2,
          91,
          2
          ],
        "cat": "CONNECTOR",
        "name": "TT101.IN = D102.FLASH.T",
        "x": 357,
        "width": 186,
        "index": 91,
        "y": 424,
        "params": {
          "elementID": 87,
          "startObject": "",
          "showEndPortName": true,
          "showStartPortName": true,
          "startPortLabel": "FLASH.T",
          "isHidden": true,
          "endObject": ""
        },
        "ports": [],
        "class": "com.sim4me.gmb.canvas.GMBDefaultConnector",
        "height": 45
      },
      {
        "vertices": [
          2,
          102,
          275,
          102,
          275,
          2,
          328,
          2
          ],
        "cat": "CONNECTOR",
        "name": "TC101.PV = TT101.MV",
        "x": 467,
        "width": 331,
        "index": 92,
        "y": 324,
        "params": {
          "elementID": 88,
          "startObject": "",
          "showEndPortName": true,
          "showStartPortName": true,
          "startPortLabel": "MV",
          "isHidden": true,
          "endObject": ""
        },
        "ports": [],
        "class": "com.sim4me.gmb.canvas.GMBDefaultConnector",
        "height": 105
      },
      {
        "vertices": [],
        "cat": "MODEL OBJECT",
        "name": "PT101",
        "x": 620,
        "width": 21,
        "index": 93,
        "y": 53,
        "params": {
          "elementID": 89,
          "fillColorParam": [
            0,
            0,
            0
            ],
          "dataStatus": 210,
          "labelFontInfo": "",
          "fillParam": false,
          "nameLocation": 1,
          "flipState": 0,
          "remoteFunction": false,
          "imageType": "Pressure Transmitter",
          "rotateState": 0,
          "clientClassName": "com.sim4me.gmb.models.DynSimTransmitter"
        },
        "ports": [
          {
            "orientation": 1,
            "showName": 1,
            "connector": "PT101.IN = D101.P",
            "yPort": 74,
            "lineThickness": 1,
            "name": "IN",
            "x": 630,
            "xPort": 630,
            "y": 74,
            "conFlag": 2
          },
          {
            "orientation": 2,
            "showName": 1,
            "connector": "PC101.PV = PT101.MV",
            "yPort": 63,
            "lineThickness": 1,
            "name": "MV",
            "x": 641,
            "xPort": 641,
            "y": 63,
            "conFlag": 1
          }
          ],
        "class": "com.sim4me.gmb.models.TRANSMITTER",
        "height": 21
      },
      {
        "vertices": [
          2,
          50,
          2,
          31,
          36,
          31,
          36,
          2
          ],
        "cat": "CONNECTOR",
        "name": "PT101.IN = D101.P",
        "x": 594,
        "width": 39,
        "index": 94,
        "y": 72,
        "params": {
          "elementID": 90,
          "startObject": "",
          "showEndPortName": true,
          "showStartPortName": true,
          "startPortLabel": "P",
          "isHidden": true,
          "endObject": ""
        },
        "ports": [],
        "class": "com.sim4me.gmb.canvas.GMBDefaultConnector",
        "height": 53
      },
      {
        "vertices": [
          6,
          2,
          2,
          2,
          2,
          5,
          61,
          5
          ],
        "cat": "CONNECTOR",
        "name": "PC101.PV = PT101.MV",
        "x": 635,
        "width": 64,
        "index": 95,
        "y": 61,
        "params": {
          "elementID": 91,
          "startObject": "",
          "showEndPortName": true,
          "showStartPortName": true,
          "startPortLabel": "MV",
          "isHidden": true,
          "endObject": ""
        },
        "ports": [],
        "class": "com.sim4me.gmb.canvas.GMBDefaultConnector",
        "height": 8
      },
      {
        "vertices": [
          5,
          29,
          5,
          2,
          2,
          2,
          2,
          4
          ],
        "cat": "CONNECTOR",
        "name": "FT101.IN = S1.Q",
        "x": 134,
        "width": 8,
        "index": 96,
        "y": 225,
        "params": {
          "elementID": 92,
          "startObject": "",
          "showEndPortName": true,
          "showStartPortName": true,
          "startPortLabel": "Q",
          "isHidden": true,
          "endObject": ""
        },
        "ports": [],
        "class": "com.sim4me.gmb.canvas.GMBDefaultConnector",
        "height": 32
      }
      ],
    "name": "G2",
    "version": "6.1.0"
 };


processFlowsheet();

// USE GMBJSONHandler
//private static GMBElement getElementFromJSON(JSONObject jObj)
function getElementFromJSON(jObj)
{
    var obj = new Object();
    obj.index = parseInt(jObj['index']);
    obj.index = jObj['name'];
    obj.className = jObj['class'];
    obj.category = jObj['cat'];
    obj.x = parseInt(jObj['x']);
    obj.y = parseInt(jObj['y']);
    obj.width = parseInt(jObj['width']);
    obj.height = parseInt(jObj['height']);


    //Parse GMBParams
    obj.params = jObj['params'];
//    Iterator<String> it = params.keySet().iterator();
//    List<GMBBooleanParam> bools = new ArrayList<GMBBooleanParam>();
//    List<GMBLongParam> longs = new ArrayList<GMBLongParam>();
//    List<GMBFloatParam> floats = new ArrayList<GMBFloatParam>();
//    List<GMBStringParam> strings = new ArrayList<GMBStringParam>();
//    List<GMBColorParam> colors = new ArrayList<GMBColorParam>();
//    while(it.hasNext())
//    {
//      String key = it.next();
//      Object value = params.get(key);
//      if(value instanceof Boolean)
//      {
//         bools.add(new GMBBooleanParam(key, (boolean) value));
//      }
//      else if(value instanceof Long)
//      {
//        Long lVal = (Long) value;
//        longs.add(new GMBLongParam(key, lVal.intValue()));
//      }
//      else if(value instanceof Double)
//      {
//        Double dVal = (Double) value;
//        floats.add(new GMBFloatParam(key, dVal.floatValue()));
//      }
//      else if(value instanceof String)
//      {
//        strings.add(new GMBStringParam(key, (String) value));
//      }
//      else if (value instanceof JSONArray) // color param
//      {
//        GMBColorParam p = new GMBColorParam();
//        JSONArray colorArr = (JSONArray) value;
//        p.name =  key;
//        p.r = ((Long) colorArr.get(0)).intValue();
//        p.g = ((Long) colorArr.get(1)).intValue();
//        p.b = ((Long) colorArr.get(2)).intValue();
//        colors.add(p);
//      }
//    }
//    obj.booleanParams = bools.toArray(new GMBBooleanParam[bools.size()]);
//    obj.longParams = longs.toArray(new GMBLongParam[longs.size()]);
//    obj.floatParams = floats.toArray(new GMBFloatParam[floats.size()]);
//    obj.colorParams = colors.toArray(new GMBColorParam[colors.size()]);
//    obj.stringParams = strings.toArray(new GMBStringParam[strings.size()]);

    //Parse GMBPports
    obj.ports = jObj['ports'];
//    JSONArray ports = (JSONArray) jObj.get("ports");
//    List<GMBPortStruct> portList = new ArrayList<GMBPortStruct>();
//    int portSz = ports.size();
//    int k;
//    for( k = 0; k < portSz; k++)
//    {
//      JSONObject port = (JSONObject) ports.get(k);
//      GMBPortStruct p =  new GMBPortStruct();
//      p.name = (String) port.get("name");
//      p.x = ((Long) port.get("x")).intValue();
//      p.y = ((Long) port.get("y")).intValue();
//      p.xPort = ((Long) port.get("xPort")).intValue();
//      p.yPort = ((Long) port.get("yPort")).intValue();
//      p.orientation = ((Long) port.get("orientation")).intValue();
//      p.lineThickness = ((Long) port.get("lineThickness")).intValue();
//      p.connectFlag = ((Long) port.get("conFlag")).intValue();
//      p.connectorName = (String) port.get("connector");
//      p.showName = ((Long) port.get("showName")) != 0L;
//      portList.add(p);
//
//    }
//    obj.ports = portList.toArray(new GMBPortStruct[portList.size()]);

    //Parse GMBPVertices
    var vertCoord = jObj['vertices'];
//    JSONArray vertices = (JSONArray) jObj.get("vertices");
//    List<GMBVertex> vertList = new ArrayList<GMBVertex>();
    var vSize = jObj['vertices'].length;
    var idx = 0;
    obj.vertices = new Array();
    for( k = 0; k < vSize; k += 2)
    {
      console.log('k ' + vertCoord[k] + '; k+1 ' + vertCoord[k+1]);
      var v = new Point(parseInt(vertCoord[k]),parseInt(vertCoord[k+1]));
      obj.vertices.push(v);
    }
//    obj.vertices = vertList.toArray(new GMBVertex[vertList.size()]);

    return obj;
}



//
// Generate the drawing for the image.  Code adapted from GMBConnector in DYNSIM
// data is the element from the GMB file
function drawConnector(data, xin, yin)
{
   console.log('xIn ' + xin +'; yIn ' + yin + '; vertices ' + data.vertices.length);
   var lineThickness = 2; // test different widths
   // shift by line thickness / 2 so that the line
   // does not get cropped
   var xc = xin + lineThickness/2;
   var yc = yin + lineThickness/2;
   console.log('xc ' + xc +'; yc ' + yc);

   // if the line color and draw if defined
   //if ((lineColor != null) && (lineStyle != NO_LINE))
   //{
      // first draw a white line behind the colored line
      // set the line color
      //g2D.setColor(GMBCanvas.getDefaultFlowsheetColor() );


      // set the stroke
      //g2D.setStroke( backgroundStroke );
      // draw the lines
      console.log(data.vertices.length);
      var path = new Path();

      for (var i=0; i<data.vertices.length-1; i++)
      {
      // vertices have already been converted to PaperJs Points
         var p1 = data.vertices[i];
         var p2 = data.vertices[i+1];
         console.log('p1 ' + p1.x + ' ' + p1.y);
         console.log('p2 ' + p2.x + ' ' + p2.y);


         var x1 = 0;
         var y1 = 0;
         var x2 = 0;
         var y2 = 0;
         // for the first segment, make the background shorter
         // so that it does not hide the port connection
         if (i == 0)
         {
            // the segment is vertical
            if (p1.x == p2.x)
            {
               x1 = xc+p1.x;
               x2 = xc+p2.x;
               // goes down
               if (p1.y < p2.y)
               {
                  y2 = yc+p2.y;
                  y1 = Math.min(y2, yc + p1.y + (2*lineThickness+1));
               }
               // goes up
               else
               {
                  y2 = yc+p2.y;
                  y1 = Math.max(y2, yc + p1.y - (2*lineThickness+1));
               }
            }
            // else the segment is horizontal
            else
            {
               y1 = yc + p1.y;
               y2 = yc + p2.y;
               // goes to right
               if (p1.x < p2.x)
               {
                  x2 = xc + p2.x;
                  x1 = Math.min(x2, xc + p1.x + (2*lineThickness+1));
               }
               // goes to left
               else
               {
                  x2 = xc + p2.x;
                  x1 = Math.max(x2, xc + p1.x - (2*lineThickness+1));
               }
            }
         }

         // for the last segment, make the background shorter
         // so that it does not hide the port connection
         else if (i == data.vertices.length-2)
         {
            // the segment is vertical
            if (p1.x == p2.x)
            {
               x1 = xc+p1.x;
               x2 = xc+p2.x;
               // goes down
               if (p1.y < p2.y)
               {
                  y1 = yc+p1.y;
                  y2 = Math.max(y1, yc+p2.y-(2*lineThickness+1));
               }
               // goes up
               else
               {
                  y1 = yc+p1.y;
                  y2 = Math.min(y1, yc+p2.y+(2*lineThickness+1));
               }
            }
            // else the segment is horizontal
            else
            {
               y1 = yc+p1.y;
               y2 = yc+p2.y;
               // goes to right
               if (p1.x < p2.x)
               {
                  x1 = xc+p1.x;
                  x2 = Math.max(x1, xc+p2.x-(2*lineThickness+1));
               }
               // goes to left
               else
               {
                  x1 = xc+p1.x;
                  x2 = Math.min(x1, xc+p2.x+(2*lineThickness+1));
               }
            }
         }

         // else this is a normal segment
         else
         {
            x1 = xc+p1.x;
            y1 = yc+p1.y;
            x2 = xc+p2.x;
            y2 = yc+p2.y;
         }


         console.log('x1 '+x1+'; y1 '+y1+'; x2 '+x2+'; y2 '+y2);
         path.add(new Point(x1,y1));
         path.add(new Point(x2,y2));

//         // create the line shape
//         Line2D line = new Line2D.Float(x1, y1,
//                                        x2, y2);
//         // draw the line
//         g2D.draw( line );
      }

      path.strokeWidth = 2;
	  path.strokeColor = 'blue';

      // set the line color
      //g2D.setColor( lineColor );
      // set the stroke
      //g2D.setStroke( stroke );

      // draw the lines - how is this different than what is done above?
      // seems to draw over the same lines in most cases
      var connectorItem = new Group();
      for (var i=0; i<data.vertices.length-1; i++)
      {

         var p1 = data.vertices[i];
         var p2 = data.vertices[i+1];

         var p1c = new Point(xc+p1.x, yc+p1.y);
         var p2c = new Point(xc+p2.x, yc+p2.y);


		 connectorItem.addChild(new Path([p1c, p2c]));

         // create the line shape
//         Line2D line = new Line2D.Float(
//                       xc+(float)p1.x, yc+(float)p1.y,
//                       xc+(float)p2.x, yc+(float)p2.y);

         // draw the line
         //g2D.draw( line );
      }
      connectorItem.strokeWidth = 1;
	  connectorItem.strokeColor = 'red';
   //}
} //draw


function processFlowsheet()
{


    console.log(obj);
    // This will use the g2Gmb example for testing.
    // A more realistic example would fetch the data
    // via an api call.

    console.log('in processFlowsheet');
    if(g2Gmb != undefined)
    {
       console.log('g2Gmb is not undefined');

//       for (var elem in g2Gmb)
//       {
//          console.log(elem);
//       }

       if(g2Gmb.elements != undefined)
       {
          for(var i=0; i<g2Gmb.elements.length; i++)
          {
             var gmb = g2Gmb.elements[i];

             if(gmb != undefined && gmb.cat != undefined)
             {
                 if(gmb.cat == 'MODEL OBJECT')
                 {
                    if(gmb.class != undefined)
                    {
                        if(gmb.class.endsWith('VALVE'))
                        {
                           drawValve(gmb.x, gmb.y, gmb.height, gmb.width, gmb.name, gmb.class);
                        }
                        else if(gmb.class.endsWith('TRANSMITTER') || gmb.class.endsWith('PID'))
                        {
                           drawCircle(gmb.x, gmb.y, gmb.height, gmb.width, gmb.name, gmb.class);
                           //drawObj(gmb.x, gmb.y, gmb.height, gmb.width, gmb.name, gmb.class);
                        }
                        else
                        {
                           drawObj(gmb.x, gmb.y, gmb.height, gmb.width, gmb.name, gmb.class);
                        }
                    }
                 }
                 else if(gmb.cat == 'MODEL CONNECTOR')
                 {
                    if(gmb.params != undefined && gmb.params.startPortLoc != undefined)
                    {

                       var start = gmb.params.startPortLoc;
                       var end = gmb['params']['endPortLoc'];

                       var startSplit = start.split(',');
                       var x1 = parseInt(startSplit[0],10);
                       var ySplit = startSplit[1].split(';');
                       var y1 = parseInt(ySplit[0],10);

                       var endSplit = end.split(',');
                       var x2 = parseInt(endSplit[0],10);
                       ySplit = endSplit[1].split(';');
                       var y2 = parseInt(ySplit[0],10);

                       console.log(gmb.params.startPortLoc);
                       console.log('start: ' + x1 + ',' + y1);
                       console.log(gmb['params']['endPortLoc']);
                       console.log('end: ' + x2 + ',' + y2);

                       var p1 = new Point(x1,y1);
                       var p2 = new Point(x2,y2);
                       //console.log(p1 + ' : ' + p2);
                       //var vectorItem = new Path();
                       //vectorItem.add(p1);
                       //vectorItem.add(p2);
                       var vector = p2 - p1;
                       var arrowVector = vector.normalize(10);
                       var vectorItem = new Group([
		                  new Path([p1, p2]),
		                  new Path([
			                         p2 + arrowVector.rotate(135),
			                         p2,
			                         p2 + arrowVector.rotate(-135)
		                  ])
	                  ]);
	                    vectorItem.strokeWidth = 0.75;
	                    vectorItem.strokeColor = '#e4141b';
                    }
                    else
                    {
                       console.log(gmb['params']);
                    }
                 }
                 else if(gmb.cat == 'CONNECTOR')
                 {
                     var obj = getElementFromJSON(gmb);
                     // call the dynsim draw method
	                 //drawConnector(obj, gmb.x, gmb.y);
                 }
             }
          }
       }
     }
    else
    {
        console.log('g2Gmb is undefined');
    }
}

