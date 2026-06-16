// static/script.js

document.addEventListener('DOMContentLoaded', () => {
  const refreshBtn = document.getElementById('refreshBtn');
  const refreshSpinner = document.getElementById('refreshSpinner');
  const notesList = document.getElementById('notesList');
  const tweetSection = document.getElementById('tweetSection');
  const tweetBtn = document.getElementById('tweetBtn');
  const tweetSpinner = document.getElementById('tweetSpinner');
  const tweetContent = document.getElementById('tweetContent');
  const tweetResult = document.getElementById('tweetResult');

  let selectedNote = null;

  const setLoading = (btn, spinner, loading) => {
    if (loading) {
      btn.classList.add('loading');
      btn.disabled = true;
      spinner.style.display = 'inline-block';
    } else {
      btn.classList.remove('loading');
      btn.disabled = false;
      spinner.style.display = 'none';
    }
  };

  const renderNotes = (notes) => {
    notesList.innerHTML = '';
    notes.forEach((note, idx) => {
      const li = document.createElement('li');
      li.textContent = `${note.title} (${new Date(note.updated).toLocaleDateString()})`;
      li.dataset.idx = idx;
      li.addEventListener('click', () => {
        // Deselect previous
        const prev = notesList.querySelector('li.selected');
        if (prev) prev.classList.remove('selected');
        li.classList.add('selected');
        selectedNote = note;
        tweetSection.classList.remove('hidden');
        // Pre‑fill tweet content with title and link
        tweetContent.value = `${note.title}\n${note.link}`;
        tweetResult.textContent = '';
      });
      notesList.appendChild(li);
    });
  };

  const fetchNotes = async () => {
    setLoading(refreshBtn, refreshSpinner, true);
    try {
      const res = await fetch('/api/notes');
      if (!res.ok) throw new Error('Failed to fetch notes');
      const data = await res.json();
      renderNotes(data);
    } catch (e) {
      console.error(e);
      notesList.innerHTML = '<li style="color:#f87171;">Error loading notes.</li>';
    } finally {
      setLoading(refreshBtn, refreshSpinner, false);
    }
  };

  refreshBtn.addEventListener('click', fetchNotes);

  tweetBtn.addEventListener('click', async () => {
    if (!selectedNote) return;
    const message = tweetContent.value.trim();
    if (!message) {
      tweetResult.textContent = 'Tweet content cannot be empty.';
      tweetResult.style.color = '#f87171';
      return;
    }
    setLoading(tweetBtn, tweetSpinner, true);
    try {
      const res = await fetch('/api/tweet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: message }),
      });
      const result = await res.json();
      if (res.ok) {
        tweetResult.textContent = `✅ Tweet posted: ${result.tweet_url}`;
        tweetResult.style.color = '#34d399';
      } else {
        tweetResult.textContent = `❌ ${result.error || 'Error posting tweet'}`;
        tweetResult.style.color = '#f87171';
      }
    } catch (e) {
      tweetResult.textContent = `❌ ${e.message}`;
      tweetResult.style.color = '#f87171';
    } finally {
      setLoading(tweetBtn, tweetSpinner, false);
    }
  });

  // Initial load
  fetchNotes();
});
