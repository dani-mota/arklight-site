import{onInView,prefersReducedMotion,ready,}from "/wp-content/themes/okd/blockstudio/assets/js/utils.js";function initHls(video){if(!(video instanceof HTMLVideoElement)){return}
if(typeof window.okdMediaHlsInitVideo==="function"){window.okdMediaHlsInitVideo(video,{skipDefer:!0,reinit:!1})}}
function isAutoplayVideo(video){return(video instanceof HTMLVideoElement&&(video.hasAttribute("autoplay")||video.autoplay===!0))}
function resetVideoPlayback(video){if(!(video instanceof HTMLVideoElement)||isAutoplayVideo(video)){return}
video.pause();try{video.currentTime=0}catch(_e){}}
function playVideoWhenManual(video){if(!(video instanceof HTMLVideoElement)||isAutoplayVideo(video)){return}
void video.play().catch(()=>{})}
function syncFooterNavCurrentPageMobile(){const mq=window.matchMedia("(max-width: 1024px)");const apply=()=>{const mobile=mq.matches;document.querySelectorAll('.footer_nav .footer_nav_link[aria-current="page"]').forEach((el)=>{if(!(el instanceof HTMLElement)){return}
if(mobile){el.removeAttribute("aria-disabled");el.removeAttribute("tabindex")}else{el.setAttribute("aria-disabled","true");el.setAttribute("tabindex","-1")}})};apply();mq.addEventListener("change",apply)}
function initFooterMedia(footer){if(!(footer instanceof HTMLElement)){return}
const bg=footer.querySelector(".footer_media--bg");const video=bg instanceof HTMLElement?bg.querySelector("video"):null;let hlsDeferredInitialized=!1;let videoReadyArmed=!1;let inView=!1;let mediaReady=!1;const tryRevealFooterBg=()=>{if(!(bg instanceof HTMLElement)){return}
if(prefersReducedMotion()||(mediaReady&&inView)){window.requestAnimationFrame(()=>{bg.classList.add("is-footer-media-revealed")})}};const markFooterMediaReady=()=>{if(mediaReady){return}
mediaReady=!0;tryRevealFooterBg()};const armFooterVideoReady=()=>{if(!(video instanceof HTMLVideoElement)||videoReadyArmed){return}
videoReadyArmed=!0;if(prefersReducedMotion()){markFooterMediaReady();return}
if(video.readyState>=HTMLMediaElement.HAVE_CURRENT_DATA){markFooterMediaReady()}else{video.addEventListener("loadeddata",markFooterMediaReady,{once:!0});video.addEventListener("error",markFooterMediaReady,{once:!0})}};const armFooterImageReady=()=>{if(!(bg instanceof HTMLElement)){markFooterMediaReady();return}
const img=bg.querySelector("picture img, img.footer_media_img");if(!(img instanceof HTMLImageElement)){markFooterMediaReady();return}
if(prefersReducedMotion()){markFooterMediaReady();return}
if(img.complete&&img.naturalHeight>0){markFooterMediaReady()}else{img.addEventListener("load",markFooterMediaReady,{once:!0});img.addEventListener("error",markFooterMediaReady,{once:!0})}};if(bg instanceof HTMLElement){if(prefersReducedMotion()){markFooterMediaReady()}else if(video instanceof HTMLVideoElement){if(!video.hasAttribute("data-okd-hls-defer")){armFooterVideoReady()}}else{armFooterImageReady()}}
onInView(footer,{onEnter:()=>{inView=!0;if(video instanceof HTMLVideoElement){if(video.hasAttribute("data-okd-hls-defer")&&!hlsDeferredInitialized){initHls(video);hlsDeferredInitialized=!0}
if(video.hasAttribute("data-okd-hls-defer")){armFooterVideoReady()}
playVideoWhenManual(video)}
tryRevealFooterBg()},onLeave:()=>{inView=!1;if(!(video instanceof HTMLVideoElement)){return}
resetVideoPlayback(video)},},{rootMargin:"0px",threshold:0,},)}
ready(()=>{const footer=document.querySelector("footer.footer");if(!(footer instanceof HTMLElement)){return}
initFooterMedia(footer);syncFooterNavCurrentPageMobile()})