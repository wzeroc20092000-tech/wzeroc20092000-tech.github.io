$(function () {
  var $body = $("body");
  var $loader = $(".loader");
  var $count = $(".loader__count span");
  var $bar = $(".loader__bar");
  var n = 0;

  function paintLoader(value) {
    $count.text(("00" + value).slice(-3));
    $bar.css("transform", "scaleX(" + value / 100 + ")");
  }

  var timer = setInterval(function () {
    n = Math.min(100, n + (n < 74 ? Math.ceil(Math.random() * 5) : 1));
    paintLoader(n);
    if (n < 100) return;
    clearInterval(timer);
    setTimeout(function () {
      $loader.addClass("loader--done");
      $body.addClass("page--ready");
      spinReel();
      showText($(".hero .tx, .hero__scroll.tx"));
      setTimeout(function () {
        $body.removeClass("page--lock");
      }, 900);
    }, 280);
  }, 36);

  function spinReel() {
    var $num = $(".hero__num");
    var goal = String(parseInt($num.data("count"), 10));
    var turns = [1, 2];
    $num.empty().attr("aria-label", goal);
    for (var i = 0; i < goal.length; i++) {
      var digit = parseInt(goal.charAt(i), 10);
      var index = (turns[i] || 2) * 10 + digit;
      var $strip = $("<span class='hero__strip'></span>");
      for (var d = 0; d <= index; d++) {
        $strip.append($("<span></span>").text(d % 10));
      }
      $num.append($("<span class='hero__reel' aria-hidden='true'></span>").append($strip).data("index", index));
    }
    $num[0].offsetHeight;
    $num.addClass("hero__num--spin");
    $num.find(".hero__reel").each(function () {
      $(this).find(".hero__strip").css("--reel-index", $(this).data("index"));
    });
  }

  $(".header__link, .hero__scroll, .header__logo").on("click", function (e) {
    var href = $(this).attr("href");
    if (!href || href.charAt(0) !== "#") return;
    var $target = $(href === "#top" ? "body" : href);
    if (!$target.length && href !== "#top") return;
    e.preventDefault();
    $(".header__nav").removeClass("header__nav--open");
    $(".header__menu").attr("aria-expanded", "false");
    $body.removeClass("page--lock");
    $("html, body").animate({ scrollTop: href === "#top" ? 0 : $target.offset().top - 20 }, 700);
  });

  $(".header__menu").on("click", function () {
    var open = $(".header__nav").toggleClass("header__nav--open").hasClass("header__nav--open");
    $(this).attr("aria-expanded", open);
    $body.toggleClass("page--lock", open);
  });

  var $logo = $(".header__logo");
  var $title = $(".hero h1 .hero__line span");
  var $hero = $(".hero");
  var $header = $(".header");
  var $fly = $("<span class='hero__fly' aria-hidden='true'>塩澤悠樹</span>").appendTo("body");
  var nameState = "hero";
  var flyTimer = null;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function viewBox(el) {
    var r = el.getBoundingClientRect();
    return { left: r.left, top: r.top, fontSize: $(el).css("font-size") };
  }

  function pageBox(el) {
    var r = el.getBoundingClientRect();
    return {
      left: r.left + window.scrollX,
      top: r.top + window.scrollY,
      fontSize: $(el).css("font-size")
    };
  }

  function pinFixed(box) {
    $fly.css({
      position: "fixed",
      transition: "none",
      opacity: 1,
      left: box.left,
      top: box.top,
      fontSize: box.fontSize
    });
  }

  var flyEase = ".55s cubic-bezier(.16,1,.3,1)";

  function beginHeaderShrink() {
    var from = viewBox($title[0]);
    var logo = viewBox($logo[0]);
    pinFixed(from);
    $fly[0].offsetWidth;
    $fly.css({
      transition: "left " + flyEase + ", top " + flyEase + ", font-size " + flyEase,
      left: logo.left,
      top: logo.top,
      fontSize: logo.fontSize
    });
    clearTimeout(flyTimer);
    flyTimer = setTimeout(function () {
      if (nameState !== "to-header") return;
      $header.addClass("header--named");
      $fly.css({ opacity: 0, transition: "none" });
      nameState = "header";
    }, 570);
  }

  function titleReady() {
    return $title[0].getBoundingClientRect().top >= $logo[0].getBoundingClientRect().top - 1;
  }

  function beginReturnGrow() {
    var from = pageBox($logo[0]);
    var home = pageBox($title[0]);
    $header.removeClass("header--named");
    $fly.css({
      position: "absolute",
      transition: "none",
      opacity: 1,
      left: from.left,
      top: from.top,
      fontSize: $logo.css("font-size")
    });
    $fly[0].offsetWidth;
    $fly.css({
      transition: "left " + flyEase + ", top " + flyEase + ", font-size " + flyEase,
      left: home.left,
      top: home.top,
      fontSize: home.fontSize
    });
    clearTimeout(flyTimer);
    flyTimer = setTimeout(function () {
      if (nameState !== "to-hero") return;
      $hero.removeClass("hero--away");
      $fly.css({ opacity: 0, transition: "none", position: "fixed" });
      nameState = "hero";
    }, 570);
  }

  function settleName() {
    var ready = titleReady();

    if (!ready && nameState !== "header" && nameState !== "to-header") {
      $hero.addClass("hero--away");
      $header.removeClass("header--named");
      nameState = "to-header";
      if (reduceMotion) {
        $header.addClass("header--named");
        $fly.css({ opacity: 0, transition: "none" });
        nameState = "header";
        return;
      }
      beginHeaderShrink();
    } else if (ready && nameState !== "hero" && nameState !== "to-hero") {
      $hero.addClass("hero--away");
      nameState = "to-hero";
      if (reduceMotion) {
        $header.removeClass("header--named");
        $hero.removeClass("hero--away");
        $fly.css({ opacity: 0, transition: "none", position: "fixed" });
        nameState = "hero";
        return;
      }
      if (titleReady()) beginReturnGrow();
      else {
        $header.addClass("header--named");
        $fly.css({ opacity: 0, transition: "none", position: "fixed" });
      }
    } else if (ready && nameState === "to-hero" && $header.hasClass("header--named")) {
      beginReturnGrow();
    }
  }

  function showText($set) {
    $set.each(function (i) {
      var $in = $(this).children(".tx__in");
      $in.css("transition-delay", Math.min(i, 10) * 0.07 + "s");
      $(this).addClass("tx--on");
    });
  }

  $(
    ".hero__index, .hero__role, .hero__lead, .hero__label, .hero__scroll," +
    ".section__head .eyebrow, .section__head h2," +
    ".card .card__no, .card h3, .card > p," +
    ".work__no, .work__name, .work__kind, .work__client, .work__inner p, .work__tags li, .work__inner .text-link," +
    ".archive__name, .archive__meta, .archive a, .archive__end, .archive__note," +
    ".personal__kicker, .personal__grid h3, .personal__grid > div > p, .personal__grid .text-link," +
    ".contact .eyebrow, .contact h2, .contact__lead, .contact__link," +
    ".footer p"
  ).each(function () {
    var $el = $(this);
    if ($el.find(".hero__num").length || $el.hasClass("tx")) return;
    $el.addClass("tx").html("<span class='tx__in'>" + $el.html() + "</span>");
  });

  $(window).on("scroll", function () {
    var y = $(this).scrollTop();
    $header.toggleClass("header--follow", $hero[0].getBoundingClientRect().bottom <= 0);
    settleName();

    var current = "";
    $("section[id]").each(function () {
      if (y + 120 >= $(this).offset().top) current = $(this).attr("id");
    });
    $(".header__link").each(function () {
      $(this).toggleClass("header__link--current", $(this).attr("href") === "#" + current);
    });

    $(".card").each(function () {
      if (y + $(window).height() * 0.88 > $(this).offset().top) $(this).addClass("card--in");
    });

    $(".tx").not(".hero .tx, .tx--on").each(function () {
      var r = this.getBoundingClientRect();
      if (r.height > 0 && r.top < $(window).height() * 0.9 && r.bottom > 0) $(this).addClass("tx--on");
    });

    revealThumbs();
  }).trigger("scroll");

  function revealThumbs() {
    $(".work--open .work__thumb").not(".work__thumb--in").each(function () {
      var r = this.getBoundingClientRect();
      if (r.height > 0 && r.top < $(window).height() * 0.92 && r.bottom > 0) {
        $(this).addClass("work__thumb--in");
      }
    });
  }

  $(".work__toggle").on("click", function () {
    var $work = $(this).closest(".work");
    var open = $work.hasClass("work--open");
    $(".work--open").removeClass("work--open").find(".work__body").stop(true).slideUp(280, function () {
      $(this).find(".work__thumb").removeClass("work__thumb--in");
    });
    if (!open) {
      $work.addClass("work--open");
      var $imgs = $work.find(".work__thumb").removeClass("work__thumb--in").find("img");
      $imgs.css("transition", "none");
      if ($imgs[0]) $imgs[0].offsetWidth;
      $imgs.css("transition", "");
      $work.find(".work__body").stop(true).slideDown(320, revealThumbs);
      showText($work.find(".work__inner .tx").not(".tx--on"));
      requestAnimationFrame(revealThumbs);
    }
  });
  $(".work--open .work__body").show();
  revealThumbs();

  var $modal = $(".modal");
  var slideCount = 0;
  var slideIndex = 0;
  var modalLabels = {
    harmost: "Harmostの画面",
    prelude: "プレリュードコラムの画面",
    belle: "BELLE HOUSINGの画面",
    packman: "学習問題サイトの画面",
    dragon: "キャラクター育成の画面",
    walk: "歩くツール体験の画面"
  };

  function activeTrack() {
    return $(".modal__track").not("[hidden]");
  }

  function showSlide(index) {
    var $track = activeTrack();
    slideCount = $track.children().length;
    slideIndex = (index + slideCount) % slideCount;
    $track.css("transform", "translateX(" + (-slideIndex * 100) + "%)");
    $(".modal__count").text(slideIndex + 1 + " / " + slideCount);
  }

  function openModal(set, index) {
    $(".modal__track").attr("hidden", "hidden").css("transform", "none");
    $('.modal__track[data-set="' + set + '"]').removeAttr("hidden");
    $(".modal__panel").attr("aria-label", modalLabels[set] || "画面");
    showSlide(index);
    $modal.removeClass("modal--closing").removeAttr("hidden");
    $modal[0].offsetWidth;
    $modal.addClass("modal--open");
    $body.addClass("page--lock");
  }

  function closeModal() {
    if (!$modal.hasClass("modal--open")) return;
    $modal.removeClass("modal--open").addClass("modal--closing");
    $body.removeClass("page--lock");
    setTimeout(function () {
      if (!$modal.hasClass("modal--open")) {
        $modal.removeClass("modal--closing").attr("hidden", "hidden");
      }
    }, 420);
  }

  $(".work__thumb").on("click", function () {
    openModal($(this).data("set") || "harmost", parseInt($(this).data("index"), 10) || 0);
  });
  $(".modal__close").on("click", closeModal);
  $modal.on("click", function (e) {
    if ($(e.target).closest(".modal__slide img, .modal__nav, .modal__close").length) return;
    closeModal();
  });
  $(".modal__nav--prev").on("click", function () { showSlide(slideIndex - 1); });
  $(".modal__nav--next").on("click", function () { showSlide(slideIndex + 1); });
  $(document).on("keydown", function (e) {
    if (!$modal.hasClass("modal--open")) return;
    if (e.key === "Escape") closeModal();
    if (e.key === "ArrowRight") showSlide(slideIndex + 1);
    if (e.key === "ArrowLeft") showSlide(slideIndex - 1);
  });

  $(".contact__form").on("submit", function (e) {
    e.preventDefault();
    var $form = $(this);
    var $status = $form.find(".contact__status");
    var name = $.trim($form.find("[name=name]").val());
    var email = $.trim($form.find("[name=email]").val());
    var topic = $form.find("[name=topic]").val();
    var message = $.trim($form.find("[name=message]").val());
    var mailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!name || !mailOk || !message) {
      $status.text("名前、メールアドレス、メッセージを確認してください。");
      return;
    }
    var action = $.trim($form.attr("action") || "");
    var formId = action.split("/f/")[1] || "";
    if (!formId) {
      $status.text("FormspreeのフォームIDが未設定です。");
      return;
    }
    var data = new FormData($form[0]);
    data.set("_subject", "ポートフォリオへの問い合わせ / " + topic);
    data.set("_replyto", email);
    var $button = $form.find("button");
    $button.prop("disabled", true);
    $status.text("送信しています…");
    $.ajax({
      url: action,
      method: "POST",
      data: data,
      processData: false,
      contentType: false,
      dataType: "json",
      headers: { Accept: "application/json" }
    }).done(function () {
      $form[0].reset();
      $status.text("送信しました。返信まで少々お待ちください。");
    }).fail(function () {
      $status.text("送信できませんでした。時間をおいてもう一度お試しください。");
    }).always(function () {
      $button.prop("disabled", false);
    });
  });

  var slashLock = false;
  var keepSlash = {};
  function hideWrapSlash() {
    if (slashLock) return;
    slashLock = true;
    var $items = $(".marquee__item");
    $items.removeClass("marquee__item--line-end marquee__item--line-start");
    $items.each(function (i) {
      var $next = $items.eq(i + 1);
      var wrapped = !$next.length || $next.position().top > $(this).position().top + 2;
      if (wrapped && !keepSlash[i]) $(this).addClass("marquee__item--line-end");
    });
    $items.each(function (i) {
      if (i === 0 || $items.eq(i - 1).hasClass("marquee__item--line-end")) {
        $(this).addClass("marquee__item--line-start");
      }
    });
    $items.each(function (i) {
      var $next = $items.eq(i + 1);
      if (!$next.length || !$(this).hasClass("marquee__item--line-end")) return;
      if ($next.position().top <= $(this).position().top + 2) {
        keepSlash[i] = true;
        $(this).removeClass("marquee__item--line-end");
      }
    });
    $items.each(function (i) {
      if (i === 0) {
        $(this).addClass("marquee__item--line-start");
        return;
      }
      var $prev = $items.eq(i - 1);
      if ($(this).position().top > $prev.position().top + 2) $(this).addClass("marquee__item--line-start");
      else $(this).removeClass("marquee__item--line-start");
    });
    slashLock = false;
  }
  hideWrapSlash();
  $(window).on("resize", function () {
    keepSlash = {};
    hideWrapSlash();
  });
  if (window.ResizeObserver && $(".marquee__track")[0]) {
    new ResizeObserver(hideWrapSlash).observe($(".marquee__track")[0]);
  }
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () {
      requestAnimationFrame(hideWrapSlash);
    });
  }

  if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    var $cursor = $(".cursor");
    $(window).on("mousemove", function (e) {
      $cursor.css({ left: e.clientX, top: e.clientY });
    });
    $("a, button").on("mouseenter", function () {
      $body.addClass("page--hover");
    }).on("mouseleave", function () {
      $body.removeClass("page--hover");
    });
  }
});
