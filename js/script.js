/*! waitForImages jQuery Plugin 2013-07-20 */
!function(a){var b="waitForImages";a.waitForImages={hasImageProperties:["backgroundImage","listStyleImage","borderImage","borderCornerImage","cursor"]},a.expr[":"].uncached=function(b){if(!a(b).is('img[src!=""]'))return!1;var c=new Image;return c.src=b.src,!c.complete},a.fn.waitForImages=function(c,d,e){var f=0,g=0;if(a.isPlainObject(arguments[0])&&(e=arguments[0].waitForAll,d=arguments[0].each,c=arguments[0].finished),c=c||a.noop,d=d||a.noop,e=!!e,!a.isFunction(c)||!a.isFunction(d))throw new TypeError("An invalid callback was supplied.");return this.each(function(){var h=a(this),i=[],j=a.waitForImages.hasImageProperties||[],k=/url\(\s*(['"]?)(.*?)\1\s*\)/g;e?h.find("*").addBack().each(function(){var b=a(this);b.is("img:uncached")&&i.push({src:b.attr("src"),element:b[0]}),a.each(j,function(a,c){var d,e=b.css(c);if(!e)return!0;for(;d=k.exec(e);)i.push({src:d[2],element:b[0]})})}):h.find("img:uncached").each(function(){i.push({src:this.src,element:this})}),f=i.length,g=0,0===f&&c.call(h[0]),a.each(i,function(e,i){var j=new Image;a(j).on("load."+b+" error."+b,function(a){return g++,d.call(i.element,g,f,"load"==a.type),g==f?(c.call(h[0]),!1):void 0}),j.src=i.src})})}}(jQuery);

var mySwiper;
var loadedSlides = new Array();
var separator = '|||';

$(document).on("pageload",function() {
	initiateScripts();
});
$(document).ready(function() {
	initiateScripts();
});
function initiateScripts(){
	$('[data-swipe="right"]').click(function() {
		toggleLeftSideBar();
	});
	$('[data-swipe="left"]').click(function() {
		toggleRightSideBar();
	});
	buildSwiper();
	var schowekSet = localStorage.getItem('schowek');
	if(schowekSet){
		if(typeof schowekUrlPre=='undefined')schowekUrlPre='../../';
		$(".controls2").prepend('<a href="'+schowekUrlPre+'schowek.html" style="margin-right:10px" data-ajax="false" id="schowekIcon"><img src="'+schowekUrlPre+'img/icon-clipboard.png" alt=""></a>');
	}
}
function buildSwiper(){
	mySwiper = $('.swiper-container').swiper({
		resizeReInit: true,
		updateOnImagesReady: true,
		onFirstInit: function(s){
			if(typeof slides[1]!='undefined'){
				$.get(slides[1],function(r1){
					$(r1).hide();
					$(".swiper-wrapper").load(slides[0],function(r2){
						$(".swiper-wrapper").append(r1);
						mySwiper.reInit();
						loadedSlides.push(slides[0]);
						loadedSlides.push(slides[1]);
						updateSwiperHeight();
						
						if(getHash()){
							var hash = getHash();
							if(typeof slides.indexOf(hash)!='undefined'){
								var position = slides.indexOf(hash);
								swipeTo(position);
							}
						}
						
					});
				});
			} else {
				$(".swiper-wrapper").load(slides[0],function(r2){
					mySwiper.reInit();
					loadedSlides.push(slides[0]);
					updateSwiperHeight();
				});
			}
			$('.slides_left').html(slides.length);
		},
		onSlideChangeEnd:function(s,d){
			$('.actual_slide').html((mySwiper.activeIndex+1));
			if(typeof slides[mySwiper.activeIndex+1]!='undefined' && slides.length > loadedSlides.length && ((mySwiper.activeIndex+1)==loadedSlides.length) && (d=='next' || (d=='to' && typeof loadedSlides[mySwiper.activeIndex+1]=='undefined'))){
				$.get(slides[mySwiper.activeIndex+1],function(data){
					loadedSlides.push(slides[mySwiper.activeIndex+1]);
					var newSlide = mySwiper.createSlide($(data).html());
					newSlide.append();
					updateSwiperHeight();
				});
			} else {
				updateSwiperHeight();
			}
		},
		onImagesReady:function(){
			updateSwiperHeight();
		}
	});
	
	alreadyclicked=false;
	$('#sub_bar .arrow-right').bind('click',function(){
		var el=$(this);
		if (alreadyclicked){
			alreadyclicked=false;
			clearTimeout(alreadyclickedTimeout);
		} else {
			alreadyclicked=true;
			alreadyclickedTimeout=setTimeout(function(){
				alreadyclicked=false;
				mySwiper.swipeNext();
			},200);
		}
		return false;
	});
	$('#sub_bar .arrow-left').bind('click',function(){
		var el=$(this);
		if (alreadyclicked){
			alreadyclicked=false;
			clearTimeout(alreadyclickedTimeout);
		} else {
			alreadyclicked=true;
			alreadyclickedTimeout=setTimeout(function(){
				alreadyclicked=false;
				mySwiper.swipePrev();
			},200);
		}
		return false;
	});
	//window.addEventListener('orientationchange', updateSwiperHeight);
	window.onresize = function(event) {
		//mySwiper.reInit();
		updateSwiperHeight();
	};
}
function updateSwiperHeight(){
	var totalHeight = 0;
	$('.swiper-slide-active').waitForImages(function() {
		$(".swiper-slide-active").children().each(function(){
			totalHeight += $(this).outerHeight(true);
		});
		$(".swiper-wrapper, .swiper-slide").height(totalHeight);
	});
	var mp = $('.magnificPopup');
	if(typeof mp != 'undefined' && mp.length>0){
		$('.magnificPopup').magnificPopup({
			tClose: 'Zamknij (Esc)',
			tLoading: 'Wczytuję...',
			type: 'image',
			gallery: {
				enabled: true,
				tPrev: 'Poprzednie',
				tNext: 'Następne',
				tCounter: '%curr% z %total%'
			},
			image: {
				tError: 'Nie można wgrać zdjęcia.',
				titleSrc: function(item) {
					var t = item.el.attr('title');
					var s = item.el.data();
					if(typeof t!='undefined'){
						if(typeof s.slide!='undefined'){
							var i = slides.indexOf(s.slide);
							if(i!=mySwiper.activeIndex){
								return t + '<small><a onclick="swipeTo('+i+')">przejdź do strony produktu</a></small>';
							} else {
								return t;
							}
						} else {
							return t;
						}
					}
				}
			}
		});
	}
}
function swipeTo(index){
	if(index>(mySwiper.slides.length-1)){
		var roznica = index - (mySwiper.slides.length-1);
		for(var i=mySwiper.slides.length;i<(roznica+mySwiper.slides.length);i++){
			$.get(slides[i],function(data){
				loadedSlides.push(slides[i]);
				var newSlide = mySwiper.createSlide($(data).html());
				newSlide.append();
				mySwiper.swipeTo(index, 300, true);
			});
		}
	} else {
		mySwiper.swipeTo(index, 300, true);
	}
	$.magnificPopup.close();
}
function contentSwipeLeftHandler(event){
	var position = $(".ui-page-active .content").hasClass("open-right") ? 'left' : ($(".ui-page-active .content").hasClass("open-left") ? 'right' : 'center');
	switch(position){
	case 'center':
		toggleRightSideBar();
		break;
	case 'right':
		toggleLeftSideBar();
		break;
	}
}
function contentSwipeRightHandler(event){
	var position = $(".ui-page-active .content").hasClass("open-right") ? 'left' : ($(".ui-page-active .content").hasClass("open-left") ? 'right' : 'center');
	switch(position){
	case 'center':
		toggleLeftSideBar();
		break;
	case 'left':
		if(event.target.className == 'sidebar-arrow'){
			toggleRightSideBar();
		}
		break;
	}
}
function toggleLeftSideBar(){
	$(".ui-page-active .content").toggleClass("open-left");
	$(".ui-page-active .controls1").toggleClass("active");
	$(".ui-page-active .left-sidebar").toggleClass("open");
	$(".ui-page-active .right-sidebar").hide();
}
function toggleRightSideBar(){
	$(".ui-page-active .content").toggleClass("open-right");
	$(".ui-page-active .controls2").toggleClass("active");
	$(".ui-page-active .right-sidebar").toggleClass("open");
	$(".ui-page-active .left-sidebar").hide();
	if(typeof GoogleMap != 'undefined'){
		if(!$(".ui-page-active #map_canvas").hasClass("loaded")){
			$(".ui-page-active .right-sidebar .sidebar-arrow p").html('Łączenie...');
			var gmap = new GoogleMap();
			gmap.initialize();
		} else {
			$(".ui-page-active").find('#map_canvas').removeClass("loading").html('<div class="error">Geolokalizacja wyłączona.</div>');
			$(".ui-page-active .right-sidebar .sidebar-arrow p").html('Brak połączenia');
		}
	} else {
		$(".ui-page-active").find('#map_canvas').removeClass("loading").html('<div class="error">Geolokalizacja wyłączona.</div>');
		$(".ui-page-active .right-sidebar .sidebar-arrow p").html('Brak połączenia');
	}
	window.setInterval(function() {
		var x = $(".ui-page-active .right-sidebar .sidebar-arrow p").html();
		if(x=='Ustalanie pozycji...' || x=='Łączenie...'){
			$(".ui-page-active .right-sidebar .sidebar-arrow p").html('Błąd połączenia!');
		} else if(x=='Łączenie z Google...'){
			geolocationError();
		}
	}, 10000);
}
function schowekAdd(page,title){
	var notExists = true;
	var s = new Array();
	var i = {'item':page + separator + title};
	var schowekSet = localStorage.getItem('schowek');
	if(schowekSet){
		var schowek = JSON.parse(localStorage.getItem('schowek'));
		schowek.map(function(d){
			if(d.item == page + separator + title){
				notExists = false;
			}
		});
		var array = $.map(schowek, function(value, index) {
			return [value];
		});
		s = array;
	}
	if(notExists){
		s.push(i);
	}
	localStorage.setItem('schowek', JSON.stringify(s));
}
function schowekRemove(page,title){
	var s = new Array();
	var schowekSet = localStorage.getItem('schowek');
	if(schowekSet){
		var schowek = JSON.parse(localStorage.getItem('schowek'));
		schowek.map(function(d){
			if(d.item == page + separator + title){
				delete d.item;
			}
		});
		var array = $.map(schowek, function(value, index) {
			return [value];
		});
		s = array;
		localStorage.setItem('schowek', JSON.stringify(s));
		var tr = document.getElementById(page+title);
		tr.outerHTML = "";
		delete tr;
	}
}
function schowekList(){
	var schowekDiv = document.getElementById('schowek');
	var schowekSet = localStorage.getItem('schowek');
	if(schowekSet){
		var table = document.createElement('table');
		var rows = 0;
		var schowek = JSON.parse(localStorage.getItem('schowek'));
		for (var key in schowek) {
			if(schowek.hasOwnProperty(key)) {
				var obj = schowek[key];
				for (var prop in obj) {
					if (obj.hasOwnProperty(prop)) {
						var s = obj[prop].split(separator);
						var row = table.insertRow(rows);
						$(row).attr('id',s[0]+s[1]);
						var cell1 = row.insertCell(0);
						var cell2 = row.insertCell(1);
						$(cell2).width(120);
						cell1.innerHTML = "<a onclick=\"schowekGo('"+s[0]+"')\">"+s[1]+"</a>";
						var removeButton = document.createElement('a');
						removeButton.addEventListener('click', function(){schowekRemove(s[0],s[1]);}, false);
						removeButton.innerHTML = 'usuń z listy';
						removeButton.className = 'ui-btn ui-btn-inline ui-icon-delete ui-btn-icon-left';
						cell2.appendChild(removeButton);
						rows++;
					}
				}
			}
		}
		schowekDiv.appendChild(table);
	}
}
function schowekGo(page){
	var s = page.split("/");
	window.location.href = "pages/"+s[0]+"/index.html#"+s[1];
}
function getHash() {
	if (window.location.hash) {
		var hash = window.location.hash.substring(1);
		if (hash.length === 0) { return false; }
		else { return hash; }
	} else { return false; }
}