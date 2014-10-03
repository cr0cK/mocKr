!function(){"use strict";angular.module("mockify.alert",["mockify.service.webSocket"]).controller("AlertCtrl",["$scope","webSocketService",function(t,e){t.showAlert=!1;var r=function(e){t.type=e.type||"danger",t.strong=e.strong,t.message=e.message,t.showAlert=!0};t.$root.$on("alertError",function(t,e){r(e)}),t.$root.$on("hideAlert",function(){t.showAlert=!1}),e.on("alertError",function(e){t.$apply(function(){r(e)})})}])}(),function(){"use strict";angular.module("mockify",["ui.router","ui.bootstrap","templates","mockify.alert","mockify.dashboard"]).config(["$urlRouterProvider","$stateProvider",function(t,e){t.otherwise("/dashboard"),e.state("app",{url:"/",views:{alert:{templateUrl:"alert.html",controller:"AlertCtrl"},header:{templateUrl:"header.html"},layout:{templateUrl:"2columns.html"}}})}]).run(["$rootScope","$state",function(t,e){t.$on("$stateChangeSuccess",function(t,e){console.log("Current state:",e.name)}),t.$on("$stateChangeStart",function(t,r){"app"===r.name&&e.go("app.dashboard")})}])}(),function(){"use strict";angular.module("mockify.dashboard",["mockify.process","mockify.responses","mockify.logs"]).config(["$urlRouterProvider","$stateProvider",function(t,e){e.state("app.dashboard",{url:"dashboard",views:{primaryContainer:{templateUrl:"responses.html",controller:"ResponsesCtrl"},secondaryContainer:{templateUrl:"targets.html",controller:"TargetCtrl"},logsContainer:{templateUrl:"logs.html",controller:"LogsCtrl"}}})}])}(),function(){"use strict";angular.module("mockify.service.localStorage",[]).factory("localStorageFactory",["$window",function(t){var e=t.localStorage;return{get:function(t,r){r=r||10;var o=[],n=_.has(e,t)&&JSON.parse(e[t]);if(_.isArray(n)){var i=n.length-r;0>i&&(i=0),o=n.slice(i)}return o},last:function(t){var r;return _.has(e,t)&&_.isArray(r=JSON.parse(e[t]))&&_.last(r)},push:function(t,e){var r=this.get(t);_.isArray(r)?(r.push(e),this.save(t,_.uniq(r))):this.save(t,[e])},save:function(t,r){e[t]=JSON.stringify(r)},"delete":function(t){delete e[t]}}}])}(),function(){"use strict";function t(t,e){return _.forEach(e,function(e,r){"_"!==r.substr(0,1)&&(r="_"+r),t[r]=e}),t}function e(t,e){var r={};return _.forIn(t,function(o,n){!_.isFunction(t[n])&&(!_.isArray(e)||_.isArray(e)&&_.contains(e,n))&&(n=n.replace(/^_/,""),r[n]=o)}),r}function r(t,e){var r=[];return _.forEach([t,e],function(t){r.push(_.map(t,function(t){return _.omit(t,function(t,e){return/^\$+/.test(e)})}))}),_.isEqual(r[0],r[1])}_.str.include("Underscore.string","string"),_.mixin({privateMerge:t,publicProperties:e,isAlmostEqual:r})}(),function(){"use strict";angular.module("mockify.logs",["mockify.service.webSocket","mockify.logs.directives","perfect_scrollbar"]).controller("LogsCtrl",["$scope","webSocketService",function(t,e){t.logs=[],_.forEach(["proxy","mock"],function(r){e.on(r+"Out",function(e){t.$apply(function(){t.logs.push(e)})}),e.on(r+"Error",function(e){t.$apply(function(){t.logs.push(e)})})})}])}(),function(){"use strict";angular.module("mockify.logs.directives",[]).directive("updateScroll",[function(){return{restrict:"A",link:function(t,e){var r=e;t.$watch("logs",function(){r.animate({scrollTop:r.prop("scrollHeight")},500)},!0)}}}])}(),function(){"use strict";angular.module("mockify.responses",["mockify.service.webSocket"]).controller("ResponsesCtrl",["$scope","webSocketService",function(t,e){t.logs=[],_.forEach(["proxy","mock"],function(r){e.on(r+"Response",function(e){t.$apply(function(){t.logs.push(e)})})})}])}(),function(){"use strict";angular.module("mockify.service.webSocket",[]).factory("webSocketService",["$rootScope","$interval",function(t,e){var r=io("http://localhost:5001");return e(function(){r.connected?t.$emit("hideAlert"):t.$emit("alertError",{message:"Websocket server has gone away!"})},1e4),{on:function(t,e){r.on(t,function(t){e(t)})},emit:function(t,e){r.emit(t,e)}}}])}(),function(){"use strict";angular.module("mockify.process",["mockify.service.webSocket","mockify.service.localStorage","mockify.entity.target","toggle-switch"]).controller("TargetCtrl",["$scope","$interval","webSocketService","localStorageFactory","targetFactory",function(t,e,r,o,n){var i=function(){return t.targetsStored=o.get("targets",10),o.last("targets")||"http://jsonplaceholder.typicode.com"};t.targetList=[],t.defaultValues={url:i(),port:4e3},t.addAndStartTarget=function(e,r){e=e||t.defaultValues.port,r=r||t.defaultValues.url,o.push("urls",r);var c=new n({port:e,url:r,proxying:0,mocking:0,enabled:0});c.add(),t.targetsList.push(c),delete t.target,delete t.port,t.defaultValues.target=i()},t.removeTarget=function(t){t.hidden=!0,t.remove()},t.toggleRecordTarget=function(t){t.toggleRecording()},t.toggleMockTarget=function(t){t.toggleMock()},t.toggleEnableTarget=function(t){t.toggleEnable()},r.on("listTargets",function(e){var r=_.map(e.targets,function(t){return new n(t)}),o=!_.isAlmostEqual(t.targetsList,r);(void 0===t.targetsList||o)&&t.$apply(function(){t.targetsList=r})})}])}(),function(){"use strict";angular.module("mockify.entity.target",["mockify.service.webSocket"]).factory("targetFactory",["webSocketService",function(t){var e=function(t){this.hidden=!1,this._id=this._port=this._url=this._recording=this._proxying=this._mocking=this._enabled,_.privateMerge(this,t)};return e.prototype.id=function(){return this._id},e.prototype.port=function(){return this._port},e.prototype.url=function(){return this._url},e.prototype.recording=function(){return this._recording},e.prototype.proxying=function(){return this._proxying},e.prototype.mocking=function(){return this._mocking},e.prototype.enabled=function(){return this._enabled},e.prototype.add=function(){t.emit("addTarget",_.publicProperties(this,["_port","_url"]))},e.prototype.remove=function(){t.emit("removeTarget",_.publicProperties(this))},e.prototype.toggleRecording=function(){this._recording=!this._recording,t.emit("recordingTarget",{targetProperties:{id:this._id},status:this._recording})},e.prototype.toggleMock=function(){var e=this._mocking?"startMock":"startProxy";t.emit(e,_.publicProperties(this))},e.prototype.toggleEnable=function(){var e=this._enabled?"enableTarget":"disableTarget";t.emit(e,{id:this._id})},e.prototype.mock=function(){t.emit("mockTarget",_.publicProperties(this))},e}])}();