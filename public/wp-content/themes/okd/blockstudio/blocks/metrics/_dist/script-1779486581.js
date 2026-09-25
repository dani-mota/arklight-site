import{getGsap,getOdometerStepPx,isBlockEditorPreview,onEnterView,onInView,prefersReducedMotion,ready,runWithEditorPreviewSupport,}from "/wp-content/themes/okd/blockstudio/assets/js/utils.js";const METRICS_ODOMETER_FLAG="data-metrics-odometer-built";const METRICS_ODOMETER_ORIGINAL="data-metrics-odometer-original";const METRICS_ODOMETER_DIGIT_CYCLES=3;const METRICS_ODOMETER_DEFAULT_DURATION=1.2;const METRICS_MOUSE_FLEX_MQ="(min-width: 1025px)";const METRICS_MOUSE_POINTER_MQ="(hover: hover) and (pointer: fine)";const METRICS_MOUSE_FLEX_READY="data-metrics-mouse-flex-ready";const METRICS_MOUSE_FLEX_SMOOTH=0.14;const METRICS_MOUSE_FLEX_SETTLE_EPS=0.0012;const METRICS_MOUSE_FLEX_WEIGHT_SCALE=2/3;function getOdometerDuration(el){const raw=parseFloat(el.getAttribute("data-odometer-duration")||"");if(Number.isFinite(raw)&&raw>0){return raw}
return METRICS_ODOMETER_DEFAULT_DURATION}
function getLineHeightRatio(el){return 1}
function getOriginalOdometerText(el){const explicitTarget=el.getAttribute("data-odometer-target");if(explicitTarget&&explicitTarget.trim()!==""){const normalizedTarget=explicitTarget.trim();el.setAttribute(METRICS_ODOMETER_ORIGINAL,normalizedTarget);return normalizedTarget}
const cached=el.getAttribute(METRICS_ODOMETER_ORIGINAL);if(cached){return cached}
const currentText=el.textContent?el.textContent.trim():"";el.setAttribute(METRICS_ODOMETER_ORIGINAL,currentText);return currentText}
function resetOdometerElement(el){const originalText=getOriginalOdometerText(el);el.textContent=originalText;el.removeAttribute(METRICS_ODOMETER_FLAG)}
function buildOdometerForElement(el){const originalText=getOriginalOdometerText(el);if(!/\d/.test(originalText)){return null}
const startTemplateRaw=(el.getAttribute("data-odometer-start")||"").trim();const startTemplate=startTemplateRaw||originalText.replace(/\d/g,"0");const step=getLineHeightRatio(el);const endDigits=originalText.match(/\d/g)||[];const startDigitsRaw=startTemplate.match(/\d/g)||[];const paddedStartDigits=startDigitsRaw.join("").padStart(endDigits.length,"0").slice(-endDigits.length);let startCursor=0;let endCursor=0;const rollers=[];el.innerHTML="";for(const char of originalText){if(!/\d/.test(char)){const staticSpan=document.createElement("span");staticSpan.setAttribute("data-metrics-odometer-part","static");staticSpan.style.height=`${step}em`;staticSpan.style.lineHeight=`${step}`;staticSpan.textContent=char;el.appendChild(staticSpan);continue}
const startDigit=parseInt(paddedStartDigits.charAt(startCursor)||"0",10);const endDigit=parseInt(endDigits[endCursor]||"0",10);startCursor+=1;endCursor+=1;const mask=document.createElement("span");mask.setAttribute("data-metrics-odometer-part","mask");mask.style.height=`${step}em`;mask.style.lineHeight=`${step}`;const roller=document.createElement("span");roller.setAttribute("data-metrics-odometer-part","roller");roller.style.lineHeight=`${step}`;const cells=[];for(let i=0;i<10*METRICS_ODOMETER_DIGIT_CYCLES;i+=1){cells.push(String(i%10))}
roller.textContent=cells.join("\n");mask.appendChild(roller);el.appendChild(mask);const baseCycleOffset=10;const normalizedDelta=(endDigit-startDigit+10)%10;const targetPos=startDigit+baseCycleOffset+normalizedDelta;rollers.push({roller,targetPos,startDigit,step})}
el.setAttribute(METRICS_ODOMETER_FLAG,"true");return rollers}
function runMetricsOdometers(scope){if(!(scope instanceof HTMLElement)){return}
if(prefersReducedMotion()){const reducedMotionNumbers=scope.querySelectorAll("[data-metrics-odometer]");reducedMotionNumbers.forEach((el)=>{if(!(el instanceof HTMLElement)){return}
el.textContent=getOriginalOdometerText(el);el.removeAttribute(METRICS_ODOMETER_FLAG)});return}
const gsap=getGsap(["timeline","set","to"]);if(!gsap){return}
const elements=Array.from(scope.querySelectorAll("[data-metrics-odometer]")).filter((el)=>el instanceof HTMLElement,);if(elements.length===0){return}
const digitStagger=0.04;const jobs=[];elements.forEach((el,elementIndex)=>{if(!(el instanceof HTMLElement)){return}
if(el.getAttribute(METRICS_ODOMETER_FLAG)==="true"){resetOdometerElement(el)}
const rollers=buildOdometerForElement(el);if(!rollers||rollers.length===0){return}
const duration=getOdometerDuration(el);const baseDelay=0.26+elementIndex*0.08;jobs.push({el,rollers,duration,baseDelay})});if(jobs.length===0){return}
requestAnimationFrame(()=>{jobs.forEach(({el,rollers,duration,baseDelay})=>{void el.offsetHeight;const stepPx=getOdometerStepPx(rollers[0].roller,METRICS_ODOMETER_DIGIT_CYCLES);const usePx=stepPx!==null;const tl=gsap.timeline();tl.eventCallback("onComplete",()=>{const finalStepPx=getOdometerStepPx(rollers[0].roller,METRICS_ODOMETER_DIGIT_CYCLES,);if(finalStepPx===null){return}
rollers.forEach((entry)=>{gsap.set(entry.roller,{y:Math.round(-entry.targetPos*finalStepPx),})})});rollers.forEach((entry,idx)=>{const startY=usePx?-entry.startDigit*stepPx:`${-entry.startDigit * entry.step}em`;const endY=usePx?-entry.targetPos*stepPx:`${-entry.targetPos * entry.step}em`;gsap.set(entry.roller,{y:startY});tl.to(entry.roller,{y:endY,duration,ease:"power3.out",force3D:!0,},baseDelay+idx*digitStagger,)})})})}
function clamp(n,min,max){return Math.min(max,Math.max(min,n))}
function getMetricsMouseFlexWeights(columnCount){const scale=METRICS_MOUSE_FLEX_WEIGHT_SCALE;let weights;if(columnCount<2){return[]}
if(columnCount===2){weights=[-0.1,0.1]}else if(columnCount===3){weights=[-0.1,-0.05,0.15]}else{weights=Array.from({length:columnCount},(_,i)=>{const t=columnCount>1?i/(columnCount-1):0;return-0.1+t*0.25})}
return weights.map((w)=>w*scale)}
function computeMetricsMouseFlexTargets(grid,clientX,weights){const rect=grid.getBoundingClientRect();if(!Number.isFinite(rect.width)||rect.width<=0){return null}
const m=clamp((clientX-rect.left)/rect.width,0,1);const u=m*2-1;const flexMin=1-0.12*METRICS_MOUSE_FLEX_WEIGHT_SCALE;const flexMax=1+0.18*METRICS_MOUSE_FLEX_WEIGHT_SCALE;return weights.map((w)=>clamp(1+u*w,flexMin,flexMax))}
function applyMetricsMouseFlex(grid,values){values.forEach((grow,i)=>{grid.style.setProperty(`--metrics-flex-${i}`,String(grow))})}
function resetMetricsMouseFlex(grid,count){for(let i=0;i<count;i+=1){grid.style.removeProperty(`--metrics-flex-${i}`)}}
function initMetricsMouseFlex(block){if(!(block instanceof HTMLElement)){return}
if(prefersReducedMotion()){return}
if(isBlockEditorPreview()){return}
const grid=block.querySelector(".metrics__grid");if(!(grid instanceof HTMLElement)){return}
if(grid.getAttribute(METRICS_MOUSE_FLEX_READY)==="true"){return}
const itemCount=grid.querySelectorAll(".metrics__item").length;if(itemCount<2){return}
const columnCount=Math.min(3,itemCount);const weights=getMetricsMouseFlexWeights(columnCount);if(weights.length===0){return}
const mqDesktop=window.matchMedia(METRICS_MOUSE_FLEX_MQ);const mqPointer=window.matchMedia(METRICS_MOUSE_POINTER_MQ);const channelCount=weights.length;const currentGrow=weights.map(()=>1);let easeRafId=null;let lastClientX=0;let pointerActive=!1;let gridInView=!1;const tickFlexEase=()=>{easeRafId=null;if(!pointerActive||!mqDesktop.matches||!mqPointer.matches){return}
const targets=computeMetricsMouseFlexTargets(grid,lastClientX,weights);if(!targets){return}
let maxDiff=0;for(let i=0;i<channelCount;i+=1){const t=targets[i];currentGrow[i]+=(t-currentGrow[i])*METRICS_MOUSE_FLEX_SMOOTH;maxDiff=Math.max(maxDiff,Math.abs(t-currentGrow[i]))}
applyMetricsMouseFlex(grid,currentGrow);if(maxDiff>METRICS_MOUSE_FLEX_SETTLE_EPS){easeRafId=window.requestAnimationFrame(tickFlexEase)}};const scheduleFlexEase=()=>{if(easeRafId!==null){return}
easeRafId=window.requestAnimationFrame(tickFlexEase)};const onMove=(event)=>{if(!pointerActive||!mqDesktop.matches||!mqPointer.matches){return}
lastClientX=event.clientX;scheduleFlexEase()};const stopPointer=()=>{pointerActive=!1;window.removeEventListener("mousemove",onMove);if(easeRafId!==null){window.cancelAnimationFrame(easeRafId);easeRafId=null}
for(let i=0;i<channelCount;i+=1){currentGrow[i]=1}
resetMetricsMouseFlex(grid,weights.length)};const startPointer=()=>{if(!mqDesktop.matches||!mqPointer.matches){return}
if(pointerActive){return}
pointerActive=!0;window.addEventListener("mousemove",onMove,{passive:!0})};const onMqChange=()=>{if(!mqDesktop.matches){stopPointer();return}
if(gridInView){startPointer()}};if(typeof mqDesktop.addEventListener==="function"){mqDesktop.addEventListener("change",onMqChange)}else{mqDesktop.addListener(onMqChange)}
onInView(grid,{onEnter:()=>{gridInView=!0;startPointer()},onLeave:()=>{gridInView=!1;stopPointer()},},{threshold:0.12,rootMargin:"0px",enteredClass:"",enteredAttribute:!1,leaveClearsEntered:!1,},);grid.setAttribute(METRICS_MOUSE_FLEX_READY,"true")}
function initMetricsCounter(block){if(!(block instanceof HTMLElement)){return!1}
const grid=block.querySelector(".metrics__grid");if(!(grid instanceof HTMLElement)){return!1}
if(grid.dataset.metricsCounterReady==="true"){return!0}
const numbers=grid.querySelectorAll("[data-metrics-odometer]");if(!numbers.length){return!1}
let hasAnimated=!1;const runAnimation=()=>{if(hasAnimated){return}
hasAnimated=!0;runMetricsOdometers(grid)};onEnterView(grid,()=>{runAnimation()},{enteredClass:"is-metrics-grid-entered",enteredAttribute:!1},);if(isBlockEditorPreview()){window.setTimeout(runAnimation,700)}
grid.dataset.metricsCounterReady="true";return!0}
function initAllMetricsBlocks(){document.querySelectorAll(".metrics").forEach((block)=>{if(block instanceof HTMLElement){initMetricsMouseFlex(block)}});if(!getGsap(["to"])){return!1}
document.querySelectorAll(".metrics").forEach((block)=>{initMetricsCounter(block)});return!0}
ready(()=>{runWithEditorPreviewSupport(initAllMetricsBlocks,{retryUntil:()=>Boolean(getGsap(["to"])),})})