//"use strict";


// key global points
//let app
//{
//    let glbl01;
//}

function drawTank(x,y,h,w,name,dynclass)
{
    var topLeft = new Point(x,y);
    //console.log(topLeft);
    var size = new Size(w,h); // paper script size takes width first then height
    //console.log(size);

    // 2 ways to draw a rectangle
    //var rect = new Rectangle(x,y,w,h);
    // or
    var rect = new Path.Rectangle(topLeft,size);
    if(dynclass != 'undefined')
    {
        if(dynclass === 'TANK')
        {
           rect.fillColor = 'blue';
        }
        else if(dynclass === 'SOURCE')
        {
            rect.fillColor = 'grey';
        }
        else if(dynclass === 'SINK')
        {
            rect.fillColor = 'grey';
        }
         // TODO: when parsing JSON, store the DYNSIM type/class in the generic data object
         rect.data.class = dynclass;
    }
    else
    {
       rect.fillColor = 'red';
    }


    if(name != 'undefined' && name != '') // should always be defined
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
    //var path = new Path(rect,txt);
    return rect;
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
     }
}

// get started with some code
// x,y,h,w taken manually from FS1.GMB.JSON from RenderTest.js4m

var src = drawTank(95,144,55,55,'SRC1','SOURCE');
var snk = drawTank(707,200,55,55,'SNK1','SINK');
var tnk = drawTank(380,169,55,55,'T1','TANK');
var vlv1 = drawValve(231,171,24,24,'XV1');
var vlv2 = drawValve(548,192,24,24,'XV2');

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