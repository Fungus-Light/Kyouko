class DataItem{
    constructor(_dataid,_title,_description,_content,_api,_speaker,_speed,_tune,_volum){
        this.id=_dataid;
        this.title=_title;
        this.description=_description;
        this.content=_content;
        this.api=_api;
        this.speaker=_speaker;
        this.speed=_speed;
        this.tune=_tune;
        this.volum=_volum;
    }
}

class KProject{
    constructor(_edition,_path,_currentLine){
        this.edition=_edition;
        this.path=_path;
        this.currentLine=_currentLine;
    }
}

let DefaultItem=new DataItem(-1,"这里是标题","这里是简介","这里是正文",1,1,5,5,5);


let TextListData=new Array();


function InitDefaultLine(){
    let test1=new DataItem(0,"测试文本","这是一段测试文本，您可以编辑和实验这个文本","Kyouko是一款集成了多家语音合成api的配音辅助工具，可以帮助您为您的视频生成较为自然的配音。",1,2,5,5,5);
    TextListData.push(test1);
    RefreshList();
}

function CleanTextArray(){
    TextListData=new Array();
}

