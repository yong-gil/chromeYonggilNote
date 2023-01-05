chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      console.log(sender.tab ?
                  "from a content script:" + sender.tab.url :
                  "from the extension");
      if (request.command === "init_capture"){
        locate_tab(function(){
          init_capture();
        });
  
  function init_capture(e){
  
      video = document.querySelector('video');
        canvas = document.querySelector('canvas');
        ctx = canvas.getContext('2d');
  
        var MediaStreamConstraint = {
              //audio: true,
              video: true,
              videoConstraints: {
                  mandatory: {
                      chromeMediaSource: 'tab',
                      minWidth: 640,
                      maxWidth: 800,
                      minHeight: 420,
                      maxHeight: 600
                  }
              }
        };
  
        chrome.tabCapture.capture(MediaStreamConstraint, function(stream){ 
        console.log(stream); //always null.. activeTab error
  });
  
};
chrome.runtime.onMessage.addListener(
    unction(request, sender, sendResponse) {
        
    }
)