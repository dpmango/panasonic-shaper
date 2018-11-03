$(document).ready(function(){

  //////////
  // Global variables
  //////////

  var _window = $(window);
  var _document = $(document);

  ////////////
  // READY - triggered when PJAX DONE
  ////////////
  legacySupport();

  function pageReady(){
    updateHeaderActiveClass();
    positionElements();

    // initScroller();
  }

  _window.on('resize', debounce(positionElements, 50))
  _window.on('resize', throttle(minHeight, 50))
  _window.on('resize', debounce(setBreakpoint, 200))

  // this is a master function which should have all functionality
  pageReady();

  _window.on('load', function(){
    minHeight();
  })

  _window.on("load ready", viewportControl);
  _window.on("resize", debounce(viewportControl, 200));

  //////////
  // COMMON
  //////////

  function legacySupport(){
    // svg support for laggy browsers
    svg4everybody();

    // Viewport units buggyfill
    window.viewportUnitsBuggyfill.init({
      force: false,
      refreshDebounceWait: 150,
      appendToBody: true
    });
  }


  // Prevent # behavior
	_document
    .on('click', '[href="#"]', function(e) {
  		e.preventDefault();
  	})
    .on('click', 'a[href^="#section"]', function() { // section scroll
      var el = $(this).attr('href');
      $('body, html').animate({
          scrollTop: $(el).offset().top}, 1000);
      return false;
    })


  // HAMBURGER TOGGLER
  _document.on('click', '[js-hamburger]', function(){
    $(this).toggleClass('is-active');
    $('.mobile-navi').toggleClass('is-active');
  });

  _document.on('click', function(e){
    if (
      $(event.target).closest('.header').length === 0 ) {
      closeMobileMenu();
    }
  })

  function closeMobileMenu(){
    $('[js-hamburger]').removeClass('is-active');
    $('.mobile-navi').removeClass('is-active');
  }

  // SET ACTIVE CLASS IN HEADER
  // * could be removed in production and server side rendering when header is inside barba-container
  function updateHeaderActiveClass(){
    $('.header__menu li').each(function(i,val){
      if ( $(val).find('a').attr('href') == window.location.pathname.split('/').pop() ){
        $(val).addClass('is-active');
      } else {
        $(val).removeClass('is-active')
      }
    });
  }

  //////////
  // POSITION ELEMENTS
  //////////
  function positionElements(){
    var wWidth = _window.width();
    var containerPadding = _window.width() <= 992 ? 20 : 40
    var containerWidth = 1530 + containerPadding * 2
    var wDiff = wWidth - containerWidth
    var sidebar = {
      $el: $('[js-position-sidebar]'),
      right: 40
    }

    if ( wDiff <= 0 ){
      sidebar.right = containerPadding // stick to the container border
    } else {
      sidebar.right = containerPadding + (wDiff / 2) // stick to container border and mind container margin auto
    }

    sidebar.$el.css({
      'right': sidebar.right
    })
  }

  //////////
  // MIN HEIGHT
  //////////
  function minHeight(){
    if ( $('[js-min-height]').length > 0 ) {
      var wWidth = _window.width();

      // for example keep sidebar always visible
      $('[js-min-height]').each(function(i, el){
        var $el = $(el);
        var $target = $($el.data('target'));
        var targetHeight = Math.round($target.outerHeight());
        var stopListen = wWidth <= $el.data('stop')

        if ( stopListen ){
          $el.attr('style', '');
        } else {
          $el.css({
            'min-height': targetHeight
          })
        }

      })
    }
  }


  //////////
  // Scroller
  //////////
  var html = document.documentElement;
  var body = document.body;

  var scroller = {
    target: document.querySelector(".page"),
    ease: 0.05, // <= scroll speed
    endY: 0,
    y: 0,
    resizeRequest: 1,
    scrollRequest: 0,
  };

  var requestId = null;

  TweenLite.set(scroller.target, {
    rotation: 0.01,
    force3D: true
  });


  window.addEventListener("load", onLoad);

  function onLoad() {
    updateScroller();
    window.focus();
    window.addEventListener("resize", onResizeScroller);
    document.addEventListener("scroll", onScrollScroller);
  }

  function updateScroller() {

    var resized = scroller.resizeRequest > 0;

    if (resized) {
      var height = scroller.target.clientHeight;
      body.style.height = height + "px";

      scroller.resizeRequest = 0;
    }

    var scrollY = window.pageYOffset || html.scrollTop || body.scrollTop || 0;

    scroller.endY = scrollY;
    scroller.y += (scrollY - scroller.y) * scroller.ease;

    if (Math.abs(scrollY - scroller.y) < 0.05 || resized) {
      scroller.y = scrollY;
      scroller.scrollRequest = 0;
    }

    TweenLite.set(scroller.target, {
      y: -scroller.y
    });

    requestId = scroller.scrollRequest > 0 ? requestAnimationFrame(updateScroller) : null;
  }

  function onScrollScroller(e) {
    scroller.scrollRequest++;
    if (!requestId) {
      requestId = requestAnimationFrame(updateScroller);
    }
  }

  function onResizeScroller() {
    scroller.resizeRequest++;
    if (!requestId) {
      requestId = requestAnimationFrame(updateScroller);
    }
  }



  //////////
  // BARBA PJAX
  //////////
  var easingSwing = [.02, .01, .47, 1]; // default jQuery easing for anime.js

  Barba.Pjax.Dom.containerClass = "page";

  var FadeTransition = Barba.BaseTransition.extend({
    start: function() {
      Promise
        .all([this.newContainerLoading, this.fadeOut()])
        .then(this.fadeIn.bind(this));
    },

    fadeOut: function() {
      var deferred = Barba.Utils.deferred();

      anime({
        targets: this.oldContainer,
        opacity : .5,
        easing: easingSwing, // swing
        duration: 300,
        complete: function(anim){
          deferred.resolve();
        }
      })

      return deferred.promise
    },

    fadeIn: function() {
      var _this = this;
      var $el = $(this.newContainer);

      $(this.oldContainer).hide();

      $el.css({
        visibility : 'visible',
        opacity : .5
      });

      anime({
        targets: "html, body",
        scrollTop: 1,
        easing: easingSwing, // swing
        duration: 150
      });

      anime({
        targets: this.newContainer,
        opacity: 1,
        easing: easingSwing, // swing
        duration: 300,
        complete: function(anim) {
          triggerBody()
          _this.done();
        }
      });
    }
  });

  // set barba transition
  Barba.Pjax.getTransition = function() {
    return FadeTransition;
  };

  Barba.Prefetch.init();
  Barba.Pjax.start();

  Barba.Dispatcher.on('newPageReady', function(currentStatus, oldStatus, container, newPageRawHTML) {

    pageReady();
    closeMobileMenu();

  });

  // some plugins get bindings onNewPage only that way
  function triggerBody(){
    _window.scrollTop(0);
    $(window).scroll();
    $(window).resize();
  }

  //////////
  // viewport controll
  //////////
  function viewportControl() {
    let viewportMeta = _document.find('meta[name="viewport"]');

    if (!viewportMeta.length > 0) return;

    console.log(screen.width)
    if (screen.width <= 640) {
      viewportMeta.attr('content', 'width=640, user-scalable=no');
    } else {
      viewportMeta.attr('content', 'width=device-width, initial-scale=1, minimum-scale=1, user-scalable=no');
    }
  }

  //////////
  // DEVELOPMENT HELPER
  //////////
  function setBreakpoint(){
    var wHost = window.location.host.toLowerCase()
    var displayCondition = wHost.indexOf("localhost") >= 0 || wHost.indexOf("surge") >= 0
    if (displayCondition){
      var wWidth = _window.width();

      var content = "<div class='dev-bp-debug'>"+wWidth+"</div>";

      $('.page').append(content);
      setTimeout(function(){
        $('.dev-bp-debug').fadeOut();
      },1000);
      setTimeout(function(){
        $('.dev-bp-debug').remove();
      },1500)
    }
  }

  //////////
  // TEST to parse all svg stroke length
  //////////
  // $('.bg-image__beard svg .stroke').each(function(i, path){
  //   var length = Math.ceil(path.getTotalLength());
  //   console.log($(path).attr('class'), length)
  // })

});
