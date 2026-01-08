webpackJsonp(["main"],{

/***/ "./src/$$_lazy_route_resource lazy recursive":
/***/ (function(module, exports) {

function webpackEmptyAsyncContext(req) {
	// Here Promise.resolve().then() is used instead of new Promise() to prevent
	// uncatched exception popping up in devtools
	return Promise.resolve().then(function() {
		throw new Error("Cannot find module '" + req + "'.");
	});
}
webpackEmptyAsyncContext.keys = function() { return []; };
webpackEmptyAsyncContext.resolve = webpackEmptyAsyncContext;
module.exports = webpackEmptyAsyncContext;
webpackEmptyAsyncContext.id = "./src/$$_lazy_route_resource lazy recursive";

/***/ }),

/***/ "./src/app/app.component.css":
/***/ (function(module, exports) {

module.exports = "/* align all elements to the right*/\r\n.container{\r\n    -webkit-box-orient: vertical;\r\n    -webkit-box-direction: reverse;\r\n        -ms-flex-direction: column-reverse;\r\n            flex-direction: column-reverse;\r\n}\r\n/* Header */\r\n.logo-link{\r\n    display: block;\r\n    position: relative;\r\n}\r\n.logo {\r\n    max-width: 60%;\r\n    min-width: 180px;\r\n    float: right;\r\n}\r\n.title-div{\r\n    position: relative;\r\n}\r\nheader .title {\r\n    color: #75325D;\r\n    font-size:1.1rem;\r\n    margin:0;\r\n    float: right;\r\n}\r\n/* Content */\r\n.content {\r\n    background: url('bg.35690b019389d9556ca4.png');\r\n    background-repeat: no-repeat;\r\n    background-position: bottom;\r\n    background-size: contain;\r\n    background-color: #E8F5F8;\r\n    min-height: 600px;\r\n    width:100%;\r\n    padding-top:1.7em;\r\n    padding-bottom:1.7em;\r\n    text-align: center;\r\n}\r\n.page {\r\n    margin:2% 5%;\r\n    background-color: #fff;\r\n    border: 1px solid #ccc;\r\n    text-align: right;\r\n    padding: 1.5em;\r\n    color: #6E7072;\r\n}\r\n/* Footer */\r\n.footer {\r\n    color: #fff;\r\n    height:1rem;\r\n    width: 100%;\r\n    background-color: #137888;\r\n    padding-top:0.25rem;\r\n    padding-right:0.2rem;\r\n    font-size:0.35rem;\r\n}\r\n.footer .contact {\r\n    float:left;\r\n    text-align: left;\r\n    margin-right: -10px;\r\n}\r\n.footer a {\r\n    color: #fff;\r\n}\r\n.last_mod {\r\n    font-size:10px;\r\n    float:left;\r\n}\r\n@media (max-width: 768px) {\r\n  :host /deep/ [class*=\"col-\"]{\r\n      margin-bottom: 15px;\r\n  }\r\n  .footer {\r\n    font-size:0.5rem; \r\n    padding-top:0.15rem;     \r\n  }\r\n}\r\n/* xs display */\r\n@media(max-width:575px){\r\n    .logo {\r\n        max-width:180px;\r\n    }\r\n    .header .title {\r\n        font-size:1rem;\r\n    }\r\n}\r\n/* Accessibility menu */\r\n.access{\r\n    font-size:19px;\r\n    color: #fff;\r\n    background-color: #000;\r\n    position: fixed;\r\n    left:0;\r\n    top:10%;\r\n    padding: 5px;\r\n    border-bottom-right-radius: 10px;\r\n    border-top-right-radius: 10px;\r\n    z-index: 500;\r\n    border: 3px solid #fff;\r\n    border-left:none;\r\n    width:92px;\r\n    padding-top:6px;\r\n    text-align: right;\r\n}\r\n@media (max-width: 575px){\r\n    .access {   \r\n        top:2%;\r\n    }\r\n}\r\n.access .access-menu{\r\n    max-height: 0;\r\n    -webkit-transition: max-height 0.30s ease-out;\r\n    transition: max-height 0.30s ease-out;\r\n    overflow: hidden;\r\n    font-size:14px;\r\n    color: #ffff00;\r\n    word-wrap: break-word;\r\n    margin-top:5px;\r\n}\r\n.access:hover .access-menu, .access:focus .access-menu, .access .focused{\r\n    max-height: 300px;\r\n    -webkit-transition: max-height 0.25s ease-in;\r\n    transition: max-height 0.25s ease-in;\r\n}\r\n.access .access-menu a{\r\n    cursor: pointer;\r\n    text-decoration: underline;\r\n    color: #FFFF00 !important;\r\n}\r\n.rights a{\r\n    float: right;\r\n}\r\n.access .cancel{\r\n    font-size: 12px;\r\n    display: inline-block;\r\n    margin-top: 10px;\r\n}\r\n/* accessibility style */\r\n.show-access, .show-access .content, .show-access main, .show-access h1, .show-access .footer, .show-access a{\r\n    color: #FFFF00 !important;\r\n    background-color: #000 !important;\r\n    background-image: none;\r\n}\r\n.show-access .logo{\r\n    -webkit-filter: grayscale(100%);\r\n            filter: grayscale(100%);\r\n}\r\n.show-access a{\r\n    text-decoration: underline;\r\n}\r\n.show-access .access{\r\n    border: 3px solid #ffff00;\r\n    border-left:none;\r\n}\r\n.show-access .logo-link:focus{\r\n    border: 2px solid #26487F !important;\r\n}\r\n.show-access .last_mod{\r\n    color: #000;\r\n}\r\n/* .loading {\r\n    text-align: center;\r\n    padding-top: 30vh;\r\n    height: 100vh;\r\n}\r\n@keyframes ui-progress-spinner-color {\r\n    100%,\r\n    0% {\r\n        stroke: #4A927A;\r\n    }\r\n} */\r\n\r\n\r\n\r\n\r\n"

/***/ }),

/***/ "./src/app/app.component.html":
/***/ (function(module, exports) {

module.exports = "<div class=\"container\" [ngClass]=\"{'show-access': stateObject.isAccessible}\">\r\n  <!--Header-->\r\n  <header>\r\n    <div class=\"row align-items-center\">\r\n      <div class=\"col-12 col-sm-5\">\r\n        <a href=\"https://new.huji.ac.il/\" target=\"_blank\" alt=\"לוגו האוניברסיטה\" class=\"logo-link\">\r\n          <img *ngIf=\"!stateObject.isAccessible\" class=\"logo\" src=\"./assets/HUJI_LogoHeb_hor.jpg\" alt=\"קישור לאתר האוניברסיטה\">\r\n          <img *ngIf=\"stateObject.isAccessible\" class=\"logo\" src=\"./assets/HUJI_LogoHeb_cont.jpg\" alt=\"קישור לאתר האוניברסיטה\">\r\n        </a>\r\n      </div>\r\n      <div class=\"col-12 col-sm-7 title-div\">\r\n        <h1 class=\"title\">\r\n          <span>\r\n            חישוב ממוצע הציונים בתעודת הבגרות\r\n          </span>\r\n        </h1>\r\n      </div>\r\n    </div>\r\n  </header>\r\n  <!--Accessibility -->\r\n  <div class=\"access\" tabindex=\"0\">\r\n    נגישות\r\n    <div class=\"access-menu\" [ngClass]=\"{'focused': isFocused}\">\r\n      <a (click)=\"toggleAccessibility(true); $event.preventDefault();\" href=\"#\" (focus)=\"isFocused = true\" (blur)=\"isFocused = false\">\r\n          ניגודיות גבוהה וסימון קישורים\r\n      </a>\r\n      <a class=\"cancel\" (click)=\"toggleAccessibility(false); $event.preventDefault();\" href=\"#\" (focus)=\"isFocused = true\" (blur)=\"isFocused = false\">\r\n          בטל נגישות\r\n      </a>\r\n    </div>\r\n  </div>\r\n  <!--Content-->\r\n  <div class=\"content\">\r\n    <app-chain-menu></app-chain-menu>\r\n    <main class=\"page\">\r\n      <!-- Router Outlet -->\r\n      <router-outlet></router-outlet>\r\n    </main>\r\n  </div>\r\n  <!--Footer-->\r\n  <div class=\"footer\">\r\n    <div class=\"row\">\r\n      <div class=\"col-9 col-sm-8 col-md-6 rights\">\r\n        <a href=\"https://new.huji.ac.il/copyrights\" target=\"_blank\">\r\n          {{currentYear}} © כל הזכויות שמורות לאוניברסיטה העברית בירושלים \r\n        </a>\r\n      </div>\r\n      <div class=\"col-3 col-sm-4 col-md-6 contact\">\r\n        <a href=\"https://new.huji.ac.il/צור-קשר\" target=\"_blank\">\r\n          צור קשר\r\n        </a>\r\n      </div>\r\n    </div>\r\n  </div>\r\n  <div class=\"last_mod\">Last Modified on  {{aDate | date: 'dd/MM/yyyy'}} 19:00</div>\r\n</div>\r\n<!-- <div class=\"loading\" *ngIf=\"!stateObject\">\r\n  <p-progressSpinner [style]=\"{width: '50px', height: '50px'}\" strokeWidth=\"4\" fill=\"#FFFFFF\" animationDuration=\"2s\"></p-progressSpinner>\r\n</div> -->"

/***/ }),

/***/ "./src/app/app.component.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return AppComponent; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("./node_modules/@angular/core/esm5/core.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__calculator_get_data_service__ = __webpack_require__("./src/app/calculator/get-data.service.ts");
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};


var AppComponent = /** @class */ (function () {
    function AppComponent(getData) {
        this.getData = getData;
        this.isFocused = false;
    }
    AppComponent.prototype.ngOnInit = function () {
        this.getStateObject();
        //get yesterday's date for Last Modified 
        this.aDate = new Date();
        this.aDate.setDate(this.aDate.getDate() - 1);
    };
    //get the stateObject
    AppComponent.prototype.getStateObject = function () {
        var _this = this;
        this.getData.getStateObject().subscribe(function (stateObject) {
            _this.stateObject = stateObject;
        });
    };
    Object.defineProperty(AppComponent.prototype, "currentYear", {
        get: function () {
            return new Date().getFullYear();
        },
        enumerable: true,
        configurable: true
    });
    //turn accessibility on or off
    AppComponent.prototype.toggleAccessibility = function (turnOn) {
        this.getData.toggleAccessibility(turnOn);
        this.isFocused = turnOn;
    };
    AppComponent = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Component"])({
            selector: 'app-root',
            template: __webpack_require__("./src/app/app.component.html"),
            styles: [__webpack_require__("./src/app/app.component.css")]
        }),
        __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_1__calculator_get_data_service__["a" /* GetDataService */]])
    ], AppComponent);
    return AppComponent;
}());



/***/ }),

