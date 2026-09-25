import{initMarqueeWithOverflowCheck}from "/wp-content/themes/okd/blockstudio/assets/js/marquee-advanced.js";import{getGsap,hasScrollTrigger,hasSplitText,isBlockEditorPreview,onEnterView,prefersReducedMotion,ready,runWithEditorPreviewSupport,}from "/wp-content/themes/okd/blockstudio/assets/js/utils.js";const HERO_FSH_SPACER_SCROLL_MIN_WIDTH=1025;const HERO_FSH_SPACER_SCROLL_MIN_HEIGHT=660;function getOkdHeaderInlineHeightPx(){const root=document.body||document.documentElement;const raw=getComputedStyle(root).getPropertyValue("--okd-header-inline-height").trim();const n=parseFloat(raw);return Number.isFinite(n)?n:0}
function addMqChangeListener(mq,fn){if(typeof mq.addEventListener==="function"){mq.addEventListener("change",fn)}else{mq.addListener(fn)}}
function initHeroFshBgMediaFade(section){const bg=section.querySelector(".hero-fs-headline__bg");if(!(bg instanceof HTMLElement)){return}
const markReady=()=>{window.requestAnimationFrame(()=>{bg.classList.add("is-hero-fsh-media-ready")})};if(prefersReducedMotion()){markReady();return}
const video=bg.querySelector("video.hero-fs-headline__media-video");if(video instanceof HTMLVideoElement){if(video.readyState>=HTMLMediaElement.HAVE_CURRENT_DATA){markReady()}else{video.addEventListener("loadeddata",markReady,{once:!0});video.addEventListener("error",markReady,{once:!0})}
return}
const img=bg.querySelector("img.hero-fs-headline__media-img");if(img instanceof HTMLImageElement){if(img.complete&&img.naturalHeight>0){markReady()}else{img.addEventListener("load",markReady,{once:!0});img.addEventListener("error",markReady,{once:!0})}
return}
markReady()}
function markHeroFshTitleScrollReady(section){const titleEl=section.querySelector(".hero-fs-headline__title");if(titleEl instanceof HTMLElement){titleEl.classList.add("is-hero-fsh-title-scroll-ready")}}
function wireHeroFshTitleScrollReady(section){const titleEl=section.querySelector(".hero-fs-headline__title");if(!(titleEl instanceof HTMLElement)){return}
if(titleEl.classList.contains("is-hero-fsh-title-scroll-ready")){return}
if(prefersReducedMotion()||section.classList.contains("is-preview")||section.classList.contains("is-editor")||isBlockEditorPreview()){markHeroFshTitleScrollReady(section);return}
if(titleEl.classList.contains("is-hero-fsh-title-split")){return}
const onEnd=(e)=>{if(e.propertyName==="opacity"){titleEl.removeEventListener("transitionend",onEnd);markHeroFshTitleScrollReady(section)}};titleEl.addEventListener("transitionend",onEnd);window.setTimeout(()=>{titleEl.removeEventListener("transitionend",onEnd);markHeroFshTitleScrollReady(section)},2500)}
function initHeroFshTitleEntrance(section){if(!(section instanceof HTMLElement)){return}
if(section.dataset.heroFshTitleEntrance==="true"){return}
section.dataset.heroFshTitleEntrance="true";const titleEl=section.querySelector(".hero-fs-headline__title");if(!(titleEl instanceof HTMLElement)){markHeroFshTitleScrollReady(section);return}
if(prefersReducedMotion()||section.classList.contains("is-preview")||section.classList.contains("is-editor")||isBlockEditorPreview()){wireHeroFshTitleScrollReady(section);return}
const gsap=getGsap(["from"]);if(hasSplitText()&&gsap&&typeof window.SplitText.create==="function"){const runSplit=()=>{window.SplitText.create(titleEl,{aria:"none",autoSplit:!0,deepSlice:!0,linesClass:"hero-fsh-headline__line++",mask:"lines",onSplit(self){titleEl.classList.add("is-hero-fsh-title-split");return gsap.from(self.lines,{autoAlpha:0,delay:0.42,duration:0.72,ease:"power3.out",stagger:0.12,yPercent:108,onComplete:()=>{markHeroFshTitleScrollReady(section)},})},tag:"span",type:"lines",})};if(document.fonts&&typeof document.fonts.ready?.then==="function"){document.fonts.ready.then(runSplit)}else{runSplit()}
return}
wireHeroFshTitleScrollReady(section)}
function initHeroFsHeadlineSection(section){if(!(section instanceof HTMLElement)){return!1}
if(section.dataset.heroFshReady==="true"){return!0}
const shell=section.querySelector(".hero-fs-headline__shell");if(!(shell instanceof HTMLElement)){section.dataset.heroFshReady="true";return!0}
section.querySelectorAll("[data-marquee-scroll-direction-target]").forEach((node)=>{if(node instanceof HTMLElement){initMarqueeWithOverflowCheck(node)}});initHeroFshBgMediaFade(section);onEnterView(shell,()=>{initHeroFshTitleEntrance(section)},{enteredClass:"is-hero-fsh-lines-entered",enteredAttribute:!1,},);if(isBlockEditorPreview()){window.setTimeout(()=>{shell.classList.add("is-hero-fsh-lines-entered");initHeroFshTitleEntrance(section)},700)}
if(!prefersReducedMotion()&&hasScrollTrigger()&&!section.classList.contains("is-preview")&&!section.classList.contains("is-editor")&&!isBlockEditorPreview()){const gsap=getGsap([]);if(gsap&&typeof gsap.fromTo==="function"){const spacerScrollMq=window.matchMedia(`(min-width: ${HERO_FSH_SPACER_SCROLL_MIN_WIDTH}px) and (min-height: ${HERO_FSH_SPACER_SCROLL_MIN_HEIGHT}px)`,);let scrollScrubTl=null;const killScrollScrub=()=>{if(scrollScrubTl){scrollScrubTl.kill();scrollScrubTl=null}
if(typeof gsap.set==="function"){gsap.set(shell,{clearProps:"--hero-fsh-spacer"});const titleEl=section.querySelector(".hero-fs-headline__title");if(titleEl instanceof HTMLElement){gsap.set(titleEl,{clearProps:"opacity,filter"})}}};const startScrollScrub=()=>{killScrollScrub();if(!spacerScrollMq.matches){return}
const titleEl=section.querySelector(".hero-fs-headline__title");scrollScrubTl=gsap.timeline({scrollTrigger:{trigger:section,start:"top top",end:()=>`bottom top+=${getOkdHeaderInlineHeightPx()}px`,scrub:0.85,invalidateOnRefresh:!0,},});scrollScrubTl.fromTo(shell,{"--hero-fsh-spacer":"25vh"},{"--hero-fsh-spacer":"4vh",ease:"none"},0,);if(titleEl instanceof HTMLElement){scrollScrubTl.fromTo(titleEl,{filter:"blur(0px)",opacity:1,immediateRender:!1},{filter:"blur(10px)",opacity:0,ease:"none"},0,)}};startScrollScrub();addMqChangeListener(spacerScrollMq,()=>{if(spacerScrollMq.matches){startScrollScrub()}else{killScrollScrub()}})}}
section.dataset.heroFshReady="true";return!0}
function initAllHeroFsHeadlineBlocks(){document.querySelectorAll("section.hero-fs-headline").forEach((node)=>{if(node instanceof HTMLElement){initHeroFsHeadlineSection(node)}});if(typeof window.ScrollTrigger!=="undefined"&&typeof window.ScrollTrigger.refresh==="function"){window.ScrollTrigger.refresh()}
return!0}
ready(()=>{runWithEditorPreviewSupport(initAllHeroFsHeadlineBlocks)})