import{prefersReducedMotion,ready,runWithEditorPreviewSupport,}from "/wp-content/themes/okd/blockstudio/assets/js/utils.js";let mailSentBound=!1;function getMailSentForm(event){const t=event.target;if(t instanceof HTMLFormElement&&t.classList.contains("wpcf7-form")){return t}
const detail=(event).detail;if(detail&&typeof detail==="object"&&"contactForm" in detail&&detail.contactForm instanceof HTMLFormElement){return detail.contactForm}
return null}
function findFormRoot(form){return form.closest("[data-site-form-root]")}
function bindFilledState(root){const controls=root.querySelectorAll('.wpcf7-form input:not([type="hidden"]):not([type="submit"]):not([type="button"]), .wpcf7-form textarea, .wpcf7-form select',);controls.forEach((el)=>{const field=el.closest(".site-form__field")||el.closest(".wpcf7-form-control-wrap")?.parentElement||el.closest("p");if(!(field instanceof HTMLElement)){return}
const update=()=>{let value="";if(el instanceof HTMLSelectElement){value=el.value||""}else if("value" in el){value=String(el.value||"")}
const filled=value.trim().length>0;field.classList.toggle("is-filled",filled)};el.addEventListener("input",update);el.addEventListener("change",update);el.addEventListener("blur",update);update()})}
function scrollToTopLikeHeader(){if(prefersReducedMotion()){window.scrollTo(0,0);return}
const lenis=window.okdLenis;if(lenis&&typeof lenis.scrollTo==="function"){lenis.scrollTo(0,{duration:1});return}
window.scrollTo({top:0,behavior:"smooth"})}
function showSuccess(root){root.dataset.siteFormState="success";const formPanel=root.querySelector('[data-site-form-panel="form"]');const successPanel=root.querySelector('[data-site-form-panel="success"]');if(formPanel instanceof HTMLElement){formPanel.setAttribute("aria-hidden","true")}
if(successPanel instanceof HTMLElement){successPanel.setAttribute("aria-hidden","false");const heading=successPanel.querySelector(".site-form__success-title, h2");if(heading instanceof HTMLElement){heading.focus({preventScroll:!0})}}
scrollToTopLikeHeader()}
function onDocumentMailSent(event){const form=getMailSentForm(event);if(!form){return}
const root=findFormRoot(form);if(!(root instanceof HTMLElement)||!root.classList.contains("site-form")){return}
showSuccess(root)}
function bindSubmitErrorReveal(root){const form=root.querySelector("form.wpcf7-form");if(!(form instanceof HTMLFormElement)){return}
const reveal=()=>{root.dataset.siteFormShowErrors="1"};form.addEventListener("click",(e)=>{const t=e.target;if(!(t instanceof Element)){return}
if(t.closest("button.wpcf7-submit, input.wpcf7-submit")){reveal()}},!0,);form.addEventListener("submit",reveal);document.addEventListener("wpcf7submit",(e)=>{if(e.target===form){reveal()}})}
function initFormBlock(root){bindFilledState(root);bindSubmitErrorReveal(root);if(!mailSentBound){mailSentBound=!0;document.addEventListener("wpcf7mailsent",onDocumentMailSent)}}
function initAll(){document.querySelectorAll("[data-site-form-root].site-form").forEach((el)=>{if(!(el instanceof HTMLElement)){return}
if(el.dataset.siteFormInit==="1"){return}
if(!el.querySelector(".wpcf7-form")){return}
el.dataset.siteFormInit="1";initFormBlock(el)})}
ready(()=>{runWithEditorPreviewSupport(()=>{initAll();return!0},{retryUntil:()=>document.querySelector("[data-site-form-root].site-form .wpcf7-form")!==null,},)})