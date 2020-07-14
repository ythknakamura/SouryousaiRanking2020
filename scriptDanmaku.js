const INTERVAL_SEC_D = 30;
let ncmbD = new NCMB("89759166c6ac3927ba8d256dbb3a773ea0103cf4aa2c62b00e8af2e2eb23bffa", "7b1da6c9c0d003c6169f372c769017e52463ca355c9ee07758348d1259235577");
let danmaku = ncmbD.DataStore("Danmaku");
let selectedIndexD = 0;
let timerD;

function CreateRankingTable(diff) {
    danmaku.equalTo("difficulty", diff)
        .order("damage")
        .order("graze", true)
        .limit(1000)
        .fetchAll()
        .then(CreateTableDanmaku)
        .catch(console.log);
}

function CreateTableDanmaku(rawdata) {
    let authorList = [];
    $.each(rawdata, function (i, data) {
        let a = data["author"];
        if (!authorList.includes(a)) authorList.push(a);
    });
    let panel = $("#panelDanmaku");
    panel.empty();
    authorList.forEach(author => {

        panel.append($('<h3 />').text("Stage : " + author));

        let table = $('<table />');
        table.append($('<thead><tr><th>Rank</th><th>PlayerName</th><th>Damage</th><th>Hit</th><th>Graze</th></tr></thead >'));
        let tbody = $('<tbody />');
        let ranking = 0;
        $.each(rawdata, function (i, data) {
            if (data["author"] == author) {
                ranking += 1;
                let tr = $('<tr />');
                let rank = $('<td />').text(ranking);
                let name = $('<td />').text(data["player"]);
                let damage = $('<td />').text(data["damage"]);
                let hit = $('<td />').text(data["hit"]);
                let graze = $('<td />').text(data["graze"]);
                tr.append(rank, name, damage, hit, graze);
                tbody.append(tr);
            }
        });
        table.append(tbody);
        panel.append(table);
    });
}

function SetTabIndexD(index) {
    selectedIndexD = index;
    let anchors = $('ul.tabsD a');
    anchors.filter('.on').removeClass('on');
    let currentA = anchors.eq(index).addClass('on');
    let diff = currentA.attr('id');
    CreateRankingTable(diff);
}

function SetTimerD() {
    clearInterval(timerD);
    timerD = setInterval(() => SetTabIndexD((selectedIndexD + 1) % 4), INTERVAL_SEC_D * 1000);
}

$(function () {
    $('.tabSetD').each(function () {
        let topDiv = $(this);
        var anchors = topDiv.find('ul.tabsD a');
        anchors.click(function (event) {
            event.preventDefault();
            SetTabIndexD(anchors.index(this));
            SetTimerD();
        });
    });
    SetTabIndexD(selectedIndexD);
    SetTimerD();
});