/***/ "./src/app/app.module.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return AppModule; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_platform_browser__ = __webpack_require__("./node_modules/@angular/platform-browser/esm5/platform-browser.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_core__ = __webpack_require__("./node_modules/@angular/core/esm5/core.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__angular_forms__ = __webpack_require__("./node_modules/@angular/forms/esm5/forms.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__angular_http__ = __webpack_require__("./node_modules/@angular/http/esm5/http.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__app_component__ = __webpack_require__("./src/app/app.component.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__calculator_calculator_routing_module__ = __webpack_require__("./src/app/calculator/calculator-routing.module.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__calculator_chain_menu_chain_menu_component__ = __webpack_require__("./src/app/calculator/chain-menu/chain-menu.component.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__calculator_calc_type_calc_type_component__ = __webpack_require__("./src/app/calculator/calc-type/calc-type.component.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8__calculator_grade_input_grade_input_component__ = __webpack_require__("./src/app/calculator/grade-input/grade-input.component.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_9__calculator_calc_average_calc_average_component__ = __webpack_require__("./src/app/calculator/calc-average/calc-average.component.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_10_primeng_primeng__ = __webpack_require__("./node_modules/primeng/primeng.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_10_primeng_primeng___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_10_primeng_primeng__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_11__calculator_get_data_service__ = __webpack_require__("./src/app/calculator/get-data.service.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_12__calculator_result_alert_component__ = __webpack_require__("./src/app/calculator/result-alert.component.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_13__calculator_donut_donut_component__ = __webpack_require__("./src/app/calculator/donut/donut.component.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_14_ngx_bootstrap_tooltip__ = __webpack_require__("./node_modules/ngx-bootstrap/tooltip/index.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_15_ngx_bootstrap_alert__ = __webpack_require__("./node_modules/ngx-bootstrap/alert/index.js");
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};

















var AppModule = /** @class */ (function () {
    function AppModule() {
    }
    AppModule = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_1__angular_core__["NgModule"])({
            declarations: [
                __WEBPACK_IMPORTED_MODULE_4__app_component__["a" /* AppComponent */],
                __WEBPACK_IMPORTED_MODULE_6__calculator_chain_menu_chain_menu_component__["a" /* ChainMenuComponent */],
                __WEBPACK_IMPORTED_MODULE_7__calculator_calc_type_calc_type_component__["a" /* CalcTypeComponent */],
                __WEBPACK_IMPORTED_MODULE_8__calculator_grade_input_grade_input_component__["a" /* GradeInputComponent */],
                __WEBPACK_IMPORTED_MODULE_9__calculator_calc_average_calc_average_component__["a" /* CalcAverageComponent */],
                __WEBPACK_IMPORTED_MODULE_12__calculator_result_alert_component__["a" /* ResultAlertComponent */],
                __WEBPACK_IMPORTED_MODULE_13__calculator_donut_donut_component__["a" /* DonutComponent */]
            ],
            imports: [
                __WEBPACK_IMPORTED_MODULE_0__angular_platform_browser__["BrowserModule"],
                __WEBPACK_IMPORTED_MODULE_2__angular_forms__["ReactiveFormsModule"],
                __WEBPACK_IMPORTED_MODULE_2__angular_forms__["FormsModule"],
                __WEBPACK_IMPORTED_MODULE_3__angular_http__["c" /* HttpModule */],
                __WEBPACK_IMPORTED_MODULE_5__calculator_calculator_routing_module__["a" /* CalculatorRoutingModule */],
                __WEBPACK_IMPORTED_MODULE_10_primeng_primeng__["DropdownModule"],
                __WEBPACK_IMPORTED_MODULE_10_primeng_primeng__["AutoCompleteModule"],
                __WEBPACK_IMPORTED_MODULE_10_primeng_primeng__["ProgressSpinnerModule"],
                __WEBPACK_IMPORTED_MODULE_14_ngx_bootstrap_tooltip__["a" /* TooltipModule */].forRoot(), __WEBPACK_IMPORTED_MODULE_15_ngx_bootstrap_alert__["a" /* AlertModule */].forRoot()
            ],
            providers: [__WEBPACK_IMPORTED_MODULE_11__calculator_get_data_service__["a" /* GetDataService */]],
            bootstrap: [__WEBPACK_IMPORTED_MODULE_4__app_component__["a" /* AppComponent */]]
        })
    ], AppModule);
    return AppModule;
}());



/***/ }),

/***/ "./src/app/calculator/calc-average/calc-average.component.css":
/***/ (function(module, exports) {

module.exports = ".title {\r\n  margin-bottom: 10px;\r\n}\r\n\r\n.right-block>div {\r\n  /* width: 233px; */\r\n  max-width: 228px;\r\n}\r\n\r\n.graph-title {\r\n  font-size: 22px;\r\n  margin-top: -2px;\r\n}\r\n\r\n.graph {\r\n  margin-bottom: 45px;\r\n}\r\n\r\n/* .total,\r\n.graph-title {\r\n  text-align: center;\r\n  margin-right: -35px;\r\n} */\r\n\r\n.center-block {\r\n  margin-right: -6.5em;\r\n  padding-right: 26px;\r\n  border-right: 1px solid #e6e6e6;\r\n  font-size: 13px;\r\n}\r\n\r\n.center-block .row {\r\n  margin-bottom: 10px;\r\n}\r\n\r\n.not-included-title {\r\n  margin-top: 20px;\r\n}\r\n\r\n.based-on-title,\r\n.not-included-title {\r\n  font-size: 14px;\r\n  margin-right: -15px;\r\n}\r\n\r\n.square {\r\n  display: inline-block;\r\n  height: 13px;\r\n  width: 13px;\r\n  margin-left: 5px;\r\n}\r\n\r\n.name {\r\n  display: inline-block;\r\n}\r\n\r\n.grade {\r\n  margin-right: -2.3em\r\n}\r\n\r\n.sep {\r\n  margin-right: 5px;\r\n  font-weight: lighter;\r\n}\r\n\r\n.bonus {\r\n  font-weight: bold;\r\n  margin-right: -3.3em\r\n}\r\n\r\n.sub-title {\r\n  font-weight: bold;\r\n  text-align: content;\r\n  margin-bottom: 0px;\r\n}\r\n\r\n.left-block {\r\n  color: #fff;\r\n}\r\n\r\n.lnk {\r\n  width: 17em;\r\n}\r\n\r\n.lnk a {\r\n  display: block;\r\n  color: #fff;\r\n  width: 251px;\r\n  height: 130px;\r\n  margin-bottom: 14px;\r\n  background-size: 251px 130px;\r\n  background-repeat: no-repeat;\r\n  padding-left: 20px;\r\n  padding-top: 19px;\r\n}\r\n\r\n.lnk img.icon {\r\n  height: 45%;\r\n  position: absolute;\r\n  top: 10px;\r\n}\r\n\r\n.accept a {\r\n  background-image: url(\"data:image/png;base64,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\");\r\n}\r\n\r\n.mechina a {\r\n  background-image: url(\"data:image/png;base64,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\");\r\n}\r\n\r\n.faculty a {\r\n  background-image: url(\"data:image/png;base64,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\");\r\n}\r\n\r\n.accept a:hover {\r\n  background-image: url(\"data:image/png;base64,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\");\r\n}\r\n\r\n.mechina a:hover {\r\n  background-image: url(\"data:image/png;base64,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\");\r\n}\r\n\r\n.faculty a:hover {\r\n  background-image: url(\"data:image/png;base64,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\");\r\n}\r\n\r\n.text-content {\r\n  float: left;\r\n  width: 64%;\r\n}\r\n\r\n.main-content {\r\n  font-size: 16px;\r\n  font-weight: bold;\r\n}\r\n\r\n.secondary-content {\r\n  font-size: 12px;\r\n}\r\n\r\n.footer-text {\r\n  /* clear: both;\r\n    float: left;\r\n    font-size: 20px;\r\n    font-weight: 100;\r\n    padding-top: 35px; */\r\n  clear: both;\r\n  left: 0em;\r\n  font-size: 20px;\r\n  font-weight: 100;\r\n  padding-top: 3.9em;\r\n  position: absolute;\r\n}\r\n\r\n@media(min-width:1200px) {\r\n  .sub-title .name {\r\n    max-width: 80%;\r\n  }\r\n  .sub-title .square {\r\n    vertical-align: top;\r\n  }\r\n  .right-block>div {\r\n    padding: 10px;\r\n  }\r\n}\r\n\r\n@media(max-width:1199px) {\r\n  .center-block {\r\n    margin-right: -1.5em;\r\n  }\r\n  .center-block>.row {\r\n    margin-top: 9px;\r\n  }\r\n  .lnk a {\r\n    margin-right: -3.5em;\r\n  }\r\n}\r\n\r\n@media(max-width:991px) {\r\n  .left-block {\r\n    margin-top: 10px;\r\n  }\r\n  .lnk a {\r\n    margin-right: 0;\r\n  }\r\n  .footer-text {\r\n    left:3em;\r\n    padding-top:3.9em;\r\n  }\r\n}\r\n\r\n@media(max-width:767px) {\r\n  .left-block {\r\n    margin-right: 1em;\r\n  }\r\n  .center-block {\r\n    margin-right: 0;\r\n    border-right: none;\r\n    border-top: 1px solid #e6e6e6;\r\n    padding-top: 10px;\r\n  }\r\n  .footer-text {\r\n    left:0;\r\n    padding-top:3.9em;\r\n  }\r\n}\r\n\r\n@media(max-width:575px) {\r\n  .graph {\r\n    margin-right: -10px;\r\n  }\r\n  .grade,\r\n  .units,\r\n  .bonus {\r\n    margin-bottom: 0;\r\n    margin-right: 0;\r\n  }\r\n  .bonus {\r\n    margin-right: 0;\r\n  }\r\n  .lnk a {\r\n    background-size: 210px 108px;\r\n    width: 210px;\r\n    height: 108px;\r\n    margin-right: -1.7em;\r\n  }\r\n  .text-content {\r\n    margin-left: -10px;\r\n  }\r\n  .main-content {\r\n    font-size: 14px;\r\n  }\r\n  .secondary-content {\r\n    font-size: 11px;\r\n  }\r\n  /* .footer-text{\r\n        padding-top:20px;\r\n    } */\r\n  .based-on-title {\r\n    margin-right: 0;\r\n  }\r\n  .no-gutters {\r\n    margin-right: 0 !important;\r\n    margin-left: 0 !important;\r\n  }\r\n  .no-gutters>.col,\r\n  .no-gutters>[class*=\"col-\"] {\r\n    padding-right: 0;\r\n    padding-left: 0;\r\n  }\r\n  .footer-text {\r\n    left:2.4em;\r\n    padding-top:2.9em;\r\n  }\r\n}\r\n\r\n@media print {\r\n  .right-block,\r\n  .center-block {\r\n    max-width: 50%;\r\n    border-top: none;\r\n  }\r\n  .left-block {\r\n    display: none;\r\n  }\r\n  .based-on .name {\r\n    margin-right: -21px;\r\n  }\r\n  .units {\r\n    max-width: 27%;\r\n  }\r\n  .grade {\r\n    max-width: 25%;\r\n  }\r\n  .not-included-title {\r\n    margin-right: 0;\r\n  }\r\n}\r\n\r\n.show-access .lnk a {\r\n  background-image: none;\r\n  background-color: #000;\r\n  border: 1px solid #ffff00;\r\n}\r\n\r\n.show-access .footer-text {\r\n  text-decoration: underline;\r\n}\r\n"

/***/ }),

/***/ "./src/app/calculator/calc-average/calc-average.component.html":
/***/ (function(module, exports) {

module.exports = "<div class=\"row calc-average\" [ngClass]=\"{'show-access': stateObject.isAccessible}\" *ngIf=\"stateObject && stateObject.result\">\r\n  <!-- Graph -->\r\n  <div class=\"col-12 col-sm-12 col-md-6 col-lg-4 col-xl-4 right-block\">\r\n    <div>\r\n      <div class=\"graph\">\r\n        <div class=\"graph-title title\" tabindex=\"0\" attr.aria-label=\"הממוצע שלך הוא\">\r\n          הממוצע שלך הוא:\r\n        </div>\r\n        <div class=\"chart\">\r\n          <div style=\"display: block\">\r\n            <div style=\"width:15em;height:15em\">\r\n              <app-donut [items]=\"stateObject.result.SubjectsInAverage\" [radius]=\"20\" [width]=\"6\" [fontSize]=\"13\" [colorArray]=\"color\" \r\n                [fontColor]=\"stateObject.isAccessible ? '#ffff00' : '#666666'\" [average]=\"stateObject.result.MarkAverage\"></app-donut>\r\n            </div>\r\n          </div>\r\n        </div>\r\n      </div>\r\n      <div class=\"total\">\r\n        סה\"כ מס' מקצועות בחישוב: {{stateObject.result.SubjectsInAverage.length}}\r\n      </div>\r\n      <div class=\"total\">\r\n        סה\"כ מס' יחידות בחישוב: {{totalUnits}}\r\n      </div>\r\n      <br>\r\n      <!-- <div>\r\n        לבדיקת סיכויי הקבלה יש לחלק את ממוצע התוצאה ב-10, לדוגמה 105 יהפך ל-10.5\r\n      </div> -->\r\n    </div>\r\n  </div>\r\n  <!-- Distribution -->\r\n  <div class=\"col-12 col-sm-12 col-md-6 col-lg-5 col-xl-5 center-block\">\r\n    <div class=\"based-on-title title\">\r\n      הממוצע המיטבי חושב על בסיס:\r\n    </div>\r\n    <div *ngFor=\"let subject of stateObject.result.SubjectsInAverage; let i=index\" class=\"row no-gutters based-on\">\r\n      <div class=\"col-12 col-md-12 col-xl-5 sub-title\">\r\n        <span class=\"square\" [style.background-color]=\"color[i]\"></span>\r\n        <span class=\"name\">\r\n         {{subject.SubjectName}}\r\n         <span *ngIf=\"subject.IsProject\">(ע)</span>\r\n        </span>       \r\n      </div>\r\n      <div class=\"col-4 col-sm-3 col-md-4 col-xl-3 units\">\r\n        {{subject.Points}} יחידות\r\n        <span class=\"sep\"> | </span>\r\n      </div>\r\n      <div class=\"col-4 col-sm-3 col-md-4 col-xl-3 grade\">\r\n        ציון: {{subject.Grade}}\r\n      </div>\r\n      <div *ngIf=\"subject.Bonus > 0\" class=\"col-4 col-sm-3 col-md-4 col-xl-3 bonus\">\r\n        בונוס: {{subject.Bonus}}\r\n      </div>\r\n    </div>\r\n    <div *ngIf=\"stateObject.result.SubjectsUnused.length > 0\">\r\n      <div class=\"not-included-title title\">\r\n        מקצועות שלא נכללו בשקלול:\r\n      </div>\r\n      <div div *ngFor=\"let subject of stateObject.result.SubjectsUnused; let i=index\" class=\"row no-gutters\">\r\n        <div class=\"col-12 col-xl-5 sub-title\">\r\n          <span class=\"name\">\r\n         {{subject.SubjectName}} \r\n         <span *ngIf=\"subject.IsProject\">(ע)</span>\r\n        </span>\r\n        </div>\r\n        <div class=\"col-4 col-sm-3 col-md-4 col-xl-3 units\">\r\n          {{subject.Points}} יחידות\r\n          <span class=\"sep\"> | </span>\r\n        </div>\r\n        <div class=\"col-4 col-sm-3 col-md-4 col-xl-3 grade\">\r\n          ציון: {{subject.Grade}}\r\n        </div>\r\n        <div *ngIf=\"subject.Bonus > 0\" class=\"col-4 col-sm-3 col-md-4 col-xl-3 bonus\">\r\n          בונוס: {{subject.Bonus}}\r\n        </div>\r\n      </div>\r\n    </div>\r\n  </div>\r\n  <!-- Buttons -->\r\n  <div class=\"col-12 col-sm-12 col-md-12 col-lg-3 col-xl-3 left-block\">\r\n    <div class=\"row\">\r\n      <div class=\"accept lnk col-md-6 col-lg-12\">\r\n        <a href=\"https://go.huji.ac.il/\" target=\"_blank\">\r\n          <img class=\"icon\" src=\"assets/icn-accept.png\" alt=\"קישור לאתר בדיקת סיכויי קבלה\" />\r\n          <div class=\"text-content\">\r\n            <div class=\"main-content\">\r\n              בדיקת סיכויי קבלה\r\n            </div>\r\n            <div class=\"secondary-content\">\r\n              בדוק את סיכויי הקבלה במחשבון\r\n            </div>\r\n          </div>\r\n          <div class=\"footer-text\">\r\n            לבדיקה >\r\n          </div>\r\n        </a>\r\n      </div>\r\n      <div class=\"mechina lnk col-md-6 col-lg-12\">\r\n        <a href=\"https://mechina.huji.ac.il/\" target=\"_blank\">\r\n          <img class=\"icon\" src=\"assets/icn-mechina.png\" alt=\"קישור לאתר המכינה\"/>\r\n          <div class=\"text-content\">\r\n            <div class=\"main-content\">\r\n              רוצה לשפר ציונים?\r\n            </div>\r\n            <div class=\"secondary-content\">\r\n              המכינה היא המקום בשבילך\r\n            </div>\r\n          </div>\r\n          <div class=\"footer-text\">\r\n            למכינה >\r\n          </div>\r\n        </a>\r\n      </div>\r\n      <div class=\"faculty lnk col-md-6 col-lg-12\">\r\n        <a href=\"http://info.huji.ac.il/\" target=\"_blank\">\r\n          <img class=\"icon\" src=\"assets/icn-faculty.png\" alt=\"קישור להרשמה לאוניברסיטה\"/>\r\n          <div class=\"text-content\">\r\n            <div class=\"main-content\">\r\n              הפקולטה מחכה לך!\r\n            </div>\r\n            <div class=\"secondary-content\">\r\n              <!-- הרישום לשנת {{topYear}} בעיצומו! -->\r\n              {{registrationMsg}}\r\n            </div>\r\n          </div>\r\n          <div class=\"footer-text\">\r\n            להרשמה >\r\n          </div>\r\n        </a>\r\n      </div>\r\n    </div>\r\n  </div>\r\n</div>"

/***/ }),

/***/ "./src/app/calculator/calc-average/calc-average.component.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return CalcAverageComponent; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("./node_modules/@angular/core/esm5/core.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__get_data_service__ = __webpack_require__("./src/app/calculator/get-data.service.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__angular_router__ = __webpack_require__("./node_modules/@angular/router/esm5/router.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_rxjs_Rx__ = __webpack_require__("./node_modules/rxjs/_esm5/Rx.js");
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};




var CalcAverageComponent = /** @class */ (function () {
    function CalcAverageComponent(getData, router) {
        this.getData = getData;
        this.router = router;
        //define colors for the donut chart
        this.color = ["#1C5160", "#277489", "#38A3C1", "#45CAEF", "#A1DCED", "#023832", "#05776C", "#08A596", "#0ACCB8", "#70FFEE", "#4A4C3D", "#7E8167",
            "#9DA082", "#C7CCA5", "#F9FFCE", "#2D171C", "#63333E", "#A8576A", "#F27D99", "#3D090F", "#7F1420", "#C61F33", "#EF263D"];
    }
    CalcAverageComponent.prototype.ngOnInit = function () {
        this.getStateObject();
        window.scrollTo(0, 0);
    };
    //retrieve the state of the app
    CalcAverageComponent.prototype.getStateObject = function () {
        var _this = this;
        __WEBPACK_IMPORTED_MODULE_3_rxjs_Rx__["a" /* Observable */].combineLatest([this.getData.getStateObject(), this.getData.getRegistrationMessage()])
            .subscribe(function (data) {
            _this.stateObject = data[0];
            //if we got here by simply entering the url, redirect to first page
            if (_this.stateObject.step < __WEBPACK_IMPORTED_MODULE_1__get_data_service__["b" /* Steps */].CalcAverage) {
                _this.router.navigateByUrl('/grade-input');
                return;
            }
            _this.getSubjectNames();
            _this.registrationMsg = data[1];
        });
        // this.getData.getStateObject().subscribe((stateObject) => {
        //   this.stateObject = stateObject;
        //   //if we got here by simply entering the url, redirect to first page
        //   if (this.stateObject.step < Steps.CalcAverage) {
        //     this.router.navigateByUrl('/grade-input');
        //     return;
        //   }
        //   this.getSubjectNames();
        // });
    };
    Object.defineProperty(CalcAverageComponent.prototype, "totalUnits", {
        //add up all the units/points included in the calculation
        get: function () {
            return this.stateObject.result.SubjectsInAverage.map(function (x) { return x.Points; }).reduce(function (x, y) { return x + y; });
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CalcAverageComponent.prototype, "topYear", {
        //get the maximum year from the available years to display in the Faculty button
        get: function () {
            return Math.max.apply(null, this.stateObject.years.map(function (x) { return x.value.name; }));
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CalcAverageComponent.prototype, "notIncluded", {
        //get the subjects which weren't included in the calculation
        get: function () {
            var found;
            var notIncluded = [];
            for (var i = 0; i < this.stateObject.selectedSubjects.length; i++) {
                found = false;
                for (var j = 0; j < this.stateObject.result.SubjectsInAverage.length; j++) {
                    if (this.stateObject.selectedSubjects[i].id === this.stateObject.result.SubjectsInAverage[j].SubjectID &&
                        this.stateObject.selectedSubjects[i].units === this.stateObject.result.SubjectsInAverage[j].Points &&
                        this.stateObject.selectedSubjects[i].isPaper === this.stateObject.result.SubjectsInAverage[j].IsProject) {
                        found = true;
                        break;
                    }
                }
                if (!found)
                    notIncluded.push({ SubjectName: this.stateObject.selectedSubjects[i].name, Points: this.stateObject.selectedSubjects[i].units, Grade: this.stateObject.selectedSubjects[i].grade });
            }
            return notIncluded;
        },
        enumerable: true,
        configurable: true
    });
    //since the result does not include subject names, retrieve them from our stateObject
    CalcAverageComponent.prototype.getSubjectNames = function () {
        this.getData.getSubjectNames(this.stateObject.result.SubjectsInAverage, true);
        this.getData.getSubjectNames(this.stateObject.result.SubjectsUnused, true);
    };
    //since the bonus does not come separately and instead is added to the final grade (in the returned result), caluclate it in order to display it on its own
    CalcAverageComponent.prototype.getsubjectBonus = function (index) {
        var bonus = this.stateObject.result.SubjectsInAverage[index];
        return bonus.GradeWithBonus > 0 ? bonus.GradeWithBonus - bonus.Grade : 0;
    };
    CalcAverageComponent = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Component"])({
            selector: 'app-calc-average',
            template: __webpack_require__("./src/app/calculator/calc-average/calc-average.component.html"),
            styles: [__webpack_require__("./src/app/calculator/calc-average/calc-average.component.css")]
        }),
        __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_1__get_data_service__["a" /* GetDataService */], __WEBPACK_IMPORTED_MODULE_2__angular_router__["Router"]])
    ], CalcAverageComponent);
    return CalcAverageComponent;
}());



