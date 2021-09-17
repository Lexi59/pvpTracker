function checkUsername() {
    fetch(API_URL, {
        headers: {
            authorization: 'Bearer ' + localStorage.token
        }
    }).then(res => res.json())
        .then((result) => {
            if (result.user) {
                //getUser();
                getStats();
                //getCalculatedStats();
                //loadChart();
                document.querySelector('#welcome').textContent = "Welcome " + result.user.username + "!";
            }
            else {
                localStorage.removeItem('token');
                window.location.replace('../pages/login.html');
            }
        });
}

// function getUser(){
//     fetch(API_URL+'auth/',{
//         headers: {
//             'content-type':'application/json',
//             authorization: 'Bearer ' + localStorage.token
//         }
//     }).then(res => res.json()).then(user=>{
//         if(user.level){
//             otherLevel = user.level;
//             checkForStats();
//         }
//     }).catch((error)=>{
//         error.text().then(msg =>{
//             logErrorMessage(JSON.parse(msg).message);
//             console.error(JSON.parse(msg).message);
//         });
//     });
// }
function getStats() {
    fetch(API_URL + 'api/v1/battles/stats', {
        headers: {
            'content-type': 'application/json',
            authorization: 'Bearer ' + localStorage.token
        }
    }).then(res => res.json()).then(stats => {
        if (stats) {
            console.log(stats);
            document.querySelector('#overallStats').style.display = 'block';
            document.querySelector('#overallStatCard').innerHTML = '';
            var card = document.querySelector('#overallStatCard');
            if (stats.totalWins['Great'])
                card.appendChild(createCardPiece('<strong>Great League Wins:</strong>  ' + stats.totalWins['Great'].toLocaleString()));
            if (stats.totalWins['Ultra'])
                card.appendChild(createCardPiece('<strong>Ultra League Wins:</strong>  ' + stats.totalWins['Ultra'].toLocaleString()));
            if (stats.totalWins['Master'])
                card.appendChild(createCardPiece('<strong>Master League Wins:</strong>  ' + stats.totalWins['Master'].toLocaleString()));

            var card = document.querySelector('#personalBestsCard');
            var dateString = new Date(stats.mostWins['day']).toLocaleDateString();
            card.appendChild(createCardPiece('<strong>Most Wins:</strong>  ' + stats.mostWins['wins'].toLocaleString()));
            card.appendChild(createCardPiece('<strong> on </strong>  ' + dateString));
            card.appendChild(createCardPiece('<strong> in League: </strong>  ' + stats.mostWins['league']));

            var card = document.querySelector('#thisWeekCard');
            if (stats.totalWins['Great'])
                card.appendChild(createCardPiece('<strong>Great League Wins:</strong>  ' + stats.totalWins['Great'].toLocaleString()));
            if (stats.totalWins['Ultra'])
                card.appendChild(createCardPiece('<strong>Ultra League Wins:</strong>  ' + stats.totalWins['Ultra'].toLocaleString()));
            if (stats.totalWins['Master'])
                card.appendChild(createCardPiece('<strong>Master League Wins:</strong>  ' + stats.totalWins['Master'].toLocaleString()));
            
            var typesIHit = {};


            var ledWon = document.getElementById('LedWonChart').getContext('2d');
            var chart = new Chart(ledWon, {
                type: 'bar',
                data: {
                    labels: ['Led-Won', 'Led-Lost','Not Led-Won','Not Led-Lost'],
                    datasets: [{
                        label: 'times',
                        backgroundColor: 'rgb(255, 0, 0)',
                        borderColor: 'rgb(255, 0, 0)',
                        data: [stats.leadsVsWins['ledAndWon'],stats.leadsVsWins['ledAndLost'],stats.leadsVsWins['notLedAndWon'], stats.leadsVsWins['notLedandLost']]
                    }]
                },
                options: {
                    scales:{
                        y:{
                            beginAtZero: true
                        }
                    }
                }
            });

            fetch('https://pogoapi.net/api/v1/pokemon_types.json'
            ).then(res => res.json())
              .then((result) => {
                var objectArr = Object.values(result);
                for(var i = 0; i < stats.theirTeams.length; i++){
                    for(var key in stats.theirTeams[i]){
                        var name = key;
                        var form;
                        var pokemon;
                        if(key.split(' ').length > 1){
                            name = key.split(' ')[1];
                            form = key.split(' ')[0];
                            if(form=='Alolan'){form = "Alola"}
                            pokemon = objectArr.find(x => x.pokemon_name == name && (x.form == form));
                        }
                       else{
                        pokemon = objectArr.find(x => x.pokemon_name == name && (x.form == "Normal" || x.form == "Purified"))
                       }
                       //console.log(pokemon.pokemon_name, pokemon.type, pokemon.form);
                       if(pokemon){
                            for(var m = 0; m < pokemon.type.length; m++){
                                if (typesIHit[pokemon.type[m]]) {
                                    typesIHit[pokemon.type[m]]+= stats.theirTeams[i][key];
                                }
                                else {
                                    typesIHit[pokemon.type[m]] = stats.theirTeams[i][key];
                                }
                            }
                       }
                       else{
                           console.error("Couldn't find pokemon named " + key);
                           logErrorMessage("Pokemon Name '"+key+"' not found!");
                       }

                    }
                }
                console.log(typesIHit);
                var labels = [];
                var data = [];
                for(var key in typesIHit){labels.push(key);data.push(typesIHit[key]);}
                var types = document.getElementById('typesIHitChart').getContext('2d');
                var chart = new Chart(types, {
                type: 'pie',
                data: {
                    labels: labels,
                    datasets: [{
                        backgroundColor: ['Red','Orange','Yellow','Green','Blue','Purple','Pink','Grey','Black','Brown','DarkSalmon','ForestGreen','LightBlue','LightSalmon','LightSeaGreen','Magenta','MidnightBlue','MediumTurquoise','MediumPurple'],
                        data: data
                    }]
                },
                options: {
                }
            });
              });
        }
    }).catch((error) => {
        console.log(error);
        error.text().then(msg => {
            logErrorMessage(JSON.parse(msg).message);
            console.error(JSON.parse(msg).message);
        });
    });
}
function logErrorMessage(msg) {
    var div = document.createElement('div');
    div.innerHTML = `<div class="alert alert-danger">` + msg + `</div>`;
    document.querySelector('#error').appendChild(div);
}
function createCardPiece(text) {
    var p = document.createElement('p');
    p.class = 'card-text';
    p.innerHTML = text;
    return p;
}
// function getCalculatedStats() {
//     fetch(API_URL + 'api/v1/records/data', {
//         headers: {
//             'content-type': 'application/json',
//             authorization: 'Bearer ' + localStorage.token
//         }
//     }).then(res => res.json()).then(calculatedStats => {

