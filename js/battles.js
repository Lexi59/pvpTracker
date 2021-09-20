function checkUsername() {
  fetch(API_URL, {
    headers: {
      authorization: 'Bearer ' + localStorage.token
    }
  }).then(res => res.json())
    .then(async (result) => {
      if (result.user) {
        getRecords();
        document.querySelector('#date').value = new Date().toLocaleDateString();
        if (!localStorage.getItem('pokemon')) {
          await getAllPokemon()
        }
        var arr = localStorage.getItem('pokemon').split(',');
        autocomplete(document.getElementById("myLead"), arr);
        autocomplete(document.getElementById("mySecond"), arr);
        autocomplete(document.getElementById("myThird"), arr);
        autocomplete(document.getElementById("theirLead"), arr);
        autocomplete(document.getElementById("theirSecond"), arr);
        autocomplete(document.getElementById("theirThird"), arr);
        document.querySelector('#welcome').textContent = "Welcome " + result.user.username + "!";
      }
      else {
        localStorage.removeItem('token');
        window.location.replace('../pages/login.html');
      }
    });
}
function editEntry(id) {
  fetch(API_URL + 'api/v1/battles', {
    headers: {
      'content-type': 'application/json',
      authorization: 'Bearer ' + localStorage.token
    }
  }).then(res => res.json()).then(battles => {
    for (var i = 0; i < battles.length; i++) {
      if (battles[i]._id == id) {
        document.querySelector('#date').value = new Date(battles[i].date).toLocaleDateString();
        document.querySelector('#' + battles[i].league.toLowerCase()).checked = true;
        document.querySelector('#myLead').value = battles[i].myTeam[0];
        document.querySelector('#mySecond').value = battles[i].myTeam[1];
        document.querySelector('#myThird').value = battles[i].myTeam[2];
        document.querySelector('#theirLead').value = battles[i].theirTeam[0];
        document.querySelector('#theirSecond').value = battles[i].theirTeam[1];
        document.querySelector('#theirThird').value = battles[i].theirTeam[2];
        document.querySelector('#win').checked = battles[i].win;
        document.querySelector('#me').checked = battles[i].led;
        document.querySelector('#loss').checked = !battles[i].win;
        document.querySelector('#them').checked = !battles[i].led;
        document.querySelector('#battleID').value = id;
      }
    }
  }).catch((error) => {
    console.log(error);
    error.text().then(msg => {
      logErrorMessage(JSON.parse(msg).message);
      console.error(JSON.parse(msg).message);
    });
  });
}
function deleteEntry(id) {
  if (confirm("Are you sure? This action cannot be undone.")) {
    var remove = true;
    fetch(API_URL + 'api/v1/battles/remove', {
      method: 'POST',
      body: JSON.stringify({ removeID: id }),
      headers: {
        'content-type': 'application/json',
        authorization: 'Bearer ' + localStorage.token
      }
    }).then((response) => {
      if (response.ok) {
        getRecords();
        resetForm();
      }
    })
      .catch((error) => {
        error.text().then(msg => {
          logErrorMessage(JSON.parse(msg).message);
          console.error(JSON.parse(msg).message);
        });
      });
  }
}

document.querySelector('#battleForm').addEventListener('reset', (e) => {
  e.preventDefault();
  resetForm();
});

function resetForm() {
  document.querySelector('#date').value = new Date().toLocaleDateString();
  document.querySelector('#great').checked = true;
  document.querySelector('#myLead').value = "";
  document.querySelector('#mySecond').value = "";
  document.querySelector('#myThird').value = "";
  document.querySelector('#theirLead').value = "";
  document.querySelector('#theirSecond').value = "";
  document.querySelector('#theirThird').value = "";
  document.querySelector('#win').checked = true;
  document.querySelector('#me').checked = true;
}

