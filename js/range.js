document.querySelector("#eventForm").addEventListener("submit", (e) => {
  e.preventDefault();
  clearErrorMessages();
  const startDate = new Date(document.querySelector("#startDate").value);
  const endDate = new Date(document.querySelector("#endDate").value);
  const title = document.querySelector("#title").value;
  const comments = document.querySelector("#comments").value;
  var error = false;
  if (title.length < 6) {
    logErrorMessage("Please enter a 6+ character title");
    error = true;
    document.querySelector("#title").classList.add("is-invalid");
  }
  if (endDate.getTime() < startDate.getTime()) {
    logErrorMessage("Event Ends Before Start Date");
    document.querySelector("#endDate").classList.add("is-invalid");
    error = true;
  }
  if (!error) {
    //valid event date
    var event = {
      title,
      startDate,
      endDate,
      comments,
    };
    fetch(API_URL + "api/v1/events/", {
      method: "POST",
      body: JSON.stringify(event),
      headers: {
        "content-type": "application/json",
        authorization: "Bearer " + localStorage.token,
      },
    }).then((response) => {
        if(response.ok){return response.json();}
            throw response;
    }).then((result)=>{
        getEvents();
    }).catch((error)=>{
        error.text().then(msg =>{
            logErrorMessage(JSON.parse(msg).message);
            console.error(JSON.parse(msg).message);
        });
    });
    
  }
});

function getEvents() {
  fetch(API_URL + "api/v1/events", {
    headers: {
      "content-type": "application/json",
      authorization: "Bearer " + localStorage.token,
    },
  })
    .then((res) => res.json())
    .then((events) => {
      document.querySelector("#eventTable tbody").innerHTML = "";
      for (var i = 0; i < events.length; i++) {
        var row = document.createElement("tr");
        row.innerHTML =
          `<td>` + events[i].title +`</td>` +
          `<td>` + addDay(events[i].startDate) +`</td>` +
          `<td>` + addDay(events[i].endDate) +`</td>` +
          `<td>` + events[i].comments +`</td>`;

        row.innerHTML +=
          `<button class="btn btn-success my-2 my-sm-0 ml-auto table-buttons" onclick='viewStats("` +events[i].startDate+'","'+events[i].endDate +`")'>👁</button><button class="btn btn-danger my-2 my-sm-0 ml-auto table-buttons" onclick='deleteEntry("` +events[i].title +`")'>🗑️</button></td>`;
        document.querySelector("#eventTable tbody").appendChild(row);
      }
    })
    .catch((error) => {
      error.text().then((msg) => {
        logErrorMessage(JSON.parse(msg).message);
        console.error(JSON.parse(msg).message);
      });
    });
}

function deleteEntry(title) {
  if (
    confirm(
      "You are deleting the event: " +
        title +
        ". Are you sure? This action cannot be undone."
    )
  ) {
    var remove = true;
    fetch(API_URL + "api/v1/events/remove", {
      method: "POST",
      body: JSON.stringify({ title }),
      headers: {
        "content-type": "application/json",
        authorization: "Bearer " + localStorage.token,
      },
    })
      .then((response) => {
        if (response.ok) {
          getEvents();
          return response.json();
        }
        throw response;
      })
      .then((res) => {
        res.json();
      })
      .catch((error) => {
        error.text().then((msg) => {
          logErrorMessage(JSON.parse(msg).message);
          console.error(JSON.parse(msg).message);
        });
      });
  }
}
function viewStats(startDate, endDate){
    const today = new Date();
    var error = false;
    startDate = new Date(startDate);
    endDate = new Date(endDate);
    

    if(startDate.getTime() > today.getTime()){
        logErrorMessage("Invalid Start Date in the Future")
        document.querySelector('#startDate').classList.add('is-invalid');
        error = true;
    }
    if(!error){
        //valid event date
        var event = {
            startDate,
            endDate
        };
        fetch(API_URL+'api/v1/events/data',{
            method: 'POST',
            body: JSON.stringify(event),
            headers: {
                'content-type':'application/json',
                authorization: 'Bearer ' + localStorage.token
            }
        }).then(res => res.json()).then(stats=>{
            if(stats){
                console.log(stats);
                document.querySelector('#eventStats').style.display = 'block';
                document.querySelector('#startDateOutput').textContent = 'Start Date: ' + addDay(startDate);
                document.querySelector('#endDateOutput').textContent = 'End Date: ' + addDay(endDate);
                document.querySelector('#XP').textContent = 'XP: ' + stats.XP.toLocaleString();
                document.querySelector('#catches').textContent = 'Catches: ' + stats.catches.toLocaleString();
                document.querySelector('#stardust').textContent = 'Stardust: ' + stats.stardust.toLocaleString();
                document.querySelector('#kms').textContent = 'KMs: ' + stats.kms;
                document.querySelector('#luckyEggs').textContent =  'Lucky Eggs: ' + stats.luckyEggs.toLocaleString();
            }
        }).catch((error)=>{
            error.text().then(msg =>{
                logErrorMessage(JSON.parse(msg).message);
                console.error(JSON.parse(msg).message);
            });
        });
    }
}
function addDay(date){
    var date = new Date(date);
    date.setDate(date.getDate() + 1)
    return date.toLocaleDateString();
}

function logErrorMessage(msg) {
  var div = document.createElement("div");
  div.innerHTML = `<div class="alert alert-danger">` + msg + `</div>`;
  document.querySelector("#error").appendChild(div);
}
function clearErrorMessages() {
  document.querySelector("#error").innerHTML = "";
  document.querySelector("#startDate").classList.remove("is-invalid");
  document.querySelector("#endDate").classList.remove("is-invalid");
}
