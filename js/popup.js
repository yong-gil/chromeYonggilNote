var currentUrl;
var formCheck = false;
/*
TODO LIST 
1. 폼진입시 이전에 보거나 작성하던 폼있으면 (동영상 보기버튼) 생략필요 - 콜백으로 처리해야할듯함
2. 현재 유튜브 화면 뿌려주기 - 현재(embed url패턴 그대로 src 주입) -> youtube api이용하여 화면아이디만 이용해야함
3. 부분캡쳐 검은색 화면만 보임 < 수정하거나 유튜브화면 전체캡쳐로 교체
4. 
*/ 

/* Desc  : DOM 로드시 발생 이벤트 (로컬스토리지의 데이터를 불러온다.) 
 * Date  : 2021-01-09
 * Param : X
 * Auth  : PYG
 */
document.addEventListener('DOMContentLoaded', function(){   
    chrome.tabs.executeScript("")
    if(localStorage.length != 0){    
        var check = localStorage.getItem("check");

        document.getElementById("note_body").innerHTML = localStorage.getItem("memo");
        var pattern = /[\u0000-\u007f]|([\u0080-\u07ff]|(.))/g;
        $('#dataSize').val((document.getElementById("note_body").innerText.replace(pattern, "$&$1$2").length/5000).toFixed(2));

        if(check){
            $('#main_body').css('display', "block");
            $('#playBtn').css('display', "none");
            setVedioSrc();
        }
    }
});

$('#ok').click(function(){
    getCurrentTabUrl(function(url) {
         renderURL(url);
     });
})

function getCurrentTabUrl(callback) {
    var queryInfo = {
        active: true,
        currentWindow: true
    };  
    chrome.tabs.query(queryInfo, function(tabs) {
        var tab = tabs[0];
        var url = tab.url;
        callback(url);
    });
}


function renderURL(statusText) {
    debugger;
    substring = "https://www.youtube.com/watch";
    var check = localStorage.getItem("check");
    if(check){
        currentUrl = statusText.replace("https://www.youtube.com/watch?v=", "");
        debugger;
        if(currentUrl != localStorage.getItem("pageId")){
            if(confirm("시청중이던 강의가 있습니다. 새로운 강의를 보시겠습니까?")){
                localStorage.setItem("pageId", currentUrl);
                setTimeout(function() {
                    chrome.runtime.openOptionsPage();
                }, 1000);      
            }
        }else if(confirm("시청중이던 강의가 있습니다. 이어서 보시겠습니까?")){
            //localStorage.setItem("pageId", currentUrl);
            setTimeout(function() {
                chrome.runtime.openOptionsPage();
            }, 1000);      
        }else{
            localStorage.removeItem("check");
        }
    }else{
        if(confirm("동영상을 오픈하시겠습니까?")){ 
            currentUrl = statusText.replace("https://www.youtube.com/watch?v=", "");
            localStorage.setItem("pageId", currentUrl);
            if(statusText.includes(substring)){
                chrome.runtime.sendMessage({
                    //work!
                    url : currentUrl
                },function(response) {
                        //콜백
                        //console.log(response.res);
                });
                if(formCheck == true){
                    chrome.runtime.openOptionsPage();
                    
                }else{
                    chrome.runtime.openOptionsPage();
                }
            }else{
                alert("아직은 youtube 동영상만 오픈 가능합니다.")
            }       
        }else{
            return false;
        }
    }
}

/* Desc  : keydown이벤트(각종단축키 및 입력시 로컬스토리지에 저장)
 *         크롬 단축키와 겹치지 않는 키로 변경가능.
 *         Crtl + q (저장)
 *         Crtl + d (삭제)
 *         Crtl + ` (캡처)
 * Date  : 2021-01-09
 * Param : X
 * Auth  : PYG
 */
