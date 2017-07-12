var SDM_mtrcs = "WP_";

function isGPT() {
 return ((typeof inDapIF !== 'undefined' && inDapIF === true) || (typeof window.top.SDM_head !== 'undefined' && typeof window.top.SDM_head.isRegisterAdUsed === 'function' && window.top.SDM_head.isRegisterAdUsed()));
}

//ToDo Variablen
var SDM_New_Template = true, SDM_DCheckwritten = false, PartnerAPI = false, frn046tie	= 'used', clicktrack = '%%CLICK_URL_ESC%%', bgclicktrack = '%%CLICK_URL_ESC%%'; ;
var bgColor		= '[%Hintergrundfarbe%]'; 
//var zpixel = '[%ZaehlpixelImage%]'; //ToDo: Direkt aus dem Template, oder?
var LB_creative_breite = '[%BreiteLeaderboard%]';
var LB_creative_hoehe = '[%HoeheLeaderboard%]';
var hintergrundClickZielURL = '[%HintergrundklickURL%]';
var BGClick = false;
if (hintergrundClickZielURL != '') var BGClick = true;

//var Sky_creative_breite = [%BreiteSkyscraper%];
//var Sky_creative_hoehe = [%HoeheSkyscraper%];
var Skyposition = '[%PositionSkyscraper%]'; //Mögliche Werte: unten/rechts
var StickySky = '[%StickySky%];' //true/false

//Notwendige Funktionen, die ausgelagert werden müssen?

var SDM_startTop = 0;
var SDM_laterCheck = false;

function delayMove(){
  //Funktionen
  function findPos() {
    var SDM_sticky_obj = window.top.document.getElementById('WPSky');
    curleft = 0;
    curtop = 0;
    if (SDM_sticky_obj.offsetParent) {
      do {
        curleft += SDM_sticky_obj.offsetLeft;
        curtop += SDM_sticky_obj.offsetTop;	
      } while (SDM_sticky_obj = SDM_sticky_obj.offsetParent);
      //return [curleft,curtop];
    }
    if (!SDM_laterCheck) SDM_startTop = curtop;
    SDM_laterCheck = true;
    if (curtop > SDM_startTop) curtop = 0;
  }

  function checkVertPos(){
    var w = window.top, d = window.top.document, pY = w.pageYOffset, dE = d.documentElement.scrollTop, dBs = d.body.scrollTop;
    VertPos = pY || dE || dBs;
  }

  function moveToTheTop(){
    var SDM_sticky_obj = window.top.document.getElementById('WPSky');
    checkVertPos();
    if ((VertPos > SDM_startTop) && SDM_laterCheck){
      SDM_sticky_obj.style.top = (VertPos-SDM_startTop)+"px";
    }else SDM_sticky_obj.style.top = "0px";
  }


	findPos();
	moveToTheTop();
	//window.setTimeout("moveToTheTop()",50);
}

//IFrames definieren

if (zpixel != '') {
	  AdcodeZPixel = '<div id="SDM_ZPixel" style="position:absolute; left0px; top:0px;"><img src="'+zpixel+'" border="0" width="1" heigth="1"></div>';
}else {
	AdcodeZPixel 	= '';
}

var IFrameCodeLBoard		='<iframe src="[%LeaderboardIFrame%]" marginwidth="0" marginheight="0" hspace="0" vspace="0" frameborder="0" scrolling="no" width="[%BreiteLeaderboard%]" height="[%HoeheLeaderboard%]"></iframe>';

var IFrameCodeSky		='<iframe src="[%SkyscraperIFrame%]" marginwidth="0" marginheight="0" hspace="0" vspace="0" frameborder="0" scrolling="no" width="[%BreiteSkyscraper%]" height="[%HoeheSkyscraper%]"></iframe>';


//Elemente schreiben

