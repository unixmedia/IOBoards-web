/**
 * Determines when a request is considered "timed out"
 */
var timeOutMS = 6000; //ms
/**
 * Stores a queue of AJAX events to process
 */
var aList = new Array();

$d=document;
$w=window;
function $(v){return $d.getElementById(v)}
function $e(v){return encodeURIComponent(v).replace("%5B", "[").replace("%5D","]").replace("%7C","|")}

/**
 * Initiates a new AJAX command
 *
 * @param   the url to access
 * @param   the document ID to fill, or a function to call with response XML (optional)
 * @param	true to repeat this call indefinitely (optional)
 * @param   a URL encoded string to be submitted as POST data (optional)
 */
function ACmd(url, cnt, repeat, data)
{
	// Set up our object
	var newA = new Object();
	var ttime = new Date();
	newA.url = url;
	newA.cnt = cnt;
	newA.repeat = repeat;
	newA.aReq = null;
	
	// Create and send the request
	if($w.XMLHttpRequest) {
        newA.aReq = new XMLHttpRequest();
        newA.aReq.open((data==null)?"GET":"POST", newA.url, true);
        newA.aReq.send(data);
    // If we're using IE6 style (maybe 5.5 compatible too)
    } else if($w.ActiveXObject) {
        newA.aReq = new ActiveXObject("Microsoft.XMLHTTP");
        if(newA.aReq) {
            newA.aReq.open((data==null)?"GET":"POST", newA.url, true);
            newA.aReq.send(data);
        }
    }
    
    newA.lastCalled = ttime.getTime();
    
    // Store in our array
    aList.push(newA);
}

/**
 * Loops over all pending AJAX events to determine
 * if any action is required
 */
function pollAJAX() {
	
	var curA = new Object();
	var ttime = new Date();
	var elapsed;
	
	// Read off the aList objects one by one
	for(i = aList.length; i > 0; i--)
	{
		curA = aList.shift();
		if(!curA)
			continue;
		elapsed = ttime.getTime() - curA.lastCalled;
				
		// If we suceeded
		if(curA.aReq.readyState == 4 && curA.aReq.status == 200) {
			// If it has a cnt, write the result
			if(typeof(curA.cnt) == 'function'){
				curA.cnt(curA.aReq.responseXML.documentElement);
			} else if(typeof(curA.cnt) == 'string') {
				$(curA.cnt).innerHTML = curA.aReq.responseText;
			} // (otherwise do nothing for null values)
			
	    	curA.aReq.abort();
	    	curA.aReq = null;

			// If it's a repeatable request, then do so
			if(curA.repeat)
				ACmd(curA.url, curA.cnt, curA.repeat);
			continue;
		}
		
		// If we've waited over 1 second, then we timed out
		if(elapsed > timeOutMS) {
			// Invoke the user function with null input
			if(typeof(curA.cnt) == 'function'){
				curA.cnt(null);
			} 

	    	curA.aReq.abort();
	    	curA.aReq = null;
			
			// If it's a repeatable request, then do so
			if(curA.repeat)
				ACmd(curA.url, curA.cnt, curA.repeat);
			continue;
		}
		
		// Otherwise, just keep waiting
		aList.push(curA);
	}
	
	// Call ourselves again in 250ms
	setTimeout("pollAJAX()",250);
	
}// End pollA
			
/**
 * Parses the xmlResponse returned by an XMLHTTPRequest object
 *
 * @param	the xDt returned
 * @param	the fld to search for
 */
function getX(xDt, fld) {
	try {
		if(xDt.getElementsByTagName(fld)[0].firstChild.nodeValue)
			return xDt.getElementsByTagName(fld)[0].firstChild.nodeValue;
		else
			return null;
	} catch(err) { return null; }
}

var tabC = {
   tabAr:   new Array(),
   classOn:       "tabon",
   classOff:      "taboff",

   addTabs: function (tabCont, tid) {
      this.tabAr[tid] = new Array();
      tabs = $(tabCont).getElementsByTagName("div");
      for (x in tabs) {
         if (typeof(tabs[x].id) != "undefined") {
            this.tabAr[tid].push(tabs[x].id);
         } 
      }
   },

   chTab: function (element, tid) {
      for (x in this.tabAr[tid]) {
         tabItem = this.tabAr[tid][x];
         dataElement = $(tabItem + "_data");
         if (dataElement) {
            if (dataElement.style.display != "none") {
               dataElement.style.display = "none";
            } 
         }
         tabEl = $(tabItem);
         if (tabEl) {
            if (tabEl.className != this.classOff) {
               tabEl.className = this.classOff;
            } 
         } 
      }
      $(element.id + "_data").style.display = "block";
      element.className = this.classOn;
   }
};

function toggleMe(a, b){
  var e=$(a);
  if(!e)return true;
  if(e.style.display=="none"){
    e.style.display="block"
    b.innerHTML="Collapse &and;";
  } else {
    e.style.display="none"
    b.innerHTML="Expand &or;";
  }
  return true;
}

function dh(d,l) 
{
   var d=d.split(',');
   var r='';
   var t;
   for(var i=0;i<l;i++)
   {
      if(i<d.length)
         t=d[i].replace(/\D/g,'');
      else
         t='0';
      t=parseInt(t);
      if(typeof(t)=='undefined')
         t=0;
      r+=zfill(t.toString(16),2);
     
   }
   return r;
}