window.addEventListener("keydown", function clickSave(e){

    let textValue = document.getElementById("note_body").innerText;   

    let height = document.getElementById("note_body").offsetHeight;
    // 화면 리사이즈 시 id값의 div의 높이를 구함
if(height==1000)alert(height)
    if(height >= 1122){
        document.getElementById('id_value').setAttribute('contenteditable','false');
    }

    if(document.getElementById("note_body").innerText != "" && e.ctrlKey == true && e.code == "KeyQ"){
        var el = document.getElementById("note_body");
        el.style.height = el.scrollHeight + 'px';
        pdfPrint();
    }else if(e.ctrlKey == true && e.code == "Backquote"){
        captureImg();
    }else{
        if(textValue.trim() != ""){     
            localStorage.setItem("memo", document.getElementById("note_body").innerHTML);
        }

        var pattern = /[\u0000-\u007f]|([\u0080-\u07ff]|(.))/g;
        $('#dataSize').val((document.getElementById("note_body").innerText.replace(pattern, "$&$1$2").length/5000).toFixed(2));

        if($('#dataSize').val() >= 5000){
            alert("5MB 이상 초과 하실 수 없습니다. 저장 후 시도해주세요.");
        }
    }
});

/* Desc  : 저장버튼 클릭시 PDF파일로 저장
 * Date  : 2021-01-09
 * Param : X
 * Auth  : PYG
 */
function pdfPrint(){
    debugger;
    if(document.getElementById("note_body").innerText == ''){
        alert("저장할 내용이 없습니다.")
    }
// 현재 document.body의 html을 A4 크기에 맞춰 PDF로 변환
    html2canvas($('#note_body')[0]).then(function (canvas) {

        // 캔버스를 이미지로 변환
        var imgData = canvas.toDataURL('image/png');

        var imgWidth = 225; // 이미지 가로 길이(mm) A4 기준
        var pageHeight = imgWidth * 0.914;  // 출력 페이지 세로 길이 계산 A4 기준
        var imgHeight = canvas.height * imgWidth / canvas.width;
        var heightLeft = imgHeight;

        var doc = new jsPDF('p', 'mm');
        var position = 0;

        // 첫 페이지 출력
        doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        // 한 페이지 이상일 경우 루프 돌면서 출력
        while (heightLeft >= 20) {
            position = heightLeft - imgHeight;
            doc.addPage();
            doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }

        // 파일 저장
        doc.save('sample.pdf');       
        document.getElementById("note_body").innerHTML = '';
        localStorage.setItem("memo", document.getElementById("note_body").innerHTML);
        //이미지로 표현
        //document.write('<img src="'+imgData+'" />');
    }); 
 
}
/* Desc  : 캡처버튼 클릭시 캡처실행 
 * Date  : 2021-01-09
 * Param : X
 * Auth  : PYG
 */
function captureImg(){
    document.getElementById("note_body").innerHTML = document.getElementById("note_body").innerHTML + `<br><img id="hz" src="../image/youtube.PNG"  width="280" height="147"><br><br>`;
    if(document.getElementById('hz'))
    localStorage.setItem("memo", document.getElementById("note_body").innerHTML);
} 

$('#playBtn').click(function(){
    formCheck = true;

    localStorage.setItem("check", formCheck);

    chrome.runtime.onMessage.addListener(
        function(request, sender, sendResponse) {
            //work!
            currentUrl = request.url;     
            sendResponse({res: "sucess!"})
        
    });

    $('#main_body').css('display', "block");
    $('#playBtn').css('display', "none");
    setVedioSrc();
})

var player;
var curVideoId = "";
function setVedioSrc(){
    debugger;
    console.log(currentUrl);
    curVideoId = localStorage.getItem("pageId");
    player = new YT.Player('player', {
        videoId : curVideoId,
        width   : "500",
        height  : "540",
        playerVars:{
            'modestbranding'    :   0,
            'autoplay'          :   1,
            'controls'          :   1,
            'showinfo'          :   0,
            'ral'               :   0,
            'loop'              :   0,
            'playlist'          :   curVideoId
        },
        event : {
            'onReady'           :   onPlayerReady,
            'onStateChange'     :   onPlayerStateChange
        }
    })
    localStorage.removeItem("pageId");
}

function onPlayerReady(){}
function onPlayerStateChange(){};

/* Desc  : 저장버튼 클릭이벤트.
 * Date  : 2021-01-09
 * Param : X
 * Auth  : PYG
 */
