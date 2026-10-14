const n=/([A-Za-z]+(?:['’-][A-Za-z]+)*)/g;function s(t){return t.split(n).filter(Boolean).map(e=>({value:e,isWord:/^[A-Za-z]/.test(e)}))}function o(t){let e=0;return s(t).map(a=>{const r=e;return e+=a.value.length,{...a,start:r,end:e}})}export{s as a,o as t};
//# sourceMappingURL=readerWords-CMCJkUjW.js.map