/***/ }),

/***/ "./src/app/calculator/calc-type/calc-type.component.css":
/***/ (function(module, exports) {

module.exports = ".instructions {\r\n    margin-bottom: 1rem;\r\n    font-size:0.97em;\r\n}\r\n.row {\r\n    margin-bottom: 20px;\r\n}\r\n.title span{\r\n    color: #999999;\r\n    margin-bottom:3px;\r\n    font-size: 0.85em;\r\n    font-weight: normal;\r\n}\r\n.title i {\r\n    color: #01544C;\r\n}\r\n.explain {\r\n    margin-top:5px;\r\n}\r\n.explain a{\r\n    color: #00A196;\r\n    font-weight: bold;\r\n}\r\n.btn-show {\r\n    background-color: #00A196;\r\n    color: #fff;\r\n}\r\n.btn-show:hover, .btn-show:focus {\r\n    color: #fff;\r\n    background-color: #25746E;\r\n}\r\n.ddl .ui-state-highlight{\r\n    background-color: #CCECEA;\r\n    float:right;\r\n}\r\n/* dropdown */\r\n.btn-group{\r\n    width:100%;\r\n}\r\n.btn-group > .btn {\r\n    float: right;\r\n}\r\n.btn {\r\n    border-radius: 4px;\r\n    display: inline-block;\r\n    font-size: 14px;\r\n    line-height: 1.42857;\r\n    margin-bottom: 0;\r\n    padding: 6px 12px;\r\n    font-family: \"Open Sans Hebrew\",sans-serif;\r\n}\r\n.dropdown-toggle, .toggle-main {\r\n    border: 1px solid #d6d6d6;\r\n    background: #fff;\r\n    color: #222;\r\n    padding-top:6px;\r\n    line-height: 1.25;\r\n    border-radius: 4px !important; \r\n }\r\n.dropdown-toggle{\r\n    border-top-right-radius: 0px !important;\r\n    border-bottom-right-radius: 0px !important;\r\n    border-right: 0px;\r\n    font-size: 15px;\r\n}\r\n.toggle-main {\r\n    border-top-left-radius: 0px !important;\r\n    border-bottom-left-radius: 0px !important;\r\n    width:83%;\r\n}\r\n.dropdown-toggle:hover, .dropdown-toggle:focus, .show > .btn-secondary.dropdown-toggle, .toggle-main:hover, .toggle-main:focus{\r\n    background-color:#fff;\r\n    border-color: #c0c0c0;\r\n    color: #222;\r\n}\r\n.dropdown-toggle:focus {\r\n    -webkit-box-shadow: 0 0 5px #1f78ce;\r\n            box-shadow: 0 0 5px #1f78ce;\r\n}\r\n.dropdown-menu{\r\n    right:0;\r\n    left: auto;\r\n    text-align: right;\r\n    text-indent: 5px;\r\n    padding: 2px 0;\r\n    float: right;\r\n    font-size:14px;\r\n    border-radius: 4px;\r\n    min-width:98%;\r\n}\r\n.dropdown-item{\r\n    padding:4px 6px;\r\n    text-align: right;\r\n}\r\n.dropdown-item:active{\r\n    color: #222;\r\n}\r\n.dropdown-item:hover{\r\n    background-color: #fff;\r\n}\r\n.dropdown-item span {\r\n    display: block;\r\n    border-radius: 4px;\r\n }\r\n.dropdown-item:hover span, .dropdown-item.selected span,  .dropdown-item:focus span{\r\n     background-color:  #CCECEA;\r\n }\r\n.btn-show{\r\n    font-family: \"Open Sans Hebrew\",sans-serif;\r\n }\r\n/* accessibility style*/\r\n.show-access, .show-access a, .show-access span, .show-access i, .show-access button{\r\n    color: #FFFF00 !important;\r\n}\r\n.show-access{\r\n    background-color: #000 !important;\r\n    background-image: none;\r\n}\r\n.show-access a{\r\n    text-decoration: underline;\r\n}\r\n.show-access button {\r\n    border-color: #FFFF00 !important;\r\n    background-color: #000 !important;\r\n}\r\n.show-access .dropdown-toggle:focus{    \r\n     -webkit-box-shadow: 0 0 10px #FFFF00;    \r\n             box-shadow: 0 0 10px #FFFF00;\r\n }\r\n.show-access .dropdown-menu{\r\n    background-color: #000;\r\n    border-color: #FFFF00 !important;\r\n}\r\n.show-access .dropdown-item, .show-access .dropdown-item:hover, .show-access .dropdown-item:focus span {\r\n    background-color: #000;\r\n    text-decoration: none;\r\n}\r\n.show-access .dropdown-item:hover span, .show-access .dropdown-item.selected span{\r\n    color: #c94e02 !important;\r\n    background-color: #000;\r\n }\r\n.show-access .btn-show:focus{\r\n     -webkit-box-shadow: 0 0 10px #FFFF00;\r\n             box-shadow: 0 0 10px #FFFF00;\r\n }\r\n\r\n\r\n\r\n\r\n\r\n\r\n"

/***/ }),

/***/ "./src/app/calculator/calc-type/calc-type.component.html":
/***/ (function(module, exports) {

module.exports = "<div [ngClass]=\"{'show-access': stateObject.isAccessible}\">\r\n  <!-- Information -->\r\n  <div class=\"row instructions\">\r\n    <div class=\"col-12 col-sm-12\">\r\n      <span>\r\n         ממוצע הבגרות מחושב על בסיס מקצועות חובה, חליפיים ובחירה, בהתאם למגזר הבגרות ושנת ההרשמה. \r\n         <br>\r\n         ממוצע הבגרויות המחושב הוא ממוצע אופטימלי בו יבחרו מקצועות בחירה שישפרו את הממוצע.\r\n      </span>\r\n    </div>\r\n    <div class=\"col-12 col-sm-12\">\r\n      <span>\r\n         הממוצע הקובע הוא הממוצע המחושב במשרדי הרישום והקבלה.\r\n      </span>\r\n    </div>\r\n    <div class=\"col-12 col-sm-12 explain\">\r\n      <a href=\"https://info.huji.ac.il/reception-components/Bagrut?cat=408&in=394\" target=\"_blank\">\r\n        להסבר מפורט על אופן חישוב הבגרות\r\n      </a>\r\n    </div>\r\n  </div>\r\n  <div class=\"row align-items-end\">\r\n    <!-- Years -->\r\n    <div class=\"col-12 col-sm-6 col-md-5 col-xl-3\"  *ngIf=\"!environment.useCurrentYear\">\r\n      <div class=\"ddl-block\">\r\n        <div class=\"title\">\r\n          <span>\r\n              שנת הרשמה \r\n            </span>\r\n          <i class=\"fa fa-question-circle\" tooltip=\"יש להזין את שנת הלימודים האקדמית אליה אתה מעוניין להירשם.\" placement=\"top\" customClass=\"atooltip\"\r\n            container=\"body\"></i>\r\n        </div>\r\n        <div class=\"btn-group\">\r\n          <button type=\"button\" class=\"btn toggle-main\" tabindex=\"-1\">{{stateObject.selectedYear? stateObject.selectedYear.label: \"השנה אליה תרצה להרשם\"}}</button>\r\n          <button type=\"button\" class=\"btn dropdown-toggle dropdown-toggle-split\" data-toggle=\"dropdown\" aria-haspopup=\"true\" aria-expanded=\"false\"\r\n            aria-label=\"שנת הרשמה\">\r\n            <span class=\"sr-only\">Toggle Dropdown</span>\r\n          </button>\r\n          <div class=\"dropdown-menu\">\r\n            <a class=\"dropdown-item\" href=\"#\" *ngFor=\"let year of stateObject.years\" (click)=\"onSelectYear(year); $event.preventDefault()\"\r\n              [ngClass]=\"{'selected': year===stateObject.selectedYear}\"><span>{{year.label}}</span></a>\r\n          </div>\r\n        </div>\r\n      </div>\r\n    </div>\r\n    <!-- Sectors -->\r\n    <div class=\"col-12 col-sm-6 col-md-4 col-xl-3\">\r\n      <div class=\"ddl-block\">\r\n        <div class=\"title\">\r\n          <span>\r\n              מגזר\r\n            </span>\r\n          <i class=\"fa fa-question-circle\" tooltip=\"מקצועות החובה נקבעים בהתאם למגזר הבגרות. יש להזין את המגזר אליו משויכים מקצועות הבגרות שנלמדו.\"\r\n            placement=\"top\" container=\"body\"></i>\r\n        </div>\r\n        <div class=\"btn-group\">\r\n          <button type=\"button\" class=\"btn toggle-main\" [disabled]=\"!stateObject.selectedYear\" tabindex=\"-1\">\r\n            {{stateObject.selectedSector? stateObject.selectedSector.label: \"מגזר תעודת הבגרות\"}}\r\n          </button>\r\n          <button type=\"button\" class=\"btn dropdown-toggle dropdown-toggle-split\" data-toggle=\"dropdown\" aria-haspopup=\"true\" aria-expanded=\"false\"\r\n            aria-label=\"מגזר תעודת הבגרות\" [disabled]=\"!stateObject.selectedYear\">\r\n            <span class=\"sr-only\">Toggle Dropdown</span>\r\n          </button>\r\n          <div class=\"dropdown-menu\">\r\n            <a class=\"dropdown-item\" href=\"#\" *ngFor=\"let sector of stateObject.sectors\" (click)=\"onSelectSector(sector); $event.preventDefault()\"\r\n              [ngClass]=\"{'selected': sector===stateObject.selectedSector}\"><span>{{sector.label}}</span></a>\r\n          </div>\r\n        </div>\r\n      </div>\r\n    </div>\r\n    <!-- Display Subjects -->\r\n    <div class=\"col-12 col-sm-4 col-md-2 col-xl-3\">\r\n      <button class=\"btn btn-show\" [disabled]=\"!stateObject.selectedYear || !stateObject.selectedSector\" (click)=\"onClick()\">הצג מקצועות</button>\r\n    </div>\r\n  </div>\r\n</div>\r\n"

/***/ }),

/***/ "./src/app/calculator/calc-type/calc-type.component.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return CalcTypeComponent; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__environments_environment__ = __webpack_require__("./src/environments/environment.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_core__ = __webpack_require__("./node_modules/@angular/core/esm5/core.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__get_data_service__ = __webpack_require__("./src/app/calculator/get-data.service.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__angular_router__ = __webpack_require__("./node_modules/@angular/router/esm5/router.js");
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};




var CalcTypeComponent = /** @class */ (function () {
    function CalcTypeComponent(getData, router) {
        this.getData = getData;
        this.router = router;
        this.environment = __WEBPACK_IMPORTED_MODULE_0__environments_environment__["a" /* environment */];
    }
    CalcTypeComponent.prototype.ngOnInit = function () {
        this.getStateObject();
    };
    //retrieve the state of the app
    CalcTypeComponent.prototype.getStateObject = function () {
        var _this = this;
        this.getData.getStateObject().subscribe(function (stateObject) {
            _this.stateObject = stateObject;
        });
    };
    //get the sectors according to the selected year
    CalcTypeComponent.prototype.getSectors = function () {
        this.getData.getSectors(Number(this.stateObject.selectedYear.value.name));
    };
    //event: a year was selected from the dropdown, so update the stateObject and populate the Sectors dropdown
    CalcTypeComponent.prototype.onSelectYear = function (value) {
        this.stateObject.step = __WEBPACK_IMPORTED_MODULE_2__get_data_service__["b" /* Steps */].CalcType;
        this.stateObject.selectedYear = value;
        this.getSectors();
        return false;
    };
    //event: a sector was selected from the dropdown so update the stateObject
    CalcTypeComponent.prototype.onSelectSector = function (value) {
        //since allSubjects is cached, make sure to clear its values before retrieving them again since the data has changed
        this.stateObject.allSubjects = null;
        this.getData.getAllSubjects(); //get the allSubjects list now (to get a head-start)
        //since selectedSubjects is cached, make sure to clear its values before retrieving them again later, because the data has changed
        this.stateObject.selectedSubjects = null;
        this.stateObject.step = __WEBPACK_IMPORTED_MODULE_2__get_data_service__["b" /* Steps */].CalcType;
        this.stateObject.selectedSector = value;
    };
    //event: the Display Subjects button was clicked, so update the stateObject and navigate to the next page
    CalcTypeComponent.prototype.onClick = function () {
        this.stateObject.step = __WEBPACK_IMPORTED_MODULE_2__get_data_service__["b" /* Steps */].GradeInput;
        this.router.navigateByUrl('/grade-input');
    };
    CalcTypeComponent = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_1__angular_core__["Component"])({
            selector: 'app-calc-type',
            template: __webpack_require__("./src/app/calculator/calc-type/calc-type.component.html"),
            styles: [__webpack_require__("./src/app/calculator/calc-type/calc-type.component.css")],
        }),
        __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_2__get_data_service__["a" /* GetDataService */], __WEBPACK_IMPORTED_MODULE_3__angular_router__["Router"]])
    ], CalcTypeComponent);
    return CalcTypeComponent;
}());