$('#save_btn').click(function(){
    debugger;
    var el = document.getElementById("note_body");
    el.style.height = el.scrollHeight + 'px';
    pdfPrint();
})

/* Desc  : 닫기버튼 클릭이벤트. 
 * Date  : 2021-01-09
 * Param : X
 * Auth  : PYG
 */
$('#exit_btn').click(function(){
    localStorage.removeItem("check");
    window.close();
})

/* Desc  : 삭제버튼 클릭이벤트. 
 * Date  : 2021-01-09
 * Param : X
 * Auth  : PYG
 */
$('#delete_btn').click(function(){
    localStorage.clear();
    document.getElementById("note_body").innerText = '';
})

/* Desc  : 캡처버튼 클릭이벤트. 
 * Date  : 2021-01-09
 * Param : X
 * Auth  : PYG
 */
$('#capture_btn').click(function(){
    debugger;
    var e = $.Event("keyup");
    e.which = 44;
    e.keyCode = 44;
    $(document).trigger(e);
/*   
    var height = window.innerHeight;
    var width = $(document).width();
    var $mask = $('<div id="screenshot_mask"></div>').css("border-width", "0 0 " + height + "px 0");
    var $focus = $('<div id="screenshot_focus"></div>');
    $("body").append($mask); //dimmed 추가
    $("body").append($focus); //마우스 커서에 따라 캡쳐 영역을 만들 div
    var selectArea = false;
    $("body").one("mousedown", function(e) { //캡쳐 영역 선택 시작
    e.preventDefault();
    selectArea = true;
    startX = e.clientX;
    startY = e.clientY;
    }).one('mouseup', function(e) { //캡쳐 시작
    selectArea = false;
    $("body").off('mousemove', mousemove); //이벤트 삭제
    $("#screenshot_focus").remove(); //마우스 포커스 삭제
    $("#screenshot_mask").remove(); //딤 삭제
    var x = e.clientX;
    var y = e.clientY;
    var top = Math.min(y, startY);
    var left = Math.min(x, startX);
    var width = Math.max(x, startX) - left;
    var height = Math.max(y, startY) - top;
    html2canvas(document.body).then(function(canvas) { //전체 화면 캡쳐
        debugger;
        var img = canvas.getContext('2d').getImageData(left, top, width, height); //선택 영역만큼 crop
        var c = document.createElement("canvas");
        c.width = width;
        c.height = height;
        c.getContext('2d').putImageData(img, 0, 0);
        document.getElementById("note_body").innerHTML = document.getElementById("note_body").innerHTML 
        + `<br><img id="hz" class='imageClick' src="${c.toDataURL().toString()}" style="width:492px; height:247px; float:left; cursor: pointer;"><br><br>`;
        localStorage.setItem("memo", document.getElementById("note_body").innerHTML);
        localStorage.setItem("capture", c.toDataURL().toString());
    });
    }).on("mousemove", mousemove); //캡쳐 영역 크기 변경
    
    function mousemove(e) {
    var x = e.clientX;
    var y = e.clientY;
    $focus.css("left", x); //마우스 커서 따라 좌표 포커스 이동
    $focus.css("top", y);
    if(selectArea) { //캡쳐 영역 선택 그림
    var top = Math.min(y, startY);
    var right = width - Math.max(x, startX);
    var bottom = height - Math.max(y, startY);
    var left = Math.min(x, startX);
    $mask.css("border-width", [top + 'px', right + 'px', bottom + 'px', left + 'px'].join(' '));
    }
    }
*/    

})




$('#note_body img').on('click',function(){
    if($(".painting").css("display") == "none"){
        var captureSrc = localStorage.getItem("capture");
        $('.painting').css('display', 'flex');
        var canvas = document.getElementById("jsCanvas");
        var ctx = canvas.getContext("2d");
        //var div = document.getElementById('painting');
        debugger;
        var width = 600;
        var height = 500;
        canvas.height = height;
        canvas.width = width;

        var imgSrc = captureSrc;    		
        var img = new Image();
        img.onload = function(){
            ctx.drawImage(img, 20, 20, width, height); //이미지, x좌표, y좌표, 가로크기, 세로크기 
        }
        img.src = imgSrc;     
	}else{
		$(".painting").hide();
	}
})