function SDMcreateAdDiv(SDM_divName, SDM_Content, SDM_divStyle){
  var SDM_El = document.createElement('div');
  SDM_El.id = SDM_divName;
  if (window.top !== window.self && window.name.search(/google_ads_iframe/) != -1){
    var SDM_attachTo = document.getElementsByTagName('body')[0];
  } else {
    
    // Altes WP-Prinzip
    var SDM_attachTo = document.getElementById('SDM_WP_Handler').parentNode;


    if (!SDM_DCheckwritten){
      console.log('run once!');
      Aufspreizer = LB_creative_hoehe;
      if (bgColor != '' && !isGPT()) document.getElementsByTagName('body')[0].style.backgroundColor = bgColor;
      var schalterCEBGclick = 1;
      if((schalterCEBGclick == 1) && (bgColor == '')){
        schalterCEBGclick = 0; // auf 0 setzen um BGClick-Funktion zu deaktivieren
      }
      var bgclicktrack = '%%CLICK_URL_ESC%%';
      var clickURLHintergrund = bgclicktrack + hintergrundClickZielURL;
      if (typeof window.fxmbgclick != 'undefined' && schalterCEBGclick == 1 && hintergrundClickZielURL != ''){
        fxmbgclick(clickURLHintergrund);
      }
      if (typeof window.sdibgclick != 'undefined' && schalterCEBGclick == 1 && hintergrundClickZielURL != ''){
        try{ sdibgclick(clickURLHintergrund);}catch(err){}
      }
      //document.write('<style>#SDM_WP_Container{width: 728px;}</style>');
      //Umbau für CB
      if (typeof window.SDM_Partner !== 'undefined') {
          SDM_Partner.showWallpaper(Aufspreizer);
          PartnerAPI = true;
      }
      SDM_DCheckwritten = true;
      if (!PartnerAPI){
        console.log('this too');
        if (document.getElementById('SDM_WP_Handler').parentNode.id.search(/_ad_container/) === -1){
          document.write('<SCR'+'IPT type="text/javascript" language="JavaScript" src="//cdn.stroeerdigitalmedia.de/Ads/script/mps_domain_check.js"></SCR'+'IPT>');
        } else {
          var SDM_newScript = document.createElement('script');
          SDM_newScript.className = 'SDM_Delivery';
          SDM_newScript.src = '//cdn.stroeerdigitalmedia.de/Ads/script/async_mps_domain_check.js';
          document.getElementById('SDM_WP_Handler').parentNode.appendChild(SDM_newScript);
        }
      }
    }
  // Ende Altes WP-Prinzip    
  }

  
  if (!SDM_DCheckwritten){
   if (typeof window.top.SDM_Partner !== 'undefined') {
      window.top.SDM_Partner.showWallpaper(LB_creative_hoehe);
      PartnerAPI = true;
      if (bgColor != '') window.top.document.getElementsByTagName('body')[0].style.backgroundColor = bgColor;
      if (hintergrundClickZielURL != ''){
        var bgclicktrack = '%%CLICK_URL_ESC%%';
        var clickURLHintergrund = bgclicktrack + hintergrundClickZielURL;
        if (typeof window.top.sdibgclick != 'undefined' && hintergrundClickZielURL != ''){
          try{ window.top.sdibgclick(clickURLHintergrund);}catch(err){}
        }
      }
    }
    if (!PartnerAPI){
      var SDM_newScript = document.createElement('script');
      SDM_newScript.className = 'SDM_Delivery';
      SDM_newScript.src = '//cdn.stroeerdigitalmedia.de/Ads/script/async_mps_domain_check.js';
      document.body.appendChild(SDM_newScript);
    }
    SDM_DCheckwritten = true;
  }
  SDM_attachTo.appendChild(SDM_El);
  document.getElementById(SDM_divName).innerHTML = SDM_Content;
  document.getElementById(SDM_divName).className = 'SDM_Delivery';
  document.getElementById(SDM_divName).setAttribute('style', SDM_divStyle);
}  

var SDM_LB_Style = 'position: absolute; height:'+LB_creative_hoehe+'px; width:'+LB_creative_breite+'px; right: 0;';
var SDM_Sky_Style = 'position: absolute; height:'+Sky_creative_hoehe+'px; width:'+Sky_creative_breite+'px;left: 100%;'
if (Skyposition === 'unten'){
  SDM_LB_Style += ' right: -'+Sky_creative_breite+'px;';
  SDM_Sky_Style += ' top: '+LB_creative_hoehe+'px;';
}

SDMcreateAdDiv('WPBanner', IFrameCodeLBoard, SDM_LB_Style);
SDMcreateAdDiv('WPSky', IFrameCodeSky, SDM_Sky_Style);

//ToDo Umhängen und aktivieren

if (window.top !== window.self && window.name.search(/google_ads_iframe/) != -1){
  var SDM_Cont_Name = window.name;
  var SDM_Cont_El = document.createElement('div');
  SDM_Cont_El.id = 'SDM_WP_Container';
  SDM_Cont_El.className = 'SDM_Delivery';
  window.top.document.getElementById(SDM_Cont_Name).style.display = 'none';
  SDM_Cont_Name +='__container__';
  var SDM_Top_Cont = window.top.document.getElementById(SDM_Cont_Name);
  SDM_Top_Cont.appendChild(SDM_Cont_El);
  window.top.document.getElementById('SDM_WP_Container').appendChild(WPBanner);
  window.top.document.getElementById('SDM_WP_Container').appendChild(WPSky);
  window.top.document.getElementById('SDM_WP_Container').style.position = 'relative';
  window.top.document.getElementById('SDM_WP_Container').style.height = LB_creative_hoehe+'px';
  //window.top.document.getElementById('SDM_WP_Container').style.width = '728px';
} else if (document.getElementById('SDM_WP_Handler').parentNode.id.search(/_ad_container/) != -1){
  var SDM_Cont_Name = window.name;
  var SDM_Cont_El = document.createElement('div');
  SDM_Cont_El.id = 'SDM_WP_Container';
  SDM_Cont_El.className = 'SDM_Delivery';
  var SDM_Top_Cont = document.getElementById('SDM_WP_Handler').parentNode;
  SDM_Top_Cont.appendChild(SDM_Cont_El);
  document.getElementById('SDM_WP_Container').appendChild(WPBanner);
  document.getElementById('SDM_WP_Container').appendChild(WPSky);
  document.getElementById('SDM_WP_Container').style.position = 'relative';
  document.getElementById('SDM_WP_Container').style.height = LB_creative_hoehe+'px';
}

if (StickySky) {
  console.log('trigger sticky');
  window.top.fXm_Head.aframe.AddEvent(window.top, 'scroll', delayMove);
}