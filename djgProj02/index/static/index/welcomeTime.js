//import axios from 'axios'; // only need this if we install axios locally


// key global points
let app
{
    let time01, time02, time03;
}
    // the axios call will return a Promise object

    function getTimeFromApi()
    {
        const promiseDT = axios.get('http://worldtimeapi.org/api/ip')
            .catch(error => console.log('BAD', error))
            .then(response => {
                //console.log(response.data["datetime"]);
                return response.data["datetime"];
            });

        promiseDT.then((value) => {
            //console.log(value);
            document.getElementById("timepar").innerHTML =  "TIME from WorldTimeAPI is: " + value;
            });
    }


    function getTimeToDisplay() {
       let date = new Date();
       let time = date.toLocaleTimeString();
       return time;
       //document.getElementById('onetime').textContent = time;
    }

    function displayTime(elementID)
    {
       document.getElementById(elementID).textContent = elementID + ': ' + getTimeToDisplay();
    }

    function displayManyTimes()
    {
       displayTime('manytimes');
    }

// this will only load once - immediately - can use to intialize other times
    document.getElementById('onetime').textContent = 'onetime: ' + getTimeToDisplay();

    // The line below initializes 'manytimes' on page load.  If commented out
    // 'manytimes' will be the text in the html file (if any) until the first interval executes
    displayTime('manytimes');

     // setInterval allows the function to get called every x milliseconds
     const clocker = setInterval(getTimeFromApi,1000);

// why doesn't this work?
     //const clocker2 = setInterval(displayTime('manytimes'),1000);
     const clocker3 = setInterval(displayManyTimes,1000);

// https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Asynchronous/Timeouts_and_intervals
     // now look into requestAnimationFrame(timestamp) and how that might be better or worse

    let starttime = null;
    let raf_loc;
    function raf(timestamp)
    {
       if(!starttime)
       {
          starttime = timestamp;
       }

       const currenttime = timestamp - starttime;

       //document.getElementById('raftest').textContent = currenttime;

       displayTime('raftest');

       raf_loc = requestAnimationFrame(raf);
    }

    raf();
