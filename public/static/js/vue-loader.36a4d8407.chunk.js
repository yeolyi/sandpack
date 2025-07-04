(this.csbJsonP=this.csbJsonP||[]).push([["vue-loader"],{"../../node_modules/raw-loader/index.js!../../node_modules/vue-hot-reload-api/dist/index.js":function(n,e){n.exports="var Vue // late bind\nvar version\nvar map = Object.create(null)\nif (typeof window !== 'undefined') {\n  window.__VUE_HOT_MAP__ = map\n}\nvar installed = false\nvar isBrowserify = false\nvar initHookName = 'beforeCreate'\n\nexports.install = function (vue, browserify) {\n  if (installed) { return }\n  installed = true\n\n  Vue = vue.__esModule ? vue.default : vue\n  version = Vue.version.split('.').map(Number)\n  isBrowserify = browserify\n\n  // compat with < 2.0.0-alpha.7\n  if (Vue.config._lifecycleHooks.indexOf('init') > -1) {\n    initHookName = 'init'\n  }\n\n  exports.compatible = version[0] >= 2\n  if (!exports.compatible) {\n    console.warn(\n      '[HMR] You are using a version of vue-hot-reload-api that is ' +\n        'only compatible with Vue.js core ^2.0.0.'\n    )\n    return\n  }\n}\n\n/**\n * Create a record for a hot module, which keeps track of its constructor\n * and instances\n *\n * @param {String} id\n * @param {Object} options\n */\n\nexports.createRecord = function (id, options) {\n  if(map[id]) { return }\n\n  var Ctor = null\n  if (typeof options === 'function') {\n    Ctor = options\n    options = Ctor.options\n  }\n  makeOptionsHot(id, options)\n  map[id] = {\n    Ctor: Ctor,\n    options: options,\n    instances: []\n  }\n}\n\n/**\n * Check if module is recorded\n *\n * @param {String} id\n */\n\nexports.isRecorded = function (id) {\n  return typeof map[id] !== 'undefined'\n}\n\n/**\n * Make a Component options object hot.\n *\n * @param {String} id\n * @param {Object} options\n */\n\nfunction makeOptionsHot(id, options) {\n  if (options.functional) {\n    var render = options.render\n    options.render = function (h, ctx) {\n      var instances = map[id].instances\n      if (ctx && instances.indexOf(ctx.parent) < 0) {\n        instances.push(ctx.parent)\n      }\n      return render(h, ctx)\n    }\n  } else {\n    injectHook(options, initHookName, function() {\n      var record = map[id]\n      if (!record.Ctor) {\n        record.Ctor = this.constructor\n      }\n      record.instances.push(this)\n    })\n    injectHook(options, 'beforeDestroy', function() {\n      var instances = map[id].instances\n      instances.splice(instances.indexOf(this), 1)\n    })\n  }\n}\n\n/**\n * Inject a hook to a hot reloadable component so that\n * we can keep track of it.\n *\n * @param {Object} options\n * @param {String} name\n * @param {Function} hook\n */\n\nfunction injectHook(options, name, hook) {\n  var existing = options[name]\n  options[name] = existing\n    ? Array.isArray(existing) ? existing.concat(hook) : [existing, hook]\n    : [hook]\n}\n\nfunction tryWrap(fn) {\n  return function (id, arg) {\n    try {\n      fn(id, arg)\n    } catch (e) {\n      console.error(e)\n      console.warn(\n        'Something went wrong during Vue component hot-reload. Full reload required.'\n      )\n    }\n  }\n}\n\nfunction updateOptions (oldOptions, newOptions) {\n  for (var key in oldOptions) {\n    if (!(key in newOptions)) {\n      delete oldOptions[key]\n    }\n  }\n  for (var key$1 in newOptions) {\n    oldOptions[key$1] = newOptions[key$1]\n  }\n}\n\nexports.rerender = tryWrap(function (id, options) {\n  var record = map[id]\n  if (!options) {\n    record.instances.slice().forEach(function (instance) {\n      instance.$forceUpdate()\n    })\n    return\n  }\n  if (typeof options === 'function') {\n    options = options.options\n  }\n  if (record.Ctor) {\n    record.Ctor.options.render = options.render\n    record.Ctor.options.staticRenderFns = options.staticRenderFns\n    record.instances.slice().forEach(function (instance) {\n      instance.$options.render = options.render\n      instance.$options.staticRenderFns = options.staticRenderFns\n      // reset static trees\n      // pre 2.5, all static trees are cached together on the instance\n      if (instance._staticTrees) {\n        instance._staticTrees = []\n      }\n      // 2.5.0\n      if (Array.isArray(record.Ctor.options.cached)) {\n        record.Ctor.options.cached = []\n      }\n      // 2.5.3\n      if (Array.isArray(instance.$options.cached)) {\n        instance.$options.cached = []\n      }\n\n      // post 2.5.4: v-once trees are cached on instance._staticTrees.\n      // Pure static trees are cached on the staticRenderFns array\n      // (both already reset above)\n\n      // 2.6: temporarily mark rendered scoped slots as unstable so that\n      // child components can be forced to update\n      var restore = patchScopedSlots(instance)\n      instance.$forceUpdate()\n      instance.$nextTick(restore)\n    })\n  } else {\n    // functional or no instance created yet\n    record.options.render = options.render\n    record.options.staticRenderFns = options.staticRenderFns\n\n    // handle functional component re-render\n    if (record.options.functional) {\n      // rerender with full options\n      if (Object.keys(options).length > 2) {\n        updateOptions(record.options, options)\n      } else {\n        // template-only rerender.\n        // need to inject the style injection code for CSS modules\n        // to work properly.\n        var injectStyles = record.options._injectStyles\n        if (injectStyles) {\n          var render = options.render\n          record.options.render = function (h, ctx) {\n            injectStyles.call(ctx)\n            return render(h, ctx)\n          }\n        }\n      }\n      record.options._Ctor = null\n      // 2.5.3\n      if (Array.isArray(record.options.cached)) {\n        record.options.cached = []\n      }\n      record.instances.slice().forEach(function (instance) {\n        instance.$forceUpdate()\n      })\n    }\n  }\n})\n\nexports.reload = tryWrap(function (id, options) {\n  var record = map[id]\n  if (options) {\n    if (typeof options === 'function') {\n      options = options.options\n    }\n    makeOptionsHot(id, options)\n    if (record.Ctor) {\n      if (version[1] < 2) {\n        // preserve pre 2.2 behavior for global mixin handling\n        record.Ctor.extendOptions = options\n      }\n      var newCtor = record.Ctor.super.extend(options)\n      record.Ctor.options = newCtor.options\n      record.Ctor.cid = newCtor.cid\n      record.Ctor.prototype = newCtor.prototype\n      if (newCtor.release) {\n        // temporary global mixin strategy used in < 2.0.0-alpha.6\n        newCtor.release()\n      }\n    } else {\n      updateOptions(record.options, options)\n    }\n  }\n  record.instances.slice().forEach(function (instance) {\n    if (instance.$vnode && instance.$vnode.context) {\n      instance.$vnode.context.$forceUpdate()\n    } else {\n      console.warn(\n        'Root or manually mounted instance modified. Full reload required.'\n      )\n    }\n  })\n})\n\n// 2.6 optimizes template-compiled scoped slots and skips updates if child\n// only uses scoped slots. We need to patch the scoped slots resolving helper\n// to temporarily mark all scoped slots as unstable in order to force child\n// updates.\nfunction patchScopedSlots (instance) {\n  if (!instance._u) { return }\n  // https://github.com/vuejs/vue/blob/dev/src/core/instance/render-helpers/resolve-scoped-slots.js\n  var original = instance._u\n  instance._u = function (slots) {\n    try {\n      // 2.6.4 ~ 2.6.6\n      return original(slots, true)\n    } catch (e) {\n      // 2.5 / >= 2.6.7\n      return original(slots, null, true)\n    }\n  }\n  return function () {\n    instance._u = original\n  }\n}\n"},"../../node_modules/raw-loader/index.js!./src/sandbox/eval/transpilers/vue/v2/component-normalizer.js":function(n,e){n.exports="/* eslint-disable */\n/* globals __VUE_SSR_CONTEXT__ */\n\n// IMPORTANT: Do NOT use ES2015 features in this file.\n// This module is a runtime utility for cleaner component module output and will\n// be included in the final webpack user bundle.\n\nmodule.exports = function normalizeComponent(\n  rawScriptExports,\n  compiledTemplate,\n  functionalTemplate,\n  injectStyles,\n  scopeId,\n  moduleIdentifier /* server only */\n) {\n  let scriptExports = (rawScriptExports = rawScriptExports || {});\n\n  // Vue.extend constructor export interop\n  let defaultExport = scriptExports.default || scriptExports;\n  let options =\n    typeof defaultExport === 'function' ? defaultExport.options : defaultExport;\n\n  // render functions\n  if (compiledTemplate) {\n    options.render = compiledTemplate.render;\n    options.staticRenderFns = compiledTemplate.staticRenderFns;\n    options._compiled = true;\n  }\n\n  // functional template\n  if (functionalTemplate) {\n    options.functional = true;\n  }\n\n  // scopedId\n  if (scopeId) {\n    options._scopeId = scopeId;\n  }\n\n  let hook;\n  if (moduleIdentifier) {\n    // server build\n    hook = function (context) {\n      // 2.3 injection\n      context =\n        context || // cached call\n        (this.$vnode && this.$vnode.ssrContext) || // stateful\n        (this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext); // functional\n      // 2.2 with runInNewContext: true\n      if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {\n        context = __VUE_SSR_CONTEXT__;\n      }\n      // inject component styles\n      if (injectStyles) {\n        injectStyles.call(this, context);\n      }\n      // register component module identifier for async chunk inferrence\n      if (context && context._registeredComponents) {\n        context._registeredComponents.add(moduleIdentifier);\n      }\n    };\n    // used by ssr in case component is cached and beforeCreate\n    // never gets called\n    options._ssrRegister = hook;\n  } else if (injectStyles) {\n    hook = injectStyles;\n  }\n\n  if (hook) {\n    let functional = options.functional;\n    let existing = functional ? options.render : options.beforeCreate;\n\n    if (!functional) {\n      // inject component registration as beforeCreate hook\n      options.beforeCreate = existing ? [].concat(existing, hook) : [hook];\n    } else {\n      // for template-only hot-reload because in that case the render fn doesn't\n      // go through the normalizer\n      options._injectStyles = hook;\n      // register for functioal component in vue file\n      options.render = function renderWithStyleInjection(h, context) {\n        hook.call(context);\n        return existing(h, context);\n      };\n    }\n  }\n\n  return {\n    exports: scriptExports,\n    options: options,\n  };\n};\n"},"./src/sandbox/eval/transpilers/vue/v2/loader.ts":function(n,e,t){"use strict";t.r(e);var o=t("../../node_modules/@babel/runtime/helpers/defineProperty.js"),s=t.n(o),r=t("../../node_modules/@babel/runtime/helpers/asyncToGenerator.js"),i=t.n(r),c=t("../../node_modules/querystring-es3/index.js"),a=t.n(c),l=t("../common/lib/utils/path.js"),d=t("../sandpack-core/lib/transpiler/utils/loader-utils/index.js"),p=t("../../node_modules/raw-loader/index.js!./src/sandbox/eval/transpilers/vue/v2/component-normalizer.js"),u=t.n(p),f=t("../../node_modules/raw-loader/index.js!../../node_modules/vue-hot-reload-api/dist/index.js"),m=t.n(f),h=t("../../node_modules/path-browserify/index.js"),y=t.n(h),_=t("../../node_modules/hash-sum/hash-sum.js"),v=t.n(_);const x=Object.create(null),b=new RegExp(y.a.sep.replace("\\","\\\\"),"g");function g(n,e,t){const o=e.split(y.a.sep);return n=o[o.length-1]+"/"+y.a.relative(e,n).replace(b,"/")+(t||""),x[n]||(x[n]=v()(n))}var j=t("./src/sandbox/eval/transpilers/vue/v2/parser.js"),O=t.n(j);function C(n,e){var t=Object.keys(n);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(n);e&&(o=o.filter((function(e){return Object.getOwnPropertyDescriptor(n,e).enumerable}))),t.push.apply(t,o)}return t}function w(n){for(var e=1;e<arguments.length;e++){var t=null!=arguments[e]?arguments[e]:{};e%2?C(Object(t),!0).forEach((function(e){s()(n,e,t[e])})):Object.getOwnPropertyDescriptors?Object.defineProperties(n,Object.getOwnPropertyDescriptors(t)):C(Object(t)).forEach((function(e){Object.defineProperty(n,e,Object.getOwnPropertyDescriptor(t,e))}))}return n}function S(n){return d.a.getRemainingRequest(n)}const k="!noop-loader!/node_modules/vue-hot-reload-api.js",E={template:"html",styles:"css",script:"js"},R=["postcss","pcss","sugarss","sss"],M=/\b(css(?:-loader)?(?:\?[^!]+)?)(?:!|$)/;e.default=function(n,e){return I.apply(this,arguments)};function I(){return(I=i()((function*(n,e){const t=[],o=n=>{t.push(e.addDependency(n,c))};e.emitModule(k,m.a,"/",!1,!1);const s=e.path,r=e.options,i=e._module.module.path,c=w(w({esModule:!1},this.vue),r),p=S(e),f=Object(l.basename)(i),h=Object(l.dirname)(s),y="data-v-"+g(s,c.context,c.hashKey);let _="";const v=O()(n,f,!1,h),x=v.styles.some(n=>n.scoped),b=v.template&&v.template.attrs&&v.template.attrs,j=b&&b.comments,C=b&&b.functional,I=w({},c.buble);I.transforms=w({},I.transforms),I.transforms.stripWithFunctional=C;const N={html:"vue-template-compiler"+("?"+JSON.stringify({id:y,hasScoped:x,hasComment:j,transformToRequire:{video:"src",source:"src",img:"src",image:"xlink:href"},preserveWhitespace:!1,buble:I,compilerModules:"string"==typeof c.compilerModules?c.compilerModules:void 0})),css:"vue-style-loader!css-loader?sourceMap",js:"babel-loader"},T=w(w({},N),{less:["vue-style-loader","css-loader","less-loader"],scss:["vue-style-loader","css-loader","sass-loader"],sass:["vue-style-loader","css-loader","sass-loader?indentedSyntax"],styl:["vue-style-loader","css-loader","stylus-loader"],stylus:["vue-style-loader","css-loader","stylus-loader"],ts:["ts-loader"],typescript:["ts-loader"],pug:["pug-loader"],coffee:["babel-loader","coffee-loader"]}),$={},P={},A=v.script||v.template;let q;if(A&&(_+="var disposed = false\n"),v.styles.length){let n="function injectStyle (ssrContext) {\n";A&&(n+="  if (disposed) return\n"),v.styles.forEach((t,o)=>{let s=t.src?z("styles",t,t.scoped):H("styles",t,o,t.scoped);const r=s.indexOf("style-loader")>-1,i=n=>"  ".concat(n,"\n"),c=!0===t.module?"$style":t.module;if(c)if(q||(q={},A&&(_+="var cssModules = {}\n")),c in q)e.emitError(new Error('CSS module name "'+c+'" is not unique!')),n+=i(s);else if(q[c]=!0,r||(s+=".locals"),A){n+=i('cssModules["'.concat(c,'"] = ').concat(s))+'Object.defineProperty(this, "'.concat(c,'", { get: function () { return cssModules["').concat(c,'"] }})\n');const e=t.src?U("styles",t,t.scoped):V("styles",t,o,t.scoped);_+="module.hot && module.hot.accept([".concat(e,"], function () {\n")+'  var oldLocals = cssModules["'.concat(c,'"]\n')+"  if (!oldLocals) return\n"+"  var newLocals = ".concat(s,"\n")+"  if (JSON.stringify(newLocals) === JSON.stringify(oldLocals)) return\n"+'  cssModules["'.concat(c,'"] = newLocals\n')+'  require("'.concat(k,'").rerender("').concat(y,'")\n')+"})\n"}else n+=i('this["'+c+'"] = '+s);else n+=i(s)}),n+="}\n",_+=n}e.emitModule("!noop-loader!/node_modules/component-normalizer.js",u.a,"/",!1,!1),_+="var normalizeComponent = require('!noop-loader!/node_modules/component-normalizer.js')\n",_+="  /* script */\n  ";const F=v.script;F?(_+="var __vue_script__ = "+(F.src?z("script",F,!1):H("script",F,0,!1))+"\n",r.inject&&(_+="__vue_script__ = __vue_script__(injections)\n")):_+="var __vue_script__ = null\n",_+="/* template */\n";const J=v.template;return _+=J?"var __vue_template__ = "+(J.src?z("template",J,!1):H("template",J,0,!1))+"\n":"var __vue_template__ = null\n",_+="/* template functional */\n",_+="var __vue_template_functional__ = "+(C?"true":"false")+"\n",_+="  /* styles */\n  ",_+="var __vue_styles__ = "+(v.styles.length?"injectStyle":"null")+"\n",_+="  /* scopeId */\n  ",_+="var __vue_scopeId__ = "+(x?JSON.stringify(y):"null")+"\n",_+="/* moduleIdentifier (server only) */\n",_+="var __vue_module_identifier__ = null\n",_+="var Component = normalizeComponent(\n  __vue_script__,\n  __vue_template__,\n  __vue_template_functional__,\n  __vue_styles__,\n  __vue_scopeId__,\n  __vue_module_identifier__\n)\n",_+="Component.options.__file = "+JSON.stringify(s)+"\n",r.inject?_="\n/* dependency injection */\nmodule.exports = function (injections) {\n"+_+"\n\nreturn Component.exports\n}":(A&&(_+='\n/* hot reload */\nif (module.hot) {(function () {\n  var hotAPI = require("'+k+'")\n  hotAPI.install(require("vue"), false)\n  if (!hotAPI.compatible) return\n  module.hot.accept()\n  if (!module.hot.data) {\n    hotAPI.createRecord("'+y+'", Component.options)\n  } else {\n',q&&(_+="    if (module.hot.data.cssModules && Object.keys(module.hot.data.cssModules) !== Object.keys(cssModules)) {\n      delete Component.options._Ctor\n    }\n"),_+="    hotAPI.".concat(C?"rerender":"reload",'("').concat(y,'", Component.options)\n  }\n'),_+="  module.hot.dispose(function (data) {\n"+(q?"    data.cssModules = cssModules\n":"")+"    disposed = true\n  })\n",_+="})()}\n"),_+="\nmodule.exports = Component.exports\n"),yield Promise.all(t),_;function H(n,e,t,o){return"require("+V(n,e,t,o)+")"}function V(n,t,s,r){const i="!!"+W(n,t,s,r)+function(n,e){return"vue-selector?type="+("script"===n||"template"===n||"styles"===n?n:"customBlocks")+"&index="+e+"&bustCache!"}(n,s||0)+p,c=d.a.stringifyRequest(e,i);return o(JSON.parse(c)),c}function z(n,e,t){return"require("+U(n,e,t)+")"}function U(n,t,s){const r=d.a.stringifyRequest(e,"!!"+W(n,t,0,s)+t.src);return o(JSON.parse(r)),r}function D(n,e,t){if(!e.module)return n;const o=c.cssModules||{},s={modules:!0},r={localIdentName:"[hash:base64]",importLoaders:!0};return n.replace(/((?:^|!)css(?:-loader)?)(\?[^!]*)?/,(n,e,i)=>{const c=d.a.parseQuery(i||"?");return Object.assign(c,r,o,s),t>=0&&(c.localIdentName+="_"+t),e+"?"+JSON.stringify(c)})}function L(n){return n.map(n=>n&&"object"==typeof n&&"string"==typeof n.loader?n.loader+(n.options?"?"+JSON.stringify(n.options):""):n).join("!")}function W(n,e,t,o){let s=function(n,e,t,o){let s=e.lang||E[n],i="";"styles"===n&&(i="vue-style-compiler?"+JSON.stringify({vue:!0,id:y,scoped:!!o,hasInlineConfig:!!r.postcss})+"!",T[s]||(-1!==R.indexOf(s)?s="css":"sass"===s?s="sass?indentedSyntax":"scss"===s&&(s="scss")));let c=T[s];const l="script"===n&&r.inject?"inject-loader!":"";if(null!=c)return Array.isArray(c)?c=L(c):"object"==typeof c&&(c=L([c])),"styles"===n&&(c=D(c,e,t),c=M.test(c)?c.replace(M,(n,e)=>X(e)+i):X(c)+i),"template"===n&&c.indexOf(N.html)<0&&(c=N.html+"!"+c),l+X(c);switch(n){case"template":return N.html+"!";case"styles":return c=D(N.css,e,t),c+"!"+i+X(B(s));case"script":return l+X(B(s));default:return c=T[n],Array.isArray(c)&&(c=L(c)),X(c+function(n){const e=w({},n);delete e.src;const t=a.a.stringify(e);return t?"?"+t:t}(e.attrs))}}(n,e,t,o);const i=function(n,e){let t=e.lang;return"script"===n||"template"===n||"styles"===n?t||E[n]:n}(n,e);return $[i]&&(s+=X($[i])),P[i]&&(s=X(P[i])+s),s}function B(n){return n.split("!").map(n=>n.replace(/^([\w-]+)(\?.*)?/,(n,e,t)=>(/-loader$/.test(e)?e:e+"-loader")+(t||""))).join("!")}function X(n){return"!"!==n.charAt(n.length-1)?n+"!":n}}))).apply(this,arguments)}},"./src/sandbox/eval/transpilers/vue/v2/parser.js":function(n,e,t){const o=t("../../node_modules/vue-template-compiler/browser.js"),s=t("./config/stubs/lru-cache.js")(100),r=t("../../node_modules/hash-sum/hash-sum.js"),i=t("../../node_modules/source-map/source-map.js").SourceMapGenerator,c=/\r?\n/g,a=/^(?:\/\/)?\s*$/;function l(n,e,t,o){const s=new i({sourceRoot:o});return s.setSourceContent(n,e),t.split(c).forEach((e,t)=>{a.test(e)||s.addMapping({source:n,original:{line:t+1,column:0},generated:{line:t+1,column:0}})}),s.toJSON()}n.exports=function(n,e,t,i){const c=r(e+n),a=e+"?"+c;let d=s.get(c);return d||(d=o.parseComponent(n,{pad:"line"}),t&&(d.script&&!d.script.src&&(d.script.map=l(a,n,d.script.content,i)),d.styles&&d.styles.forEach(e=>{e.src||(e.map=l(a,n,e.content,i))})),s.set(c,d),d)}}}]);
//# sourceMappingURL=vue-loader.36a4d8407.chunk.js.map