document.querySelector('#battleForm').addEventListener('submit', (e) => {
  e.preventDefault();
  clearErrorMessages();
  if (e.submitter.id == 'fillDefaults') {
    var team = document.querySelector('input[name=league]:checked').value;
    fetch(API_URL + 'auth/', {
      headers: {
        authorization: 'Bearer ' + localStorage.token
      }
    }).then(res => res.json())
      .then((result) => {
        if (result.greatLeagueTeam && team == 'Great') {
          document.getElementById("myLead").value = result.greatLeagueTeam[0];
          document.getElementById("mySecond").value = result.greatLeagueTeam[1];
          document.getElementById("myThird").value = result.greatLeagueTeam[2];
        }
        if (result.ultraLeagueTeam && team == "Ultra") {
          document.getElementById("myLead").value = result.ultraLeagueTeam[0];
          document.getElementById("mySecond").value = result.ultraLeagueTeam[1];
          document.getElementById("myThird").value = result.ultraLeagueTeam[2];
        }
        if (result.masterLeagueTeam && team == "Master") {
          document.getElementById("myLead").value = result.masterLeagueTeam[0];
          document.getElementById("mySecond").value = result.masterLeagueTeam[1];
          document.getElementById("myThird").value = result.masterLeagueTeam[2];
        }
      });
  }
  else {
    const league = document.querySelector('input[name=league]:checked').value;
    const date = new Date(document.querySelector('#date').value.trim());
    const myTeam = [document.querySelector('#myLead').value.trim(), document.querySelector('#mySecond').value.trim(), document.querySelector('#myThird').value.trim()];
    const theirTeam = [document.querySelector('#theirLead').value.trim(), document.querySelector('#theirSecond').value.trim(), document.querySelector('#theirThird').value.trim()];
    const win = document.querySelector('#win').checked;
    const led = document.querySelector('#me').checked;
    var error = false;

    if (!date.getTime() || date.getTime() > new Date().getTime()) {
      logErrorMessage("Invalid Date");
      error = true;
    }
    if (myTeam.filter(x => x).length < 3) {
      logErrorMessage("Make sure all three of your team members are filled in");
      error = true;
    }
    if (!error) {
      var battle = {
        league,
        date,
        myTeam,
        theirTeam,
        win,
        led
      };
      if (document.querySelector('#battleID').value.trim() != "") {
        battle.updateId = document.querySelector('#battleID').value;
        document.querySelector('#battleID').value = "";
      }
      console.log(battle);
      fetch(API_URL + 'api/v1/battles', {
        method: 'POST',
        body: JSON.stringify(battle),
        headers: {
          'content-type': 'application/json',
          authorization: 'Bearer ' + localStorage.token
        }
      }).then((response) => {
        if (response.ok) {
          getRecords();
          return response.json();
        }
        throw response;
      }).catch((error) => {
        console.log(error);
        error.text().then(msg => {
          logErrorMessage(JSON.parse(msg).message);
          console.error(JSON.parse(msg).message);
        });
      });
      resetForm();
    }
  }
})

function logErrorMessage(msg) {
  var div = document.createElement('div');
  div.innerHTML = `<div class="alert alert-danger">` + msg + `</div>`;
  document.querySelector('#error').appendChild(div);
}
function clearErrorMessages() {
  document.querySelector('#error').innerHTML = "";
}

function getRecords() {
  clearErrorMessages();
  fetch(API_URL + 'api/v1/battles', {
    headers: {
      'content-type': 'application/json',
      authorization: 'Bearer ' + localStorage.token
    }
  }).then(res => res.json()).then(battles => {
    document.querySelector("#battleTable tbody").innerHTML = "";
    //len = Math.min(records.length, len);
    for (var i = 0; i < battles.length; i++) {
      var row = document.createElement('tr');

      row.innerHTML = `<td>` + new Date(battles[i].date).toLocaleDateString() + `</td>` +
        `<td>` + battles[i].league + `</td>` +
        `<td>` + battles[i].myTeam.join(', ') + `</td>` +
        `<td>` + battles[i].theirTeam.join(', ') + `</td>` +
        `<td>` + (battles[i].win ? '✔' : '') + `</td>` +
        `<td>` + (battles[i].led ? '✔' : '') + `</td>`;

      document.querySelector('#battleTable tbody').appendChild(row);
      row.innerHTML += `<td><button class="btn btn-success my-2 my-sm-0 ml-auto table-buttons" onclick='editEntry("` + battles[i]._id + `")'>✏️</button><button class="btn btn-danger my-2 my-sm-0 ml-auto table-buttons" onclick='deleteEntry("` + battles[i]._id + `")'>🗑️</button></td>`;
    }
    // if(battles.length > len){
    //     document.querySelector('#viewMore').classList.remove('hidden');
    // }
    // else {
    //     document.querySelector('#viewMore').classList.add('hidden');
    // }
  }).catch((error) => {
    console.log(error);
    error.text().then(msg => {
      logErrorMessage(JSON.parse(msg).message);
      console.error(JSON.parse(msg).message);
    });
  });
}
// function viewMore(){
//     len+=10;
//     getRecords();
// }

// function getImage(name){
//   if(name.includes('Alolan')){
//     name = name.split(' ')[1] + '-alola';
//   }
//   fetch(' https://pokeapi.co/api/v2/pokemon/'+name.toLowerCase()
//   ).then(res => res.json())
//     .then((result) => {
//       console.log(result);
//       console.log(result.sprites.front_default);
//     });
//}

function getUserInfo(team) {
  fetch(API_URL + 'auth/', {
    headers: {
      authorization: 'Bearer ' + localStorage.token
    }
  }).then(res => res.json())
    .then((result) => {
      if (result.greatLeagueTeam && team == 'Great') {
        document.getElementById("myLead").value = result.greatLeagueTeam[0];
        document.getElementById("mySecond").value = result.greatLeagueTeam[1];
        document.getElementById("myThird").value = result.greatLeagueTeam[2];
      }
      if (result.ultraLeagueTeam && team == "Ultra") {
        document.getElementById("myLead").value = result.ultraLeagueTeam[0];
        document.getElementById("mySecond").value = result.ultraLeagueTeam[1];
        document.getElementById("myThird").value = result.ultraLeagueTeam[2];
      }
      if (result.masterLeagueTeam && team == "Master") {
        document.getElementById("myLead").value = result.masterLeagueTeam[0];
        document.getElementById("mySecond").value = result.masterLeagueTeam[1];
        document.getElementById("myThird").value = result.masterLeagueTeam[2];
      }
    }
    );
}