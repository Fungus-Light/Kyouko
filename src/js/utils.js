let isOnline = true;

function GetElementById(id) {
    return document.getElementById(id);
}

function EnableEdit(el) {
    el.disabled = false;
}

function DisableEdit(el) {
    el.disabled = true;
}

window.addEventListener('online', function () {
    isOnline = true;
    $("#online-icon").show();
    $("#offline-icon").hide();
    document.getElementById("sys-notification").innerHTML = "当前已经联网";
    document.getElementById("sys-notification").opened = true;
});

window.addEventListener('offline', function () {
    isOnline = false;
    $("#online-icon").hide();
    $("#offline-icon").show();
    document.getElementById("sys-notification").innerHTML = "当前离线";
    document.getElementById("sys-notification").opened = true;
});
