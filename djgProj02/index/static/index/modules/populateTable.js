// this is a generic table populate method that will
// use the JSON keys to create headers, and fill the table with
// however many rows and columns it needs.
function populateTableMod(value,tableID)
{
            console.log(value);

            let t = document.getElementById(tableID);

            // header is row 0
//            let r1 = t.insertRow(1);
//            let c1 = r1.insertCell(0);
//            let c2 = r1.insertCell(1);
//            let c3 = r1.insertCell(2);
//            let c4 = r1.insertCell(3);
//
//            c1.innerHTML = 0;
//            c2.innerHTML = "sample description";
//            c3.innerHTML = "sample timestamp";
//            c4.innerHTML = "F";

            // typeof will simply return "object"
            console.log(typeof(value));

            // another way to prove an object is an array (will return "[object Array]")
            console.log(Object.prototype.toString.call(value));

            // header is row 0, so start at 1
            if(Array.isArray(value))
            {
                console.log("value is an array");

                // could auto create table header from keys, which would always fill it automatically
                // the problem is the keys may or may not be named and capitalized as desired
                let keys = [];
                if(value.length >= 1)
                {
                    // not sure we need to create the THead element.  th might be enoug
                    let th1 = t.createTHead(); // create the header

                    let rh1 = th1.insertRow(0);

                    let hc = 0;

                    for(let key in value[0])
                    {
                       keys.push(key); // save this for accessing values later

                       let thCol = document.createElement('th');
                       // next couple of lines capitalizes just first letter for header row
                       let kCap1 = key.toLowerCase();
                       kCap1 = kCap1[0].toUpperCase() + kCap1.substring(1);
                       // now create a text object/node
                       let txt = document.createTextNode(kCap1);
                       thCol.appendChild(txt);
                       rh1.appendChild(thCol);
                    }
                }

                for(let i=0; i < value.length; i++)
                //let i = 0;
                //for(i in value)
                {
                    let r1 = t.insertRow(i+1);

                    for(let j=0; j < keys.length; j++)
                    {
                        //console.log("i: " + i + "; j: " + j + "; val: "+ value[i][keys[j]]);
                        let c = r1.insertCell(j);
                        c.innerHTML = value[i][keys[j]];
                    }

                    // let row = t.rows[i+1];
                    // row.addEventListener("rowClick", function() {
                    //     this.className + "selection";
                    // });

//                    let col = 0;
//                    let c1 = r1.insertCell(col++);
//                    let c2 = r1.insertCell(col++);
//                    let c3 = r1.insertCell(col++);
//                    let c4 = r1.insertCell(col);
//
//                    c1.innerHTML = value[i]["number"];
//                    c2.innerHTML = value[i]["desc"];
//                    c3.innerHTML = value[i]["timestamp"];
//                    c4.innerHTML = value[i]["protected"];
                }

                // now add selection listener
                let rowCount = t.rows.length;
                for(let i=0; i<rowCount; i++)
                {
                    console.log(t.rows[i].innerHTML);
                    t.rows[i].onclick = (function() {
                        this.addClass('rSelected');
                    })
                    //t.rows[i].addEventListener("click", function() {
                     //   this.addClass = 'rSelected';
                    //});
                }
            }
}

function clearTable(tableID)
{
   document.getElementById(tableID).innerHTML = '';
}

export {populateTableMod, clearTable}; // comma separated list of exported items