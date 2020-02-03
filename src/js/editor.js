let e_title = document.getElementById("e-title");
let e_description = document.getElementById("e-description");
let e_content = document.getElementById("e-content");
let e_speaker = GetElementById("e-speaker");
let e_speed = GetElementById("e-speed");
let e_tune = GetElementById("e-tune");
let e_volum = GetElementById("e-volum");

let current = null;
let current_id = null;
let isInEdit = false;

function EnableEditor() {
    if (!isInEdit) {
        e_title.contentEditable = true;
        EnableEdit(e_description);
        EnableEdit(e_content);
        EnableEdit(e_speaker);
        EnableEdit(e_speed);
        EnableEdit(e_tune);
        EnableEdit(e_volum);
        isInEdit = true;
        document.getElementById("e-diaedit-btn").disabled = false;
        document.getElementById("e-edit-btn").disabled = true;
        isFileChanged = true;
        ChangeState();
    }
}

function DisableEditor() {
    if (isInEdit) {
        e_title.contentEditable = false;
        DisableEdit(e_description);
        DisableEdit(e_content);
        DisableEdit(e_speaker);
        DisableEdit(e_speed);
        DisableEdit(e_tune);
        DisableEdit(e_volum);
        SaveEditItem();
        isInEdit = false;
        document.getElementById("e-diaedit-btn").disabled = true;
        document.getElementById("e-edit-btn").disabled = false;
        isFileChanged = true;
        ChangeState();
    }
}

function SetEditItem(item, id) {
    if (id != -1) {
        current = item;
        current_id = id;
    } else {
        current = null;
        current_id = -1;
    }

    let _title;
    if (item.title.length <= 0) {
        _title = "编号：" + id.toString();
    } else {
        _title = item.title;
    }
    e_title.innerText = _title;
    e_description.value = item.description;
    e_content.value = item.content;
    e_speaker.value = item.speaker;
    console.log(typeof item.speaker)
    $('#e-speaker x-menuitem').removeAttr("toggled");
    $('#e-speaker x-menuitem[value=\'' + item.speaker + '\']').attr("toggled", "true");

    e_speed.value = item.speed;
    e_tune.value = item.tune;
    e_volum.value = item.volum;
    isFileChanged = true;
    ChangeState();
}

function SaveEditItem() {
    if (current != null) {
        current.title = e_title.innerText;
        current.description = e_description.value;
        current.content = e_content.value;
        current.speaker = e_speaker.value;
        current.speed = e_speed.value;
        current.tune = e_tune.value;
        current.volum = e_volum.value;
        for (let i = 0; i < TextListData.length; i++) {
            if (TextListData[i].id == current_id) {
                TextListData[i] = current;
                break;
            }
        }
        isFileChanged=true;
        ChangeState();
        RefreshList();
    }

}
