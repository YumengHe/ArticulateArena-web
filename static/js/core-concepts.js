// In-page navigation and optional, keyboard-accessible interactive lesson views.
(() => {
  'use strict';
  const root = document.querySelector('.aa-learning');
  if (!root) return;
  // Keep existing bookmarks to the moved introduction and map working.
  if (root.id === 'aa-core-concepts' && ['#concept-map', '#articulated-object'].includes(location.hash)) {
    location.replace('index.html' + location.hash);
    return;
  }
  const sections = [...root.querySelectorAll('[data-cc-section], #notation')];
  const links = [...document.querySelectorAll('.cc-sidebar-toc a')];
  let scheduled = false;
  let current = '';

  function selectView(lesson, view, focusTab = false) {
    for (const tab of lesson.querySelectorAll('[role="tab"]')) {
      const selected = tab.dataset.ccView === view;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
      document.getElementById(tab.getAttribute('aria-controls')).hidden = !selected;
      if (selected && focusTab) tab.focus({preventScroll: true});
    }
    root.dispatchEvent(new CustomEvent('cc:lessonchange', {detail: {lesson: lesson.dataset.ccLesson, view}}));
    scheduleUpdate();
  }
  for (const lesson of root.querySelectorAll('[data-cc-lesson]')) {
    const tablist = lesson.querySelector('[role="tablist"]');
    const tabs = [...tablist.querySelectorAll('[role="tab"]')];
    tablist.hidden = false;
    selectView(lesson, 'explanation');
    for (const tab of tabs) {
      tab.addEventListener('click', () => selectView(lesson, tab.dataset.ccView));
      tab.addEventListener('keydown', event => {
        let index = tabs.indexOf(tab);
        if (event.key === 'ArrowRight') index = (index + 1) % tabs.length;
        else if (event.key === 'ArrowLeft') index = (index - 1 + tabs.length) % tabs.length;
        else if (event.key === 'Home') index = 0;
        else if (event.key === 'End') index = tabs.length - 1;
        else return;
        event.preventDefault();
        selectView(lesson, tabs[index].dataset.ccView, true);
      });
    }
  }
  root.addEventListener('click', event => {
    const link = event.target.closest('[data-cc-explanation]');
    if (!link || link.pathname !== location.pathname) return;
    const section = document.getElementById(link.hash.slice(1));
    const lesson = section?.querySelector('[data-cc-lesson]');
    if (lesson) selectView(lesson, 'explanation');
  });

  function updateLocation() {
    scheduled = false;
    const threshold = 90;
    let active = sections[0];
    for (const section of sections) {
      if (section.getBoundingClientRect().top <= threshold) active = section;
    }
    if (!active || current === active.id) return;
    current = active.id;
    for (const link of links) {
      if (link.hash === '#' + current) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    }
  }
  function scheduleUpdate() {
    if (!scheduled) { scheduled = true; requestAnimationFrame(updateLocation); }
  }
  window.addEventListener('scroll', scheduleUpdate, {passive: true});
  window.addEventListener('resize', scheduleUpdate, {passive: true});
  window.addEventListener('load', scheduleUpdate);
  updateLocation();

  const video = document.getElementById('cc-cabinet-video');
  if (video) {
    const toggle = document.getElementById('cc-motion-toggle');
    const label = document.getElementById('cc-motion-label');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let userPaused = reducedMotion.matches;
    let inView = false;
    video.muted = true;
    video.autoplay = !reducedMotion.matches;
    toggle.hidden = false;

    function updateToggle() {
      const paused = video.paused;
      toggle.dataset.paused = String(paused);
      toggle.setAttribute('aria-label', (paused ? 'Play' : 'Pause') + ' cabinet animation');
      label.textContent = paused ? 'Play' : 'Pause';
    }
    function syncPlayback() {
      const visible = inView && !document.hidden && !video.closest('[hidden]');
      if (visible && !userPaused) {
        const play = video.play();
        if (play) play.catch(updateToggle);
      } else video.pause();
      updateToggle();
    }
    toggle.addEventListener('click', () => {
      userPaused = !video.paused;
      syncPlayback();
    });
    video.addEventListener('play', updateToggle);
    video.addEventListener('pause', updateToggle);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(entries => {
        inView = entries[0].isIntersecting && entries[0].intersectionRatio >= 0.15;
        syncPlayback();
      }, {threshold: [0, 0.15]}).observe(video);
    } else inView = true;
    document.addEventListener('visibilitychange', syncPlayback);
    root.addEventListener('cc:lessonchange', syncPlayback);
    reducedMotion.addEventListener('change', () => {
      userPaused = reducedMotion.matches;
      video.autoplay = !userPaused;
      syncPlayback();
    });
    syncPlayback();
  }
})();
