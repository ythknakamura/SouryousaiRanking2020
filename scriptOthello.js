const INTERVAL_SEC_O = 30;
const TOT_ID = 0;
const WIN_ID = 1;
const LOSE_ID = 2;
const PLAYER = "プレーヤー";

let ncmbO = new NCMB("420f775059fe2f23fa2684cc189526e292bd9857e261fc5e2c710b17ccd2c87f", "cf0d2d0aecda8cb5edda288fa827e3deffe32e4f3aa9ebc3cd76af44c03f09ff");
let Result = ncmbO.DataStore("Result");
let Log = ncmbO.DataStore("Log");
let selectedIndexO = 0;
let timerO;

function CreateLogTable(rawdata) {
    $("#panelLog").show();
    $("#panelResult").hide();
    
    let tbody = $('#LogBody');
    tbody.empty();
    $.each(rawdata, function (i, data) {
        let tr = $('<tr />');
        let datestring = data["updateDate"];
        let res = /^(....)-(..)-(..)T(..):(..):(..)+\..+Z$/.exec(data["updateDate"]);
        let dateObj = new Date(Number(res[1]), Number(res[2]) - 1, Number(res[3]), Number(res[4]), Number(res[5]), Number(res[6]));
        dateObj.setHours(dateObj.getHours()+ 9);
        let date =  (dateObj.getMonth() + 1) +'/' + dateObj.getDate() + '  ' + dateObj.toLocaleTimeString();
        let num = $('<td />').text(i+1);
        let blackScore = $('<td />').text(data["blackScore"]);
        let player1 = $('<td />').text(data["player1"]);
        let player2 = $('<td />').text(data["player2"]);
        tr.append(num, date, player1, player2, blackScore);
        tbody.append(tr);      
    });
}

function CreateResultTable2(rawdata) {
    $("#panelLog").hide();
    $("#panelResult").show();

    let scoreList = {};
    $.each(rawdata, function (i, data) {

        let blackScore = data["blackScore"];
        let playerW, playerL; 
        if (!isFinite(blackScore)) {
            return true;
        }
        else if (blackScore > 0) {
            playerW = data["player1"];
            playerL = data["player2"];
        }
        else if (blackScore < 0) {
            playerW = data["player2"];
            playerL = data["player1"];
        }

        if (playerW == playerL) return true;
        if (playerW != PLAYER && playerL != PLAYER) return true;

        let scoreW = (playerW in scoreList) ? scoreList[playerW] : [0, 0, 0];
        let scoreL = (playerL in scoreList) ? scoreList[playerL] : [0, 0, 0];
        scoreW[TOT_ID] += 1;
        scoreL[TOT_ID] += 1;
        scoreW[WIN_ID] += 1;
        scoreL[LOSE_ID] += 1;
        scoreList[playerW] = scoreW;
        scoreList[playerL] = scoreL;
    });

    let players = Object.keys(scoreList);
    players.sort(function (p1, p2) {
        var a = scoreList[p1];
        var b = scoreList[p2];
        return a[WIN_ID] * b[TOT_ID] < b[WIN_ID] * a[TOT_ID] ? 1 : -1;
    });

    let tbody = $('#ResultBody');
    tbody.empty();
    $.each(players, function (i, p) {
        let name = p == PLAYER ? "(プレーヤー)" : p;
        let score = scoreList[p];
        let winrate = (100 * score[WIN_ID] / score[TOT_ID]);
        let tr = $('<tr />');
        let rank = $('<td />').text("#" + (i + 1));
        let player = $('<td />').text(name);
        let tot = $('<td />').text(score[TOT_ID]);
        let win = $('<td />').text(score[WIN_ID]);
        let lose = $('<td />').text(score[LOSE_ID]);
        let rate = $('<td />').text(winrate.toFixed(1) + "%");
        tr.append(rank, player, tot, win, lose, rate);
        tbody.append(tr);
    });
}

function SetTabIndexO(index) {
    selectedIndexO = index;
    let anchors = $('ul.tabsO a');
    anchors.filter('.on').removeClass('on');
    let currentA = anchors.eq(index).addClass('on');

    let currentT, lastT;
    switch (index) {
        case 0:
            Log.notEqualTo("blackScore", "interrupted")
                .limit(1000)
                .fetchAll()
                .then(CreateResultTable2)
                .catch(console.log);
            break;
        case 1:
            Log.notEqualTo("blackScore", "interrupted")
                .order("updateDate", true)
                .limit(1000)
                .fetchAll()
                .then(CreateLogTable)
                .catch(console.log);
             break;
    }
}

function SetTimerO() {
    clearInterval(timerO);
    timerO = setInterval(() => SetTabIndexO(selectedIndexO), INTERVAL_SEC_O * 1000);
}

$(function () {
    $('.tabSetO').each(function () {
        let topDiv = $(this);
        var anchors = topDiv.find('ul.tabsO a');
        anchors.click(function (event) {
            event.preventDefault();
            SetTabIndexO(anchors.index(this));
            SetTimerO();
        });
    });
    SetTabIndexO(selectedIndexO);
    SetTimerO();

});