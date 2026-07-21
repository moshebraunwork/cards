(function () {
  'use strict';
  var S = window.__CARD__;
  var card = document.querySelector('#cardNode .card');
  var $ = function (id) { return document.getElementById(id); };
  var F = function (name) { return card.querySelector('[data-f="' + name + '"]'); };
  var LS_KEY = 'besimcha:' + S.themeId;

  var textFields = ['inviteLine', 'honoree', 'hostsLine', 'time', 'venue', 'address', 'note', 'signoff'];
  var inviteDirty = false;

  // ---- restore saved edits for this design ----
  try {
    var saved = JSON.parse(localStorage.getItem(LS_KEY) || 'null');
    if (saved && typeof saved === 'object') {
      textFields.forEach(function (f) {
        if (typeof saved[f] === 'string') $('f-' + f).value = saved[f];
      });
      if (saved.eventType && $('f-eventType').querySelector('option[value="' + saved.eventType + '"]')) {
        $('f-eventType').value = saved.eventType;
      }
      if (typeof saved.date === 'string') $('f-date').value = saved.date;
      $('f-afterSunset').checked = !!saved.afterSunset;
      $('f-bsd').checked = saved.bsd !== false;
      inviteDirty = !!saved.inviteDirty;
    }
  } catch (e) {}

  function collect() {
    return {
      themeId: S.themeId,
      eventType: $('f-eventType').value,
      bsd: $('f-bsd').checked,
      inviteLine: $('f-inviteLine').value,
      honoree: $('f-honoree').value,
      hostsLine: $('f-hostsLine').value,
      date: $('f-date').value,
      afterSunset: $('f-afterSunset').checked,
      time: $('f-time').value,
      venue: $('f-venue').value,
      address: $('f-address').value,
      note: $('f-note').value,
      signoff: $('f-signoff').value
    };
  }

  function persist() {
    try {
      var d = collect();
      d.inviteDirty = inviteDirty;
      localStorage.setItem(LS_KEY, JSON.stringify(d));
    } catch (e) {}
  }

  function setText(name, text, hideWhenEmpty) {
    var el = F(name);
    if (!el) return;
    el.textContent = text;
    if (hideWhenEmpty) el.style.display = text.trim() ? '' : 'none';
  }

  function updateHeb() {
    var el = F('hebEvent');
    if (!el) return;
    var word = (S.eventHeb && S.eventHeb[$('f-eventType').value]) || '';
    el.textContent = word;
    el.style.display = word ? '' : 'none';
  }

  function renderStatic() {
    var d = collect();
    updateHeb();
    setText('inviteLine', d.inviteLine, false);
    setText('honoree', d.honoree, false);
    setText('hostsLine', d.hostsLine, true);
    setText('time', d.time ? 'at ' + d.time : '', true);
    setText('venue', d.venue, false);
    setText('address', d.address, false);
    setText('note', d.note, true);
    setText('signoff', d.signoff, true);
    F('bsd').style.display = d.bsd ? '' : 'none';
    persist();
  }

  var hebTimer = null;
  function renderDates() {
    var d = $('f-date').value;
    var sunset = $('f-afterSunset').checked;
    persist();
    if (!d) { setText('engDate', '', false); setText('hebDate', '', false); return; }
    clearTimeout(hebTimer);
    hebTimer = setTimeout(function () {
      fetch('/api/hebdate?d=' + encodeURIComponent(d) + '&sunset=' + (sunset ? '1' : '0'))
        .then(function (r) { return r.json(); })
        .then(function (j) {
          setText('engDate', j.en || '', false);
          setText('hebDate', j.he || '', false);
        })
        .catch(function () {});
    }, 150);
  }

  // ---- wire inputs ----
  textFields.forEach(function (f) {
    $('f-' + f).addEventListener('input', renderStatic);
  });
  $('f-bsd').addEventListener('change', renderStatic);
  $('f-date').addEventListener('change', renderDates);
  $('f-afterSunset').addEventListener('change', renderDates);
  $('f-inviteLine').addEventListener('input', function () { inviteDirty = true; });

  $('f-eventType').addEventListener('change', function () {
    if (!inviteDirty) {
      $('f-inviteLine').value = S.eventDefaults[this.value] || '';
    }
    renderStatic();
  });

  // ---- theme switching (navigates so each design keeps its own saved edits) ----
  document.getElementById('themePills').addEventListener('click', function (e) {
    var pill = e.target.closest('.pill');
    if (!pill || pill.dataset.themeid === S.themeId) return;
    persist();
    location.href = '/design/' + pill.dataset.themeid;
  });

  // ---- reset ----
  $('resetBtn').addEventListener('click', function () {
    try { localStorage.removeItem(LS_KEY); } catch (e) {}
    location.reload();
  });

  // ---- download PNG ----
  $('downloadBtn').addEventListener('click', function () {
    var btn = this;
    btn.disabled = true;
    btn.textContent = 'Preparing your card…';
    html2canvas(card, { scale: 3, useCORS: true, backgroundColor: null })
      .then(function (canvas) {
        var a = document.createElement('a');
        a.download = 'simcha-card-' + S.themeId + '.png';
        a.href = canvas.toDataURL('image/png');
        a.click();
      })
      .finally(function () {
        btn.disabled = false;
        btn.textContent = '⬇ Download your card — free';
      });
  });

  // initial paint (also applies restored values to the preview)
  renderStatic();
  renderDates();
})();