function hd(h,l) 
{
   var r='';
   for(var i=0;i<l*2;i+=2)
   {
      r+=(parseInt(h[i]+h[i+1],16)+',').replace(NaN,'0');
   }    
   return r.slice(0,-1);
}


function zfill(str, width){
   var result = String(str);
   var num_z = width - result.length;
   for(var i=num_z; i > 0; i--){
      result = '0' + result;
   }
   return result;
}

var TimeToFade = 2500.0;

function animFad(lastTick, eid)
{  
  var curTick = new Date().getTime();
  var elapsedTicks = curTick - lastTick;
  
  var element = $(eid);
 
  if(element.FadeTimeLeft <= elapsedTicks)
  {
    element.style.opacity = element.FadeState == 1 ? '1' : '0';
    element.style.filter = 'alpha(opacity = ' 
        + (element.FadeState == 1 ? '100' : '0') + ')';
    element.FadeState = element.FadeState == 1 ? 2 : -2;
    if(typeof(fadeCBack) == 'function'){
       fadeCBack(element);
    }
    return;
  }
 
  element.FadeTimeLeft -= elapsedTicks;
  var newOpVal = element.FadeTimeLeft/TimeToFade;
  if(element.FadeState == 1)
    newOpVal = 1 - newOpVal;
   
  element.style.opacity = newOpVal;
  element.style.filter = 'alpha(opacity = ' + (newOpVal*100) + ')';
  
  setTimeout("animFad(" + curTick + ",'" + eid + "')", 33);
}

function opaque(eid)
{
   var element = $(eid);
   element.FadeState=2;
   element.style.opacity='1';
   element.style.filter = 'alpha(opacity=100)';
}

function fade(eid)
{
  var element = $(eid);
  if(element == null)
    return;
   
  if(element.FadeState == null)
  {
    if(element.style.opacity == null 
        || element.style.opacity == '' 
        || element.style.opacity == '1')
    {
      element.FadeState = 2;
    }
    else
    {
      element.FadeState = -2;
    }
  }
    
  if(element.FadeState == 1 || element.FadeState == -1)
  {
    element.FadeState = element.FadeState == 1 ? -1 : 1;
    element.FadeTimeLeft = TimeToFade - element.FadeTimeLeft;
  }
  else
  {
    element.FadeState = element.FadeState == 2 ? -1 : 1;
    element.FadeTimeLeft = TimeToFade;
    setTimeout("animFad(" + new Date().getTime() + ",'" + eid + "')", 33);
  }  
}

function sForm(fn,act,cback)
{
   var f=$d.forms[fn];
   var el=f.elements;
   var s="";
   for(i=0;i<el.length;i++)
   {
     if('value' in el[i]) {
       if((el[i].type=='checkbox' && el[i].checked) || el[i].type!='checkbox') {
         if(s!=""){s+="&";};
         s+=$e(el[i].name)+"="+$e(el[i].value.replace(" ","")); 
       }
     }
   }
   ACmd(act,cback,false,s);

}

function showDiv(eid, st)
{
    if(st!="none")
    {
      $("stan").style.display="none";
      opaque(eid);
      $(eid).style.display=st;
      fade(eid);
      return true;
    }
    return false;
}

function fadeCBack(el)
{
 el.style.display="none";
 $("stan").style.display="block";
}


function upDMVars(xDt)
{
   conlo=false;
   $w.DmBoard=getX(xDt, 'board');
   $('fwn').innerHTML=getX(xDt, 'fwname');
   $('fwv').innerHTML=getX(xDt, 'fwver')+' - '+getX(xDt, 'stv');
   $('dm').innerHTML=getX(xDt, 'defmac');
   $('bd').innerHTML=getX(xDt, 'bd');
   $('dt').innerHTML=getX(xDt, 'dt');
   $('bo').innerHTML=$w.DmBoard;
   $w.epoch=getX(xDt, 'epoch');
   if(typeof(aFirstCB) == 'function'){
      aFirstCB(xDt);
   }
}

function upDMAj(xDt)
{
   if(xDt)
   {
      if(conlo){upDMVars(xDt);}
      $w.epoch=getX(xDt, 'epoch');
      $('dt').innerHTML=getX(xDt, 'dt');
      $('stan').innerHTML=getX(xDt, 'stan');
      var stok=getX(xDt, 'stok');
      var stf=getX(xDt, 'stfail');
      if(!showDiv('stfail', stf)) {showDiv('stok', stok);}
   } else {
      showDiv('connf', 'block');
      conlo=true;
   }
   if(typeof(aLoopCB)=='function'){
      aLoopCB(xDt);
   }
}

function init() {
   ACmd('ajax.xml', upDMVars);
   setTimeout("ACmd('ajax.xml', upDMAj, true)",300);

   var menuchilds=$('menu').getElementsByTagName('a');
   for(i=0;i<menuchilds.length;i++)
   {
      if(location.href==menuchilds[i].href)
      {
         menuchilds[i].style.backgroundColor='#003399';
      }
   }
}
//kick off the AJAX Updater
setTimeout("pollAJAX()",750);
$w.onload = init;