/***/ }),

/***/ "./src/app/calculator/calculator-routing.module.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return CalculatorRoutingModule; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("./node_modules/@angular/core/esm5/core.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_router__ = __webpack_require__("./node_modules/@angular/router/esm5/router.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__calc_type_calc_type_component__ = __webpack_require__("./src/app/calculator/calc-type/calc-type.component.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__grade_input_grade_input_component__ = __webpack_require__("./src/app/calculator/grade-input/grade-input.component.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__calc_average_calc_average_component__ = __webpack_require__("./src/app/calculator/calc-average/calc-average.component.ts");
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};





var routes = [
    { path: 'calc-type', component: __WEBPACK_IMPORTED_MODULE_2__calc_type_calc_type_component__["a" /* CalcTypeComponent */] },
    { path: 'grade-input', component: __WEBPACK_IMPORTED_MODULE_3__grade_input_grade_input_component__["a" /* GradeInputComponent */] },
    { path: 'calc-average', component: __WEBPACK_IMPORTED_MODULE_4__calc_average_calc_average_component__["a" /* CalcAverageComponent */] },
    { path: '', redirectTo: '/calc-type', pathMatch: 'full' }
];
var CalculatorRoutingModule = /** @class */ (function () {
    function CalculatorRoutingModule() {
    }
    CalculatorRoutingModule = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["NgModule"])({
            imports: [__WEBPACK_IMPORTED_MODULE_1__angular_router__["RouterModule"].forRoot(routes, { useHash: true })],
            exports: [__WEBPACK_IMPORTED_MODULE_1__angular_router__["RouterModule"]],
            providers: []
        })
    ], CalculatorRoutingModule);
    return CalculatorRoutingModule;
}());



/***/ }),

/***/ "./src/app/calculator/chain-menu/chain-menu.component.css":
/***/ (function(module, exports) {

module.exports = "\r\n.round-button {\r\n\twidth:8%;\r\n\tfloat:right;\r\n    -webkit-box-sizing: initial !important;\r\n            box-sizing: initial !important;\r\n\tcolor: #666666; \r\n}\r\n.round-button-circle {\r\n\twidth: 100%;\r\n\theight:0;\r\n\tpadding-bottom: 100%;\r\n    border-radius: 50%;\r\n\tborder:0.06rem solid #666666;\r\n    overflow:hidden;   \r\n    -webkit-box-shadow: 0 0 3px gray;   \r\n            box-shadow: 0 0 3px gray;\r\n\t-webkit-box-sizing: unset !important;\r\n\t        box-sizing: unset !important;\r\n}\r\n.round-button a {\r\n    display:block;\r\n\tfloat:left;\r\n\twidth:100%;\r\n\tpadding-top:50%;\r\n    padding-bottom:50%;\r\n\tline-height:1rem;\r\n\tmargin-top:-0.5rem; \r\n\ttext-align:center;\r\n\tcolor:#666666;\r\n    font-family:Verdana;\r\n    font-size:0.7rem;\r\n    text-decoration:none;\r\n}\r\n.between {\r\n\tborder: none;\r\n    height: 1px;\r\n\tfloat: right;\r\n\twidth: 29%;\r\n\tmargin-top:4%;\r\n\tmargin-right:4px;\r\n\tfont-weight: normal;\r\n\tbackground-color: #333\r\n}\r\n.button-text{\r\n\tfont-size: 0.56rem;\r\n\twidth: 4.5rem;\r\n\tmargin-right: -1.3rem;\r\n}\r\n.checked .round-button-circle{\r\n\tbackground-color: #E3D6DF;\r\n\tborder-color: #75325D;\r\n}\r\n.checked .round-button-circle i{\r\n\tcolor: #75325D;\r\n}\r\n.checked .button-text{\r\n\tcolor: #75325D; \r\n}\r\n.on-page .round-button-circle{\r\n    background: #75325D; \r\n\tborder-color: #75325D;\r\n}\r\n.on-page .round-button-circle a{\r\n\tcolor: #fff;\r\n}\r\n.back-on-page .button-text{\r\n\tcolor: #75325D; \r\n\tfont-weight: bold;\r\n}\r\n@media(max-width:1200px){\r\n\t.between {\r\n\t\tmargin-right: 2px;\r\n\t}\r\n}\r\n@media(max-width:575px){\r\n\t.round-button {\r\n\t\twidth:10%;\r\n\t\tmin-width:24px\r\n\t}\r\n\ta.round-button {\r\n\t\tline-height: 1.3em !important;\r\n\t}\r\n\t.between {\r\n\t\tmargin-top: 5.5%;\r\n\t}\r\n}\r\n@media print {\r\n    .chain-menu {\r\n       display: none;\r\n    }\r\n}\r\n.show-access, .show-access .round-button-circle, .show-access .round-button-circle i, .show-access a, .show-access .button-text{\r\n    color: #FFFF00 !important;\r\n\tborder-color: #FFFF00 !important;\r\n    background-color: #000 !important;\r\n}\r\n.show-access .between{\r\n\tborder: 1px solid #FFFF00 !important;\r\n\tbackground-color: #FFFF00 !important;\r\n\twidth:28%;\r\n}\r\n.show-access .round-button-circle a:focus span{\r\n\tborder: 2px solid #26487F;\r\n}"

/***/ }),

/***/ "./src/app/calculator/chain-menu/chain-menu.component.html":
/***/ (function(module, exports) {

module.exports = "<nav>\r\n  <div class=\"row justify-content-center chain-menu\" [ngClass]=\"{'show-access': stateObject.isAccessible}\">\r\n    <div class=\"col-9 col-sm-8 col-md-6\">\r\n      <div class=\"round-button\" [ngClass]=\"{'on-page': isCalcType, 'checked':!isCalcType, 'back-on-page': currentNav == '/calc-type'}\">\r\n        <div class=\"round-button-circle\">\r\n          <a routerLink=\"/calc-type\" routerLinkActive=\"active\" class=\"round-button\" aria-label=\"תפריט ראשי דף 1 - בחירת סוג בגרות\">\r\n            <span *ngIf=\"stateObject.step === steps.CalcType\">       \r\n              1\r\n            </span>\r\n            <span *ngIf=\"stateObject.step > steps.CalcType\">       \r\n              <i class=\"fa fa-check\" aria-hidden=\"true\"></i>\r\n            </span>\r\n          </a>\r\n        </div>\r\n        <div class=\"button-text\">\r\n          בחירת סוג בגרות\r\n        </div>\r\n      </div>\r\n      <hr class=\"between\">\r\n      <div class=\"round-button\" [ngClass]=\"{'on-page': isGradeInput, 'checked':stateObject.step > steps.GradeInput, 'back-on-page': currentNav == '/grade-input'}\">\r\n        <div class=\"round-button-circle\">\r\n          <a *ngIf=\"stateObject.step >= steps.GradeInput\" routerLink=\"/grade-input\" routerLinkActive=\"active\" class=\"round-button\" aria-label=\"תפריט ראשי דף 2 - הזנת ציוני בגרות\">\r\n            <span *ngIf=\"stateObject.step <= steps.GradeInput\">       \r\n              2\r\n            </span>\r\n          <span *ngIf=\"stateObject.step > steps.GradeInput\">       \r\n            <i class=\"fa fa-check\" aria-hidden=\"true\"></i>\r\n          </span>\r\n          </a>\r\n          <a *ngIf=\"stateObject.step < steps.GradeInput\" class=\"round-button\">\r\n            <span *ngIf=\"stateObject.step <= steps.GradeInput\">       \r\n             2\r\n            </span>\r\n          </a>\r\n        </div>\r\n        <div class=\"button-text\">\r\n          הזנת ציוני בגרות\r\n        </div>\r\n      </div>\r\n      <hr class=\"between\">\r\n      <div class=\"round-button\" [ngClass]=\"{'on-page': isCalcAverage , 'checked': isCalcAverage && currentNav != '/calc-average', 'back-on-page': currentNav == '/calc-average'}\">\r\n        <div class=\"round-button-circle\">\r\n          <a *ngIf=\"stateObject.step === steps.CalcAverage\" routerLink=\"/calc-average\" routerLinkActive=\"active\" class=\"round-button\"  aria-label=\"תפריט ראשי דף 3 - הצגת ציון משוקלל\">\r\n            <span *ngIf=\"stateObject.step === steps.CalcAverage\">       \r\n             3\r\n            </span>\r\n          </a>\r\n          <a *ngIf=\"stateObject.step < steps.CalcAverage\" class=\"round-button\">\r\n            <span *ngIf=\"stateObject.step <= steps.CalcAverage\">       \r\n              3\r\n            </span>\r\n          </a>\r\n        </div>\r\n        <div class=\"button-text\">\r\n          הצגת ציון משוקלל\r\n        </div>\r\n      </div>\r\n    </div>\r\n  </div>\r\n</nav>"

/***/ }),

/***/ "./src/app/calculator/chain-menu/chain-menu.component.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return ChainMenuComponent; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("./node_modules/@angular/core/esm5/core.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__get_data_service__ = __webpack_require__("./src/app/calculator/get-data.service.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__angular_router__ = __webpack_require__("./node_modules/@angular/router/esm5/router.js");
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};



var ChainMenuComponent = /** @class */ (function () {
    function ChainMenuComponent(getData, router) {
        var _this = this;
        this.getData = getData;
        this.router = router;
        this.steps = __WEBPACK_IMPORTED_MODULE_1__get_data_service__["b" /* Steps */];
        router.events.subscribe(function (nav) {
            _this.currentNav = nav.url;
        });
    }
    ChainMenuComponent.prototype.ngOnInit = function () {
        this.getStateObject();
    };
    //get the state of the app
    ChainMenuComponent.prototype.getStateObject = function () {
        var _this = this;
        this.getData.getStateObject().subscribe(function (stateObject) {
            _this.stateObject = stateObject;
        });
    };
    Object.defineProperty(ChainMenuComponent.prototype, "isCalcType", {
        //return true if the page we're on is calc-type
        get: function () {
            return this.stateObject.step === __WEBPACK_IMPORTED_MODULE_1__get_data_service__["b" /* Steps */].CalcType;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ChainMenuComponent.prototype, "isGradeInput", {
        //return true if the page we're on is grade-input
        get: function () {
            return this.stateObject.step === __WEBPACK_IMPORTED_MODULE_1__get_data_service__["b" /* Steps */].GradeInput;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ChainMenuComponent.prototype, "isCalcAverage", {
        //return true if the page we're on is calc-average
        get: function () {
            return this.stateObject.step === __WEBPACK_IMPORTED_MODULE_1__get_data_service__["b" /* Steps */].CalcAverage;
        },
        enumerable: true,
        configurable: true
    });
    ChainMenuComponent = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Component"])({
            selector: 'app-chain-menu',
            template: __webpack_require__("./src/app/calculator/chain-menu/chain-menu.component.html"),
            styles: [__webpack_require__("./src/app/calculator/chain-menu/chain-menu.component.css")]
        }),
        __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_1__get_data_service__["a" /* GetDataService */], __WEBPACK_IMPORTED_MODULE_2__angular_router__["Router"]])
    ], ChainMenuComponent);
    return ChainMenuComponent;
}());



/***/ }),

/***/ "./src/app/calculator/donut/donut.component.css":
/***/ (function(module, exports) {

module.exports = ".outline {\r\n    opacity:0;\r\n} \r\n.atooltip {\r\n    display:block; \r\n    width:190px; \r\n    text-align:center; \r\n    margin-top:-10px; \r\n    font-size:12px;\r\n} \r\n.atooltip:hover {\r\n    overflow: hidden\r\n}\r\n"

/***/ }),

/***/ "./src/app/calculator/donut/donut.component.html":
/***/ (function(module, exports) {

module.exports = "<svg height=\"100%\" width=\"100%\" [attr.viewBox]=\"viewBox\">\r\n    <!-- Donut outline -->\r\n    <g>\r\n        <circle #outline *ngFor=\"let item of items;let i=index\" [attr.cx]=\"center\" id=\"circle-{{i}}\" class=\"outline\" [attr.cy]=\"center\"\r\n            [attr.r]=\"outlineRadius\" fill=\"transparent\" [attr.stroke-width]=\"width/4\" [attr.stroke-dasharray]=\"getSegment(i, outlineCircumference)\"\r\n            [attr.stroke-dashoffset]=\"getOffset(i, outlineCircumference)\" [attr.stroke]=\"colorArray[i]\" />\r\n    </g>\r\n    <!-- Donut -->\r\n    <g>\r\n        <circle *ngFor=\"let item of items;let i=index\" [attr.cx]=\"center\" (mouseover)=\"turnOnHighlight($event, i)\" (mouseout)=\"turnOffHightlight(i)\"\r\n            (mouseclick)=\"turnOnHighlight($event, i)\" [attr.cy]=\"center\" [attr.r]=\"radius\" fill=\"none\" [attr.stroke-width]=\"width\" [attr.stroke-dasharray]=\"getSegment(i, circumference)\"\r\n            [attr.stroke-dashoffset]=\"getOffset(i, circumference)\" [attr.stroke]=\"colorArray[i]\" />\r\n    </g>\r\n    <!-- Inside text (grade) -->\r\n    <g>\r\n        <text [attr.fill]=\"fontColor\" [attr.font-size]=\"fontSize\" text-anchor=\"middle\" [attr.x]=\"center\" [attr.y]=\"center\">\r\n            <tspan  id=\"grade\" [attr.x]=\"center\" [attr.dy]=\"fontSize/3\" tabindex=\"0\" attr.aria-label=\"הממוצע שלך הוא {{average | number : '1.0-1'}}\">{{average | number : '1.0-1'}}</tspan>\r\n        </text>\r\n    </g>\r\n</svg>\r\n<!-- Tooltip text -->\r\n<div *ngIf=\"showTooltip\"class=\"atooltip\">\r\n    <div>\r\n        <b>{{subject}}</b>\r\n    </div>\r\n    <div>\r\n        {{points | number : '1.0-1'}}\r\n        <span> נקודות מהציון</span>\r\n    </div>\r\n</div>"

/***/ }),

/***/ "./src/app/calculator/donut/donut.component.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return DonutComponent; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("./node_modules/@angular/core/esm5/core.js");
//this componenet was made with the help of the following links:
//https://medium.com/@heyoka/scratch-made-svg-donut-pie-charts-in-html5-2c587e935d72#.v0341dt2z
//https://github.com/unnijeevan/angular2-donut
//please read for reference.
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};