//         document.querySelector('#levelUpDate').innerHTML = '<strong>Predicted Level Up:</strong> ' + getDaysToLevelUp(calculatedStats.totalXP, calculatedStats.averageXP);
//         document.querySelector('#level50Date').innerHTML = '<strong>Predicted Level 50:</strong> ' + getDaysTo50(calculatedStats.totalXP, calculatedStats.averageXP);

//         var card = document.querySelector('#personalBestsCard');
//         card.appendChild(createCardPiece('<strong>Most XP:</strong>  ' + calculatedStats.mostXP.toLocaleString()));
//         var dateString = new Date(calculatedStats.mostXPDay).toLocaleDateString();
//         if (calculatedStats.mostXPDayRangeEnd) { dateString = new Date(calculatedStats.mostXPDayRangeEnd).toLocaleDateString() + ' - ' + dateString; }
//         card.appendChild(createCardPiece('<strong> on </strong>  ' + dateString));
//         if (calculatedStats.mostXPComments) {
//             card.appendChild(createCardPiece('<strong>Comments: </strong>  ' + calculatedStats.mostXPComments));
//         }
//         card.appendChild(createCardPiece('<strong>Most Catches:</strong>  ' + calculatedStats.mostCatches.toLocaleString()));
//         dateString = new Date(calculatedStats.mostCatchesDay).toLocaleDateString();
//         if (calculatedStats.mostCatchesDayRangeEnd) { dateString = new Date(calculatedStats.mostCatchesDayRangeEnd).toLocaleDateString() + ' - ' + dateString; }
//         card.appendChild(createCardPiece('<strong> on </strong>  ' + dateString));
//         if (calculatedStats.mostCatchesComments) {
//             card.appendChild(createCardPiece('<strong>Comments: </strong>  ' + calculatedStats.mostCatchesComments));
//         }
//         card.appendChild(createCardPiece('<strong>Most Stardust:</strong>  ' + calculatedStats.mostStardust.toLocaleString()));
//         dateString = new Date(calculatedStats.mostStardustDay).toLocaleDateString();
//         if (calculatedStats.mostStardustDayRangeEnd) { dateString = new Date(calculatedStats.mostStardustDayRangeEnd).toLocaleDateString() + ' - ' + dateString; }
//         card.appendChild(createCardPiece('<strong> on </strong>  ' + dateString));
//         if (calculatedStats.mostStardustComments) {
//             card.appendChild(createCardPiece('<strong>Comments: </strong>  ' + calculatedStats.mostStardustComments));
//         }

