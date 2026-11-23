/* AnimatedList — adaptasi vanilla JS untuk situs statis Xavetra. */
(function () {
  'use strict';
  function mount(host, items, options) {
    if (!host) return;
    var opts = Object.assign({ animation: 'pop', stagger: 0.05, theme: 'light', maxHeight: 360, selectOnHover: true, loop: false, onItemSelect: null }, options || {});
    var list = Array.isArray(items) ? items : [], selected = Number.isInteger(opts.initialSelectedIndex) ? opts.initialSelectedIndex : -1;
    var frame = document.createElement('div'); frame.className = 'al-frame'; frame.dataset.theme = opts.theme; frame.style.setProperty('--al-max-height', typeof opts.maxHeight === 'number' ? opts.maxHeight + 'px' : opts.maxHeight);
    var ul = document.createElement('div'); ul.className = 'al-list'; ul.setAttribute('role', 'listbox'); ul.setAttribute('aria-label', opts.label || 'Daftar');
    list.forEach(function (item, i) {
      var row = document.createElement('button'); row.type = 'button'; row.className = 'al-row'; row.setAttribute('role', 'option'); row.setAttribute('aria-selected', String(i === selected)); row.style.setProperty('--al-delay', (i * Math.max(0, Number(opts.stagger) || 0)) + 's');
      row.dataset.animation = ['pop', 'slide', 'fade', 'none'].indexOf(opts.animation) >= 0 ? opts.animation : 'pop';
      var icon = document.createElement('span'); icon.className = 'al-icon material-symbols-outlined'; icon.setAttribute('aria-hidden', 'true'); icon.textContent = typeof item === 'object' && item.icon ? item.icon : 'person';
      var copy = document.createElement('span'); copy.className = 'al-copy';
      var title = document.createElement('span'); title.className = 'al-title'; title.textContent = typeof item === 'string' ? item : (item.title || '');
      copy.appendChild(title);
      if (item && typeof item === 'object' && item.description) { var desc = document.createElement('span'); desc.className = 'al-description'; desc.textContent = item.description; copy.appendChild(desc); }
      if (item && typeof item === 'object' && item.meta) { var meta = document.createElement('span'); meta.className = 'al-meta'; meta.textContent = item.meta; row.appendChild(meta); }
      row.appendChild(icon); row.appendChild(copy);
      function choose() { selected = i; Array.from(ul.children).forEach(function (el, k) { el.setAttribute('aria-selected', String(k === selected)); }); if (typeof opts.onItemSelect === 'function') opts.onItemSelect(item, i); }
      row.addEventListener('click', choose);
      if (opts.selectOnHover) row.addEventListener('pointerenter', function () { selected = i; Array.from(ul.children).forEach(function (el, k) { el.setAttribute('aria-selected', String(k === selected)); }); });
      row.addEventListener('keydown', function (e) {
        if (!opts.enableArrowNavigation || !['ArrowDown','ArrowUp','Home','End'].includes(e.key)) return;
        e.preventDefault(); var next = selected;
        if (e.key === 'Home') next = 0; else if (e.key === 'End') next = list.length - 1; else if (e.key === 'ArrowDown') next = selected + 1; else if (e.key === 'ArrowUp') next = selected - 1;
        if (opts.loop && list.length) next = (next + list.length) % list.length; else next = Math.max(0, Math.min(list.length - 1, next));
        selected = next; ul.children[next].focus(); Array.from(ul.children).forEach(function (el, k) { el.setAttribute('aria-selected', String(k === selected)); });
      });
      ul.appendChild(row);
    });
    if (!list.length) { var empty = document.createElement('p'); empty.className = 'al-empty'; empty.textContent = opts.emptyText || 'Belum ada data untuk ditampilkan.'; ul.appendChild(empty); }
    frame.appendChild(ul); host.replaceChildren(frame);
    return { destroy: function () { host.replaceChildren(); }, select: function (index) { if (ul.children[index]) { selected = index; ul.children[index].focus(); } } };
  }
  window.AnimatedList = { mount: mount };
})();
