//<![CDATA[
(function () {

  'use strict';

  var CONFIG = {
    autoplay: true,
    interval: 5000,
    pauseOnHover: true,
    maxResults: 20,
    maxDots: 5
  };


  /* =====================================================
     GENRE
     ===================================================== */

  var GENRES = [
    'Action',
    'Adventure',
    'Avant Garde',
    'Boys Love',
    'Comedy',
    'Drama',
    'Ecchi',
    'Erotica',
    'Fantasy',
    'Girls Love',
    'Gourmet',
    'Harem',
    'Horror',
    'Isekai',
    'Josei',
    'Kids',
    'Martial Arts',
    'Mecha',
    'Military',
    'Music',
    'Mystery',
    'Parody',
    'Psychological',
    'Romance',
    'School',
    'Sci-Fi',
    'Seinen',
    'Shoujo',
    'Shoujo Ai',
    'Shounen',
    'Shounen Ai',
    'Slice of Life',
    'Space',
    'Sports',
    'Super Power',
    'Supernatural',
    'Suspense',
    'Thriller',
    'Vampire',
    'Work Life',
    'Historical',
    'Demons',
    'Samurai',
    'Cars',
    'Game',
    'Magic',
    'Mythology',
    'Racing',
    'Reincarnation',
    'Reverse Harem',
    'Showbiz',
    'Strategy Game',
    'Time Travel',
    'Detective',
    'Delinquents',
    'Adult Cast',
    'Anthropomorphic',
    'CGDCT',
    'Combat Sports',
    'Crossdressing',
    'Educational',
    'Gag Humor',
    'High Stakes Game',
    'Idols',
    'Iyashikei',
    'Love Polygon',
    'Medical',
    'Organized Crime',
    'Otaku Culture',
    'Performing Arts',
    'Pets',
    'Reincarnation',
    'Rural',
    'Survival',
    'Team Sports',
    'Urban Fantasy',
    'Video Game',
    'Visual Arts',
    'Workplace'
  ];


  /* =====================================================
     TYPE
     ===================================================== */

  var TYPES = [
    'TV',
    'Movie',
    'OVA',
    'ONA',
    'Special',
    'Music',
    'TV Special',
    'Web'
  ];


  /* =====================================================
     STATUS
     ===================================================== */

  var STATUSES = [
    'Ongoing',
    'Completed',
    'Finished',
    'Upcoming',
    'Hiatus',
    'Cancelled',
    'Not Yet Aired'
  ];


  /* =====================================================
     INIT
     ===================================================== */

  function initAnimeInfoSliders() {

    var widgets =
      document.querySelectorAll(
        '.anime-info-slider'
      );

    for (
      var i = 0;
      i < widgets.length;
      i++
    ) {

      createSlider(
        widgets[i]
      );

    }

  }


  /* =====================================================
     CREATE SLIDER
     ===================================================== */

  function createSlider(widget) {

    var label =
      widget.getAttribute(
        'data-label'
      );

    if (!label) {

      showMessage(
        widget,
        'Label belum ditetapkan.'
      );

      return;

    }


    widget.innerHTML =
      '<div class="ais-loading">Loading...</div>';


    var callbackName =
      'AnimeInfoCallback_' +
      Date.now() +
      '_' +
      Math.floor(
        Math.random() * 99999
      );


    window[callbackName] =
      function (data) {

        try {

          buildSlider(
            widget,
            label,
            data
          );

        } catch (error) {

          console.error(
            'Anime Info Slider:',
            error
          );

          showMessage(
            widget,
            'Gagal memproses data anime.'
          );

        }


        try {

          delete window[callbackName];

        } catch (e) {

          window[callbackName] =
            undefined;

        }

      };


    var script =
      document.createElement(
        'script'
      );


    script.src =
      '/feeds/posts/default/-/' +
      encodeURIComponent(label) +
      '?alt=json-in-script' +
      '&max-results=' +
      CONFIG.maxResults +
      '&callback=' +
      callbackName;


    script.async = true;


    script.onerror =
      function () {

        showMessage(
          widget,
          'Feed Blogger tidak dapat dimuat.'
        );

      };


    document.body.appendChild(
      script
    );

  }


  /* =====================================================
     BUILD
     ===================================================== */

  function buildSlider(
    widget,
    label,
    data
  ) {

    var entries =
      data &&
      data.feed &&
      data.feed.entry
        ? data.feed.entry
        : [];


    if (!entries.length) {

      showMessage(
        widget,
        'Tiada anime dengan label "' +
        label +
        '".'
      );

      return;

    }


    var animeList = [];


    for (
      var i = 0;
      i < entries.length;
      i++
    ) {

      var anime =
        parseEntry(
          entries[i],
          label
        );


      if (anime) {

        animeList.push(
          anime
        );

      }

    }


    if (!animeList.length) {

      showMessage(
        widget,
        'Tiada data anime.'
      );

      return;

    }


    renderSlider(
      widget,
      animeList
    );

  }


  /* =====================================================
     PARSE ENTRY
     ===================================================== */

  function parseEntry(
    entry,
    mainLabel
  ) {

    var title =
      getText(
        entry.title
      );


    if (!title) {

      return null;

    }


    var url =
      getEntryUrl(
        entry
      );


    var content =
      getText(
        entry.content ||
        entry.summary ||
        ''
      );


    var published =
      entry.published &&
      entry.published.$t
        ? entry.published.$t
        : '';


    var updated =
      entry.updated &&
      entry.updated.$t
        ? entry.updated.$t
        : '';


    var image =
      getThumbnail(
        entry
      );


    if (!image) {

      image =
        getImageFromHTML(
          content
        );

    }


    if (!image) {

      image =
        'https://via.placeholder.com/300x450/222/777?text=No+Image';

    }


    /*
     * -----------------------------------------------
     * AMBIL LABEL
     * -----------------------------------------------
     */

    var labels = [];


    if (entry.category) {

      for (
        var i = 0;
        i < entry.category.length;
        i++
      ) {

        var term =
          entry.category[i].term;


        if (term) {

          labels.push(
            term
          );

        }

      }

    }


    /*
     * -----------------------------------------------
     * STATUS DARIPADA LABEL
     * -----------------------------------------------
     */

    var status =
      findLabel(
        labels,
        STATUSES
      );


    if (!status) {

      status = 'No status yet';

    }


    /*
     * -----------------------------------------------
     * TYPE DARIPADA LABEL
     * -----------------------------------------------
     */

    var type =
      findLabel(
        labels,
        TYPES
      );


    if (!type) {

      type = 'No type yet';

    }


    /*
     * -----------------------------------------------
     * GENRE DARIPADA LABEL
     * -----------------------------------------------
     */

    var genres = [];


    for (
      var g = 0;
      g < labels.length;
      g++
    ) {

      var currentLabel =
        labels[g];


      if (
        isGenre(
          currentLabel
        )
      ) {

        /*
         * Elakkan duplicate
         */

        if (
          !containsIgnoreCase(
            genres,
            currentLabel
          )
        ) {

          genres.push(
            currentLabel
          );

        }

      }

    }


    /*
     * -----------------------------------------------
     * SUMMARY
     *
     * HANYA:
     *
     * [summary]TEXT[/summary]
     * -----------------------------------------------
     */

    var summary =
      extractSummary(
        content
      );


    if (!summary) {

      summary =
        'No summary yet';

    }


    return {

      title: title,

      url: url,

      image: image,

      date:
        published ||
        updated,

      genres: genres,

      summary: summary,

      status: status,

      type: type

    };

  }


  /* =====================================================
     RENDER
     ===================================================== */

  function renderSlider(
    widget,
    list
  ) {

    var html =
      '<div class="ais-background"></div>' +
      '<div class="ais-overlay"></div>' +
      '<div class="ais-pattern"></div>' +
      '<div class="ais-track"></div>' +
      '<div class="ais-dots"></div>';


    widget.innerHTML =
      html;


    var track =
      widget.querySelector(
        '.ais-track'
      );


    var dots =
      widget.querySelector(
        '.ais-dots'
      );


    var background =
      widget.querySelector(
        '.ais-background'
      );


    for (
      var i = 0;
      i < list.length;
      i++
    ) {

      var slide =
        document.createElement(
          'div'
        );


      slide.className =
        'ais-slide';


      slide.innerHTML =
        createSlideHTML(
          list[i]
        );


      track.appendChild(
        slide
      );


      /*
       * Hanya tunjuk 5 dots.
       */

      if (
        i < CONFIG.maxDots
      ) {

        var dot =
          document.createElement(
            'button'
          );


        dot.type =
          'button';


        dot.className =
          'ais-dot';


        if (i === 0) {

          dot.className +=
            ' is-active';

        }


        dot.setAttribute(
          'data-index',
          i
        );


        dot.setAttribute(
          'aria-label',
          'Go to slide ' +
          (i + 1)
        );


        dots.appendChild(
          dot
        );

      }

    }


    setBackground(
      background,
      list[0].image
    );


    setupControls(
      widget,
      list,
      background
    );

  }


  /* =====================================================
     SLIDE HTML
     ===================================================== */

  function createSlideHTML(
    item
  ) {

    var genres =
      item.genres.length
        ? item.genres
            .map(
              function (genre) {

                return escapeHTML(
                  genre
                );

              }
            )
            .join(',')
        : 'No genre yet';


    var date =
      formatDate(
        item.date
      );


    /*
     * Ongoing sahaja guna TO ?
     */

    if (
      item.status.toLowerCase() ===
      'ongoing'
    ) {

      date +=
        ' TO ?';

    }


    return (

      '<div class="ais-poster">' +

        '<a href="' +
        escapeAttribute(
          item.url
        ) +
        '">' +

          '<img src="' +
          escapeAttribute(
            item.image
          ) +
          '" alt="' +
          escapeAttribute(
            item.title
          ) +
          '" loading="lazy">' +

        '</a>' +

      '</div>' +


      '<div class="ais-info">' +

        '<h2 class="ais-title">' +

          '<a href="' +
          escapeAttribute(
            item.url
          ) +
          '">' +

            escapeHTML(
              item.title
            ) +

          '</a>' +

        '</h2>' +


        '<div class="ais-date">' +

          escapeHTML(
            date
          ) +

        '</div>' +


        '<div class="ais-genres">' +

          genres +

        '</div>' +


        '<div class="ais-summary-title">' +

          'SUMMARY' +

        '</div>' +


        '<p class="ais-summary">' +

          escapeHTML(
            item.summary
          ) +

        '</p>' +


        '<div class="ais-meta">' +

          '<span>' +

            '<strong>Status:</strong> ' +

            escapeHTML(
              item.status
            ) +

          '</span>' +


          '<span>' +

            '<strong>Type:</strong> ' +

            escapeHTML(
              item.type
            ) +

          '</span>' +

        '</div>' +

      '</div>'

    );

  }


  /* =====================================================
     CONTROLS
     ===================================================== */

  function setupControls(
    widget,
    list,
    background
  ) {

    var track =
      widget.querySelector(
        '.ais-track'
      );


    var dots =
      widget.querySelectorAll(
        '.ais-dot'
      );


    var current = 0;


    var timer = null;


    function goTo(
      index
    ) {

      if (
        index < 0
      ) {

        index =
          list.length - 1;

      }


      if (
        index >= list.length
      ) {

        index = 0;

      }


      current =
        index;


      /*
       * INI YANG BUAT SLIDE
       *
       * Contoh:
       *
       * slide 1 = 0%
       * slide 2 = -100%
       * slide 3 = -200%
       *
       * Sama konsep Owl:
       *
       * translate3d(...)
       */

      track.style.transform =
        'translate3d(-' +
        (current * 100) +
        '%, 0, 0)';


      /*
       * Dots
       */

      for (
        var i = 0;
        i < dots.length;
        i++
      ) {

        dots[i].classList.remove(
          'is-active'
        );

      }


      if (
        dots[current]
      ) {

        dots[current].classList.add(
          'is-active'
        );

      }


      /*
       * Background
       */

      setBackground(
        background,
        list[current].image
      );

    }


    function stopAutoplay() {

      if (timer) {

        clearInterval(
          timer
        );

        timer = null;

      }

    }


    function startAutoplay() {

      stopAutoplay();


      if (
        !CONFIG.autoplay ||
        list.length < 2
      ) {

        return;

      }


      timer =
        setInterval(
          function () {

            goTo(
              current + 1
            );

          },
          CONFIG.interval
        );

    }


    /*
     * Dot click
     */

    for (
      var i = 0;
      i < dots.length;
      i++
    ) {

      (function (
        index
      ) {

        dots[index].addEventListener(
          'click',
          function () {

            goTo(
              index
            );

            startAutoplay();

          }
        );

      })(i);

    }


    /*
     * Pause hover
     */

    if (
      CONFIG.pauseOnHover
    ) {

      widget.addEventListener(
        'mouseenter',
        stopAutoplay
      );


      widget.addEventListener(
        'mouseleave',
        startAutoplay
      );

    }


    /*
     * TOUCH / SWIPE
     */

    var touchStartX = 0;
    var touchEndX = 0;


    widget.addEventListener(
      'touchstart',
      function (event) {

        if (
          event.touches &&
          event.touches.length
        ) {

          touchStartX =
            event.touches[0].clientX;

          stopAutoplay();

        }

      },
      {
        passive: true
      }
    );


    widget.addEventListener(
      'touchend',
      function (event) {

        if (
          event.changedTouches &&
          event.changedTouches.length
        ) {

          touchEndX =
            event.changedTouches[0].clientX;

        }


        var difference =
          touchStartX -
          touchEndX;


        if (
          Math.abs(
            difference
          ) > 45
        ) {

          if (
            difference > 0
          ) {

            goTo(
              current + 1
            );

          } else {

            goTo(
              current - 1
            );

          }

        }


        startAutoplay();

      },
      {
        passive: true
      }
    );


    startAutoplay();

  }


  /* =====================================================
     FIND LABEL
     ===================================================== */

  function findLabel(
    labels,
    allowed
  ) {

    for (
      var i = 0;
      i < labels.length;
      i++
    ) {

      for (
        var j = 0;
        j < allowed.length;
        j++
      ) {

        if (
          labels[i].toLowerCase() ===
          allowed[j].toLowerCase()
        ) {

          return labels[i];

        }

      }

    }


    return '';

  }


  /* =====================================================
     IS GENRE
     ===================================================== */

  function isGenre(
    label
  ) {

    for (
      var i = 0;
      i < GENRES.length;
      i++
    ) {

      if (
        label.toLowerCase() ===
        GENRES[i].toLowerCase()
      ) {

        return true;

      }

    }


    return false;

  }


  /* =====================================================
     CONTAINS
     ===================================================== */

  function containsIgnoreCase(
    array,
    value
  ) {

    for (
      var i = 0;
      i < array.length;
      i++
    ) {

      if (
        array[i].toLowerCase() ===
        value.toLowerCase()
      ) {

        return true;

      }

    }


    return false;

  }


  /* =====================================================
     SUMMARY
     ===================================================== */

  function extractSummary(
    html
  ) {

    if (!html) {

      return '';

    }


    var temp =
      document.createElement(
        'div'
      );


    temp.innerHTML =
      html;


    var text =
      temp.textContent ||
      temp.innerText ||
      '';


    /*
     * Cari:
     *
     * [summary]
     * isi summary
     * [/summary]
     */

    var match =
      text.match(
        /\[summary\]([\s\S]*?)\[\/summary\]/i
      );


    if (
      match &&
      match[1]
    ) {

      return match[1]
        .replace(
          /\s+/g,
          ' '
        )
        .trim();

    }


    return '';

  }


  /* =====================================================
     THUMBNAIL
     ===================================================== */

  function getThumbnail(
    entry
  ) {

    if (
      entry.media$thumbnail &&
      entry.media$thumbnail.url
    ) {

      return entry.media$thumbnail.url
        .replace(
          /\/s[0-9]+(-c)?\//,
          '/s600/'
        );

    }


    return '';

  }


  /* =====================================================
     IMAGE FROM CONTENT
     ===================================================== */

  function getImageFromHTML(
    html
  ) {

    if (!html) {

      return '';

    }


    var match =
      html.match(
        /<img[^>]+src=["']([^"']+)["']/i
      );


    return (
      match &&
      match[1]
        ? match[1]
        : ''
    );

  }


  /* =====================================================
     URL
     ===================================================== */

  function getEntryUrl(
    entry
  ) {

    if (!entry.link) {

      return '#';

    }


    for (
      var i = 0;
      i < entry.link.length;
      i++
    ) {

      if (
        entry.link[i].rel ===
        'alternate'
      ) {

        return entry.link[i].href;

      }

    }


    return '#';

  }


  /* =====================================================
     DATE
     ===================================================== */

  function formatDate(
    date
  ) {

    if (!date) {

      return '';

    }


    var d =
      new Date(
        date
      );


    if (
      isNaN(
        d.getTime()
      )
    ) {

      return date;

    }


    var months = [
      'JAN',
      'FEB',
      'MAR',
      'APR',
      'MAY',
      'JUN',
      'JUL',
      'AUG',
      'SEP',
      'OCT',
      'NOV',
      'DEC'
    ];


    return (
      months[d.getMonth()] +
      ' ' +
      d.getDate() +
      ', ' +
      d.getFullYear()
    );

  }


  /* =====================================================
     GET TEXT
     ===================================================== */

  function getText(
    object
  ) {

    if (!object) {

      return '';

    }


    if (
      typeof object ===
      'string'
    ) {

      return object;

    }


    if (
      object.$t
    ) {

      return object.$t;

    }


    return '';

  }


  /* =====================================================
     ESCAPE
     ===================================================== */

  function escapeHTML(
    value
  ) {

    if (
      value === null ||
      value === undefined
    ) {

      return '';

    }


    return String(value)
      .replace(
        /&/g,
        '&amp;'
      )
      .replace(
        /</g,
        '&lt;'
      )
      .replace(
        />/g,
        '&gt;'
      )
      .replace(
        /"/g,
        '&quot;'
      )
      .replace(
        /'/g,
        '&#039;'
      );

  }


  function escapeAttribute(
    value
  ) {

    return escapeHTML(
      value
    );

  }


  /* =====================================================
     BACKGROUND
     ===================================================== */

  function setBackground(
    element,
    image
  ) {

    if (
      !element ||
      !image
    ) {

      return;

    }


    element.style.backgroundImage =
      'url("' +
      String(image)
        .replace(
          /"/g,
          '\\"'
        ) +
      '")';

  }


  /* =====================================================
     MESSAGE
     ===================================================== */

  function showMessage(
    widget,
    message
  ) {

    widget.innerHTML =
      '<div class="ais-message">' +
      escapeHTML(
        message
      ) +
      '</div>';

  }


  /* =====================================================
     START
     ===================================================== */

  if (
    document.readyState ===
    'loading'
  ) {

    document.addEventListener(
      'DOMContentLoaded',
      initAnimeInfoSliders
    );

  } else {

    initAnimeInfoSliders();

  }

})();
//]]>