var DonutComponent = /** @class */ (function () {
    function DonutComponent(elementRef) {
        this.elementRef = elementRef;
        this.whiteSegment = 0.25;
        this.items = [];
        this.radius = 20;
        this.width = 20;
        this.fontColor = "#666666";
        this.fontSize = 15;
        this.subject = '';
        this.points = null;
        this.showTooltip = false;
    }
    Object.defineProperty(DonutComponent.prototype, "circumference", {
        //get the circumference of the circle
        get: function () {
            return Math.PI * 2 * this.radius;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DonutComponent.prototype, "center", {
        //find the center of the circle
        get: function () {
            return this.radius + (this.width / 2);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DonutComponent.prototype, "viewBox", {
        //define the viewbox - the area which contains the donut
        get: function () {
            return "-7 -7 " + (this.center * 2.5).toString() + " " + (this.center * 2.5).toString();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DonutComponent.prototype, "totalUnits", {
        //calculate the overall number of units in the calculation
        get: function () {
            return this.items.map(function (p) { return p.Points; }).reduce(function (x, y) { return x + y; });
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DonutComponent.prototype, "outlineRadius", {
        //calculate the radius of the outline circle
        get: function () {
            return this.radius + this.width / 2 + this.width / 4;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DonutComponent.prototype, "outlineCircumference", {
        //calculate the circumference of the outline circle
        get: function () {
            return Math.PI * 2 * this.outlineRadius;
        },
        enumerable: true,
        configurable: true
    });
    //return the segment of the circle/donut for each grade 
    DonutComponent.prototype.getSegment = function (index, circ) {
        //get the percentage of each grade from the total average and multiply it by the circumference to adjust it to the given circumference size.
        //since we want a little white line between each segment, we make each segment shorter by whiteSegment
        var item = this.items[index];
        var segment = ((this.getGradePortion(item.Grade + item.Bonus, item.Points) / this.average) * circ) - this.whiteSegment;
        //we then return two values: the calculated segment (the part drawn), and the leftover value (the part not drawn) which together make up a whole circle
        return [segment, circ - segment];
    };
    //get the offset at which to draw each segment by adding the lengths of previous segments
    DonutComponent.prototype.getOffset = function (index, circ) {
        var _this = this;
        //first get the added length of segments so far
        var percent = index === 0 ? index : this.items.slice(0, index).map(function (a) { return _this.getGradePortion(a.Grade + a.Bonus, a.Points); }).reduce(function (x, y) { return x + y; });
        //each segment starts at the point where the last segment ended, which is just the circumference - percentage of all segments so far. we add a quarter circle
        //(circumference/4) to offset the starting point to the top of the circle (otherwise it would start at 3 o'clock)
        return circ - (circ * (percent / this.average)) + (circ / 4);
    };
    //return the number of points each grade is worth out of the average
    DonutComponent.prototype.getGradePortion = function (grade, units) {
        return (grade * units) / this.totalUnits;
    };
    //set up the outline portion to display according to the tooltip values
    DonutComponent.prototype.turnOnHighlight = function (event, index) {
        var item = this.items[index]; //get the subject the mouse is currently on in the graph
        var el = this.outline.toArray()[index]; //get the portion of the outline circle associated with the subject
        el.nativeElement.style.opacity = "0.4"; //increase the opacity to a visible value
        this.subject = this.items[index].SubjectName; //set the name of the subject
        this.points = (this.getGradePortion(item.Grade + item.Bonus, item.Points)); //set the portion of points the subject contributes to the total grade
        this.showTooltip = true;
    };
    //hide the outline
    DonutComponent.prototype.turnOffHightlight = function (index) {
        this.showTooltip = false;
        var el = this.outline.toArray()[index];
        el.nativeElement.style.opacity = "0"; //reduce the opacity back to none
    };
    __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Input"])(),
        __metadata("design:type", Array)
    ], DonutComponent.prototype, "items", void 0);
    __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Input"])(),
        __metadata("design:type", Number)
    ], DonutComponent.prototype, "average", void 0);
    __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Input"])(),
        __metadata("design:type", Number)
    ], DonutComponent.prototype, "radius", void 0);
    __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Input"])(),
        __metadata("design:type", Number)
    ], DonutComponent.prototype, "width", void 0);
    __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Input"])(),
        __metadata("design:type", String)
    ], DonutComponent.prototype, "fontColor", void 0);
    __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Input"])(),
        __metadata("design:type", Number)
    ], DonutComponent.prototype, "fontSize", void 0);
    __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Input"])(),
        __metadata("design:type", Array)
    ], DonutComponent.prototype, "colorArray", void 0);
    __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["ViewChildren"])('outline'),
        __metadata("design:type", Object)
    ], DonutComponent.prototype, "outline", void 0);
    __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["ViewChild"])('constText'),
        __metadata("design:type", Object)
    ], DonutComponent.prototype, "constText", void 0);
    DonutComponent = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Component"])({
            moduleId: module.i,
            selector: 'app-donut',
            template: __webpack_require__("./src/app/calculator/donut/donut.component.html"),
            styles: [__webpack_require__("./src/app/calculator/donut/donut.component.css")]
        }),
        __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_0__angular_core__["ElementRef"]])
    ], DonutComponent);
    return DonutComponent;
}());



/***/ }),

/***/ "./src/app/calculator/form-data.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return FormData; });
var FormData = /** @class */ (function () {
    function FormData() {
    }
    return FormData;
}());



/***/ }),

/***/ "./src/app/calculator/get-data.service.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return Steps; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return GetDataService; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("./node_modules/@angular/core/esm5/core.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_http__ = __webpack_require__("./node_modules/@angular/http/esm5/http.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_rxjs_Rx__ = __webpack_require__("./node_modules/rxjs/_esm5/Rx.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__environments_environment__ = __webpack_require__("./src/environments/environment.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__model_bagrut_subject_class__ = __webpack_require__("./src/app/calculator/model/bagrut-subject.class.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__model_applicant_subject_class__ = __webpack_require__("./src/app/calculator/model/applicant-subject.class.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__model_app_state_model__ = __webpack_require__("./src/app/calculator/model/app-state.model.ts");
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};







var Steps;
(function (Steps) {
    Steps[Steps["CalcType"] = 1] = "CalcType";
    Steps[Steps["GradeInput"] = 2] = "GradeInput";
    Steps[Steps["CalcAverage"] = 3] = "CalcAverage";
})(Steps || (Steps = {}));
var GetDataService = /** @class */ (function () {
    function GetDataService(http) {
        this.http = http;
        this.baseURL = __WEBPACK_IMPORTED_MODULE_3__environments_environment__["a" /* environment */].baseURL;
        this.initialize();
    }
    GetDataService.prototype.initialize = function () {
        //define the path for each API call
        this.urls = {
            years: this.baseURL + '/api/bargrutCalculator/GetSystemYears',
            sectors: this.baseURL + '/api/bargrutCalculator/GetSectorsByYear',
            commonSubjects: this.baseURL + '/api/bargrutCalculator/GetMandatorySubjects',
            allSubjects: this.baseURL + '/api/bargrutCalculator/GetSubjectsByYear',
            params: this.baseURL + '/api/bargrutCalculator/GetSystemParamsByName',
            calculate: this.baseURL + '/api/bargrutCalculator/GetBagrutCalc'
        };
        this.stateObject = new __WEBPACK_IMPORTED_MODULE_6__model_app_state_model__["a" /* AppState */]();
        this.getConstantData();
    };
    //get all static data from the database first
    GetDataService.prototype.getConstantData = function () {
        var _this = this;
        this.stateObject.step = Steps.CalcType;
        this.getYears().then(function (years) {
            // if the year is chosen automatically (without user selection - as set in the environment flag), set the selected year to the top year (which is at the top
            // of the list), and get the sectors accordingly
            if (__WEBPACK_IMPORTED_MODULE_3__environments_environment__["a" /* environment */].useCurrentYear) {
                _this.stateObject.selectedYear = years[0];
                _this.getSectors(_this.stateObject.selectedYear.value.name);
            }
        });
        this.getUnits();
        this.getMaxSubjects();
    };
    //return the stateObject as an observable
    GetDataService.prototype.getStateObject = function () {
        return __WEBPACK_IMPORTED_MODULE_2_rxjs_Rx__["a" /* Observable */].of(this.stateObject);
    };
    /**
     * @description Returns and caches the list of all subjects according to the year
     * @returns a promise of the subject array.
     */
    GetDataService.prototype.getAllSubjects = function () {
        var _this = this;
        if (this.stateObject.allSubjects)
            return Promise.resolve(this.stateObject.allSubjects);
        var url = this.urls.allSubjects + '/' + this.stateObject.selectedYear.value.name;
        return this.http.get(url)
            .map(function (response) {
            var data = response.json();
            _this.stateObject.allSubjects = [];
            for (var i = 0; i < data.length; i++) {
                _this.stateObject.allSubjects.push(new __WEBPACK_IMPORTED_MODULE_4__model_bagrut_subject_class__["a" /* BagrutSubject */](data[i].SubjectID, data[i].SubjectName));
            }
            ;
            return _this.stateObject.allSubjects;
        })
            .catch(function (e) {
            return __WEBPACK_IMPORTED_MODULE_2_rxjs_Rx__["a" /* Observable */].throw(new Error(e.status + " " + e.statusText));
        })
            .toPromise();
    };
    //gets the years from the API
    GetDataService.prototype.getYears = function () {
        var _this = this;
        if (this.stateObject.years) {
            return Promise.resolve(this.stateObject.years);
        }
        var url = this.urls.years;
        return this.http.get(url)
            .map(function (response) {
            var data = response.json();
            _this.stateObject.years = [];
            for (var i = 0; i < data.length; i++) {
                _this.stateObject.years.push({ label: data[i].Year, value: { id: data[i].Id, name: data[i].Year } });
            }
            _this.stateObject.selectedYear = null;
            return _this.stateObject.years;
        })
            .catch(function (e) {
            return __WEBPACK_IMPORTED_MODULE_2_rxjs_Rx__["a" /* Observable */].throw(new Error(e.status + " " + e.statusText));
        })
            .toPromise();
    };
    //gets the sectors from the API according to the year
    GetDataService.prototype.getSectors = function (year) {
        var _this = this;
        var url = this.urls.sectors + '/' + year;
        var curTime = new Date();
        console.log("get sectors at: " + curTime.getHours() + ":" + curTime.getMinutes() + ":" + curTime.getSeconds() + ":" + curTime.getMilliseconds());
        this.http.get(url)
            .map(function (response) {
            var curTime = new Date();
            console.log("got sectors at: " + curTime.getHours() + ":" + curTime.getMinutes() + ":" + curTime.getSeconds() + ":" + curTime.getMilliseconds());
            var data = response.json();
            _this.stateObject.sectors = [];
            for (var i = 0; i < data.length; i++) {
                _this.stateObject.sectors.push({ label: data[i].SectorDescription, value: { id: data[i].SectorId, name: data[i].SectorDescription } });
            }
            _this.stateObject.selectedSector = null;
            return _this.stateObject.sectors;
        })
            .catch(function (e) {
            return __WEBPACK_IMPORTED_MODULE_2_rxjs_Rx__["a" /* Observable */].throw(new Error(e.status + " " + e.statusText));
        })
            .toPromise();
    };
    //gets a list of all mandatory subjects from the API according to the year and sector
    GetDataService.prototype.getMandatorySubjects = function () {
        var _this = this;
        if (this.stateObject.selectedSubjects)
            return Promise.resolve(this.stateObject.selectedSubjects);
        var url = this.urls.commonSubjects + '/' + this.stateObject.selectedYear.value.name + '/' + this.stateObject.selectedSector.value.id;
        return this.http.get(url)
            .map(function (response) {
            var data = response.json();
            _this.stateObject.selectedSubjects = [];
            for (var i = 0; i < data.length; i++) {
                _this.stateObject.selectedSubjects.push(new __WEBPACK_IMPORTED_MODULE_5__model_applicant_subject_class__["a" /* ApplicantSubject */](data[i].SubjectId, data[i].SubjectName, null, null, false));
            }
            _this.stateObject.selectedSubjects = _this.stateObject.selectedSubjects.sort(function (a, b) { return a.id - b.id; });
            return _this.stateObject.selectedSubjects;
        })
            .catch(function (e) {
            return __WEBPACK_IMPORTED_MODULE_2_rxjs_Rx__["a" /* Observable */].throw(new Error(e.status + " " + e.statusText));
        })
            .toPromise();
    };
    //gets the maximum number of units/points (יחידות) from the API
    GetDataService.prototype.getUnits = function () {
        var _this = this;
        var url = this.urls.params + '/' + "ONL_MAX_POINTS";
        return this.http.get(url)
            .map(function (response) {
            var data = response.json();
            _this.stateObject.maxUnits = [];
            //insert values between 1 to max units/points into the object
            for (var i = 1; i <= data; i++) {
                _this.stateObject.maxUnits.push({ label: i.toString(), value: i });
            }
            return _this.stateObject.maxUnits;
        })
            .catch(function (e) {
            return __WEBPACK_IMPORTED_MODULE_2_rxjs_Rx__["a" /* Observable */].throw(new Error(e.status + " " + e.statusText));
        })
            .toPromise();
    };
    //get the maximum number of subjects allowed for the calculation from the API
    GetDataService.prototype.getMaxSubjects = function () {
        var _this = this;
        var url = this.urls.params + '/' + "ONL_MAX_SUBJECTS";
        return this.http.get(url)
            .map(function (response) {
            _this.stateObject.maxSubjects = response.json();
            return _this.stateObject.maxSubjects;
        })
            .catch(function (e) {
            return __WEBPACK_IMPORTED_MODULE_2_rxjs_Rx__["a" /* Observable */].throw(new Error(e.status + " " + e.statusText));
        })
            .toPromise();
    };
    //send the collected data back to the server and receive the returned response object
    GetDataService.prototype.sendData = function (name, data) {
        var _this = this;
        var headers = new __WEBPACK_IMPORTED_MODULE_1__angular_http__["a" /* Headers */]({ 'Content-Type': 'application/json' });
        var options = new __WEBPACK_IMPORTED_MODULE_1__angular_http__["d" /* RequestOptions */]({ headers: headers });
        var body = JSON.stringify(data);
        var curTime = new Date();
        console.log("started calculation at: " + curTime.getHours() + ":" + curTime.getMinutes() + ":" + curTime.getSeconds() + ":" + curTime.getMilliseconds());
        return this.http.post(this.urls[name] + '/', body, options)
            .map(function (response) {
            var curTime = new Date();
            console.log("ended calculation at: " + curTime.getHours() + ":" + curTime.getMinutes() + ":" + curTime.getSeconds() + ":" + curTime.getMilliseconds());
            return response.json();
        })
            .catch(function (e) {
            return __WEBPACK_IMPORTED_MODULE_2_rxjs_Rx__["a" /* Observable */].throw(new Error(e.status + " " + e.statusText));
        })
            .toPromise()
            .then(function (result) { return _this.stateObject.result = result; });
    };
    //get the names of subjects given their ids - use the selectedSubjects array in the state object to get the names
    GetDataService.prototype.getSubjectNames = function (outputArray, getBonus) {
        for (var i = 0; i < outputArray.length; i++) {
            var subject = outputArray[i];
            if (getBonus)
                outputArray[i].Bonus = subject.GradeWithBonus > 0 ? subject.GradeWithBonus - subject.Grade : 0;
            for (var j = 0; j < this.stateObject.selectedSubjects.length; j++) {
                if (subject.SubjectID === this.stateObject.selectedSubjects[j].id) {
                    outputArray[i].SubjectName = this.stateObject.selectedSubjects[j].name;
                    break;
                }
            }
            if (!outputArray[i].SubjectName) {
                outputArray[i].SubjectName = this.getSubjectName(outputArray[i].SubjectID);
            }
        }
    };
    //get the name of a subject given its id - use the allSubjects array in the state object to get the name. 
    //this is called from getSubjectNames (above) when the subject name wasn't found in the selectedSubjects array
    GetDataService.prototype.getSubjectName = function (id) {
        for (var i = 0; i < this.stateObject.allSubjects.length; i++) {
            if (id === this.stateObject.allSubjects[i].id) {
                return this.stateObject.allSubjects[i].name;
            }
        }
    };
    //toggle the accessibility field on or off
    GetDataService.prototype.toggleAccessibility = function (turnOn) {
        this.stateObject.isAccessible = turnOn;
    };
    GetDataService.prototype.getRegistrationMessage = function () {
        var url = this.urls.params + '/' + "ONL_TEXT_FOR_RISHUM";
        return this.http.get(url)
            .map(function (response) {
            return response.json();
        })
            .catch(function (e) {
            return __WEBPACK_IMPORTED_MODULE_2_rxjs_Rx__["a" /* Observable */].throw(new Error(e.status + " " + e.statusText));
        })
            .toPromise();
    };
    GetDataService = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Injectable"])(),
        __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_1__angular_http__["b" /* Http */]])
    ], GetDataService);
    return GetDataService;
}());