//         var card = document.querySelector('#thisWeekCard');
//         card.appendChild(createCardPiece('<strong>XP:</strong>  ' + calculatedStats.XPWeek.toLocaleString()));
//         card.appendChild(createCardPiece('<strong>Catches:</strong>  ' + calculatedStats.catchesWeek.toLocaleString()));
//         card.appendChild(createCardPiece('<strong>KMs:</strong>  ' + calculatedStats.KMsWeek.toFixed(1)));

//         var card = document.querySelector('#thisMonthCard');
//         card.appendChild(createCardPiece('<strong>XP:</strong>  ' + calculatedStats.XPMonth.toLocaleString()));
//         card.appendChild(createCardPiece('<strong>Catches:</strong>  ' + calculatedStats.catchesMonth.toLocaleString()));
//         card.appendChild(createCardPiece('<strong>KMs:</strong>  ' + calculatedStats.KMsMonth.toFixed(1)));
//         console.log(calculatedStats);

//     }).catch((error) => {
//         error.text().then(msg => {
//             logErrorMessage(JSON.parse(msg).message);
//             console.error(JSON.parse(msg).message);
//         });
//     });
// }

// function getLevel(XP) {
//     if (otherLevel) { return otherLevel; }
//     if (XP < xpValues[0]) { return "1"; }
//     for (var i = 0; i < xpValues.length - 1; i++) {
//         if (XP >= xpValues[i] && XP < xpValues[i + 1]) {
//             return (i + 2).toString();
//         }
//     }
//     if (XP >= xpValues[xpValues.length - 1]) { return "50"; }
// }

// function getDaysToLevelUp(XP, avgXP) {
//     if (getLevel(XP) == '50') { return "🏆"; }
//     var XPtoNextLvl = xpValues[parseInt(getLevel(XP)) - 1] - XP;
//     var daysToLevelUp = Math.ceil(XPtoNextLvl / avgXP);
//     var newDate = new Date();
//     newDate.setDate(newDate.getDate() + daysToLevelUp);
//     return newDate.toLocaleDateString();
// }
// function getDaysTo50(XP, avgXP) {
//     if (getLevel(XP) == '50') { return "🏆"; }
//     var XPto50 = xpValues[xpValues.length - 1] - XP;
//     var daysToLevelUp = Math.ceil(XPto50 / avgXP);
//     var newDate = new Date();
//     newDate.setDate(newDate.getDate() + daysToLevelUp);
//     return newDate.toLocaleDateString();
// }


