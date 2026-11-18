const SUPABASE_URL = 'GANTI_DENGAN_PROJECT_URL_KAMU';
const SUPABASE_KEY = 'GANTI_DENGAN_ANON_KEY_KAMU';

const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let semuaData = [];
let filterAktif = 'all';

async function loadData() {
  const grid = document.getElementById('grid');
  grid.innerHTML = '<p class="loading">Memuat stok...</p>';

  const { data, error } = await db
    .from('nomor')
    .select('*')
    .eq('status', 'tersedia')
    .order('created_at', { ascending: false });

  if (error) {
    grid.innerHTML = '<p class="loading">Gagal memuat. Coba refresh.</p>';
    console.error(error);
    return;
  }

  semuaData = data || [];
  render();
}

function render() {
  const grid = document.getElementById('grid');
  const filtered = filterAktif === 'all'
    ? semuaData
    : semuaData.filter(d => d.negara === filterAktif);

  if (filtered.length === 0) {
    grid.innerHTML = '<p class="loading">Belum ada stok untuk filter ini.</p>';
    return;
  }

  grid.innerHTML = filtered.map(d => `
    <div class="card">
      <div class="negara">${d.negara}</div>
      <div class="nomor">${d.nomor}</div>
      <div class="harga">Rp ${Number(d.harga).toLocaleString('id-ID')}</div>
      <span class="status tersedia">✅ Tersedia</span>
    </div>
  `).join('');
}

document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    filterAktif = btn.dataset.negara;
    render();
  });
});

loadData();