/***/ }),

/***/ "./src/app/calculator/grade-input/grade-input.component.css":
/***/ (function(module, exports) {

module.exports = ".instructions {\r\n    margin-bottom: 1rem;\r\n}\r\n.subject-title {\r\n    border-bottom: 1px solid #6e7072;\r\n}\r\n.btn-secondary {\r\n    border-color: #ccc;\r\n    background-color: #fff;\r\n    color: #000;\r\n}\r\n.title {\r\n    font-size: 0.85em;\r\n}\r\n.fa-times-circle {\r\n    color: #AACED4;\r\n    background-color: #fff;\r\n    padding-top: 0.8em;\r\n    cursor: pointer;\r\n}\r\n.btn-secondary.selectedType {\r\n    background-color: #137888 !important;\r\n    color: #fff;\r\n}\r\n.btn-secondary:hover{\r\n    background-color: #E5E5E5;\r\n}\r\n.btn-secondary:focus, .btn-secondary:active {\r\n    -webkit-box-shadow: 0 0 0 0 !important;\r\n            box-shadow: 0 0 0 0 !important;\r\n}\r\n@media (min-width: 576px) {\r\n    .subject-grade {\r\n        margin-right: -2em;\r\n    }\r\n    .subject-remove {\r\n        margin-right: -3em;    \r\n    }\r\n}\r\n@media (min-width: 768px) {\r\n    .subject-grade {\r\n        margin-right: -1em;\r\n    }\r\n    .subject-remove {\r\n        margin-right: -1em;    \r\n    }\r\n}\r\n@media (min-width: 1200px) {\r\n    .subject-grade {\r\n        margin-right: -0.6em;\r\n    }  \r\n}\r\n.fa-plus-circle {\r\n    background-color: #fff;\r\n}\r\n.subject-add{\r\n    padding-top:40px;\r\n    margin-bottom:35px;\r\n}\r\n.subject-add a{\r\n    text-decoration: none;\r\n}\r\n.subject-add div, .subject-add div a {\r\n    color: #75325D;\r\n    cursor: pointer;\r\n}\r\n.subject-add span {\r\n    text-decoration: underline;\r\n    position:relative;\r\n    top: -0.4em;\r\n}\r\n.buttons div{\r\n    float:left;\r\n    margin-left:10%;\r\n}\r\n.btn-calc, .btn-clear {\r\n    font-weight: bold;\r\n    background-color: #00A196;\r\n    border-color: #00A196;\r\n    color: #fff;\r\n}\r\n.input-data {\r\n    margin-bottom: 1em;\r\n}\r\n.btn-group > .btn {\r\n    float:right;\r\n}\r\n.btn-group.btn-type > .btn:first-child:not(:last-child):not(.dropdown-toggle) {\r\n    border-radius: 4px;\r\n    border-top-left-radius: 0;\r\n    border-bottom-left-radius: 0;\r\n}\r\n.btn-group.btn-type > .btn:last-child:not(:first-child), .btn-group.btn-type > .dropdown-toggle:not(:first-child) {\r\n    border-radius: 4px;\r\n    border-top-right-radius: 0;\r\n    border-bottom-right-radius: 0;\r\n    margin-right: -1px;\r\n}\r\n.btn-group.btn-type button:focus{\r\n    -webkit-box-shadow: 0 0 10px #1f78ce;\r\n            box-shadow: 0 0 10px #1f78ce;\r\n    border: 1px solid #1f78ce;\r\n}\r\n.btn {\r\n    border-radius: 4px;\r\n    display: inline-block;\r\n    font-size: 14px;\r\n    line-height: 1.42857;\r\n    margin-bottom: 0;\r\n    padding: 6px 12px;\r\n    font-family: \"Open Sans Hebrew\",sans-serif;\r\n}\r\n.title label{\r\n    color: #999999;\r\n    margin-bottom:3px;\r\n    font-size: 0.99em;\r\n    font-weight: normal;\r\n}\r\n/* use the following to override shadow DOM of PrimeNG's autocomplete */\r\n:host >>> .ui-state-focus {\r\n    background-color: #fff;\r\n}\r\n:host >>> .ui-autocomplete {\r\n    width: 100%;    \r\n}\r\n:host >>> .ui-inputtext, :host >>> .ui-inputtext:focus {\r\n    width: 100%;\r\n    border: 0;\r\n    -webkit-box-shadow: 0 0 0 0;\r\n            box-shadow: 0 0 0 0;\r\n    background-color: #F3F8F9;\r\n}\r\n:host >>> button.ui-autocomplete-dropdown {\r\n    margin-right: -28px;\r\n}\r\n:host >>> .ui-autocomplete-dropdown, :host >>> .ui-autocomplete-dropdown:hover, :host >>> ui-inputtext:focus {\r\n    background-color: #F3F8F9 !important;\r\n    color: #00A196 !important;\r\n    border-color:#F3F8F9 !important;\r\n}\r\n:host >>> .ui-autocomplete-panel .ui-autocomplete-list-item {\r\n    text-align:right;\r\n}\r\n:host >>> .ui-state-highlight{\r\n    background-color: #CCECEA;\r\n    color: #1d1e1f;\r\n}\r\ninput {\r\n    border-radius: 4px;\r\n    font-size: 14px;\r\n    padding:7px;\r\n    font-family: \"Open Sans Hebrew\",sans-serif;\r\n}\r\n.input-row {\r\n    background-color: #F3F8F9;\r\n    margin-left:-21px;\r\n    margin-right:-21px;\r\n    margin-bottom: 30px;\r\n    padding: 5px 20px;\r\n}\r\n.input-row .subject-remove i{\r\n    background-color: #F3F8F9;\r\n}\r\ninput.has-error, :host >>> p-dropdown.has-error .ui-dropdown, .has-error button {\r\n    border-color: #d9534f !important;\r\n    -webkit-box-shadow: inset 0 1px 1px rgba(0,0,0,.075);\r\n    box-shadow: 0 1px 1px rgba(0, 0, 0, 0.075) inset, 0 0 8px rgba(217, 83, 79, 0.6);\r\n    outline: 0 none;\r\n}\r\n.subject-title.has-error {\r\n    border-color: #d9534f;\r\n}\r\n.subject-title.has-error span {\r\n    color: #d9534f;\r\n}\r\n:host >>> p-autocomplete.err .ui-autocomplete-input {\r\n    color: #d9534f;\r\n}\r\n.alert-box > div {\r\n    width: 100%;\r\n}\r\n@media (max-width: 575px){\r\n    *[id^='grade-input-'] {\r\n        width: 70px;\r\n    }\r\n    .subject-grade {\r\n        margin-right: -1em;\r\n    }\r\n    .subject-remove {\r\n        margin-right:-1.2em;\r\n    }\r\n}\r\n/* dropdown */\r\n.btn-group.btn-dd{\r\n    width:100%;\r\n}\r\n.dropdown-toggle, .toggle-main {\r\n    border: 1px solid #d6d6d6;\r\n    background: #fff;\r\n    color: #222;\r\n    height:34px;\r\n    padding-top:5px;\r\n    line-height: 1.25;\r\n    border-radius: 4px !important; \r\n }\r\n.dropdown-toggle{\r\n    border-top-right-radius: 0px !important;\r\n    border-bottom-right-radius: 0px !important;\r\n    border-right: 0px;\r\n}\r\n.toggle-main {\r\n    border-top-left-radius: 0px !important;\r\n    border-bottom-left-radius: 0px !important;\r\n    width:66%;\r\n    font-size:14px;\r\n}\r\n.dropdown-toggle:hover, .dropdown-toggle:focus, .show > .btn-secondary.dropdown-toggle, .toggle-main:hover, .toggle-main:focus{\r\n    background-color:#fff;\r\n    border-color: #c0c0c0;\r\n    color: #222;\r\n}\r\n.dropdown-toggle:focus {\r\n    -webkit-box-shadow: 0 0 5px #1f78ce;\r\n            box-shadow: 0 0 5px #1f78ce;\r\n}\r\n.dropdown-menu{\r\n    right:0;\r\n    left: auto;\r\n    text-align: right;\r\n    text-indent: 5px;\r\n    padding: 2px 0;\r\n    float: right;\r\n    font-size:14px;\r\n    border-radius: 4px;\r\n    min-width:98%;\r\n}\r\n.dropdown-item{\r\n    padding:4px 6px;\r\n    text-align: right;\r\n}\r\n.dropdown-item:active{\r\n    color: #222;\r\n}\r\n.dropdown-item:hover{\r\n    background-color: #fff;\r\n}\r\n.dropdown-item span {\r\n    display: block;\r\n    border-radius: 4px;\r\n }\r\n.dropdown-item:hover span, .dropdown-item.selected span{\r\n     background-color:  #CCECEA;\r\n }\r\n/* Accessibility */\r\n.show-access, .show-access a, .show-access span, .show-access i, .show-access button, .show-access label, .show-access input, .show-access .input-row,\r\n.show-access :host >>> .ui-inputtext, .show-access :host >>> .ui-autocomplete-dropdown, .show-access :host >>> .ui-autocomplete-dropdown:focus {\r\n    color: #FFFF00 !important;\r\n    background-color: #000 !important;\r\n    border-color: #000 !important;\r\n}\r\n.show-access input{\r\n    border-color: #FFFF00 !important;\r\n}\r\n.show-access a{\r\n    text-decoration: underline;\r\n}\r\n.show-access button {\r\n    border-color: #FFFF00 !important;\r\n    background-color: #000 !important;\r\n}\r\n.show-access :host >>> .ui-dropdown, .show-access :host >>> .ui-widget-content{\r\n    border-color: #FFFF00 !important;\r\n    color: #FFFF00 !important;\r\n    background-color: #000 !important;\r\n}\r\n.show-access :host >>> .ui-dropdown, .show-access :host >>> .ui-dropdown .ui-dropdown-label, .show-access :host >>> .ui-dropdown .ui-dropdown-trigger,\r\n.show-access :host >>> .ui-dropdown-items-wrapper, .show-access :host >>> .ui-dropdown-items-wrapper ul, .show-access :host >>> .ui-dropdown-items-wrapper li {\r\n    color: #FFFF00 !important;\r\n    background-color: #000 !important;\r\n}\r\n.show-access :host >>> .ui-dropdown-items-wrapper li:hover, .show-access :host >>> .ui-state-highlight{\r\n    color: #c94e02 !important;\r\n    background-color: #000 !important;\r\n}\r\n.show-access .btn-secondary.selectedType {\r\n    background-color: #FFFF00 !important;\r\n    color: #000 !important;\r\n}\r\n.show-access .subject-title.has-error {\r\n    border-color: #d9534f !important\r\n}\r\n.show-access .subject-title.has-error span {\r\n    color: #d9534f !important;\r\n}\r\n.show-access input.has-error, :host >>> p-dropdown.has-error .ui-dropdown, .has-error button {\r\n    border-color: #d9534f !important;\r\n    -webkit-box-shadow: inset 0 1px 1px rgba(0,0,0,.075);\r\n    box-shadow: 0 1px 1px rgba(0, 0, 0, 0.075) inset, 0 0 8px rgba(217, 83, 79, 0.6);\r\n    outline: 0 none;\r\n}\r\n.show-access :host >>> .ui-inputtext::-webkit-input-placeholder { /* Chrome/Opera/Safari */\r\n  color: #FFFF00 !important;\r\n  opacity:0.7;\r\n}\r\n.show-access :host >>> .ui-inputtext:-ms-input-placeholder { /* Chrome/Opera/Safari */\r\n  color: #FFFF00 !important;\r\n  opacity:0.7;\r\n}\r\n.show-access :host >>> .ui-inputtext::-ms-input-placeholder { /* Chrome/Opera/Safari */\r\n  color: #FFFF00 !important;\r\n  opacity:0.7;\r\n}\r\n.show-access :host >>> .ui-inputtext::placeholder { /* Chrome/Opera/Safari */\r\n  color: #FFFF00 !important;\r\n  opacity:0.7;\r\n}\r\n.show-access :host >>> .ui-inputtext::-moz-placeholder { /* Firefox 19+ */\r\n  color: #FFFF00 !important;\r\n  opacity:0.7;\r\n}\r\n.show-access :host >>> .ui-inputtext:-ms-input-placeholder { /* IE 10+ */\r\n  color: #FFFF00 !important;\r\n  opacity:0.7;\r\n}\r\n.show-access :host >>> .ui-inputtext:-moz-placeholder { /* Firefox 18- */\r\n  color: #FFFF00 !important;\r\n  opacity:0.7;\r\n}\r\n.show-access .dropdown-menu{\r\n    background-color: #000;\r\n    border-color: #FFFF00 !important;\r\n}\r\n.show-access .dropdown-item, .show-access .dropdown-item:hover {\r\n    background-color: #000;\r\n    text-decoration: none;\r\n}\r\n.show-access .dropdown-item:hover span, .show-access .dropdown-item.selected span{\r\n    color: #c94e02 !important;\r\n    background-color: #000;\r\n }\r\n.show-access .dropdown-toggle:focus, .show-access button:focus, .show-access input:focus, .show-access button:focus{    \r\n    -webkit-box-shadow: 0 0 10px #FFFF00 !important;    \r\n            box-shadow: 0 0 10px #FFFF00 !important;\r\n }\r\n.show-access .subject-add a{\r\n    text-decoration: none;\r\n}\r\n.loading {\r\n    position: fixed;\r\n    top: 47%;\r\n    left: 50%;\r\n}\r\n@-webkit-keyframes ui-progress-spinner-color {\r\n    100%,\r\n    0% {\r\n        /* stroke: #137888; */\r\n        stroke: #fff;\r\n    }\r\n}\r\n@keyframes ui-progress-spinner-color {\r\n    100%,\r\n    0% {\r\n        /* stroke: #137888; */\r\n        stroke: #fff;\r\n    }\r\n}\r\n.ui-progress-spinner {\r\n    z-index:100;\r\n}\r\n#overlay {\r\n    position: fixed; /* Sit on top of the page content */\r\n    display: block;\r\n    width: 100%; \r\n    height: 100%; \r\n    top: 0;\r\n    left: 0;\r\n    right: 0;\r\n    bottom: 0;\r\n    background-color: rgba(0,0,0,0.5); \r\n    z-index: 2;\r\n  }"

/***/ }),

