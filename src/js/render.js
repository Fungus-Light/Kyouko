let listRenderer = document.getElementById("list-renderer");

//
function MakeUpTextItem(dataid, title, description, content) {
    let temp = document.createElement("x-accordion");
    if(title.length<=0){
        title="编号："+dataid.toString();
    }
    temp.setAttribute("dataid", dataid);
    temp.innerHTML =
        '<header>' +
        '<x-label style="width: 100px;"><strong>' + title + '</strong></x-label>' +
        '<x-label>' + description + '</x-label>' +
        '</header>' +
        '<main>' +
        '<p>' + content + '</p>' +
        '</main>' +
        '<x-contextmenu>' +
        '<x-menu>' +
        '<x-menuitem onclick="Edit_Item(this)" class="item-edit" dataid=' + dataid + '>' +
        '<x-label>编辑</x-label>' +
        '</x-menuitem>' +
        '<x-menuitem onclick="Delete_Item(this)" class="item-delete" dataid=' + dataid + '>' +
        '<x-label >删除</x-label>' +
        '</x-menuitem>' +
        '</x-menu>' +
        '</x-contextmenu>';

    return temp;
}

function Edit_Item(data){
    let id =parseInt(data.getAttribute('dataid'));
    console.log(id);
    let result;
    for(let i=0;i<TextListData.length;i++){
        if(TextListData[i].id==id){
            result=TextListData[i];
            DisableEditor();
            SetEditItem(result,id);
            EnableEditor();
            break;
        }
    }

}

function Delete_Item(data){
    let id =parseInt(data.getAttribute('dataid'));
    console.log(id);
    for(let i=0;i<TextListData.length;i++){
        if(id==TextListData[i].id){
            TextListData.splice(i,1);
            break;
        }
    }
    for(let i=0;i<TextListData.length;i++){
        TextListData[i].id=i;
    }

    if(TextListData.length>0){
        SetEditItem(TextListData[0],TextListData.id);
    }else{
        SetEditItem(DefaultItem,-1);
    }
    
    RefreshList();
}

function AddTextItem(dataid, title, description, content) {
    listRenderer.appendChild(MakeUpTextItem(dataid, title, description, content));
    //listRenderer.appendChild(document.createElement('hr'));
}

function ClearTextList() {
    listRenderer.innerHTML = "";
}

function InitPage() {
    ClearTextList();
}

function RefreshList(){
    ClearTextList();
    for(let i=0;i<TextListData.length;i++){
        let el=TextListData[i];
        AddTextItem(el.id,el.title,el.description,el.content);
    }
    
}