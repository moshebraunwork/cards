(function () {
  'use strict';
  var S = window.__CARD__;
  var card = document.querySelector('#cardNode .card');
  var $ = function (id) { return document.getElementById(id); };
  var F = function (name) { return card.querySelector('[data-f="' + name + '"]'); };

  var fields = ['inviteLine', 'honoree', 'hostsLine', 'time', 'venue', 'address', 'note', 'signoff'];
  var inviteDirty = S.data.inviteLine !== S.eventDefaults[S.data.eventType];

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

  function setText(name, text, hideWhenEmpty) {
    var el = F(name);
    if (!el) return;
    el.textContent = text;
    if (hideWhenEmpty) el.style.display = text.trim() ? '' : 'none';
  }

  function renderStatic() {
    var d = collect();
    setText('inviteLine', d.inviteLine, false);
    setText('honoree', d.honoree, false);
    setText('hostsLine', d.hostsLine, true);
    setText('time', d.time ? 'at ' + d.time : '', true);
    setText('venue', d.venue, false);
    setText('address', d.address, false);
    setText('note', d.note, true);
    setText('signoff', d.signoff, true);
    F('bsd').style.display = d.bsd ? '' : 'none';
  }

  var hebTimer = null;
  function renderDates() {
    var d = $('f-date').value;
    var sunset = $('f-afterSunset').checked;
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
  fields.forEach(function (f) {
    $('f-' + f).addEventListener('input', renderStatic);
  });
  $('f-bsd').addEventListener('change', renderStatic);
  $('f-date').addEventListener('change', renderDates);
  $('f-afterSunset').addEventListener('change', renderDates);
  $('f-inviteLine').addEventListener('input', function () { inviteDirty = true; });

  $('f-eventType').addEventListener('change', function () {
    if (!inviteDirty) {
      $('f-inviteLine').value = S.eventDefaults[this.value] || '';
      renderStatic();
    }
  });

  // ---- theme switching ----
  document.getElementById('themePills').addEventListener('click', function (e) {
    var pill = e.target.closest('.pill');
    if (!pill) return;
    S.themeId = pill.dataset.themeid;
    card.dataset.theme = S.themeId;
    document.querySelectorAll('.pill').forEach(function (p) { p.classList.toggle('active', p === pill); });
    var url = new URL(location.href);
    if (S.mode === 'create') history.replaceState(null, '', '/design/' + S.themeId);
  });

  // ---- save ----
  $('saveBtn').addEventListener('click', function () {
    var btn = this;
    btn.disabled = true;
    var payload = { data: collect() };
    var req;
    if (S.mode === 'edit' || S.slug) {
      payload.editKey = S.editKey;
      req = fetch('/api/cards/' + S.slug, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } else {
      req = fetch('/api/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    }
    req.then(function (r) {
      if (!r.ok) throw new Error('Save failed (' + r.status + ')');
      return r.json();
    }).then(function (j) {
      S.slug = j.slug;
      S.editKey = j.editKey;
      S.mode = 'edit';
      btn.textContent = 'Save changes';
      openShareModal();
    }).catch(function (err) {
      alert(err.message || 'Something went wrong saving your card. Please try again.');
    }).finally(function () {
      btn.disabled = false;
    });
  });

  function openShareModal() {
    var origin = location.origin;
    var shareUrl = origin + '/card/' + S.slug;
    var editUrl = origin + '/edit/' + S.slug + '/' + S.editKey;
    $('shareUrl').value = shareUrl;
    $('editUrl').value = editUrl;
    $('waShare').href = 'https://wa.me/?text=' + encodeURIComponent("You're invited! " + shareUrl);
    $('viewCard').href = shareUrl;
    $('shareModal').hidden = false;
  }

  $('closeModal').addEventListener('click', function () { $('shareModal').hidden = true; });
  $('shareModal').addEventListener('click', function (e) {
    if (e.target === this) this.hidden = true;
  });

  document.querySelectorAll('[data-copy]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var input = $(btn.dataset.copy);
      input.select();
      navigator.clipboard.writeText(input.value).then(function () {
        var old = btn.textContent;
        btn.textContent = 'Copied!';
        setTimeout(function () { btn.textContent = old; }, 1500);
      });
    });
  });

  // ---- download PNG ----
  $('downloadBtn').addEventListener('click', function () {
    var btn = this;
    btn.disabled = true;
    html2canvas(card, { scale: 3, useCORS: true, backgroundColor: null })
      .then(function (canvas) {
        var a = document.createElement('a');
        a.download = 'simcha-card.png';
        a.href = canvas.toDataURL('image/png');
        a.click();
      })
      .finally(function () { btn.disabled = false; });
  });

  // initial paint of dates (server already rendered, but sync after any prefill)
  renderDates();
})();