/***/ "./src/app/calculator/grade-input/grade-input.component.html":
/***/ (function(module, exports) {

module.exports = "<form class=\"form\" [formGroup]=\"gradeForm\" novalidate (ngSubmit)=\"onSubmitForm(gradeForm, $event)\" [ngClass]=\"{'show-access': stateObject.isAccessible}\">\r\n  <div class=\"row instructions\">\r\n    <div class=\"col-12 col-sm-12\">\r\n      <div>\r\n        <span tabindex=\"0\">\r\n          נא להזין את כל מקצועות הבגרות הקיימים.  המחשבון יעשה שימוש רק באלו הנותנים את הממוצע המיטבי בהתאם לכללי החישוב.\r\n        </span>\r\n      </div>\r\n    </div>\r\n  </div>\r\n\r\n  <div class=\"row alert-box align-items-center\">\r\n    <div col-12 col-sm-12>\r\n      <result-alert #ResultAlert #testdiv></result-alert>\r\n    </div>\r\n  </div>\r\n  <div formArrayName=\"selectedSubjects\">\r\n    <div *ngFor=\"let subject of subjectData.controls; let i=index\" [ngClass]=\"{'input-row':subject.controls.name.value == ''}\">\r\n      <!-- Subject -->\r\n      <div [formGroupName]=\"i\">\r\n        <div class=\"row align-items-end input-data\" >\r\n          <!-- Name -->\r\n          <div class=\"col-12 col-sm-12 col-md-3 col-lg-5 col-xl-6\">\r\n            <div class=\"subject-title\" [ngClass]=\"{'has-error': (subject.controls.name.errors?.emptyname  || subject.isDuplicate) && submitAttempt}\">\r\n              <span tabindex=\"0\">\r\n                {{subject.controls.name.value}}\r\n              </span>\r\n              <div *ngIf=\"subject.controls.name.value == ''\">\r\n                <p-autoComplete #pAutoComplete [(ngModel)]=\"stateObject.allSubjects.name\" [suggestions]=\"filteredSubjects\" field=\"name\" [minLength]=\"1\" [ngModelOptions]=\"{standalone: true}\"\r\n                  placeholder=\"הקלד מקצוע\" [multiple]=\"false\" [dropdown]=\"true\" (completeMethod)=\"filterSubjects($event)\" (onSelect)=\"onSelectSubject($event, i)\" \r\n                  [ngClass]=\"{'err': subject.controls.name.errors?.emptyname && submitAttempt}\" aria-label=\"הקלד מקצוע\" tabindex=\"0\" forceSelection=\"true\">\r\n                </p-autoComplete>\r\n              </div>\r\n            </div> \r\n          </div>\r\n          <div class=\"col-12 col-sm-12 col-md-9 col-lg-7 col-xl-6\">\r\n            <div class=\"row align-items-center\">\r\n              <!-- Units -->\r\n              <div class=\"col-7 col-sm-5 col-md-4 col-lg-4 col-xl-3 subject-units\">\r\n                <div class=\"ddl-block\">\r\n                <div class=\"title\">\r\n                  <label>\r\n                    יחידות לימוד\r\n                  </label>\r\n                </div>\r\n                  <div class=\"btn-group btn-dd\" [ngClass]=\"{'has-error':(subject.controls.selectedUnits?.errors?.noselection || subject.isDuplicate) && submitAttempt}\"\r\n                       aria-label=\"יחידות לימוד\">\r\n                    <button type=\"button\" class=\"btn toggle-main\" tabindex=\"-1\">{{stateObject.selectedSubjects[i].units ? stateObject.selectedSubjects[i].units : \"בחר\"}}</button>\r\n                    <button type=\"button\" class=\"btn dropdown-toggle dropdown-toggle-split\" data-toggle=\"dropdown\" aria-haspopup=\"true\" aria-expanded=\"false\" aria-label=\"בחר יחידות לימוד\">\r\n                      <span class=\"sr-only\">Toggle Dropdown</span>\r\n                    </button>\r\n                    <div class=\"dropdown-menu\">\r\n                      <a class=\"dropdown-item\" href=\"#\" *ngFor=\"let unit of stateObject.maxUnits\" (click)=\"onSelectUnits(unit.label, i); $event.preventDefault()\"\r\n                        [ngClass]=\"{'selected': unit.label===stateObject.selectedSubjects[i].units}\">\r\n                        <span>{{unit.label}}</span>\r\n                      </a>\r\n                    </div>\r\n                  </div>\r\n                </div>\r\n              </div>\r\n              <!-- Grade -->\r\n              <div class=\"col-4 col-sm-3 col-md-3 col-lg-3 col-xl-3 subject-grade\">\r\n                <div class=\"title\">\r\n                  <label for=\"grade-input-{{i}}\">\r\n                    ציון\r\n                  </label>\r\n                </div>\r\n                <div>\r\n                  <input formControlName=\"grade\" #grade type=\"text\" class=\"form-control\" id=\"grade-input-{{i}}\" (input)=\"onInputChange(grade.value, i);$event.stopPropagation();\"\r\n                    [ngClass]=\"{'has-error':subject.controls.grade?.errors?.pattern || (subject.controls.grade?.errors?.required && submitAttempt) }\" aria-label=\"הכנס ציון\"/>\r\n                </div>\r\n              </div>\r\n              <!-- Type -->\r\n              <div class=\"col-8 col-sm-5 col-md-4 col-lg-4 col-xl-4 subject-type\">\r\n                <div class=\"title\">\r\n                  <label>\r\n                    סוג בחינה\r\n                  </label>\r\n                </div>\r\n                <div class=\"btn-group btn-type\" role=\"group\" aria-label=\"סוג בחינה\" [ngClass]=\"{'has-error': subject.isDuplicate && submitAttempt}\">\r\n                  <button *ngFor=\"let type of types; let j=index\" type=\"button\" class=\"btn btn-secondary\" (click)=onTypeClick(i,j)\r\n                    [ngClass]=\"{'selectedType': j == subject.controls['selectedType'].value}\" attr.aria-label=\"סוג בחינה {{type}}\">{{type}}</button>\r\n                </div>\r\n              </div>              \r\n              <!-- Remove button -->\r\n              <a class=\"col-2 col-sm-1 subject-remove\" href=\"#\" (click)=\"onRemoveSubject(i); $event.preventDefault();\" aria-label=\"הסר מקצוע\">\r\n                <i class=\"fa fa-times-circle fa-2x\"></i>\r\n              </a>\r\n            </div>\r\n          </div>\r\n        </div>\r\n       </div>\r\n    </div>\r\n  </div> \r\n  <div class=\"row justify-content-between subject-add\">\r\n    <div class=\"col-12 col-sm-6 align-self-start\">\r\n      <a (click)=\"onAddSubject(); $event.preventDefault();\" href=\"#\" aria-label=\"הוסף מקצוע מרשימה\">\r\n      <i class=\"fa fa-plus-circle fa-2x\" aria-hidden=\"true\"></i>\r\n        <span>\r\n          הוסף מקצוע  \r\n        </span>\r\n      </a>\r\n    </div>\r\n    <div class=\"col-12 col-sm-6 align-self-end buttons\">\r\n      <div>\r\n        <button type=\"submit\" class=\"btn btn-primary btn-calc\">חשב ממוצע</button>\r\n      </div>\r\n    </div>\r\n  </div>\r\n</form>\r\n<div class=\"loading\" *ngIf=\"gettingResult\">\r\n  <div id=\"overlay\"></div>\r\n  <p-progressSpinner [style]=\"{width: '50px', height: '50px', 'z-index': 100}\" strokeWidth=\"4\" animationDuration=\"2s\"></p-progressSpinner>\r\n</div>\r\n\r\n"

/***/ }),