// function loadChart() {
//     var xpChart = document.getElementById('XPChart').getContext('2d');
//     var stardustChart = document.getElementById('StardustChart').getContext('2d');
//     var catchesChart = document.getElementById('CatchesChart').getContext('2d');
//     var kmsChart = document.getElementById('KMSChart').getContext('2d');

//     var chart = new Chart(xpChart, {
//         type: 'bar',
//         data: {
//             labels: ['Led-Won', 'Led-Lost','Not Led-Won','Not Led-Lost'],
//             datasets: [{
//                 label: '',
//                 backgroundColor: 'rgb(255, 0, 0)',
//                 borderColor: 'rgb(255, 0, 0)',
//                 data: []
//             }]
//         },
//         options: {
//             scales: {
//                 xAxes: [{
//                     ticks: {
//                         display: true,
//                         autoSkip: true,
//                         maxTicksLimit: 20
//                     }
//                 }]
//             }
//         }
//     });



    // fetch(API_URL + 'api/v1/records/data/chart', {
    //     headers: {
    //         'content-type': 'application/json',
    //         authorization: 'Bearer ' + localStorage.token
    //     }
    // }).then(res => res.json()).then(data => {
    //     console.log(data);
    //     var chart = new Chart(xpChart, {
    //         type: 'line',
    //         data: {
    //             labels: data.labels,
    //             datasets: [{
    //                 label: 'XP',
    //                 backgroundColor: 'rgb(255, 0, 0)',
    //                 borderColor: 'rgb(255, 0, 0)',
    //                 data: data.XPdata
    //             }]
    //         },
    //         options: {
    //             scales: {
    //                 xAxes: [{
    //                     ticks: {
    //                         display: true,
    //                         autoSkip: true,
    //                         maxTicksLimit: 20
    //                     }
    //                 }]
    //             }
    //         }
    //     });
    //     chart = new Chart(kmsChart, {
    //         type: 'line',
    //         data: {
    //             labels: data.labels,
    //             datasets: [{
    //                 label: 'KMs',
    //                 backgroundColor: 'rgb(255, 0, 0)',
    //                 borderColor: 'rgb(255, 0, 0)',
    //                 data: data.kmsData
    //             }]
    //         },
    //         options: {
    //             scales: {
    //                 xAxes: [{
    //                     ticks: {
    //                         display: true,
    //                         autoSkip: true,
    //                         maxTicksLimit: 20
    //                     }
    //                 }]
    //             }
    //         }
    //     });
    //     chart = new Chart(catchesChart, {
    //         type: 'line',
    //         data: {
    //             labels: data.labels,
    //             datasets: [{
    //                 label: 'Catches',
    //                 backgroundColor: 'rgb(255, 0, 0)',
    //                 borderColor: 'rgb(255, 0, 0)',
    //                 data: data.catchesData
    //             }]
    //         },
    //         options: {
    //             scales: {
    //                 xAxes: [{
    //                     ticks: {
    //                         display: true,
    //                         autoSkip: true,
    //                         maxTicksLimit: 20
    //                     }
    //                 }]
    //             }
    //         }
    //     });
    //     chart = new Chart(stardustChart, {
    //         type: 'line',
    //         data: {
    //             labels: data.labels,
    //             datasets: [{
    //                 label: 'Stardust',
    //                 backgroundColor: 'rgb(255, 0, 0)',
    //                 borderColor: 'rgb(255, 0, 0)',
    //                 data: data.stardustData
    //             }]
    //         },
    //         options: {
    //             scales: {
    //                 xAxes: [{
    //                     ticks: {
    //                         display: true,
    //                         autoSkip: true,
    //                         maxTicksLimit: 20
    //                     }
    //                 }]
    //             }
    //         }
    //     });

    // }).catch((error) => {
    //     error.text().then(msg => {
    //         logErrorMessage(JSON.parse(msg).message);
    //         console.error(JSON.parse(msg).message);
    //     });
    // });

//}