/***/ "./src/app/calculator/grade-input/grade-input.component.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return GradeInputComponent; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("./node_modules/@angular/core/esm5/core.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_primeng_primeng__ = __webpack_require__("./node_modules/primeng/primeng.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_primeng_primeng___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_primeng_primeng__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__get_data_service__ = __webpack_require__("./src/app/calculator/get-data.service.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__angular_router__ = __webpack_require__("./node_modules/@angular/router/esm5/router.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__angular_forms__ = __webpack_require__("./node_modules/@angular/forms/esm5/forms.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__model_applicant_subject_class__ = __webpack_require__("./src/app/calculator/model/applicant-subject.class.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__result_alert_component__ = __webpack_require__("./src/app/calculator/result-alert.component.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__form_data__ = __webpack_require__("./src/app/calculator/form-data.ts");
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};





 //Subject holding information about units, grade, and type as filled out by the user 


var GradeInputComponent = /** @class */ (function () {
    function GradeInputComponent(getData, router, fb, elRef) {
        this.getData = getData;
        this.router = router;
        this.fb = fb;
        this.elRef = elRef;
        this.types = ["מבחן", "עבודה"];
        this.filteredSubjects = [];
        this.submitAttempt = false; //has the user clicked the submit button?
        this.gettingResult = false;
    }
    GradeInputComponent.prototype.ngOnInit = function () {
        this.buildForm();
        // retrieve the stateObject
        this.getStateObject();
    };
    //define the model-driven form
    GradeInputComponent.prototype.buildForm = function () {
        this.gradeForm = this.fb.group({
            selectedSubjects: this.fb.array([])
        });
    };
    //retrieve the state of the app
    GradeInputComponent.prototype.getStateObject = function () {
        var _this = this;
        this.getData.getStateObject().subscribe(function (stateObject) {
            _this.stateObject = stateObject;
            //if we got here by simply entering the url, redirect to first page
            if (_this.stateObject.step < __WEBPACK_IMPORTED_MODULE_2__get_data_service__["b" /* Steps */].GradeInput) {
                _this.router.navigateByUrl('/calc-type');
                return;
            }
            //this.getData.getAllSubjects();
            _this.initializeForm();
        });
    };
    GradeInputComponent.prototype.initializeForm = function () {
        var _this = this;
        //get the list of mandatory subjects and populate the FormArray
        this.getData.getMandatorySubjects().then(function () {
            var array = _this.gradeForm.controls['selectedSubjects'];
            for (var i = 0; i < _this.stateObject.selectedSubjects.length; i++) {
                var sub = _this.stateObject.selectedSubjects[i];
                array.push(_this.createGroupSubject(sub.id, sub.name, sub.units, sub.grade ? sub.grade.toString() : '', +sub.isPaper));
            }
            ;
            //set the validator for the form
            _this.gradeForm.validator = _this.checkForm.bind(_this);
            //if coming back to this page after calculating the average, we want to block navigating forward again if the user changes data - so subscribe to any form changes
            _this.gradeForm.valueChanges.subscribe(function () { return _this.stateObject.step = __WEBPACK_IMPORTED_MODULE_2__get_data_service__["b" /* Steps */].GradeInput; });
        });
    };
    //create a form-group for each Subject 
    GradeInputComponent.prototype.createGroupSubject = function (id, name, selectedUnits, grade, type) {
        if (selectedUnits === void 0) { selectedUnits = null; }
        if (grade === void 0) { grade = ''; }
        if (type === void 0) { type = 0; }
        return this.fb.group({
            id: [id],
            name: [name, [this.emptyNameValidator]],
            selectedUnits: [selectedUnits, [this.requireUnitsValidator]],
            grade: [grade, [__WEBPACK_IMPORTED_MODULE_4__angular_forms__["Validators"].required, __WEBPACK_IMPORTED_MODULE_4__angular_forms__["Validators"].pattern("^[1-9][0-9]?$|^100$")]],
            selectedType: type
        });
    };
    //event: number of units was selected so update the FormArray and the stateObject
    GradeInputComponent.prototype.onSelectUnits = function (value, idx) {
        var array = this.gradeForm.controls['selectedSubjects'];
        array.controls[idx].get('selectedUnits').setValue(value);
        this.stateObject.selectedSubjects[idx].units = value;
    };
    //event: the type of exam was selected so update the FormArray and the stateObject
    GradeInputComponent.prototype.onTypeClick = function (subjectIdx, typeIdx) {
        var array = this.gradeForm.controls['selectedSubjects'];
        array.controls[subjectIdx].get('selectedType').setValue(typeIdx);
        this.stateObject.selectedSubjects[subjectIdx].isPaper = typeIdx === 1;
    };
    //event: a subject was removed so update the FormArray and the stateObject
    GradeInputComponent.prototype.onRemoveSubject = function (idx) {
        var array = this.gradeForm.controls['selectedSubjects'];
        if (array.controls[idx].get("name").value == '') {
            this.pAutoComplete.value = [];
            this.pAutoComplete.onModelChange(this.pAutoComplete.value);
        }
        array.removeAt(idx);
        this.stateObject.selectedSubjects.splice(idx, 1); //
    };
    //event: the Add Subject button was clicked so add a new selected subject to the FormArray and the stateObject with an empty initial value 
    GradeInputComponent.prototype.onAddSubject = function () {
        var array = this.gradeForm.controls['selectedSubjects'];
        if (array.controls[array.length - 1].get('id').value == '')
            return;
        this.stateObject.selectedSubjects.push(new __WEBPACK_IMPORTED_MODULE_5__model_applicant_subject_class__["a" /* ApplicantSubject */](null, '', null, null, false)); //
        array.push(this.createGroupSubject('', ''));
    };
    //event: a grade was added so update the FormArray and the stateObject
    GradeInputComponent.prototype.onInputChange = function (value, idx) {
        var array = this.gradeForm.controls['selectedSubjects'];
        if (array.controls[idx].get('grade').errors) {
            this.stateObject.selectedSubjects[idx].grade = null;
            return;
        }
        this.stateObject.selectedSubjects[idx].grade = value;
    };
    //filter the autocomplete textbox results according to the input string
    GradeInputComponent.prototype.filterSubjects = function (event) {
        var query = event.query;
        this.filteredSubjects = [];
        var filter = this.stateObject.allSubjects.filter(function (x) { return (x.name.startsWith(query) == true); });
        for (var i = 0; i < filter.length; i++) {
            this.filteredSubjects.push(filter[i]);
        }
    };
    //event: pAutoComplete select event triggers this function - reset pAutoComplete input and add a new subject to selectedSubjects FormArray and stateObject
    GradeInputComponent.prototype.onSelectSubject = function (subject, idx) {
        var array = this.gradeForm.controls['selectedSubjects'];
        array.controls[idx].get('id').setValue(subject.id);
        array.controls[idx].get('name').setValue(subject.name);
        this.pAutoComplete.value = [];
        this.pAutoComplete.onModelChange(this.pAutoComplete.value);
        this.stateObject.selectedSubjects[idx].id = subject.id;
        this.stateObject.selectedSubjects[idx].name = subject.name;
    };
    //event: retrieve a list of all subjects when using the autocomplete's arrow button - no longer needed in new PrimeNG
    // selectAllSubjects(event) {
    //   this.filteredSubjects = [];
    //   setTimeout(() => {
    //     this.filteredSubjects = this.stateObject.allSubjects;
    //   }, 100)
    // }
    //validation function: check units dropdown for unselected values
    GradeInputComponent.prototype.requireUnitsValidator = function (fc) {
        if (fc.value === null)
            return { noselection: true };
        return null;
    };
    //validation function: check text field for empty name (after clicking the "add Subject" button)
    GradeInputComponent.prototype.emptyNameValidator = function (fc) {
        if (fc.value == '')
            return { emptyname: true };
        return null;
    };
    //validation function: check the form for duplicates and max number of subjects
    GradeInputComponent.prototype.checkForm = function (fg) {
        var objs = [];
        var valid = null;
        objs.push(this.checkContentValidator(fg));
        objs.push(this.checkMaxValidator(fg));
        objs.push(this.checkSubjectDuplication(fg));
        for (var i = 0; i < objs.length; i++)
            if (objs[i] != null) {
                if (valid === null)
                    valid = new Object();
                Object.assign(valid, objs[i]);
            }
        return valid;
    };
    //validation function: count the number of filled-in subjects (cannot exceed the Max Subject value)
    GradeInputComponent.prototype.checkMaxValidator = function (fg) {
        var name, units, grade;
        var subCount = 0;
        var subjects = fg.get("selectedSubjects");
        for (var i = 0; i < subjects.length; i++) {
            name = subjects.get([i]).get("name");
            units = subjects.get([i]).get("selectedUnits");
            grade = subjects.get([i]).get("grade");
            if (name.value != '' && !units.errors && !grade.errors)
                subCount++;
        }
        this.currentMax = subCount;
        return subCount <= this.stateObject.maxSubjects ? null : { maxExceeded: true };
    };
    //validation function: return validation error if the content of any of the subjects is erranous
    GradeInputComponent.prototype.checkContentValidator = function (fg) {
        var name, units, grade;
        var subjects = fg.get("selectedSubjects");
        for (var i = 0; i < subjects.length; i++) {
            name = subjects.get([i]).get("name");
            units = subjects.get([i]).get("selectedUnits");
            grade = subjects.get([i]).get("grade");
            if (name.value == '' || units.errors || grade.errors)
                return { errorInFields: true };
        }
        return null;
    };
    //validation function: check if there are any duplicate subjects
    GradeInputComponent.prototype.checkSubjectDuplication = function (fg) {
        var subCount = 0;
        var subjectsFormArrays = [];
        subjectsFormArrays.push(fg.get("selectedSubjects"));
        var applicantSubjects = [];
        subjectsFormArrays.forEach(function (subjectForm) {
            for (var i = 0; i < subjectForm.length; i++) {
                var units = subjectForm.get([i]).get("selectedUnits").value;
                var id = subjectForm.get([i]).get("id").value;
                if (!units || !id) {
                    continue;
                }
                var type = subjectForm.get([i]).get("selectedType").value === 1;
                applicantSubjects.push({
                    id: id,
                    type: type,
                    units: units,
                    subjectFormGroup: subjectForm.get([i]),
                    suid: [id, type, units].join("_")
                });
            }
        });
        // find duplicate values in applicant subjects
        var counts = {};
        var duplicateSubjectFormGroups = [];
        for (var i = 0; i < applicantSubjects.length; i++) {
            var aSubject = applicantSubjects[i];
            if (!counts[aSubject.suid]) {
                counts[aSubject.suid] = 1;
            }
            else {
                counts[aSubject.suid]++;
            }
            aSubject.subjectFormGroup.isDuplicate = false;
            if (counts[aSubject.suid] >= 2) {
                duplicateSubjectFormGroups.push(aSubject.subjectFormGroup);
            }
        }
        // Now highlight the duplicates
        duplicateSubjectFormGroups.forEach(function (subject) {
            subject.isDuplicate = true;
        });
        return duplicateSubjectFormGroups.length <= 0 ? null : { hasDuplicates: true };
    };
    //event: the submit button was clicked so try to process the data if there are no validation errors
    GradeInputComponent.prototype.onSubmitForm = function (form, event) {
        var _this = this;
        if (this.gettingResult)
            return;
        event.preventDefault();
        this.submitAttempt = true;
        var subjects = form.get("selectedSubjects");
        if (!form.valid) {
            if (this.gradeForm.getError("errorInFields")) {
                this.resultAlert.showErrorAlert("קיימים שדות לא מאוכלסים. נא למלא את השדה או להסיר את המקצוע מהרשימה.");
                window.scrollTo(0, 0);
                return;
            }
            if (this.gradeForm.getError("hasDuplicates")) {
                this.resultAlert.showErrorAlert("שילוב של מקצוע + יחידות לימוד + סוג בחינה חייב להיות יחודי.");
                window.scrollTo(0, 0);
                return;
            }
            if (this.gradeForm.getError("maxExceeded")) {
                this.resultAlert.showErrorAlert("ניתן להזין עד " + this.stateObject.maxSubjects + " מקצועות בלבד.");
                window.scrollTo(0, 0);
                return;
            }
        }
        if (form.valid) {
            //format the data before sending it to the server
            var data = new __WEBPACK_IMPORTED_MODULE_7__form_data__["a" /* FormData */]();
            data.Year = this.stateObject.selectedYear.value.name;
            data.SectorID = this.stateObject.selectedSector.value.id;
            data.Subjects = [];
            for (var i = 0; i < this.stateObject.selectedSubjects.length; i++) {
                var sub = this.stateObject.selectedSubjects[i];
                data.Subjects.push({ SubjectID: sub.id, IsProject: sub.isPaper, Points: sub.units, Grade: sub.grade });
            }
            this.gettingResult = true;
            var response = this.getData.sendData("calculate", data)
                .then(function (result) {
                //if there are no errors in calculations, update the stateObject and navigate to the next page
                if (result.Status === "OK") {
                    _this.stateObject.step = __WEBPACK_IMPORTED_MODULE_2__get_data_service__["b" /* Steps */].CalcAverage;
                    _this.router.navigateByUrl('/calc-average');
                }
                else {
                    _this.gettingResult = false;
                    _this.resultAlert.showResultAlert(result);
                    window.scrollTo(0, 0);
                }
            });
        }
        else {
            window.scrollTo(0, 0);
        }
    };
    Object.defineProperty(GradeInputComponent.prototype, "subjectData", {
        //this property is needed as per Angular v4.0.0 in order to suppress the build error generated by iterating over a FormArray in the markup
        get: function () {
            return this.gradeForm.get('selectedSubjects');
        },
        enumerable: true,
        configurable: true
    });
    __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["ViewChild"])('pAutoComplete'),
        __metadata("design:type", __WEBPACK_IMPORTED_MODULE_1_primeng_primeng__["AutoComplete"])
    ], GradeInputComponent.prototype, "pAutoComplete", void 0);
    __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["ViewChild"])('ResultAlert'),
        __metadata("design:type", __WEBPACK_IMPORTED_MODULE_6__result_alert_component__["a" /* ResultAlertComponent */])
    ], GradeInputComponent.prototype, "resultAlert", void 0);
    __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["ViewChild"])('testdiv'),
        __metadata("design:type", __WEBPACK_IMPORTED_MODULE_0__angular_core__["ElementRef"])
    ], GradeInputComponent.prototype, "testdiv", void 0);
    GradeInputComponent = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Component"])({
            selector: 'app-grade-input',
            template: __webpack_require__("./src/app/calculator/grade-input/grade-input.component.html"),
            styles: [__webpack_require__("./src/app/calculator/grade-input/grade-input.component.css")]
        }),
        __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_2__get_data_service__["a" /* GetDataService */], __WEBPACK_IMPORTED_MODULE_3__angular_router__["Router"], __WEBPACK_IMPORTED_MODULE_4__angular_forms__["FormBuilder"], __WEBPACK_IMPORTED_MODULE_0__angular_core__["ElementRef"]])
    ], GradeInputComponent);
    return GradeInputComponent;
}());



/***/ }),

/***/ "./src/app/calculator/model/app-state.model.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return AppState; });
var AppState = /** @class */ (function () {
    function AppState() {
    }
    return AppState;
}());



/***/ }),

/***/ "./src/app/calculator/model/applicant-subject.class.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return ApplicantSubject; });
var ApplicantSubject = /** @class */ (function () {
    function ApplicantSubject(id, name, units, grade, isPaper) {
        this.id = id;
        this.name = name;
        this.units = units;
        this.grade = grade;
        this.isPaper = isPaper;
    }
    return ApplicantSubject;
}());



/***/ }),

/***/ "./src/app/calculator/model/bagrut-subject.class.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return BagrutSubject; });
var BagrutSubject = /** @class */ (function () {
    function BagrutSubject(subjectID, subjectName) {
        this.id = subjectID;
        this.name = subjectName;
    }
    return BagrutSubject;
}());



/***/ }),

/***/ "./src/app/calculator/model/calc-result-status.enum.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return CalcResultStatus; });
var CalcResultStatus;
(function (CalcResultStatus) {
    CalcResultStatus[CalcResultStatus["OK"] = 0] = "OK";
    CalcResultStatus[CalcResultStatus["MandatoryMissing"] = 1] = "MandatoryMissing";
    CalcResultStatus[CalcResultStatus["PointsMissing"] = 2] = "PointsMissing";
    CalcResultStatus[CalcResultStatus["MissingIntensiveSubjects"] = 3] = "MissingIntensiveSubjects";
})(CalcResultStatus || (CalcResultStatus = {}));


/***/ }),

/***/ "./src/app/calculator/result-alert.component.html":
/***/ (function(module, exports) {

module.exports = "<p *ngIf=\"resultString\">\r\n  <alert [dismissible]=\"false\" [type]=\"alertType\">\r\n    <span [innerHTML]=\"resultString\"></span>\r\n    <ul *ngIf=\"subjectArray\">\r\n      <li *ngFor=\"let subject of subjectArray\" attr.aria-label=\"{{subject.SubjectName}}\" tabindex=\"0\">\r\n          {{subject.SubjectName}}\r\n      </li>\r\n    </ul>\r\n  </alert>\r\n</p>"

/***/ }),

/***/ "./src/app/calculator/result-alert.component.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return ResultAlertComponent; });
/* unused harmony export AlertType */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("./node_modules/@angular/core/esm5/core.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__model_calc_result_status_enum__ = __webpack_require__("./src/app/calculator/model/calc-result-status.enum.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__get_data_service__ = __webpack_require__("./src/app/calculator/get-data.service.ts");
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};



var ResultAlertComponent = /** @class */ (function () {
    function ResultAlertComponent(getData) {
        this.getData = getData;
        this.subjectArray = [];
    }
    //display text reflecting the error returned from the server
    ResultAlertComponent.prototype.showResultAlert = function (calcResult) {
        this.subjectArray = [];
        switch (calcResult.Status) {
            case __WEBPACK_IMPORTED_MODULE_1__model_calc_result_status_enum__["a" /* CalcResultStatus */][__WEBPACK_IMPORTED_MODULE_1__model_calc_result_status_enum__["a" /* CalcResultStatus */].MandatoryMissing]:
                this.resultString = "מקצועות החובה הבאים חסרים או שאינם נלמדים עם כמות יחידות מספקת: ";
                this.subjectArray = calcResult.MissingSubjects;
                this.getData.getSubjectNames(this.subjectArray, false);
                this.alertType = AlertType[AlertType.danger];
                break;
            case __WEBPACK_IMPORTED_MODULE_1__model_calc_result_status_enum__["a" /* CalcResultStatus */][__WEBPACK_IMPORTED_MODULE_1__model_calc_result_status_enum__["a" /* CalcResultStatus */].PointsMissing]:
                this.resultString = "\u05D7\u05E1\u05E8\u05D5\u05EA " + calcResult.MissingPoints + " \u05E0\u05E7\u05D5\u05D3\u05D5\u05EA \u05D1\u05D2\u05E8\u05D5\u05EA";
                this.alertType = AlertType[AlertType.danger];
                break;
            case __WEBPACK_IMPORTED_MODULE_1__model_calc_result_status_enum__["a" /* CalcResultStatus */][__WEBPACK_IMPORTED_MODULE_1__model_calc_result_status_enum__["a" /* CalcResultStatus */].MissingIntensiveSubjects]:
                this.resultString = "\u05DE\u05E7\u05E6\u05D5\u05E2\u05D5\u05EA \u05DE\u05D5\u05D2\u05D1\u05E8\u05D9\u05DD \u05D7\u05E1\u05E8\u05D9\u05DD";
                this.alertType = AlertType[AlertType.danger];
                break;
            case __WEBPACK_IMPORTED_MODULE_1__model_calc_result_status_enum__["a" /* CalcResultStatus */][__WEBPACK_IMPORTED_MODULE_1__model_calc_result_status_enum__["a" /* CalcResultStatus */].OK]:
                var average = (calcResult.MarkAverage).toFixed(2);
                this.resultString = "\u05DE\u05DE\u05D5\u05E6\u05E2 \u05D1\u05D2\u05E8\u05D5\u05EA " + average;
                this.alertType = AlertType[AlertType.success];
        }
    };
    //display text reflecting validation errors coming from the form 
    ResultAlertComponent.prototype.showErrorAlert = function (errorString) {
        this.resultString = errorString;
        this.alertType = AlertType[AlertType.danger];
    };
    //hide the alert element
    ResultAlertComponent.prototype.hideAlert = function () {
        this.resultString = "";
    };
    ResultAlertComponent = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Component"])({
            selector: 'result-alert',
            template: __webpack_require__("./src/app/calculator/result-alert.component.html")
        }),
        __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_2__get_data_service__["a" /* GetDataService */]])
    ], ResultAlertComponent);
    return ResultAlertComponent;
}());

var AlertType;
(function (AlertType) {
    AlertType[AlertType["success"] = 0] = "success";
    AlertType[AlertType["info"] = 1] = "info";
    AlertType[AlertType["warning"] = 2] = "warning";
    AlertType[AlertType["danger"] = 3] = "danger";
})(AlertType || (AlertType = {}));


/***/ }),

/***/ "./src/environments/environment.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return environment; });
var environment = {
    baseURL: 'https://bagrut-calculator.huji.ac.il/api',
    useCurrentYear: true,
    production: true,
    envName: 'prod'
};
//deployment: ng b --environment=prod -base-href="/calculator/"
//ng b --environment=prod  --outputHashing=all --prod -base-href="/calculator/ 


/***/ }),

/***/ "./src/main.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("./node_modules/@angular/core/esm5/core.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_platform_browser_dynamic__ = __webpack_require__("./node_modules/@angular/platform-browser-dynamic/esm5/platform-browser-dynamic.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__app_app_module__ = __webpack_require__("./src/app/app.module.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__environments_environment__ = __webpack_require__("./src/environments/environment.ts");




if (__WEBPACK_IMPORTED_MODULE_3__environments_environment__["a" /* environment */].production) {
    Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["enableProdMode"])();
}
Object(__WEBPACK_IMPORTED_MODULE_1__angular_platform_browser_dynamic__["a" /* platformBrowserDynamic */])().bootstrapModule(__WEBPACK_IMPORTED_MODULE_2__app_app_module__["a" /* AppModule */]);


/***/ }),

/***/ 0:
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__("./src/main.ts");


/***/ })

},[0]);
//# sourceMappingURL=main.0d6b407569fd2c77d3b2.bundle.js.map